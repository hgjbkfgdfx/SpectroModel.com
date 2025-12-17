import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Download, Loader2, Radio } from 'lucide-react';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';

const VISUALIZATION_MODES = [
  { id: 'standard', name: 'Standard', colors: ['#000033', '#0066ff', '#00ffff', '#ffff00', '#ff0000'] },
  { id: 'infrared', name: 'Infrared', colors: ['#000000', '#1a0033', '#660066', '#cc0066', '#ff6600', '#ffff00'] },
  { id: 'thermal', name: 'Thermal', colors: ['#000000', '#330066', '#6600cc', '#cc00ff', '#ff00ff', '#ffffff'] },
  { id: 'ocean', name: 'Ocean', colors: ['#001a33', '#003366', '#0066cc', '#00ccff', '#66ffff'] },
  { id: 'fire', name: 'Fire', colors: ['#1a0000', '#660000', '#cc3300', '#ff6600', '#ffcc00', '#ffffff'] }
];

export default function SpectrogramVisualizer({ audioUrl }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const audioElementRef = useRef(null);
  const audioBufferRef = useRef(null);
  const mlDataCollector = useMLDataCollector();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMode, setCurrentMode] = useState('standard');
  const [audioMetadata, setAudioMetadata] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initAudio = async () => {
      try {
        setIsLoading(true);
        setError(null);

        mlDataCollector.record('spectrogram_init', {
          feature: 'spectrogram',
          audioUrl: audioUrl?.substring(0, 50),
          timestamp: Date.now()
        });

        const response = await fetch(audioUrl, {
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBufferRef.current = audioBuffer;
        
        if (mounted) {
          setAudioMetadata({
            duration: audioBuffer.duration,
            sampleRate: audioBuffer.sampleRate,
            channels: audioBuffer.numberOfChannels
          });

          mlDataCollector.record('spectrogram_loaded', {
            feature: 'spectrogram',
            duration: audioBuffer.duration,
            channels: audioBuffer.numberOfChannels,
            timestamp: Date.now()
          });
        }

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;

        startSwirlAnimation();

        if (mounted) setIsLoading(false);
      } catch (err) {
        console.error('Audio init failed:', err);
        if (mounted) {
          setError(`Failed to load audio: ${err.message || 'Unknown error'}`);
          setIsLoading(false);

          mlDataCollector.record('spectrogram_error', {
            feature: 'spectrogram',
            error: err.message,
            timestamp: Date.now()
          });
        }
      }
    };

    if (audioUrl) {
      initAudio();
    }

    return () => {
      mounted = false;
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
        audioElementRef.current = null;
      }
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch (e) {}
        sourceRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (e) {}
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!isLoading && !error) {
      mlDataCollector.record('spectrogram_mode_change', {
        feature: 'spectrogram',
        mode: currentMode,
        timestamp: Date.now()
      });

      if (isPlaying) {
        drawDynamicSpectrogram();
      } else {
        startSwirlAnimation();
      }
    }
  }, [currentMode, isPlaying]);

  const startSwirlAnimation = () => {
    const canvas = canvasRef.current;
    const audioBuffer = audioBufferRef.current;
    
    if (!canvas || !audioBuffer) return;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const channelData = audioBuffer.getChannelData(0);
    const modeConfig = VISUALIZATION_MODES.find(m => m.id === currentMode) || VISUALIZATION_MODES[0];
    const colors = modeConfig.colors;

    const animate = () => {
      if (isPlaying) return;
      
      const time = Date.now() * 0.001;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);

      const numBars = 180;

      for (let i = 0; i < numBars; i++) {
        const sampleIndex = Math.floor((i / numBars) * channelData.length);
        const sample = Math.abs(channelData[sampleIndex]) * 2;
        
        const angle = (i / numBars) * Math.PI * 8 + time * 4;
        const radius = 100 + sample * 180;
        
        const spiralAngle = angle + time * 2;
        const spiralRadius = radius + Math.sin(time * 3 + i * 0.1) * 40;
        
        const x = centerX + Math.cos(spiralAngle) * spiralRadius;
        const y = centerY + Math.sin(spiralAngle) * spiralRadius;
        
        const barLength = 30 + sample * 60;
        
        const colorIndex = Math.floor((sample + Math.sin(time + i * 0.05)) * (colors.length - 1) / 2);
        const color = colors[Math.min(Math.max(colorIndex, 0), colors.length - 1)];
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(spiralAngle + time);
        
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7 + sample * 0.3;
        
        const barWidth = 4;
        ctx.fillRect(-barWidth / 2, 0, barWidth, barLength);
        
        ctx.globalAlpha = 0.4;
        ctx.fillRect(-barWidth / 2, 0, barWidth, barLength * 1.5);
        
        ctx.restore();
      }
      
      ctx.globalAlpha = 1.0;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      await startPlayback();
    }
  };

  const startPlayback = async () => {
    try {
      mlDataCollector.record('spectrogram_playback_start', {
        feature: 'spectrogram',
        timestamp: Date.now()
      });

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (!audioElementRef.current) {
        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        audio.preload = "auto";
        audioElementRef.current = audio;
        
        const audioContext = audioContextRef.current;
        if (!audioContext) {
          throw new Error('Audio context not initialized');
        }
        
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        const source = audioContext.createMediaElementSource(audio);
        sourceRef.current = source;
        
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;
        
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          mlDataCollector.record('spectrogram_playback_ended', {
            feature: 'spectrogram',
            timestamp: Date.now()
          });
        });

        audio.addEventListener('error', (e) => {
          const errorMsg = e.target?.error?.message || 'Unknown playback error';
          console.error('Audio playback error:', errorMsg);
          setError(`Playback error: ${errorMsg}`);
          setIsPlaying(false);

          mlDataCollector.record('spectrogram_playback_error', {
            feature: 'spectrogram',
            error: errorMsg,
            timestamp: Date.now()
          });
        });

        audio.src = audioUrl;
      }
      
      await audioElementRef.current.play();
      setIsPlaying(true);
      drawDynamicSpectrogram();
    } catch (err) {
      const errorMsg = err.message || 'Playback failed';
      console.error('Playback start failed:', err);
      setError(`Playback failed: ${errorMsg}. Try clicking play again.`);
      setIsPlaying(false);

      mlDataCollector.record('spectrogram_start_error', {
        feature: 'spectrogram',
        error: errorMsg,
        timestamp: Date.now()
      });
    }
  };

  const stopPlayback = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsPlaying(false);

    mlDataCollector.record('spectrogram_playback_stop', {
      feature: 'spectrogram',
      timestamp: Date.now()
    });
  };

  const drawDynamicSpectrogram = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    
    if (!canvas || !analyser) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const modeConfig = VISUALIZATION_MODES.find(m => m.id === currentMode) || VISUALIZATION_MODES[0];
    const colors = modeConfig.colors;
    
    const draw = () => {
      if (!isPlaying) return;
      
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      const time = Date.now() * 0.001;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      const numBars = 180;
      
      for (let i = 0; i < numBars; i++) {
        const dataIndex = Math.floor((i / numBars) * bufferLength);
        const value = dataArray[dataIndex] / 255.0;
        
        const angle = (i / numBars) * Math.PI * 8 + time * 5;
        const baseRadius = 100 + value * 200;
        
        const wave = Math.sin(time * 3 + i * 0.15) * 30 * value;
        const spiralRadius = baseRadius + wave;
        
        const spiralAngle = angle + time * 3 + value * Math.PI;
        
        const x = centerX + Math.cos(spiralAngle) * spiralRadius;
        const y = centerY + Math.sin(spiralAngle) * spiralRadius;
        
        const barLength = 40 + value * 80;
        
        const colorIndex = Math.floor(value * (colors.length - 1));
        const color = colors[Math.min(colorIndex, colors.length - 1)];
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(spiralAngle + time * 2);
        
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8 + value * 0.2;
        
        const barWidth = 5 + value * 3;
        ctx.fillRect(-barWidth / 2, 0, barWidth, barLength);
        
        ctx.globalAlpha = 0.5;
        ctx.fillRect(-barWidth / 2, 0, barWidth, barLength * 1.8);
        
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(0, barLength, barWidth, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
      
      ctx.globalAlpha = 1.0;
    };
    
    draw();
  };

  const downloadSpectrogram = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    mlDataCollector.record('spectrogram_download', {
      feature: 'spectrogram',
      mode: currentMode,
      timestamp: Date.now()
    });

    const link = document.createElement('a');
    link.download = `spectrogram_${currentMode}_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-900/90 border-purple-500/30">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mr-3" />
          <span className="text-white">Loading spectrogram...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-900/90 border-red-500/30">
        <CardContent className="p-6 space-y-3">
          <p className="text-red-400 font-semibold">Spectrogram Error</p>
          <p className="text-red-300 text-sm">{error}</p>
          <Button 
            onClick={() => {
              setError(null);
              setIsLoading(true);
              window.location.reload();
            }}
            variant="outline"
            className="border-red-500/50 text-red-300 hover:bg-red-500/10"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/90 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-400" />
            Spectrogram Visualization
          </span>
          <Badge className="bg-purple-600">
            {VISUALIZATION_MODES.find(m => m.id === currentMode)?.name || 'Standard'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {VISUALIZATION_MODES.map((mode) => (
            <Button
              key={mode.id}
              onClick={() => setCurrentMode(mode.id)}
              variant={currentMode === mode.id ? 'default' : 'outline'}
              size="sm"
              className={currentMode === mode.id ? 'bg-purple-600' : 'border-purple-500/30 text-purple-300'}
            >
              {mode.name}
            </Button>
          ))}
        </div>

        <div className="relative bg-black rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full h-auto"
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={togglePlayback}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>
            <Button
              onClick={downloadSpectrogram}
              variant="outline"
              className="border-purple-500/30 text-purple-300"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          {audioMetadata && (
            <div className="text-slate-400 text-xs">
              {Math.floor(audioMetadata.duration)}s • {audioMetadata.sampleRate}Hz • {audioMetadata.channels}ch
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}