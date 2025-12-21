/**
 * LANGUAGE SECURITY VALIDATOR
 * Blocks non-English scripts (Farsi, Cyrillic, etc.) from code injection
 * Prevents microphone hijacking and speaker conversion attacks
 */

import { useEffect } from 'react';
import mlDataCollector from './MLDataCollector';

// Blocked character ranges
const BLOCKED_UNICODE_RANGES = [
  { name: 'Arabic/Farsi', regex: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g },
  { name: 'Cyrillic', regex: /[\u0400-\u04FF\u0500-\u052F\u2DE0-\u2DFF\uA640-\uA69F]/g },
  { name: 'Chinese', regex: /[\u4E00-\u9FFF\u3400-\u4DBF]/g },
  { name: 'Hebrew', regex: /[\u0590-\u05FF\uFB1D-\uFB4F]/g },
  { name: 'Devanagari', regex: /[\u0900-\u097F]/g }
];

class LanguageSecurityValidator {
  constructor() {
    this.blockedAttempts = [];
    this.microphoneBlocked = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.blockForeignCodeInjection();
    this.blockMicrophoneHijacking();
    this.preventSpeakerConversion();
    this.monitorInputs();
  }

  blockForeignCodeInjection() {
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName, ...args) {
      const element = originalCreateElement.call(document, tagName, ...args);
      
      if (tagName.toLowerCase() === 'script') {
        const originalSetAttribute = element.setAttribute.bind(element);
        element.setAttribute = function(name, value) {
          if (name === 'src' && value) {
            for (const range of BLOCKED_UNICODE_RANGES) {
              if (range.regex.test(value)) {
                mlDataCollector.record('foreign_script_blocked', {
                  feature: 'language_security',
                  type: range.name,
                  blocked: value,
                  timestamp: Date.now()
                });
                console.warn(`🛡️ BLOCKED: ${range.name} script injection attempt`);
                return;
              }
            }
          }
          originalSetAttribute(name, value);
        };
      }
      
      return element;
    };
  }

  blockMicrophoneHijacking() {
    if (!navigator.mediaDevices) return;

    const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const hasAudio = constraints && constraints.audio;
      
      if (hasAudio) {
        mlDataCollector.record('microphone_access_blocked', {
          feature: 'language_security',
          constraints: constraints,
          timestamp: Date.now()
        });
        
        console.warn('🛡️ BLOCKED: Unauthorized microphone access attempt');
        throw new DOMException('Microphone access blocked by security policy', 'NotAllowedError');
      }
      
      return originalGetUserMedia(constraints);
    };

    this.microphoneBlocked = true;
  }

  preventSpeakerConversion() {
    if (typeof AudioContext !== 'undefined') {
      const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;
      
      window.AudioContext = function(...args) {
        const ctx = new OriginalAudioContext(...args);
        
        const originalCreateMediaStreamSource = ctx.createMediaStreamSource;
        ctx.createMediaStreamSource = function(stream) {
          const audioTracks = stream.getAudioTracks();
          
          if (audioTracks.some(track => track.label.toLowerCase().includes('microphone'))) {
            mlDataCollector.record('speaker_conversion_blocked', {
              feature: 'language_security',
              tracks: audioTracks.map(t => t.label),
              timestamp: Date.now()
            });
            
            console.warn('🛡️ BLOCKED: Speaker to microphone conversion attempt');
            throw new DOMException('Audio conversion blocked', 'NotAllowedError');
          }
          
          return originalCreateMediaStreamSource.call(this, stream);
        };
        
        return ctx;
      };
    }
  }

  monitorInputs() {
    const validateInput = (value) => {
      if (!value || typeof value !== 'string') return true;
      
      for (const range of BLOCKED_UNICODE_RANGES) {
        if (range.regex.test(value)) {
          this.blockedAttempts.push({
            type: range.name,
            value: value.substring(0, 50),
            timestamp: Date.now()
          });
          
          mlDataCollector.record('foreign_text_blocked', {
            feature: 'language_security',
            type: range.name,
            timestamp: Date.now()
          });
          
          return false;
        }
      }
      return true;
    };

    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (!validateInput(e.target.value)) {
          e.target.value = e.target.value.replace(
            new RegExp(BLOCKED_UNICODE_RANGES.map(r => r.regex.source).join('|'), 'g'),
            ''
          );
          
          alert('⚠️ Foreign characters blocked for security');
        }
      }
    }, true);
  }

  getStatus() {
    return {
      initialized: this.initialized,
      microphoneBlocked: this.microphoneBlocked,
      blockedAttempts: this.blockedAttempts.length,
      recentBlocks: this.blockedAttempts.slice(-10)
    };
  }

  clear() {
    this.blockedAttempts = [];
  }
}

const languageSecurityValidator = new LanguageSecurityValidator();

export function useLanguageSecurity() {
  useEffect(() => {
    languageSecurityValidator.init();
  }, []);

  return {
    getStatus: () => languageSecurityValidator.getStatus(),
    clear: () => languageSecurityValidator.clear()
  };
}

export default languageSecurityValidator;