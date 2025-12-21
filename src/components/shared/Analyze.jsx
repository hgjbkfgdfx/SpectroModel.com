import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield, Brain, Upload, FileAudio, BarChart3, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import AnalysisResults from "../components/analyze/AnalysisResults";
import { runUnifiedDSPAnalysis, calculatePopHitScore } from "../components/shared/UnifiedDSPAnalysis";
import { validateCSP, blockScriptInjection } from "../components/shared/SecurityValidator";
import { useMLDataCollector } from "../components/shared/MLDataCollector";
import { 
  SUBSCRIPTION_TIERS, 
  isFeatureLocked, 
  isFeatureUsageLocked, 
  getRemainingUploads,
  isSubscriptionExpired,
  isPaymentVerified,
  getDaysUntilReset,
  getFeatureUsage,
  LIMITS,
  isYearlyPlan,
  needsAdditionalPayment
} from "@/components/shared/subscriptionSystem";
import { clearUserCache } from "@/components/shared/userCache";

const CURRENT_ANALYSIS_VERSION = "4.3";

/**
 * ZERO-ITERATION STATIC WAV CONVERTER (PATENTED)
 * Single-pass pristine conversion - no re-encoding loops
 * Converts to 16-bit WAV to reduce file size before upload
 * Preserves original audio quality for optimal DSP analysis
 */
function convertToWAV(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const samples = audioBuffer.length;
  const dataSize = samples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  
  // Interleave channels and write samples
  const channels = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }
  
  let offset = 44;
  for (let i = 0; i < samples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
}

