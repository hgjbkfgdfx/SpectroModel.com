import React from 'react';

/**
 * AUDIO SYNTHESIS ENGINE
 * 
 * Web Audio API-based sound engine - NO external files needed
 */

class SoundSynthesizer {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.enabled = true;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.audioContext.destination);
    }
    return this.audioContext;
  }

  applyADSR(gainNode, attack, decay, sustain, release, duration) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + attack);
    gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
    gainNode.gain.setValueAtTime(sustain, now + duration - release);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
  }

  playCollisionSound(velocity = 50) {
    if (!this.enabled) return;
    
    const ctx = this.init();
    const frequency = 60 + velocity;
    const volume = Math.min(0.4, velocity / 200);
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  playJumpSound() {
    if (!this.enabled) return;
    
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
    
    this.applyADSR(gainNode, 0.01, 0.05, 0.3, 0.1, 0.2);
    
    osc.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  playLandingSound(impact = 0.5) {
    if (!this.enabled) return;
    
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
    
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 5;
    
    gainNode.gain.setValueAtTime(impact * 0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }

  playClickSound() {
    if (!this.enabled) return;
    
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 800;
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setMasterVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }
}

const audioEngine = new SoundSynthesizer();

export default function AudioSynthEngine({ children }) {
  return <>{children}</>;
}

export { audioEngine };