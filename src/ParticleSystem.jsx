import React, { useMemo, useState, useEffect } from "react";

// Theme-based particle colors - purple is default, particles match selected theme
const THEME_COLORS = {
  purple: ["#A855F7", "#8B5CF6", "#7C3AED", "#9333EA", "#C084FC"],
  cyan: ["#06B6D4", "#22D3EE", "#67E8F9", "#0891B2"],
  blue: ["#3B82F6", "#06B6D4", "#0EA5E9", "#6366F1"],
  green: ["#10B981", "#14B8A6", "#22C55E", "#059669"],
  orange: ["#F59E0B", "#FB923C", "#FBBF24", "#F97316"],
  red: ["#EF4444", "#F87171", "#DC2626", "#FB7185"],
  pink: ["#EC4899", "#F472B6", "#DB2777", "#F9A8D4"],
  gold: ["#EAB308", "#FBBF24", "#F59E0B", "#FDE047"],
  yellow: ["#FACC15", "#FDE047", "#EAB308", "#FEF08A"],
  teal: ["#14B8A6", "#2DD4BF", "#5EEAD4", "#0D9488"],
  indigo: ["#6366F1", "#818CF8", "#A5B4FC", "#4F46E5"],
};

// Helper functions to control particles globally
export const getParticlesEnabled = () => {
  return localStorage.getItem('spectromodel_particles_enabled') !== 'false';
};

export const setParticlesEnabled = (enabled) => {
  localStorage.setItem('spectromodel_particles_enabled', enabled ? 'true' : 'false');
  // Dispatch custom event for same-tab listeners
  window.dispatchEvent(new CustomEvent('particles-toggle', { detail: { enabled } }));
  // Also dispatch storage event for cross-tab
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'spectromodel_particles_enabled',
    newValue: enabled ? 'true' : 'false'
  }));
};

const ParticleSystem = () => {
  const [theme, setTheme] = useState('purple');
  const [particleColor, setParticleColor] = useState(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // Load theme, particle color, and enabled state
    const savedTheme = localStorage.getItem('spectromodel_theme') || 'purple';
    const savedParticleColor = localStorage.getItem('spectromodel_particle_color');
    const particlesEnabled = localStorage.getItem('spectromodel_particles_enabled') !== 'false';
    
    setTheme(savedTheme);
    setParticleColor(savedParticleColor);
    setEnabled(particlesEnabled);

    const handleStorage = (e) => {
      if (e.key === 'spectromodel_theme') {
        const newTheme = e.newValue || 'purple';
        setTheme(newTheme);
        const currentParticleOverride = localStorage.getItem('spectromodel_particle_color');
        if (!currentParticleOverride) {
          setParticleColor(null);
        }
      }
      if (e.key === 'spectromodel_particle_color') {
        setParticleColor(e.newValue);
      }
      if (e.key === 'spectromodel_particles_enabled') {
        setEnabled(e.newValue !== 'false');
      }
    };
    
    const handleParticlesToggle = () => {
      const newEnabled = localStorage.getItem('spectromodel_particles_enabled') !== 'false';
      setEnabled(newEnabled);
    };
    
    const handleThemeChanged = (e) => {
      const newTheme = e.detail?.theme || localStorage.getItem('spectromodel_theme') || 'purple';
      setTheme(newTheme);
      setParticleColor(null); // Reset to match new theme
    };
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('particles-toggle', handleParticlesToggle);
    window.addEventListener('theme-changed', handleThemeChanged);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('particles-toggle', handleParticlesToggle);
      window.removeEventListener('theme-changed', handleThemeChanged);
    };
  }, []);

  // Use custom particle color if set, otherwise use theme color
  const activeColorKey = particleColor || theme;
  const colors = THEME_COLORS[activeColorKey] || THEME_COLORS.purple;

  const particles = useMemo(() => {
    if (!enabled) return [];
    
    return Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 4 + 2 + "px";
      const left = Math.random() * 100 + "%";
      const duration = Math.random() * 10 + 10 + "s";
      const delay = Math.random() * 5 + "s";
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return (
        <div
          key={`${activeColorKey}-${i}`}
          className="particle"
          style={{
            width: size,
            height: size,
            left: left,
            backgroundColor: color,
            "--duration": duration,
            "--delay": delay,
            boxShadow: `0 0 10px ${color}`
          }}
        />
      );
    });
  }, [colors, activeColorKey, enabled]);

  if (!enabled) return null;

  return <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">{particles}</div>;
};

export default ParticleSystem;