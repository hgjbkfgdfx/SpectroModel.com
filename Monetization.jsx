import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, Music, Users, Crown, ShoppingBag, TrendingUp, 
  Brain, Shield, Loader2, Plus, Star, Gift, Sparkles, 
  CreditCard, BarChart3, Target, Zap, Globe, Lock, AlertTriangle, 
  CreditCard as CardIcon, Activity, Server, Code, Wallet, Coins, LineChart
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { NetworkErrorBanner, AILearningBanner } from "@/components/shared/NetworkErrorHandler";
import LimitLocker from "@/components/shared/LimitLocker";
import SecurityMonitor from "@/components/shared/SecurityMonitor";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import ParticleSystem from "@/components/shared/ParticleSystem";

import StreamingRoyalties from '@/components/monetization/StreamingRoyalties';
import NFTMarketplace from '@/components/monetization/NFTMarketplace';
import FanSubscriptions from '@/components/monetization/FanSubscriptions';
import LicensingMarketplace from '@/components/monetization/LicensingMarketplace';
import PricingInsights from '@/components/monetization/PricingInsights';
import ArtistProfile from '@/components/monetization/ArtistProfile';


import { SUBSCRIPTION_TIERS } from '@/components/shared/subscriptionSystem';
import { fetchUserWithCache } from "@/components/shared/userCache";

