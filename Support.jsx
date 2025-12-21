import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, Mail, MessageCircle, HelpCircle, Brain, BookOpen, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";

export default function SupportPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: "",
    message: ""
  });
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(false);

    try {
      const user = await base44.auth.me();
      
      await base44.integrations.Core.SendEmail({
        from_name: "SpectroModel Support",
        to: user.email,
        subject: `Support Request: ${formData.subject}`,
        body: `Thank you for contacting SpectroModel Support!\n\nWe received your message:\n\n${formData.message}\n\nOur team will respond within 24-48 hours.\n\nPowered by Google Gemini, Veo 2.0 & Google Flow.\n\nBest regards,\nSpectroModel Team`
      });

      setSuccess(true);
      setFormData({ subject: "", message: "" });
    } catch (err) {
      console.error("Failed to send support message:", err);
      setError("Failed to send message. Please try again or email us directly at jspectro2016@gmail.com");
    } finally {
      setIsSending(false);
    }
  };

  return (
    // CYBERPUNK BASE
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0 p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* Decorative Grid Overlay */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <NetworkErrorBanner />
        <AILearningBanner />

        {/* HEADER */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-8 mt-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black mb-1 tracking-tight flex items-center gap-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse">
                SUPPORT MATRIX
              </span>
            </h1>
            <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
              Direct Communication • Ticket Systems • Documentation
            </p>
          </div>
        </div>

        {/* QUICK LINKS GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Email Card - Purple */}
          <Card className="bg-black/60 border border-purple-500/30 shadow-[0_0_15px_-5px_rgba(168,85,247,0.15)] backdrop-blur-md rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 group">
             <div className="absolute left-0 top-0 w-1 h-full bg-purple-500/50 group-hover:w-1.5 transition-all"></div>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-purple-900/30 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                 <Mail className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-bold text-white mb-1 uppercase tracking-wide">Direct Uplink</h3>
              <p className="text-slate-400 text-xs font-mono mb-2">jspectro2016@gmail.com</p>
              <p className="text-purple-400/60 text-[10px] font-mono uppercase tracking-widest">Latency: 24-48 Hours</p>
            </CardContent>
          </Card>

          {/* Help Center Card - Cyan */}
          <Card className="bg-black/60 border border-cyan-500/30 shadow-[0_0_15px_-5px_rgba(6,182,212,0.15)] backdrop-blur-md rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 group cursor-pointer" onClick={() => navigate(createPageUrl("FAQ"))}>
             <div className="absolute left-0 top-0 w-1 h-full bg-cyan-500/50 group-hover:w-1.5 transition-all"></div>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-cyan-900/30 rounded-full flex items-center justify-center mb-4 border border-cyan-500/30 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                 <MessageCircle className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-bold text-white mb-1 uppercase tracking-wide">FAQ Database</h3>
              <p className="text-slate-400 text-xs mb-3">Common Solutions & Guides</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-cyan-400 hover:text-white hover:bg-cyan-500/20 text-xs font-mono"
              >
                ACCESS DATABASE
              </Button>
            </CardContent>
          </Card>

          {/* Docs Card - Green */}
          <Card className="bg-black/60 border border-green-500/30 shadow-[0_0_15px_-5px_rgba(34,197,94,0.15)] backdrop-blur-md rounded-xl overflow-hidden hover:border-green-500/50 transition-all duration-300 group">
             <div className="absolute left-0 top-0 w-1 h-full bg-green-500/50 group-hover:w-1.5 transition-all"></div>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-green-900/30 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
                 <BookOpen className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-bold text-white mb-1 uppercase tracking-wide">Knowledge Base</h3>
              <p className="text-slate-400 text-xs mb-2">Technical Documentation</p>
              <p className="text-green-500/60 text-[10px] font-mono uppercase tracking-widest animate-pulse">STATUS: COMPILING...</p>
            </CardContent>
          </Card>
        </div>

        {/* PRIVACY NOTICE */}
        <Card className="bg-red-950/20 border border-red-500/30 shadow-lg backdrop-blur-md rounded-xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs text-red-200/80">
                <p className="font-bold text-red-300 mb-1 uppercase">Privacy Policy Notice</p>
                <p>Users may not inquire about any other user's data, payment information, account history, or personal details through this support channel or any other means. All such requests shall be rejected without exception. Suspicious behavior shall be flagged, monitored externally, and permanently recorded on file. Fraudulent or potentially fraudulent activity shall be treated equivalently and may result in immediate account termination.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MAIN CONTACT FORM */}
        <Card className="bg-black/40 border border-slate-700 shadow-2xl backdrop-blur-xl rounded-xl overflow-hidden">
          <CardHeader className="border-b border-slate-800 bg-slate-900/50 p-6">
            <CardTitle className="text-white flex items-center gap-3 text-xl font-black uppercase tracking-wide">
              <Send className="w-6 h-6 text-purple-500" />
              Secure Message Transmission
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            {success && (
              <Alert className="bg-green-950/30 border-green-500/50 mb-6 backdrop-blur-sm">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200 font-mono text-xs">
                  &gt;&gt; TRANSMISSION SUCCESSFUL. TICKET LOGGED. EST RESPONSE: 24-48H.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="bg-red-950/30 border-red-500/50 mb-6 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200 font-mono text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-slate-300 text-xs uppercase font-bold tracking-wider">Subject Line</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="ERROR CODE / FEATURE REQUEST / BILLING INQUIRY"
                  className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 font-mono text-sm h-12 transition-all"
                  disabled={isSending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-slate-300 text-xs uppercase font-bold tracking-wider">Payload Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="ENTER DETAILED DESCRIPTION OF INQUIRY..."
                  rows={8}
                  className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 font-mono text-sm resize-none transition-all"
                  disabled={isSending}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl("Dashboard"))}
                  className="flex-1 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white font-mono text-xs"
                  disabled={isSending}
                >
                  ABORT
                </Button>
                <Button
                  type="submit"
                  className="flex-[2] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold tracking-wide shadow-lg shadow-purple-900/20"
                  disabled={isSending}
                >
                  {isSending ? (
                    <span className="animate-pulse font-mono">ENCRYPTING & SENDING...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      TRANSMIT PACKET
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* FOOTER */}
        <div className="text-center space-y-2 pt-8 border-t border-slate-800/50">
             <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">© 2025 SpectroModel Inc. All Rights Reserved.</p>
             <p className="text-slate-600 text-[10px] font-mono">SECURE TRANSMISSION PROTOCOL VERIFIED.</p>
        </div>
      </div>
    </div>
  );
}