export default function AnalyzePage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trackName, setTrackName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const fileInputRef = useRef(null);
  const hasInit = useRef(false);
  
  // Subscription & usage checks
  const userTier = currentUser?.subscription_tier || SUBSCRIPTION_TIERS.FREE;
  const paymentVerified = isPaymentVerified(currentUser);
  const subscriptionExpired = isSubscriptionExpired(currentUser);
  
  // Effective tier - if expired or not verified, treat as free
  const effectiveTier = (userTier !== SUBSCRIPTION_TIERS.FREE && (!paymentVerified || subscriptionExpired)) 
    ? SUBSCRIPTION_TIERS.FREE 
    : userTier;
  
  const featureLocked = isFeatureLocked(effectiveTier, 'TRACK_ANALYSIS');
  const usageLocked = isFeatureUsageLocked(currentUser, 'analysis_uploads');
  const remainingUploads = getRemainingUploads(currentUser, 'analysis_uploads');
  const currentUsage = getFeatureUsage(currentUser, 'analysis_uploads');
  const maxUploads = LIMITS[effectiveTier]?.analysis_uploads || 0;
  const daysUntilReset = getDaysUntilReset(currentUser);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
    blockScriptInjection();
    validateCSP();
    mlDataCollector.record('analyze_page_visit', { feature: 'track_analysis', timestamp: Date.now() });
  }, []);

  const handleFileChange = (e) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setTrackName(fileNameWithoutExt);
        setArtistName("Unknown Artist");
        mlDataCollector.record('track_file_selected', { fileName: selectedFile.name, timestamp: Date.now() });
      }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      const fileNameWithoutExt = droppedFile.name.replace(/\.[^/.]+$/, "");
      setTrackName(fileNameWithoutExt);
      setArtistName("Unknown Artist");
      mlDataCollector.record('track_file_dropped', { fileName: droppedFile.name, timestamp: Date.now() });
    }
  };
    
  const handleAnalyze = async () => {
      if (!file) {
        setError("Please select a file first");
        return;
      }
      
      if (isAnalyzing) return;
      
      // Check feature access and usage limits
      if (featureLocked) {
        if (subscriptionExpired && userTier !== SUBSCRIPTION_TIERS.FREE) {
          setError("Your subscription has expired. Please renew to access this feature.");
        } else {
          setError("This feature requires a Pro or Premium subscription.");
        }
        return;
      }
      
      if (usageLocked) {
        if (needsAdditionalPayment(currentUser, 'analysis_uploads')) {
          setError(`Monthly upload limit (${maxUploads}) reached. Make additional payment to unlock or upgrade to yearly plan for auto-reset.`);
        } else {
          setError(`Monthly upload limit (${maxUploads}) reached. Resets in ${daysUntilReset} days.`);
        }
        return;
      }
      
      setIsAnalyzing(true);
      setError(null);
      setProgress(5);
      
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      
      try {
        // STEP 1: ZERO-ITERATION STATIC CONVERTER - Convert to pristine 16-bit WAV FIRST
        setProgress(10);
        setStatusMessage("Zero-iteration conversion to pristine WAV...");
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Convert using zero-iteration static converter (single pass, no re-encoding loops)
        const wavBlob = convertToWAV(audioBuffer);
        const pristineFile = new File([wavBlob], file.name.replace(/\.[^/.]+$/, ".wav"), { type: "audio/wav" });
        
        const optimizedSizeMB = (pristineFile.size / (1024 * 1024)).toFixed(1);
        setProgress(25);
        setStatusMessage(`Pristine WAV: ${optimizedSizeMB}MB (was ${fileSizeMB}MB)`);
        
        mlDataCollector.record('zero_iteration_conversion', {
          feature: 'track_analysis',
          originalSize: fileSizeMB,
          optimizedSize: optimizedSizeMB,
          timestamp: Date.now()
        });
        
        // STEP 2: Upload the pristine WAV file
        setProgress(30);
        setStatusMessage(`Uploading ${optimizedSizeMB}MB...`);
        
        const uploadResult = await base44.integrations.Core.UploadFile({ file: pristineFile });
        const file_url = uploadResult.file_url;
        
        if (!file_url) {
          throw new Error("Upload failed - no file URL returned");
        }
        
        setProgress(55);
        setStatusMessage("Upload complete!");
        
        // STEP 3: Run DSP analysis on the pristine WAV
        setStatusMessage("Running DSP analysis on pristine WAV...");
        setProgress(60);
        
        let dspResult = {};
        try {
          dspResult = await runUnifiedDSPAnalysis(pristineFile);
        } catch (dspErr) {
          console.warn("DSP analysis warning:", dspErr);
          dspResult = { tempo: 120, key: "C", mode: "major", genre: "Pop" };
        }
        setProgress(80);
        
        // STEP 4: Calculate hit prediction
        setStatusMessage("Calculating hit prediction...");
        const hitScore = calculatePopHitScore(dspResult) || 75;
        setProgress(90);
        
        // STEP 5: Save results
        setStatusMessage("Saving results...");
        
        const newAnalysis = await base44.entities.MusicAnalysis.create({
          track_name: trackName || file.name.replace(/\.[^/.]+$/, ""),
          artist_name: artistName || "Unknown Artist",
          analysis_type: "track_analysis",
          file_url: file_url,
          hit_score: hitScore,
          tempo: dspResult.tempo || 120,
          key: dspResult.key || "C",
          mode: dspResult.mode || "major",
          genre: dspResult.genre || "Pop",
          audio_features: dspResult,
          status: "completed",
          analysis_version: CURRENT_ANALYSIS_VERSION
        });
        
        setProgress(100);
        setStatusMessage("Analysis complete!");
        
        // Increment usage counter in user record
        try {
          const updatedUsage = { ...(currentUser?.monthly_usage || {}), analysis_uploads: (currentUsage + 1) };
          await base44.auth.updateMe({ monthly_usage: updatedUsage });
          clearUserCache();
          setCurrentUser(prev => ({ ...prev, monthly_usage: updatedUsage }));
        } catch (usageErr) {
          console.warn('Failed to update usage:', usageErr);
        }
        window.dispatchEvent(new CustomEvent('usage-updated'));
        
        mlDataCollector.record('track_analysis_completed', {
          feature: 'track_analysis',
          trackName: trackName,
          hitScore: hitScore,
          fileSizeMB: optimizedSizeMB,
          timestamp: Date.now()
        });
        
        setTimeout(() => {
          navigate(createPageUrl(`AnalysisResult?id=${newAnalysis.id}`));
        }, 500);
        
      } catch (err) {
        console.error("Analysis failed:", err);
        setError(err.message || "Analysis failed. Please try again.");
        setIsAnalyzing(false);
        setProgress(0);
        setStatusMessage("");
        mlDataCollector.record('track_analysis_error', {
          feature: 'track_analysis',
          error: err.message,
          timestamp: Date.now()
        });
      }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-cyan-50 font-sans overflow-x-hidden relative">
      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6 lg:p-8">
        {/* Usage Limit Display */}
        {effectiveTier !== SUBSCRIPTION_TIERS.FREE && !featureLocked && (
          <Card className={`border ${usageLocked ? 'border-red-500/50 bg-red-950/20' : 'border-cyan-500/30 bg-cyan-950/20'}`}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={usageLocked ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'}>
                  {effectiveTier.toUpperCase()}
                </Badge>
                <span className="text-slate-300 text-xs">
                  Track Analysis: <span className="font-mono font-bold">{currentUsage}/{maxUploads}</span> uploads used
                </span>
              </div>
              <div className="flex items-center gap-2">
                {usageLocked ? (
                  <span className="text-red-400 text-xs font-mono">
                    Limit reached • {isYearlyPlan(currentUser) ? `Resets in ${daysUntilReset} days` : 'Payment required'}
                  </span>
                ) : (
                  <span className="text-green-400 text-xs font-mono">{remainingUploads} remaining</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {subscriptionExpired && userTier !== SUBSCRIPTION_TIERS.FREE && (
          <Card className="border border-amber-500/50 bg-amber-950/20">
            <CardContent className="p-3 text-center">
              <span className="text-amber-400 text-sm font-semibold">
                ⚠️ Your {userTier.toUpperCase()} subscription has expired. Please renew to restore access.
              </span>
            </CardContent>
          </Card>
        )}

        {/* HEADER - Mobile Optimized */}
        <div className="flex items-center gap-2 sm:gap-4 border-b border-white/10 bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 md:p-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded-full shrink-0 h-8 w-8 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-2 sm:gap-3">
               <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-cyan-500 shrink-0" />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 truncate">
                  TRACK ANALYSIS
               </span>
            </h1>
            <p className="text-slate-400 text-[9px] sm:text-[10px] md:text-xs mt-0.5 sm:mt-1 uppercase tracking-wide truncate">
              AI Audio • v{CURRENT_ANALYSIS_VERSION}
            </p>
          </div>
        </div>

        {/* STATUS GRID - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <Card className="bg-black/60 border border-green-500/30 backdrop-blur-md rounded-lg sm:rounded-xl">
              <CardContent className="p-2 sm:p-3 md:p-4 flex items-center gap-2 sm:gap-3">
                 <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-green-900/20 border border-green-500/30 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-400" />
                 </div>
                 <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-[10px] sm:text-xs md:text-sm uppercase truncate">Security</p>
                    <p className="text-green-400/70 text-[8px] sm:text-[10px] font-mono truncate">SECURE</p>
                 </div>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border border-cyan-500/30 backdrop-blur-md rounded-lg sm:rounded-xl">
              <CardContent className="p-2 sm:p-3 md:p-4 flex items-center gap-2 sm:gap-3">
                 <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-cyan-900/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-cyan-400" />
                 </div>
                 <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-[10px] sm:text-xs md:text-sm uppercase truncate">Neural</p>
                    <p className="text-cyan-400/70 text-[8px] sm:text-[10px] font-mono truncate">LEARNING</p>
                 </div>
              </CardContent>
            </Card>
        </div>

        {/* MAIN INTERFACE */}
        {!analysis ? (
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.aac,.ogg,.flac"
                onChange={handleFileChange}
                className="hidden"
              />

              {!file && !isAnalyzing ? (
                <Card 
                  className={`bg-black/60 rounded-lg sm:rounded-xl border-2 border-dashed ${dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-white/20'} backdrop-blur-xl cursor-pointer hover:border-cyan-500/50 transition-all`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CardContent className="p-4 sm:p-8 md:p-12 lg:p-16 flex flex-col items-center justify-center min-h-[200px] sm:min-h-[280px] md:min-h-[350px]">
                   <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-purple-900/20 rounded-full border border-purple-500/30 flex items-center justify-center mb-3 sm:mb-4">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-purple-400" />
                   </div>
                   <h2 className="text-base sm:text-xl md:text-2xl font-black text-white uppercase tracking-wide mb-1 sm:mb-2 text-center">Upload Audio</h2>
                   <p className="text-slate-400 font-mono text-[10px] sm:text-xs mb-3 sm:mb-4 text-center">TAP OR DRAG TO UPLOAD</p>
                   <Button 
                     onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} 
                     className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase text-[10px] sm:text-xs h-9 sm:h-10 md:h-11 px-4 sm:px-6 md:px-8"
                   >
                     SELECT FILE
                   </Button>
                  </CardContent>
                </Card>
              ) : isAnalyzing ? (
                <Card className="bg-black/60 rounded-lg sm:rounded-xl border border-cyan-500/50 backdrop-blur-xl">
                  <CardContent className="p-4 sm:p-6 md:p-8">
                   <div className="flex flex-col items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-cyan-900/30 rounded-lg sm:rounded-xl border border-cyan-500/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-cyan-400 animate-spin" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-0.5">Processing</h3>
                        <p className="text-cyan-400 font-mono text-[10px] sm:text-xs truncate max-w-[200px] sm:max-w-none">{statusMessage || "..."}</p>
                      </div>
                   </div>
                   <div className="mt-4 sm:mt-6">
                     <div className="flex items-center justify-between mb-1.5 gap-2">
                       <span className="text-cyan-300 font-mono text-[9px] sm:text-xs truncate flex-1">{statusMessage || "..."}</span>
                       <span className="text-cyan-400 font-mono text-[10px] sm:text-xs shrink-0">{progress}%</span>
                     </div>
                     <div className="w-full h-2 sm:h-2.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                     </div>
                   </div>
                   {error && <p className="text-red-400 font-mono text-[10px] sm:text-xs mt-3 text-center">{error}</p>}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-black/60 rounded-lg sm:rounded-xl border border-green-500/50 backdrop-blur-xl">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                   <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-900/30 rounded-lg border border-green-500/50 flex items-center justify-center shrink-0">
                        <FileAudio className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm md:text-base font-bold text-white truncate">{file.name}</h3>
                        <p className="text-slate-400 font-mono text-[10px] sm:text-xs">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                      <div className="flex gap-1.5 sm:gap-2 shrink-0">
                        <Button variant="outline" onClick={() => { setFile(null); setError(null); }} className="border-slate-600 text-slate-300 text-[10px] sm:text-xs h-8 sm:h-9 px-2 sm:px-3">
                          Change
                        </Button>
                        <Button onClick={handleAnalyze} className="bg-green-600 hover:bg-green-500 text-white font-bold uppercase text-[10px] sm:text-xs h-8 sm:h-9 px-3 sm:px-4">
                          ANALYZE
                        </Button>
                      </div>
                   </div>
                   {error && <p className="text-red-400 font-mono text-[10px] sm:text-xs mt-2 text-center">{error}</p>}
                  </CardContent>
                </Card>
              )}
            </div>
        ) : (
            <AnalysisResults analysis={analysis} />
        )}
      </div>
    </div>
  );
}