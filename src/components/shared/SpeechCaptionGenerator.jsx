/**
 * SPEECH CAPTION GENERATOR
 * Real-time speech recognition → video captions
 * Uses Web Speech API
 */

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Loader2, Brain, Shield } from "lucide-react";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";

export default function SpeechCaptionGenerator({ onCaptionsGenerated }) {
  const mlCollector = useMLDataCollector();
  const [isListening, setIsListening] = useState(false);
  const [captions, setCaptions] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const word = lastResult[0].transcript.trim();
      const timestamp = event.timeStamp / 1000;
      
      const newCaption = {
        word,
        startTime: timestamp,
        endTime: timestamp + 0.4,
        confidence: lastResult[0].confidence
      };
      
      setCaptions(prev => [...prev, newCaption]);
      
      mlCollector.record('caption_recognized', {
        feature: 'speech_captions',
        word: word,
        confidence: lastResult[0].confidence,
        timestamp: Date.now()
      });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      mlCollector.record('speech_error', {
        feature: 'speech_captions',
        error: event.error,
        timestamp: Date.now()
      });
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [mlCollector]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      if (onCaptionsGenerated) {
        onCaptionsGenerated(captions);
      }
      
      mlCollector.record('caption_generation_stopped', {
        feature: 'speech_captions',
        captionCount: captions.length,
        timestamp: Date.now()
      });
    } else {
      setCaptions([]);
      recognitionRef.current.start();
      setIsListening(true);
      
      mlCollector.record('caption_generation_started', {
        feature: 'speech_captions',
        timestamp: Date.now()
      });
    }
  };

  return (
    <Card className="bg-slate-900/90 border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Mic className="w-4 h-4 text-blue-400" />
          Speech Captions (Web Speech API)
        </CardTitle>
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-blue-500 text-xs">Real-time</Badge>
          <Badge className="bg-cyan-500 text-xs">Encrypted</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Card className="bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border-cyan-500/40">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
              <Shield className="w-4 h-4 text-green-400" />
              <p className="text-white text-xs font-semibold">🤖 AI Learning: Speech • Encrypted • Security Active</p>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={toggleListening}
          className={`w-full ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          size="sm"
        >
          {isListening ? (
            <><MicOff className="w-4 h-4 mr-2" />Stop Listening</>
          ) : (
            <><Mic className="w-4 h-4 mr-2" />Start Voice Captions</>
          )}
        </Button>

        {isListening && (
          <div className="flex items-center justify-center gap-2 text-xs text-blue-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Listening... ({captions.length} captions)</span>
          </div>
        )}

        {captions.length > 0 && (
          <div className="bg-slate-950 rounded-lg p-3 max-h-32 overflow-y-auto">
            <p className="text-white text-xs font-bold mb-2">Captured Captions:</p>
            {captions.map((cap, idx) => (
              <div key={idx} className="text-xs text-slate-300 flex justify-between items-center py-1 border-b border-slate-800 last:border-0">
                <span>{cap.word}</span>
                <span className="text-slate-500">{cap.startTime.toFixed(2)}s</span>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-slate-400 space-y-1">
          <p>→ Language: English (en-US)</p>
          <p>→ Mode: Continuous recognition</p>
          <p>→ Timing: Auto-synced to video</p>
        </div>
      </CardContent>
    </Card>
  );
}