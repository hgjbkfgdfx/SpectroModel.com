import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, TrendingUp, DollarSign, Target, Zap, 
  BarChart3, Lightbulb, Loader2, Shield, Sparkles
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMLDataCollector } from '@/components/shared/MLDataCollector';

export default function PricingInsights({ user }) {
  const mlDataCollector = useMLDataCollector();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [query, setQuery] = useState('');
  const [insights, setInsights] = useState({
    pricing_strategy: "For an emerging indie artist's first album, a 'pay-what-you-want' model or a standard $9.99 digital download often yields the best engagement.",
    recommended_price_range: "$7.99 - $12.99 (Digital), $20-25 (Vinyl)",
    promotion_channels: ["TikTok (Behind the scenes)", "Instagram Reels", "Spotify Playlist Pitching"],
    timing_tips: ["Release singles every 4-6 weeks leading up to album", "Post at 10AM EST for max reach"],
    key_insights: [
      "Bundling digital albums with exclusive merch increases revenue by 40%",
      "Pre-save campaigns are critical for Day 1 streaming numbers"
    ],
    target_audience: "Gen Z listeners aged 18-24 interested in bedroom pop and lo-fi aesthetics."
  });

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    
    setIsAnalyzing(true);
    mlDataCollector.record('pricing_insight_requested', {
      feature: 'monetization',
      timestamp: Date.now()
    });

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a music business pricing expert. Analyze and provide pricing/promotion insights for: "${query}"

Provide specific, actionable advice covering:
1. Optimal pricing strategy
2. Best platforms/channels for promotion
3. Timing recommendations
4. Target audience insights
5. Competitor analysis tips

Keep the response focused on music monetization. Be specific with numbers and percentages where possible.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            pricing_strategy: { type: "string" },
            recommended_price_range: { type: "string" },
            promotion_channels: { type: "array", items: { type: "string" } },
            timing_tips: { type: "array", items: { type: "string" } },
            target_audience: { type: "string" },
            key_insights: { type: "array", items: { type: "string" } },
            competitor_tips: { type: "array", items: { type: "string" } }
          }
        }
      });

      setInsights(response);
    } catch (error) {
      console.error('Analysis error:', error);
      setInsights({
        pricing_strategy: "Unable to analyze at this time. Please try again.",
        key_insights: ["Check your internet connection", "Try a more specific query"]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const quickQueries = [
    "How should I price my first album release?",
    "Best pricing for beat licensing?",
    "How to price sync licensing for indie artists?",
    "Fan subscription tier pricing strategy",
    "NFT pricing for music collectibles"
  ];

  return (
    <div className="space-y-6">
      {/* AI Notice */}
      <Card className="bg-cyan-950/50 border-cyan-500/30">
        <CardContent className="p-4 flex items-center gap-3">
          <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <p className="text-white font-semibold text-sm">🤖 AI Learns From Your Data</p>
            <p className="text-cyan-300 text-xs">Powered by market analysis & industry trends</p>
          </div>
        </CardContent>
      </Card>

      {/* Query Input */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Ask AI for Pricing & Promotion Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about pricing, promotion strategies, market trends..."
            className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
          />
          
          <div className="flex flex-wrap gap-2">
            {quickQueries.map((q, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => setQuery(q)}
                className="border-slate-600 text-black font-bold bg-white/90 hover:bg-white text-xs"
              >
                {q}
              </Button>
            ))}
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !query.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 w-full"
          >
            {isAnalyzing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Brain className="w-4 h-4 mr-2" /> Get AI Insights</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {insights && (
        <div className="space-y-4">
          {/* Pricing Strategy */}
          <Card className="bg-black border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Pricing Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white font-black text-lg p-2 bg-slate-900/50 rounded-lg border border-slate-700">{insights.pricing_strategy}</p>
              {insights.recommended_price_range && (
                <Badge className="mt-3 bg-green-500/20 text-green-300 font-bold text-lg px-4 py-2">
                  Recommended: {insights.recommended_price_range}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Promotion Channels */}
          {insights.promotion_channels?.length > 0 && (
            <Card className="bg-slate-900/80 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Promotion Channels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {insights.promotion_channels.map((channel, idx) => (
                    <Badge key={idx} className="bg-blue-600 text-white font-bold border border-blue-400">
                      {channel}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timing Tips */}
          {insights.timing_tips?.length > 0 && (
            <Card className="bg-slate-900/80 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Timing Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.timing_tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Key Insights */}
          {insights.key_insights?.length > 0 && (
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.key_insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <Target className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Target Audience */}
          {insights.target_audience && (
            <Card className="bg-slate-900/80 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-pink-400" />
                  Target Audience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{insights.target_audience}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Default Tips */}
      {!insights && (
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50">
          <CardContent className="p-6">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" /> General Monetization Tips
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-600 shadow-md">
                <p className="text-purple-300 font-black text-base mb-2 border-b border-purple-500/50 pb-1">Streaming</p>
                <ul className="space-y-2">
                  <li className="text-white font-bold">• Focus on playlist placements</li>
                  <li className="text-white font-bold">• Release consistently (every 4-6 weeks)</li>
                  <li className="text-white font-bold">• Engage fans to boost algorithmic reach</li>
                </ul>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-600 shadow-md">
                <p className="text-green-300 font-black text-base mb-2 border-b border-green-500/50 pb-1">Licensing</p>
                <ul className="space-y-2">
                  <li className="text-white font-bold">• Price sync licenses $500-$5000+</li>
                  <li className="text-white font-bold">• Create instrumental versions</li>
                  <li className="text-white font-bold">• Register with music libraries</li>
                </ul>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-600 shadow-md">
                <p className="text-blue-300 font-black text-base mb-2 border-b border-blue-500/50 pb-1">Subscriptions</p>
                <ul className="space-y-2">
                  <li className="text-white font-bold">• Start with 3 tiers ($3, $10, $25)</li>
                  <li className="text-white font-bold">• Offer exclusive content weekly</li>
                  <li className="text-white font-bold">• Include Discord/community access</li>
                </ul>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-600 shadow-md">
                <p className="text-amber-300 font-black text-base mb-2 border-b border-amber-500/50 pb-1">NFTs</p>
                <ul className="space-y-2">
                  <li className="text-white font-bold">• Limited editions create value</li>
                  <li className="text-white font-bold">• Include real-world perks</li>
                  <li className="text-white font-bold">• Set 10% secondary royalties</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}