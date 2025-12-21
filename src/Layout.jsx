
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, Zap, BarChart3, Music, Upload, LineChart, FileMusic, Sparkles, TrendingUp, RefreshCw, Settings, LogOut, Mic, Video, Globe, Shield, FileText, Clock, Search, History, Vibrate, Volume2, VolumeX, BookOpen, AlertCircle, Lock, Rocket, Code, Users, Waves, Brain, Cookie, AlertTriangle, Network, Binary, Terminal, GripVertical, MessageCircle, PanelLeftClose, PanelLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import GlobalAIAssistant from "@/components/shared/GlobalAIAssistant";
import NavigationArrows from "@/components/shared/NavigationArrows";
import LiveClock from "@/components/shared/LiveClock";
import { audioEngine } from "@/components/shared/AudioSynthEngine";

import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { blockScriptInjection, validateCSP } from "@/components/shared/SecurityValidator";
import GlobalStyles from "@/components/shared/GlobalStyles";

import LegalGate from "@/components/shared/LegalGate";
import { TutorialProvider, useTutorial } from "@/components/shared/TutorialSystem";
import { HelpCircle } from "lucide-react";
import { setupGlobalNetworkHandler } from "@/components/shared/NetworkErrorHandler";
import MeditativePlayer from "@/components/shared/MeditativePlayer";
import CodeProtection from "@/components/shared/CodeProtection";
import UsageRulesModal from "@/components/shared/UsageRulesModal";
import { useUsageLimits } from "@/components/shared/useUsageLimits";
import { checkFeatureAccess, isFeatureLocked, SUBSCRIPTION_TIERS } from "@/components/shared/subscriptionSystem";
import ParticleSystem, { getParticlesEnabled, setParticlesEnabled } from "@/components/shared/ParticleSystem";
import HolographicBackground from "@/components/shared/HolographicBackground";
import { fetchUserWithCache, clearUserCache } from "@/components/shared/userCache";

