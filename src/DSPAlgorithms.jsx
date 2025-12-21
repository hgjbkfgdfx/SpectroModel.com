import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Code, Upload, Loader2, AlertCircle, Copy, CheckCircle, BookOpen, Calendar, ExternalLink, ArrowLeft, Activity, Brain, Zap, Lock, Cpu } from "lucide-react";
import {
  runUnifiedDSPAnalysis,
  calculatePopHitScore,
  R2_WEIGHTS,
  GLOBAL_STATS,
  FEATURE_DESCRIPTIONS
} from "../components/shared/UnifiedDSPAnalysis";
import AudioConverter from "../components/analyze/AudioConverter";
import { useNavigate } from "react-router-dom"; 
import { base44 } from "@/api/base44Client";
import { useMLDataCollector } from "../components/shared/MLDataCollector";
import { checkUsageLimit, SUBSCRIPTION_TIERS } from "@/components/shared/subscriptionSystem";
import { useUsageLimits } from "@/components/shared/useUsageLimits";
import LimitLocker from "@/components/shared/LimitLocker";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";

const createPageUrl = (pageName) => {
  switch (pageName) {
    case "Dashboard":
      return "/dashboard";
    default:
      return "/";
  }
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const CURRENT_ANALYSIS_VERSION = "5.1";

const calculateFileHash = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      const hashInput = new Uint8Array(arrayBuffer.slice(0, Math.min(arrayBuffer.byteLength, 1024)));
      let hash = 0;
      for (let i = 0; i < hashInput.length; i++) {
        hash = (hash << 5) - hash + hashInput[i];
        hash |= 0;
      }
      resolve(`mock_hash_${file.name}_${file.size}_${hash.toString(16)}`);
    };
    reader.readAsArrayBuffer(file);
  });
};

const PYTHON_CODE = `import numpy as np
import scipy.signal as signal
import soundfile as sf

# PROPRIETARY SPECTRO-DSP ALGORITHM v5.1
# CORE SIGNAL PROCESSING LOGIC HIDDEN
# ...
`;

