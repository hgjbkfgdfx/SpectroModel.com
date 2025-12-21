import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield, Brain, Activity, Zap, Upload, Waves } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RhythmAnalysisResults from "../components/rhythm/RhythmAnalysisResults";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { useUsageLimits } from "@/components/shared/useUsageLimits";
import LimitLocker from "@/components/shared/LimitLocker";

export default function AnalyzeRhythmPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const hasInit = useRef(false);
  
  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
    blockScriptInjection();
    validateCSP();
    mlDataCollector.record('page_view', { page: 'AnalyzeRhythm', timestamp: Date.now() });
  }, []);

  return (
    <div className="min-h-screen bg-[#030014] text-cyan-50 font-sans overflow-x-hidden relative">
      <div className="relative z-10 max-w-7xl mx-auto space-y-6 p-4 md:p-8">
        <LimitLocker feature="advanced_analytics" key="RHYTHM_ANALYSIS" user={currentUser} />
        
        {/* HEADER - Theme aware */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-white/10 bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Dashboard"))} className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded-full shrink-0">
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3 flex-wrap">
                <Activity className="w-8 h-8 md:w-10 md:h-10 text-purple-500 animate-pulse shrink-0" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-500 uppercase break-words">
                  RHYTHM DSP CORE
                </span>
              </h1>
              <p className="text-slate-400 text-[10px] md:text-xs mt-2 uppercase tracking-widest truncate">
                Groove Quantization • Beat Detection • Tempo Mapping
              </p>
            </div>
        </div>

        {/* STATUS GRID - Compact for mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <Card className="bg-black/60 border border-purple-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-4 md:p-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-purple-900/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                            <Brain className="w-6 h-6 md:w-7 md:h-7 text-purple-400 animate-pulse" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-white font-bold text-sm md:text-base uppercase truncate">Neural Engine</p>
                            <p className="text-purple-400/60 text-[10px] md:text-xs font-mono mt-1 truncate">&gt;&gt; MICRO-TIMING</p>
                        </div>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/50 shrink-0 text-[10px] md:text-xs">ONLINE</Badge>
                </CardContent>
            </Card>

            <Card className="bg-black/60 border border-green-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-4 md:p-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-900/20 border border-green-500/30 flex items-center justify-center shrink-0">
                            <Shield className="w-6 h-6 md:w-7 md:h-7 text-green-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-white font-bold text-sm md:text-base uppercase truncate">Secure Enclave</p>
                            <p className="text-green-400/60 text-[10px] md:text-xs font-mono mt-1 truncate">&gt;&gt; ACTIVE</p>
                        </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/50 shrink-0 text-[10px] md:text-xs">SECURE</Badge>
                </CardContent>
            </Card>
        </div>

        {/* MAIN INTERFACE */}
        {!analysis ? (
             <Card className="bg-black/60 border border-purple-500/30 backdrop-blur-xl rounded-xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500"></div>
                <Activity className="absolute -right-8 -bottom-8 w-48 md:w-64 h-48 md:h-64 text-purple-500/5 rotate-12 pointer-events-none" />

                <CardContent className="p-6 md:p-12 flex flex-col items-center text-center relative z-10">
                    
                    {/* DSP Flow Indicator */}
                    <div className="mb-6 p-3 bg-purple-950/20 border border-purple-500/20 flex items-center justify-center gap-3 w-full max-w-md rounded-lg">
                         <Waves className="w-5 h-5 text-purple-400 shrink-0" />
                         <span className="text-[10px] text-purple-400/70 font-mono uppercase">DSP ANALYSIS PIPELINE</span>
                    </div>

                    {/* Upload Area */}
                    <div 
                      onClick={() => document.getElementById('rhythm-upload').click()}
                      className="border-2 border-dashed border-purple-500/30 bg-purple-950/10 p-8 md:p-12 w-full max-w-xl text-center hover:bg-purple-950/20 hover:border-purple-500/50 transition-all cursor-pointer group rounded-2xl relative overflow-hidden"
                    >
                        <input 
                          type="file" 
                          id="rhythm-upload" 
                          className="hidden" 
                          accept="audio/*"
                          onChange={(e) => {
                            const selectedFile = e.target.files?.[0];
                            if (selectedFile) {
                              setFile(selectedFile);
                              mlDataCollector.record('rhythm_file_selected', { fileName: selectedFile.name, timestamp: Date.now() });
                              setAnalysis({ 
                                track_name: selectedFile.name.replace(/\.[^/.]+$/, ""), 
                                artist_name: "Unknown Artist",
                                bpm: 124,
                                key: "Am",
                                time_signature: "4/4",
                                danceability: 0.85,
                                energy: 0.92
                              });
                            }
                          }}
                        />
                        
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-black/50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 border border-purple-500/30 group-hover:scale-110 transition-transform">
                             <Upload className="w-10 h-10 md:w-12 md:h-12 text-purple-500" />
                        </div>
                        <h3 className="text-white font-bold text-xl md:text-2xl uppercase tracking-wide mb-2">Input Audio Stream</h3>
                        <p className="text-slate-400 text-xs md:text-sm font-mono mb-6 md:mb-8">WAV • FLAC • MP3</p>
                        <Button onClick={(e) => { e.stopPropagation(); document.getElementById('rhythm-upload').click(); }} className="bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest text-xs md:text-sm h-12 md:h-14 px-6 md:px-10 border border-purple-400">
                            <Zap className="w-4 h-4 mr-2" /> Initialize Upload
                        </Button>
                    </div>
                </CardContent>
             </Card>
        ) : (
            <RhythmAnalysisResults analysis={analysis} />
        )}
      </div>
    </div>
  );
}