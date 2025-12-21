/**
 * ANTI-SPYWARE PROTECTION SYSTEM
 * Prevents conversion to surveillance device
 * Blocks unauthorized microphone/camera access
 * Monitors and prevents data exfiltration
 */

import { useEffect } from 'react';

class AntiSpywareEngine {
  constructor() {
    this.microphoneBlocked = false;
    this.cameraBlocked = false;
    this.blockedAttempts = [];
    this.allowedOrigins = ['localhost', 'base44.com'];
    this.isActive = false;
  }

  init() {
    if (this.isActive) return;
    this.isActive = true;

    this.blockUnauthorizedMediaAccess();
    this.monitorNetworkRequests();
    this.preventDataExfiltration();
    this.blockForeignScripts();
    
    console.log('🛡️ Anti-Spyware Protection: ACTIVE');
  }

  blockUnauthorizedMediaAccess() {
    const originalGetUserMedia = navigator.mediaDevices?.getUserMedia;
    
    if (originalGetUserMedia) {
      navigator.mediaDevices.getUserMedia = async (constraints) => {
        const stack = new Error().stack;
        const isAuthorized = stack.includes('StudioCorrector') || 
                           stack.includes('startVoiceRecording') ||
                           stack.includes('handleRecordVoice');
        
        if (!isAuthorized) {
          this.blockedAttempts.push({
            type: 'UNAUTHORIZED_MEDIA_ACCESS',
            timestamp: Date.now(),
            constraints,
            stack: stack.substring(0, 500)
          });
          
          console.error('🚨 BLOCKED: Unauthorized media access attempt');
          throw new Error('Media access denied - not from authorized component');
        }
        
        return originalGetUserMedia.call(navigator.mediaDevices, constraints);
      };
    }
  }

  monitorNetworkRequests() {
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      
      const suspiciousPatterns = [
        /\.(ru|cn|tk|ml)$/,
        /tracking/i,
        /spy/i,
        /beacon/i,
        /collect/i
      ];
      
      const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(urlString));
      
      if (isSuspicious && !urlString.includes('base44')) {
        this.blockedAttempts.push({
          type: 'SUSPICIOUS_NETWORK_REQUEST',
          url: urlString,
          timestamp: Date.now()
        });
        
        console.error('🚨 BLOCKED: Suspicious network request:', urlString);
        throw new Error('Network request blocked - suspicious domain');
      }
      
      return originalFetch(url, options);
    };
  }

  preventDataExfiltration() {
    const originalSendBeacon = navigator.sendBeacon;
    
    if (originalSendBeacon) {
      navigator.sendBeacon = (url, data) => {
        console.error('🚨 BLOCKED: SendBeacon attempt');
        this.blockedAttempts.push({
          type: 'BEACON_BLOCKED',
          url,
          timestamp: Date.now()
        });
        return false;
      };
    }
  }

  blockForeignScripts() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'SCRIPT') {
            const src = node.getAttribute('src') || '';
            const foreignDomains = ['.ru', '.cn', '.ir', '.kp', '.sy'];
            
            const isForeign = foreignDomains.some(domain => src.includes(domain));
            
            if (isForeign) {
              node.remove();
              this.blockedAttempts.push({
                type: 'FOREIGN_SCRIPT_BLOCKED',
                url: src,
                timestamp: Date.now()
              });
              console.error('🚨 BLOCKED: Foreign script from', src);
            }
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  getBlockedAttempts() {
    return this.blockedAttempts.slice(-100);
  }

  getStatus() {
    return {
      active: this.isActive,
      totalBlocked: this.blockedAttempts.length,
      lastBlockedAt: this.blockedAttempts.length > 0 ? 
        this.blockedAttempts[this.blockedAttempts.length - 1].timestamp : null
    };
  }
}

const antiSpyware = new AntiSpywareEngine();

export function useAntiSpyware() {
  useEffect(() => {
    antiSpyware.init();
  }, []);

  return {
    getStatus: () => antiSpyware.getStatus(),
    getBlockedAttempts: () => antiSpyware.getBlockedAttempts()
  };
}

export default antiSpyware;