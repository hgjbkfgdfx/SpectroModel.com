/**
 * NETWORK ERROR HANDLER - AUTO-RETRY & RECOVERY
 * Handles network errors gracefully with automatic retries
 * AI learns from all network patterns
 */

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw, Brain } from 'lucide-react';
import { useMLDataCollector } from './MLDataCollector';
import { base44 } from '@/api/base44Client';

// GLOBAL: Wrap all base44 API calls with auto-retry
export function setupGlobalNetworkHandler() {
  if (typeof window === 'undefined') return;
  if (window._networkHandlerSetup) return;
  window._networkHandlerSetup = true;

  // Intercept all fetch requests
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const maxRetries = 3;
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await Promise.race([
          originalFetch(...args),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
        ]);
        
        // Retry on 5xx server errors or 429 (Rate Limit)
        // Do NOT retry on other 4xx client errors (401, 403, 404, etc.)
        // Retry on 5xx server errors or 429 (Rate Limit)
        // Do NOT retry on other 4xx client errors (401, 403, 404, etc.)
        if (!response.ok && (response.status >= 500 || response.status === 429)) {
          // Infinite retry for Rate Limits (429) to prevent UI crash
          if (response.status === 429) {
             const retryAfter = response.headers.get('Retry-After');
             const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000; // Fixed 5s wait for rate limits
             console.warn(`⚠️ Rate limited (429). Pausing for ${waitTime}ms...`);
             await new Promise(resolve => setTimeout(resolve, waitTime));
             i--; // Decrement counter to retry indefinitely for 429
             continue; 
          }

          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            continue;
          } else {
             console.error(`❌ Request failed after ${maxRetries} attempts. Status: ${response.status}`);
             throw new Error(`HTTP ${response.status}`);
          }
        }
        
        return response;
      } catch (error) {
        lastError = error;
        console.warn(`Fetch attempt ${i + 1}/${maxRetries} failed:`, error.message);
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    
    throw lastError;
  };
  
  console.log('✅ Global network error handler active');
}

export function useNetworkErrorHandler() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const mlDataCollector = useMLDataCollector();

  useEffect(() => {
    setupGlobalNetworkHandler();
    
    const handleOnline = () => {
      setIsOnline(true);
      setRetryCount(0);
      mlDataCollector.record('network_restored', { 
        feature: 'network_handler',
        timestamp: Date.now() 
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      mlDataCollector.record('network_lost', { 
        feature: 'network_handler',
        timestamp: Date.now() 
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const retryRequest = async (requestFn, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await Promise.race([
          requestFn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
        ]);
        
        if (i > 0) {
          mlDataCollector.record('network_retry_success', {
            feature: 'network_handler',
            retries: i,
            timestamp: Date.now()
          });
        }
        
        return result;
      } catch (error) {
        console.warn(`Request attempt ${i + 1} failed:`, error.message);
        
        if (i === maxRetries - 1) {
          mlDataCollector.record('network_retry_failed', {
            feature: 'network_handler',
            error: error.message,
            retries: i + 1,
            timestamp: Date.now()
          });
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  return { isOnline, retryCount, retryRequest };
}

export function NetworkErrorBanner() {
  const { isOnline } = useNetworkErrorHandler();
  const mlDataCollector = useMLDataCollector();

  if (isOnline) return null;

  return (
    <Alert className="bg-red-950/90 border-red-500/50 mb-4">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Network Connection Lost</p>
            <p className="text-xs text-red-300">Attempting to reconnect automatically...</p>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-red-500/30 hover:bg-red-500/20"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export function AILearningBanner() {
  return (
    <Alert className="bg-white border-2 border-black mb-4 shadow-none">
      <Brain className="h-5 w-5 text-black animate-pulse shrink-0 mt-0.5" />
      <AlertDescription className="text-black w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="font-black text-sm whitespace-nowrap">🤖 AI Learns From Your Data</span>
          <span className="hidden sm:inline text-black">|</span>
          <span className="text-black text-xs font-bold">
            All interactions improve accuracy & personalization
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default { useNetworkErrorHandler, NetworkErrorBanner, AILearningBanner };