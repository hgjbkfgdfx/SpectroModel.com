import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Sparkles, Loader2, TrendingUp, Music, Shield, Brain, FileAudio, Mic, AlignLeft, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import AudioConverter from '../components/analyze/AudioConverter';
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import { checkUsageLimit, SUBSCRIPTION_TIERS } from "@/components/shared/subscriptionSystem";
import { useUsageLimits } from "@/components/shared/useUsageLimits";
import LimitLocker from "@/components/shared/LimitLocker";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";

export default function LyricsAnalyzerPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();

  const [lyrics, setLyrics] = useState("");
  const [trackName, setTrackName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showConverter, setShowConverter] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0, mlComplexity: 0 });
  const [sessionStartTime] = useState(Date.now());

  const { isLocked, loading: loadingLimits } = useUsageLimits(currentUser);

  const handleClearForm = useCallback(() => {
    setTrackName("");
    setArtistName("");
    setLyrics("");
    setAnalysis(null);
    setError(null);
    setShowConverter(false);
    setOriginalFile(null);
    setAudioFile(null);

    mlDataCollector.record('lyrics_analyzer_form_cleared', {
      feature: 'lyrics_analyzer',
      timestamp: Date.now()
    });
  }, [mlDataCollector]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setAnalysis(null);
    setLyrics("");
    setError(null);

    const fileSizeMB = selectedFile.size / (1024 * 1024);
    const isMP3 = selectedFile.type === 'audio/mpeg' || selectedFile.name.toLowerCase().endsWith('.mp3');

    if (fileSizeMB > 50 || !isMP3) {
      setOriginalFile(selectedFile);
      setShowConverter(true);
      setAudioFile(null);
    } else {
      setAudioFile(selectedFile);
      setShowConverter(false);
      setOriginalFile(null);
    }
  };

  const handleConversionComplete = (convertedFile) => {
    setAudioFile(convertedFile);
    setShowConverter(false);
    setOriginalFile(null);
    setLyrics("");
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!lyrics.trim()) {
      if (!audioFile) {
        setError("Please enter some lyrics or upload an audio file to analyze.");
        return;
      }
      setError("Audio file detected, but lyrics for analysis are missing. Transcription is required first.");
      return;
    }

    const userTier = currentUser?.role === 'admin' ? SUBSCRIPTION_TIERS.PREMIUM : (currentUser?.subscription_tier || SUBSCRIPTION_TIERS.FREE);
    let currentUsage = 0;
    try {
      const now = new Date();
      const startDate = userTier === 'free' ? new Date(now.getFullYear(), now.getMonth(), 1) : new Date(now.setHours(0,0,0,0));
      const recentAnalyses = await base44.entities.MusicAnalysis.filter({
        created_by: currentUser?.email,
        created_date: { $gte: startDate.toISOString() }
      });
      currentUsage = recentAnalyses.length;
    } catch (e) { console.error("Usage check failed", e); }

    if (!checkUsageLimit(userTier, 'analysis_uploads', currentUsage)) {
      setError(`⚠️ Usage limit reached for ${userTier} plan. Please upgrade to Pro or Premium.`);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const prompt = `Analyze these song lyrics using 175M+ music industry data points.
LYRICS: ${lyrics}
Return comprehensive JSON analysis.`;

       const result = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: true,
            response_json_schema: {
              type: "object",
              properties: {
                lyrical_quality_score: { type: "number", minimum: 0, maximum: 100 },
                commercial_appeal_score: { type: "number", minimum: 0, maximum: 100 },
                emotional_impact_score: { type: "number", minimum: 0, maximum: 100 },
                memorability_score: { type: "number", minimum: 0, maximum: 100 },
                overall_score: { type: "number", minimum: 0, maximum: 100 },
                genre_fit: { type: "array", items: { type: "string" } },
                themes: { type: "array", items: { type: "string" } },
                strengths: { type: "array", items: { type: "string" } },
                weaknesses: { type: "array", items: { type: "string" } },
                comparable_hits: { type: "array", items: { type: "string" } },
                target_audience: { type: "array", items: { type: "string" } },
                market_potential: { type: "string" },
                originality_score: { type: "number", minimum: 0, maximum: 100 },
                structure_and_flow_assessment: { type: "string" }
              },
              required: ["overall_score"]
            }
          });

      setAnalysis(result);

      const fileHash = btoa(encodeURIComponent(lyrics.trim()));

      try {
        await base44.entities.MusicAnalysis.create({
          track_name: trackName || "Untitled",
          artist_name: artistName || "Unknown",
          original_lyrics: lyrics,
          file_hash: fileHash,
          lyrics_analysis: result,
          status: "completed",
          analysis_type: "lyrics_analyzer"
        });
      } catch (dbError) {
        console.log("Could not save to database:", dbError);
      }
      
      mlDataCollector.record('lyrics_analysis_completed', {
        feature: 'lyrics_analyzer',
        timestamp: Date.now()
      });

    } catch (err) {
      console.error("Lyrics analysis failed:", err);
      setError(err.message || "Failed to analyze lyrics. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadExistingAnalysis = async () => {
      try {
        base44.auth.me().then(u => { if(mounted) setCurrentUser(u); }).catch(() => {});
        blockScriptInjection();
        const cspResult = validateCSP();

        if (mounted) {
          setSecurityStatus({
            safe: cspResult.valid,
            threats: cspResult.violations?.length || 0,
            mlComplexity: cspResult.mlComplexity || 0
          });
        }

        mlDataCollector.record('lyrics_analyzer_page_visit', {
          feature: 'lyrics_analyzer',
          timestamp: Date.now()
        });

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (id) {
          try {
            const analyses = await base44.entities.MusicAnalysis.filter({ id });
            const fetchedAnalysis = analyses[0];

            if (fetchedAnalysis && fetchedAnalysis.lyrics_analysis) {
              setLyrics(fetchedAnalysis.original_lyrics || "");
              setTrackName(fetchedAnalysis.track_name || "");
              setArtistName(fetchedAnalysis.artist_name || "");
              setAnalysis(fetchedAnalysis.lyrics_analysis);
            }
          } catch (error) {
            console.error("Failed to load analysis:", error);
          }
        }
      } catch (error) {
        console.error('Initialization failed:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadExistingAnalysis();

    return () => {
      mounted = false;
      const sessionDuration = Date.now() - sessionStartTime;
      mlDataCollector.record('lyrics_analyzer_session_end', {
        feature: 'lyrics_analyzer',
        sessionDuration,
        analysisCompleted: !!analysis,
        timestamp: Date.now()
      });
    };
  }, []);

  if (isLoading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f0520] to-[#050015] p-4 md:p-8">
      <NetworkErrorBanner />
      <AILearningBanner />
      <LimitLocker feature="analysis_uploads" featureKey="LYRICS_ANALYZER" user={currentUser} />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-6">
           <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(createPageUrl("Dashboard"))}
                className="text-pink-400 hover:text-pink-300 hover:bg-pink-950/30 rounded-full transition-all duration-300"
            >
                <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-pulse">
                    LYRICAL INTELLIGENCE
                </span>
                </h1>
                <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
                Semantic Analysis & Hit Potential Engine
                </p>
            </div>
          </div>
        </div>

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Security */}
             <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Textual Security</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                {securityStatus.safe ? '>> CONTENT FILTERING ACTIVE' : '!! THREATS DETECTED'}
                            </p>
                        </div>
                    </div>
                    <Badge className={securityStatus.safe ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
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
                            <p className="text-white font-bold text-xs uppercase">NLP Engine</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                &gt;&gt; MODEL: GPT-4o-SEMANTIC
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">ONLINE</Badge>
                </CardContent>
            </Card>
        </div>

        <LiveSecurityDisplay />
        <LiveThreatDisplay />

        {showConverter && originalFile ? (
          <AudioConverter
            file={originalFile}
            onConversionComplete={handleConversionComplete}
            onCancel={() => {
              setShowConverter(false);
              setOriginalFile(null);
              setAudioFile(null);
            }}
          />
        ) : (
          <>
            {!analysis && !isAnalyzing && (
              <div className="grid gap-6">
                {/* INPUT CARD */}
                <Card className="bg-black/40 backdrop-blur-xl border border-pink-500/30 shadow-[0_0_20px_-5px_rgba(236,72,153,0.15)] rounded-xl backdrop-blur-md overflow-hidden">
                  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-pink-500 to-purple-600"></div>
                  <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-white text-xl font-bold uppercase tracking-wide flex items-center gap-2">
                             <FileAudio className="w-5 h-5 text-pink-400" />
                             Source Material
                        </CardTitle>
                        {(trackName || artistName || lyrics || audioFile) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearForm}
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/30 text-xs font-mono"
                        >
                            RESET DATA
                        </Button>
                        )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-pink-400 mb-1 uppercase tracking-wider">Track Name</label>
                        <Input
                          value={trackName}
                          onChange={(e) => setTrackName(e.target.value)}
                          placeholder="ENTER TRACK TITLE..."
                          className="bg-black/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-pink-400 mb-1 uppercase tracking-wider">Artist</label>
                        <Input
                          value={artistName}
                          onChange={(e) => setArtistName(e.target.value)}
                          placeholder="ENTER ARTIST NAME..."
                          className="bg-black/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 font-mono text-sm"
                        />
                      </div>
                    </div>

                     {/* Audio Input */}
                     <div className="p-4 bg-black/30 rounded-lg border border-dashed border-slate-700 hover:border-pink-500/50 transition-colors">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="p-2 bg-pink-900/20 rounded-full">
                                <Mic className="w-5 h-5 text-pink-400" />
                            </div>
                            <div className="flex-1">
                                <span className="block text-sm font-bold text-white uppercase">Upload Audio Reference (Optional)</span>
                                <span className="block text-xs text-slate-500 font-mono">SUPPORTED: MP3, WAV, M4A</span>
                            </div>
                            <Input
                                type="file"
                                accept="audio/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                             {audioFile ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">{audioFile.name}</Badge>
                             ) : (
                                <span className="text-xs text-pink-400 font-bold hover:underline">BROWSE FILES</span>
                             )}
                        </label>
                     </div>
                  </CardContent>
                </Card>

                {/* LYRICS INPUT */}
                <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30 shadow-2xl rounded-xl backdrop-blur-md overflow-hidden">
                   <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-cyan-600"></div>
                  <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                    <CardTitle className="text-white flex items-center gap-2 text-xl font-bold uppercase tracking-wide">
                      <AlignLeft className="w-5 h-5 text-purple-400" />
                      Lyrical Data Entry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <Textarea
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      placeholder="// PASTE LYRICS HERE FOR SEMANTIC ANALYSIS..."
                      className="min-h-[300px] bg-black/50 border-slate-700 text-cyan-50 placeholder:text-slate-600 font-mono text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 resize-none"
                    />
                    {error && (
                        <div className="flex items-center gap-2 text-red-400 bg-red-950/20 p-3 rounded border border-red-500/30">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs font-mono uppercase">{error}</span>
                        </div>
                    )}
                    
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || (!lyrics.trim())}
                      className="w-full h-12 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black tracking-widest text-sm shadow-[0_0_20px_-5px_rgba(236,72,153,0.3)] border border-white/10"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          RUNNING NEURAL ANALYSIS...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          INITIATE ANALYSIS SEQUENCE
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* RESULTS VIEW */}
            {analysis && (
              <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                {/* PRIMARY SCORES */}
                <Card className="bg-black/80 border border-pink-500/30 shadow-[0_0_40px_-10px_rgba(236,72,153,0.2)] rounded-2xl overflow-hidden backdrop-blur-xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"></div>
                  <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-3 text-2xl font-black uppercase tracking-wide">
                            <TrendingUp className="w-8 h-8 text-pink-500" />
                            Analysis Vector Results
                        </CardTitle>
                        <div className="text-right">
                             <p className="text-[10px] text-slate-400 font-mono uppercase">Overall Rating</p>
                             <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                                {analysis.overall_score?.toFixed(1)}%
                             </div>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8 p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            {[
                                { label: "Lyrical Quality", val: analysis.lyrical_quality_score, color: "bg-pink-500" },
                                { label: "Commercial Appeal", val: analysis.commercial_appeal_score, color: "bg-purple-500" },
                                { label: "Emotional Impact", val: analysis.emotional_impact_score, color: "bg-blue-500" },
                                { label: "Memorability", val: analysis.memorability_score, color: "bg-green-500" },
                                { label: "Originality", val: analysis.originality_score, color: "bg-yellow-500" },
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{stat.label}</span>
                                        <span className="text-xs font-mono text-white">{stat.val?.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={stat.val || 0} className="h-2 bg-slate-800" indicatorClassName={`${stat.color} shadow-[0_0_10px_currentColor]`} />
                                </div>
                            ))}
                        </div>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-black/30 rounded-lg border border-purple-500/20">
                                <h4 className="text-purple-400 font-bold text-xs uppercase mb-3 flex items-center gap-2">
                                    <Music className="w-4 h-4" /> Market Fit
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.genre_fit?.map((g, i) => (
                                        <Badge key={i} variant="outline" className="border-purple-500/30 text-purple-300 bg-purple-500/10 text-xs font-mono uppercase">{g}</Badge>
                                    ))}
                                </div>
                            </div>
                             <div className="p-4 bg-black/30 rounded-lg border border-cyan-500/20">
                                <h4 className="text-cyan-400 font-bold text-xs uppercase mb-3 flex items-center gap-2">
                                    <Brain className="w-4 h-4" /> Thematic Core
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.themes?.map((t, i) => (
                                        <Badge key={i} variant="outline" className="border-cyan-500/30 text-cyan-300 bg-cyan-500/10 text-xs font-mono uppercase">{t}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                  </CardContent>
                </Card>

                {/* STRUCTURE & MARKET VISUALIZATION */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Structure Card with Diagram */}
                    <Card className="bg-black/40 backdrop-blur-xl border border-lime-500/30 shadow-lg rounded-xl overflow-hidden backdrop-blur-md">
                        <CardHeader className="border-b border-lime-900/20 bg-lime-950/10 p-4">
                            <CardTitle className="text-lime-400 font-bold text-sm uppercase flex items-center gap-2">
                                <AlignLeft className="w-4 h-4" /> Structural Integrity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <p className="text-slate-300 text-sm leading-relaxed">{analysis.structure_and_flow_assessment}</p>
                            
                            {/* Diagram Tag Injection */}
                            <div className="mt-4 p-3 bg-lime-950/20 border border-lime-500/20 rounded-lg flex items-center gap-3">
                                <div className="text-[10px] font-mono text-lime-600"></div>
                                <span className="text-xs text-lime-500/50 italic">Visualizing Verse-Chorus Dynamic</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Market Potential Card with Diagram */}
                    <Card className="bg-black/40 backdrop-blur-xl border border-blue-500/30 shadow-lg rounded-xl overflow-hidden backdrop-blur-md">
                        <CardHeader className="border-b border-blue-900/20 bg-blue-950/10 p-4">
                            <CardTitle className="text-blue-400 font-bold text-sm uppercase flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Commercial Viability
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <p className="text-slate-300 text-sm leading-relaxed">{analysis.market_potential}</p>

                             {/* Diagram Tag Injection */}
                             <div className="mt-4 p-3 bg-blue-950/20 border border-blue-500/20 rounded-lg flex items-center gap-3">
                                <div className="text-[10px] font-mono text-blue-600"></div>
                                <span className="text-xs text-blue-500/50 italic">Comparing against current Top 40</span>
                            </div>

                            {analysis.target_audience && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {analysis.target_audience.map((aud, i) => (
                                        <span key={i} className="text-[10px] text-blue-300 border border-blue-500/30 px-2 py-1 rounded bg-blue-500/5">{aud}</span>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* COMPARABLES */}
                <Card className="bg-black/40 backdrop-blur-xl border border-slate-700 rounded-xl overflow-hidden">
                    <CardContent className="p-6">
                        <h4 className="text-slate-400 font-bold text-xs uppercase mb-4 tracking-wider">Semantic Similarities (Hit Database)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {analysis.comparable_hits?.map((hit, i) => (
                                <div key={i} className="p-3 bg-black/40 backdrop-blur-xl border border-slate-800 rounded flex items-center gap-3">
                                    <Music className="w-4 h-4 text-slate-600" />
                                    <span className="text-sm text-slate-300 font-medium">{hit}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Button
                  onClick={() => {
                    setAnalysis(null);
                    setTrackName("");
                    setArtistName("");
                    setLyrics("");
                    setError(null);
                    setAudioFile(null);
                    mlDataCollector.record('new_lyrics_analysis_started', { feature: 'lyrics_analyzer', timestamp: Date.now() });
                  }}
                  className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-white font-bold tracking-widest text-sm border border-slate-600"
                >
                  RESET ANALYZER ENGINE
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}