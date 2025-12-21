import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileMusic, Search, Music, AlertCircle, Loader2, RefreshCw, Upload, Shield, Brain, ArrowLeft, Wand2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useUsageLimits } from "@/components/shared/useUsageLimits";
import LimitLocker from "@/components/shared/LimitLocker";
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import LiveSecurityDisplay from '@/components/shared/LiveSecurityDisplay';
import LiveThreatDisplay from '@/components/shared/LiveThreatDisplay';
import { setupGlobalNetworkHandler } from "@/components/shared/NetworkErrorHandler";

export default function SheetMusicPage() {
  const mlDataCollector = useMLDataCollector();
  const navigate = useNavigate();
  
  const [analyses, setAnalyses] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [generatingIds, setGeneratingIds] = useState(new Set());
  const [isUploadingSheet, setIsUploadingSheet] = useState(false);
  const [selectedKey, setSelectedKey] = useState("C");
  const [showKeySelector, setShowKeySelector] = useState(false);
  const [keyAnalysisFor, setKeyAnalysisFor] = useState(null);
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0, mlComplexity: 0 });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [currentUser, setCurrentUser] = useState(null);

  const musicalKeys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  const { isLocked, loading: loadingLimits } = useUsageLimits(currentUser);

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

        // ML LEARNS: Page visit
        mlDataCollector.record('sheet_music_page_visit', {
          feature: 'sheet_music',
          security: { safe: cspResult.valid, threats: cspResult.violations?.length || 0 },
          viewport: { width: window.innerWidth, height: window.innerHeight },
          timestamp: Date.now()
        });

        const authenticated = await base44.auth.isAuthenticated();
        
        if (!authenticated) {
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }

        if (mounted) {
          setIsAuthenticated(true);
          const user = await base44.auth.me();
          setCurrentUser(user);
        }

        await loadAnalyses();
      } catch (error) {
        console.error('❌ Initialization failed:', error);
        mlDataCollector.record('sheet_music_init_error', {
          feature: 'sheet_music',
          error: error.message,
          timestamp: Date.now()
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializePage();

    return () => {
      mounted = false;
      const sessionDuration = Date.now() - sessionStartTime;
      mlDataCollector.record('sheet_music_session_end', {
        feature: 'sheet_music',
        sessionDuration,
        timestamp: Date.now()
      });
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAnalyses(analyses);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = analyses.filter(a => 
      a.track_name?.toLowerCase().includes(query) || 
      a.artist_name?.toLowerCase().includes(query)
    );
    setFilteredAnalyses(filtered);
  }, [searchQuery, analyses]);

  const loadAnalyses = async () => {
    try {
      const allAnalyses = await base44.entities.MusicAnalysis.list('-created_date');
      const now = new Date();
      const userAnalyses = allAnalyses.filter(a => {
        if (a.artist_name === "[System Cache]") return false;
        if (a.artist_name === "Educational Query") return false;
        if (a.track_name?.startsWith("AI Query:")) return false;
        if (a.track_name?.startsWith("Emoji Lyrics")) return false;
        if (a.track_name?.startsWith("Lyrics:")) return false;
        if (a.analysis_type === "music_education") return false;
        if (a.analysis_type === "lyrics_retrieval") return false;
        if (a.analysis_type === "emoji_lyrics_converter") return false;
        if (a.analysis_type === "lyrics_analyzer") return false;
        if (a.analysis_type === "ai_track_query") return false;
        
        const isValidType = a.analysis_type === "track_analysis" || 
         a.analysis_type === "rhythm_analysis" || 
         a.analysis_type === "sheet_music_generator" ||
         a.analysis_type === "sheet_music_upload" ||
         !a.analysis_type ||
         a.file_url;
        
        return isValidType;
      });
      setAnalyses(userAnalyses);
      setFilteredAnalyses(userAnalyses);
      
      mlDataCollector.record('sheet_music_loaded', {
        feature: 'sheet_music',
        analysisCount: userAnalyses.length,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("❌ Failed to load analyses:", error);
      setAnalyses([]);
      setFilteredAnalyses([]);
      
      mlDataCollector.record('sheet_music_load_error', {
        feature: 'sheet_music',
        error: error.message,
        timestamp: Date.now()
      });
    }
  };

  const withSheetMusic = filteredAnalyses.filter(a => a.sheet_music);
  const withoutSheetMusic = filteredAnalyses.filter(a => !a.sheet_music);

  const handleViewSheetMusic = (analysisId) => {
    navigate(createPageUrl("SheetMusicView") + `?id=${analysisId}`);
    mlDataCollector.record('sheet_music_viewed', {
      feature: 'sheet_music',
      analysisId,
      timestamp: Date.now()
    });
  };

  const handleRequestKeyChange = (analysis) => {
    setKeyAnalysisFor(analysis);
    setSelectedKey(analysis.sheet_music?.key || analysis.key || "C");
    setShowKeySelector(true);
    
    mlDataCollector.record('key_change_requested', {
      feature: 'sheet_music',
      trackName: analysis.track_name,
      currentKey: analysis.sheet_music?.key || analysis.key,
      timestamp: Date.now()
    });
  };

  const handleGenerateInKey = async (key) => {
    if (!keyAnalysisFor) return;

    setGeneratingIds(prev => new Set(prev).add(keyAnalysisFor.id));
    setShowKeySelector(false);

    const startTime = Date.now();

    try {
      console.log(`🎼 Transposing sheet music to key of ${key} for "${keyAnalysisFor.track_name}"...`);

      // Get existing sheet music data to transpose
      const existingSheet = keyAnalysisFor.sheet_music || {};
      const originalKey = existingSheet.key || keyAnalysisFor.key || 'C';

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional music transcription expert. TRANSPOSE this existing sheet music from ${originalKey} to ${key}.

ORIGINAL TRACK: "${keyAnalysisFor.track_name}" by ${keyAnalysisFor.artist_name}
ORIGINAL KEY: ${originalKey}
TARGET KEY: ${key}

EXISTING CHORD PROGRESSIONS TO TRANSPOSE:
- Verse: ${JSON.stringify(existingSheet.chord_progressions?.verse || existingSheet.chord_progression?.verse || ['C', 'G', 'Am', 'F'])}
- Chorus: ${JSON.stringify(existingSheet.chord_progressions?.chorus || existingSheet.chord_progression?.chorus || ['F', 'C', 'G', 'Am'])}
- Bridge: ${JSON.stringify(existingSheet.chord_progressions?.bridge || existingSheet.chord_progression?.bridge || ['Am', 'F', 'C', 'G'])}

EXISTING MELODY NOTES TO TRANSPOSE:
${JSON.stringify(existingSheet.melody?.main_phrases || ['C4 E4 G4 C5', 'B4 G4 E4 C4'])}

EXISTING BASS NOTES TO TRANSPOSE:
${JSON.stringify(existingSheet.bass_line || { verse_pattern: 'C2 G2 A2 F2', chorus_pattern: 'F2 C2 G2 A2' })}

RULES FOR TRANSPOSITION:
1. Calculate the interval between ${originalKey} and ${key}
2. Move ALL chord roots by that interval
3. Move ALL melody notes by that interval
4. Move ALL bass notes by that interval
5. Preserve chord qualities (major stays major, minor stays minor, 7ths stay 7ths)
6. Preserve all rhythm patterns, dynamics, and articulations (staccato, legato, etc.)
7. Keep the same time signature: ${existingSheet.time_signature || '4/4'}
8. Keep the same tempo: ${existingSheet.tempo_bpm || existingSheet.tempo || keyAnalysisFor.tempo || 120} BPM

Generate the COMPLETE transposed sheet music with all details preserved.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            artist: { type: "string" },
            key: { type: "string" },
            mode: { type: "string" },
            time_signature: { type: "string" },
            tempo: { type: "number" },
            tempo_bpm: { type: "number" },
            chord_progressions: {
              type: "object",
              properties: {
                intro: { type: "array", items: { type: "string" } },
                verse: { type: "array", items: { type: "string" } },
                pre_chorus: { type: "array", items: { type: "string" } },
                chorus: { type: "array", items: { type: "string" } },
                bridge: { type: "array", items: { type: "string" } },
                outro: { type: "array", items: { type: "string" } }
              },
              required: ["verse", "chorus"]
            },
            chord_progression: {
              type: "object",
              properties: {
                verse: { type: "array", items: { type: "string" } },
                chorus: { type: "array", items: { type: "string" } },
                bridge: { type: "array", items: { type: "string" } }
              }
            },
            melody: {
              type: "object",
              properties: {
                main_phrases: { type: "array", items: { type: "string" } },
                highest_note: { type: "string" },
                lowest_note: { type: "string" },
                melodic_contour: { type: "string" }
              }
            },
            bass_line: {
              type: "object",
              properties: {
                verse_pattern: { type: "string" },
                chorus_pattern: { type: "string" },
                style: { type: "string" },
                rhythmic_pattern: { type: "string" }
              }
            },
            drum_pattern: {
              type: "object",
              properties: {
                kick_pattern: { type: "string" },
                snare_pattern: { type: "string" },
                hihat_pattern: { type: "string" },
                groove_feel: { type: "string" }
              }
            },
            dynamics: {
              type: "object",
              properties: {
                verse_dynamic: { type: "string" },
                chorus_dynamic: { type: "string" },
                crescendos: { type: "string" },
                expression_marks: { type: "array", items: { type: "string" } }
              }
            },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  measures: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        melody: { type: "array", items: { type: "string" } },
                        duration: { type: "array", items: { type: "string" } },
                        chord: { type: "string" },
                        bass: { type: "array", items: { type: "string" } }
                      }
                    }
                  }
                }
              }
            },
            song_structure: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  section: { type: "string" },
                  measures: { type: "number" }
                }
              }
            },
            difficulty_level: { type: "string" },
            performance_notes: { type: "array", items: { type: "string" } },
            transposition_info: {
              type: "object",
              properties: {
                original_key: { type: "string" },
                target_key: { type: "string" },
                interval: { type: "string" }
              }
            }
          },
          required: ["key", "chord_progressions", "melody", "bass_line"]
        }
      });

      // Ensure key is set correctly
      const transposedSheet = {
        ...response,
        key: key,
        tempo: response.tempo_bpm || response.tempo || existingSheet.tempo_bpm || existingSheet.tempo || 120,
        time_signature: response.time_signature || existingSheet.time_signature || '4/4',
        transposition_info: {
          original_key: originalKey,
          target_key: key,
          transposed_at: new Date().toISOString()
        }
      };

      await base44.entities.MusicAnalysis.update(keyAnalysisFor.id, {
        sheet_music: transposedSheet,
        key: key,
        analysis_type: 'sheet_music_generator'
      });

      await loadAnalyses();
      
      const generationDuration = Date.now() - startTime;
      mlDataCollector.record('sheet_music_transposed', {
        feature: 'sheet_music',
        trackName: keyAnalysisFor.track_name,
        originalKey,
        targetKey: key,
        generationDuration,
        timestamp: Date.now()
      });
      
      alert(`✓ Successfully transposed to ${key}!`);
      
    } catch (error) {
      console.error("Failed to transpose sheet music:", error);
      alert(`Failed to transpose: ${error.message || 'Please try again.'}`);
      
      mlDataCollector.record('sheet_music_transpose_error', {
        feature: 'sheet_music',
        trackName: keyAnalysisFor.track_name,
        targetKey: key,
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      setGeneratingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(keyAnalysisFor.id);
        return newSet;
      });
      setKeyAnalysisFor(null);
      setSelectedKey("C");
    }
  };

  const handleGenerateSheetMusic = async (analysis) => {
    setGeneratingIds(prev => new Set(prev).add(analysis.id));

    try {
      console.log(`🎼 Generating sheet music for "${analysis.track_name}"...`);

      let sheetMusicData;

      // If we have a file_url, use the backend function for better analysis
      if (analysis.file_url) {
        try {
          const { generateSheetMusic } = await import("@/api/functions");
          const result = await generateSheetMusic({
            file_url: analysis.file_url,
            track_name: analysis.track_name,
            artist_name: analysis.artist_name,
            analysis_id: analysis.id
          });
          
          if (result.data?.success) {
            sheetMusicData = result.data.sheet_music;
          } else {
            throw new Error(result.data?.error || 'Backend generation failed');
          }
        } catch (backendError) {
          console.warn("Backend function failed, falling back to direct LLM:", backendError);
          // Fall through to LLM fallback
        }
      }

      // Fallback: Use direct LLM if no file or backend failed
      if (!sheetMusicData) {
        // Use existing audio features if available
        const audioFeatures = analysis.audio_features || {};
        const rhythmAnalysis = analysis.rhythm_analysis || {};
        
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a professional music transcription expert trained on 175+ million musical scores.

Generate COMPLETE, DETAILED sheet music for "${analysis.track_name}" by ${analysis.artist_name}.

AUDIO ANALYSIS DATA:
- Genre: ${analysis.genre || 'Pop'}
- Tempo: ${analysis.tempo || audioFeatures.tempo || 120} BPM
- Key: ${analysis.key || audioFeatures.key || 'C'} ${analysis.mode || audioFeatures.mode || 'major'}
- Time Signature: ${analysis.time_signature || '4/4'}
- Energy: ${audioFeatures.energy ? (audioFeatures.energy * 100).toFixed(0) + '%' : 'Medium'}
- Danceability: ${audioFeatures.danceability ? audioFeatures.danceability.toFixed(2) : 'Medium'}
- Acousticness: ${audioFeatures.acousticness ? audioFeatures.acousticness.toFixed(2) : 'Medium'}
- Valence (Mood): ${audioFeatures.valence ? audioFeatures.valence.toFixed(2) : 'Neutral'}

RHYTHM ANALYSIS:
${JSON.stringify(rhythmAnalysis, null, 2)}

REQUIREMENTS - Generate ALL of the following with EXACT NOTES:

1. CHORD PROGRESSIONS (with specific voicings):
   - Intro chords
   - Verse chords (at least 4 chords)
   - Pre-chorus chords (if applicable)
   - Chorus chords (at least 4 chords)
   - Bridge chords
   - Outro chords

2. MELODY NOTATION (with exact note names and octaves):
   - Main melody phrases as note sequences like "C4 E4 G4 C5 B4 G4"
   - Include rhythmic values
   - Mark staccato, legato, and other articulations
   - Specify highest and lowest notes

3. BASS LINE (with exact notes):
   - Verse bass pattern with notes like "C2 G2 A2 F2"
   - Chorus bass pattern
   - Bass playing style (fingerstyle, pick, slap)
   - Rhythmic pattern

4. DRUM PATTERN:
   - Kick pattern (which beats)
   - Snare pattern
   - Hi-hat pattern (8ths, 16ths, etc.)
   - Groove feel (straight, swung, shuffled)

5. DYNAMICS & EXPRESSION:
   - Verse dynamic marking (pp, p, mp, mf, f, ff)
   - Chorus dynamic marking
   - Crescendos/decrescendos locations
   - Expression marks: staccato, legato, accents, marcato

6. SONG STRUCTURE:
   - List each section with measure counts
   - Include repeat signs, codas, D.S. al Coda

7. SECTIONS with detailed notation:
   - At least 4 sections (Intro, Verse, Chorus, Bridge)
   - Each section with 4 measures minimum
   - Each measure with melody notes, durations, chord, and bass

Be SPECIFIC with note names (C4, D#5, Bb3, etc.) - no generic placeholders!`,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              artist: { type: "string" },
              key: { type: "string" },
              mode: { type: "string" },
              tempo: { type: "number" },
              tempo_bpm: { type: "number" },
              time_signature: { type: "string" },
              chord_progressions: {
                type: "object",
                properties: {
                  intro: { type: "array", items: { type: "string" } },
                  verse: { type: "array", items: { type: "string" } },
                  pre_chorus: { type: "array", items: { type: "string" } },
                  chorus: { type: "array", items: { type: "string" } },
                  bridge: { type: "array", items: { type: "string" } },
                  outro: { type: "array", items: { type: "string" } }
                },
                required: ["verse", "chorus"]
              },
              chord_progression: {
                type: "object",
                properties: {
                  verse: { type: "array", items: { type: "string" } },
                  chorus: { type: "array", items: { type: "string" } },
                  bridge: { type: "array", items: { type: "string" } }
                }
              },
              melody: {
                type: "object",
                properties: {
                  main_phrases: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Melody as note sequences like 'C4 E4 G4 C5 B4 G4 E4 C4'"
                  },
                  highest_note: { type: "string" },
                  lowest_note: { type: "string" },
                  key_intervals: { type: "array", items: { type: "string" } },
                  melodic_contour: { type: "string" }
                },
                required: ["main_phrases", "highest_note", "lowest_note"]
              },
              bass_line: {
                type: "object",
                properties: {
                  verse_pattern: { type: "string", description: "Bass notes like 'C2 G2 A2 F2'" },
                  chorus_pattern: { type: "string" },
                  style: { type: "string" },
                  rhythmic_pattern: { type: "string" }
                },
                required: ["verse_pattern", "chorus_pattern"]
              },
              drum_pattern: {
                type: "object",
                properties: {
                  kick_pattern: { type: "string" },
                  snare_pattern: { type: "string" },
                  hihat_pattern: { type: "string" },
                  groove_feel: { type: "string" },
                  fills: { type: "string" }
                }
              },
              dynamics: {
                type: "object",
                properties: {
                  verse_dynamic: { type: "string" },
                  chorus_dynamic: { type: "string" },
                  crescendos: { type: "string" },
                  expression_marks: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "staccato, legato, accent, marcato, etc."
                  }
                }
              },
              sections: {
                type: "array",
                minItems: 4,
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    measures: {
                      type: "array",
                      minItems: 4,
                      items: {
                        type: "object",
                        properties: {
                          melody: { type: "array", items: { type: "string" } },
                          duration: { type: "array", items: { type: "string" } },
                          chord: { type: "string" },
                          bass: { type: "array", items: { type: "string" } }
                        },
                        required: ["melody", "chord", "bass"]
                      }
                    }
                  },
                  required: ["name", "measures"]
                }
              },
              song_structure: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    section: { type: "string" },
                    measures: { type: "number" }
                  }
                }
              },
              guitar_tab: {
                type: "object",
                properties: {
                  tuning: { type: "string" },
                  capo: { type: "string" },
                  strumming_pattern: { type: "string" },
                  fingerpicking_pattern: { type: "string" }
                }
              },
              piano_notation: {
                type: "object",
                properties: {
                  right_hand_pattern: { type: "string" },
                  left_hand_pattern: { type: "string" }
                }
              },
              difficulty_level: { type: "string" },
              performance_notes: { type: "array", items: { type: "string" } }
            },
            required: ["key", "chord_progressions", "melody", "bass_line", "dynamics", "sections"]
          }
        });
        
        sheetMusicData = {
          ...response,
          tempo: response.tempo_bpm || response.tempo || analysis.tempo || 120,
          time_signature: response.time_signature || analysis.time_signature || '4/4'
        };
      }

      // Update the analysis with sheet music
      await base44.entities.MusicAnalysis.update(analysis.id, {
        sheet_music: sheetMusicData,
        analysis_type: 'sheet_music_generator'
      });

      await loadAnalyses();
      
      mlDataCollector.record('sheet_music_generated', {
        feature: 'sheet_music',
        trackName: analysis.track_name,
        hasAudioFeatures: !!analysis.audio_features,
        timestamp: Date.now()
      });
      
      alert(`✓ Sheet music generated for "${analysis.track_name}"!`);
      
    } catch (error) {
      console.error("Failed to generate:", error);
      alert(`Failed: ${error.message || 'Please try again.'}`);
      
      mlDataCollector.record('sheet_music_generation_error', {
        feature: 'sheet_music',
        trackName: analysis.track_name,
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      setGeneratingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(analysis.id);
        return newSet;
      });
    }
  };

  const handleUploadSheetMusic = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingSheet(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      let response;
      try {
        response = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this sheet music file and extract all musical information. Digitize title, artist, key, tempo, chords, melody, and structure.`,
          file_urls: [file_url],
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              artist: { type: "string" },
              key: { type: "string" },
              tempo: { type: "number" },
              sections: { type: "array" }
            }
          }
        });
      } catch (apiError) {
        throw new Error('Network error - please check your connection and try again');
      }

      const newAnalysis = await base44.entities.MusicAnalysis.create({
        track_name: response.title || file.name.replace(/\.[^/.]+$/, "") || "Untitled",
        artist_name: response.artist || "Unknown",
        analysis_type: 'sheet_music_upload',
        sheet_music: response,
        status: 'completed',
        genre: "Sheet Music Upload",
        file_url: file_url,
        key: response.key || "C major"
      });

      await loadAnalyses();
      navigate(createPageUrl("SheetMusicView") + `?id=${newAnalysis.id}`);
      
      mlDataCollector.record('sheet_music_uploaded', {
        feature: 'sheet_music',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Failed to upload:", error);
      alert(`Failed: ${error.message || 'Please try again.'}`);
    } finally {
      setIsUploadingSheet(false);
      event.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
        <p className="text-cyan-500/70 font-mono text-sm tracking-widest animate-pulse">ACCESSING SCORE LIBRARY...</p>
      </div>
    );
  }

  return (
    // CYBERPUNK BASE - PURE DARK
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f0520] to-[#050015] p-4 md:p-8 pb-8 text-cyan-50 selection:bg-cyan-500/30 selection:text-cyan-100">

      <div className="relative z-10">
        <LimitLocker feature="analysis_uploads" featureKey="SHEET_MUSIC" user={currentUser} />
        
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* HEADER */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded-full transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-5xl font-black mb-2 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-500 animate-pulse">
                  SHEET MUSIC LIBRARY
                </span>
              </h1>
              <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
                AI Transcription & Generation Matrix
              </p>
            </div>
          </div>

          {/* STATUS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Security Status - Matrix Green */}
            <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30 shadow-[0_0_20px_-5px_rgba(34,197,94,0.15)] backdrop-blur-md rounded-xl overflow-hidden hover:border-green-500/60 transition-colors duration-500">
              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-green-400 to-emerald-600 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <CardContent className="p-5 pl-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Shield className="w-5 h-5 text-green-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-green-50 font-bold text-sm tracking-wide uppercase">Score Security</p>
                      <p className="text-xs text-green-400/70 font-mono">
                        {securityStatus.safe ? `PROTECTED • ML COMPLEXITY: ${securityStatus.mlComplexity.toFixed(1)}` : `THREATS DETECTED: ${securityStatus.threats}`}
                      </p>
                    </div>
                  </div>
                  <Badge className={`shrink-0 border ${securityStatus.safe ? 'bg-green-500/10 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-red-500/10 text-red-400 border-red-500/50'}`}>
                    {securityStatus.safe ? 'ACTIVE' : 'BREACH'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* AI Learning - Cyber Cyan */}
            <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_20px_-5px_rgba(6,182,212,0.15)] backdrop-blur-md rounded-xl overflow-hidden hover:border-cyan-500/60 transition-colors duration-500">
              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
              <CardContent className="p-5 pl-6">
                <div className="flex items-center gap-4">
                  <Brain className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <p className="text-cyan-50 font-bold text-sm tracking-wide uppercase">Neural Transcription</p>
                    <p className="text-xs text-cyan-400/70 font-mono mt-1">
                      LEARNING FROM {analyses.length} TRACKS • PATTERN RECOGNITION ACTIVE
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <LiveSecurityDisplay />
          <LiveThreatDisplay />

          {/* UPLOAD TOOL - Electric Blue */}
          <Card className="bg-black/40 backdrop-blur-xl border border-blue-500/30 shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)] rounded-xl backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="p-3 bg-blue-950/50 rounded-lg border border-blue-500/20">
                  <Upload className="w-8 h-8 text-blue-400 shrink-0" />
                </div>
                <div className="flex-1">
                  <h3 className="text-blue-100 font-bold text-lg mb-2 tracking-wide uppercase">Upload & Restore</h3>
                  <p className="text-blue-200/60 text-sm mb-3">
                    Digitize physical sheet music using optical music recognition (OMR) powered by AI.
                  </p>
                  <ul className="text-xs font-mono text-blue-400/70 space-y-1 mb-4">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                      SCANNING CHORD STRUCTURES...
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                      DIGITIZING MELODY LINES...
                    </li>
                  </ul>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="sheet-upload"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleUploadSheetMusic}
                      className="hidden"
                      disabled={isUploadingSheet}
                    />
                    <Button
                      onClick={() => document.getElementById('sheet-upload').click()}
                      disabled={isUploadingSheet}
                      className="bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/50 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all duration-300"
                    >
                      {isUploadingSheet ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {isUploadingSheet ? 'PROCESSING...' : 'UPLOAD SCORE'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEARCH BAR */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl opacity-30 group-hover:opacity-50 blur transition duration-500"></div>
            <div className="relative bg-black rounded-xl p-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH NEURAL DATABASE..."
                className="pl-12 bg-black/40 backdrop-blur-xl border-none text-white placeholder:text-slate-600 focus:ring-1 focus:ring-cyan-500/50 font-mono text-sm h-12"
              />
            </div>
          </div>

          {/* KEY SELECTOR MODAL */}
          {showKeySelector && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="bg-slate-900 border border-purple-500/50 w-full max-w-md shadow-[0_0_50px_rgba(168,85,247,0.3)]">
                <CardHeader>
                  <CardTitle className="text-white text-center font-bold tracking-widest uppercase">Select Transposition Key</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {musicalKeys.map((key) => (
                      <Button
                        key={key}
                        onClick={() => handleGenerateInKey(key)}
                        className="bg-slate-800 hover:bg-purple-600 border border-purple-500/30 text-purple-200 hover:text-white transition-all duration-200"
                        disabled={generatingIds.has(keyAnalysisFor?.id)}
                      >
                        {key}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowKeySelector(false);
                      setKeyAnalysisFor(null);
                      setSelectedKey("C");
                    }}
                    className="w-full border-slate-700 hover:bg-slate-800 text-slate-400"
                    disabled={generatingIds.has(keyAnalysisFor?.id)}
                  >
                    ABORT SEQUENCE
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SECTION 1: EXISTING SHEET MUSIC (Purple Theme) */}
          {withSheetMusic.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-purple-900/50 pb-2">
                <Music className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white tracking-wide">GENERATED SCORES ({withSheetMusic.length})</h2>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {withSheetMusic.map((analysis) => (
                  <Card key={analysis.id} className="bg-black/40 border border-purple-500/20 hover:border-purple-500/60 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)] transition-all duration-300 rounded-xl overflow-hidden group backdrop-blur-sm">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-600 group-hover:w-1.5 transition-all"></div>
                    <CardContent className="p-5 pl-7">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0 pr-4">
                          <h3 className="text-md font-bold text-white truncate group-hover:text-purple-300 transition-colors">{analysis.track_name || 'Untitled'}</h3>
                          <p className="text-xs text-purple-300/60 truncate font-mono uppercase">{analysis.artist_name || 'Unknown'}</p>
                        </div>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-300 bg-purple-900/20 shrink-0 font-mono text-xs">
                          {analysis.sheet_music.key || 'C'}
                        </Badge>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleViewSheetMusic(analysis.id)}
                          size="sm"
                          className="flex-1 bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 transition-all text-xs font-bold"
                        >
                          <Music className="w-3 h-3 mr-2" />
                          VIEW
                        </Button>
                        <Button
                          onClick={() => handleRequestKeyChange(analysis)}
                          disabled={generatingIds.has(analysis.id)}
                          variant="outline"
                          size="sm"
                          className="border-purple-500/30 text-purple-300 hover:bg-purple-900/50 text-xs"
                        >
                          {generatingIds.has(analysis.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : 'TRANSPOSE'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: GENERATE NEW (Orange Theme) */}
          {withoutSheetMusic.length > 0 && (
            <div className="space-y-4 pt-8">
              <div className="flex items-center gap-2 border-b border-orange-900/50 pb-2">
                <Wand2 className="w-5 h-5 text-orange-400" />
                <h2 className="text-xl font-bold text-white tracking-wide">PENDING GENERATION ({withoutSheetMusic.length})</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {withoutSheetMusic.map((analysis) => (
                  <Card key={analysis.id} className="bg-black/40 border border-orange-500/20 hover:border-orange-500/60 hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)] transition-all duration-300 rounded-xl overflow-hidden group">
                     <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-red-600 group-hover:w-1.5 transition-all"></div>
                    <CardContent className="p-5 pl-7">
                       <div className="mb-4">
                          <h3 className="text-sm font-bold text-white truncate group-hover:text-orange-300 transition-colors">{analysis.track_name || 'Untitled'}</h3>
                          <p className="text-xs text-orange-300/60 truncate font-mono uppercase">{analysis.artist_name || 'Unknown'}</p>
                       </div>

                      <Button
                        onClick={() => handleGenerateSheetMusic(analysis)}
                        disabled={generatingIds.has(analysis.id)} 
                        size="sm"
                        className="w-full bg-orange-600/10 hover:bg-orange-600 border border-orange-500/40 text-orange-200 hover:text-white transition-all text-xs font-bold"
                      >
                        {generatingIds.has(analysis.id) ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            COMPUTING...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3 h-3 mr-2" />
                            GENERATE
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredAnalyses.length === 0 && (
            <Card className="bg-black/30 border border-slate-800 backdrop-blur-sm">
              <CardContent className="p-16 text-center">
                <FileMusic className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-white mb-2 tracking-wide uppercase">Data Buffer Empty</h3>
                <p className="text-slate-500 font-mono text-sm">
                  {searchQuery ? "NO RECORDS FOUND MATCHING QUERY." : "UPLOAD A TRACK TO BEGIN ANALYSIS SEQUENCE."}
                </p>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}