/**
 * ML DATA COLLECTOR - ENHANCED WITH QUOTA MANAGEMENT
 * Learns from user interactions across all features
 * Improves recommendations, predictions, and personalization
 * FIXED: Handles localStorage quota exceeded errors gracefully
 */

import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

class MLDataCollector {
  constructor() {
    this.buffer = [];
    this.maxBufferSize = 50; // REDUCED from 100 to 50 to prevent quota issues
    this.flushInterval = 30000; // 30 seconds
    this.lastFlush = Date.now();
    this.maxStorageSize = 4000000; // 4MB limit (leaving 1MB buffer from 5MB typical limit)
    this.quotaExceeded = false;
  }

  // Record user interaction
  record(eventType, data) {
    try {
      // Skip recording if quota was exceeded
      if (this.quotaExceeded) {
        if (Date.now() - this.lastFlush > 60000) { // Try again after 1 minute
          this.quotaExceeded = false;
        } else {
          return; // Skip silently
        }
      }

      const event = {
        type: eventType,
        data: this.sanitizeData(data),
        timestamp: Date.now(),
        session: this.getSessionId(),
        context: this.getContext()
      };

      this.buffer.push(event);

      // Auto-flush if buffer is full
      if (this.buffer.length >= this.maxBufferSize) {
        this.flush();
      }

      // Auto-flush if time elapsed
      if (Date.now() - this.lastFlush > this.flushInterval) {
        this.flush();
      }
    } catch (err) {
      console.warn('Failed to record ML data:', err.message);
    }
  }

