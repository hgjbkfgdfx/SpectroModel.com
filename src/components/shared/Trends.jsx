import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Zap, Music, Sparkles, ExternalLink, Activity, Radio, BarChart2 } from "lucide-react";
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

export default function TrendsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const mlDataCollector = useMLDataCollector();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    
    // Log page visit
    mlDataCollector.record('trends_page_visit', {
      feature: 'trends_analysis',
      timestamp: Date.now()
    });
  }, []);

  const trends = [
    {
      title: "Viral Velocity & Social Graph",
      description: "Real-time analysis of TikTok sound propagation, hashtag momentum, and influencer breakout vectors.",
      icon: Zap,
      color: "text-pink-400",
      borderColor: "border-pink-500/30",
      url: "https://www.tiktok.com/music",
      hasDiagram: true // Flag for diagram
    },
    {
      title: "Genre Fusion & Sonic Evolution",
      description: "Tracking the emergence of micro-genres (e.g., Hyperpop, Phonk) and cross-cultural production techniques.",
      icon: Music,
      color: "text-purple-400",
      borderColor: "border-purple-500/30",
      url: "https://www.complex.com/music/"
    },
    {
      title: "Production Meta & Audio Tech",
      description: "Analysis of trending mixing styles, VST usage patterns, and spatial audio adoption rates.",
      icon: Sparkles,
      color: "text-blue-400",
      borderColor: "border-blue-500/30",
      url: "https://www.soundonsound.com/"
    },
    {
      title: "Algorithmic Chart Prediction",
      description: "Predictive modeling of Billboard Hot 100 movements based on streaming velocity and playlist adds.",
      icon: TrendingUp,
      color: "text-green-400",
      borderColor: "border-green-500/30",
      url: "https://chartmetric.com/charts"
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
                    feature: 'trends_analysis',
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
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-pulse">
                  PREDICTIVE TRENDS
                </span>
              </h1>
              <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
                Pattern Recognition & Future Signal Analysis
              </p>
            </div>
          </div>
        </div>

        {/* SECURITY & THREAT DISPLAY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiveSecurityDisplay />
            <LiveThreatDisplay />
        </div>

        {/* TRENDS GRID */}
        <div className="grid md:grid-cols-2 gap-6">
          {trends.map((trend, index) => {
            const Icon = trend.icon;
            return (
              <Card key={index} className={`bg-black/40 border ${trend.borderColor} shadow-[0_0_20px_-5px_rgba(0,0,0,0.3)] backdrop-blur-md rounded-2xl overflow-hidden hover:bg-black/60 transition-all duration-300 group relative min-h-[300px]`}>
                
                {/* Big Background Icon */}
                <Icon className={`absolute -right-8 -bottom-8 w-40 h-40 ${trend.color} opacity-5 rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700 pointer-events-none`} />

                <CardHeader className="p-6 border-b border-white/5 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-slate-900/50 border ${trend.borderColor}`}>
                      <Icon className={`w-6 h-6 ${trend.color}`} />
                    </div>
                    <Badge variant="outline" className={`font-mono text-xs ${trend.color} border-${trend.color.split('-')[1]}-500/30`}>
                      RISING SIGNAL
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-xl font-bold mt-4 uppercase tracking-wide">
                    {trend.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 relative z-10">
                  <p className="text-slate-400 mb-6 text-sm leading-relaxed font-light">
                    {trend.description}
                  </p>

                  {/* Diagram Injection for Viral Trends */}
                  {trend.hasDiagram && (
                    <div className="mb-6 p-4 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center gap-3">
                        <BarChart2 className="w-5 h-5 text-pink-400" />
                        <div className="flex-1">
                            <p className="text-[10px] text-pink-300 font-mono uppercase mb-1">Growth Mechanics:</p>
                            <div className="text-[10px] text-slate-500 border border-slate-700 rounded px-2 py-1 inline-block bg-black/50">
                                [Image of viral growth cycle graph]
                            </div>
                        </div>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                        window.open(trend.url, '_blank');
                        mlDataCollector.record('trend_resource_clicked', {
                            feature: 'trends_analysis',
                            title: trend.title,
                            timestamp: Date.now()
                        });
                    }}
                    className="w-full bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-600 font-mono text-xs h-10 tracking-widest group-hover:border-cyan-500/50 transition-colors backdrop-blur-sm"
                  >
                    ANALYZE VECTOR <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FOOTER INFO */}
        <div className="flex items-center justify-center p-4 bg-pink-950/10 border border-pink-500/20 rounded-lg mt-8 backdrop-blur-sm">
          <p className="text-xs text-pink-400 text-center font-mono flex items-center gap-2">
            <Radio className="w-4 h-4 animate-pulse" />
            &gt;&gt; MONITORING GLOBAL FREQUENCIES: UPDATES LIVE
          </p>
        </div>
      </div>
    </div>
  );
}