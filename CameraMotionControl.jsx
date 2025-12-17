import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Move, Zap, Brain, Shield } from "lucide-react";

const CAMERA_MOTIONS = [
  { id: 'zoom-in', name: 'Zoom In', description: 'Dramatic zoom into subject', intensity: 'medium' },
  { id: 'zoom-out', name: 'Zoom Out', description: 'Reveal the scene', intensity: 'medium' },
  { id: 'pan-left', name: 'Pan Left', description: 'Smooth horizontal sweep left', intensity: 'low' },
  { id: 'pan-right', name: 'Pan Right', description: 'Smooth horizontal sweep right', intensity: 'low' },
  { id: 'tilt-up', name: 'Tilt Up', description: 'Vertical upward movement', intensity: 'low' },
  { id: 'tilt-down', name: 'Tilt Down', description: 'Vertical downward movement', intensity: 'low' },
  { id: 'dolly-in', name: 'Dolly In', description: 'Physical move towards subject', intensity: 'high' },
  { id: 'dolly-out', name: 'Dolly Out', description: 'Physical move away', intensity: 'high' },
  { id: 'orbit-left', name: 'Orbit Left', description: 'Circular motion counterclockwise', intensity: 'high' },
  { id: 'orbit-right', name: 'Orbit Right', description: 'Circular motion clockwise', intensity: 'high' },
  { id: 'static', name: 'Static', description: 'No camera movement', intensity: 'none' },
  { id: 'handheld', name: 'Handheld', description: 'Dynamic handheld shake', intensity: 'medium' },
];

export default function CameraMotionControl({ selectedMotion, onMotionChange, mlDataCollector }) {
  const handleMotionSelect = (motionId) => {
    onMotionChange(motionId);
    
    if (mlDataCollector) {
      mlDataCollector.record('camera_motion_selected', {
        feature: 'video_studio',
        motion: motionId,
        timestamp: Date.now()
      });
    }
  };

  return (
    <Card className="bg-slate-950/80 border-purple-700/50 backdrop-blur-xl hover-lift">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Camera className="w-5 h-5 text-purple-400" />
          Camera Motion Control
        </CardTitle>
        <p className="text-slate-400 text-sm">Choose how your camera moves</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Card className="bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border-cyan-500/40">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
              <Shield className="w-4 h-4 text-green-400" />
              <p className="text-white text-xs font-semibold">🤖 AI Learning Camera Preferences • Encrypted • Security Active</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CAMERA_MOTIONS.map((motion) => {
            const isSelected = selectedMotion === motion.id;
            const intensityColors = {
              'none': 'bg-slate-500/20 text-slate-400',
              'low': 'bg-blue-500/20 text-blue-400',
              'medium': 'bg-purple-500/20 text-purple-400',
              'high': 'bg-pink-500/20 text-pink-400'
            };

            return (
              <Button
                key={motion.id}
                onClick={() => handleMotionSelect(motion.id)}
                variant={isSelected ? "default" : "outline"}
                className={`h-auto flex flex-col items-start p-4 ${
                  isSelected 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none' 
                    : 'border-slate-600 text-white hover:bg-purple-700/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 w-full">
                  <Move className="w-4 h-4" />
                  <span className="font-bold text-sm">{motion.name}</span>
                </div>
                <p className="text-xs opacity-80 text-left mb-2">{motion.description}</p>
                <Badge className={intensityColors[motion.intensity]}>
                  {motion.intensity === 'none' ? 'No Motion' : `${motion.intensity} intensity`}
                </Badge>
              </Button>
            );
          })}
        </div>

        {selectedMotion && (
          <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <p className="text-white font-semibold text-sm">Selected Motion</p>
            </div>
            <p className="text-purple-300 text-sm">
              {CAMERA_MOTIONS.find(m => m.id === selectedMotion)?.name} - 
              {CAMERA_MOTIONS.find(m => m.id === selectedMotion)?.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}