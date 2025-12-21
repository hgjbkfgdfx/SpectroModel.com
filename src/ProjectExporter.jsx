import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, Cloud, Save, FileJson, FileText, 
  Smartphone, Tablet, Monitor, Upload, Brain, Shield,
  CheckCircle, Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { base44 } from '@/api/base44Client';

export default function ProjectExporter({ project, analyses = [] }) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const exportToJSON = () => {
    const exportData = {
      project: {
        ...project,
        exported_at: new Date().toISOString(),
        export_version: '1.0'
      },
      analyses: analyses,
      metadata: {
        total_analyses: analyses.length,
        project_type: project.project_type,
        team_size: (project.team_members?.length || 0) + 1
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.project_name.replace(/[^a-z0-9]/gi, '_')}_project.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSaveStatus('Downloaded as JSON');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const exportToText = () => {
    let content = `# ${project.project_name}\n`;
    content += `Type: ${project.project_type || 'General'}\n`;
    content += `Owner: ${project.owner_name} (${project.owner_email})\n`;
    content += `Status: ${project.status || 'active'}\n`;
    content += `Created: ${new Date(project.created_date).toLocaleDateString()}\n`;
    content += `\n## Description\n${project.description || 'No description'}\n`;
    
    if (project.team_members?.length > 0) {
      content += `\n## Team Members (${project.team_members.length})\n`;
      project.team_members.forEach(m => {
        content += `- ${m.name || m.email} (${m.role})\n`;
      });
    }
    
    if (project.tasks?.length > 0) {
      content += `\n## Tasks (${project.tasks.length})\n`;
      project.tasks.forEach(t => {
        content += `- [${t.status}] ${t.title}\n`;
      });
    }
    
    if (analyses.length > 0) {
      content += `\n## Analyses (${analyses.length})\n`;
      analyses.forEach(a => {
        content += `- ${a.track_name} by ${a.artist_name} - Score: ${a.hit_score?.toFixed(1) || 'N/A'}\n`;
      });
    }
    
    if (project.journal_entries?.length > 0) {
      content += `\n## Journal Entries (${project.journal_entries.length})\n`;
      project.journal_entries.forEach(e => {
        content += `\n### ${e.title}\n${e.content}\n`;
      });
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.project_name.replace(/[^a-z0-9]/gi, '_')}_project.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSaveStatus('Downloaded as Text');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const saveToCloud = async () => {
    setIsSaving(true);
    try {
      // Upload project data as a file
      const exportData = {
        project,
        analyses,
        saved_at: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
      const file = new File([blob], `${project.project_name}_backup.json`, { type: 'application/json' });
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Save the cloud URL to the project
      await base44.entities.CollaborationProject.update(project.id, {
        cloud_backup_url: file_url,
        last_backup: new Date().toISOString()
      });
      
      setSaveStatus('Saved to Cloud ☁️');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Cloud save failed:', error);
      setSaveStatus('Cloud save failed');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const saveToLocalStorage = () => {
    try {
      const exportData = {
        project,
        analyses,
        saved_at: new Date().toISOString()
      };
      
      const savedProjects = JSON.parse(localStorage.getItem('saved_projects') || '{}');
      savedProjects[project.id] = exportData;
      localStorage.setItem('saved_projects', JSON.stringify(savedProjects));
      
      setSaveStatus('Saved to App Storage');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Local save failed:', error);
      setSaveStatus('Save failed');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <Save className="w-4 h-4 text-purple-400" />
          Save & Export Project
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* AI Learning Badge */}
        <div className="flex items-center gap-2 p-2 bg-cyan-950/50 rounded-lg border border-cyan-500/30">
          <Brain className="w-3 h-3 text-cyan-400" />
          <Shield className="w-3 h-3 text-green-400" />
          <span className="text-[10px] text-cyan-300">🤖 AI Learning • Secure Export</span>
        </div>

        {saveStatus && (
          <div className="flex items-center gap-2 p-2 bg-green-500/20 rounded-lg border border-green-500/30">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300 font-semibold">{saveStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {/* Save to App */}
          <Button 
            size="sm" 
            onClick={saveToLocalStorage}
            className="bg-purple-600 hover:bg-purple-700 font-bold text-xs"
          >
            <Save className="w-3 h-3 mr-1" />
            Save to App
          </Button>

          {/* Save to Cloud */}
          <Button 
            size="sm" 
            onClick={saveToCloud}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 font-bold text-xs"
          >
            {isSaving ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Cloud className="w-3 h-3 mr-1" />
            )}
            Cloud Backup
          </Button>
        </div>

        {/* Download Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full border-slate-700 text-white font-bold">
              <Download className="w-3 h-3 mr-2" />
              Download to Device
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-800 border-slate-700 w-56">
            <DropdownMenuLabel className="text-slate-400 text-xs">Export Format</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem onClick={exportToJSON} className="text-white cursor-pointer">
              <FileJson className="w-4 h-4 mr-2 text-yellow-400" />
              JSON (Full Data)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToText} className="text-white cursor-pointer">
              <FileText className="w-4 h-4 mr-2 text-blue-400" />
              Text Report
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuLabel className="text-slate-400 text-xs">Works On</DropdownMenuLabel>
            <div className="flex items-center gap-2 px-2 py-1 text-xs text-slate-400">
              <Monitor className="w-3 h-3" /> Computer
              <Tablet className="w-3 h-3" /> Tablet
              <Smartphone className="w-3 h-3" /> Phone
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <p className="text-[10px] text-slate-500 text-center">
          Files saved can be opened on any device
        </p>
      </CardContent>
    </Card>
  );
}