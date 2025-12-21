import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, Brain, Zap, CheckCircle, Download, Play, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { zeroIterationMastering } from "@/components/shared/ZeroIterationMastering";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";

export default function MasteringInterface({ audioFile, user, onProcessComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0); // Not real progress since logic is one-shot promise, but we can fake it or just show processing
  const [result, setResult] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [error, setError] = useState(null);
  const audioElemRef = useRef(null);
  
  const mlDataCollector = useMLDataCollector();
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0 });

  useEffect(() => {
    try {
      blockScriptInjection();
      const cspResult = validateCSP();
      setSecurityStatus({
        safe: cspResult.valid,
        threats: cspResult.violations?.length || 0
      });
      
      mlDataCollector.record('mastering_interface_visit', {
        feature: 'zero_iteration_mastering',
        timestamp: Date.now()
      });
    } catch (e) {
      console.error("Security init error", e);
    }
    
    return () => {
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, []);

  const runMastering = async () => {
    if (!audioFile) return;
    
    setIsProcessing(true);
    setError(null);
    setResult(null);
    
    mlDataCollector.record('mastering_started', {
        feature: 'zero_iteration_mastering',
        fileSize: audioFile.size,
        timestamp: Date.now()
    });

    try {
      // Fake progress for UX since the function is atomic
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      const masteringResult = await zeroIterationMastering(audioFile);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Create URL for the result buffer
      const wavBlob = audioBufferToWav(masteringResult.audioBuffer);
      const url = URL.createObjectURL(wavBlob);
      
      setProcessedUrl(url);
      setResult(masteringResult);
      
      if (onProcessComplete) {
        onProcessComplete(url);
      }
      
      mlDataCollector.record('mastering_completed', {
          feature: 'zero_iteration_mastering',
          applied: masteringResult.report.processesApplied.length,
          skipped: masteringResult.report.processesSkipped.length,
          timestamp: Date.now()
      });
      
    } catch (err) {
      console.error("Mastering failed", err);
      setError(err.message);
      mlDataCollector.record('mastering_failed', {
          feature: 'zero_iteration_mastering',
          error: err.message,
          timestamp: Date.now()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to convert buffer to WAV for playback/download
  const audioBufferToWav = (buffer) => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const bytesPerSample = 4; // 32-bit float
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 3, true); // IEEE Float
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 32, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        view.setFloat32(offset, buffer.getChannelData(ch)[i], true);
        offset += 4;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  return (
    <div className="space-y-6">
        {/* Security & AI Banner */}
        <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-slate-950/90 border-green-500/30">
                <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="text-white font-semibold text-sm">🛡️ Security Active</p>
                            <p className="text-xs text-slate-400">Protected</p>
                        </div>
                    </div>
                    <Badge className="bg-green-500">SAFE</Badge>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border-cyan-500/40">
                <CardContent className="p-4 flex items-center gap-3">
                    <Brain className="w-6 h-6 text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-white font-semibold text-sm">🤖 AI Learning</p>
                        <p className="text-xs text-cyan-300 truncate">Optimizing mastering chain</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        <Card className="bg-slate-900/90 border-purple-500/30">
            <CardContent className="p-6 space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                        <Zap className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Zero-Iteration Mastering</h3>
                    <p className="text-slate-400 text-sm max-w-md mx-auto">
                        Our AI engine analyzes your track and applies the perfect chain in one pass. 
                        No presets, no tweaking needed. 32-bit float precision.
                    </p>
                </div>

                {!audioFile && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
                        <p className="text-sm text-yellow-200">Please upload an audio file in the studio header to begin.</p>
                    </div>
                )}

                {audioFile && !processedUrl && (
                    <Button 
                        onClick={runMastering} 
                        disabled={isProcessing}
                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                        {isProcessing ? "Analyzing & Mastering..." : "⚡ Master Track Now"}
                    </Button>
                )}

                {isProcessing && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Processing...</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-200 text-sm">
                        Error: {error}
                    </div>
                )}

                {processedUrl && result && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <h4 className="font-bold text-green-300">Mastering Complete</h4>
                            </div>
                            <p className="text-sm text-green-200 mb-4">{result.message}</p>
                            
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="bg-slate-950/50 p-3 rounded">
                                    <span className="text-slate-400 block mb-1">Input LUFS</span>
                                    <span className="text-white font-mono">{result.report.inputAnalysis.currentLUFS?.toFixed(1)} dB</span>
                                </div>
                                <div className="bg-slate-950/50 p-3 rounded">
                                    <span className="text-slate-400 block mb-1">Output LUFS</span>
                                    <span className="text-green-400 font-mono font-bold">{result.report.outputAnalysis?.finalLUFS?.toFixed(1)} dB</span>
                                </div>
                            </div>

                            <div className="mt-4 space-y-1">
                                <p className="text-xs font-semibold text-slate-400 uppercase">Processing Chain Applied:</p>
                                {result.report.processesApplied.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic">No processing needed (Audio was already optimal)</p>
                                ) : (
                                    <ul className="text-xs text-green-300/80 space-y-1">
                                        {result.report.processesApplied.map((p, i) => (
                                            <li key={i}>• {p.type}: {p.details}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={() => {
                                if(audioElemRef.current) {
                                    audioElemRef.current.src = processedUrl;
                                    audioElemRef.current.play();
                                }
                            }} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                                <Play className="w-4 h-4 mr-2" /> Play Master
                            </Button>
                            <a href={processedUrl} download="mastered_track_32bit.wav" className="flex-1">
                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                    <Download className="w-4 h-4 mr-2" /> Download WAV
                                </Button>
                            </a>
                        </div>
                        
                        <audio ref={audioElemRef} controls className="w-full" />
                        
                        <Button variant="ghost" size="sm" onClick={() => {
                            setProcessedUrl(null);
                            setResult(null);
                        }} className="w-full text-slate-500">
                            Reset / Master Another
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}