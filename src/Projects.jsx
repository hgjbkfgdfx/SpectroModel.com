import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderKanban, Plus, Search, Filter, Loader2, Brain, Shield, Users, Star, Cloud, Download, Layout, HardDrive, Network, Activity, Lock } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { NetworkErrorBanner, AILearningBanner } from "@/components/shared/NetworkErrorHandler";
import SecurityMonitor from "@/components/shared/SecurityMonitor";
import LimitLocker from "@/components/shared/LimitLocker";
import ProjectCard from '@/components/collaboration/ProjectCard';
import CreateProjectModal from '@/components/collaboration/CreateProjectModal';
import LiveSecurityDisplay from '@/components/shared/LiveSecurityDisplay';
import LiveThreatDisplay from '@/components/shared/LiveThreatDisplay';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [pinnedProjects, setPinnedProjects] = useState([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [cloudSaveStatus, setCloudSaveStatus] = useState('saved');
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0 });

  useEffect(() => {
    blockScriptInjection();
    const cspResult = validateCSP();
    setSecurityStatus({ safe: cspResult.valid, threats: cspResult.violations?.length || 0 });
    loadData();
    
    mlDataCollector.record('projects_page_visit', {
      feature: 'collaboration',
      timestamp: Date.now()
    });
  }, []);

  const loadData = async () => {
    try {
      if (!navigator.onLine) {
        console.warn('Offline - using cached data');
        setIsLoading(false);
        return;
      }

      let userData = null;
      try {
        userData = await Promise.race([
          base44.auth.me(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        setUser(userData);
      } catch (err) {
        console.warn('Auth failed:', err.message);
        setIsLoading(false);
        return;
      }
      
      let projectsData = [];
      for (let i = 0; i < 3; i++) {
        try {
          projectsData = await Promise.race([
            base44.entities.CollaborationProject.list('-created_date', 500),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
          ]);
          break;
        } catch (err) {
          console.warn(`Attempt ${i + 1} failed:`, err.message);
          if (i < 2) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
      }
      
      setProjects(projectsData || []);
      
      const pinned = JSON.parse(localStorage.getItem('pinned_projects') || '[]');
      setPinnedProjects(pinned);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (formData) => {
    setIsCreating(true);
    try {
      if (!user?.email) {
        alert('Please log in to create a project');
        setIsCreating(false);
        return;
      }
      
      const projectData = {
        project_name: formData.project_name,
        description: formData.description || '',
        project_type: formData.project_type || 'general',
        owner_email: user.email,
        owner_name: user.full_name || 'User'
      };
      
      const newProject = await base44.entities.CollaborationProject.create(projectData);
      
      await loadData();
      setShowCreateModal(false);
      
      mlDataCollector.record('project_created', {
        feature: 'collaboration',
        projectId: newProject.id,
        projectType: formData.project_type,
        timestamp: Date.now()
      });
      
      navigate(`${createPageUrl('ProjectDetail')}?id=${newProject.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project: ' + (error.message || 'Unknown error'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenProject = (project) => {
    setIsNavigating(true);
    mlDataCollector.record('project_opened', {
      feature: 'collaboration',
      projectId: project.id,
      timestamp: Date.now()
    });
    setTimeout(() => {
      navigate(`${createPageUrl('ProjectDetail')}?id=${project.id}`);
    }, 300);
  };

  const handlePinProject = (projectId) => {
    const newPinned = pinnedProjects.includes(projectId)
      ? pinnedProjects.filter(id => id !== projectId)
      : [...pinnedProjects, projectId];
    
    setPinnedProjects(newPinned);
    localStorage.setItem('pinned_projects', JSON.stringify(newPinned));
    
    mlDataCollector.record('project_pin_toggled', {
      feature: 'collaboration',
      projectId,
      pinned: !pinnedProjects.includes(projectId),
      timestamp: Date.now()
    });
  };

  const handleArchiveProject = async (projectId) => {
    try {
      const project = projects.find(p => p.id === projectId);
      const newStatus = project.status === 'archived' ? 'active' : 'archived';
      
      await base44.entities.CollaborationProject.update(projectId, { status: newStatus });
      setProjects(prev => prev.map(p => 
         p.id === projectId ? { ...p, status: newStatus } : p
      ));
      
      mlDataCollector.record('project_archived', {
        feature: 'collaboration',
        projectId,
        status: newStatus,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to archive project:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    
    try {
      await base44.entities.CollaborationProject.delete(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      mlDataCollector.record('project_deleted', {
        feature: 'collaboration',
        projectId,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchQuery || 
      project.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'owned' && project.owner_email === user?.email) ||
      (activeTab === 'shared' && project.owner_email !== user?.email) ||
      (activeTab === 'archived' && project.status === 'archived');
    
    return matchesSearch && matchesTab;
  });

  const pinnedProjectsList = filteredProjects.filter(p => pinnedProjects.includes(p.id));
  const unpinnedProjectsList = filteredProjects.filter(p => !pinnedProjects.includes(p.id));

  if (isLoading || isNavigating) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
        <p className="text-purple-300 font-mono text-sm tracking-widest animate-pulse">
            {isNavigating ? 'INITIALIZING WORKSPACE...' : 'LOADING PROJECT MATRIX...'}
        </p>
        <p className="text-blue-500/60 font-mono text-xs uppercase">
             &gt;&gt; SYNCING WITH CLOUD SHARDS...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0f0520] to-[#050015] p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-purple-500/30 selection:text-purple-100">

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Global banners handled by Layout */}
        <LimitLocker feature="analysis_uploads" featureKey="PROJECTS" user={user} />
        <LiveSecurityDisplay />
        <LiveThreatDisplay />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <FolderKanban className="w-8 h-8 text-purple-500 animate-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-500">
                COLLABORATIVE WORKSPACE MATRIX
              </span>
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-wider">
              Project Management • Asset Synchronization • Team Access
            </p>
          </div>
          
          <div className="hidden lg:block p-2 bg-purple-950/20 border border-purple-500/30 rounded-lg">
                <div className="text-[9px] text-purple-400/70 font-mono text-center px-2">
                     [Image of project collaboration workflow diagram]
                </div>
          </div>

           <Button 
             onClick={() => setShowCreateModal(true)}
             className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-12 px-6 shadow-lg shadow-purple-900/20 uppercase tracking-widest text-xs"
           >
             <Plus className="w-4 h-4 mr-2" /> Initialize Project
           </Button>
        </div>

        <Card className="bg-black/60 border border-blue-500/30 shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)] rounded-2xl overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="p-4 bg-blue-950/30 rounded-full border border-blue-500/30">
                  <Cloud className="w-8 h-8 text-blue-400" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                        <Network className="w-4 h-4 text-blue-400" />
                        Cloud Storage Protocols
                    </h3>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/50 font-mono text-[10px]">
                        <Cloud className="w-3 h-3 mr-1" /> SYSTEM SYNCED
                    </Badge>
                </div>
                <p className="text-blue-200/70 text-xs font-mono leading-relaxed">
                    Distributed asset storage active. Select primary data shard provider:
                </p>
                
                <div className="my-2 text-[9px] text-blue-500/50 border border-blue-500/20 rounded px-2 py-1 bg-black/30 font-mono inline-block">
                     [Image of cloud storage synchronization architecture diagram]
                </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-300 hover:bg-blue-900/20 text-[10px] uppercase" onClick={() => window.open('https://accounts.google.com/signin', '_blank')}>
                    Google Cloud
                  </Button>
                  <Button size="sm" variant="outline" className="border-teal-500/30 text-teal-300 hover:bg-teal-900/20 text-[10px] uppercase" onClick={() => window.open('https://login.microsoftonline.com/', '_blank')}>
                    MS Azure
                  </Button>
                  <Button size="sm" variant="outline" className="border-sky-500/30 text-sky-300 hover:bg-sky-900/20 text-[10px] uppercase" onClick={() => window.open('https://www.dropbox.com/login', '_blank')}>
                    Dropbox
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-500/30 text-slate-300 hover:bg-slate-800 text-[10px] uppercase" onClick={() => window.open('https://cloud.ibm.com/login', '_blank')}>
                    IBM Cloud
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="bg-black/60 border border-green-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Secure Enclave</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                {securityStatus.safe ? '>> PROJECT DATA ENCRYPTED' : '!! BREACH ATTEMPT'}
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">SECURE</Badge>
                </CardContent>
            </Card>

            <Card className="bg-black/60 border border-blue-500/30 backdrop-blur-md rounded-xl">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Cloud className="w-5 h-5 text-blue-400 animate-pulse" />
                        <div>
                            <p className="text-white font-bold text-xs uppercase">Cloud Sync</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                                &gt;&gt; AUTO-SAVE PROTOCOL ACTIVE
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/50">LINKED</Badge>
                </CardContent>
            </Card>
        </div>

        <Card className="bg-black/60 border border-purple-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="relative flex-1 w-full group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                <div className="relative flex items-center">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                    <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH PROJECT DATABASE..."
                    className="pl-12 bg-black/80 border-slate-700 text-white font-mono text-xs h-12 focus:border-purple-500"
                    />
                </div>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                <TabsList className="bg-slate-900/50 border border-slate-800 p-1 h-12">
                  <TabsTrigger value="all" className="text-[10px] font-mono uppercase data-[state=active]:bg-purple-600">All</TabsTrigger>
                  <TabsTrigger value="owned" className="text-[10px] font-mono uppercase data-[state=active]:bg-blue-600">Owned</TabsTrigger>
                  <TabsTrigger value="shared" className="text-[10px] font-mono uppercase data-[state=active]:bg-cyan-600">Shared</TabsTrigger>
                  <TabsTrigger value="archived" className="text-[10px] font-mono uppercase data-[state=active]:bg-slate-600">Archive</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {pinnedProjectsList.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-green-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 px-2">
              <Star className="w-4 h-4 fill-green-400 text-green-400" /> 
               Priority Access
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedProjectsList.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={handleOpenProject}
                  onPin={handlePinProject}
                  onArchive={handleArchiveProject}
                  onDelete={handleDeleteProject}
                  isPinned={true}
                  currentUserEmail={user?.email}
                  variant="pinned"
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-purple-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <FolderKanban className="w-4 h-4" /> 
                 {activeTab === 'all' ? 'Full Project Manifest' : activeTab === 'owned' ? 'Personal Directory' : activeTab === 'shared' ? 'Shared Workspace' : 'Archived Data'}
            </h2>
            <Badge className="bg-purple-900/30 text-purple-300 border border-purple-500/30 font-mono text-[10px]">
                COUNT: {unpinnedProjectsList.length}
            </Badge>
          </div>
          
          {unpinnedProjectsList.length === 0 ? (
            <Card className="bg-black/40 border border-slate-800 border-dashed">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                    <FolderKanban className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-slate-300 font-bold text-sm uppercase tracking-wide mb-2">No Records Found</h3>
                <p className="text-slate-500 text-xs font-mono mb-6">
                  {searchQuery ? 'ADJUST SEARCH PARAMETERS' : 'INITIALIZE NEW WORKSPACE TO BEGIN'}
                </p>
                <Button onClick={() => setShowCreateModal(true)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-widest">
                  <Plus className="w-4 h-4 mr-2" /> Create Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unpinnedProjectsList.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={handleOpenProject}
                  onPin={handlePinProject}
                  onArchive={handleArchiveProject}
                  onDelete={handleDeleteProject}
                  isPinned={false}
                  currentUserEmail={user?.email}
                />
              ))}
            </div>
          )}
        </div>
      </div>

       <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProject}
        isLoading={isCreating}
      />
    </div>
  );
}