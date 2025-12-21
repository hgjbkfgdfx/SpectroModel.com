import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, BookOpen, Music, Calendar, Activity, BarChart2, Globe, Database, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";

export default function MarketFitResearchPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();

  useEffect(() => {
    try {
      blockScriptInjection();
      validateCSP();
      
      mlDataCollector.record('market_fit_research_visit', {
        feature: 'market_fit_research',
        timestamp: Date.now()
      });
    } catch (err) {
      console.error("Security initialization failed:", err);
    }
  }, []);

  const genreHistories = [
    {
      genre: "Pop",
      emoji: "🎵",
      history: "Emerging in the 1950s from rock & roll, evolving through disco (70s), synth-pop (80s), and modern EDM fusion (2010s). Characterized by high commercial appeal.",
      characteristics: "Tempo: 100-130 BPM | Loudness: -6 to -8 LUFS | High Danceability | Verse-Chorus Structure",
      color: "text-pink-400",
      border: "border-pink-500/30"
    },
    {
      genre: "Hip-Hop",
      emoji: "🎤",
      history: "Originated in 1970s Bronx. Evolved from breakbeat to boom-bap (90s) and trap (2010s). Dominant global genre.",
      characteristics: "Tempo: 60-90 BPM (Trap) / 85-115 BPM (Boom Bap) | Heavy 808s | High Speechiness",
      color: "text-purple-400",
      border: "border-purple-500/30"
    },
    {
      genre: "R&B",
      emoji: "💜",
      history: "Roots in jazz/gospel/blues. Evolved through Motown soul to contemporary R&B. Focus on vocal performance.",
      characteristics: "Tempo: 60-120 BPM | High Valence | Smooth Vocals | Complex Harmonies",
      color: "text-blue-400",
      border: "border-blue-500/30"
    },
    {
      genre: "Country",
      emoji: "🤠",
      history: "Roots in Appalachian folk. Evolved from honky-tonk to the polished Nashville Sound and modern Country-Pop.",
      characteristics: "Tempo: 90-130 BPM | High Acousticness | Storytelling | Twangy Instrumentation",
      color: "text-amber-400",
      border: "border-amber-500/30"
    },
    {
      genre: "Latin/Reggaeton",
      emoji: "🌶️",
      history: "1990s Puerto Rico origin. Dembow beat derived from Dancehall. Global explosion via 'Despacito' era.",
      characteristics: "Tempo: 90-100 BPM | Dembow Rhythm | High Energy | Spanish/Spanglish Lyrics",
      color: "text-red-400",
      border: "border-red-500/30"
    },
    {
      genre: "Reggae",
      emoji: "🌴",
      history: "1960s Jamaica. Evolved from Ska/Rocksteady. Defining offbeat rhythm ('skank') and bass-heavy mix.",
      characteristics: "Tempo: 60-90 BPM | Offbeat Guitar | Prominent Bass | Relaxed Groove",
      color: "text-green-400",
      border: "border-green-500/30"
    },
    {
      genre: "Electronic",
      emoji: "🎹",
      history: "From Musique Concrète to Kraftwerk, House (Chicago), Techno (Detroit), and modern EDM festivals.",
      characteristics: "Tempo: 120-150 BPM | Synthesized Instrumentation | Drops & Buildups | High Energy",
      color: "text-cyan-400",
      border: "border-cyan-500/30"
    },
    {
      genre: "Rock",
      emoji: "🎸",
      history: "1950s origins. Diversified into metal, punk, grunge, indie. Electric guitar driven.",
      characteristics: "Tempo: 110-150 BPM | Distorted Guitars | Live Drums | High Energy/Loudness",
      color: "text-orange-400",
      border: "border-orange-500/30"
    },
    {
      genre: "K-Pop",
      emoji: "🇰🇷",
      history: "Modern industry born in 1990s (Seo Taiji). Hallyu wave globalized the genre via high-production video.",
      characteristics: "Tempo: 100-140 BPM | Multi-Genre Blends | Polished Production | Visual Focus",
      color: "text-fuchsia-400",
      border: "border-fuchsia-500/30"
    },
    {
      genre: "Afrobeats",
      emoji: "🌍",
      history: "2000s West Africa (Nigeria/Ghana). distinct from Fela Kuti's Afrobeat. Percussive, melodic pop.",
      characteristics: "Tempo: 100-120 BPM | Polyrhythms | Auto-Tuned Vocals | Dance-Centric",
      color: "text-lime-400",
      border: "border-lime-500/30"
    }
  ];

  return (
    // CYBERPUNK BASE
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0 p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* Decorative Grid Overlay */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <NetworkErrorBanner />
        <AILearningBanner />

        {/* HEADER */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black mb-1 tracking-tight flex items-center gap-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse">
                MARKET INTELLIGENCE DATABASE
              </span>
            </h1>
            <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
              Historical Archives • Methodology • Academic Research
            </p>
          </div>
        </div>

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiveSecurityDisplay />
            <LiveThreatDisplay />
        </div>

        {/* METHODOLOGY SECTION */}
        <Card className="bg-black/60 border border-blue-500/30 shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)] backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500"></div>
          <CardHeader className="border-b border-white/5 bg-white/5 p-6">
            <CardTitle className="text-white flex items-center gap-2 text-xl font-bold uppercase tracking-wide">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Algorithmic Methodology
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="p-6 rounded-xl bg-blue-950/10 border border-blue-500/20 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <h3 className="font-bold text-blue-300 text-sm uppercase tracking-wider">Analysis Dimensions</h3>
                <p className="text-slate-300 text-sm font-light leading-relaxed">
                  Market Fit utilizes a multi-vector analysis system evaluating tracks across four primary dimensions: 
                  <strong className="text-white"> Trending Similarity</strong>, 
                  <strong className="text-white"> Playlist Potential</strong>, 
                  <strong className="text-white"> Radio Viability</strong>, and 
                  <strong className="text-white"> Viral Velocity</strong>.
                </p>
                <div className="text-xs text-slate-400 font-mono bg-black/40 p-3 rounded border border-slate-800">
                  {">>"} DATA SOURCES: BILLBOARD HOT 100 • SPOTIFY API • TIKTOK TRENDS • NIELSEN
                </div>
              </div>
              
              {/* Diagram Injection - Market Radar */}
              <div className="flex-1 p-4 bg-slate-900/50 rounded-lg border border-slate-800 flex items-center justify-center gap-3">
                 <Activity className="w-5 h-5 text-blue-400" />
                 <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-blue-300 font-mono uppercase font-bold">Visualization Model</p>
                    <div className="text-[10px] text-slate-500 border border-slate-700 rounded px-3 py-2 bg-black/50 font-mono text-center">
                        [RADAR CHART PLACEHOLDER]
                    </div>
                 </div>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                { score: "8-10", label: "EXCEPTIONAL", desc: "Top 1% Market Alignment", color: "text-green-400", border: "border-green-500/30" },
                { score: "6-8", label: "STRONG", desc: "High Commercial Viability", color: "text-blue-400", border: "border-blue-500/30" },
                { score: "4-6", label: "MODERATE", desc: "Niche / Needs Refinement", color: "text-yellow-400", border: "border-yellow-500/30" },
                { score: "1-4", label: "LOW", desc: "Experimental / Outlier", color: "text-red-400", border: "border-red-500/30" }
              ].map((tier, i) => (
                <div key={i} className={`p-4 bg-slate-900/30 border ${tier.border} rounded-lg text-center`}>
                  <div className={`text-2xl font-black ${tier.color} mb-1`}>{tier.score}</div>
                  <div className={`text-xs font-bold text-white uppercase mb-1`}>{tier.label}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{tier.desc}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* GENRE HISTORY GRID */}
        <div>
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-wide">
            <Music className="w-6 h-6 text-purple-400" />
            Genre Taxonomy & History
          </h2>
          
          {/* Diagram Injection - Genre Tree */}
          <div className="mb-6 p-4 bg-purple-950/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
             <div className="text-center">
                <p className="text-xs text-purple-300 font-mono mb-2">{">>"} EVOLUTIONARY TREE VISUALIZATION</p>
                <div className="text-[10px] text-slate-500 border border-purple-500/30 rounded px-4 py-2 bg-black/30 font-mono inline-block">
                    [INTERACTIVE TREE GRAPH]
                </div>
             </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {genreHistories.map((item, idx) => (
              <Card key={idx} className={`bg-black/60 border ${item.border} hover:bg-slate-900/50 transition-all duration-300 group`}>
                <CardHeader className="p-5 pb-2">
                  <CardTitle className={`font-black text-lg flex items-center gap-3 ${item.color}`}>
                    <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all">{item.emoji}</span>
                    {item.genre}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-2 space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Origins
                    </h3>
                    <p className="text-slate-300 text-xs leading-relaxed font-light">{item.history}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <Activity className="w-3 h-3" /> Audio DNA
                    </h3>
                    <p className="text-[10px] text-cyan-200 font-mono bg-slate-900/80 p-2 rounded border border-slate-800">
                      {item.characteristics}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* RESEARCH PAPERS - WHITE/SLATE THEME INVERTED FOR DARK MODE */}
        <Card className="bg-slate-200 border-slate-300 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-300 p-6">
            <CardTitle className="text-slate-900 font-black text-2xl uppercase tracking-tight flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-slate-700" />
              Academic Research Archive
            </CardTitle>
            <p className="text-slate-600 font-medium text-sm mt-1">
              Peer-Reviewed Studies on AI Music Analysis & Cultural Bias (2023-2024)
            </p>
          </CardHeader>
          <CardContent className="p-8 space-y-6 bg-slate-100">
            
            {/* Diagram Injection - AI Bias */}
            <div className="p-4 bg-white border border-slate-300 rounded-lg flex items-center gap-4 shadow-sm">
                <Scale className="w-8 h-8 text-red-500" />
                <div className="flex-1">
                    <h4 className="text-slate-900 font-bold text-sm uppercase">Critical Analysis: Algorithmic Bias</h4>
                    <p className="text-slate-600 text-xs mb-2">Visualizing dataset imbalances in Western vs. Non-Western music training data.</p>
                    <div className="text-[10px] text-slate-400 border border-slate-200 rounded px-2 py-1 bg-slate-50 font-mono inline-block">
                        [BIAS DISTRIBUTION CHART]
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Paper 1 */}
                <Card className="bg-white border-slate-300 hover:border-blue-500/50 transition-all shadow-sm">
                <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-slate-900 font-bold text-lg flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    Deep Learning for MIR
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-2">
                    <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-[10px] font-bold uppercase">2023 • Open Access</span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed mb-4">
                    Comprehensive study on modern machine learning approaches to music analysis, addressing cultural biases in training datasets and MIR pipeline architecture.
                    </p>
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => window.open("https://scholar.google.com/", "_blank")}>
                    ACCESS PDF
                    </Button>
                </CardContent>
                </Card>

                {/* Paper 2 */}
                <Card className="bg-white border-slate-300 hover:border-purple-500/50 transition-all shadow-sm">
                <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-slate-900 font-bold text-lg flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-600" />
                    Genre Recognition
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-2">
                    <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-[10px] font-bold uppercase">2023 • IEEE Access</span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed mb-4">
                    Peer-reviewed study on automatic genre classification using CNNs, discussing the need for inclusive training data representing global traditions.
                    </p>
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => window.open("https://scholar.google.com/", "_blank")}>
                    ACCESS PDF
                    </Button>
                </CardContent>
                </Card>
            </div>
          </CardContent>
        </Card>

        {/* AFRICAN RESEARCH CALLOUT */}
        <Card className="bg-black/60 border border-orange-500/30 rounded-xl overflow-hidden">
          <CardHeader className="bg-orange-950/10 border-b border-orange-500/20 p-4">
            <CardTitle className="text-orange-400 font-bold text-sm uppercase flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Global Research Initiative: African Music Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-2">
            {[
                { label: "Cultural Bias", text: "Western algorithms undervalue polyrhythmic complexity." },
                { label: "Market Prediction", text: "Danceability is a stronger predictor than Valence in African markets." },
                { label: "Language", text: "NLP fails on 2,000+ local dialects, requiring custom datasets." }
            ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                    <span className="text-orange-300 font-bold uppercase min-w-[120px]">{item.label}:</span>
                    <span className="text-slate-300">{item.text}</span>
                </div>
            ))}
            <div className="pt-4 mt-2 border-t border-white/5">
                <p className="text-[10px] text-slate-500 font-mono italic">
                    {">>"} SPECTROMODEL COMMITMENT: INTEGRATING NON-WESTERN DATASETS IN v5.0 UPDATE.
                </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}