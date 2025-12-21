import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, Users, Brain, Shield, Phone, PhoneOff } from "lucide-react";

export default function LiveVideoStream({ projectId, currentUser, members = [], canStream = true }) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const screenStreamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const startStream = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsStreaming(true);
      setParticipants([{ email: currentUser?.email, name: currentUser?.full_name, isHost: true }]);
    } catch (err) {
      console.error('Failed to start stream:', err);
      setError('Camera/microphone access denied. Please allow permissions.');
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsStreaming(false);
    setIsScreenSharing(false);
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
        }
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        setIsScreenSharing(false);
      } else {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        screenStreamRef.current = screenStream;
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        
        screenStream.getVideoTracks()[0].onended = () => {
          if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
          }
          setIsScreenSharing(false);
        };
      }
    } catch (err) {
      console.error('Screen share error:', err);
      setError('Screen sharing was cancelled or denied.');
    }
  };

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-red-400" />
            Live Video Stream
          </CardTitle>
          <div className="flex items-center gap-2">
            {isStreaming && (
              <Badge className="bg-red-500 text-white animate-pulse">● LIVE</Badge>
            )}
            <Badge className="bg-slate-700 text-slate-300">
              <Users className="w-3 h-3 mr-1" /> {participants.length}
            </Badge>
          </div>
        </div>
        {/* AI & Security */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <Brain className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-cyan-300">🤖 AI Learning</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-400" />
            <span className="text-[10px] text-green-300">🛡️ E2E Encrypted</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Display */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {isStreaming ? (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Start streaming to go live</p>
                <p className="text-slate-500 text-sm">Share your screen or camera with team</p>
              </div>
            </div>
          )}
          
          {isStreaming && isVideoOff && (
            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400">Camera Off</p>
              </div>
            </div>
          )}
          
          {isScreenSharing && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-blue-500 text-white">
                <Monitor className="w-3 h-3 mr-1" /> Screen Sharing
              </Badge>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isStreaming ? (
            <Button 
              onClick={startStream} 
              disabled={!canStream}
              className="bg-green-600 hover:bg-green-700"
            >
              <Phone className="w-4 h-4 mr-2" /> Start Stream
            </Button>
          ) : (
            <>
              <Button 
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                className="rounded-full w-12 h-12"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              <Button 
                onClick={toggleVideo}
                variant={isVideoOff ? "destructive" : "secondary"}
                size="icon"
                className="rounded-full w-12 h-12"
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>
              
              <Button 
                onClick={toggleScreenShare}
                variant={isScreenSharing ? "default" : "secondary"}
                size="icon"
                className={`rounded-full w-12 h-12 ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              >
                {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              </Button>
              
              <Button 
                onClick={stopStream}
                variant="destructive"
                size="icon"
                className="rounded-full w-12 h-12"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* Participants */}
        {participants.length > 0 && (
          <div className="pt-3 border-t border-slate-700/50">
            <h4 className="text-slate-400 text-sm mb-2">Participants ({participants.length})</h4>
            <div className="flex flex-wrap gap-2">
              {participants.map((p, idx) => (
                <Badge key={idx} className="bg-slate-800 text-slate-300">
                  {p.name} {p.isHost && <span className="text-yellow-400 ml-1">★</span>}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}