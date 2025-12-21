import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SecurityMonitor() {
  const [securityStatus, setSecurityStatus] = useState({
    foreignScripts: [],
    blocked: 0,
    safe: true
  });
  const [showDetails, setShowDetails] = useState(false);

  // WHITELIST: Only these domains are allowed
  const ALLOWED_DOMAINS = [
    window.location.origin,
    'https://cdn.jsdelivr.net',
    'unpkg.com' // For some UI libraries
  ];

  // BLOCKED: These domains are never allowed (FRAUD VECTORS - NO EXCEPTIONS)
  const BLOCKED_DOMAINS = [
    // External CDNs
    'cdn.tailwindcss.com', 'tailwindcss.com',
    // BLOCKED PAYMENT PROCESSORS - ALL FRAUD VECTORS
    'stripe.com', 'js.stripe.com', 'api.stripe.com', 'm.stripe.com', 'checkout.stripe.com',
    'paypal.com', 'paypalobjects.com', 'www.paypal.com', 'api.paypal.com',
    'venmo.com', 'api.venmo.com',
    'cash.app', 'cashapp.com', 'api.cash.app',
    'zelle.com', 'zellepay.com',
    'westernunion.com', 'moneygram.com',
    'braintreegateway.com', 'braintree-api.com',
    'square.com', 'squareup.com',
    // Tracking/Ads
    'google-analytics.com', 'googletagmanager.com',
    'facebook.net', 'doubleclick.net',
    'analytics.google.com', 'connect.facebook.net',
    'ads-twitter.com', 'analytics.tiktok.com'
  ];

  useEffect(() => {
    const processedScripts = new Set();
    
    const monitorAndBlockScripts = () => {
      const foreignScripts = [];
      let blocked = 0;

      // Check all script tags
      const scripts = document.querySelectorAll('script[src]');
      
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        
        if (!src || processedScripts.has(src)) return;
        
        // Check if from blocked domain (highest priority)
        const isBlocked = BLOCKED_DOMAINS.some(domain => src.includes(domain));
        
        if (isBlocked) {
          // console.warn('🛡️ Blocked:', src); // Removed for silent blocking
          
          foreignScripts.push({
            url: src,
            blocked: true,
            reason: 'Payment processor or tracker - BLOCKED'
          });

          script.remove();
          blocked++;
          processedScripts.add(src);
          return;
        }

        // Check if from allowed domain
        const isAllowed = ALLOWED_DOMAINS.some(domain => 
          src.startsWith(domain) || src.startsWith('/') || src.startsWith('./')
        );

        // FOREIGN but not blocked (just log, don't remove if it's working)
        if (!isAllowed) {
          // Only add to list if it's truly suspicious
          if (!src.includes('tailwind') && !src.includes('jsdelivr') && !src.includes('unpkg')) {
            // console.warn('⚠️ Foreign script:', src); // Removed for silent blocking
            
            foreignScripts.push({
              url: src,
              blocked: false,
              reason: 'Foreign domain - monitoring'
            });
          }
        }
      });

      // Monitor for dynamically added scripts
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.tagName === 'SCRIPT') {
              const src = node.getAttribute('src');
              
              if (src && !processedScripts.has(src)) {
                const isBlocked = BLOCKED_DOMAINS.some(domain => src.includes(domain));

                if (isBlocked) {
                  // console.warn('🛡️ Blocked dynamic script:', src); // Removed for silent blocking
                  node.remove();
                  processedScripts.add(src);
                  
                  setSecurityStatus(prev => ({
                    ...prev,
                    foreignScripts: [...prev.foreignScripts, {
                      url: src,
                      blocked: true,
                      reason: 'Dynamic injection blocked'
                    }],
                    blocked: prev.blocked + 1,
                    safe: false
                  }));
                }
              }
            }
          });
        });
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });

      setSecurityStatus({
        foreignScripts,
        blocked,
        safe: blocked === 0
      });

      return () => observer.disconnect();
    };

    const cleanup = monitorAndBlockScripts();

    // Recheck every 10 seconds (reduced from 5)
    const interval = setInterval(() => {
      monitorAndBlockScripts();
    }, 10000);

    return () => {
      if (cleanup) cleanup();
      clearInterval(interval);
    };
  }, []);

  // Block payment processors silently
  useEffect(() => {
    const blockPaymentProcessors = () => {
      try {
        // Block payment processor objects
        if (window.Stripe) {
          // console.warn('🛡️ Removing Stripe.js object'); // Removed for silent blocking
          delete window.Stripe;
        }
        if (window.PayPal) {
          // console.warn('🛡️ Removing PayPal object'); // Removed for silent blocking
          delete window.PayPal;
        }

        // Remove payment processor scripts
        BLOCKED_DOMAINS.forEach(domain => {
          document.querySelectorAll(`script[src*="${domain}"]`).forEach(script => {
            // console.warn(`🛡️ Removing ${domain} script:`, script.src); // Removed for silent blocking
            script.remove();
          });
        });
      } catch (err) {
        // Silent fail - e.g., if window.Stripe is a non-configurable property in some environments
      }
    };

    blockPaymentProcessors();

    // Check every 5 seconds
    const interval = setInterval(blockPaymentProcessors, 5000);

    return () => clearInterval(interval);
  }, []);

  // Only show if there are actual threats blocked
  if (securityStatus.safe && securityStatus.blocked === 0) {
    return (
      <Card className="bg-green-500/10 border-green-500/30">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-300">
              ✅ Security Active • App is protected
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-orange-500/10 border-orange-500/30">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-orange-300 font-semibold">
              🛡️ {securityStatus.blocked} threat(s) blocked
            </span>
          </div>
          {securityStatus.foreignScripts.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="h-6 px-2 text-orange-300 hover:text-orange-200"
            >
              {showDetails ? 'Hide' : 'Details'}
            </Button>
          )}
        </div>

        {showDetails && securityStatus.foreignScripts.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-orange-200 font-semibold">Blocked Threats:</p>
            {securityStatus.foreignScripts.filter(s => s.blocked).slice(0, 3).map((script, idx) => (
              <div key={idx} className="p-2 bg-red-900/30 rounded text-xs">
                <div className="flex items-start gap-2">
                  <X className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-red-300 font-mono break-all text-[10px]">
                      {script.url.substring(0, 60)}...
                    </p>
                    <p className="text-red-400 text-[10px] mt-1">{script.reason}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-2 p-2 bg-blue-500/10 rounded">
              <p className="text-xs text-blue-300">
                💡 All payment processors and trackers are automatically blocked for your security.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}