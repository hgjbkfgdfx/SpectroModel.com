import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music2, Key, Clock, Activity, BookOpen } from "lucide-react";

export default function MusicalNotationCard({ notation, analysis }) {
  // Render if notation exists (object or string)
  if (!notation) {
    return null;
  }

  // If notation is a string, convert it to object format
  const notationData = typeof notation === 'string' 
    ? { notation_text: notation, key_signature: analysis?.key, time_signature: analysis?.time_signature, tempo: analysis?.tempo }
    : notation;

  return (
    <Card className="bg-slate-800/80 border-slate-700/50 shadow-2xl">
      <CardHeader className="border-b border-slate-700/50">
        <CardTitle className="text-white flex items-center gap-2">
          <Music2 className="w-5 h-5 text-purple-400" />
          Musical Notation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {notationData.key_signature && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
              <Key className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-xs text-slate-400">Key Signature</p>
                <p className="text-white font-semibold">{notationData.key_signature}</p>
              </div>
            </div>
          )}
          
          {notationData.time_signature && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
              <Activity className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">Time Signature</p>
                <p className="text-white font-semibold">{notationData.time_signature}</p>
              </div>
            </div>
          )}
          
          {notationData.tempo && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
              <Clock className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-xs text-slate-400">Tempo</p>
                <p className="text-white font-semibold">{notationData.tempo} BPM</p>
              </div>
            </div>
          )}
        </div>

        {notationData.notation_text && (
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-purple-400 mt-1" />
              <div>
                <h4 className="text-white font-semibold mb-2">Notation Description</h4>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {notationData.notation_text}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm flex items-center gap-2">
            <Music2 className="w-4 h-4" />
            This notation is AI-generated based on audio analysis. For performance, refer to official sheet music when available.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}