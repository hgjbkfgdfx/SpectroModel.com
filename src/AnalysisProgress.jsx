
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Brain, Zap, Database, Clock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AnalysisProgress({ progress, error }) {
  const getProgressMessage = () => {
    if (progress < 10) return "Calculating audio fingerprint...";
    if (progress < 15) return "Checking database for this audio file...";
    if (progress < 30) return "Uploading your track (this may take a moment)...";
    if (progress < 60) return "Studying audio features (will be saved permanently)...";
    if (progress < 90) return "Comparing to industry standards...";
    return "Saving features for future consistency...";
  };

  const getProgressIcon = () => {
    if (progress < 10) return Database;
    if (progress < 15) return Database;
    if (progress < 30) return Clock;
    if (progress < 60) return Brain;
    return Zap;
  };

  const ProgressIcon = getProgressIcon();

  return (
    <Card className="bg-slate-800/80 border-slate-700/50 shadow-2xl">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold text-white flex items-center justify-center gap-3">
          <Brain className="w-6 h-6 text-purple-400" />
          {progress < 15 ? "Checking Audio Fingerprint" : "Analyzing Your Track"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <div className="absolute -top-2 -right-2">
                <ProgressIcon className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-lg font-medium text-white">
              {getProgressMessage()}
            </p>
            <div className="w-full max-w-md mx-auto space-y-2">
              <Progress 
                value={progress} 
                className="h-3 bg-slate-700"
              />
              <p className="text-sm text-slate-400">
                {Math.round(progress)}% complete
              </p>
            </div>
          </div>
          
          {error && (
            <Alert className="bg-orange-900/30 border-orange-500/50 text-left">
              <AlertCircle className="h-4 w-4 text-orange-400" />
              <AlertDescription className="text-orange-200">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-3 gap-4 text-center pt-4">
            <div className="space-y-2">
              <div className={`w-3 h-3 rounded-full mx-auto ${progress > 10 ? 'bg-purple-400' : 'bg-slate-600'}`} />
              <p className="text-xs text-slate-400">Fingerprint</p>
            </div>
            <div className="space-y-2">
              <div className={`w-3 h-3 rounded-full mx-auto ${progress > 60 ? 'bg-purple-400' : 'bg-slate-600'}`} />
              <p className="text-xs text-slate-400">Study Features</p>
            </div>
            <div className="space-y-2">
              <div className={`w-3 h-3 rounded-full mx-auto ${progress > 90 ? 'bg-purple-400' : 'bg-slate-600'}`} />
              <p className="text-xs text-slate-400">Save Permanently</p>
            </div>
          </div>

          {progress < 15 && !error && (
            <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm text-purple-200">
                🔍 Checking if this audio file was analyzed before for instant, consistent results
              </p>
            </div>
          )}

          {progress > 30 && progress < 90 && !error && (
            <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-200">
                🎵 Audio features being studied will be saved permanently - re-uploading the same file will always show these exact results
              </p>
            </div>
          )}
          
          {progress > 15 && progress < 30 && (
            <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-200">
                ⏳ Large files or high server load may cause slower uploads. Please be patient...
              </p>
            </div>
          )}

          {error && error.includes("timed out") && (
            <div className="mt-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm text-orange-200 mb-2">
                <strong>💡 Tip:</strong> Server experiencing high load. Try:
              </p>
              <ul className="text-xs text-orange-300 list-disc ml-5 space-y-1">
                <li>Waiting a few minutes and trying again</li>
                <li>Using a smaller or compressed file (MP3 recommended)</li>
                <li>Uploading during off-peak hours</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
