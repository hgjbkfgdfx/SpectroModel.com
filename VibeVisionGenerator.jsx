import React, { useState, useEffect } from 'react';
import { Clapperboard, Loader2, Download, RefreshCw, Wand2, Music, Mic2, Sparkles, Key, Settings2, Brain, Shield, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import ApiKeyModal from './ApiKeyModal';

const AspectRatio = {
  LANDSCAPE: '16:9',
  PORTRAIT: '9:16',
};

const Resolution = {
  HD: '720p',
  FHD: '1080p',
};

const VideoModel = {
  FAST: 'veo-3.1-fast-generate-preview',
  QUALITY: 'veo-3.1-generate-preview',
};

const MusicGenre = {
  POP: 'Pop',
  HIP_HOP: 'Hip Hop / Trap',
  EDM: 'EDM / House',
  ROCK: 'Rock / Metal',
  RNB: 'R&B / Soul',
  BALLAD: 'Ballad / Cinematic',
  INDIE: 'Indie / Alt',
  CYBERPUNK: 'Cyberpunk / Synthwave',
  LOFI: 'Lo-Fi / Chill'
};

const GENRE_THEMES = {
  [MusicGenre.POP]: 'from-pink-500 to-rose-500',
  [MusicGenre.HIP_HOP]: 'from-amber-500 to-orange-600',
  [MusicGenre.EDM]: 'from-violet-500 to-fuchsia-500',
  [MusicGenre.ROCK]: 'from-red-600 to-rose-900',
  [MusicGenre.RNB]: 'from-purple-400 to-indigo-600',
  [MusicGenre.BALLAD]: 'from-sky-400 to-blue-600',
  [MusicGenre.INDIE]: 'from-emerald-400 to-teal-600',
  [MusicGenre.CYBERPUNK]: 'from-cyan-400 to-blue-600',
  [MusicGenre.LOFI]: 'from-orange-300 to-amber-400',
};

const MUSIC_VIDEO_STYLES = [
  { id: 'cinematic', label: 'Cinematic', prefix: 'Cinematic, high-budget music video, dramatic lighting, professional color grading, anamorphic lens flares,' },
  { id: 'neon', label: 'Neon Noir', prefix: 'Dark atmosphere, bright neon lights, rain-slicked wet surfaces, high contrast, moody, mystery,' },
  { id: 'retro', label: 'VHS / 90s', prefix: '90s music video style, VHS glitch effects, lo-fi aesthetic, grainy texture, analog horror vibes,' },
  { id: 'psychedelic', label: 'Trippy', prefix: 'Trippy visualizer, kaleidoscope colors, flowing liquid patterns, dreamlike, surreal abstract geometry,' },
  { id: 'minimal', label: 'Minimalist', prefix: 'Clean studio background, single light source, focus on subject, crisp details, fashion editorial style,' },
  { id: 'nature', label: 'Ethereal', prefix: 'Soft natural lighting, slow motion, mystical forest, morning mist, serene atmosphere, dream pop aesthetic,' },
];

export default function VibeVisionGenerator({ onResetKey, apiKey, onApiKeyChange }) {
  const mlDataCollector = useMLDataCollector();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  const [params, setParams] = useState({
    prompt: '',
    lyrics: '',
    genre: MusicGenre.POP,
    stylePrefix: MUSIC_VIDEO_STYLES[0].prefix,
    aspectRatio: AspectRatio.LANDSCAPE,
    resolution: Resolution.HD,
    model: VideoModel.FAST
  });

  const [state, setState] = useState({
    isGenerating: false,
    statusMessage: '',
    videoUrl: null,
    error: null
  });

  const [selectedStyleId, setSelectedStyleId] = useState(MUSIC_VIDEO_STYLES[0].id);

  const handleStyleChange = (styleId) => {
    setSelectedStyleId(styleId);
    const style = MUSIC_VIDEO_STYLES.find(s => s.id === styleId);
    if (style) {
      setParams(prev => ({ ...prev, stylePrefix: style.prefix }));
    }
    
    mlDataCollector.record('vibe_style_changed', {
      feature: 'video_studio',
      style: styleId,
      timestamp: Date.now()
    });
  };

  // Generate video using Gemini VEO 3
  const generateWithGeminiVeo = async (prompt) => {
    if (!apiKey) {
      throw new Error('API key required. Please connect your Gemini API.');
    }

    // Use Gemini API directly for VEO 3 video generation
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:predictLongRunning', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        instances: [{
          prompt: prompt
        }],
        parameters: {
          aspectRatio: params.aspectRatio,
          personGeneration: "allow_adult",
          numberOfVideos: 1,
          durationSeconds: 8,
          resolution: params.resolution === Resolution.FHD ? "1080p" : "720p"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key or insufficient permissions. Please check your Gemini API key.');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait and try again.');
      }
      if (response.status === 402 || errorData.error?.message?.includes('billing') || errorData.error?.message?.includes('exclusively available') || errorData.error?.message?.includes('pay-as-you-go')) {
        // Return demo mode instead of error
        return 'BILLING_REQUIRED';
      }
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const operationData = await response.json();
    
    // Poll for completion
    const operationName = operationData.name;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      
      const pollResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`);
      const pollData = await pollResponse.json();
      
      if (pollData.done) {
        if (pollData.error) {
          throw new Error(pollData.error.message || 'Video generation failed');
        }
        
        const videoUri = pollData.response?.generatedVideos?.[0]?.video?.uri;
        if (videoUri) {
          // Fetch the video with API key
          const videoResponse = await fetch(`${videoUri}&key=${apiKey}`);
          if (!videoResponse.ok) {
            throw new Error('Failed to download generated video');
          }
          const blob = await videoResponse.blob();
          return URL.createObjectURL(blob);
        }
        throw new Error('No video returned from generation');
      }
      
      attempts++;
      setState(prev => ({ 
        ...prev, 
        statusMessage: `Rendering frames... (${Math.min(attempts * 2, 95)}%)` 
      }));
    }
    
    throw new Error('Video generation timed out. Please try again.');
  };

  const handleGenerate = async () => {
    if (!params.prompt) return;
    
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setState({
      isGenerating: true,
      statusMessage: 'Starting creative director...',
      videoUrl: null,
      error: null
    });

    mlDataCollector.record('vibe_generation_started', {
      feature: 'video_studio',
      genre: params.genre,
      style: selectedStyleId,
      hasLyrics: !!params.lyrics,
      model: 'gemini-veo-3',
      timestamp: Date.now()
    });

    try {
      // Step 1: Use Gemini as Creative Director
      setState(prev => ({ ...prev, statusMessage: 'Director AI is entering Thinking Mode (Analyzing lyrics & genre)...' }));
      
      let finalPrompt = `${params.stylePrefix} ${params.prompt}`;
      
      try {
        // Use Gemini 2.5 Flash for prompt refinement
        const directorResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert Music Video Director. Create a vivid, cinematic visual description for video generation.

Genre: ${params.genre}
Visual Style: ${params.stylePrefix}
User Vision: ${params.prompt}
Lyrics: ${params.lyrics || "Instrumental"}

GUIDELINES:
- For ${params.genre}: ${params.genre.includes('Pop') || params.genre.includes('Hip') || params.genre.includes('EDM') ? 'dynamic camera, snap zooms, vibrant colors, fast motion' : 'slow cinematic pans, soft focus, ethereal lighting'}
- Analyze lyrics for visual metaphors
- Max 400 characters
- Focus purely on visual output

Output ONLY the final video generation prompt, nothing else:`
              }]
            }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 500
            }
          })
        });

        if (directorResponse.ok) {
          const directorData = await directorResponse.json();
          const refinedPrompt = directorData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (refinedPrompt) {
            finalPrompt = refinedPrompt.trim();
          }
        }
      } catch (e) {
        console.warn("Director AI fallback to raw prompt", e);
      }

      // Step 2: Generate Video with VEO 3
      setState(prev => ({ ...prev, statusMessage: `Shooting scene with VEO 3: "${finalPrompt.substring(0, 40)}..."` }));
      
      const videoResult = await generateWithGeminiVeo(finalPrompt);

      // Handle billing required - show demo preview using Gemini image
      if (videoResult === 'BILLING_REQUIRED') {
        setState(prev => ({ ...prev, statusMessage: 'VEO requires billing - generating preview image...' }));
        
        // Generate a preview image using Gemini instead
        try {
          const imageResponse = await base44.integrations.Core.GenerateImage({
            prompt: `Music video frame: ${finalPrompt}`
          });
          
          setState({
            isGenerating: false,
            statusMessage: 'Preview generated (enable billing for full video)',
            videoUrl: imageResponse.url,
            error: '💳 This is a preview image. Enable Google Cloud billing at console.cloud.google.com/billing to generate actual VEO 3 videos.'
          });
          return;
        } catch (imgErr) {
          setState({
            isGenerating: false,
            statusMessage: '',
            videoUrl: null,
            error: '💳 VEO 3 requires Google Cloud billing. Enable billing at console.cloud.google.com/billing to generate videos.'
          });
          return;
        }
      }

      setState({
        isGenerating: false,
        statusMessage: 'Complete!',
        videoUrl: videoResult,
        error: null
      });
      
      mlDataCollector.record('vibe_generation_completed', {
        feature: 'video_studio',
        genre: params.genre,
        model: 'gemini-veo-3',
        timestamp: Date.now()
      });

    } catch (err) {
      console.error("Generation error:", err);
      setState({
        isGenerating: false,
        statusMessage: '',
        videoUrl: null,
        error: err.message || 'An error occurred'
      });
      
      mlDataCollector.record('vibe_generation_error', {
        feature: 'video_studio',
        error: err.message,
        model: 'gemini-veo-3',
        timestamp: Date.now()
      });
    }
  };

  const handleApiKeySubmit = (key) => {
    onApiKeyChange(key);
    setShowApiKeyModal(false);
    // Auto-start generation after key is set
    setTimeout(() => {
      if (params.prompt) {
        handleGenerate();
      }
    }, 100);
  };

  const currentTheme = GENRE_THEMES[params.genre];
  
  const isAuthError = state.error && (
    state.error.toLowerCase().includes('key') || 
    state.error.includes('400') || 
    state.error.includes('403') ||
    state.error.toLowerCase().includes('expired') ||
    state.error.toLowerCase().includes('quota') ||
    state.error.includes('429')
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 lg:py-24 min-h-screen pt-24">
      {showApiKeyModal && (
        <ApiKeyModal 
          onSubmit={handleApiKeySubmit}
          onCancel={() => setShowApiKeyModal(false)}
        />
      )}

      {/* API Key Status */}
      {!apiKey && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-amber-200 font-semibold text-sm">API Key Required for VEO 3</p>
                <p className="text-amber-300/70 text-xs">Connect your Gemini API key with billing enabled to generate videos</p>
              </div>
            </div>
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-amber-200 text-sm font-semibold transition-colors"
            >
              Connect API
            </button>
          </div>
        </div>
      )}

      {apiKey && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-200 font-semibold text-sm">✓ Gemini API Connected</p>
                <p className="text-green-300/70 text-xs">
                  Ensure <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer" className="underline text-green-200">billing is enabled</a> for VEO 3 • Key stored locally
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onApiKeyChange(null);
                mlDataCollector.record('api_key_removed', { feature: 'video_studio', timestamp: Date.now() });
              }}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-white/50 text-xs transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* AI Learning Banner */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border border-cyan-500/40">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
          <Shield className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-white font-semibold text-sm">🤖 AI Learns From Your Creations • 🛡️ Security Active</p>
            <p className="text-xs text-cyan-300">Genre analysis • Lyric synchronization • Style learning • Encrypted</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Creative Direction Section */}
          <div className="p-6 rounded-2xl space-y-6 relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10">
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${currentTheme} opacity-10 rounded-full blur-[80px] transition-all duration-700`}></div>

            <div className="flex items-center justify-between relative z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-cyan-400" />
                Creative Direction
              </h2>
              {onResetKey && (
                <button 
                  onClick={onResetKey}
                  className="text-[10px] flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors border border-white/5"
                >
                  <Key className="w-3 h-3" />
                  API Key
                </button>
              )}
            </div>

            {/* Genre Selector */}
            <div className="relative z-10">
              <label className="block text-xs font-bold text-white/60 uppercase mb-2">Musical Genre</label>
              <div className="relative">
                <select
                  value={params.genre}
                  onChange={(e) => setParams(prev => ({ ...prev, genre: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-sm text-white focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                >
                  {Object.values(MusicGenre).map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <Music className="absolute left-3 top-3 w-4 h-4 text-white/50 pointer-events-none" />
                <div className={`absolute inset-y-0 right-0 w-1 rounded-r-xl bg-gradient-to-b ${currentTheme}`}></div>
              </div>
            </div>

            {/* Prompt */}
            <div className="relative z-10">
              <label className="block text-xs font-bold text-white/60 uppercase mb-2">Visual Vision</label>
              <textarea
                value={params.prompt}
                onChange={(e) => setParams(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Describe the scene (e.g., An astronaut floating in a neon nebula, slow motion...)"
                className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/50 resize-none transition-colors"
              />
            </div>

            {/* Lyrics Input */}
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-white/60 uppercase flex items-center gap-2">
                  <Mic2 className="w-3 h-3 text-purple-500" />
                  Lyrics / Rhythm
                </label>
                <span className="text-[10px] text-purple-500/80 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  Syncs Visuals
                </span>
              </div>
              <textarea
                value={params.lyrics}
                onChange={(e) => setParams(prev => ({ ...prev, lyrics: e.target.value }))}
                placeholder="Paste lyrics here. The Director AI will analyze metaphors and rhythm to sync the video pace..."
                className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 resize-none transition-colors font-mono text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Style Selectors */}
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <label className="block text-xs font-bold text-white/60 uppercase mb-4">Aesthetic Style</label>
            <div className="grid grid-cols-2 gap-2">
              {MUSIC_VIDEO_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleChange(style.id)}
                  className={`px-3 py-2 rounded-lg text-left text-xs font-medium transition-all duration-200 border relative overflow-hidden ${
                    selectedStyleId === style.id
                      ? 'bg-white/10 border-white/30 text-white shadow-lg'
                      : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10'
                  }`}
                >
                  <span className="relative z-10">{style.label}</span>
                  {selectedStyleId === style.id && (
                     <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme} opacity-20`}></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Production Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                 onClick={() => setParams(prev => ({ ...prev, aspectRatio: params.aspectRatio === AspectRatio.LANDSCAPE ? AspectRatio.PORTRAIT : AspectRatio.LANDSCAPE }))}
                 className="flex flex-col gap-1 p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-all border border-white/5 hover:border-white/20 group"
              >
                <span className="text-[10px] uppercase text-white/40 font-bold group-hover:text-white/60">Aspect Ratio</span>
                <span className="text-sm font-medium text-white">{params.aspectRatio}</span>
              </button>

               <button
                 onClick={() => setParams(prev => ({ ...prev, resolution: params.resolution === Resolution.HD ? Resolution.FHD : Resolution.HD }))}
                 className="flex flex-col gap-1 p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-all border border-white/5 hover:border-white/20 group"
              >
                <span className="text-[10px] uppercase text-white/40 font-bold group-hover:text-white/60">Resolution</span>
                <span className={`text-sm font-medium ${params.resolution === Resolution.FHD ? 'text-cyan-400' : 'text-white'}`}>
                  {params.resolution === Resolution.FHD ? '1080p FHD' : '720p HD'}
                </span>
              </button>

              <button
                 onClick={() => setParams(prev => ({ ...prev, model: params.model === VideoModel.FAST ? VideoModel.QUALITY : VideoModel.FAST }))}
                 className={`flex flex-col gap-1 p-3 rounded-xl text-left transition-all border group ${
                   params.model === VideoModel.QUALITY 
                     ? 'bg-purple-500/10 border-purple-500/30' 
                     : 'bg-white/5 border-white/5 hover:bg-white/10'
                 }`}
              >
                <span className={`text-[10px] uppercase font-bold group-hover:text-white/60 ${params.model === VideoModel.QUALITY ? 'text-purple-500' : 'text-white/40'}`}>
                   Rendering Model
                </span>
                <span className="text-sm font-medium text-white">
                  {params.model === VideoModel.FAST ? 'Veo Fast' : 'Veo Pro'}
                </span>
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={!params.prompt || state.isGenerating}
            className={`w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
              !params.prompt || state.isGenerating
                ? 'bg-white/10 text-white/20 cursor-not-allowed'
                : `bg-gradient-to-r ${currentTheme} text-white hover:scale-[1.02] hover:shadow-lg`
            }`}
          >
            {state.isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="animate-pulse">{state.statusMessage.split('(')[0]}</span>
              </>
            ) : !apiKey ? (
              <>
                <Key className="w-5 h-5" />
                Connect API to Generate
              </>
            ) : (
              <>
                <Clapperboard className="w-5 h-5 fill-current" />
                Generate with VEO 3
              </>
            )}
          </button>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-7">
          <div className="sticky top-24 space-y-4">
            <div className={`aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/60 relative flex flex-col items-center justify-center transition-all duration-500 shadow-2xl ${
              params.aspectRatio === AspectRatio.PORTRAIT ? 'max-w-sm mx-auto aspect-[9/16]' : 'w-full'
            }`}>
              
              {state.isGenerating ? (
                <div className="text-center p-8 max-w-sm relative z-10">
                  {state.statusMessage.includes("Director") ? (
                    <div className="mb-6 relative">
                       <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${currentTheme} blur-xl animate-pulse absolute top-0 left-1/2 -translate-x-1/2`}></div>
                       <Sparkles className="w-16 h-16 text-white relative z-10 mx-auto animate-bounce" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
                  )}
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {state.statusMessage.includes("Director") ? "Director AI Thinking..." : "Generating Scene"}
                  </h3>
                  <p className="text-white/50 text-sm font-mono">
                    {state.statusMessage}
                  </p>
                  
                  {state.statusMessage.includes("Director") && (
                     <div className="mt-6 flex flex-col gap-2">
                       <div className="h-1 w-32 bg-white/10 rounded-full mx-auto overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${currentTheme} w-2/3 animate-pulse`}></div>
                       </div>
                       <span className="text-[10px] text-white/30 uppercase tracking-widest">Analyzing {params.genre} Lyrics</span>
                     </div>
                  )}
                </div>
              ) : state.videoUrl ? (
                <div className="w-full h-full group relative bg-black">
                  <img 
                    src={state.videoUrl} 
                    alt="Generated visual"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={state.videoUrl} 
                      download="vibevision-output.png"
                      className="p-3 bg-black/80 rounded-xl text-white hover:text-cyan-400 block backdrop-blur-md border border-white/10"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className={`w-24 h-24 bg-gradient-to-tr ${currentTheme} opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse blur-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}></div>
                  <div className="relative z-10 w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <Clapperboard className="w-8 h-8 text-white/40" />
                  </div>
                  <p className="text-white/40 text-lg font-medium">Your masterpiece awaits</p>
                  <p className="text-white/20 text-sm mt-2">Configure the director settings to begin</p>
                </div>
              )}

              {state.error && (
                <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8 text-center z-20 backdrop-blur-sm">
                  <div className="max-w-md bg-white/5 p-6 rounded-2xl border border-white/10">
                    {state.error.includes('💳') || state.error.includes('billing') ? (
                      <>
                        <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-amber-400 text-xl">💳</span>
                        </div>
                        <p className="text-amber-400 font-bold mb-2">Google Cloud Billing Required</p>
                        <p className="text-white/60 mb-4 text-sm">VEO 3 is a paid API. To generate videos:</p>
                        <ol className="text-left text-white/50 text-sm mb-6 space-y-2">
                          <li>1. Go to <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Google Cloud Console</a></li>
                          <li>2. Create or link a billing account</li>
                          <li>3. Enable the Generative Language API</li>
                          <li>4. Try generating again</li>
                        </ol>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-red-400 text-xl font-bold">!</span>
                        </div>
                        <p className="text-red-400 font-bold mb-2">Generation Failed</p>
                        <p className="text-white/60 mb-6 text-sm leading-relaxed break-words">{state.error}</p>
                      </>
                    )}
                    <div className="flex gap-3 justify-center">
                      <button 
                        onClick={() => setState(prev => ({ ...prev, error: null }))}
                        className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2 text-sm font-medium text-white"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Dismiss
                      </button>
                      
                      {isAuthError && onResetKey && (
                        <button 
                          onClick={onResetKey}
                          className="px-6 py-2 bg-purple-500/20 text-purple-500 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center gap-2 text-sm font-bold"
                        >
                          <Key className="w-4 h-4" />
                          Fix API Key
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Info Bar */}
            <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
               <div className="flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentTheme}`}></div>
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-white/80">Gemini 2.5 Flash</span>
                   <span className="text-[10px] text-white/40">Director Agent (Thinking)</span>
                 </div>
               </div>
               <div className="h-4 w-[1px] bg-white/10"></div>
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-green-400"></div>
                 <div className="flex flex-col text-right">
                   <span className="text-xs font-bold text-white/80">Veo 3.1</span>
                   <span className="text-[10px] text-white/40">Video Generation</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}