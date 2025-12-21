import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music, BarChart3, Activity, Zap, TrendingUp, Shield, CheckCircle, AlertTriangle, FileText, Users, Video, Youtube, Twitter, Instagram, Facebook, Linkedin, Mail, Trophy, BrainCircuit, LineChart, PieChart, Lock, Server, Globe, Flame } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fetchUserWithCache, clearUserCache } from "@/components/shared/userCache";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { NetworkErrorBanner, AILearningBanner } from "@/components/shared/NetworkErrorHandler";

// --- PARTICLE SYSTEM ---
const ParticleSystem = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 4 + 2 + "px";
      const left = Math.random() * 100 + "%";
      const duration = Math.random() * 10 + 10 + "s";
      const delay = Math.random() * 5 + "s";
      // Randomize vibrant colors
      const colors = ["#06B6D4", "#A855F7", "#F59E0B", "#10B981"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return (
        <div
          key={i}
          className="particle"
          style={{
            width: size,
            height: size,
            left: left,
            backgroundColor: color,
            "--duration": duration,
            "--delay": delay,
            boxShadow: `0 0 10px ${color}`
          }}
        />
      );
    });
  }, []);

  return <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">{particles}</div>;
};

export default function LandingPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  // Security status
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0 });

  useEffect(() => {
    checkUserStatus();
  }, []);

  // ENHANCED: Security + ML Learning on Landing Page
  useEffect(() => {
    try {
      // Initialize security
      blockScriptInjection();
      const cspResult = validateCSP();
      setSecurityStatus({
        safe: cspResult.valid,
        threats: cspResult.violations?.length || 0
      });
      
      // ML learns from landing page visits
      mlDataCollector.record('landing_visit', {
        feature: 'landing',
        timestamp: Date.now(),
        securityStatus: cspResult.valid ? 'safe' : 'threats_detected',
        aiLearningActive: true
      });
      
      // Block keyboard shortcuts that reveal code/source
      const blockCodeViewShortcuts = (e) => {
        // Block Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Block Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Block Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Block Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Block F12 (DevTools)
        if (e.key === 'F12') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Block Ctrl+S (Save Page)
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };
      
      // Block right-click context menu
      const blockContextMenu = (e) => {
        e.preventDefault();
        return false;
      };
      
      document.addEventListener('keydown', blockCodeViewShortcuts, true);
      document.addEventListener('contextmenu', blockContextMenu, true);
      
      console.log('✅ Landing page security initialized');
      
      return () => {
        document.removeEventListener('keydown', blockCodeViewShortcuts, true);
        document.removeEventListener('contextmenu', blockContextMenu, true);
      };
    } catch (error) {
      console.error('Security init failed:', error);
    }
  }, []);

  const checkUserStatus = async () => {
    try {
      if (!navigator.onLine) {
        setIsCheckingUser(false);
        return;
      }
      const currentUser = await Promise.race([
        fetchUserWithCache(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 8000))
      ]);
    } catch (error) {
      console.log("User check skipped:", error.message);
    } finally {
      setIsCheckingUser(false);
    }
  };

  const handleAcceptTerms = async () => {
    if (!termsAccepted) {
      alert("Please check the box to accept the Terms and Conditions");
      return;
    }
    try {
      await base44.auth.updateMe({ terms_accepted: true });
      clearUserCache();
      setShowTermsDialog(false);
      alert("✓ Terms accepted! You can now access the app.");
    } catch (error) {
      alert("Network error. Please check your connection and try again.");
    }
  };

  const handleGetStarted = async () => {
    navigate(createPageUrl("Dashboard"));
  };

  // Timeout safety
  useEffect(() => {
    const timeout = setTimeout(() => setIsCheckingUser(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  if (isCheckingUser) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-cyber-grid opacity-20"></div>
        <div className="orb w-96 h-96 bg-purple-600/30 blur-[100px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <BrainCircuit className="w-20 h-20 text-cyan-400 animate-pulse relative z-10" />
        <p className="text-cyan-200/50 mt-4 font-mono text-sm tracking-widest relative z-10">INITIALIZING NEURAL LINK...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&family=JetBrains+Mono:wght@400;700&display=swap');
      body { 
        font-family: 'Inter', sans-serif; 
        background-color: #030014; 
        overflow-x: hidden; 
        -webkit-overflow-scrolling: touch;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      * { 
        box-sizing: border-box;
        -webkit-writing-mode: horizontal-tb !important;
        writing-mode: horizontal-tb !important;
      }
      /* Landscape phone optimization */
      @media (orientation: landscape) and (max-height: 500px) {
        .hero-title { font-size: 12vw !important; line-height: 1 !important; }
        .hero-section { padding-top: 1rem !important; padding-bottom: 1rem !important; }
      }
      /* Tablet landscape */
      @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
        .hero-title { font-size: 14vw !important; }
      }
      /* Prevent vertical text globally */
      h1, h2, h3, h4, h5, h6, p, span, div, button, a {
        writing-mode: horizontal-tb !important;
        text-orientation: mixed !important;
        word-break: break-word;
        overflow-wrap: break-word;
      }
      .bg-cyber-grid { background-size: 50px 50px; background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px); mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%); -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%); }
      .orb { position: absolute; border-radius: 50%; filter: blur(80px); z-index: 0; opacity: 0.6; animation: float-orb 10s ease-in-out infinite; }
      @keyframes float-orb { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(30px, -50px); } 66% { transform: translate(-20px, 20px); } }
      .particle { position: absolute; border-radius: 50%; opacity: 0; animation: shimmer-rise var(--duration) ease-in-out infinite; animation-delay: var(--delay); bottom: -20px; }
      @keyframes shimmer-rise { 0% { transform: translateY(0) scale(0); opacity: 0; } 20% { opacity: 0.8; } 50% { opacity: 0.4; } 80% { opacity: 0.8; } 100% { transform: translateY(-120vh) scale(1.5); opacity: 0; } }
      .spectro-title { background-image: linear-gradient(-45deg, #FFD700, #F59E0B, #06B6D4, #10B981, #3B82F6, #D946EF, #FFD700); background-size: 300% 300%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: spectral-flow 2s linear infinite; filter: drop-shadow(0 0 30px rgba(250, 204, 21, 0.3)); }
      @keyframes spectral-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      .glass-panel { background: rgba(10, 10, 15, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); }
      .card-flamboyant { background: rgba(10, 10, 15, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; overflow: hidden; }
      .card-flamboyant:hover { transform: translateY(-10px) rotateX(2deg) rotateY(2deg) scale(1.02); box-shadow: 0 20px 50px -10px rgba(6, 182, 212, 0.3); border-color: rgba(6, 182, 212, 0.5); background: rgba(15, 15, 25, 0.8); }
      .card-flamboyant::before { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent); transform: skewX(-25deg); transition: 0s; z-index: 10; pointer-events: none; }
      .card-flamboyant:hover::before { left: 150%; transition: 0.7s ease-in-out; }
      .btn-flamboyant { background: linear-gradient(90deg, #06B6D4, #3B82F6, #8B5CF6, #F59E0B, #06B6D4); background-size: 300% 300%; animation: gradient-shift 3s ease infinite, pulse-neon 2s infinite; position: relative; z-index: 1; border: none; }
      .btn-flamboyant:hover { transform: scale(1.05); animation: gradient-shift 1s ease infinite, pulse-neon-fast 1s infinite; }
      @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      @keyframes pulse-neon { 0% { box-shadow: 0 0 10px rgba(6,182,212,0.5); } 50% { box-shadow: 0 0 25px rgba(6,182,212,0.8), 0 0 5px rgba(255,255,255,0.5); } 100% { box-shadow: 0 0 10px rgba(6,182,212,0.5); } }
      @keyframes pulse-neon-fast { 0% { box-shadow: 0 0 15px rgba(6,182,212,0.6); } 50% { box-shadow: 0 0 35px rgba(6,182,212,1), 0 0 10px rgba(255,255,255,0.8); } 100% { box-shadow: 0 0 15px rgba(6,182,212,0.6); } }
      .icon-flamboyant { animation: icon-glow-pulse 3s infinite ease-in-out; }
      @keyframes icon-glow-pulse { 0%, 100% { filter: drop-shadow(0 0 15px rgba(250,204,21,0.4)); transform: scale(1); } 50% { filter: drop-shadow(0 0 40px rgba(6,182,212,0.8)) drop-shadow(0 0 15px rgba(249,115,22,0.6)); transform: scale(1.05); } }
      .animate-float { animation: float 6s ease-in-out infinite; }
      @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
      .animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
      <div className="min-h-screen bg-[#030014] text-slate-200 overflow-x-hidden relative selection:bg-cyan-500/30 selection:text-cyan-100">
        
        {/* --- BACKGROUND FX --- */}
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-cyber-grid opacity-20"></div>
            <div className="orb w-[600px] h-[600px] bg-purple-900/10 top-[-10%] left-[-10%] mix-blend-screen"></div>
            <div className="orb w-[500px] h-[500px] bg-cyan-900/10 bottom-[10%] right-[-5%] animation-delay-2000 mix-blend-screen"></div>
            <div className="orb w-[400px] h-[400px] bg-yellow-600/10 top-[40%] right-[30%] animation-delay-4000 mix-blend-screen"></div>
        </div>
        
        <ParticleSystem />

        <div className="relative z-10 container mx-auto px-4 py-6 md:py-8">
          
          {/* --- NAVBAR --- */}
          <header className="flex justify-between items-center mb-8 sm:mb-12 md:mb-16 glass-panel rounded-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 sticky top-2 sm:top-4 z-50 transition-all hover:bg-black/80">
             <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-yellow-400 to-cyan-400 rounded-lg p-1 shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                    <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                </div>
                <span className="font-bold text-white tracking-wider hidden sm:block text-sm md:text-base">SPECTRO<span className="text-cyan-400">MODEL</span></span>
             </div>
             <div className="flex items-center gap-2 sm:gap-4">
                <Button 
                   variant="ghost" 
                   onClick={() => base44.auth.redirectToLogin(createPageUrl("Analyze"))} 
                   className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full text-xs sm:text-sm px-2 sm:px-4"
                 >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate(createPageUrl("Dashboard"))} 
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full px-3 sm:px-6 text-xs sm:text-sm shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all hover:scale-105 sm:hover:scale-110 hover:shadow-[0_0_25px_rgba(6,182,212,0.8)]"
                >
                  Dashboard
                </Button>
             </div>
          </header>

          <NetworkErrorBanner />
          <AILearningBanner />
          
          {/* --- HUD SECURITY STATUS --- */}
          <div className="mb-8 sm:mb-12 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 opacity-80 hover:opacity-100 transition-opacity px-2 sm:px-0">
            <div className="glass-panel rounded-lg sm:rounded-xl p-1 flex items-center justify-between px-3 sm:px-4 py-2 border-l-4 border-l-green-500 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
               <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 animate-pulse shrink-0" />
                  <span className="font-mono text-[10px] sm:text-xs text-green-400 tracking-wider sm:tracking-widest truncate">SYSTEM ONLINE</span>
               </div>
               <span className="font-mono text-[10px] sm:text-xs text-slate-500 shrink-0 ml-2">12ms</span>
            </div>
            <div className="glass-panel rounded-lg sm:rounded-xl p-1 flex items-center justify-between px-3 sm:px-4 py-2 border-l-4 border-l-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
               <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
                  <span className="font-mono text-[10px] sm:text-xs text-purple-400 tracking-wider sm:tracking-widest truncate">AI SENTINEL</span>
               </div>
               <div className="flex gap-0.5 sm:gap-1 shrink-0 ml-2">
                 {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-0.5 sm:w-1 h-2 sm:h-3 bg-purple-500/50 rounded-sm"></div>
                 ))}
               </div>
            </div>
          </div>

          {/* --- HERO SECTION --- */}
          <div className="text-center max-w-7xl mx-auto py-10 md:py-20 relative">
            <div className="flex flex-col items-center justify-center gap-8 mb-10 relative">
              
              {/* Animated Rings behind logo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border-2 border-cyan-500/10 rounded-full animate-[spin_10s_linear_infinite] opacity-50"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-dashed border-purple-500/20 rounded-full animate-[spin_20s_linear_infinite_reverse] opacity-50"></div>
              
              <div className="relative group animate-float z-10">
                <div className="absolute -inset-8 bg-gradient-to-r from-yellow-500 via-orange-500 to-cyan-500 rounded-full blur-3xl opacity-40 group-hover:opacity-80 transition duration-500"></div>
                <div className="relative p-12 md:p-16 bg-black/80 rounded-full ring-2 ring-white/10 shadow-2xl backdrop-blur-sm">
                  {/* Flamboyant Phoenix/Flame Icon */}
                  <div className="relative">
                    <Flame className="w-48 h-48 md:w-80 md:h-80 text-transparent stroke-[1.5px] icon-flamboyant" 
                      style={{ 
                        stroke: "url(#gradient-icon)", 
                        fill: "none"
                      }} 
                    />
                    <svg width="0" height="0">
                      <linearGradient id="gradient-icon" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFD700">
                           <animate attributeName="stop-color" values="#FFD700;#F97316;#06B6D4;#8B5CF6;#FFD700" dur="4s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="#06B6D4">
                           <animate attributeName="stop-color" values="#06B6D4;#8B5CF6;#FFD700;#F97316;#06B6D4" dur="4s" repeatCount="indefinite" />
                        </stop>
                      </linearGradient>
                    </svg>
                  </div>
                </div>
              </div>

              <h1 className="hero-title font-black text-white tracking-tighter spectro-title break-words w-full z-10 select-none mt-6 sm:mt-10 drop-shadow-[0_0_50px_rgba(255,255,255,0.5)] text-[15vw] sm:text-[18vw] md:text-[20vw] leading-[0.85] max-w-full overflow-hidden">
                SPECTROMODEL
              </h1>
            </div>

            <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 font-bold mb-4 sm:mb-6 tracking-tight drop-shadow-md mt-4 sm:mt-8 px-2">
              The Quantum Leap in Music Analytics
            </p>
            
            <p className="text-sm sm:text-base md:text-lg text-slate-300 mb-8 sm:mb-12 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-md px-4">
              Predict commercial success with <span className="text-cyan-400 font-bold glow-text">98.4% accuracy</span> using our proprietary AI models trained on <span className="text-yellow-400 font-bold glow-text">175M+ streaming events</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4">
                <Button
                onClick={handleGetStarted}
                size="lg"
                className="btn-flamboyant text-white font-black px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-2xl rounded-xl sm:rounded-2xl w-full sm:w-auto group overflow-hidden max-w-xs sm:max-w-none"
                >
                <span className="relative z-10 flex items-center justify-center">
                  LAUNCH TERMINAL
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 group-hover:rotate-12 transition-transform text-yellow-300" />
                </span>
                </Button>
                
                <Button
                variant="outline"
                size="lg"
                className="px-8 sm:px-10 py-6 sm:py-8 text-base sm:text-xl rounded-xl sm:rounded-2xl border-white/10 hover:bg-white/5 text-slate-300 backdrop-blur-md w-full sm:w-auto hover:border-cyan-500/50 hover:text-cyan-400 transition-all hover:scale-105 max-w-xs sm:max-w-none"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                EXPLORE DATA
                </Button>
            </div>
          </div>

          {/* --- FEATURES GRID --- */}
          <div id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-12 sm:mt-20 md:mt-32 px-2 sm:px-4">
            
            {/* Card 1 */}
            <div className="card-flamboyant p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl group">
               <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10 group-hover:opacity-40 transition-opacity duration-500">
                  <Trophy className="w-20 sm:w-32 md:w-40 h-20 sm:h-32 md:h-40 text-yellow-400 rotate-12 blur-sm" />
               </div>
               <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-yellow-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-yellow-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                  <Trophy className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-yellow-400" />
               </div>
               <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 font-serif italic group-hover:text-yellow-300 transition-colors">Hit Prediction</h3>
               <p className="text-slate-400 leading-relaxed font-medium text-sm sm:text-base">
                 Our neural engine analyzes melody, lyrics, and rhythm to forecast Billboard potential.
               </p>
            </div>

            {/* Card 2 */}
            <div className="card-flamboyant p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl group">
               <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10 group-hover:opacity-40 transition-opacity duration-500">
                  <BrainCircuit className="w-20 sm:w-32 md:w-40 h-20 sm:h-32 md:h-40 text-cyan-400 rotate-12 blur-sm" />
               </div>
               <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-cyan-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-cyan-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <BrainCircuit className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-cyan-400" />
               </div>
               <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 font-serif italic group-hover:text-cyan-300 transition-colors">Sonic DNA</h3>
               <p className="text-slate-400 leading-relaxed font-medium text-sm sm:text-base">
                 Deconstruct songs into their molecular components: Groove, Timbre, and Harmony.
               </p>
            </div>

            {/* Card 3 */}
            <div className="card-flamboyant p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl group sm:col-span-2 lg:col-span-1">
               <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10 group-hover:opacity-40 transition-opacity duration-500">
                  <Globe className="w-20 sm:w-32 md:w-40 h-20 sm:h-32 md:h-40 text-green-400 rotate-12 blur-sm" />
               </div>
               <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-green-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                  <Globe className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-400" />
               </div>
               <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 font-serif italic group-hover:text-green-300 transition-colors">Global Pulse</h3>
               <p className="text-slate-400 leading-relaxed font-medium text-sm sm:text-base">
                 Real-time ingestion of trend data from Spotify, TikTok, and Apple Music worldwide.
               </p>
            </div>
          </div>

          {/* --- SECONDARY FEATURES --- */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-2 sm:px-4">
              <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row gap-4 sm:gap-6 hover:bg-white/5 transition-colors border-l-4 border-l-purple-500">
                  <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
                        <span className="truncate">Team Sync</span>
                      </h3>
                      <p className="text-slate-400 text-xs sm:text-sm">Real-time multiplayer workspaces. Annotate waveforms together.</p>
                  </div>
                  <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2">
                         <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0" />
                         <span className="truncate">Vault Security</span>
                      </h3>
                      <p className="text-slate-400 text-xs sm:text-sm">AES-256 encryption. Your unreleased tracks never leave our secure enclave.</p>
                  </div>
              </div>
              <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl flex flex-col justify-center bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-500/30 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                 <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 flex-wrap">
                    <Badge className="bg-purple-500 hover:bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.5)] text-xs">AI BETA</Badge>
                    <span className="text-white font-bold text-sm sm:text-base">Generative Insights</span>
                 </div>
                 <p className="text-slate-300 italic text-xs sm:text-sm md:text-base">
                    "This bridge is too long. Try cutting 4 bars to increase retention by 15%."
                 </p>
              </div>
          </div>

          {/* --- WARNINGS --- */}
          <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 px-2 sm:px-4">
             <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border-red-500/20 bg-red-950/10 hover:border-red-500/50 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 animate-pulse-slow shrink-0" />
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-red-400 font-mono truncate">360 DEAL WARNING</h3>
                </div>
                <ul className="space-y-2 sm:space-y-3 text-red-200/80 font-mono text-xs sm:text-sm">
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0"/> <span>OWNS YOUR MASTERS FOREVER</span></li>
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0"/> <span>TAKES 50% OF MERCH & TOURING</span></li>
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0"/> <span>CROSS-COLLATERALIZED DEBT</span></li>
                </ul>
             </div>

             <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border-yellow-500/20 bg-yellow-950/10 hover:border-yellow-500/50 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 animate-pulse-slow shrink-0" />
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-400 font-mono truncate">COPYRIGHT PROTOCOL</h3>
                </div>
                <ul className="space-y-2 sm:space-y-3 text-yellow-200/80 font-mono text-xs sm:text-sm">
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 shrink-0"/> <span>SHA-256 TIMESTAMPING</span></li>
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 shrink-0"/> <span>AUTOMATIC REGISTRATION PREP</span></li>
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 shrink-0"/> <span>RAW FILES PURGED AFTER ANALYSIS</span></li>
                </ul>
             </div>
          </div>

          {/* --- FOOTER --- */}
          <div className="mt-16 sm:mt-24 md:mt-32 border-t border-white/10 pt-8 sm:pt-10 pb-12 sm:pb-20 relative z-10 px-2 sm:px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
                
                <div className="text-center md:text-left">
                    <h4 className="font-bold text-xl sm:text-2xl text-white mb-2">SPECTRO<span className="text-cyan-400">MODEL</span></h4>
                    <p className="text-slate-500 text-xs sm:text-sm">© 2025 SpectroModel ENT.</p>
                    <p className="text-slate-600 text-[10px] sm:text-xs mt-1 font-mono">Patent Pending • All Rights Reserved</p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all hover:scale-110 shadow-lg">
                        <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all hover:scale-110 shadow-lg">
                        <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all hover:scale-110 shadow-lg">
                        <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all hover:scale-110 shadow-lg">
                        <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                </div>
            </div>
            
            {/* Legal Links Grid - Mobile Optimized */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 text-[10px] sm:text-xs text-slate-500 font-mono">
                <button onClick={() => navigate(createPageUrl("Landing"))} className="hover:text-cyan-400 transition-colors text-center py-2 px-2 sm:px-3 rounded bg-white/5 hover:bg-white/10 truncate">HOME</button>
                <button onClick={() => navigate(createPageUrl("Terms"))} className="hover:text-cyan-400 transition-colors text-center py-2 px-2 sm:px-3 rounded bg-white/5 hover:bg-white/10 truncate">TERMS</button>
                <button onClick={() => navigate(createPageUrl("PrivacyPolicy"))} className="hover:text-cyan-400 transition-colors text-center py-2 px-2 sm:px-3 rounded bg-white/5 hover:bg-white/10 truncate">PRIVACY</button>
                <button onClick={() => navigate(createPageUrl("FAQ"))} className="hover:text-cyan-400 transition-colors text-center py-2 px-2 sm:px-3 rounded bg-white/5 hover:bg-white/10 truncate">FAQ</button>
                <button onClick={() => navigate(createPageUrl("CompanyCopyright"))} className="hover:text-amber-400 transition-colors text-center py-2 px-2 sm:px-3 rounded bg-white/5 hover:bg-white/10 truncate">COPYRIGHT</button>
                <button onClick={() => navigate(createPageUrl("LegalAudit"))} className="hover:text-amber-400 transition-colors text-center py-2 px-2 sm:px-3 rounded bg-white/5 hover:bg-white/10 truncate">LEGAL AUDIT</button>
                <button onClick={() => navigate(createPageUrl("Trademarks"))} className="hover:text-amber-400 transition-colors text-center py-2 px-2 sm:px-3 rounded bg-white/5 hover:bg-white/10 truncate">TRADEMARKS</button>
                <button onClick={() => navigate(createPageUrl("Patents"))} className="hover:text-amber-400 transition-colors text-center py-2 px-2 sm:px-3 rounded bg-white/5 hover:bg-white/10 truncate">PATENTS</button>
                <button onClick={() => navigate(createPageUrl("AuditLog"))} className="hover:text-blue-400 transition-colors text-center py-2 px-2 sm:px-3 rounded bg-white/5 hover:bg-white/10 truncate">AUDIT LOG</button>
                <button onClick={() => navigate(createPageUrl("Support"))} className="hover:text-cyan-400 transition-colors text-center py-2 px-2 sm:px-3 rounded bg-white/5 hover:bg-white/10 truncate">SUPPORT</button>
            </div>

            {/* Patent & IP Notice */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-[9px] sm:text-[10px] text-slate-600 font-mono uppercase tracking-wider max-w-2xl mx-auto leading-relaxed px-2">
                SpectroModel™, VibeVision™, SpectroVerse™ are Trademarks of SpectroModel ENT. | Patent Pending Application | 
                Protected by International Copyright & Trade Secret Laws | AI Learns From Your Data
              </p>
            </div>
          </div>

        </div>
      </div>

      <AlertDialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <AlertDialogContent className="glass-panel border-cyan-500/30 max-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cyan-400 font-mono text-2xl">ACCESS PROTOCOL</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 space-y-4">
              <p>Initialize connection by accepting terms.</p>
              <div className="bg-black/50 p-4 rounded border border-white/10 text-xs font-mono">
                <p>&gt; CHECKING AGE_REQ... PASS (5+)</p>
                <p>&gt; CHECKING ENCRYPTION... AES-256 ACTIVE</p>
                <p>&gt; CHECKING LEGAL... NO_360_DEALS DETECTED</p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(c) => setTermsAccepted(!!c)}
                  className="border-cyan-400 data-[state=checked]:bg-cyan-400 data-[state=checked]:text-black"
                />
                <label htmlFor="terms" className="text-white cursor-pointer text-sm hover:text-cyan-400 transition-colors">
                  I accept the Terms of Service & Privacy Protocols
                </label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleAcceptTerms}
              disabled={!termsAccepted}
              className="bg-cyan-500 text-black hover:bg-cyan-400 font-bold"
            >
              INITIALIZE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}