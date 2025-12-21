import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, Music, Users, ListMusic, Calendar, 
  Brain, Shield, Globe, CheckCircle, RefreshCw,
  BarChart3, Target, Map, Mail, Zap, Radio, Share2, Activity,
  Link as LinkIcon, Loader2
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import SocialMediaLauncher from '@/components/distribution/SocialMediaLauncher';
import AIResolver from '@/components/shared/AIResolver';
import LiveSecurityDisplay from '@/components/shared/LiveSecurityDisplay';
import LiveThreatDisplay from '@/components/shared/LiveThreatDisplay';
import LimitLocker from "@/components/shared/LimitLocker";
import SecurityMonitor from "@/components/shared/SecurityMonitor";
import ParticleSystem from "@/components/shared/ParticleSystem";
import { NetworkErrorBanner, AILearningBanner } from "@/components/shared/NetworkErrorHandler";

const Diagram = ({ type, label, color = "blue" }) => {
  const colorMap = {
    blue: "text-blue-400 border-blue-500/30 bg-blue-950/30",
    purple: "text-purple-400 border-purple-500/30 bg-purple-950/30",
    green: "text-green-400 border-green-500/30 bg-green-950/30",
    pink: "text-pink-400 border-pink-500/30 bg-pink-950/30"
  };
  
  return (
    <div className="w-full h-48 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden group my-6 hover:border-white/20 transition-all">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      <div className="text-center z-10 p-6 relative">
        <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center animate-pulse border ${colorMap[color].replace('text-', 'border-').split(' ')[1]} bg-opacity-10`}>
          <Activity className={`w-6 h-6 ${colorMap[color].split(' ')[0]}`} />
        </div>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Strategy Visualization</div>
        <Badge variant="outline" className={`font-mono text-md py-1 px-4 mb-2 ${colorMap[color]}`}>
          &lt;{type} /&gt;
        </Badge>
        {label && <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">{label}</p>}
      </div>
      {/* Decorative tech lines */}
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${color}-500/50 to-transparent opacity-50`} />
      <div className={`absolute top-0 left-0 w-32 h-32 bg-${color}-500/5 blur-3xl rounded-full pointer-events-none`} />
    </div>
  );
};

