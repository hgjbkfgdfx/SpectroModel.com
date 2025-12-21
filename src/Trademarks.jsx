import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Lock, Globe, FileText, AlertTriangle, Fingerprint, Brain, Sparkles, Shield, Scale, Cpu, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import { Badge } from "@/components/ui/badge";
import HolographicBackground from "@/components/shared/HolographicBackground";

export default function TrademarksPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0 });

  useEffect(() => {
    blockScriptInjection();
    const cspResult = validateCSP();
    setSecurityStatus({ safe: cspResult.valid, threats: cspResult.violations?.length || 0 });
    
    mlDataCollector.record('trademarks_page_visit', {
       feature: 'legal',
       timestamp: Date.now()
     });
  }, []);

  return (
    // CYBERPUNK BASE - Deep Black/Amber Theme
    <div className="min-h-screen bg-[#020402] text-amber-50 font-mono selection:bg-amber-500/30 selection:text-amber-100 overflow-x-hidden relative">
      
      <HolographicBackground />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-[1]"></div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8 p-4 md:p-8">
        <NetworkErrorBanner />
        <AILearningBanner />
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-amber-500/20 bg-amber-950/10 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="text-amber-400 hover:text-amber-200 hover:bg-amber-900/30 rounded-none border border-amber-500/30 transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                <ShieldCheck className="w-10 h-10 text-amber-500 animate-pulse" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 uppercase">
                    TRADEMARK REGISTRY
                </span>
            </h1>
            <p className="text-amber-400/60 font-mono text-xs mt-2 uppercase tracking-widest">
                Intellectual Property Database • Asset Protection
            </p>
          </div>
          <div className="hidden md:block text-right">
             <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-900/10 font-mono text-[10px] uppercase mb-1 rounded-none">
                STATUS: ENFORCED
            </Badge>
            <p className="text-[10px] text-amber-500/50 font-mono">DOC ID: SP-TM-2025</p>
          </div>
        </div>

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <LiveSecurityDisplay />
             <LiveThreatDisplay />
        </div>

        {/* REGISTERED MARKS - MAIN CONTENT */}
        <Card className="bg-black/60 border border-amber-500/30 shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)] rounded-2xl overflow-hidden backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          
          {/* Big Background Icon */}
          <ShieldCheck className="absolute -right-12 -bottom-12 w-64 h-64 text-amber-500/5 rotate-12 pointer-events-none" />

          <CardHeader className="border-b border-amber-900/20 bg-amber-950/10 p-6 relative z-10">
             <div className="flex items-center justify-between">
                <CardTitle className="text-amber-100 flex items-center gap-3 text-xl font-black uppercase tracking-wide">
                    <FileText className="w-6 h-6 text-amber-400" />
                    Protected Asset Matrix
                </CardTitle>
                
                {/* Diagram Injection - Classification */}
                 <div className="hidden md:block text-[9px] text-amber-400/70 border border-amber-500/30 rounded-sm px-2 py-1 bg-black/30 font-mono">
                     [Image of intellectual property classification system]
                 </div>
             </div>
             <p className="text-amber-500/60 text-xs font-mono mt-2 leading-relaxed">
                &gt;&gt; UNAUTHORIZED USE OF THE FOLLOWING MARKS IS STRICTLY PROHIBITED AND MONITORED BY AUTOMATED LEGAL BOTS.
             </p>
          </CardHeader>
          <CardContent className="p-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-6">
                
                {/* SpectroModel - GOLD */}
                <div className="group relative overflow-hidden p-6 bg-amber-900/10 border border-amber-500/30 rounded-xl hover:bg-amber-900/20 transition-all duration-300 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Shield className="w-6 h-6 text-amber-500" />
                    </div>
                    <h3 className="text-2xl font-black text-amber-100 mb-1 tracking-tight group-hover:text-amber-400 transition-colors">SpectroModel™</h3>
                    <div className="flex gap-2 mb-3">
                        <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/50 font-mono text-[10px] rounded-none">CLASS 9: SOFTWARE</Badge>
                        <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/50 font-mono text-[10px] rounded-none">CLASS 42: SAAS</Badge>
                    </div>
                    <p className="text-amber-200/60 text-xs leading-relaxed font-light">
                        The primary brand identity for our AI-powered music analysis platform. Covers all logos, wordmarks, and distinctive brand elements.
                    </p>
                </div>

                {/* VibeVision - CYAN */}
                <div className="group relative overflow-hidden p-6 bg-cyan-900/10 border border-cyan-500/30 rounded-xl hover:bg-cyan-900/20 transition-all duration-300 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Fingerprint className="w-6 h-6 text-cyan-500" />
                    </div>
                    <h3 className="text-2xl font-black text-cyan-100 mb-1 tracking-tight group-hover:text-cyan-400 transition-colors">VibeVision™</h3>
                    <div className="flex gap-2 mb-3">
                        <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/50 font-mono text-[10px] rounded-none">CLASS 9: ANALYSIS</Badge>
                    </div>
                    <p className="text-cyan-200/60 text-xs leading-relaxed font-light">
                        Proprietary technology for visual representation of audio frequencies, spectrogram generation, and emotion mapping visualization.
                    </p>
                </div>

                {/* NeuroSonic - PURPLE */}
                <div className="group relative overflow-hidden p-6 bg-purple-900/10 border border-purple-500/30 rounded-xl hover:bg-purple-900/20 transition-all duration-300 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Brain className="w-6 h-6 text-purple-500" />
                    </div>
                    <h3 className="text-2xl font-black text-purple-100 mb-1 tracking-tight group-hover:text-purple-400 transition-colors">NeuroSonic™</h3>
                    <div className="flex gap-2 mb-3">
                        <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/50 font-mono text-[10px] rounded-none">CLASS 42: AI NEURAL NET</Badge>
                    </div>
                    <p className="text-purple-200/60 text-xs leading-relaxed font-light">
                        Advanced neural network architecture for audio feature extraction, genre classification, and formative synthesis engines.
                    </p>
                </div>

                {/* SpectroVerse - PINK */}
                <div className="group relative overflow-hidden p-6 bg-pink-900/10 border border-pink-500/30 rounded-xl hover:bg-pink-900/20 transition-all duration-300 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="w-6 h-6 text-pink-500" />
                    </div>
                    <h3 className="text-2xl font-black text-pink-100 mb-1 tracking-tight group-hover:text-pink-400 transition-colors">SpectroVerse™</h3>
                    <div className="flex gap-2 mb-3">
                        <Badge className="bg-pink-500/10 text-pink-300 border-pink-500/50 font-mono text-[10px] rounded-none">CLASS 41: VIRTUAL EVENTS</Badge>
                    </div>
                    <p className="text-pink-200/60 text-xs leading-relaxed font-light">
                        Immersive 3D virtual concert environments, avatar systems, and digital twin technologies for musical performance.
                    </p>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* USAGE GUIDELINES - RED */}
        <Card className="bg-black/60 border border-red-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
            <CardHeader className="border-b border-red-900/20 bg-red-950/10 p-6 relative z-10">
                <CardTitle className="text-red-400 flex items-center gap-3 text-xl font-black uppercase tracking-wide">
                    <Lock className="w-6 h-6 text-red-500" />
                    Restrictive Protocols
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6 relative z-10">
                
                {/* Diagram Injection - Brand Architecture */}
                <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-lg flex flex-col items-center justify-center gap-2">
                     <div className="text-[10px] text-red-400/70 border border-red-500/30 rounded px-2 py-1 bg-black/30 font-mono">
                        [Image of brand identity architecture model]
                    </div>
                    <span className="text-[9px] text-red-500/50 font-mono uppercase">Brand Integrity Structure</span>
                </div>

                <ul className="space-y-3">
                    {[
                        "Affiliation Suggestion Prohibited without License",
                        "Product Naming Infringement Prohibited",
                        "Disparaging or Defamatory Usage Prohibited",
                        "'AI Learns From My Data' Slogan Protected",
                        "CODE AUDITING STRICTLY PROHIBITED (Corporate Espionage Prevention)"
                    ].map((rule, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs text-red-100/80 font-mono">
                            <span className="text-red-500 mt-0.5">&gt;&gt;</span>
                            {rule}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>

        {/* FOOTER WARNING */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-950/20 border border-amber-500/30 rounded-xl mb-4">
             <AlertTriangle className="w-4 h-4 text-amber-500" />
             <span className="text-[10px] text-amber-300 font-bold uppercase tracking-widest">Global Enforcement Active</span>
          </div>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
            © 2025 SpectroModel Inc. All Rights Reserved.
          </p>
        </div>
       </div>
    </div>
  );
}