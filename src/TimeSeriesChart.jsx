import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Clock, 
  Calendar, 
  DollarSign, 
  Target,
  Zap,
  Radio,
  Music2,
  Flame
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function TimeSeriesChart({ prediction }) {
  if (!prediction) return null;

  const trajectoryConfig = {
    instant_hit: {
      color: "bg-red-500/20 text-red-300 border-red-500/30",
      icon: Zap,
      label: "Instant Hit",
      description: "Debuts high, peaks quickly within 1-4 weeks"
    },
    slow_burner: {
      color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      icon: TrendingUp,
      label: "Slow Burner",
      description: "Gradually climbs over 8-20 weeks, sustained growth"
    },
    viral_explosion: {
      color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      icon: Flame,
      label: "Viral Explosion",
      description: "Sudden social media breakthrough, rapid rise"
    },
    steady_climber: {
      color: "bg-green-500/20 text-green-300 border-green-500/30",
      icon: TrendingUp,
      label: "Steady Climber",
      description: "Consistent week-over-week growth, reliable"
    },
    sleeper_hit: {
      color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      icon: Clock,
      label: "Sleeper Hit",
      description: "Breaks through after initial quiet period"
    }
  };

  const marketingConfig = {
    minimal: { color: "bg-green-500/20 text-green-300", label: "Minimal", icon: "💡" },
    moderate: { color: "bg-blue-500/20 text-blue-300", label: "Moderate", icon: "📈" },
    heavy: { color: "bg-orange-500/20 text-orange-300", label: "Heavy", icon: "🚀" },
    intensive: { color: "bg-red-500/20 text-red-300", label: "Intensive", icon: "💰" }
  };

  const seasonConfig = {
    summer_anthem: { emoji: "☀️", label: "Summer Anthem", months: "May-August" },
    winter_ballad: { emoji: "❄️", label: "Winter Ballad", months: "November-February" },
    spring_vibe: { emoji: "🌸", label: "Spring Vibe", months: "March-May" },
    fall_energy: { emoji: "🍂", label: "Fall Energy", months: "September-November" },
    year_round: { emoji: "🌍", label: "Year-Round", months: "Anytime" }
  };

  const trajectoryInfo = trajectoryConfig[prediction.chart_trajectory];
  const TrajectoryIcon = trajectoryInfo?.icon || TrendingUp;
  const marketingInfo = marketingConfig[prediction.marketing_intensity_needed];
  const seasonInfo = seasonConfig[prediction.seasonal_timing];

  return (
    <div className="space-y-6">
      {/* Chart Trajectory Card */}
      <Card className="bg-slate-800/80 border-slate-700/50 shadow-2xl">
        <CardHeader className="pb-4 border-b border-slate-700/50">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            Billboard Trajectory Prediction
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <TrajectoryIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <Badge variant="outline" className={`${trajectoryInfo?.color} border px-4 py-2 text-base mb-2`}>
                {trajectoryInfo?.label}
              </Badge>
              <p className="text-sm text-slate-300">{trajectoryInfo?.description}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <p className="text-xs text-slate-400">Time to Peak</p>
              </div>
              <p className="text-2xl font-bold text-white">{prediction.weeks_to_peak} weeks</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-slate-400">Peak Position</p>
              </div>
              <p className="text-2xl font-bold text-white">#{prediction.predicted_peak_position}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-green-400" />
                <p className="text-xs text-slate-400">Chart Longevity</p>
              </div>
              <p className="text-2xl font-bold text-white">{prediction.total_chart_longevity_weeks} weeks</p>
            </div>
          </div>

          {/* Streaming Lifecycle */}
          {prediction.streaming_lifecycle && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Music2 className="w-4 h-4" />
                Streaming Lifecycle Phases
              </h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Discovery</span>
                    <span>{prediction.streaming_lifecycle.phase_1_discovery_weeks} weeks</span>
                  </div>
                  <Progress 
                    value={(prediction.streaming_lifecycle.phase_1_discovery_weeks / prediction.total_chart_longevity_weeks) * 100} 
                    className="h-2 bg-slate-700"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Growth</span>
                    <span>{prediction.streaming_lifecycle.phase_2_growth_weeks} weeks</span>
                  </div>
                  <Progress 
                    value={(prediction.streaming_lifecycle.phase_2_growth_weeks / prediction.total_chart_longevity_weeks) * 100} 
                    className="h-2 bg-slate-700"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Peak</span>
                    <span>{prediction.streaming_lifecycle.phase_3_peak_weeks} weeks</span>
                  </div>
                  <Progress 
                    value={(prediction.streaming_lifecycle.phase_3_peak_weeks / prediction.total_chart_longevity_weeks) * 100} 
                    className="h-2 bg-slate-700"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Decline</span>
                    <span>{prediction.streaming_lifecycle.phase_4_decline_weeks} weeks</span>
                  </div>
                  <Progress 
                    value={(prediction.streaming_lifecycle.phase_4_decline_weeks / prediction.total_chart_longevity_weeks) * 100} 
                    className="h-2 bg-slate-700"
                  />
                </div>
                {prediction.streaming_lifecycle.phase_5_legacy_streams && (
                  <div className="flex items-center gap-2 text-xs text-green-400 mt-2">
                    <Zap className="w-3 h-3" />
                    <span>Legacy Catalog Potential - Long-term evergreen streams</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marketing & Release Strategy */}
      <Card className="bg-slate-800/80 border-slate-700/50 shadow-2xl">
        <CardHeader className="pb-4 border-b border-slate-700/50">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-400" />
            Marketing & Release Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">Marketing Intensity Required</p>
                <Badge variant="outline" className={`${marketingInfo?.color} border px-4 py-2 text-base`}>
                  {marketingInfo?.icon} {marketingInfo?.label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">Estimated Budget</p>
                <p className="text-lg font-semibold text-white">{prediction.estimated_marketing_budget}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">Breakthrough Probability</p>
                <div className="flex items-center gap-3">
                  <Progress 
                    value={prediction.breakthrough_probability} 
                    className="h-3 bg-slate-700 flex-1"
                  />
                  <span className="text-lg font-bold text-white">{prediction.breakthrough_probability?.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">Optimal Release Season</p>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2 text-base">
                  {seasonInfo?.emoji} {seasonInfo?.label}
                </Badge>
                <p className="text-xs text-slate-400 mt-1">Best months: {seasonInfo?.months}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">TikTok Viral Potential</p>
                <div className="flex items-center gap-3">
                  <Progress 
                    value={prediction.viral_tiktok_potential * 10} 
                    className="h-3 bg-slate-700 flex-1"
                  />
                  <span className="text-lg font-bold text-white">{prediction.viral_tiktok_potential?.toFixed(1)}/10</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">Radio Adoption</p>
                <p className="text-sm text-white">{prediction.radio_adoption_timeline}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" />
              <p className="text-sm font-semibold text-slate-300">Playlist Cascade Effect</p>
            </div>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 capitalize">
              {prediction.playlist_cascade_effect}
            </Badge>
            <p className="text-xs text-slate-400">
              How quickly the song will spread across major playlists
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-300 mb-3">Longevity Score</p>
            <div className="flex items-center gap-3">
              <Progress 
                value={prediction.longevity_score * 10} 
                className="h-4 bg-slate-700 flex-1"
              />
              <span className="text-xl font-bold text-white">{prediction.longevity_score?.toFixed(1)}/10</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {prediction.longevity_score >= 8 ? "Exceptional long-term staying power" :
               prediction.longevity_score >= 6 ? "Good potential for sustained popularity" :
               prediction.longevity_score >= 4 ? "Moderate longevity expected" :
               "Short-term impact likely"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Comparable Billboard Hits */}
      {prediction.comparable_billboard_hits && prediction.comparable_billboard_hits.length > 0 && (
        <Card className="bg-slate-800/80 border-slate-700/50 shadow-2xl">
          <CardHeader className="pb-4 border-b border-slate-700/50">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-yellow-400" />
              Similar Billboard Trajectories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {prediction.comparable_billboard_hits.map((hit, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-300 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-slate-200 text-sm">{hit}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Historical hits with similar features, trajectory, and market performance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}