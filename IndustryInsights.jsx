import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, BarChart3, Users, Globe, Briefcase, DollarSign, Target, Zap, Music, Sparkles, Cpu, Radio, Headphones, Shield, Brain, Radar, LineChart, PieChart, BarChart4, Banknote, Crosshair, Users2, Building2, Flame, Music2, Stars, ArrowUpRight, Microchip, Link, Signal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import LimitLocker from "@/components/shared/LimitLocker";
import { base44 } from "@/api/base44Client";

export default function IndustryInsightsPage() {
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

      mlDataCollector.record('industry_insights_page_visit', {
        feature: 'industry_insights',
        security: { safe: cspResult.valid, threats: cspResult.violations?.length || 0 },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Security init failed:', error);
    }

    return () => {
      mounted = false;
      const sessionDuration = Date.now() - sessionStartTime;
      mlDataCollector.record('industry_insights_session_end', {
        feature: 'industry_insights',
        sessionDuration,
        timestamp: Date.now()
      });
    };
  }, []);

  const marketResearch = [
    {
      title: "Global Music Streaming Market 2024",
      description: "Comprehensive analysis of streaming platforms, user behavior, and revenue trends",
      icon: Radar,
      color: "from-cyan-600 to-blue-600",
      url: "https://www.statista.com/topics/1594/music-streaming/"
    },
    {
      title: "Billboard Chart Analytics",
      description: "Current chart positions, emerging trends, and historical data analysis",
      icon: LineChart,
      color: "from-fuchsia-600 to-pink-600",
      url: "https://www.billboard.com/charts/"
    },
    {
      title: "Music Industry Demographics",
      description: "Target audience insights, generational preferences, and consumption patterns",
      icon: PieChart,
      color: "from-emerald-600 to-teal-600",
      url: "https://www.nielsen.com/insights/2024/music-360-report/"
    },
    {
      title: "Spotify & Apple Music Data",
      description: "Latest playlist algorithms, discovery features, and platform updates",
      icon: BarChart4,
      color: "from-orange-600 to-red-600",
      url: "https://newsroom.spotify.com/"
    }
  ];

  const businessInsights = [
    {
      title: "Music Licensing & Publishing",
      description: "Revenue streams, sync licensing opportunities, and publishing deals",
      icon: Banknote,
      color: "from-green-600 to-lime-600",
      url: "https://www.ascap.com/help/music-business-101"
    },
    {
      title: "Artist Revenue Models",
      description: "Streaming royalties, touring income, merchandise, and brand partnerships",
      icon: Crosshair,
      color: "from-violet-600 to-purple-600",
      url: "https://www.digitalmusicnews.com/"
    },
    {
      title: "Music Marketing Strategies",
      description: "Social media campaigns, TikTok marketing, and influencer partnerships",
      icon: Users2,
      color: "from-sky-600 to-indigo-600",
      url: "https://blog.hootsuite.com/music-marketing/"
    },
    {
      title: "Industry Investment & Funding",
      description: "Label deals, independent funding, and venture capital in music tech",
      icon: Building2,
      color: "from-amber-600 to-yellow-600",
      url: "https://www.musicbusinessworldwide.com/"
    }
  ];

  const trends = [
    {
      title: "TikTok & Viral Music Trends",
      description: "Current viral sounds, trending hashtags, and breakout artists",
      icon: Flame,
      color: "from-rose-600 to-red-600",
      url: "https://www.tiktok.com/music"
    },
    {
      title: "Genre Evolution & Crossovers",
      description: "Emerging genres, fusion trends, and cross-genre collaborations",
      icon: Music2,
      color: "from-indigo-600 to-violet-600",
      url: "https://www.complex.com/music/"
    },
    {
      title: "Production Trends & Techniques",
      description: "Popular sounds, mixing styles, and production innovations",
      icon: Stars,
      color: "from-cyan-600 to-sky-600",
      url: "https://www.soundonsound.com/techniques"
    },
    {
      title: "Chart Performance Analysis",
      description: "Billboard, Spotify, and Apple Music chart movements and predictions",
      icon: ArrowUpRight,
      color: "from-emerald-600 to-green-600",
      url: "https://www.billboard.com/charts/hot-100/"
    }
  ];

  const advancements = [
    {
      title: "AI in Music Production",
      description: "Latest AI tools, stem separation, mastering algorithms, and composition AI",
      icon: Microchip,
      color: "from-purple-600 to-fuchsia-600",
      url: "https://www.soundonsound.com/techniques/ai-music-production"
    },
    {
      title: "Spatial Audio & Dolby Atmos",
      description: "3D audio technology, immersive sound, and spatial mixing techniques",
      icon: Headphones,
      color: "from-blue-600 to-indigo-600",
      url: "https://www.apple.com/newsroom/2021/05/apple-music-announces-spatial-audio-and-lossless-audio/"
    },
    {
      title: "Blockchain & Music NFTs",
      description: "Web3 music platforms, NFT releases, and decentralized royalties",
      icon: Link,
      color: "from-orange-600 to-amber-600",
      url: "https://www.digitalmusicnews.com/tag/nft/"
    },
    {
      title: "Next-Gen Streaming Tech",
      description: "Lossless audio, personalized algorithms, and platform innovations",
      icon: Signal,
      color: "from-teal-600 to-emerald-600",
      url: "https://newsroom.spotify.com/company-info/"
    }
  ];

  const renderSection = (title, items) => (
    <div className="mb-12">
      <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4 font-serif italic">
        <div className="h-1 w-16 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"></div>
        {title}
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className="bg-black/40 backdrop-blur-xl border border-slate-800 hover:border-purple-500/50 shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader className="p-6 pb-2">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white drop-shadow-md" />
                </div>
                <CardTitle className="text-white text-lg font-bold font-serif italic tracking-wide">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <p className="text-slate-400 text-sm mb-6 font-mono leading-relaxed">{item.description}</p>
                <Button
                  onClick={() => window.open(item.url, '_blank')}
                  className={`w-full bg-gradient-to-r ${item.color} font-bold shadow-md hover:shadow-xl transition-all uppercase tracking-wider text-xs py-5`}
                  size="sm"
                >
                  View More
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8">
      <LimitLocker feature="market_fit" featureKey="INDUSTRY_INSIGHTS" user={user} />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Industry Insights & Research
            </h1>
            <p className="text-slate-400 mt-2">Comprehensive music industry data, trends, and technology advancements</p>
          </div>
        </div>

        <Card className={`rounded-xl overflow-hidden border shadow-lg ${securityStatus.safe ? 'bg-black/40 backdrop-blur-xl border-green-900/30 shadow-green-900/10' : 'bg-black/40 backdrop-blur-xl border-red-900/30 shadow-red-900/10'} mb-6`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className={`w-5 h-5 ${securityStatus.safe ? 'text-green-400' : 'text-red-400'}`} />
                <div>
                  <p className="text-white font-bold text-sm font-mono">🛡️ Security Active • AI Learning Enabled</p>
                  <p className="text-xs text-slate-400 font-mono">
                    {securityStatus.safe ? `All links verified • ML complexity: ${securityStatus.mlComplexity.toFixed(1)}` : `${securityStatus.threats} blocked`}
                  </p>
                </div>
              </div>
              <Badge className={securityStatus.safe ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}>
                {securityStatus.safe ? 'SAFE' : 'ALERT'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-l-4 border-l-cyan-500 border-y-0 border-r-0 shadow-2xl shadow-cyan-900/20 rounded-xl overflow-hidden relative group hover:shadow-cyan-500/10 transition-all duration-500 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/30 via-transparent to-transparent opacity-100" />
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-cyan-400 shrink-0 animate-pulse" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm font-mono">🤖 AI Learns From Your Data</p>
                <p className="text-xs text-cyan-400/80 break-words font-mono">
                  Industry insight learning • Browser-based • Security protected
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {renderSection("Market Research", marketResearch)}
        {renderSection("Business Insights", businessInsights)}
        {renderSection("Music Trends", trends)}
        {renderSection("Technology Advancements", advancements)}
      </div>
    </div>
  );
}