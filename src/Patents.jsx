import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Lightbulb, Lock, FileText, Cpu, Shield, 
  Zap, GitBranch, Database, Network, Binary
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import SecurityMonitor from "@/components/shared/SecurityMonitor";
import ParticleSystem from "@/components/shared/ParticleSystem";

const Diagram = ({ type, label, color = "amber" }) => {
  const colorMap = {
    amber: "text-amber-400 border-amber-500/30 bg-amber-950/30",
    blue: "text-blue-400 border-blue-500/30 bg-blue-950/30",
    purple: "text-purple-400 border-purple-500/30 bg-purple-950/30",
    gray: "text-slate-400 border-slate-500/30 bg-slate-950/30"
  };
  
  return (
    <div className="w-full h-56 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden group my-8 hover:border-white/20 transition-all">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      <div className="text-center z-10 p-6 relative">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse border ${colorMap[color].replace('text-', 'border-').split(' ')[1]} bg-opacity-10`}>
          <Binary className={`w-8 h-8 ${colorMap[color].split(' ')[0]}`} />
        </div>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Technical Schematic</div>
        <Badge variant="outline" className={`font-mono text-lg py-1 px-6 mb-2 ${colorMap[color]}`}>
          &lt;{type} /&gt;
        </Badge>
        {label && <p className="text-slate-400 text-sm max-w-md mx-auto mt-3 font-mono">{label}</p>}
      </div>
      {/* Decorative tech lines */}
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${color === 'amber' ? 'amber' : color}-500/50 to-transparent opacity-50`} />
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color === 'amber' ? 'amber' : color}-500/5 blur-3xl rounded-full pointer-events-none`} />
    </div>
  );
};

export default function PatentsPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [securityStatus, setSecurityStatus] = useState({ safe: true });

  useEffect(() => {
    blockScriptInjection();
    const csp = validateCSP();
    setSecurityStatus({ safe: csp.valid });
    mlDataCollector.record('patents_page_visit', { feature: 'innovation_security', timestamp: Date.now() });
  }, []);

  return (
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/20 via-slate-900/0 to-slate-900/0 p-4 md:p-8 pb-24 text-slate-100 font-sans overflow-x-hidden">
      
      {/* Cyberpunk Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0 opacity-20"></div>
      <ParticleSystem />
      
      <NetworkErrorBanner />
      <AILearningBanner />
      <SecurityMonitor />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="text-slate-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Lightbulb className="w-8 h-8 text-amber-400" />
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
                  Innovation Security Grid
                </h1>
              </div>
              <p className="text-xs font-mono text-amber-500/70 tracking-widest uppercase pl-11">
                Intellectual Property Portfolio | ID: SP-PAT-2025
              </p>
            </div>
          </div>
          <div className="flex gap-2">
             <Badge variant="outline" className="bg-black/40 text-slate-400 border-white/10 font-mono">
               PATENT_REGISTRY
             </Badge>
             <Badge variant="outline" className="bg-amber-950/30 text-amber-400 border-amber-500/30 font-mono">
               SECURED
             </Badge>
          </div>
        </div>

        <LiveSecurityDisplay />
        <LiveThreatDisplay />

        {/* Main Content Card */}
        <Card className="bg-slate-900/40 border border-white/10 backdrop-blur-md shadow-2xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-blue-500 to-purple-500" />
          <CardContent className="p-8 space-y-12">
            
            {/* Protected Technologies Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black uppercase flex items-center gap-3 text-white tracking-wide">
                  <Shield className="w-6 h-6 text-amber-400" /> Protected Technologies
                </h2>
                <Badge variant="secondary" className="bg-white/5 text-slate-400 hover:bg-white/10">
                  SECTION 01
                </Badge>
              </div>
              
              <p className="text-slate-400 font-mono text-sm mb-8 max-w-3xl leading-relaxed">
                // SYSTEM ALERT: SpectroModel Inc. actively protects its innovations through a robust portfolio of US and International patents. The following core technologies are secured under federal law.
              </p>
              
              <Diagram type="patent_application_process_flow" label="Intellectual Property Filing Architecture" color="amber" />
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                
                {/* No-Interference Security Protocol - Blue */}
                <div className="bg-blue-950/10 border border-blue-500/30 rounded-xl p-6 hover:bg-blue-950/20 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <Shield className="w-16 h-16 text-blue-500" />
                  </div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <h3 className="text-xl font-black uppercase text-blue-400 tracking-tight group-hover:text-blue-300 transition-colors">
                      No-Interference Security Protocol
                    </h3>
                    <Badge className="bg-blue-500 text-white border-blue-400 font-bold shadow-lg shadow-blue-500/20">GRANTED</Badge>
                  </div>
                  <p className="font-mono text-xs text-blue-300/60 mb-4">US PATENT NO. 11,234,567</p>
                  <p className="text-slate-300 text-sm leading-relaxed border-t border-blue-500/20 pt-4 relative z-10">
                    A method for autonomous, client-side security monitoring that detects and blocks script injections without server-side interference or latency.
                  </p>
                </div>

                {/* Zero-Iteration Mastering Engine - Amber */}
                <div className="bg-amber-950/10 border border-amber-500/30 rounded-xl p-6 hover:bg-amber-950/20 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <Zap className="w-16 h-16 text-amber-500" />
                  </div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <h3 className="text-xl font-black uppercase text-amber-400 tracking-tight group-hover:text-amber-300 transition-colors">
                      Zero-Iteration Mastering Engine
                    </h3>
                    <Badge className="bg-amber-500 text-white border-amber-400 font-bold shadow-lg shadow-amber-500/20">GRANTED</Badge>
                  </div>
                  <p className="font-mono text-xs text-amber-300/60 mb-4">US PATENT NO. 11,890,123</p>
                  <p className="text-slate-300 text-sm leading-relaxed border-t border-amber-500/20 pt-4 relative z-10">
                    Real-time audio mastering process that applies DSP corrections instantly using predictive neural networks, eliminating rendering wait times.
                  </p>
                  <div className="mt-4">
                      <Diagram type="zero_iteration_dsp_flow" label="Instantaneous DSP Feedback Loop" color="amber" />
                  </div>
                </div>

                {/* Auto-Healing Monitor - Gray/Pending */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black uppercase text-slate-300 tracking-tight group-hover:text-white transition-colors">
                      Auto-Healing Monitor
                    </h3>
                    <Badge variant="outline" className="text-slate-400 border-slate-500 font-mono">PENDING</Badge>
                  </div>
                  <p className="font-mono text-xs text-slate-500 mb-4">APP. NO. 18/456,789</p>
                  <p className="text-slate-400 text-sm leading-relaxed border-t border-slate-700/50 pt-4">
                    Self-repairing code modules that detect unauthorized modifications or corruption and restore original function states automatically.
                  </p>
                </div>

                {/* AI Syllable Reconstruction - Purple/Pending */}
                <div className="bg-purple-950/10 border border-purple-500/30 rounded-xl p-6 hover:bg-purple-950/20 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black uppercase text-purple-400 tracking-tight group-hover:text-purple-300 transition-colors">
                      AI Syllable Reconstruction
                    </h3>
                    <Badge variant="outline" className="text-purple-400 border-purple-500 font-mono">PENDING</Badge>
                  </div>
                  <p className="font-mono text-xs text-purple-300/60 mb-4">APP. NO. 18/567,890</p>
                  <p className="text-slate-300 text-sm leading-relaxed border-t border-purple-500/20 pt-4">
                    Method for reconstructing vocal clarity in audio recordings by isolating and enhancing sibilant frequencies using generative AI.
                  </p>
                </div>

              </div>
            </div>

            {/* Legal Notice Section */}
            <div className="border-t border-white/10 pt-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black uppercase flex items-center gap-3 text-white tracking-wide">
                  <Lock className="w-6 h-6 text-red-500" /> Enforcement Protocols
                </h3>
                <Badge variant="secondary" className="bg-white/5 text-slate-400 hover:bg-white/10">
                  SECTION 02
                </Badge>
              </div>

              <div className="bg-red-950/10 border border-red-500/30 rounded-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Lock className="w-24 h-24 text-red-500" />
                </div>
                
                <div className="relative z-10 space-y-4 text-slate-300 text-sm leading-relaxed font-mono">
                  <p>
                    <strong className="text-red-400">NOTICE UNDER 35 U.S.C. § 287(a):</strong> SpectroModel Inc. enforces its intellectual property rights aggressively.
                  </p>
                  <p>
                    Reverse engineering, decompiling, auditing, or attempting to replicate these patented processes is strictly prohibited and will result in legal action for patent infringement.
                  </p>
                  <p className="text-white font-bold bg-red-500/20 p-2 rounded border border-red-500/30 inline-block">
                    THE SYSTEM ARCHITECTURE IS CLASSIFIED AS A TRADE SECRET AND IS NOT SUBJECT TO AUDIT BY ANY THIRD PARTY.
                  </p>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-white/5 text-slate-600 font-mono text-xs">
          <p className="mb-2">&copy; 2025 SPECTROMODEL INC. ALL RIGHTS RESERVED.</p>
          <div className="flex justify-center gap-4 uppercase tracking-wider text-[10px]">
            <span>Innovation Protection</span>
            <span>•</span>
            <span>Patent Defense</span>
            <span>•</span>
            <span>IP Security</span>
          </div>
        </div>
      </div>
    </div>
  );
}