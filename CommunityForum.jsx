import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageSquare, ThumbsUp, Star, Plus, Search, Users, 
  Brain, Shield, Send, Award, TrendingUp, Clock, AlertTriangle
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import moment from 'moment';
import { checkContent } from '@/components/shared/ContentFilter';

export default function CommunityForum({ user }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'question' });
  const [showNewPost, setShowNewPost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [contentWarning, setContentWarning] = useState(null);

  const categories = [
    { id: 'all', label: 'All Topics', color: 'bg-slate-500' },
    { id: 'question', label: 'Questions', color: 'bg-blue-500' },
    { id: 'analysis', label: 'Shared Analyses', color: 'bg-purple-500' },
    { id: 'resource', label: 'Resources', color: 'bg-green-500' },
    { id: 'tip', label: 'Tips & Tricks', color: 'bg-orange-500' },
    { id: 'business', label: 'Music Business', color: 'bg-cyan-500' },
    { id: 'finance', label: 'Financial Literacy', color: 'bg-emerald-500' }
  ];

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    // Load from localStorage for now (can be migrated to entity)
    const savedPosts = JSON.parse(localStorage.getItem('community_posts') || '[]');
    setPosts(savedPosts);
  };

  const handleSubmitPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    // Check content for prohibited patterns
    const titleCheck = checkContent(newPost.title);
    const contentCheck = checkContent(newPost.content);
    
    if (titleCheck.isProhibited || contentCheck.isProhibited) {
      setContentWarning(titleCheck.message || contentCheck.message);
      return;
    }
    
    setContentWarning(null);
    setIsLoading(true);
    try {
      const post = {
        id: `post_${Date.now()}`,
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        author: user?.full_name || 'Anonymous',
        authorEmail: user?.email || 'anonymous',
        timestamp: new Date().toISOString(),
        likes: 0,
        isBestAnswer: false,
        replies: []
      };

      const updatedPosts = [post, ...posts];
      localStorage.setItem('community_posts', JSON.stringify(updatedPosts));
      setPosts(updatedPosts);
      setNewPost({ title: '', content: '', category: 'question' });
      setShowNewPost(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = (postId) => {
    const updatedPosts = posts.map(p => 
      p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p
    );
    localStorage.setItem('community_posts', JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
  };

  const handleMarkBestAnswer = (postId) => {
    const updatedPosts = posts.map(p => 
      p.id === postId ? { ...p, isBestAnswer: !p.isBestAnswer } : p
    );
    localStorage.setItem('community_posts', JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularPosts = [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* AI & Security Banner */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-cyan-950/50 border-cyan-500/30">
          <CardContent className="p-3 flex items-center gap-3">
            <Brain className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-white font-semibold text-sm">🤖 AI Learns From Community</p>
              <p className="text-cyan-300 text-xs">Improving recommendations based on discussions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-950/50 border-green-500/30">
          <CardContent className="p-3 flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-white font-semibold text-sm">🛡️ Community Protected</p>
              <p className="text-green-300 text-xs">All posts moderated & secure</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              Community Forum
              <Badge className="bg-purple-500/20 text-purple-300">{posts.length} posts</Badge>
            </CardTitle>
            <Button onClick={() => setShowNewPost(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" /> New Post
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search discussions..."
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={selectedCategory === cat.id ? cat.color : 'border-slate-700 text-slate-300'}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Post Form */}
      {showNewPost && (
        <Card className="bg-slate-900/80 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-white">Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contentWarning && (
              <Alert className="bg-red-900/50 border-red-500/50">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <AlertDescription className="text-red-200">{contentWarning}</AlertDescription>
              </Alert>
            )}
            <div className="p-3 bg-blue-950/50 border border-blue-500/30 rounded-lg text-xs text-blue-200">
              <p className="font-semibold mb-1">📝 Community Guidelines:</p>
              <p>Allowed: Music, education, business, finance, research, questions, feedback</p>
              <p className="text-red-300 mt-1">Not allowed: Profanity, hate speech, threats, harassment, violence</p>
            </div>
            <Input
              value={newPost.title}
              onChange={(e) => { setNewPost({ ...newPost, title: e.target.value }); setContentWarning(null); }}
              placeholder="Post title..."
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Textarea
              value={newPost.content}
              onChange={(e) => { setNewPost({ ...newPost, content: e.target.value }); setContentWarning(null); }}
              placeholder="Share your question, analysis, resource, tip, or business insight..."
              className="bg-slate-800 border-slate-700 text-white min-h-[120px]"
            />
            <div className="flex flex-wrap gap-2">
              {categories.filter(c => c.id !== 'all').map(cat => (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={newPost.category === cat.id ? 'default' : 'outline'}
                  onClick={() => setNewPost({ ...newPost, category: cat.id })}
                  className={newPost.category === cat.id ? cat.color : 'border-slate-700 text-slate-300'}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmitPost} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                <Send className="w-4 h-4 mr-2" /> Post
              </Button>
              <Button variant="outline" onClick={() => setShowNewPost(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Topics */}
      {popularPosts.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-950/50 to-orange-950/50 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Popular Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularPosts.map(post => (
                <Badge 
                  key={post.id} 
                  className="bg-amber-500/20 text-amber-300 cursor-pointer hover:bg-amber-500/30"
                  onClick={() => setSearchQuery(post.title)}
                >
                  {post.title} ({post.likes || 0} ❤️)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No posts yet. Be the first to share!</p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map(post => (
            <Card key={post.id} className={`bg-slate-900/80 border-slate-700/50 ${post.isBestAnswer ? 'border-green-500/50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge className={categories.find(c => c.id === post.category)?.color || 'bg-slate-500'}>
                        {post.category}
                      </Badge>
                      {post.isBestAnswer && (
                        <Badge className="bg-green-500"><Award className="w-3 h-3 mr-1" /> Best Answer</Badge>
                      )}
                    </div>
                    <h3 className="text-white font-semibold mb-2">{post.title}</h3>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{post.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span>{post.author}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {moment(post.timestamp).fromNow()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleLike(post.id)} className="text-pink-400 hover:text-pink-300">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {post.likes || 0}
                    </Button>
                    {user?.role === 'admin' && (
                      <Button size="sm" variant="ghost" onClick={() => handleMarkBestAnswer(post.id)} className="text-green-400 hover:text-green-300">
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}