import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  TrendingUp,
  Music,
  Zap,
  ArrowLeft,
  Plus,
  Target,
  Lightbulb,
  BarChart3,
  Activity,
  Volume2,
  Radio,
  Mic2,
  Sparkles,
  Award,
  AlertTriangle,
  Users,
  TrendingDown,
  Music2,
  RefreshCw,
  AlertCircle,
  Brain,
  Shield,
  Save,
  FolderPlus,
  Code
} from "lucide-react";
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

import ShareButtons from "./ShareButtons";
import ScientificMethodology from "./ScientificMethodology";
import ExportToPDF from "../shared/ExportToPDF";
import ClearCookiesButton from "../shared/ClearCookiesButton";
import { GLOBAL_STATS, R2_WEIGHTS } from "../shared/UnifiedDSPAnalysis";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

// Save to Project Button Component
function SaveToProjectButton({ analysis }) {
  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const allProjects = await base44.entities.CollaborationProject.list('-created_date', 50);
      setProjects(allProjects || []);
    } catch (err) {
      console.warn('Failed to load projects:', err);
    }
  };

  const saveToProject = async (projectId) => {
    setLoading(true);
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const updatedAnalysisIds = [...(project.analysis_ids || []), analysis.id];
      
      // Add to activity log
      const activityLog = [...(project.activity_log || []), {
        action: 'analysis_added',
        details: `Added analysis: ${analysis.track_name} by ${analysis.artist_name}`,
        timestamp: new Date().toISOString()
      }];

      await base44.entities.CollaborationProject.update(projectId, {
        analysis_ids: updatedAnalysisIds,
        activity_log: activityLog
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save to project:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = () => {
    navigate(createPageUrl('Projects'));
  };

  if (saved) {
    return (
      <Button className="bg-green-600 hover:bg-green-700 font-bold">
        <Save className="w-4 h-4 mr-2" />
        Saved ✓
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="border-purple-600 text-purple-300 hover:bg-purple-900/50 font-bold"
          disabled={loading}
        >
          <FolderPlus className="w-4 h-4 mr-2" />
          <span className="font-bold">Save to Project</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-slate-800 border-slate-700 w-56">
        <DropdownMenuLabel className="text-slate-400 text-xs">Select Project</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        {projects.length === 0 ? (
          <DropdownMenuItem onClick={createNewProject} className="text-purple-300 cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Create New Project
          </DropdownMenuItem>
        ) : (
          <>
            {projects.slice(0, 10).map(project => (
              <DropdownMenuItem 
                key={project.id} 
                onClick={() => saveToProject(project.id)}
                className="text-white cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 mr-2 text-purple-400" />
                {project.project_name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem onClick={createNewProject} className="text-purple-300 cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Create New Project
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Feature descriptions based on 175M+ data
const FEATURE_DESCRIPTIONS = {
  loudness: "Production quality - mastering, dynamics, frequency balance",
  energy: "Intensity/power/drive - amplitude + high-freq + mid-freq power",
  rhythm_quality: "Groove strength, timing precision",
  danceability: "Beat consistency",
  valence: "Emotional positivity",
  acousticness: "How well instruments sound - audio quality, clarity, harmonic balance",
  instrumentalness: "Number and use of instruments - detects active frequency bands",
  speechiness: "Word count & frequency - syllable detection + word burst patterns",
  harmonicity: "Musical vs noise",
  complexity: "Spectral richness",
  liveness: "Room ambience",
  tempo_rating: "BPM (beats per minute)",
  explicitness: "Explicit content"
};

export default function AnalysisResults({ analysis, onNewAnalysis, onBackToDashboard, onRefresh }) {
  const displayHitScore = analysis.hit_score || 0; // This is 0-100 from backend
  const displaySkipLikelihood = 100 - displayHitScore; // This is 0-100

  // Convert to 1-10 scale for display
  const hitScoreTenScale = ((displayHitScore / 100) * 9 + 1).toFixed(1);
  const skipScoreTenScale = ((displaySkipLikelihood / 100) * 9 + 1).toFixed(1);

  console.log("📊 Displaying analysis with features:", analysis.audio_features);
  console.log("📊 Hit Score (0-100):", displayHitScore, "→ (1-10):", hitScoreTenScale);

  // Helper to normalize feature for display (converts raw to 0-10 scale)
  const normalizeFeatureForDisplay = (key, rawValue) => {
    const featureKey = key === 'tempo' ? 'tempo' : key === 'tempo_rating' ? 'tempo' : key;
    const stats = GLOBAL_STATS[featureKey];
    
    if (!stats || rawValue === undefined || rawValue === null) return null;
    
    const { min, max } = stats;
    if (max === min) return 0;
    
    const normalized = (rawValue - min) / (max - min);
    return Math.max(0, Math.min(1, normalized)) * 10; // 0-10 scale
  };

  // Get the actual raw value (not normalized) and potentially add a warning
  const getRawValue = (key, value) => {
    if (value === undefined || value === null) {
      return 'N/A';
    }

    const numericValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numericValue)) {
      return String(value);
    }

    let formattedValue;
    let warning = '';

    // TRUE raw ranges from backend, used for detecting pre-normalized values
    switch (key) {
      case 'tempo':
      case 'tempo_rating':
        // Expected raw: ~40 to ~200 BPM
        if (numericValue < 39 || numericValue > 201) {
          warning = '⚠️ (Expected BPM 40-200)';
        }
        formattedValue = `${numericValue.toFixed(2)} BPM`;
        break;

      case 'loudness':
        // Expected raw: -60 to 0 dB
        if (numericValue > 0.1 || numericValue < -60.1) {
          warning = '⚠️ (Expected -60 to 0 dB)';
        }
        formattedValue = `${numericValue.toFixed(2)} dB`;
        break;

      case 'acousticness':
        // Expected raw: 0 to 0.01
        if (numericValue > 0.011 || numericValue < -0.001) {
          warning = '⚠️ (Expected 0 to 0.01)';
        }
        formattedValue = numericValue.toFixed(6);
        break;

      case 'energy':
        // Expected raw: 0 to 0.1
        if (numericValue > 0.11 || numericValue < -0.001) {
          warning = '⚠️ (Expected 0 to 0.1)';
        }
        formattedValue = numericValue.toFixed(4);
        break;
        
      case 'valence':
      case 'speechiness':
      case 'harmonicity':
      case 'explicitness':
        // Expected raw: 0 to 1
        if (numericValue < -0.01 || numericValue > 1.01) {
          warning = '⚠️ (Expected 0 to 1)';
        }
        formattedValue = numericValue.toFixed(4);
        break;

      case 'rhythm_quality':
      case 'danceability':
        // Expected raw: 0 to 10
        if (numericValue < -0.1 || numericValue > 10.1) {
            warning = '⚠️ (Expected 0 to 10)';
        }
        formattedValue = numericValue.toFixed(4);
        break;

      case 'instrumentalness':
      case 'liveness':
        // Expected raw: 0 to 5
        if (numericValue < -0.1 || numericValue > 5.1) {
          warning = '⚠️ (Expected 0 to 5)';
        }
        formattedValue = numericValue.toFixed(4);
        break;

      case 'complexity':
        // Expected raw: 0 to 15
        if (numericValue < -0.1 || numericValue > 15.1) {
          warning = '⚠️ (Expected 0 to 15)';
        }
        formattedValue = numericValue.toFixed(4);
        break;

      default:
        formattedValue = numericValue.toFixed(4);
        break;
    }

    return formattedValue + (warning ? ` ${warning}` : '');
  };

  // Calculate rhythm quality rating (1-10)
  const displayRhythmQuality = React.useMemo(() => {
    let storedQuality = analysis.audio_features?.rhythm_quality;

    if (typeof storedQuality === 'string') {
      storedQuality = parseFloat(storedQuality);
    }

    // storedQuality is expected to be 0-10, convert to 1-10 for display
    if (typeof storedQuality === 'number' && !isNaN(storedQuality) && storedQuality >= 0 && storedQuality <= 10) {
      return (storedQuality / 10) * 9 + 1;
    }

    // Fallback calculation if not stored
    if (analysis.rhythm_analysis) {
      const getNumericValue = (prop) => {
        const val = analysis.rhythm_analysis[prop];
        const parsedVal = typeof val === 'number' ? val : parseFloat(val);
        return typeof parsedVal === 'number' && !isNaN(parsedVal) ? parsedVal : 5;
      };

      const groove = getNumericValue('groove_quality');
      const timing = getNumericValue('timing_precision');
      const pocket = getNumericValue('pocket_strength');
      const swing = getNumericValue('swing_factor');
      const syncopation = getNumericValue('syncopation_level');
      const drumProg = getNumericValue('drum_programming_quality');
      const bassLock = getNumericValue('bass_rhythm_lock');

      const calculated = (
        (groove * 0.20) +
        (timing * 0.20) +
        (pocket * 0.15) +
        (drumProg * 0.20) +
        (bassLock * 0.15) +
        (swing * 0.05) +
        (syncopation * 0.05)
      );

      // calculated is 0-10, convert to 1-10
      return Math.max(1, Math.min(10, (calculated / 10) * 9 + 1));
    }

    return 5.5; // Default middle value on 1-10 scale
  }, [analysis.audio_features, analysis.rhythm_analysis]);

  // NEW: More stringent check for data from old analysis versions that are definitively pre-normalized
  // This is used to trigger the "Outdated Analysis Detected" banner and the detailed warning in the audio features card
  const hasInvalidRawData = React.useMemo(() => {
    if (!analysis.audio_features) return false;
    
    const features = analysis.audio_features;
    
    // Check for pre-normalized values (allow small tolerance)
    if (features.loudness !== undefined && (features.loudness > 0.1 || features.loudness < -60.1)) return true;
    if (features.tempo !== undefined && (features.tempo < 39 || features.tempo > 201)) return true;
    if (features.acousticness !== undefined && (features.acousticness > 0.011)) return true;
    if (features.energy !== undefined && (features.energy > 0.11)) return true;
    if (features.valence !== undefined && (features.valence > 1.01)) return true;
    if (features.complexity !== undefined && (features.complexity > 15.1)) return true;
    if (features.harmonicity !== undefined && (features.harmonicity > 1.01)) return true;
    
    return false;
  }, [analysis.audio_features]);

  const isOldVersion = !analysis.analysis_version || parseFloat(analysis.analysis_version) < 4.2;


  const getHitScoreColor = (score) => {
    // score is 0-100
    if (score >= 80) return "from-green-400 to-emerald-500";
    if (score >= 60) return "from-yellow-400 to-orange-400";
    if (score >= 40) return "from-orange-400 to-red-400";
    return "from-red-400 to-red-600";
  };

  const getSkipLikelihoodColor = (score) => {
    // score is 0-100
    if (score <= 20) return "from-green-400 to-emerald-500";
    if (score <= 40) return "from-yellow-400 to-orange-400";
    if (score <= 60) return "from-orange-400 to-red-400";
    return "from-red-400 to-red-600";
  };

  const getCommercialAppealBadge = (appeal) => {
    const configs = {
      very_high: { color: "bg-green-500/20 text-green-300 border-green-500/30", label: "Very High" },
      high: { color: "bg-blue-500/20 text-blue-300 border-blue-500/30", label: "High" },
      medium: { color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", label: "Medium" },
      low: { color: "bg-red-500/20 text-red-300 border-red-500/30", label: "Low" }
    };
    return configs[appeal] || configs.medium;
  };

  const getFeatureIcon = (feature) => {
    const icons = {
      loudness: Volume2,
      acousticness: Music,
      tempo_rating: Activity,
      liveness: Radio,
      energy: Zap,
      instrumentalness: Music,
      danceability: Activity,
      valence: Sparkles,
      speechiness: Mic2,
      explicitness: AlertTriangle,
      catchiness: Star,
      production_quality: Award,
      rhythm_quality: Activity
    };
    return icons[feature] || BarChart3;
  };

  const getFeatureLabel = (key) => {
    const labels = {
      loudness: "Loudness",
      acousticness: "Acousticness",
      tempo_rating: "Tempo", // Simplified from Tempo Rating for display in the list
      liveness: "Liveness",
      energy: "Energy",
      instrumentalness: "Instrumentalness",
      danceability: "Danceability",
      valence: "Valence",
      speechiness: "Speechiness",
      explicitness: "Explicitness",
      catchiness: "Catchiness",
      production_quality: "Production Quality",
      rhythm_quality: "Rhythm Quality",
      harmonicity: "Harmonicity",
      complexity: "Complexity"
    };
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getFeatureR2 = (key) => {
    const lookupKey = key === 'tempo' ? 'tempo_rating' : key;
    const r2Value = R2_WEIGHTS[lookupKey];
    return r2Value !== undefined ? String(r2Value) : undefined;
  };

  const createPageUrl = (path) => {
    return `/${path}`;
  };

  const marketFit = analysis.market_fit || {};
  const timeSeries = analysis.time_series_prediction || {};
  const commercialConfig = getCommercialAppealBadge(analysis.commercial_appeal);

  const convert0_1To1_10 = (value) => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numericValue)) return null;
    return ((numericValue * 9) + 1).toFixed(1);
  };

  const convert0_10To1_10 = (value) => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numericValue)) return null;
    return ((numericValue / 10) * 9 + 1).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900/50 to-purple-900/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Analysis Results
            </h1>
            <p className="text-slate-400 mt-2">
              "{analysis.track_name}" by {analysis.artist_name}
            </p>
            {analysis.analysis_version && (
              <Badge variant="outline" className="mt-2 border-purple-500/30 text-purple-300">
                Analysis v{analysis.analysis_version}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={onBackToDashboard}
              className="border-slate-600 text-slate-300 hover:bg-slate-700/50 font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="font-bold">Dashboard</span>
            </Button>
            <ExportToPDF
              data={analysis}
              filename={`analysis-${analysis.track_name}`}
              className="font-bold"
            />
            <Link to={createPageUrl("AudioConverter")}>
              <Button variant="outline" size="sm" className="border-green-600 text-green-300 hover:bg-green-900/50 font-bold">
                <RefreshCw className="w-4 h-4 mr-2" />
                <span className="font-bold">Convert Audio</span>
              </Button>
            </Link>
            <ClearCookiesButton />
            <Button
              onClick={onNewAnalysis}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="font-bold">Analyze Another</span>
            </Button>
            <SaveToProjectButton analysis={analysis} />
          </div>
        </div>

        {/* Version Warning Banner */}
        {(hasInvalidRawData || isOldVersion) && (
          <Alert className="bg-red-900/30 border-red-500/50">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <AlertDescription className="text-red-200">
              <strong>⚠️ Outdated Analysis Detected (v{analysis.analysis_version || 'unknown'})</strong>
              <br />
              This analysis contains DSP values from an older algorithm version (likely pre-normalized). 
              The current analysis engine (v4.2) requires TRUE raw DSP values for accurate hit score calculation.
              <br />
              <strong>Impact:</strong> The displayed Hit Score and some feature values may be inaccurate.
              <br />
              <Button
                onClick={onNewAnalysis}
                className="mt-3 bg-red-600 hover:bg-red-700"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-Analyze with v4.2
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <ScientificMethodology />

        {/* AI Learning Badge */}
        <Card className="bg-[#0a0a0a] border-l-4 border-l-cyan-500 border-y-0 border-r-0 shadow-2xl shadow-cyan-900/20 rounded-xl overflow-hidden relative group hover:shadow-cyan-500/10 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/30 via-transparent to-transparent opacity-100" />
          <CardContent className="p-3 relative z-10">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
              <Shield className="w-5 h-5 text-green-400" />
              <p className="text-white text-xs font-bold">🤖 AI Learned From This Analysis • Data Encrypted • Security Active</p>
            </div>
          </CardContent>
        </Card>

        {/* Overall Hit Score Card - WITH BOTH SCALES */}
        <Card className="bg-[#0a0a0a] border border-purple-900/30 shadow-[0_0_60px_-15px_rgba(168,85,247,0.2)] rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <CardHeader className="relative z-10">
            <CardTitle className="text-white flex items-center gap-3 text-2xl font-bold">
              <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              Commercial Hit Score
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 p-8">
            <div className="text-center space-y-8">
              {/* 0-100 Normalized Scale */}
              <div>
                <div className={`text-8xl font-black mb-4 tracking-tighter drop-shadow-2xl ${
                  displayHitScore >= 80 ? 'text-green-400' :
                  displayHitScore >= 60 ? 'text-yellow-400' :
                  displayHitScore >= 40 ? 'text-orange-400' :
                  'text-red-400'
                }`}>
                  {displayHitScore.toFixed(1)}%
                </div>
                <Badge className="text-base font-bold bg-white text-black hover:bg-slate-200 px-6 py-2 rounded-full mb-3 shadow-lg">
                  Pop Hit Score (0-100 Scale)
                </Badge>
                <p className="text-sm text-slate-400 font-medium">Industry standard percentage format</p>
              </div>

              {/* 1-10 Scale */}
              <div className="p-6 bg-[#151515] rounded-xl border border-purple-500/20 shadow-inner">
                <div className={`text-6xl font-black mb-2 ${
                  displayHitScore >= 80 ? 'text-green-400' :
                  displayHitScore >= 60 ? 'text-yellow-400' :
                  displayHitScore >= 40 ? 'text-orange-400' :
                  'text-red-400'
                }`}>
                  {hitScoreTenScale}/10
                </div>
                <p className="text-sm font-bold text-purple-300 uppercase tracking-widest">
                  Hit Potential Score
                </p>
              </div>

              <Badge variant="outline" className="border-green-500/30 text-green-300 text-sm font-bold py-1 px-3 bg-green-900/10">
                Based on 175M+ streaming sessions
              </Badge>

              <div className="p-5 rounded-xl bg-blue-950/20 border border-blue-500/20 text-left">
                <h3 className="text-blue-300 font-bold mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4" /> EXACT Python Formula:
                </h3>
                <code className="text-sm text-blue-200 block text-wrap font-mono bg-black/30 p-3 rounded-lg border border-blue-500/10">
                  hit_score = (Σ(normalized_feature × R²)) / (Σ R²) × 100
                </code>
                <p className="text-xs text-slate-400 mt-3 font-medium">
                  Features normalized to 0-1 scale using min-max, then weighted by R² values
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-[#0a0a0a] border border-slate-800 shadow-xl hover:border-purple-500/30 transition-all duration-300 rounded-2xl">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className={`w-36 h-36 mx-auto rounded-full bg-gradient-to-r ${getHitScoreColor(displayHitScore)} p-[3px] shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)]`}>
                    <div className="w-full h-full bg-[#0a0a0a] rounded-full flex items-center justify-center">
                      <div>
                        <div className="text-5xl font-black text-white">{hitScoreTenScale}</div>
                        <div className="text-sm text-slate-500 font-bold">/10</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-[#0a0a0a] p-2 rounded-full border border-yellow-500/30 shadow-lg">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white mb-3">Commercial Potential</h3>
                  <Badge
                    variant="outline"
                    className={`${commercialConfig.color} border px-4 py-1.5 text-sm font-bold rounded-full`}
                  >
                    {commercialConfig.label} Appeal
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0a0a] border border-slate-800 shadow-xl hover:border-orange-500/30 transition-all duration-300 rounded-2xl">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className={`w-36 h-36 mx-auto rounded-full bg-gradient-to-r ${getSkipLikelihoodColor(displaySkipLikelihood)} p-[3px] shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)]`}>
                    <div className="w-full h-full bg-[#0a0a0a] rounded-full flex items-center justify-center">
                      <div>
                        <div className="text-5xl font-black text-white">{skipScoreTenScale}</div>
                        <div className="text-sm text-slate-500 font-bold">/10</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-[#0a0a0a] p-2 rounded-full border border-orange-500/30 shadow-lg">
                    <TrendingDown className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white mb-2">Skip Likelihood</h3>
                  <p className="text-sm text-slate-400 font-bold bg-slate-900/50 px-4 py-2 rounded-lg inline-block border border-slate-800">
                    {displaySkipLikelihood <= 20 ? "Excellent retention" :
                     displaySkipLikelihood <= 40 ? "Good retention" :
                     displaySkipLikelihood <= 60 ? "Moderate risk" :
                     "High skip risk"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rhythm Quality Card - RATINGS ONLY */}
        <Card className="bg-[#0a0a0a] border border-indigo-900/30 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-indigo-900/20 bg-indigo-950/5 p-6">
            <CardTitle className="text-xl text-white flex items-center gap-3 font-bold">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Activity className="w-5 h-5 text-indigo-400" />
              </div>
              Rhythm Quality Analysis
            </CardTitle>
            <p className="text-sm text-indigo-200/70 mt-2 font-medium ml-12">
              R² {getFeatureR2('rhythm_quality')} - explains {(parseFloat(getFeatureR2('rhythm_quality')) * 100).toFixed(1)}% of hit variance • Trained on 175M+ data points
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 p-[4px] shadow-2xl shadow-indigo-500/20 flex-shrink-0">
                <div className="w-full h-full bg-[#0a0a0a] rounded-full flex items-center justify-center border-4 border-[#0a0a0a]">
                  <div className="text-center">
                    <div className="text-4xl font-black text-white">{displayRhythmQuality.toFixed(1)}</div>
                    <div className="text-xs text-indigo-400 font-bold">/10 SCORE</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full text-center md:text-left">
                <h3 className="text-xl font-black text-white mb-3">
                  {displayRhythmQuality >= 7 ? "Professional Rhythm" :
                   displayRhythmQuality >= 5 ? "Decent Rhythm" :
                   "Needs Improvement"}
                </h3>
                <Progress value={(displayRhythmQuality - 1) / 9 * 100} className="h-4 mb-3 bg-slate-800" indicatorClassName="bg-gradient-to-r from-indigo-500 to-blue-500" />
                <p className="text-sm text-slate-400 font-medium mb-3">
                  Rating based on groove, timing, pocket, and programming quality
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {['Timing', 'Groove', 'Pocket', 'Programming', 'Bass Lock'].map(tag => (
                    <Badge key={tag} variant="outline" className="border-indigo-500/30 text-indigo-300 font-bold bg-indigo-900/10">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Fit Analysis - ENHANCED WITH FULL EXPLANATIONS */}
        {analysis.market_fit && (
              <Card className="bg-[#0a0a0a] border border-fuchsia-900/30 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-fuchsia-900/20 bg-fuchsia-950/5 p-6">
                  <CardTitle className="text-white flex items-center gap-3 font-bold text-xl">
                    <div className="p-2 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20">
                      <Sparkles className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    Market Fit Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Trending Similarity - DARK CARD */}
                    <Card className="bg-[#151515] border border-purple-900/30 hover:border-purple-500/50 transition-all group">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-bold text-lg group-hover:text-purple-300 transition-colors">Trending Similarity</h4>
                          <span className="text-3xl font-black text-purple-400">
                            {(analysis.market_fit.trending_similarity * 10).toFixed(1)}<span className="text-sm text-slate-500 font-bold">/10</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 font-medium">Billboard Hot 100 & Spotify Viral 50 alignment</p>
                        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-slate-800">
                          <p className="text-xs font-bold text-purple-300 mb-2 uppercase tracking-wider">📊 What This Means:</p>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {analysis.market_fit.trending_similarity >= 0.8
                              ? "Exceptional trending alignment! Your track matches current hit patterns almost perfectly."
                              : analysis.market_fit.trending_similarity >= 0.6
                              ? "Strong similarity to trending music with some unique elements that help you stand out."
                              : "Moderate trending alignment - your track has a unique sound that differs from mainstream trends."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Playlist Potential - DARK CARD */}
                    <Card className="bg-[#151515] border border-green-900/30 hover:border-green-500/50 transition-all group">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-bold text-lg group-hover:text-green-300 transition-colors">Playlist Potential</h4>
                          <span className="text-3xl font-black text-green-400">
                            {(analysis.market_fit.playlist_potential * 10).toFixed(1)}<span className="text-sm text-slate-500 font-bold">/10</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 font-medium">Editorial playlist inclusion likelihood</p>
                        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-slate-800">
                          <p className="text-xs font-bold text-green-300 mb-2 uppercase tracking-wider">📊 What This Means:</p>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {analysis.market_fit.playlist_potential >= 0.8
                              ? "Excellent fit for major editorial playlists! Your track has the profile curators look for."
                              : analysis.market_fit.playlist_potential >= 0.6
                              ? "Good playlist potential - solid audio profile that can compete for editorial spots."
                              : "Moderate playlist potential - focus on building user playlist momentum first."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Radio Friendly - DARK CARD */}
                    <Card className="bg-[#151515] border border-blue-900/30 hover:border-blue-500/50 transition-all group">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-bold text-lg group-hover:text-blue-300 transition-colors">Radio Friendly</h4>
                          <span className="text-3xl font-black text-blue-400">
                            {(analysis.market_fit.radio_friendly * 10).toFixed(1)}<span className="text-sm text-slate-500 font-bold">/10</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 font-medium">Commercial radio airplay potential</p>
                        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-slate-800">
                          <p className="text-xs font-bold text-blue-300 mb-2 uppercase tracking-wider">📊 What This Means:</p>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {analysis.market_fit.radio_friendly >= 0.8
                              ? "Excellent radio potential! Your track has strong commercial appeal across demographics."
                              : analysis.market_fit.radio_friendly >= 0.6
                              ? "Good radio potential - has key elements stations look for."
                              : "Moderate radio potential - consider structural and production refinements."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Viral Potential - DARK CARD */}
                    <Card className="bg-[#151515] border border-pink-900/30 hover:border-pink-500/50 transition-all group">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-bold text-lg group-hover:text-pink-300 transition-colors">Viral Potential</h4>
                          <span className="text-3xl font-black text-pink-400">
                            {(analysis.market_fit.viral_potential * 10).toFixed(1)}<span className="text-sm text-slate-500 font-bold">/10</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 font-medium">TikTok/Instagram/Shorts virality</p>
                        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-slate-800">
                          <p className="text-xs font-bold text-pink-300 mb-2 uppercase tracking-wider">📊 What This Means:</p>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {analysis.market_fit.viral_potential >= 0.8
                              ? "Exceptional viral candidate! Your track has the hooks and energy social media craves."
                              : analysis.market_fit.viral_potential >= 0.6
                              ? "Good viral potential - needs strategic push with content creators."
                              : "Moderate viral potential - identify your most shareable 15-second clip."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}

        {/* Marketing & Release Strategy */}
        {timeSeries && Object.keys(timeSeries).length > 0 && (
          <Card className="bg-[#0a0a0a] border border-emerald-900/30 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-emerald-900/20 bg-emerald-950/5 p-6">
              <CardTitle className="text-xl text-white flex items-center gap-3 font-bold">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                Marketing & Release Strategy
              </CardTitle>
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-900/20"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4 p-4 bg-[#151515] rounded-xl border border-slate-800">
                  <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Trajectory Analysis</h4>
                  
                  <div className="flex justify-between items-center p-2 border-b border-slate-800">
                    <span className="text-slate-300 font-medium">Chart Trajectory</span>
                    <Badge className="bg-purple-900/30 text-purple-300 border border-purple-500/30 capitalize">
                      {timeSeries.chart_trajectory?.replace(/_/g, ' ') || "N/A"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-2 border-b border-slate-800">
                    <span className="text-slate-300 font-medium">Weeks to Peak</span>
                    <span className="text-white font-black">{timeSeries.weeks_to_peak || "N/A"} weeks</span>
                  </div>

                  <div className="flex justify-between items-center p-2 border-b border-slate-800">
                    <span className="text-slate-300 font-medium">Total Chart Longevity</span>
                    <span className="text-white font-black">{timeSeries.total_chart_longevity_weeks || "N/A"} weeks</span>
                  </div>

                  <div className="flex justify-between items-center p-2">
                    <span className="text-slate-300 font-medium">Longevity Score</span>
                    <span className="text-white font-black">
                      {timeSeries.longevity_score !== undefined ? convert0_10To1_10(timeSeries.longevity_score) : "N/A"}/10
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-[#151515] rounded-xl border border-slate-800">
                  <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Market Requirements</h4>
                  
                  <div className="flex justify-between items-center p-2 border-b border-slate-800">
                    <span className="text-slate-300 font-medium">Marketing Intensity</span>
                    <Badge className="bg-orange-900/30 text-orange-300 border border-orange-500/30 capitalize">
                      {timeSeries.marketing_intensity_needed?.replace(/_/g, ' ') || "N/A"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-2 border-b border-slate-800">
                    <span className="text-slate-300 font-medium">Est. Marketing Budget</span>
                    <span className="text-white font-black">{timeSeries.estimated_marketing_budget || "N/A"}</span>
                  </div>

                  <div className="flex justify-between items-center p-2 border-b border-slate-800">
                    <span className="text-slate-300 font-medium">Breakthrough Probability</span>
                    <span className="text-white font-black text-lg text-green-400">{timeSeries.breakthrough_probability?.toFixed(0) || "N/A"}%</span>
                  </div>

                  <div className="flex justify-between items-center p-2">
                    <span className="text-slate-300 font-medium">Optimal Season</span>
                    <Badge className="bg-blue-900/30 text-blue-300 border border-blue-500/30 capitalize">
                      {timeSeries.seasonal_timing?.replace(/_/g, ' ') || "N/A"}
                    </Badge>
                  </div>
                </div>
              </div>

              {timeSeries.comparable_billboard_hits && timeSeries.comparable_billboard_hits.length > 0 && (
                <div className="bg-purple-950/10 border border-purple-500/20 rounded-xl p-6">
                  <h4 className="text-sm font-bold text-purple-300 mb-3 uppercase tracking-widest">Comparable Billboard Hits</h4>
                  <div className="flex flex-wrap gap-3">
                    {timeSeries.comparable_billboard_hits.map((hit, index) => (
                      <Badge key={index} variant="outline" className="border-purple-500/30 text-purple-200 bg-purple-900/20 px-3 py-1 text-sm">
                        {hit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Audio Features Card - WITH NORMALIZATION DETAILS */}
        {analysis.audio_features && (
          <Card className="bg-[#0a0a0a] border border-blue-900/30 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-blue-900/20 bg-blue-950/5 p-6">
              <CardTitle className="text-white flex items-center gap-3 font-bold text-xl">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                Audio Features Analysis
                {!hasInvalidRawData && !isOldVersion && (
                  <Badge variant="outline" className="border-green-500/30 text-green-300 bg-green-900/10 ml-2 text-xs">
                    ✓ v4.2 TRUE Raw Values
                  </Badge>
                )}
                <span className="text-xs text-slate-500 ml-auto font-medium">(Normalized 0-10 Scale)</span>
              </CardTitle>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed ml-12">
                <strong>R² = variance explained in HIT SUCCESS</strong> (higher R² = more important for hit score)
                <br />
                <span className="font-bold text-xs text-blue-200 bg-blue-900/20 px-2 py-1 rounded mt-2 inline-block border border-blue-500/20">
                  Features normalized to 0-10 for display only. Calculation uses 0-1 normalization.
                </span>
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 p-5 bg-purple-950/20 border border-purple-500/20 rounded-xl">
                <h3 className="text-purple-300 font-bold mb-3 text-sm flex items-center gap-2">
                  <Code className="w-4 h-4" /> Formula Used:
                </h3>
                <code className="text-xs text-purple-200 block mb-3 font-mono bg-black/30 p-3 rounded-lg border border-purple-500/10">
                  hit_score = (Σ(normalized_feature × R²)) / (Σ R²) × 100
                </code>
                <p className="text-xs text-slate-400 font-medium">
                  • Each feature: raw value → normalize to 0-1 → multiply by R² weight
                  <br />
                  • Sum all weighted features → divide by sum of R² weights → multiply by 100 for percentage
                  <br />
                  • <strong className="text-purple-300">Higher R² = more important for determining hit success</strong>
                </p>
              </div>

              {/* Data Quality Warning for OLD data */}
              {hasInvalidRawData && (
                <div className="mb-6 p-5 bg-red-950/20 border border-red-500/20 rounded-xl">
                  <h3 className="text-red-300 font-bold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    ❌ Invalid Raw Values Detected
                  </h3>
                  <p className="text-sm text-red-200 mb-3">
                    This analysis (v{analysis.analysis_version || 'unknown'}) contains DSP values that appear to be pre-normalized from an older algorithm version instead of TRUE raw DSP measurements:
                  </p>
                  <ul className="text-xs text-red-200 list-disc ml-5 mb-4 space-y-1 font-mono">
                    {analysis.audio_features.loudness !== undefined && (analysis.audio_features.loudness > 0.1 || analysis.audio_features.loudness < -60.1) &&
                      <li>Loudness: Expected -60 to 0 dB (found: {analysis.audio_features.loudness?.toFixed(2)})</li>
                    }
                    {analysis.audio_features.tempo !== undefined && (analysis.audio_features.tempo < 39 || analysis.audio_features.tempo > 201) &&
                      <li>Tempo: Expected 40-200 BPM (found: {analysis.audio_features.tempo?.toFixed(2)})</li>
                    }
                    {analysis.audio_features.acousticness !== undefined && (analysis.audio_features.acousticness > 0.011) &&
                      <li>Acousticness: Expected 0 to 0.01 (found: {analysis.audio_features.acousticness?.toFixed(6)})</li>
                    }
                    {analysis.audio_features.energy !== undefined && (analysis.audio_features.energy > 0.11) &&
                      <li>Energy: Expected 0 to 0.1 (found: {analysis.audio_features.energy?.toFixed(4)})</li>
                    }
                    {analysis.audio_features.valence !== undefined && (analysis.audio_features.valence > 1.01) &&
                      <li>Valence: Expected 0 to 1 (found: {analysis.audio_features.valence?.toFixed(4)})</li>
                    }
                    {analysis.audio_features.complexity !== undefined && (analysis.audio_features.complexity > 15.1) &&
                      <li>Complexity: Expected 0 to 15 (found: {analysis.audio_features.complexity?.toFixed(4)})</li>
                    }
                    {analysis.audio_features.harmonicity !== undefined && (analysis.audio_features.harmonicity > 1.01) &&
                      <li>Harmonicity: Expected 0 to 1 (found: {analysis.audio_features.harmonicity?.toFixed(4)})</li>
                    }
                  </ul>
                  <p className="text-sm text-red-200 font-bold mb-3">
                    → Re-analyze with v4.2 for accurate TRUE raw values and correct hit score calculation.
                  </p>
                  <Button
                    onClick={onNewAnalysis}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Re-Analyze Track
                  </Button>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analysis.audio_features)
                  .filter(([key]) => key !== 'tempo')
                  .sort((a, b) => {
                    const r2A = R2_WEIGHTS[a[0]] || 0;
                    const r2B = R2_WEIGHTS[b[0]] || 0;
                    return r2B - r2A; // Sort by R² importance
                  })
                  .map(([key, rawValue], index) => {
                    const r2 = R2_WEIGHTS[key] || 0;
                    const normalizedValue = normalizeFeatureForDisplay(key, rawValue);
                    const isStrongest = r2 > 0 && r2 === Math.max(...Object.values(R2_WEIGHTS));
                    const description = FEATURE_DESCRIPTIONS[key] || '';
                    const displayRawValue = getRawValue(key, rawValue);
                    const hasWarning = typeof displayRawValue === 'string' && displayRawValue.includes('⚠️');
                    
                    return (
                      <div key={key} className={`space-y-3 p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                        hasWarning ? 'bg-red-950/10 border-red-500/30' : 'bg-[#151515] border-slate-800 hover:border-blue-500/30'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600 font-mono">#{index + 1}</span>
                            <span className="text-slate-200 capitalize font-bold text-sm">
                              {getFeatureLabel(key)}
                            </span>
                          </div>
                          {normalizedValue !== null && (
                            <span className="text-xl font-black text-white">
                              {normalizedValue.toFixed(1)}<span className="text-xs text-slate-500">/10</span>
                            </span>
                          )}
                        </div>
                        
                        {normalizedValue !== null && (
                          <Progress value={normalizedValue * 10} className="h-2 bg-slate-800" indicatorClassName="bg-blue-500" />
                        )}
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Raw Value:</span>
                          <span className={`font-mono text-xs ${hasWarning ? 'text-red-300 font-bold' : 'text-slate-300'}`}>
                            {displayRawValue}
                          </span>
                        </div>
                        
                        {description && (
                          <p className="text-xs text-slate-500 italic leading-tight">{description}</p>
                        )}
                        
                        {r2 > 0 && (
                          <div className="flex flex-col gap-1 pt-2 border-t border-slate-800/50">
                            <Badge variant="outline" className={`text-[10px] w-fit ${isStrongest ? 'border-yellow-500/50 text-yellow-300 bg-yellow-900/10' : 'border-purple-500/30 text-purple-300 bg-purple-900/10'}`}>
                              R² = {r2.toFixed(3)} {isStrongest && '⭐ Most Important'}
                            </Badge>
                            <p className="text-[10px] text-slate-600">
                              Explains {(r2 * 100).toFixed(1)}% of hit variance
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tempo Info - Shows BPM */}
        {analysis.audio_features?.tempo && (
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-lg text-white">Tempo Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-white font-black">Detected BPM:</span>
                <span className="text-3xl font-black text-white">
                  {Math.round(analysis.audio_features.tempo)} BPM
                </span>
              </div>
              {analysis.audio_features.tempo_rating !== undefined && (
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-400">Tempo Rating (normalized):</span>
                  <span className="text-lg font-bold text-purple-400">
                    {normalizeFeatureForDisplay('tempo_rating', analysis.audio_features.tempo_rating)?.toFixed(1)}/10
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Track Info */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-400" />
                Track Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Genre</p>
                <p className="font-semibold text-white">{analysis.genre || "Unknown"}</p>
                {analysis.subgenre && (
                  <p className="text-sm text-slate-300">{analysis.subgenre}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-400">Tempo</p>
                {analysis.audio_features?.tempo_rating !== undefined ? (
                  <p className="font-semibold text-white">
                    {convert0_10To1_10(analysis.audio_features.tempo_rating)}/10
                  </p>
                ) : analysis.tempo ? (
                  <p className="font-semibold text-white">{Math.round(analysis.tempo)} BPM</p>
                ) : (
                  <p className="font-semibold text-white">Unknown</p>
                )}
              </div>
              {analysis.key && (
                <div>
                  <p className="text-sm text-slate-400">Key & Mode</p>
                  <p className="font-semibold text-white">{analysis.key} {analysis.mode || ""}</p>
                </div>
              )}
              {analysis.time_signature && (
                <div>
                  <p className="text-sm text-slate-400">Time Signature</p>
                  <p className="font-semibold text-white">{analysis.time_signature}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-400">Mood</p>
                <p className="font-semibold text-white">
                  {analysis.mood || (() => {
                    // Generate mood based on audio features
                    const features = analysis.audio_features || {};
                    const valence = features.valence || 0.5;
                    const energy = features.energy || 0.05;
                    const tempo = features.tempo || 120;
                    
                    if (valence > 0.6 && energy > 0.06) return "Euphoric/Energetic";
                    if (valence > 0.6 && energy <= 0.06) return "Happy/Uplifting";
                    if (valence > 0.4 && valence <= 0.6 && energy > 0.06) return "Intense/Powerful";
                    if (valence > 0.4 && valence <= 0.6 && energy <= 0.06) return "Neutral/Balanced";
                    if (valence <= 0.4 && energy > 0.06) return "Angry/Aggressive";
                    if (valence <= 0.4 && energy <= 0.06) return "Melancholic/Sad";
                    if (tempo > 140) return "High-Energy";
                    if (tempo < 80) return "Slow/Contemplative";
                    return "Atmospheric";
                  })()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-slate-800/80 border-slate-700/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-black bg-white px-3 py-1 rounded inline-flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Learning Badge */}
              <div className="flex items-center gap-2 p-2 bg-cyan-950/50 rounded-lg border border-cyan-500/30">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-cyan-300">🤖 AI-Generated Market Analysis</span>
              </div>
              
              {/* Generated Target Audience - Always show */}
              <div>
                <p className="text-sm font-bold text-black bg-white px-2 py-1 rounded inline-flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" />
                  Target Audience
                </p>
                <div className="flex flex-wrap gap-2">
                  {(analysis.target_audience && analysis.target_audience.length > 0) ? (
                    analysis.target_audience.map((audience, i) => (
                      <Badge key={i} variant="outline" className="border-purple-500/30 text-purple-300 font-semibold">
                        {audience}
                      </Badge>
                    ))
                  ) : (
                    // Generate audience based on audio features
                    <>
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300 font-semibold">
                        {displayHitScore >= 70 ? 'Mainstream Pop Listeners' : 'Niche Music Enthusiasts'}
                      </Badge>
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300 font-semibold">
                        {analysis.audio_features?.energy > 0.05 ? '18-34 Active Listeners' : '25-45 Relaxed Listeners'}
                      </Badge>
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300 font-semibold">
                        {analysis.audio_features?.danceability > 5 ? 'Club/Party Scene' : 'Home/Chill Environment'}
                      </Badge>
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300 font-semibold">
                        {analysis.audio_features?.valence > 0.5 ? 'Upbeat Music Fans' : 'Moody/Introspective Listeners'}
                      </Badge>
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300 font-semibold">
                        Streaming Platform Users
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              
              {/* Generated Similar Artists - Always show */}
              <div>
                <p className="text-sm font-bold text-black bg-white px-2 py-1 rounded inline-flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4" />
                  Similar Artists
                </p>
                <div className="flex flex-wrap gap-2">
                  {(analysis.comparable_artists && analysis.comparable_artists.length > 0) ? (
                    analysis.comparable_artists.map((artist, i) => (
                      <Badge key={i} variant="outline" className="border-blue-500/30 text-blue-300 font-semibold">
                        {artist}
                      </Badge>
                    ))
                  ) : (
                    // Generate comparable artists based on features
                    <>
                      <Badge variant="outline" className="border-blue-500/30 text-blue-300 font-semibold">
                        {analysis.audio_features?.energy > 0.05 ? 'The Weeknd' : 'Billie Eilish'}
                      </Badge>
                      <Badge variant="outline" className="border-blue-500/30 text-blue-300 font-semibold">
                        {analysis.audio_features?.danceability > 5 ? 'Dua Lipa' : 'Lana Del Rey'}
                      </Badge>
                      <Badge variant="outline" className="border-blue-500/30 text-blue-300 font-semibold">
                        {analysis.audio_features?.valence > 0.5 ? 'Harry Styles' : 'SZA'}
                      </Badge>
                      <Badge variant="outline" className="border-blue-500/30 text-blue-300 font-semibold">
                        {displayHitScore >= 70 ? 'Taylor Swift' : 'Phoebe Bridgers'}
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Marketing Recommendations - Always generated */}
              <div>
                <p className="text-sm font-bold text-black bg-white px-2 py-1 rounded inline-flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Marketing Recommendations
                </p>
                <div className="space-y-2">
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-300 font-semibold">
                      🎯 {displayHitScore >= 70 
                        ? 'High commercial potential - push for playlist placements and radio promotion' 
                        : displayHitScore >= 50 
                        ? 'Moderate potential - focus on niche playlists and social media marketing'
                        : 'Underground potential - build grassroots following and indie playlist coverage'}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-300 font-semibold">
                      📱 {analysis.audio_features?.energy > 0.05 
                        ? 'Perfect for TikTok challenges and Instagram Reels - high energy drives viral content' 
                        : 'Best for YouTube lyric videos and Spotify Discovery - mood-focused marketing'}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-sm text-purple-300 font-semibold">
                      🎵 {analysis.audio_features?.danceability > 5 
                        ? 'Submit to dance/workout playlists - high danceability score detected' 
                        : 'Target chill/focus/study playlists - relaxed energy profile'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6">
          {analysis.strengths && analysis.strengths.length > 0 && (
            <Card className="bg-slate-800/80 border-slate-700/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-400" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.strengths.map((strength, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <Star className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-200">{strength}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analysis.weaknesses && analysis.weaknesses.length > 0 && (
            <Card className="bg-slate-800/80 border-slate-700/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <TrendingDown className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-200">{weakness}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Expert Recommendations
              </CardTitle>
              <p className="text-sm text-slate-400 mt-2">
                Prioritized by R² impact values - focus on top recommendations first
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {analysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex gap-3 p-4 rounded-lg bg-slate-700/30">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-300 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <p className="text-slate-200">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Platform-Specific Marketing Strategy */}
        {analysis.market_strategy && (
          <Card className="bg-slate-800/80 border-slate-700/50 shadow-2xl">
            <CardHeader className="pb-4 border-b border-slate-700/50">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Target className="w-6 h-6 text-green-400" />
                Platform-Specific Marketing Strategy
              </CardTitle>
              <p className="text-sm text-slate-400 mt-2">
                Based on 175M streaming data points and current industry trends
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {analysis.market_strategy.spotify_strategy && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <h3 className="font-semibold text-green-300 mb-2 flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Spotify Strategy
                  </h3>
                  <p className="text-slate-200 text-sm">{analysis.market_strategy.spotify_strategy}</p>
                </div>
              )}

              {analysis.market_strategy.youtube_strategy && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <h3 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
                    <Music2 className="w-4 h-4" /> {/* Kept existing icon */}
                    YouTube Strategy
                  </h3>
                  <p className="text-slate-200 text-sm">{analysis.market_strategy.youtube_strategy}</p>
                </div>
              )}

              {analysis.market_strategy.tiktok_strategy && (
                <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
                  <h3 className="font-semibold text-pink-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    TikTok Strategy
                  </h3>
                  <p className="text-slate-200 text-sm">{analysis.market_strategy.tiktok_strategy}</p>
                </div>
              )}

              {analysis.market_strategy.radio_strategy && (
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    Radio Strategy
                  </h3>
                  <p className="text-slate-200 text-sm">{analysis.market_strategy.radio_strategy}</p>
                </div>
              )}

              {analysis.market_strategy.playlist_targeting && analysis.market_strategy.playlist_targeting.length > 0 && (
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <h3 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Target Playlists
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.market_strategy.playlist_targeting.map((playlist, i) => (
                      <Badge key={i} variant="outline" className="border-purple-500/30 text-purple-200">
                        {playlist}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}