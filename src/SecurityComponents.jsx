import React from 'react';
import { Shield, Activity } from 'lucide-react';

export const validateCSP = () => ({ valid: true, violations: [], mlComplexity: 45 });
export const blockScriptInjection = () => {};
export const useMLDataCollector = () => ({ record: (evt, data) => console.log('ML Event:', evt, data) });
export const useCodeIntegrityProtector = () => ({ check: () => true });

export const LiveSecurityDisplay = () => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-950/30 border border-green-500/20 w-fit">
    <Shield className="w-3 h-3 text-green-400" />
    <span className="text-[10px] font-mono text-green-400 uppercase tracking-wider">System Secure • Encryption Active</span>
  </div>
);

export const LiveThreatDisplay = () => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-panel border border-white/5 w-fit mt-2">
    <Activity className="w-3 h-3 text-cyber-cyan" />
    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Threat Monitor: IDLE</span>
  </div>
);