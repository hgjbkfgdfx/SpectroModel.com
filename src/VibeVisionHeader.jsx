import React from 'react';
import { Music } from 'lucide-react';

export default function VibeVisionHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
            <Music className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Vibe<span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Vision</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-white/50 border border-white/10 px-2 py-1 rounded">
            POWERED BY GEMINI VEO
          </span>
        </div>
      </div>
    </header>
  );
}