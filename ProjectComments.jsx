import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Reply, CheckCircle, MoreVertical, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import moment from 'moment';

export default function ProjectComments({ comments = [], onAddComment, onResolve, onDelete, currentUser, canComment }) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment({
      id: `comment_${Date.now()}`,
      author_email: currentUser.email,
      author_name: currentUser.full_name,
      content: newComment,
      timestamp: new Date().toISOString(),
      resolved: false,
      replies: []
    });
    setNewComment('');
  };

  const handleReply = (commentId) => {
    if (!replyContent.trim()) return;
    onAddComment({
      parentId: commentId,
      reply: {
        author_email: currentUser.email,
        author_name: currentUser.full_name,
        content: replyContent,
        timestamp: new Date().toISOString()
      }
    });
    setReplyingTo(null);
    setReplyContent('');
  };

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader className="border-b border-slate-700/50">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {canComment && (
          <div className="space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="bg-slate-800 border-slate-700 text-white"
              rows={2}
            />
            <Button 
              onClick={handleSubmit} 
              disabled={!newComment.trim()}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              <Send className="w-4 h-4 mr-2" /> Post Comment
            </Button>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`p-3 rounded-lg ${comment.resolved ? 'bg-slate-800/30' : 'bg-slate-800/60'} border border-slate-700/50`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {comment.author_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{comment.author_name}</p>
                      <p className="text-slate-500 text-xs">{moment(comment.timestamp).fromNow()}</p>
                    </div>
                    {comment.resolved && (
                      <Badge className="bg-green-500/20 text-green-300 text-xs">Resolved</Badge>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="w-3 h-3 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-slate-700">
                      {!comment.resolved && (
                        <DropdownMenuItem onClick={() => onResolve(comment.id)} className="text-green-400">
                          <CheckCircle className="w-4 h-4 mr-2" /> Mark Resolved
                        </DropdownMenuItem>
                      )}
                      {comment.author_email === currentUser.email && (
                        <DropdownMenuItem onClick={() => onDelete(comment.id)} className="text-red-400">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className={`text-sm mb-2 ${comment.resolved ? 'text-slate-500' : 'text-slate-300'}`}>
                  {comment.content}
                </p>

                {comment.replies?.length > 0 && (
                  <div className="ml-4 mt-2 space-y-2 border-l-2 border-slate-700 pl-3">
                    {comment.replies.map((reply, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-purple-400 font-medium">{reply.author_name}</span>
                        <span className="text-slate-500 text-xs ml-2">{moment(reply.timestamp).fromNow()}</span>
                        <p className="text-slate-400">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {canComment && !comment.resolved && (
                  <>
                    {replyingTo === comment.id ? (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className="bg-slate-700 border-slate-600 text-white text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleReply(comment.id)} className="bg-purple-600 hover:bg-purple-700 text-xs">
                            Reply
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)} className="text-xs text-slate-400">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-slate-400 text-xs mt-1"
                      >
                        <Reply className="w-3 h-3 mr-1" /> Reply
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}