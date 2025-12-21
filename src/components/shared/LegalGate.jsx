import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { LegalTermsText, PrivacyPolicyText } from "@/components/shared/LegalText";
import { useTutorial } from "@/components/shared/TutorialSystem";

export default function LegalGate({ user, onAccept }) {
  const [isOpen, setIsOpen] = useState(false);
  const { startTutorial } = useTutorial();
  const [hasRead, setHasRead] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const mlDataCollector = useMLDataCollector();

  const CURRENT_TERMS_VERSION = "2.1.0-LTS"; // Updated for 2025 Master Service Agreement

  useEffect(() => {
    if (user) {
      // Check if user hasn't accepted or has older version - Enforce sign-off
      // Admin note: This ensures the user explicitly signs the latest version
      if (!user.terms_accepted || user.terms_version !== CURRENT_TERMS_VERSION) {
        setIsOpen(true);
        // Log presentation for admin audit trail
        mlDataCollector.record('legal_gate_presented', {
          userId: user.id,
          version: CURRENT_TERMS_VERSION,
          timestamp: Date.now(),
          device_compatibility_check: 'iPhone X-17 Range'
        });
      }
    }
  }, [user]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // More generous threshold for mobile
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      setHasRead(true);
    }
  };

  const handleAccept = async () => {
    if (!agreed) return;
    
    setSubmitting(true);
    try {
      await base44.auth.updateMe({
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        terms_version: CURRENT_TERMS_VERSION
      });
      
      // Create audit log entry
      await base44.entities.TermsAcceptanceLog.create({
        user_email: user.email,
        terms_version: CURRENT_TERMS_VERSION,
        accepted_at: new Date().toISOString(),
        device_info: navigator.userAgent,
        acceptance_method: 'legal_gate'
      });

      mlDataCollector.record('terms_accepted', {
        userId: user.id,
        version: CURRENT_TERMS_VERSION,
        timestamp: Date.now()
      });

      setIsOpen(false);
      if (onAccept) onAccept();
      
      // Trigger Welcome Tutorial immediately after signing
      setTimeout(() => {
        startTutorial('Welcome');
      }, 500);
      
      // Removed reload to allow tutorial to start smoothly
    } catch (error) {
      console.error("Failed to accept terms:", error);
      alert("Error saving your acceptance. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl h-[90vh] sm:h-[85vh] bg-white text-black border-slate-200" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-purple-600" />
            <DialogTitle className="text-2xl font-bold">Master Service Agreement (MSA) and Terms and Agreements</DialogTitle>
          </div>
          <DialogDescription className="text-slate-600 text-base space-y-2">
            <p>To ensure the highest level of security and compliance, we have updated our Terms of Service, Privacy Policy, and Security Protocols.</p>
            <div className="bg-slate-100 p-3 rounded border border-slate-200 text-xs text-left">
              <p className="font-bold text-black mb-1">Important Safety & Usage Rules:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Rated PG (10+). Educational & Creative use only.</li>
                <li>Zero tolerance for harassment, stalking, or threats.</li>
                <li>Protect your identity. Do not share personal info with strangers or with anyone.</li>
                <li>Payments are secure. You control your payment methods.</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 border rounded-md p-6 bg-white my-4 shadow-inner h-full" onScrollCapture={handleScroll}>
          <div className="space-y-8 pb-20">
             <LegalTermsText />
             <PrivacyPolicyText />
             <div className="h-20"></div>
             <div className="border-t border-slate-200 pt-8 text-center">
               <p className="text-slate-400 italic font-serif mb-2">By reaching this point, you acknowledge that you have reviewed the full extent of the 239.2 with article 1-5 privacy provided above. Master Service Agreement The User agrees that analytical outputs, including but not limited to Hit Scores, Market Fit assessments, and Rhythm Analysis graphs, do not constitute defamation, libel, or slander against the User or the artist. These outputs are automated, objective data visualizations and are not subjective critical reviews. The User waives any right to pursue civil litigation against the Company, Creator, or Employee(s) based on the perceived reputational damage caused by a low algorithmic score or an unfavorable market analysis.</p>
               <p className="text-slate-900 font-bold">-- End of Agreement --</p>
             </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-col gap-4 items-stretch">
          <div className="flex items-center space-x-2 bg-slate-100 p-4 rounded-lg border border-slate-200">
            <Checkbox 
              id="terms" 
              checked={agreed} 
              onCheckedChange={setAgreed}
              disabled={!hasRead}
              className="data-[state=checked]:bg-purple-600 border-slate-400"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-black text-black leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and agree to the comprehensive Terms of Service, Privacy Policy, and Security Protocols.
                <br/><br/>
                <span className="font-black uppercase text-red-600">
                   Protect your identity. Do not share personal info with strangers or with anyone.
                   By reaching this point, you acknowledge that you have reviewed the full extent of the 239.2 with article 1-5 privacy provided above. Master Service Agreement The User agrees that analytical outputs, including but not limited to Hit Scores, Market Fit assessments, and Rhythm Analysis graphs, do not constitute defamation, libel, or slander against the User or the artist. These outputs are automated, objective data visualizations and are not subjective critical reviews. The User waives any right to pursue civil litigation against the Company, Creator, or Employee(s) based on the perceived reputational damage caused by a low algorithmic score or an unfavorable market analysis.
                </span>
              </label>
              {!hasRead && <p className="text-xs text-red-500">Please scroll to the bottom of the text to enable this checkbox.</p>}
            </div>
          </div>
          <Button 
            onClick={handleAccept} 
            disabled={!agreed || submitting} 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-bold shadow-lg"
          >
            {submitting ? "Signing Securely..." : "I ACCEPT & SIGN"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}