/**
 * USAGE LIMIT TRACKER COMPONENT
 * Displays remaining usage for a feature and blocks when limit reached
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Lock, Zap, TrendingUp, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  SUBSCRIPTION_TIERS, 
  getFeatureLimit, 
  getRemainingUsage,
  checkUsageLimit 
} from "./subscriptionSystem";

// Get usage from localStorage
export const getUsageCount = (featureKey) => {
  try {
    const usage = JSON.parse(localStorage.getItem('spectro_usage') || '{}');
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    if (usage.month !== currentMonth) {
      // Reset for new month
      return 0;
    }
    
    return usage[featureKey] || 0;
  } catch {
    return 0;
  }
};

// Increment usage count
export const incrementUsage = (featureKey) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    let usage = JSON.parse(localStorage.getItem('spectro_usage') || '{}');
    
    // Reset if new month
    if (usage.month !== currentMonth) {
      usage = { month: currentMonth };
    }
    
    usage[featureKey] = (usage[featureKey] || 0) + 1;
    localStorage.setItem('spectro_usage', JSON.stringify(usage));
    
    return usage[featureKey];
  } catch {
    return 0;
  }
};

// Check if user can use feature (has remaining quota)
export const canUseFeature = (userTier, limitKey) => {
  const currentUsage = getUsageCount(limitKey);
  return checkUsageLimit(userTier, limitKey, currentUsage);
};

export default function UsageLimitTracker({ 
  userTier, 
  limitKey, 
  featureName,
  showUpgradePrompt = true,
  compact = false,
  className = ""
}) {
  const navigate = useNavigate();
  const [usage, setUsage] = useState(0);
  
  useEffect(() => {
    setUsage(getUsageCount(limitKey));
    
    // Listen for usage updates
    const handleUsageUpdate = () => {
      setUsage(getUsageCount(limitKey));
    };
    
    window.addEventListener('usage-updated', handleUsageUpdate);
    return () => window.removeEventListener('usage-updated', handleUsageUpdate);
  }, [limitKey]);
  
  const tier = userTier || SUBSCRIPTION_TIERS.FREE;
  const limit = getFeatureLimit(tier, limitKey);
  const remaining = getRemainingUsage(tier, limitKey, usage);
  const percentage = limit > 0 ? ((usage / limit) * 100) : 100;
  const isLocked = limit === 0;
  const isExhausted = remaining === 0 && limit > 0;
  
  // Get tier color
  const getTierColor = () => {
    if (tier === SUBSCRIPTION_TIERS.PREMIUM) return 'text-amber-400';
    if (tier === SUBSCRIPTION_TIERS.PRO) return 'text-blue-400';
    return 'text-slate-400';
  };
  
  // Get progress color
  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-cyan-500';
  };
  
  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        {isLocked ? (
          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
            <Lock className="w-3 h-3 mr-1" />
            Locked
          </Badge>
        ) : isExhausted ? (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Limit Reached
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
            <Zap className="w-3 h-3 mr-1" />
            {remaining}/{limit} left
          </Badge>
        )}
      </div>
    );
  }
  
  return (
    <Card className={`bg-black/40 border border-white/10 backdrop-blur-sm ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {tier === SUBSCRIPTION_TIERS.PREMIUM ? (
              <Crown className="w-4 h-4 text-amber-400" />
            ) : tier === SUBSCRIPTION_TIERS.PRO ? (
              <TrendingUp className="w-4 h-4 text-blue-400" />
            ) : (
              <Zap className="w-4 h-4 text-slate-400" />
            )}
            <span className={`text-sm font-bold ${getTierColor()}`}>
              {tier.toUpperCase()} Plan
            </span>
          </div>
          <Badge variant="outline" className={`text-xs ${
            isLocked ? 'text-red-400 border-red-500/30' :
            isExhausted ? 'text-amber-400 border-amber-500/30' :
            'text-cyan-400 border-cyan-500/30'
          }`}>
            {featureName}
          </Badge>
        </div>
        
        {isLocked ? (
          <div className="text-center py-4">
            <Lock className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-400 text-sm font-semibold mb-1">Feature Locked</p>
            <p className="text-slate-500 text-xs mb-3">
              Upgrade your plan to access this feature
            </p>
            {showUpgradePrompt && (
              <Button 
                size="sm"
                onClick={() => navigate(createPageUrl('Monetization'))}
                className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-xs"
              >
                Upgrade Now
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Monthly Usage</span>
              <span className={isExhausted ? 'text-red-400 font-bold' : ''}>
                {usage} / {limit}
              </span>
            </div>
            
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
              <div 
                className={`absolute left-0 top-0 h-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            
            {isExhausted ? (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-amber-400 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Monthly Limit Reached</span>
                </div>
                <p className="text-slate-500 text-xs mb-3">
                  Upgrade for more uploads or wait until next month
                </p>
                {showUpgradePrompt && (
                  <Button 
                    size="sm"
                    onClick={() => navigate(createPageUrl('Monetization'))}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs"
                  >
                    Get More Uploads
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {remaining} uploads remaining this month
                </span>
                {percentage >= 70 && (
                  <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                    Running Low
                  </Badge>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}