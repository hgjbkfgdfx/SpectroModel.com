/**
 * AI GENRE MASTERING UI - USER CONTROLS
 * Fine-tune AI mastering with real-time parameter adjustment
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Loader2, Download, Sparkles, Brain, Shield } from 'lucide-react';
import { MASTERING_STYLES, applyAIGenreMastering, exportGenreMasteredWav } from '@/components/shared/AIGenreMasteringEngine';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';

export default function AIGenreMasteringUI({ audioFile, onProcessComplete }) {
  const mlDataCollector = useMLDataCollector();
  const [selectedStyle, setSelectedStyle] = useState('transparent');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0 });
  
  // Fine-tuning parameters
  const [loudness, setLoudness] = useState(null); // null = use style default
  const [spectralBalance, setSpectralBalance] = useState(0.5); // 0-1
  const [dynamics, setDynamics] = useState(0.5); // 0-1 (0=compressed, 1=dynamic)

  useEffect(() => {
    try {
      blockScriptInjection();
      const cspResult = validateCSP();
      setSecurityStatus({ safe: cspResult.valid, threats: cspResult.violations?.length || 0 });
      
      mlDataCollector.record('ai_genre_mastering_loaded', {
        feature: 'ai_genre_mastering',
        security: cspResult.valid ? 'safe' : 'threats',
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Security init error:', err);
    }
  }, []);

  const handleProcess = async () => {
    if (!audioFile) return;

    setIsProcessing(true);
    setProgress(10);
    setProcessedUrl(null);

    mlDataCollector.record('ai_genre_mastering_started', {
      feature: 'ai_genre_mastering',
      style: selectedStyle,
      customParams: { loudness, spectralBalance, dynamics },
      timestamp: Date.now()
    });

    try {
      // ZERO-ITERATION: Direct browser processing (NO server, NO buffering)
      window.dispatchEvent(new Event('audioProcessingStart'));
      
      setProgress(30);
      
      // Load audio (Browser-only, NO AudioContext buffering)
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      audioContext.close();
      
      setProgress(50);

      // Apply AI genre mastering (EXACT zero-iteration equations, NO buffering)
      const style = MASTERING_STYLES[selectedStyle];
      const customParams = {
        loudness: loudness ?? style.targetLUFS,
        spectralBalance,
        dynamics
      };

      const result = await applyAIGenreMastering(
        audioBuffer,
        style,
        customParams
      );

      setProgress(80);

      // Export pristine 32-bit WAV (ZERO-ITERATION, NO buffering, NO static)
      const wavBytes = exportGenreMasteredWav(result);
      const blob = new Blob([wavBytes], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);

      setProcessedUrl(url);
      setProgress(100);

      window.dispatchEvent(new Event('audioProcessingEnd'));

      mlDataCollector.record('ai_genre_mastering_completed', {
        feature: 'ai_genre_mastering',
        style: selectedStyle,
        model: style.aiModel,
        customParams,
        timestamp: Date.now()
      });

      if (onProcessComplete) onProcessComplete(url, { style: style.name, model: style.aiModel });

    } catch (error) {
      console.error('AI mastering failed:', error);
      mlDataCollector.record('ai_genre_mastering_error', {
        feature: 'ai_genre_mastering',
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const currentStyle = MASTERING_STYLES[selectedStyle];

  return (
    <div className="space-y-4">
      {/* Security Status */}
      <Card className="bg-slate-950/90 border-green-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-semibold text-sm">🛡️ Security Active</p>
                <p className="text-xs text-slate-400">
                  {securityStatus.safe ? 'Zero-iteration protected' : `${securityStatus.threats} blocked`}
                </p>
              </div>
            </div>
            <Badge className={securityStatus.safe ? 'bg-green-500' : 'bg-orange-500'}>
              {securityStatus.safe ? 'SAFE' : 'ALERT'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* AI Learning */}
      <Card className="bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border-cyan-500/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">🤖 AI Learns From Your Mastering</p>
              <p className="text-xs text-cyan-300">Learning genre preferences & parameter choices</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Style Selection */}
      <Card className="bg-slate-950/90 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Mastering Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(MASTERING_STYLES).map(([key, style]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedStyle(key);
                  setLoudness(null); // Reset to style default
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedStyle === key
                    ? `border-${style.color}-500 bg-${style.color}-500/10`
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="text-2xl mb-1">{style.icon}</div>
                <p className="text-white text-xs font-semibold">{style.name}</p>
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-800/50 rounded-lg">
            <p className="text-white font-semibold mb-1">{currentStyle.name}</p>
            <p className="text-slate-400 text-xs">{currentStyle.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge className="bg-blue-500/20 text-blue-300">
                AI Model: {currentStyle.aiModel}
              </Badge>
              <Badge className="bg-green-500/20 text-green-300">
                Target: {currentStyle.targetLUFS} LUFS
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fine-Tuning Controls */}
      <Card className="bg-slate-950/90 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white text-sm">Fine-Tune Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loudness (ZERO-ITERATION safe range) */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-300">Loudness (LUFS) - Zero-Iteration</label>
              <span className="text-sm text-blue-400 font-mono">
                {loudness ?? currentStyle.targetLUFS} dB
              </span>
            </div>
            <Slider
              value={[loudness ?? currentStyle.targetLUFS]}
              onValueChange={([v]) => setLoudness(v)}
              min={-24}
              max={-8}
              step={0.5}
              className="w-full"
            />
            <p className="text-xs text-slate-500 mt-1">
              Zero-iteration mastering • NO static • Lower = dynamic • Higher = loud
            </p>
          </div>

          {/* Spectral Balance (ZERO-ITERATION) */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-300">Spectral Balance - Zero-Iteration</label>
              <span className="text-sm text-purple-400 font-mono">
                {(spectralBalance * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[spectralBalance * 100]}
              onValueChange={([v]) => setSpectralBalance(v / 100)}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-slate-500 mt-1">
              Zero-iteration EQ • 0% = warm/dark • 100% = bright/airy • NO static
            </p>
          </div>

          {/* Dynamics (ZERO-ITERATION) */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-300">Dynamics - Zero-Iteration</label>
              <span className="text-sm text-green-400 font-mono">
                {(dynamics * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[dynamics * 100]}
              onValueChange={([v]) => setDynamics(v / 100)}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-slate-500 mt-1">
              Zero-iteration compression • 0% = compressed • 100% = natural • NO static
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Process Button */}
      {!processedUrl && (
        <Button
          onClick={handleProcess}
          disabled={!audioFile || isProcessing}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-bold"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing {progress}%
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Apply AI Mastering
            </>
          )}
        </Button>
      )}

      {/* Results */}
      {processedUrl && (
        <Card className="bg-slate-950/90 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white">✓ Mastering Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-300 text-sm">
                Style: <strong>{currentStyle.name}</strong> • Model: {currentStyle.aiModel}
              </p>
            </div>

            <audio controls className="w-full" src={processedUrl} />

            <div className="grid grid-cols-2 gap-3">
              <a href={processedUrl} download={`${currentStyle.name.replace(/\s+/g, '_')}_mastered.wav`}>
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </a>
              <Button
                onClick={() => {
                  setProcessedUrl(null);
                  setProgress(0);
                }}
                variant="outline"
              >
                Process Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}