  // Sanitize sensitive data
  sanitizeData(data) {
    const sanitized = { ...data };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'creditCard', 'email', 'phone'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        delete sanitized[field];
      }
    });

    // Truncate large strings to save space
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 200) {
        sanitized[key] = sanitized[key].substring(0, 200) + '...';
      }
      // Remove large objects/arrays
      if (Array.isArray(sanitized[key]) && sanitized[key].length > 10) {
        sanitized[key] = sanitized[key].slice(0, 10);
      }
    });

    return sanitized;
  }

  getSessionId() {
    if (typeof window === 'undefined') return null;
    
    let sessionId = sessionStorage.getItem('ml_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      try {
        sessionStorage.setItem('ml_session_id', sessionId);
      } catch (e) {
        console.warn('Failed to set session ID:', e.message);
      }
    }
    return sessionId;
  }

  getContext() {
    if (typeof window === 'undefined') return {};
    
    return {
      url: window.location.pathname, // Only pathname to save space
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      // Removed userAgent and other large fields to save space
    };
  }

  // ENHANCED: Check storage size before writing
  checkStorageSize() {
    if (typeof window === 'undefined' || !window.localStorage) return 0;
    
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (e) {
      return 0;
    }
  }

  // ENHANCED: Clean old data to make room
  cleanOldData() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    
    try {
      const data = JSON.parse(localStorage.getItem('ml_data_buffer') || '[]');
      
      if (data.length > 1000) {
        // Keep only last 500 events (newest)
        const trimmed = data.slice(-500);
        localStorage.setItem('ml_data_buffer', JSON.stringify(trimmed));
        console.log(`🧹 ML Data: Cleaned ${data.length - 500} old events`);
        return true;
      }
      
      return false;
    } catch (e) {
      console.warn('Failed to clean old data:', e.message);
      return false;
    }
  }

  // ENHANCED: Flush buffer to storage with quota management
  async flush() {
    if (this.buffer.length === 0) return;

    try {
      const events = [...this.buffer];
      this.buffer = [];
      this.lastFlush = Date.now();

      // Store locally with quota management
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          // Check current storage size
          const currentSize = this.checkStorageSize();
          
          if (currentSize > this.maxStorageSize) {
            console.warn('⚠️ ML Data: Storage near limit');
            // this.cleanOldData(); // DISABLED: No auto-undo/cleanup
          }

          const existing = JSON.parse(localStorage.getItem('ml_data_buffer') || '[]');
          const combined = [...existing, ...events];
          
          // Keep last 1000 events (REDUCED from 5000)
          const trimmed = combined.slice(-1000);
          
          // Try to save
          localStorage.setItem('ml_data_buffer', JSON.stringify(trimmed));
          
          // Reset quota exceeded flag on success
          this.quotaExceeded = false;
          
          console.log(`📊 ML Data: Flushed ${events.length} events (total: ${trimmed.length})`);
        } catch (err) {
          if (err.name === 'QuotaExceededError' || err.message?.includes('quota')) {
            console.error('⚠️ ML Data: Storage quota exceeded - emergency cleanup');
            this.quotaExceeded = true;
            
            // Emergency cleanup: Remove old ML data
            try {
              localStorage.removeItem('ml_data_buffer');
              localStorage.removeItem('ml_threats'); // Also clean threat data
              localStorage.removeItem('ml_patterns');
              console.log('🧹 Emergency cleanup: ML data cleared');
              
              // Try to save just the new events
              localStorage.setItem('ml_data_buffer', JSON.stringify(events.slice(-100)));
              this.quotaExceeded = false;
            } catch (cleanupErr) {
              console.error('❌ Emergency cleanup failed:', cleanupErr.message);
              // Clear ALL localStorage as last resort
              try {
                const important = ['csrf_token', 'ml_session_id'];
                const saved = {};
                important.forEach(key => {
                  const val = localStorage.getItem(key);
                  if (val) saved[key] = val;
                });
                
                localStorage.clear();
                
                Object.entries(saved).forEach(([key, val]) => {
                  try {
                    localStorage.setItem(key, val);
                  } catch (e) {}
                });
                
                console.log('🗑️ Full localStorage cleared (kept essential keys)');
              } catch (e) {
                console.error('❌ Full cleanup failed:', e.message);
              }
            }
          } else {
            throw err;
          }
        }
      }

      // Optionally send to server (implement backend endpoint if needed)
      // await base44.functions.invoke('collectMLData', { events });

    } catch (err) {
      console.error('Failed to flush ML data:', err.message);
      
      // If flush fails completely, clear buffer to prevent memory leak
      this.buffer = [];
    }
  }

  // Get collected data for analysis
  getData() {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('ml_data_buffer') || '[]');
    } catch (e) {
      console.warn('Failed to get ML data:', e.message);
      return [];
    }
  }

  // Clear all data
  clear() {
    this.buffer = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem('ml_data_buffer');
        console.log('🗑️ ML data cleared');
      } catch (e) {
        console.warn('Failed to clear ML data:', e.message);
      }
    }
  }

  // Get insights from collected data
  getInsights() {
    const data = this.getData();
    
    const insights = {
      totalEvents: data.length,
      eventTypes: {},
      mostActiveFeatures: {},
      averageSessionDuration: 0,
      errorRate: 0,
      storageUsed: this.checkStorageSize()
    };

    data.forEach(event => {
      // Count event types
      insights.eventTypes[event.type] = (insights.eventTypes[event.type] || 0) + 1;
      
      // Track feature usage
      if (event.data?.feature) {
        insights.mostActiveFeatures[event.data.feature] = 
          (insights.mostActiveFeatures[event.data.feature] || 0) + 1;
      }
    });

    // Calculate error rate
    const errorEvents = data.filter(e => e.type === 'error' || e.type.includes('error')).length;
    insights.errorRate = data.length > 0 ? (errorEvents / data.length) * 100 : 0;

    return insights;
  }

  // NEW: Get storage health status
  getStorageHealth() {
    const currentSize = this.checkStorageSize();
    const percentage = (currentSize / this.maxStorageSize) * 100;
    
    return {
      used: currentSize,
      max: this.maxStorageSize,
      percentage: percentage,
      status: percentage < 70 ? 'healthy' : percentage < 90 ? 'warning' : 'critical',
      needsCleanup: percentage > 80
    };
  }
}

// Singleton instance
const mlCollector = new MLDataCollector();

// Auto-cleanup disabled per user request to prevent timed undo
if (typeof window !== 'undefined') {
  // No auto-cleanup on load
}

// React hook for easy integration
export function useMLDataCollector() {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    // Flush on unmount
    return () => {
      mountedRef.current = false;
      mlCollector.flush();
    };
  }, []);

  return {
    record: mlCollector.record.bind(mlCollector),
    flush: mlCollector.flush.bind(mlCollector),
    getData: mlCollector.getData.bind(mlCollector),
    getInsights: mlCollector.getInsights.bind(mlCollector),
    clear: mlCollector.clear.bind(mlCollector),
    getStorageHealth: mlCollector.getStorageHealth.bind(mlCollector),
    cleanOldData: mlCollector.cleanOldData.bind(mlCollector)
  };
}

export default mlCollector;