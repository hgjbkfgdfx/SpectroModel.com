import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, FileMusic, Settings, Loader2, Brain, Shield, Plus, Activity, 
  Clock, MessageSquare, FileText, Calendar as CalendarIcon, Video, Monitor, 
  Cloud, Download, Users, Zap, Network, Cpu, Share2, Mic2, Layers, 
  CheckCircle, AlertCircle 
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import ProjectComments from '@/components/collaboration/ProjectComments';
import ProjectTasks from '@/components/collaboration/ProjectTasks';
import TeamMembers from '@/components/collaboration/TeamMembers';
import InviteMemberModal from '@/components/collaboration/InviteMemberModal';
import ProjectJournal from '@/components/collaboration/ProjectJournal';
import ProjectChat from '@/components/collaboration/ProjectChat';
import ProjectCalendar from '@/components/collaboration/ProjectCalendar';
import ProjectFeatures from '@/components/collaboration/ProjectFeatures';
import LiveVideoStream from '@/components/collaboration/LiveVideoStream';
import ScreenShare from '@/components/collaboration/ScreenShare';
import RealTimeCoEditing from '@/components/collaboration/RealTimeCoEditing';
import ProjectAutomation from '@/components/collaboration/ProjectAutomation';
import ProjectAssignments from '@/components/collaboration/ProjectAssignments';
import STEMTools from '@/components/collaboration/STEMTools';
import moment from 'moment';
import ProjectExporter from '@/components/collaboration/ProjectExporter';
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import SecurityMonitor from "@/components/shared/SecurityMonitor";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import LimitLocker from "@/components/shared/LimitLocker";

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  
  const [project, setProject] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0 });

  const projectId = new URLSearchParams(window.location.search).get('id');

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Loading timeout - forcing completion');
        setIsLoading(false);
      }
    }, 6000);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  useEffect(() => {
    try {
      blockScriptInjection();
      const cspResult = validateCSP();
      setSecurityStatus({ safe: cspResult.valid, threats: cspResult.violations?.length || 0 });
    } catch (e) {
      console.warn('Security init error:', e);
    }
    
    if (projectId) {
      loadProject();
    } else {
      setIsLoading(false);
    }
  }, [projectId]);

  const loadProject = async () => {
    setIsLoading(true);
    
    try {
      // Auth - fast timeout
      let userData = null;
      try {
        userData = await Promise.race([
          base44.auth.me(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);
        setUser(userData);
      } catch (e) {
        console.warn('Auth skipped:', e.message);
      }
      
      // Load project - faster timeout
      let projectData = null;
      try {
        const allProjects = await Promise.race([
          base44.entities.CollaborationProject.list('-created_date', 100),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 4000))
        ]);
        projectData = allProjects?.find(p => p.id === projectId);
      } catch (e) {
        console.warn('Project load failed:', e.message);
      }
      
      setProject(projectData || null);
      
      // Load analyses in background (don't block)
      if (projectData?.analysis_ids?.length > 0) {
        base44.entities.MusicAnalysis.list('-created_date', 50)
          .then(allAnalyses => {
            const projectAnalyses = (allAnalyses || []).filter(a => 
              projectData.analysis_ids?.includes(a.id)
            );
            setAnalyses(projectAnalyses);
          })
          .catch(e => console.warn('Analyses load failed:', e.message));
      }
      
      // ML tracking
      if (projectData) {
        mlDataCollector.record('project_detail_view', {
          feature: 'collaboration',
          projectId,
          timestamp: Date.now(),
          aiLearning: true
        });
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isOwner = project?.owner_email === user?.email;
  const userMember = project?.team_members?.find(m => m.email === user?.email);
  const userRole = isOwner ? 'owner' : userMember?.role || 'viewer';
  const canEdit = ['owner', 'admin', 'editor'].includes(userRole);
  const canComment = ['owner', 'admin', 'editor', 'commenter'].includes(userRole);

  const handleInviteMember = async ({ email, role }) => {
    setIsInviting(true);
    try {
      const newMember = {
        email,
        role,
        invited_at: new Date().toISOString(),
        status: 'pending'
      };
      
      const updatedMembers = [...(project.team_members || []), newMember];
      const activityLog = [...(project.activity_log || []), {
        user_email: user.email,
        user_name: user.full_name,
        action: 'invited_member',
        details: `Invited ${email} as ${role}`,
        timestamp: new Date().toISOString()
      }];
      
      await base44.entities.CollaborationProject.update(projectId, {
        team_members: updatedMembers,
        activity_log: activityLog
      });
      
      setProject(prev => ({
        ...prev,
        team_members: updatedMembers,
        activity_log: activityLog
      }));
      
      setShowInviteModal(false);
      
      mlDataCollector.record('member_invited', {
        feature: 'collaboration',
        projectId,
        role,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to invite member:', error);
      alert('Failed to send invite. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateRole = async (email, newRole) => {
    try {
      const updatedMembers = project.team_members.map(m =>
        m.email === email ? { ...m, role: newRole } : m
      );
      
      await base44.entities.CollaborationProject.update(projectId, {
        team_members: updatedMembers
      });
      
      setProject(prev => ({ ...prev, team_members: updatedMembers }));
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleRemoveMember = async (email) => {
    if (!confirm('Remove this member from the project?')) return;
    
    try {
      const updatedMembers = project.team_members.filter(m => m.email !== email);
      
      await base44.entities.CollaborationProject.update(projectId, {
        team_members: updatedMembers
      });
      
      setProject(prev => ({ ...prev, team_members: updatedMembers }));
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleAddComment = async (commentData) => {
    try {
      let updatedComments;
      
      if (commentData.parentId) {
        updatedComments = project.comments.map(c =>
          c.id === commentData.parentId
            ? { ...c, replies: [...(c.replies || []), commentData.reply] }
            : c
        );
      } else {
        updatedComments = [...(project.comments || []), commentData];
      }
      
      await base44.entities.CollaborationProject.update(projectId, {
        comments: updatedComments
      });
      
      setProject(prev => ({ ...prev, comments: updatedComments }));
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleResolveComment = async (commentId) => {
    try {
      const updatedComments = project.comments.map(c =>
        c.id === commentId ? { ...c, resolved: true } : c
      );
      
      await base44.entities.CollaborationProject.update(projectId, {
        comments: updatedComments
      });
      
      setProject(prev => ({ ...prev, comments: updatedComments }));
    } catch (error) {
      console.error('Failed to resolve comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const updatedComments = project.comments.filter(c => c.id !== commentId);
      
      await base44.entities.CollaborationProject.update(projectId, {
        comments: updatedComments
      });
      
      setProject(prev => ({ ...prev, comments: updatedComments }));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      const updatedTasks = [...(project.tasks || []), taskData];
      
      await base44.entities.CollaborationProject.update(projectId, {
        tasks: updatedTasks
      });
      
      setProject(prev => ({ ...prev, tasks: updatedTasks }));
      await logActivity('added_task', `Added task: ${taskData.title || 'Untitled'}`);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const updatedTasks = project.tasks.map(t =>
        t.id === taskId ? { ...t, ...updates } : t
      );
      
      await base44.entities.CollaborationProject.update(projectId, {
        tasks: updatedTasks
      });
      
      setProject(prev => ({ ...prev, tasks: updatedTasks }));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const updatedTasks = project.tasks.filter(t => t.id !== taskId);
      
      await base44.entities.CollaborationProject.update(projectId, {
        tasks: updatedTasks
      });
      
      setProject(prev => ({ ...prev, tasks: updatedTasks }));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Activity log helper
  const logActivity = async (action, details) => {
    try {
      const activityEntry = {
        user_email: user?.email,
        user_name: user?.full_name || 'User',
        action,
        details,
        timestamp: new Date().toISOString()
      };
      const updatedLog = [...(project.activity_log || []), activityEntry];
      await base44.entities.CollaborationProject.update(projectId, { activity_log: updatedLog });
      setProject(prev => ({ ...prev, activity_log: updatedLog }));
    } catch (err) {
      console.warn('Failed to log activity:', err);
    }
  };

  const handleAddJournalEntry = async (entryData) => {
    try {
      const updatedEntries = [...(project.journal_entries || []), entryData];
      await base44.entities.CollaborationProject.update(projectId, { journal_entries: updatedEntries });
      setProject(prev => ({ ...prev, journal_entries: updatedEntries }));
      await logActivity('added_journal_entry', `Added journal entry: ${entryData.title || 'Untitled'}`);
    } catch (error) {
      console.error('Failed to add journal entry:', error);
    }
  };

  const handleUpdateJournalEntry = async (entryId, entryData) => {
    try {
      const updatedEntries = (project.journal_entries || []).map(e => e.id === entryId ? entryData : e);
      await base44.entities.CollaborationProject.update(projectId, { journal_entries: updatedEntries });
      setProject(prev => ({ ...prev, journal_entries: updatedEntries }));
    } catch (error) {
      console.error('Failed to update journal entry:', error);
    }
  };

  const handleDeleteJournalEntry = async (entryId) => {
    try {
      const updatedEntries = (project.journal_entries || []).filter(e => e.id !== entryId);
      await base44.entities.CollaborationProject.update(projectId, { journal_entries: updatedEntries });
      setProject(prev => ({ ...prev, journal_entries: updatedEntries }));
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
    }
  };

  const handleSendMessage = async (messageData) => {
    try {
      const updatedMessages = [...(project.chat_messages || []), messageData];
      await base44.entities.CollaborationProject.update(projectId, { chat_messages: updatedMessages });
      setProject(prev => ({ ...prev, chat_messages: updatedMessages }));
      await logActivity('sent_message', 'Sent a chat message');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleAddCalendarEvent = async (eventData) => {
    try {
      const updatedEvents = [...(project.calendar_events || []), eventData];
      await base44.entities.CollaborationProject.update(projectId, { calendar_events: updatedEvents });
      setProject(prev => ({ ...prev, calendar_events: updatedEvents }));
      await logActivity('added_event', `Added calendar event: ${eventData.title || 'Event'}`);
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  const handleDeleteCalendarEvent = async (eventId) => {
    try {
      const updatedEvents = (project.calendar_events || []).filter(e => e.id !== eventId);
      await base44.entities.CollaborationProject.update(projectId, { calendar_events: updatedEvents });
      setProject(prev => ({ ...prev, calendar_events: updatedEvents }));
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleAddReminder = async (reminderData) => {
    try {
      const updatedReminders = [...(project.reminders || []), reminderData];
      await base44.entities.CollaborationProject.update(projectId, { reminders: updatedReminders });
      setProject(prev => ({ ...prev, reminders: updatedReminders }));
    } catch (error) {
      console.error('Failed to add reminder:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center gap-4 p-4">
        <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-purple-500 animate-spin" />
        <p className="text-purple-300 font-mono text-xs sm:text-sm tracking-widest animate-pulse text-center">LOADING PROJECT...</p>
        <p className="text-slate-500 font-mono text-[10px] mt-2">AI Learning Active</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center p-4 sm:p-8">
        <Card className="bg-red-950/20 border border-red-500/50 max-w-md w-full backdrop-blur-md text-center p-6 sm:p-8">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-red-400 font-black text-lg sm:text-xl uppercase mb-4">Access Insufficient</h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-4 font-mono">You do not have permission to view this project or it does not exist.</p>
            <Button onClick={() => navigate(createPageUrl('Projects'))} className="bg-red-600 hover:bg-red-700 font-mono text-xs uppercase">
                Return to Projects
            </Button>
        </Card>
      </div>
    );
  }

  const allMembers = [
    { email: project.owner_email, name: project.owner_name, role: 'owner' },
    ...(project.team_members || [])
  ];

  return (
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0 p-2 sm:p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-purple-500/30 selection:text-purple-100 overflow-x-hidden">
      
      <style>{`
        * { writing-mode: horizontal-tb !important; text-orientation: mixed !important; }
        h1, h2, h3, h4, h5, h6, p, span, div, button, a { 
          word-break: break-word; 
          overflow-wrap: break-word;
          writing-mode: horizontal-tb !important;
        }
        @media (orientation: landscape) and (max-height: 500px) {
          .landscape-compact { padding: 0.5rem !important; }
        }
      `}</style>
      
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        <NetworkErrorBanner />
        <AILearningBanner />
        <SecurityMonitor />
        <LimitLocker feature="analysis_uploads" featureKey="PROJECTS" user={user} />
        <LiveSecurityDisplay />
        <LiveThreatDisplay />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-6 border-b border-slate-800 pb-4 sm:pb-6">
          <div className="flex items-center gap-2 sm:gap-4 w-full min-w-0">
             <Button 
                variant="ghost" 
                onClick={() => navigate(createPageUrl('Projects'))}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-full transition-all duration-300 shrink-0 h-8 w-8 sm:h-10 sm:w-10 p-0"
            >
                <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            </Button>
            <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white truncate max-w-full">
                        {project.project_name}
                    </h1>
                    <div className="flex gap-1 sm:gap-2 flex-wrap">
                      <Badge className={`font-mono text-[8px] sm:text-[10px] uppercase shrink-0 ${project.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-slate-500/20 text-slate-400 border-slate-500/50'}`}>
                          {project.status || 'active'}
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/50 font-mono text-[8px] sm:text-[10px] uppercase shrink-0">
                          {userRole}
                      </Badge>
                    </div>
                </div>
                <p className="text-slate-400 font-mono text-[10px] sm:text-xs mt-1 sm:mt-2 uppercase tracking-wider truncate max-w-full">
                    {project.description || 'SECURE WORKSPACE'}
                </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
             <Card className="bg-black/60 border border-green-500/30 backdrop-blur-md rounded-lg sm:rounded-xl">
                <CardContent className="p-2 sm:p-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-white font-bold text-[10px] sm:text-xs uppercase truncate">Secure</p>
                            <p className="text-[8px] sm:text-[10px] text-slate-400 font-mono truncate">
                                {securityStatus.safe ? 'ENCRYPTED' : 'ALERT'}
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/50 text-[8px] sm:text-[10px] shrink-0">OK</Badge>
                </CardContent>
            </Card>

            <Card className="bg-black/60 border border-blue-500/30 backdrop-blur-md rounded-lg sm:rounded-xl">
                <CardContent className="p-2 sm:p-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 animate-pulse shrink-0" />
                        <div className="min-w-0">
                            <p className="text-white font-bold text-[10px] sm:text-xs uppercase truncate">Sync</p>
                            <p className="text-[8px] sm:text-[10px] text-slate-400 font-mono truncate">
                                AUTO-SAVE
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/50 text-[8px] sm:text-[10px] shrink-0">ON</Badge>
                </CardContent>
            </Card>
        </div>

        <ProjectFeatures features={project.features} projectType={project.project_type} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="bg-slate-900/80 border border-slate-800 p-1 rounded-lg sm:rounded-xl flex flex-wrap h-auto w-full justify-start gap-1 sm:gap-2 overflow-x-auto">
             {[
                { id: 'overview', icon: Activity, label: 'Overview', shortLabel: 'View' },
                { id: 'analyses', icon: FileMusic, label: `Data (${analyses.length})`, shortLabel: 'Data' },
                { id: 'tasks', icon: CheckCircle, label: `Tasks`, shortLabel: 'Tasks' },
                { id: 'team', icon: Users, label: `Team`, shortLabel: 'Team' },
                { id: 'chat', icon: MessageSquare, label: 'Chat', shortLabel: 'Chat' },
                { id: 'video', icon: Video, label: 'Video', shortLabel: 'Vid' },
                { id: 'coediting', icon: FileText, label: 'Editor', shortLabel: 'Edit' },
                { id: 'stem', icon: Layers, label: 'STEM', shortLabel: 'STEM' }
             ].map(tab => (
                <TabsTrigger 
                    key={tab.id} 
                    value={tab.id} 
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-mono text-[8px] sm:text-[10px] uppercase tracking-wider flex items-center gap-1 sm:gap-2 py-1.5 sm:py-2 px-2 sm:px-4 min-w-0 shrink-0"
                >
                    <tab.icon className="w-3 h-3 shrink-0" /> 
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                </TabsTrigger>
             ))}
          </TabsList>

          <div className="relative min-h-[500px]">
              <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 absolute inset-0">
                <div className="grid lg:grid-cols-3 gap-6 h-full">
                    <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2 max-h-[800px]">
                        
                         <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                             <div className="text-[10px] text-purple-400/70 border border-purple-500/30 rounded px-2 py-1 bg-black/30 font-mono">
                                [Image of project management lifecycle diagram]
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono ml-2 uppercase">Workflow Status</span>
                        </div>

                        <ProjectComments
                            comments={project.comments || []}
                            onAddComment={handleAddComment}
                            onResolve={handleResolveComment}
                            onDelete={handleDeleteComment}
                            currentUser={user}
                            canComment={canComment}
                        />
                    </div>
                    <div className="space-y-6 h-full flex flex-col">
                        <ProjectExporter project={project} analyses={analyses} />
                        <div className="flex-1 overflow-hidden">
                            <ProjectTasks
                                tasks={(project.tasks || []).slice(0, 5)}
                                members={allMembers}
                                onAddTask={handleAddTask}
                                onUpdateTask={handleUpdateTask}
                                onDeleteTask={handleDeleteTask}
                                canEdit={canEdit}
                                compact={true}
                            />
                        </div>
                    </div>
                </div>
              </TabsContent>

              <TabsContent value="analyses" className="animate-in fade-in absolute inset-0">
                <Card className="bg-black/60 border border-purple-500/30 backdrop-blur-xl h-full">
                    <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
                                <FileMusic className="w-5 h-5 text-purple-400" />
                                Spectral Data Archive
                            </CardTitle>
                            {canEdit && (
                                <Button size="sm" onClick={() => navigate(createPageUrl('Analyze'))} className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs uppercase h-8">
                                    <Plus className="w-3 h-3 mr-1" /> Add Vector
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 overflow-y-auto max-h-[600px]">
                        {analyses.length === 0 ? (
                            <div className="text-center p-12 text-slate-500 font-mono text-xs uppercase">
                                &gt;&gt; NO AUDIO DATA INDEXED
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {analyses.map(analysis => (
                                    <div key={analysis.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-between group cursor-pointer" onClick={() => navigate(`${createPageUrl('AnalysisResult')}?id=${analysis.id}`)}>
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-purple-900/20 rounded border border-purple-500/20">
                                                <FileMusic className="w-4 h-4 text-purple-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-sm uppercase group-hover:text-purple-300 transition-colors">{analysis.track_name}</h4>
                                                <p className="text-slate-400 text-[10px] font-mono uppercase">{analysis.artist_name}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono text-xs">
                                            SCORE: {analysis.hit_score || 0}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="team" className="animate-in fade-in absolute inset-0">
                 <div className="mb-4 p-3 bg-green-950/20 border border-green-500/20 rounded-lg flex items-center justify-center">
                     <div className="text-[10px] text-green-400/70 border border-green-500/30 rounded px-2 py-1 bg-black/30 font-mono">
                        [Image of collaboration network graph]
                    </div>
                </div>
                <TeamMembers
                    owner={{ email: project.owner_email, name: project.owner_name }}
                    members={project.team_members || []}
                    onInvite={() => setShowInviteModal(true)}
                    onUpdateRole={handleUpdateRole}
                    onRemove={handleRemoveMember}
                    currentUserEmail={user?.email}
                    isOwner={isOwner}
                    isAdmin={userRole === 'admin'}
                />
              </TabsContent>
              
              <TabsContent value="video" className="animate-in fade-in absolute inset-0">
                 <div className="mb-4 p-3 bg-blue-950/20 border border-blue-500/20 rounded-lg flex items-center justify-center">
                     <div className="text-[10px] text-blue-400/70 border border-blue-500/30 rounded px-2 py-1 bg-black/30 font-mono">
                        [Image of real-time streaming architecture diagram]
                    </div>
                </div>
                <LiveVideoStream
                    projectId={projectId}
                    currentUser={user}
                    members={allMembers}
                    canStream={canEdit}
                />
              </TabsContent>
              
              <TabsContent value="automation" className="animate-in fade-in absolute inset-0">
                 <div className="mb-4 p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-lg flex items-center justify-center">
                     <div className="text-[10px] text-cyan-400/70 border border-cyan-500/30 rounded px-2 py-1 bg-black/30 font-mono">
                        [Image of project automation workflow chart]
                    </div>
                </div>
                <ProjectAutomation
                    automations={project.automations || []}
                    onAdd={async (auto) => {
                        const updated = [...(project.automations || []), auto];
                        await base44.entities.CollaborationProject.update(projectId, { automations: updated });
                        setProject(prev => ({ ...prev, automations: updated }));
                    }}
                    onDelete={async (id) => {
                        const updated = (project.automations || []).filter(a => a.id !== id);
                        await base44.entities.CollaborationProject.update(projectId, { automations: updated });
                        setProject(prev => ({ ...prev, automations: updated }));
                    }}
                    onToggle={async (id) => {
                        const updated = (project.automations || []).map(a => a.id === id ? { ...a, enabled: !a.enabled } : a);
                        await base44.entities.CollaborationProject.update(projectId, { automations: updated });
                        setProject(prev => ({ ...prev, automations: updated }));
                    }}
                    canEdit={canEdit}
                />
              </TabsContent>

              <TabsContent value="journal" className="absolute inset-0"><ProjectJournal entries={project.journal_entries || []} onAddEntry={handleAddJournalEntry} onUpdateEntry={handleUpdateJournalEntry} onDeleteEntry={handleDeleteJournalEntry} canEdit={canEdit} /></TabsContent>
              <TabsContent value="chat" className="absolute inset-0"><ProjectChat messages={project.chat_messages || []} onSendMessage={handleSendMessage} currentUser={user} members={allMembers} /></TabsContent>
              <TabsContent value="calendar" className="absolute inset-0"><ProjectCalendar events={project.calendar_events || []} reminders={project.reminders || []} onAddEvent={handleAddCalendarEvent} onDeleteEvent={handleDeleteCalendarEvent} onAddReminder={handleAddReminder} canEdit={canEdit} /></TabsContent>
              <TabsContent value="tasks" className="absolute inset-0"><ProjectTasks tasks={project.tasks || []} members={allMembers} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} canEdit={canEdit} /></TabsContent>
              <TabsContent value="screen" className="absolute inset-0"><ScreenShare currentUser={user} members={allMembers} canShare={canEdit} /></TabsContent>
              <TabsContent value="coediting" className="absolute inset-0"><RealTimeCoEditing document={project.shared_document || ''} onSave={async (content) => { await base44.entities.CollaborationProject.update(projectId, { shared_document: content }); setProject(prev => ({ ...prev, shared_document: content })); }} currentUser={user} members={allMembers} canEdit={canEdit} /></TabsContent>
              <TabsContent value="assignments" className="absolute inset-0"><ProjectAssignments assignments={project.assignments || []} members={allMembers} onAdd={async (assignment) => { const updated = [...(project.assignments || []), assignment]; await base44.entities.CollaborationProject.update(projectId, { assignments: updated }); setProject(prev => ({ ...prev, assignments: updated })); }} onUpdate={async (id, assignment) => { const updated = (project.assignments || []).map(a => a.id === id ? assignment : a); await base44.entities.CollaborationProject.update(projectId, { assignments: updated }); setProject(prev => ({ ...prev, assignments: updated })); }} onDelete={async (id) => { const updated = (project.assignments || []).filter(a => a.id !== id); await base44.entities.CollaborationProject.update(projectId, { assignments: updated }); setProject(prev => ({ ...prev, assignments: updated })); }} canEdit={canEdit} /></TabsContent>
              <TabsContent value="stem" className="absolute inset-0"><STEMTools projectType={project.project_type} canEdit={canEdit} /></TabsContent>
          </div>
        </Tabs>
      </div>

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteMember}
        isLoading={isInviting}
        projectName={project.project_name}
      />
    </div>
  );
}