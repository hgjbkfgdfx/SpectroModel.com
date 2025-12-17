import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Wand2, 
  Waves, 
  Music, 
  Activity,
  Sliders,
  Layers,
  ArrowRight,
  Zap,
  Lock,
  Brain,
  Shield,
  Radio,
  Disc,
  FileAudio,
  Download,
  Headphones,
  Sparkles,
  Stars,
  Settings,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from "@/api/base44Client";
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import LimitLocker from "@/components/shared/LimitLocker";
import { NetworkErrorBanner, AILearningBanner } from "@/components/shared/NetworkErrorHandler";
import { isFeatureLocked, SUBSCRIPTION_TIERS } from '@/components/shared/subscriptionSystem';

// Import Studio Components for tools
import MasteringInterface from '@/components/studio/MasteringInterface';
import AIGenreMasteringUI from '@/components/studio/AIGenreMasteringUI';
import AdvancedMixingTools from '@/components/studio/AdvancedMixingTools';
import AdvancedVocalIsolator from '@/components/studio/AdvancedVocalIsolator';
import AdvancedConsonantCorrector from '@/components/studio/AdvancedConsonantCorrector';

export default function StudioCorrectorPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [user, setUser] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [studioFile, setStudioFile] = useState(null);
  const [securityStatus, setSecurityStatus] = useState({ safe: true, mlComplexity: 0 });

  const [isPageLocked, setIsPageLocked] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Check if page is locked for this user
        const userTier = userData?.subscription_tier || SUBSCRIPTION_TIERS.FREE;
        const locked = isFeatureLocked(userTier, 'STUDIO_CORRECTOR');
        setIsPageLocked(locked);
        
        blockScriptInjection();
        const cspResult = validateCSP();
        setSecurityStatus({ safe: cspResult.valid, mlComplexity: cspResult.mlComplexity || 0 });
        
        mlDataCollector.record('studio_corrector_grid_visit', {
          feature: 'studio_corrector',
          timestamp: Date.now(),
          aiLearning: true
        });
      } catch (e) {
        console.error("Init failed", e);
        setIsPageLocked(true);
      }
    };
    init();
  }, []);

  // Tools configuration matching the screenshot
  const tools = [
    {
      id: 'zero_mastering',
      title: 'Zero-Iteration Mastering',
      description: 'One-pass quality',
      icon: Sparkles,
      color: 'text-yellow-400',
      iconBg: 'bg-yellow-400/10',
      action: () => setActiveTool('zero_mastering')
    },
    {
      id: 'ai_genre',
      title: 'AI Genre Mastering',
      description: '8 AI models • Fine-tune',
      icon: Brain,
      color: 'text-cyan-400',
      iconBg: 'bg-cyan-400/10',
      action: () => setActiveTool('ai_genre')
    },
    {
      id: 'mixing',
      title: 'Advanced Mixing',
      description: 'Pro tools',
      icon: Settings, // Using Settings/Cog icon as proxy for the gear icon in screenshot
      color: 'text-blue-400',
      iconBg: 'bg-blue-400/10',
      action: () => setActiveTool('mixing')
    },
    {
      id: 'isolation',
      title: 'AI Vocal Isolation',
      description: 'Neural isolation',
      icon: Stars, // Using Stars as proxy for the "magic" icon
      color: 'text-purple-400',
      iconBg: 'bg-purple-400/10',
      action: () => setActiveTool('isolation')
    },
    {
      id: 'sibilance',
      title: 'Sibilance Corrector',
      description: 'Research-based',
      icon: Brain,
      color: 'text-teal-400',
      iconBg: 'bg-teal-400/10',
      action: () => navigate(createPageUrl('SibilanceCorrector')) // Navigates to separate page as requested before, keeping consistent
    },

  ];

  const renderActiveTool = () => {
    if (!studioFile && activeTool !== 'sibilance') { // Sibilance handles its own file upload on its page
        // We need a file for most tools. 
        // If we are in a tool view but no file, show upload first?
        // Actually, let's keep the upload in the main view or pass it down.
        // For better UX, let's show a "Back" button and the tool UI which should handle "No File" state gracefully or use the global file.
    }

    const commonProps = {
        audioFile: studioFile, // Pass the global file if selected
        file: studioFile, // Some components use 'file' prop
        user: user,
        onProcessComplete: (url) => console.log('Processing complete:', url)
    };

    switch (activeTool) {
        case 'zero_mastering':
            return <MasteringInterface {...commonProps} />;
        case 'ai_genre':
            return <AIGenreMasteringUI {...commonProps} />;
        case 'mixing':
            return <AdvancedMixingTools {...commonProps} />;
        case 'isolation':
            return <AdvancedVocalIsolator {...commonProps} />;
        case 'consonant':
            return <AdvancedConsonantCorrector {...commonProps} voiceProfileUrl={null} />;
        default:
            return null;
    }
  };

  // Locked page screen
  if (isPageLocked) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center p-4 sm:p-8">
        <Card className="bg-red-950/20 border border-red-500/50 max-w-md w-full backdrop-blur-md text-center p-6 sm:p-8">
          <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-red-400 font-black text-lg sm:text-xl uppercase mb-2">Access Denied</h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-4 font-mono">Studio Corrector is currently locked.</p>
          <p className="text-slate-500 text-[10px] sm:text-xs mb-6">This feature is under development and not available at this time.</p>
          <Button onClick={() => navigate(createPageUrl('Dashboard'))} className="bg-red-600 hover:bg-red-700 font-mono text-xs uppercase">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8">
      <NetworkErrorBanner />
      <AILearningBanner />
      <LimitLocker feature="advanced_analytics" featureKey="STUDIO_CORRECTOR" user={user} />
      
      {/* Voice Profile Section - Always visible at top if not in a specific tool, or maybe just in dashboard view? 
          Screenshot shows it at the top. Let's keep it in the "Dashboard" view of Studio.
      */}
      
      {activeTool ? (
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Button 
                variant="ghost" 
                onClick={() => setActiveTool(null)} 
                className="mb-6 text-slate-300 hover:text-white hover:bg-slate-800"
            >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Studio Dashboard
            </Button>
            
            {/* File Upload Context for Active Tool */}
            {!studioFile && (
                <Card className="bg-slate-800/50 border-dashed border-2 border-slate-600 mb-8">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Music className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Load Audio Track</h3>
                        <p className="text-slate-400 mb-6">Upload high-quality audio (WAV/FLAC preferred) to use this tool</p>
                        <input 
                            type="file" 
                            id="tool-upload" 
                            className="hidden" 
                            accept="audio/*"
                            onChange={(e) => e.target.files?.[0] && setStudioFile(e.target.files[0])}
                        />
                        <Button asChild className="bg-purple-600 hover:bg-purple-700">
                            <label htmlFor="tool-upload" className="cursor-pointer">
                                Select Audio File
                            </label>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {studioFile && (
                <div className="mb-6 flex items-center justify-between p-4 bg-slate-800/80 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <FileAudio className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-white font-medium">{studioFile.name}</p>
                            <p className="text-xs text-slate-400">{(studioFile.size / 1024 / 1024).toFixed(2)} MB • Loaded</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStudioFile(null)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                        Change File
                    </Button>
                </div>
            )}

            {/* Render the Selected Tool */}
            {renderActiveTool()}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            
            {/* Voice Profile Section (From Screenshot) */}
            <Card className="bg-black/40 backdrop-blur-xl border border-slate-800 overflow-hidden">
                <div className="bg-black/40 backdrop-blur-xl p-4 border-b border-slate-800 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-bold text-lg">Voice Profile (Optional)</h3>
                </div>
                <CardContent className="p-6">
                    <p className="text-slate-400 text-sm mb-4">Record voice for AI vocal enhancement</p>
                    <Button className="w-full bg-black border border-slate-700 hover:bg-slate-900 text-slate-300 h-12 flex items-center justify-center gap-2">
                        <Mic className="w-4 h-4" /> Record Voice (10-15s)
                    </Button>
                </CardContent>
            </Card>

            {/* Tools Grid (From Screenshot) */}
            <div className="grid md:grid-cols-2 gap-4">
                {tools.map((tool) => (
                    <Card 
                        key={tool.id}
                        onClick={tool.action}
                        className="bg-black/40 backdrop-blur-xl border border-slate-800 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group hover:scale-[1.01] hover:shadow-xl h-40 flex flex-col justify-center"
                    >
                        <CardContent className="p-6 flex items-start gap-4 h-full">
                            <div className="mt-1">
                                <tool.icon className={`w-8 h-8 ${tool.color}`} />
                            </div>
                            <div className="flex-1 flex flex-col justify-center h-full">
                                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-purple-300 transition-colors">
                                    {tool.title}
                                </h3>
                                <p className="text-slate-400 text-sm font-medium">
                                    {tool.description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Player Bar Placeholder (Visual match) */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-slate-800 p-3 md:hidden">
                 {/* Mobile player placeholder if needed, desktop sidebar usually handles player */}
            </div>
        </div>
      )}
    </div>
  );
}