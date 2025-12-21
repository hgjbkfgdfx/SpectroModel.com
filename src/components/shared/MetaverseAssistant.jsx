import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, CheckCircle, Loader2, Sparkles, Zap, 
  Bug, Wrench, Play, Eye, Box, Cpu
} from 'lucide-react';
import { base44 } from "@/api/base44Client";

export default function MetaverseAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [featureRequest, setFeatureRequest] = useState('');
  const [isProcessingFeature, setIsProcessingFeature] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);

  // Auto-detect errors specific to Virtual/3D
  useEffect(() => {
    const detectErrors = () => {
      const detectedErrors = [];

      // Check for WebGL support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        detectedErrors.push({
          id: 'no-webgl',
          severity: 'critical',
          message: 'WebGL not supported',
          fix: 'Your browser does not support WebGL. Try Chrome, Firefox, or Edge.',
          autoFixable: false
        });
      }

      // Check for Three.js canvas
      const threeCanvas = document.querySelectorAll('canvas');
      if (threeCanvas.length === 0) {
        detectedErrors.push({
          id: 'no-3d-canvas',
          severity: 'critical',
          message: 'No 3D canvas found - dark screen',
          fix: 'Three.js Canvas component not mounting. Check React Three Fiber setup.',
          autoFixable: false
        });
      }

      // Check for audio visualization
      const hasAudioControls = document.querySelector('[class*="Volume"]') !== null;
      if (!hasAudioControls) {
        detectedErrors.push({
          id: 'no-audio-controls',
          severity: 'medium',
          message: 'Audio controls not found',
          fix: 'Volume slider may not be rendering.',
          autoFixable: false
        });
      }

      // Check for performance issues
      if (performance.memory) {
        const usedMemory = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
        if (usedMemory > 0.8) {
          detectedErrors.push({
            id: 'high-memory',
            severity: 'high',
            message: `High memory usage: ${(usedMemory * 100).toFixed(1)}%`,
            fix: 'Clear memory by reloading the page or reducing particle count.',
            autoFixable: true
          });
        }
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
      
      const metrics = {
        fps: 0,
        drawCalls: 0,
        triangles: 0,
        memoryUsage: 0
      };

      // Estimate FPS
      let lastTime = performance.now();
      let frames = 0;
      const fpsInterval = setInterval(() => {
        frames++;
        const currentTime = performance.now();
        if (currentTime - lastTime >= 1000) {
          metrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
          clearInterval(fpsInterval);
          setPerformanceMetrics(metrics);
        }
      }, 16);

      // Check memory
      if (performance.memory) {
        metrics.memoryUsage = Math.round((performance.memory.usedJSHeapSize / 1024 / 1024));
      }

      // Check for Three.js renderer
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            console.log('GPU:', gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
          }
        }
      }

    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setTimeout(() => setIsAnalyzing(false), 2000);
    }
  };

  const requestFeature = async () => {
    if (!featureRequest.trim()) return;

    setIsProcessingFeature(true);
    try {
      const prompt = `
You are an AI assistant for SpectroModel's 3D Virtual Studio.
A user has requested the following 3D/VR feature:

"${featureRequest}"

Analyze this request for a 3D audio visualization environment and provide:
1. Implementation difficulty (Easy/Medium/Hard)
2. Required 3D libraries/technologies
3. WebGL/Three.js implementation approach
4. Performance considerations
5. Step-by-step plan
6. Potential GPU/performance issues

Response must be in JSON format.
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            difficulty: { type: "string" },
            technologies: { type: "array", items: { type: "string" } },
            approach: { type: "string" },
            performance_impact: { type: "string" },
            implementation_steps: { type: "array", items: { type: "string" } },
            gpu_considerations: { type: "array", items: { type: "string" } },
            recommendation: { type: "string" }
          }
        }
      });

      alert(`
✅ 3D Feature Analysis Complete!

Difficulty: ${response.difficulty}
Performance Impact: ${response.performance_impact}

Technologies:
${response.technologies?.join('\n• ') || 'N/A'}

Implementation:
${response.implementation_steps?.map((step, i) => `${i + 1}. ${step}`).join('\n') || 'N/A'}

GPU Considerations:
${response.gpu_considerations?.join('\n• ') || 'N/A'}

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
      case 'high-memory':
        if (window.gc) {
          window.gc();
        }
        alert('Auto-fix: Clearing memory... Reload recommended.');
        setTimeout(() => window.location.reload(), 2000);
        break;
      default:
        alert('This error cannot be auto-fixed. Please check the suggested fix.');
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-36 right-4 z-50 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 shadow-2xl"
      >
        <Box className="w-5 h-5 mr-2" />
        3D AI Assistant
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px] overflow-y-auto bg-slate-900/98 border-cyan-500/30 shadow-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-cyan-400" />
            3D Studio AI Assistant
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
        {/* Performance Metrics */}
        {performanceMetrics && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="text-blue-300 font-semibold text-xs mb-2 flex items-center gap-2">
              <Cpu className="w-3 h-3" />
              Performance Metrics
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">FPS:</span>
                <span className="text-white ml-2 font-bold">{performanceMetrics.fps || '--'}</span>
              </div>
              <div>
                <span className="text-slate-400">Memory:</span>
                <span className="text-white ml-2 font-bold">{performanceMetrics.memoryUsage || '--'}MB</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Detection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Bug className="w-4 h-4 text-red-400" />
              3D Error Detection
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
                  <Eye className="w-3 h-3 mr-1" />
                  Full Scan
                </>
              )}
            </Button>
          </div>

          {errors.length === 0 ? (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-xs">3D environment running smoothly!</span>
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
            Request 3D Features
          </h3>
          <Textarea
            value={featureRequest}
            onChange={(e) => setFeatureRequest(e.target.value)}
            placeholder="Describe a 3D feature...&#10;&#10;Examples:&#10;• Add VR support&#10;• Add custom 3D models&#10;• Add physics simulation&#10;• Add post-processing effects"
            className="min-h-[100px] bg-slate-800 text-white border-slate-700 text-xs"
          />
          <Button
            onClick={requestFeature}
            disabled={isProcessingFeature || !featureRequest.trim()}
            className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-xs"
          >
            {isProcessingFeature ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                AI Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-2" />
                Analyze 3D Feature
              </>
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-sm">⚡ Quick 3D Checks</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => {
                const canvas = document.querySelector('canvas');
                if (canvas) {
                  const gl = canvas.getContext('webgl');
                  alert(gl ? '✅ WebGL enabled!' : '❌ WebGL not available');
                } else {
                  alert('❌ No canvas found');
                }
              }}
            >
              <Eye className="w-3 h-3 mr-1" />
              Check WebGL
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={runFullAnalysis}
            >
              <Cpu className="w-3 h-3 mr-1" />
              Check FPS
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => {
                if (performance.memory) {
                  const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
                  alert(`Memory Usage: ${used}MB`);
                } else {
                  alert('Memory API not available');
                }
              }}
            >
              Check Memory
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => window.location.reload()}
            >
              Reload 3D Scene
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}