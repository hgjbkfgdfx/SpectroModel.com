import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Plus, CheckCircle, Circle, Clock, User, Brain, Shield, Trash2 } from "lucide-react";
import moment from 'moment';

export default function ProjectAssignments({ assignments = [], members = [], onAdd, onUpdate, onDelete, canEdit = true }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    assignee_email: '',
    due_date: '',
    priority: 'medium'
  });

  const handleAdd = () => {
    if (!newAssignment.title) return;
    onAdd?.({
      id: `assign_${Date.now()}`,
      ...newAssignment,
      status: 'todo',
      created_at: new Date().toISOString()
    });
    setNewAssignment({ title: '', description: '', assignee_email: '', due_date: '', priority: 'medium' });
    setShowAdd(false);
  };

  const toggleStatus = (assignment) => {
    const statusFlow = ['todo', 'in_progress', 'review', 'completed'];
    const currentIdx = statusFlow.indexOf(assignment.status);
    const nextStatus = statusFlow[(currentIdx + 1) % statusFlow.length];
    onUpdate?.(assignment.id, { ...assignment, status: nextStatus });
  };

  const statusColors = {
    todo: 'bg-slate-500/20 text-slate-300',
    in_progress: 'bg-blue-500/20 text-blue-300',
    review: 'bg-yellow-500/20 text-yellow-300',
    completed: 'bg-green-500/20 text-green-300'
  };

  const priorityColors = {
    low: 'bg-slate-500/20 text-slate-300',
    medium: 'bg-blue-500/20 text-blue-300',
    high: 'bg-orange-500/20 text-orange-300',
    urgent: 'bg-red-500/20 text-red-300'
  };

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-orange-400" />
            Assignments
          </CardTitle>
          {canEdit && (
            <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-1" /> New Assignment
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
          <div className="p-4 bg-slate-800/60 rounded-lg border border-orange-500/30 space-y-3">
            <Input
              value={newAssignment.title}
              onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Assignment title"
              className="bg-slate-700 border-slate-600 text-white"
            />
            <Textarea
              value={newAssignment.description}
              onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description..."
              className="bg-slate-700 border-slate-600 text-white"
              rows={2}
            />
            <div className="grid grid-cols-3 gap-2">
              <Select value={newAssignment.assignee_email} onValueChange={(v) => setNewAssignment(prev => ({ ...prev, assignee_email: v }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Assign to" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {members.map(m => (
                    <SelectItem key={m.email} value={m.email} className="text-white">{m.name || m.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={newAssignment.due_date}
                onChange={(e) => setNewAssignment(prev => ({ ...prev, due_date: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Select value={newAssignment.priority} onValueChange={(v) => setNewAssignment(prev => ({ ...prev, priority: v }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="low" className="text-white">Low</SelectItem>
                  <SelectItem value="medium" className="text-white">Medium</SelectItem>
                  <SelectItem value="high" className="text-white">High</SelectItem>
                  <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="bg-orange-600 hover:bg-orange-700">Create</Button>
              <Button variant="outline" onClick={() => setShowAdd(false)} className="border-slate-600 text-slate-300">Cancel</Button>
            </div>
          </div>
        )}

        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No assignments yet</p>
            <p className="text-slate-500 text-sm">Assign tasks to team members</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assignments.map(assignment => {
              const assignee = members.find(m => m.email === assignment.assignee_email);
              return (
                <div key={assignment.id} className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <button onClick={() => canEdit && toggleStatus(assignment)} className="mt-1">
                        {assignment.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      <div>
                        <h4 className={`font-medium ${assignment.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'}`}>
                          {assignment.title}
                        </h4>
                        {assignment.description && (
                          <p className="text-slate-500 text-sm mt-1">{assignment.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge className={statusColors[assignment.status]}>{assignment.status.replace('_', ' ')}</Badge>
                          <Badge className={priorityColors[assignment.priority]}>{assignment.priority}</Badge>
                          {assignee && (
                            <Badge className="bg-purple-500/20 text-purple-300">
                              <User className="w-3 h-3 mr-1" /> {assignee.name}
                            </Badge>
                          )}
                          {assignment.due_date && (
                            <Badge className="bg-slate-500/20 text-slate-300">
                              <Clock className="w-3 h-3 mr-1" /> {moment(assignment.due_date).format('MMM D')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {canEdit && (
                      <Button size="sm" variant="ghost" onClick={() => onDelete?.(assignment.id)} className="text-red-400 h-8 w-8 p-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}