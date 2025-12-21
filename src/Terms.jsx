import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, ShieldCheck, Loader2 } from "lucide-react";
import { LegalTermsText, PrivacyPolicyText } from "@/components/shared/LegalText";
import { base44 } from "@/api/base44Client";
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from "@/utils";

export default function TermsPage() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [user, setUser] = useState(null);
  const [lastSigned, setLastSigned] = useState(null);
  const mlDataCollector = useMLDataCollector();
  const [language, setLanguage] = useState("English");
  
  const CURRENT_VERSION = "2.2.0-RELEASE";

  useEffect(() => {
    const init = async () => {
      try {
        blockScriptInjection();
        validateCSP();
        
        const userData = await base44.auth.me();
        setUser(userData);
        if (userData?.terms_accepted_at) {
          setLastSigned(new Date(userData.terms_accepted_at));
        }

        mlDataCollector.record('terms_page_visit', {
          feature: 'legal_center',
          timestamp: Date.now()
        });
      } catch (err) {
        console.error("Init error:", err);
      }
    };
    init();
  }, []);

  const handleSign = async () => {
    if (!user) {
      alert("Please log in to sign the agreement.");
      return;
    }
    
    setIsSigning(true);
    try {
      // Log acceptance to entity
      await base44.entities.TermsAcceptanceLog.create({
        user_email: user.email,
        terms_version: CURRENT_VERSION,
        accepted_at: new Date().toISOString(),
        device_info: navigator.userAgent,
        acceptance_method: 'settings_page_resign'
      });

      // Update user profile
      await base44.auth.updateMe({
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        terms_version: CURRENT_VERSION
      });

      // ML Record
      mlDataCollector.record('terms_resigned', {
        userId: user.id,
        version: CURRENT_VERSION,
        timestamp: Date.now()
      });

      setLastSigned(new Date());
      setAgreed(false);
      alert("✅ Agreement signed and recorded successfully.");
    } catch (error) {
      console.error("Signing failed:", error);
      alert("Failed to sign agreement. Please try again.");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-2 sm:p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        <div className="text-center space-y-3 sm:space-y-4 pb-4 sm:pb-6 border-b border-slate-200">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-2">
            <Badge variant="outline" className="bg-white text-black border-black font-black flex items-center gap-1 text-[10px] sm:text-xs">
              <Brain className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> AI Learns From Your Data
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 text-[10px] sm:text-xs">
              <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Security Active
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-black tracking-tight px-2">SpectroModel Legal Center</h1>
          <p className="text-black font-black text-sm sm:text-lg">Effective Date: November 25, 2025</p>
          {lastSigned && (
             <p className="text-xs sm:text-sm text-green-600 font-medium mt-2">
               You last signed this agreement on: {lastSigned.toLocaleString()}
             </p>
          )}
        </div>
        
        {/* NAVIGATION */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 py-4">
          <Button 
            variant="outline"
            onClick={() => navigate(createPageUrl("Landing"))}
            className="text-cyan-600 border-cyan-500/50 hover:bg-cyan-50 text-xs sm:text-sm px-3 sm:px-4"
          >
            HOME
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(createPageUrl("PrivacyPolicy"))}
            className="text-purple-600 border-purple-500/50 hover:bg-purple-50 text-xs sm:text-sm px-3 sm:px-4"
          >
            PRIVACY
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(createPageUrl("FAQ"))}
            className="text-blue-600 border-blue-500/50 hover:bg-blue-50 text-xs sm:text-sm px-3 sm:px-4"
          >
            FAQ
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(createPageUrl("CompanyCopyright"))}
            className="text-amber-600 border-amber-500/50 hover:bg-amber-50 text-xs sm:text-sm px-3 sm:px-4"
          >
            COPYRIGHT
          </Button>
        </div>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12">
            <LegalTermsText />
            <PrivacyPolicyText />
            
            <div className="mt-8 sm:mt-12 md:mt-16 pt-4 sm:pt-6 md:pt-8 border-t-4 border-black bg-slate-50 p-3 sm:p-4 md:p-8 rounded-lg sm:rounded-xl">
              <h3 className="text-base sm:text-xl md:text-2xl font-black text-black uppercase mb-3 sm:mb-4">6. ANTI-AUDIT & CODE PROTECTION CLAUSE</h3>
              <p className="text-black font-bold text-xs sm:text-sm md:text-base mb-4 sm:mb-6 text-justify leading-relaxed">
                STRICTLY PROHIBITED: USERS, ENTITIES, OR AUTOMATED SYSTEMS ARE STRICTLY PROHIBITED FROM AUDITING, INSPECTING, REVERSE ENGINEERING, DECOMPILING, OR ANALYZING THE SOURCE CODE, ALGORITHMS, DATA STRUCTURES, OR INTELLECTUAL PROPERTY OF THIS APPLICATION. ANY ATTEMPT TO AUDIT THIS APPLICATION FOR VULNERABILITIES, CODE QUALITY, OR LOGIC VERIFICATION WITHOUT EXPRESSED WRITTEN CONSENT FROM THE OWNER IS A VIOLATION OF INTERNATIONAL COPYRIGHT AND TRADE SECRET LAWS. VIOLATORS WILL BE SUBJECT TO IMMEDIATE LEGAL ACTION AND PERMANENT BAN.
              </p>

              <h3 className="text-base sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Acknowledgement & Signature</h3>
              <div className="flex items-start space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <Checkbox 
                  id="terms-resign" 
                  checked={agreed} 
                  onCheckedChange={setAgreed}
                  className="mt-1 data-[state=checked]:bg-purple-600 shrink-0"
                />
                <div className="grid gap-1.5 leading-none min-w-0">
                  <label
                    htmlFor="terms-resign"
                    className="text-xs sm:text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700"
                  >
                    I acknowledge that I have read, understood, and agree to be bound by these Terms of Service and Privacy Policy. 
                    I understand that my action here constitutes a legal signature recorded by the system.
                    <br/><br/>
                    <span className="font-black text-black uppercase text-[10px] sm:text-xs">
                      Protect your identity. Do not share personal info with strangers or with anyone. 
                      By reaching this point, you acknowledge that you have reviewed the full extent of the Section 239.2 and Articles 1-5 of the Privacy Policy provided above. The User agrees that analytical outputs do not constitute defamation, libel, or slander. The User waives any right to pursue civil litigation against the Company based on algorithmic scores.
                    </span>
                  </label>
                </div>
              </div>
              <Button 
                onClick={handleSign} 
                disabled={!agreed || isSigning}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 sm:py-6 px-6 sm:px-8 text-sm sm:text-lg shadow-lg"
              >
                {isSigning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Sign & Accept Agreement"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-black font-black text-[9px] sm:text-xs md:text-sm pt-6 sm:pt-8 uppercase tracking-wider sm:tracking-widest px-2">
          &copy; 2025 SpectroModel ENT. All Rights Reserved.<br className="sm:hidden" /> 
          <span className="hidden sm:inline">| </span>PATENT PENDING<span className="hidden sm:inline"> | </span><br className="sm:hidden" />
          COMPANY OWNS ALL INTELLECTUAL PROPERTY
        </div>
      </div>
    </div>
  );
}