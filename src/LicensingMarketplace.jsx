import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShoppingBag, Music, Film, Tv, Radio, Globe, 
  Plus, Brain, Shield, DollarSign, FileText, Check
} from "lucide-react";
import { useMLDataCollector } from '@/components/shared/MLDataCollector';

const LICENSE_TYPES = [
  { id: 'sync', name: 'Sync License', desc: 'Film, TV, Ads', icon: Film, price: 500 },
  { id: 'broadcast', name: 'Broadcast', desc: 'Radio, Podcast', icon: Radio, price: 200 },
  { id: 'streaming', name: 'Streaming', desc: 'YouTube, Twitch', icon: Globe, price: 100 },
  { id: 'commercial', name: 'Commercial', desc: 'Ads, Promos', icon: Tv, price: 1000 },
  { id: 'exclusive', name: 'Exclusive', desc: 'Full Rights', icon: ShoppingBag, price: 5000 }
];

export default function LicensingMarketplace({ user }) {
  const mlDataCollector = useMLDataCollector();
  const [listings, setListings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('licensing_listings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse listings', e);
        }
      }
    }
    return [];
  });

  React.useEffect(() => {
    localStorage.setItem('licensing_listings', JSON.stringify(listings));
  }, [listings]);
  const [showCreate, setShowCreate] = useState(false);
  const [newListing, setNewListing] = useState({
    trackName: '',
    description: '',
    genre: '',
    bpm: '',
    key: '',
    licenses: {}
  });

  const handleToggleLicense = (licenseId) => {
    const current = newListing.licenses[licenseId];
    setNewListing({
      ...newListing,
      licenses: {
        ...newListing.licenses,
        [licenseId]: current ? undefined : LICENSE_TYPES.find(l => l.id === licenseId)?.price
      }
    });
  };

  const handleCreateListing = () => {
    if (!newListing.trackName) return;

    const listing = {
      id: `listing_${Date.now()}`,
      ...newListing,
      creator: user?.full_name || 'Artist',
      createdAt: new Date().toISOString(),
      status: 'active',
      sales: 0
    };

    setListings([listing, ...listings]);
    setNewListing({ trackName: '', description: '', genre: '', bpm: '', key: '', licenses: {} });
    setShowCreate(false);

    mlDataCollector.record('licensing_listing_created', {
      feature: 'monetization',
      licenseTypes: Object.keys(listing.licenses).length,
      timestamp: Date.now()
    });
  };

  const handleRemoveListing = (id) => {
    setListings(listings.filter(l => l.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* AI Notice */}
      <Card className="bg-cyan-950/50 border-cyan-500/30">
        <CardContent className="p-4 flex items-center gap-3">
          <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <p className="text-white font-semibold text-sm">🤖 AI Learns From Your Data</p>
            <p className="text-cyan-300 text-xs">Analyzing licensing trends for optimal pricing</p>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold text-lg">Track Licensing</h3>
          <p className="text-slate-400 text-sm">License your music for film, TV, ads & more</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="w-4 h-4 mr-1" /> List Track
        </Button>
      </div>

      {/* License Type Guide */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {LICENSE_TYPES.map(license => {
          const Icon = license.icon;
          return (
            <Card key={license.id} className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-3 text-center">
                <Icon className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                <p className="text-white font-bold text-sm">{license.name}</p>
                <p className="text-slate-300 text-xs font-medium">{license.desc}</p>
                <p className="text-amber-400 font-bold mt-1">${license.price}+</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Listing Form */}
      {showCreate && (
        <Card className="bg-slate-900/80 border-amber-500/50">
          <CardHeader>
            <CardTitle className="text-white">List Track for Licensing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Track Name *</label>
                <Input
                  value={newListing.trackName}
                  onChange={(e) => setNewListing({ ...newListing, trackName: e.target.value })}
                  placeholder="Epic Cinematic Theme"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Genre</label>
                <Select value={newListing.genre} onValueChange={(v) => setNewListing({ ...newListing, genre: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-300 z-[9999]">
                    {[
                      { value: 'cinematic', label: 'Cinematic' },
                      { value: 'electronic', label: 'Electronic' },
                      { value: 'pop', label: 'Pop' },
                      { value: 'hiphop', label: 'Hip-Hop' },
                      { value: 'rock', label: 'Rock' },
                      { value: 'ambient', label: 'Ambient' },
                      { value: 'jazz', label: 'Jazz' },
                      { value: 'classical', label: 'Classical' },
                      { value: 'country', label: 'Country' },
                      { value: 'rnb', label: 'R&B' },
                      { value: 'latin', label: 'Latin' },
                      { value: 'kpop', label: 'K-Pop' }
                    ].map(genre => (
                      <SelectItem 
                        key={genre.value} 
                        value={genre.value} 
                        className="!text-black !font-bold hover:!bg-purple-100 focus:!bg-purple-100 data-[highlighted]:!bg-purple-100 data-[highlighted]:!text-black cursor-pointer"
                      >
                        <span className="text-black font-bold">{genre.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 text-sm mb-1 block">BPM</label>
                <Input
                  type="number"
                  value={newListing.bpm}
                  onChange={(e) => setNewListing({ ...newListing, bpm: e.target.value })}
                  placeholder="120"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Key</label>
                <Input
                  value={newListing.key}
                  onChange={(e) => setNewListing({ ...newListing, key: e.target.value })}
                  placeholder="C Major"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm mb-1 block">Description</label>
              <Textarea
                value={newListing.description}
                onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                placeholder="Describe your track's mood, style, and ideal use cases..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="text-white font-black mb-2 inline-block">Available Licenses</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {LICENSE_TYPES.map(license => {
                  const isSelected = newListing.licenses[license.id];
                  return (
                    <Button
                      key={license.id}
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={() => handleToggleLicense(license.id)}
                      className={isSelected ? 'bg-amber-600 text-black font-bold' : 'border-slate-600 text-black font-bold bg-white/90 hover:bg-white'}
                    >
                      {isSelected && <Check className="w-3 h-3 mr-1" />}
                      {license.name} (${license.price})
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateListing} className="bg-amber-600 hover:bg-amber-700">
                <ShoppingBag className="w-4 h-4 mr-1" /> Create Listing
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Listings */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-amber-400" />
            My Listings ({listings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No tracks listed yet</p>
              <p className="text-slate-500 text-sm">List your first track for licensing!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map(listing => (
                <div key={listing.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-semibold">{listing.trackName}</h4>
                      <p className="text-slate-400 text-sm">{listing.genre} • {listing.bpm} BPM • {listing.key}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-300">{listing.status}</Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveListing(listing.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-6 w-6"
                      >
                        &times;
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {Object.entries(listing.licenses).filter(([_, v]) => v).map(([type, price]) => (
                      <Badge key={type} className="bg-amber-500/20 text-amber-300">
                        {LICENSE_TYPES.find(l => l.id === type)?.name}: ${price}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}