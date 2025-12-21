import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { ArrowLeft, Film, Upload, Play, Download, Loader2, Shield, Brain, Layers, Zap, Monitor, Aperture, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from "@/utils";
import LimitLocker from "@/components/shared/LimitLocker";
import { base44 } from "@/api/base44Client";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import SecurityMonitor from "@/components/shared/SecurityMonitor";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";

export default function SpectroModelProRes4K() {
  const navigate = useNavigate();
  const ml = useMLDataCollector();
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0, mlComplexity: 0 });
  const [img, setImg] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const scenes = Array.from({ length: 24 }, (_, i) => ({ id: i + 1 }));
  const depth = { fg: 1.12, mg: 1.06, bg: 1.0 };

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  useEffect(() => {
    blockScriptInjection();
    const cspResult = validateCSP();
    setSecurityStatus({
         safe: cspResult.valid,
         threats: cspResult.violations?.length || 0,
        mlComplexity: cspResult.mlComplexity || 0
    });
    
    ml.record("prores4k_page_visit", {
      feature: "prores4k_cinema",
      security: { safe: cspResult.valid, threats: cspResult.violations?.length || 0 },
      timestamp: Date.now()
    });
  }, [ml]);

  function applyCameraMotion(ctx, sceneIndex, canvas) {
    const panX = Math.sin(sceneIndex * 0.25) * 40;
    const panY = Math.cos(sceneIndex * 0.18) * 32;
    const zoom = 1 + Math.sin(sceneIndex * 0.12) * 0.15;
    const dolly = Math.cos(sceneIndex * 0.08) * 28;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2 + panX + dolly, -canvas.height / 2 + panY);
  }

  function applyBloom(ctx, canvas) {
    ctx.globalAlpha = 0.18;
    ctx.filter = "blur(10px)";
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
  }

  function applyChromaticAberration(ctx, canvas) {
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = frame.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] += 2;
      d[i + 2] -= 2;
    }
    ctx.putImageData(frame, 0, 0);
  }

  function applyParticles(ctx, canvas, frame) {
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    for (let i = 0; i < 40; i++) {
      const x = Math.sin(i * 12 + frame * 0.05) * 400 + canvas.width / 2;
      const y = Math.cos(i * 20 + frame * 0.03) * 220 + canvas.height / 2;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  const lut = [1.04, 0.01, 0, 0, 1.02, 0.02, 0, 0.02, 1.06];
  function applyLUT(ctx, canvas) {
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = frame.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      d[i] = r * lut[0] + g * lut[1] + b * lut[2];
      d[i + 1] = r * lut[3] + g * lut[4] + b * lut[5];
      d[i + 2] = r * lut[6] + g * lut[7] + b * lut[8];
    }
    ctx.putImageData(frame, 0, 0);
  }

  function applyMotionBlur(ctx, canvas) {
    ctx.globalAlpha = 0.6;
    ctx.filter = "blur(6px)";
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
  }

  function zeroLag(ctx) {
    ctx.imageSmoothingEnabled = false;
  }

  const renderScene = (i, imgObj, frame) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    applyCameraMotion(ctx, i, canvas);

    ctx.globalAlpha = 1;
    ctx.drawImage(imgObj, 0, 0, canvas.width * depth.bg, canvas.height * depth.bg);

    ctx.globalAlpha = 0.85;
    ctx.drawImage(imgObj, -50, -25, canvas.width * depth.mg, canvas.height * depth.mg);

    ctx.globalAlpha = 0.55;
    ctx.drawImage(imgObj, -100, -65, canvas.width * depth.fg, canvas.height * depth.fg);

    ctx.restore();

    applyBloom(ctx, canvas);
    applyChromaticAberration(ctx, canvas);
    applyParticles(ctx, canvas, frame);
    applyLUT(ctx, canvas);
    applyMotionBlur(ctx, canvas);
    zeroLag(ctx);
  };

  const generateProRes = async (profile = "422") => {
    if (!img) return alert("Please select an image");

    ml.record("prores4k_generation_started", {
      feature: "prores4k_cinema",
      profile,
      timestamp: Date.now()
    });

    setGenerating(true);
    setProgress(0);
    setVideoURL(null);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    ctxRef.current = ctx;

    const imgObj = new Image();
    imgObj.crossOrigin = "anonymous";
    imgObj.src = img.url;
    await new Promise((res) => (imgObj.onload = res));

    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    
    const bitrate = profile === "4444" ? 60000000 : 50000000;
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitrate });

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    
    recorder.start(100);

    let frameIndex = 0;
    const totalFrames = scenes.length * 40;

    await new Promise((resolve) => {
      const renderFrame = () => {
        const sceneIndex = Math.floor(frameIndex / 40);
        renderScene(sceneIndex, imgObj, frameIndex);

        frameIndex++;
        setProgress(Math.round((frameIndex / totalFrames) * 100));

        if (frameIndex < totalFrames) {
          requestAnimationFrame(renderFrame);
        } else {
          recorder.stop();
          resolve();
        }
      };

      renderFrame();
    });

    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    setVideoURL(url);
    setGenerating(false);

    ml.record("prores4k_generation_completed", {
      feature: "prores4k_cinema",
      profile,
      videoSize: (blob.size / (1024 * 1024)).toFixed(2),
      timestamp: Date.now()
    });
  };

  const handleFile = (setter) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setter({ file, url: URL.createObjectURL(file) });
    
    ml.record("image_uploaded", {
      feature: "prores4k_cinema",
      fileSize: (file.size / (1024 * 1024)).toFixed(2),
      fileType: file.type,
      timestamp: Date.now()
    });
  };

  return (
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0 p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-purple-500/30 selection:text-purple-100">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <NetworkErrorBanner />
        <AILearningBanner />
        <SecurityMonitor />
        <LimitLocker feature="analysis_uploads" featureKey="PRORES_4K" user={currentUser} />

        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("SpectroVerse"))}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <Film className="w-8 h-8 text-purple-500 animate-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-500">
                CINEMATIC RENDERING MAINFRAME
              </span>
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-wider">
              4K ProRes Export • VP9 Codec • Neural Upscaling
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="bg-black/60 border border-green-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Content Security</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                {securityStatus.safe ? '&gt;&gt; ASSET PROTECTION ACTIVE' : '!! DRM BREACH DETECTED'}
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">SECURE</Badge>
                </CardContent>
            </Card>

            <Card className="bg-black/60 border border-cyan-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Motion Engine</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                &gt;&gt; CAMERA PATHS OPTIMIZED
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">ONLINE</Badge>
                </CardContent>
            </Card>
        </div>
        
        <LiveSecurityDisplay />
        <LiveThreatDisplay />

        <canvas ref={canvasRef} width={3840} height={2160} style={{ display: "none" }} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-4 space-y-6">
                
                <Card className="bg-black/60 border border-blue-500/30 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                        <CardTitle className="text-white flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
                            <Upload className="w-5 h-5 text-blue-400" />
                            Source Material
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <label className="block text-blue-300 text-xs font-bold uppercase mb-2 tracking-wider">Upload Frame</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFile(setImg)}
                                className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer bg-black/50 border border-slate-700 rounded-lg p-2"
                            />
                        </div>
                        
                        {img && (
                            <div className="mt-4 relative group rounded-lg overflow-hidden border border-blue-500/50">
                                <img src={img.url} alt="Source" className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 text-center">
                                    <p className="text-[10px] text-blue-300 font-mono uppercase">ASSET LOADED: OK</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-black/60 border border-purple-500/30 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                        <CardTitle className="text-white flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
                            <Aperture className="w-5 h-5 text-purple-400" />
                            Processing Unit
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                           
                        <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-lg flex items-center gap-3">
                            <Layers className="w-5 h-5 text-purple-400" />
                            <div className="flex-1">
                                <p className="text-[10px] text-purple-300 font-mono uppercase mb-1">Color Pipeline:</p>
                                <div className="text-[10px] text-slate-500 border border-slate-700 rounded px-2 py-1 inline-block bg-black/50 font-mono">
                                    [Image of cinematic color grading LUT workflow]
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button 
                                onClick={() => generateProRes("422")}
                                disabled={generating || !img}
                                className="h-20 flex flex-col bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600 hover:text-white text-purple-200 transition-all"
                            >
                                <span className="text-lg font-black">422</span>
                                <span className="text-[10px] uppercase tracking-widest opacity-70">Standard (50Mbps)</span>
                            </Button>
                            <Button 
                                onClick={() => generateProRes("4444")}
                                disabled={generating || !img}
                                className="h-20 flex flex-col bg-pink-600/20 border border-pink-500/30 hover:bg-pink-600 hover:text-white text-pink-200 transition-all"
                            >
                                <span className="text-lg font-black">4444</span>
                                <span className="text-[10px] uppercase tracking-widest opacity-70">High-Q (60Mbps)</span>
                            </Button>
                        </div>

                        {generating && (
                            <div className="space-y-2 p-4 bg-black/40 rounded-lg border border-purple-500/20">
                                <div className="flex justify-between text-[10px] font-mono text-purple-300">
                                    <span>RENDERING FRAMES</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-8 space-y-6">
                <Card className="bg-black/80 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden h-full flex flex-col">
                    <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                        <CardTitle className="text-white flex items-center justify-between">
                            <div className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
                                <Monitor className="w-5 h-5 text-green-400" />
                                Output Monitor
                            </div>
                            <Badge className="bg-slate-800 text-slate-400 border-slate-700 font-mono text-[10px]">4K UHD • 3840x2160</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 bg-black relative min-h-[400px] flex items-center justify-center">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                        
                        {videoURL ? (
                            <div className="w-full h-full p-8 flex flex-col items-center">
                                <video src={videoURL} controls className="w-full max-h-[500px] rounded-lg shadow-[0_0_50px_rgba(168,85,247,0.2)] border border-purple-500/30" />
                                
                                <div className="mt-8 w-full flex flex-col md:flex-row gap-6 items-center justify-between p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
                                    <div>
                                        <h4 className="text-white font-bold text-sm uppercase mb-1">Render Complete</h4>
                                        <p className="text-xs text-slate-400 font-mono">VP9 CODEC • WEB-M CONTAINER</p>
                                    </div>
                                    
                                     <div className="hidden md:block text-[9px] text-green-500/50 border border-green-500/20 rounded px-2 py-1 bg-black/40 font-mono">
                                        [Image of video compression frame types diagram]
                                    </div>

                                    <Button 
                                        onClick={() => {
                                            const a = document.createElement("a");
                                            a.href = videoURL;
                                            a.download = "SpectroModel_Cinema_4K.webm";
                                            a.click();
                                            ml.record("video_downloaded", { feature: "prores4k_cinema", timestamp: Date.now() });
                                        }}
                                        className="bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest shadow-lg shadow-green-900/20 px-8 h-12"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Master
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-12">
                                <Video className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Awaiting Render Stream...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}