import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, Image, Music, Plus, Brain, Shield, 
  Upload, DollarSign, Users, Clock, Zap
} from "lucide-react";
import { useMLDataCollector } from '@/components/shared/MLDataCollector';

export default function NFTMarketplace({ user }) {
  const mlDataCollector = useMLDataCollector();
  const [showCreate, setShowCreate] = useState(false);
  const [nftForm, setNftForm] = useState({
    name: '',
    description: '',
    type: 'track',
    price: '',
    royaltyPercent: 10,
    editions: 1
  });
  const [myNFTs, setMyNFTs] = useState([]);

  const handleCreateNFT = () => {
    if (!nftForm.name || !nftForm.price) return;
    
    const newNFT = {
      id: `nft_${Date.now()}`,
      ...nftForm,
      creator: user?.full_name || 'Artist',
      createdAt: new Date().toISOString(),
      status: 'minted',
      sold: 0
    };

    setMyNFTs([newNFT, ...myNFTs]);
    setNftForm({ name: '', description: '', type: 'track', price: '', royaltyPercent: 10, editions: 1 });
    setShowCreate(false);

    mlDataCollector.record('nft_created', {
      feature: 'monetization',
      nftType: nftForm.type,
      timestamp: Date.now()
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Notice */}
      <Card className="bg-cyan-950/50 border-cyan-500/30">
        <CardContent className="p-4 flex items-center gap-3">
          <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <p className="text-white font-semibold text-sm">🤖 AI Learns From Your Data</p>
            <p className="text-cyan-300 text-xs">Optimizing NFT pricing based on market trends</p>
          </div>
        </CardContent>
      </Card>

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold text-lg">Digital Collectibles</h3>
          <p className="text-slate-400 text-sm">Mint and sell NFTs for your music & artwork</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-1" /> Create NFT
        </Button>
      </div>

      {/* Create NFT Form */}
      {showCreate && (
        <Card className="bg-slate-900/80 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-white">Create New NFT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 text-sm mb-1 block">NFT Name *</label>
                <Input
                  value={nftForm.name}
                  onChange={(e) => setNftForm({ ...nftForm, name: e.target.value })}
                  placeholder="My Exclusive Track"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Type</label>
                <Select value={nftForm.type} onValueChange={(v) => setNftForm({ ...nftForm, type: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="track" className="text-white">🎵 Music Track</SelectItem>
                    <SelectItem value="album" className="text-white">💿 Album</SelectItem>
                    <SelectItem value="artwork" className="text-white">🎨 Artwork</SelectItem>
                    <SelectItem value="video" className="text-white">📹 Video</SelectItem>
                    <SelectItem value="experience" className="text-white">✨ Experience</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm mb-1 block">Description</label>
              <Textarea
                value={nftForm.description}
                onChange={(e) => setNftForm({ ...nftForm, description: e.target.value })}
                placeholder="Describe your NFT..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Price (ETH) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={nftForm.price}
                  onChange={(e) => setNftForm({ ...nftForm, price: e.target.value })}
                  placeholder="0.05"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Royalty %</label>
                <Input
                  type="number"
                  value={nftForm.royaltyPercent}
                  onChange={(e) => setNftForm({ ...nftForm, royaltyPercent: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Editions</label>
                <Input
                  type="number"
                  value={nftForm.editions}
                  onChange={(e) => setNftForm({ ...nftForm, editions: parseInt(e.target.value) || 1 })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateNFT} className="bg-purple-600 hover:bg-purple-700">
                <Sparkles className="w-4 h-4 mr-1" /> Mint NFT
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My NFTs */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            My NFTs ({myNFTs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myNFTs.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No NFTs created yet</p>
              <p className="text-slate-500 text-sm">Create your first digital collectible!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myNFTs.map(nft => (
                <div key={nft.id} className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-purple-500/20 text-purple-300">{nft.type}</Badge>
                    <Badge className="bg-green-500/20 text-green-300">{nft.status}</Badge>
                  </div>
                  <h4 className="text-white font-black text-lg">{nft.name}</h4>
                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">{nft.description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-purple-400 font-bold text-base">{nft.price} ETH</span>
                    <span className="text-slate-500 text-xs">{nft.editions} editions</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Tips */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
        <CardContent className="p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            AI NFT Strategy Tips
          </h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li>• Limited editions (1-10) create scarcity and higher value</li>
            <li>• Include exclusive content or experiences with your NFTs</li>
            <li>• Set 10-15% royalties for ongoing revenue on resales</li>
            <li>• Bundle NFTs with real-world perks (concerts, merch)</li>
            <li>• Time releases with album drops for maximum attention</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}