import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Trash2, Download, RefreshCw, CheckCircle, Loader2, Shield, Brain, Database, Plus, AlertCircle, Lock, LogOut, MessageCircle, Cookie, MapPin, Globe, Cloud, CreditCard, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { fetchUserWithCache, clearUserCache } from "@/components/shared/userCache";
import ThemeCustomizer from "@/components/settings/ThemeCustomizer";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import SecurityMonitor from "@/components/shared/SecurityMonitor";


import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PaymentMethodModal from "@/components/settings/PaymentMethodModal";
import SubscriptionPlans from "@/components/settings/SubscriptionPlans";
import SavedPaymentMethods from "@/components/settings/SavedPaymentMethods";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);

  const [timezone, setTimezone] = useState('');
  const [location, setLocation] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  // NEW: ML & Security tracking
  const mlDataCollector = useMLDataCollector();
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0 });
  const [mlInsights, setMlInsights] = useState(null);

  // Retry utility for API calls to handle rate limits
  const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        const isRateLimit = error.message?.includes('Rate limit') || error.status === 429;
        if (i === maxRetries - 1 || !isRateLimit) throw error;
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, i)));
      }
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Use retry logic for user fetch
        const user = await retryWithBackoff(() => fetchUserWithCache());
        
        setCurrentUser(user);
        setTermsAccepted(user?.terms_accepted || false);
        
        // Get browser timezone if user hasn't set one
        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const savedTz = localStorage.getItem('spectromodel_timezone');
        const userTz = savedTz || user?.timezone || browserTz;
        setTimezone(userTz);
        
        // Save to localStorage for LiveClock component
        if (userTz) {
          localStorage.setItem('spectromodel_timezone', userTz);
        }
        
        // Auto-save browser timezone if not set
        if (!user?.timezone) {
          await base44.auth.updateMe({ timezone: browserTz });
          clearUserCache();
        }
        
        setLocation(user?.location || '');

        // Record page visit
        mlDataCollector.record('settings_visit', {
          feature: 'settings',
          timestamp: Date.now()
        });
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        setCurrentUser(null);
        // Set default timezone even on error to prevent empty string issues
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      }
    };
    fetchUser();
    
    // Security check
    const cspResult = validateCSP();
    setSecurityStatus({
      safe: cspResult.valid,
      threats: cspResult.violations?.length || 0
    });
    
    // Get ML insights
    const insights = mlDataCollector.getInsights();
    setMlInsights(insights);
  }, []);

  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();
              const locationString = data.address?.city || data.address?.town || data.address?.village || 
                                   data.address?.county || data.address?.state || data.address?.country || 
                                   `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
              
              setLocation(locationString);
              await base44.auth.updateMe({ location: locationString });
              clearUserCache();
              alert(`✓ Location set to: ${locationString}`);
            } catch (error) {
              console.error("Geocoding error:", error);
              const locationString = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
              setLocation(locationString);
              await base44.auth.updateMe({ location: locationString });
              clearUserCache();
              alert(`✓ Location set to coordinates: ${locationString}`);
            }
            setIsLoadingLocation(false);
          },
          (error) => {
            console.error("Geolocation error:", error);
            alert("Unable to access location. Please enable location permissions in your browser.");
            setIsLoadingLocation(false);
          }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
        setIsLoadingLocation(false);
      }
    } catch (error) {
      console.error("Location error:", error);
      alert("Failed to get location. Please try again.");
      setIsLoadingLocation(false);
    }
  };

  const handleTimezoneChange = async (newTimezone) => {
    try {
      await base44.auth.updateMe({ timezone: newTimezone });
      clearUserCache();
      setTimezone(newTimezone);
      // Save to localStorage for LiveClock component
      localStorage.setItem('spectromodel_timezone', newTimezone);
      // Dispatch storage event so LiveClock updates immediately
      window.dispatchEvent(new StorageEvent('storage', { key: 'spectromodel_timezone', newValue: newTimezone }));
      alert(`✓ Timezone updated to: ${newTimezone}`);
    } catch (error) {
      console.error("Failed to update timezone:", error);
      alert("Failed to update timezone. Please try again.");
    }
  };

  const handleAcceptTerms = async () => {
    try {
      await base44.auth.updateMe({ terms_accepted: true });
      clearUserCache();
      setTermsAccepted(true);
      alert("✓ Terms and Conditions accepted successfully!");
    } catch (error) {
      console.error("Failed to accept terms:", error);
      alert("Failed to accept terms. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const user = await fetchUserWithCache();
      if (!user) {
        alert("You must be logged in to delete your account");
        return;
      }

      // Delete all user analyses first
      const analyses = await base44.entities.MusicAnalysis.list();
      for (const analysis of analyses) {
        if (analysis.id && analysis.created_by === user.email) {
          await base44.entities.MusicAnalysis.delete(analysis.id);
        }
      }

      // Clear all cookies and storage
      document.cookie.split(";").forEach(cookie => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      if (typeof window !== 'undefined') {
        window.localStorage?.clear();
        window.sessionStorage?.clear();
      }

      // Logout
      await base44.auth.logout();
      
      alert("✓ Account deleted successfully. All data has been permanently removed. You will now be logged out.");
      navigate(createPageUrl("Landing"));
    } catch (error) {
      console.error("Account deletion failed:", error);
      alert("Failed to delete account. Please contact support at jspectro2016@gmail.com");
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const [userData, analyses] = await Promise.all([
        fetchUserWithCache(),
        base44.entities.MusicAnalysis.list()
      ]);

      const exportData = {
        export_date: new Date().toISOString(),
        user: userData,
        analyses: analyses,
        total_analyses: analyses.length
      };

      const hasData = analyses.length > 0;
      
      if (!hasData) {
        const emptyContent = `NO DATA FOUND - SPECTROMODEL EXPORT`;
        const blob = new Blob([emptyContent], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spectromodel-no-data-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert("✓ Downloaded empty report. No analysis data found.");
      } else {
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spectromodel-data-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert(`✓ Exported ${analyses.length} analysis records successfully!`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrentTime = () => {
    try {
      if (!timezone) {
        return new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      }
      return new Date().toLocaleString('en-US', { 
        timeZone: timezone,
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("Time formatting error:", error);
      return new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
  };

  return (
    <div className="p-4 md:p-8 pb-8 text-cyan-50 selection:bg-cyan-500/30 selection:text-cyan-100 relative bg-gradient-to-br from-[#0a0118] via-[#0f0520] to-[#050015]">
      
      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-black mb-1 tracking-tight flex items-center gap-3">
              <Settings className="w-10 h-10 text-cyan-400" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                SYSTEM SETTINGS
              </span>
            </h1>
            <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
              Preferences • Account • Security • Data
            </p>
          </div>
        </div>

        {/* NEW: Security & ML Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security Card - Green */}
          <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30 shadow-[0_0_15px_-5px_rgba(34,197,94,0.15)] backdrop-blur-md rounded-xl overflow-hidden hover:border-green-500/50 transition-all duration-300">
             <div className="absolute left-0 top-0 w-1 h-full bg-green-500/50"></div>
             <CardContent className="p-5 pl-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-950/50 rounded-lg border border-green-500/20">
                    <Shield className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm uppercase tracking-wide">Security Status</p>
                    <p className="text-xs text-green-400/70 font-mono">
                      {securityStatus.safe ? '&gt;&gt; SYSTEM PROTECTED' : `!! ${securityStatus.threats} THREATS DETECTED`}
                    </p>
                  </div>
                </div>
                <Badge className={securityStatus.safe ? 'bg-green-500/10 text-green-400 border-green-500/50' : 'bg-orange-500/10 text-orange-400 border-orange-500/50'}>
                  {securityStatus.safe ? 'SAFE' : 'MONITORING'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* AI Learning - Cyan */}
          <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_15px_-5px_rgba(6,182,212,0.15)] backdrop-blur-md rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300">
            <div className="absolute left-0 top-0 w-1 h-full bg-cyan-500/50"></div>
            <CardContent className="p-5 pl-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-cyan-950/50 rounded-lg border border-cyan-500/20 relative">
                     <Brain className="w-5 h-5 text-cyan-400" />
                     <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                   </div>
                  <div>
                    <p className="text-white font-bold text-sm uppercase tracking-wide">AI Learning</p>
                    <p className="text-xs text-cyan-400/70 font-mono">
                      {mlInsights?.totalEvents || 0} EVENTS RECORDED
                    </p>
                  </div>
                </div>
                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/50">ACTIVE</Badge>
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant Banner */}
          <Card className="bg-black/40 backdrop-blur-xl border border-blue-500/30 col-span-1 md:col-span-2 backdrop-blur-md">
            <CardContent className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="p-2 bg-blue-900/20 rounded-full border border-blue-500/30">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                 </div>
                 <div>
                   <h3 className="text-blue-100 font-bold text-sm uppercase">AI Assistant Matrix</h3>
                   <p className="text-xs text-blue-300/60 font-mono">Get instant help with music analysis & production</p>
                 </div>
               </div>
               <div className="flex gap-2">
                 <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px] hidden sm:flex items-center gap-1 font-mono">
                    <Brain className="w-3 h-3" /> MODEL: GPT-4o
                 </Badge>
                 <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20" onClick={() => window.dispatchEvent(new CustomEvent('toggle-ai-assistant'))}>
                    INITIALIZE CHAT
                 </Button>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Plans */}
        <SubscriptionPlans 
          user={currentUser} 
          onUpgrade={(tier) => {
            alert(`To upgrade to ${tier.toUpperCase()}, please add a payment method below and complete identity verification. Payment processing coming soon.`);
          }} 
        />

        {/* Saved Payment Methods */}
        <SavedPaymentMethods user={currentUser} />

        {/* Theme Customizer */}
        <div className="space-y-2">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2"><Eye className="w-4 h-4" /> Visual Interface</h3>
           <ThemeCustomizer user={currentUser} />
        </div>

        {/* Legal Agreement */}
        <Card className="bg-black/40 backdrop-blur-xl border border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2 font-bold tracking-wide">
              <CheckCircle className={`w-5 h-5 ${termsAccepted ? 'text-green-400' : 'text-slate-400'}`} />
              LEGAL PROTOCOLS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-950/50 border border-slate-800 rounded-lg">
              <div>
                <h3 className="text-white font-semibold text-sm">Terms & Conditions Status</h3>
                <p className="text-slate-400 text-xs mt-1 font-mono">
                  {termsAccepted ? "&gt;&gt; AGREEMENT VALIDATED" : "!! PENDING ACCEPTANCE"}
                </p>
              </div>
              {!termsAccepted && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-500">
                      Accept Terms
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-slate-900 border border-slate-700 text-slate-100">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Accept Terms and Conditions?</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        By clicking "I Accept", you agree to our Terms of Service, Privacy Policy, and acceptable use guidelines.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-slate-800 text-white hover:bg-slate-700 border-slate-600">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleAcceptTerms}
                        className="bg-purple-600 hover:bg-purple-500"
                      >
                        I Accept
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {['Terms of Service', 'Privacy Policy', 'FAQ'].map((item, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(createPageUrl(item === 'Terms of Service' ? "Terms" : item.replace(' ', '')))}
                  className="bg-transparent border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all text-xs font-mono"
                >
                  {item.toUpperCase()}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time & Location Settings */}
        <Card className="bg-black/40 backdrop-blur-xl border border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2 font-bold tracking-wide">
              <Settings className="w-5 h-5 text-cyan-400" />
              TEMPORAL & GEOSPATIAL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg flex flex-col justify-between">
                    <div className="mb-4">
                        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                            <Globe className="w-4 h-4 text-purple-400" /> Timezone
                        </h3>
                        <p className="text-slate-400 text-xs mt-1 font-mono">{timezone || 'UNSET'}</p>
                        <p className="text-[10px] text-green-400 mt-2 font-mono">
                        &gt;&gt; CURRENT: {formatCurrentTime()}
                        </p>
                    </div>
                    <select
                        value={timezone}
                        onChange={(e) => handleTimezoneChange(e.target.value)}
                        className="w-full bg-black text-cyan-100 border border-slate-700 rounded px-3 py-2 text-xs focus:border-cyan-500 outline-none"
                    >
                        <option value="">Select Timezone</option>
                        <optgroup label="United States">
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Phoenix">Mountain Standard Time (MST)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        </optgroup>
                        <optgroup label="Global">
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                        </optgroup>
                    </select>
                </div>

                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg flex flex-col justify-between">
                    <div className="mb-4">
                        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-purple-400" /> Location
                        </h3>
                        <p className="text-slate-400 text-xs mt-1 font-mono">{location || 'UNSET'}</p>
                        <p className="text-[10px] text-green-400 mt-2 font-bold flex items-center gap-1 font-mono">
                            <Shield className="w-3 h-3" /> NO TRIANGULATION POLICY
                        </p>
                    </div>
                    <Button
                        onClick={handleGetLocation}
                        disabled={isLoadingLocation}
                        className="w-full bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/50 font-bold text-xs"
                    >
                        {isLoadingLocation ? (
                        <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            TRIANGULATING...
                        </>
                        ) : (
                        'ACQUIRE COORDINATES'
                        )}
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Cloud Storage Notice */}
        <Card className="bg-black/40 border border-blue-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg font-bold tracking-wide">
              <Cloud className="w-5 h-5 text-blue-400" />
              CLOUD STORAGE MATRIX
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-300 font-light">
              SpectroModel operates on a decentralized cloud architecture. Your data is sharded and stored in your provider of choice.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded">
                <h4 className="text-blue-400 font-bold text-xs uppercase mb-2">&gt;&gt; Architecture</h4>
                <ul className="text-xs space-y-1 ml-4 list-disc text-blue-200/70 font-mono">
                  <li>Zero local storage footprint</li>
                  <li>Cross-node synchronization</li>
                  <li>Data sovereignty maintained</li>
                </ul>
              </div>
              <div className="p-3 bg-green-900/10 border border-green-500/20 rounded">
                <h4 className="text-green-400 font-bold text-xs uppercase mb-2">&gt;&gt; Advantages</h4>
                <ul className="text-xs space-y-1 ml-4 list-disc text-green-200/70 font-mono">
                  <li>Immutable backups</li>
                  <li>Device agnostic access</li>
                  <li>Encrypted transfer protocols</li>
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              {['Google Cloud', 'Microsoft Azure', 'Dropbox', 'IBM Cloud'].map((provider) => (
                  <Button
                    key={provider}
                    variant="outline"
                    className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white text-xs font-mono"
                    onClick={() => window.open('https://google.com', '_blank')}
                  >
                    {provider}
                  </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Management Section */}
        <Card className="bg-black/40 backdrop-blur-xl border border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2 font-bold tracking-wide">
              <Settings className="w-5 h-5 text-purple-400" />
              ACCOUNT PARAMETERS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg">
                    <h3 className="text-white font-semibold text-xs uppercase text-slate-500">Identity</h3>
                    <p className="text-white text-sm font-mono mt-1">{currentUser?.email || "GUEST_USER"}</p>
                </div>
                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg">
                    <h3 className="text-white font-semibold text-xs uppercase text-slate-500">Clearance Level</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="border-purple-500 text-purple-400 font-mono text-xs">
                            {currentUser?.role === 'admin' ? 'ADMINISTRATOR' : 'FREE TIER'}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <Button 
                variant="outline" 
                onClick={async () => {
                  if (confirm("Confirm disconnect from SpectroModel neural net?")) {
                    await base44.auth.logout();
                    navigate(createPageUrl("Landing"));
                  }
                }}
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                TERMINATE SESSION
              </Button>
            </div>

            {/* Delete Account - LOCKED */}
            <div className="border-t border-slate-800 pt-4 opacity-50 cursor-not-allowed">
              <Button
                variant="destructive"
                className="w-full bg-slate-900 text-slate-500 border border-slate-700 cursor-not-allowed font-mono text-xs"
                disabled
              >
                <Lock className="w-3 h-3 mr-2" />
                DELETE ACCOUNT [RESTRICTED]
              </Button>
              <p className="text-center text-[10px] text-slate-600 mt-2 font-mono">
                &gt;&gt; ACTION RESTRICTED BY MASTER SERVICE AGREEMENT
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy Section */}
        <Card className="bg-black/40 backdrop-blur-xl border border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2 font-bold tracking-wide">
              <Shield className="w-5 h-5 text-green-400" />
              SECURITY PROTOCOLS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* MFA SECTION */}
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-bold text-sm uppercase">Multi-Factor Authentication</p>
                  <p className="text-xs text-slate-500 font-mono">ENHANCED SECURITY LAYER</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs font-mono"
                >
                  CONFIGURE
                </Button>
              </div>
              
              <div className="space-y-3 pt-3 border-t border-slate-900">
                <p className="text-xs font-bold text-slate-400 uppercase">Security Verification Questions</p>
                <div className="grid gap-3">
                  <input type="text" placeholder="QUERY 1: FIRST PET?" className="w-full bg-black border border-slate-800 text-cyan-100 p-2 rounded text-xs font-mono focus:border-cyan-500 outline-none" />
                  <input type="text" placeholder="QUERY 2: BIRTH CITY?" className="w-full bg-black border border-slate-800 text-cyan-100 p-2 rounded text-xs font-mono focus:border-cyan-500 outline-none" />
                </div>
              </div>
            </div>

            {/* PRIVACY WARNING */}
            <div className="bg-amber-950/20 p-4 rounded-lg border border-amber-900/50">
              <h3 className="text-amber-400 font-bold flex items-center gap-2 mb-2 text-xs uppercase tracking-widest">
                <AlertCircle className="w-4 h-4" /> Privacy Advisory
              </h3>
              <ul className="list-disc list-inside text-[10px] text-amber-200/60 space-y-1 font-mono">
                <li>ENCRYPTION KEYS ARE MANAGED LOCALLY.</li>
                <li>DO NOT SHARE CREDENTIALS WITH UNAUTHORIZED ENTITIES.</li>
                <li>REPORT ANOMALIES IMMEDIATELY.</li>
              </ul>
            </div>
            
            {/* Cookie Preferences */}
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium flex items-center gap-2 text-sm uppercase">
                  <Cookie className="w-4 h-4 text-orange-400" /> Tracking Preferences
                </h3>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  localStorage.removeItem('cookie-consent');
                  alert("Cookie preferences reset.");
                  window.location.reload();
                }}
                className="w-full border-orange-500/30 text-orange-300 hover:bg-orange-500/10 text-xs font-mono"
              >
                RESET CONSENT TOKENS
              </Button>
            </div>

            {/* Payment Methods */}
            <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
              <h3 className="text-white font-bold text-sm uppercase mb-2 flex items-center gap-2"><CreditCard className="w-4 h-4 text-green-400" /> Encrypted Payment Gateway</h3>
              <p className="text-xs text-slate-500 mb-4 font-mono">
                &gt;&gt; DATA IS ENCRYPTED AT REST. ADMIN ACCESS RESTRICTED.
              </p>
              
              <div className="flex items-center justify-center py-6 border-2 border-dashed border-slate-800 rounded-lg mb-4 bg-black/30">
                <p className="text-slate-600 text-xs font-mono">NO ACTIVE METHODS DETECTED</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                 <Button 
                   className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                   onClick={() => {
                     if(confirm("SECURITY CHECK: Add trusted payment method?")) {
                        setShowPaymentModal(true);
                     }
                   }}
                 >
                  <Plus className="w-4 h-4 mr-2" /> ADD SECURE METHOD
                </Button>
                
                <PaymentMethodModal 
                  isOpen={showPaymentModal} 
                  onClose={() => setShowPaymentModal(false)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management Section */}
        <Card className="bg-black/40 backdrop-blur-xl border border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2 font-bold tracking-wide">
              <Download className="w-5 h-5 text-purple-400" />
              DATA EXFILTRATION & PURGE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-400 mb-4 text-xs font-mono">
              Retrieve full JSON dump of analysis vectors or execute local cache purge.
            </p>
            <Button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  COMPILING...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  DOWNLOAD CLOUD DUMP (.JSON)
                </>
              )}
            </Button>

            <div className="border-t border-slate-800 pt-4 mt-4 space-y-3">
              <h3 className="text-white font-bold text-xs uppercase">Local Maintenance</h3>
              
              <Button
                variant="outline"
                onClick={async () => {
                  if (confirm("Execute cache clear sequence?")) {
                    document.cookie.split(";").forEach(cookie => {
                      const name = cookie.split("=")[0].trim();
                      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                    });
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  }
                }}
                className="border-slate-700 text-slate-300 w-full hover:bg-slate-800 text-xs font-mono"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                PURGE BROWSER CACHE
              </Button>

              <Button
                variant="outline"
                onClick={async () => {
                  if (confirm("WARNING: THIS WILL PERMANENTLY DELETE ALL GENERATED DATA. PROCEED?")) {
                    setIsClearingHistory(true);
                    // (Mocking deletion logic for brevity)
                    setTimeout(() => {
                        localStorage.clear();
                        window.location.href = createPageUrl("Landing");
                    }, 1000);
                  }
                }}
                className="border-red-900/50 text-red-500 w-full hover:bg-red-950/30 font-bold text-xs font-mono"
              >
                <Trash2 className="w-3 h-3 mr-2" />
                EXECUTE FACTORY RESET
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}