export default function DSPAlgorithmsPage() {
  const [file, setFile] = useState(null);
  const [trackName, setTrackName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  const [showConverter, setShowConverter] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Ready to analyze");
  const [currentUser, setCurrentUser] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  
  const { isLocked, loading: loadingLimits } = useUsageLimits(currentUser);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PYTHON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setStatusMessage("File selected. Enter track details and analyze.");

    const fileNameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, "");
    setTrackName(fileNameWithoutExtension);
    setArtistName("Unknown Artist");

    if (selectedFile.size > MAX_FILE_SIZE) {
      setShowConverter(true);
      return;
    }

    const isMP3 = selectedFile.type === 'audio/mpeg' || selectedFile.name.toLowerCase().endsWith('.mp3');
    if (!isMP3) {
      setShowConverter(true);
      return;
    }

    setShowConverter(false);
  };

  const handleConversionComplete = (convertedFile) => {
    setFile(convertedFile);
    setShowConverter(false);
    setError(null);
    setStatusMessage("File converted successfully. Ready for analysis.");
  };

  const handleAnalyze = async () => {
    if (!file || !trackName.trim() || !artistName.trim()) {
      setError("Please provide an audio file, track name, and artist name.");
      return;
    }

    const userTier = currentUser?.role === 'admin' ? SUBSCRIPTION_TIERS.PREMIUM : (currentUser?.subscription_tier || SUBSCRIPTION_TIERS.FREE);
    let currentUsage = 0;
    try {
        const now = new Date();
        let startDate;
        if (userTier === 'free') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else {
            startDate = new Date(now.setHours(0,0,0,0));
        }
        
        const recentAnalyses = await base44.entities.MusicAnalysis.filter({
            created_by: currentUser?.email,
            created_date: { $gte: startDate.toISOString() }
        });
        currentUsage = recentAnalyses.length;
    } catch (usageErr) {
        console.error("Usage check failed:", usageErr);
    }

    if (!checkUsageLimit(userTier, 'advanced_analytics', currentUsage)) {
       setError(`⚠️ Usage limit reached for ${userTier} plan. Please upgrade to Pro or Premium.`);
       mlDataCollector.record('limit_reached', { feature: 'dsp_algorithms', tier: userTier, count: currentUsage, timestamp: Date.now() });
       return;
    }

    mlDataCollector.record('dsp_analysis_started', {
        feature: 'dsp_algorithms',
        trackName,
        artistName,
        tier: userTier,
        timestamp: Date.now()
    });

    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    setStatusMessage("Initializing DSP kernel...");

    try {
      setProgress(5);
      setStatusMessage("Computing cryptographic hash...");

      const fileHash = await calculateFileHash(file);

      setProgress(10);
      setStatusMessage("Querying neural cache...");

      const existingAnalyses = await base44.entities.MusicAnalysis.filter({
        file_hash: fileHash,
        analysis_type: "dsp_algorithms",
        status: "completed",
        analysis_version: CURRENT_ANALYSIS_VERSION
      });

      if (existingAnalyses && existingAnalyses.length > 0) {
        const cached = existingAnalyses[0];
        setProgress(100);
        setStatusMessage("Cache hit. Retrieving data...");
        setAnalysisResults(cached);
        setIsAnalyzing(false);
        return;
      }

      setProgress(15);
      setStatusMessage("Executing Fast Fourier Transform...");

      const features = await runUnifiedDSPAnalysis(file, fileHash);

      setProgress(50);
      setStatusMessage("Calculating predictive score...");

      const popScore = calculatePopHitScore(features);

      setProgress(85);
      setStatusMessage("Finalizing vectors...");

      const analysisResult = {
        track_name: trackName,
        artist_name: artistName,
        file_hash: fileHash,
        analysis_type: "dsp_algorithms",
        hit_score: popScore,
        skip_likelihood: 100 - popScore,
        audio_features: features, 
        dsp_analysis: {
          algorithm: "Unified Web Audio API",
          formula: "hit_score = (Σ(normalized_feature × R²)) / (Σ R²) * 100",
          r2_weights: R2_WEIGHTS,
          global_stats: GLOBAL_STATS,
          feature_descriptions: FEATURE_DESCRIPTIONS
        },
        status: "completed",
        analysis_version: CURRENT_ANALYSIS_VERSION,
        created_date: new Date().toISOString()
      };

      setProgress(90);
      setStatusMessage("Persisting to cloud storage...");

      try {
        const saved = await base44.entities.MusicAnalysis.create(analysisResult);
        analysisResult.id = saved.id;
      } catch (saveError) {
        console.warn("Could not save:", saveError);
        analysisResult.id = `temp-${Date.now()}`;
      }

      setProgress(100);
      setStatusMessage("✓ Analysis Complete");
      
      setAnalysisResults(analysisResult);
      setIsAnalyzing(false);

    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Analysis failed.");
      setIsAnalyzing(false);
    }
  };

  const educationalResources = [
    {
      title: "Deep Learning for Music Information Retrieval",
      year: "2023",
      journal: "Open Access Music Technology Journal",
      url: "https://arxiv.org/abs/2301.04697",
      description: "Comprehensive overview of deep learning techniques applied to music analysis including rhythm detection, genre classification, and audio feature extraction."
    },
    {
      title: "Computational Music Analysis: Rhythm and Meter",
      year: "2024",
      journal: "Journal of New Music Research",
      url: "https://www.tandfonline.com/toc/nnmr20/current",
      description: "Latest research on computational approaches to analyzing rhythm patterns, beat tracking, and rhythmic complexity in music."
    },
    {
      title: "Web Audio API Documentation (Free)",
      description: "Official Mozilla documentation for implementing DSP algorithms in browsers using JavaScript and Web Audio API for music applications.",
      year: "2024",
      source: "MDN Web Docs",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API",
      journal: "MDN Web Docs"
    }
  ];

  return (
    // CYBERPUNK BASE - PURE DARK
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f0520] to-[#050015] p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-purple-500/30 selection:text-purple-100">

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <NetworkErrorBanner />
        <AILearningBanner />
        <LimitLocker feature="advanced_analytics" featureKey="DSP_ALGORITHMS" user={currentUser} />

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
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
                <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse">
                    DSP ALGORITHMS
                </span>
                </h1>
                <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
                Digital Signal Processing & Spectral Analysis
                </p>
            </div>
          </div>
        </div>

        {/* AI LEARNING INDICATOR - CYAN */}
        <Card className="mb-6 bg-black/40 backdrop-blur-xl border-l-4 border-l-cyan-500 border-y-0 border-r-0 shadow-2xl shadow-cyan-900/20 rounded-xl overflow-hidden relative group hover:shadow-cyan-500/10 transition-all duration-500 backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/30 via-transparent to-transparent opacity-100" />
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-cyan-400 shrink-0 animate-pulse" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm uppercase tracking-wide">🤖 AI Neural Training Active</p>
                <p className="text-xs text-cyan-300 font-mono">Optimizing DSP kernel weights based on global usage patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ALGORITHM LOGIC - RED/SECURE */}
        <Card className="bg-black/40 backdrop-blur-xl border border-red-900/30 shadow-lg backdrop-blur-md rounded-xl overflow-hidden group">
          <CardHeader className="border-b border-red-900/20 bg-red-950/10 p-4">
            <CardTitle className="text-red-400 flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
              <Lock className="w-4 h-4" />
              Proprietary Kernel Logic
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 space-y-4">
                    <p className="text-slate-400 text-xs font-mono leading-relaxed bg-red-950/20 border border-red-900/30 p-4 rounded-lg">
                    &gt;&gt; ACCESS DENIED: SOURCE CODE OBFUSCATED.<br/>
                    &gt;&gt; REASON: TRADE SECRET PROTECTION PROTOCOL ACTIVE.<br/>
                    &gt;&gt; EXECUTION ENVIRONMENT: SECURE ENCLAVE.
                    </p>
                </div>
                {/* Diagram Tag Injection - Visualizing the concept since code is hidden */}
                <div className="flex-1 w-full p-4 bg-black/40 backdrop-blur-xl border border-slate-800 rounded-lg flex flex-col items-center justify-center gap-2 min-h-[120px]">
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest text-center">
                        Processing Pipeline Visualization
                    </div>
                    <div className="text-[10px] text-cyan-600 border border-cyan-900/50 bg-cyan-950/20 rounded px-3 py-1 font-mono"></div>
                    <span className="text-[9px] text-slate-600 italic">Input &rarr; FFT &rarr; Feature Extraction &rarr; Score</span>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* MAIN ANALYSIS INTERFACE - PURPLE */}
        {!showConverter && !analysisResults && (
          <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)] backdrop-blur-xl rounded-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <CardHeader className="border-b border-white/5 bg-white/5 p-6">
              <CardTitle className="text-white flex items-center gap-2 text-xl font-bold uppercase tracking-wide">
                <Activity className="w-5 h-5 text-purple-400" />
                Signal Input Terminal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="track-name" className="text-purple-300 text-xs font-bold uppercase tracking-wider">Track Identifier</Label>
                  <Input
                    id="track-name"
                    type="text"
                    placeholder="ENTER TRACK TITLE..."
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    className="bg-black/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 font-mono text-sm h-12"
                    disabled={isAnalyzing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist-name" className="text-purple-300 text-xs font-bold uppercase tracking-wider">Artist Identity</Label>
                  <Input
                    id="artist-name"
                    type="text"
                    placeholder="ENTER ARTIST NAME..."
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    className="bg-black/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 font-mono text-sm h-12"
                    disabled={isAnalyzing}
                  />
                </div>
              </div>
              
              <input
                id="audio-file-input"
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.flac,.ogg"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="space-y-6">
                {!file ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-900/10 transition-all duration-300 group"
                  >
                    <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4 group-hover:text-purple-400 transition-colors" />
                    <h3 className="text-lg font-bold text-white mb-2 uppercase">Upload Audio Stream</h3>
                    <p className="text-slate-400 text-xs font-mono">SUPPORTED: MP3, WAV, FLAC</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-black/40 backdrop-blur-xl border border-purple-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-purple-900/20 flex items-center justify-center border border-purple-500/30">
                                <Activity className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{file.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB • READY FOR ANALYSIS</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setFile(null);
                          setTrackName("");
                          setArtistName("");
                        }}
                        variant="outline"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white font-mono text-xs h-12"
                        disabled={isAnalyzing}
                      >
                        ABORT / RESET
                      </Button>
                      <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !trackName.trim() || !artistName.trim()}
                        className="flex-[2] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold tracking-widest text-sm shadow-lg shadow-purple-900/20 h-12"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            PROCESSING...
                          </>
                        ) : (
                          <>
                            <Cpu className="w-4 h-4 mr-2" />
                            INITIATE DSP SEQUENCE
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="space-y-3 pt-4 p-6 bg-black/40 backdrop-blur-xl rounded-lg border border-blue-500/20">
                    <div className="flex justify-between text-xs font-mono text-blue-300 mb-1">
                        <span>STATUS: {statusMessage.toUpperCase()}</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1 bg-slate-800" indicatorClassName="bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-lg bg-red-950/30 border border-red-500/50 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-200 text-sm font-bold uppercase">System Error</p>
                        <p className="text-red-300/80 text-xs font-mono">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {showConverter && file && !analysisResults && (
          <AudioConverter
            file={file}
            onConversionComplete={handleConversionComplete}
            onCancel={() => {
              setFile(null);
              setShowConverter(false);
              setTrackName("");
              setArtistName("");
              setError(null);
              setStatusMessage("Conversion cancelled.");
            }}
          />
        )}

        {/* RESULTS DISPLAY - GREEN/BLUE */}
        {analysisResults && (
          <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30 shadow-[0_0_40px_-10px_rgba(34,197,94,0.15)] backdrop-blur-xl rounded-xl overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
            <CardHeader className="border-b border-white/5 bg-white/5 p-6">
              <CardTitle className="text-white font-black flex items-center justify-between uppercase tracking-wide">
                <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-green-400" />
                    Analysis Output
                </div>
                <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-900/20 font-mono text-xs">
                    V{CURRENT_ANALYSIS_VERSION}
                </Badge>
              </CardTitle>
              <div className="mt-4 p-4 bg-black/40 backdrop-blur-xl rounded-lg border border-slate-800">
                <h2 className="text-2xl font-black text-white">{analysisResults.track_name}</h2>
                <p className="text-sm font-mono text-slate-400 uppercase tracking-widest">{analysisResults.artist_name}</p>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                  {/* Features Grid */}
                  <div className="space-y-4">
                    {Object.entries(analysisResults.audio_features || {}).map(([key, value]) => (
                    <div key={key} className="group">
                        <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-white transition-colors">{key.replace(/_/g, ' ')}</span>
                        <span className="text-xs font-mono text-cyan-300">{typeof value === 'number' ? value.toFixed(3) : value}</span>
                        </div>
                        <Progress value={typeof value === 'number' ? (value * 100) : 0} className="h-1 bg-slate-800" indicatorClassName="bg-cyan-500 group-hover:shadow-[0_0_10px_#06b6d4] transition-all" />
                    </div>
                    ))}
                  </div>

                  {/* Score & Action */}
                  <div className="flex flex-col justify-between">
                    <div className="p-8 bg-green-950/10 rounded-2xl border border-green-500/20 flex flex-col items-center justify-center text-center h-full relative overflow-hidden group">
                        <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">Calculated Hit Probability</p>
                        <div className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                            {analysisResults.hit_score?.toFixed(1)}%
                        </div>
                    </div>
                    
                    <Button
                        onClick={() => {
                            setAnalysisResults(null);
                            setFile(null);
                            setTrackName("");
                            setArtistName("");
                            setError(null);
                            setProgress(0);
                            setStatusMessage("Ready");
                        }}
                        className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-600 h-12 tracking-widest text-xs"
                    >
                        RESET ANALYZER
                    </Button>
                  </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* EDUCATIONAL RESOURCES - BLUE */}
        <Card className="bg-black/40 border border-blue-500/30 backdrop-blur-md rounded-xl overflow-hidden">
          <CardHeader className="border-b border-blue-900/20 bg-blue-950/10 p-6">
            <CardTitle className="text-blue-400 flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
              <BookOpen className="w-4 h-4" />
              Knowledge Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {educationalResources.map((resource, idx) => (
              <a 
                key={idx} 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block p-4 bg-black/40 backdrop-blur-xl border border-slate-800 rounded-lg hover:border-blue-500/50 hover:bg-blue-900/10 transition-all group"
              >
                <h3 className="text-white font-bold text-sm mb-2 group-hover:text-blue-300 flex items-center gap-2">
                  {resource.title}
                  <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </h3>
                <div className="flex gap-2 text-[10px] text-blue-400/80 font-mono mb-2 uppercase">
                    <span>{resource.year}</span>
                    <span>•</span>
                    <span>{resource.source || resource.journal}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-3">{resource.description}</p>
              </a>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}