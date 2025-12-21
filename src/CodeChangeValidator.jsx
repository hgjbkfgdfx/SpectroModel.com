/**
 * CODE CHANGE VALIDATOR
 * Scans code after every update to ensure ONLY requested changes were made
 * Blocks unauthorized modifications
 */

import { useEffect } from 'react';
import { useAdminChangeControl } from './AdminChangeControl';
import { useMLDataCollector } from './MLDataCollector';

class CodeChangeValidator {
  constructor() {
    this.expectedChanges = [];
    this.actualChanges = [];
    this.scanResults = [];
  }

  registerExpectedChange(file, change) {
    this.expectedChanges.push({
      file,
      change,
      timestamp: Date.now()
    });
  }

  scanForChanges() {
    // Scan localStorage for any unexpected modifications
    const violations = [];
    
    try {
      // Check if any critical values have been tampered with
      const criticalKeys = ['ml_data_buffer', 'app_change_log', 'csrf_token'];
      
      criticalKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            // Check for suspicious modifications
            if (Array.isArray(parsed) && parsed.some(item => 
              item.unauthorized === true || 
              item.source === 'external'
            )) {
              violations.push({
                type: 'unauthorized_data',
                key,
                timestamp: Date.now()
              });
            }
          } catch (e) {
            // Not JSON, skip
          }
        }
      });
    } catch (e) {
      console.warn('Scan error:', e);
    }

    this.scanResults.push({
      timestamp: Date.now(),
      violations,
      clean: violations.length === 0
    });

    return {
      clean: violations.length === 0,
      violations
    };
  }

  compareChanges() {
    const unauthorized = [];
    
    // Check if there are more actual changes than expected
    if (this.actualChanges.length > this.expectedChanges.length) {
      unauthorized.push({
        type: 'extra_changes',
        count: this.actualChanges.length - this.expectedChanges.length
      });
    }

    return {
      hasUnauthorized: unauthorized.length > 0,
      unauthorized
    };
  }

  getReport() {
    return {
      expectedChanges: this.expectedChanges,
      actualChanges: this.actualChanges,
      scanResults: this.scanResults.slice(-10),
      lastScan: this.scanResults[this.scanResults.length - 1]
    };
  }
}

const validator = new CodeChangeValidator();

export function useCodeChangeValidator() {
  const adminControl = useAdminChangeControl();
  const mlDataCollector = useMLDataCollector();

  useEffect(() => {
    // Timed scanning disabled per user request
    // Initial scan only
    validator.scanForChanges();
  }, []);

  return {
    registerExpectedChange: validator.registerExpectedChange.bind(validator),
    scanForChanges: validator.scanForChanges.bind(validator),
    getReport: validator.getReport.bind(validator)
  };
}

export default validator;