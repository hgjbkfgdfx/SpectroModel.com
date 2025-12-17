import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Music, Zap, FileAudio, X, Activity } from "lucide-react";

import FileUploadValidator from "./FileUploadValidator";

export default function TrackInfoForm({ 
  file, 
  trackName, 
  setTrackName, 
  artistName, 
  setArtistName, 
  trackInfo,
  setTrackInfo,
  onAnalyze, 
  onCancel, 
  isDisabled 
}) {
  const [uploadErrors, setUploadErrors] = React.useState([]);

  // Support both prop patterns
  const currentTrackName = trackName || trackInfo?.track_name || '';
  const currentArtistName = artistName || trackInfo?.artist_name || '';

  const handleTrackNameChange = (value) => {
    if (setTrackName) {
      setTrackName(value);
    } else if (setTrackInfo) {
      setTrackInfo({ ...trackInfo, track_name: value });
    }
  };

  const handleArtistNameChange = (value) => {
    if (setArtistName) {
      setArtistName(value);
    } else if (setTrackInfo) {
      setTrackInfo({ ...trackInfo, artist_name: value });
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleAnalyze = () => {
    const errors = [];
    
    if (!file) {
      errors.push("Please upload a file first.");
    }
    if (!currentTrackName || !currentTrackName.trim()) {
      errors.push("Track name is required.");
    }
    if (!currentArtistName || !currentArtistName.trim()) {
      errors.push("Artist name is required.");
    }
    
    if (errors.length > 0) {
      setUploadErrors(errors);
      return;
    }
    
    setUploadErrors([]);
    onAnalyze();
  };

  if (!file) {
    return null;
  }

  return (
    <Card className="border-none shadow-2xl bg-slate-900/80">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
          <Music className="w-6 h-6 text-purple-400" />
          Track Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <FileUploadValidator file={file} errors={uploadErrors} />
        
        {/* File Info */}
        <div className="p-4 rounded-lg bg-slate-700/50 border border-slate-600/30">
          <div className="flex items-center gap-3">
            <FileAudio className="w-8 h-8 text-purple-400" />
            <div className="flex-1">
              <p className="font-medium text-white">{file?.name || 'Unknown file'}</p>
              <p className="text-sm text-slate-400">{formatFileSize(file?.size)}</p>
            </div>
            {onCancel && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="text-slate-400 hover:text-white hover:bg-slate-600/50"
                type="button"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Track Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="track_name" className="text-white">Track Name *</Label>
            <Input
              id="track_name"
              value={currentTrackName}
              onChange={(e) => handleTrackNameChange(e.target.value)}
              placeholder="Enter track name"
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="artist_name" className="text-white">Artist Name *</Label>
            <Input
              id="artist_name"
              value={currentArtistName}
              onChange={(e) => handleArtistNameChange(e.target.value)}
              placeholder="Enter artist name"
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Analysis Info */}
        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-2">Industry-Standard Analysis Includes:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-300 mb-3">
                <div>✓ Audio Features (DSP)</div>
                <div>✓ Streaming Potential</div>
                <div>✓ Playlist Compatibility</div>
                <div>✓ Viral Marketing Score</div>
                <div>✓ Production Quality</div>
                <div>✓ Market Fit Analysis</div>
                <div>✓ Target Audience ID</div>
                <div>✓ Hit Score Algorithm</div>
              </div>
              <p className="text-xs text-slate-400">
                Based on 175M+ streaming data points and proven methodologies
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={handleAnalyze}
            disabled={isDisabled || !file || !currentTrackName?.trim() || !currentArtistName?.trim()}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold"
          >
            <Zap className="w-5 h-5 mr-2" />
            Analyze Track
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}