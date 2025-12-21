import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Loader2, Music, Download, ExternalLink, Shield, Brain, Sparkles, Mic, User, FileText, Tag, Disc } from "lucide-react";
import ParticleSystem from "../components/shared/ParticleSystem";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import SearchHistory from "../components/shared/SearchHistory";

import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";

export default function LyricsRetrievalPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  
  const [trackName, setTrackName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [lyrics, setLyrics] = useState(null);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0, mlComplexity: 0 });
  const [sessionStartTime] = useState(Date.now());

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



        mlDataCollector.record('lyrics_retrieval_page_visit', {
          feature: 'lyrics_retrieval',
          security: { safe: cspResult.valid, threats: cspResult.violations?.length || 0 },
          viewport: { width: window.innerWidth, height: window.innerHeight },
          timestamp: Date.now()
        });

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (id) {
          try {
            const analysis = await base44.entities.MusicAnalysis.filter({ id });
            if (analysis && analysis[0]?.lyrics_retrieval) {
              setTrackName(analysis[0].track_name || "");
              setArtistName(analysis[0].artist_name || "");
              setLyrics(analysis[0].lyrics_retrieval || null);
            }
          } catch (error) {
            console.error("Failed to load analysis:", error);
          }
        }
      } catch (error) {
        console.error('Initialization failed:', error);
        mlDataCollector.record('lyrics_retrieval_init_error', {
          feature: 'lyrics_retrieval',
          error: error.message,
          timestamp: Date.now()
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializePage();

    const saved = localStorage.getItem('spectro_lyrics_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch(e) {}
    }

    return () => {
      mounted = false;
      const sessionDuration = Date.now() - sessionStartTime;
      mlDataCollector.record('lyrics_retrieval_session_end', {
        feature: 'lyrics_retrieval',
        sessionDuration,
        lyricsFound: !!lyrics,
        timestamp: Date.now()
      });
    };
  }, []);

  const saveSearch = (track, artist) => {
    const newSearch = { track, artist, timestamp: Date.now() };
    const updated = [newSearch, ...recentSearches.filter(s =>
      !(s.track === track && s.artist === artist)
    )].slice(0, 10);

    setRecentSearches(updated);
    localStorage.setItem('spectro_lyrics_searches', JSON.stringify(updated));
    
    mlDataCollector.record('lyrics_search_saved', {
      feature: 'lyrics_retrieval',
      timestamp: Date.now()
    });
  };

  const handleSearchSelect = (search) => {
    setTrackName(search.track);
    setArtistName(search.artist);
    mlDataCollector.record('lyrics_search_history_selected', {
      feature: 'lyrics_retrieval',
      timestamp: Date.now()
    });
  };

  const handleRetrieve = async () => {
    if (!trackName.trim() || !artistName.trim()) {
      setError("Please provide both track and artist name");
      return;
    }

    setIsRetrieving(true);
    setError(null);
    setLyrics(null);

    const startTime = Date.now();

    mlDataCollector.record('lyrics_retrieval_started', {
      feature: 'lyrics_retrieval',
      trackName,
      artistName,
      timestamp: Date.now()
    });

    try {
      const prompt = `Find information about "${trackName}" by "${artistName}".

Return ONLY valid JSON with these fields:
{
  "track_name": "song title",
  "artist_name": "artist name",
  "preview": "2-3 line preview snippet only",
  "copyright": "copyright holder or Unknown",
  "record_label": "record label or Unknown",
  "release_year": "year or Unknown",
  "lyric_sources": [{"name": "Genius", "url": "https://genius.com/..."}],
  "streaming_links": [{"platform": "Spotify", "url": "https://open.spotify.com/..."}],
  "themes": ["theme1", "theme2", "theme3"]
}

CRITICAL: Only include 2-3 line preview, not full lyrics.`;

      const jsonSchema = {
        type: "object",
        properties: {
          track_name: { type: "string" },
          artist_name: { type: "string" },
          preview: { type: "string" },
          copyright: { type: "string" },
          record_label: { type: "string" },
          release_year: { type: "string" },
          lyric_sources: {
            type: "array",
            items: { type: "object" }
          },
          streaming_links: {
            type: "array",
            items: { type: "object" }
          },
          themes: {
            type: "array",
            items: { type: "string" }
          }
        }
      };

      // Retry logic with exponential backoff
      let result;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 1) {
            const delay = 1000 * Math.pow(2, attempt - 1);
            console.log(`⏳ Retry ${attempt}/${maxRetries} in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          result = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: true,
            response_json_schema: jsonSchema
          });
          
          console.log(`✅ LLM API success on attempt ${attempt}`);
          break;
        } catch (apiError) {
          console.error(`❌ LLM API Error (attempt ${attempt}/${maxRetries}):`, apiError);
          
          mlDataCollector.record('lyrics_retrieval_api_error', {
            feature: 'lyrics_retrieval',
            error: apiError.message || 'Network error',
            attempt,
            maxRetries,
            timestamp: Date.now()
          });

          if (attempt === maxRetries) {
            throw new Error('Network error after 3 attempts - please check your connection and try again');
          }
        }
      }

      const validatedResult = {
        track_name: result?.track_name || trackName,
        artist_name: result?.artist_name || artistName,
        preview: result?.preview || "Preview not available",
        copyright: result?.copyright || "Unknown",
        record_label: result?.record_label || "Unknown",
        release_year: result?.release_year || "Unknown",
        lyric_sources: Array.isArray(result?.lyric_sources) ? result.lyric_sources : [],
        streaming_links: Array.isArray(result?.streaming_links) ? result.streaming_links : [],
        themes: Array.isArray(result?.themes) ? result.themes : []
      };

      setLyrics(validatedResult);
      saveSearch(trackName, artistName);

      const fileHash = btoa(encodeURIComponent(`${trackName}-${artistName}`));

      await base44.entities.MusicAnalysis.create({
        track_name: trackName,
        artist_name: artistName,
        file_hash: fileHash,
        lyrics_retrieval: validatedResult,
        status: "completed",
        analysis_type: "lyrics_retrieval"
      });

      const retrievalDuration = Date.now() - startTime;
      mlDataCollector.record('lyrics_retrieval_completed', {
        feature: 'lyrics_retrieval',
        trackName,
        artistName,
        retrievalDuration,
        hasPreview: !!validatedResult.preview,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error("Lyrics retrieval failed:", err);

      const fallbackResult = {
        track_name: trackName,
        artist_name: artistName,
        preview: "Preview not available - search links provided below",
        copyright: "Unknown",
        record_label: "Unknown",
        release_year: "Unknown",
        lyric_sources: [
          {
            name: "Genius",
            url: `https://genius.com/search?q=${encodeURIComponent(`${trackName} ${artistName}`)}`
          },
          {
            name: "AZLyrics",
            url: `https://www.azlyrics.com/search.php?q=${encodeURIComponent(`${trackName} ${artistName}`)}`
          }
        ],
        streaming_links: [
          {
            platform: "Spotify",
            url: `https://open.spotify.com/search/${encodeURIComponent(`${trackName} ${artistName}`)}`
          },
          {
            platform: "Apple Music",
            url: `https://music.apple.com/us/search?term=${encodeURIComponent(`${trackName} ${artistName}`)}`
          },
          {
            platform: "YouTube Music",
            url: `https://music.youtube.com/search?q=${encodeURIComponent(`${trackName} ${artistName}`)}`
          }
        ],
        themes: []
      };

      setLyrics(fallbackResult);
      saveSearch(trackName, artistName);
      setError(err.message || "Could not retrieve full details, but search links are provided below.");

      mlDataCollector.record('lyrics_retrieval_fallback', {
        feature: 'lyrics_retrieval',
        error: err.message,
        timestamp: Date.now()
      });
    } finally {
      setIsRetrieving(false);
    }
  };

  const handleDownload = () => {
    if (!lyrics) return;

    const content = `${lyrics.track_name || 'Unknown Track'} - ${lyrics.artist_name || 'Unknown Artist'}
Release Year: ${lyrics.release_year || 'N/A'}
Record Label: ${lyrics.record_label || 'N/A'}

---

LYRICS PREVIEW:
${lyrics.preview || 'Not available'}

---

COPYRIGHT INFORMATION:
© ${lyrics.copyright || 'Unknown Copyright Holder'}

This brief preview is for informational purposes only. Full lyrics are copyrighted material and are not provided here. SpectroModel does not own any lyrics, songs, or websites linked.

---

SONG THEMES:
${lyrics.themes && lyrics.themes.length > 0 ? lyrics.themes.join(', ') : 'N/A'}

---

FIND FULL LYRICS AT:
${lyrics.lyric_sources?.map(s => `${s.name}: ${s.url}`).join('\n') || 'N/A'}

---

LISTEN ON STREAMING SERVICES:
${lyrics.streaming_links?.map(s => `${s.platform}: ${s.url}`).join('\n') || 'N/A'}

`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lyrics.track_name || 'Unknown'}-${lyrics.artist_name || 'Unknown'}-info.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    mlDataCollector.record('lyrics_info_downloaded', {
      feature: 'lyrics_retrieval',
      timestamp: Date.now()
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-cyan-50 p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
        <ParticleSystem />
        <div className="relative z-10 flex items-center">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <span className="ml-3 text-cyan-300 font-mono">LOADING SYSTEM...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f0520] to-[#050015] text-cyan-50 relative overflow-x-hidden p-4 md:p-8">
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
  
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              mlDataCollector.record('navigation_back', {
                feature: 'lyrics_retrieval',
                destination: 'Dashboard',
                timestamp: Date.now()
              });
              navigate(createPageUrl("Dashboard"));
            }}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-pulse">
              LYRICS RETRIEVAL
            </h1>
            <p className="text-slate-400 mt-1 font-mono text-xs tracking-widest uppercase">
              AI-Powered Song Intelligence • <span className="text-cyan-500">ONLINE</span>
            </p>
          </div>
        </div>



        <LiveSecurityDisplay />
        <LiveThreatDisplay />

        <SearchHistory
          searches={recentSearches}
          onSelect={handleSearchSelect}
          onClear={() => {
            setRecentSearches([]);
            localStorage.removeItem('spectro_lyrics_searches');
            mlDataCollector.record('lyrics_search_history_cleared', {
              feature: 'lyrics_retrieval',
              timestamp: Date.now()
            });
          }}
          storageKey="spectro_lyrics_searches"
        />

        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="border-b border-white/5 bg-white/5 p-6">
            <CardTitle className="text-white flex items-center gap-3 text-xl font-bold uppercase tracking-wide">
              <div className="p-2 bg-purple-500/10 rounded-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
                <div className="absolute inset-0 bg-purple-400/20 blur-md rounded-lg"></div>
                <Music className="w-5 h-5 text-purple-400 relative z-10 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]" />
              </div>
              Search for Song Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="track" className="text-slate-300 font-mono text-xs uppercase tracking-wider">Track Name</Label>
                <div className="relative">
                  <Mic className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <Input
                    id="track"
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    placeholder="ENTER SONG TITLE..."
                    className="pl-10 bg-black/50 border-white/10 text-white focus:border-purple-500/50 focus:ring-purple-500/20 h-12 backdrop-blur-md font-mono"
                    onKeyDown={(e) => e.key === 'Enter' && handleRetrieve()}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist" className="text-slate-300 font-mono text-xs uppercase tracking-wider">Artist Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <Input
                    id="artist"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="ENTER ARTIST NAME..."
                    className="pl-10 bg-black/50 border-white/10 text-white focus:border-purple-500/50 focus:ring-purple-500/20 h-12 backdrop-blur-md font-mono"
                    onKeyDown={(e) => e.key === 'Enter' && handleRetrieve()}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-300 break-words">{error}</p>
              </div>
            )}

            <Button
              onClick={handleRetrieve}
              disabled={isRetrieving || !trackName.trim() || !artistName.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isRetrieving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {lyrics && (
          <div className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-3xl font-black break-words tracking-tight uppercase">{lyrics.track_name || trackName}</CardTitle>
                    <p className="text-cyan-400 font-bold break-words text-lg mt-1 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> 
                      {lyrics.artist_name || artistName}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-400">RESULT FOUND</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-8 p-6">
                {lyrics.streaming_links && lyrics.streaming_links.length > 0 && (
                  <div className="p-4 bg-blue-950/10 border border-blue-900/20 rounded-xl">
                    <h4 className="text-blue-200 font-bold mb-3 flex items-center gap-2"><Disc className="w-4 h-4 animate-spin-slow"/> Stream Now</h4>
                    <div className="flex flex-wrap gap-2">
                      {lyrics.streaming_links.map((link, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (link.platform?.toLowerCase().includes('spotify')) {
                              window.open(`https://open.spotify.com/search/${encodeURIComponent(`${artistName} ${trackName}`)}`, '_blank', 'noopener,noreferrer');
                            } else {
                              window.open(link.url, '_blank', 'noopener,noreferrer');
                            }
                            mlDataCollector.record('streaming_link_clicked', {
                              feature: 'lyrics_retrieval',
                              platform: link.platform,
                              timestamp: Date.now()
                            });
                          }}
                          className={link.platform?.toLowerCase().includes('spotify') 
                            ? "bg-green-600 hover:bg-green-700 text-white border-green-500"
                            : "border-slate-600 bg-slate-700/50 text-white hover:bg-slate-600"}
                        >
                          {link.platform}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {lyrics.preview && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-lg font-semibold text-white">Lyrics Preview</h3>
                    </div>
                    <p className="text-sm text-slate-400 ml-7">Brief snippet only</p>
                    <div className="p-6 bg-slate-700/30 rounded-lg border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <FileText className="w-24 h-24 text-white" />
                      </div>
                      <pre className="whitespace-pre-wrap font-mono text-slate-200 text-sm leading-relaxed break-words relative z-10">
                        {lyrics.preview}
                      </pre>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <p className="text-yellow-300 text-sm font-semibold mb-2">⚠️ Copyright Notice</p>
                      <p className="text-slate-300 text-sm">
                        © {lyrics.copyright || 'Unknown Copyright Holder'}
                        {lyrics.record_label && lyrics.record_label !== 'Unknown' && ` • ${lyrics.record_label}`}
                        {lyrics.release_year && lyrics.release_year !== 'Unknown' && ` • ${lyrics.release_year}`}
                      </p>
                      <p className="text-slate-400 text-xs mt-2">
                        This is a brief preview only. SpectroModel does not own any lyrics, songs, or websites linked here.
                        For full lyrics, please visit official platforms listed below.
                      </p>
                    </div>
                  </div>
                )}

                {lyrics.themes && lyrics.themes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-purple-400" />
                      <p className="text-white text-sm font-bold uppercase tracking-wide">Song Themes:</p>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-6">
                      {lyrics.themes.map((theme, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-black">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full border-purple-500 text-purple-300 font-black hover:bg-purple-500/10"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Song Information
                </Button>
              </CardContent>
            </Card>

            {lyrics.lyric_sources && lyrics.lyric_sources.length > 0 && (
              <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                  <CardTitle className="text-white flex items-center gap-3 uppercase tracking-wide">
                    <div className="p-2 bg-indigo-500/10 rounded-lg relative">
                       <div className="absolute inset-0 bg-indigo-400/20 blur-md rounded-lg"></div>
                       <ExternalLink className="w-5 h-5 text-indigo-400 relative z-10 drop-shadow-[0_0_5px_rgba(129,140,248,0.8)]" />
                    </div>
                    Full Lyrics Sources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <p className="text-sm font-bold text-indigo-200 mb-2">Full Lyrics Available At:</p>
                  {lyrics.lyric_sources.map((source, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-start border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                      onClick={() => {
                        window.open(source.url, '_blank', 'noopener,noreferrer');
                        mlDataCollector.record('lyrics_source_clicked', {
                          feature: 'lyrics_retrieval',
                          source: source.name,
                          timestamp: Date.now()
                        });
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      <span className="font-black">{source.name}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}

            <Button
              onClick={() => {
                setLyrics(null);
                setTrackName("");
                setArtistName("");
                mlDataCollector.record('new_search_started', {
                  feature: 'lyrics_retrieval',
                  timestamp: Date.now()
                });
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 font-black text-white"
            >
              Search Another Song
            </Button>
          </div>
        )}

        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300 text-center">
            🤖 AI learns from every search • 🛡️ Security monitored • {recentSearches.length} searches in history
          </p>
        </div>
      </div>
    </div>
  );
}