import React from 'react';
import { Play, Sparkles } from 'lucide-react';

export default function VibeVisionHero({ onConnect }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur mb-8">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-white/80">Next Gen Music Video Creation</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter leading-tight text-white">
          Visuals that <br />
          <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">hit the beat.</span>
        </h1>
        
        <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
          Transform your musical ideas into stunning, high-definition videos using Google's most advanced video generation model, Veo.
        </p>

        <button 
          onClick={onConnect}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-cyan-400 transition-all duration-300 hover:scale-105"
        >
          <span>Start Creating</span>
          <Play className="w-5 h-5 fill-current" />
          <div className="absolute inset-0 rounded-full ring-2 ring-white/50 group-hover:ring-cyan-400/50 animate-pulse"></div>
        </button>

        <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 max-w-md mx-auto">
          <p className="text-amber-200 font-semibold text-sm">💳 Paid Google Cloud Account Required</p>
          <p className="text-amber-300/70 text-xs mt-1">
            VEO 3 requires billing enabled at{' '}
            <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer" className="underline text-amber-200">
              console.cloud.google.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}