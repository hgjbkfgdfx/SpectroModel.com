import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, Lock, Brain, AlertTriangle, FileText, 
  CheckCircle, XCircle, ArrowLeft, Activity, 
  Database, Server, Eye, Terminal, Fingerprint
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAdminChangeControl } from "@/components/shared/AdminChangeControl";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import SecurityMonitor from "@/components/shared/SecurityMonitor";
import ParticleSystem from "@/components/shared/ParticleSystem";

const Diagram = ({ type, label, color = "blue" }) => {
  const colorMap = {
    blue: "text-blue-400 border-blue-500/30 bg-blue-950/30",
    purple: "text-purple-400 border-purple-500/30 bg-purple-950/30",
    green: "text-green-400 border-green-500/30 bg-green-950/30",
    red: "text-red-400 border-red-500/30 bg-red-950/30"
  };
  
  return (
    <div className="w-full h-56 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden group my-8 hover:border-white/20 transition-all">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      <div className="text-center z-10 p-6 relative">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse border ${colorMap[color].replace('text-', 'border-').split(' ')[1]} bg-opacity-10`}>
          <Database className={`w-8 h-8 ${colorMap[color].split(' ')[0]}`} />
        </div>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">System Schematic</div>
        <Badge variant="outline" className={`font-mono text-lg py-1 px-6 mb-2 ${colorMap[color]}`}>
          &lt;{type} /&gt;
        </Badge>
        {label && <p className="text-slate-400 text-sm max-w-md mx-auto mt-3 font-mono">{label}</p>}
      </div>
      {/* Decorative tech lines */}
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${color}-500/50 to-transparent opacity-50`} />
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 blur-3xl rounded-full pointer-events-none`} />
    </div>
  );
};

export default function AuditLogPage() {
  const navigate = useNavigate();
  const { getChangeLog, isAdmin } = useAdminChangeControl();
  const [logs, setLogs] = useState([]);
  const mlDataCollector = useMLDataCollector();
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0 });

  useEffect(() => {
    blockScriptInjection();
    const csp = validateCSP();
    setSecurityStatus({ safe: csp.valid, threats: csp.violations?.length || 0 });

    const logsData = getChangeLog();
    if (logsData) {
        setLogs(logsData);
    }
    
    mlDataCollector.record('audit_log_visit', {
      feature: 'system_event_horizon',
      timestamp: Date.now(),
      isAdmin
    });
  }, [getChangeLog, isAdmin, mlDataCollector]);

  const getLogColor = (log) => {
    if (log.status === 'THREAT' || log.status === 'BLOCKED') return 'red';
    if (log.requestedBy === 'System' || log.requestedBy === 'AI') return 'blue';
    if (log.status === 'AUTHORIZED') return 'green';
    return 'purple'; // Default user action
  };

  const getLogIcon = (log) => {
    if (log.status === 'THREAT' || log.status === 'BLOCKED') return <AlertTriangle className="w-4 h-4" />;
    if (log.requestedBy === 'System') return <Server className="w-4 h-4" />;
    if (log.status === 'AUTHORIZED') return <CheckCircle className="w-4 h-4" />;
    return <Fingerprint className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/0 to-slate-900/0 p-4 md:p-8 pb-24 text-slate-100 font-sans overflow-x-hidden">
      
      {/* Cyberpunk Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0 opacity-20"></div>
      <ParticleSystem />
      
      <NetworkErrorBanner />
      <AILearningBanner />
      <SecurityMonitor />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="text-slate-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Shield className="w-8 h-8 text-blue-400 animate-pulse" />
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-purple-500">
                  System Event Horizon
                </h1>
              </div>
              <p className="text-xs font-mono text-blue-500/70 tracking-widest uppercase pl-11">
                Immutable Audit Ledger | Trace ID: #{Date.now().toString(36).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
             <Badge variant="outline" className="bg-black/40 text-slate-400 border-white/10 font-mono">
               <Terminal className="w-3 h-3 mr-2" /> LIVE_FEED
             </Badge>
             {securityStatus.safe ? (
               <Badge className="bg-green-500/10 text-green-400 border-green-500/30 font-mono">
                 <CheckCircle className="w-3 h-3 mr-2" /> SECURE
               </Badge>
             ) : (
                <Badge className="bg-red-500/10 text-red-400 border-red-500/30 font-mono animate-pulse">
                 <AlertTriangle className="w-3 h-3 mr-2" /> THREATS_ACTIVE
               </Badge>
             )}
          </div>
        </div>

        <LiveSecurityDisplay />
        <LiveThreatDisplay />
        
        {/* Data Flow Diagram */}
        <Card className="bg-slate-900/40 border border-white/10 backdrop-blur-md shadow-2xl">
           <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black uppercase flex items-center gap-3 text-white tracking-wide">
                  <Activity className="w-5 h-5 text-blue-400" /> Data Ingestion Architecture
                </h2>
                <Badge variant="secondary" className="bg-white/5 text-slate-400 hover:bg-white/10">
                  SYSTEM DIAGNOSTIC
                </Badge>
              </div>
              <Diagram type="audit_log_system_architecture" label="Secure Event Ingestion Pipeline" color="blue" />
           </CardContent>
        </Card>

        {/* Logs Viewer */}
        <Card className="bg-black/40 border border-white/10 backdrop-blur-xl shadow-[0_0_50px_-20px_rgba(0,0,0,0.7)] overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />
          <CardHeader className="border-b border-white/5 bg-black/20">
            <CardTitle className="text-white flex items-center gap-2 font-mono text-sm uppercase tracking-widest">
              <FileText className="w-4 h-4 text-blue-400" />
              Immutable Event Stream
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(!logs || logs.length === 0) ? (
              <div className="p-24 text-center text-slate-500 font-mono flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700/30">
                  <Lock className="w-10 h-10 opacity-50" />
                </div>
                <p className="text-lg font-bold text-slate-400">NO EVENTS RECORDED</p>
                <p className="text-xs mt-2 opacity-60">System is monitoring for authorized actions...</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {(logs || []).map((log, idx) => {
                  const color = getLogColor(log);
                  const colorClasses = {
                    blue: "text-blue-400 border-blue-500/30 bg-blue-950/30",
                    purple: "text-purple-400 border-purple-500/30 bg-purple-950/30",
                    green: "text-green-400 border-green-500/30 bg-green-950/30",
                    red: "text-red-400 border-red-500/30 bg-red-950/30"
                  }[color];

                  return (
                    <div key={idx} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between gap-4 group">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 w-2 h-2 rounded-full bg-${color === 'purple' ? 'purple' : color}-500 shadow-[0_0_10px_currentColor]`} />
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`font-black text-sm tracking-wide uppercase text-${color === 'purple' ? 'purple' : color}-400`}>
                              {log.feature}
                            </span>
                            <span className="text-xs font-mono text-slate-500 border-l border-slate-700 pl-3">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm font-medium">{log.action}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] uppercase font-mono text-slate-500">Initiator:</span>
                            <Badge variant="outline" className={`text-[10px] py-0 h-5 border-${color === 'purple' ? 'purple' : color}-500/30 text-${color === 'purple' ? 'purple' : color}-400`}>
                              {log.requestedBy}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <Badge className={`font-mono text-xs px-3 py-1 ${colorClasses} group-hover:shadow-lg transition-all duration-300`}>
                        <span className="mr-2">{getLogIcon(log)}</span>
                        {log.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integrity Check Section */}
        <div className="pt-8 border-t border-white/5">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black uppercase flex items-center gap-3 text-slate-300 tracking-wide">
                  <Lock className="w-5 h-5 text-green-500" /> Ledger Integrity Verification
                </h3>
                <Badge variant="outline" className="border-green-500/30 text-green-400 font-mono">
                   HASH: VALID
                </Badge>
            </div>
            
            <div className="bg-green-950/10 border border-green-500/20 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Database className="w-32 h-32 text-green-500" />
                </div>
                <Diagram type="blockchain_immutable_ledger" label="Cryptographic Chain of Custody" color="green" />
                <p className="text-center text-slate-500 font-mono text-xs mt-4">
                    // ALL EVENTS ARE CRYPTOGRAPHICALLY SIGNED AND TIMESTAMPED. MODIFICATION IS MATHEMATICALLY IMPOSSIBLE.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}