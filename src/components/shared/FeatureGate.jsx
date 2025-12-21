import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Shield, CreditCard } from "lucide-react";
import { SUBSCRIPTION_TIERS, FEATURE_ACCESS } from "./subscriptionSystem";

export default function FeatureGate({ userTier, featureKey, children }) {
  // Default to FREE if tier not provided
  const currentTier = userTier || SUBSCRIPTION_TIERS.FREE;
  
  // Check access
  const allowedTiers = FEATURE_ACCESS[featureKey];
  const isAllowed = !allowedTiers || allowedTiers.includes(currentTier);

  if (isAllowed) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[200px] w-full">
      {/* Blurred Content */}
      <div className="absolute inset-0 filter blur-lg opacity-20 pointer-events-none select-none overflow-hidden">
        {children}
      </div>
      
      {/* Lock Overlay */}
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
        <Card className="bg-slate-900/90 border-purple-500/50 shadow-2xl max-w-md w-full backdrop-blur-xl">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-purple-500/30">
              <Lock className="w-8 h-8 text-purple-400" />
            </div>
            
            <div>
              <h3 className="text-xl font-black text-white mb-2">Feature Locked</h3>
              <p className="text-slate-300 text-sm">
                This advanced tool is available for <strong className="text-purple-400">Pro</strong> and <strong className="text-amber-400">Premium</strong> members only.
              </p>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-lg text-left text-xs space-y-2 border border-slate-700">
              <p className="font-bold text-slate-200">Usage Rules:</p>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li>Commercial usage rights included</li>
                <li>Priority processing speed</li>
                <li>Advanced data export</li>
                <li>Secure cloud storage</li>
              </ul>
            </div>

            <div className="grid gap-3">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 font-bold">
                <CreditCard className="w-4 h-4 mr-2" /> Upgrade to Unlock
              </Button>
              <Button variant="ghost" className="text-slate-400 hover:text-white">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}