const STATIC_NAVIGATION_ITEMS = [
  { title: "Home", url: createPageUrl("Landing"), icon: Zap, featureKey: 'HOME' },
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: BarChart3, featureKey: 'DASHBOARD' },
  {
    title: "Analysis Types",
    icon: Music,
    children: [
      { title: "Track Analysis", url: createPageUrl("Analyze"), icon: Upload, limitKey: 'analysis_uploads', featureKey: 'TRACK_ANALYSIS' },
      { title: "DSP Analysis", url: createPageUrl("DSPAlgorithms"), icon: Code, limitKey: 'dsp_analysis', featureKey: 'DSP_ALGORITHMS' },
      { title: "Rhythm Analysis", url: createPageUrl("AnalyzeRhythm"), icon: LineChart, limitKey: 'rhythm_analysis', featureKey: 'RHYTHM_ANALYSIS' },
      { title: "Sheet Music", url: createPageUrl("SheetMusic"), icon: FileMusic, limitKey: 'sheet_music', featureKey: 'SHEET_MUSIC' },
      { title: "Lyrics Retrieval", url: createPageUrl("LyricsRetrieval"), icon: FileText, featureKey: 'LYRICS_RETRIEVAL' },
      { title: "Lyrics Analyzer", url: createPageUrl("LyricsAnalyzer"), icon: Music, limitKey: 'lyrics_analyzer', featureKey: 'LYRICS_ANALYZER' },
      { title: "Emoji Lyrics", url: createPageUrl("EmojiLyrics"), icon: Sparkles, limitKey: 'emoji_lyrics', featureKey: 'EMOJI_LYRICS' },
      { title: "Genre Predictor", url: createPageUrl("GenrePredictor"), icon: TrendingUp, limitKey: 'genre_predictor', featureKey: 'GENRE_PREDICTOR' },
      { title: "AI Track Query", url: createPageUrl("TrackQuery"), icon: Sparkles, limitKey: 'track_query', featureKey: 'TRACK_QUERY' },
    ]
  },
  {
    title: "Business Tools",
    icon: TrendingUp,
    children: [
      { title: "Monetization Hub", url: createPageUrl("Monetization"), icon: TrendingUp, featureKey: 'MONETIZATION' },
      { title: "Market Research", url: createPageUrl("MarketResearch"), icon: BarChart3, featureKey: 'MARKET_RESEARCH' },
      { title: "Market Fit Analysis", url: createPageUrl("AnalyzeMarketFit"), icon: TrendingUp, limitKey: 'market_fit', featureKey: 'MARKET_FIT' },
      { title: "Time Series Analysis", url: createPageUrl("AnalyzeTimeSeries"), icon: LineChart, limitKey: 'time_series', featureKey: 'TIME_SERIES' },
      { title: "Industry Insights", url: createPageUrl("IndustryInsights"), icon: TrendingUp, featureKey: 'INDUSTRY_INSIGHTS' },
      { title: "Distribution & Promo", url: createPageUrl("DistributionPromotion"), icon: Rocket, featureKey: 'DISTRIBUTION' },
    ]
  },
  {
    title: "Creative Tools",
    icon: Sparkles,
    children: [
      { title: "Advanced Analytics", url: createPageUrl("AdvancedAnalytics"), icon: Sparkles, limitKey: 'advanced_analytics', featureKey: 'ADVANCED_ANALYTICS' },
      { title: "Studio Corrector", url: createPageUrl("StudioCorrector"), icon: Sparkles, featureKey: 'STUDIO_CORRECTOR' },
      { title: "Video Studio", url: createPageUrl("VideoStudio"), icon: Video, featureKey: 'VIDEO_STUDIO' },
      { title: "ProRes 4K Engine", url: createPageUrl("SpectroModelProRes4K"), icon: Video, featureKey: 'PRORES_4K' },
      { title: "Lyric Video Generator", url: createPageUrl("VideoGenerator"), icon: Video, featureKey: 'VIDEO_GENERATOR' },
      { title: "SpectroVerse", url: createPageUrl("SpectroVerse"), icon: Globe, featureKey: 'SPECTROVERSE' },
      { title: "Artist Vault", url: createPageUrl("ArtistVault"), icon: Shield, featureKey: 'ARTIST_VAULT' },
    ]
  },
  {
    title: "Recent Analyses",
    icon: BarChart3,
    children: [
      { title: "View All Analyses", url: createPageUrl("Analyze"), icon: BarChart3, featureKey: 'RECENT_ANALYSES' },
    ]
  },
  {
    title: "Collaboration",
    icon: Globe,
    children: [
      { title: "Projects", url: createPageUrl("Projects"), icon: FileMusic, showLoader: true, featureKey: 'PROJECTS' },
    ]
  },
  {
    title: "Resources",
    icon: FileMusic,
    children: [
      { title: "African Research Library", url: createPageUrl("MusicResearch"), icon: BookOpen, featureKey: 'AFRICAN_RESEARCH' },
      { title: "Music Education", url: createPageUrl("MusicEducation"), icon: Music, featureKey: 'MUSIC_EDUCATION' },
      { title: "Company Copyright & IP", url: createPageUrl("CompanyCopyright"), icon: Shield, featureKey: 'COMPANY_COPYRIGHT' },
      { title: "Copyright Registration", url: createPageUrl("CopyrightProtection"), icon: FileText, featureKey: 'COPYRIGHT_PROTECTION' },
      { title: "MP3 Converter", url: createPageUrl("AudioConverter"), icon: RefreshCw, limitKey: 'audio_converter', featureKey: 'AUDIO_CONVERTER' },
      { title: "Version History", url: createPageUrl("VersionHistory"), icon: History, featureKey: 'VERSION_HISTORY' },
      { title: "Haptic Feedback", url: createPageUrl("HapticFeedback"), icon: Vibrate, featureKey: 'HAPTIC_FEEDBACK' },
      { title: "Accessibility", url: createPageUrl("Accessibility"), icon: Settings, featureKey: 'ACCESSIBILITY' },
      { title: "Trends Analysis", url: createPageUrl("Trends"), icon: TrendingUp, featureKey: 'TRENDS' },
      { title: "Tech Advancements", url: createPageUrl("Advancements"), icon: Zap, featureKey: 'ADVANCEMENTS' },
      { title: "System Check", url: createPageUrl("SystemCheck"), icon: Settings, featureKey: 'SYSTEM_CHECK' },
    ]
  },
];

