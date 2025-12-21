import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MusicAnalysis } from "@/api/entities";
import { Sparkles, Music, Loader2, AlertCircle, Upload, TrendingUp, Activity, ChevronDown, ChevronUp, Code, ArrowLeft, Shield, Brain } from "lucide-react";
import { runUnifiedDSPAnalysis, calculateAllGenreScores, getGenreSpecificWeights, FEATURE_DESCRIPTIONS } from "../components/shared/UnifiedDSPAnalysis";
import AudioConverter from "../components/analyze/AudioConverter";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { validateCSP, blockScriptInjection, validateFile } from '@/components/shared/SecurityValidator';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import LiveSecurityDisplay from '@/components/shared/LiveSecurityDisplay';
import LiveThreatDisplay from '@/components/shared/LiveThreatDisplay';
import { checkUsageLimit, SUBSCRIPTION_TIERS } from "@/components/shared/subscriptionSystem";
import { useUsageLimits } from "@/components/shared/useUsageLimits";
import LimitLocker from "@/components/shared/LimitLocker";
import { base44 } from "@/api/base44Client";

const GENRE_EMOJIS = {
  'Pop': '🎵',
  'Hip-Hop': '🎤',
  'R&B': '💜',
  'Country': '🤠',
  'Latin/Reggaeton': '🌶️',
  'Reggae': '🌴',
  'Blues': '🎸',
  'Jazz': '🎺',
  'K-Pop': '🇰🇷',
  'J-Core': '🇯🇵',
  'Classical': '🎻',
  'Afrobeats': '🌍',
  'Electronic': '🎹',
  'Rock': '🎸',
  'Christian': '✝️',
  'Gospel': '🙏'
};

