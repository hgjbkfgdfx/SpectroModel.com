import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, X, Music, Video, FileText, BarChart3, Mic, BookOpen, Code, GraduationCap, Calculator, Beaker, Palette, Briefcase, Brain, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PROJECT_TYPES = [
  { value: 'analyses', label: 'Analyses Project', icon: BarChart3, description: 'Music analysis & hit prediction' },
  { value: 'marketing', label: 'Marketing Project', icon: Briefcase, description: 'Marketing campaigns & strategies' },
  { value: 'lyrics', label: 'Lyric Project', icon: FileText, description: 'Songwriting & lyric development' },
  { value: 'songs', label: 'Songs Project', icon: Music, description: 'Full song production' },
  { value: 'studio', label: 'Studio Project', icon: Mic, description: 'Recording & mixing sessions' },
  { value: 'video', label: 'Video Project', icon: Video, description: 'Music videos & visual content' },
  { value: 'research', label: 'Research Project', icon: BookOpen, description: 'Music industry research' },
  { value: 'business', label: 'Business Project', icon: Briefcase, description: 'Business planning & deals' },
  { value: 'visualization', label: 'Visualization Project', icon: Palette, description: 'Visual design & artwork' },
  { value: 'resources', label: 'Resources Project', icon: BookOpen, description: 'Shared resources & assets' },
  { value: 'science', label: 'Science Project', icon: Beaker, description: 'Audio science & acoustics' },
  { value: 'math', label: 'Math Project', icon: Calculator, description: 'Music theory & mathematics' },
  { value: 'engineering', label: 'Music Engineering', icon: Code, description: 'Audio engineering & DSP' },
  { value: 'coding', label: 'Coding Project', icon: Code, description: 'Music software development' },
  { value: 'teaching', label: 'Teaching Project', icon: GraduationCap, description: 'Music education & courses' },
  { value: 'learning', label: 'Learning Sessions', icon: GraduationCap, description: 'Personal learning & practice' },
  { value: 'time_management', label: 'Time Management', icon: Calculator, description: 'Schedule & time tracking' },
  { value: 'sheet_music', label: 'Sheet Music Learning', icon: Music, description: 'Sheet music practice & learning' },
  { value: 'concert', label: 'Concert Project', icon: Music, description: 'Live concert planning & production' },
  { value: 'performance', label: 'Performance Project', icon: Video, description: 'Performance rehearsals & shows' },
  { value: 'spectroverse', label: 'SpectroVerse Collaboration', icon: Palette, description: 'Virtual metaverse experiences' },
  { value: 'general', label: 'General Project', icon: Music, description: 'Multi-purpose collaboration' }
];

const MEMBER_LIMITS = [
  { value: 5, label: '5 members' },
  { value: 10, label: '10 members' },
  { value: 25, label: '25 members' },
  { value: 50, label: '50 members' },
  { value: 100, label: '100 members' },
  { value: 0, label: 'Unlimited' }
];

export default function CreateProjectModal({ isOpen, onClose, onCreate, isLoading }) {
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    project_type: 'general',
    visibility: 'private',
    allow_comments: true,
    allow_downloads: true,
    allow_everyone: false,
    member_limit: 25,
    tags: [],
    features: {
      journal: true,
      streaming_video: true,
      screen_share: true,
      calendar: true,
      automation: true,
      assignments: true,
      reminders: true,
      chat: true,
      co_editing: true
    }
  });
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.project_name.trim()) return;
    
    // Add project type to tags automatically
    const projectType = PROJECT_TYPES.find(t => t.value === formData.project_type);
    const autoTags = projectType ? [projectType.label, ...formData.tags] : formData.tags;
    
    onCreate({
      ...formData,
      tags: [...new Set(autoTags)],
      status: 'active'
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const toggleFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };

  const selectedType = PROJECT_TYPES.find(t => t.value === formData.project_type);
  const TypeIcon = selectedType?.icon || Music;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <TypeIcon className="w-5 h-5 text-purple-400" />
            Create New Project
          </DialogTitle>
        </DialogHeader>

        {/* AI & Security Notice */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 p-2 bg-cyan-950/50 rounded border border-cyan-500/30">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-cyan-300">🤖 AI Learns From Your Data</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-green-950/50 rounded border border-green-500/30">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-300">🛡️ Security Active</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Project Name *</Label>
              <Input
                value={formData.project_name}
                onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                placeholder="My Music Project"
                className="bg-slate-800 border-slate-700 text-white mt-1"
                required
              />
            </div>

            <div>
              <Label className="text-slate-300">Project Type *</Label>
              <Select
                value={formData.project_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, project_type: value }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                  {PROJECT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-white">
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4 text-purple-400" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedType && (
                <p className="text-xs text-slate-500 mt-1">{selectedType.description}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your project..."
              className="bg-slate-800 border-slate-700 text-white mt-1"
              rows={2}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="private" className="text-white">Private - Only invited members</SelectItem>
                  <SelectItem value="team" className="text-white">Team - All team members</SelectItem>
                  <SelectItem value="public" className="text-white">Public - Anyone can view</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">Member Limit</Label>
              <Select
                value={String(formData.member_limit)}
                onValueChange={(value) => setFormData(prev => ({ ...prev, member_limit: parseInt(value) }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {MEMBER_LIMITS.map(limit => (
                    <SelectItem key={limit.value} value={String(limit.value)} className="text-white">
                      {limit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Tags</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag..."
                className="bg-slate-800 border-slate-700 text-white"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline" className="border-slate-700">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} className="bg-purple-500/20 text-purple-300 flex items-center gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Project Features */}
          <div>
            <Label className="text-slate-300 mb-2 block">Project Features</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { key: 'journal', label: 'Journal/Lyrics Writing' },
                { key: 'streaming_video', label: 'Streaming Video' },
                { key: 'screen_share', label: 'Screen Share' },
                { key: 'calendar', label: 'Calendar' },
                { key: 'automation', label: 'Automation' },
                { key: 'assignments', label: 'Assignments' },
                { key: 'reminders', label: 'Reminders' },
                { key: 'chat', label: 'Team Chat' },
                { key: 'co_editing', label: 'Real-time Co-editing' }
              ].map(feature => (
                <div 
                  key={feature.key}
                  onClick={() => toggleFeature(feature.key)}
                  className={`p-2 rounded border cursor-pointer transition-all ${
                    formData.features[feature.key] 
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' 
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
                  }`}
                >
                  <span className="text-xs">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg">
            <Label className="text-slate-300">Permissions</Label>
            <div className="flex items-center justify-between">
              <Label className="text-slate-400 text-sm">Allow Comments</Label>
              <Switch
                checked={formData.allow_comments}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_comments: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-400 text-sm">Allow Downloads</Label>
              <Switch
                checked={formData.allow_downloads}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_downloads: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-400 text-sm">Everyone Allowed (Open Access)</Label>
              <Switch
                checked={formData.allow_everyone}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_everyone: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.project_name.trim()} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}