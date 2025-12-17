/**
 * BROWSER VIDEO ENCODER
 * WebGL2 + WebCodecs + MP4Box.js
 * Zero API calls - 100% in browser
 * Cyberspace computational power
 */

export class BrowserVideoEncoder {
  constructor(width = 1920, height = 1080, fps = 30) {
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.frameMs = 1000 / fps;
    
    // WebGL setup
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl = this.canvas.getContext('webgl2', { preserveDrawingBuffer: true });
    
    if (!this.gl) {
      throw new Error('WebGL2 not supported');
    }
    
    // Text canvas overlay
    this.textCanvas = document.createElement('canvas');
    this.textCanvas.width = width;
    this.textCanvas.height = height;
    this.ctx = this.textCanvas.getContext('2d');
    
    // Encoder
    this.encoder = null;
    this.chunks = [];
    this.frame = 0;
    this.t0 = performance.now();
  }

  // Initialize WebGL shaders
  initWebGL() {
    const { gl } = this;
    
    // Vertex shader
    const vertSrc = `#version 300 es
      in vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;
    
    // Fragment shader - neon cyberpunk background
    const fragSrc = `#version 300 es
      precision highp float;
      uniform float time;
      uniform vec2 resolution;
      out vec4 fragColor;
      
      vec3 neonColor(float t) {
        float r = sin(t) * 0.5 + 0.5;
        float g = sin(t + 2.1) * 0.5 + 0.5;
        float b = sin(t + 4.2) * 0.5 + 0.5;
        return vec3(r * 0.8, g * 0.4, b);
      }
      
      void main() {
        vec2 uv = (gl_FragCoord.xy / resolution.xy) * 2.0 - 1.0;
        uv.x *= resolution.x / resolution.y;
        
        float d = length(uv);
        float t = time * 0.2;
        vec3 bg = vec3(0.05, 0.0, 0.15);
        
        // Neon tunnel effect
        for(float i = 0.0; i < 5.0; i++) {
          float angle = atan(uv.y, uv.x) + t + i;
          float radius = 0.2 + 0.3 * sin(t + i);
          float mask = smoothstep(radius, radius + 0.02, d);
          bg += neonColor(angle * 3.0 + i) * mask * 0.3;
        }
        
        // Grid lines
        float grid = 0.0;
        vec2 gridUV = uv * 10.0;
        grid += step(0.98, fract(gridUV.x)) * 0.1;
        grid += step(0.98, fract(gridUV.y)) * 0.1;
        bg += vec3(0.5, 0.2, 0.8) * grid;
        
        // Vignette
        float vignette = smoothstep(1.5, 0.5, d);
        bg *= vignette;
        
        fragColor = vec4(bg, 1.0);
      }
    `;
    
    // Compile shaders
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertSrc);
    gl.compileShader(vertShader);
    
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragSrc);
    gl.compileShader(fragShader);
    
    // Link program
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertShader);
    gl.attachShader(this.program, fragShader);
    gl.linkProgram(this.program);
    
    // Setup vertices (fullscreen quad)
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]);
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    const posLoc = gl.getAttribLocation(this.program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    
    // Get uniform locations
    this.timeLoc = gl.getUniformLocation(this.program, 'time');
    this.resLoc = gl.getUniformLocation(this.program, 'resolution');
  }

  // Initialize WebCodecs encoder
  async initEncoder() {
    if (!window.VideoEncoder) {
      throw new Error('VideoEncoder not supported. Use Chrome/Edge 94+');
    }
    
    this.encoder = new VideoEncoder({
      output: (chunk, metadata) => {
        const buffer = new Uint8Array(chunk.byteLength);
        chunk.copyTo(buffer);
        this.chunks.push({ buffer, metadata, timestamp: chunk.timestamp });
      },
      error: (e) => console.error('Encoder error:', e)
    });
    
    await this.encoder.configure({
      codec: 'avc1.42001f', // H.264 baseline
      width: this.width,
      height: this.height,
      bitrate: 8_000_000, // 8 Mbps
      framerate: this.fps,
      hardwareAcceleration: 'prefer-hardware'
    });
  }

  // Draw text overlay
  drawText(lyrics, currentTime) {
    const { ctx, width, height } = this;
    
    ctx.clearRect(0, 0, width, height);
    
    // Find active lyrics
    const active = lyrics.filter(l => currentTime >= l.timing[0] && currentTime <= l.timing[1]);
    
    if (active.length === 0) return;
    
    let y = height * 0.6;
    
    active.forEach(lyric => {
      const timeSinceStart = currentTime - lyric.timing[0];
      const duration = lyric.timing[1] - lyric.timing[0];
      
      // Pop-in animation
      let scale = 1;
      let alpha = 1;
      if (timeSinceStart < 0.3) {
        const progress = timeSinceStart / 0.3;
        scale = 0.5 + progress * 0.5;
        alpha = progress;
      } else if (timeSinceStart > duration - 0.4) {
        const progress = (timeSinceStart - (duration - 0.4)) / 0.4;
        scale = 1 + progress * 0.3;
        alpha = 1 - progress;
      }
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(width / 2, y);
      ctx.scale(scale, scale);
      
      // Background
      if (lyric.hasBackground !== false) {
        ctx.fillStyle = lyric.backgroundColor || 'rgba(0, 0, 0, 0.8)';
        const textWidth = ctx.measureText(lyric.text).width;
        const padding = 30;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 20;
        ctx.fillRect(-textWidth / 2 - padding, -30, textWidth + padding * 2, 80);
        ctx.shadowBlur = 0;
      }
      
      // Text with outline
      ctx.font = `bold ${lyric.size || 48}px 'Bungee Inline', Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.strokeStyle = lyric.outlineColor || '#000000';
      ctx.lineWidth = lyric.outlineWidth || 6;
      ctx.lineJoin = 'round';
      ctx.strokeText(lyric.text, 0, 0);
      ctx.strokeText(lyric.text, 0, 0); // Double stroke
      
      ctx.fillStyle = lyric.color || '#FFFFFF';
      ctx.fillText(lyric.text, 0, 0);
      
      // Glow effect
      ctx.shadowColor = lyric.color || '#FFFFFF';
      ctx.shadowBlur = 15;
      ctx.fillText(lyric.text, 0, 0);
      
      ctx.restore();
      
      y += 100;
    });
  }

  // Render single frame
  renderFrame(time, lyrics, backgrounds) {
    const { gl, width, height } = this;
    
    // 1. Draw WebGL background
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.program);
    gl.uniform1f(this.timeLoc, time);
    gl.uniform2f(this.resLoc, width, height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    // 2. Draw text overlay
    this.drawText(lyrics, time);
    
    // 3. Composite text on WebGL
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Create texture from text canvas
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  // Encode video
  async encodeVideo(plan, audioDuration, onProgress) {
    await this.initEncoder();
    this.initWebGL();
    
    const totalFrames = Math.ceil(audioDuration * this.fps);
    this.chunks = [];
    this.frame = 0;
    
    for (let frame = 0; frame < totalFrames; frame++) {
      const time = frame / this.fps;
      
      // Render frame
      this.renderFrame(time, plan.lyrics, plan.backgrounds);
      
      // Read pixels
      const pixels = new Uint8Array(this.width * this.height * 4);
      this.gl.readPixels(0, 0, this.width, this.height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
      
      // Create VideoFrame
      const videoFrame = new VideoFrame(pixels, {
        format: 'RGBA',
        codedWidth: this.width,
        codedHeight: this.height,
        timestamp: frame * (1_000_000 / this.fps)
      });
      
      // Encode frame
      this.encoder.encode(videoFrame, { keyFrame: frame % 30 === 0 });
      videoFrame.close();
      
      // Progress
      if (onProgress) {
        onProgress((frame / totalFrames) * 100);
      }
      
      // Yield to browser
      if (frame % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    await this.encoder.flush();
    await this.encoder.close();
    
    return this.chunks;
  }

  // Mux video + audio into MP4 (simplified)
  async createMP4(videoChunks, audioBlob) {
    // For now, return video-only WebM
    // Full MP4 muxing requires mp4box.js
    const blob = new Blob(
      videoChunks.map(c => c.buffer),
      { type: 'video/webm' }
    );
    
    return blob;
  }

  // Cleanup
  cleanup() {
    if (this.encoder) {
      this.encoder.close();
    }
    if (this.gl) {
      this.gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  }
}

export default BrowserVideoEncoder;