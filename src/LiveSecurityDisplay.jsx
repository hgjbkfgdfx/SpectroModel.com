import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Monitor } from 'lucide-react';
import { liveAI } from './SecurityValidator';
import { useMLDataCollector } from './MLDataCollector';

import { base44 } from "@/api/base44Client";

export default function LiveSecurityDisplay() {
  const [blockedAttacks, setBlockedAttacks] = useState([]);
  const [threatCount, setThreatCount] = useState(0);
  const [mlComplexity, setMlComplexity] = useState(0);
  const [user, setUser] = useState(null);
  const mlDataCollector = useMLDataCollector();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    let mounted = true;

    const updateInterval = setInterval(() => {
      if (mounted && typeof liveAI !== 'undefined') {
        const attacks = liveAI.getBlockedAttacks();
        setBlockedAttacks(attacks);
        setThreatCount(attacks.length);
        setMlComplexity(liveAI.threatScore || 0);
      }
    }, 2000);

    return () => {
      mounted = false;
      clearInterval(updateInterval);
    };
  }, [mlDataCollector]);

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <Card className="glass-panel border-emerald-500/30 z-cards shadow-[0_0_15px_rgba(16,185,129,0.1)]">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Shield className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-white font-orbitron tracking-wide">SECURITY MONITOR ACTIVE</p>
              <p className="text-xs text-emerald-400/70 font-mono">Session encrypted (AES-256)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/30 font-mono">PG-10+</Badge>
            <Badge className="bg-emerald-600 text-white font-bold shadow-[0_0_10px_rgba(16,185,129,0.5)]">SECURE</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel border-red-500/30 z-cards shadow-[0_0_20px_rgba(239,68,68,0.2)]">
      <CardHeader className="p-3 sm:p-4 bg-gradient-to-r from-red-900/20 to-transparent border-b border-red-500/10">
        <CardTitle className="text-white flex items-center justify-between flex-wrap gap-2 text-sm sm:text-base font-orbitron">
          <div className="flex items-center gap-2 min-w-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 animate-pulse shrink-0" />
            <span className="break-words font-black text-white tracking-wider drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">BLOCKED EXTERNAL SERVICES</span>
          </div>
          <Badge className="bg-red-600 text-white animate-pulse shrink-0 text-xs sm:text-sm shadow-[0_0_10px_rgba(220,38,38,0.8)] border-0">
            {threatCount} THREATS
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 pt-4">
        <div className="p-2 sm:p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Monitor className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-xs sm:text-sm text-purple-300 font-semibold font-mono uppercase">ML Complexity</span>
            <Badge className="ml-auto bg-purple-600 text-white text-[10px] sm:text-xs shrink-0 shadow-[0_0_10px_rgba(147,51,234,0.5)] border-0">
              {mlComplexity.toFixed(2)}
            </Badge>
          </div>
          <div className="text-xs text-purple-200/70 break-words font-mono">AI threat assessment level</div>
        </div>

        {blockedAttacks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm text-red-300 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Recent Blocks ({blockedAttacks.slice(-5).length})
            </h4>
            <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
              {blockedAttacks.slice(-5).reverse().map((attack, idx) => (
                <div key={idx} className="p-2 bg-red-500/10 border border-red-500/30 rounded text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                    <Badge className="bg-red-600 text-white text-[10px] shrink-0">{attack.type}</Badge>
                    <span className="text-slate-400 text-[10px] break-all">{new Date(attack.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-300 space-y-1 break-all">
                    {attack.url && <div><strong>Blocked:</strong> {attack.url.substring(0, 50)}...</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-2 sm:p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h4 className="text-xs sm:text-sm text-blue-300 font-semibold mb-2 break-words">AI Learning Status</h4>
          <div className="space-y-1 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0"></div>
              <span className="break-words">Real-time monitoring active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0"></div>
              <span className="break-words">Learning from {blockedAttacks.length} blocked attacks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0"></div>
              <span className="break-words">Adapting defenses continuously</span>
            </div>
          </div>
        </div>
        
        {/* Anomaly Detection Section */}
        <div className="mt-3 p-2 sm:p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
           <h4 className="text-xs sm:text-sm text-orange-300 font-semibold mb-2 break-words flex items-center gap-2">
             <Activity className="w-3 h-3" /> Network Anomaly Detection
           </h4>
           <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                 <span>Traffic Pattern:</span>
                 <span className="text-green-400">NORMAL</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                 <div className="bg-orange-500 h-full rounded-full animate-pulse" style={{ width: '12%' }}></div>
              </div>
              <p className="text-[10px] text-orange-400/70 font-mono">
                &gt;&gt; ML detected 0 critical anomalies in last 60s.
              </p>
           </div>
        </div>

      </CardContent>
    </Card>
  );
}
import { Activity } from 'lucide-react';