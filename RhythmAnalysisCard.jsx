import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Music2, Activity, Zap, Target } from "lucide-react";

export default function RhythmAnalysisCard({ rhythmAnalysis, rhythmQuality }) {
  if (!rhythmAnalysis) return null;

  const getComplexityColor = (complexity) => {
    const colors = {
      simple: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      moderate: "bg-green-500/20 text-green-300 border-green-500/30",
      complex: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      highly_complex: "bg-orange-500/20 text-orange-300 border-orange-500/30"
    };
    return colors[complexity] || colors.moderate;
  };

  const getRhythmQualityLabel = (score) => {
    if (score >= 9) return { label: "Legendary", color: "text-yellow-400", desc: "Michael Jackson / Prince level perfection" };
    if (score >= 7) return { label: "Professional", color: "text-green-400", desc: "Billboard Hot 100 standard" };
    if (score >= 5) return { label: "Decent", color: "text-blue-400", desc: "Good independent quality" };
    if (score >= 3) return { label: "Weak", color: "text-orange-400", desc: "Needs improvement" };
    return { label: "Poor", color: "text-red-400", desc: "Significant rhythm issues" };
  };

  const rhythmRating = getRhythmQualityLabel(rhythmQuality || 5);
  const complexityColor = getComplexityColor(rhythmAnalysis.rhythmic_complexity);

  const rhythmMetrics = [
    { name: "Groove Quality", value: rhythmAnalysis.groove_quality, icon: Music2 },
    { name: "Timing Precision", value: rhythmAnalysis.timing_precision, icon: Target },
    { name: "Pocket Strength", value: rhythmAnalysis.pocket_strength, icon: Activity },
    { name: "Swing Factor", value: rhythmAnalysis.swing_factor, icon: Zap },
    { name: "Syncopation Level", value: rhythmAnalysis.syncopation_level, icon: Music2 },
    { name: "Drum Programming", value: rhythmAnalysis.drum_programming_quality, icon: Activity },
    { name: "Bass-Rhythm Lock", value: rhythmAnalysis.bass_rhythm_lock, icon: Target }
  ];

  return (
    <Card className="bg-slate-800/80 border-slate-700/50 shadow-2xl">
      <CardHeader className="pb-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-400" />
            Rhythm Detection & Groove Analysis
          </CardTitle>
          <Badge variant="outline" className="border-purple-500/30 text-purple-300">
            Industry Standard Model
          </Badge>
        </div>
        <p className="text-sm text-slate-400 mt-2">
          Trained on Billboard hits and legendary artists (MJ, Prince, James Brown)
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Overall Rhythm Quality Score */}
        <div className="text-center p-6 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
          <p className="text-sm text-slate-400 mb-2">Overall Rhythm Quality</p>
          <div className="flex items-center justify-center gap-4">
            <span className={`text-4xl font-bold ${rhythmRating.color}`}>
              {rhythmQuality?.toFixed(1)}/10
            </span>
            <div className="text-left">
              <Badge variant="outline" className={`${rhythmRating.color.replace('text', 'bg').replace('400', '500/20')} border-${rhythmRating.color.split('-')[1]}-500/30 text-${rhythmRating.color.split('-')[1]}-300`}>
                {rhythmRating.label}
              </Badge>
              <p className="text-xs text-slate-400 mt-1">{rhythmRating.desc}</p>
            </div>
          </div>
        </div>

        {/* Rhythm Metrics Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {rhythmMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.name} className="space-y-3 p-4 rounded-lg bg-slate-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-slate-200">{metric.name}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{metric.value?.toFixed(1)}/10</span>
                </div>
                <Progress value={metric.value * 10} className="h-2 bg-slate-700" />
              </div>
            );
          })}
        </div>

        {/* Rhythmic Complexity */}
        <div className="p-4 rounded-lg bg-slate-700/30">
          <p className="text-sm text-slate-400 mb-3">Rhythmic Complexity</p>
          <Badge variant="outline" className={`${complexityColor} border px-4 py-2 text-base capitalize`}>
            {rhythmAnalysis.rhythmic_complexity?.replace('_', ' ')}
          </Badge>
        </div>

        {/* Industry Comparison */}
        {rhythmAnalysis.industry_comparison && (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-300 mb-2">Industry Benchmark</p>
                <p className="text-sm text-slate-200">{rhythmAnalysis.industry_comparison}</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-slate-500 text-center pt-4 border-t border-slate-700/50">
          Rhythm analysis based on Billboard Hot 100 patterns and legendary artist standards
        </div>
      </CardContent>
    </Card>
  );
}