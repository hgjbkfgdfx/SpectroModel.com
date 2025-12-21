import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, X, RefreshCw, Bug, Code, Zap } from 'lucide-react';

export default function ErrorMonitor() {
  const [errors, setErrors] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initialize error log
    if (!window.__errorLog) {
      window.__errorLog = [];
    }

    // Capture console errors
    const originalError = console.error;
    console.error = function(...args) {
      window.__errorLog.push({
        type: 'console.error',
        message: args.join(' '),
        timestamp: Date.now(),
        stack: new Error().stack
      });
      setErrors([...window.__errorLog]);
      originalError.apply(console, args);
    };

    // Capture unhandled errors
    const handleError = (event) => {
      window.__errorLog.push({
        type: 'unhandled',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now(),
        stack: event.error?.stack
      });
      setErrors([...window.__errorLog]);
    };

    // Capture unhandled promise rejections
    const handleRejection = (event) => {
      window.__errorLog.push({
        type: 'promise',
        message: event.reason?.message || String(event.reason),
        timestamp: Date.now(),
        stack: event.reason?.stack
      });
      setErrors([...window.__errorLog]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    // Check for errors periodically
    const interval = setInterval(() => {
      if (window.__errorLog.length > 0 && !isVisible) {
        setErrors([...window.__errorLog]);
        setIsVisible(true);
      }
    }, 5000);

    return () => {
      console.error = originalError;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      clearInterval(interval);
    };
  }, [isVisible]);

  const clearErrors = () => {
    window.__errorLog = [];
    setErrors([]);
    setIsVisible(false);
  };

  const dismissError = (index) => {
    window.__errorLog.splice(index, 1);
    setErrors([...window.__errorLog]);
    if (window.__errorLog.length === 0) {
      setIsVisible(false);
    }
  };

  if (!isVisible || errors.length === 0) {
    return null;
  }

  return (
    <Card className="fixed top-4 right-4 z-50 w-96 max-h-[500px] overflow-y-auto bg-red-900/95 border-red-500/30 shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            {errors.length} Error{errors.length > 1 ? 's' : ''} Detected
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={clearErrors}
              className="h-6 text-xs text-red-200 hover:text-white"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Clear
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 text-red-200 hover:text-white"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {errors.map((error, idx) => (
          <div
            key={idx}
            className="p-3 bg-red-800/50 rounded-lg border border-red-500/30"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <Badge variant="outline" className="text-xs border-red-400/30 text-red-200">
                {error.type}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismissError(idx)}
                className="h-4 w-4 p-0 text-red-300 hover:text-white"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-red-100 text-xs break-words">{error.message}</p>
            {error.filename && (
              <p className="text-red-300 text-xs mt-1">
                {error.filename}:{error.lineno}:{error.colno}
              </p>
            )}
            <p className="text-red-400 text-xs mt-1">
              {new Date(error.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}

        <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
          <p className="text-blue-200 text-xs mb-2 font-semibold">
            💡 Need help fixing these errors?
          </p>
          <p className="text-blue-300 text-xs">
            Open the <strong>Global AI Assistant</strong> (bottom-left) and ask:
            "Help me fix the {errors.length} error{errors.length > 1 ? 's' : ''} on this page"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}