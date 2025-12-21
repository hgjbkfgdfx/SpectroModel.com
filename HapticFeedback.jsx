import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Vibrate, Hand, Heart, Zap, Activity,
  Waves, Radio, Smartphone, CheckCircle, AlertCircle,
  Info, Brain, Shield, Loader2, MousePointer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { base44 } from "@/api/base44Client";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import LimitLocker from "@/components/shared/LimitLocker";

const hapticPatterns = {
  hug: {
    name: '🤗 Virtual Hug',
    description: 'Warm, embracing sensation',
    pattern: [200, 100, 200, 100, 400],
    intensity: 1.0,
    category: 'affection'
  },
  heartbeat: {
    name: '💓 Heartbeat',
    description: 'Rhythmic pulse like a heartbeat',
    pattern: [100, 100, 100, 800],
    intensity: 0.7,
    category: 'connection'
  },
  handshake: {
    name: '🤝 Handshake',
    description: 'Firm, friendly greeting',
    pattern: [300, 200, 300],
    intensity: 0.9,
    category: 'greeting'
  },
  tap: {
    name: '👆 Gentle Tap',
    description: 'Quick attention-getting tap',
    pattern: [50],
    intensity: 0.5,
    category: 'notification'
  },
  wave: {
    name: '👋 Wave',
    description: 'Flowing wave motion',
    pattern: [100, 50, 150, 50, 200, 50, 150, 50, 100],
    intensity: 0.6,
    category: 'greeting'
  },
  squeeze: {
    name: '🤲 Gentle Squeeze',
    description: 'Comforting pressure',
    pattern: [500, 200, 500],
    intensity: 0.8,
    category: 'affection'
  },
  pulse: {
    name: '⚡ Energy Pulse',
    description: 'Energizing vibration',
    pattern: [150, 100, 150, 100, 150],
    intensity: 1.0,
    category: 'energy'
  },
  caress: {
    name: '💕 Caress',
    description: 'Gentle, flowing touch',
    pattern: [300, 100, 400, 100, 300, 100, 200],
    intensity: 0.4,
    category: 'affection'
  },
  alert: {
    name: '🚨 Alert',
    description: 'Urgent attention pattern',
    pattern: [100, 100, 100, 100, 100],
    intensity: 1.0,
    category: 'notification'
  },
  soothing: {
    name: '🌊 Soothing Waves',
    description: 'Calming, rhythmic pattern',
    pattern: [400, 200, 400, 200, 400, 200],
    intensity: 0.5,
    category: 'wellness'
  }
};

