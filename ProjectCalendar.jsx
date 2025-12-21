import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, Clock, Bell, Trash2, Brain, Shield } from "lucide-react";
import moment from 'moment';

export default function ProjectCalendar({ events = [], reminders = [], onAddEvent, onDeleteEvent, onAddReminder, canEdit }) {
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', reminder: false });

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    
    onAddEvent({
      id: `event_${Date.now()}`,
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time || '12:00',
      has_reminder: newEvent.reminder,
      created_at: new Date().toISOString()
    });
    
    if (newEvent.reminder) {
      onAddReminder({
        id: `reminder_${Date.now()}`,
        event_title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time || '12:00'
      });
    }
    
    setNewEvent({ title: '', date: '', time: '', reminder: false });
    setShowAddEvent(false);
  };

  const upcomingEvents = events
    .filter(e => moment(e.date).isSameOrAfter(moment(), 'day'))
    .sort((a, b) => moment(a.date).diff(moment(b.date)));

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
            Calendar & Reminders
          </CardTitle>
          {canEdit && (
            <Button size="sm" onClick={() => setShowAddEvent(!showAddEvent)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" /> Add Event
            </Button>
          )}
        </div>
        {/* AI & Security */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <Brain className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-cyan-300">🤖 AI Learning</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-400" />
            <span className="text-[10px] text-green-300">🛡️ Protected</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddEvent && (
          <div className="p-4 bg-slate-800/60 rounded-lg border border-blue-500/30 space-y-3">
            <Input
              value={newEvent.title}
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Event title"
              className="bg-slate-700 border-slate-600 text-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newEvent.reminder}
                onChange={(e) => setNewEvent(prev => ({ ...prev, reminder: e.target.checked }))}
                className="rounded"
              />
              <span className="text-slate-300 text-sm">Set reminder</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddEvent} className="bg-blue-600 hover:bg-blue-700">
                Save Event
              </Button>
              <Button variant="outline" onClick={() => setShowAddEvent(false)} className="border-slate-600 text-slate-300">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No upcoming events</p>
            <p className="text-slate-500 text-sm">Schedule meetings, deadlines, and sessions</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map(event => (
              <div key={event.id} className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-blue-400 text-xs">{moment(event.date).format('MMM')}</span>
                    <span className="text-white font-bold">{moment(event.date).format('D')}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{event.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-500">{event.time || '12:00'}</span>
                      {event.has_reminder && (
                        <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">
                          <Bell className="w-3 h-3 mr-1" /> Reminder
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {canEdit && (
                  <Button size="sm" variant="ghost" onClick={() => onDeleteEvent(event.id)} className="text-red-400 hover:text-red-300 h-8 w-8 p-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {reminders.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-400" /> Active Reminders
            </h4>
            <div className="space-y-2">
              {reminders.map(reminder => (
                <div key={reminder.id} className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-300">
                  {reminder.event_title} - {moment(reminder.date).format('MMM D')} at {reminder.time}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}