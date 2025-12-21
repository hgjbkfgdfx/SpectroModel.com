import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Plus, Clock, AlertCircle, CheckCircle, Circle, MoreVertical, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import moment from 'moment';

const statusConfig = {
  todo: { icon: Circle, label: 'To Do', color: 'bg-slate-500/20 text-slate-300' },
  in_progress: { icon: Clock, label: 'In Progress', color: 'bg-blue-500/20 text-blue-300' },
  review: { icon: AlertCircle, label: 'Review', color: 'bg-yellow-500/20 text-yellow-300' },
  completed: { icon: CheckCircle, label: 'Completed', color: 'bg-green-500/20 text-green-300' }
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-slate-500/20 text-slate-300' },
  medium: { label: 'Medium', color: 'bg-blue-500/20 text-blue-300' },
  high: { label: 'High', color: 'bg-orange-500/20 text-orange-300' },
  urgent: { label: 'Urgent', color: 'bg-red-500/20 text-red-300' }
};

export default function ProjectTasks({ tasks = [], members = [], onAddTask, onUpdateTask, onDeleteTask, canEdit }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', assignee_email: '' });
  const [filter, setFilter] = useState('all');

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    onAddTask({
      id: `task_${Date.now()}`,
      ...newTask,
      status: 'todo',
      created_at: new Date().toISOString()
    });
    setNewTask({ title: '', priority: 'medium', assignee_email: '' });
    setIsAdding(false);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const taskCounts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader className="border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <CheckSquare className="w-5 h-5 text-purple-400" />
            Tasks ({tasks.length})
          </CardTitle>
          {canEdit && (
            <Button size="sm" onClick={() => setIsAdding(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-1" /> Add Task
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {Object.entries(taskCounts).map(([key, count]) => (
            <Button
              key={key}
              size="sm"
              variant={filter === key ? "default" : "outline"}
              onClick={() => setFilter(key)}
              className={filter === key ? "bg-purple-600 font-bold" : "border-slate-700 bg-white text-black font-bold hover:bg-slate-200"}
            >
              {key === 'all' ? 'All' : statusConfig[key]?.label || key} ({count})
            </Button>
          ))}
        </div>

        {isAdding && (
          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 space-y-3">
            <Input
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Task title..."
              className="bg-slate-700 border-slate-600 text-white"
            />
            <div className="flex gap-2">
              <Select value={newTask.priority} onValueChange={(v) => setNewTask(prev => ({ ...prev, priority: v }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(priorityConfig).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={newTask.assignee_email} onValueChange={(v) => setNewTask(prev => ({ ...prev, assignee_email: v }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white flex-1">
                  <SelectValue placeholder="Assign to..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value={null}>Unassigned</SelectItem>
                  {members.map(m => (
                    <SelectItem key={m.email} value={m.email}>{m.name || m.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddTask} className="bg-purple-600 hover:bg-purple-700">Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="text-slate-400">Cancel</Button>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredTasks.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No tasks</p>
          ) : (
            filteredTasks.map((task) => {
              const StatusIcon = statusConfig[task.status]?.icon || Circle;
              return (
                <div key={task.id} className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 flex items-center gap-3">
                  <StatusIcon className={`w-5 h-5 ${task.status === 'completed' ? 'text-green-400' : 'text-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={priorityConfig[task.priority]?.color || ''} variant="outline">
                        {task.priority}
                      </Badge>
                      {task.assignee_email && (
                        <span className="text-xs text-slate-500">{task.assignee_email}</span>
                      )}
                    </div>
                  </div>
                  {canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-slate-800 border-slate-700">
                        {Object.entries(statusConfig).map(([key, { label }]) => (
                          <DropdownMenuItem 
                            key={key} 
                            onClick={() => onUpdateTask(task.id, { status: key })}
                            className="text-slate-200"
                          >
                            Mark as {label}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem onClick={() => onDeleteTask(task.id)} className="text-red-400">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}