export default function HapticFeedbackPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0, mlComplexity: 0 });
  const [isHapticSupported, setIsHapticSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPattern, setCurrentPattern] = useState(null);
  const [intensity, setIntensity] = useState([0.7]);
  const [enableSound, setEnableSound] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customPattern, setCustomPattern] = useState('100,100,100');
  const [patternStats, setPatternStats] = useState({});
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

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
          setSecurityStatus({
            safe: cspResult.valid,
            threats: cspResult.violations?.length || 0,
            mlComplexity: cspResult.mlComplexity || 0
          });
        }

        const supported = 'vibrate' in navigator;
        setIsHapticSupported(supported);
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        
        mlDataCollector.record('haptic_feedback_visit', {
          feature: 'haptic_feedback',
          supported: supported,
          deviceType: isMobile ? 'mobile' : 'desktop',
          timestamp: Date.now()
        });

        try {
          const savedStats = localStorage.getItem('haptic_pattern_stats');
          if (savedStats && mounted) {
            setPatternStats(JSON.parse(savedStats));
          }
        } catch (e) {
          console.warn('Failed to load haptic stats:', e);
        }

      } catch (error) {
        console.error('Initialization failed:', error);
      } finally {
        if (mounted) {
          setIsPageLoading(false);
        }
      }
    };

    initializePage();
  }, []);

  const playHapticPattern = async (pattern, patternIntensity = 1.0) => {
    if (!isHapticSupported) {
      alert('⚠️ Haptic feedback not supported on this device. Try on a mobile device or modern gamepad.');
      return;
    }

    setIsPlaying(true);
    setCurrentPattern(pattern);

    try {
      const adjustedPattern = pattern.pattern.map(duration => 
        Math.floor(duration * intensity[0] * patternIntensity)
      );

      navigator.vibrate(adjustedPattern);

      if (enableSound && typeof Audio !== 'undefined') {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        adjustedPattern.forEach((duration, idx) => {
          if (idx % 2 === 0) { 
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 200 + (idx * 50); 
            gainNode.gain.value = 0.1;
            
            const startTimeOffset = adjustedPattern.slice(0, idx).reduce((sum, d) => sum + d, 0) / 1000;
            oscillator.start(audioContext.currentTime + startTimeOffset);
            oscillator.stop(audioContext.currentTime + startTimeOffset + (duration / 1000));
          }
        });
      }

      const newStats = {
        ...patternStats,
        [pattern.name]: {
          count: (patternStats[pattern.name]?.count || 0) + 1,
          lastUsed: Date.now(),
          avgIntensity: patternStats[pattern.name]?.avgIntensity 
            ? (patternStats[pattern.name].avgIntensity + intensity[0]) / 2 
            : intensity[0]
        }
      };
      setPatternStats(newStats);
      localStorage.setItem('haptic_pattern_stats', JSON.stringify(newStats));

      const totalDuration = adjustedPattern.reduce((sum, duration) => sum + duration, 0);
      await new Promise(resolve => setTimeout(resolve, totalDuration + 100));

      mlDataCollector.record('haptic_played', {
        feature: 'haptic_feedback',
        pattern: pattern.name,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Haptic playback error:', error);
    } finally {
      setIsPlaying(false);
      setCurrentPattern(null);
    }
  };

  const playCustomPattern = () => {
    try {
      const pattern = customPattern.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
      
      if (pattern.length === 0) {
        alert('⚠️ Invalid pattern. Use comma-separated numbers (e.g., 100,50,200)');
        return;
      }

      playHapticPattern({
        name: 'Custom Pattern',
        pattern: pattern,
        intensity: 1.0,
        category: 'custom'
      });
    } catch (error) {
      alert('❌ Error parsing custom pattern');
    }
  };

  const stopVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate(0);
    }
    setIsPlaying(false);
    setCurrentPattern(null);
  };

  const filteredPatterns = Object.entries(hapticPatterns).filter(([key, pattern]) => 
    selectedCategory === 'all' || pattern.category === selectedCategory
  );

  const categories = [
    { value: 'all', label: 'All Patterns', icon: Waves },
    { value: 'affection', label: 'Affection', icon: Heart },
    { value: 'greeting', label: 'Greetings', icon: Hand },
    { value: 'notification', label: 'Notifications', icon: Zap },
    { value: 'connection', label: 'Connection', icon: Activity },
    { value: 'energy', label: 'Energy', icon: Radio },
    { value: 'wellness', label: 'Wellness', icon: Heart }
  ];

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-16 h-16 text-orange-400 animate-spin" />
        <p className="text-orange-500/70 font-mono text-sm tracking-widest animate-pulse">INITIALIZING ACTUATORS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-orange-500/30 selection:text-orange-100">
      
      {/* Decorative Grid Overlay Removed - Handled by Layout */}

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <NetworkErrorBanner />
        <AILearningBanner />
        <LimitLocker feature="haptic_feedback" featureKey="HAPTIC_FEEDBACK" user={currentUser} />

        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className="text-orange-400 hover:text-orange-300 hover:bg-orange-950/30 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Vibrate className="w-8 h-8 text-orange-500" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-500 animate-pulse">
                TACTILE MATRIX
              </span>
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-wider">
              Remote Touch • Actuator Control • AI Learning
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Hardware Link</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                {isHapticSupported ? '>> ACTUATOR CONNECTED' : '!! HARDWARE NOT FOUND'}
                            </p>
                        </div>
                    </div>
                    <Badge className={isHapticSupported ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-orange-500/20 text-orange-400 border border-orange-500/50"}>
                        {isHapticSupported ? 'ONLINE' : 'OFFLINE'}
                    </Badge>
                </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Preference Engine</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                {">>"} PATTERNS ANALYZED: {Object.keys(patternStats).length}
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">LEARNING</Badge>
                </CardContent>
            </Card>
        </div>
        
        <LiveSecurityDisplay />
        <LiveThreatDisplay />

        <Card className="bg-black/40 backdrop-blur-xl border border-blue-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5 p-6">
            <CardTitle className="text-white flex items-center gap-2 text-xl font-bold uppercase tracking-wide">
              <Info className="w-6 h-6 text-blue-400" />
              Actuation Protocol Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 text-sm text-slate-300 leading-relaxed font-light">
                    <strong className="text-blue-300 font-bold">Haptic Telemetry</strong> allows for remote transmission of physical sensation via the Web Vibration API. This system utilizes linear resonant actuators (LRAs) or eccentric rotating mass (ERM) motors to simulate touch, presence, and alerts.
                </div>
                
                <div className="flex-1 w-full p-4 bg-blue-950/10 border border-blue-500/20 rounded-lg flex flex-col items-center justify-center">
                     <div className="text-[10px] text-blue-400/70 border border-blue-500/30 rounded px-2 py-1 bg-black/30 font-mono">
                        
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono mt-2 uppercase">Mechanism Schematic</span>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border border-orange-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-orange-900/20 bg-orange-950/10 p-6">
            <CardTitle className="text-orange-400 flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
              <Activity className="w-4 h-4" />
              Feedback Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-white font-bold text-xs uppercase">Signal Intensity</Label>
                <Badge className="bg-orange-500 text-white font-mono">{Math.round(intensity[0] * 100)}%</Badge>
              </div>
              <Slider
                value={intensity}
                onValueChange={(v) => setIntensity(v)}
                min={0.1}
                max={1.0}
                step={0.1}
                disabled={isPlaying}
                className="py-2"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded border border-orange-500/20">
                    <Radio className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                    <Label className="text-white font-bold text-xs uppercase block">Audio Sync</Label>
                    <p className="text-[10px] text-slate-400 font-mono">Generate tone with vibration</p>
                </div>
              </div>
              <Switch
                checked={enableSound}
                onCheckedChange={(v) => setEnableSound(v)}
                disabled={isPlaying}
                className="data-[state=checked]:bg-orange-500"
              />
            </div>
            
            {isPlaying && (
                <Button
                  onClick={stopVibration}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold animate-pulse border border-red-500/50"
                >
                  ABORT SIGNAL
                </Button>
            )}
          </CardContent>
        </Card>

        <div>
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {categories.map(cat => (
                <Button
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={selectedCategory === cat.value 
                    ? "bg-purple-600 hover:bg-purple-700 text-white font-bold border-purple-500" 
                    : "border-slate-700 bg-slate-900/30 text-slate-400 hover:text-white hover:border-purple-500/50 hover:bg-purple-900/20 font-mono text-[10px] uppercase"}
                >
                    {cat.label}
                </Button>
            ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredPatterns.map(([key, pattern]) => {
                const stats = patternStats[pattern.name];
                return (
                <Card
                    key={key}
                    className={`bg-black/40 border ${currentPattern?.name === pattern.name ? 'border-purple-500 shadow-[0_0_20px_#a855f7]' : 'border-slate-800 hover:border-purple-500/50'} transition-all cursor-pointer group backdrop-blur-md`}
                    onClick={() => playHapticPattern(pattern)}
                >
                    <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-slate-900 rounded-lg border border-slate-700 group-hover:border-purple-500/30 transition-colors">
                            <MousePointer className={`w-5 h-5 ${currentPattern?.name === pattern.name ? 'text-white animate-bounce' : 'text-purple-400'}`} />
                        </div>
                        {stats && (
                             <Badge variant="outline" className="text-[9px] border-cyan-500/30 text-cyan-400 font-mono">
                                USED {stats.count}X
                             </Badge>
                        )}
                    </div>
                    <h3 className="text-white font-bold text-sm uppercase mb-1 group-hover:text-purple-300 transition-colors">{pattern.name}</h3>
                    <p className="text-slate-400 text-xs font-light mb-4 line-clamp-2">{pattern.description}</p>
                    <div className="flex items-center gap-2">
                         <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-purple-500" style={{width: `${pattern.intensity * 100}%`}}></div>
                         </div>
                         <span className="text-[9px] text-purple-400 font-mono">{Math.round(pattern.intensity * 100)}% PWR</span>
                    </div>
                    </CardContent>
                </Card>
                );
            })}
            </div>
        </div>

        <Card className="bg-gradient-to-br from-cyan-950/50 to-blue-950/50 border border-cyan-500/30 rounded-2xl overflow-hidden backdrop-blur-xl">
          <CardHeader className="border-b border-cyan-500/20 p-6">
            <CardTitle className="text-white flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
              <Brain className="w-5 h-5 text-cyan-400" />
              Custom Waveform Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <div className="flex flex-col md:flex-row gap-6 items-center">
                 <div className="flex-1 w-full">
                    <Label className="text-cyan-300 text-xs font-bold uppercase mb-2 block">Pattern Sequence (ms)</Label>
                    <input
                        type="text"
                        value={customPattern}
                        onChange={(e) => setCustomPattern(e.target.value)}
                        placeholder="100,50,200,50,300"
                        className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all"
                        disabled={isPlaying}
                    />
                    <p className="text-[10px] text-slate-400 mt-2 font-mono">
                        FORMAT: VIBRATE, PAUSE, VIBRATE, PAUSE...
                    </p>
                 </div>
                 
                <div className="flex-1 w-full p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-lg flex flex-col items-center justify-center">
                     <div className="text-[10px] text-cyan-400/70 border border-cyan-500/30 rounded px-2 py-1 bg-black/30 font-mono">
                        [Image of vibration waveform pattern graph]
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono mt-2 uppercase">Visual Representation</span>
                </div>
            </div>

            <Button
              onClick={playCustomPattern}
              disabled={isPlaying || !isHapticSupported}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm tracking-widest h-12 shadow-lg shadow-cyan-900/20"
            >
              <Zap className="w-4 h-4 mr-2" />
              TEST SEQUENCE
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}