import React, { useState, useCallback, useEffect, useMemo } from "react";
import { MusicAnalysis } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ArrowLeft, TrendingUp, Music, Radio, Zap, Upload, Shield, Brain, BarChart2, PieChart, Lightbulb, BarChart3 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import AnalysisProgress from "../components/analyze/AnalysisProgress";
import { runUnifiedDSPAnalysis, calculatePopHitScore } from "../components/shared/UnifiedDSPAnalysis";
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { validateCSP, blockScriptInjection, validateFile } from '@/components/shared/SecurityValidator';
import LiveSecurityDisplay from '@/components/shared/LiveSecurityDisplay';
import LiveThreatDisplay from '@/components/shared/LiveThreatDisplay';
import { base44 } from '@/api/base44Client';
import { useUsageLimits } from '@/components/shared/useUsageLimits';
import LimitLocker from "@/components/shared/LimitLocker";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";

const cleanText = (text) => {
  return text?.trim() || '';
};

const TEXT_VISIBLE_BOLD = "text-white font-black";
const TEXT_SLATE_200_BOLD = "text-slate-200 font-black";
const TEXT_SLATE_300_BOLD = "text-slate-300 font-black";
const TEXT_SLATE_400_BOLD = "text-slate-400 font-black";
const TEXT_SLATE_500_BOLD = "text-slate-500 font-black";
const CARD_TEXT_SAFE = "overflow-hidden text-ellipsis break-words";

