import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Loader2, Copy, CheckCircle, Shield, Brain, Waves, List, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { useUsageLimits } from '@/components/shared/useUsageLimits';
import LimitLocker from "@/components/shared/LimitLocker";
import LiveSecurityDisplay from '@/components/shared/LiveSecurityDisplay';
import LiveThreatDisplay from '@/components/shared/LiveThreatDisplay';

export default function EmojiLyricsPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  
  const [lyrics, setLyrics] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [converted, setConverted] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trackName, setTrackName] = useState("Emoji Lyrics Conversion");
  const [artistName, setArtistName] = useState("User Input");
  const [isViewingExisting, setIsViewingExisting] = useState(false);
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0, mlComplexity: 0 });
  const [sessionStartTime] = useState(Date.now());
  const [currentUser, setCurrentUser] = useState(null);

  const { isLocked, loading: loadingLimits } = useUsageLimits(currentUser);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Lock enforcement handled by LimitLocker


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
        
        mlDataCollector.record('emoji_lyrics_page_visit', {
          feature: 'emoji_lyrics',
          security: { safe: cspResult.valid, threats: cspResult.violations?.length || 0, mlComplexity: cspResult.mlComplexity || 0 },
          viewport: { width: window.innerWidth, height: window.innerHeight },
          timestamp: Date.now()
        });

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (id) {
          setIsViewingExisting(true);
          setIsConverting(true);
          
          try {
            const analysis = await base44.entities.MusicAnalysis.filter({ id });
            if (analysis && analysis[0]?.emoji_lyrics) {
              setTrackName(analysis[0].track_name || "Emoji Lyrics Conversion");
              setArtistName(analysis[0].artist_name || "User Input");
              setConverted(analysis[0].emoji_lyrics);
              setLyrics(analysis[0].original_lyrics || "");
            } else {
              setError("Analysis data not found.");
            }
          } catch (err) {
            console.error("❌ Failed to load analysis:", err);
            setError("Failed to load emoji lyrics data.");
          } finally {
            setIsConverting(false);
          }
        }
      } catch (error) {
        console.error('❌ Initialization failed:', error);
        mlDataCollector.record('emoji_lyrics_init_error', {
          feature: 'emoji_lyrics',
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
      mlDataCollector.record('emoji_lyrics_session_end', {
        feature: 'emoji_lyrics',
        sessionDuration,
        conversionCompleted: !!converted,
        timestamp: Date.now()
      });
    };
  }, []);

  const handleClearForm = useCallback(() => {
    setLyrics("");
    setConverted(null);
    setError(null);
    setIsViewingExisting(false);
    setTrackName("Emoji Lyrics Conversion");
    setArtistName("User Input");
    
    mlDataCollector.record('emoji_lyrics_form_cleared', {
      feature: 'emoji_lyrics',
      timestamp: Date.now()
    });
  }, [mlDataCollector]);

  const handleConvert = async () => {
    if (!lyrics.trim() || lyrics.trim().length < 10) {
      setError("Please enter valid lyrics (minimum 10 characters)");
      return;
    }

    setIsConverting(true);
    setError(null);
    setConverted(null);

    const startTime = Date.now();

    mlDataCollector.record('emoji_conversion_started', {
      feature: 'emoji_lyrics',
      lyricsLength: lyrics.length,
      timestamp: Date.now()
    });

    try {
      const prompt = `Convert these song lyrics into a MODERN, CREATIVE format by interspersing emojis throughout the text.

**RULES FOR CONVERSION:**
1. Keep ALL main words (nouns, verbs, adjectives, adverbs) as text
2. Replace articles (a, an, the), prepositions (in, on, at, to, for, with), and conjunctions (and, or, but) with relevant emojis
3. Add contextual emojis after important emotional words
4. Keep the lyrics readable - this is lyrics WITH emojis, NOT emoji-only
5. Use creative, modern emoji choices that match the vibe
6. Maintain original line breaks and structure

**EXAMPLES:**
Input: "I'm walking down the street in the sunshine"
Output: "I'm walking 🚶 down ⬇️ the street 🛣️ in ☀️ the sunshine ✨"

Input: "Love is all you need and I believe it"
Output: "Love ❤️ is all you need 🫵 and ➕ I believe 🙏 it ✨"

**ORIGINAL LYRICS:**
${lyrics}

Return TWO versions:
1. "modern_format": Lyrics WITH emojis interspersed (keep words, add emojis)
2. "emoji_highlights": Which words got emoji treatment and why`;

      // Retry logic with exponential backoff
      let result;
      const maxRetries = 3;
      let lastError;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 1) {
            const delay = 1000 * Math.pow(2, attempt - 1);
            console.log(`⏳ Retry ${attempt}/${maxRetries} in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          result = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: false,
            response_json_schema: {
              type: "object",
              properties: {
                modern_format: { type: "string" },
                emoji_highlights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      original: { type: "string" },
                      emoji: { type: "string" },
                      reason: { type: "string" }
                    }
                  }
                },
                vibe: { type: "string" },
                suggested_hashtags: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["modern_format"]
            }
          });
          
          console.log(`✅ LLM API success on attempt ${attempt}`);
          break;
        } catch (apiError) {
          lastError = apiError;
          console.error(`❌ LLM API Error (attempt ${attempt}/${maxRetries}):`, apiError);
          
          mlDataCollector.record('emoji_conversion_api_error', {
            feature: 'emoji_lyrics',
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

      setConverted(result);

      await base44.entities.MusicAnalysis.create({
        track_name: "Emoji Lyrics Conversion",
        artist_name: "User Input",
        original_lyrics: lyrics,
        emoji_lyrics: result,
        status: "completed",
        analysis_type: "emoji_lyrics_converter"
      });

      const conversionDuration = Date.now() - startTime;
      mlDataCollector.record('emoji_conversion_completed', {
        feature: 'emoji_lyrics',
        lyricsLength: lyrics.length,
        conversionDuration,
        timestamp: Date.now()
      });

    } catch (err) {
      console.error("❌ Emoji conversion failed:", err);
      setError(err.message || "Failed to convert lyrics. Please try again.");
      
      mlDataCollector.record('emoji_conversion_error', {
        feature: 'emoji_lyrics',
        error: err.message,
        timestamp: Date.now()
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = async () => {
    if (!converted?.modern_format) return;

    await navigator.clipboard.writeText(converted.modern_format);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    mlDataCollector.record('emoji_lyrics_copied', {
      feature: 'emoji_lyrics',
      timestamp: Date.now()
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
        <span className="ml-3 text-lg text-slate-300">Loading analysis...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8">
      <LimitLocker feature="analysis_uploads" featureKey="EMOJI_LYRICS" user={currentUser} />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-3xl md:text-4xl font-black text-white">Emoji Lyrics Converter</h1>
          <Button
            variant="outline"
            onClick={() => {
              mlDataCollector.record('navigation_back', {
                feature: 'emoji_lyrics',
                destination: 'Dashboard',
                timestamp: Date.now()
              });
              navigate(createPageUrl("Dashboard"));
            }}
            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold border-none hover:from-pink-700 hover:to-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
        <p className="text-slate-400 mt-1">
          {isViewingExisting ? "Viewing a past conversion" : "Transform lyrics with creative emoji interspersed throughout"}
        </p>

        <Card className="bg-black/40 backdrop-blur-xl border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-semibold text-sm">🛡️ Security Active • AI Learning Enabled</p>
                  <p className="text-xs text-slate-400">
                    {securityStatus.safe ? `Content protected • ML complexity: ${securityStatus.mlComplexity.toFixed(1)}` : `${securityStatus.threats} blocked`}
                  </p>
                </div>
              </div>
              <Badge className={securityStatus.safe ? 'bg-green-500' : 'bg-orange-500'}>
                {securityStatus.safe ? 'SAFE' : 'ALERT'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {lyrics && !converted && (
          <Card className="bg-black/40 backdrop-blur-xl border-l-4 border-l-cyan-500 border-y-0 border-r-0 shadow-lg rounded-xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-cyan-400 shrink-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">🤖 AI Learns From Your Data</p>
                  <p className="text-xs text-cyan-300 break-words">
                    {lyrics.split('\n').filter(l => l.trim()).length} lines • Browser-based • Security protected
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <LiveSecurityDisplay />
        <LiveThreatDisplay />

        {!converted && (
          <Card className="bg-black/40 backdrop-blur-xl border border-yellow-900/30 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-yellow-900/20 bg-yellow-950/5 p-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-white flex items-center gap-2 text-xl font-bold">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Enter Your Lyrics
                </CardTitle>
                {(lyrics || isViewingExisting) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearForm}
                    className="border-red-500 text-red-300 hover:bg-red-900/50"
                  >
                    Clear & Start Over
                  </Button>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-2">
                ✨ Modern format: Keeps your lyrics readable with emojis added throughout
              </p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <Textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Paste your lyrics here... 
              
Example:
'Walking down the street in the sunshine
Feeling good and free
Dancing through the night with you by my side'"
                className="min-h-[200px] bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                disabled={isConverting}
              />
              {error && (
                <p className="text-sm text-red-400 break-words">{error}</p>
              )}
              <Button
                onClick={handleConvert}
                disabled={isConverting || !lyrics.trim()}
                className="w-full bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {isViewingExisting ? "Loading Analysis..." : "Converting with Emojis..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Convert to Modern Format
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {converted && (
          <div className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-xl border border-yellow-900/30 shadow-[0_0_40px_-10px_rgba(234,179,8,0.15)] rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-yellow-900/20 bg-yellow-950/5 p-6">
                <CardTitle className="text-white flex items-center justify-between flex-wrap gap-2 text-xl font-bold">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    Modern Emoji Format
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearForm}
                      className="border-red-500 text-red-300 hover:bg-red-900/50"
                    >
                      Clear & Start Over
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-slate-900/50 rounded-lg border border-yellow-500/30">
                  <pre className="whitespace-pre-wrap text-white text-lg leading-relaxed font-sans">
                    {converted.modern_format}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {converted.vibe && (
              <Card className="bg-black/40 backdrop-blur-xl border border-blue-900/30 shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="border-b border-blue-900/20 bg-blue-950/5 p-6">
                  <CardTitle className="text-white font-bold text-lg flex items-center gap-2"><Waves className="w-5 h-5 text-blue-400" /> Vibe Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-300 leading-relaxed">{converted.vibe}</p>
                </CardContent>
              </Card>
            )}

            {converted.emoji_highlights && converted.emoji_highlights.length > 0 && (
              <Card className="bg-black/40 backdrop-blur-xl border border-green-900/30 shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="border-b border-green-900/20 bg-green-950/5 p-6">
                  <CardTitle className="text-white font-bold text-lg flex items-center gap-2"><List className="w-5 h-5 text-green-400" /> Emoji Choices</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {converted.emoji_highlights.slice(0, 10).map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-[#151515] rounded-xl border border-slate-800">
                        <span className="text-3xl">{highlight.emoji}</span>
                        <div className="flex-1">
                          <p className="text-sm text-white font-bold">"{highlight.original}"</p>
                          <p className="text-xs text-slate-400">{highlight.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {converted.suggested_hashtags && converted.suggested_hashtags.length > 0 && (
              <Card className="bg-slate-800/80 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2"><Hash className="w-4 h-4 text-pink-400" /> Suggested Hashtags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {converted.suggested_hashtags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            <Button
              onClick={handleClearForm}
              className="w-full bg-purple-600 hover:bg-purple-700 font-black text-white"
            >
              Convert Another Lyric
            </Button>
          </div>
        )}

        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300 text-center">
            🤖 AI learns from conversions • 🛡️ Security monitored • Network errors handled gracefully
          </p>
        </div>
      </div>
    </div>
  );
}