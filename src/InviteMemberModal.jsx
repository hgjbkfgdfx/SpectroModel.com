import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, Shield, Eye, Edit, MessageSquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const roleDescriptions = {
  admin: { icon: Shield, label: 'Admin', desc: 'Can manage members, settings, and all content' },
  editor: { icon: Edit, label: 'Editor', desc: 'Can add, edit, and delete analyses' },
  commenter: { icon: MessageSquare, label: 'Commenter', desc: 'Can view and add comments' },
  viewer: { icon: Eye, label: 'Viewer', desc: 'Can only view content' }
};

export default function InviteMemberModal({ isOpen, onClose, onInvite, isLoading, projectName }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    onInvite({ email: email.trim(), role });
    setEmail('');
    setRole('viewer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-400" />
            Invite to {projectName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="bg-red-900/30 border-red-500/50">
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label className="text-slate-300">Email Address *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="bg-slate-800 border-slate-700 text-white mt-1"
              required
            />
          </div>

          <div>
            <Label className="text-slate-300">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {Object.entries(roleDescriptions).map(([key, { icon: Icon, label, desc }]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              {roleDescriptions[role]?.desc}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Send Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}