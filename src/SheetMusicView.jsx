import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Download, Loader2, FileMusic, Music, Disc, Layers, RefreshCw, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ExportToPDF from "../components/shared/ExportToPDF";
import { Badge } from "@/components/ui/badge";

import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";

export default function SheetMusicView() {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();

  useEffect(() => {
    try {
      blockScriptInjection();
      validateCSP();
      
      mlDataCollector.record('sheet_music_view_visit', {
        feature: 'sheet_music_view',
        timestamp: Date.now()
      });
    } catch (err) {
      console.error("Security initialization failed:", err);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const analysisId = urlParams.get('id');
    
    if (analysisId) {
      loadSheetMusic(analysisId);
    } else {
      setError("No analysis ID provided");
      setIsLoading(false);
    }
  }, []);

  const loadSheetMusic = async (analysisId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allAnalyses = await base44.entities.MusicAnalysis.filter({ id: analysisId });
      const loadedAnalysis = allAnalyses?.[0];
      
      if (loadedAnalysis && loadedAnalysis.sheet_music) {
        setAnalysis(loadedAnalysis);
      } else {
        setError("Sheet music not found for this analysis.");
      }
    } catch (err) {
      console.error("Failed to load sheet music:", err);
      setError("Failed to load sheet music.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateSheetMusic = async () => {
    if (!analysis) return;
    
    setIsRegenerating(true);
    setError(null);

    try {
      console.log(`🔄 Regenerating sheet music for "${analysis.track_name}"...`);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate professional sheet music notation for the following track based on its musical characteristics:

Track: "${analysis.track_name}" by ${analysis.artist_name}

Musical Characteristics:
- Genre: ${analysis.genre || 'Pop'}
- Tempo: ${analysis.tempo || 120} BPM
- Key: ${analysis.key || 'C major'}
- Time Signature: ${analysis.time_signature || '4/4'}
- Energy Level: ${analysis.audio_features?.energy ? (analysis.audio_features.energy * 100).toFixed(0) + '%' : 'Medium'}
- Danceability: ${analysis.audio_features?.danceability ? analysis.audio_features.danceability.toFixed(1) + '/10' : 'Medium'}

Based on these characteristics, generate:
1. Appropriate chord progressions for verse, chorus, and bridge that match the genre and mood
2. Drum patterns (kick, snare, hi-hat) suitable for ${analysis.tempo || 120} BPM
3. Bass line patterns for each section
4. Song structure with 8 sections (Intro, Verse 1, Chorus, Verse 2, Chorus, Bridge, Chorus, Outro)
5. Melody notes and rhythms

Make the sheet music professionally formatted and performance-ready.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            artist: { type: "string" },
            key: { type: "string" },
            time_signature: { type: "string", default: "4/4" },
            tempo: { type: "number" },
            chord_progression: {
              type: "object",
              properties: {
                verse: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                chorus: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                bridge: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 }
              },
              required: ["verse", "chorus", "bridge"]
            },
            drum_pattern: {
              type: "object",
              properties: {
                kick: { type: "array", items: { type: "string" }, minItems: 8, maxItems: 8 },
                snare: { type: "array", items: { type: "string" }, minItems: 8, maxItems: 8 },
                hihat: { type: "array", items: { type: "string" }, minItems: 8, maxItems: 8 }
              },
              required: ["kick", "snare", "hihat"]
            },
            sections: {
              type: "array",
              minItems: 8,
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  measures: {
                    type: "array",
                    minItems: 4,
                    maxItems: 4,
                    items: {
                      type: "object",
                      properties: {
                        melody: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                        duration: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                        chord: { type: "string" },
                        bass: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 }
                      },
                      required: ["melody", "duration", "chord", "bass"]
                    }
                  }
                },
                required: ["name", "measures"]
              }
            }
          },
          required: ["title", "artist", "key", "time_signature", "tempo", "chord_progression", "drum_pattern", "sections"]
        }
      });

      await base44.entities.MusicAnalysis.update(analysis.id, {
        sheet_music: response,
        analysis_type: 'sheet_music_generator'
      });

      const allAnalyses = await base44.entities.MusicAnalysis.filter({ id: analysis.id });
      const updated = allAnalyses?.[0];
      setAnalysis(updated);
      
      console.log("✅ Sheet music regenerated successfully");
      alert("✓ Sheet music restored/regenerated successfully!");
      
    } catch (error) {
      console.error("Failed to regenerate sheet music:", error);
      setError(`Failed to restore sheet music: ${error.message || 'Please try again.'}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
        <p className="text-purple-500/70 font-mono text-sm tracking-widest animate-pulse">RENDERING NOTATION...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-[#030014] p-8 flex items-center justify-center">
        <Card className="bg-red-950/20 border border-red-500/50 max-w-md w-full backdrop-blur-md">
          <CardContent className="p-12 text-center">
            <p className="text-red-400 mb-6 font-mono uppercase">{error || "FILE CORRUPTED / NOT FOUND"}</p>
            <Button onClick={() => navigate(createPageUrl("SheetMusic"))} className="bg-red-600 hover:bg-red-500 text-white font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              RETURN TO ARCHIVE
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sheetMusic = analysis.sheet_music;

  return (
    // CYBERPUNK BASE - STATIC BACKGROUND (No animations to prevent freeze)
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f0520] to-[#050015] p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-purple-500/30 selection:text-purple-100">
      
      {/* Static Grid Overlay - No animations */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none z-0 opacity-30"></div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">

        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(createPageUrl("SheetMusic"))}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-full transition-all duration-300"
            >
                <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 animate-pulse">
                    DIGITAL SCORE
                </span>
                </h1>
                <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
                AI Transcription & Composition Matrix
                </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRegenerateSheetMusic}
              disabled={isRegenerating}
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 font-mono text-xs uppercase"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  RECOMPILING...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-2" />
                  REGENERATE
                </>
              )}
            </Button>

            <ExportToPDF 
              data={analysis?.sheet_music} 
              filename={`sheet-music-${analysis?.track_name?.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold border-none font-mono text-xs uppercase"
            />
          </div>
        </div>

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiveSecurityDisplay />
            <LiveThreatDisplay />
        </div>

        {/* METADATA CARD */}
        <Card className="bg-black/60 border border-purple-500/30 shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)] rounded-2xl overflow-hidden backdrop-blur-xl">
          <CardHeader className="border-b border-white/5 bg-white/5 p-8">
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="text-white text-3xl font-black uppercase tracking-wide">{analysis.track_name || 'UNTITLED ASSET'}</CardTitle>
                    <p className="text-purple-400 font-bold text-lg font-mono uppercase tracking-wider mt-1">{analysis.artist_name || 'UNKNOWN ID'}</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="border-purple-500/50 text-purple-300 font-mono text-xs uppercase bg-purple-900/20">
                        {sheetMusic.tempo || 120} BPM
                    </Badge>
                    <Badge variant="outline" className="border-blue-500/50 text-blue-300 font-mono text-xs uppercase bg-blue-900/20">
                        {sheetMusic.key || 'C MAJOR'}
                    </Badge>
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-lg flex items-center justify-between">
                <span className="text-purple-300 font-bold text-xs uppercase">Time Signature</span>
                <span className="text-white font-mono text-lg">{sheetMusic.time_signature || '4/4'}</span>
              </div>
              <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-lg flex items-center justify-between">
                <span className="text-purple-300 font-bold text-xs uppercase">Structure</span>
                <span className="text-white font-mono text-lg">{sheetMusic.sections ? sheetMusic.sections.length : 0} SECTIONS</span>
              </div>
              
              {/* Diagram Injection - Key Theory */}
              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg flex items-center justify-center">
                   <div className="text-[10px] text-slate-500 border border-slate-600 rounded px-2 py-1 bg-black/30 font-mono">
                        [Image of circle of fifths music theory diagram]
                    </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CHORD PROGRESSIONS - PURPLE */}
        {sheetMusic.chord_progression && (
          <Card className="bg-black/60 border border-purple-500/30 backdrop-blur-md rounded-xl overflow-hidden">
            <CardHeader className="border-b border-purple-900/20 bg-purple-950/10 p-6">
              <CardTitle className="text-purple-400 flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                <Music className="w-4 h-4" />
                Harmonic Progression Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid md:grid-cols-3 gap-6">
              {Object.entries(sheetMusic.chord_progression).map(([section, chords]) => (
                <div key={section} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                  <h3 className="text-white font-bold mb-3 uppercase text-xs tracking-wider border-b border-slate-800 pb-2">{section}</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(chords) && chords.map((chord, idx) => (
                      <span key={idx} className="px-3 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-200 rounded font-mono text-sm font-bold shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                        {chord}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* RHYTHM & BASS GRID */}
        <div className="grid md:grid-cols-2 gap-6">
            
            {/* DRUM PATTERN - ORANGE */}
            {sheetMusic.drum_pattern && (
            <Card className="bg-black/60 border border-orange-500/30 backdrop-blur-md rounded-xl overflow-hidden">
                <CardHeader className="border-b border-orange-900/20 bg-orange-950/10 p-6">
                <CardTitle className="text-orange-400 flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                    <Disc className="w-4 h-4" />
                    Percussion Grid
                </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                {Object.entries(sheetMusic.drum_pattern).map(([drum, pattern]) => (
                    <div key={drum}>
                    <h3 className="text-orange-300/70 font-mono text-[10px] mb-2 uppercase">{drum.replace('_', ' ')}</h3>
                    <div className="flex flex-wrap gap-1">
                        {Array.isArray(pattern) ? pattern.map((hit, idx) => (
                        <span key={idx} className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-mono border ${hit !== '-' ? 'bg-orange-500 text-black border-orange-400 font-bold' : 'bg-slate-900/50 text-slate-600 border-slate-800'}`}>
                            {hit !== '-' ? hit : '·'}
                        </span>
                        )) : null}
                    </div>
                    </div>
                ))}
                
                {/* Diagram Injection - Drum Key */}
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-center">
                     <div className="text-[10px] text-orange-500/50 border border-orange-500/20 rounded px-2 py-1 bg-black/30 font-mono">
                        [Image of drum kit notation key]
                    </div>
                </div>
                </CardContent>
            </Card>
            )}

            {/* BASS LINES - BLUE */}
            {sheetMusic.sections && (
            <Card className="bg-black/60 border border-blue-500/30 backdrop-blur-md rounded-xl overflow-hidden">
                <CardHeader className="border-b border-blue-900/20 bg-blue-950/10 p-6">
                <CardTitle className="text-blue-400 flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                    <Layers className="w-4 h-4" />
                    Low Frequency Register
                </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-transparent">
                {sheetMusic.sections.slice(0, 3).map((section, idx) => ( // Show first 3 sections to save space
                    <div key={idx}>
                    <h3 className="text-white font-bold text-xs uppercase mb-2">{section.name}</h3>
                    <div className="flex flex-wrap gap-1">
                        {section.measures && section.measures.map((measure, mIdx) => (
                        measure.bass && Array.isArray(measure.bass) && measure.bass.map((note, nIdx) => (
                            <span key={`${mIdx}-${nIdx}`} className="px-2 py-1 bg-blue-900/30 border border-blue-500/30 text-blue-300 rounded text-center text-xs font-mono">
                            {note}
                            </span>
                        ))
                        ))}
                    </div>
                    </div>
                ))}
                </CardContent>
            </Card>
            )}
        </div>

        {/* TRADITIONAL NOTATION - WHITE PAPER LOOK */}
        <Card className="bg-slate-200 border-slate-400 shadow-2xl rounded-xl overflow-hidden relative">
          {/* Paper texture overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50 pointer-events-none"></div>
          
          <CardHeader className="border-b border-slate-300 bg-white/80 p-6 relative z-10">
            <div className="flex justify-between items-center">
                <CardTitle className="text-black font-serif text-2xl flex items-center gap-3">
                <Printer className="w-6 h-6 text-slate-800" />
                Traditional Score Notation
                </CardTitle>
                <Badge variant="outline" className="border-black text-black font-mono text-xs">A4 FORMAT</Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-8 bg-white relative z-10">
            <div className="text-center mb-10 pb-6 border-b-2 border-black">
              <h2 className="text-5xl font-serif text-black mb-2 tracking-tight">{analysis.track_name || 'Untitled'}</h2>
              <p className="text-xl text-slate-600 font-serif italic">composed by {analysis.artist_name || 'Unknown'}</p>
            </div>
            
            <div className="flex justify-between items-start mb-8 text-black font-serif">
                <div className="space-y-1">
                    <p><strong>Tempo:</strong> {sheetMusic.tempo || 120} BPM</p>
                    <p><strong>Key:</strong> {sheetMusic.key || 'C major'}</p>
                </div>
                <div className="text-right space-y-1">
                    <p><strong>Time:</strong> {sheetMusic.time_signature || '4/4'}</p>
                    <p><strong>Arranged by:</strong> SpectroModel AI</p>
                </div>
            </div>

            {/* MELODY STAFF - Dynamic from AI Analysis */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Melody</p>
                    <div className="text-[9px] text-slate-400 border border-slate-300 rounded px-2 py-0 bg-slate-50 font-mono">
                        [Image of musical staff notation guide]
                    </div>
                </div>
                <div className="relative h-40 w-full border-l-2 border-black overflow-x-auto">
                    {/* Staff lines */}
                    {[20, 40, 60, 80, 100].map(top => (
                        <div key={top} className="absolute w-full h-[1px] bg-black" style={{ top: `${top}px` }}></div>
                    ))}
                    <div className="absolute left-2 top-[30px] text-6xl font-serif text-black">𝄞</div>
                    <div className="absolute left-16 top-[40px] text-4xl font-bold text-black">{sheetMusic.time_signature?.split('/')[0] || '4'}</div>
                    <div className="absolute left-16 top-[70px] text-4xl font-bold text-black">{sheetMusic.time_signature?.split('/')[1] || '4'}</div>
                    
                    {/* REAL MELODY NOTES from AI Analysis */}
                    <div className="absolute left-32 top-0 flex gap-4 items-end h-full pb-4">
                        {(() => {
                          // Get melody data from analysis
                          const melody = sheetMusic.melody || sheetMusic.sections?.[0]?.measures?.[0]?.melody;
                          const melodyPhrases = melody?.main_phrases || [];
                          const dynamics = sheetMusic.dynamics?.expression_marks || [];
                          
                          // Note position mapping (higher notes = higher on staff)
                          const notePositions = {
                            'C3': 115, 'D3': 110, 'E3': 105, 'F3': 100, 'G3': 95, 'A3': 90, 'B3': 85,
                            'C4': 80, 'D4': 75, 'E4': 70, 'F4': 65, 'G4': 60, 'A4': 55, 'B4': 50,
                            'C5': 45, 'D5': 40, 'E5': 35, 'F5': 30, 'G5': 25, 'A5': 20, 'B5': 15, 'C6': 10
                          };
                          
                          // Note duration symbols
                          const durationSymbols = {
                            'whole': '𝅝', 'half': '𝅗𝅥', 'quarter': '♩', 'eighth': '♪', 'sixteenth': '𝅘𝅥𝅯',
                            'dotted_quarter': '♩.', 'staccato': '♩·'
                          };
                          
                          // Parse notes from melody phrases or sections
                          let notesToRender = [];
                          
                          if (melodyPhrases.length > 0) {
                            // Parse from main_phrases like "C4 E4 G4 C5"
                            melodyPhrases.slice(0, 2).forEach(phrase => {
                              if (typeof phrase === 'string') {
                                const notes = phrase.split(/[\s,]+/).filter(n => /^[A-G]#?[0-9]/.test(n));
                                notesToRender = notesToRender.concat(notes.slice(0, 8));
                              }
                            });
                          } else if (sheetMusic.sections) {
                            // Parse from sections
                            sheetMusic.sections.slice(0, 2).forEach(section => {
                              section.measures?.forEach(measure => {
                                if (measure.melody && Array.isArray(measure.melody)) {
                                  notesToRender = notesToRender.concat(measure.melody.slice(0, 4));
                                }
                              });
                            });
                          }
                          
                          // Fallback to chord-based notes if no melody
                          if (notesToRender.length === 0 && sheetMusic.chord_progressions?.verse) {
                            const chords = sheetMusic.chord_progressions.verse;
                            chords.slice(0, 4).forEach(chord => {
                              const root = chord.replace(/[^A-G#b]/g, '');
                              notesToRender.push(root + '4');
                            });
                          }
                          
                          // Final fallback
                          if (notesToRender.length === 0) {
                            notesToRender = ['C4', 'E4', 'G4', 'C5', 'B4', 'G4', 'E4', 'C4'];
                          }
                          
                          return notesToRender.slice(0, 16).map((note, i) => {
                            const noteStr = String(note).toUpperCase();
                            const baseNote = noteStr.replace(/[^A-G#b0-9]/gi, '');
                            const topPos = notePositions[baseNote] || 60;
                            const isStaccato = dynamics.includes('staccato') && i % 4 === 0;
                            const symbol = isStaccato ? '♩·' : (i % 2 === 0 ? '♩' : '♪');
                            
                            return (
                              <div key={i} className="relative flex flex-col items-center" style={{ minWidth: '30px' }}>
                                <span 
                                  className="text-3xl text-black font-music absolute"
                                  style={{ top: `${topPos}px` }}
                                  title={`${baseNote}${isStaccato ? ' (staccato)' : ''}`}
                                >
                                  {symbol}
                                </span>
                                <span className="text-[8px] text-slate-600 font-mono absolute" style={{ top: '125px' }}>
                                  {baseNote}
                                </span>
                              </div>
                            );
                          });
                        })()}
                    </div>
                </div>
                
                {/* Melody Info */}
                {sheetMusic.melody && (
                  <div className="flex gap-4 mt-2 text-xs text-slate-600">
                    {sheetMusic.melody.highest_note && <span>Highest: <strong>{sheetMusic.melody.highest_note}</strong></span>}
                    {sheetMusic.melody.lowest_note && <span>Lowest: <strong>{sheetMusic.melody.lowest_note}</strong></span>}
                    {sheetMusic.melody.melodic_contour && <span>Contour: <strong>{sheetMusic.melody.melodic_contour}</strong></span>}
                  </div>
                )}
            </div>

            {/* HARMONY/BASS STAFF - Dynamic from AI Analysis */}
            <div className="mb-8">
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Harmony / Bass Line</p>
                <div className="relative h-40 w-full border-l-2 border-black overflow-x-auto">
                    {/* Staff lines */}
                    {[20, 40, 60, 80, 100].map(top => (
                        <div key={top} className="absolute w-full h-[1px] bg-black" style={{ top: `${top}px` }}></div>
                    ))}
                    <div className="absolute left-2 top-[35px] text-5xl font-serif text-black">𝄢</div>
                    <div className="absolute left-16 top-[40px] text-4xl font-bold text-black">{sheetMusic.time_signature?.split('/')[0] || '4'}</div>
                    <div className="absolute left-16 top-[70px] text-4xl font-bold text-black">{sheetMusic.time_signature?.split('/')[1] || '4'}</div>
                    
                    {/* REAL BASS NOTES from AI Analysis */}
                    <div className="absolute left-32 top-0 flex gap-4 items-end h-full pb-4">
                        {(() => {
                          const bassLine = sheetMusic.bass_line || {};
                          const bassPositions = {
                            'E1': 100, 'F1': 95, 'G1': 90, 'A1': 85, 'B1': 80,
                            'C2': 75, 'D2': 70, 'E2': 65, 'F2': 60, 'G2': 55, 'A2': 50, 'B2': 45,
                            'C3': 40, 'D3': 35, 'E3': 30, 'F3': 25, 'G3': 20
                          };
                          
                          let bassNotes = [];
                          
                          // Parse bass pattern
                          const verseBass = bassLine.verse_pattern || '';
                          const chorusBass = bassLine.chorus_pattern || '';
                          const allBass = `${verseBass} ${chorusBass}`;
                          
                          // Extract notes from pattern strings
                          const noteMatches = allBass.match(/[A-G]#?b?[0-9]?/gi) || [];
                          bassNotes = noteMatches.slice(0, 8).map(n => n.length === 1 ? n + '2' : n);
                          
                          // Fallback to sections
                          if (bassNotes.length === 0 && sheetMusic.sections) {
                            sheetMusic.sections.slice(0, 2).forEach(section => {
                              section.measures?.forEach(measure => {
                                if (measure.bass && Array.isArray(measure.bass)) {
                                  bassNotes = bassNotes.concat(measure.bass.slice(0, 4));
                                }
                              });
                            });
                          }
                          
                          // Fallback to chord roots
                          if (bassNotes.length === 0 && sheetMusic.chord_progressions?.verse) {
                            sheetMusic.chord_progressions.verse.slice(0, 4).forEach(chord => {
                              const root = chord.replace(/[^A-G#b]/g, '');
                              bassNotes.push(root + '2');
                            });
                          }
                          
                          // Final fallback
                          if (bassNotes.length === 0) {
                            bassNotes = ['C2', 'G2', 'A2', 'E2', 'F2', 'C2', 'G2', 'C2'];
                          }
                          
                          return bassNotes.slice(0, 12).map((note, i) => {
                            const noteStr = String(note).toUpperCase();
                            const baseNote = noteStr.replace(/[^A-G#b0-9]/gi, '');
                            const topPos = bassPositions[baseNote] || 60;
                            
                            return (
                              <div key={i} className="relative flex flex-col items-center" style={{ minWidth: '30px' }}>
                                <span 
                                  className="text-3xl text-black font-music absolute"
                                  style={{ top: `${topPos}px` }}
                                  title={baseNote}
                                >
                                  𝅗𝅥
                                </span>
                                <span className="text-[8px] text-slate-600 font-mono absolute" style={{ top: '125px' }}>
                                  {baseNote}
                                </span>
                              </div>
                            );
                          });
                        })()}
                    </div>
                </div>
                
                {/* Bass Line Info */}
                {sheetMusic.bass_line && (
                  <div className="flex gap-4 mt-2 text-xs text-slate-600 flex-wrap">
                    {sheetMusic.bass_line.style && <span>Style: <strong>{sheetMusic.bass_line.style}</strong></span>}
                    {sheetMusic.bass_line.rhythmic_pattern && <span>Rhythm: <strong>{sheetMusic.bass_line.rhythmic_pattern}</strong></span>}
                  </div>
                )}
            </div>
            
            {/* DYNAMICS & EXPRESSION MARKS */}
            {sheetMusic.dynamics && (
              <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-3">Dynamics & Expression</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {sheetMusic.dynamics.verse_dynamic && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-serif italic">
                      Verse: <strong>{sheetMusic.dynamics.verse_dynamic}</strong>
                    </span>
                  )}
                  {sheetMusic.dynamics.chorus_dynamic && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded font-serif italic">
                      Chorus: <strong>{sheetMusic.dynamics.chorus_dynamic}</strong>
                    </span>
                  )}
                  {sheetMusic.dynamics.crescendos && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-serif italic">
                      Crescendos: {sheetMusic.dynamics.crescendos}
                    </span>
                  )}
                  {sheetMusic.dynamics.expression_marks?.map((mark, i) => (
                    <span key={i} className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">
                      {mark}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-slate-300 text-center">
                <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                    GENERATED VIA SPECTROMODEL NEURAL TRANSCRIPTION ENGINE • © {new Date().getFullYear()}
                </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}