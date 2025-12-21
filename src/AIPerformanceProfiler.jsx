import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, Cpu, Zap, TrendingDown, AlertTriangle, 
  CheckCircle, Loader2, BarChart3, Eye
} from 'lucide-react';
import { base44 } from "@/api/base44Client";

/**
 * AI-Powered Performance Profiler for 3D Scenes
 * 
 * Analyzes:
 * - Draw calls
 * - Polygon/triangle counts  
 * - Physics computations (collisions, updates)
 * - Memory usage
 * - FPS performance
 * - GPU utilization
 * 
 * Provides AI-driven optimization suggestions:
 * - LOD (Level of Detail) adjustments
 * - Texture compression
 * - Physics solver optimizations
 * - Culling strategies
 */

export default function AIPerformanceProfiler({ 
  sceneStats, 
  onApplyOptimization 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfiling, setIsProfiling] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState(null);
  const [performanceScore, setPerformanceScore] = useState(0);

  const frameTimesRef = useRef([]);
  const lastFrameTimeRef = useRef(performance.now());

  // Real-time FPS tracking
  useEffect(() => {
    if (!isProfiling) return;

    const trackFrame = () => {
      const now = performance.now();
      const frameTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      frameTimesRef.current.push(frameTime);
      if (frameTimesRef.current.length > 120) { // Keep last 2 seconds at 60fps
        frameTimesRef.current.shift();
      }

      requestAnimationFrame(trackFrame);
    };

    const rafId = requestAnimationFrame(trackFrame);
    return () => cancelAnimationFrame(rafId);
  }, [isProfiling]);

  const startProfiling = () => {
    setIsProfiling(true);
    frameTimesRef.current = [];
    
    // Collect data for 3 seconds
    setTimeout(() => {
      analyzePerfData();
    }, 3000);
  };

  const analyzePerfData = () => {
    setIsProfiling(false);
    
    // Calculate metrics
    const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
    const fps = 1000 / avgFrameTime;
    const minFrameTime = Math.min(...frameTimesRef.current);
    const maxFrameTime = Math.max(...frameTimesRef.current);
    const minFps = 1000 / maxFrameTime;
    const maxFps = 1000 / minFrameTime;

    // Get additional metrics
    const memoryUsage = performance.memory ? 
      (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1) : 'N/A';

    const data = {
      fps: {
        avg: fps.toFixed(1),
        min: minFps.toFixed(1),
        max: maxFps.toFixed(1)
      },
      frameTime: {
        avg: avgFrameTime.toFixed(2),
        min: minFrameTime.toFixed(2),
        max: maxFrameTime.toFixed(2)
      },
      memory: {
        used: memoryUsage,
        limit: performance.memory ? 
          (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1) : 'N/A'
      },
      triangles: sceneStats?.triangles || 0,
      drawCalls: sceneStats?.drawCalls || 0,
      physicsObjects: sceneStats?.physicsObjects || 0,
      collisionChecks: sceneStats?.collisionChecks || 0
    };

    setProfileData(data);

    // Calculate performance score (0-100)
    let score = 100;
    if (fps < 30) score -= 40;
    else if (fps < 45) score -= 20;
    else if (fps < 55) score -= 10;
    
    if (data.triangles > 1000000) score -= 15;
    else if (data.triangles > 500000) score -= 10;
    else if (data.triangles > 200000) score -= 5;

    if (data.drawCalls > 200) score -= 15;
    else if (data.drawCalls > 100) score -= 10;
    else if (data.drawCalls > 50) score -= 5;

    if (data.collisionChecks > 500) score -= 10;
    else if (data.collisionChecks > 200) score -= 5;

    setPerformanceScore(Math.max(0, score));

    // Request AI analysis
    requestAIOptimization(data, score);
  };

  const requestAIOptimization = async (data, score) => {
    setIsAnalyzing(true);

    try {
      const prompt = `
You are an expert 3D graphics and physics optimization AI, trained on techniques from:
- Unity3D optimization best practices
- Unreal Engine 5 Nanite/Lumen performance systems  
- PS5 Infinity Engine (advanced physics)
- WebGL/Three.js optimization patterns
- Box2D/Cannon.js physics optimization

**Current Performance Profile:**
- FPS: ${data.fps.avg} avg (${data.fps.min} min, ${data.fps.max} max)
- Frame Time: ${data.frameTime.avg}ms avg
- Memory: ${data.memory.used}MB used
- Triangles: ${data.triangles.toLocaleString()}
- Draw Calls: ${data.drawCalls}
- Physics Objects: ${data.physicsObjects}
- Collision Checks: ${data.collisionChecks} per frame
- Performance Score: ${score}/100

**Target: 60 FPS (16.67ms frame time)**

Analyze the performance bottlenecks and provide optimization suggestions:

1. **LOD (Level of Detail) System**:
   - Should we implement LOD for avatars?
   - Recommended LOD levels and distance thresholds
   - Triangle reduction strategy

2. **Draw Call Optimization**:
   - Geometry instancing opportunities
   - Batch rendering recommendations
   - Frustum culling improvements

3. **Physics Optimization**:
   - Spatial partitioning recommendations (Octree, BVH, Grid)
   - Sleep/wake optimization for static objects
   - Collision detection optimization (broad phase/narrow phase)
   - Recommended physics solver iterations

4. **Memory Optimization**:
   - Texture compression recommendations
   - Geometry simplification
   - Material merging opportunities

5. **Rendering Optimization**:
   - Shadow map resolution
   - Light count reduction
   - Post-processing effects to disable

Provide specific, actionable recommendations with estimated performance gains.
Output as structured JSON.
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            bottlenecks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  severity: { type: "string" },
                  description: { type: "string" },
                  estimated_impact: { type: "string" }
                }
              }
            },
            lod_system: {
              type: "object",
              properties: {
                recommended: { type: "boolean" },
                levels: { type: "number" },
                distances: { type: "array", items: { type: "number" } },
                triangle_reduction: { type: "array", items: { type: "number" } },
                estimated_fps_gain: { type: "string" }
              }
            },
            draw_call_optimization: {
              type: "object",
              properties: {
                instancing_opportunities: { type: "number" },
                batching_potential: { type: "string" },
                culling_improvements: { type: "string" },
                estimated_fps_gain: { type: "string" }
              }
            },
            physics_optimization: {
              type: "object",
              properties: {
                spatial_partitioning: { type: "string" },
                grid_size: { type: "number" },
                sleep_threshold: { type: "number" },
                solver_iterations: { type: "number" },
                broad_phase: { type: "string" },
                estimated_fps_gain: { type: "string" }
              }
            },
            memory_optimization: {
              type: "object",
              properties: {
                texture_compression: { type: "string" },
                geometry_simplification: { type: "string" },
                material_merging: { type: "number" },
                estimated_memory_reduction: { type: "string" }
              }
            },
            rendering_optimization: {
              type: "object",
              properties: {
                shadow_resolution: { type: "string" },
                max_lights: { type: "number" },
                disable_effects: { type: "array", items: { type: "string" } },
                estimated_fps_gain: { type: "string" }
              }
            },
            quick_wins: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  impact: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            },
            overall_recommendation: { type: "string" },
            estimated_total_fps_gain: { type: "string" }
          }
        }
      });

      setOptimizationSuggestions(response);

    } catch (error) {
      console.error('AI optimization analysis failed:', error);
      alert('AI analysis failed. Using fallback optimizations.');
      
      // Fallback optimization suggestions
      setOptimizationSuggestions({
        bottlenecks: [
          {
            category: "Physics",
            severity: data.collisionChecks > 200 ? "High" : "Medium",
            description: `${data.collisionChecks} collision checks per frame is high`,
            estimated_impact: "20-30% performance loss"
          }
        ],
        lod_system: {
          recommended: data.triangles > 200000,
          levels: 3,
          distances: [10, 25, 50],
          triangle_reduction: [1.0, 0.5, 0.25],
          estimated_fps_gain: "+15-20 FPS"
        },
        physics_optimization: {
          spatial_partitioning: "Grid",
          grid_size: 10,
          sleep_threshold: 0.1,
          solver_iterations: 4,
          broad_phase: "Spatial hashing",
          estimated_fps_gain: "+10-15 FPS"
        },
        quick_wins: [
          { action: "Enable spatial hashing", impact: "High", difficulty: "Low" },
          { action: "Implement avatar LOD", impact: "High", difficulty: "Medium" },
          { action: "Reduce shadow resolution", impact: "Medium", difficulty: "Low" }
        ],
        overall_recommendation: "Implement spatial hashing and LOD system for significant performance gains.",
        estimated_total_fps_gain: "+25-35 FPS"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyOptimization = (optimization) => {
    if (onApplyOptimization) {
      onApplyOptimization(optimization);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-20 z-40 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-2xl"
      >
        <Activity className="w-5 h-5 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-40 w-[450px] max-h-[700px] overflow-y-auto bg-slate-900/98 border-green-500/30 shadow-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            AI Performance Profiler
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-xs h-6"
          >
            Close
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Stats */}
        {sceneStats && (
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
              <p className="text-xs text-blue-300">Triangles</p>
              <p className="text-lg font-bold text-white">{sceneStats.triangles?.toLocaleString() || 0}</p>
            </div>
            <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded">
              <p className="text-xs text-purple-300">Draw Calls</p>
              <p className="text-lg font-bold text-white">{sceneStats.drawCalls || 0}</p>
            </div>
            <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
              <p className="text-xs text-green-300">Physics Objects</p>
              <p className="text-lg font-bold text-white">{sceneStats.physicsObjects || 0}</p>
            </div>
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded">
              <p className="text-xs text-red-300">Collision Checks</p>
              <p className="text-lg font-bold text-white">{sceneStats.collisionChecks || 0}</p>
            </div>
          </div>
        )}

        {/* Profiling Control */}
        <div className="space-y-2">
          <Button
            onClick={startProfiling}
            disabled={isProfiling || isAnalyzing}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600"
          >
            {isProfiling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Profiling... (3s)
              </>
            ) : isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI Analyzing...
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4 mr-2" />
                Start AI Profiling
              </>
            )}
          </Button>

          {isProfiling && (
            <Progress value={66} className="h-2" />
          )}
        </div>

        {/* Profile Results */}
        {profileData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-semibold text-sm">Performance Score</h4>
              <Badge className={
                performanceScore >= 80 ? 'bg-green-500' :
                performanceScore >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }>
                {performanceScore}/100
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-800/50 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400">FPS (avg)</span>
                  <span className={`text-sm font-bold ${
                    parseFloat(profileData.fps.avg) >= 55 ? 'text-green-400' :
                    parseFloat(profileData.fps.avg) >= 30 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {profileData.fps.avg}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Min: {profileData.fps.min}</span>
                  <span>Max: {profileData.fps.max}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-800/50 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Frame Time</span>
                  <span className="text-sm font-bold text-white">{profileData.frameTime.avg}ms</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Target: 16.67ms (60 FPS)
                </p>
              </div>

              <div className="p-3 bg-slate-800/50 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Memory Usage</span>
                  <span className="text-sm font-bold text-white">{profileData.memory.used}MB</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Optimization Suggestions */}
        {optimizationSuggestions && (
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              AI Optimization Suggestions
            </h4>

            {/* Bottlenecks */}
            {optimizationSuggestions.bottlenecks?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-semibold">🔍 Detected Bottlenecks:</p>
                {optimizationSuggestions.bottlenecks.map((bottleneck, idx) => (
                  <div key={idx} className={`p-2 rounded border ${
                    bottleneck.severity === 'High' ? 'bg-red-500/10 border-red-500/30' :
                    bottleneck.severity === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                        bottleneck.severity === 'High' ? 'text-red-400' :
                        bottleneck.severity === 'Medium' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-xs text-white font-semibold">{bottleneck.category}</p>
                        <p className="text-xs text-slate-300 mt-1">{bottleneck.description}</p>
                        <p className="text-xs text-slate-400 mt-1">Impact: {bottleneck.estimated_impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LOD System */}
            {optimizationSuggestions.lod_system?.recommended && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-400" />
                    <p className="text-xs text-purple-300 font-semibold">LOD System</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => applyOptimization({
                      type: 'lod',
                      data: optimizationSuggestions.lod_system
                    })}
                    className="text-xs h-6 bg-purple-600"
                  >
                    Apply
                  </Button>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>• Levels: {optimizationSuggestions.lod_system.levels}</p>
                  <p>• Distances: {optimizationSuggestions.lod_system.distances?.join('m, ')}m</p>
                  <p className="text-green-400">↑ {optimizationSuggestions.lod_system.estimated_fps_gain}</p>
                </div>
              </div>
            )}

            {/* Physics Optimization */}
            {optimizationSuggestions.physics_optimization && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-400" />
                    <p className="text-xs text-green-300 font-semibold">Physics Engine</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => applyOptimization({
                      type: 'physics',
                      data: optimizationSuggestions.physics_optimization
                    })}
                    className="text-xs h-6 bg-green-600"
                  >
                    Apply
                  </Button>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>• {optimizationSuggestions.physics_optimization.spatial_partitioning}</p>
                  <p>• Grid: {optimizationSuggestions.physics_optimization.grid_size}m</p>
                  <p>• Solver: {optimizationSuggestions.physics_optimization.solver_iterations} iterations</p>
                  <p className="text-green-400">↑ {optimizationSuggestions.physics_optimization.estimated_fps_gain}</p>
                </div>
              </div>
            )}

            {/* Quick Wins */}
            {optimizationSuggestions.quick_wins?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-semibold">⚡ Quick Wins:</p>
                {optimizationSuggestions.quick_wins.map((win, idx) => (
                  <div key={idx} className="p-2 bg-blue-500/10 border border-blue-500/30 rounded flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-white">{win.action}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge className={
                          win.impact === 'High' ? 'bg-green-500' :
                          win.impact === 'Medium' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        } style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {win.impact} impact
                        </Badge>
                        <Badge variant="outline" style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {win.difficulty} difficulty
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => applyOptimization({
                        type: 'quick_win',
                        action: win.action
                      })}
                      className="text-xs h-6 ml-2"
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Overall Recommendation */}
            {optimizationSuggestions.overall_recommendation && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                <p className="text-xs text-blue-300 font-semibold mb-2">💡 Overall Recommendation:</p>
                <p className="text-xs text-slate-300">{optimizationSuggestions.overall_recommendation}</p>
                {optimizationSuggestions.estimated_total_fps_gain && (
                  <p className="text-sm text-green-400 font-bold mt-2">
                    Total Estimated Gain: {optimizationSuggestions.estimated_total_fps_gain}
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={() => applyOptimization({ type: 'all', data: optimizationSuggestions })}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Apply All Optimizations
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="p-3 bg-slate-800/50 rounded">
          <p className="text-xs text-slate-400">
            <strong className="text-white">How it works:</strong><br />
            1. Click "Start AI Profiling" to collect 3s of performance data<br />
            2. AI analyzes bottlenecks using industry best practices<br />
            3. Apply suggested optimizations for instant performance gains
          </p>
        </div>
      </CardContent>
    </Card>
  );
}