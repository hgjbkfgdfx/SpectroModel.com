import React from 'react';
import { Card, CardContent, Badge, Button } from '@/components/ui/index';
import { FolderKanban, Users, Clock, Pin, MoreHorizontal } from 'lucide-react';

export default function ProjectCard({ project, onOpen, onPin, isPinned, currentUserEmail }) {
  return (
    <Card 
      className="group hover:border-cyber-purple/50 cursor-pointer transition-all duration-300"
      onClick={onOpen}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded bg-cyber-purple/10 border border-cyber-purple/20 group-hover:bg-cyber-purple/20 transition-colors">
            <FolderKanban className="w-5 h-5 text-cyber-purple" />
          </div>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
             <Button size="sm" variant="ghost" onClick={() => onPin(project.id)} className={isPinned ? "text-cyber-cyan" : "text-slate-600"}>
               <Pin className="w-4 h-4" />
             </Button>
          </div>
        </div>
        
        <h3 className="text-white font-bold text-lg mb-1 truncate">{project.title}</h3>
        <p className="text-slate-400 text-xs mb-4 line-clamp-2">{project.description}</p>
        
        <div className="flex items-center gap-2 mb-4">
          {project.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px] py-0 h-5 border-white/10 text-slate-400">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-4 border-t border-white/5">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{project.members} Members</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{project.last_updated}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}