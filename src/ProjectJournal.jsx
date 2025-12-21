import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Save, Trash2, Edit2, Clock, Brain, Shield } from "lucide-react";
import moment from 'moment';

export default function ProjectJournal({ entries = [], onAddEntry, onUpdateEntry, onDeleteEntry, canEdit }) {
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (!content.trim()) return;
    
    const entryData = {
      id: editingId || `entry_${Date.now()}`,
      title: title.trim() || 'Untitled',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      type: 'lyrics'
    };
    
    if (editingId) {
      onUpdateEntry(editingId, entryData);
    } else {
      onAddEntry(entryData);
    }
    
    resetForm();
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setTitle(entry.title || '');
    setContent(entry.content || '');
    setShowEditor(true);
  };

  const resetForm = () => {
    setShowEditor(false);
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Journal / Lyrics Writing
          </CardTitle>
          {canEdit && !showEditor && (
            <Button size="sm" onClick={() => setShowEditor(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-1" /> New Entry
            </Button>
          )}
        </div>
        {/* AI Notice */}
        <div className="flex items-center gap-2 mt-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-cyan-300">🤖 AI Learns From Your Data</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showEditor && (
          <div className="rounded-lg overflow-hidden shadow-xl" style={{
            border: '3px solid #8B4513'
          }}>
            {/* Header - Composition notebook style marbled pattern */}
            <div className="p-3 border-b-2" style={{
              background: 'linear-gradient(45deg, #1a1a1a 25%, #2d2d2d 25%, #2d2d2d 50%, #1a1a1a 50%, #1a1a1a 75%, #2d2d2d 75%)',
              backgroundSize: '20px 20px',
              borderColor: '#8B4513'
            }}>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Entry title (e.g., Verse 1, Chorus, Hook)"
                className="bg-white/90 border-2 border-slate-400 text-slate-800 font-bold text-lg placeholder:text-slate-400 rounded"
              />
            </div>
            {/* Writing area - Real composition notebook: white paper, blue lines, red margin */}
            <div className="relative" style={{
              background: '#fff',
              minHeight: '350px'
            }}>
              {/* Red margin line */}
              <div className="absolute left-16 top-0 bottom-0 w-[2px]" style={{ background: '#ff6b6b' }} />
              {/* Blue horizontal lines */}
              <div className="p-4 pl-20" style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #a8d4ff 27px, #a8d4ff 28px)',
                backgroundPosition: '0 8px',
                minHeight: '350px'
              }}>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your lyrics, notes, or ideas here...

🎵 Tip: Use this space like a traditional lyrics journal
• Write verses, choruses, bridges
• Jot down melody ideas
• Save rhyme schemes"
                  className="bg-transparent border-none text-slate-800 min-h-[300px] font-mono text-base focus:ring-0 focus:outline-none resize-none placeholder:text-slate-400"
                  style={{ lineHeight: '28px', color: '#1e3a5f' }}
                  rows={12}
                />
              </div>
            </div>
            <div className="flex gap-2 p-3" style={{ background: '#f5f5dc', borderTop: '2px solid #8B4513' }}>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 font-bold text-white">
                <Save className="w-4 h-4 mr-1" /> Save Entry
              </Button>
              <Button variant="outline" onClick={resetForm} className="border-slate-500 text-slate-700 bg-white hover:bg-slate-100">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {entries.length === 0 && !showEditor ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No journal entries yet</p>
            <p className="text-slate-500 text-sm">Start writing lyrics, notes, or ideas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <div key={entry.id} className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-white font-medium">{entry.title || 'Untitled'}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-500">{moment(entry.timestamp).fromNow()}</span>
                      <Badge className="bg-purple-500/20 text-purple-300 text-xs">{entry.type || 'lyrics'}</Badge>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(entry)} className="text-slate-400 hover:text-white h-8 w-8 p-0">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDeleteEntry(entry.id)} className="text-red-400 hover:text-red-300 h-8 w-8 p-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono bg-slate-900/50 p-3 rounded">
                  {entry.content}
                </pre>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}