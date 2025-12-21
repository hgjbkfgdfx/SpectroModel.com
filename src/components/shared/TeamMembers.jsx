import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserPlus, Crown, Shield, Edit, MessageSquare, Eye, X, Mail } from "lucide-react";
import moment from 'moment';

const roleConfig = {
  owner: { icon: Crown, label: 'Owner', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  admin: { icon: Shield, label: 'Admin', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  editor: { icon: Edit, label: 'Editor', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  commenter: { icon: MessageSquare, label: 'Commenter', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  viewer: { icon: Eye, label: 'Viewer', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' }
};

export default function TeamMembers({ 
  owner, 
  members = [], 
  onInvite, 
  onUpdateRole, 
  onRemove, 
  currentUserEmail,
  isOwner,
  isAdmin 
}) {
  const canManageMembers = isOwner || isAdmin;

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader className="border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-purple-400" />
            Team ({members.length + 1})
          </CardTitle>
          {canManageMembers && (
            <Button size="sm" onClick={onInvite} className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="w-4 h-4 mr-1" /> Invite
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {/* Owner */}
        <div className="p-3 bg-slate-800/60 rounded-lg border border-yellow-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold">
            {owner?.name?.[0] || 'O'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{owner?.name || owner?.email}</p>
            <p className="text-slate-500 text-xs truncate">{owner?.email}</p>
          </div>
          <Badge className={roleConfig.owner.color}>
            <Crown className="w-3 h-3 mr-1" /> Owner
          </Badge>
        </div>

        {/* Members */}
        {members.map((member) => {
          const RoleIcon = roleConfig[member.role]?.icon || Eye;
          const isSelf = member.email === currentUserEmail;
          
          return (
            <div 
              key={member.email} 
              className={`p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 flex items-center gap-3 ${
                member.status === 'pending' ? 'opacity-70' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                {member.name?.[0] || member.email?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium truncate">{member.name || member.email}</p>
                  {member.status === 'pending' && (
                    <Badge className="bg-orange-500/20 text-orange-300 text-xs">
                      <Mail className="w-3 h-3 mr-1" /> Pending
                    </Badge>
                  )}
                </div>
                <p className="text-slate-500 text-xs truncate">{member.email}</p>
                {member.joined_at && (
                  <p className="text-slate-600 text-xs">Joined {moment(member.joined_at).fromNow()}</p>
                )}
              </div>
              
              {canManageMembers && !isSelf ? (
                <div className="flex items-center gap-2">
                  <Select 
                    value={member.role} 
                    onValueChange={(value) => onUpdateRole(member.email, value)}
                  >
                    <SelectTrigger className="w-28 h-8 bg-slate-700 border-slate-600 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {Object.entries(roleConfig).filter(([key]) => key !== 'owner').map(([key, { label }]) => (
                        <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => onRemove(member.email)}
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Badge className={roleConfig[member.role]?.color || ''}>
                  <RoleIcon className="w-3 h-3 mr-1" />
                  {roleConfig[member.role]?.label || member.role}
                </Badge>
              )}
            </div>
          );
        })}

        {members.length === 0 && (
          <p className="text-slate-500 text-center py-4 text-sm">
            No team members yet. Invite someone to collaborate!
          </p>
        )}
      </CardContent>
    </Card>
  );
}