export default function DistributionPromotionPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("strategy");
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Strategy State
  const [strategy, setStrategy] = useState(null);
  
  // Pitching State
  const [pitchingData, setPitchingData] = useState(null);
  
  // Pre-save State
  const [preSaveLink, setPreSaveLink] = useState(null);
  const [releaseDate, setReleaseDate] = useState("");
  const [networkError, setNetworkError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        blockScriptInjection();
        validateCSP();
        
        const user = await base44.auth.me();
        setCurrentUser(user);

        mlDataCollector.record('distribution_page_visit', { timestamp: Date.now() });
        
        // Retry logic for robustness against network glitches
        let attempts = 0;
        let success = false;
        let data = [];
        
        while (!success && attempts < 3) {
          try {
            data = await base44.entities.MusicAnalysis.list('-created_date', 50);
            success = true;
            setNetworkError(null);
          } catch (err) {
            attempts++;
            console.warn(`Fetch attempt ${attempts} failed:`, err);
            if (attempts >= 3) {
               setNetworkError("Network connection failed. Please check your internet.");
            }
            await new Promise(r => setTimeout(r, 1500));
          }
        }
        
        if (success) {
           setAnalyses(data.filter(a => a.status === 'completed' && a.track_name));
        }
      } catch (e) {
        console.error("Failed to load analyses", e);
        setNetworkError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const generateStrategy = async () => {
    if (!selectedTrack) return;
    setIsGenerating(true);
    
    try {
      const track = analyses.find(a => a.id === selectedTrack);
      const prompt = `
        Generate a comprehensive release and distribution strategy for the track: "${track.track_name}" by "${track.artist_name}".
        Genre: ${track.genre || 'Unknown'}
        Mood: ${track.mood || 'Unknown'}
        BPM: ${track.tempo || 'Unknown'}
        
        Include:
        1. Optimal Release Timing (Day of week, Month)
        2. Target Playlist Types (Editorial & User)
        3. Social Media Content Plan (2 weeks pre-release)
        4. Target Audience Demographics (Age, Location, Interests)
        5. Key Selling Points based on audio features
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            release_timing: { type: "string" },
            playlist_targets: { type: "array", items: { type: "string" } },
            social_plan: { type: "array", items: { type: "string" } },
            demographics: { 
              type: "object",
              properties: {
                age_range: { type: "string" },
                locations: { type: "array", items: { type: "string" } },
                interests: { type: "array", items: { type: "string" } }
              }
            },
            selling_points: { type: "array", items: { type: "string" } }
          }
        }
      });

      setStrategy(response);
      mlDataCollector.record('strategy_generated', { trackId: selectedTrack, timestamp: Date.now() });
    } catch (error) {
      console.error("Strategy generation failed", error);
      setNetworkError("AI Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePitching = async () => {
    if (!selectedTrack) return;
    setIsGenerating(true);
    
    try {
      const track = analyses.find(a => a.id === selectedTrack);
      // Simulation of pitching match
      await new Promise(r => setTimeout(r, 1500));
      
      setPitchingData({
        score: Math.floor(Math.random() * 30) + 70, // 70-99
        matches: [
          { name: "Spotify Editorial: " + (track.genre || "Pop") + " Rising", probability: "High" },
          { name: "Apple Music: Best New Songs", probability: "Medium" },
          { name: "Amazon Music: Fresh " + (track.genre || "Music"), probability: "Medium" },
          { name: "TikTok Viral Potential", probability: "High" }
        ],
        email_template: `Subject: Pitch for "${track.track_name}" - ${track.genre}\n\nHi [Curator Name],\n\nI'm pitching my new track "${track.track_name}", a ${track.bpm} BPM ${track.genre} track perfect for your playlist. It features [Unique Quality]...`
      });
      
      mlDataCollector.record('pitching_generated', { trackId: selectedTrack, timestamp: Date.now() });
    } finally {
      setIsGenerating(false);
    }
  };

  const createPreSave = () => {
    if (!selectedTrack || !releaseDate) return;
    const track = analyses.find(a => a.id === selectedTrack);
    setPreSaveLink(`https://presave.spectromodel.com/${track.artist_name.replace(/\s/g, '').toLowerCase()}/${track.track_name.replace(/\s/g, '').toLowerCase()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />
        <p className="text-blue-300 font-mono font-bold tracking-widest">INITIALIZING RELEASE CONSOLE...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 pb-24 text-slate-100 font-sans overflow-x-hidden">
      
      {/* Cyberpunk Grid Background Removed - Handled by Layout */}

      <LimitLocker feature="distribution" featureKey="DISTRIBUTION" user={currentUser} />
      <NetworkErrorBanner />
      <AILearningBanner />
      <SecurityMonitor />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Rocket className="w-8 h-8 text-blue-400 animate-pulse" />
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                RELEASE COMMAND CONSOLE
              </h1>
            </div>
            <p className="text-slate-400 font-mono text-xs md:text-sm tracking-wide">
              DISTRIBUTION • STRATEGY • FAN ACQUISITION
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/Dashboard")} variant="outline" className="border-slate-600 text-slate-300 font-mono text-xs uppercase tracking-wider">
                Return to Dashboard
            </Button>
          </div>
        </div>

        {/* Security & AI Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LiveSecurityDisplay />
          <LiveThreatDisplay />
        </div>

        {/* Main Content Card */}
        <Card className="bg-black/40 backdrop-blur-xl backdrop-blur-xl border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <CardHeader>
             <div className="flex justify-between items-center">
                <CardTitle className="text-white font-bold flex items-center gap-2 font-mono uppercase tracking-wider">
                  <Radio className="w-5 h-5 text-blue-400" />
                  Campaign Initialization
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-mono text-green-400">SYSTEMS ONLINE</span>
                </div>
             </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="bg-slate-950/50 p-6 rounded-xl border border-white/5">
              <label className="text-blue-400 font-mono text-xs uppercase tracking-widest mb-3 block">Select Master Track</label>
              <Select onValueChange={setSelectedTrack} value={selectedTrack}>
                <SelectTrigger className="bg-black/40 backdrop-blur-xl border-white/10 text-white font-bold h-12">
                  <SelectValue placeholder="SELECT AUDIO ASSET..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white font-bold">
                  {analyses.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.track_name} - {a.artist_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-black/40 backdrop-blur-xl border border-white/10 p-1 h-auto grid grid-cols-2 md:grid-cols-4 gap-2">
                <TabsTrigger value="strategy" className="font-bold text-slate-400 data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 data-[state=active]:border-blue-500/50 border border-transparent h-12 uppercase tracking-wider font-mono text-xs">
                  <Target className="w-4 h-4 mr-2" /> Strategy
                </TabsTrigger>
                <TabsTrigger value="pitching" className="font-bold text-slate-400 data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400 data-[state=active]:border-purple-500/50 border border-transparent h-12 uppercase tracking-wider font-mono text-xs">
                  <ListMusic className="w-4 h-4 mr-2" /> Pitching
                </TabsTrigger>
                <TabsTrigger value="audience" className="font-bold text-slate-400 data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/50 border border-transparent h-12 uppercase tracking-wider font-mono text-xs">
                  <Users className="w-4 h-4 mr-2" /> Audience
                </TabsTrigger>
                <TabsTrigger value="presave" className="font-bold text-slate-400 data-[state=active]:bg-pink-600/20 data-[state=active]:text-pink-400 data-[state=active]:border-pink-500/50 border border-transparent h-12 uppercase tracking-wider font-mono text-xs">
                  <Calendar className="w-4 h-4 mr-2" /> Pre-Save
                </TabsTrigger>
              </TabsList>

              {/* STRATEGY TAB - BLUE */}
              <TabsContent value="strategy" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Diagram type="release_timeline_waterfall" label="Release Schedule & Milestone Waterfall" color="blue" />
                
                {!selectedTrack ? (
                  <div className="text-center py-12 border border-dashed border-slate-700 rounded-xl bg-slate-900/30">
                    <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 font-mono">AWAITING TRACK SELECTION...</p>
                  </div>
                ) : !strategy ? (
                  <div className="text-center py-12">
                    <Button onClick={generateStrategy} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-500 font-bold text-lg py-8 px-12 shadow-[0_0_30px_-5px_rgba(37,99,235,0.5)] border border-blue-400/50">
                      {isGenerating ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> PROCESSING STRATEGY...</>
                      ) : (
                        <><Brain className="w-5 h-5 mr-2" /> GENERATE RELEASE BLUEPRINT</>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-black/40 backdrop-blur-xl border border-blue-500/30">
                      <CardHeader>
                          <CardTitle className="text-blue-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                              <Calendar className="w-4 h-4" /> Optimal Launch Window
                          </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white font-black text-2xl tracking-tight">{strategy.release_timing}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-black/40 backdrop-blur-xl border border-blue-500/30">
                      <CardHeader>
                          <CardTitle className="text-blue-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                              <Zap className="w-4 h-4" /> Sonic USPs
                          </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {strategy.selling_points.map((p, i) => (
                            <li key={i} className="text-slate-200 font-medium flex items-start gap-2 text-sm">
                                <span className="text-blue-500 mt-1">▹</span> {p}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/40 backdrop-blur-xl border border-blue-500/30 md:col-span-2">
                      <CardHeader>
                          <CardTitle className="text-blue-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                              <Share2 className="w-4 h-4" /> Social Deployment Matrix
                          </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {strategy.social_plan.map((plan, i) => (
                            <div key={i} className="p-4 bg-black/40 backdrop-blur-xl rounded-lg border border-blue-500/10 flex gap-4 items-center hover:border-blue-500/30 transition-colors group">
                              <span className="bg-blue-900/50 text-blue-400 border border-blue-500/30 w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">{i+1}</span>
                              <p className="text-slate-300 text-sm">{plan}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Button onClick={generateStrategy} variant="outline" className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-950/50 font-mono text-xs md:col-span-2">
                        RECALCULATE STRATEGY VECTORS
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* PITCHING TAB - PURPLE */}
              <TabsContent value="pitching" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Diagram type="playlist_ecosystem_map" label="Editorial & Algorithmic Playlist Network" color="purple" />

                {!selectedTrack ? (
                   <div className="text-center py-12 border border-dashed border-slate-700 rounded-xl bg-slate-900/30">
                     <ListMusic className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                     <p className="text-slate-400 font-mono">AWAITING TRACK SELECTION...</p>
                   </div>
                ) : !pitchingData ? (
                  <div className="text-center py-12">
                    <Button onClick={generatePitching} disabled={isGenerating} className="bg-purple-600 hover:bg-purple-500 font-bold text-lg py-8 px-12 shadow-[0_0_30px_-5px_rgba(147,51,234,0.5)] border border-purple-400/50">
                      {isGenerating ? "ANALYZING ECOSYSTEM..." : "INITIATE PLAYLIST SCAN"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-purple-950/20 p-6 rounded-xl border border-purple-500/30 relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-purple-400 font-mono text-xs uppercase tracking-widest mb-1">Pitch Viability Index</p>
                        <p className="text-4xl font-black text-white tracking-tight">{pitchingData.score}<span className="text-lg text-purple-500/50 font-normal">/100</span></p>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 px-4 py-1 relative z-10 font-mono uppercase tracking-widest">High Probability</Badge>
                      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-purple-500/10 to-transparent"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30">
                        <CardHeader><CardTitle className="text-purple-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2"><Target className="w-4 h-4" /> Identified Targets</CardTitle></CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {pitchingData.matches.map((m, i) => (
                              <div key={i} className="flex justify-between items-center p-3 bg-black/40 backdrop-blur-xl rounded border border-purple-500/10 hover:border-purple-500/30 transition-colors">
                                <span className="text-slate-200 font-medium text-sm">{m.name}</span>
                                <Badge variant="outline" className="border-purple-500/30 text-purple-400 font-mono text-[10px]">{m.probability.toUpperCase()}</Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30">
                        <CardHeader><CardTitle className="text-purple-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2"><Mail className="w-4 h-4" /> Pitch Protocol (Email)</CardTitle></CardHeader>
                        <CardContent>
                          <div className="bg-black/60 p-4 rounded border border-white/5 text-slate-300 text-xs font-mono whitespace-pre-wrap mb-4 h-48 overflow-y-auto custom-scrollbar">
                            {pitchingData.email_template}
                          </div>
                          <Button className="w-full bg-purple-600 hover:bg-purple-500 font-mono text-xs" onClick={() => navigator.clipboard.writeText(pitchingData.email_template)}>
                            COPY TRANSMISSION TEXT
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* AUDIENCE TAB - GREEN */}
              <TabsContent value="audience" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Diagram type="fan_acquisition_funnel" label="Target Demographic Conversion Flow" color="green" />

                {!strategy ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400 font-mono mb-6">DATA INSUFFICIENT. STRATEGY GENERATION REQUIRED.</p>
                    <Button onClick={() => { setActiveTab("strategy"); generateStrategy(); }} className="bg-green-600 hover:bg-green-500 font-mono text-xs">
                      INITIALIZE STRATEGY MODULE
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30">
                      <CardHeader>
                          <CardTitle className="text-green-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                              <Users className="w-4 h-4" /> Target Age
                          </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-black text-white">{strategy.demographics.age_range}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30">
                      <CardHeader>
                          <CardTitle className="text-green-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                              <Globe className="w-4 h-4" /> Geo-Targets
                          </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {strategy.demographics.locations.map((l, i) => (
                            <li key={i} className="text-slate-200 font-medium flex items-center gap-2 text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {l}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30">
                      <CardHeader>
                          <CardTitle className="text-green-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                              <Target className="w-4 h-4" /> Affinities
                          </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {strategy.demographics.interests.map((int, i) => (
                            <Badge key={i} className="bg-green-900/30 border-green-500/30 text-green-300 hover:bg-green-900/50">{int}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* PRE-SAVE TAB - PINK */}
              <TabsContent value="presave" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Diagram type="conversion_tracking_flow" label="Pre-Save Link Engagement Analytics" color="pink" />

                {!selectedTrack ? (
                   <div className="text-center py-12 border border-dashed border-slate-700 rounded-xl bg-slate-900/30">
                     <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                     <p className="text-slate-400 font-mono">AWAITING TRACK SELECTION...</p>
                   </div>
                ) : (
                  <div className="max-w-xl mx-auto space-y-6">
                    <Card className="bg-black/40 backdrop-blur-xl border border-pink-500/30">
                      <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                          <label className="text-pink-400 font-mono text-xs uppercase tracking-widest">Global Release Date</label>
                          <Input 
                            type="date" 
                            value={releaseDate} 
                            onChange={(e) => setReleaseDate(e.target.value)}
                            className="bg-black/40 backdrop-blur-xl border-pink-500/30 text-white font-mono focus:border-pink-500"
                          />
                        </div>
                        <Button onClick={createPreSave} disabled={!releaseDate} className="w-full bg-pink-600 hover:bg-pink-500 font-mono text-sm py-6 shadow-[0_0_20px_-5px_rgba(219,39,119,0.5)]">
                           GENERATE SMART LINK
                        </Button>

                        {preSaveLink && (
                          <div className="mt-6 p-6 bg-pink-950/30 border border-pink-500/50 rounded-xl text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
                            <p className="text-pink-300 font-mono text-xs uppercase tracking-widest mb-4">Campaign Link Active</p>
                            <div className="bg-black/50 p-3 rounded border border-pink-500/20 mb-4">
                                <p className="text-white font-mono text-xs break-all">{preSaveLink}</p>
                            </div>
                            <div className="flex gap-3 justify-center">
                              <Button size="sm" variant="outline" className="border-pink-500/30 text-pink-400 hover:bg-pink-950/50 font-mono text-xs" onClick={() => navigator.clipboard.writeText(preSaveLink)}>
                                  <LinkIcon className="w-3 h-3 mr-2" /> COPY
                              </Button>
                              <Button size="sm" className="bg-pink-600 hover:bg-pink-500 font-mono text-xs" onClick={() => window.open(preSaveLink, '_blank')}>
                                  TEST LINK
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <SocialMediaLauncher />
        <AIResolver context={{ feature: 'distribution_promotion' }} />
        
      </div>
    </div>
  );
}