const Diagram = ({ type, label, color = "cyan" }) => {
  const colorMap = {
    cyan: "text-cyan-400 border-cyan-500/30 bg-cyan-950/30",
    green: "text-green-400 border-green-500/30 bg-green-950/30",
    pink: "text-pink-400 border-pink-500/30 bg-pink-950/30",
    blue: "text-blue-400 border-blue-500/30 bg-blue-950/30"
  };

  return (
    <div className="w-full h-64 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden group my-6 hover:border-white/20 transition-all">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      <div className="text-center z-10 p-6 relative">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-pulse ${colorMap[color].replace('text-', 'border-')}`}>
          <Activity className={`w-8 h-8 ${colorMap[color].split(' ')[0]}`} />
        </div>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">System Visualization</div>
        <Badge variant="outline" className={`font-mono text-lg py-1 px-4 mb-2 ${colorMap[color]}`}>
          &lt;{type} /&gt;
        </Badge>
        {label && <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">{label}</p>}
      </div>
      {/* Decorative tech lines */}
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${color}-500/50 to-transparent opacity-50`} />
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 blur-3xl rounded-full pointer-events-none`} />
    </div>
  );
};

export default function MonetizationPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('royalties');
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0 });
  const [showConfirmPurchase, setShowConfirmPurchase] = useState(false);



  useEffect(() => {
    const init = async () => {
      try {
        blockScriptInjection();
        const cspResult = validateCSP();
        setSecurityStatus({ safe: cspResult.valid, threats: cspResult.violations?.length || 0 });

        const userData = await fetchUserWithCache();
        setUser(userData);



        mlDataCollector.record('monetization_page_visit', {
          feature: 'monetization',
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
        <p className="text-amber-500/70 font-mono text-sm tracking-widest animate-pulse">ACCESSING FINANCIAL MAINFRAME...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f0520] to-[#050015] p-4 md:p-6 pb-8 text-cyan-50 font-sans selection:bg-amber-500/30 selection:text-amber-100 overflow-x-hidden relative">

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Global banners handled by Layout */}
        <LimitLocker feature="market_fit" featureKey="MONETIZATION" user={user} />

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <Wallet className="w-8 h-8 text-amber-500 animate-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500">
                REVENUE COMMAND CENTER
              </span>
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-wider">
              Asset Liquidity • Royalty Streams • Blockchain Ledger
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowConfirmPurchase(true)}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-lg shadow-amber-900/20 h-12 px-6 uppercase text-xs tracking-widest border border-amber-400/50"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Clearance
            </Button>
          </div>
        </div>

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Security */}
             <Card className="bg-black/60 border border-green-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Transaction Secure</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                {securityStatus.safe ? '>> ENCRYPTION ACTIVE' : '!! UNSAFE PROTOCOL'}
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">VERIFIED</Badge>
                </CardContent>
            </Card>

            {/* AI Status */}
            <Card className="bg-black/60 border border-cyan-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">FinTech AI</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                &gt;&gt; OPTIMIZING YIELDS...
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">ACTIVE</Badge>
                </CardContent>
            </Card>
        </div>

        <LiveSecurityDisplay />
        <LiveThreatDisplay />

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
              { icon: DollarSign, label: "Total Liquidity", val: "$0.00", color: "text-green-400", border: "border-green-500/30" },
              { icon: Music, label: "Active Licenses", val: "0", color: "text-blue-400", border: "border-blue-500/30" },
              { icon: Users, label: "Subscriber Base", val: "0", color: "text-purple-400", border: "border-purple-500/30" },
              { icon: Sparkles, label: "Minted Assets", val: "0", color: "text-pink-400", border: "border-pink-500/30" }
          ].map((stat, i) => (
              <Card key={i} className={`bg-black/40 border ${stat.border} backdrop-blur-md rounded-xl overflow-hidden group hover:bg-black/60 transition-all`}>
                <CardContent className="p-4 text-center">
                  <div className={`p-2 rounded-full bg-slate-900/50 inline-block mb-2 border border-slate-800 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-black text-white font-mono tracking-tight">{stat.val}</p>
                  <p className="text-slate-500 font-bold text-[10px] mt-1 uppercase tracking-widest">{stat.label}</p>
                </CardContent>
              </Card>
          ))}
        </div>

        {/* MAIN TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-1 rounded-xl backdrop-blur-md overflow-x-auto">
            <TabsList className="bg-transparent w-full justify-start h-auto p-0 gap-1">
              {[
                { id: 'royalties', label: 'Royalties', icon: DollarSign, color: 'green' },
                { id: 'nfts', label: 'NFT Assets', icon: Sparkles, color: 'pink' },
                { id: 'subscriptions', label: 'Fan Base', icon: Crown, color: 'purple' },
                { id: 'licensing', label: 'Contracts', icon: ShoppingBag, color: 'blue' },
                { id: 'insights', label: 'AI Pricing', icon: Brain, color: 'cyan' },
                { id: 'billing', label: 'Billing', icon: CreditCard, color: 'orange' },
                { id: 'profile', label: 'Profile', icon: Users, color: 'slate' },
              ].map(tab => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className={`
                    flex-1 min-w-[100px] font-bold text-xs py-3 px-4 uppercase tracking-wider transition-all
                    data-[state=active]:bg-${tab.color}-500/20 
                    data-[state=active]:text-${tab.color}-300 
                    data-[state=active]:border-${tab.color}-500/50
                    border border-transparent hover:bg-white/5
                  `}
                >
                  <tab.icon className="w-3 h-3 mr-2" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 md:p-8 backdrop-blur-sm min-h-[600px]">
            
            <TabsContent value="royalties" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-l-2 border-green-500/50 pl-4 mb-6">
                <h2 className="text-2xl font-black text-white">ROYALTY DISTRIBUTION</h2>
                <p className="text-green-400/60 font-mono text-sm">TRACKING REVENUE STREAMS ACROSS PLATFORMS</p>
              </div>
              <Diagram type="royalty_distribution_flow" label="Real-time revenue aggregation from DSPs, Licensing, and Direct Sales" color="green" />
              <StreamingRoyalties user={user} />
            </TabsContent>

            <TabsContent value="nfts" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-l-2 border-pink-500/50 pl-4 mb-6">
                <h2 className="text-2xl font-black text-white">DIGITAL ASSET MARKETPLACE</h2>
                <p className="text-pink-400/60 font-mono text-sm">BLOCKCHAIN-VERIFIED COLLECTIBLES & ASSETS</p>
              </div>
              <Diagram type="blockchain_asset_structure" label="Smart Contract Verification & Ownership Chain" color="pink" />
              <NFTMarketplace user={user} />
            </TabsContent>

            <TabsContent value="subscriptions" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-l-2 border-purple-500/50 pl-4 mb-6">
                <h2 className="text-2xl font-black text-white">FAN SUBSCRIPTION TIERS</h2>
                <p className="text-purple-400/60 font-mono text-sm">RECURRING REVENUE MANAGEMENT</p>
              </div>
              <FanSubscriptions user={user} />
            </TabsContent>

            <TabsContent value="licensing" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-l-2 border-blue-500/50 pl-4 mb-6">
                <h2 className="text-2xl font-black text-white">LICENSING CONTRACTS</h2>
                <p className="text-blue-400/60 font-mono text-sm">SYNC RIGHTS & COMMERCIAL USAGE</p>
              </div>
              <LicensingMarketplace user={user} />
            </TabsContent>

            <TabsContent value="insights" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-l-2 border-cyan-500/50 pl-4 mb-6">
                <h2 className="text-2xl font-black text-white">AI PRICING MODELS</h2>
                <p className="text-cyan-400/60 font-mono text-sm">DYNAMIC MARKET VALUE PREDICTION</p>
              </div>
              <Diagram type="dynamic_pricing_curve" label="AI-Predicted Demand Curve vs. Pricing Strategy" color="cyan" />
              <PricingInsights user={user} />
            </TabsContent>

            <TabsContent value="billing" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-l-2 border-orange-500/50 pl-4 mb-6">
                <h2 className="text-2xl font-black text-white">PLATFORM BILLING</h2>
                <p className="text-orange-400/60 font-mono text-sm">SUBSCRIPTION MANAGEMENT</p>
              </div>
              
              {/* Privacy Notice */}
              <Card className="bg-red-950/20 border border-red-500/30 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-200/80">
                      <p className="font-bold text-red-300 mb-1 uppercase">Privacy & Security Notice</p>
                      <p>No payment history, payment methods, credit cards, debit cards, bank accounts, or billing confirmations are displayed or stored visibly within this application. All financial data is processed securely and remains confidential. Users may not inquire about any other user's financial or account data. Such requests shall be rejected, and suspicious behavior shall be permanently flagged and monitored.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plan Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* FREE Plan */}
                <Card className={`bg-black/60 border-2 ${user?.subscription_tier === 'free' || !user?.subscription_tier ? 'border-slate-400 shadow-[0_0_30px_-10px_rgba(148,163,184,0.4)]' : 'border-slate-700'} backdrop-blur-xl rounded-2xl overflow-hidden relative group hover:border-slate-500 transition-all duration-300`}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-500 via-slate-400 to-slate-500"></div>
                  {(user?.subscription_tier === 'free' || !user?.subscription_tier) && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-slate-500/20 text-slate-300 border border-slate-400/50 font-bold text-[10px]">CURRENT PLAN</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 pt-8">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-600">
                        <Music className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-1">FREE</h3>
                      <p className="text-slate-400 text-sm font-medium">Starter Access</p>
                      <div className="mt-4">
                        <span className="text-4xl font-black text-white">$0</span>
                        <span className="text-slate-500 text-sm">/month</span>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-slate-500" />
                        <span>Access to Resources section</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-slate-500" />
                        <span>Lyrics retrieval page</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-slate-500" />
                        <span>Music education content</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-slate-500" />
                        <span>Copyright and IP resources</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-slate-500" />
                        <span>AI Chatbot assistance</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-slate-500" />
                        <span>Video Studio (under construction)</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-slate-500" />
                        <span>Accessibility and Version History</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-slate-500" />
                        <span>Default purple theme only</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white font-bold"
                      disabled={user?.subscription_tier === 'free' || !user?.subscription_tier}
                    >
                      {(user?.subscription_tier === 'free' || !user?.subscription_tier) ? 'ACTIVE' : 'SELECT'}
                    </Button>
                  </CardContent>
                </Card>

                {/* PRO Plan */}
                <Card className={`bg-black/60 border-2 ${user?.subscription_tier === 'pro' ? 'border-blue-400 shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)]' : 'border-blue-700/50'} backdrop-blur-xl rounded-2xl overflow-hidden relative group hover:border-blue-500 transition-all duration-300`}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"></div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/50 font-bold text-[10px]">MOST POPULAR</Badge>
                  </div>
                  {user?.subscription_tier === 'pro' && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-500/20 text-green-300 border border-green-400/50 font-bold text-[10px]">CURRENT PLAN</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 pt-8">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto bg-blue-900/50 rounded-full flex items-center justify-center mb-4 border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                        <Star className="w-8 h-8 text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-1">PRO</h3>
                      <p className="text-blue-400 text-sm font-medium">Professional Suite</p>
                      <div className="mt-4">
                        <span className="text-4xl font-black text-white">$14.99</span>
                        <span className="text-slate-500 text-sm">/month</span>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span>24 monthly uploads per feature</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span>All analysis types except rhythm and sheet music</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span>DSP algorithms and studio tools</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span>Market research and industry insights</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span>Collaboration and project tools</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span>Theme and particle customization</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Lock className="w-3 h-3 text-slate-600" />
                        <span>No gold or black themes/particles</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-blue-900/30"
                      disabled={user?.subscription_tier === 'pro'}
                    >
                      {user?.subscription_tier === 'pro' ? 'ACTIVE' : 'UPGRADE TO PRO'}
                    </Button>
                  </CardContent>
                </Card>

                {/* PREMIUM Plan */}
                <Card className={`bg-black/60 border-2 ${user?.subscription_tier === 'premium' ? 'border-amber-400 shadow-[0_0_30px_-10px_rgba(245,158,11,0.5)]' : 'border-amber-700/50'} backdrop-blur-xl rounded-2xl overflow-hidden relative group hover:border-amber-500 transition-all duration-300`}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 animate-pulse"></div>
                  {user?.subscription_tier === 'premium' && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-500/20 text-green-300 border border-green-400/50 font-bold text-[10px]">CURRENT PLAN</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 pt-8">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto bg-amber-900/50 rounded-full flex items-center justify-center mb-4 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                        <Crown className="w-8 h-8 text-amber-400" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-1">PREMIUM</h3>
                      <p className="text-amber-400 text-sm font-medium">Studio Master</p>
                      <div className="mt-4">
                        <span className="text-4xl font-black text-white">$29.99</span>
                        <span className="text-slate-500 text-sm">/month</span>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>39 monthly uploads per feature</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Everything in Pro plus rhythm and sheet music</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Market fit and time series analysis</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Advanced mastering (39 uploads)</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Advanced mixing (39 uploads)</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Radio edits and sibilance corrector</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Exclusive gold and black themes</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Gold and black particle effects</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-lg shadow-amber-900/30"
                      disabled={user?.subscription_tier === 'premium'}
                    >
                      {user?.subscription_tier === 'premium' ? 'ACTIVE' : 'UPGRADE TO PREMIUM'}
                    </Button>
                  </CardContent>
                </Card>

              </div>

              <p className="text-center text-slate-500 text-xs font-mono">
                All plan upgrades are processed securely. No financial information is displayed within the application.
              </p>

            </TabsContent>

            <TabsContent value="profile" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-l-2 border-slate-500/50 pl-4 mb-6">
                <h2 className="text-2xl font-black text-white">ARTIST IDENTITY</h2>
                <p className="text-slate-400/60 font-mono text-sm">PUBLIC PROFILE & BRANDING CONFIGURATION</p>
              </div>
              <ArtistProfile user={user} />
            </TabsContent>

          </div>
        </Tabs>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmPurchase && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/50 shadow-[0_0_50px_-10px_rgba(245,158,11,0.3)] rounded-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 animate-pulse"></div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-amber-500 animate-bounce" />
                <h2 className="text-xl font-black text-white uppercase tracking-wide">Confirm Transaction</h2>
              </div>
              
              <div className="p-4 bg-amber-950/30 border border-amber-500/20 rounded-lg text-sm text-amber-200 mb-6">
                <p className="font-bold mb-2 font-mono">WARNING: PREMIUM UPGRADE INITIATED</p>
                <p className="opacity-80">You are about to upgrade to SpectroModel Premium.</p>
              </div>
              
              <div className="space-y-3 text-slate-400 text-xs font-mono mb-8">
                <p className="flex items-start gap-2">
                  <span className="text-amber-500">►</span>
                  <span>TRANSACTION IS FINAL & NON-REFUNDABLE</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-500">►</span>
                  <span>YOU AGREE TO TERMS OF SERVICE v5.1</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-500">►</span>
                  <span>CURRENT MARKET RATE: $29.99/MONTH</span>
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowConfirmPurchase(false)}
                  className="flex-1 border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  ABORT
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-lg shadow-orange-900/20"
                  onClick={() => {
                    alert("Purchase Simulated. In production, this would charge the card.");
                    setShowConfirmPurchase(false);
                  }}
                >
                  AUTHORIZE PAYMENT
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}