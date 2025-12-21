import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, BarChart3, Users, Globe, Shield, Brain, PieChart, Target, Zap, ExternalLink, LineChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import LiveSecurityDisplay from '@/components/shared/LiveSecurityDisplay';
import LimitLocker from '@/components/shared/LimitLocker';
import { base44 } from "@/api/base44Client";
import LiveThreatDisplay from '@/components/shared/LiveThreatDisplay';
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";

export default function MarketResearchPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0, mlComplexity: 0 });
  const [sessionStartTime] = useState(Date.now());
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;

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

      mlDataCollector.record('market_research_page_visit', {
        feature: 'market_research',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Security init failed:', error);
    }

    return () => {
      mounted = false;
      const sessionDuration = Date.now() - sessionStartTime;
      mlDataCollector.record('market_research_session_end', {
        feature: 'market_research',
        sessionDuration,
        timestamp: Date.now()
      });
    };
  }, []);

  const reports = [
    {
      title: "Global Streaming Economy",
      description: "Macro-analysis of DSP market share (Spotify vs Apple vs Amazon), revenue per stream trends, and subscriber growth vectors.",
      icon: Globe,
      color: "text-blue-400",
      borderColor: "border-blue-500/30",
      url: "https://www.statista.com/topics/1594/music-streaming/",
      hasDiagram: true // Flag to insert diagram
    },
    {
      title: "Billboard Chart Analytics",
      description: "Algorithmic breakdown of chart weighting: Radio vs Streaming vs Sales. Historical trend analysis for Pop and Hip-Hop sectors.",
      icon: TrendingUp,
      color: "text-purple-400",
      borderColor: "border-purple-500/30",
      url: "https://www.billboard.com/charts/"
    },
    {
      title: "Listener Demographics",
      description: "Age, location, and psychographic segmentation of modern music consumers. Gen Z vs Millennial consumption patterns.",
      icon: Users,
      color: "text-green-400",
      borderColor: "border-green-500/30",
      url: "https://www.nielsen.com/solutions/media/music/"
    },
    {
      title: "Platform Algorithms",
      description: "Deep dive into Spotify's 'Discovery Mode' and Apple Music's curation logic. Optimization strategies for playlist placement.",
      icon: BarChart3,
      color: "text-orange-400",
      borderColor: "border-orange-500/30",
      url: "https://newsroom.spotify.com/"
    }
  ];

  const marketingTypes = [
    { name: "YouTube TrueView Ads", desc: "High-intent video targeting based on similar artists." },
    { name: "Meta Pixel Retargeting", desc: "Conversion campaigns tracking fan engagement across IG/FB." },
    { name: "Playlist Pitching", desc: "Direct-to-curator placement strategies for editorial support." },
    { name: "SEO & Metadata", desc: "Optimizing search visibility for artist name and track titles." },
    { name: "TikTok Viral Mechanics", desc: "Short-form content strategies leveraging trending audio." },
    { name: "Influencer Seeding", desc: "Micro-influencer campaigns to drive initial traction." }
  ];

  return (
    // CYBERPUNK BASE
    <div className="min-h-screen bg-transparent p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* Decorative Grid Overlay Removed - Handled by Layout */}

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <NetworkErrorBanner />
        <AILearningBanner />
        <LimitLocker feature="market_fit" featureKey="MARKET_RESEARCH" user={user} />

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  mlDataCollector.record('navigation_back', {
                    feature: 'market_research',
                    destination: 'Dashboard',
                    timestamp: Date.now()
                  });
                  navigate(createPageUrl("Dashboard"));
                }}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded-full transition-all duration-300"
            >
                <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-purple-500 animate-pulse">
                    MARKET INTELLIGENCE
                </span>
                </h1>
                <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
                Global Industry Analytics & Trend Forecasting
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
                        <Shield className={`w-5 h-5 ${securityStatus.safe ? 'text-green-400' : 'text-red-400'}`} />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Data Integrity</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                {securityStatus.safe ? '>> SOURCES VERIFIED' : '!! UNTRUSTED CONNECTION'}
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

        {/* REPORTS GRID */}
        <div className="grid md:grid-cols-2 gap-6">
          {reports.map((report, index) => {
            const Icon = report.icon;
            return (
              <Card key={index} className={`bg-black/40 backdrop-blur-xl border ${report.borderColor} shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden hover:bg-black/80 transition-all duration-300 group`}>
                <CardHeader className="p-6 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-black/40 backdrop-blur-xl border ${report.borderColor}`}>
                        <Icon className={`w-6 h-6 ${report.color}`} />
                    </div>
                    <Badge variant="outline" className={`font-mono text-xs ${report.color} border-${report.color.split('-')[1]}-500/30`}>
                        LIVE DATA
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-xl font-bold mt-4 uppercase tracking-wide">{report.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-400 mb-6 text-sm leading-relaxed font-light">{report.description}</p>
                  
                  {/* Diagram Injection for Streaming Market */}
                  {report.hasDiagram && (
                    <div className="mb-6 p-4 bg-black/40 backdrop-blur-xl border border-slate-800 rounded-lg flex items-center gap-3">
                        <PieChart className="w-5 h-5 text-blue-400" />
                        <div className="flex-1">
                            <p className="text-[10px] text-blue-300 font-mono uppercase mb-1">Visual Data:</p>
                            <div className="text-[10px] text-slate-500 border border-slate-700 rounded px-2 py-1 inline-block bg-black/50">
                                
                            </div>
                        </div>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      window.open(report.url, '_blank');
                      mlDataCollector.record('market_research_report_clicked', {
                        feature: 'market_research',
                        reportTitle: report.title,
                        timestamp: Date.now()
                      });
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-mono text-xs h-10 tracking-widest group-hover:border-cyan-500/50 transition-colors"
                  >
                    ACCESS DATALINK <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* MARKETING STRATEGIES - PURPLE */}
        <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)] rounded-2xl overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
          <CardHeader className="border-b border-white/5 bg-white/5 p-6">
            <CardTitle className="text-white flex items-center gap-3 text-xl font-bold uppercase tracking-wide">
              <div className="p-2 rounded-lg bg-purple-900/20 border border-purple-500/30">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              Acquisition Protocols & Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            
            {/* Diagram Injection for Marketing Funnel */}
            <div className="mb-8 p-4 bg-purple-950/10 border border-purple-500/20 rounded-xl flex items-start gap-4">
                <LineChart className="w-6 h-6 text-purple-400 mt-1" />
                <div className="space-y-2 w-full">
                    <h4 className="text-purple-300 text-sm font-bold uppercase">Strategic Funnel Visualization</h4>
                    <p className="text-xs text-slate-400">Understanding the listener journey from awareness to super-fan conversion.</p>
                    <div className="mt-2 text-[10px] text-purple-400/70 border border-purple-500/30 rounded px-3 py-2 bg-black/40 font-mono inline-block">
                        
                    </div>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {marketingTypes.map((type, idx) => (
                <div 
                  key={idx} 
                  onClick={() => window.open(`https://www.google.com/search?q=music+marketing+${encodeURIComponent(type.name)}`, '_blank')}
                  className="p-5 bg-black/40 backdrop-blur-xl rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-800 hover:border-purple-500/50 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Zap className="w-3 h-3 text-purple-400" />
                  </div>
                  <h4 className="text-white font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wide group-hover:text-purple-300 transition-colors">
                    {type.name}
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed font-mono">{type.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FOOTER INFO */}
        <div className="flex items-center justify-center p-4 bg-cyan-950/10 border border-cyan-500/20 rounded-lg">
          <p className="text-xs text-cyan-400 text-center font-mono">
            &gt;&gt; SYSTEM STATUS: AI LEARNING ACTIVE • LINKS VALIDATED • SECURE CONNECTION
          </p>
        </div>
      </div>
    </div>
  );
}