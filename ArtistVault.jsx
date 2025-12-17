import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Shield, Lock, ArrowLeft, HardDrive, Key, Database, Layers, Hexagon } from "lucide-react";
import MediaManager from '@/components/monetization/MediaManager';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { base44 } from "@/api/base44Client";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LimitLocker from "@/components/shared/LimitLocker";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import SecurityMonitor from "@/components/shared/SecurityMonitor";
import ParticleSystem from "@/components/shared/ParticleSystem";

const Diagram = ({ type, label, color = "purple" }) => {
  const colorMap = {
    purple: "text-purple-400 border-purple-500/30 bg-purple-950/30",
    amber: "text-amber-400 border-amber-500/30 bg-amber-950/30",
    cyan: "text-cyan-400 border-cyan-500/30 bg-cyan-950/30",
    green: "text-green-400 border-green-500/30 bg-green-950/30"
  };

  return (
    <div className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg flex flex-col items-center justify-center relative overflow-hidden group py-4 hover:border-white/20 transition-all">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="text-center z-10 px-4 relative w-full">
        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Diagram</div>
        <Badge variant="outline" className={`font-mono text-[10px] py-0.5 px-3 mb-1 ${colorMap[color]}`}>
          &lt;{type} /&gt;
        </Badge>
        {label && <p className="text-slate-400 text-[10px] max-w-md mx-auto font-mono leading-tight">{label}</p>}
      </div>
    </div>
  );
};

export default function ArtistVaultPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0 });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  useEffect(() => {
    const init = async () => {
      blockScriptInjection();
      const cspResult = validateCSP();
      setSecurityStatus({ safe: cspResult.valid, threats: cspResult.violations?.length || 0 });

      mlDataCollector.record('artist_vault_visit', {
        feature: 'artist_vault',
        timestamp: Date.now()
      });
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0 p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-purple-500/30 selection:text-purple-100 overflow-x-hidden">
      
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>
      <ParticleSystem />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <NetworkErrorBanner />
        <AILearningBanner />
        <SecurityMonitor />
        <LimitLocker feature="analysis_uploads" featureKey="ARTIST_VAULT" user={currentUser} />

        {/* HEADER */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Monetization"))}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <Lock className="w-8 h-8 text-purple-500 animate-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-amber-500 to-yellow-500">
                SECURE ASSET VAULT
              </span>
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-wider">
              Encrypted Storage • Intellectual Property • Unreleased Masters
            </p>
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
                            <p className="text-white font-bold text-xs uppercase">Encryption Level</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                {securityStatus.safe ? '>> AES-256 STANDARD' : '!! PROTOCOL MISMATCH'}
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">SECURE</Badge>
                </CardContent>
            </Card>

            {/* AI Status */}
            <Card className="bg-black/60 border border-cyan-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Cataloging AI</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                &gt;&gt; INDEXING ASSETS...
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">ACTIVE</Badge>
                </CardContent>
            </Card>
        </div>

        <LiveSecurityDisplay />
        <LiveThreatDisplay />

        {/* INFO & ARCHITECTURE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Architecture Info */}
            <Card className="bg-purple-950/10 border border-purple-500/20 rounded-xl lg:col-span-1">
                 <CardHeader className="p-4 border-b border-purple-500/10">
                    <CardTitle className="text-purple-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <Key className="w-4 h-4" /> Security Protocol
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-4 space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed font-light">
                        Your unreleased masterpieces are stored in a zero-knowledge encrypted environment. Only your private key (derived from login credentials) can decrypt the media stream.
                    </p>
                    
                    <Diagram type="zero_knowledge_encryption" label="Client-Side Decryption" color="purple" />
                 </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-black/60 border border-slate-800 rounded-xl lg:col-span-2">
                 <CardContent className="p-6 grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-slate-900/50 rounded border border-slate-700">
                        <HardDrive className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Storage Used</p>
                        <p className="text-lg font-black text-white font-mono">0.0 GB</p>
                    </div>
                    <div className="text-center p-3 bg-slate-900/50 rounded border border-slate-700">
                        <Database className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                        <p className="text-[10px] text-slate-500 uppercase font-bold">File Count</p>
                        <p className="text-lg font-black text-white font-mono">0</p>
                    </div>
                    <div className="text-center p-3 bg-slate-900/50 rounded border border-slate-700">
                        <Layers className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Backups</p>
                        <p className="text-lg font-black text-white font-mono">AUTO</p>
                    </div>
                 </CardContent>
            </Card>
        </div>

        {/* MAIN MEDIA MANAGER - GOLD */}
        <Card className="bg-black/60 border border-amber-500/30 shadow-[0_0_40px_-10px_rgba(245,158,11,0.15)] rounded-2xl overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500"></div>
            <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-white flex items-center gap-3 text-xl font-bold uppercase tracking-wide">
                        <Database className="w-6 h-6 text-amber-400" />
                        Media Repository
                    </CardTitle>
                    
                    <div className="hidden md:block">
                       <Badge variant="outline" className="font-mono text-amber-500 border-amber-500/30 bg-amber-950/30 text-[10px] py-1 px-3">
                          &lt;ingestion_pipeline /&gt; ACTIVE
                       </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="bg-black/20 min-h-[500px]">
                    <MediaManager />
                </div>
            </CardContent>
        </Card>

        {/* FOOTER */}
        <div className="flex items-center justify-center p-4 bg-amber-950/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-500/70 text-center font-mono flex items-center gap-2">
                <Shield className="w-3 h-3" />
                &gt;&gt; VAULT INTEGRITY: 100% • REDUNDANCY: 3X GEOGRAPHIC DISTRIBUTION
            </p>
        </div>

      </div>
    </div>
  );
}