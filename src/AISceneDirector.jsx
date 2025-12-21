
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, Activity, Zap, TrendingUp, Eye, 
  CheckCircle, AlertTriangle, Loader2, Play
} from 'lucide-react';
import { base44 } from "@/api/base44Client";

/**
 * AI Scene Director - Intelligent Scene Optimization
 * 
 * Features:
 * - Auto-adjust LOD based on performance
 * - Dynamic animation choreography
 * - Environmental suggestions
 * - Real-time performance monitoring
 * - ML-powered intelligent suggestions
 */

export default function AISceneDirector({
  sceneData, // Changed from sceneStats
  onDirectorSuggestion, // Changed from onApplyOptimization
  sessionId = null,
  mlImprovements // New prop for ML enhancements
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [directorSuggestions, setDirectorSuggestions] = useState([]);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [performanceMode, setPerformanceMode] = useState('balanced'); // 'performance', 'balanced', 'quality'
  const [audioAnalysis, setAudioAnalysis] = useState(null);

  useEffect(() => {
    // Using sceneData instead of sceneStats
    if (autoOptimize && sceneData?.fps) {
      analyzePerformance();
    }
  }, [sceneData?.fps, autoOptimize, mlImprovements]); // Added mlImprovements to dependencies

  // ENHANCED: ML-powered suggestions
  const generateMLSuggestions = (mlImp) => {
    if (!mlImp) {
      return generateBasicSuggestions();
    }

    const suggestions = [];
    
    // Helper function to add ML-enhanced suggestions
    const addMlSuggestion = (type, priority, suggestionText, title = 'ML Insight') => {
        suggestions.push({
            type: type,
            title: title,
            suggestion: suggestionText,
            priority: priority,
            mlEnhanced: true,
            applied: false,
            // Generic action for ML suggestions, can be refined to specific ML actions
            action: () => onDirectorSuggestion?.({
                type: 'ml_suggestion',
                data: {
                    title: title,
                    suggestion: suggestionText
                }
            })
        });
    };

    // Avatar intelligence-based suggestions
    if (mlImp.avatarIntelligence > 70) {
      addMlSuggestion(
        'performance',
        'high',
        `ML Avatar Intelligence at ${mlImp.avatarIntelligence.toFixed(0)}% - Avatars can now perform complex choreography. Try synchronized dance routines!`,
        'ML Avatar Intelligence'
      );
    }
    
    // Animation quality suggestions
    if (mlImp.animationQuality > 60) {
      addMlSuggestion(
        'animation',
        'medium',
        `Animation Quality: ${mlImp.animationQuality.toFixed(0)}% - Smooth transitions enabled. Increase avatar count for more dynamic scenes.`,
        'ML Animation Quality'
      );
    }
    
    // Physics-based suggestions
    if (mlImp.physicsAccuracy > 80) {
      addMlSuggestion(
        'performance',
        'high',
        `Physics Accuracy: ${mlImp.physicsAccuracy.toFixed(0)}% - Advanced collision detection active. Add force fields and wind zones for realistic effects!`,
        'ML Physics Accuracy'
      );
    }
    
    // Sound quality suggestions
    if (mlImp.soundQuality > 50) {
      addMlSuggestion(
        'environment',
        'medium',
        `Sound Quality: ${mlImp.soundQuality.toFixed(0)}% - Audio spatialization improved. Enable 3D audio for immersive experience.`,
        'ML Sound Quality'
      );
    }
    
    // Scene optimization suggestions
    if (mlImp.sceneOptimization > 75) {
      addMlSuggestion(
        'performance',
        'critical',
        `Scene Optimization: ${mlImp.sceneOptimization.toFixed(0)}% - Auto-LOD tuned. You can increase crowd size to ${Math.round(1000 * (mlImp.sceneOptimization / 100))} without FPS loss!`,
        'ML Scene Optimization'
      );
    }

    return suggestions.length > 0 ? suggestions : generateBasicSuggestions();
  };

  const generateBasicSuggestions = () => {
    return [
      {
        type: 'performance',
        title: 'ML Training Required',
        priority: 'low',
        suggestion: 'Train ML model to unlock intelligent scene suggestions',
        mlEnhanced: false,
        applied: false,
        action: () => console.log('Prompt user to train ML model for advanced suggestions') // Placeholder action
      }
    ];
  };

  const analyzePerformance = async () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    let llmSuggestions = [];

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert 3D scene director analyzing performance and suggesting optimizations.

**Current Performance:**
- FPS: ${sceneData?.fps || 0}
- Target FPS: 60
- Triangles: ${sceneData?.triangles || 0}
- Draw Calls: ${sceneData?.drawCalls || 0}
- Physics Objects: ${sceneData?.physicsObjects || 0}
- Collision Checks: ${sceneData?.collisionChecks || 0}

**Performance Mode:** ${performanceMode}

Analyze and provide suggestions for:

1. **LOD Adjustments:**
   - Should LOD be more aggressive?
   - Recommended LOD distances
   - Triangle budget per avatar

2. **Physics Optimization:**
   - Current physics complexity appropriate?
   - Recommended sleep thresholds
   - Spatial hash grid size

3. **Animation Choreography:**
   - Crowd behavior suggestions
   - Avatar animation sync
   - Performance-friendly animations

4. **Environmental Enhancements:**
   - Lighting adjustments for mood
   - Weather effects (fog, particles)
   - Time of day changes
   - Post-processing recommendations

5. **Critical Performance Issues:**
   - Immediate actions needed
   - Priority fixes

Provide specific, actionable suggestions with priority levels.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_assessment: {
              type: "string",
              enum: ["excellent", "good", "needs_optimization", "critical"]
            },
            performance_score: {
              type: "number",
              minimum: 0,
              maximum: 100
            },
            lod_suggestions: {
              type: "object",
              properties: {
                adjustment_needed: { type: "boolean" },
                recommended_distances: {
                  type: "array",
                  items: { type: "number" }
                },
                triangle_reduction: { type: "number" },
                priority: {
                  type: "string",
                  enum: ["low", "medium", "high", "critical"]
                }
              }
            },
            physics_suggestions: {
              type: "object",
              properties: {
                complexity_adjustment: {
                  type: "string",
                  enum: ["lower", "maintain", "increase"]
                },
                sleep_threshold: { type: "number" },
                grid_size: { type: "number" },
                priority: {
                  type: "string",
                  enum: ["low", "medium", "high", "critical"]
                }
              }
            },
            animation_choreography: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  suggestion: { type: "string" },
                  impact: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            },
            environment_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["lighting", "weather", "time_of_day", "post_processing"]
                  },
                  suggestion: { type: "string" },
                  mood_impact: { type: "string" },
                  performance_cost: {
                    type: "string",
                    enum: ["low", "medium", "high"]
                  }
                }
              }
            },
            critical_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  reason: { type: "string" },
                  expected_improvement: { type: "string" }
                }
              }
            },
            estimated_fps_gain: { type: "string" }
          },
          required: ["overall_assessment", "performance_score"]
        }
      });

      // Convert LLM response to suggestions array
      
      // Add LOD suggestions
      if (response.lod_suggestions?.adjustment_needed) {
        llmSuggestions.push({
          type: 'performance',
          title: 'LOD Adjustment Needed',
          suggestion: `Adjust LOD distances to ${response.lod_suggestions.recommended_distances?.join('m, ')}m`,
          priority: response.lod_suggestions.priority || 'medium',
          applied: false,
          mlEnhanced: false, // Explicitly not ML enhanced
          action: () => onDirectorSuggestion?.({ // Changed to onDirectorSuggestion
            type: 'lod',
            data: response.lod_suggestions
          })
        });
      }

      // Add physics suggestions
      if (response.physics_suggestions?.complexity_adjustment !== 'maintain') {
        llmSuggestions.push({
          type: 'performance',
          title: 'Physics Optimization',
          suggestion: `${response.physics_suggestions.complexity_adjustment} physics complexity`,
          priority: response.physics_suggestions.priority || 'medium',
          applied: false,
          mlEnhanced: false, // Explicitly not ML enhanced
          action: () => onDirectorSuggestion?.({ // Changed to onDirectorSuggestion
            type: 'physics',
            data: response.physics_suggestions
          })
        });
      }

      // Add animation choreography
      response.animation_choreography?.forEach((anim, idx) => {
        llmSuggestions.push({
          type: 'animation',
          title: `Animation ${idx + 1}`,
          suggestion: anim.suggestion,
          priority: anim.impact === 'High' ? 'high' : 'medium',
          applied: false,
          mlEnhanced: false, // Explicitly not ML enhanced
          action: () => onDirectorSuggestion?.({ // Changed to onDirectorSuggestion
            type: 'animation_choreography',
            data: anim
          })
        });
      });

      // Add environment suggestions
      response.environment_suggestions?.forEach((env, idx) => {
        llmSuggestions.push({
          type: 'environment',
          title: env.type.replace(/_/g, ' '),
          suggestion: env.suggestion,
          priority: env.performance_cost === 'high' ? 'low' : 'high',
          applied: false,
          mlEnhanced: false, // Explicitly not ML enhanced
          action: () => onDirectorSuggestion?.({ // Changed to onDirectorSuggestion
            type: 'environment',
            data: env
          })
        });
      });

      // Add critical actions at the top
      response.critical_actions?.forEach((action) => {
        llmSuggestions.unshift({
          type: 'performance',
          title: 'CRITICAL',
          suggestion: action.action,
          priority: 'critical',
          applied: false,
          mlEnhanced: false, // Explicitly not ML enhanced
          action: () => onDirectorSuggestion?.({ // Changed to onDirectorSuggestion
            type: 'critical_action',
            data: action
          })
        });
      });

      // Combine LLM suggestions with ML suggestions
      const mlSpecificSuggestions = generateMLSuggestions(mlImprovements);
      setDirectorSuggestions([...llmSuggestions, ...mlSpecificSuggestions]);

      // Save to session if provided
      if (sessionId && (llmSuggestions.length > 0 || mlSpecificSuggestions.length > 0)) {
        try {
          await base44.entities.SceneSession.update(sessionId, {
            ai_director_suggestions: [...llmSuggestions, ...mlSpecificSuggestions].map(s => ({
              type: s.type,
              title: s.title, // Include title for better session saving
              suggestion: s.suggestion,
              priority: s.priority,
              applied: s.applied,
              mlEnhanced: s.mlEnhanced || false
            }))
          });
        } catch (error) {
          console.warn('Could not save suggestions to session:', error);
        }
      }

    } catch (error) {
      console.error('AI Director analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (index) => {
    const suggestion = directorSuggestions[index];
    if (suggestion.action) {
      suggestion.action();
      
      // Mark as applied
      setDirectorSuggestions(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], applied: true };
        return updated;
      });
    }
  };

  const applyAllCritical = () => {
    directorSuggestions.forEach((sug, idx) => {
      if (sug.priority === 'critical' && !sug.applied) {
        applySuggestion(idx);
      }
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'performance': return Activity;
      case 'animation': return Play;
      case 'environment': return Sparkles;
      case 'lighting': return Eye;
      case 'ml_suggestion': return Sparkles; // Specific icon for ML suggestions
      default: return Zap;
    }
  };

  return (
    <Card className="bg-slate-900/90 border-purple-500/30"> {/* Updated border color */}
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2"> {/* Removed text-sm */}
          <Sparkles className="w-5 h-5 text-purple-400" /> {/* Updated size and color */}
          AI Scene Director
          {mlImprovements && Object.values(mlImprovements).some(v => v > 0) && (
            <Badge className="ml-2 bg-green-500 text-white text-xs animate-pulse">
              ML POWERED
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Music Upload - DARK */}
        <Card className="bg-slate-800/90 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-sm">Music Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">Feature for uploading and managing background music for the scene.</p>
            {/* Additional UI elements for upload, track listing would go here */}
          </CardContent>
        </Card>

        {/* Analysis Results - DARK */}
        {audioAnalysis && (
          <Card className="bg-slate-800/90 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white text-sm">Audio Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400">Detailed analysis results of the uploaded audio will be displayed here.</p>
              {/* UI for displaying analysis data */}
            </CardContent>
          </Card>
        )}

        {/* Original Performance Overview Card Content - now directly within the outer CardContent */}
        {/* Performance Meter */}
        {sceneData?.fps && ( // Using sceneData
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">Current FPS</span>
              <span className={`font-bold ${
                sceneData.fps >= 55 ? 'text-green-400' : // Using sceneData
                sceneData.fps >= 30 ? 'text-yellow-400' : // Using sceneData
                'text-red-400'
              }`}>
                {sceneData.fps} FPS
              </span>
            </div>
            <Progress 
              value={(sceneData.fps / 60) * 100} // Using sceneData
              className="h-2"
            />
          </div>
        )}

        {/* Auto-Optimize Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
          <span className="text-sm text-white">Auto-Optimize</span>
          <Button
            size="sm"
            variant={autoOptimize ? "default" : "outline"}
            onClick={() => setAutoOptimize(!autoOptimize)}
            className="text-xs"
          >
            {autoOptimize ? 'ON' : 'OFF'}
          </Button>
        </div>

        {/* Performance Mode */}
        <div>
          <Label className="text-white text-sm mb-2 block">Performance Mode</Label>
          <div className="grid grid-cols-3 gap-2">
            {['performance', 'balanced', 'quality'].map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={performanceMode === mode ? "default" : "outline"}
                onClick={() => setPerformanceMode(mode)}
                className="text-xs capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>

        {/* Analyze Button */}
        <Button
          onClick={analyzePerformance}
          disabled={isAnalyzing}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Scene...
            </>
          ) : (
            <>
              <Activity className="w-4 h-4 mr-2" />
              Analyze & Optimize
            </>
          )}
        </Button>
        
        {/* Suggestions - This was the second original card, now placed directly inside the outer CardContent */}
        {directorSuggestions.length > 0 && (
          <Card className="bg-slate-800/80 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  Director Suggestions ({directorSuggestions.length})
                </span>
                {directorSuggestions.some(s => s.priority === 'critical' && !s.applied) && (
                  <Button
                    size="sm"
                    onClick={applyAllCritical}
                    className="bg-red-600 hover:bg-red-700 text-xs"
                  >
                    Apply Critical
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {directorSuggestions.map((suggestion, idx) => {
                const Icon = getTypeIcon(suggestion.type);
                
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded border ${
                      suggestion.priority === 'critical'
                        ? 'bg-red-500/10 border-red-500/30'
                        : (suggestion.mlEnhanced ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-700/30 border-slate-600')
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-4 h-4 mt-0.5 ${
                        suggestion.applied ? 'text-green-400' : (suggestion.mlEnhanced ? 'text-purple-400' : 'text-orange-400')
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-white font-semibold text-sm">
                            {suggestion.title}
                          </span>
                          <Badge
                            className={`${getPriorityColor(suggestion.priority)} text-white text-xs shrink-0`}
                          >
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-300 break-words">
                          {suggestion.suggestion}
                        </p>
                        {!suggestion.applied && suggestion.action && (
                          <Button
                            size="sm"
                            onClick={() => applySuggestion(idx)}
                            className="mt-2 text-xs bg-purple-600 hover:bg-purple-700"
                          >
                            Apply
                          </Button>
                        )}
                        {suggestion.applied && (
                          <div className="flex items-center gap-1 mt-2 text-green-400 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Applied
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
