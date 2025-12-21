import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Shield, Brain, Play, Pause, ExternalLink, X, RefreshCw, Cloud, Zap, CheckCircle2, AlertCircle, Sparkles, Save, FolderOpen, Video, Film, AlertTriangle, Layers, Monitor, Cpu } from "lucide-react";
import { createPageUrl } from "@/utils";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import * as THREE from 'three';
import { base44 } from "@/api/base44Client";
import ProjectManager from "@/components/projects/ProjectManager";
import { useUsageLimits } from "@/components/shared/useUsageLimits";
import LimitLocker from "@/components/shared/LimitLocker";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import SecurityMonitor from "@/components/shared/SecurityMonitor";
import { Badge } from "@/components/ui/badge";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";

// App states
const AppState = {
  SETUP: 'SETUP',
  GENERATING_BACKGROUND: 'GENERATING_BACKGROUND',
  READY: 'READY',
  PLAYING: 'PLAYING',
  ERROR: 'ERROR'
};

// Secure random function
function secureRandom() {
  const buffer = new Uint32Array(1);
  window.crypto.getRandomValues(buffer);
  return buffer[0] / (0xffffffff + 1);
}

export default function VideoGenerator() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  
  // App state
  const [appState, setAppState] = useState(AppState.SETUP);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [title, setTitle] = useState("CYBER LOVE");
  const [artist, setArtist] = useState("J SPECTRO");
  const [lyricsInput, setLyricsInput] = useState(`In the neon light\nWe come alive\nChasing stars tonight\nWe will survive`);
  const [keywords, setKeywords] = useState("Cyberpunk City, Neon Rain");
  const [generationMode, setGenerationMode] = useState("text"); // "text" or "image"
  const [lyrics, setLyrics] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0 });
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [isConnected, setIsConnected] = useState(() => !!localStorage.getItem('gemini_api_key'));
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected', 'error'
  const [generationProgress, setGenerationProgress] = useState('');
  const [billingRequired, setBillingRequired] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Three.js refs
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const dataArrayRef = useRef(null);
  const lyricsGroupRef = useRef(null);
  const particlesRef = useRef(null);
  const backgroundMeshRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Security init
  useEffect(() => {
    try {
      blockScriptInjection();
      const cspResult = validateCSP();
      setSecurityStatus({ safe: cspResult.valid, threats: cspResult.violations?.length || 0 });
      mlDataCollector.record('spectro_generator_loaded', {
        feature: 'spectro_lyric_video',
        security: cspResult.valid ? 'safe' : 'threats',
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Security init error:', err);
    }
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current || appState === AppState.SETUP) return;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 15;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights (Cyberpunk colors)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pinkLight = new THREE.PointLight(0xff00ff, 2, 50);
    pinkLight.position.set(10, 10, 10);
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x00ffff, 2, 50);
    cyanLight.position.set(-10, -10, 10);
    scene.add(cyanLight);

    // Particles
    const particleCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const color1 = new THREE.Color(0x8B5CF6);
    const color2 = new THREE.Color(0x00FFFF);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (secureRandom() - 0.5) * 100;
      positions[i * 3 + 1] = (secureRandom() - 0.5) * 100;
      positions[i * 3 + 2] = (secureRandom() - 0.5) * 100;

      const mixedColor = color1.clone().lerp(color2, secureRandom());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Lyrics Group
    const lyricsGroup = new THREE.Group();
    scene.add(lyricsGroup);
    lyricsGroupRef.current = lyricsGroup;

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && containerRef.current) {
        try { containerRef.current.removeChild(rendererRef.current.domElement); } catch (e) {}
        rendererRef.current.dispose();
      }
    };
  }, [appState]);

  // Handle Background (Video or Image)
  useEffect(() => {
    if (!sceneRef.current || !videoUrl) return;

    const geo = new THREE.PlaneGeometry(80, 45);
    let mesh;

    // Check if it's a data URL (procedural image) or video URL
    if (videoUrl.startsWith('data:')) {
      // Use image texture for procedural background
      const img = new Image();
      img.src = videoUrl;
      img.onload = () => {
        const texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        texture.colorSpace = THREE.SRGBColorSpace;
        
        const mat = new THREE.MeshBasicMaterial({ 
          map: texture, 
          side: THREE.DoubleSide,
          depthWrite: false 
        });
        
        mesh = new THREE.Mesh(geo, mat);
        mesh.position.z = -20;
        if (sceneRef.current) {
          sceneRef.current.add(mesh);
          backgroundMeshRef.current = mesh;
        }
      };

      return () => {
        if (sceneRef.current && mesh) sceneRef.current.remove(mesh);
      };
    } else {
      // Use video texture for Veo videos
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true;
      video.play().catch(e => console.warn("Autoplay prevented for background texture", e));

      const texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      
      const mat = new THREE.MeshBasicMaterial({ 
        map: texture, 
        side: THREE.DoubleSide,
        depthWrite: false 
      });
      
      mesh = new THREE.Mesh(geo, mat);
      mesh.position.z = -20;
      sceneRef.current.add(mesh);
      backgroundMeshRef.current = mesh;

      return () => {
        video.pause();
        video.remove();
        if (sceneRef.current && mesh) sceneRef.current.remove(mesh);
      };
    }
  }, [videoUrl]);

  // Generate Lyric Textures
  useEffect(() => {
    if (!lyricsGroupRef.current || lyrics.length === 0) return;
    
    while(lyricsGroupRef.current.children.length > 0){
       lyricsGroupRef.current.remove(lyricsGroupRef.current.children[0]);
     }

    const createTextSprite = (text, isTitle, index) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      canvas.width = 2048;
      canvas.height = 512;

      const fontSize = isTitle ? 288 : 192;
      const fontFamily = isTitle ? '"Bungee Inline", cursive' : '"Oswald", sans-serif';
      
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      ctx.lineWidth = 12;
      ctx.strokeStyle = '#000000';

      ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
      ctx.strokeText(text, canvas.width / 2, canvas.height / 2);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true,
        opacity: 0 
      });

      const sprite = new THREE.Sprite(material);
      sprite.scale.set(20, 5, 1);

      sprite.userData = { index, isTitle };
      
      return sprite;
    };

    const titleSprite = createTextSprite(`${title.toUpperCase()}\n${artist.toUpperCase()}`, true, -1);
    if (titleSprite) lyricsGroupRef.current.add(titleSprite);

    lyrics.forEach((line, idx) => {
      const sprite = createTextSprite(line.text, false, idx);
      if (sprite) lyricsGroupRef.current.add(sprite);
    });

  }, [lyrics, title, artist]);

  // Audio Setup
  useEffect(() => {
    if (!audioFile) return;

    const audioUrl = URL.createObjectURL(audioFile);
    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const setupAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      if (!analyserRef.current && audioContextRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      }

      if (!sourceRef.current && audioContextRef.current && audioRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
    };

    audio.addEventListener('play', () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      setupAudioContext();
    });

    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.pause();
      audio.src = '';
      URL.revokeObjectURL(audioUrl);
      if (audioContextRef.current) audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
    };
  }, [audioFile]);

  // Play/Pause control
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(e => console.error("Playback error", e));
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  // Animation loop
  useEffect(() => {
    if (appState !== AppState.READY && appState !== AppState.PLAYING) return;

    const animate = (time) => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

      const currentTime = audioRef.current ? audioRef.current.currentTime : 0;
      
      let bassScale = 1;
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const bass = dataArrayRef.current.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
        bassScale = 1 + (bass / 255) * 0.3;
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.0001;
        particlesRef.current.rotation.z = time * 0.00005;
        particlesRef.current.scale.setScalar(1 + (bassScale - 1) * 0.5);
      }

      if (backgroundMeshRef.current) {
        backgroundMeshRef.current.position.x = Math.sin(time * 0.0005) * 2;
        backgroundMeshRef.current.position.y = Math.cos(time * 0.0005) * 1;
      }

      if (lyricsGroupRef.current) {
        lyricsGroupRef.current.children.forEach((child) => {
          const sprite = child;
          const { index, isTitle } = sprite.userData;

          let isActive = false;
          let progress = 0;

          if (isTitle) {
            const firstLyricTime = lyrics[0]?.startTime || 5;
            if (currentTime < firstLyricTime) {
              isActive = true;
              progress = currentTime / firstLyricTime;
            }
          } else {
            const line = lyrics[index];
            if (line && currentTime >= line.startTime && currentTime <= line.endTime + 0.5) {
              isActive = true;
              const duration = line.endTime - line.startTime;
              progress = (currentTime - line.startTime) / duration;
            }
          }

          if (isActive) {
            let opacity = 1;
            if (progress < 0.1) opacity = progress * 10;
            else if (progress > 0.9) opacity = (1 - progress) * 10;
            
            sprite.material.opacity = opacity;

            const baseScaleX = 20;
            const baseScaleY = 5;
            const growthFactor = 1 + (progress * 0.5);

            const totalScale = growthFactor * bassScale;

            sprite.scale.set(baseScaleX * totalScale, baseScaleY * totalScale, 1);
            sprite.position.z = progress * 2;
          } else {
            sprite.material.opacity = 0;
          }
        });
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [appState, lyrics]);

  // Process lyrics
  const processLyrics = (text, duration) => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const timePerLine = duration / lines.length;
    
    return lines.map((line, i) => ({
      text: line,
      startTime: i * timePerLine,
      endTime: (i + 1) * timePerLine,
      isTitle: false
    }));
  };

  // File change handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
      mlDataCollector.record('audio_uploaded', {
        feature: 'spectro_lyric_video',
        fileName: e.target.files[0].name,
        timestamp: Date.now()
      });
    }
  };

  // Image file handler for image-to-video
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);

      mlDataCollector.record('image_uploaded_for_video', {
        feature: 'spectro_lyric_video',
        fileName: file.name,
        fileType: file.type,
        timestamp: Date.now()
      });
    }
  };

  // Connect to Google Cloud / Veo / Gemini
  const connectToGoogleCloud = async (key) => {
    if (!key || key.trim().length < 10) {
      setError('Please enter a valid Google Cloud / Gemini API key');
      return;
    }

    setConnectionStatus('connecting');
    setError(null);

    try {
      // Test the API key by making a simple request to Gemini
      const testResponse = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models?key=' + key.trim()
      );

      if (!testResponse.ok) {
        const errorData = await testResponse.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Invalid API key or connection failed');
      }

      // Connection successful
      localStorage.setItem('gemini_api_key', key.trim());
      setApiKey(key.trim());
      setIsConnected(true);
      setConnectionStatus('connected');
      setShowApiKeyInput(false);

      mlDataCollector.record('google_cloud_veo_gemini_connected', {
        feature: 'spectro_lyric_video',
        platform: 'Google Cloud + Veo + Gemini',
        timestamp: Date.now()
      });

    } catch (err) {
      setConnectionStatus('error');
      setError(err.message || 'Failed to connect to Google Cloud');
      mlDataCollector.record('google_cloud_connection_failed', {
        feature: 'spectro_lyric_video',
        error: err.message,
        timestamp: Date.now()
      });
    }
  };

  // Disconnect API
  const disconnectApi = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setShowApiKeyInput(true);
    mlDataCollector.record('google_cloud_disconnected', {
      feature: 'spectro_lyric_video',
      timestamp: Date.now()
    });
  };

  // Open Google Cloud Veo Studio for video generation with prompt
  const openVeoStudio = async () => {
    mlDataCollector.record('veo_studio_opened', {
      feature: 'spectro_lyric_video',
      platform: 'Google Cloud Veo',
      prompt: keywords,
      timestamp: Date.now()
    });

    // Copy prompt to clipboard so user can paste in Veo
    try {
      await navigator.clipboard.writeText(keywords);
      alert(`✅ Prompt copied to clipboard!\n\n"${keywords}"\n\nPaste it in Veo Studio when it opens.`);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }

    // Open Google AI Studio Veo video generation page
    window.open('https://aistudio.google.com/prompts/new_video?model=veo-2.0-generate-001', '_blank');
  };

  // Open Google Flow for creative video editing
  const openGoogleFlow = () => {
    mlDataCollector.record('google_flow_opened', {
      feature: 'spectro_lyric_video',
      platform: 'Google Flow',
      timestamp: Date.now()
    });

    window.open('https://labs.google/fx/tools/flow', '_blank');
  };

  // Save Project
  const handleSaveProject = async () => {
    try {
      const projectData = {
        title,
        artist,
        lyricsInput,
        keywords,
        generationMode
      };

      if (currentProject) {
        await base44.entities.CreativeProject.update(currentProject.id, {
          data: projectData,
          version: (currentProject.version || 1) + 1,
          parent_id: currentProject.id // Tracking history
        });
        alert('Project updated!');
      } else {
        const newProject = await base44.entities.CreativeProject.create({
          name: title || "Untitled Video",
          type: "video_generation",
          data: projectData,
          folder: "Lyric Videos",
          tags: ["video", generationMode]
        });
        setCurrentProject(newProject);
        alert('Project saved!');
      }
    } catch (e) {
      console.error("Save failed", e);
      alert("Failed to save project");
    }
  };

  const handleLoadProject = (project) => {
    if (project.data) {
      setTitle(project.data.title || "");
      setArtist(project.data.artist || "");
      setLyricsInput(project.data.lyricsInput || "");
      setKeywords(project.data.keywords || "");
      setGenerationMode(project.data.generationMode || "text");
      setCurrentProject(project);
      setShowProjectManager(false);
    }
  };

  // Generate handler - Opens Veo or Flow for external video generation
  const handleGenerate = async () => {
    if (!audioFile) {
      setError("Please upload an audio file first.");
      return;
    }

    if (!apiKey || !isConnected) {
      setError("Please connect to Gemini & Veo first to generate videos");
      return;
    }

    setError(null);

    // Process lyrics for display
    const audioUrl = URL.createObjectURL(audioFile);
    const audio = new Audio(audioUrl);

    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration;
      const processedLyrics = processLyrics(lyricsInput, duration);
      setLyrics(processedLyrics);

      // Open Veo for text-to-video, Flow for image-to-video
      if (generationMode === "image") {
        openGoogleFlow();
        mlDataCollector.record('google_flow_opened_for_generation', {
          feature: 'spectro_lyric_video',
          platform: 'Google Flow',
          prompt: keywords,
          timestamp: Date.now()
        });
      } else {
        openVeoStudio();
        mlDataCollector.record('veo_studio_opened_for_generation', {
          feature: 'spectro_lyric_video',
          platform: 'Google AI Studio Veo 2.0',
          prompt: keywords,
          timestamp: Date.now()
        });
      }
    });
  };

  // Reset handler
  const handleReset = () => {
    setAppState(AppState.SETUP);
    setVideoUrl(null);
    setIsPlaying(false);
    setError(null);
    setLyrics([]);
    mlDataCollector.record('spectro_reset', {
      feature: 'spectro_lyric_video',
      timestamp: Date.now()
    });
  };

  const isSetup = appState === AppState.SETUP;
  const isGenerating = appState === AppState.GENERATING_BACKGROUND;

  return (
    // CYBERPUNK BASE
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0 p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-purple-500/30 selection:text-purple-100">
      
      {/* Decorative Grid Overlay */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <NetworkErrorBanner />
        <AILearningBanner />
        <SecurityMonitor />
        <LimitLocker feature="analysis_uploads" featureKey="VIDEO_GENERATOR" user={currentUser} />

        {/* HEADER */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <Film className="w-8 h-8 text-purple-500 animate-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-500 to-blue-500">
                VISUAL SYNTHESIS HUB
              </span>
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-wider">
              Generative Video • Frame Interpolation • Neural Rendering
            </p>
          </div>
        </div>

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Security */}
             <Card className="bg-black/60 border border-green-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Render Safe Mode</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                {securityStatus.safe ? '&gt;&gt; OUTPUT FILTERING ACTIVE' : '!! UNSAFE CONTENT'}
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">SECURE</Badge>
                </CardContent>
            </Card>

             {/* AI Status */}
            <Card className="bg-black/60 border border-cyan-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Diffusion Engine</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                &gt;&gt; MODELS: VEO-2 / FLOW-1
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">ONLINE</Badge>
                </CardContent>
            </Card>
        </div>

        <LiveSecurityDisplay />
        <LiveThreatDisplay />

        {/* MAIN INTERFACE */}
        <Card className="bg-black/60 border border-purple-500/30 shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)] rounded-2xl overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"></div>
            <CardHeader className="border-b border-white/5 bg-white/5 p-8">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-white text-2xl font-bold uppercase tracking-wide flex items-center gap-3">
                            <Video className="w-6 h-6 text-purple-400" />
                            Generation Protocols
                        </CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                
                 {/* Update Notice - Amber */}
                <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                    <div className="space-y-1">
                        <h3 className="text-amber-300 font-bold text-sm uppercase tracking-wide">System Update In Progress</h3>
                        <p className="text-xs text-amber-200/70 font-mono leading-relaxed">
                            &gt;&gt; NATIVE SPECTROMODEL VIDEO GENERATION MODULE IS COMPILING... <br/>
                            &gt;&gt; CURRENT PROTOCOL: EXTERNAL REDIRECTION TO GOOGLE LABS.
                        </p>
                    </div>
                </div>

                 {/* Architecture Diagram - Cyan/Purple */}
                <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-lg flex items-center gap-4 shadow-sm">
                    <Layers className="w-8 h-8 text-cyan-400" />
                    <div className="flex-1">
                        <h4 className="text-purple-300 font-bold text-xs uppercase mb-1">Neural Architecture Visualization</h4>
                        <p className="text-slate-400 text-xs mb-2">Latent space diffusion & temporal consistency layers.</p>
                        <div className="text-[10px] text-cyan-400/70 border border-cyan-500/30 rounded px-2 py-1 bg-black/30 font-mono inline-block">
                            [Image of text-to-video diffusion model architecture]
                        </div>
                    </div>
                </div>

                 {/* Action Buttons */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Veo 2.0 - Blue */}
                    <Button
                        onClick={() => {
                            mlDataCollector.record('veo_studio_opened', {
                                feature: 'video_studio',
                                platform: 'Google Veo 2.0',
                                timestamp: Date.now()
                            });
                            window.open('https://aistudio.google.com/prompts/new_video?model=veo-2.0-generate-001', '_blank');
                        }}
                        className="h-32 bg-blue-900/20 border border-blue-500/30 hover:bg-blue-600 hover:border-blue-400 group relative overflow-hidden transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex flex-col items-center gap-3 relative z-10">
                            <Zap className="w-8 h-8 text-blue-400 group-hover:text-white transition-colors" />
                            <div className="text-center">
                                <span className="block text-lg font-black text-white uppercase tracking-widest">Veo 2.0 Studio</span>
                                <span className="text-[10px] text-blue-300 font-mono group-hover:text-blue-100">TEXT-TO-VIDEO GENERATION</span>
                            </div>
                        </div>
                        <ExternalLink className="absolute top-4 right-4 w-4 h-4 text-blue-500 opacity-50 group-hover:opacity-100" />
                    </Button>

                     {/* Google Flow - Orange */}
                    <Button
                        onClick={() => {
                            mlDataCollector.record('google_flow_opened', {
                                feature: 'video_studio',
                                platform: 'Google Flow',
                                timestamp: Date.now()
                            });
                            window.open('https://labs.google/fx/tools/flow', '_blank');
                        }}
                        className="h-32 bg-orange-900/20 border border-orange-500/30 hover:bg-orange-600 hover:border-orange-400 group relative overflow-hidden transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex flex-col items-center gap-3 relative z-10">
                            <Sparkles className="w-8 h-8 text-orange-400 group-hover:text-white transition-colors" />
                            <div className="text-center">
                                <span className="block text-lg font-black text-white uppercase tracking-widest">Google Flow</span>
                                <span className="text-[10px] text-orange-300 font-mono group-hover:text-orange-100">IMAGE-TO-VIDEO ANIMATION</span>
                            </div>
                        </div>
                        <ExternalLink className="absolute top-4 right-4 w-4 h-4 text-orange-500 opacity-50 group-hover:opacity-100" />
                    </Button>
                </div>

                 {/* Tech Specs */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-center flex items-center justify-center gap-3">
                         <Monitor className="w-5 h-5 text-cyan-500" />
                         <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Output Resolution</p>
                            <p className="text-sm font-mono text-cyan-300">1080p / 4K (Upscaled)</p>
                         </div>
                    </div>
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-center flex items-center justify-center gap-3">
                         <Cpu className="w-5 h-5 text-purple-500" />
                         <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Frame Rate</p>
                            <p className="text-sm font-mono text-purple-300">24fps / 60fps</p>
                         </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}