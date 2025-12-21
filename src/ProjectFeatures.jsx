import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, Monitor, Calendar, Zap, ClipboardList, Bell, MessageSquare, Edit, FileText,
  Brain, Shield
} from "lucide-react";

const FEATURE_CONFIG = {
  journal: { icon: FileText, label: 'Journal/Lyrics', color: 'purple' },
  streaming_video: { icon: Video, label: 'Streaming Video', color: 'red' },
  screen_share: { icon: Monitor, label: 'Screen Share', color: 'blue' },
  calendar: { icon: Calendar, label: 'Calendar', color: 'green' },
  automation: { icon: Zap, label: 'Automation', color: 'yellow' },
  assignments: { icon: ClipboardList, label: 'Assignments', color: 'orange' },
  reminders: { icon: Bell, label: 'Reminders', color: 'pink' },
  chat: { icon: MessageSquare, label: 'Team Chat', color: 'cyan' },
  co_editing: { icon: Edit, label: 'Co-editing', color: 'indigo' }
};

export default function ProjectFeatures({ features, projectType }) {
  // Safe handling of null/undefined features
  const safeFeatures = features || {};
  const enabledFeatures = Object.entries(safeFeatures).filter(([_, enabled]) => enabled);

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium">Project Features</h4>
          <div className="flex items-center gap-2">
            <Brain className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-cyan-300">AI Active</span>
            <Shield className="w-3 h-3 text-green-400 ml-2" />
            <span className="text-[10px] text-green-300">Secure</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {enabledFeatures.map(([key]) => {
            const config = FEATURE_CONFIG[key];
            if (!config) return null;
            const Icon = config.icon;
            
            return (
              <Badge 
                key={key} 
                className={`bg-${config.color}-500/20 text-${config.color}-300 border border-${config.color}-500/30 flex items-center gap-1`}
              >
                <Icon className="w-3 h-3" />
                {config.label}
              </Badge>
            );
          })}
          
          {projectType && (
            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {projectType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          )}
        </div>

        {enabledFeatures.length === 0 && (
          <p className="text-slate-500 text-sm">No special features enabled</p>
        )}
      </CardContent>
    </Card>
  );
}