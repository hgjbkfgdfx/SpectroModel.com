/**
 * ADMIN CHANGE CONTROL SYSTEM
 * Only Base44 and admin account can modify the app
 * All changes must be explicitly requested in chat
 * Audit trail of all modifications
 */

import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMLDataCollector } from './MLDataCollector';

class ChangeControlSystem {
  constructor() {
    this.changeLog = [];
    this.authorizedAdmins = ['Base44', 'admin'];
    this.sessionChanges = [];
  }

  async verifyAdmin() {
    try {
      const user = await base44.auth.me();
      return user?.role === 'admin';
    } catch {
      return false;
    }
  }

  logChange(changeDetails) {
    const change = {
      timestamp: Date.now(),
      date: new Date().toISOString(),
      ...changeDetails
    };

    this.changeLog.push(change);
    this.sessionChanges.push(change);

    // Store in localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('app_change_log') || '[]');
      stored.push(change);
      localStorage.setItem('app_change_log', JSON.stringify(stored.slice(-1000))); // Keep last 1000
    } catch (e) {
      console.warn('Change log storage failed:', e);
    }

    return change;
  }

  async validateChange(feature, action, requestedBy) {
    const isAdmin = await this.verifyAdmin();
    
    if (!isAdmin && requestedBy !== 'Base44') {
      this.logChange({
        feature,
        action,
        requestedBy,
        status: 'BLOCKED',
        reason: 'Unauthorized - Admin only'
      });
      
      throw new Error('UNAUTHORIZED: Only admin and Base44 can modify the app');
    }

    this.logChange({
      feature,
      action,
      requestedBy,
      status: 'AUTHORIZED',
      reason: 'Admin verified'
    });

    return true;
  }

  getChangeLog() {
    return this.changeLog;
  }

  getSessionChanges() {
    return this.sessionChanges;
  }

  compareChanges(intended, actual) {
    // Compare intended changes with actual changes
    const differences = [];
    
    if (intended.length !== actual.length) {
      differences.push({
        type: 'count_mismatch',
        intended: intended.length,
        actual: actual.length
      });
    }

    // Check each intended change was applied
    intended.forEach((change, idx) => {
      const actualChange = actual[idx];
      if (!actualChange) {
        differences.push({
          type: 'missing_change',
          change: change
        });
      }
    });

    return {
      hasUnauthorizedChanges: differences.length > 0,
      differences
    };
  }
}

const changeControl = new ChangeControlSystem();

export function useAdminChangeControl() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mlDataCollector = useMLDataCollector();

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      try {
        const adminStatus = await changeControl.verifyAdmin();
        if (mounted) {
          setIsAdmin(adminStatus);
          
          mlDataCollector.record('admin_check', {
            feature: 'change_control',
            isAdmin: adminStatus,
            timestamp: Date.now()
          });
        }
      } catch (e) {
        if (mounted) setIsAdmin(false);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    isAdmin,
    isLoading,
    validateChange: changeControl.validateChange.bind(changeControl),
    logChange: changeControl.logChange.bind(changeControl),
    getChangeLog: changeControl.getChangeLog.bind(changeControl),
    compareChanges: changeControl.compareChanges.bind(changeControl)
  };
}

export default changeControl;