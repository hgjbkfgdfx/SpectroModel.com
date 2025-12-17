import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Folder, FileVideo, FileAudio, Plus, Search, 
  MoreVertical, Download, Trash2, Edit, Clock,
  Shield, Brain, Star
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProjectManager({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [folders, setFolders] = useState(['Uncategorized']);
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const mlDataCollector = useMLDataCollector();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await base44.entities.CreativeProject.list('-updated_date', 100);
      setProjects(data);
      
      // Extract unique folders
      const uniqueFolders = new Set(['Uncategorized']);
      data.forEach(p => {
        if (p.folder) uniqueFolders.add(p.folder);
      });
      setFolders(Array.from(uniqueFolders));
      
      mlDataCollector.record('projects_loaded', {
        count: data.length,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await base44.entities.CreativeProject.delete(id);
      loadProjects();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesFolder = selectedFolder === 'All' || (p.folder || 'Uncategorized') === selectedFolder;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (p.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedFolder === 'All' ? 'default' : 'outline'}
            onClick={() => setSelectedFolder('All')}
            className="whitespace-nowrap"
          >
            All Projects
          </Button>
          {folders.map(folder => (
            <Button
              key={folder}
              variant={selectedFolder === folder ? 'default' : 'outline'}
              onClick={() => setSelectedFolder(folder)}
              className="whitespace-nowrap"
            >
              <Folder className="w-4 h-4 mr-2" />
              {folder}
            </Button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900/50 border-slate-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map(project => (
          <Card key={project.id} className="bg-slate-900/80 border-slate-700 hover:border-purple-500/50 transition-all group">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${project.type === 'lyric_video' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {project.type === 'lyric_video' || project.type === 'video_generation' ? <FileVideo className="w-5 h-5" /> : <FileAudio className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white truncate max-w-[150px]">{project.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(project.updated_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                    <DropdownMenuItem onClick={() => onSelectProject(project)}>
                      <Edit className="w-4 h-4 mr-2" /> Open
                    </DropdownMenuItem>
                    {project.file_url && (
                      <DropdownMenuItem onClick={() => window.open(project.file_url, '_blank')}>
                        <Download className="w-4 h-4 mr-2" /> Download
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleDelete(project.id)} className="text-red-400">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {project.version > 1 && (
                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                    v{project.version}
                  </Badge>
                )}
                <Badge className="bg-slate-800 text-slate-300 hover:bg-slate-700">
                  {project.folder || 'Uncategorized'}
                </Badge>
                {(project.tags || []).map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-slate-800 text-slate-400">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Learning Banner */}
      <div className="flex items-center gap-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl ai-learning-card">
        <Brain className="w-5 h-5 text-cyan-400 animate-pulse shrink-0 ai-icon" />
        <div>
          <p className="text-cyan-300 text-xs font-semibold ai-title">🤖 AI Learns From Your Data</p>
          <p className="text-cyan-400/60 text-[10px] ai-desc">Project organization improves recommendation accuracy</p>
        </div>
      </div>
    </div>
  );
}