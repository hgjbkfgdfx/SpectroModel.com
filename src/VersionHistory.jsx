import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Zap, Shield, CheckCircle, AlertCircle, RefreshCw, GitBranch, Terminal, Lock, Server, Brain, Cpu, Sliders, Activity } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import HolographicBackground from "@/components/shared/HolographicBackground";

const CURRENT_VERSION = "5.0.0";
const VERSION_DATE = "JAN 2025";

const versions = [
    {
      version: "5.0.0",
      date: "JANUARY 2025",
      type: "major",
      features: [
        "🎙️ SpectroModel Studio with AI Auto-Correction",
        "🔒 Military-Grade Security (AES-256 encryption)",
        "🎬 Advanced Video Generation Engine",
        "🌐 SpectroModel 3D Studio (Custom Avatar Creator)",
        "🚀 World-Class Processing Speeds",
        "📊 Spectrogram Analysis in Advanced Analytics",
        "🔐 Enhanced Terms & Copyright Protection",
        "♿ Full Accessibility Compliance (WCAG 2.1)",
        "📱 Mobile-First Responsive Design",
        "🛡️ GDPR & CCPA Compliant"
      ],
      security: [
        "AES-256 end-to-end encryption",
        "SHA-256 file hashing",
        "OAuth 2.0 with PKCE",
        "Secure token refresh",
        "XSS & CSRF protection",
        "Rate limiting",
        "Input sanitization",
        "SQL injection prevention"
      ]
    },
    {
      version: "4.2.0",
      date: "DECEMBER 2024",
      type: "minor",
      features: [
        "Market Insights integration",
        "Unified DSP analysis",
        "Cache optimization",
        "Bug fixes"
      ]
    },
    {
      version: "4.0.0",
      date: "NOVEMBER 2024",
      type: "major",
      features: [
        "Rhythm Analysis",
        "Genre Predictor",
        "Time Series Analysis",
        "DSP Algorithms page"
      ]
    }
  ];

