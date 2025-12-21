import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  User, Music, Globe, Instagram, Twitter, Youtube, 
  Facebook, Link2, Plus, X, Brain, Shield, Save,
  Disc, FileText, ShoppingBag, Mic, DollarSign, ExternalLink
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMLDataCollector } from '@/components/shared/MLDataCollector';

export default function ArtistProfile({ user, onSave }) {
  const mlDataCollector = useMLDataCollector();
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    artist_name: user?.full_name || '',
    bio: '',
    genre: '',
    website: '',
    social_links: {
      spotify: '',
      apple_music: '',
      youtube: '',
      instagram: '',
      twitter: '',
      tiktok: '',
      soundcloud: '',
      bandcamp: ''
    },
    for_sale: {
      albums: [],
      songs: [],
      beats: [],
      lyrics: [],
      songwriting: false
    },
    services: {
      production: false,
      mixing: false,
      mastering: false,
      songwriting: false,
      features: false
    }
  });

  useEffect(() => {
    if (user?.artist_profile) {
      setProfile(prev => ({ ...prev, ...user.artist_profile }));
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({ artist_profile: profile });
      mlDataCollector.record('artist_profile_saved', {
        feature: 'monetization',
        timestamp: Date.now()
      });
      if (onSave) onSave(profile);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = (category) => {
    const title = prompt(`Enter ${category.slice(0, -1)} title:`);
    if (title) {
      const price = prompt('Enter price ($):');
      setProfile(prev => ({
        ...prev,
        for_sale: {
          ...prev.for_sale,
          [category]: [...prev.for_sale[category], { title, price: parseFloat(price) || 0, id: Date.now() }]
        }
      }));
    }
  };

  const removeItem = (category, id) => {
    setProfile(prev => ({
      ...prev,
      for_sale: {
        ...prev.for_sale,
        [category]: prev.for_sale[category].filter(item => item.id !== id)
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* AI Notice */}
      <Card className="bg-cyan-950/50 border-cyan-500/30">
        <CardContent className="p-4 flex items-center gap-3">
          <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <p className="text-white font-semibold text-sm">🤖 AI Learns From Your Data</p>
            <p className="text-cyan-300 text-xs">Profile data used to optimize marketing recommendations</p>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            Artist Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-white font-bold mb-2 inline-block">Artist/Stage Name</label>
              <Input
                value={profile.artist_name}
                onChange={(e) => setProfile({ ...profile, artist_name: e.target.value })}
                placeholder="Your artist name"
                className="bg-slate-800 border-slate-700 text-white mt-2"
              />
            </div>
            <div>
              <label className="text-white font-bold mb-2 inline-block">Genre</label>
              <Input
                value={profile.genre}
                onChange={(e) => setProfile({ ...profile, genre: e.target.value })}
                placeholder="Hip-Hop, R&B, Pop..."
                className="bg-slate-800 border-slate-700 text-white mt-2"
              />
            </div>
          </div>
          <div>
            <label className="text-white font-bold mb-2 inline-block">Bio</label>
            <Textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell your story..."
              className="bg-slate-800 border-slate-700 text-white mt-2"
              rows={3}
            />
          </div>
          <div>
            <label className="text-white font-bold mb-2 inline-block">Website</label>
            <Input
              value={profile.website}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              placeholder="https://yourwebsite.com"
              className="bg-slate-800 border-slate-700 text-white mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Connect Social & Streaming Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { key: 'spotify', label: 'Spotify', icon: '🎵', color: 'green' },
              { key: 'apple_music', label: 'Apple Music', icon: '🍎', color: 'pink' },
              { key: 'youtube', label: 'YouTube', icon: '📺', color: 'red' },
              { key: 'instagram', label: 'Instagram', icon: '📷', color: 'purple' },
              { key: 'twitter', label: 'Twitter/X', icon: '🐦', color: 'blue' },
              { key: 'tiktok', label: 'TikTok', icon: '🎬', color: 'cyan' },
              { key: 'soundcloud', label: 'SoundCloud', icon: '☁️', color: 'orange' },
              { key: 'bandcamp', label: 'Bandcamp', icon: '🎸', color: 'teal' },
              { key: 'merch', label: 'Merch Store', icon: '👕', color: 'pink' },
              { key: 'ecommerce', label: 'Ecommerce (Shopify/Woo)', icon: '🛍️', color: 'green' },
              { key: 'licensing', label: 'Licensing Profile (Songtradr/Beatstars)', icon: '💼', color: 'blue' }
            ].map(platform => (
              <div key={platform.key} className="flex items-center gap-2">
                <span className="text-lg">{platform.icon}</span>
                <Input
                  value={profile.social_links[platform.key] || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    social_links: { ...profile.social_links, [platform.key]: e.target.value }
                  })}
                  placeholder={`${platform.label} URL`}
                  className="bg-slate-800 border-slate-700 text-white flex-1"
                />
                {profile.social_links[platform.key] && (
                  <Button size="icon" variant="ghost" asChild>
                    <a href={profile.social_links[platform.key]} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* For Sale Section */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-green-400" />
            Music & Services For Sale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Albums */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white font-bold">Albums</label>
              <Button size="sm" onClick={() => addItem('albums')} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-3 h-3 mr-1" /> Add Album
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.for_sale.albums.map(item => (
                <Badge key={item.id} className="bg-green-500/20 text-green-300 flex items-center gap-1">
                  <Disc className="w-3 h-3" /> {item.title} - ${item.price}
                  <X className="w-3 h-3 cursor-pointer ml-1" onClick={() => removeItem('albums', item.id)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Songs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white font-bold">Singles/Songs</label>
              <Button size="sm" onClick={() => addItem('songs')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-3 h-3 mr-1" /> Add Song
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.for_sale.songs.map(item => (
                <Badge key={item.id} className="bg-blue-500/20 text-blue-300 flex items-center gap-1">
                  <Music className="w-3 h-3" /> {item.title} - ${item.price}
                  <X className="w-3 h-3 cursor-pointer ml-1" onClick={() => removeItem('songs', item.id)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Beats */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white font-bold">Beats/Instrumentals</label>
              <Button size="sm" onClick={() => addItem('beats')} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-3 h-3 mr-1" /> Add Beat
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.for_sale.beats.map(item => (
                <Badge key={item.id} className="bg-purple-500/20 text-purple-300 flex items-center gap-1">
                  🥁 {item.title} - ${item.price}
                  <X className="w-3 h-3 cursor-pointer ml-1" onClick={() => removeItem('beats', item.id)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Lyrics */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white font-bold">Lyrics For Sale</label>
              <Button size="sm" onClick={() => addItem('lyrics')} className="bg-amber-600 hover:bg-amber-700">
                <Plus className="w-3 h-3 mr-1" /> Add Lyrics
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.for_sale.lyrics.map(item => (
                <Badge key={item.id} className="bg-amber-500/20 text-amber-300 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> {item.title} - ${item.price}
                  <X className="w-3 h-3 cursor-pointer ml-1" onClick={() => removeItem('lyrics', item.id)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="pt-4 border-t border-slate-700">
            <label className="text-white font-bold mb-3 inline-block">Services Offered</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {[
                { key: 'production', label: 'Music Production', icon: '🎹' },
                { key: 'mixing', label: 'Mixing', icon: '🎚️' },
                { key: 'mastering', label: 'Mastering', icon: '🔊' },
                { key: 'songwriting', label: 'Songwriting', icon: '✍️' },
                { key: 'features', label: 'Features/Collabs', icon: '🎤' }
              ].map(service => (
                <div key={service.key} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-white text-sm">{service.icon} {service.label}</span>
                  <Switch
                    checked={profile.services[service.key] || false}
                    onCheckedChange={(checked) => setProfile({
                      ...profile,
                      services: { ...profile.services, [service.key]: checked }
                    })}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isSaving} className="w-full bg-purple-600 hover:bg-purple-700">
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save Artist Profile'}
      </Button>
    </div>
  );
}