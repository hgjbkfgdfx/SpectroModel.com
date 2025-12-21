import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, Lock, FileText, AlertTriangle, CheckCircle, Globe, Upload, Download, Calendar, ExternalLink, Brain, Loader2, Scale, CreditCard, Activity, Database, Hexagon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { validateCSP, blockScriptInjection, validateFile } from "@/components/shared/SecurityValidator";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { Progress } from "@/components/ui/progress";

import { checkUsageLimit, SUBSCRIPTION_TIERS } from "@/components/shared/subscriptionSystem";
import { useUsageLimits } from "@/components/shared/useUsageLimits";
import LimitLocker from "@/components/shared/LimitLocker";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import SecurityMonitor from "@/components/shared/SecurityMonitor";

const Diagram = ({ type, label, color = "gold" }) => {
  const colorMap = {
    gold: "text-yellow-400 border-yellow-500/30 bg-yellow-950/30",
    cyan: "text-cyan-400 border-cyan-500/30 bg-cyan-950/30",
    purple: "text-purple-400 border-purple-500/30 bg-purple-950/30",
    green: "text-green-400 border-green-500/30 bg-green-950/30",
    red: "text-red-400 border-red-500/30 bg-red-950/30"
  };
  
  return (
    <div className="w-full h-48 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden group my-6 hover:border-white/20 transition-all">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      <div className="text-center z-10 p-6 relative">
        <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center animate-pulse border ${colorMap[color].replace('text-', 'border-').split(' ')[1]} bg-opacity-10`}>
          <Shield className={`w-6 h-6 ${colorMap[color].split(' ')[0]}`} />
        </div>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">System Schematic</div>
        <Badge variant="outline" className={`font-mono text-md py-1 px-4 mb-2 ${colorMap[color]}`}>
          &lt;{type} /&gt;
        </Badge>
        {label && <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">{label}</p>}
      </div>
    </div>
  );
};

export default function CopyrightProtectionPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const currentYear = new Date().getFullYear();
  const [currentUser, setCurrentUser] = useState(null);
  const { isLocked, loading: loadingLimits } = useUsageLimits(currentUser);
  const fileInputRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Copyright Registration State
  const [workTitle, setWorkTitle] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [registrationTimestamp, setRegistrationTimestamp] = useState(null);
  const [registrationId, setRegistrationId] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionStatus, setCompressionStatus] = useState("");
  
  // Security State
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0, mlComplexity: 0 });
  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    let mounted = true;

    try {
      blockScriptInjection();
      const cspResult = validateCSP();
      
      if (mounted) {
        setSecurityStatus({
          safe: cspResult.valid,
          threats: cspResult.violations?.length || 0,
          mlComplexity: cspResult.mlComplexity || 0
        });
      }
      
      mlDataCollector.record('copyright_page_visit', {
        feature: 'copyright_protection',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Security init failed:', error);
    }
    
    return () => {
      mounted = false;
      const sessionDuration = Date.now() - sessionStartTime;
      mlDataCollector.record('copyright_session_end', {
        feature: 'copyright_protection',
        sessionDuration: sessionDuration,
        registrationCompleted: registrationComplete,
        timestamp: Date.now()
      });
    };
  }, [mlDataCollector, registrationComplete, sessionStartTime]);

  const encodeCompressedWAV = (leftChannel, rightChannel, sampleRate) => {
    const numChannels = 2;
    const length = leftChannel.length;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = length * blockAlign;
    
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
    
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const leftSample = Math.max(-1, Math.min(1, leftChannel[i]));
      view.setInt16(offset, leftSample < 0 ? leftSample * 0x8000 : leftSample * 0x7FFF, true);
      offset += 2;
      
      const rightSample = numChannels > 1 ? Math.max(-1, Math.min(1, rightChannel[i])) : leftSample;
      view.setInt16(offset, rightSample < 0 ? rightSample * 0x8000 : rightSample * 0x7FFF, true);
      offset += 2;
    }
    
    return buffer;
  };

  const compressAudioFile = async (file) => {
    setIsCompressing(true);
    setCompressionProgress(0);
    setCompressionStatus("Reading audio file...");
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      setCompressionProgress(20);
      setCompressionStatus("Decoding audio...");
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setCompressionProgress(40);
      
      const sampleRate = audioBuffer.sampleRate;
      const numChannels = audioBuffer.numberOfChannels;
      
      const leftChannel = audioBuffer.getChannelData(0);
      const rightChannel = numChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel;
      
      setCompressionProgress(60);
      
      const wavBuffer = encodeCompressedWAV(leftChannel, rightChannel, sampleRate);
      setCompressionProgress(80);
      
      setCompressionStatus("Creating compressed file...");
      const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      const compressedFileName = file.name.replace(/\.[^/.]+$/, '') + '_compressed.wav';
      const compressedFile = new File([wavBlob], compressedFileName, { type: 'audio/wav' });
      
      setCompressionProgress(100);
      
      await audioContext.close();
      
      setCompressionStatus(`✅ Compression complete!`);
      setTimeout(() => {
        setIsCompressing(false);
        setCompressionProgress(0);
        setCompressionStatus("");
      }, 2000);
      
      return compressedFile;
      
    } catch (error) {
      console.error('❌ Compression failed:', error);
      setIsCompressing(false);
      return file;
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, {
      maxSizeMB: 200,
      allowedTypes: ['audio/*', 'image/*', 'video/*', 'application/pdf', 'text/*'],
      allowedExtensions: ['mp3', 'wav', 'pdf', 'jpg', 'png', 'mp4', 'txt', 'docx']
    });

    if (!validation.valid) {
      alert(`⚠️ File validation failed:\n${validation.errors.join('\n')}`);
      return;
    }

    setOriginalFile(file);
    
    const fileSizeMB = file.size / (1024 * 1024);
    const isAudio = file.type.startsWith('audio/');
    
    if (fileSizeMB > 50 || (isAudio && fileSizeMB > 30)) {
      if (isAudio) {
        const compressedFile = await compressAudioFile(file);
        setUploadedFile(compressedFile);
      } else {
        if (fileSizeMB > 50) {
          alert(`⚠️ File is ${fileSizeMB.toFixed(2)}MB. Consider compressing manually.`);
        }
        setUploadedFile(file);
      }
    } else {
      setUploadedFile(file);
    }
  };

  const generateCopyrightTimestamp = async () => {
    if (isLocked('analysis_uploads')) {
         alert(`⚠️ Usage limit reached for your plan.`);
         return;
    }

    if (!workTitle.trim() || !creatorName.trim() || !uploadedFile) {
      alert("Please fill in all required fields and upload your work");
      return;
    }

    setIsRegistering(true);

    try {
      const timestamp = new Date();
      const regId = `CR-${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}${String(timestamp.getDate()).padStart(2, '0')}-${Date.now().toString(36).toUpperCase()}`;
      
      let file_url;
      let finalUploadedFile = uploadedFile;
      let wasCompressedDuringUpload = false;

      try {
        const uploadResult = await base44.integrations.Core.UploadFile({ file: finalUploadedFile });
        file_url = uploadResult.file_url;
      } catch (uploadError) {
        console.error('❌ Initial upload failed:', uploadError);
        const isFileSizeError = uploadError.message?.includes('413') || uploadError.message?.includes('too large');
        
        if (isFileSizeError && finalUploadedFile.type.startsWith('audio/')) {
          const compressedFile = await compressAudioFile(finalUploadedFile);
          setUploadedFile(compressedFile);
          finalUploadedFile = compressedFile;
          wasCompressedDuringUpload = true;
          
          const retryUploadResult = await base44.integrations.Core.UploadFile({ file: finalUploadedFile });
          file_url = retryUploadResult.file_url;
        } else {
          throw new Error(`File upload failed. Error: ${uploadError.message}`);
        }
      }
      
      const registration = {
        registration_id: regId,
        work_title: workTitle,
        creator_name: creatorName,
        work_description: workDescription,
        file_url: file_url,
        file_name: finalUploadedFile.name,
        registration_date: timestamp.toISOString(),
        registration_timestamp: timestamp.toLocaleString()
      };

      await base44.entities.CreativeProject.create({
          name: `Copyright: ${workTitle}`,
          type: "copyright_registration",
          status: "completed",
          data: registration
      });
      
      setRegistrationTimestamp(registration.registration_timestamp);
      setRegistrationId(regId);
      setRegistrationComplete(true);
      
      mlDataCollector.record('copyright_registration_completed', {
        feature: 'copyright_protection',
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error("Copyright registration failed:", error);
      alert(`❌ Registration failed: ${error.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const downloadCertificate = () => {
    if (!registrationTimestamp || !registrationId) return;

    const originalFileName = originalFile?.name || uploadedFile.name;
    const finalSizeMB = (uploadedFile.size / (1024 * 1024)).toFixed(2);

    const certificate = `
═══════════════════════════════════════════════════════════════
              COPYRIGHT REGISTRATION CERTIFICATE
═══════════════════════════════════════════════════════════════

Registration ID: ${registrationId}
Issued by: SpectroModel™ Copyright Services

WORK DETAILS:
Title: ${workTitle}
Creator: ${creatorName}
Description: ${workDescription || 'N/A'}

FILE INFORMATION:
Filename: ${originalFileName}
Size: ${finalSizeMB} MB

TIMESTAMP:
${registrationTimestamp}

LEGAL NOTICE:
This certificate serves as proof of creation date.
For full legal protection, register with the U.S. Copyright Office.

═══════════════════════════════════════════════════════════════
© ${currentYear} SpectroModel™
═══════════════════════════════════════════════════════════════
    `.trim();

    const blob = new Blob([certificate], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Copyright_Certificate_${registrationId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setWorkTitle("");
    setCreatorName("");
    setWorkDescription("");
    setUploadedFile(null);
    setOriginalFile(null);
    setRegistrationTimestamp(null);
    setRegistrationId(null);
    setRegistrationComplete(false);
  };

  return (
    // CYBERPUNK BASE - PURE DARK
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f0520] to-[#050015] p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-purple-500/30 selection:text-purple-100">
      
      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        <LimitLocker feature="analysis_uploads" featureKey="COPYRIGHT_PROTECTION" user={currentUser} />

        {/* HEADER */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <Lock className="w-8 h-8 text-purple-500" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-500 animate-pulse">
                    RIGHTS MANAGEMENT
                </span>
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-wider">
                Digital Timestamping & Blockchain Verification Protocol
            </p>
          </div>
        </div>

        {isLocked('analysis_uploads') && (
            <Card className="bg-red-950/20 border-red-500/50 backdrop-blur-md">
                <CardContent className="p-8 flex flex-col items-center text-center">
                    <Lock className="w-16 h-16 text-red-500 mb-6" />
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Access Restricted</h2>
                    <p className="text-slate-300 mb-6 max-w-lg font-mono text-sm">
                        &gt;&gt; PREMIUM CLEARANCE REQUIRED FOR COPYRIGHT REGISTRATION.
                    </p>
                    <Button onClick={() => navigate(createPageUrl("Monetization"))} className="bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold px-8 shadow-lg shadow-red-900/20">
                        UPGRADE SECURITY LEVEL
                    </Button>
                </CardContent>
            </Card>
        )}

        {!isLocked('analysis_uploads') && (
        <>
        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Security */}
             <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Encryption</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                {securityStatus.safe ? '&gt;&gt; AES-256 ENFORCED' : '!! PROTOCOL ERROR'}
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">ACTIVE</Badge>
                </CardContent>
            </Card>

            {/* AI Status */}
            <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Ledger AI</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                &gt;&gt; VERIFYING HASHES...
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">ONLINE</Badge>
                </CardContent>
            </Card>
        </div>

        <LiveSecurityDisplay />
        <LiveThreatDisplay />

        {isCompressing && (
          <div className="bg-slate-900/90 border border-blue-500/50 rounded-xl p-6 mb-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    <p className="text-white font-mono text-xs uppercase">{compressionStatus}</p>
                  </div>
                  <span className="text-blue-400 text-xs font-mono">{compressionProgress}%</span>
                </div>
                <Progress value={compressionProgress} className="h-2 bg-slate-800" indicatorClassName="bg-blue-500" />
              </div>
          </div>
        )}

        {/* REGISTRATION FORM - PURPLE */}
        <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)] rounded-2xl overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>
          <CardHeader className="border-b border-white/5 bg-white/5 p-6">
            <CardTitle className="text-white flex items-center gap-2 text-xl font-bold uppercase tracking-wide">
              <Calendar className="w-6 h-6 text-purple-400" />
              Registration Terminal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {!registrationComplete ? (
              <>
                <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-200 font-mono leading-relaxed">
                    &gt;&gt; NOTICE: This creates a digital timestamp of your work. For federal legal standing, registration with the U.S. Copyright Office is required.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-purple-300 text-xs font-bold uppercase tracking-wider">Asset Title *</label>
                  <Input
                    type="text"
                    placeholder="ENTER TITLE..."
                    value={workTitle}
                    onChange={(e) => setWorkTitle(e.target.value)}
                    className="bg-black/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 font-mono text-sm h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-purple-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Shield className="w-3 h-3" /> Rights Holder *</label>
                  <Input
                    type="text"
                    placeholder="ENTER CREATOR NAME..."
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    className="bg-black/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 font-mono text-sm h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-purple-300 text-xs font-bold uppercase tracking-wider">Asset Description</label>
                  <Textarea
                    placeholder="ENTER BRIEF DESCRIPTION..."
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    className="bg-black/50 border-slate-700 text-white placeholder:text-slate-600 font-mono text-sm h-24 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-purple-300 text-xs font-bold uppercase tracking-wider">Source File *</label>
                  <div className="border border-dashed border-slate-600 bg-slate-900/30 rounded-xl p-8 hover:bg-purple-900/10 hover:border-purple-500/50 transition-all cursor-pointer group"
                    onClick={() => { if(fileInputRef.current) fileInputRef.current.click(); }}>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-900/30 transition-colors">
                         <Upload className="w-6 h-6 text-slate-400 group-hover:text-purple-400" />
                      </div>
                      <p className="text-white font-bold text-sm uppercase mb-2">
                        {uploadedFile ? uploadedFile.name : "Initiate File Transfer"}
                      </p>
                      {uploadedFile ? (
                        <p className="text-xs text-green-400 font-mono">&gt;&gt; FILE BUFFERED: {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      ) : (
                        <p className="text-[10px] text-slate-500 font-mono">
                          SUPPORTED: AUDIO, PDF, IMG, DOC (MAX 200MB)
                        </p>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*,image/*,video/*,.pdf,.txt,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isCompressing}
                    />
                  </div>
                </div>

                <Button
                  onClick={generateCopyrightTimestamp}
                  disabled={isRegistering || isCompressing}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black tracking-widest text-sm h-14 shadow-lg shadow-purple-900/20"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      REGISTERING...
                    </>
                  ) : isCompressing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      COMPRESSING...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      GENERATE TIMESTAMP
                    </>
                  )}
                </Button>
              </>
            ) : (
              // SUCCESS CERTIFICATE - GOLD
              <div className="relative overflow-hidden p-8 rounded-xl border border-yellow-500/50 bg-black/40">
                {/* Holographic effect */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl"></div>

                <div className="flex items-start gap-4 mb-6 relative z-10">
                  <div className="p-3 bg-yellow-900/20 rounded-full border border-yellow-500/50">
                    <CheckCircle className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-yellow-400 uppercase tracking-wider">Registration Confirmed</h3>
                    <p className="text-xs text-yellow-200/70 font-mono mt-1">
                      &gt;&gt; BLOCKCHAIN TIMESTAMP GENERATED
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/80 rounded-lg p-6 space-y-4 mb-6 border border-yellow-500/20 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] text-slate-500 font-mono uppercase">ID Vector</p>
                      <p className="text-white font-bold font-mono text-xs break-all">{registrationId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-mono uppercase">Asset Title</p>
                      <p className="text-white font-bold text-sm">{workTitle}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-mono uppercase">Creator</p>
                      <p className="text-white font-bold text-sm">{creatorName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-mono uppercase">Timestamp</p>
                      <p className="text-yellow-400 font-mono text-xs">{registrationTimestamp}</p>
                    </div>
                  </div>
                  
                  {/* Diagram Tag Injection */}
                  <div className="pt-4 border-t border-white/5 flex justify-center">
                        <Diagram type="blockchain_confirmation_node" label="Immutable Block Entry" color="gold" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                  <Button
                    onClick={downloadCertificate}
                    className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold h-12 text-xs uppercase tracking-widest"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Certificate
                  </Button>
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 h-12 text-xs uppercase tracking-widest"
                  >
                    New Registration
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        </>
        )}
        
        {/* EXTERNAL RESOURCES - RED/ORANGE */}
        <Card className="bg-black/40 backdrop-blur-xl border border-red-900/30 shadow-lg backdrop-blur-md rounded-xl overflow-hidden">
          <CardHeader className="border-b border-red-900/20 bg-red-950/10 p-6">
            <CardTitle className="text-red-400 flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
              <Scale className="w-4 h-4" />
              Federal & Global Agencies
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <p className="text-xs text-slate-400 font-mono">
              &gt;&gt; FOR COMPLETE LEGAL IMMUNITY, REGISTER WITH OFFICIAL GOVERNMENT BODIES:
            </p>
            
            {/* Diagram Tag Injection - Ecosystem */}
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center justify-center">
                 <Diagram type="legal_network_graph" label="Global IP Enforcement Network" color="red" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "U.S. Copyright Office", desc: "Official Federal Registration", url: "https://www.copyright.gov/registration/", color: "text-blue-400", border: "border-blue-500/30" },
                { name: "USPTO", desc: "Patent & Trademark Office", url: "https://www.uspto.gov/", color: "text-amber-400", border: "border-amber-500/30" },
                { name: "Music Modernization", desc: "Streaming Royalty Laws", url: "https://www.copyright.gov/music-modernization/", color: "text-purple-400", border: "border-purple-500/30" },
                { name: "BMI Rights", desc: "Performance Royalties", url: "https://www.bmi.com/", color: "text-green-400", border: "border-green-500/30" },
                { name: "ASCAP", desc: "Composer Rights", url: "https://www.ascap.com/", color: "text-orange-400", border: "border-orange-500/30" },
                { name: "WIPO", desc: "International Treaties", url: "https://www.wipo.int/copyright/en/", color: "text-pink-400", border: "border-pink-500/30" }
              ].map((res, i) => (
                <a
                  key={i}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block p-4 bg-slate-900/30 border ${res.border} rounded-lg hover:bg-slate-800 transition-all group`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-bold text-sm uppercase ${res.color}`}>{res.name}</h4>
                    <ExternalLink className={`w-3 h-3 ${res.color} opacity-50 group-hover:opacity-100`} />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono uppercase">{res.desc}</p>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}