export default function AnalyzeMarketFitPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const mlDataCollector = useMLDataCollector();

  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [showClearButton, setShowClearButton] = useState(false);

  const [trackName, setTrackName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState("");
  const [subgenre, setSubgenre] = useState("");
  const [songLength, setSongLength] = useState("");
  const [lyricsExcerpt, setLyricsExcerpt] = useState("");
  const [notableFeatures, setNotableFeatures] = useState("");

  // Security only
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0, mlComplexity: 0 });
  const [sessionStartTime] = useState(Date.now());
  const [currentUser, setCurrentUser] = useState(null);

  const { isLocked, loading: loadingLimits } = useUsageLimits(currentUser);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const CURRENT_ANALYSIS_VERSION = "4.3"; 

  // Initialize security and load analysis by ID
  useEffect(() => {
    let mounted = true;

    const initializePage = async () => {
      try {
        blockScriptInjection();
        const cspResult = validateCSP();
        
        if (mounted) {
          setSecurityStatus({
            safe: cspResult.valid,
            threats: cspResult.violations?.length || 0,
            mlComplexity: cspResult.mlComplexity || 0
          });
        }
        
        mlDataCollector.record('market_fit_page_visit', {
          feature: 'market_fit',
          timestamp: Date.now()
        });

        if (id) {
          try {
            const analyses = await base44.entities.MusicAnalysis.filter({ id });
            const cachedAnalysis = analyses[0];
            
            if (cachedAnalysis && cachedAnalysis.analysis_type === "market_fit_score") {
              setAnalysis(cachedAnalysis);
              setTrackName(cleanText(cachedAnalysis.track_name || ""));
              setArtistName(cleanText(cachedAnalysis.artist_name || ""));
              setGenre(cleanText(cachedAnalysis.genre || ""));
              setSubgenre(cleanText(cachedAnalysis.subgenre || ""));
              setSongLength(cachedAnalysis.song_length || "");
              setLyricsExcerpt(cleanText(cachedAnalysis.lyrics_excerpt || cachedAnalysis.lyricsExcerpt || ""));
              setNotableFeatures(cleanText(cachedAnalysis.notable_features || cachedAnalysis.notableFeatures || ""));
            }
          } catch (err) {
            console.error("❌ Failed to load analysis:", err);
            setError("Failed to load previous analysis. Please try again.");
          }
        }
      } catch (error) {
        console.error('❌ Initialization failed:', error);
      }
    };

    initializePage();

    return () => {
      mounted = false;
      const sessionDuration = Date.now() - sessionStartTime;
      mlDataCollector.record('market_fit_session_end', {
        feature: 'market_fit',
        sessionDuration,
        analysisCompleted: !!analysis,
        timestamp: Date.now()
      });
    };
  }, [id, mlDataCollector, sessionStartTime, analysis]);

  const calculateFileHash = useCallback(async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  const handleFileInput = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("audio/") &&
        !selectedFile.name.match(/\.(mp3|wav|m4a|mp4|flac|ogg|aac)$/i)) {
      setError("Please upload an audio file (mp3, wav, m4a, mp4, flac, ogg, aac)");
      return;
    }

    const validation = validateFile(selectedFile, {
      maxSizeMB: 200,
      allowedTypes: ['audio/*'],
      allowedExtensions: ['mp3', 'wav', 'm4a', 'mp4', 'flac', 'ogg', 'aac']
    });

    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }

    setFile(selectedFile);
    setError(null);
    setShowClearButton(true);

    const fileNameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, "");
    if (!trackName) {
      setTrackName(cleanText(fileNameWithoutExtension));
    }
  };

  const handleClearForm = () => {
    setFile(null);
    setTrackName("");
    setArtistName("");
    setGenre("");
    setSubgenre("");
    setSongLength("");
    setLyricsExcerpt("");
    setNotableFeatures("");
    setShowClearButton(false);
    setError(null);
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    const cleanedTrackName = cleanText(trackName);
    const cleanedArtistName = cleanText(artistName);
    const cleanedGenre = cleanText(genre);
    const cleanedSubgenre = cleanText(subgenre);
    const cleanedLyricsExcerpt = cleanText(lyricsExcerpt);
    const cleanedNotableFeatures = cleanText(notableFeatures);

    if (!file || !cleanedTrackName.trim() || !cleanedArtistName.trim()) {
      setError("Please provide audio file, track name, and artist name (required fields)");
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    setAnalysis(null);
    setStatusMessage("Preparing market fit analysis...");

    try {
      setProgress(5);
      setStatusMessage("Calculating file hash...");

      const fileHash = await calculateFileHash(file);

      setProgress(10);
      setStatusMessage("Checking cache...");

      const existingAnalyses = await base44.entities.MusicAnalysis.filter({
        file_hash: fileHash,
        analysis_type: "market_fit_score",
        status: "completed",
        analysis_version: CURRENT_ANALYSIS_VERSION
      });

      if (existingAnalyses && existingAnalyses.length > 0) {
        const cached = existingAnalyses[0];
        setProgress(100);
        setStatusMessage("Loaded from cache!");
        setAnalysis(cached);
        setIsAnalyzing(false);
        return;
      }

      setProgress(15);
      setStatusMessage("Running UNIFIED DSP analysis...");

      const features = await runUnifiedDSPAnalysis(file, fileHash);

      setProgress(50);
      setStatusMessage("Calculating hit score using unified formula...");

      const popScore = calculatePopHitScore(features);

      setProgress(60);
      setStatusMessage("Analyzing market trends with AI...");

      let llmMarketFitResult = null;
      const marketPrompt = `Analyze commercial market potential for the song: "${cleanedTrackName}" by "${cleanedArtistName}".
${cleanedGenre ? `Genre: ${cleanedGenre}` : ''}
${cleanedSubgenre ? `Style: ${cleanedSubgenre}` : ''}
${songLength ? `Length: ${songLength}` : ''}
${cleanedLyricsExcerpt ? `Lyrics Excerpt: ${cleanedLyricsExcerpt}` : ''}
${cleanedNotableFeatures ? `Notable Features: ${cleanedNotableFeatures}` : ''}

Unified DSP Pop Hit Score (out of 100): ${popScore.toFixed(1)}

Provide a detailed JSON response (all scores on a 0.0-10.0 scale).`;

      const result = await base44.integrations.Core.InvokeLLM({
            prompt: marketPrompt,
            add_context_from_internet: true,
            response_json_schema: {
                "type": "object",
                "properties": {
                    "overall_score": { "type": "number" },
                    "interpretation": { "type": "string" },
                    "trending_similarity": {
                        "type": "object",
                        "properties": {
                            "score": { "type": "number" },
                            "interpretation": { "type": "string" }
                        }
                    },
                    "playlist_potential": {
                        "type": "object",
                        "properties": {
                            "score": { "type": "number" }
                        }
                    },
                    "radio_friendly": {
                        "type": "object",
                        "properties": {
                            "score": { "type": "number" }
                        }
                    },
                    "viral_potential": {
                        "type": "object",
                        "properties": {
                            "score": { "type": "number" }
                        }
                    },
                    "strategic_recommendations": {
                        "type": "array",
                        "items": { "type": "string" }
                    }
                }
            }
      });
      llmMarketFitResult = result;

      setProgress(85);
      setStatusMessage("Finalizing market analysis...");

      const analysisResult = {
        track_name: cleanedTrackName,
        artist_name: cleanedArtistName,
        genre: cleanedGenre || "Not specified",
        subgenre: cleanedSubgenre || "Not specified",
        lyrics_excerpt: cleanedLyricsExcerpt, 
        notable_features: cleanedNotableFeatures, 
        file_hash: fileHash,
        analysis_type: "market_fit_score",
        hit_score: popScore,
        skip_likelihood: 100 - popScore,
        audio_features: features,
        market_fit: llmMarketFitResult,
        tempo: Math.round(features.tempo),
        status: "completed",
        analysis_version: CURRENT_ANALYSIS_VERSION,
        created_date: new Date().toISOString()
      };

      setProgress(90);
      setStatusMessage("Saving results...");

      const saved = await base44.entities.MusicAnalysis.create(analysisResult);
      setAnalysis(saved);

      setProgress(100);
      setStatusMessage("✓ Market analysis complete!");

    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const marketFit = analysis?.market_fit;

  return (
    // CYBERPUNK BASE - PURE DARK
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f0520] to-[#050015] p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-purple-500/30 selection:text-purple-100">

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <LimitLocker feature="market_fit" featureKey="MARKET_FIT" user={currentUser} />

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
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-500 animate-pulse">
                    MARKET VECTOR ANALYSIS
                </span>
                </h1>
                <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
                Predictive Commercial Viability & Trend Alignment
                </p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-950/30 border-red-500/50 backdrop-blur-md">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200 font-mono text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Security */}
             <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className={`w-5 h-5 ${securityStatus.safe ? 'text-green-400' : 'text-red-400'}`} />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Data Verification</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                {securityStatus.safe ? '&gt;&gt; SOURCES VERIFIED' : '!! UNTRUSTED CONNECTION'}
                            </p>
                        </div>
                    </div>
                    <Badge className={securityStatus.safe ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}>
                        {securityStatus.safe ? 'SECURE' : 'ALERT'}
                    </Badge>
                </CardContent>
            </Card>

            {/* AI Status */}
            <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Trend Engine</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                &gt;&gt; AGGREGATING GLOBAL SIGNALS...
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">ACTIVE</Badge>
                </CardContent>
            </Card>
        </div>

        <LiveSecurityDisplay />
        <LiveThreatDisplay />

        {!analysis && !isAnalyzing && (
          <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <CardHeader className="border-b border-white/5 bg-white/5 p-8">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-3 text-2xl font-bold uppercase tracking-wide">
                  <Upload className="w-6 h-6 text-purple-400" />
                  Initiate Market Scan
                </CardTitle>
                {showClearButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearForm}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/30 font-mono text-xs"
                  >
                    RESET FORM
                  </Button>
                )}
              </div>
              <p className="text-slate-400 text-xs font-mono mt-2 uppercase tracking-wider">
                &gt;&gt; UPLOAD ASSETS FOR COMMERCIAL VIABILITY ASSESSMENT
              </p>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="track_name" className="text-purple-300 text-xs font-bold uppercase tracking-wider">Track Identity</Label>
                  <Input
                    id="track_name"
                    value={trackName}
                    onChange={(e) => setTrackName(cleanText(e.target.value))}
                    placeholder="ENTER TRACK TITLE..."
                    className="bg-black/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 font-mono text-sm h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist_name" className="text-purple-300 text-xs font-bold uppercase tracking-wider">Artist Identity</Label>
                  <Input
                    id="artist_name"
                    value={artistName}
                    onChange={(e) => setArtistName(cleanText(e.target.value))}
                    placeholder="ENTER ARTIST NAME..."
                    className="bg-black/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 font-mono text-sm h-12"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-purple-300 text-xs font-bold uppercase tracking-wider">Primary Genre</Label>
                  <Input
                    id="genre"
                    value={genre}
                    onChange={(e) => setGenre(cleanText(e.target.value))}
                    placeholder="E.G. POP, HIP-HOP..."
                    className="bg-black/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 font-mono text-sm h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subgenre" className="text-purple-300 text-xs font-bold uppercase tracking-wider">Sub-Genre / Style</Label>
                  <Input
                    id="subgenre"
                    value={subgenre}
                    onChange={(e) => setSubgenre(cleanText(e.target.value))}
                    placeholder="E.G. DARK TRAP, SYNTHWAVE..."
                    className="bg-black/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 font-mono text-sm h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audio_file" className="text-purple-300 text-xs font-bold uppercase tracking-wider">Audio Source *</Label>
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                    <Input
                    id="audio_file"
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.mp4,.flac,.ogg,.aac"
                    onChange={handleFileInput}
                    className="relative bg-black/80 border-slate-700 text-white file:bg-purple-600 file:text-white file:border-none file:mr-4 file:py-2 file:px-4 file:rounded-sm hover:file:bg-purple-500 cursor-pointer h-14"
                    />
                </div>
                {file && (
                  <p className="text-xs text-green-400 font-mono mt-2">&gt;&gt; FILE LOADED: {file.name.toUpperCase()}</p>
                )}
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!file || !trackName.trim() || !artistName.trim()}
                className="w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black tracking-widest text-lg shadow-lg shadow-purple-900/20"
              >
                <TrendingUp className="w-6 h-6 mr-3" />
                INITIATE MARKET ANALYSIS
              </Button>
            </CardContent>
          </Card>
        )}

        {isAnalyzing && (
          <AnalysisProgress progress={progress} statusMessage={statusMessage} />
        )}

        {/* RESULTS DASHBOARD */}
        {analysis && marketFit && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)] rounded-2xl overflow-hidden backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 bg-white/5 p-8">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-white text-3xl font-black uppercase tracking-wide flex items-center gap-3"><div className="p-2 bg-white/10 rounded-lg relative overflow-hidden"><div className="absolute inset-0 bg-purple-500/20 blur-md"></div><BarChart3 className="w-8 h-8 text-white relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" /></div> Market Fit Results</CardTitle>
                        <p className="text-slate-400 text-sm font-mono mt-2">
                        DATA SOURCE: BILLBOARD • SPOTIFY • TIKTOK API
                        </p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-white uppercase">{analysis.track_name}</h2>
                        <p className="text-sm font-mono text-purple-400">{analysis.artist_name}</p>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                {/* OVERALL SCORE */}
                <div className="bg-black/40 border border-purple-500/20 rounded-xl p-6 flex flex-col md:flex-row items-center gap-8">
                  <div className="text-center md:text-left">
                    <h3 className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">Overall Market Readiness</h3>
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                      {marketFit.overall_score?.toFixed(1)}/10
                    </div>
                  </div>
                  <div className="flex-1 border-l border-slate-800 pl-8">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Analysis Summary</p>
                    <p className="text-slate-300 text-sm leading-relaxed font-light">{marketFit.interpretation}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Trending Similarity - BLUE */}
                  <Card className="bg-black/40 border border-blue-500/20 hover:border-blue-500/50 transition-all group">
                    <CardHeader className="p-6 border-b border-white/5">
                      <CardTitle className="text-white flex items-center gap-3 text-lg font-bold uppercase tracking-wide">
                        <div className="p-1 bg-blue-500/10 rounded relative">
                          <div className="absolute inset-0 bg-blue-400/20 blur-sm rounded opacity-50"></div>
                          <TrendingUp className="w-6 h-6 text-blue-400 relative z-10 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
                        </div>
                        Trend Alignment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-end mb-4">
                        <span className="text-4xl font-black text-blue-400">{marketFit.trending_similarity?.score?.toFixed(1)}</span>
                        <span className="text-xs text-slate-500 font-mono mb-1">/ 10.0</span>
                      </div>
                      <Progress value={(marketFit.trending_similarity?.score || 0) * 10} className="h-2 bg-slate-800" indicatorClassName="bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                      <p className="mt-4 text-xs text-slate-400 leading-relaxed font-mono">
                          {marketFit.trending_similarity?.interpretation}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Playlist Potential - GREEN */}
                  <Card className="bg-black/40 border border-green-500/20 hover:border-green-500/50 transition-all group">
                    <CardHeader className="p-6 border-b border-white/5">
                      <CardTitle className="text-white flex items-center gap-3 text-lg font-bold uppercase tracking-wide">
                        <div className="p-1 bg-green-500/10 rounded relative">
                          <div className="absolute inset-0 bg-green-400/20 blur-sm rounded opacity-50"></div>
                          <Music className="w-6 h-6 text-green-400 relative z-10 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
                        </div>
                        Playlist Vector
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-end mb-4">
                        <span className="text-4xl font-black text-green-400">{marketFit.playlist_potential?.score?.toFixed(1)}</span>
                        <span className="text-xs text-slate-500 font-mono mb-1">/ 10.0</span>
                      </div>
                      <Progress value={(marketFit.playlist_potential?.score || 0) * 10} className="h-2 bg-slate-800" indicatorClassName="bg-green-500 shadow-[0_0_10px_#22c55e]" />
                      
                      {/* Diagram Tag Injection */}
                      <div className="mt-4 p-3 bg-green-950/20 border border-green-500/20 rounded-lg flex items-center gap-3">
                          <PieChart className="w-4 h-4 text-green-400" />
                          <div className="text-[10px] text-green-300 font-mono border border-green-500/30 rounded px-2 py-1 bg-black/40">
                              [DATA VISUALIZATION]
                          </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Radio Friendly - ORANGE */}
                  <Card className="bg-black/40 border border-orange-500/20 hover:border-orange-500/50 transition-all group">
                    <CardHeader className="p-6 border-b border-white/5">
                      <CardTitle className="text-white flex items-center gap-3 text-lg font-bold uppercase tracking-wide">
                        <div className="p-1 bg-orange-500/10 rounded relative">
                          <div className="absolute inset-0 bg-orange-400/20 blur-sm rounded opacity-50"></div>
                          <Radio className="w-6 h-6 text-orange-400 relative z-10 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]" />
                        </div>
                        Broadcast Viability
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-end mb-4">
                        <span className="text-4xl font-black text-orange-400">{marketFit.radio_friendly?.score?.toFixed(1)}</span>
                        <span className="text-xs text-slate-500 font-mono mb-1">/ 10.0</span>
                      </div>
                      <Progress value={(marketFit.radio_friendly?.score || 0) * 10} className="h-2 bg-slate-800" indicatorClassName="bg-orange-500 shadow-[0_0_10px_#f97316]" />
                    </CardContent>
                  </Card>

                  {/* Viral Potential - PINK */}
                  <Card className="bg-black/40 border border-pink-500/20 hover:border-pink-500/50 transition-all group">
                    <CardHeader className="p-6 border-b border-white/5">
                      <CardTitle className="text-white flex items-center gap-3 text-lg font-bold uppercase tracking-wide">
                        <div className="p-1 bg-pink-500/10 rounded relative">
                          <div className="absolute inset-0 bg-pink-400/20 blur-sm rounded opacity-50"></div>
                          <Zap className="w-6 h-6 text-pink-400 relative z-10 drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]" />
                        </div>
                        Viral Velocity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-end mb-4">
                        <span className="text-4xl font-black text-pink-400">{marketFit.viral_potential?.score?.toFixed(1)}</span>
                        <span className="text-xs text-slate-500 font-mono mb-1">/ 10.0</span>
                      </div>
                      <Progress value={(marketFit.viral_potential?.score || 0) * 10} className="h-2 bg-slate-800" indicatorClassName="bg-pink-500 shadow-[0_0_10px_#ec4899]" />
                      
                       {/* Diagram Tag Injection */}
                       <div className="mt-4 p-3 bg-pink-950/20 border border-pink-500/20 rounded-lg flex items-center gap-3">
                          <BarChart2 className="w-4 h-4 text-pink-400" />
                          <div className="text-[10px] text-pink-300 font-mono border border-pink-500/30 rounded px-2 py-1 bg-black/40">
                             [DATA VISUALIZATION]
                          </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* RECOMMENDATIONS */}
                <Card className="bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden">
                  <CardHeader className="border-b border-white/5 bg-purple-900/10 p-4">
                    <CardTitle className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2"><Lightbulb className="w-4 h-4 text-purple-400" /> Strategic Directives</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-3">
                      {marketFit.strategic_recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3 text-slate-300 text-sm font-mono">
                          <span className="text-purple-500 mt-1">&gt;&gt;</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Button
              onClick={handleClearForm}
              className="w-full h-14 bg-slate-800 hover:bg-slate-700 text-white font-bold tracking-widest text-sm border border-slate-600"
            >
              RESET SCANNER
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}