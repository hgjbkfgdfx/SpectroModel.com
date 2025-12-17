import React, { useState } from 'react';
import { Key, ExternalLink, AlertTriangle, Shield, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ApiKeyModal({ onSubmit, onCancel }) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }
    if (!apiKey.startsWith('AIza')) {
      setError('Invalid API key format. Gemini keys start with "AIza"');
      return;
    }
    onSubmit(apiKey.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-slate-900 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-400" />
            Connect Your Gemini API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border border-cyan-500/40">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
              <Shield className="w-4 h-4 text-green-400" />
              <p className="text-white text-xs font-semibold">🔐 Your API key is stored locally only • Never sent to our servers</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-amber-200 text-xs font-semibold">💳 Paid Google Cloud Account Required</p>
                <p className="text-amber-300/70 text-xs mt-1">
                  VEO 3 is a paid API. You must enable billing at{' '}
                  <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer" className="underline text-amber-200">
                    console.cloud.google.com/billing
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/60 uppercase">Gemini API Key</label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              placeholder="AIza..."
              className="bg-black/40 border-white/10 text-white"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
          </div>

          <div className="space-y-2">
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              1. Get API key from Google AI Studio
            </a>
            <a
              href="https://console.cloud.google.com/billing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              2. Enable billing in Google Cloud Console
            </a>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500"
            >
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}