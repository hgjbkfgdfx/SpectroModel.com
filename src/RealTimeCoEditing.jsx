import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit, Users, Save, Brain, Shield } from "lucide-react";

export default function RealTimeCoEditing({ document = '', onSave, currentUser, members = [], canEdit = true }) {
  const [content, setContent] = useState(document);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeEditors, setActiveEditors] = useState([]);

  useEffect(() => {
    setContent(document);
  }, [document]);

  useEffect(() => {
    // Simulate active editors
    if (currentUser) {
      setActiveEditors([{ email: currentUser.email, name: currentUser.full_name, cursor: 0 }]);
    }
  }, [currentUser]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.(content);
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (content !== document && canEdit) {
        handleSave();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [content, document, canEdit]);

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Edit className="w-5 h-5 text-indigo-400" />
            Real-time Co-Editing
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-500/20 text-indigo-300">
              <Users className="w-3 h-3 mr-1" /> {activeEditors.length} editing
            </Badge>
          </div>
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
          {lastSaved && (
            <span className="text-[10px] text-slate-500">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Editors */}
        <div className="flex flex-wrap gap-2">
          {activeEditors.map((editor, idx) => (
            <Badge key={idx} className="bg-green-500/20 text-green-300">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
              {editor.name}
            </Badge>
          ))}
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing... changes sync in real-time"
          className="bg-slate-800 border-slate-700 text-white min-h-[300px] font-mono"
          disabled={!canEdit}
        />

        <div className="flex justify-between items-center">
          <p className="text-slate-500 text-xs">{content.length} characters</p>
          <Button onClick={handleSave} disabled={isSaving || !canEdit} className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}