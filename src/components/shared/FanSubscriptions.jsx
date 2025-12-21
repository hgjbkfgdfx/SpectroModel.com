import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Crown, Users, Star, Plus, Brain, Shield, 
  Gift, Lock, Music, Video, MessageSquare, Calendar
} from "lucide-react";
import { useMLDataCollector } from '@/components/shared/MLDataCollector';

const DEFAULT_TIERS = [];

export default function FanSubscriptions({ user }) {
  const mlDataCollector = useMLDataCollector();
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [showCreate, setShowCreate] = useState(false);
  const [subscribers, setSubscribers] = useState({});
  const [newTier, setNewTier] = useState({ name: '', price: '', perks: '' });

  const handleCreateTier = () => {
    if (!newTier.name || !newTier.price) return;
    
    const tier = {
      id: `tier_${Date.now()}`,
      name: newTier.name,
      price: parseFloat(newTier.price),
      color: 'green',
      perks: newTier.perks.split('\n').filter(p => p.trim())
    };

    setTiers([...tiers, tier]);
    setNewTier({ name: '', price: '', perks: '' });
    setShowCreate(false);

    mlDataCollector.record('subscription_tier_created', {
      feature: 'monetization',
      tierName: tier.name,
      timestamp: Date.now()
    });
  };

  const totalRevenue = tiers.reduce((sum, tier) => {
    const count = subscribers[tier.id] || 0;
    return sum + (count * tier.price);
  }, 0);

  return (
    <div className="space-y-6">
      {/* AI Notice */}
      <Card className="bg-cyan-950/50 border-cyan-500/30">
        <CardContent className="p-4 flex items-center gap-3">
          <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <p className="text-white font-semibold text-sm">🤖 AI Learns From Your Data</p>
            <p className="text-cyan-300 text-xs">Analyzing fan engagement to optimize tier pricing</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <p className="text-xl font-black text-white">
              {Object.values(subscribers).reduce((a,b)=>a+b,0)}
            </p>
            <p className="text-slate-400 text-xs mt-1">Total Subscribers</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Crown className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-black text-white">{tiers.length}</p>
            <p className="text-slate-400 text-xs mt-1">Tiers Active</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-black text-white">${totalRevenue}</p>
            <p className="text-slate-400 text-xs mt-1">Monthly Revenue</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Gift className="w-6 h-6 text-pink-400 mx-auto mb-1" />
            <p className="text-xl font-black text-white">0</p>
            <p className="text-slate-400 text-xs mt-1">Exclusive Posts</p>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold text-lg">Subscription Tiers</h3>
          <p className="text-slate-400 text-sm">Create exclusive content tiers for your fans</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-1" /> Add Tier
        </Button>
      </div>

      {/* Create Tier Form */}
      {showCreate && (
        <Card className="bg-slate-900/80 border-blue-500/50">
          <CardHeader>
            <CardTitle className="text-white">Create New Tier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Tier Name *</label>
                <Input
                  value={newTier.name}
                  onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                  placeholder="Ultimate Fan"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Monthly Price ($) *</label>
                <Input
                  type="number"
                  value={newTier.price}
                  onChange={(e) => setNewTier({ ...newTier, price: e.target.value })}
                  placeholder="15"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-slate-300 text-sm mb-1 block">Perks (one per line)</label>
              <Textarea
                value={newTier.perks}
                onChange={(e) => setNewTier({ ...newTier, perks: e.target.value })}
                placeholder="Exclusive content&#10;Early access&#10;Discord access"
                className="bg-slate-800 border-slate-700 text-white"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateTier} className="bg-blue-600 hover:bg-blue-700">
                <Crown className="w-4 h-4 mr-1" /> Create Tier
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tiers Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map(tier => (
          <Card 
            key={tier.id} 
            className={`bg-slate-900/80 border-${tier.color}-500/50 relative overflow-hidden`}
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-${tier.color}-500`} />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{tier.name}</CardTitle>
                <Badge className={`bg-${tier.color}-500/20 text-${tier.color}-300 font-black text-sm`}>
                  {subscribers[tier.id] || 0} fans
                </Badge>
              </div>
              <p className="text-3xl font-bold text-white">${tier.price}<span className="text-sm text-slate-400">/mo</span></p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tier.perks.map((perk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                    <Star className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Ideas */}
      <Card className="bg-black border-slate-800">
        <CardContent className="p-6">
          <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            AI Content Ideas for Subscribers
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-white font-black inline-flex items-center gap-2">
                <Music className="w-4 h-4 text-green-400" /> Music Content
              </p>
              <ul className="text-sm space-y-1 ml-6">
                <li className="text-slate-300 font-bold">• Demo versions & unreleased tracks</li>
                <li className="text-slate-300 font-bold">• Stem files for remixing</li>
                <li className="text-slate-300 font-bold">• Acoustic versions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-white font-black inline-flex items-center gap-2">
                <Video className="w-4 h-4 text-red-400" /> Video Content
              </p>
              <ul className="text-sm space-y-1 ml-6">
                <li className="text-slate-300 font-bold">• Studio session footage</li>
                <li className="text-slate-300 font-bold">• Music video bloopers</li>
                <li className="text-slate-300 font-bold">• Production tutorials</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}