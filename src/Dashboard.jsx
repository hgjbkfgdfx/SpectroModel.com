import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { fetchUserWithCache } from "@/components/shared/userCache";
import { Card, CardContent, Button, Badge, cn } from "@/components/ui/index";
import { 
  Music, TrendingUp, BarChart3, Plus, Loader2, Activity, Code, Sparkles, 
  Shield, Brain, AlertCircle, Settings, FolderKanban, Users, Calendar as CalendarIcon, 
  ListTodo, Search, Lock, Trash2, Upload, LineChart, Zap, Crown, MessageCircle,
  Eye, EyeOff, X, Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";


import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Imports from our generated widgets
import { StatsCards, CategoryFilters, RecentAnalyses, TopTracks, AdvancedChartWidget } from "@/components/dashboard_widgets";

import ProjectCard from "@/components/collaboration/ProjectCard";
import { 
  validateCSP, blockScriptInjection, useMLDataCollector, 
  useCodeIntegrityProtector
} from "@/components/shared/SecurityComponents";
import GlobalAIAssistant from "@/components/shared/GlobalAIAssistant";
import { SUBSCRIPTION_TIERS, isFeatureLocked, isSubscriptionExpired } from "@/components/shared/subscriptionSystem";

// Dashboard Background (no particles - particles handled by Layout)
const DashboardBackground = () => (
  <div className="fixed inset-0 pointer-events-none -z-40">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
  </div>
);

export default function DashboardPage() {
  const mlDataCollector = useMLDataCollector();
  const codeIntegrity = useCodeIntegrityProtector();
  
  const [analyses, setAnalyses] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [networkError, setNetworkError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const [dashboardLayout, setDashboardLayout] = useState(null);
  const [projects, setProjects] = useState([]);
  const [pinnedProjects, setPinnedProjects] = useState([]);
  const [visibleWidgets, setVisibleWidgets] = useState({
    stats: true,
    recent_analyses: true,
    top_tracks: true,
    projects: true,
    tasks: true,
    activity: true,
    quick_actions: true,
    calendar: true
  });
  const [quickActions, setQuickActions] = useState([
    'track_analysis', 'rhythm_analysis', 'dsp_algorithms', 'genre_hit_predictor'
  ]);
  const [sortBy, setSortBy] = useState('date_desc');
  const [showDate, setShowDate] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showCustomizeBar, setShowCustomizeBar] = useState(false);

  const navigate = useNavigate();
  
  const [securityStatus, setSecurityStatus] = useState({ 
    safe: true, 
    threats: 0, 
    mlComplexity: 0, 
    lastCheck: Date.now()
  });

  const [sessionStartTime] = useState(Date.now());
  const analysesRef = React.useRef(analyses);
  const selectedCategoryRef = React.useRef(selectedCategory);

  useEffect(() => {
    analysesRef.current = analyses;
    selectedCategoryRef.current = selectedCategory;
  }, [analyses, selectedCategory]);

  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setNetworkError("Loading timed out.");
      }
    }, 8000);
    return () => clearTimeout(safetyTimeout);
  }, [isLoading]);

  const loadAnalyses = async () => {
    try {
      setNetworkError(null);

      const [data, projectsData] = await Promise.all([
        base44.entities.MusicAnalysis.list('-created_date', 50),
        base44.entities.CollaborationProject.list('-created_date', 10)
      ]);
      
      const validAnalyses = Array.isArray(data) ? data : [];

      setAnalyses(validAnalyses);
      setProjects(projectsData || []);
      setDashboardLayout(null);

      setPinnedProjects(JSON.parse(localStorage.getItem('pinned_projects') || '[]'));

      mlDataCollector.record('dashboard_analyses_loaded', {
        feature: 'dashboard',
        analysisCount: validAnalyses.length,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("❌ Failed to load analyses:", error);
      setNetworkError("Failed to establish neural link.");
    } finally {
      setIsLoading(false);
    }
  };

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
            mlComplexity: cspResult.mlComplexity || 0,
            lastCheck: Date.now()
          });
        }

        const userData = await fetchUserWithCache();
        
        if (mounted) {
          setUser(userData);
          setIsAdmin(userData?.role === 'admin');
          setIsAuthenticated(!!userData);
        }

        await loadAnalyses();
      } catch (error) {
        console.error('❌ Initialization failed:', error);
        if (mounted) {
          setIsLoading(false);
          setNetworkError("Auth handshake failed.");
        }
      }
    };

    initializePage();

    return () => {
      mounted = false;
      const sessionDuration = Date.now() - sessionStartTime;
      mlDataCollector.record('dashboard_session_end', {
        sessionDuration,
        timestamp: Date.now()
      });
    };
  }, []);

  useEffect(() => {
    let filtered = [...analyses];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.analysis_type === selectedCategory);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.created_date) - new Date(b.created_date);
        case 'name_asc':
          return (a.track_name || '').localeCompare(b.track_name || '');
        case 'name_desc':
          return (b.track_name || '').localeCompare(a.track_name || '');
        case 'score_desc':
          return (b.hit_score || 0) - (a.hit_score || 0);
        case 'score_asc':
          return (a.hit_score || 0) - (b.hit_score || 0);
        case 'date_desc':
        default:
          return new Date(b.created_date) - new Date(a.created_date);
      }
    });
    
    setFilteredAnalyses(filtered);
  }, [analyses, selectedCategory, sortBy]);

  const handleResetStats = async () => {
    if (confirm("⚠️ SYSTEM PURGE: RESET DASHBOARD?")) {
      setAnalyses([]);
      setFilteredAnalyses([]);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    loadAnalyses();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-black flex flex-col items-center justify-center p-4 overflow-hidden relative">
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mb-6 mx-auto relative">
             <div className="absolute inset-0 border-4 border-cyber-panel rounded-full"></div>
             <div className="absolute inset-0 border-4 border-t-cyber-cyan border-r-transparent border-b-cyber-gold border-l-transparent rounded-full animate-spin"></div>
             <Loader2 className="absolute inset-0 m-auto w-10 h-10 text-cyber-gold animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white font-mono tracking-[0.5em] animate-pulse">INITIALIZING</h2>
          <p className="text-cyber-gold/60 mt-2 font-mono text-xs">Estabilishing secure neural link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 relative overflow-x-hidden bg-gradient-to-br from-[#0a0118] via-[#0f0520] to-[#050015]">
      <DashboardBackground />
      <div className="w-full px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-6 max-w-7xl mx-auto relative z-10">
        
        {/* Header Section - Mobile Optimized */}
        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight truncate">
                NEON<span className="text-cyan-400">ANALYTICA</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 bg-cyber-gold rounded-full animate-pulse shrink-0" />
                <p className="text-slate-400 text-[10px] sm:text-xs font-mono uppercase tracking-wide truncate">
                  {user?.full_name?.split(' ')[0] || 'Guest'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-1.5 sm:gap-2 shrink-0">
              {(() => {
                const userTier = user?.subscription_tier || SUBSCRIPTION_TIERS.FREE;
                const paymentVerified = user?.payment_verified === true && user?.identity_verified === true;
                const subscriptionExpired = isSubscriptionExpired(user);
                
                // If subscription expired, treat as free tier
                const effectiveTier = (userTier !== SUBSCRIPTION_TIERS.FREE && (!paymentVerified || subscriptionExpired)) 
                  ? SUBSCRIPTION_TIERS.FREE 
                  : userTier;
                const customizeLocked = isFeatureLocked(effectiveTier, 'DASHBOARD_ACTIONS');
                
                return (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (customizeLocked) {
                        if (subscriptionExpired && userTier !== SUBSCRIPTION_TIERS.FREE) {
                          alert("🔒 Your subscription has expired. Please renew to access this feature.");
                        } else {
                          alert("🔒 Dashboard customization requires a Pro or Premium subscription.");
                        }
                        return;
                      }
                      setShowCustomizeBar(!showCustomizeBar);
                    }}
                    className={`border-cyber-gold/30 text-cyber-gold hover:bg-cyber-gold/10 text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3 ${customizeLocked ? 'opacity-60' : ''}`}
                  >
                    {customizeLocked ? <Lock className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
                    <span className="hidden sm:inline ml-1">{customizeLocked ? 'Locked' : showCustomizeBar ? 'Done' : 'Settings'}</span>
                  </Button>
                );
              })()}

              <Button 
                size="sm"
                onClick={() => navigate(createPageUrl("Analyze"))}
                className="bg-cyber-purple hover:bg-cyber-purple/80 text-white text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
              >
                <Plus className="w-3 h-3" />
                <span className="hidden xs:inline ml-1">Scan</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Inline Customize Bar - Mobile Optimized */}
        {showCustomizeBar && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 md:p-4 bg-black/70 backdrop-blur-md border border-cyber-gold/30 rounded-lg space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-cyber-gold text-[10px] sm:text-xs font-mono uppercase flex items-center gap-1.5">
                <Settings className="w-3 h-3" /> Controls
              </span>
              <Button size="sm" variant="ghost" onClick={() => setShowCustomizeBar(false)} className="h-6 w-6 p-0">
                <X className="w-3 h-3 text-slate-400" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {[
                { key: 'stats', label: 'Stats' },
                { key: 'recent_analyses', label: 'Recent' },
                { key: 'top_tracks', label: 'Top' },
                { key: 'quick_actions', label: 'Actions' },
                { key: 'projects', label: 'Projects' },
                { key: 'calendar', label: 'Cal' }
              ].map(widget => (
                <button
                  key={widget.key}
                  onClick={() => setVisibleWidgets(prev => ({ ...prev, [widget.key]: !prev[widget.key] }))}
                  className={cn(
                    "px-1.5 sm:px-2 py-1 text-[8px] sm:text-[10px] font-mono uppercase rounded border transition-all flex items-center gap-0.5 sm:gap-1",
                    visibleWidgets[widget.key] 
                      ? "bg-cyber-cyan/20 border-cyber-cyan/50 text-cyber-cyan" 
                      : "bg-black/40 border-white/10 text-slate-500"
                  )}
                >
                  {visibleWidgets[widget.key] ? <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <EyeOff className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                  {widget.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1">
              {['all', 'track', 'rhythm', 'dsp', 'genre'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === 'all' ? 'all' : cat + '_analysis')}
                  className={cn(
                    "px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-mono uppercase rounded border transition-all",
                    (selectedCategory === cat || selectedCategory === cat + '_analysis')
                      ? "bg-cyber-cyan/30 border-cyber-cyan/50 text-cyber-cyan" 
                      : "bg-black/40 border-white/10 text-slate-500"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}





        {/* Main Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
          
          {/* Left Column: Stats & Main Content */}
          <div className="lg:col-span-8 space-y-3 sm:space-y-4 min-w-0">
            
            {visibleWidgets.stats && <StatsCards analyses={analyses} />}
            
            {/* Advanced Visualization Widget */}
            {visibleWidgets.stats && <AdvancedChartWidget analyses={analyses} />}

            {/* Filter Section - Compact on Mobile */}
            <Card className="border-t border-white/10">
              <CardContent className="p-2 sm:p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyber-gold shrink-0" />
                  <h3 className="text-white font-bold text-xs sm:text-sm font-mono uppercase truncate">Filters</h3>
                </div>
                <CategoryFilters onFilterChange={setSelectedCategory} selectedCategory={selectedCategory} />
              </CardContent>
            </Card>

            {visibleWidgets.recent_analyses && (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-purple shrink-0" />
                  <h2 className="text-sm sm:text-base md:text-lg font-black text-white font-mono uppercase truncate">Recent Scans</h2>
                </div>
                <RecentAnalyses 
                  analyses={filteredAnalyses} 
                  onViewDetails={(analysis) => navigate(createPageUrl(`AnalysisResult?id=${analysis.id}`))} 
                />
              </div>
            )}
          </div>

          {/* Right Column: Sidebar Widgets */}
          <div className="lg:col-span-4 space-y-3 sm:space-y-4 min-w-0">
            
            {/* Quick Actions - Mobile Optimized */}
            {visibleWidgets.quick_actions && (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {quickActions.map((action, i) => {
                  const actionMap = {
                    'track_analysis': 'Analyze',
                    'rhythm_analysis': 'AnalyzeRhythm',
                    'dsp_algorithms': 'DSPAlgorithms',
                    'genre_hit_predictor': 'GenrePredictor'
                  };
                  const labels = ['Track', 'Rhythm', 'DSP', 'Genre'];
                  return (
                    <Card 
                      key={i} 
                      onClick={() => navigate(createPageUrl(actionMap[action] || "Dashboard"))}
                      className="group cursor-pointer bg-black/60 border border-white/10 hover:border-cyber-gold/50 transition-all"
                    >
                      <CardContent className="p-2 sm:p-3 md:p-4 flex flex-col items-center text-center justify-center h-20 sm:h-24 md:h-28 relative">
                        <div className="mb-1.5 sm:mb-2 p-2 sm:p-2.5 rounded-lg bg-black/40 border border-white/10">
                          {i === 0 ? <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-cyan" /> : 
                           i === 1 ? <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-purple" /> :
                           i === 2 ? <Code className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-green" /> :
                           <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-gold" />}
                        </div>
                        <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-300 font-mono uppercase truncate w-full">
                          {labels[i]}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {visibleWidgets.top_tracks && (
              <Card className="border-cyber-purple/20">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <h3 className="text-white font-bold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-1.5 font-mono uppercase">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyber-gold shrink-0" /> 
                    <span className="truncate">Top Hits</span>
                  </h3>
                  <TopTracks 
                    analyses={filteredAnalyses} 
                    onTrackClick={(track) => navigate(createPageUrl(`AnalysisResult?id=${track.id}`))}
                  />
                </CardContent>
              </Card>
            )}

            {/* Projects Widget - Mobile Optimized */}
            {visibleWidgets.projects && (
              <Card className="border-l-2 sm:border-l-4 border-l-cyber-green/50">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-white font-bold text-sm sm:text-base font-mono uppercase flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyber-green shrink-0" />
                      <span className="truncate">Projects</span>
                    </h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {projects.slice(0, 2).map(project => (
                      <ProjectCard 
                        key={project.id} 
                        project={project} 
                        onOpen={() => navigate(createPageUrl(`ProjectDetail?id=${project.id}`))} 
                        onPin={() => {}} 
                        isPinned={false} 
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {visibleWidgets.calendar && (
              <Card className="overflow-hidden hidden sm:block">
                <div className="h-0.5 sm:h-1 w-full bg-gradient-to-r from-cyber-cyan via-cyber-gold to-cyber-purple" />
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center mb-2 sm:mb-3">
                    <h3 className="text-white font-bold text-sm sm:text-base font-mono uppercase flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyber-gold shrink-0" />
                      <span className="truncate">Schedule</span>
                    </h3>
                  </div>
                  <CalendarComponent className="bg-black/20 rounded-lg border border-white/5 text-xs" />
                </CardContent>
              </Card>
            )}

          </div>
        </div>

      </div>

      {/* AI Chatbot FAB - Mobile positioned */}
      <Button
        onClick={() => setShowAIAssistant(!showAIAssistant)}
        className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-50 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-cyber-cyan to-cyber-purple shadow-lg border border-white/20"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </Button>

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <GlobalAIAssistant onClose={() => setShowAIAssistant(false)} />
      )}
    </div>
  );
}