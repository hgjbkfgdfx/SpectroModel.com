import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Scale, Gavel, FileText, AlertTriangle, CheckCircle, Globe, Copyright, Zap, Server, Ban, Brain, CreditCard, FileCheck, Layers, Hexagon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import { Badge } from "@/components/ui/badge";

const Diagram = ({ type, label, color = "gold" }) => {
  const colorMap = {
    gold: "text-amber-400 border-amber-500/30 bg-amber-950/30",
    amber: "text-amber-400 border-amber-500/30 bg-amber-950/30",
    cyan: "text-cyan-400 border-cyan-500/30 bg-cyan-950/30",
    red: "text-red-400 border-red-500/30 bg-red-950/30",
    blue: "text-blue-400 border-blue-500/30 bg-blue-950/30",
    purple: "text-purple-400 border-purple-500/30 bg-purple-950/30",
  };
  
  const Icon = type.includes("architecture") || type.includes("flowchart") || type.includes("structure") ? Layers : Hexagon;
  const styles = colorMap[color] || colorMap.gold;
  // Extract generic color name for dynamic border/bg classes if needed, or just use the styles
  const lightColorClass = styles.split(' ')[0]; // e.g. text-amber-400

  return (
    <div className="w-full h-56 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden group my-6 hover:border-white/20 transition-all">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      <div className="text-center z-10 p-6 relative">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse border ${styles.split(' ')[1]} bg-opacity-10`}>
          <Icon className={`w-8 h-8 ${lightColorClass}`} />
        </div>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Legal Schematic</div>
        <Badge variant="outline" className={`font-mono text-lg py-1 px-6 mb-2 ${styles}`}>
          &lt;{type} /&gt;
        </Badge>
        {label && <p className="text-slate-400 text-sm max-w-md mx-auto mt-3 font-mono">{label}</p>}
      </div>
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 ${lightColorClass}`} />
    </div>
  );
};

const CASE_INSENSITIVITY_CLAUSE = `
*** INTERPRETATION CLAUSE: CASE INSENSITIVITY & NOMENCLATURE ***
For the purposes of this Agreement and all associated legal documents, the terms "Creator", "creator", "Company", "company", "Owner", "owner", "Employee", "employee", "SpectroModel ENT", "SpectroModel", "spectromodel", "Company's Creator", "Company's Creator", "Company's Creator", and any other variation in capitalization, spacing, or casing SHALL BE INTERPRETED AS SYNONYMOUS. The intent and legal weight of the statement remain unchanged regardless of typographic variation. English language ambiguity shall not be exploited to void these terms.
`;

