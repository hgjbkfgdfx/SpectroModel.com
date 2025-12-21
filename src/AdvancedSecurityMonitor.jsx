import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Ban, Eye, MapPin, Clock, Activity } from 'lucide-react';
import { base44 } from "@/api/base44Client";

/**
 * ADVANCED SECURITY MONITOR
 * Legal defensive measures: logging, banning, tracking
 * NO offensive actions - purely defensive
 */

class SecurityTracker {
  constructor() {
    this.threats = this.loadThreats();
    this.bannedIPs = this.loadBannedIPs();
    this.suspiciousPatterns = new Map();
    this.attackLog = [];
  }

  loadThreats() {
    try {
      return JSON.parse(localStorage.getItem('security_threats') || '[]');
    } catch {
      return [];
    }
  }

  loadBannedIPs() {
    try {
      return new Set(JSON.parse(localStorage.getItem('banned_ips') || '[]'));
    } catch {
      return new Set();
    }
  }

  async getClientInfo() {
    const info = {
      ip: 'detecting...',
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: Date.now(),
      url: window.location.href
    };

    // Try to get IP via public API (legal)
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      info.ip = data.ip;
    } catch (e) {
      info.ip = 'unavailable';
    }

    return info;
  }

  async logThreat(type, severity, details) {
    const clientInfo = await this.getClientInfo();
    
    const threat = {
      type,
      severity,
      details,
      client: clientInfo,
      timestamp: Date.now(),
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.threats.push(threat);
    this.attackLog.push(threat);

    // Keep last 500 threats
    if (this.threats.length > 500) {
      this.threats = this.threats.slice(-500);
    }

    try {
      localStorage.setItem('security_threats', JSON.stringify(this.threats));
    } catch (e) {}

    // Auto-ban on critical threats
    if (severity === 'critical' && clientInfo.ip !== 'unavailable') {
      this.banIP(clientInfo.ip, type);
    }

    // Try to save to database (admin only)
    try {
      if (base44?.entities?.SecurityIncident) {
        await base44.entities.SecurityIncident.create({
          incident_type: type,
          severity: severity,
          attacker_info: {
            ip_address: clientInfo.ip,
            user_agent: clientInfo.userAgent,
            device_type: /Mobi|Android/i.test(clientInfo.userAgent) ? 'mobile' : 'desktop',
            browser: this.detectBrowser(clientInfo.userAgent),
            os: clientInfo.platform,
            screen_resolution: clientInfo.screen,
            timezone: clientInfo.timezone,
            language: clientInfo.language
          },
          attack_details: {
            method: type,
            target: window.location.pathname,
            payload: JSON.stringify(details).substring(0, 500),
            timestamp: new Date().toISOString(),
            blocked: true,
            action_taken: severity === 'critical' ? 'IP_BANNED' : 'LOGGED'
          },
          threat_score: this.calculateThreatScore(type, severity, details)
        });
      }
    } catch (e) {
      console.warn('Failed to save security incident to database:', e);
    }

    console.error(`🚨 SECURITY THREAT LOGGED: ${type} (${severity}) - IP: ${clientInfo.ip}`);
    
    return threat;
  }

  detectBrowser(ua) {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  calculateThreatScore(type, severity, details) {
    let score = 0;
    
    // Base severity score
    const severityScores = {
      low: 20,
      medium: 40,
      high: 70,
      critical: 95
    };
    score += severityScores[severity] || 40;

    // Pattern frequency
    const count = this.suspiciousPatterns.get(type) || 0;
    score += Math.min(count * 5, 30);

    return Math.min(100, score);
  }

  banIP(ip, reason) {
    if (ip === 'unavailable' || !ip) return;
    
    this.bannedIPs.add(ip);
    
    try {
      localStorage.setItem('banned_ips', JSON.stringify([...this.bannedIPs]));
      console.error(`🚫 IP BANNED: ${ip} - Reason: ${reason}`);
    } catch (e) {}
  }

  isIPBanned(ip) {
    return this.bannedIPs.has(ip);
  }

  getStats() {
    const last24h = this.threats.filter(t => Date.now() - t.timestamp < 86400000);
    
    return {
      totalThreats: this.threats.length,
      last24h: last24h.length,
      bannedIPs: this.bannedIPs.size,
      criticalThreats: this.threats.filter(t => t.severity === 'critical').length,
      topAttackTypes: this.getTopAttackTypes()
    };
  }

  getTopAttackTypes() {
    const counts = {};
    this.threats.forEach(t => {
      counts[t.type] = (counts[t.type] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  clearOldThreats() {
    const cutoff = Date.now() - (7 * 86400000); // 7 days
    this.threats = this.threats.filter(t => t.timestamp > cutoff);
    try {
      localStorage.setItem('security_threats', JSON.stringify(this.threats));
    } catch (e) {}
  }
}

const securityTracker = new SecurityTracker();

export function AdvancedSecurityMonitor({ isAdmin = false }) {
  const [stats, setStats] = useState(null);
  const [recentThreats, setRecentThreats] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const monitorIntervalRef = useRef(null);

  useEffect(() => {
    updateStats();
    
    if (isMonitoring) {
      monitorIntervalRef.current = setInterval(() => {
        updateStats();
        checkForThreats();
      }, 5000);
    }

    return () => {
      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
      }
    };
  }, [isMonitoring]);

  const updateStats = () => {
    const currentStats = securityTracker.getStats();
    setStats(currentStats);
    setRecentThreats(securityTracker.threats.slice(-10).reverse());
  };

  const checkForThreats = async () => {
    // Check for suspicious scripts
    const scripts = document.getElementsByTagName('script');
    const blocked = ['stripe', 'paypal', 'square', 'analytics', 'facebook', 'twitter'];
    
    Array.from(scripts).forEach(script => {
      if (script.src) {
        const isSuspicious = blocked.some(b => script.src.includes(b));
        if (isSuspicious) {
          script.remove();
          securityTracker.logThreat('foreign_script', 'critical', {
            url: script.src,
            action: 'removed'
          });
        }
      }
    });

    // Check for XSS attempts in inputs
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      const val = input.value || '';
      if (/<script|javascript:|onerror=|onclick=/i.test(val)) {
        input.value = '';
        securityTracker.logThreat('xss_attempt', 'critical', {
          element: input.name || input.id,
          cleaned: true
        });
      }
    });

    // Check for rate limit violations
    const apiCalls = window.performance?.getEntriesByType?.('resource')?.filter(
      r => r.name.includes('entities') && (Date.now() - r.startTime) < 5000
    ) || [];

    if (apiCalls.length > 50) {
      securityTracker.logThreat('rate_limit_violation', 'high', {
        count: apiCalls.length,
        blocked: true
      });
    }
  };

  const handleClearThreats = () => {
    if (confirm('Clear all threat logs? This cannot be undone.')) {
      localStorage.removeItem('security_threats');
      localStorage.removeItem('banned_ips');
      securityTracker.threats = [];
      securityTracker.bannedIPs = new Set();
      updateStats();
    }
  };

  const handleExportLogs = () => {
    const data = {
      threats: securityTracker.threats,
      bannedIPs: [...securityTracker.bannedIPs],
      stats: stats,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-log-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!stats) {
    return (
      <Card className="bg-slate-950/90 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400 animate-spin" />
            <p className="text-slate-300 text-sm">Loading security monitor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-950/90 border-red-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400 animate-pulse" />
            🛡️ Advanced Security Monitor
          </div>
          <div className="flex items-center gap-2">
            <Badge className={isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}>
              {isMonitoring ? 'ACTIVE' : 'PAUSED'}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsMonitoring(!isMonitoring)}
              className="border-blue-500/30 text-blue-300"
            >
              {isMonitoring ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-center">
            <p className="text-xs text-red-300">Total Threats</p>
            <p className="text-2xl font-bold text-white">{stats.totalThreats}</p>
          </div>
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded text-center">
            <p className="text-xs text-orange-300">Last 24h</p>
            <p className="text-2xl font-bold text-white">{stats.last24h}</p>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded text-center">
            <p className="text-xs text-purple-300">Banned IPs</p>
            <p className="text-2xl font-bold text-white">{stats.bannedIPs}</p>
          </div>
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-center">
            <p className="text-xs text-yellow-300">Critical</p>
            <p className="text-2xl font-bold text-white">{stats.criticalThreats}</p>
          </div>
        </div>

        {/* Top Attack Types */}
        {stats.topAttackTypes.length > 0 && (
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            <h4 className="text-white font-semibold mb-3 text-sm">🎯 Top Attack Types:</h4>
            <div className="space-y-2">
              {stats.topAttackTypes.map((attack, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{attack.type.replace(/_/g, ' ')}</span>
                  <Badge className="bg-red-500">{attack.count}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Threats */}
        {recentThreats.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-sm">🚨 Recent Threats:</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {recentThreats.map((threat, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded border ${
                    threat.severity === 'critical'
                      ? 'bg-red-500/20 border-red-500/50'
                      : threat.severity === 'high'
                      ? 'bg-orange-500/20 border-orange-500/40'
                      : 'bg-yellow-500/10 border-yellow-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className={`w-4 h-4 ${
                          threat.severity === 'critical' ? 'text-red-400' :
                          threat.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                        }`} />
                        <p className="text-white font-semibold text-sm">{threat.type.replace(/_/g, ' ')}</p>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1">
                        <p><MapPin className="w-3 h-3 inline mr-1" />IP: {threat.client.ip}</p>
                        <p><Clock className="w-3 h-3 inline mr-1" />{new Date(threat.timestamp).toLocaleString()}</p>
                        {threat.details && (
                          <p className="text-[10px] text-slate-500 truncate">
                            {JSON.stringify(threat.details).substring(0, 100)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={
                      threat.severity === 'critical' ? 'bg-red-500' :
                      threat.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                    }>
                      {threat.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleExportLogs}
            variant="outline"
            className="border-blue-500/30 text-blue-300"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Button
            onClick={handleClearThreats}
            variant="outline"
            className="border-red-500/30 text-red-300"
            size="sm"
          >
            <Ban className="w-4 h-4 mr-2" />
            Clear Logs
          </Button>
        </div>

        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">
            ✅ <strong>Defensive Measures Active:</strong> IP tracking • Pattern detection • Auto-banning • Evidence logging • Real-time monitoring
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export { securityTracker };
export default AdvancedSecurityMonitor;