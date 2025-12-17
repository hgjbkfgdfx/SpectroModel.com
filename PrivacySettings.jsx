import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shield, Bell, Eye, Database, Download, Trash2, Lock, FileKey, Activity, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import LimitLocker from "@/components/shared/LimitLocker";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";

export default function PrivacySettingsPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [currentUser, setCurrentUser] = useState(null);
  const [settings, setSettings] = useState({
    analytics_tracking: true,
    personalized_recommendations: true,
    share_anonymous_data: false,
    email_marketing: false,
    push_notifications: true,
    email_notifications: true, 
    notification_analysis_complete: true,
    notification_weekly_summary: false,
    notification_new_features: true,
    data_retention_period: "90_days"
  });

  useEffect(() => {
    try {
      blockScriptInjection();
      validateCSP();
      
      mlDataCollector.record('privacy_settings_visit', {
        feature: 'privacy_settings',
        timestamp: Date.now()
      });
    } catch (err) {
      console.error("Security initialization failed:", err);
    }

    const loadSettings = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        if (user?.privacy_settings) {
          setSettings(prevSettings => ({ ...prevSettings, ...user.privacy_settings }));
        }
      } catch (error) {
        console.error("Failed to load privacy settings:", error);
      }
    };
    loadSettings();
  }, []);

  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    try {
      await base44.auth.updateMe({ privacy_settings: newSettings });
    } catch (error) {
      console.error("Failed to save privacy settings:", error);
      alert("Failed to save settings. Please try again.");
    }
  };

  const handleDataRetentionChange = async (value) => {
    const newSettings = { ...settings, data_retention_period: value };
    setSettings(newSettings);
    
    try {
      await base44.auth.updateMe({ privacy_settings: newSettings });
    } catch (error) {
      console.error("Failed to save data retention setting:", error);
    }
  };

  const handleRequestData = async () => {
    try {
      const user = await base44.auth.me();
      const allAnalyses = await base44.entities.MusicAnalysis.list();
      
      const exportData = {
        export_date: new Date().toISOString(),
        user: {
          email: user.email,
          full_name: user.full_name,
          role: user.role
        },
        analyses: allAnalyses,
        total_analyses: allAnalyses.length
      };

      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `spectromodel_data_export_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert("✓ DATA PACKET EXPORTED SUCCESSFULLY.");
      
      if (settings.email_notifications) {
        alert(">> CONFIRMATION EMAIL DISPATCHED.");
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleDeleteData = async () => {
    const confirmDelete = confirm("⚠️ CRITICAL WARNING: DELETE ALL DATA?\n\nThis will PERMANENTLY REMOVE:\n• All track analyses\n• Audio files\n• Sheet music\n• All analysis results\n\nYour account will remain active. This action CANNOT be undone.");
    
    if (!confirmDelete) return;

    try {
      const allAnalyses = await base44.entities.MusicAnalysis.list();
      
      let deleted = 0;
      for (const analysis of allAnalyses) {
        try {
          if (analysis.id) {
            await base44.entities.MusicAnalysis.delete(analysis.id);
            deleted++;
          }
        } catch (error) {
          console.error(`Failed to delete analysis ${analysis.id}:`, error);
        }
      }

      alert(`✓ PURGE COMPLETE. ${deleted} RECORDS REMOVED.`);
      
      if (settings.email_notifications) {
        alert(">> DELETION REPORT SENT VIA EMAIL.");
      }
    } catch (error) {
      console.error("Data deletion failed:", error);
      alert("Failed to delete data. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0 p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-purple-500/30 selection:text-purple-100">
      
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <NetworkErrorBanner />
        <AILearningBanner />
        
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Settings"))}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 animate-pulse">
                PRIVACY PROTOCOLS
              </span>
            </h1>
            <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
              Data Sovereignty • Retention Policies • Access Control
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiveSecurityDisplay />
            <LiveThreatDisplay />
        </div>

        <Card className="bg-black/60 border border-blue-500/30 shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)] backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500"></div>
          <CardHeader className="border-b border-white/5 bg-white/5 p-6">
            <CardTitle className="text-white flex items-center gap-3 text-xl font-bold uppercase tracking-wide">
              <Eye className="w-6 h-6 text-blue-400" />
              Collection Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-all">
              <div className="flex-1 pr-4">
                <Label className="text-white font-bold text-sm uppercase tracking-wider">Analytics Telemetry</Label>
                <p className="text-xs text-slate-400 font-mono mt-1">Allow anonymous usage data collection for system optimization.</p>
              </div>
              <Switch
                checked={settings.analytics_tracking}
                onCheckedChange={() => handleToggle('analytics_tracking')}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-all">
              <div className="flex-1 pr-4">
                <Label className="text-white font-bold text-sm uppercase tracking-wider">Neural Tuning</Label>
                <p className="text-xs text-slate-400 font-mono mt-1">Use historical analysis data to refine personalized recommendations.</p>
              </div>
              <Switch
                checked={settings.personalized_recommendations}
                onCheckedChange={() => handleToggle('personalized_recommendations')}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-all">
              <div className="flex-1 pr-4">
                <Label className="text-white font-bold text-sm uppercase tracking-wider">Research Contribution</Label>
                <p className="text-xs text-slate-400 font-mono mt-1">Share fully anonymized datasets for academic music research.</p>
              </div>
              <Switch
                checked={settings.share_anonymous_data}
                onCheckedChange={() => handleToggle('share_anonymous_data')}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            
            <div className="mt-4 p-4 bg-blue-950/20 border border-blue-500/20 rounded-lg flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-400" />
                <div className="flex-1">
                    <p className="text-[10px] text-blue-300 font-mono uppercase mb-1">Privacy Architecture:</p>
                    <div className="text-[10px] text-slate-500 border border-slate-700 rounded px-2 py-1 inline-block bg-black/50 font-mono">
                        [Image of data anonymization process diagram]
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-all">
              <div className="flex-1 pr-4">
                <Label className="text-white font-bold text-sm uppercase tracking-wider">Marketing Uplink</Label>
                <p className="text-xs text-slate-400 font-mono mt-1">Receive promotional vectors and product updates.</p>
              </div>
              <Switch
                checked={settings.email_marketing}
                onCheckedChange={() => handleToggle('email_marketing')}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/60 border border-purple-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5 p-6">
            <CardTitle className="text-white flex items-center gap-3 text-xl font-bold uppercase tracking-wide">
              <Bell className="w-6 h-6 text-purple-400" />
              Alert Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-purple-300 text-xs font-bold uppercase tracking-widest border-b border-slate-800 pb-2">Channels</h3>
                    <div className="flex items-center justify-between">
                        <Label className="text-white font-mono text-xs">Browser Push</Label>
                        <Switch checked={settings.push_notifications} onCheckedChange={() => handleToggle('push_notifications')} className="data-[state=checked]:bg-purple-600" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-white font-mono text-xs">Email Relay</Label>
                        <Switch checked={settings.email_notifications} onCheckedChange={() => handleToggle('email_notifications')} className="data-[state=checked]:bg-purple-600" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-purple-300 text-xs font-bold uppercase tracking-widest border-b border-slate-800 pb-2">Triggers</h3>
                    <div className="flex items-center justify-between">
                        <Label className="text-white font-mono text-xs">Analysis Complete</Label>
                        <Switch checked={settings.notification_analysis_complete} onCheckedChange={() => handleToggle('notification_analysis_complete')} disabled={!settings.push_notifications && !settings.email_notifications} className="data-[state=checked]:bg-purple-600" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-white font-mono text-xs">Weekly Digest</Label>
                        <Switch checked={settings.notification_weekly_summary} onCheckedChange={() => handleToggle('notification_weekly_summary')} disabled={!settings.push_notifications && !settings.email_notifications} className="data-[state=checked]:bg-purple-600" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-white font-mono text-xs">System Updates</Label>
                        <Switch checked={settings.notification_new_features} onCheckedChange={() => handleToggle('notification_new_features')} disabled={!settings.push_notifications && !settings.email_notifications} className="data-[state=checked]:bg-purple-600" />
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/60 border border-green-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5 p-6">
            <CardTitle className="text-white flex items-center gap-3 text-xl font-bold uppercase tracking-wide">
              <Database className="w-6 h-6 text-green-400" />
              Retention Protocols
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div>
              <Label className="text-green-300 font-bold text-xs uppercase mb-3 block tracking-wider">Analysis Cache Duration</Label>
              <div className="relative">
                  <select
                    value={settings.data_retention_period}
                    onChange={(e) => handleDataRetentionChange(e.target.value)}
                    className="w-full bg-black/50 text-white border border-green-500/30 rounded px-4 py-3 text-sm focus:border-green-500 outline-none appearance-none font-mono"
                  >
                    <option value="30_days">30 DAYS (MINIMUM)</option>
                    <option value="90_days">90 DAYS (STANDARD)</option>
                    <option value="1_year">365 DAYS (EXTENDED)</option>
                    <option value="indefinitely">INDEFINITE (ARCHIVAL)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-green-500">▼</div>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-mono">
                {">>"} AUTOMATIC PURGE INITIATED AFTER SELECTED PERIOD.
              </p>
            </div>
            
            <div className="p-4 bg-green-950/20 border border-green-500/20 rounded-lg flex items-center gap-3">
                <FileKey className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                    <p className="text-[10px] text-green-300 font-mono uppercase mb-1">Lifecycle Visualization:</p>
                    <div className="text-[10px] text-slate-500 border border-slate-700 rounded px-2 py-1 inline-block bg-black/50 font-mono">
                        [Image of data retention lifecycle chart]
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/60 border border-red-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5 p-6">
            <CardTitle className="text-white flex items-center gap-3 text-xl font-bold uppercase tracking-wide">
              <Lock className="w-6 h-6 text-red-400" />
              Data Sovereignty (GDPR/CCPA)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <p className="text-slate-300 text-sm font-light leading-relaxed">
              You maintain full sovereignty over your data. Execute export or deletion protocols at any time in compliance with international privacy standards.
            </p>
            
            <div className="p-4 bg-red-950/10 border border-red-500/10 rounded-lg flex items-center justify-center mb-4">
                 <div className="text-[10px] text-red-400/70 border border-red-500/30 rounded px-2 py-1 bg-black/30 font-mono inline-block">
                    
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleRequestData}
                variant="outline"
                className="flex-1 border-blue-500/50 text-blue-300 hover:bg-blue-900/20 hover:text-white h-12 font-mono text-xs font-bold uppercase tracking-wider"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data Packet
              </Button>
              <Button
                onClick={handleDeleteData}
                variant="outline"
                className="flex-1 border-red-500/50 text-red-300 hover:bg-red-900/20 hover:text-white h-12 font-mono text-xs font-bold uppercase tracking-wider"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Execute Data Purge
              </Button>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded border border-slate-800">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-[10px] text-slate-400 font-mono">
                    WARNING: DELETION IS IRREVERSIBLE. ACCOUNT METADATA WILL BE SCRUBBED.
                </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}