export default function CompanyCopyrightPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0 });

  useEffect(() => {
    blockScriptInjection();
    const cspResult = validateCSP();
    setSecurityStatus({ safe: cspResult.valid, threats: cspResult.violations?.length || 0 });
    
    mlDataCollector.record('company_copyright_visit', {
      feature: 'legal_compliance',
      timestamp: Date.now()
    });
  }, []);

  return (
    // CYBERPUNK BASE - FULLY RESPONSIVE
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0 p-2 sm:p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-amber-500/30 selection:text-amber-100 overflow-x-hidden">
      
      {/* Decorative Grid Overlay */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        <NetworkErrorBanner />
        <AILearningBanner />
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 sm:pb-6 gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 rounded-full transition-all duration-300 shrink-0"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight flex items-center gap-2 sm:gap-3 flex-wrap">
                <Copyright className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 animate-pulse shrink-0" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 break-words">
                  CORPORATE GOVERNANCE
                </span>
              </h1>
              <p className="text-slate-400 font-mono text-[10px] sm:text-xs mt-1 sm:mt-2 uppercase tracking-wider truncate">
                IP • Liability • Patents • User Mandates
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right shrink-0">
             <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-900/10 font-mono text-[10px] uppercase mb-1">
                LEGAL BINDING: ACTIVE
            </Badge>
            <p className="text-[10px] text-slate-500 font-mono">ID: SP-LEGAL-2025</p>
          </div>
        </div>

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <LiveSecurityDisplay />
             <LiveThreatDisplay />
        </div>

        {/* USER TOOL LINK */}
        <Card className="bg-gradient-to-r from-amber-950/40 to-orange-950/40 border border-amber-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-full border border-amber-500/30">
                     <FileCheck className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                <h3 className="text-white font-bold text-lg uppercase tracking-wide">
                    Register Your Assets?
                </h3>
                <p className="text-slate-400 text-xs font-mono">
                    Access the Copyright Protection Terminal to timestamp your work.
                </p>
                </div>
            </div>
            <Button 
              onClick={() => navigate(createPageUrl("CopyrightProtection"))}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase tracking-widest text-xs h-12 px-6 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              Access Registration Tool
            </Button>
          </CardContent>
        </Card>

        {/* INTERPRETATION CLAUSE */}
        <div className="bg-yellow-950/20 border-l-4 border-yellow-500 p-6 rounded-r-xl backdrop-blur-sm font-mono text-xs text-yellow-200/80 leading-relaxed">
          <strong className="block mb-2 text-yellow-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Critical Interpretation Syntax:
          </strong>
          {CASE_INSENSITIVITY_CLAUSE}
        </div>

        {/* MAIN LEGAL CONTENT */}
        <div className="space-y-12">
          
          {/* Section 1: IP - GOLD */}
          <Card className="bg-black/60 border border-amber-500/30 backdrop-blur-xl rounded-2xl overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-500"></div>
             <CardHeader className="border-b border-amber-900/20 bg-amber-950/10 p-6">
                <CardTitle className="text-amber-400 flex items-center gap-3 text-2xl font-black uppercase tracking-wide">
                    <Shield className="w-8 h-8" /> Section I: IP & Assets
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
                
                {/* Diagram Injection */}
                <Diagram type="intellectual_property_flowchart" label="Asset Ownership Structure" color="gold" />

                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-amber-900/20 rounded border border-amber-500/30 shrink-0 mt-1">
                            <Copyright className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold uppercase text-sm mb-2">1.1 Exclusive Ownership</h3>
                            <p className="text-slate-400 text-xs font-light leading-relaxed">
                                <strong className="text-amber-200">COMPANY OWNS ALL INTELLECTUAL PROPERTY.</strong> SpectroModel ENT. retains exclusive rights to the App, source code, algorithms (DSP engines, AI datasets, VibeVision™), and brand assets. Unauthorized replication is a violation of international law.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                         <div className="p-2 bg-amber-900/20 rounded border border-amber-500/30 shrink-0 mt-1">
                            <Zap className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold uppercase text-sm mb-2">1.2 Trademarks</h3>
                            <p className="text-slate-400 text-xs font-light leading-relaxed">
                               <strong>SpectroModel™</strong>, <strong>VibeVision™</strong>, and <strong>SpectroVerse™</strong> are registered trademarks. Unauthorized commercial use triggers immediate legal countermeasures.
                            </p>
                            </div>
                            </div>

                            <div className="flex items-start gap-4">
                            <div className="p-2 bg-amber-900/20 rounded border border-amber-500/30 shrink-0 mt-1">
                            <FileText className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                            <h3 className="text-white font-bold uppercase text-sm mb-2">1.3 Patent Protection</h3>
                            <p className="text-slate-400 text-xs font-light leading-relaxed">
                               <strong className="text-amber-200">PATENT PENDING.</strong> The core algorithms, DSP processing methods, AI neural network architectures, hit prediction models, and audio analysis techniques are protected under pending patent applications. Any reproduction, reverse engineering, or derivative work creation without express written authorization is strictly prohibited under U.S. Patent Law (35 U.S.C.) and international treaties.
                            </p>
                            </div>
                            </div>
                            </div>
                            </CardContent>
                            </Card>

          {/* Section 2: Liability - RED */}
          <Card className="bg-black/60 border border-red-500/30 backdrop-blur-xl rounded-2xl overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
             <CardHeader className="border-b border-red-900/20 bg-red-950/10 p-6">
                <CardTitle className="text-red-400 flex items-center gap-3 text-2xl font-black uppercase tracking-wide">
                    <Scale className="w-8 h-8" /> Section II: Rights & Liability
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
                 
                 {/* Diagram Injection */}
                <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-lg flex items-center justify-center">
                     <div className="text-[10px] text-red-400/70 border border-red-500/30 rounded px-2 py-1 bg-black/30 font-mono">
                       [LIABILITY MATRIX PLACEHOLDER]
                     </div>
                </div>

                <div className="space-y-4">
                     <div className="flex items-start gap-4">
                        <div className="p-2 bg-red-900/20 rounded border border-red-500/30 shrink-0 mt-1">
                            <FileText className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold uppercase text-sm mb-2">2.1 User Ownership</h3>
                            <p className="text-slate-400 text-xs font-light leading-relaxed">
                                SpectroModel ENT. does <strong className="text-red-300">NOT</strong> claim ownership of User content uploaded for analysis. The User retains full copyright of their own work.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                         <div className="p-2 bg-red-900/20 rounded border border-red-500/30 shrink-0 mt-1">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold uppercase text-sm mb-2">2.2 Indemnification</h3>
                            <p className="text-slate-400 text-xs font-light leading-relaxed">
                                The Company is <strong className="text-red-300">NOT RESPONSIBLE</strong> for legal actions taken against Users for copyright infringement, unauthorized use of likeness, or other violations. Users assume full liability.
                            </p>
                        </div>
                    </div>
                </div>
             </CardContent>
          </Card>

          {/* Section 3: Third Parties - BLUE */}
          <Card className="bg-black/60 border border-blue-500/30 backdrop-blur-xl rounded-2xl overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
             <CardHeader className="border-b border-blue-900/20 bg-blue-950/10 p-6">
                <CardTitle className="text-blue-400 flex items-center gap-3 text-2xl font-black uppercase tracking-wide">
                    <Globe className="w-8 h-8" /> Section III: External Systems
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                     <div className="p-4 bg-blue-950/20 border border-blue-500/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Server className="w-5 h-5 text-blue-400" />
                            <h3 className="text-white font-bold uppercase text-sm">3.1 Third Party Disclaimer</h3>
                        </div>
                        <p className="text-slate-400 text-xs font-light leading-relaxed">
                            The Company does not own cloud platforms (Google, Meta, X). References are for integration purposes only. We are not liable for third-party failures.
                        </p>
                     </div>

                     <div className="p-4 bg-blue-950/20 border border-blue-500/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Lock className="w-5 h-5 text-blue-400" />
                            <h3 className="text-white font-bold uppercase text-sm">3.2 Non-Cooperation Policy</h3>
                        </div>
                        <p className="text-slate-400 text-xs font-light leading-relaxed">
                            SpectroModel maintains a strict <strong className="text-blue-300">NO VOLUNTARY COOPERATION</strong> policy with law enforcement regarding User data unless compelled by federal court order.
                        </p>
                     </div>
                </div>
             </CardContent>
          </Card>

          {/* Section 4: Conduct - RED ALERT */}
          <Card className="bg-red-950/10 border border-red-500/50 backdrop-blur-xl rounded-2xl overflow-hidden">
             <CardHeader className="border-b border-red-900/20 bg-red-950/20 p-6">
                <CardTitle className="text-red-500 flex items-center gap-3 text-2xl font-black uppercase tracking-wide">
                    <Gavel className="w-8 h-8" /> Section IV: Conduct & Ethics
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-6">
                <div className="flex items-start gap-4">
                    <Ban className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <div>
                        <h3 className="text-white font-bold uppercase text-sm mb-2">4.1 Zero Tolerance</h3>
                        <p className="text-slate-400 text-xs font-light leading-relaxed">
                            Forgery, theft of artist identity, and unauthorized distribution of copyrighted material are strictly prohibited. Users displaying adult content in shared spaces will face immediate termination.
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <Shield className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <div>
                        <h3 className="text-white font-bold uppercase text-sm mb-2">4.2 Reputation Protection</h3>
                        <p className="text-slate-400 text-xs font-light leading-relaxed">
                            Harassment or defamation targeting the Company's legacy, employees, or digital presence will result in legal action and platform bans.
                        </p>
                    </div>
                </div>
             </CardContent>
          </Card>

          {/* Section 5: Payments & AI - CYAN */}
          <Card className="bg-black/60 border border-cyan-500/30 backdrop-blur-xl rounded-2xl overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
             <CardHeader className="border-b border-cyan-900/20 bg-cyan-950/10 p-6">
                <CardTitle className="text-cyan-400 flex items-center gap-3 text-2xl font-black uppercase tracking-wide">
                    <CreditCard className="w-8 h-8" /> Section V: Finance & AI
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
                
                {/* Diagram Injection */}
                <Diagram type="ai_data_usage_cycle" label="Neural Training Loop" color="cyan" />

                <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <h3 className="text-white font-bold uppercase text-sm flex items-center gap-2">
                             <Lock className="w-4 h-4 text-cyan-500" /> 5.1 Non-Refundable
                        </h3>
                        <p className="text-slate-400 text-xs font-light leading-relaxed">
                            All payments are final. User agrees to terms upon purchase. Market prices apply.
                        </p>
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-white font-bold uppercase text-sm flex items-center gap-2">
                             <Brain className="w-4 h-4 text-cyan-500" /> 5.2 AI Learning Mandate
                        </h3>
                        <p className="text-slate-400 text-xs font-light leading-relaxed">
                            <strong>"AI Learns From My Data".</strong> Use of the App constitutes consent for anonymized data usage to train and refine the Company's neural networks.
                        </p>
                     </div>
                </div>
             </CardContent>
          </Card>

        </div>

        {/* FOOTER */}
        <div className="mt-16 pt-8 border-t border-slate-800 text-center space-y-4">
          <div className="bg-red-950/10 border border-red-900/30 p-4 rounded-xl max-w-4xl mx-auto">
             <p className="font-bold text-red-400 text-xs uppercase leading-relaxed font-mono">
                WARNING: PROTECT YOUR IDENTITY. DO NOT SHARE PERSONAL INFO. <br/>
                ANALYTICAL OUTPUTS DO NOT CONSTITUTE DEFAMATION. USER WAIVES RIGHT TO SUE BASED ON ALGORITHMIC SCORES.
            </p>
          </div>
          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">
            © 2025 SpectroModel Inc. All Rights Reserved. | COMPANY OWNS ALL INTELLECTUAL PROPERTY.
          </p>
          <p className="text-slate-600 text-[9px] font-mono">
            ID: SP-LEGAL-2025-FULL-56PG | VER: 2.2.0-RELEASE | COMPLIANCE: GDPR, CCPA, LGPD, PIPEDA
          </p>
        </div>
      </div>
    </div>
  );
}