import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Shield } from "lucide-react";
import { SUBSCRIPTION_TIERS, PRICING } from "@/components/shared/subscriptionSystem";

export default function PlanManager({ currentPlan, onUpgrade, onDowngrade, isLoading }) {
  const [selectedInterval, setSelectedInterval] = useState('monthly');

  const plans = [
    {
      id: SUBSCRIPTION_TIERS.FREE,
      name: "Free",
      price: 0,
      features: [
        "3 Analysis Uploads / Month",
        "Basic Analytics",
        "Community Access"
      ],
      limitations: "Limited creative tools",
      color: "slate"
    },
    {
      id: SUBSCRIPTION_TIERS.PRO,
      name: "Pro Creator",
      price: PRICING.PRO.monthly,
      yearlyPrice: PRICING.PRO.yearly,
      features: [
        "24 Analysis Uploads / Day",
        "Creative Tools Access",
        "Business Tools (Monetization)",
        "Priority Support"
      ],
      popular: true,
      color: "blue"
    },
    {
      id: SUBSCRIPTION_TIERS.PREMIUM,
      name: "Studio Master",
      price: PRICING.PREMIUM.monthly,
      yearlyPrice: PRICING.PREMIUM.yearly,
      features: [
        "Unlimited Analysis Uploads",
        "All Creative Tools Unlocked",
        "Full SpectroVerse Access",
        "Advanced AI Models",
        "Emoji Lyrics & More"
      ],
      color: "amber"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-2 mb-8">
        <Button 
          variant={selectedInterval === 'monthly' ? 'default' : 'outline'}
          onClick={() => setSelectedInterval('monthly')}
          className={selectedInterval === 'monthly' ? 'bg-purple-600' : 'border-slate-700 text-slate-300'}
        >
          Monthly Billing
        </Button>
        <Button 
          variant={selectedInterval === 'yearly' ? 'default' : 'outline'}
          onClick={() => setSelectedInterval('yearly')}
          className={selectedInterval === 'yearly' ? 'bg-purple-600' : 'border-slate-700 text-slate-300'}
        >
          Yearly Billing (Save ~20%)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 mt-2">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const price = selectedInterval === 'monthly' ? plan.price : (plan.yearlyPrice ? (plan.yearlyPrice / 12).toFixed(2) : 0);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative flex flex-col bg-slate-900 border-2 transition-all duration-300 ${
                isCurrent 
                  ? `border-${plan.color}-500 shadow-lg shadow-${plan.color}-500/20` 
                  : `border-slate-800 hover:border-${plan.color}-500/50`
              }`}
            >
              {plan.popular && !isCurrent && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] font-black px-3 py-1 rounded-md shadow-lg z-20 whitespace-nowrap border border-blue-400">
                  MOST POPULAR
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-md shadow-lg flex items-center gap-1 z-20 whitespace-nowrap border border-green-400">
                  <Check className="w-3 h-3" /> CURRENT PLAN
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <h3 className={`text-xl font-black text-${plan.color}-400 uppercase tracking-wider`}>{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-white">${price}</span>
                  <span className="text-slate-500 text-sm">/mo</span>
                </div>
                {selectedInterval === 'yearly' && plan.price > 0 && (
                  <p className="text-xs text-green-400 mt-1">Billed ${plan.yearlyPrice} yearly</p>
                )}
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3 mt-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className={`w-4 h-4 text-${plan.color}-500 mt-0.5 shrink-0`} />
                      <span className="text-left">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.limitations && (
                  <p className="text-xs text-slate-500 mt-4 italic">{plan.limitations}</p>
                )}
              </CardContent>

              <CardFooter className="pt-4">
                {isCurrent ? (
                  <Button disabled className="w-full bg-slate-800 text-slate-400 cursor-not-allowed">
                    Active Plan
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      if (plan.price > 0) {
                        onUpgrade(plan.id, selectedInterval);
                      } else {
                        onDowngrade(plan.id);
                      }
                    }}
                    disabled={isLoading}
                    className={`w-full font-bold ${
                      plan.price === 0 
                        ? "bg-slate-700 hover:bg-slate-600" 
                        : `bg-gradient-to-r from-${plan.color}-600 to-${plan.color}-500 hover:from-${plan.color}-500 hover:to-${plan.color}-400`
                    }`}
                  >
                    {isLoading ? "Processing..." : (plan.price === 0 ? "Downgrade to Free" : `Upgrade to ${plan.name}`)}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-slate-900/50 border border-slate-800 rounded-lg text-center">
        <p className="text-xs text-slate-500 mb-2">
          <Shield className="w-3 h-3 inline mr-1" />
          Secure Payment Processing
        </p>
        <p className="text-xs text-slate-600">
          By upgrading, you agree to our Terms of Service. Subscriptions auto-renew. Cancel anytime from this dashboard.
          Transactions are secured by SSL encryption.
        </p>
      </div>
    </div>
  );
}