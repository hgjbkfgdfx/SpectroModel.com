/**
 * SECURITY SCARE SYSTEM
 * Intimidates and deters hackers with legal warnings and monitoring notices
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle, Eye, Scale, Globe } from 'lucide-react';

export default function SecurityScareSystem() {
  const [ipAddress, setIpAddress] = useState('Unknown');
  const [location, setLocation] = useState('Unknown');
  const [threats, setThreats] = useState(0);

  useEffect(() => {
    // Get user's IP and location
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        setIpAddress(data.ip);
        
        // Get location
        fetch(`https://ipapi.co/${data.ip}/json/`)
          .then(res => res.json())
          .then(loc => {
            setLocation(`${loc.city}, ${loc.region}, ${loc.country_name}`);
          })
          .catch(() => {});
      })
      .catch(() => {});

    // Count security incidents
    try {
      const incidents = JSON.parse(localStorage.getItem('security_incidents') || '[]');
      setThreats(incidents.length);
    } catch (e) {}

    // Monitor for new threats
    const interval = setInterval(() => {
      try {
        const incidents = JSON.parse(localStorage.getItem('security_incidents') || '[]');
        setThreats(incidents.length);
      } catch (e) {}
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (threats === 0) return null;

  return (
    <Card className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-red-500 animate-pulse">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-300 animate-pulse" />
              <div>
                <h2 className="text-2xl font-black text-white">⚠️ SECURITY ALERT</h2>
                <p className="text-red-200 text-sm">Advanced Threat Detection Active</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-red-300">{threats}</div>
              <div className="text-xs text-red-200">THREATS BLOCKED</div>
            </div>
          </div>

          <div className="p-4 bg-red-950/50 border-2 border-red-500 rounded-lg">
            <div className="grid gap-3 text-white">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-red-300" />
                <div>
                  <span className="font-bold">Your IP Address:</span>
                  <span className="ml-2 font-mono text-red-200">{ipAddress}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-red-300" />
                <div>
                  <span className="font-bold">Your Location:</span>
                  <span className="ml-2 text-red-200">{location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-red-300" />
                <div>
                  <span className="font-bold">Legal Status:</span>
                  <span className="ml-2 text-yellow-300">ALL ACTIVITY LOGGED</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-black/30 border border-red-500/50 rounded-lg">
            <h3 className="text-red-200 font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              LEGAL WARNING
            </h3>
            <div className="space-y-2 text-sm text-white">
              <p className="font-bold">🚨 YOUR ACTIVITIES ARE BEING MONITORED AND RECORDED</p>
              
              <p>• All unauthorized access attempts are logged with full attribution</p>
              <p>• IP addresses, timestamps, and methods are stored permanently</p>
              <p>• Violations will result in immediate legal action</p>
              
              <div className="mt-3 p-3 bg-red-900/50 border border-red-500 rounded">
                <p className="font-bold text-yellow-300 mb-2">CONSEQUENCES OF UNAUTHORIZED ACCESS:</p>
                <ul className="space-y-1 text-xs">
                  <li>⚖️ Criminal prosecution under 18 U.S.C. § 1030 (CFAA)</li>
                  <li>💰 Civil lawsuit for damages and legal fees</li>
                  <li>🌐 Public exposure on security forums and social media</li>
                  <li>📢 Report to FBI Internet Crime Complaint Center (IC3)</li>
                  <li>🔒 Permanent ban from platform and services</li>
                  <li>📊 Sharing of evidence with law enforcement globally</li>
                </ul>
              </div>

              <p className="text-yellow-300 font-bold mt-3">
                ⚠️ WE COOPERATE FULLY WITH LAW ENFORCEMENT
              </p>
              
              <p className="text-red-300 font-bold">
                🚫 CEASE ALL UNAUTHORIZED ACTIVITY IMMEDIATELY
              </p>
            </div>
          </div>

          <div className="p-3 bg-yellow-900/30 border border-yellow-500 rounded text-center">
            <p className="text-yellow-200 text-xs font-semibold">
              This system is protected by advanced security monitoring. All malicious activity is tracked,
              logged, and reported to appropriate authorities. Unauthorized access is a federal crime.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}