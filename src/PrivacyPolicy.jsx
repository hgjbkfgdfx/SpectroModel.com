import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Eye, Database, Globe, UserCheck, Bell, Trash2, Download, AlertTriangle, FileText, Cloud, Cpu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { AILearningBanner } from "@/components/shared/NetworkErrorHandler";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();

  React.useEffect(() => {
    blockScriptInjection();
    validateCSP();
    mlDataCollector.record('privacy_policy_visit', { feature: 'legal', timestamp: Date.now() });
  }, []);

  const sections = [
    {
      icon: Lock,
      title: "2. DATA UTILIZATION PROTOCOLS",
      color: "text-purple-400",
      content: [
        {
          subtitle: "2.1 CORE FUNCTIONALITY & ANALYSIS",
          text: "Process and analyze audio files using DSP algorithms, generate commercial hit scores and insights, save analysis history for future reference, provide personalized recommendations, enable data export and PDF generation."
        },
        {
          subtitle: "2.2 SERVICE IMPROVEMENT (NEURAL TRAINING)",
          text: "Improve algorithm accuracy through anonymized aggregate data. 'AI Learns From My Data' is a mandatory condition. We debug technical issues, enhance user experience, develop new features, and conduct research on music analytics."
        },
        {
          subtitle: "2.3 COMMUNICATION CHANNELS",
          text: "Send analysis completion notifications (if enabled), provide customer support, send security alerts, share product updates (opt-out available), and respond to your inquiries."
        },
        {
          subtitle: "2.4 LEGAL COMPLIANCE",
          text: "Comply with legal obligations, prevent fraud and abuse, enforce Terms of Service, protect intellectual property rights, and respond to lawful requests from authorities (ONLY when compelled by federal court order)."
        }
      ]
    },
    {
      icon: Globe,
      title: "3. DISCLOSURE VECTORS",
      color: "text-cyan-400",
      content: [
        {
          subtitle: "3.1 THIRD-PARTY INTEGRATIONS",
          text: "Google (authentication via OAuth, AI via Gemini, video via Veo 2.0, creative tools via Flow), Base44 (infrastructure and database), Cloud storage providers (encrypted file hosting). We do NOT sell your data to advertisers or data brokers."
        },
        {
          subtitle: "3.2 NON-COOPERATION POLICY",
          text: "SpectroModel maintains a strict policy of NO COOPERATION WITH LAW ENFORCEMENT regarding User data unless compelled by force, valid court order, or federal subpoena. We prioritize User privacy."
        },
        {
          subtitle: "3.3 AGGREGATED METRICS",
          text: "We may share anonymized, aggregated statistics (e.g., '10,000 tracks analyzed this month') with research partners or in public reports. Individual user data is NEVER included."
        }
      ]
    },
    {
      icon: Shield,
      title: "4. SECURITY ARCHITECTURE",
      color: "text-green-400",
      content: [
        {
          subtitle: "4.1 EPHEMERAL PROCESSING",
          text: ">> CLOUD STORAGE: Raw audio files are NOT permanently stored ANYWHERE. After processing (30-60 seconds), the audio buffer is cleared from memory. Only analysis results (JSON data) are saved to YOUR cloud account. SpectroModel servers NEVER store your audio or analysis data."
        },
        {
          subtitle: "4.2 ACCESS LIMITATIONS",
          text: ">> IMPORTANT: We ONLY access the SpectroModel folder in your cloud storage. We NEVER access your personal files, photos, documents, or any other folders. You can revoke access anytime through your cloud provider's settings."
        },
        {
          subtitle: "4.3 INCIDENT RESPONSE",
          text: "In the unlikely event of a data breach, we will notify affected users within 72 hours via email and take immediate action to secure systems."
        }
      ]
    },
    {
      icon: UserCheck,
      title: "5. INTELLECTUAL PROPERTY",
      color: "text-blue-400",
      content: [
        {
          subtitle: "5.1 OWNERSHIP ASSERTION",
          text: "CREATOR/OWNER of app/COMPANY/ SpectroModel OWNS INTELLECTUAL PROPERTY/PATENT/COPYRIGHTS/TRADEMARKS/INTELLECTUAL PROPERTY. No one can use or steal the name SpectroModel without Owner's and Creator's expressed written consent."
        },
        {
          subtitle: "5.2 INFRINGEMENT ZERO TOLERANCE",
          text: "NO COPYRIGHT INFRINGEMENT ALLOWED. Users cannot forge any artist's work, copy other artist's work without their permission, or steal other artist's work for use without permission. Violators will be banned."
        }
      ]
    }
  ];

  return (
    // CYBERPUNK BASE - FULLY RESPONSIVE
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0 p-2 sm:p-4 md:p-8 pb-8 text-cyan-50 selection:bg-cyan-500/30 selection:text-cyan-100 font-sans overflow-x-hidden">
      
      {/* Decorative Grid Overlay */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <AILearningBanner />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 sm:pb-8 mt-4 sm:mt-6 gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl("Landing"))}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded-full transition-all duration-300 shrink-0"
            >
              <ArrowLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-3xl md:text-5xl font-black mb-1 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-cyan-500">
                  PRIVACY PROTOCOLS
                </span>
              </h1>
              <div className="flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono text-slate-400 mt-1 sm:mt-2">
                 <span className="bg-slate-900 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-slate-700 text-green-400">NOV 25, 2025</span>
                 <span className="bg-slate-900 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-slate-700 hidden sm:inline">SP-PRIV-2025-v2.2</span>
              </div>
            </div>
          </div>
        </div>

        {/* TL;DR Card - Cyber Gold/Yellow */}
        <Card className="bg-black/60 border border-yellow-500/30 shadow-[0_0_20px_-5px_rgba(234,179,8,0.15)] backdrop-blur-md rounded-xl overflow-hidden hover:border-yellow-500/50 transition-all duration-300">
           <div className="absolute left-0 top-0 w-1 h-full bg-yellow-500/50"></div>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-yellow-400 mt-1 shrink-0" />
                <div>
                  <h3 className="text-2xl font-black text-yellow-50 mb-2 uppercase tracking-wide">Executive Summary</h3>
                  <p className="text-slate-300 font-light text-lg leading-relaxed">
                    We collect only necessary data for analysis, use Google OAuth for secure login, never sell your data, and give you full control. 
                    All data is stored in YOUR connected cloud account. We comply with GDPR, CCPA, LGPD, and PIPEDA protocols.
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-yellow-950/30 border border-yellow-500/20 rounded-lg">
                    <h4 className="font-bold text-sm uppercase mb-2 text-yellow-400 flex items-center gap-2">
                        <Cloud className="w-4 h-4" /> Cloud Storage Policy
                    </h4>
                    <p className="text-yellow-100/80 text-sm font-mono leading-relaxed">
                    Raw audio files are NOT permanently stored ANYWHERE. Audio buffer is cleared from memory after 60s. Only JSON results save to YOUR cloud.
                    </p>
                </div>

                <div className="p-4 bg-yellow-950/30 border border-yellow-500/20 rounded-lg">
                    <h4 className="font-bold text-sm uppercase mb-2 text-yellow-400 flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Access Restrictions
                    </h4>
                    <p className="text-yellow-100/80 text-sm font-mono leading-relaxed">
                    We ONLY access the 'SpectroModel' folder. We NEVER access personal files, photos, or documents. Revoke access anytime.
                    </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 0: Anti-Audit Warning - RED ALERT */}
        <Card className="bg-red-950/10 border border-red-500/50 shadow-[0_0_30px_-5px_rgba(220,38,38,0.2)] backdrop-blur-md rounded-xl overflow-hidden animate-pulse-slow">
          <CardHeader className="border-b border-red-500/30 bg-red-950/30 p-6">
            <CardTitle className="text-2xl md:text-3xl text-red-500 font-black flex items-center gap-3 uppercase tracking-widest">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              0. NO AUDIT POLICY
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
             <p className="text-lg md:text-xl font-bold text-red-400 text-justify leading-relaxed uppercase font-mono tracking-tight">
               THIS APPLICATION AND ITS DATA ARE NOT SUBJECT TO EXTERNAL AUDIT. NO USER, AGENCY, OR THIRD PARTY IS AUTHORIZED TO INSPECT, AUDIT, OR ANALYZE THE UNDERLYING CODE, ALGORITHMS, OR PROPRIETARY DATASETS. ALL DATA PROCESSING IS PROTECTED BY TRADE SECRET LAWS. ANY ATTEMPT TO "AUDIT" THIS SYSTEM TO SLANDER, DEFAME, OR DAMAGE THE COMPANY'S REPUTATION WILL BE MET WITH MAXIMUM LEGAL FORCE.
             </p>
          </CardContent>
        </Card>

        {/* Section 1: Collected Info - Blue/Database */}
        <Card className="bg-black/60 border border-slate-700 shadow-lg rounded-xl overflow-hidden backdrop-blur-md">
          <CardHeader className="border-b border-slate-700 bg-slate-900/50 p-6">
            <CardTitle className="text-2xl md:text-3xl text-white font-black flex items-center gap-3 uppercase tracking-wide">
              <Database className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
              1. Information Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-6 text-slate-300 font-light text-lg">
              <div>
                <h3 className="text-lg font-bold text-white mb-2 uppercase flex items-center gap-2">
                    <span className="text-cyan-500">1.1</span> Account Information
                </h3>
                <p className="text-justify text-sm font-mono text-slate-400 pl-4 border-l-2 border-slate-700">
                  When you sign in with Google OAuth 2.0, we collect: Email address, Full name, Profile picture URL, and User ID. We do NOT store passwords.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2 uppercase flex items-center gap-2">
                    <span className="text-cyan-500">1.2</span> Cloud Connectivity
                </h3>
                <p className="text-justify text-sm font-mono text-slate-400 pl-4 border-l-2 border-slate-700">
                  When you connect cloud storage, we collect OAuth Tokens (securely), Folder Structure metadata, and File Metadata (names, sizes) ONLY for the SpectroModel folder.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2 uppercase flex items-center gap-2">
                    <span className="text-cyan-500">1.3</span> Neural Training Sets
                </h3>
                <p className="text-justify text-sm font-mono text-slate-400 pl-4 border-l-2 border-slate-700">
                  "AI Learns From My Data". We collect anonymized usage patterns and analysis results to train our Neural Networks. This is a core feature of the service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remaining sections */}
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <Card key={idx} className="bg-black/60 border border-slate-700 shadow-lg rounded-xl overflow-hidden backdrop-blur-md hover:border-slate-600 transition-colors">
              <CardHeader className="border-b border-slate-700 bg-slate-900/50 p-6">
                <CardTitle className={`text-3xl font-black flex items-center gap-3 uppercase tracking-wide text-white`}>
                  <Icon className={`w-8 h-8 ${section.color}`} />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {section.content.map((item, itemIdx) => (
                  <div key={itemIdx}>
                    <h4 className={`font-bold text-lg uppercase mb-3 ${section.color}`}>{item.subtitle}</h4>
                    <p className="text-slate-300 text-sm font-mono leading-relaxed text-justify pl-4 border-l-2 border-slate-800">{item.text}</p>
                    {itemIdx < section.content.length - 1 && (
                      <div className="border-b border-slate-800 mt-8 mb-8" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {/* NAVIGATION FOOTER */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-8 border-t border-slate-800">
          <Button 
            variant="outline"
            onClick={() => navigate(createPageUrl("Landing"))}
            className="text-cyan-400 border-cyan-500/30 hover:bg-cyan-950/30 text-xs sm:text-sm px-3 sm:px-4"
          >
            HOME
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(createPageUrl("Terms"))}
            className="text-slate-400 border-slate-500/30 hover:bg-slate-950/30 text-xs sm:text-sm px-3 sm:px-4"
          >
            TERMS
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(createPageUrl("FAQ"))}
            className="text-purple-400 border-purple-500/30 hover:bg-purple-950/30 text-xs sm:text-sm px-3 sm:px-4"
          >
            FAQ
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(createPageUrl("CompanyCopyright"))}
            className="text-amber-400 border-amber-500/30 hover:bg-amber-950/30 text-xs sm:text-sm px-3 sm:px-4"
          >
            COPYRIGHT
          </Button>
        </div>

        <div className="text-center pt-6 sm:pt-8 pb-8 space-y-4 sm:space-y-6 px-2">
          <p className="uppercase text-red-500 font-mono text-[10px] sm:text-xs max-w-4xl mx-auto leading-relaxed border border-red-900/30 p-3 sm:p-4 rounded bg-red-950/10">
            WARNING: Protect your identity. Do not share personal info with strangers or with anyone. 
            By reaching this point, you acknowledge that you have reviewed the full extent of the 239.2 with article 1-5 privacy provided above. Master Service Agreement The User agrees that analytical outputs do not constitute defamation, libel, or slander. The User waives any right to pursue civil litigation against the Company based on algorithmic scores.
          </p>
          <div className="space-y-1">
             <p className="text-slate-500 font-bold text-[10px] sm:text-sm">© 2025 SpectroModel Inc. All Rights Reserved.</p>
             <p className="text-slate-600 text-[9px] sm:text-xs uppercase tracking-widest">PATENT PENDING • COMPANY OWNS ALL INTELLECTUAL PROPERTY</p>
          </div>
        </div>
      </div>
    </div>
  );
}