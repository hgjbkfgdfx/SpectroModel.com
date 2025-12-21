import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, ArrowLeft } from "lucide-react";

export default function RhythmAnalysisResults({ analysis, onNewAnalysis, onBackToDashboard }) {
  const result = analysis || {};
  const rhythmAnalysis = result.rhythm_analysis || {};
  const audioFeatures = result.audio_features || rhythmAnalysis.audio_features || {};
  
  const displayRhythmQuality = React.useMemo(() => {
    if (audioFeatures.rhythm_quality !== undefined && audioFeatures.rhythm_quality !== null) {
      return audioFeatures.rhythm_quality;
    }
    if (rhythmAnalysis.rhythm_quality !== undefined && rhythmAnalysis.rhythm_quality !== null && rhythmAnalysis.rhythm_quality > 0) {
      return rhythmAnalysis.rhythm_quality;
    }
    if (result.rhythm_quality !== undefined && result.rhythm_quality !== null && result.rhythm_quality > 0) {
      return result.rhythm_quality;
    }
    return 5;
  }, [audioFeatures, rhythmAnalysis, result.rhythm_quality]);

  const getRhythmQualityColor = (score) => {
    if (score >= 9) return "from-yellow-400 to-yellow-500";
    if (score >= 7) return "from-green-400 to-emerald-500";
    if (score >= 5) return "from-blue-400 to-cyan-400";
    if (score >= 3) return "from-orange-400 to-orange-500";
    return "from-red-400 to-red-600";
  };

  const getRhythmQualityLabel = (score) => {
    if (score >= 9) return { label: "Legendary", desc: "Michael Jackson level" };
    if (score >= 7) return { label: "Professional", desc: "Billboard standard" };
    if (score >= 5) return { label: "Decent", desc: "Good quality" };
    if (score >= 3) return { label: "Weak", desc: "Needs work" };
    return { label: "Poor", desc: "Rhythm issues" };
  };

  const rhythmQualityLabel = getRhythmQualityLabel(displayRhythmQuality);

  const renderRhythmData = () => {
    const dataToRender = [];
    
    Object.entries(rhythmAnalysis).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        dataToRender.push({ key, value });
      }
    });

    if (rhythmAnalysis.groove_interpretation) {
      const groove = rhythmAnalysis.groove_interpretation;
      if (groove.tempo) dataToRender.push({ key: 'tempo', value: groove.tempo });
      if (groove.time_signature) dataToRender.push({ key: 'time_signature', value: groove.time_signature });
      if (groove.rhythm_quality !== undefined) dataToRender.push({ key: 'rhythm_quality_dsp', value: groove.rhythm_quality });
    }

    if (audioFeatures.tempo) dataToRender.push({ key: 'tempo_bpm', value: Math.round(audioFeatures.tempo) });
    if (audioFeatures.energy !== undefined) dataToRender.push({ key: 'energy', value: audioFeatures.energy });
    if (audioFeatures.danceability !== undefined) dataToRender.push({ key: 'danceability', value: audioFeatures.danceability });

    return dataToRender;
  };

  const dataItems = renderRhythmData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button
          variant="outline"
          onClick={onBackToDashboard}
          className="bg-gradient-to-r from-orange-600 to-pink-600 text-white font-bold border-none hover:from-orange-700 hover:to-pink-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Dashboard
        </Button>

        <Card className="bg-white border-slate-300">
          <CardHeader>
            <CardTitle className="text-black font-black flex items-center gap-2 flex-wrap">
              <Activity className="w-6 h-6 shrink-0" />
              <span className="break-words">Rhythm Analysis Results</span>
            </CardTitle>
            <div className="mt-4">
              <h2 className="text-2xl md:text-3xl font-black text-black mb-1 break-words">
                "{result.track_name || 'Unknown Track'}"
              </h2>
              <p className="text-lg md:text-xl font-black text-slate-700 break-words">
                by {result.artist_name || 'Unknown Artist'}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 md:p-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border-2 border-purple-500/30">
              <div className="text-center">
                <p className="text-sm text-slate-700 mb-2">DSP Rhythm Quality</p>
                <div className={`text-4xl md:text-6xl font-black bg-gradient-to-r ${getRhythmQualityColor(displayRhythmQuality)} bg-clip-text text-transparent mb-2`}>
                  {displayRhythmQuality.toFixed(1)}/10
                </div>
                <Badge className={`bg-gradient-to-r ${getRhythmQualityColor(displayRhythmQuality)} text-white text-base md:text-lg px-3 md:px-4 py-1 mb-2`}>
                  {rhythmQualityLabel.label}
                </Badge>
                <p className="text-slate-600 text-xs md:text-sm break-words">{rhythmQualityLabel.desc}</p>
              </div>
            </div>

            <div className="space-y-4">
              {dataItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dataItems.map(({ key, value }) => (
                    <div key={key} className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                        <span className="font-black text-black text-sm md:text-base capitalize break-words">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="font-black text-black text-xl md:text-2xl break-words">
                          {typeof value === 'number' ? 
                            (value < 2 ? value.toFixed(2) : value.toFixed(1)) 
                            : value}
                        </span>
                      </div>
                      {typeof value === 'number' && value <= 1 && (
                        <Progress value={value * 100} className="h-2 md:h-3 mt-2" />
                      )}
                      {typeof value === 'number' && value > 1 && value <= 10 && (
                        <Progress value={value * 10} className="h-2 md:h-3 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 md:p-8 bg-slate-50 rounded-lg border-2 border-slate-200 text-center">
                  <p className="text-slate-600 break-words">No detailed rhythm data available</p>
                  <p className="text-xs md:text-sm text-slate-500 mt-2 break-words">Analysis may still be processing</p>
                </div>
              )}
            </div>

            {rhythmAnalysis.groove_interpretation?.groove_characteristics && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                <h3 className="text-black font-bold text-base md:text-lg mb-3">🎵 Groove Characteristics</h3>
                <div className="space-y-2">
                  {Object.entries(rhythmAnalysis.groove_interpretation.groove_characteristics).map(([key, value]) => (
                    <div key={key} className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-2">
                      <span className="text-slate-700 font-semibold capitalize break-words text-sm md:text-base">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-black font-bold break-words text-sm md:text-base">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rhythmAnalysis.groove_interpretation?.recommendations && Array.isArray(rhythmAnalysis.groove_interpretation.recommendations) && rhythmAnalysis.groove_interpretation.recommendations.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                <h3 className="text-black font-bold text-base md:text-lg mb-3">💡 Recommendations</h3>
                <ul className="space-y-2">
                  {rhythmAnalysis.groove_interpretation.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold shrink-0">•</span>
                      <span className="text-slate-700 break-words text-sm md:text-base">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={onNewAnalysis}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold text-base md:text-lg py-4 md:py-6"
        >
          Analyze Another Track
        </Button>
      </div>
    </div>
  );
}