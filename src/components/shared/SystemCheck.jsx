import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { base44 } from "@/api/base44Client";

export default function SystemCheckPage() {
  const [checks, setChecks] = useState({
    auth: { status: 'pending', message: '' },
    entities: { status: 'pending', message: '' },
    integrations: { status: 'pending', message: '' },
    sdk: { status: 'pending', message: '' }
  });
  const [isRunning, setIsRunning] = useState(false);

  const runChecks = async () => {
    setIsRunning(true);
    const newChecks = { ...checks };

    // Check 1: SDK Import
    try {
      if (base44 && base44.auth && base44.entities && base44.integrations) {
        newChecks.sdk = { status: 'success', message: 'Base44 SDK loaded correctly' };
      } else {
        newChecks.sdk = { status: 'error', message: 'Base44 SDK not fully loaded' };
      }
    } catch (error) {
      newChecks.sdk = { status: 'error', message: `SDK Error: ${error.message}` };
    }
    setChecks({...newChecks});

    // Check 2: Authentication
    try {
      const user = await base44.auth.me();
      if (user) {
        newChecks.auth = { 
          status: 'success', 
          message: `Authenticated as ${user.email} (${user.role})` 
        };
      } else {
        newChecks.auth = { status: 'warning', message: 'Not authenticated (public access)' };
      }
    } catch (error) {
      newChecks.auth = { status: 'error', message: `Auth Error: ${error.message}` };
    }
    setChecks({...newChecks});

    // Check 3: Entity Access
    try {
      const analyses = await base44.entities.MusicAnalysis.list('-created_date', 1);
      newChecks.entities = { 
        status: 'success', 
        message: `Can access entities. Found ${analyses.length} analysis records` 
      };
    } catch (error) {
      newChecks.entities = { status: 'error', message: `Entity Error: ${error.message}` };
    }
    setChecks({...newChecks});

    // Check 4: Integrations
    try {
      const testResult = await base44.integrations.Core.InvokeLLM({
        prompt: 'Say "System check successful" in 3 words or less.',
        response_json_schema: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      });
      newChecks.integrations = { 
        status: 'success', 
        message: `Integration test: ${testResult.message || 'OK'}` 
      };
    } catch (error) {
      newChecks.integrations = { status: 'error', message: `Integration Error: ${error.message}` };
    }
    setChecks({...newChecks});

    setIsRunning(false);
  };

  useEffect(() => {
    runChecks();
  }, []);

  const getIcon = (status) => {
    if (status === 'success') return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (status === 'error') return <XCircle className="w-5 h-5 text-red-400" />;
    if (status === 'warning') return <CheckCircle className="w-5 h-5 text-yellow-400" />;
    return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
  };

  const getBadgeColor = (status) => {
    if (status === 'success') return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (status === 'error') return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (status === 'warning') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  };

  const allPassed = Object.values(checks).every(c => c.status === 'success' || c.status === 'warning');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            System Diagnostic
          </h1>
          <p className="text-slate-400">Checking SpectroModel Infrastructure</p>
        </div>

        <Card className="bg-slate-800/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Infrastructure Status</span>
              <Button 
                onClick={runChecks} 
                disabled={isRunning}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                Rerun Tests
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(checks).map(([key, check]) => (
              <div 
                key={key}
                className="p-4 bg-slate-700/30 rounded-lg flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1">
                  {getIcon(check.status)}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold capitalize mb-1">
                      {key === 'sdk' ? 'SDK Import' : 
                       key === 'auth' ? 'Authentication' :
                       key === 'entities' ? 'Database Access' :
                       'AI Integrations'}
                    </h3>
                    <p className="text-sm text-slate-300">{check.message || 'Running...'}</p>
                  </div>
                </div>
                <Badge className={getBadgeColor(check.status)}>
                  {check.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {allPassed && !isRunning && (
          <Card className="bg-green-900/20 border-green-500/30">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-300 mb-2">
                ✅ All Systems Operational
              </h2>
              <p className="text-slate-300 mb-4">
                SpectroModel infrastructure is working correctly with the new Base44 SDK.
              </p>
              <Button 
                onClick={() => window.location.href = '/Dashboard'}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-900/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white text-sm">System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Browser:</span>
              <span className="text-white">{navigator.userAgent.split(' ').pop()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Platform:</span>
              <span className="text-white">{navigator.platform}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Online:</span>
              <span className="text-white">{navigator.onLine ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Local Time:</span>
              <span className="text-white">{new Date().toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-900/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white text-sm">Quick Fixes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                alert('Browser cache cleared. Please refresh the page.');
              }}
              variant="outline"
              className="w-full border-purple-500/50 text-purple-300"
            >
              Clear Browser Cache
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full border-blue-500/50 text-blue-300"
            >
              Hard Refresh Page
            </Button>
            <Button 
              onClick={() => base44.auth.logout()}
              variant="outline"
              className="w-full border-red-500/50 text-red-300"
            >
              Logout & Re-login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}