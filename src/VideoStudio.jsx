import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Sparkles, Brain, Shield, Video, Film, Layers, Activity, AlertTriangle, ExternalLink, Monitor, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from '@/utils';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { base44 } from "@/api/base44Client";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import LimitLocker from "@/components/shared/LimitLocker";
import HolographicBackground from "@/components/shared/HolographicBackground";

export default function VideoStudioPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [loading, setLoading] = useState(true);
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0 });

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializePage = async () => {
      try {
        blockScriptInjection();
        const cspResult = validateCSP();
        if (mounted) {
            setSecurityStatus({ safe: cspResult.valid, threats: cspResult.violations?.length || 0 });
        }

        mlDataCollector.record('video_studio_visit', {
          feature: 'video_studio',
          timestamp: Date.now()
        });
      } catch (error) {
        console.warn('Init error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializePage();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
        <HolographicBackground />
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-purple-500/70 font-mono text-sm tracking-widest animate-pulse mt-4">INITIALIZING RENDER ENGINE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f0520] to-[#050015] font-sans text-cyan-50 selection:bg-purple-500/30 selection:text-purple-100 overflow-x-hidden relative">
      <HolographicBackground />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8 p-4 md:p-8">
        {/* Global banners handled by Layout */}
        <LimitLocker feature="analysis_uploads" featureKey="VIDEO_STUDIO" user={currentUser} />

        {/* HEADER */}
        <div className="flex items-center gap-4 border-b border-white/5 bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <Film className="w-8 h-8 text-purple-500 animate-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-500 to-blue-500">
                VISUAL SYNTHESIS HUB
              </span>
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-wider">
              Generative Video • Frame Interpolation • Neural Rendering
            </p>
          </div>
        </div>

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <LiveSecurityDisplay />
             <LiveThreatDisplay />
        </div>

        {/* MAIN INTERFACE */}
        <Card className="bg-black/60 border border-purple-500/30 shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)] rounded-2xl overflow-hidden backdrop-blur-xl relative">
            
            {/* Big Background Icon */}
            <Video className="absolute -right-12 -bottom-12 w-64 h-64 text-purple-500/5 rotate-12 pointer-events-none" />

            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"></div>
            <CardHeader className="border-b border-white/5 bg-white/5 p-8 relative z-10">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-white text-2xl font-bold uppercase tracking-wide flex items-center gap-3">
                            <Video className="w-6 h-6 text-purple-400" />
                            Generation Protocols
                        </CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8 relative z-10">
                
                {/* Update Notice - Amber */}
                <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                    <div className="space-y-1">
                        <h3 className="text-amber-300 font-bold text-sm uppercase tracking-wide">System Update In Progress</h3>
                        <p className="text-xs text-amber-200/70 font-mono leading-relaxed">
                            &gt;&gt; NATIVE SPECTROMODEL VIDEO GENERATION MODULE IS COMPILING... <br/>
                            &gt;&gt; CURRENT PROTOCOL: EXTERNAL REDIRECTION TO GOOGLE LABS.
                        </p>
                    </div>
                </div>

                {/* Architecture Diagram - Cyan/Purple */}
                <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-lg flex items-center gap-4 shadow-sm backdrop-blur-sm">
                    <Layers className="w-8 h-8 text-cyan-400" />
                    <div className="flex-1">
                        <h4 className="text-purple-300 font-bold text-xs uppercase mb-1">Neural Architecture Visualization</h4>
                        <p className="text-slate-400 text-xs mb-2">Latent space diffusion & temporal consistency layers.</p>
                        <div className="text-[10px] text-cyan-400/70 border border-cyan-500/30 rounded px-2 py-1 bg-black/30 font-mono inline-block">
                            [Image of neural network architecture diagram]
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Veo 2.0 - Blue */}
                    <Button
                        onClick={() => {
                            mlDataCollector.record('veo_studio_opened', {
                                feature: 'video_studio',
                                platform: 'Google Veo 2.0',
                                timestamp: Date.now()
                            });
                            window.open('https://aistudio.google.com/prompts/new_video?model=veo-2.0-generate-001', '_blank');
                        }}
                        className="h-32 bg-blue-900/20 border border-blue-500/30 hover:bg-blue-600 hover:border-blue-400 group relative overflow-hidden transition-all duration-300 backdrop-blur-sm"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex flex-col items-center gap-3 relative z-10">
                            <Zap className="w-8 h-8 text-blue-400 group-hover:text-white transition-colors" />
                            <div className="text-center">
                                <span className="block text-lg font-black text-white uppercase tracking-widest">Veo 2.0 Studio</span>
                                <span className="text-[10px] text-blue-300 font-mono group-hover:text-blue-100">TEXT-TO-VIDEO GENERATION</span>
                            </div>
                        </div>
                        <ExternalLink className="absolute top-4 right-4 w-4 h-4 text-blue-500 opacity-50 group-hover:opacity-100" />
                    </Button>

                    {/* Google Flow - Orange */}
                    <Button
                        onClick={() => {
                            mlDataCollector.record('google_flow_opened', {
                                feature: 'video_studio',
                                platform: 'Google Flow',
                                timestamp: Date.now()
                            });
                            window.open('https://labs.google/fx/tools/flow', '_blank');
                        }}
                        className="h-32 bg-orange-900/20 border border-orange-500/30 hover:bg-orange-600 hover:border-orange-400 group relative overflow-hidden transition-all duration-300 backdrop-blur-sm"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex flex-col items-center gap-3 relative z-10">
                            <Sparkles className="w-8 h-8 text-orange-400 group-hover:text-white transition-colors" />
                            <div className="text-center">
                                <span className="block text-lg font-black text-white uppercase tracking-widest">Google Flow</span>
                                <span className="text-[10px] text-orange-300 font-mono group-hover:text-orange-100">IMAGE-TO-VIDEO ANIMATION</span>
                            </div>
                        </div>
                        <ExternalLink className="absolute top-4 right-4 w-4 h-4 text-orange-500 opacity-50 group-hover:opacity-100" />
                    </Button>
                </div>

                {/* Tech Specs */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-center flex items-center justify-center gap-3 backdrop-blur-sm">
                         <Monitor className="w-5 h-5 text-cyan-500" />
                         <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Output Resolution</p>
                            <p className="text-sm font-mono text-cyan-300">1080p / 4K (Upscaled)</p>
                         </div>
                    </div>
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-center flex items-center justify-center gap-3 backdrop-blur-sm">
                         <Cpu className="w-5 h-5 text-purple-500" />
                         <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Frame Rate</p>
                            <p className="text-sm font-mono text-purple-300">24fps / 60fps</p>
                         </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}