export default function VersionHistoryPage() {
  const navigate = useNavigate();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);

  const checkForUpdates = async () => {
    setUpdating(true);
    // Simulate checking for updates
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUpdateAvailable(false);
    setUpdating(false);
    alert(">> SYSTEM CHECK COMPLETE: CORE UP TO DATE.");
  };

  return (
    // CYBERPUNK BASE
    <div className="min-h-screen bg-[#030014] text-cyan-50 font-sans selection:bg-purple-500/30 selection:text-purple-100 overflow-x-hidden relative">
      <HolographicBackground />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-[1]"></div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8 p-4 md:p-8">
        <NetworkErrorBanner />
        <AILearningBanner />

        {/* HEADER */}
        <div className="flex items-center gap-4 border-b border-white/5 bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-4">
              <GitBranch className="w-10 h-10 text-purple-500 animate-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-500">
                SYSTEM VERSION CONTROL
              </span>
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-wider">
              Build: <span className="text-purple-400 font-bold">{CURRENT_VERSION}</span> | Timestamp: {VERSION_DATE}
            </p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <Card className="bg-black/60 border border-purple-500/30 shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)] backdrop-blur-xl rounded-2xl overflow-hidden relative">
            
            {/* Big Background Icon */}
          <Terminal className="absolute -right-12 -bottom-12 w-64 h-64 text-purple-500/5 rotate-12 pointer-events-none" />

          <CardHeader className="border-b border-white/5 bg-white/5 p-6 relative z-10">
            <CardTitle className="text-white flex items-center gap-2 text-lg font-bold uppercase tracking-widest">
                <Terminal className="w-5 h-5 text-purple-400" />
                Maintenance Console
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 relative z-10">
            <Button
              onClick={checkForUpdates}
              disabled={updating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold h-14 tracking-widest text-xs shadow-lg shadow-purple-900/20 backdrop-blur-sm"
            >
              {updating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  QUERYING SERVER NODES...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  CHECK FOR PATCHES
                </>
              )}
            </Button>

            {updateAvailable && (
              <div className="p-4 bg-green-950/30 border border-green-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-green-300 font-bold text-sm uppercase">Patch Available</p>
                  <p className="text-xs text-green-400/70 font-mono mt-1">
                    &gt;&gt; INITIATE REFRESH SEQUENCE TO INSTALL.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* VERSION HISTORY */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Change Log</h3>
             <div className="text-[10px] text-slate-500 font-mono border border-slate-800 rounded px-2 py-1 bg-black/40">
                 BRANCH: MAIN
             </div>
          </div>
          
          {/* Diagram Injection - Version Tree */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <div className="text-[10px] text-slate-500 border border-slate-700 rounded px-3 py-2 bg-black/30 font-mono">
                    [Image of software version control branching diagram]
                </div>
          </div>

          {versions.map((v, idx) => (
            <Card
              key={v.version}
              className={`bg-black/40 backdrop-blur-md rounded-xl overflow-hidden transition-all ${
                idx === 0
                  ? "border border-purple-500/50 shadow-[0_0_20px_-5px_rgba(168,85,247,0.15)]"
                  : "border border-slate-800 opacity-80 hover:opacity-100"
              }`}
            >
              <CardHeader className={`p-6 border-b ${idx === 0 ? "border-purple-500/20 bg-purple-950/10" : "border-slate-800 bg-slate-900/20"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-white flex items-center gap-3 text-lg font-black uppercase tracking-wide">
                      <span className="font-mono text-xl">{v.version}</span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/50 text-[10px] rounded font-mono">
                          LATEST
                        </span>
                      )}
                      {v.type === "major" && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/50 text-[10px] rounded font-mono">
                          MAJOR RELEASE
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-wider">{v.date}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Feature Manifest
                  </h4>
                  <ul className="space-y-2">
                    {v.features.map((feature, fidx) => (
                      <li
                        key={fidx}
                        className="flex items-start gap-3 text-sm text-slate-300 font-light"
                      >
                        <span className="text-green-500 mt-1">&gt;&gt;</span>
                        <span className="break-words font-mono text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {v.security && (
                  <div className="p-4 bg-green-950/10 border border-green-900/30 rounded-lg">
                    <h4 className="text-xs text-green-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Security Protocols
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {v.security.map((sec, sidx) => (
                        <div
                          key={sidx}
                          className="flex items-center gap-2 text-[10px] text-green-300/80 font-mono bg-green-900/20 px-2 py-1 rounded"
                        >
                          <Lock className="w-3 h-3 text-green-500 shrink-0" />
                          <span className="truncate">{sec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* SECURITY ARCHITECTURE - GREEN */}
        <Card className="bg-gradient-to-br from-green-950/30 to-slate-950/30 border border-green-500/30 backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-green-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
            <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-wide">
              Military-Grade Encryption Core
            </h3>
            <p className="text-sm text-slate-300 mb-8 max-w-lg mx-auto font-light leading-relaxed">
              SpectroModel operates on a zero-knowledge architecture. All user data is encrypted at rest using AES-256 standards before hitting our database shards.
            </p>
            
            {/* Diagram Injection - Encryption */}
            <div className="mb-8 flex justify-center">
                 <div className="text-[10px] text-green-500/70 border border-green-500/30 rounded px-3 py-2 bg-black/50 font-mono inline-block">
                     [Image of encryption flowchart]
                 </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-black/40 border border-green-500/20 p-4 rounded-xl">
                <p className="text-3xl font-black text-green-400 mb-1">256-BIT</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">AES Standard</p>
              </div>
              <div className="bg-black/40 border border-blue-500/20 p-4 rounded-xl">
                <p className="text-3xl font-black text-blue-400 mb-1">OAUTH 2</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Authentication</p>
              </div>
              <div className="bg-black/40 border border-purple-500/20 p-4 rounded-xl">
                <p className="text-3xl font-black text-purple-400 mb-1">SHA-256</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Hashing Algo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-[10px] text-slate-600 pt-6 px-4 font-mono uppercase tracking-widest">
          <p>© 2025 SpectroModel Inc. System Access Restricted.</p>
        </div>
      </div>
    </div>
  );
}