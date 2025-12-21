import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Trash2, Play, Pause, Brain, Shield } from "lucide-react";

export default function ProjectAutomation({ automations = [], onAdd, onDelete, onToggle, canEdit = true }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    trigger: 'task_completed',
    action: 'send_notification'
  });

  const TRIGGERS = [
    { value: 'task_completed', label: 'When task is completed' },
    { value: 'task_assigned', label: 'When task is assigned' },
    { value: 'comment_added', label: 'When comment is added' },
    { value: 'member_joined', label: 'When member joins' },
    { value: 'deadline_approaching', label: 'When deadline is near' }
  ];

  const ACTIONS = [
    { value: 'send_notification', label: 'Send notification' },
    { value: 'send_email', label: 'Send email' },
    { value: 'update_status', label: 'Update project status' },
    { value: 'create_task', label: 'Create follow-up task' },
    { value: 'log_activity', label: 'Log to activity' }
  ];

  const handleAdd = () => {
    if (!newAutomation.name) return;
    onAdd?.({
      id: `auto_${Date.now()}`,
      ...newAutomation,
      enabled: true,
      created_at: new Date().toISOString()
    });
    setNewAutomation({ name: '', trigger: 'task_completed', action: 'send_notification' });
    setShowAdd(false);
  };

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Automation
          </CardTitle>
          {canEdit && (
            <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="w-4 h-4 mr-1" /> Add Rule
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <Brain className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-cyan-300">🤖 AI Learning</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-400" />
            <span className="text-[10px] text-green-300">🛡️ Secure</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd && (
          <div className="p-4 bg-slate-800/60 rounded-lg border border-yellow-500/30 space-y-3">
            <Input
              value={newAutomation.name}
              onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Automation name"
              className="bg-slate-700 border-slate-600 text-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <Select value={newAutomation.trigger} onValueChange={(v) => setNewAutomation(prev => ({ ...prev, trigger: v }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Trigger" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {TRIGGERS.map(t => (
                    <SelectItem key={t.value} value={t.value} className="text-white">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={newAutomation.action} onValueChange={(v) => setNewAutomation(prev => ({ ...prev, action: v }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {ACTIONS.map(a => (
                    <SelectItem key={a.value} value={a.value} className="text-white">{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="bg-yellow-600 hover:bg-yellow-700">Create</Button>
              <Button variant="outline" onClick={() => setShowAdd(false)} className="border-slate-600 text-slate-300">Cancel</Button>
            </div>
          </div>
        )}

        {automations.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No automations set up</p>
            <p className="text-slate-500 text-sm">Automate repetitive tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {automations.map(auto => (
              <div key={auto.id} className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="ghost" onClick={() => onToggle?.(auto.id)} className="h-8 w-8 p-0">
                    {auto.enabled ? <Pause className="w-4 h-4 text-green-400" /> : <Play className="w-4 h-4 text-slate-400" />}
                  </Button>
                  <div>
                    <h4 className="text-white font-medium text-sm">{auto.name}</h4>
                    <p className="text-slate-500 text-xs">
                      {TRIGGERS.find(t => t.value === auto.trigger)?.label} → {ACTIONS.find(a => a.value === auto.action)?.label}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={auto.enabled ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-300'}>
                    {auto.enabled ? 'Active' : 'Paused'}
                  </Badge>
                  {canEdit && (
                    <Button size="sm" variant="ghost" onClick={() => onDelete?.(auto.id)} className="text-red-400 h-8 w-8 p-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}