export default function GenrePredictorPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [file, setFile] = useState(null);
  const [originalFile, setOriginalFile] = useState(null); // NEW STATE for converter
  const [trackName, setTrackName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showConverter, setShowConverter] = useState(false);
  const [showForm, setShowForm] = useState(true); // NEW STATE to control form visibility
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Waiting for track...");
  const [sessionStartTime] = useState(Date.now()); // NEW STATE for ML session tracking
  const [currentUser, setCurrentUser] = useState(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for conversion threshold
  const CURRENT_ANALYSIS_VERSION = "4.3.0";

  // ENHANCED: Security with ML complexity
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0, violations: [], mlComplexity: 0 });
  
  const { isLocked, loading: loadingLimits } = useUsageLimits(currentUser);

  // Lock enforcement handled by LimitLocker


  // Initialize security and ML data collection
  useEffect(() => {
    let mounted = true;
    base44.auth.me().then(u => { if(mounted) setCurrentUser(u); }).catch(() => {});

    try {
      blockScriptInjection();
      const cspResult = validateCSP();

      if (mounted) {
        setSecurityStatus({
          safe: cspResult.valid,
          threats: cspResult.violations?.length || 0,
          violations: cspResult.violations || [],
          mlComplexity: cspResult.mlComplexity || 0
        });
      }

      // ML LEARNS: Page visit
      mlDataCollector.record('genre_predictor_page_visit', {
        feature: 'genre_predictor',
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
        },
        security: {
          safe: cspResult.valid,
          threats: cspResult.violations?.length || 0,
          mlComplexity: cspResult.mlComplexity || 0
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Security init failed:', error);

      mlDataCollector.record('genre_security_init_error', {
        feature: 'genre_predictor',
        error: error.message,
        timestamp: Date.now()
      });
    }

    return () => {
      mounted = false;
      const sessionDuration = Date.now() - sessionStartTime;
      mlDataCollector.record('genre_session_end', {
        feature: 'genre_predictor',
        sessionDuration: sessionDuration,
        analysisCompleted: !!analysis, // Captures 'analysis' state at the time cleanup is defined (or last effect run)
        timestamp: Date.now()
      });
    };
  }, []); // Empty dependency array means this runs once on mount/unmount

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const analysisId = urlParams.get('id');

    if (analysisId) {
      const loadAnalysis = async () => {
        try {
          const loaded = await MusicAnalysis.get(analysisId);
          if (loaded && loaded.analysis_type === 'genre_hit_predictor') {
            setAnalysis(loaded);
            setTrackName(loaded.track_name || '');
            setArtistName(loaded.artist_name || '');
            setProgress(100);
            setStatusMessage("Loaded from URL!");
            setSelectedGenre(null); // Ensure no genre is pre-selected when loading new analysis
            setShowForm(false); // Hide form if analysis loaded
          } else {
            setError("Analysis not found or incorrect type.");
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (err) {
          console.error('Failed to load analysis:', err);
          setError("Failed to load analysis.");
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      loadAnalysis();
    }
  }, []);

  const calculateFileHash = useCallback(async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  const handleAnalyze = async () => {
    if (!file || !trackName.trim() || !artistName.trim()) {
      setError("Please provide all required information");
      return;
    }

    // SUBSCRIPTION CHECK
    const userTier = currentUser?.role === 'admin' ? SUBSCRIPTION_TIERS.PREMIUM : (currentUser?.subscription_tier || SUBSCRIPTION_TIERS.FREE);
    let currentUsage = 0;
    try {
      const now = new Date();
      const startDate = userTier === 'free' ? new Date(now.getFullYear(), now.getMonth(), 1) : new Date(now.setHours(0,0,0,0));
      const recentAnalyses = await base44.entities.MusicAnalysis.filter({
        created_by: currentUser?.email,
        created_date: { $gte: startDate.toISOString() }
      });
      currentUsage = recentAnalyses.length;
    } catch (e) { console.error("Usage check failed", e); }

    if (!checkUsageLimit(userTier, 'analysis_uploads', currentUsage)) {
      setError(`⚠️ Usage limit reached for ${userTier} plan. Please upgrade to Pro or Premium.`);
      mlDataCollector.record('limit_reached', { feature: 'genre_predictor', tier: userTier, count: currentUsage, timestamp: Date.now() });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    setStatusMessage("Preparing genre prediction analysis...");

    try {
      setProgress(5);
      setStatusMessage("Calculating file hash...");

      const fileHash = await calculateFileHash(file);
      console.log(`🔑 File hash: ${fileHash}`);

      setProgress(10);
      setStatusMessage("Checking cache...");

      const existingAnalyses = await MusicAnalysis.filter({
        file_hash: fileHash,
        analysis_type: "genre_hit_predictor",
        status: "completed",
        analysis_version: CURRENT_ANALYSIS_VERSION
      });

      if (existingAnalyses && existingAnalyses.length > 0) {
        const cached = existingAnalyses[0];
        console.log(`✅ CACHE HIT - Reusing analysis with ALL features`);
        setProgress(100);
        setStatusMessage("Loaded from cache!");
        setAnalysis(cached);
        setSelectedGenre(null); // Ensure no genre is selected when loading from cache
        setIsAnalyzing(false);
        setShowForm(false); // Hide form if analysis loaded from cache
        navigate(createPageUrl("GenrePredictor") + `?id=${cached.id}`, { replace: true });
        mlDataCollector.record('genre_analysis_cache_hit', {
          feature: 'genre_predictor',
          fileHash: fileHash,
          analysisId: cached.id,
          timestamp: Date.now()
        });
        return;
      }

      setProgress(15);
      setStatusMessage("🎵 Running COMPLETE DSP analysis with ALL features (acousticness, harmonicity, complexity, instrumentalness)...");

      console.log("🎵 Running Unified DSP Analysis with CRITICAL FEATURES...");
      const features = await runUnifiedDSPAnalysis(file, fileHash);
      console.log("✅ ALL Features extracted (including acousticness, harmonicity, complexity):", features);


      setProgress(50);
      setStatusMessage("Calculating ALL 12 genre scores with genre-specific weighting...");

      const allGenreScores = calculateAllGenreScores(features);
      console.log("✅ All Genre Scores calculated:", allGenreScores);

      const sortedPredictions = Object.entries(allGenreScores)
        .sort((a, b) => b[1] - a[1])
        .reduce((acc, [genre, score]) => {
          acc[genre] = score;
          return acc;
        }, {});

      setProgress(85);
      setStatusMessage("Finalizing genre analysis...");

      const analysisResult = {
        track_name: trackName,
        artist_name: artistName,
        file_hash: fileHash,
        analysis_type: "genre_hit_predictor",
        audio_features: features,
        genre_predictions: sortedPredictions,
        status: "completed",
        analysis_version: CURRENT_ANALYSIS_VERSION,
        created_date: new Date().toISOString()
      };

      console.log("📊 FINAL GENRE ANALYSIS with ALL FEATURES:", analysisResult);

      setProgress(90);
      setStatusMessage("Saving results...");

      const saved = await MusicAnalysis.create(analysisResult);
      setAnalysis(saved);
      setSelectedGenre(null); // Ensure no genre is selected after new analysis
      setShowForm(false); // Hide form after successful analysis
      navigate(createPageUrl("GenrePredictor") + `?id=${saved.id}`, { replace: true });


      setProgress(100);
      setStatusMessage("✓ Genre prediction complete with ALL features analyzed!");
      mlDataCollector.record('genre_analysis_completed', {
        feature: 'genre_predictor',
        analysisId: saved.id,
        trackName: trackName,
        artistName: artistName,
        topGenre: Object.keys(sortedPredictions)[0],
        topGenreScore: Object.values(sortedPredictions)[0],
        timestamp: Date.now()
      });

    } catch (err) {
      console.error("❌ Fatal error:", err);
      setError(err.message || "Analysis failed. Please try again.");
      mlDataCollector.record('genre_analysis_failed', {
        feature: 'genre_predictor',
        error: err.message,
        timestamp: Date.now()
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e) => { // Renamed from handleFileSelect
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Reset relevant states when a new file is selected
    setError(null);
    setAnalysis(null);
    setSelectedGenre(null);
    setProgress(0);
    setStatusMessage("Waiting for track...");
    setShowForm(true); // Assume form should be visible unless conversion is needed

    // ACCEPT ALL AUDIO FORMATS INCLUDING MP4
    if (!selectedFile.type.startsWith("audio/") &&
        !selectedFile.name.match(/\.(mp3|wav|m4a|mp4|flac|ogg|aac|wma|aiff|ape|alac|opus)$/i)) {
      setError("Please upload an audio file");
      setFile(null);
      setTrackName("");
      setArtistName("");
      mlDataCollector.record('genre_file_invalid_type', {
        feature: 'genre_predictor',
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        timestamp: Date.now()
      });
      return;
    }

    // SECURITY: Validate file
    const validation = validateFile(selectedFile, {
      maxSizeMB: 200, // FIXED: Allow up to 200MB for validation
      allowedTypes: ['audio/*'],
      allowedExtensions: ['mp3', 'wav', 'm4a', 'mp4', 'flac', 'ogg', 'aac', 'wma', 'aiff', 'ape', 'alac', 'opus']
    });

    if (!validation.valid) {
      setError(validation.errors.join(', '));
      setFile(null);
      setTrackName("");
      setArtistName("");
      mlDataCollector.record('genre_file_validation_failed', {
        feature: 'genre_predictor',
        errors: validation.errors,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        timestamp: Date.now()
      });
      return;
    }

    const fileSizeMB = selectedFile.size / (1024 * 1024);
    const isMP3 = selectedFile.type === 'audio/mpeg' || selectedFile.name.toLowerCase().endsWith('.mp3');

    // FIXED: Auto-trigger converter if file is too large or not MP3 (using MAX_FILE_SIZE for conversion threshold)
    if (fileSizeMB > (MAX_FILE_SIZE / (1024 * 1024)) || !isMP3) {
      console.log(`🔄 File needs conversion: ${fileSizeMB.toFixed(2)}MB, isMP3: ${isMP3}`);
      setOriginalFile(selectedFile); // Store the original file for conversion
      setShowConverter(true);
      setFile(null); // Clear the main file state until conversion is complete
      setShowForm(false); // Hide the main form while converter is active
      setError(null);

      mlDataCollector.record('genre_conversion_triggered', {
        feature: 'genre_predictor',
        fileSize: fileSizeMB,
        isMP3: isMP3,
        reason: fileSizeMB > (MAX_FILE_SIZE / (1024 * 1024)) ? 'size_too_large' : 'not_mp3',
        timestamp: Date.now()
      });
      return;
    }

    // If no conversion needed, set the file directly
    setFile(selectedFile);
    setOriginalFile(null); // Clear originalFile if no conversion was needed
    setShowConverter(false); // Ensure converter is hidden
    setShowForm(true); // Ensure form is visible

    const fileNameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, "");
    setTrackName(fileNameWithoutExtension);
    setStatusMessage("File selected, ready for analysis.");

    mlDataCollector.record('genre_file_uploaded', {
      feature: 'genre_predictor',
      fileName: selectedFile.name,
      fileSize: fileSizeMB,
      timestamp: Date.now()
    });
  };

  const handleConversionComplete = (convertedFile) => {
    setFile(convertedFile);
    setOriginalFile(null); // Conversion is complete, clear original file
    setShowConverter(false);
    setShowForm(true); // Show the form again after conversion
    setError(null);
    setAnalysis(null);
    setSelectedGenre(null); // Clear selected genre after conversion
    setProgress(0);
    setStatusMessage("File converted, ready for analysis.");

    mlDataCollector.record('genre_conversion_completed', {
      feature: 'genre_predictor',
      convertedFileName: convertedFile.name,
      convertedFileSize: convertedFile.size / (1024 * 1024),
      timestamp: Date.now()
    });
  };

  // genrePredictions and audioFeatures are derived from analysis, not standalone states
  const genrePredictions = analysis?.genre_predictions;
  const audioFeatures = analysis?.audio_features;

  return (
    <div className="p-4 md:p-8 relative min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f0520] to-[#050015]">
      <LimitLocker feature="analysis_uploads" featureKey="GENRE_PREDICTOR" user={currentUser} />
      <div className="max-w-6xl mx-auto space-y-6"> {/* Changed to max-w-6xl */}
        <NetworkErrorBanner />
        <AILearningBanner />
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Genre Hit Predictor
          </h1>
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold border-none hover:from-purple-700 hover:to-pink-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
        <p className="text-slate-300 text-lg text-center md:text-left">
          Discover your track's hit potential across all 12 genres
        </p>

        {/* ENHANCED: Security Status */}
        <Card className={`rounded-xl overflow-hidden border shadow-lg ${securityStatus.safe ? 'bg-black/20 border-green-900/30 shadow-green-900/10' : 'bg-black/20 border-red-900/30 shadow-red-900/10'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className={`w-5 h-5 ${securityStatus.safe ? 'text-green-400' : 'text-red-400'}`} />
                <div>
                  <p className="text-white font-bold text-sm">🛡️ Security Active • AI Learning Enabled</p>
                  <p className="text-xs text-slate-400">
                    {securityStatus.safe
                      ? `All files validated & protected • ML complexity: ${securityStatus.mlComplexity.toFixed(1)}`
                      : `${securityStatus.threats} threats blocked`}
                  </p>
                </div>
              </div>
              <Badge className={securityStatus.safe ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}>
                {securityStatus.safe ? 'SAFE' : 'ALERT'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* AI Learning Status */}
        {file && (
          <Card className="bg-black/20 border-l-4 border-l-cyan-500 border-y-0 border-r-0 shadow-2xl shadow-cyan-900/20 rounded-xl overflow-hidden relative group hover:shadow-cyan-500/10 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/30 via-transparent to-transparent opacity-100" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-cyan-400 shrink-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">🤖 AI Learns From Your Data</p>
                  <p className="text-xs text-cyan-400/80 break-words">
                    Genre learning • 12-way classification • Browser-based ML • Security protected
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <LiveSecurityDisplay />
        <LiveThreatDisplay />

        <Card className="bg-black/20 border border-purple-900/30 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-purple-900/20 bg-purple-950/5 p-6">
            <CardTitle className="text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              12 Genre Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(GENRE_EMOJIS).map(([genre, emoji]) => (
                <div 
                  key={genre} 
                  onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                  className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-300 cursor-pointer group ${
                    selectedGenre === genre 
                      ? 'bg-purple-600 border-purple-400 shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]' 
                      : 'bg-black/40 border-slate-800 hover:border-purple-500/50 hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.15)]'
                  }`}
                >
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{emoji}</span>
                  <span className={`text-sm font-black text-center transition-colors ${
                    selectedGenre === genre 
                      ? 'text-black' 
                      : 'text-slate-300 group-hover:text-white'
                  }`}>{genre}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conditional rendering for the upload form based on showForm state */}
        {!analysis && showForm && (
          <Card className="bg-black/20 border border-pink-900/30 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-pink-900/20 bg-pink-950/5 p-6">
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-pink-400" />
                Upload Your Track
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <Label htmlFor="audio-file" className="text-white mb-2 block">Audio File *</Label>
                <input
                  id="audio-file"
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.mp4,.flac,.ogg,.aac,.wma,.aiff,.ape,.alac,.opus"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                />
                {file && (
                  <p className="text-green-400 text-sm mt-2">✓ {file.name} selected</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="track-name" className="text-white mb-2 block">Track Name *</Label>
                  <Input
                    id="track-name"
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    placeholder="Enter track name"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="artist-name" className="text-white mb-2 block">Artist Name *</Label>
                  <Input
                    id="artist-name"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="Enter artist name"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 p-3 rounded-md bg-red-900/20 border border-red-500/30">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {isAnalyzing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2 bg-slate-600" indicatorClassName="bg-purple-500"/>
                  <p className="text-sm text-slate-400 text-center">{statusMessage}</p>
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !file || !trackName.trim() || !artistName.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Genres...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Predict Genres
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* AudioConverter is shown when showConverter is true and originalFile is available */}
        {showConverter && originalFile && (
          <AudioConverter
            file={originalFile}
            onConversionComplete={handleConversionComplete}
            onCancel={() => {
              setOriginalFile(null);
              setFile(null); // Clear the main file state as well
              setShowConverter(false);
              setShowForm(true); // Show the form again after cancellation
              setError(null);
              setTrackName("");
              setArtistName("");
              setAnalysis(null);
              setSelectedGenre(null);
              setProgress(0);
              setStatusMessage("Waiting for track...");
              mlDataCollector.record('genre_conversion_cancelled', {
                feature: 'genre_predictor',
                timestamp: Date.now()
              });
            }}
          />
        )}

        {analysis && (
          <div className="space-y-6">
            <Card className="bg-black/20 border border-purple-900/30 shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-purple-900/20 bg-purple-950/5 p-8">
                <CardTitle className="text-white font-black text-3xl flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                  Genre Hit Predictions
                </CardTitle>
                <p className="text-purple-200 text-base font-medium mt-2">
                  {selectedGenre === null ? "Click any genre to see its specific feature rankings" : "Detailed Feature Breakdown"}
                </p>
                <div className="mt-6 p-6 bg-black/40 rounded-xl border border-white/5">
                  <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                    "{analysis.track_name}"
                  </h2>
                  <p className="text-2xl font-bold text-slate-400">
                    by {analysis.artist_name}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-400 mt-4">
                    <Badge variant="outline" className="border-purple-500/30 text-purple-300 bg-purple-900/10 px-3 py-1">
                      Analysis Version {CURRENT_ANALYSIS_VERSION}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {selectedGenre === null ? (
                  <>
                    {/* FORMULA EXPLANATION - adapted for dark theme */}
                    <div className="space-y-4 mb-8">
                      <div className="p-6 bg-purple-950/20 border border-purple-500/20 rounded-xl">
                        <h3 className="text-purple-300 font-bold mb-3 text-lg">✅ Formula Used:</h3>
                        <code className="text-sm text-purple-200 block mb-3 overflow-auto font-mono bg-black/30 p-3 rounded-lg">
                          genre_score = (Σ(normalized_feature × R² × genre_multiplier)) / (Σ(R² × genre_multiplier)) × 100
                        </code>
                        <p className="text-xs text-slate-400 font-medium">
                          Same base formula as Track Analysis, but with genre-specific multipliers applied to R² weights
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.entries(genrePredictions || {})
                        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
                        .map(([genreKey, score]) => {
                          const outOf10 = ((score / 100) * 9 + 1).toFixed(0);
                          const genreEmoji = GENRE_EMOJIS[genreKey] || '❓';

                          return (
                            <Card
                              key={genreKey}
                              className="bg-black/40 border border-slate-800 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.15)] hover:scale-[1.02] group"
                              onClick={() => {
                                setSelectedGenre(genreKey);
                              }}
                            >
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-4">
                                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{genreEmoji}</span>
                                    <div>
                                      <h3 className="text-white font-black text-lg group-hover:text-purple-300 transition-colors">{genreKey}</h3>
                                      <p className="text-3xl font-black text-purple-400">
                                        {outOf10}/10 <span className="text-lg text-purple-400/60">({score.toFixed(1)}%)</span>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-500 font-bold">
                                  Genre-specific analysis with adjusted feature importance
                                </p>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>

                    <div className="mt-8 text-center">
                      <Button
                        onClick={() => {
                          setAnalysis(null);
                          setSelectedGenre(null);
                          setFile(null);
                          setTrackName("");
                          setArtistName("");
                          setError(null);
                          setShowConverter(false);
                          setShowForm(true); // Show form again to analyze another track
                          setProgress(0);
                          setStatusMessage("Waiting for track...");
                          window.history.replaceState({}, document.title, window.location.pathname);
                        }}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <span className="font-black">Analyze Another Track</span>
                      </Button>
                    </div>
                  </>
                ) : ( // Display details for selected genre
                  <div className="space-y-6">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedGenre(null)}
                      className="bg-slate-700/50 text-white border-slate-600 hover:bg-slate-600/50 mb-4"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to all genres
                    </Button>

                    {(() => {
                      const currentGenre = selectedGenre;
                      const score = analysis.genre_predictions[currentGenre];
                      const score1to10 = Math.round((score / 100) * 9 + 1);
                      const genreWeights = getGenreSpecificWeights(currentGenre);

                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-semibold flex items-center gap-2">
                              <span className="text-3xl">{GENRE_EMOJIS[currentGenre]}</span>
                              {currentGenre}
                              {currentGenre === 'Pop' && (
                                <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-900/20">
                                  Base Analysis
                                </Badge>
                              )}
                            </span>
                            <div className="text-right">
                              <span className={`text-2xl font-black ${
                                score >= 70 ? 'text-green-400' :
                                score >= 50 ? 'text-orange-400' :
                                'text-slate-400'
                              }`}>
                                {score1to10}/10
                              </span>
                              <p className="text-xs text-slate-400">
                                ({score.toFixed(1)}% hit score)
                              </p>
                            </div>
                          </div>
                          <Progress value={score} className="h-3 bg-slate-600" indicatorClassName="bg-purple-500" />
                          <p className="text-xs text-slate-400 italic mt-1">
                            {currentGenre === 'Pop'
                              ? "Uses base R² weights without genre multipliers"
                              : `Genre-specific analysis with adjusted feature importance`
                            }
                          </p>

                          {audioFeatures && (
                            <div className="mt-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
                              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-purple-400" />
                                {currentGenre} Feature Rankings (sorted by genre importance)
                              </h4>
                              <div className="grid md:grid-cols-2 gap-3">
                                {Object.entries(audioFeatures)
                                  .filter(([key]) => key !== 'tempo')
                                  .sort((a, b) => {
                                    const r2A = genreWeights[a[0]] || 0;
                                    const r2B = genreWeights[b[0]] || 0;
                                    return r2B - r2A;
                                  })
                                  .map(([key, value], idx) => {
                                    const rating0_10 = typeof value === 'number' ? value : 0;
                                    const displayValue1_10 = (rating0_10 / 10) * 9 + 1;
                                    const genreR2 = genreWeights[key] || 0;

                                    const allGenreR2 = Object.values(genreWeights);
                                    const maxGenreR2 = allGenreR2.length > 0 ? Math.max(...allGenreR2) : 0;
                                    const isStrongestForGenre = genreR2 === maxGenreR2 && genreR2 > 0;

                                    return (
                                      <div key={key} className="space-y-1 p-2 bg-slate-800 rounded border border-slate-700">
                                        <div className="flex justify-between items-center">
                                          <span className="text-slate-300 text-sm capitalize font-semibold card-text-safe">
                                            {idx + 1}. {key === 'tempo_rating' ? 'Tempo' : key.replace(/_/g, ' ')}
                                          </span>
                                          <span className="text-white font-bold text-sm">
                                            {displayValue1_10.toFixed(1)}/10
                                          </span>
                                        </div>
                                        <Progress value={rating0_10 * 10} className="h-1 bg-slate-600" indicatorClassName="bg-purple-500" />
                                        {FEATURE_DESCRIPTIONS[key] && (
                                          <p className="text-xs text-slate-400 italic card-text-safe">{FEATURE_DESCRIPTIONS[key]}</p>
                                        )}
                                        {genreR2 > 0 && (
                                          <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400 bg-purple-900/20 card-text-safe">
                                            R² = {genreR2.toFixed(3)} {isStrongestForGenre ? '⭐ Most Important' : ''}
                                          </Badge>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}