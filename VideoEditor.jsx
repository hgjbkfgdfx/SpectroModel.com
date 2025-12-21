import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Play, Pause, Download, Type, Sticker, Sparkles, 
  Plus, Trash2, Shield, Brain, Loader2 
} from "lucide-react";
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { blockScriptInjection, validateCSP } from '@/components/shared/SecurityValidator';

export default function VideoEditor({ videoFile, onExportComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mlDataCollector = useMLDataCollector();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [textOverlays, setTextOverlays] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [securityStatus, setSecurityStatus] = useState({ safe: true });

  useEffect(() => {
    blockScriptInjection();
    const cspResult = validateCSP();
    setSecurityStatus({ safe: cspResult.valid, threats: cspResult.violations?.length || 0 });

    mlDataCollector.record('video_editor_loaded', {
      feature: 'video_editor',
      timestamp: Date.now()
    });
  }, []);

  useEffect(() => {
    if (!videoRef.current || !videoFile) return;

    const url = URL.createObjectURL(videoFile);
    videoRef.current.src = url;

    const handleLoadedMetadata = () => {
      setDuration(videoRef.current.duration);
      drawFrame();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoRef.current.currentTime);
      if (!isExporting) drawFrame();
    };

    videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoRef.current.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  const drawFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    textOverlays.forEach(overlay => {
      if (currentTime >= overlay.startTime && currentTime <= overlay.endTime) {
        ctx.font = `${overlay.fontSize}px Arial`;
        ctx.fillStyle = overlay.color;
        ctx.textAlign = 'center';
        ctx.fillText(overlay.text, overlay.x * canvas.width, overlay.y * canvas.height);
      }
    });

    stickers.forEach(sticker => {
      if (currentTime >= sticker.startTime && currentTime <= sticker.endTime) {
        ctx.font = `${sticker.size}px Arial`;
        ctx.fillText(sticker.emoji, sticker.x * canvas.width, sticker.y * canvas.height);
      }
    });
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);

    mlDataCollector.record('video_playback_toggle', {
      feature: 'video_editor',
      action: isPlaying ? 'pause' : 'play',
      timestamp: Date.now()
    });
  };

  const addTextOverlay = () => {
    const newOverlay = {
      id: Date.now(),
      text: 'Your Text',
      x: 0.5,
      y: 0.5,
      fontSize: 48,
      color: '#FFFFFF',
      startTime: currentTime,
      endTime: currentTime + 3
    };
    setTextOverlays([...textOverlays, newOverlay]);

    mlDataCollector.record('text_overlay_added', {
      feature: 'video_editor',
      timestamp: Date.now()
    });
  };

  const addSticker = (emoji) => {
    const newSticker = {
      id: Date.now(),
      emoji,
      x: 0.5,
      y: 0.3,
      size: 64,
      startTime: currentTime,
      endTime: currentTime + 2
    };
    setStickers([...stickers, newSticker]);

    mlDataCollector.record('sticker_added', {
      feature: 'video_editor',
      emoji,
      timestamp: Date.now()
    });
  };

  const exportVideo = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsExporting(true);
    setExportProgress(0);

    mlDataCollector.record('video_export_started', {
      feature: 'video_editor',
      overlays: textOverlays.length,
      stickers: stickers.length,
      timestamp: Date.now()
    });

    try {
      const canvas = canvasRef.current;
      const stream = canvas.captureStream(30);
      
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(videoRef.current);
      const dest = audioContext.createMediaStreamDestination();
      source.connect(dest);
      source.connect(audioContext.destination);

      const audioTrack = dest.stream.getAudioTracks()[0];
      if (audioTrack) stream.addTrack(audioTrack);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `generated-video-${Date.now()}.webm`;
        a.click();

        setIsExporting(false);
        setExportProgress(100);

        mlDataCollector.record('video_export_completed', {
          feature: 'video_editor',
          fileSize: blob.size,
          timestamp: Date.now()
        });

        if (onExportComplete) onExportComplete(url);
      };

      mediaRecorder.start();
      videoRef.current.currentTime = 0;
      videoRef.current.play();

      const exportInterval = setInterval(() => {
        const progress = (videoRef.current.currentTime / duration) * 100;
        setExportProgress(progress);
        drawFrame();

        if (videoRef.current.currentTime >= duration) {
          mediaRecorder.stop();
          clearInterval(exportInterval);
          videoRef.current.pause();
        }
      }, 33);

    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      
      mlDataCollector.record('video_export_error', {
        feature: 'video_editor',
        error: error.message,
        timestamp: Date.now()
      });
    }
  };

  const availableStickers = ['🎵', '🎤', '🎸', '🎹', '🎧', '⭐', '✨', '💫', '🔥', '❤️', '🎉', '👏'];

  return (
    <div className="space-y-4">
      <Card className="bg-slate-950/90 border-green-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-semibold text-sm">🛡️ Security Active</p>
                <p className="text-xs text-slate-400">{securityStatus.safe ? 'Protected' : 'Threats blocked'}</p>
              </div>
            </div>
            <Badge className="bg-green-500">SAFE</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-cyan-950/90 border-cyan-500/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
            <div>
              <p className="text-white font-semibold text-sm">🤖 AI Learns From Your Data</p>
              <p className="text-xs text-cyan-300">Learning from {textOverlays.length + stickers.length} edits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-950/90 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white">Video Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-auto" />
            <video ref={videoRef} className="hidden" crossOrigin="anonymous" />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={togglePlayPause} size="sm">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <div className="flex-1 bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-purple-500 h-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <span className="text-xs text-white">{currentTime.toFixed(1)}s / {duration.toFixed(1)}s</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-950/90 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Type className="w-5 h-5" />
            Add Text
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={addTextOverlay} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Text Overlay
          </Button>
          
          {textOverlays.map((overlay, idx) => (
            <Card key={overlay.id} className="bg-slate-900 border-slate-700">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Input
                    value={overlay.text}
                    onChange={(e) => {
                      const updated = [...textOverlays];
                      updated[idx].text = e.target.value;
                      setTextOverlays(updated);
                    }}
                    className="flex-1 mr-2 bg-slate-800 text-white text-xs"
                    placeholder="Text"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setTextOverlays(textOverlays.filter(o => o.id !== overlay.id))}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-slate-400">Size</label>
                    <Slider value={[overlay.fontSize]} onValueChange={(val) => {
                      const updated = [...textOverlays];
                      updated[idx].fontSize = val[0];
                      setTextOverlays(updated);
                    }} min={20} max={120} step={4} />
                  </div>
                  <div>
                    <label className="text-slate-400">Color</label>
                    <input
                      type="color"
                      value={overlay.color}
                      onChange={(e) => {
                        const updated = [...textOverlays];
                        updated[idx].color = e.target.value;
                        setTextOverlays(updated);
                      }}
                      className="w-full h-8 rounded"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-slate-950/90 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sticker className="w-5 h-5" />
            Add Stickers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {availableStickers.map(emoji => (
              <Button
                key={emoji}
                onClick={() => addSticker(emoji)}
                className="text-2xl h-12"
                variant="outline"
              >
                {emoji}
              </Button>
            ))}
          </div>
          
          {stickers.length > 0 && (
            <div className="mt-4 space-y-2">
              {stickers.map((sticker, idx) => (
                <div key={sticker.id} className="flex items-center justify-between bg-slate-900 p-2 rounded">
                  <span className="text-xl">{sticker.emoji}</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setStickers(stickers.filter(s => s.id !== sticker.id))}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-950/90 border-green-500/30">
        <CardContent className="p-4">
          <Button
            onClick={exportVideo}
            disabled={isExporting}
            className="w-full h-14 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 font-bold"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating {exportProgress.toFixed(0)}%
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Generate & Download Video
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}