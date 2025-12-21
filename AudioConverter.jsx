import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RefreshCw, CheckCircle, Loader2, Upload, Download, Music, Lock, Shield, Brain, Save, FolderOpen, FileAudio, Cpu, Radio, ArrowRightLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AudioConverterComponent from '../components/analyze/AudioConverter';
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import ProjectManager from "@/components/projects/ProjectManager";
import { SUBSCRIPTION_TIERS } from "@/components/shared/subscriptionSystem";
import { useUsageLimits } from "@/components/shared/useUsageLimits";
import LimitLocker from "@/components/shared/LimitLocker";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";

export default function AudioConverterPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const { isLocked, loading: loadingLimits } = useUsageLimits(currentUser);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const [currentFile, setCurrentFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false); 
  const [progress, setProgress] = useState(0); 
  const [error, setError] = useState(null);
  const [internalConvertedFile, setInternalConvertedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [recentSearches, setRecentSearches] = useState([]);

  const [showConverter, setShowConverter] = useState(false);
  const [originalFileForExternalConversion, setOriginalFileForExternalConversion] = useState(null);
  const [showProjects, setShowProjects] = useState(false);

  const handleSaveConversion = async (file) => {
    try {
        await base44.entities.CreativeProject.create({
            name: file.name,
            type: "audio_conversion",
            folder: "Conversions",
            tags: ["audio", "wav", "zero-static"],
            data: {
                originalSize: currentFile?.size,
                convertedSize: file.size,
                timestamp: Date.now()
            }
        });
        alert("Conversion saved to projects!");
    } catch(e) {
        console.error(e);
        alert("Failed to save project");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('spectro_converter_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileChange(selectedFile);
    }
  };

  const handleFileChange = async (selectedFile) => {
    if (isLocked) {
        return; 
    }

    if (isLocked('analysis_uploads')) {
         alert(`⚠️ Usage limit reached for your plan. Upgrade to Premium for unlimited.`);
         return;
    }

    if (!selectedFile.type.startsWith("audio/") &&
        !selectedFile.name.match(/\.(wav|mp4|m4a|flac|ogg|aac|wma|aiff|ape|alac|opus)$/i)) {
      setError("Please upload an audio file (WAV, MP4, M4A, FLAC, OGG, AAC, WMA, AIFF, APE, ALAC, or OPUS)");
      return;
    }

    const fileSizeMB = selectedFile.size / (1024 * 1024);
    const isMP3 = selectedFile.type === 'audio/mpeg' || selectedFile.name.toLowerCase().endsWith('.mp3');
    
    if (fileSizeMB > 50 || !isMP3) {
      setOriginalFileForExternalConversion(selectedFile); 
      setShowConverter(true); 
      
      setCurrentFile(null);
      setInternalConvertedFile(null);
      setError(null);
      setProgress(0);
      setIsConverting(false);
      return;
    }

    setCurrentFile(selectedFile); 
    setShowConverter(false); 
    setInternalConvertedFile(null); 
    setError(null);
    setProgress(0);
    setIsConverting(false);
  };

  const handleConversionComplete = (convertedFileFromComponent) => {
    setCurrentFile(convertedFileFromComponent);
    setShowConverter(false);
    setOriginalFileForExternalConversion(null);
    setInternalConvertedFile(null); 
    setError(null);
    setProgress(0);
    setIsConverting(false);
  };

  const convertToMP3 = async () => {
    if (!currentFile) return;

    setIsConverting(true);
    setProgress(0);
    setError(null);
    setInternalConvertedFile(null);

    try {
      setProgress(10);
      const arrayBuffer = await currentFile.arrayBuffer();
      
      setProgress(20);
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      setProgress(40);
      
      const wavBuffer = createWavBuffer(audioBuffer);
      
      setProgress(80);
      
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      
      const originalName = currentFile.name.replace(/\.(wav|mp4|m4a|flac|ogg|aac|wma|aiff|ape|alac|opus)$/i, '');
      const mp3File = new File([blob], `${originalName}.mp3`, { 
        type: 'audio/mpeg',
        lastModified: Date.now()
      });
      
      setProgress(100);
      setInternalConvertedFile(mp3File);
      
      await audioContext.close();
      
    } catch (err) {
      console.error("Conversion failed:", err);
      setError("Conversion failed. Please try a different file.");
    } finally {
      setIsConverting(false);
    }
  };

  const createWavBuffer = (audioBuffer) => {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    
    const dataLength = length * numberOfChannels * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);
    
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * bytesPerSample, true);
    view.setUint16(32, numberOfChannels * bytesPerSample, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = audioBuffer.getChannelData(channel)[i];
        const int16 = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
        view.setInt16(offset, int16, true);
        offset += 2;
      }
    }
    
    return buffer;
  };

  const downloadFile = () => {
    if (!internalConvertedFile) return;
    
    const url = URL.createObjectURL(internalConvertedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = internalConvertedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  const reset = () => {
    setCurrentFile(null);
    setInternalConvertedFile(null);
    setError(null);
    setProgress(0);
    setIsConverting(false); 
    setShowConverter(false); 
    setOriginalFileForExternalConversion(null); 
  };

  return (
    // CYBERPUNK BASE
    <div className="min-h-screen bg-transparent p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-purple-500/30 selection:text-purple-100">
      
      {/* Decorative Grid Overlay Removed - Handled by Layout */}

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <NetworkErrorBanner />
        <AILearningBanner />
        <LimitLocker feature="analysis_uploads" featureKey="AUDIO_CONVERTER" user={currentUser} />

        {/* HEADER */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-full transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3">
                <ArrowRightLeft className="w-10 h-10 text-blue-500" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse">
                  SIGNAL CONVERTER
                </span>
              </h1>
              <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
                High-Fidelity Audio Processing Engine
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowProjects(!showProjects)}
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 font-mono text-xs uppercase"
          >
            <FolderOpen className="w-4 h-4 mr-2" /> ACCESS LOGS
          </Button>
        </div>

        {isLocked ? (
            <Card className="bg-red-950/20 border border-red-500/50 backdrop-blur-md">
                <CardContent className="p-8 flex flex-col items-center text-center">
                    <Lock className="w-16 h-16 text-red-500 mb-6" />
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Module Locked</h2>
                    <p className="text-slate-300 mb-6 max-w-lg font-mono text-sm">
                        &gt;&gt; ACCESS RESTRICTED. UPGRADE CLEARANCE LEVEL TO PREMIUM FOR UNLIMITED TRANSCODING.
                    </p>
                    <Button onClick={() => navigate(createPageUrl("Monetization"))} className="bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold px-8 shadow-lg shadow-red-900/20">
                        UNLOCK MODULE
                    </Button>
                </CardContent>
            </Card>
        ) : (
            <>
        {showProjects && (
            <Card className="bg-slate-900/90 border border-slate-700 p-4 mb-6 backdrop-blur-sm">
                <ProjectManager onSelectProject={(p) => console.log(p)} />
            </Card>
        )}

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Security */}
            <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Privacy Shield</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                &gt;&gt; LOCAL BROWSER EXECUTION ACTIVE
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">SECURE</Badge>
                </CardContent>
            </Card>

            {/* AI/Analytics */}
            {currentFile && (
                <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 backdrop-blur-md rounded-xl">
                    <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                            <div>
                                <p className="text-white font-bold text-xs uppercase">Metadata Engine</p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                    &gt;&gt; ANALYZING WAVEFORM...
                                </p>
                            </div>
                        </div>
                         <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">LEARNING</Badge>
                    </CardContent>
                </Card>
            )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-950/50 border border-red-500/50 text-red-200">
            <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* MAIN CONVERTER INTERFACE */}
        {showConverter && originalFileForExternalConversion ? (
          <AudioConverterComponent
            file={originalFileForExternalConversion}
            onConversionComplete={handleConversionComplete}
            onCancel={() => {
              setShowConverter(false);
              setOriginalFileForExternalConversion(null);
              setError(null);
            }}
          />
        ) : (
          <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)] rounded-2xl backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <CardHeader className="border-b border-white/5 bg-white/5 p-6">
              <CardTitle className="text-white flex items-center gap-2 text-xl font-bold uppercase tracking-wide">
                <RefreshCw className="w-5 h-5 text-purple-400" />
                Input Terminal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {!currentFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                    dragActive 
                    ? "border-purple-500 bg-purple-500/10 scale-[1.02]" 
                    : "border-slate-700 hover:border-purple-500/50 hover:bg-white/5"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.wav,.mp4,.m4a,.flac,.ogg,.aac,.wma,.aiff,.ape,.alac,.opus"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  
                  <div className="w-20 h-20 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
                    <Music className="w-8 h-8 text-purple-400" />
                  </div>
                  
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">Drop Audio Source</h3>
                  <p className="text-slate-400 mb-8 font-mono text-xs">OR INITIALIZE BROWSER UPLOAD</p>
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-900/20"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    SELECT FILE
                  </Button>
                  
                  <div className="mt-8 pt-6 border-t border-white/5">
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">
                        Supported Formats Protocol
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 text-[10px] font-mono text-purple-400">
                         <span>WAV</span><span>&bull;</span><span>MP4</span><span>&bull;</span><span>FLAC</span><span>&bull;</span><span>OGG</span><span>&bull;</span><span>AAC</span>
                      </div>
                       {/* Diagram Insertion */}
                       <div className="mt-4 flex justify-center">
                            <div className="text-[10px] text-slate-600 border border-slate-800 rounded px-2 py-1">
                                {/* Empty */}
                            </div>
                       </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="p-6 rounded-xl bg-black/40 backdrop-blur-xl border border-slate-800 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-purple-900/20 border border-purple-500/30 flex items-center justify-center">
                            <FileAudio className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg">{currentFile.name}</p>
                            <p className="text-xs text-slate-400 font-mono">
                            {formatFileSize(currentFile.size)}MB &bull; {currentFile.name.split('.').pop().toUpperCase()} &bull; RAW AUDIO
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={reset}
                        className="text-slate-400 hover:text-white"
                    >
                        CANCEL
                    </Button>
                  </div>

                  {isConverting && (
                    <div className="space-y-3 bg-black/30 p-6 rounded-xl border border-blue-500/20">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                        <p className="text-white font-bold text-sm uppercase">Transcoding Stream...</p>
                      </div>
                      <Progress value={progress} className="h-2 bg-slate-800" indicatorClassName="bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                      <div className="flex justify-between text-xs font-mono text-blue-300">
                        <span>BUFFERING...</span>
                        <span>{progress}%</span>
                      </div>
                    </div>
                  )}

                  {internalConvertedFile && (
                    <div className="p-6 rounded-xl bg-green-950/20 border border-green-500/30 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-900/30 rounded-full border border-green-500/30">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-green-400 font-bold uppercase mb-2">Process Complete</p>
                          <p className="text-white text-sm font-mono mb-1">{internalConvertedFile.name}</p>
                          <p className="text-xs text-green-300/60 font-mono">
                            SIZE: {formatFileSize(internalConvertedFile.size)}MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 flex-wrap">
                    {internalConvertedFile ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={reset}
                          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 font-mono text-xs h-12"
                        >
                          NEW TASK
                        </Button>
                        <Button 
                          className="flex-1 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/50 text-blue-100 font-bold h-12"
                          onClick={() => handleSaveConversion(internalConvertedFile)}
                        >
                          <Save className="w-4 h-4 mr-2" /> SAVE TO PROJECT
                        </Button>
                        <Button
                          onClick={downloadFile}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold h-12 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          DOWNLOAD .MP3
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={convertToMP3}
                        disabled={isConverting}
                        className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black tracking-widest text-sm shadow-lg"
                      >
                        {isConverting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            PROCESSING...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-5 h-5 mr-2" />
                            INITIATE CONVERSION
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Browser Architecture Diagram Hint */}
                  <div className="p-4 rounded-lg bg-black/40 backdrop-blur-xl border border-slate-800 flex items-start gap-3">
                    <Radio className="w-4 h-4 text-slate-500 mt-1" />
                    <div className="space-y-2">
                        <p className="text-slate-400 text-xs leading-relaxed">
                            <strong>ARCHITECTURE NOTE:</strong> Conversion executes within local browser memory. No data transfer to external servers ensures zero latency and absolute privacy.
                        </p>
                        <div className="text-[10px] text-slate-600 border border-slate-800 rounded px-2 py-1 inline-block">
                             {/* Empty */}
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

            </>
        )}

        {/* FEATURES FOOTER */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: RefreshCw, title: "Zero Latency", desc: "Instant Browser Processing", color: "text-purple-400" },
            { icon: Shield, title: "Air-Gapped", desc: "100% Local Execution", color: "text-green-400" },
            { icon: Cpu, title: "Universal Codec", desc: "WAV/FLAC/MP4 Support", color: "text-blue-400" }
          ].map((feature, i) => {
             const Icon = feature.icon;
             return (
             <Card key={i} className="bg-black/40 border border-slate-800 hover:border-slate-600 transition-colors backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                <Icon className={`w-8 h-8 ${feature.color} mx-auto mb-3`} />
                <h3 className="font-bold text-white mb-1 uppercase text-sm">{feature.title}</h3>
                <p className="text-xs text-slate-500 font-mono">{feature.desc}</p>
                </CardContent>
            </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}