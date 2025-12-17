import React from 'react';

export default function Genre2DIcon({ genre, size = 80 }) {
  const genreLower = genre.toLowerCase();

  // Pop - Isometric Microphone with stage lighting
  if (genreLower.includes('pop')) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="popGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="popGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#c026d3" />
          </linearGradient>
        </defs>
        {/* Isometric microphone */}
        <ellipse cx="60" cy="40" rx="18" ry="15" fill="url(#popGrad1)" stroke="#000" strokeWidth="3"/>
        <path d="M 42 40 L 42 55 L 60 65 L 78 55 L 78 40 Z" fill="url(#popGrad2)" stroke="#000" strokeWidth="3"/>
        <path d="M 60 65 L 60 85" stroke="#1f2937" strokeWidth="8" strokeLinecap="round"/>
        <path d="M 45 85 L 75 85 L 70 95 L 50 95 Z" fill="#374151" stroke="#000" strokeWidth="3"/>
        {/* Stage lights */}
        <circle cx="25" cy="20" r="4" fill="#fbbf24" opacity="0.8"/>
        <path d="M 25 24 L 35 50" stroke="#fbbf24" strokeWidth="2" opacity="0.5"/>
        <circle cx="95" cy="20" r="4" fill="#fbbf24" opacity="0.8"/>
        <path d="M 95 24 L 85 50" stroke="#fbbf24" strokeWidth="2" opacity="0.5"/>
      </svg>
    );
  }

  // Hip-Hop - Isometric Turntable
  if (genreLower.includes('hip') || genreLower.includes('rap')) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hipGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
        </defs>
        {/* Base platform */}
        <path d="M 30 60 L 20 70 L 60 90 L 100 70 L 90 60 Z" fill="#1f2937" stroke="#000" strokeWidth="3"/>
        {/* Turntable deck */}
        <ellipse cx="60" cy="55" rx="35" ry="15" fill="url(#hipGrad1)" stroke="#000" strokeWidth="3"/>
        <ellipse cx="60" cy="55" rx="25" ry="11" fill="#1e3a8a" stroke="#000" strokeWidth="2"/>
        <circle cx="60" cy="55" r="5" fill="#fbbf24"/>
        {/* Tone arm */}
        <path d="M 85 45 L 75 50 L 65 53" stroke="#6b7280" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="87" cy="43" r="3" fill="#ef4444"/>
      </svg>
    );
  }

  // R&B - Isometric Headphones
  if (genreLower.includes('r&b') || genreLower.includes('rnb')) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rnbGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6b7280" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>
        </defs>
        {/* Headband - isometric curve */}
        <path d="M 25 50 Q 25 25 60 20 Q 95 25 95 50" stroke="#000" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <path d="M 27 50 Q 27 28 60 23 Q 93 28 93 50" stroke="url(#rnbGrad1)" strokeWidth="4" fill="none"/>
        {/* Left cup - 3D */}
        <path d="M 20 50 L 15 60 L 25 70 L 35 65 L 30 50 Z" fill="url(#rnbGrad1)" stroke="#000" strokeWidth="3"/>
        <path d="M 25 70 L 30 75 L 40 70 L 35 65 Z" fill="#374151" stroke="#000" strokeWidth="2"/>
        {/* Right cup - 3D */}
        <path d="M 100 50 L 105 60 L 95 70 L 85 65 L 90 50 Z" fill="url(#rnbGrad1)" stroke="#000" strokeWidth="3"/>
        <path d="M 95 70 L 90 75 L 80 70 L 85 65 Z" fill="#374151" stroke="#000" strokeWidth="2"/>
        {/* Sound waves */}
        <path d="M 10 55 Q 5 60 10 65" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6"/>
        <path d="M 110 55 Q 115 60 110 65" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6"/>
      </svg>
    );
  }

  // Country - Isometric Cowboy Hat
  if (genreLower.includes('country')) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="countryGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
        </defs>
        {/* Hat brim - isometric */}
        <ellipse cx="60" cy="65" rx="45" ry="18" fill="#78350f" stroke="#000" strokeWidth="3"/>
        <ellipse cx="60" cy="62" rx="45" ry="18" fill="#92400e" stroke="#000" strokeWidth="3"/>
        {/* Hat crown - 3D */}
        <path d="M 30 62 Q 35 35 60 30 Q 85 35 90 62 Z" fill="url(#countryGrad1)" stroke="#000" strokeWidth="3"/>
        <ellipse cx="60" cy="32" rx="22" ry="10" fill="#b45309" stroke="#000" strokeWidth="2"/>
        {/* Hat band */}
        <path d="M 35 55 Q 35 50 60 48 Q 85 50 85 55" stroke="#1f2937" strokeWidth="4"/>
        <circle cx="60" cy="50" r="4" fill="#fbbf24"/>
      </svg>
    );
  }

  // Latin/Reggaeton - Isometric Congas
  if (genreLower.includes('latin') || genreLower.includes('reggaeton')) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="latinGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        {/* Left conga - 3D drum */}
        <ellipse cx="40" cy="35" rx="15" ry="8" fill="#fbbf24" stroke="#000" strokeWidth="2"/>
        <path d="M 25 35 L 22 70 L 40 78 L 58 70 L 55 35 Z" fill="url(#latinGrad1)" stroke="#000" strokeWidth="3"/>
        <ellipse cx="40" cy="75" rx="18" ry="10" fill="#c2410c" stroke="#000" strokeWidth="2"/>
        {/* Right conga - 3D drum */}
        <ellipse cx="80" cy="40" rx="15" ry="8" fill="#fbbf24" stroke="#000" strokeWidth="2"/>
        <path d="M 65 40 L 62 75 L 80 83 L 98 75 L 95 40 Z" fill="url(#latinGrad1)" stroke="#000" strokeWidth="3"/>
        <ellipse cx="80" cy="80" rx="18" ry="10" fill="#c2410c" stroke="#000" strokeWidth="2"/>
        {/* Sound waves */}
        <path d="M 40 25 Q 35 20 40 15" stroke="#fbbf24" strokeWidth="2" fill="none"/>
        <path d="M 80 30 Q 85 25 80 20" stroke="#fbbf24" strokeWidth="2" fill="none"/>
      </svg>
    );
  }

  // Reggae - Isometric Speaker Stack
  if (genreLower.includes('reggae')) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bottom speaker - 3D */}
        <path d="M 30 70 L 25 80 L 60 95 L 95 80 L 90 70 Z" fill="#166534" stroke="#000" strokeWidth="3"/>
        <path d="M 30 70 L 90 70 L 95 60 L 60 48 L 25 60 Z" fill="#10b981" stroke="#000" strokeWidth="3"/>
        <ellipse cx="60" cy="65" rx="15" ry="6" fill="#000"/>
        {/* Top speaker - 3D */}
        <path d="M 35 45 L 30 55 L 60 68 L 90 55 L 85 45 Z" fill="#ca8a04" stroke="#000" strokeWidth="3"/>
        <path d="M 35 45 L 85 45 L 90 35 L 60 25 L 30 35 Z" fill="#fbbf24" stroke="#000" strokeWidth="3"/>
        <ellipse cx="60" cy="40" rx="12" ry="5" fill="#000"/>
        {/* Sound waves - red */}
        <path d="M 15 60 Q 10 65 15 70" stroke="#ef4444" strokeWidth="3" fill="none"/>
        <path d="M 105 60 Q 110 65 105 70" stroke="#ef4444" strokeWidth="3" fill="none"/>
      </svg>
    );
  }

  // Blues - Isometric Electric Guitar
  if (genreLower.includes('blues')) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bluesGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>
        {/* Guitar body - 3D */}
        <path d="M 45 50 L 40 75 L 55 85 L 80 75 L 75 50 Z" fill="url(#bluesGrad1)" stroke="#000" strokeWidth="3"/>
        <path d="M 45 50 L 75 50 L 80 45 L 55 35 L 40 45 Z" fill="#2563eb" stroke="#000" strokeWidth="3"/>
        <ellipse cx="60" cy="62" rx="8" ry="4" fill="#000"/>
        {/* Neck - 3D */}
        <path d="M 55 35 L 53 15 L 63 15 L 65 35 Z" fill="#1f2937" stroke="#000" strokeWidth="3"/>
        <path d="M 53 15 L 63 15 L 65 10 L 55 10 Z" fill="#374151" stroke="#000" strokeWidth="2"/>
        {/* Strings */}
        <line x1="56" y1="35" x2="54" y2="15" stroke="#d1d5db" strokeWidth="1"/>
        <line x1="59" y1="35" x2="57" y2="15" stroke="#d1d5db" strokeWidth="1"/>
        <line x1="62" y1="35" x2="60" y2="15" stroke="#d1d5db" strokeWidth="1"/>
      </svg>
    );
  }

  // Jazz - Isometric Saxophone
  if (genreLower.includes('jazz')) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="jazzGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        {/* Saxophone body - 3D curved */}
        <path d="M 50 25 Q 45 30 45 40 L 45 65 Q 45 75 52 82 L 65 88" fill="url(#jazzGrad1)" stroke="#000" strokeWidth="3"/>
        <path d="M 50 25 L 55 23 L 55 38 Q 55 73 68 85 L 65 88 Q 45 75 45 40 Z" fill="#f59e0b" stroke="#000" strokeWidth="3"/>
        {/* Bell - 3D */}
        <ellipse cx="70" cy="87" rx="10" ry="6" fill="#f59e0b" stroke="#000" strokeWidth="3"/>
        <ellipse cx="70" cy="85" rx="10" ry="6" fill="#fbbf24" stroke="#000" strokeWidth="2"/>
        {/* Keys - 3D */}
        <circle cx="48" cy="45" r="3" fill="#1f2937" stroke="#000" strokeWidth="2"/>
        <circle cx="48" cy="55" r="3" fill="#1f2937" stroke="#000" strokeWidth="2"/>
        <circle cx="48" cy="65" r="3" fill="#1f2937" stroke="#000" strokeWidth="2"/>
        {/* Mouthpiece */}
        <path d="M 50 23 Q 55 18 60 20" stroke="#000" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    );
  }

  // K-Pop - Isometric Heart with sparkles
  if (genreLower.includes('k-pop') || genreLower.includes('kpop')) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="kpopGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        {/* 3D Heart bottom */}
        <path d="M 60 80 L 30 55 L 35 50 L 60 70 L 85 50 L 90 55 Z" fill="#c026d3" stroke="#000" strokeWidth="3"/>
        {/* 3D Heart top */}
        <path d="M 60 70 L 35 50 Q 25 40 30 30 Q 40 22 48 30 L 60 42 L 72 30 Q 80 22 90 30 Q 95 40 85 50 Z" 
              fill="url(#kpopGrad1)" stroke="#000" strokeWidth="3"/>
        {/* Sparkles - isometric */}
        <path d="M 20 25 L 23 28 L 26 25 L 23 22 Z" fill="#fbbf24"/>
        <path d="M 20 30 L 20 33 L 23 33 Z" fill="#f59e0b"/>
        <path d="M 95 20 L 98 23 L 101 20 L 98 17 Z" fill="#fbbf24"/>
        <path d="M 95 25 L 95 28 L 98 28 Z" fill="#f59e0b"/>
        <path d="M 105 55 L 107 57 L 109 55 L 107 53 Z" fill="#fbbf24"/>
      </svg>
    );
  }

  // J-Core - Isometric Note with energy
  if (genreLower.includes('j-core') || genreLower.includes('jcore')) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="jcoreGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#7c2d12" />
          </linearGradient>
        </defs>
        {/* Note head - 3D */}
        <ellipse cx="45" cy="75" rx="15" ry="10" fill="#991b1b" stroke="#000" strokeWidth="3"/>
        <path d="M 30 75 L 30 68 L 60 63 L 60 70 Z" fill="url(#jcoreGrad1)" stroke="#000" strokeWidth="3"/>
        {/* Stem - 3D */}
        <path d="M 58 30 L 62 30 L 62 70 L 58 70 Z" fill="url(#jcoreGrad1)" stroke="#000" strokeWidth="3"/>
        {/* Flag - 3D curved */}
        <path d="M 62 30 Q 75 28 82 35 L 82 42 Q 75 38 62 40 Z" fill="url(#jcoreGrad1)" stroke="#000" strokeWidth="3"/>
        <path d="M 62 42 Q 75 40 82 47 L 82 54 Q 75 50 62 52 Z" fill="#dc2626" stroke="#000" strokeWidth="3"/>
        {/* Energy bolts */}
        <path d="M 25 40 L 30 35 L 27 38 L 32 33" stroke="#fbbf24" strokeWidth="3"/>
        <path d="M 90 60 L 95 55 L 92 58 L 97 53" stroke="#fbbf24" strokeWidth="3"/>
      </svg>
    );
  }

  // Classical - Isometric Grand Piano
  if (genreLower.includes('classical')) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="classicalGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
        </defs>
        {/* Piano body - 3D isometric */}
        <path d="M 30 50 L 25 70 L 60 85 L 95 70 L 90 50 Z" fill="#1f2937" stroke="#000" strokeWidth="3"/>
        <path d="M 30 50 L 90 50 L 95 40 L 60 30 L 25 40 Z" fill="url(#classicalGrad1)" stroke="#000" strokeWidth="3"/>
        {/* Lid - 3D */}
        <path d="M 90 50 L 85 25 L 95 20 L 100 45 Z" fill="#6d28d9" stroke="#000" strokeWidth="3"/>
        {/* Keys - isometric view */}
        <rect x="32" y="48" width="6" height="18" fill="#fff" stroke="#000" strokeWidth="1"/>
        <rect x="40" y="48" width="6" height="18" fill="#fff" stroke="#000" strokeWidth="1"/>
        <rect x="48" y="48" width="6" height="18" fill="#fff" stroke="#000" strokeWidth="1"/>
        <rect x="56" y="48" width="6" height="18" fill="#fff" stroke="#000" strokeWidth="1"/>
        <rect x="64" y="48" width="6" height="18" fill="#fff" stroke="#000" strokeWidth="1"/>
        <rect x="72" y="48" width="6" height="18" fill="#fff" stroke="#000" strokeWidth="1"/>
        <rect x="80" y="48" width="6" height="18" fill="#fff" stroke="#000" strokeWidth="1"/>
        {/* Black keys */}
        <rect x="36" y="48" width="4" height="10" fill="#000"/>
        <rect x="44" y="48" width="4" height="10" fill="#000"/>
        <rect x="60" y="48" width="4" height="10" fill="#000"/>
        <rect x="68" y="48" width="4" height="10" fill="#000"/>
        <rect x="76" y="48" width="4" height="10" fill="#000"/>
      </svg>
    );
  }

  // Default - Isometric Music Note
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="defaultGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      {/* Note head - 3D */}
      <ellipse cx="45" cy="70" rx="14" ry="10" fill="#4c1d95" stroke="#000" strokeWidth="3"/>
      <path d="M 31 70 L 31 63 L 59 58 L 59 65 Z" fill="url(#defaultGrad1)" stroke="#000" strokeWidth="3"/>
      {/* Stem - 3D */}
      <path d="M 57 28 L 61 28 L 61 65 L 57 65 Z" fill="url(#defaultGrad1)" stroke="#000" strokeWidth="3"/>
      {/* Flag - 3D curved */}
      <path d="M 61 28 Q 73 26 80 33 L 80 40 Q 73 35 61 38 Z" fill="url(#defaultGrad1)" stroke="#000" strokeWidth="3"/>
    </svg>
  );
}