import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Zap, Star, Lock } from "lucide-react";
import { SUBSCRIPTION_TIERS, PRICING, getDaysRemaining, isSubscriptionExpired } from "@/components/shared/subscriptionSystem";

export default function SubscriptionPlans({ user, onUpgrade }) {
  const currentTier = user?.subscription_tier || SUBSCRIPTION_TIERS.FREE;
  const paymentVerified = user?.payment_verified === true && user?.identity_verified === true;
  const subscriptionExpired = isSubscriptionExpired(user);
  const daysRemaining = getDaysRemaining(user);
  
  const plans = [
    {
      name: "Free",
      tier: SUBSCRIPTION_TIERS.FREE,
      price: "$0",
      period: "forever",
      icon: Zap,
      color: "slate",
      features: [
        { text: "Access to resources section", included: true },
        { text: "Lyrics Retrieval page", included: true },
        { text: "Music Education page", included: true },
        { text: "Copyright & IP resources", included: true },
        { text: "AI Chatbot access", included: true },
        { text: "Version History", included: true },
        { text: "Accessibility features", included: true },
        { text: "Video Studio (preview)", included: true },
        { text: "Track Analysis", included: false },
        { text: "DSP Analysis", included: false },
        { text: "Rhythm Analysis", included: false },
        { text: "Business Tools", included: false },
        { text: "Collaboration features", included: false },
        { text: "Theme customization", included: false },
        { text: "Particle customization", included: false },
      ]
    },
    {
      name: "Pro Creator",
      tier: SUBSCRIPTION_TIERS.PRO,
      price: `$${PRICING.PRO.monthly}`,
      period: "/month",
      yearlyPrice: `$${PRICING.PRO.yearly.toFixed(2)}/year`,
      icon: Star,
      color: "blue",
      features: [
        { text: "Everything in Free", included: true },
        { text: "24 monthly uploads per feature", included: true },
        { text: "Track Analysis", included: true },
        { text: "DSP Analysis", included: true },
        { text: "Lyrics Analyzer", included: true },
        { text: "Genre Predictor", included: true },
        { text: "AI Track Query", included: true },
        { text: "Business Tools & Monetization", included: true },
        { text: "Collaboration features", included: true },
        { text: "All themes (except Gold/Black)", included: true },
        { text: "All particles (except Gold/Black)", included: true },
        { text: "Rhythm Analysis", included: false },
        { text: "Sheet Music Generator", included: false },
        { text: "Market Fit Analysis", included: false },
        { text: "Time Series Analysis", included: false },
      ]
    },
    {
      name: "Studio Master",
      tier: SUBSCRIPTION_TIERS.PREMIUM,
      price: `$${PRICING.PREMIUM.monthly}`,
      period: "/month",
      yearlyPrice: `$${PRICING.PREMIUM.yearly.toFixed(2)}/year`,
      icon: Crown,
      color: "amber",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "39 monthly uploads per feature", included: true },
        { text: "Rhythm Analysis", included: true },
        { text: "Sheet Music Generator", included: true },
        { text: "Market Fit Analysis", included: true },
        { text: "Time Series Analysis", included: true },
        { text: "Gold & Black themes", included: true },
        { text: "Gold & Black particles", included: true },
        { text: "Priority support", included: true },
        { text: "Advanced analytics", included: true },
      ]
    }
  ];

  const getButtonText = (planTier) => {
    if (planTier === currentTier && (planTier === SUBSCRIPTION_TIERS.FREE || paymentVerified)) {
      return "Current Plan";
    }
    if (planTier === currentTier && !paymentVerified) {
      return "Complete Payment";
    }
    if (planTier === SUBSCRIPTION_TIERS.FREE) {
      return "Downgrade";
    }
    return "Upgrade";
  };

  const isCurrentPlan = (planTier) => {
    if (planTier === SUBSCRIPTION_TIERS.FREE) {
      return currentTier === SUBSCRIPTION_TIERS.FREE || subscriptionExpired;
    }
    return planTier === currentTier && paymentVerified && !subscriptionExpired;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-white mb-2">Choose Your Plan</h2>
        <p className="text-slate-400 text-sm">Identity verification required before payment</p>
        
        {currentTier !== SUBSCRIPTION_TIERS.FREE && paymentVerified && !subscriptionExpired && (
          <div className="mt-4 inline-block px-4 py-2 bg-green-950/30 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm font-semibold">
              {daysRemaining} days remaining on your {currentTier.toUpperCase()} plan
            </p>
          </div>
        )}
        
        {subscriptionExpired && currentTier !== SUBSCRIPTION_TIERS.FREE && (
          <div className="mt-4 inline-block px-4 py-2 bg-red-950/30 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm font-semibold">
              Your {currentTier.toUpperCase()} subscription has expired. Please renew to restore access.
            </p>
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = isCurrentPlan(plan.tier);
          
          return (
            <Card 
              key={plan.tier}
              className={`relative overflow-hidden transition-all ${
                isCurrent 
                  ? `border-${plan.color}-500 bg-${plan.color}-950/20` 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              {plan.tier === SUBSCRIPTION_TIERS.PREMIUM && (
                <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                  BEST VALUE
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg bg-${plan.color}-500/20 border border-${plan.color}-500/30`}>
                    <Icon className={`w-5 h-5 text-${plan.color}-400`} />
                  </div>
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-400 text-sm">{plan.period}</span>
                </div>
                {plan.yearlyPrice && (
                  <p className="text-xs text-green-400 mt-1">Save with yearly: {plan.yearlyPrice}</p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-xs ${feature.included ? 'text-slate-300' : 'text-slate-600'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button
                  className={`w-full ${
                    isCurrent 
                      ? 'bg-slate-700 text-slate-400 cursor-default' 
                      : plan.tier === SUBSCRIPTION_TIERS.PREMIUM
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : plan.tier === SUBSCRIPTION_TIERS.PRO
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                  disabled={isCurrent}
                  onClick={() => onUpgrade && onUpgrade(plan.tier)}
                >
                  {isCurrent && <Check className="w-4 h-4 mr-2" />}
                  {getButtonText(plan.tier)}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center text-xs text-slate-500 mt-6">
        <p>All paid plans require identity verification before payment processing.</p>
        <p className="mt-1">Features unlock immediately after payment confirmation.</p>
      </div>
    </div>
  );
}