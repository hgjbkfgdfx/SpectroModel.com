import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, CheckCircle, Loader2, Sparkles, Zap, 
  Bug, Wrench, Mic, Activity, Shield
} from 'lucide-react';
import { base44 } from "@/api/base44Client";

export default function StudioAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [featureRequest, setFeatureRequest] = useState('');
  const [isProcessingFeature, setIsProcessingFeature] = useState(false);
  const [audioHealth, setAudioHealth] = useState(null);

  // Auto-detect audio/studio errors
  useEffect(() => {
    const detectErrors = () => {
      const detectedErrors = [];

      // Check for AudioContext
      if (!window.AudioContext && !window.webkitAudioContext) {
        detectedErrors.push({
          id: 'no-audio-api',
          severity: 'critical',
          message: 'Web Audio API not available',
          fix: 'Your browser does not support Web Audio API. Use Chrome, Firefox, or Edge.',
          autoFixable: false
        });
      }

      // Check for audio elements
      const audioElements = document.querySelectorAll('audio');
      if (audioElements.length > 0) {
        audioElements.forEach((audio, idx) => {
          if (audio.error) {
            detectedErrors.push({
              id: `audio-error-${idx}`,
              severity: 'high',
              message: `Audio playback error: ${audio.error.message}`,
              fix: 'Check audio file format and source URL.',
              autoFixable: false
            });
          }
        });
      }

      // Check for waveform canvas
      const waveformCanvas = document.querySelector('canvas[class*="waveform"]');
      if (!waveformCanvas) {
        detectedErrors.push({
          id: 'no-waveform',
          severity: 'medium',
          message: 'Waveform visualization not found',
          fix: 'Waveform canvas may not be rendering. Check AdvancedMixingTools.',
          autoFixable: false
        });
      }

      // Check for audio buffer processing
      const isProcessing = document.querySelector('[class*="processing"]') !== null;
      if (isProcessing) {
        detectedErrors.push({
          id: 'stuck-processing',
          severity: 'medium',
          message: 'Audio processing may be stuck',
          fix: 'If processing takes >30 seconds, try reloading.',
          autoFixable: true
        });
      }

      setErrors(detectedErrors);
    };

    if (isOpen) {
      detectErrors();
      const interval = setInterval(detectErrors, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const runFullAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const health = {
        audioContextState: 'unknown',
        sampleRate: 0,
        bufferSize: 0,
        latency: 0
      };

      // Check AudioContext
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        health.audioContextState = audioCtx.state;
        health.sampleRate = audioCtx.sampleRate;
        health.latency = audioCtx.baseLatency || 0;
        await audioCtx.close();
      } catch (e) {
        health.audioContextState = 'error';
      }

      setAudioHealth(health);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const requestFeature = async () => {
    if (!featureRequest.trim()) return;

    setIsProcessingFeature(true);
    try {
      const prompt = `
You are an AI assistant for SpectroModel's Studio Corrector (audio mastering tool).
A user has requested the following audio processing feature:

"${featureRequest}"

Analyze this request for a professional audio mastering tool and provide:
1. Implementation difficulty (Easy/Medium/Hard)
2. Required audio processing algorithms
3. Web Audio API implementation approach
4. Quality/performance considerations
5. Step-by-step plan
6. Potential audio artifacts or issues

Response must be in JSON format.
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            difficulty: { type: "string" },
            algorithms: { type: "array", items: { type: "string" } },
            approach: { type: "string" },
            quality_impact: { type: "string" },
            implementation_steps: { type: "array", items: { type: "string" } },
            potential_issues: { type: "array", items: { type: "string" } },
            recommendation: { type: "string" }
          }
        }
      });

      alert(`
✅ Audio Feature Analysis Complete!

Difficulty: ${response.difficulty}
Quality Impact: ${response.quality_impact}

Algorithms:
${response.algorithms?.join('\n• ') || 'N/A'}

Implementation:
${response.implementation_steps?.map((step, i) => `${i + 1}. ${step}`).join('\n') || 'N/A'}

Potential Issues:
${response.potential_issues?.join('\n• ') || 'N/A'}

Recommendation:
${response.recommendation}
      `);

      setFeatureRequest('');
    } catch (error) {
      console.error('Feature request failed:', error);
      alert('Feature analysis failed. Please try again.');
    } finally {
      setIsProcessingFeature(false);
    }
  };

  const attemptAutoFix = (errorId) => {
    switch(errorId) {
      case 'stuck-processing':
        alert('Auto-fix: Reloading page to clear processing state...');
        setTimeout(() => window.location.reload(), 1000);
        break;
      default:
        alert('This error cannot be auto-fixed. Please check the suggested fix.');
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-52 right-4 z-50 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-2xl"
      >
        <Shield className="w-5 h-5 mr-2" />
        Studio AI Assistant
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px] overflow-y-auto bg-slate-900/98 border-green-500/30 shadow-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            Studio AI Assistant
          </div>
          <div className="flex items-center gap-2">
            {errors.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errors.length} issues
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-xs h-6"
            >
              Close
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audio Health */}
        {audioHealth && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <h4 className="text-green-300 font-semibold text-xs mb-2 flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Audio System Health
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">State:</span>
                <span className="text-white font-bold">{audioHealth.audioContextState}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sample Rate:</span>
                <span className="text-white font-bold">{audioHealth.sampleRate}Hz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Latency:</span>
                <span className="text-white font-bold">{(audioHealth.latency * 1000).toFixed(1)}ms</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Detection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Bug className="w-4 h-4 text-red-400" />
              Audio Error Detection
            </h3>
            <Button
              onClick={runFullAnalysis}
              disabled={isAnalyzing}
              size="sm"
              className="text-xs h-7"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Activity className="w-3 h-3 mr-1" />
                  Full Scan
                </>
              )}
            </Button>
          </div>

          {errors.length === 0 ? (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-xs">Audio system healthy!</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {errors.map(error => (
                <div
                  key={error.id}
                  className={`p-3 rounded-lg border ${
                    error.severity === 'critical' ? 'bg-red-900/20 border-red-500/30' :
                    error.severity === 'high' ? 'bg-orange-900/20 border-orange-500/30' :
                    'bg-yellow-900/20 border-yellow-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <AlertTriangle className={`w-4 h-4 shrink-0 ${
                        error.severity === 'critical' ? 'text-red-400' :
                        error.severity === 'high' ? 'text-orange-400' :
                        'text-yellow-400'
                      }`} />
                      <span className="text-white text-xs font-semibold">{error.message}</span>
                    </div>
                    {error.autoFixable && (
                      <Button
                        size="sm"
                        onClick={() => attemptAutoFix(error.id)}
                        className="text-xs h-6 bg-blue-600 hover:bg-blue-700"
                      >
                        <Wrench className="w-3 h-3 mr-1" />
                        Fix
                      </Button>
                    )}
                  </div>
                  <p className="text-slate-300 text-xs">{error.fix}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature Request */}
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Request Audio Features
          </h3>
          <Textarea
            value={featureRequest}
            onChange={(e) => setFeatureRequest(e.target.value)}
            placeholder="Describe an audio feature...&#10;&#10;Examples:&#10;• Add de-esser effect&#10;• Add stereo widening&#10;• Add multiband compression&#10;• Add pitch correction"
            className="min-h-[100px] bg-slate-800 text-white border-slate-700 text-xs"
          />
          <Button
            onClick={requestFeature}
            disabled={isProcessingFeature || !featureRequest.trim()}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-xs"
          >
            {isProcessingFeature ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                AI Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-2" />
                Analyze Audio Feature
              </>
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-sm">⚡ Quick Audio Checks</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => {
                try {
                  const ctx = new (window.AudioContext || window.webkitAudioContext)();
                  alert(`✅ Audio Context OK\nSample Rate: ${ctx.sampleRate}Hz\nState: ${ctx.state}`);
                  ctx.close();
                } catch (e) {
                  alert('❌ Audio Context failed');
                }
              }}
            >
              <Mic className="w-3 h-3 mr-1" />
              Test Audio
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={runFullAnalysis}
            >
              <Activity className="w-3 h-3 mr-1" />
              Check Health
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => {
                console.clear();
                alert('✅ Console cleared');
              }}
            >
              Clear Console
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => window.location.reload()}
            >
              Reload Studio
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}