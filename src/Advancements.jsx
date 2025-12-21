import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cpu, Zap, Radio, Headphones, ExternalLink, Activity, Layers, Disc } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LimitLocker from "@/components/shared/LimitLocker";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import HolographicBackground from "@/components/shared/HolographicBackground";

export default function AdvancementsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const mlDataCollector = useMLDataCollector();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    
    // Log page visit
    mlDataCollector.record('advancements_page_visit', {
      feature: 'tech_advancements',
      timestamp: Date.now()
    });
  }, []);

  const advancements = [
    {
      title: "Generative AI Production",
      description: "Neural synthesis, stem separation algorithms, and automated mastering chains transforming studio workflows.",
      icon: Cpu,
      color: "text-purple-400",
      borderColor: "border-purple-500/30",
      url: "https://www.musictech.net/news/ai-music/"
    },
    {
      title: "Spatial Audio & Atmos",
      description: "Object-based mixing environments allowing for 360-degree sound placement beyond stereo limitations.",
      icon: Headphones,
      color: "text-blue-400",
      borderColor: "border-blue-500/30",
      url: "https://www.apple.com/newsroom/2021/05/apple-music-announces-spatial-audio-and-lossless-audio/",
      hasDiagram: true // Diagram flag
    },
    {
      title: "Decentralized Rights (Web3)",
      description: "Blockchain ledgers for transparent royalty distribution and NFT-gated fan communities.",
      icon: Zap,
      color: "text-orange-400",
      borderColor: "border-orange-500/30",
      url: "https://www.musicbusinessworldwide.com/category/nfts/"
    },
    {
      title: "Lossless Streaming Codecs",
      description: "Next-generation compression protocols delivering studio-quality audio over standard cellular networks.",
      icon: Radio,
      color: "text-green-400",
      borderColor: "border-green-500/30",
      url: "https://about.spotify.com/newsroom/"
    }
  ];

  return (
    // CYBERPUNK BASE
    <div className="min-h-screen bg-[#030014] text-cyan-50 font-sans selection:bg-purple-500/30 selection:text-purple-100 overflow-x-hidden relative">
      
      <HolographicBackground />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-[1]"></div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8 p-4 md:p-8">
        <NetworkErrorBanner />
        <AILearningBanner />
        <LimitLocker feature="market_fit" featureKey="INDUSTRY_INSIGHTS" user={user} />

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/5 bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                mlDataCollector.record('navigation_back', {
                    feature: 'tech_advancements',
                    destination: 'Dashboard',
                    timestamp: Date.now()
                });
                navigate(createPageUrl("Dashboard"));
              }}
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-full transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse">
                  FUTURE TECH
                </span>
              </h1>
              <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
                R&D Labs: Emerging Audio Technologies
              </p>
            </div>
          </div>
        </div>

        {/* SECURITY & THREAT DISPLAY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiveSecurityDisplay />
            <LiveThreatDisplay />
        </div>

        {/* ADVANCEMENTS GRID */}
        <div className="grid md:grid-cols-2 gap-6">
          {advancements.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className={`bg-black/40 border ${item.borderColor} shadow-[0_0_20px_-5px_rgba(0,0,0,0.3)] backdrop-blur-md rounded-2xl overflow-hidden hover:bg-black/60 transition-all duration-300 group relative min-h-[300px]`}>
                
                {/* Big Background Icon */}
                <Icon className={`absolute -right-8 -bottom-8 w-40 h-40 ${item.color} opacity-5 rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700 pointer-events-none`} />

                <CardHeader className="p-6 border-b border-white/5 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-slate-900/50 border ${item.borderColor}`}>
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <Badge variant="outline" className={`font-mono text-xs ${item.color} border-${item.color.split('-')[1]}-500/30`}>
                      BETA ACCESS
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-xl font-bold mt-4 uppercase tracking-wide">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 relative z-10">
                  <p className="text-slate-400 mb-6 text-sm leading-relaxed font-light">
                    {item.description}
                  </p>

                  {/* Diagram Injection for Spatial Audio */}
                  {item.hasDiagram && (
                    <div className="mb-6 p-4 bg-blue-950/20 border border-blue-500/20 rounded-xl flex items-start gap-4">
                        <Layers className="w-6 h-6 text-blue-400 mt-1" />
                        <div className="space-y-2 w-full">
                            <h4 className="text-blue-300 text-sm font-bold uppercase">3D Soundstage Mapping</h4>
                            <div className="text-[10px] text-blue-400/70 border border-blue-500/30 rounded px-3 py-2 bg-black/40 font-mono inline-block">
                                
                            </div>
                            <p className="text-[10px] text-slate-500 italic">Object-based rendering vs. Channel-based</p>
                        </div>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                        window.open(item.url, '_blank');
                        mlDataCollector.record('tech_resource_clicked', {
                            feature: 'tech_advancements',
                            title: item.title,
                            timestamp: Date.now()
                        });
                    }}
                    className="w-full bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-600 font-mono text-xs h-10 tracking-widest group-hover:border-purple-500/50 transition-colors backdrop-blur-sm"
                  >
                    INITIALIZE RESEARCH <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FOOTER INFO */}
        <div className="flex items-center justify-center p-4 bg-indigo-950/10 border border-indigo-500/20 rounded-lg mt-8 backdrop-blur-sm">
          <p className="text-xs text-indigo-400 text-center font-mono flex items-center gap-2">
            <Disc className="w-4 h-4" />
            &gt;&gt; SYSTEM UPDATE: NEXT-GEN PROTOCOLS LOADED
          </p>
        </div>
      </div>
    </div>
  );
}