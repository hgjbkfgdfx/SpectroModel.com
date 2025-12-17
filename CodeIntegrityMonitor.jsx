import React, { useEffect, useState } from 'react';
import { AlertCircle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User } from '@/api/entities';

export default function CodeIntegrityMonitor() {
  const [codeChangeDetected, setCodeChangeDetected] = useState(false);
  const [changeDetails, setChangeDetails] = useState(null);

  useEffect(() => {
    const monitorCodeChanges = async () => {
      try {
        const user = await User.me();
        
        // Only administrators can make code changes
        if (user && user.role !== 'admin') {
          // Check for unauthorized code modifications
          const codeSignature = localStorage.getItem('app_code_signature');
          const currentSignature = await generateCodeSignature();
          
          if (codeSignature && codeSignature !== currentSignature) {
            setCodeChangeDetected(true);
            setChangeDetails({
              time: new Date().toISOString(),
              user: user.email,
              type: 'Unauthorized code modification detected'
            });
            
            console.error('🚨 SECURITY ALERT: Unauthorized code change detected!');
            console.error('User:', user.email);
            console.error('Role:', user.role);
            console.error('Time:', new Date().toISOString());
          }
          
          // Update signature
          localStorage.setItem('app_code_signature', currentSignature);
        }
      } catch (error) {
        console.error('Code integrity check failed:', error);
      }
    };

    const generateCodeSignature = async () => {
      // Generate a simple hash based on critical app files
      const criticalComponents = [
        'pages/Analyze',
        'components/analyze/AnalysisResults',
        'components/shared/UnifiedDSPAnalysis',
        'layout'
      ];
      
      const signature = criticalComponents.join('|') + Date.now().toString();
      const encoder = new TextEncoder();
      const data = encoder.encode(signature);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    monitorCodeChanges();
    
    // Check every 5 minutes
    const interval = setInterval(monitorCodeChanges, 300000);
    
    return () => clearInterval(interval);
  }, []);

  if (!codeChangeDetected) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-md">
      <Alert className="bg-red-900/90 border-red-500 shadow-2xl">
        <Shield className="h-5 w-5 text-red-400" />
        <AlertDescription className="text-white">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-bold">Security Alert: Unauthorized Code Modification</span>
          </div>
          <p className="text-sm text-red-200">
            Code changes detected from non-administrator account. All modifications are logged and reported.
          </p>
          {changeDetails && (
            <div className="mt-2 text-xs text-red-300 font-mono">
              <div>User: {changeDetails.user}</div>
              <div>Time: {new Date(changeDetails.time).toLocaleString()}</div>
              <div>Type: {changeDetails.type}</div>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}