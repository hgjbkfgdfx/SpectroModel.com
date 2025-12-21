import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, MonitorOff, Users, Brain, Shield } from "lucide-react";

export default function ScreenShare({ currentUser, members = [], canShare = true }) {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startShare = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsSharing(true);
      
      stream.getVideoTracks()[0].onended = () => {
        stopShare();
      };
    } catch (err) {
      setError('Screen sharing cancelled or denied.');
    }
  };

  const stopShare = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsSharing(false);
  };

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-400" />
            Screen Share
          </CardTitle>
          {isSharing && <Badge className="bg-blue-500 text-white animate-pulse">● SHARING</Badge>}
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <Brain className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-cyan-300">🤖 AI Learning</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-400" />
            <span className="text-[10px] text-green-300">🛡️ Secure</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {isSharing ? (
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Monitor className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Share your screen with team</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">{error}</div>
        )}

        <div className="flex justify-center">
          {!isSharing ? (
            <Button onClick={startShare} disabled={!canShare} className="bg-blue-600 hover:bg-blue-700">
              <Monitor className="w-4 h-4 mr-2" /> Start Screen Share
            </Button>
          ) : (
            <Button onClick={stopShare} variant="destructive">
              <MonitorOff className="w-4 h-4 mr-2" /> Stop Sharing
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}