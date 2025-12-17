/**
 * BROWSER-BASED PROCEDURAL GENERATOR
 * Generates all assets in browser - no API calls
 * Uses Canvas API, Web Audio API, and procedural algorithms
 * Free computational power - runs in cyberspace
 */

export class BrowserProceduralGenerator {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 1920;
    this.canvas.height = 1080;
  }

  // Generate 3D layered backgrounds procedurally
  generateLayeredBackground(layer, theme = 'cyberpunk') {
    const { ctx, canvas } = this;
    
    // Clear canvas
    ctx.clearRect(0, 0, 1920, 1080);
    
    if (theme === 'cyberpunk') {
      this.drawCyberpunkLayer(layer);
    } else if (theme === 'performance') {
      this.drawPerformanceLayer(layer);
    } else if (theme === 'narrative') {
      this.drawNarrativeLayer(layer);
    }
    
    return canvas.toDataURL('image/png');
  }

  drawCyberpunkLayer(layer) {
    const { ctx } = this;
    
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1080);
    if (layer === 0) {
      grad.addColorStop(0, '#0a0015');
      grad.addColorStop(1, '#1a0030');
    } else if (layer === 1) {
      grad.addColorStop(0, '#1a0a3a');
      grad.addColorStop(1, '#2a1a5a');
    } else {
      grad.addColorStop(0, '#2a1a5a');
      grad.addColorStop(1, '#3a2a7a');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1920, 1080);
    
    // Grid lines
    ctx.strokeStyle = `rgba(138, 43, 226, ${0.2 + layer * 0.1})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      const x = (i / 20) * 1920;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1080);
      ctx.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const y = (i / 12) * 1080;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1920, y);
      ctx.stroke();
    }
    
    // Neon circles
    const circleCount = 8 + layer * 4;
    for (let i = 0; i < circleCount; i++) {
      const x = Math.random() * 1920;
      const y = Math.random() * 1080;
      const radius = 50 + Math.random() * 150;
      const circleGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      circleGrad.addColorStop(0, `rgba(138, 43, 226, ${0.3 + layer * 0.1})`);
      circleGrad.addColorStop(1, 'rgba(138, 43, 226, 0)');
      ctx.fillStyle = circleGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Light streaks
    ctx.strokeStyle = `rgba(157, 78, 221, ${0.5 + layer * 0.2})`;
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 1920, -100);
      ctx.lineTo(Math.random() * 1920, 1180);
      ctx.stroke();
    }
  }

  drawPerformanceLayer(layer) {
    const { ctx } = this;
    
    // Stage gradient
    const grad = ctx.createRadialGradient(960, 800, 0, 960, 800, 1000);
    grad.addColorStop(0, '#3a1a5a');
    grad.addColorStop(0.5, '#1a0a3a');
    grad.addColorStop(1, '#0a0020');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1920, 1080);
    
    // Spotlights
    const spotlightCount = 3 + layer * 2;
    for (let i = 0; i < spotlightCount; i++) {
      const x = 400 + (i / spotlightCount) * 1120;
      const y = 200;
      const spotGrad = ctx.createRadialGradient(x, y, 0, x, y, 400);
      spotGrad.addColorStop(0, `rgba(255, 255, 200, ${0.4 + layer * 0.1})`);
      spotGrad.addColorStop(1, 'rgba(255, 255, 200, 0)');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(x, y, 400, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Crowd silhouettes
    if (layer === 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * 1920;
        const height = 100 + Math.random() * 100;
        ctx.fillRect(x, 1080 - height, 30, height);
      }
    }
  }

  drawNarrativeLayer(layer) {
    const { ctx } = this;
    
    // Cinematic gradient
    const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(0.5, '#16213e');
    grad.addColorStop(1, '#0f3460');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1920, 1080);
    
    // Bokeh circles
    const bokehCount = 15 + layer * 5;
    for (let i = 0; i < bokehCount; i++) {
      const x = Math.random() * 1920;
      const y = Math.random() * 1080;
      const radius = 30 + Math.random() * 70;
      const bokehGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const hue = Math.random() * 60 + 180;
      bokehGrad.addColorStop(0, `hsla(${hue}, 70%, 60%, ${0.2 + layer * 0.1})`);
      bokehGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bokehGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Generate music video scenes procedurally
  generateMusicVideoScene(sceneType, artistFeatures) {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, 1920, 1080);
    
    switch(sceneType) {
      case 'performance':
        this.drawPerformanceScene(artistFeatures);
        break;
      case 'narrative':
        this.drawNarrativeScene(artistFeatures);
        break;
      case 'lifestyle':
        this.drawLifestyleScene(artistFeatures);
        break;
      case 'conceptual':
        this.drawConceptualScene(artistFeatures);
        break;
      case 'vfx':
        this.drawVFXScene(artistFeatures);
        break;
      default:
        this.drawPerformanceScene(artistFeatures);
    }
    
    return canvas.toDataURL('image/png');
  }

  drawPerformanceScene(features) {
    const { ctx } = this;
    
    // Stage floor
    const floorGrad = ctx.createLinearGradient(0, 600, 0, 1080);
    floorGrad.addColorStop(0, '#2a1a4a');
    floorGrad.addColorStop(1, '#1a0a2a');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 600, 1920, 480);
    
    // Stage lights
    for (let i = 0; i < 6; i++) {
      const x = 200 + i * 320;
      const lightGrad = ctx.createRadialGradient(x, 100, 0, x, 400, 300);
      lightGrad.addColorStop(0, 'rgba(255, 200, 100, 0.8)');
      lightGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.arc(x, 400, 300, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Artist silhouette (center stage)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.beginPath();
    ctx.ellipse(960, 700, 150, 300, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow around artist
    const glowGrad = ctx.createRadialGradient(960, 700, 0, 960, 700, 400);
    glowGrad.addColorStop(0, 'rgba(138, 43, 226, 0.6)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(960, 700, 400, 0, Math.PI * 2);
    ctx.fill();
  }

  drawNarrativeScene(features) {
    const { ctx } = this;
    
    // Cinematic background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 600);
    skyGrad.addColorStop(0, '#ff6b6b');
    skyGrad.addColorStop(1, '#4ecdc4');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1920, 600);
    
    // Ground
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 600, 1920, 480);
    
    // Buildings
    for (let i = 0; i < 8; i++) {
      const x = i * 250;
      const height = 300 + Math.random() * 300;
      ctx.fillStyle = `rgba(44, 62, 80, ${0.7 + Math.random() * 0.3})`;
      ctx.fillRect(x, 600 - height, 200, height);
    }
  }

  drawLifestyleScene(features) {
    const { ctx } = this;
    
    // Urban gradient
    const urbanGrad = ctx.createLinearGradient(0, 0, 1920, 1080);
    urbanGrad.addColorStop(0, '#667eea');
    urbanGrad.addColorStop(1, '#764ba2');
    ctx.fillStyle = urbanGrad;
    ctx.fillRect(0, 0, 1920, 1080);
    
    // Street elements
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 800, 1920, 280);
    
    // Graffiti-style elements
    ctx.fillStyle = 'rgba(231, 76, 60, 0.7)';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(200 + i * 300, 500 + Math.random() * 100, 150, 100);
    }
  }

  drawConceptualScene(features) {
    const { ctx } = this;
    
    // Abstract gradient
    const abstractGrad = ctx.createRadialGradient(960, 540, 0, 960, 540, 1000);
    abstractGrad.addColorStop(0, '#ee0979');
    abstractGrad.addColorStop(1, '#ff6a00');
    ctx.fillStyle = abstractGrad;
    ctx.fillRect(0, 0, 1920, 1080);
    
    // Geometric shapes
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * 1920;
      const y = Math.random() * 1080;
      const size = 100 + Math.random() * 200;
      ctx.fillStyle = `hsla(${Math.random() * 360}, 70%, 60%, 0.4)`;
      ctx.fillRect(x - size/2, y - size/2, size, size);
    }
  }

  drawVFXScene(features) {
    const { ctx } = this;
    
    // Space-like background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1920, 1080);
    
    // Stars
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 1920;
      const y = Math.random() * 1080;
      const size = Math.random() * 3;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Nebula effect
    const nebulaGrad = ctx.createRadialGradient(960, 540, 0, 960, 540, 800);
    nebulaGrad.addColorStop(0, 'rgba(138, 43, 226, 0.4)');
    nebulaGrad.addColorStop(0.5, 'rgba(157, 78, 221, 0.2)');
    nebulaGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 0, 1920, 1080);
    
    // Energy particles
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 1920;
      const y = Math.random() * 1080;
      const particleGrad = ctx.createRadialGradient(x, y, 0, x, y, 20);
      particleGrad.addColorStop(0, 'rgba(199, 125, 255, 0.8)');
      particleGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = particleGrad;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Generate lyric video plan locally
  generateLyricVideoPlan(artistName, songTitle, lyrics) {
    const lines = lyrics.split('\n').filter(l => l.trim());
    const segmentDuration = 4; // 2 bars at typical tempo
    
    const lyricSegments = [];
    let currentTime = 5; // Start after title
    
    for (let i = 0; i < lines.length; i += 2) {
      const text = lines.slice(i, i + 2).join(' ');
      if (!text.trim()) continue;
      
      lyricSegments.push({
        text: text,
        timing: [currentTime, currentTime + segmentDuration],
        font: 'Bungee Inline',
        size: 48,
        color: '#FFFFFF',
        outlineColor: '#000000',
        outlineWidth: 6,
        hasBackground: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        animation: 'pop-scale',
        section: i < lines.length / 2 ? 'verse' : 'chorus'
      });
      
      currentTime += segmentDuration;
    }
    
    const complementaryEmojis = ['⚔️', '💀', '⭐', '🚗', '🛡️', '⚡', '💎', '🔥', '👑', '🎸', '🎤', '🎵'];
    const elements = [];
    
    for (let i = 0; i < 15; i++) {
      const emoji = complementaryEmojis[Math.floor(Math.random() * complementaryEmojis.length)];
      elements.push({
        emoji: emoji,
        x: 0.1 + Math.random() * 0.8,
        y: 0.1 + Math.random() * 0.8,
        size: 60 + Math.random() * 60,
        timing: [Math.random() * currentTime, currentTime],
        animation: 'orbit-pulse',
        rotationSpeed: 1 + Math.random() * 2,
        pulseSpeed: 3 + Math.random() * 2
      });
    }
    
    return {
      title: {
        text: songTitle,
        font: 'Bungee Inline',
        size: 72,
        timing: [0, 5],
        color: '#FFFFFF',
        outlineColor: '#000000',
        outlineWidth: 8,
        hasBackground: true,
        backgroundColor: 'rgba(138, 43, 226, 0.9)'
      },
      artistName: {
        text: artistName,
        font: 'Bungee Inline',
        size: 72,
        timing: [0, 5],
        color: '#FFFFFF',
        outlineColor: '#000000',
        outlineWidth: 8,
        hasBackground: true,
        backgroundColor: 'rgba(138, 43, 226, 0.9)'
      },
      lyrics: lyricSegments,
      backgrounds: [
        { description: 'neon cyberpunk city', layer: 0, depth: 3, parallaxSpeed: 0.15 },
        { description: 'vibrant neon lights', layer: 1, depth: 2, parallaxSpeed: 0.25 },
        { description: 'neon elements overlay', layer: 2, depth: 1, parallaxSpeed: 0.35 }
      ],
      elements: elements,
      colorScheme: ['#8B00FF', '#9D4EDD', '#C77DFF', '#E0AAFF']
    };
  }
}

export default BrowserProceduralGenerator;