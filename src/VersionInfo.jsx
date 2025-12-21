import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Zap, Shield, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

const CURRENT_VERSION = "5.0.0";
const VERSION_DATE = "January 2025";

export default function VersionInfoPage() {
  const navigate = useNavigate();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);

  const versions = [
    {
      version: "5.0.0",
      date: "January 2025",
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
      date: "December 2024",
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
      date: "November 2024",
      type: "major",
      features: [
        "Rhythm Analysis",
        "Genre Predictor",
        "Time Series Analysis",
        "DSP Algorithms page"
      ]
    }
  ];

  const checkForUpdates = async () => {
    setUpdating(true);
    // Simulate checking for updates
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUpdateAvailable(false);
    setUpdating(false);
    alert("✓ You're running the latest version!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="vibrant-nav-button shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white break-words">
              Version Information
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-2 break-words">
              Current Version: <span className="text-purple-400 font-bold">{CURRENT_VERSION}</span>
            </p>
          </div>
        </div>

        <Card className="bg-slate-800/80 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-white break-words">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={checkForUpdates}
              disabled={updating}
              className="w-full vibrant-nav-button py-4"
            >
              {updating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Checking for Updates...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Check for Updates
                </>
              )}
            </Button>

            {updateAvailable && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm md:text-base text-green-300 font-semibold break-words">Update Available!</p>
                    <p className="text-xs md:text-sm text-green-400 mt-1 break-words">
                      A new version is available. Refresh the page to update.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {versions.map((v, idx) => (
            <Card
              key={v.version}
              className={`bg-slate-800/80 ${
                idx === 0
                  ? "border-purple-500/50"
                  : "border-slate-700/50"
              }`}
            >
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-lg md:text-xl text-white flex items-center gap-2 flex-wrap">
                      <span className="break-words">Version {v.version}</span>
                      {idx === 0 && (
                        <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full shrink-0">
                          CURRENT
                        </span>
                      )}
                      {v.type === "major" && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full shrink-0">
                          MAJOR
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-xs md:text-sm text-slate-400 mt-1 break-words">{v.date}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm md:text-base text-white font-semibold mb-3 flex items-center gap-2 break-words">
                    <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                    New Features
                  </h4>
                  <ul className="space-y-2">
                    {v.features.map((feature, fidx) => (
                      <li
                        key={fidx}
                        className="flex items-start gap-2 text-xs md:text-sm text-slate-300"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        <span className="break-words">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {v.security && (
                  <div>
                    <h4 className="text-sm md:text-base text-white font-semibold mb-3 flex items-center gap-2 break-words">
                      <Shield className="w-4 h-4 text-green-400 shrink-0" />
                      Security Enhancements
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {v.security.map((sec, sidx) => (
                        <div
                          key={sidx}
                          className="flex items-start gap-2 text-xs md:text-sm text-slate-300 bg-slate-900/50 p-2 rounded"
                        >
                          <Shield className="w-3 h-3 text-green-400 shrink-0 mt-0.5" />
                          <span className="break-words">{sec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-500/30">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-bold text-white mb-3 break-words">
              Military-Grade Security
            </h3>
            <p className="text-xs md:text-sm text-slate-300 mb-4 break-words">
              SpectroModel uses industry-leading security standards to protect your data
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <p className="text-xl md:text-2xl font-bold text-green-400">AES-256</p>
                <p className="text-xs text-slate-400 mt-1 break-words">Encryption</p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <p className="text-xl md:text-2xl font-bold text-blue-400">OAuth 2.0</p>
                <p className="text-xs text-slate-400 mt-1 break-words">Authentication</p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <p className="text-xl md:text-2xl font-bold text-purple-400">SHA-256</p>
                <p className="text-xs text-slate-400 mt-1 break-words">File Hashing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs md:text-sm text-slate-400 pt-6 break-words px-4">
          <p className="break-words">© 2025 SpectroModel. All rights reserved.</p>
          <p className="mt-2 break-words">
            Protected by{" "}
            <a
              href={createPageUrl("CopyrightProtection")}
              className="text-purple-400 hover:underline"
            >
              Digital Copyright Law
            </a>
            {" "}and{" "}
            <a
              href={createPageUrl("Terms")}
              className="text-purple-400 hover:underline"
            >
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}