/**
 * CHANGE AUDIT DISPLAY
 * Shows all app modifications and who made them
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { useAdminChangeControl } from './AdminChangeControl';

export default function ChangeAuditDisplay() {
  const { isAdmin, getChangeLog } = useAdminChangeControl();
  const [changes, setChanges] = useState([]);

  useEffect(() => {
    const logs = getChangeLog();
    setChanges(logs.slice(-10)); // Last 10 changes
  }, []);

  if (!isAdmin) return null;

  return (
    <Card className="bg-slate-950/90 border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-400" />
          Change Audit Log (Admin Only)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {changes.length === 0 ? (
          <p className="text-slate-400 text-sm">No changes this session</p>
        ) : (
          <div className="space-y-2">
            {changes.map((change, idx) => (
              <div key={idx} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-semibold">{change.feature}</p>
                    <p className="text-slate-400 text-xs">{change.action}</p>
                    <p className="text-slate-500 text-xs">By: {change.requestedBy || 'Unknown'}</p>
                  </div>
                  <Badge className={change.status === 'AUTHORIZED' ? 'bg-green-500' : 'bg-red-500'}>
                    {change.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}