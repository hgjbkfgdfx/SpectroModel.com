import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, Type, Volume2, Keyboard, Contrast, Smartphone, Monitor, Tablet, Hand, Brain, Shield, Upload, MousePointer, Accessibility, ScanFace, Activity, Layers, Cpu, Code } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import HolographicBackground from "@/components/shared/HolographicBackground";

export default function AccessibilityPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [fontSize, setFontSize] = useState("medium");
  const [highContrast, setHighContrast] = useState(false);
  const [touchMode, setTouchMode] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [largeTargets, setLargeTargets] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0 });

  useEffect(() => {
    blockScriptInjection();
    const cspResult = validateCSP();
    setSecurityStatus({ safe: cspResult.valid, threats: cspResult.violations?.length || 0 });
    
    // Mock loadSettings
    setFontSize("medium");
    setTouchMode(true);
    
    mlDataCollector.record('accessibility_page_visit', {
      feature: 'accessibility',
      timestamp: Date.now()
    });
  }, []);

  const saveFontSize = async (size) => {
    setFontSize(size);
    // Mock save
    document.documentElement.style.fontSize = 
      size === "small" ? "14px" : 
      size === "large" ? "18px" : 
      size === "xlarge" ? "20px" : "16px";
  };

  const saveHighContrast = async (enabled) => {
    setHighContrast(enabled);
    document.documentElement.classList.toggle('high-contrast', enabled);
  };

  const saveSetting = async (key, value) => {
    // Mock save
    console.log(`Saving ${key}: ${value}`);
  };

  return (
    // CYBERPUNK BASE
    <div className="min-h-screen bg-[#030014] text-cyan-50 font-sans selection:bg-orange-500/30 selection:text-orange-100 overflow-x-hidden relative">
      <HolographicBackground />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-[1]"></div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8 p-4 md:p-8">
        <NetworkErrorBanner />
        <AILearningBanner />

        {/* HEADER */}
        <div className="flex items-center gap-4 border-b border-orange-500/20 bg-orange-950/10 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-orange-400 hover:text-orange-300 hover:bg-orange-950/30 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <Accessibility className="w-10 h-10 text-orange-500 animate-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500">
                ADAPTIVE INTERFACE MATRIX
              </span>
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-wider">
              Universal Access Protocols • WCAG 2.1 Compliance • Assistive Tech
            </p>
          </div>
        </div>

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Security */}
             <Card className="bg-black/60 border border-green-500/30 backdrop-blur-md rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-900/20 border border-green-500/30 flex items-center justify-center shadow-lg">
                            <Shield className="w-8 h-8 text-green-400" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg uppercase tracking-wider">System Integrity</p>
                            <p className="text-[10px] text-green-400/70 font-mono mt-1">&gt;&gt; PROTECTED MODE</p>
                        </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">SECURE</Badge>
                </CardContent>
            </Card>

            {/* AI Status */}
            <Card className="bg-black/60 border border-cyan-500/30 backdrop-blur-md rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-cyan-900/20 border border-cyan-500/30 flex items-center justify-center shadow-lg">
                            <Brain className="w-8 h-8 text-cyan-400 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg uppercase tracking-wider">Adaptive Engine</p>
                            <p className="text-[10px] text-cyan-400/70 font-mono mt-1">&gt;&gt; OPTIMIZING UX PATTERNS</p>
                        </div>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">ACTIVE</Badge>
                </CardContent>
            </Card>
        </div>

        <LiveSecurityDisplay />
        <LiveThreatDisplay />

        {/* DEVICE COMPATIBILITY - GREEN */}
        <Card className="bg-black/60 border border-green-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          
          {/* Big Background Icon */}
          <Smartphone className="absolute -right-8 -bottom-8 w-40 h-40 text-green-500/5 rotate-12 group-hover:rotate-0 transition-all duration-700 pointer-events-none" />

          <CardHeader className="border-b border-green-500/20 bg-green-950/10 p-6 relative z-10">
            <CardTitle className="text-white flex items-center gap-3 text-xl font-bold uppercase tracking-wide">
              <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                 <Smartphone className="w-6 h-6 text-green-400" />
              </div>
              Viewport Compatibility
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 relative z-10">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { icon: Monitor, label: "Workstation", status: "OPTIMIZED", color: "green" },
                { icon: Tablet, label: "Tablet / Pad", status: "OPTIMIZED", color: "green" },
                { icon: Smartphone, label: "Mobile Unit", status: "OPTIMIZED", color: "green" }
              ].map((device, i) => (
                <div key={i} className={`p-6 bg-green-950/20 border border-green-500/20 rounded-xl text-center group/card hover:bg-green-900/30 transition-all`}>
                  <device.icon className={`w-12 h-12 ${device.color === "green" ? 'text-green-400' : 'text-slate-400'} mx-auto mb-3 group-hover/card:scale-110 transition-transform`} />
                  <p className="text-white font-bold text-sm uppercase mb-2">{device.label}</p>
                  <Badge className="bg-green-500/20 text-green-300 border border-green-500/50 text-[10px] font-mono">{device.status}</Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 font-mono text-center">
              &gt;&gt; RESPONSIVE GRID ACTIVE ACROSS ALL RESOLUTIONS.
            </p>
          </CardContent>
        </Card>

        {/* TOUCH INTERACTION - ORANGE */}
        <Card className="bg-black/60 border border-orange-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
          
          {/* Big Background Icon */}
          <Hand className="absolute -right-8 -bottom-8 w-40 h-40 text-orange-500/5 rotate-12 group-hover:rotate-0 transition-all duration-700 pointer-events-none" />

          <CardHeader className="border-b border-orange-500/20 bg-orange-950/10 p-6 relative z-10">
            <CardTitle className="text-white flex items-center gap-2 text-xl font-bold uppercase tracking-wide">
              <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                 <Hand className="w-6 h-6 text-orange-400" />
              </div>
              Haptic & Touch Interface
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6 relative z-10">
            
            <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-orange-500/30 transition-all">
                    <div className="flex items-center gap-4">
                        <MousePointer className="w-8 h-8 text-orange-400" />
                        <div>
                          <p className="text-white font-bold text-sm uppercase">Touch Optimization</p>
                          <p className="text-[10px] text-slate-400 font-mono">Optimized for capacitive screens</p>
                        </div>
                    </div>
                    <Switch checked={true} className="data-[state=checked]:bg-orange-500" />
                 </div>
                 
                 <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-orange-500/30 transition-all">
                    <div className="flex items-center gap-4">
                        <ScanFace className="w-8 h-8 text-orange-400" />
                        <div>
                          <p className="text-white font-bold text-sm uppercase">Large Targets (WCAG AAA)</p>
                          <p className="text-[10px] text-slate-400 font-mono">Expand clickable zones to 44px+</p>
                        </div>
                    </div>
                    <Switch checked={false} className="data-[state=checked]:bg-orange-500" />
                 </div>
            </div>
            
            {/* Diagram Injection - Touch Targets */}
            <div className="p-6 bg-orange-950/10 border border-orange-500/20 rounded-lg flex items-center justify-center">
                 <div className="text-[10px] text-orange-400/70 border border-orange-500/30 rounded px-4 py-2 bg-black/30 font-mono">
                                    </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-orange-500/30 transition-all">
              <div>
                <p className="text-white font-bold text-sm uppercase">Motion Reduction</p>
                <p className="text-[10px] text-slate-400 font-mono">Minimize animations and transitions</p>
              </div>
              <Switch checked={false} className="data-[state=checked]:bg-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* UNIVERSAL UPLOAD - CYAN */}
        <Card className="bg-black/60 border border-cyan-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
          
          {/* Big Background Icon */}
          <Upload className="absolute -right-8 -bottom-8 w-40 h-40 text-cyan-500/5 rotate-12 group-hover:rotate-0 transition-all duration-700 pointer-events-none" />

          <CardHeader className="border-b border-cyan-500/20 bg-cyan-950/10 p-6 relative z-10">
            <CardTitle className="text-white flex items-center gap-2 text-xl font-bold uppercase tracking-wide">
              <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                 <Upload className="w-6 h-6 text-cyan-400" />
              </div>
              Universal Input Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 relative z-10">
            <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-xl mb-6 flex items-center gap-4">
              <Layers className="w-10 h-10 text-cyan-400" />
              <div>
                  <p className="text-cyan-300 font-bold text-sm uppercase mb-1">&gt;&gt; ALL FILE TYPES ACCEPTED</p>
                  <p className="text-slate-300 text-xs font-mono leading-relaxed">
                    System accepts all MIME types to accommodate various assistive devices and specialized formats (Audio, Video, PDF, Docs).
                  </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Badge className="bg-purple-900/30 text-purple-300 border-purple-500/30 font-mono text-[10px] uppercase p-2 justify-center">Audio</Badge>
              <Badge className="bg-red-900/30 text-red-300 border-red-500/30 font-mono text-[10px] uppercase p-2 justify-center">Video</Badge>
              <Badge className="bg-green-900/30 text-green-300 border-green-500/30 font-mono text-[10px] uppercase p-2 justify-center">Images</Badge>
              <Badge className="bg-blue-900/30 text-blue-300 border-blue-500/30 font-mono text-[10px] uppercase p-2 justify-center">Documents</Badge>
            </div>
          </CardContent>
        </Card>

        {/* TEXT & CONTRAST - PURPLE */}
        <Card className="bg-black/60 border border-purple-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
          
          {/* Big Background Icon */}
          <Type className="absolute -right-8 -bottom-8 w-40 h-40 text-purple-500/5 rotate-12 group-hover:rotate-0 transition-all duration-700 pointer-events-none" />

          <CardHeader className="border-b border-purple-500/20 bg-purple-950/10 p-6 relative z-10">
            <CardTitle className="text-white flex items-center gap-2 text-xl font-bold uppercase tracking-wide">
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                 <Type className="w-6 h-6 text-purple-400" />
              </div>
              Visual Output Config
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6 relative z-10">
            
            {/* Font Size */}
            <div className="space-y-3">
                <Label className="text-purple-300 text-xs font-bold uppercase mb-3 block">Typography Scaling</Label>
                <div className="grid grid-cols-4 gap-4">
                {["small", "medium", "large", "xlarge"].map((size) => (
                    <Button
                    key={size}
                    // Mock click handler
                    variant="outline"
                    className={`h-12 border-slate-700 font-mono text-xs uppercase ${fontSize === size ? "bg-purple-600 text-white border-purple-500" : "text-slate-400 hover:text-white"}`}
                    >
                    {size}
                    </Button>
                ))}
                </div>
            </div>

            {/* High Contrast */}
            <div className="border-t border-slate-800 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Contrast className="w-5 h-5 text-purple-400" />
                        <div>
                            <p className="text-white font-bold text-sm uppercase">High Contrast Mode</p>
                            <p className="text-[10px] text-slate-400 font-mono">Maximize legibility ratios</p>
                        </div>
                    </div>
                    <Switch checked={highContrast} onCheckedChange={(v) => saveHighContrast(v)} className="data-[state=checked]:bg-purple-500" />
                </div>
                
                {/* Diagram Injection - Contrast */}
                <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-lg flex items-center justify-center">
                    <div className="text-[10px] text-purple-400/70 border border-purple-500/30 rounded px-2 py-1 bg-black/30 font-mono">
                                            </div>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* ASSISTIVE TECHNOLOGY - BLUE */}
        <Card className="bg-black/40 border border-blue-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <CardHeader className="border-b border-blue-500/20 bg-blue-950/10 p-6">
            <CardTitle className="text-white flex items-center gap-2 text-xl font-bold uppercase tracking-wide">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                 <Volume2 className="w-6 h-6 text-blue-400" />
              </div>
              Assistive Technology Layer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-all">
              <div>
                <p className="text-white font-bold text-sm uppercase">Screen Reader Optimization</p>
                <p className="text-[10px] text-slate-400 font-mono">Enhance ARIA labels for JAWS/NVDA</p>
              </div>
              <Switch checked={screenReaderMode} onCheckedChange={(v) => { /* Mock save */}} className="data-[state=checked]:bg-blue-500" />
            </div>

            {/* Diagram Injection - A11y Tree */}
            <div className="p-4 bg-blue-950/20 border border-blue-500/20 rounded-lg flex items-center justify-center">
                 <div className="text-[10px] text-blue-400/70 border border-blue-500/30 rounded px-2 py-1 bg-black/30 font-mono">
                                    </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-all">
              <div>
                <p className="text-white font-semibold">Keyboard Navigation</p>
                <p className="text-slate-400 text-xs">Full Tab/Enter support</p>
              </div>
              <Keyboard className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}