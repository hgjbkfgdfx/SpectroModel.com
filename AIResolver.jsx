import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { base44 } from "@/api/base44Client";
import { useMLDataCollector } from './MLDataCollector';

export default function AIResolver({ context = {}, onResolved }) {
  const [issue, setIssue] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolution, setResolution] = useState(null);
  const [error, setError] = useState(null);
  const mlDataCollector = useMLDataCollector();

  const resolveWithAI = async () => {
    if (!issue.trim()) {
      setError('Please describe the issue');
      return;
    }

    setIsResolving(true);
    setError(null);
    setResolution(null);

    const startTime = Date.now();

    mlDataCollector.record('ai_resolver_started', {
      feature: 'ai_resolver',
      issueLength: issue.length,
      contextKeys: Object.keys(context),
      timestamp: Date.now()
    });

    try {
      const prompt = `You are a technical support AI for SpectroModel music analytics platform.

User Issue: ${issue}

Context: ${JSON.stringify(context, null, 2)}

Provide the EXACT TEXT or CODE that fixes the problem. Do not just give info. If it's a setting, say "Go to X and click Y". If it's a file error, say "Convert file to MP3". Give the solution immediately. BE CONCISE.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      const resolutionData = {
        solution: response,
        timestamp: Date.now(),
        issue: issue,
        context: context
      };

      setResolution(resolutionData);

      const duration = Date.now() - startTime;
      mlDataCollector.record('ai_resolver_completed', {
        feature: 'ai_resolver',
        duration: duration,
        solutionLength: response.length,
        timestamp: Date.now()
      });

      if (onResolved) {
        onResolved(resolutionData);
      }

    } catch (err) {
      console.error('AI Resolver failed:', err);
      setError(err.message || 'Failed to resolve issue');

      mlDataCollector.record('ai_resolver_error', {
        feature: 'ai_resolver',
        error: err.message,
        timestamp: Date.now()
      });
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-purple-950/90 to-blue-950/90 border-purple-500/40 z-cards">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="text-white flex items-center gap-2 text-sm sm:text-base">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 animate-pulse shrink-0" />
          <span className="break-words">AI Issue Resolver</span>
          <Badge className="ml-auto bg-purple-500 shrink-0 text-xs">BETA</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-3 sm:p-4 pt-0">
        <div>
          <label className="text-white text-sm font-semibold mb-2 block">
            Describe your issue:
          </label>
          <Textarea
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            placeholder="E.g., My audio file won't upload, I'm getting an error when analyzing..."
            className="bg-slate-900 border-slate-700 text-white min-h-[100px]"
            disabled={isResolving}
          />
        </div>

        <Button
          onClick={resolveWithAI}
          disabled={isResolving || !issue.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 z-base"
        >
          {isResolving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Issue...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Resolve with AI
            </>
          )}
        </Button>

        {error && (
          <Card className="bg-red-500/10 border-red-500/50">
            <CardContent className="p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-semibold text-sm">Error</p>
                <p className="text-red-200 text-xs mt-1 break-words">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {resolution && (
          <Card className="bg-green-500/10 border-green-500/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                <h3 className="text-green-300 font-bold text-sm">Solution Found</h3>
              </div>
              <div 
                className="text-slate-200 text-sm whitespace-pre-wrap break-words bg-slate-900/50 p-3 rounded border border-green-500/20 select-text"
                style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
              >
                {resolution.solution}
              </div>
              <Button
                onClick={() => {
                  setResolution(null);
                  setIssue('');
                }}
                variant="outline"
                size="sm"
                className="w-full border-green-500/50 text-green-300 hover:bg-green-500/20"
              >
                Resolve Another Issue
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="p-2 bg-blue-500/20 border border-blue-500/50 rounded text-sm text-blue-200 font-bold text-center break-words shadow-sm">
          🤖 AI learns from every resolution to improve support
        </div>
      </CardContent>
    </Card>
  );
}