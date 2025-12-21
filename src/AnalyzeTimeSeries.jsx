import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { MusicAnalysis } from "@/api/entities";
import { TrendingUp, Loader2, AlertCircle, Calendar, BarChart3, Upload, ArrowLeft, Shield, Brain, Activity, Clock, LineChart as LineChartIcon, FileAudio } from "lucide-react";
import { InvokeLLM } from "@/api/integrations";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { runUnifiedDSPAnalysis } from "../components/shared/UnifiedDSPAnalysis";
import AudioConverter from "../components/analyze/AudioConverter";
import { useNavigate } from "react-router-dom";
import { validateCSP, blockScriptInjection, validateFile } from "@/components/shared/SecurityValidator";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from "@/utils";
import { useUsageLimits } from "@/components/shared/useUsageLimits";
import LimitLocker from "@/components/shared/LimitLocker";
import { base44 } from "@/api/base44Client";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import HolographicBackground from "@/components/shared/HolographicBackground";

const MAX_FILE_SIZE = 200 * 1024 * 1024;

export default function AnalyzeTimeSeriesPage() {
  const mlDataCollector = useMLDataCollector();
  const [file, setFile] = useState(null);
  const [trackName, setTrackName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [error, setError] = useState(null);
  const [showConverter, setShowConverter] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0, mlComplexity: 0 });
  const [sessionStartTime] = useState(Date.now());
  const [currentUser, setCurrentUser] = useState(null);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const { isLocked, loading: loadingLimits } = useUsageLimits(currentUser);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  useEffect(() => {
    blockScriptInjection();
    const cspResult = validateCSP();
    setSecurityStatus({ 
        safe: cspResult.valid, 
        threats: cspResult.violations?.length || 0,
        mlComplexity: cspResult.mlComplexity || 0
    });
    mlDataCollector.record('time_series_page_visit', { feature: 'time_series', timestamp: Date.now() });
  }, []);

  // Mock chart data and handlers for demonstration
  const chartData = prediction?.weekly_streams?.map((streams, index) => ({ week: index + 1, streams: streams })) || [];
  const handleFileSelect = () => {};
  const handleAnalyze = () => { setIsAnalyzing(true); setTimeout(() => { setIsAnalyzing(false); setPrediction({ weekly_streams: [1000, 2000, 5000, 3000], peak_week: 3, total_projected_streams: 10000, viral_probability: 85 }); }, 2000); };
  const handleConversionComplete = () => {};

  return (
    // CYBERPUNK BASE
    <div className="min-h-screen bg-[#030014] text-cyan-50 font-sans selection:bg-cyan-500/30 selection:text-cyan-100 overflow-x-hidden relative">
      
      <HolographicBackground />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-[1]"></div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8 p-4 md:p-8">
        <NetworkErrorBanner />
        <AILearningBanner />
        <LimitLocker feature="time_series" featureKey="TIME_SERIES" user={currentUser} />

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/5 bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(createPageUrl("Dashboard"))}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded-full transition-all duration-300"
            >
                <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-4">
                <TrendingUp className="w-10 h-10 text-cyan-500 animate-pulse" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-pulse">
                    TEMPORAL PREDICTOR
                </span>
                </h1>
                <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
                Predictive Analytics & 52-Week Forecasting
                </p>
            </div>
          </div>
        </div>

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Security */}
             <Card className="bg-black/60 border border-green-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Data Verification</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                {securityStatus.safe ? '>> INPUT SANITIZED' : '!! ANOMALY DETECTED'}
                            </p>
                        </div>
                    </div>
                    <Badge className={securityStatus.safe ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}>
                        {securityStatus.safe ? 'SECURE' : 'ALERT'}
                    </Badge>
                </div>
            </CardContent>

            {/* AI Status */}
            {file && !prediction && (
                <Card className="bg-black/60 border border-cyan-500/30 backdrop-blur-md rounded-xl">
                    <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                            <div>
                                <p className="text-white font-bold text-xs uppercase">Forecast Engine</p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                    &gt;&gt; LEARNING PATTERNS...
                                </p>
                            </div>
                        </div>
                        <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">ACTIVE</Badge>
                    </CardContent>
                </Card>
            )}
        </div>

        <LiveSecurityDisplay />
        <LiveThreatDisplay />

        {/* Hidden file input */}
        <input
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.mp4,.flac,.ogg,.aac,.wma,.aiff,.ape,.alac,.opus"
          onChange={handleFileSelect}
          className="hidden"
          ref={fileInputRef}
        />

        {/* INPUT FORM - PURPLE */}
        {!prediction && showForm && (
          <Card className="bg-black/60 border border-purple-500/30 shadow-2xl backdrop-blur-xl rounded-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <CardHeader className="border-b border-white/5 bg-white/5 p-6 relative z-10">
              <CardTitle className="text-white flex items-center gap-3 text-xl font-bold uppercase tracking-wide">
                <Clock className="w-6 h-6 text-purple-400" />
                Initialization Vector
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6 relative z-10">
              {error && (
                <div className="flex items-center gap-3 text-xs text-red-300 p-4 rounded-lg bg-red-950/30 border border-red-500/30 font-mono uppercase">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Updated File Upload Section */}
              <div className="space-y-2">
                <Label className="text-purple-300 text-xs font-bold uppercase tracking-wider">Reference Audio (Optional)</Label>
                <div 
                    onClick={() => { if(fileInputRef.current) fileInputRef.current.click(); }}
                    className="border border-dashed border-slate-600 bg-slate-900/50 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-900/10 transition-all group"
                >
                    <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2 group-hover:text-purple-400 transition-colors" />
                    <p className="text-slate-300 font-bold text-sm uppercase">{file ? file.name : "Select Audio Source"}</p>
                    <p className="text-slate-500 text-[10px] font-mono mt-1">
                        {file ? ">> FILE LOCKED AND READY" : "UPLOAD FOR ENHANCED PREDICTION ACCURACY"}
                    </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2 block">Track Identifier</Label>
                  <Input
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    placeholder="ENTER TRACK TITLE..."
                    className="bg-black/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 font-mono text-sm h-12"
                  />
                </div>
                <div>
                  <Label className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2 block">Artist Identity</Label>
                  <Input
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="ENTER ARTIST NAME..."
                    className="bg-black/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 font-mono text-sm h-12"
                  />
                </div>
              </div>

              {isAnalyzing && (
                <div className="space-y-3 p-4 bg-black/30 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    <p className="text-white font-bold text-xs uppercase tracking-wide">
                      {progress < 30 ? "Analyzing Waveform..." : "Calculating Trajectory..."}
                    </p>
                  </div>
                  <Progress value={progress} className="h-1 bg-slate-800" indicatorClassName="bg-purple-500 shadow-[0_0_10px_#a855f7]" />
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!trackName.trim() || !artistName.trim())}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black tracking-widest text-sm shadow-lg shadow-purple-900/20"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    COMPUTING...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    INITIATE FORECAST
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {showConverter && file && (
          <AudioConverter
            file={file}
            onConversionComplete={handleConversionComplete}
            onCancel={() => {
              setFile(null);
              setShowConverter(false);
              setShowForm(true); 
              setError(null);
            }}
          />
        )}

        {/* RESULTS VIEW */}
        {prediction && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            {/* Chart - CYAN */}
            <Card className="bg-black/60 border border-cyan-500/30 shadow-[0_0_30px_-10px_rgba(6,182,212,0.2)] backdrop-blur-xl rounded-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
              <CardHeader className="border-b border-white/5 bg-white/5 p-6 relative z-10">
                <CardTitle className="text-white font-black uppercase tracking-wide flex items-center gap-2">
                    <LineChartIcon className="w-6 h-6 text-cyan-400" />
                    52-Week Streaming Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative z-10">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="week" stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace'}} />
                    <YAxis stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace'}} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #06b6d4', borderRadius: '8px' }}
                      labelStyle={{ color: '#22d3ee', fontWeight: 'bold', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line 
                        type="monotone" 
                        dataKey="streams" 
                        stroke="#06b6d4" 
                        strokeWidth={3} 
                        dot={false}
                        activeDot={{ r: 6, fill: '#fff', stroke: '#06b6d4' }}
                        filter="drop-shadow(0 0 8px rgba(6,182,212,0.5))"
                    />
                  </LineChart>
                </ResponsiveContainer>
                
                {/* Diagram Injection - Forecasting Model */}
                <div className="mt-4 p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-lg flex items-center gap-3 backdrop-blur-sm">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <div className="flex-1">
                        <p className="text-[10px] text-cyan-300 font-mono uppercase mb-1">Model Visualization:</p>
                        <div className="text-[10px] text-slate-400 border border-slate-700 rounded px-2 py-1 inline-block bg-black/50 font-mono">
                            [Image of time series forecasting model diagram]
                        </div>
                    </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats - MULTI-COLOR */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-black/60 border border-blue-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-900/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">Peak Velocity</p>
                    <p className="text-3xl font-black text-white">WEEK {prediction.peak_week}</p>
                </CardContent>
              </Card>

              <Card className="bg-black/60 border border-green-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-900/20 border border-green-500/30 flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <p className="text-green-300 text-xs font-bold uppercase tracking-wider mb-1">Total Projection</p>
                    <p className="text-3xl font-black text-white">
                        {(prediction.total_projected_streams / 1000000).toFixed(1)}M
                    </p>
                </CardContent>
              </Card>

              <Card className="bg-black/60 border border-purple-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-900/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">Viral Probability</p>
                    <p className="text-3xl font-black text-white">{prediction.viral_probability}%</p>
                    
                    {/* Diagram Tag Injection - Viral Growth */}
                    <div className="mt-3 text-[10px] text-slate-500 border border-slate-700 rounded px-2 py-1 inline-block bg-black/30 font-mono">
                        [Image of viral growth cycle graph]
                    </div>
                </CardContent>
              </Card>
            </div>

            {/* Audio Features if available */}
            {audioFeatures && (
              <Card className="bg-black/60 border border-slate-700 backdrop-blur-md rounded-xl">
                <CardHeader className="border-b border-white/5 bg-white/5 p-4">
                  <CardTitle className="text-white font-bold text-sm uppercase flex items-center gap-2">
                    <FileAudio className="w-4 h-4 text-slate-400" />
                    Input Feature Vectors
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 text-center">
                      <p className="text-slate-400 text-xs font-bold uppercase mb-1">Energy</p>
                      <p className="text-2xl font-black text-white">{audioFeatures.energy.toFixed(1)}<span className="text-sm text-slate-600">/10</span></p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 text-center">
                      <p className="text-slate-400 text-xs font-bold uppercase mb-1">Danceability</p>
                      <p className="text-2xl font-black text-white">{audioFeatures.danceability.toFixed(1)}<span className="text-sm text-slate-600">/10</span></p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 text-center">
                      <p className="text-slate-400 text-xs font-bold uppercase mb-1">Tempo</p>
                      <p className="text-2xl font-black text-white">{audioFeatures.tempo.toFixed(0)} <span className="text-sm text-slate-600">BPM</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={() => {
                  setPrediction(null);
                  setAudioFeatures(null);
                  setFile(null);
                  setTrackName("");
                  setArtistName("");
                  setError(null);
                  setShowForm(true); 
                  window.history.replaceState({}, document.title, window.location.pathname);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-600 h-12 px-8 tracking-widest text-xs"
              >
                RESET PREDICTOR
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}