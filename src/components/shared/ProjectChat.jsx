import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Brain, Shield } from "lucide-react";
import moment from 'moment';

export default function ProjectChat({ messages = [], onSendMessage, currentUser, members = [] }) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    onSendMessage({
      id: `msg_${Date.now()}`,
      author_email: currentUser?.email,
      author_name: currentUser?.full_name || 'User',
      content: newMessage.trim(),
      timestamp: new Date().toISOString()
    });
    
    setNewMessage('');
  };

  const getMemberColor = (email) => {
    const colors = ['purple', 'blue', 'green', 'orange', 'pink', 'cyan'];
    const index = members.findIndex(m => m.email === email) % colors.length;
    return colors[index] || 'purple';
  };

  return (
    <Card className="bg-slate-900/80 border-slate-700/50 flex flex-col h-[500px]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            Team Chat
          </CardTitle>
          <Badge className="bg-green-500/20 text-green-300">{members.length} online</Badge>
        </div>
        {/* AI & Security */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <Brain className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-cyan-300">AI Learning</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-400" />
            <span className="text-[10px] text-green-300">Encrypted</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-3 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-3 mb-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No messages yet</p>
              <p className="text-slate-500 text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map(msg => {
              const isOwn = msg.author_email === currentUser?.email;
              const color = getMemberColor(msg.author_email);
              
              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${isOwn ? 'bg-purple-600/30' : 'bg-slate-800/60'} rounded-lg p-3`}>
                    {!isOwn && (
                      <p className={`text-xs text-${color}-400 font-medium mb-1`}>
                        {msg.author_name}
                      </p>
                    )}
                    <p className="text-white text-sm">{msg.content}</p>
                    <p className="text-slate-500 text-[10px] mt-1">
                      {moment(msg.timestamp).format('h:mm A')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="bg-slate-800 border-slate-700 text-white"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} className="bg-purple-600 hover:bg-purple-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}