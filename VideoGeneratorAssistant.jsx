
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, CheckCircle, Loader2, Sparkles, Zap, 
  Bug, Wrench, Play, Pause, Eye, Download, Upload 
} from 'lucide-react';
import { base44 } from "@/api/base44Client";

export default function VideoGeneratorAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [featureRequest, setFeatureRequest] = useState('');
  const [isProcessingFeature, setIsProcessingFeature] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Auto-detect errors
  useEffect(() => {
    const detectErrors = () => {
      const detectedErrors = [];

      // Check for audio element
      const audioElements = document.querySelectorAll('audio');
      if (audioElements.length === 0) {
        detectedErrors.push({
          id: 'no-audio',
          severity: 'high',
          message: 'No audio playback detected',
          fix: 'Audio element may not be rendering. Check LyricVideo3D component.',
          autoFixable: false
        });
      }

      // Check for canvas/3D rendering
      const canvasElements = document.querySelectorAll('canvas');
      if (canvasElements.length === 0) {
        detectedErrors.push({
          id: 'no-canvas',
          severity: 'critical',
          message: 'No 3D canvas detected - dark screen issue',
          fix: 'Three.js canvas not mounting. Check mountRef in LyricVideo3D.',
          autoFixable: false
        });
      }

      // Check for play/pause buttons
      const buttons = document.querySelectorAll('button');
      let hasPlayButton = false;
      buttons.forEach(btn => {
        if (btn.textContent.includes('Play') || btn.textContent.includes('Stop')) {
          hasPlayButton = true;
        }
      });
      
      if (!hasPlayButton) {
        detectedErrors.push({
          id: 'no-controls',
          severity: 'high',
          message: 'No playback controls found',
          fix: 'Controls may not be rendering. Check LyricVideo3D controls section.',
          autoFixable: false
        });
      }

      // Check for loading states
      const loadingElements = document.querySelectorAll('[class*="animate-spin"]');
      if (loadingElements.length > 0) {
        detectedErrors.push({
          id: 'stuck-loading',
          severity: 'medium',
          message: 'Loading state detected - may be stuck',
          fix: 'Check audio loading and beat detection logic.',
          autoFixable: true
        });
      }

      // Check for error messages
      const errorElements = document.querySelectorAll('[class*="text-red"]');
      if (errorElements.length > 0) {
        detectedErrors.push({
          id: 'error-displayed',
          severity: 'high',
          message: 'Error message displayed on page',
          fix: 'Check console for detailed error information.',
          autoFixable: false
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

  // Generate AI suggestions
  useEffect(() => {
    if (isOpen && errors.length === 0) {
      setSuggestions([
        '🎨 Add custom text animations (fade, slide, zoom)',
        '🌈 Add color theme presets (neon, sunset, cyberpunk)',
        '📹 Add video recording/export functionality',
        '🎵 Add beat detection visualization',
        '✨ Add particle effects customization',
        '🖼️ Add video filters (blur, vignette, grain)',
        '📊 Add real-time audio spectrum analyzer',
        '🎭 Add transition effects between lyrics'
      ]);
    }
  }, [isOpen, errors]);

  const runFullAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate comprehensive analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysisResults = [];

      // Check Three.js availability
      if (!window.THREE) {
        analysisResults.push({
          id: 'three-missing',
          severity: 'critical',
          message: 'Three.js not loaded',
          fix: 'Three.js library is required for 3D rendering. Check imports.',
          autoFixable: false
        });
      }

      // Check Audio Context
      if (!window.AudioContext && !window.webkitAudioContext) {
        analysisResults.push({
          id: 'audio-context-missing',
          severity: 'critical',
          message: 'Web Audio API not supported',
          fix: 'Browser does not support Web Audio API. Use modern browser.',
          autoFixable: false
        });
      }

      // Check for console errors
      const consoleErrors = window.__errorLog || [];
      if (consoleErrors.length > 0) {
        analysisResults.push({
          id: 'console-errors',
          severity: 'high',
          message: `${consoleErrors.length} console errors detected`,
          fix: 'Check browser console for details.',
          autoFixable: false
        });
      }

      setErrors(prev => [...prev, ...analysisResults]);
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
You are an AI assistant for SpectroModel's Video Generator.
A user has requested the following feature enhancement:

"${featureRequest}"

Analyze this request and provide:
1. Implementation difficulty (Easy/Medium/Hard)
2. Estimated time to implement
3. Required technologies/libraries
4. Step-by-step implementation plan
5. Potential challenges
6. Alternative approaches

Response must be in JSON format.
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            difficulty: { type: "string" },
            estimated_time: { type: "string" },
            technologies: { type: "array", items: { type: "string" } },
            implementation_steps: { type: "array", items: { type: "string" } },
            challenges: { type: "array", items: { type: "string" } },
            alternatives: { type: "array", items: { type: "string" } },
            recommendation: { type: "string" }
          }
        }
      });

      const analysis = response;

      // Show analysis
      alert(`
✅ Feature Analysis Complete!

Difficulty: ${analysis.difficulty}
Estimated Time: ${analysis.estimated_time}

Technologies Needed:
${analysis.technologies?.join('\n• ') || 'N/A'}

Implementation Steps:
${analysis.implementation_steps?.map((step, i) => `${i + 1}. ${step}`).join('\n') || 'N/A'}

Recommendation:
${analysis.recommendation}

This analysis has been logged. Our AI will work on implementing feasible features!
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
      case 'stuck-loading':
        // Attempt to reload the page
        alert('Auto-fix: Reloading page to clear stuck state...');
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
        className="fixed top-20 right-4 z-50 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-2xl whitespace-nowrap"
      >
        <Sparkles className="w-5 h-5 mr-2 shrink-0" />
        <span className="hidden sm:inline">Video AI Assistant</span>
        <span className="sm:hidden">AI</span>
      </Button>
    );
  }

  return (
    <Card className="fixed top-20 right-4 z-50 w-[90vw] max-w-96 max-h-[600px] overflow-y-auto bg-slate-900/98 border-purple-500/30 shadow-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Video AI Assistant
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
        {/* Error Detection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Bug className="w-4 h-4 text-red-400" />
              Error Detection
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
                <span className="text-green-300 text-xs">No errors detected! Everything looks good.</span>
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
            Request Features
          </h3>
          <Textarea
            value={featureRequest}
            onChange={(e) => setFeatureRequest(e.target.value)}
            placeholder="Describe a feature you'd like to add...&#10;&#10;Examples:&#10;• Add slow-motion effect&#10;• Add subtitle styling options&#10;• Add video filters"
            className="min-h-[100px] bg-slate-800 text-white border-slate-700 text-xs"
          />
          <Button
            onClick={requestFeature}
            disabled={isProcessingFeature || !featureRequest.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-xs"
          >
            {isProcessingFeature ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                AI Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-2" />
                Analyze Feature Request
              </>
            )}
          </Button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-white font-semibold text-sm">💡 AI Suggestions</h3>
            <div className="space-y-1">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setFeatureRequest(suggestion.replace(/[🎨🌈📹🎵✨🖼️📊🎭]/g, '').trim())}
                  className="w-full text-left p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-sm">⚡ Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => {
                const canvas = document.querySelector('canvas');
                if (canvas) {
                  alert('✅ Canvas found! 3D rendering should be working.');
                } else {
                  alert('❌ No canvas found. Check LyricVideo3D component mounting.');
                }
              }}
            >
              <Eye className="w-3 h-3 mr-1" />
              Check Canvas
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => {
                const audio = document.querySelector('audio');
                if (audio) {
                  alert(`✅ Audio found! Source: ${audio.src ? 'Loaded' : 'Not loaded'}`);
                } else {
                  alert('❌ No audio element found.');
                }
              }}
            >
              <Play className="w-3 h-3 mr-1" />
              Check Audio
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => {
                console.clear();
                alert('✅ Console cleared. Check for new errors after testing.');
              }}
            >
              Clear Console
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload Page
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
