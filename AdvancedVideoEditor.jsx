import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, Pause, Download, Type, Image as ImageIcon, Sparkles, 
  Plus, Trash2, Shield, Brain, Loader2, Palette, Layout, Eye
} from "lucide-react";
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { blockScriptInjection, validateCSP } from '@/components/shared/SecurityValidator';
import { base44 } from '@/api/base44Client';

const FONTS = ['Arial', 'Bungee Inline', 'Oswald', 'Impact', 'Courier New', 'Georgia', 'Verdana'];
const CYBERPUNK_ELEMENTS = ['⚔️', '💀', '⚡', '🔥', '✨', '🌟', '💎', '🎯', '🎮', '🚀', '🏴‍☠️', '👾', '🤖', '🔮', '💫'];
const NEON_COLORS = ['#FF00FF', '#00FFFF', '#FF0080', '#8000FF', '#00FF80', '#FFFF00', '#FF0000', '#00FF00'];

export default function AdvancedVideoEditor({ videoFile, onExportComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const timelineRef = useRef(null);
  const mlDataCollector = useMLDataCollector();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [textElements, setTextElements] = useState([]);
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [securityStatus, setSecurityStatus] = useState({ safe: true });
  const [backgroundColor, setBackgroundColor] = useState('#8B00FF');
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {
    blockScriptInjection();
    const cspResult = validateCSP();
    setSecurityStatus({ safe: cspResult.valid, threats: cspResult.violations?.length || 0 });

    mlDataCollector.record('advanced_video_editor_loaded', {
      feature: 'advanced_video_editor',
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

    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    textElements.forEach(text => {
      if (currentTime >= text.startTime && currentTime <= text.endTime) {
        ctx.font = `${text.bold ? 'bold' : ''} ${text.fontSize}px ${text.font}`;
        ctx.textAlign = text.align || 'center';
        
        const x = text.x * canvas.width;
        const y = text.y * canvas.height;

        if (text.background) {
          ctx.fillStyle = text.backgroundColor || 'rgba(0,0,0,0.5)';
          const metrics = ctx.measureText(text.text);
          const padding = 20;
          ctx.fillRect(
            x - metrics.width / 2 - padding,
            y - text.fontSize - padding / 2,
            metrics.width + padding * 2,
            text.fontSize + padding
          );
        }

        if (text.outline) {
          ctx.strokeStyle = text.outlineColor || '#000000';
          ctx.lineWidth = text.outlineWidth || 4;
          ctx.strokeText(text.text, x, y);
        }

        ctx.fillStyle = text.color;
        ctx.fillText(text.text, x, y);
      }
    });

    elements.forEach(elem => {
      if (currentTime >= elem.startTime && currentTime <= elem.endTime) {
        ctx.font = `${elem.size}px Arial`;
        ctx.fillText(elem.content, elem.x * canvas.width, elem.y * canvas.height);
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
      feature: 'advanced_video_editor',
      action: isPlaying ? 'pause' : 'play',
      timestamp: Date.now()
    });
  };

  const addTitle = () => {
    const newText = {
      id: Date.now(),
      type: 'title',
      text: 'ARTIST NAME - SONG TITLE',
      x: 0.5,
      y: 0.15,
      fontSize: 72,
      font: 'Bungee Inline',
      color: '#FFFFFF',
      bold: true,
      outline: true,
      outlineColor: '#000000',
      outlineWidth: 4,
      background: false,
      backgroundColor: 'rgba(0,0,0,0.5)',
      align: 'center',
      startTime: 0,
      endTime: duration
    };
    setTextElements([...textElements, newText]);

    mlDataCollector.record('title_added', {
      feature: 'advanced_video_editor',
      timestamp: Date.now()
    });
  };

  const addVerse = () => {
    const newText = {
      id: Date.now(),
      type: 'verse',
      text: 'Your verse lyrics here',
      x: 0.5,
      y: 0.5,
      fontSize: 48,
      font: 'Oswald',
      color: '#FFFFFF',
      bold: false,
      outline: true,
      outlineColor: '#000000',
      outlineWidth: 3,
      background: true,
      backgroundColor: 'rgba(0,0,0,0.5)',
      align: 'center',
      startTime: currentTime,
      endTime: currentTime + 3
    };
    setTextElements([...textElements, newText]);

    mlDataCollector.record('verse_added', {
      feature: 'advanced_video_editor',
      timestamp: Date.now()
    });
  };

  const addChorus = () => {
    const newText = {
      id: Date.now(),
      type: 'chorus',
      text: 'Chorus lyrics - 2 bars',
      x: 0.5,
      y: 0.5,
      fontSize: 48,
      font: 'Oswald',
      color: '#FF00FF',
      bold: true,
      outline: true,
      outlineColor: '#000000',
      outlineWidth: 4,
      background: true,
      backgroundColor: 'rgba(0,0,0,0.6)',
      align: 'center',
      startTime: currentTime,
      endTime: currentTime + 4
    };
    setTextElements([...textElements, newText]);

    mlDataCollector.record('chorus_added', {
      feature: 'advanced_video_editor',
      timestamp: Date.now()
    });
  };

  const addElement = (content) => {
    const newElement = {
      id: Date.now(),
      content,
      x: 0.2 + Math.random() * 0.6,
      y: 0.2 + Math.random() * 0.6,
      size: 64,
      startTime: currentTime,
      endTime: duration
    };
    setElements([...elements, newElement]);

    mlDataCollector.record('element_added', {
      feature: 'advanced_video_editor',
      element: content,
      timestamp: Date.now()
    });
  };

  const duplicateElement = (element) => {
    const duplicate = {
      ...element,
      id: Date.now(),
      x: element.x + 0.1,
      y: element.y + 0.1
    };
    if (element.type) {
      setTextElements([...textElements, duplicate]);
    } else {
      setElements([...elements, duplicate]);
    }

    mlDataCollector.record('element_duplicated', {
      feature: 'advanced_video_editor',
      timestamp: Date.now()
    });
  };

  const uploadBackgroundImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setBackgroundImage(img);
        drawFrame();
      };
      img.src = file_url;

      mlDataCollector.record('background_uploaded', {
        feature: 'advanced_video_editor',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Background upload failed:', error);
    }
  };

  const exportVideo = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsExporting(true);
    setExportProgress(0);

    mlDataCollector.record('video_export_started', {
      feature: 'advanced_video_editor',
      textElements: textElements.length,
      elements: elements.length,
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
        videoBitsPerSecond: 8000000
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
        a.download = `spectro-lyric-video-${Date.now()}.webm`;
        a.click();

        setIsExporting(false);
        setExportProgress(100);

        mlDataCollector.record('video_export_completed', {
          feature: 'advanced_video_editor',
          fileSize: (blob.size / (1024 * 1024)).toFixed(2),
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
        feature: 'advanced_video_editor',
        error: error.message,
        timestamp: Date.now()
      });
    }
  };

  const seekTo = (time) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    drawFrame();
  };

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
              <p className="text-xs text-cyan-300">Learning from {textElements.length + elements.length} edits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-950/90 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white">Video Canvas</CardTitle>
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
            <div 
              ref={timelineRef}
              className="flex-1 bg-slate-700 h-10 rounded-lg overflow-hidden relative cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = x / rect.width;
                seekTo(percentage * duration);
              }}
            >
              <div 
                className="bg-purple-500 h-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
              {textElements.map(text => (
                <div
                  key={text.id}
                  className="absolute top-0 h-full bg-blue-500/50 border-l-2 border-r-2 border-blue-400"
                  style={{
                    left: `${(text.startTime / duration) * 100}%`,
                    width: `${((text.endTime - text.startTime) / duration) * 100}%`
                  }}
                />
              ))}
              {elements.map(elem => (
                <div
                  key={elem.id}
                  className="absolute top-0 h-full bg-green-500/50 border-l-2 border-r-2 border-green-400"
                  style={{
                    left: `${(elem.startTime / duration) * 100}%`,
                    width: `${((elem.endTime - elem.startTime) / duration) * 100}%`
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-white">{currentTime.toFixed(1)}s / {duration.toFixed(1)}s</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-slate-900">
          <TabsTrigger value="text" className="data-[state=active]:bg-purple-600">
            <Type className="w-4 h-4 mr-2" />
            Text
          </TabsTrigger>
          <TabsTrigger value="elements" className="data-[state=active]:bg-purple-600">
            <Sparkles className="w-4 h-4 mr-2" />
            Elements
          </TabsTrigger>
          <TabsTrigger value="background" className="data-[state=active]:bg-purple-600">
            <Palette className="w-4 h-4 mr-2" />
            Background
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-3 mt-4">
          <Card className="bg-slate-900/90 border-blue-500/30">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={addTitle} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Title (72px)
                </Button>
                <Button onClick={addVerse} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Verse (48px)
                </Button>
                <Button onClick={addChorus} className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Chorus (48px)
                </Button>
              </div>

              {textElements.map((text, idx) => (
                <Card key={text.id} className="bg-slate-950 border-slate-700">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={text.type === 'title' ? 'bg-purple-600' : text.type === 'chorus' ? 'bg-pink-600' : 'bg-blue-600'}>
                        {text.type}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => duplicateElement(text)}>
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setTextElements(textElements.filter(t => t.id !== text.id))}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <Input
                      value={text.text}
                      onChange={(e) => {
                        const updated = [...textElements];
                        updated[idx].text = e.target.value;
                        setTextElements(updated);
                      }}
                      className="bg-slate-800 text-white"
                      placeholder="Text"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400">Font</label>
                        <select
                          value={text.font}
                          onChange={(e) => {
                            const updated = [...textElements];
                            updated[idx].font = e.target.value;
                            setTextElements(updated);
                          }}
                          className="w-full bg-slate-800 text-white p-2 rounded text-xs"
                        >
                          {FONTS.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Size</label>
                        <Slider 
                          value={[text.fontSize]} 
                          onValueChange={(val) => {
                            const updated = [...textElements];
                            updated[idx].fontSize = val[0];
                            setTextElements(updated);
                          }} 
                          min={20} 
                          max={120} 
                          step={4} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400">Text Color</label>
                        <input
                          type="color"
                          value={text.color}
                          onChange={(e) => {
                            const updated = [...textElements];
                            updated[idx].color = e.target.value;
                            setTextElements(updated);
                          }}
                          className="w-full h-8 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Outline</label>
                        <input
                          type="color"
                          value={text.outlineColor}
                          onChange={(e) => {
                            const updated = [...textElements];
                            updated[idx].outlineColor = e.target.value;
                            setTextElements(updated);
                          }}
                          className="w-full h-8 rounded"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-2 text-white">
                        <input
                          type="checkbox"
                          checked={text.outline}
                          onChange={(e) => {
                            const updated = [...textElements];
                            updated[idx].outline = e.target.checked;
                            setTextElements(updated);
                          }}
                        />
                        Outline
                      </label>
                      <label className="flex items-center gap-2 text-white">
                        <input
                          type="checkbox"
                          checked={text.background}
                          onChange={(e) => {
                            const updated = [...textElements];
                            updated[idx].background = e.target.checked;
                            setTextElements(updated);
                          }}
                        />
                        Background
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-slate-400">Start Time (s)</label>
                        <Input
                          type="number"
                          value={text.startTime.toFixed(1)}
                          onChange={(e) => {
                            const updated = [...textElements];
                            updated[idx].startTime = parseFloat(e.target.value);
                            setTextElements(updated);
                          }}
                          step="0.1"
                          className="bg-slate-800 text-white h-8"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400">End Time (s)</label>
                        <Input
                          type="number"
                          value={text.endTime.toFixed(1)}
                          onChange={(e) => {
                            const updated = [...textElements];
                            updated[idx].endTime = parseFloat(e.target.value);
                            setTextElements(updated);
                          }}
                          step="0.1"
                          className="bg-slate-800 text-white h-8"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="elements" className="space-y-3 mt-4">
          <Card className="bg-slate-900/90 border-pink-500/30">
            <CardHeader>
              <CardTitle className="text-white text-sm">Cyberpunk Elements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2">
                {CYBERPUNK_ELEMENTS.map(elem => (
                  <Button
                    key={elem}
                    onClick={() => addElement(elem)}
                    className="text-3xl h-14"
                    variant="outline"
                  >
                    {elem}
                  </Button>
                ))}
              </div>
              
              {elements.length > 0 && (
                <div className="mt-4 space-y-2">
                  {elements.map((elem, idx) => (
                    <Card key={elem.id} className="bg-slate-950 border-slate-700">
                      <CardContent className="p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{elem.content}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => duplicateElement(elem)}>
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setElements(elements.filter(e => e.id !== elem.id))}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div>
                            <label className="text-slate-400">Start (s)</label>
                            <Input
                              type="number"
                              value={elem.startTime.toFixed(1)}
                              onChange={(e) => {
                                const updated = [...elements];
                                updated[idx].startTime = parseFloat(e.target.value);
                                setElements(updated);
                              }}
                              step="0.1"
                              className="bg-slate-800 text-white h-7"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400">End (s)</label>
                            <Input
                              type="number"
                              value={elem.endTime.toFixed(1)}
                              onChange={(e) => {
                                const updated = [...elements];
                                updated[idx].endTime = parseFloat(e.target.value);
                                setElements(updated);
                              }}
                              step="0.1"
                              className="bg-slate-800 text-white h-7"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="background" className="space-y-3 mt-4">
          <Card className="bg-slate-900/90 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white text-sm">Background Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-white mb-2 block">Background Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {NEON_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setBackgroundColor(color);
                        setBackgroundImage(null);
                        mlDataCollector.record('background_color_changed', {
                          feature: 'advanced_video_editor',
                          color,
                          timestamp: Date.now()
                        });
                      }}
                      className="h-12 rounded-lg border-2 border-white/20 hover:border-white/60 transition-all"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-white mb-2 block">Upload Background Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadBackgroundImage}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                />
                <p className="text-xs text-slate-400 mt-2">💡 Use NEON, CYBERPUNK, FUTURISTIC keywords when searching</p>
              </div>

              {backgroundImage && (
                <Button
                  onClick={() => {
                    setBackgroundImage(null);
                    setBackgroundColor('#8B00FF');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Remove Background Image
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                Generating Video {exportProgress.toFixed(0)}%
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

      <Card className="bg-purple-950/90 border-purple-500/30">
        <CardContent className="p-4">
          <h4 className="text-purple-300 font-semibold mb-2">✨ Pro Tips:</h4>
          <ul className="text-sm text-slate-300 space-y-1 ml-4 list-disc">
            <li>Title: 72px Bungee Inline with outline</li>
            <li>Verses: 48px Oswald, 2 bars at a time</li>
            <li>Always add text outline for visibility</li>
            <li>Use text background for better legibility</li>
            <li>Purple (#8B00FF) works well with cyberpunk themes</li>
            <li>Add elements at different times for anticipation</li>
            <li>Balance is key - don't overcrowd</li>
            <li>Color coordination = professional appeal</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}