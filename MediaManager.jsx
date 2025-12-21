import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, FileVideo, Music, FileText, Download, Trash2, 
  HardDrive, Laptop, Smartphone, Globe, Play, Pause
} from "lucide-react";
import UniversalFileUpload, { getFileCategory } from '@/components/shared/UniversalFileUpload';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';

export default function MediaManager({ user }) {
  const mlDataCollector = useMLDataCollector();
  const [activeTab, setActiveTab] = useState('video');
  const [uploading, setUploading] = useState(false);
  
  // Mock data - in a real app this would come from DB/Storage
  const [mediaFiles, setMediaFiles] = useState({
    video: [
      { id: 'v1', name: 'Music_Video_Final.mp4', size: '450 MB', date: '2024-03-15', type: 'video' },
      { id: 'v2', name: 'Studio_Session_BTS.mov', size: '850 MB', date: '2024-03-10', type: 'video' },
      { id: 'v3', name: 'Live_Concert_Clip.mp4', size: '120 MB', date: '2024-02-28', type: 'video' }
    ],
    audio: [
      { id: 'a1', name: 'New_Single_Master.wav', size: '45 MB', date: '2024-03-14', type: 'audio' },
      { id: 'a2', name: 'Demo_Beat_V3.mp3', size: '8 MB', date: '2024-03-12', type: 'audio' },
      { id: 'a3', name: 'Vocal_Stems.zip', size: '150 MB', date: '2024-03-01', type: 'archive' }
    ],
    lyrics: [
      { id: 'l1', name: 'Album_Lyrics.pdf', size: '2 MB', date: '2024-03-15', type: 'document' },
      { id: 'l2', name: 'Song_Ideas.docx', size: '0.5 MB', date: '2024-03-05', type: 'document' }
    ]
  });

  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const newFiles = { ...mediaFiles };
      
      files.forEach(file => {
        const category = activeTab === 'video' ? 'video' : 
                        activeTab === 'audio' ? 'audio' : 'lyrics';
        
        // For demo, we just add to the list
        // In real app: await base44.integrations.UploadFile({ file });
        const newFile = {
          id: `new_${Date.now()}_${Math.random()}`,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          date: new Date().toISOString().split('T')[0],
          type: getFileCategory(file)
        };
        
        if (!newFiles[category]) newFiles[category] = [];
        newFiles[category] = [newFile, ...newFiles[category]];
        
        mlDataCollector.record('media_uploaded', {
          feature: 'media_manager',
          fileType: newFile.type,
          category: category,
          timestamp: Date.now()
        });
      });
      
      setMediaFiles(newFiles);
      setUploading(false);
    }, 1500);
  };

  const handleDelete = (id, category) => {
    const newFiles = { ...mediaFiles };
    newFiles[category] = newFiles[category].filter(f => f.id !== id);
    setMediaFiles(newFiles);
  };

  const handleDownload = (file) => {
    // In a real app, this would trigger a download of the file URL
    alert(`Downloading ${file.name} to your device...`);
    mlDataCollector.record('media_download', {
      feature: 'media_manager',
      fileName: file.name,
      timestamp: Date.now()
    });
  };

  const handleSyncAll = () => {
    alert("Syncing all content to connected devices (Laptop, Mobile, Tablet)...");
    mlDataCollector.record('media_sync_all', {
      feature: 'media_manager',
      timestamp: Date.now()
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-white font-bold text-lg">Artist Vault</h3>
          <p className="text-slate-400 text-sm">Securely store your official releases and private work not on the internet</p>
        </div>
        <Button onClick={handleSyncAll} className="bg-blue-600 hover:bg-blue-700">
          <Globe className="w-4 h-4 mr-2" /> Sync All Devices
        </Button>
      </div>

      {/* Connected Devices Status */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
            <span className="font-semibold text-white">Active Sync:</span>
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-green-400" /> MacBook Pro
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-green-400" /> iPhone 15
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-green-400" /> Cloud Backup
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-800/80 border border-slate-700 w-full justify-start">
          <TabsTrigger value="video" className="flex-1 md:flex-none data-[state=active]:bg-red-600">
            <FileVideo className="w-4 h-4 mr-2" /> Videos
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex-1 md:flex-none data-[state=active]:bg-purple-600">
            <Music className="w-4 h-4 mr-2" /> Music
          </TabsTrigger>
          <TabsTrigger value="lyrics" className="flex-1 md:flex-none data-[state=active]:bg-amber-600">
            <FileText className="w-4 h-4 mr-2" /> Lyrics & Docs
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {/* Upload Area */}
          <div className="md:col-span-1">
            <Card className="bg-white border-slate-200 h-full">
              <CardHeader>
                <CardTitle className="text-black text-base font-bold">Upload New {activeTab === 'video' ? 'Video' : activeTab === 'audio' ? 'Audio' : 'Document'}</CardTitle>
              </CardHeader>
              <CardContent>
                <UniversalFileUpload
                  onFilesSelect={handleFileUpload}
                  multiple={true}
                  label={`Upload ${activeTab}`}
                  description={`Drag & drop ${activeTab} files here`}
                  accept={activeTab === 'video' ? 'video/*' : activeTab === 'audio' ? 'audio/*' : '.pdf,.doc,.docx,.txt'}
                  maxSizeMB={2000} // 2GB limit for videos
                  disabled={uploading}
                  theme="light"
                />
                <p className="text-xs text-black font-bold mt-4">
                  Files are automatically encrypted and synced to your private cloud vault.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* File List */}
          <div className="md:col-span-2">
            <Card className="bg-slate-900/80 border-slate-700/50 h-full">
              <CardHeader>
                <CardTitle className="text-white text-base">Your Library ({mediaFiles[activeTab]?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {mediaFiles[activeTab]?.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-purple-500/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg ${
                          activeTab === 'video' ? 'bg-red-500/20 text-red-400' :
                          activeTab === 'audio' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {activeTab === 'video' ? <FileVideo className="w-5 h-5" /> :
                           activeTab === 'audio' ? <Music className="w-5 h-5" /> :
                           <FileText className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{file.name}</p>
                          <p className="text-slate-400 text-xs">{file.size} • {file.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleDownload(file)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                          title="Download to Device"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleDelete(file.id, activeTab)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!mediaFiles[activeTab] || mediaFiles[activeTab].length === 0) && (
                    <div className="text-center py-12 text-slate-500">
                      <Upload className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No files uploaded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}