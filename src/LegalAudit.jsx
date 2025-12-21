import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Shield, FileText, Download, Clock, Smartphone, Lock, AlertTriangle, Database, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { NetworkErrorBanner, AILearningBanner } from "@/components/shared/NetworkErrorHandler";
import ParticleSystem from "@/components/shared/ParticleSystem";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import SecurityMonitor from "@/components/shared/SecurityMonitor";

const Diagram = ({ type, label }) => (
  <div className="w-full h-56 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden group my-8 hover:border-white/20 transition-all">
  <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
  <div className="text-center z-10 p-6 relative">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-pulse">
      <Shield className="w-8 h-8 text-amber-400" />
    </div>
    <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Protocol Visualization</div>
    <Badge variant="outline" className="font-mono text-amber-400 border-amber-500/30 bg-amber-950/30 text-lg py-1 px-6 mb-2">
      &lt;{type} /&gt;
    </Badge>
    {label && <p className="text-slate-400 text-sm max-w-md mx-auto mt-3 font-mono">{label}</p>}
  </div>
  {/* Decorative tech lines */}
  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-50" />
  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
  </div>
);

export default function LegalAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const mlDataCollector = useMLDataCollector();

  useEffect(() => {
    const init = async () => {
      try {
        // Security initialization
        blockScriptInjection();
        validateCSP();

        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            // Keep as false to show unauthorized screen
            return;
        }
        setIsAdmin(true);

        // ML Learning
        mlDataCollector.record('admin_audit_view', {
          feature: 'legal_audit',
          timestamp: Date.now()
        });

        await fetchLogs();
      } catch (error) {
        console.error("Init failed", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await base44.entities.TermsAcceptanceLog.list('-accepted_at', 100);
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch logs", error);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.terms_version?.includes(searchTerm)
  );

  if (!isAdmin && !loading) {
    return (
        <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <ParticleSystem />
            <div className="relative z-10 bg-red-950/30 border border-red-500/50 p-12 rounded-2xl backdrop-blur-xl max-w-lg w-full">
                <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-red-500 animate-pulse" />
                <h1 className="text-3xl font-black text-white mb-2 tracking-widest uppercase">Restricted Access</h1>
                <p className="text-red-200 font-mono text-sm mb-6">CLEARANCE LEVEL: ADMINISTRATOR ONLY</p>
                <div className="h-1 w-full bg-red-900/50 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-red-500 animate-progress"></div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-slate-900/0 to-slate-900/0 p-4 md:p-8 pb-24 text-slate-100 font-sans overflow-x-hidden">
      
      {/* Cyberpunk Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0 opacity-20"></div>
      <ParticleSystem />

      <NetworkErrorBanner />
      <AILearningBanner />
      <SecurityMonitor />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-amber-400 animate-pulse" />
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
                COMPLIANCE LEDGER TERMINAL
              </h1>
            </div>
            <p className="text-slate-400 font-mono text-xs md:text-sm tracking-wide">
              IMMUTABLE AUDIT LOG • LEGAL VERIFICATION • ADMIN ACCESS
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 px-3 py-1 font-mono animate-pulse">
                <Lock className="w-3 h-3 mr-2" /> TOP SECRET
             </Badge>
             <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 px-3 py-1 font-mono">
                <Clock className="w-3 h-3 mr-2" /> LIVE FEED
             </Badge>
          </div>
        </div>

        {/* Security Dashboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LiveSecurityDisplay />
          <LiveThreatDisplay />
        </div>

        <Card className="bg-slate-900/60 border border-amber-500/30 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-white/5">
            <CardTitle className="text-sm font-bold text-amber-400 uppercase tracking-widest">
              Total Verified Sign-offs
            </CardTitle>
            <FileText className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black text-white mb-1">{logs.length}</div>
            <p className="text-xs text-slate-400 font-mono">
              CRYPTOGRAPHICALLY VERIFIED RECORDS
            </p>
          </CardContent>
        </Card>

        {/* Diagram Section */}
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <div className="border-l-2 border-amber-500/50 pl-4 mb-6">
                <h2 className="text-xl font-black text-white">LEDGER INTEGRITY STATUS</h2>
                <p className="text-amber-400/60 font-mono text-sm">CHAIN OF CUSTODY VERIFICATION</p>
            </div>
            <Diagram type="digital_chain_of_custody" label="Immutable Record Hashing & Timestamp Verification" />
        </div>

        {/* Search & Data Table */}
        <div className="bg-slate-900/60 border border-white/10 rounded-xl backdrop-blur-md overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-black/20 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                    placeholder="QUERY LEDGER (EMAIL OR VERSION)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black/40 border-white/10 text-amber-100 placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/20 font-mono text-xs h-10"
                    />
                </div>
                <Button variant="outline" onClick={fetchLogs} className="border-amber-500/30 text-amber-400 hover:bg-amber-950/30 h-10 font-mono text-xs">
                    REFRESH FEED
                </Button>
            </div>

            <Table>
                <TableHeader className="bg-amber-950/10">
                <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-amber-500/70 font-mono text-xs uppercase">User Identity</TableHead>
                    <TableHead className="text-amber-500/70 font-mono text-xs uppercase">Policy Ver.</TableHead>
                    <TableHead className="text-amber-500/70 font-mono text-xs uppercase">Timestamp</TableHead>
                    <TableHead className="text-blue-400/70 font-mono text-xs uppercase">Device Meta</TableHead>
                    <TableHead className="text-green-400/70 font-mono text-xs uppercase">Method</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading ? (
                    <TableRow className="border-white/5">
                    <TableCell colSpan={5} className="text-center py-12">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                        <span className="text-amber-500/50 font-mono text-xs animate-pulse">DECRYPTING LEDGER...</span>
                    </TableCell>
                    </TableRow>
                ) : filteredLogs.length === 0 ? (
                    <TableRow className="border-white/5">
                    <TableCell colSpan={5} className="text-center py-12 text-slate-500 font-mono text-xs">
                        NO MATCHING RECORDS FOUND IN LEDGER
                    </TableCell>
                    </TableRow>
                ) : (
                    filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-medium text-white font-mono text-xs">{log.user_email}</TableCell>
                        <TableCell>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 font-mono text-[10px]">
                            {log.terms_version}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400 font-mono text-xs">{new Date(log.accepted_at).toLocaleString()}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs text-blue-300/80 font-mono" title={log.device_info}>
                            <div className="flex items-center gap-2">
                                <Smartphone className="w-3 h-3 opacity-50" />
                                {log.device_info || 'Unknown_Device'}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2 text-green-400/80 font-mono text-xs uppercase">
                                <CheckCircle className="w-3 h-3" />
                                {log.acceptance_method?.replace('_', ' ')}
                            </div>
                        </TableCell>
                    </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
            <Database className="w-3 h-3" />
            <span>System Integrity Verified • SpectroModel Compliance Core v5.1</span>
        </div>
      </div>
    </div>
  );
}

function Loader2(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    )
  }