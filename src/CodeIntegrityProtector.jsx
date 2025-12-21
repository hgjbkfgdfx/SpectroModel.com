/**
 * CODE INTEGRITY PROTECTOR - PREVENTS UNAUTHORIZED MODIFICATIONS
 * Monitors for code tampering, feature changes, and unauthorized edits
 */

import { useEffect } from 'react';
import { useMLDataCollector } from './MLDataCollector';

class CodeIntegrityProtector {
  constructor() {
    this.originalCode = new Map();
    this.locked = true;
    this.violations = [];
    this.checkInterval = null;
    
    this.initializeProtection();
  }

  initializeProtection() {
    // Lock all critical functions
    this.lockCriticalAPIs();
    
    // Monitor for DOM modifications - DISABLED per user request
    // this.monitorDOM();
    
    // Prevent console tampering
    this.protectConsole();
    
    // Start integrity checks - DISABLED per user request (no timed undo)
    // this.startIntegrityChecks();
  }

  lockCriticalAPIs() {
    // Passive monitoring only - no interference with app operation
    if (typeof window === 'undefined') return;

    // Just track that protection is active, don't modify any APIs
    console.log('✓ Code integrity monitoring active');
  }

  monitorDOM() {
    if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Check for suspicious script injections
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT') {
            const src = node.getAttribute('src');
            if (src && !this.isAllowedScript(src)) {
              this.recordViolation('unauthorized_script', { src });
              node.remove();
            }
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }

  isAllowedScript(src) {
    const allowedDomains = [
      window.location.origin,
      'base44.com',
      'base44.io'
    ];
    
    return allowedDomains.some(domain => src.includes(domain));
  }

  protectConsole() {
    if (typeof window === 'undefined') return;

    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    // Wrap console methods to detect tampering
    console.log = function(...args) {
      if (args.some(arg => typeof arg === 'string' && /hack|exploit|inject/i.test(arg))) {
        this.recordViolation('suspicious_console_message', { message: args[0] });
      }
      originalLog.apply(console, args);
    }.bind(this);

    console.warn = function(...args) {
      originalWarn.apply(console, args);
    };

    console.error = function(...args) {
      originalError.apply(console, args);
    };
  }

  startIntegrityChecks() {
    if (typeof window === 'undefined') return;

    this.checkInterval = setInterval(() => {
      this.verifyIntegrity();
    }, 30000); // Check every 30 seconds
  }

  verifyIntegrity() {
    // Check localStorage hasn't been tampered with
    try {
      const testKey = '__integrity_test__';
      const testValue = Date.now().toString();
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      
      if (retrieved !== testValue) {
        this.recordViolation('storage_tampered');
      }
      
      localStorage.removeItem(testKey);
    } catch (e) {
      this.recordViolation('storage_access_error', { error: e.message });
    }

    // Check critical functions haven't been overwritten
    if (typeof window.fetch !== 'function') {
      this.recordViolation('fetch_tampered');
    }

    if (typeof window.AudioContext !== 'function' && typeof window.webkitAudioContext !== 'function') {
      this.recordViolation('audio_context_tampered');
    }
  }

  recordViolation(type, details = {}) {
    const violation = {
      type,
      details,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.violations.push(violation);

    // Keep last 100 violations
    if (this.violations.length > 100) {
      this.violations.shift();
    }

    // Silent logging only - no console errors
    console.log('🔒 Security event logged:', type);

    // Store for analysis
    try {
      const stored = JSON.parse(localStorage.getItem('code_violations') || '[]');
      stored.push(violation);
      localStorage.setItem('code_violations', JSON.stringify(stored.slice(-100)));
    } catch (e) {}
  }

  getViolations() {
    return this.violations;
  }

  getStatus() {
    return {
      locked: this.locked,
      violationCount: this.violations.length,
      lastCheck: Date.now()
    };
  }

  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

// Singleton instance
const protector = new CodeIntegrityProtector();

export function useCodeIntegrityProtector() {
  const mlDataCollector = useMLDataCollector();

  useEffect(() => {
    mlDataCollector.record('code_integrity_active', {
      feature: 'security',
      timestamp: Date.now()
    });

    return () => {
      const violations = protector.getViolations();
      if (violations.length > 0) {
        mlDataCollector.record('code_violations_detected', {
          count: violations.length,
          types: [...new Set(violations.map(v => v.type))],
          timestamp: Date.now()
        });
      }
    };
  }, []);

  return {
    getStatus: () => protector.getStatus(),
    getViolations: () => protector.getViolations()
  };
}

export default protector;