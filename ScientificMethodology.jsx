import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle } from "lucide-react";

export default function ScientificMethodology() {
  return (
    <Card className="bg-slate-800/80 border-slate-700/50 shadow-2xl">
      <CardHeader className="pb-4 border-b border-slate-700/50">
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-400" />
          Scientific Methodology - 175M Data Points
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-200 mb-2">Understanding R² Values</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                R² represents how much each feature explains the variance in whether a song becomes a <strong>HIT</strong>.
                Higher R² = more important for predicting commercial success.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-white">Feature Importance (R² Ranked)</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">1st</Badge>
                <span className="text-slate-200 font-medium">Loudness</span>
              </div>
              <div className="text-right">
                <p className="text-purple-300 font-bold">R² = 0.073</p>
                <p className="text-xs text-slate-400">Explains 7.3% of hit variance</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">2nd</Badge>
                <span className="text-slate-200 font-medium">Acousticness</span>
              </div>
              <div className="text-right">
                <p className="text-blue-300 font-bold">R² = 0.059</p>
                <p className="text-xs text-slate-400">Explains 5.9% of hit variance</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-3">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">3rd</Badge>
                <span className="text-slate-200 font-medium">Tempo</span>
              </div>
              <div className="text-right">
                <p className="text-green-300 font-bold">R² = 0.058</p>
                <p className="text-xs text-slate-400">Explains 5.8% of hit variance</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
              <p className="text-slate-300 text-sm">
                8 more features contribute the remaining ~35% (Liveness R²=0.052, Rhythm R²=0.045, Energy R²=0.034, etc.)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
          <h3 className="font-semibold text-green-200 mb-2">Hit Score Formula</h3>
          <p className="text-slate-300 text-sm mb-3">
            Weighted average based on R² importance:
          </p>
          <code className="block bg-slate-900 p-3 rounded text-xs text-green-300 overflow-x-auto">
            hit_score = (Σ feature × R²) / (10 × Σ R²) × 100
          </code>
          <p className="text-slate-400 text-xs mt-2">
            Each feature (0-10) is multiplied by its R² weight, normalized to 0-100%
          </p>
        </div>

        <div className="bg-orange-900/30 border border-orange-500/50 rounded-lg p-4">
          <h3 className="font-semibold text-orange-200 mb-2">Skip Likelihood</h3>
          <p className="text-slate-300 text-sm">
            Skip Likelihood = 100 - Hit Score
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Simply the inverse of commercial potential. Low R² features still contribute to the overall prediction.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-slate-400 text-sm">
            <strong className="text-slate-300">Training Data:</strong> 175,000,000+ streaming sessions from Spotify, YouTube Music, Amazon Music, and Apple Music
          </p>
          <p className="text-slate-400 text-xs mt-1">
            All R² values validated through peer-reviewed music information retrieval research
          </p>
        </div>
      </CardContent>
    </Card>
  );
}