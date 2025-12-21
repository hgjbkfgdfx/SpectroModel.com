import React, { useState, useEffect } from 'react';

// Theme color mappings for holographic orbs
const THEME_ORBS = {
  purple: { orb1: 'bg-purple-600/10', orb2: 'bg-cyan-500/10', orb3: 'bg-blue-500/5' },
  blue: { orb1: 'bg-blue-600/10', orb2: 'bg-cyan-500/10', orb3: 'bg-indigo-500/5' },
  green: { orb1: 'bg-emerald-600/10', orb2: 'bg-teal-500/10', orb3: 'bg-green-500/5' },
  orange: { orb1: 'bg-orange-600/10', orb2: 'bg-amber-500/10', orb3: 'bg-yellow-500/5' },
  red: { orb1: 'bg-red-600/10', orb2: 'bg-rose-500/10', orb3: 'bg-pink-500/5' },
  pink: { orb1: 'bg-pink-600/10', orb2: 'bg-rose-500/10', orb3: 'bg-fuchsia-500/5' },
  gold: { orb1: 'bg-amber-500/10', orb2: 'bg-yellow-500/10', orb3: 'bg-orange-500/5' },
  silver: { orb1: 'bg-slate-400/10', orb2: 'bg-zinc-500/10', orb3: 'bg-gray-500/5' },
  black: { orb1: 'bg-zinc-700/10', orb2: 'bg-slate-600/10', orb3: 'bg-gray-600/5' },
  white: { orb1: 'bg-slate-300/10', orb2: 'bg-gray-300/10', orb3: 'bg-zinc-300/5' },
  brown: { orb1: 'bg-amber-700/10', orb2: 'bg-orange-800/10', orb3: 'bg-yellow-900/5' },
  yellow: { orb1: 'bg-yellow-500/10', orb2: 'bg-amber-400/10', orb3: 'bg-orange-400/5' },
};

export default function HolographicBackground() {
  const [theme, setTheme] = useState('purple');

  useEffect(() => {
    const savedTheme = localStorage.getItem('spectromodel_theme') || 'purple';
    setTheme(savedTheme);

    const handleStorage = (e) => {
      if (e.key === 'spectromodel_theme') {
        setTheme(e.newValue || 'purple');
      }
    };
    
    const handleThemeChanged = (e) => {
      const newTheme = e.detail?.theme || localStorage.getItem('spectromodel_theme') || 'purple';
      setTheme(newTheme);
    };
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('theme-changed', handleThemeChanged);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('theme-changed', handleThemeChanged);
    };
  }, []);

  const orbs = THEME_ORBS[theme] || THEME_ORBS.purple;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Pure dark gradient base - NO STATIC NOISE */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0118] via-[#0f0520] to-[#050015]" />
      
      {/* Theme-aware animated gradient orbs */}
      <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full ${orbs.orb1} blur-[120px] animate-pulse`} style={{ animationDuration: '8s' }} />
      <div className={`absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full ${orbs.orb2} blur-[100px] animate-pulse`} style={{ animationDuration: '12s' }} />
      <div className={`absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full ${orbs.orb3} blur-[80px] animate-pulse`} style={{ animationDuration: '10s' }} />
    </div>
  );
}