// Reusable Diagram Component for Layout
const LayoutDiagram = ({ type, label, color = "red" }) => {
  const colorMap = {
    red: "text-red-400 border-red-500/30 bg-red-950/30",
    amber: "text-amber-400 border-amber-500/30 bg-amber-950/30",
    blue: "text-blue-400 border-blue-500/30 bg-blue-950/30",
  };
  
  return (
    <div className="w-full h-48 bg-black/60 border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden group my-6 hover:border-white/20 transition-all">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="text-center z-10 p-6 relative">
        <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center animate-pulse border ${colorMap[color].replace('text-', 'border-').split(' ')[1]} bg-opacity-10`}>
          <Lock className={`w-6 h-6 ${colorMap[color].split(' ')[0]}`} />
        </div>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">Security Protocol</div>
        <Badge variant="outline" className={`font-mono text-sm py-1 px-4 mb-2 ${colorMap[color]}`}>
          &lt;{type} /&gt;
        </Badge>
        {label && <p className="text-slate-400 text-xs max-w-md mx-auto mt-2 font-mono">{label}</p>}
      </div>
    </div>
  );
};

export default function Layout({ children, currentPageName }) {
    const navigate = useNavigate();
    const [recentSearches, setRecentSearches] = React.useState([]);
    const [recentAnalyses, setRecentAnalyses] = React.useState([]);
    const [isLoadingRecents, setIsLoadingRecents] = React.useState(true);
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [soundEnabled, setSoundEnabled] = React.useState(true);
    const [networkError, setNetworkError] = React.useState(null);
    const [user, setUser] = React.useState(null);
    const [sidebarWidth, setSidebarWidth] = React.useState(256);
    const [isResizing, setIsResizing] = React.useState(false);
    const [sidebarExpanded, setSidebarExpanded] = React.useState(false);
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [particlesEnabled, setParticlesEnabledState] = React.useState(true);
    const minSidebarWidth = 200;
    const maxSidebarWidth = 500;

    const mlDataCollector = useMLDataCollector();
    const { isLocked } = useUsageLimits(user);

    // Handle sidebar resize
    const handleMouseDown = React.useCallback((e) => {
      e.preventDefault();
      setIsResizing(true);
    }, []);

    React.useEffect(() => {
      const handleMouseMove = (e) => {
        if (!isResizing) return;
        const newWidth = Math.min(Math.max(e.clientX, minSidebarWidth), maxSidebarWidth);
        setSidebarWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
      };

      if (isResizing) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      }

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }, [isResizing]);

  const navigationItems = React.useMemo(() => {
    const userTier = user?.subscription_tier || SUBSCRIPTION_TIERS.FREE;
    const paymentVerified = user?.payment_verified === true && user?.identity_verified === true;
    
    // For paid tiers, features only unlock if payment is verified
    const effectiveTier = (userTier !== SUBSCRIPTION_TIERS.FREE && !paymentVerified) 
      ? SUBSCRIPTION_TIERS.FREE 
      : userTier;
    
    return STATIC_NAVIGATION_ITEMS.map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.map(subItem => ({
            ...subItem,
            locked: subItem.featureKey ? isFeatureLocked(effectiveTier, subItem.featureKey) : false
          }))
        };
      }
      return { ...item, locked: item.featureKey ? isFeatureLocked(effectiveTier, item.featureKey) : false };
    });
  }, [user]);

  // SECURITY: Determine if current page is locked
  const isCurrentPageLocked = React.useMemo(() => {
    if (currentPageName === 'Landing' || currentPageName === 'Settings') return false;
    const targetUrl = createPageUrl(currentPageName);
    const findLockStatus = (items) => {
      for (const item of items) {
        if (item.url && (item.url === targetUrl || item.url.includes(`/${currentPageName}`))) {
          return item.locked;
        }
        if (item.children) {
          const childStatus = findLockStatus(item.children);
          if (childStatus !== null) return childStatus;
        }
      }
      return null;
    };
    const status = findLockStatus(navigationItems);
    return status === true;
  }, [currentPageName, navigationItems]);

  React.useEffect(() => {
    audioEngine.setEnabled(soundEnabled);
  }, [soundEnabled]);

  React.useEffect(() => {
    let isMounted = true;
    const loadRecents = async () => {
      try {
        setNetworkError(null);
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) console.warn('Web Audio API not supported');

        let userData = null;
        try {
          userData = await fetchUserWithCache();
          if (isMounted) {
            setUser(userData);
            setIsAuthenticated(!!userData);
          }
        } catch (userErr) {
          console.warn('User fetch/auth check failed:', userErr);
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }

        const searches = JSON.parse(localStorage.getItem('recent_searches') || '[]');
        if (isMounted) setRecentSearches(searches.slice(0, 5));
        
        if (userData) {
          try {
            const analyses = await Promise.race([
              base44.entities.MusicAnalysis.list('-created_date', 5),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]);
            if (isMounted) setRecentAnalyses(analyses || []);
          } catch (apiError) {
            console.warn('Failed to load analyses:', apiError);
          }
        }
        
        if (isMounted) setIsLoadingRecents(false);
      } catch (error) {
        console.error('Layout init error:', error);
        if (isMounted) {
          setIsLoadingRecents(false);
          setIsAuthenticated(false);
          setNetworkError(null);
        }
      }
    };

    loadRecents();

    const handleAnalysesDeleted = () => {
      if (isMounted) {
        setRecentAnalyses([]);
        setRecentSearches([]);
      }
    };

    window.addEventListener('analyses-deleted', handleAnalysesDeleted);
    return () => {
      isMounted = false;
      window.removeEventListener('analyses-deleted', handleAnalysesDeleted);
    };
  }, []);

  // THEME VALIDATOR - Check premium themes
  React.useEffect(() => {
    const userTier = user?.subscription_tier || SUBSCRIPTION_TIERS.FREE;
    const currentTheme = localStorage.getItem('spectromodel_theme') || 'purple';
    
    // Block gold/black themes for non-premium users
    if ((currentTheme === 'gold' || currentTheme === 'black') && userTier !== SUBSCRIPTION_TIERS.PREMIUM) {
      localStorage.setItem('spectromodel_theme', 'purple');
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: 'purple' } }));
    }
    
    mlDataCollector.record('theme_loaded', {
      feature: 'layout',
      theme: currentTheme,
      timestamp: Date.now()
    });
  }, [user, isLoadingRecents, mlDataCollector]);

  React.useEffect(() => {
    if (currentPageName && currentPageName !== "Landing") {
      mlDataCollector.record('navigation', {
        page: currentPageName,
        timestamp: Date.now()
      });
    }
  }, [currentPageName, mlDataCollector]);

  React.useEffect(() => {
    try {
      setupGlobalNetworkHandler();
      blockScriptInjection();
      validateCSP();
      mlDataCollector.record('security_initialized', { feature: 'layout', timestamp: Date.now() });
      // Initialize particles state
      setParticlesEnabledState(getParticlesEnabled());
      
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
        // Block Ctrl+Shift+U (View Source alternative)
        if (e.ctrlKey && e.shiftKey && e.key === 'U') {
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
      
      return () => {
        document.removeEventListener('keydown', blockCodeViewShortcuts, true);
        document.removeEventListener('contextmenu', blockContextMenu, true);
      };
    } catch (err) {
      console.warn('Security init warning:', err);
    }
  }, []);

  const toggleParticles = () => {
    const userTier = user?.subscription_tier || SUBSCRIPTION_TIERS.FREE;
    
    // Check if particle toggle is locked for free users
    if (isFeatureLocked(userTier, 'PARTICLE_SELECTOR')) {
      alert('Particle customization requires a Pro or Premium subscription.');
      return;
    }
    
    const newState = !particlesEnabled;
    setParticlesEnabledState(newState);
    setParticlesEnabled(newState);
    mlDataCollector.record('particles_toggled', { enabled: newState, timestamp: Date.now() });
  };

  const handleAction = (action) => {
    if (action === 'clear-cache') {
      if (confirm('🗑️ Clear browser cache and recent searches? (Previous versions will be preserved)')) {
        Object.keys(localStorage).forEach(key => {
          if (!key.startsWith('spectro_version_') && !key.startsWith('spectro_backup_')) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
        mlDataCollector.record('cache_cleared', { feature: 'layout', timestamp: Date.now() });
        alert('✅ Cache cleared! (Version history preserved)');
        window.location.reload();
      }
    }
  };

  const handleLogout = () => {
    clearUserCache();
    mlDataCollector.record('logout', { feature: 'layout', timestamp: Date.now() });
    try {
      base44.auth.logout();
    } catch (err) {
      window.location.href = createPageUrl("Landing");
    }
  };

  if (currentPageName === "Landing") {
    return (
      <ErrorBoundary>
        <GlobalStyles />
        <TutorialProvider user={user}>
          <LegalGate user={user} />
          {children}
        </TutorialProvider>
      </ErrorBoundary>
    );
  }

  // Check if particle/theme controls should be shown based on tier
  const userTier = user?.subscription_tier || SUBSCRIPTION_TIERS.FREE;
  const canCustomizeParticles = !isFeatureLocked(userTier, 'PARTICLE_SELECTOR');
  const canCustomizeThemes = !isFeatureLocked(userTier, 'THEME_CUSTOMIZER');

  return (
    <ErrorBoundary>
      <GlobalStyles />
      <TutorialProvider user={user}>
        <CodeProtection />
        <LegalGate user={user} />
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-[#030014] touch-manipulation relative overflow-hidden font-sans text-slate-200">
            {/* --- HOLOGRAPHIC BACKGROUND - THEME AWARE --- */}
            <HolographicBackground />
            <ParticleSystem />

            <div className="relative z-10 flex w-full">
              {/* GLASSMORPHIC COMMAND RAIL SIDEBAR */}
              {sidebarOpen && (
                                  <Sidebar 
                                    className="border-r border-white/5 bg-white backdrop-blur-xl hidden md:flex flex-col shadow-2xl z-50 relative transition-all duration-300"
                                    style={{ width: sidebarWidth, minWidth: sidebarWidth, maxWidth: sidebarWidth }}
                                  >
                <SidebarContent className="bg-transparent flex flex-col h-full">
                  <SidebarGroup className="flex-1 overflow-y-auto min-h-0">
                    <SidebarGroupLabel className="px-3 py-0.5 h-6 flex items-center border-b border-black/5 mb-0 flex-shrink-0">
                                                <div className="flex items-center gap-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-black text-[10px] tracking-tight uppercase whitespace-nowrap overflow-hidden">
                                                  <Binary className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                                                  <span className="truncate">SpectroModel</span>
                                                </div>
                                              </SidebarGroupLabel>
                    <SidebarGroupContent className="px-2">
                      <SidebarMenu>
                        {navigationItems.map((item) => {
                          if (item.children) {
                            return (
                              <Collapsible key={item.title} className="group/collapsible">
                                <SidebarMenuItem>
                                  <CollapsibleTrigger asChild>
                                    <SidebarMenuButton className="hover:bg-black/5 text-slate-900 hover:text-cyan-600 transition-all duration-300 data-[state=open]:text-cyan-600 data-[state=open]:bg-black/5 rounded-lg my-0 py-0.5 font-bold text-xs">
                                      <item.icon className="w-3 h-3" />
                                      <span className="font-bold tracking-wide text-xs">{item.title}</span>
                                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 opacity-50 w-3 h-3" />
                                    </SidebarMenuButton>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <SidebarMenuSub className="border-l-white/10 ml-2 pl-0.5">
                                      {item.children.map((subItem) => {
                                        if (subItem.locked) {
                                          return (
                                            <SidebarMenuSubItem key={subItem.title}>
                                              <SidebarMenuSubButton 
                                                className="text-slate-500 cursor-not-allowed hover:bg-transparent flex items-center justify-between w-full py-0.5 px-1" 
                                                onClick={(e) => { e.preventDefault(); alert("🔒 This feature requires an upgraded subscription. Visit Monetization Hub to upgrade."); }}
                                              >
                                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                  <subItem.icon className="w-3 h-3 text-slate-500 flex-shrink-0" />
                                                  <span className="text-[10px] text-slate-500 truncate">{subItem.title}</span>
                                                </div>
                                                <Lock className="w-3 h-3 text-slate-500 flex-shrink-0 ml-1" />
                                              </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                          );
                                        }
                                        return (
                                          <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton asChild>
                                              <Link to={subItem.url} className="text-slate-700 hover:text-black hover:bg-black/5 transition-all rounded-md font-semibold py-0">
                                                <subItem.icon className="w-2.5 h-2.5" />
                                                <span className="text-[10px] font-bold">{subItem.title}</span>
                                              </Link>
                                            </SidebarMenuSubButton>
                                          </SidebarMenuSubItem>
                                        );
                                      })}
                                    </SidebarMenuSub>
                                  </CollapsibleContent>
                                </SidebarMenuItem>
                              </Collapsible>
                            );
                          }
                          
                          // Top-level locked items
                          if (item.locked) {
                            return (
                              <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton 
                                  className="text-slate-500 cursor-not-allowed hover:bg-transparent flex items-center justify-between w-full py-0.5"
                                  onClick={(e) => { e.preventDefault(); alert("🔒 This feature requires an upgraded subscription. Visit Monetization Hub to upgrade."); }}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <item.icon className="w-3 h-3 text-slate-500 flex-shrink-0" />
                                    <span className="text-xs text-slate-500 truncate">{item.title}</span>
                                  </div>
                                  <Lock className="w-3 h-3 text-slate-500 flex-shrink-0 ml-1" />
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          }
                          
                          return (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton asChild>
                                <Link to={item.url} className="hover:bg-black/5 text-slate-900 hover:text-cyan-600 transition-all rounded-lg my-0 py-0.5 font-bold text-xs">
                                  <item.icon className="w-3 h-3" />
                                  <span className="font-bold tracking-wide text-xs">{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}

                        {/* Settings Section - Directly after nav items */}
                        <div className="mt-24 pt-2 border-t border-black/10">
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                              <Link to={createPageUrl("Settings")} className="text-slate-600 hover:text-black hover:bg-black/5 text-xs py-0">
                                <Settings className="w-3 h-3" />
                                <span className="text-xs">System Config</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => setSoundEnabled(!soundEnabled)} className="text-slate-600 hover:text-cyan-600 hover:bg-black/5 cursor-pointer text-xs py-0">
                              {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                              <span className="text-xs">Audio: {soundEnabled ? 'ON' : 'OFF'}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          
                          {/* Particle toggle - locked for free users */}
                          <SidebarMenuItem>
                            <SidebarMenuButton 
                              onClick={toggleParticles} 
                              className={`${canCustomizeParticles ? 'text-slate-600 hover:text-purple-600 hover:bg-purple-500/10' : 'text-slate-500 cursor-not-allowed'} cursor-pointer text-xs py-0`}
                            >
                              <Sparkles className={`w-3 h-3 ${particlesEnabled && canCustomizeParticles ? 'text-purple-400' : ''}`} />
                              <span className="text-xs">Particles: {particlesEnabled ? 'ON' : 'OFF'}</span>
                              {!canCustomizeParticles && <Lock className="w-2.5 h-2.5 ml-auto text-slate-500" />}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          
                          <SidebarMenuItem>
                                            <SidebarMenuButton onClick={() => handleAction('clear-cache')} className="text-slate-600 hover:text-orange-600 hover:bg-orange-500/10 cursor-pointer text-xs py-0">
                                              <Cookie className="w-3 h-3" />
                                              <span className="text-xs">Clear Cache</span>
                                            </SidebarMenuButton>
                                          </SidebarMenuItem>
                                          <SidebarMenuItem>
                                            <SidebarMenuButton onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer text-xs py-0">
                                              <LogOut className="w-3 h-3" />
                                              <span className="text-xs">Disconnect</span>
                                            </SidebarMenuButton>
                                          </SidebarMenuItem>
                                          {/* AI Chat Toggle Button */}
                                                                          <SidebarMenuItem>
                                                                            <SidebarMenuButton 
                                                                              onClick={() => setSidebarExpanded(!sidebarExpanded)} 
                                                                              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 cursor-pointer text-xs py-0"
                                                                            >
                                                                              <MessageCircle className="w-3 h-3" />
                                                                              <span className="text-xs">{sidebarExpanded ? 'Hide AI Chat' : 'AI Chat'}</span>
                                                                            </SidebarMenuButton>
                                                                          </SidebarMenuItem>
                                        </div>
                      </SidebarMenu>
                      </SidebarGroupContent>
                      </SidebarGroup>

                      {/* AI Chatbot Section - Expandable */}
                      {sidebarExpanded && (
                      <div className="border-t border-black/10 p-2 flex-shrink-0">
                      <GlobalAIAssistant />
                      </div>
                      )}
                      </SidebarContent>

                      {/* Resize Handle */}
                      <div
                        onMouseDown={handleMouseDown}
                        className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize bg-transparent hover:bg-cyan-500/20 transition-colors flex items-center justify-center group z-[60]"
                        style={{ touchAction: 'none' }}
                        title="Drag to resize sidebar"
                      >
                        <div className="w-1.5 h-20 bg-slate-400 group-hover:bg-cyan-400 rounded-full transition-colors shadow-lg" />
                      </div>
                      </Sidebar>
              )}

              <div className={`flex-1 flex flex-col w-full min-w-0 touch-action-manipulation relative transition-all duration-300`}>
                {/* HUD STYLE HEADER */}
                <header className="h-12 sm:h-14 md:h-16 border-b border-black/10 bg-white backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-2 sm:px-4 md:px-6 shadow-lg safe-area-pt">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="text-slate-700 hover:text-cyan-600 hover:bg-cyan-100/50 p-1.5 sm:p-2 rounded-lg transition-all shrink-0"
                      title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                    >
                      {sidebarOpen ? <PanelLeftClose className="w-4 h-4 sm:w-5 sm:h-5" /> : <PanelLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                    <div className="hidden md:flex h-6 w-[1px] bg-black/10 shrink-0"></div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <h1 className="text-[10px] sm:text-xs md:text-sm font-black text-black uppercase tracking-wide flex items-center gap-1 truncate">
                        <span className="truncate">{currentPageName || 'DASHBOARD'}</span>
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-cyan-500 animate-pulse shrink-0"></span>
                      </h1>
                      <span className="text-[7px] sm:text-[8px] md:text-[10px] font-mono text-slate-600 font-bold truncate hidden xs:block">VER.2025.5</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
                    <Badge variant="outline" className="hidden lg:flex bg-purple-500/10 text-purple-400 border-purple-500/30 text-[8px] font-mono items-center gap-1 px-1.5 py-0.5">
                      <Brain className="w-2 h-2 animate-pulse" /> 
                      <span>AI</span>
                    </Badge>
                    
                    <div className="hidden sm:block">
                      <TutorialTrigger pageName={currentPageName} />
                    </div>
                    
                    <div className="hidden lg:block">
                      <LiveClock showDate={false} className="font-mono text-[10px] text-cyan-600 bg-cyan-100/50 px-2 py-0.5 rounded" />
                    </div>

                    <Button 
                      onClick={() => navigate(createPageUrl("Analyze"))} 
                      size="sm" 
                      className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase text-[9px] sm:text-[10px] md:text-xs px-2 sm:px-3 md:px-4 h-7 sm:h-8 md:h-9"
                    >
                      <Upload className="w-3 h-3" /> 
                      <span className="hidden sm:inline ml-1">Scan</span>
                    </Button>
                  </div>
                </header>

                <main className="flex-1 overflow-x-hidden pb-20 sm:pb-24 relative z-20 px-0">
                  {isCurrentPageLocked ? (
                    <div className="flex items-center justify-center min-h-[70vh] p-4 animate-in fade-in zoom-in duration-500">
                      <Card className="max-w-lg w-full bg-black/80 border border-red-500/30 backdrop-blur-xl shadow-[0_0_100px_-20px_rgba(220,38,38,0.2)] relative overflow-hidden">
                        {/* Scanning Line Animation */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent,rgba(220,38,38,0.1),transparent)] h-[200%] w-full animate-[scan_4s_linear_infinite] pointer-events-none"></div>
                        
                        <CardContent className="p-10 text-center relative z-10">
                          <div className="w-24 h-24 bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.3)] relative">
                             <div className="absolute inset-0 rounded-full border-t-2 border-red-500 animate-spin"></div>
                             <Lock className="w-10 h-10 text-red-500" />
                          </div>
                          
                          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest glitch-text" data-text="ACCESS DENIED">
                            ACCESS DENIED
                          </h2>
                          <p className="text-red-400 font-mono text-sm mb-8 uppercase tracking-widest">
                            Clearance Level Insufficient
                          </p>

                          <LayoutDiagram type="security_clearance_protocol" label="Authentication Gate: Level 5 Required" color="red" />
                          
                          <p className="text-slate-400 mb-8 leading-relaxed text-sm max-w-sm mx-auto">
                            {isAuthenticated 
                              ? "This neural sector requires higher clearance credentials. Please upgrade your access privileges." 
                              : "Biometric signature not found. Please authenticate to bypass security protocols."}
                          </p>
                          
                          <div className="space-y-4">
                            <Button 
                              onClick={() => {
                                if (!isAuthenticated) {
                                  navigate(createPageUrl('Landing'));
                                } else {
                                  navigate(createPageUrl('Monetization'));
                                }
                              }} 
                              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-6 uppercase tracking-widest shadow-lg shadow-red-900/20 border border-red-400/50"
                            >
                              {isAuthenticated ? "UPGRADE YOUR PLAN" : "INITIATE AUTHENTICATION"}
                            </Button>
                            {isAuthenticated && (
                              <Button variant="ghost" onClick={() => navigate(createPageUrl('Dashboard'))} className="w-full text-slate-500 hover:text-white hover:bg-white/5 font-mono text-xs">
                                {`< RETURN_TO_DASHBOARD />`}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                      {children}
                    </div>
                  )}
                </main>
              </div>
            </div>
          </div>
          <NavigationArrows />
          <MeditativePlayer />
        </SidebarProvider>
      </TutorialProvider>
    </ErrorBoundary>
  );
}

function TutorialTrigger({ pageName }) {
  const { startTutorial, suggestTutorial } = useTutorial();
  const [shouldSuggest, setShouldSuggest] = React.useState(false);

  React.useEffect(() => {
    if (suggestTutorial(pageName)) {
      setShouldSuggest(true);
    }
  }, [pageName, suggestTutorial]);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className={`text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/30 ${shouldSuggest ? 'animate-pulse text-cyan-400' : ''}`}
      onClick={() => startTutorial(pageName)}
      title="System Tutorial"
    >
      <HelpCircle className="w-5 h-5" />
    </Button>
  );
}
