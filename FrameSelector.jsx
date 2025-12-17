import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Upload, X, Brain, Shield } from "lucide-react";

export default function FrameSelector({ 
  startFrame, 
  endFrame, 
  onStartFrameChange, 
  onEndFrameChange,
  mlDataCollector 
}) {
  const [startPreview, setStartPreview] = useState(null);
  const [endPreview, setEndPreview] = useState(null);
  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  const handleStartFrameUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const url = URL.createObjectURL(file);
    setStartPreview(url);
    onStartFrameChange(file);

    if (mlDataCollector) {
      mlDataCollector.record('start_frame_uploaded', {
        feature: 'video_studio',
        fileName: file.name,
        fileSize: file.size,
        timestamp: Date.now()
      });
    }
  };

  const handleEndFrameUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const url = URL.createObjectURL(file);
    setEndPreview(url);
    onEndFrameChange(file);

    if (mlDataCollector) {
      mlDataCollector.record('end_frame_uploaded', {
        feature: 'video_studio',
        fileName: file.name,
        fileSize: file.size,
        timestamp: Date.now()
      });
    }
  };

  const clearStartFrame = () => {
    setStartPreview(null);
    onStartFrameChange(null);
    if (startInputRef.current) startInputRef.current.value = '';

    if (mlDataCollector) {
      mlDataCollector.record('start_frame_cleared', {
        feature: 'video_studio',
        timestamp: Date.now()
      });
    }
  };

  const clearEndFrame = () => {
    setEndPreview(null);
    onEndFrameChange(null);
    if (endInputRef.current) endInputRef.current.value = '';

    if (mlDataCollector) {
      mlDataCollector.record('end_frame_cleared', {
        feature: 'video_studio',
        timestamp: Date.now()
      });
    }
  };

  return (
    <Card className="bg-slate-950/80 border-purple-700/50 backdrop-blur-xl hover-lift">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          Frame Selection
        </CardTitle>
        <p className="text-slate-400 text-sm">Define start and end frames for animation</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Card className="bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border-cyan-500/40">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
              <Shield className="w-4 h-4 text-green-400" />
              <p className="text-white text-xs font-semibold">🤖 AI Learning Frame Transitions • Encrypted • Security Active</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Start Frame */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-white font-semibold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-green-400" />
                Start Frame
                <Badge className="bg-green-500 text-xs">Required</Badge>
              </Label>
              {startPreview && (
                <Button
                  onClick={clearStartFrame}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 h-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="relative">
              {startPreview ? (
                <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden border-2 border-green-500/50">
                  <img src={startPreview} alt="Start frame" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div 
                  onClick={() => startInputRef.current?.click()}
                  className="aspect-video bg-slate-800 rounded-lg border-2 border-dashed border-slate-600 hover:border-purple-500 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-8 h-8 text-slate-500" />
                  <p className="text-slate-400 text-sm">Click to upload</p>
                </div>
              )}
              <input
                ref={startInputRef}
                type="file"
                accept="image/*"
                onChange={handleStartFrameUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* End Frame */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-white font-semibold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                End Frame
                <Badge className="bg-slate-600 text-xs">Optional</Badge>
              </Label>
              {endPreview && (
                <Button
                  onClick={clearEndFrame}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 h-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="relative">
              {endPreview ? (
                <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden border-2 border-blue-500/50">
                  <img src={endPreview} alt="End frame" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div 
                  onClick={() => endInputRef.current?.click()}
                  className="aspect-video bg-slate-800 rounded-lg border-2 border-dashed border-slate-600 hover:border-purple-500 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-8 h-8 text-slate-500" />
                  <p className="text-slate-400 text-sm">Click to upload</p>
                  <p className="text-slate-500 text-xs">Optional</p>
                </div>
              )}
              <input
                ref={endInputRef}
                type="file"
                accept="image/*"
                onChange={handleEndFrameUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300 text-center">
            💡 Start frame is required. Add end frame for smooth transitions between two states.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}