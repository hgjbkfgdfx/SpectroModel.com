import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Sparkles, Users, Zap, Brain, Loader2, User, Microscope, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from "@/api/base44Client";
import { createPageUrl } from '@/utils';
import MLEngine from '@/components/shared/MLEngine';
import Avatar3DRenderer from '@/components/spectroverse/Avatar3DRenderer';
import ChatSystem from '@/components/spectroverse/ChatSystem';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { blockScriptInjection, validateCSP } from '@/components/shared/SecurityValidator';
import { useAntiSpyware } from '@/components/shared/AntiSpywareProtection';
import { useReliableClicks } from '@/components/shared/ClickReliabilityFix';
import LiveSecurityDisplay from '@/components/shared/LiveSecurityDisplay';
import { useUsageLimits } from "@/components/shared/useUsageLimits";
import LimitLocker from "@/components/shared/LimitLocker";

function NavCard({ icon: Icon, title, subtitle, onClick, color }) {
    const colorClasses = {
        blue: "text-blue-400 group-hover:text-blue-300",
        orange: "text-orange-400 group-hover:text-orange-300",
        green: "text-green-400 group-hover:text-green-300",
        purple: "text-purple-400 group-hover:text-purple-300"
    };

    return (
        <div onClick={onClick} className="group p-3 bg-black/40 backdrop-blur-xl border border-slate-800 rounded-lg cursor-pointer hover:bg-slate-800 hover:border-slate-700 transition-all">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded bg-slate-950 ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-slate-200 font-bold text-sm">{title}</h3>
                    <p className="text-slate-500 text-[10px]">{subtitle}</p>
                </div>
            </div>
        </div>
    );
}

export default function SpectroVersePage() {
  const navigate = useNavigate();
  useAntiSpyware();
  useReliableClicks();
  
  const [currentUser, setCurrentUser] = useState(null);
  const { isLocked, loading: loadingLimits } = useUsageLimits(currentUser);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Limit enforcement handled by LimitLocker

  const mlEngineRef = useRef(null);
  const [mlImprovements, setMlImprovements] = useState({ avatarIntelligence: 30, animationQuality: 30, accuracy: 0.3, loss: 0.5, epoch: 0 });
  const [generatedAvatars, setGeneratedAvatars] = useState([]);
  const mlDataCollector = useMLDataCollector();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
      const init = async () => {
        blockScriptInjection();
        validateCSP();
        mlDataCollector.record('spectroverse_loaded', { feature: 'spectroverse', timestamp: Date.now() });
        
        try {
          const avatars = await base44.entities.AvatarCustomization.list('-created_date', 20);
          if (avatars) setGeneratedAvatars(avatars);
        } catch (err) {
          console.warn('Failed to load avatars:', err);
        }
        
        setIsPageLoading(false);
      };
      init();
  }, []);

  if (isPageLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <Loader2 className="w-8 h-8 animate-spin"/>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-transparent text-slate-200 p-4 md:p-6 pb-20 font-sans">
        <LimitLocker feature="analysis_uploads" featureKey="SPECTROVERSE" user={currentUser} />
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div style={{ display: 'none' }}><MLEngine ref={mlEngineRef} /></div>
          
          {/* Header */}
          <div className="flex justify-between items-end border-b border-slate-800 pb-4">
              <div>
                  <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3"><Globe className="w-8 h-8 text-purple-500" /> SPECTRO<span className="text-purple-500">VERSE</span></h1>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Professional Virtual Architecture</p>
              </div>
              <div className="flex items-center gap-4">
                   <div className="text-right">
                       <p className="text-[10px] text-slate-500 uppercase">Neural Core Status</p>
                       <p className={`text-sm font-bold ${mlImprovements.accuracy > 0.8 ? 'text-green-500' : 'text-orange-500'}`}>
                           {mlImprovements.accuracy > 0.8 ? 'OPTIMAL' : 'TRAINING'} ({(mlImprovements.accuracy*100).toFixed(0)}%)
                       </p>
                   </div>
                   <LiveSecurityDisplay />
              </div>
          </div>

          {/* Update Notice */}
          <Card className="bg-gradient-to-r from-amber-950/80 to-orange-950/80 border-amber-500/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                <div className="flex-1">
                  <p className="text-amber-300 font-semibold text-sm">🚀 SpectroVerse Will Be Updated Soon</p>
                  <p className="text-xs text-amber-200/80">We're working on major upgrades including enhanced 3D rendering, improved avatar AI, and new virtual world features. Stay tuned!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Learning Banner */}
          <Card className="bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border-cyan-500/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">🤖 AI Learns From Your Data</p>
                  <p className="text-xs text-cyan-300">Training on avatar preferences • Scene interactions • 3D generation patterns</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[70vh]">
            {/* Left Sidebar: Tools */}
            <div className="lg:col-span-2 space-y-2 flex flex-col">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 pl-1">Creation Tools</p>
                <NavCard icon={Globe} title="Venue Builder" subtitle="Create Concerts" onClick={() => navigate(createPageUrl('SceneGenerator'))} color="blue" />
                <NavCard icon={User} title="Avatar Lab" subtitle="Design Realism" onClick={() => navigate(createPageUrl('AvatarCustomizer'))} color="orange" />
                <NavCard icon={Microscope} title="Research Lab" subtitle="Train AI Model" onClick={() => navigate(createPageUrl('MLTraining'))} color="green" />
                <NavCard icon={PlayCircle} title="4K Render" subtitle="Export Cinema" onClick={() => navigate(createPageUrl('SpectroModelProRes4K'))} color="purple" />
                
                <div className="flex-1"></div>
                <ChatSystem />
            </div>

            {/* Main Viewport */}
            <div className="lg:col-span-7 flex flex-col">
                 <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-lg overflow-hidden border border-slate-800 shadow-2xl relative min-h-[400px]">
                    <Avatar3DRenderer 
                        avatarData={generatedAvatars[0] || { facial_features: { skin_tone: '#ffccaa' } }} 
                        mlImprovements={mlImprovements} 
                    />
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-black/50 border border-white/10 backdrop-blur text-white">Live Viewport</Badge>
                    </div>
                 </div>
            </div>

            {/* Right Sidebar: Assets */}
            <div className="lg:col-span-3 space-y-4">
                <Card className="bg-black/40 backdrop-blur-xl border-slate-800 h-full flex flex-col">
                    <CardHeader className="py-3 border-b border-slate-800">
                      <CardTitle className="text-white flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-slate-400" /> Talent Roster
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                        {generatedAvatars.length === 0 ? (
                          <div className="text-center text-slate-600 py-10 text-xs">Database Empty</div>
                        ) : (
                            generatedAvatars.map((avatar, idx) => (
                                <div key={avatar.id} className="flex items-center gap-3 p-3 hover:bg-slate-800 transition-colors border-b border-slate-800/50 cursor-pointer">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs border border-slate-600">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-200 truncate">{avatar.avatar_name}</div>
                                        <div className="text-[10px] text-slate-500">ID: {avatar.id}</div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}