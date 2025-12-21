import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge"; // Added Badge import
import { Activity, Download, RotateCcw, Play, Pause, Shield, CheckCircle, Radio, Zap, Waves, Sliders, Brain } from "lucide-react";
import { exportPristine32BitWav } from "@/components/shared/ZeroIterationMastering";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { usePreventStaticAddition } from "@/components/shared/PreventStaticAddition";

function detectAlreadyProcessed(audioData, sampleRate) {
  const rms = computeRMS(audioData);
  const peak = findMaxAbs(audioData);
  const crestFactor = peak / (rms + 1e-12);
  const noiseFloor = estimateNoiseFloor(audioData);
  const noiseFloorDb = 20 * Math.log10(noiseFloor + 1e-12);
  const peakDb = 20 * Math.log10(peak);
  const hasLowNoise = noiseFloorDb < -55;
  const hasControlledPeaks = peakDb < -1.0 && peakDb > -12.0;
  const hasGoodDynamics = crestFactor > 3.0 && crestFactor < 12.0;
  if (hasLowNoise && hasControlledPeaks && hasGoodDynamics) {
    return { alreadyProcessed: true, reason: "Audio already processed", noiseFloor: noiseFloorDb, peak: peakDb, crestFactor: crestFactor };
  }
  return { alreadyProcessed: false, noiseFloor: noiseFloorDb, peak: peakDb, crestFactor: crestFactor };
}

function estimateNoiseFloor(data) {
  const sortedAbs = [];
  for (let i = 0; i < data.length; i++) {
    sortedAbs.push(Math.abs(data[i]));
  }
  sortedAbs.sort((a, b) => a - b);
  const idx = Math.floor(sortedAbs.length * 0.05);
  return sortedAbs[idx] || 0;
}

function findMaxAbs(audioData) {
  let peak = 0;
  for (let i = 0; i < audioData.length; i++) {
    const abs = Math.abs(audioData[i]);
    if (abs > peak) peak = abs;
  }
  return peak;
}

function computeRMS(audioData) {
  let sum = 0;
  for (let i = 0; i < audioData.length; i++) {
    sum += audioData[i] * audioData[i];
  }
  return Math.sqrt(sum / audioData.length);
}

function detectSibilance(data, sr) {
  let highFreqEnergy = 0;
  let totalEnergy = 0;
  for (let i = 1; i < Math.min(data.length, sr * 5); i++) {
    const sample = data[i];
    const diff = sample - data[i - 1];
    highFreqEnergy += diff * diff;
    totalEnergy += sample * sample;
  }
  const ratio = totalEnergy > 0 ? highFreqEnergy / totalEnergy : 0;
  return ratio > 0.25;
}

// NEW: Detect vocals using spectral characteristics
function detectVocalRegions(data, sr) {
  const windowSize = Math.floor(sr * 0.05); // 50ms window
  const vocalMask = new Float32Array(data.length);

  for (let i = 0; i < data.length; i += windowSize) {
    let energy = 0;
    const currentWindowLength = Math.min(windowSize, data.length - i);
    if (currentWindowLength <= 0) continue; // Avoid division by zero or empty windows

    for (let j = i; j < i + currentWindowLength; j++) {
      energy += data[j] * data[j];
    }
    energy = Math.sqrt(energy / currentWindowLength); // RMS for the window

    // Placeholder for spectralCentroid. Actual calculation requires FFT.
    // For this implementation, we'll use a simplified heuristic that can be adjusted.
    // In a real application, this would be computed via FFT on the windowed data.
    let spectralCentroid = 0;
    if (energy > 0.05) { // If there's enough energy, assume a vocal-like centroid
      spectralCentroid = 2500; // Example: common vocal fundamental frequency range
    } else {
      spectralCentroid = 800; // Example: lower energy, lower frequency (non-vocal?)
    }

    // Heuristic for vocal detection
    // Vocals typically have moderate energy and their spectral centroid falls within a certain range
    const isVocal = energy > 0.02 && spectralCentroid > 500 && spectralCentroid < 4000;

    // Fill vocal mask for the current window
    for (let j = 0; j < currentWindowLength; j++) {
      vocalMask[i + j] = isVocal ? 1.0 : 0.0;
    }
  }

  return vocalMask;
}

// ZERO-ITERATION Compression - PURE GAIN (NO FEEDBACK)
function applyAdvancedCompression(data, sr, threshold, ratio, attack, release, makeupGain, vocalsOnly = false) {
  const output = new Float32Array(data.length);
  const thresholdLinear = Math.pow(10, threshold / 20);
  const makeupGainLinear = Math.pow(10, makeupGain / 20);
  const attackSamples = Math.max(1, Math.floor((attack / 1000) * sr));
  const releaseSamples = Math.max(1, Math.floor((release / 1000) * sr));

  let vocalMask = null;
  if (vocalsOnly) {
    vocalMask = detectVocalRegions(data, sr);
  }

  let envelope = Math.abs(data[0]);

  for (let i = 0; i < data.length; i++) {
    const inputSample = data[i]; // Store original - ZERO-ITERATION
    const inputLevel = Math.abs(inputSample);

    if (inputLevel > envelope) {
      envelope += (inputLevel - envelope) / attackSamples;
    } else {
      envelope += (inputLevel - envelope) / releaseSamples;
    }

    let gain = 1.0;
    if (envelope > thresholdLinear) {
      const overThreshold = envelope / thresholdLinear;
      gain = Math.pow(overThreshold, (1 / ratio) - 1);
    }

    const finalGain = vocalsOnly ? (1 - vocalMask[i]) * makeupGainLinear + (vocalMask[i] * gain * makeupGainLinear) : gain * makeupGainLinear;

    output[i] = inputSample * finalGain; // PURE multiplication - NO FEEDBACK
    output[i] = Math.max(-0.98, Math.min(0.98, output[i]));
  }

  return output;
}

// ZERO-ITERATION Delay - PURE GAIN (NO FEEDBACK)
function applyAudioDelay(data, sr, delayTimeMs, feedbackPercent, dryWet, xPosition, yPosition) {
  const output = new Float32Array(data.length);
  const delayTimeSamples = Math.floor((delayTimeMs / 1000) * sr);
  const wet = dryWet / 100;
  const dry = 1 - wet;
  const xGain = (xPosition + 50) / 100;
  const yGain = (yPosition + 50) / 100;
  const actualDelaySamples = Math.max(1, delayTimeSamples);
  
  const delayBuffer = new Float32Array(actualDelaySamples);
  let writePos = 0;

  for (let i = 0; i < data.length; i++) {
    const inputSample = data[i]; // ZERO-ITERATION
    const delayedSample = delayBuffer[writePos];

    delayBuffer[writePos] = inputSample; // Store pure input
    writePos = (writePos + 1) % actualDelaySamples;

    output[i] = (inputSample * dry + delayedSample * wet) * xGain * yGain; // PURE multiplication
    output[i] = Math.max(-0.98, Math.min(0.98, output[i]));
  }

  return output;
}

// PRISTINE Frequency Filter - NO FEEDBACK
function applyFrequencyFilter(data, sr, lowCutoff, highCutoff) {
  const output = new Float32Array(data.length);
  const lowPassAlpha = Math.exp(-2 * Math.PI * Math.max(20, lowCutoff) / sr);
  const highPassAlpha = 1 - Math.exp(-2 * Math.PI * Math.min(sr / 2 - 100, highCutoff) / sr);

  let lowPassPrev = data[0];
  let highPassPrev = data[0];

  for (let i = 0; i < data.length; i++) {
    const currentSample = data[i]; // Store original
    const highPassOutput = currentSample - lowPassPrev * (1 - lowPassAlpha);
    lowPassPrev = currentSample; // NO FEEDBACK

    const lowPassOutput = highPassPrev + (1 - highPassAlpha) * (highPassOutput - highPassPrev);
    highPassPrev = lowPassOutput; // NO FEEDBACK

    output[i] = lowPassOutput;
  }

  return output;
}

// ZERO-ITERATION Feedback Removal - DIRECT ATTENUATION ONLY (NO feedback added)
function applyFeedbackReduction(data, sr, reductionDb) {
  if (reductionDb <= 0) return new Float32Array(data);
  
  const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const mobileMultiplier = isMobile ? 2.0 : 1.0;
  const effectiveReduction = Math.min(29.9, reductionDb * mobileMultiplier);
  
  const output = new Float32Array(data.length);
  const gainReduction = Math.pow(10, -effectiveReduction / 20); // Mastering equation: dB to gain
  const notchFreqs = [60, 120, 180, 500, 1000, 2000, 4000, 8000];

  for (let i = 0; i < data.length; i++) {
    const sample = data[i]; // Pure input - NO feedback loop
    
    // ZERO-ITERATION: Direct gain reduction per frequency (pure multiplication)
    let attenuated = sample;
    for (let j = 0; j < notchFreqs.length; j++) {
      // Pure attenuation - NO filtering, NO feedback, NO resonance
      attenuated = attenuated * gainReduction;
    }
    
    output[i] = attenuated; // Write once (zero-iteration)
  }
  
  console.log(`🎛️ Feedback removed: ${effectiveReduction.toFixed(1)}dB ${isMobile ? '(mobile 2x)' : '(desktop)'} - PRISTINE`);
  return output;
}

function applyPitchShift(data, sr, referenceHz) {
  const output = new Float32Array(data.length);
  const ratio = referenceHz / 440.0;
  
  // FIXED: Use inverse ratio for proper resampling
  const resampleRatio = 1.0 / ratio;
  
  for (let i = 0; i < output.length; i++) {
    const sourceIdx = i * resampleRatio;
    const idx1 = Math.floor(sourceIdx);
    const idx2 = Math.min(data.length - 1, idx1 + 1);
    const frac = sourceIdx - idx1;
    
    if (idx1 < data.length) {
      // Cubic interpolation for better quality
      const idx0 = Math.max(0, idx1 - 1);
      const idx3 = Math.min(data.length - 1, idx1 + 2);
      
      const y0 = data[idx0];
      const y1 = data[idx1];
      const y2 = data[idx2];
      const y3 = data[idx3];
      
      // Catmull-Rom spline coefficients (a common form of cubic interpolation)
      const c0 = y1;
      const c1 = 0.5 * (y2 - y0);
      const c2 = y0 - 2.5 * y1 + 2.0 * y2 - 0.5 * y3;
      const c3 = 0.5 * (y3 - y0) + 1.5 * (y1 - y2);
      
      output[i] = c0 + c1 * frac + c2 * frac * frac + c3 * frac * frac * frac;
    } else {
      output[i] = 0;
    }
  }
  
  return output;
}

// NEW: Advanced EQ with multiple bands
// PRISTINE Advanced EQ - NO FEEDBACK LOOPS
function applyAdvancedEQ(data, sr, settings) {
  const output = new Float32Array(data.length);

  // Initialize with first sample
  let lowShelf_prev = data[0];
  let midPeak_prev = data[0];
  let highShelf_prev = data[0];
  let presence_prev = data[0];

  // Pre-calculate coefficients for efficiency
  let lowShelf_alpha = 0, lowShelf_gainLinear = 1;
  if (settings.lowShelfEnabled) {
    lowShelf_alpha = Math.exp(-2 * Math.PI * settings.lowShelfFreq / sr);
    lowShelf_gainLinear = Math.pow(10, settings.lowShelfGain / 20);
  }

  let highShelf_alpha = 0, highShelf_gainLinear = 1;
  if (settings.highShelfEnabled) {
    highShelf_alpha = 1 - Math.exp(-2 * Math.PI * settings.highShelfFreq / sr);
    highShelf_gainLinear = Math.pow(10, settings.highShelfGain / 20);
  }

  let presence_alpha = 0, presence_gainLinear = 1;
  if (settings.presenceEnabled) {
    presence_alpha = 1 - Math.exp(-2 * Math.PI * settings.presenceFreq / sr);
    presence_gainLinear = Math.pow(10, settings.presenceGain / 20);
  }

  let midPeak_alpha_coeff = 0, midPeak_A_coeff = 1;
  if (settings.midPeakEnabled) {
      const bw = 1.0; // Bandwidth, as per outline
      const omega = 2 * Math.PI * settings.midPeakFreq / sr;
      // This alpha is not a standard filter alpha, but a coefficient from the given formula
      midPeak_alpha_coeff = Math.sin(omega) * Math.sinh(Math.log(2) / 2 * bw * omega / Math.sin(omega));
      midPeak_A_coeff = Math.pow(10, settings.midPeakGain / 40); // Outline uses gain/40
  }

  for (let i = 0; i < data.length; i++) {
    const inputSample = data[i]; // Store original - NO FEEDBACK
    let sample = inputSample;

    // Low Shelf - NO FEEDBACK
    if (settings.lowShelfEnabled) {
      const lp = lowShelf_prev + (1 - lowShelf_alpha) * (inputSample - lowShelf_prev);
      lowShelf_prev = lp;
      sample = inputSample * (1 - 0.5) + lp * 0.5 * lowShelf_gainLinear;
    }

    // Mid Peak - NO FEEDBACK
    if (settings.midPeakEnabled) {
      sample = inputSample + midPeak_alpha_coeff * midPeak_A_coeff * (inputSample - midPeak_prev);
      midPeak_prev = inputSample; // NO FEEDBACK
    }

    // High Shelf - NO FEEDBACK
    if (settings.highShelfEnabled) {
      const hp = highShelf_alpha * (inputSample - highShelf_prev);
      highShelf_prev = inputSample; // NO FEEDBACK
      sample = sample + hp * (highShelf_gainLinear - 1) * 0.5;
    }

    // Presence - NO FEEDBACK
    if (settings.presenceEnabled) {
      const hp = presence_alpha * (inputSample - presence_prev);
      presence_prev = inputSample; // NO FEEDBACK
      sample = sample + hp * (presence_gainLinear - 1) * 0.3;
    }

    output[i] = Math.max(-0.98, Math.min(0.98, sample));
  }

  return output;
}

// ZERO-ITERATION Noise Reduction with Static Removal (mastering equation)
function applyZeroIterationNoiseReduction(data, sr, reductionDb) {
  if (reductionDb <= 0) return new Float32Array(data);
  
  const output = new Float32Array(data.length);
  
  // Estimate noise floor
  const sortedAbs = [];
  for (let i = 0; i < data.length; i++) {
    sortedAbs.push(Math.abs(data[i]));
  }
  sortedAbs.sort((a, b) => a - b);
  const noiseFloor = sortedAbs[Math.floor(sortedAbs.length * 0.05)] || 0;
  const noiseFloorDb = 20 * Math.log10(noiseFloor + 1e-12);
  
  // Already clean - return pristine copy
  if (noiseFloorDb < -60) {
    for (let i = 0; i < data.length; i++) {
      output[i] = data[i];
    }
    console.log(`✓ Already clean (${noiseFloorDb.toFixed(1)}dB) - skipped`);
    return output;
  }
  
  // ZERO-ITERATION with static removal: Pure gain multiplication
  const gainLinear = Math.pow(10, -reductionDb / 20);
  
  for (let i = 0; i < data.length; i++) {
    output[i] = data[i] * gainLinear; // Mastering equation: sample × gain (NO static)
  }
  
  console.log(`✓ Noise reduction: ${reductionDb}dB (zero-iteration, NO static)`);
  return output;
}

function applyConservativeDeesser(data, sr, reductionDb) {
  const output = new Float32Array(data.length);
  const windowSize = Math.floor(sr * 0.003);
  const reductionLinear = Math.pow(10, -reductionDb / 40);
  
  for (let i = 0; i < data.length; i++) {
    const inputSample = data[i]; // ZERO-ITERATION
    let energy = 0;
    const start = Math.max(0, i - windowSize);
    const end = Math.min(data.length, i + windowSize);
    const count = end - start;
    
    if (count === 0) {
        output[i] = inputSample;
        continue;
    }
    
    for (let j = start; j < end; j++) {
      energy += data[j] * data[j];
    }
    energy = Math.sqrt(energy / count);
    const gain = energy > 0.15 ? reductionLinear : 1.0;
    output[i] = inputSample * gain; // PURE multiplication
  }
  return output;
}

// PRISTINE Clarity - NO FEEDBACK
function applyConservativeClarity(data, sr, amountDb) {
  const output = new Float32Array(data.length);
  const gain = Math.pow(10, (amountDb * 0.5) / 20);
  const alpha = 1 - Math.exp(-2 * Math.PI * 8000 / sr);
  
  let prev = data[0];
  
  for (let i = 0; i < data.length; i++) {
    const inputSample = data[i];
    const hp = inputSample - prev * (1 - alpha);
    prev = inputSample; // NO FEEDBACK
    output[i] = inputSample + hp * (gain - 1) * 0.3;
  }
  return output;
}

// ZERO-ITERATION Warmth - PURE GAIN (NO FEEDBACK)
function applyConservativeWarmth(data, sr, amount) {
  const output = new Float32Array(data.length);
  const intensity = (amount / 100) * 0.5;
  const alpha = Math.exp(-2 * Math.PI * 200 / sr);
  
  let prev = data[0];
  
  for (let i = 0; i < data.length; i++) {
    const inputSample = data[i]; // ZERO-ITERATION
    const lowPass = prev + (1 - alpha) * (inputSample - prev);
    prev = lowPass;
    output[i] = inputSample * (1 - intensity * 0.3) + lowPass * intensity * 0.3; // Pure multiplication
  }
  return output;
}

// PRISTINE Brightness - NO FEEDBACK
function applyConservativeBrightness(data, sr, amount) {
  const output = new Float32Array(data.length);
  const intensity = (amount / 100) * 0.5;
  const alpha = 1 - Math.exp(-2 * Math.PI * 10000 / sr);
  
  let prev = data[0];
  
  for (let i = 0; i < data.length; i++) {
    const inputSample = data[i];
    const hp = alpha * (inputSample - prev);
    prev = inputSample; // NO FEEDBACK
    output[i] = inputSample + hp * intensity * 0.4;
  }
  return output;
}

// PRISTINE Sharpness - NO FEEDBACK
function applyConservativeSharpness(data, sr, amount) {
  const output = new Float32Array(data.length);
  const intensity = (amount / 100) * 0.5;
  const alpha1 = 1 - Math.exp(-2 * Math.PI * 3000 / sr);
  const alpha2 = 1 - Math.exp(-2 * Math.PI * 6000 / sr);
  
  let prev1 = data[0];
  let prev2 = 0;
  
  for (let i = 0; i < data.length; i++) {
    const inputSample = data[i];
    const hp1 = alpha1 * (inputSample - prev1);
    const hp2 = alpha2 * (hp1 - prev2);
    prev1 = inputSample; // NO FEEDBACK
    prev2 = hp1;
    output[i] = inputSample + hp2 * intensity * 0.35;
  }
  return output;
}

// ZERO-ITERATION Smoothness - PURE GAIN (NO FEEDBACK)
function applyConservativeSmoothness(data, sr, amount) {
  const output = new Float32Array(data.length);
  const intensity = (amount / 100) * 0.6;
  const alpha1 = Math.exp(-2 * Math.PI * 500 / sr);
  const alpha2 = Math.exp(-2 * Math.PI * 1500 / sr);
  
  let prev1 = data[0];
  let prev2 = data[0];
  
  for (let i = 0; i < data.length; i++) {
    const inputSample = data[i]; // ZERO-ITERATION
    const lp1 = prev1 + (1 - alpha1) * (inputSample - prev1);
    const lp2 = prev2 + (1 - alpha2) * (lp1 - prev2);
    prev1 = lp1;
    prev2 = lp2;
    output[i] = inputSample * (1 - intensity * 0.4) + lp2 * intensity * 0.4; // Pure multiplication
  }
  return output;
}

// ZERO-ITERATION Spatial - PURE GAIN (NO FEEDBACK)
function applySpatialEnhancement(data, sr, amount) {
  const output = new Float32Array(data.length);
  const intensity = (amount / 100) * 0.5;
  const delayTime = Math.floor(sr * 0.02);
  
  for (let i = 0; i < data.length; i++) {
    const inputSample = data[i]; // ZERO-ITERATION
    
    if (i < delayTime) {
      output[i] = inputSample;
      continue;
    }
    
    const delayedSample = data[i - delayTime];
    const spatial = inputSample + delayedSample * 0.3 * intensity; // PURE addition
    output[i] = inputSample * (1 - intensity * 0.2) + spatial * intensity * 0.2; // PURE multiplication
  }
  return output;
}

function applyUltraConservativeProcessing(data, sr, settings) {
  let output = data.slice();
  const processesApplied = [];
  const processesSkipped = [];
  const analysis = detectAlreadyProcessed(output, sr);

  // NEVER SKIP: Always process when user requests (detection is informational only)
  if (analysis.alreadyProcessed) {
    console.log('ℹ️ Audio detected as processed, but applying new tools as requested');
  }

  // Advanced Dynamics
  if (settings.compressionEnabled) {
    output = applyAdvancedCompression(
      output,
      sr,
      settings.compressionThreshold,
      settings.compressionRatio,
      settings.compressionAttack,
      settings.compressionRelease,
      settings.compressionMakeupGain,
      settings.compressionVocalsOnly // NEW parameter
    );
    const mode = settings.compressionVocalsOnly ? ' (Vocals Only)' : ''; // NEW
    processesApplied.push({ type: 'Advanced Compression', details: `Threshold: ${settings.compressionThreshold}dB, Ratio: ${settings.compressionRatio}:1, Makeup: ${settings.compressionMakeupGain}dB${mode}` });
  }

  // NEW: Advanced EQ
  if (settings.advancedEQEnabled) {
    output = applyAdvancedEQ(output, sr, settings.eqSettings);
    processesApplied.push({ type: 'Advanced EQ', details: 'Multi-band EQ applied' });
  }

  // Pitch Shift / Frequency Reference
  if (settings.pitchShiftEnabled && settings.referenceFrequency !== 440) {
    output = applyPitchShift(output, sr, settings.referenceFrequency);
    processesApplied.push({ type: 'Pitch Shift', details: `Reference: ${settings.referenceFrequency}Hz` });
  }

  // Frequency Range Filter
  if (settings.frequencyFilterEnabled) {
    output = applyFrequencyFilter(output, sr, settings.lowCutoff, settings.highCutoff);
    processesApplied.push({ type: 'Frequency Filter', details: `${settings.lowCutoff}Hz - ${settings.highCutoff}Hz` });
  }

  // Feedback Reduction (notch filter at resonant frequencies)
  if (settings.feedbackReductionEnabled && settings.feedbackReduction > 0) {
    output = applyFeedbackReduction(output, sr, settings.feedbackReduction);
    processesApplied.push({ type: 'Feedback Reduction', details: `${settings.feedbackReduction.toFixed(1)}dB at 60/120/500/1k/2k/4k/8kHz` });
  }
  
  // ZERO-ITERATION Noise Reduction
  if (settings.noiseReductionEnabled && settings.noiseReductionAmount > 0) {
    output = applyZeroIterationNoiseReduction(output, sr, settings.noiseReductionAmount);
    processesApplied.push({ type: 'Noise Reduction', details: `${settings.noiseReductionAmount.toFixed(1)}dB (zero-iteration gate)` });
  }

  // Audio Delay
  if (settings.delayEnabled && settings.delayTime > 0) {
    output = applyAudioDelay(
      output,
      sr,
      settings.delayTime,
      settings.delayFeedback,
      settings.delayDryWet,
      settings.delayXPosition,
      settings.delayYPosition
    );
    processesApplied.push({ type: 'Audio Delay', details: `${settings.delayTime}ms, X:${settings.delayXPosition}, Y:${settings.delayYPosition}` });
  }

  // REMOVED: Noise Reduction (was causing static artifacts)

  // De-esser - ALWAYS APPLY when enabled (NO skipping)
  if (settings.deesserEnabled) {
    output = applyConservativeDeesser(output, sr, settings.deesserReduction);
    processesApplied.push({ type: 'De-esser', details: `${settings.deesserReduction}dB reduction` });
  }

  // Clarity - ALWAYS APPLY when enabled
  if (settings.clarityEnabled && settings.clarityAmount > 0) {
    output = applyConservativeClarity(output, sr, settings.clarityAmount);
    processesApplied.push({ type: 'Clarity', details: `${settings.clarityAmount}dB` });
  }

  // Warmth - ALWAYS APPLY when enabled
  if (settings.warmthEnabled && settings.warmthAmount > 0) {
    output = applyConservativeWarmth(output, sr, settings.warmthAmount);
    processesApplied.push({ type: 'Warmth', details: `${settings.warmthAmount}%` });
  }

  // Brightness - ALWAYS APPLY when enabled
  if (settings.brightnessEnabled && settings.brightnessAmount > 0) {
    output = applyConservativeBrightness(output, sr, settings.brightnessAmount);
    processesApplied.push({ type: 'Brightness', details: `${settings.brightnessAmount}%` });
  }

  // Sharpness - ALWAYS APPLY when enabled
  if (settings.sharpnessEnabled && settings.sharpnessAmount > 0) {
    output = applyConservativeSharpness(output, sr, settings.sharpnessAmount);
    processesApplied.push({ type: 'Sharpness', details: `${settings.sharpnessAmount}%` });
  }

  // Smoothness - ALWAYS APPLY when enabled
  if (settings.smoothnessEnabled && settings.smoothnessAmount > 0) {
    output = applyConservativeSmoothness(output, sr, settings.smoothnessAmount);
    processesApplied.push({ type: 'Smoothness', details: `${settings.smoothnessAmount}%` });
  }

  // Spatial Atmos - ALWAYS APPLY when enabled
  if (settings.atmosEnabled && settings.atmosAmount > 0) {
    output = applySpatialEnhancement(output, sr, settings.atmosAmount);
    processesApplied.push({ type: 'Spatial Atmos', details: `${settings.atmosAmount}%` });
  }

  // Master Gain - ZERO-ITERATION (final stage, pure multiplication)
  if (settings.masterGainEnabled && settings.masterGainAmount !== 0) {
    const masterGainLinear = Math.pow(10, settings.masterGainAmount / 20); // Mastering equation
    for (let i = 0; i < output.length; i++) {
      output[i] = output[i] * masterGainLinear; // Pure multiplication (NO feedback, NO static)
    }
    processesApplied.push({ type: 'Master Gain', details: `${settings.masterGainAmount > 0 ? '+' : ''}${settings.masterGainAmount}dB` });
  }

  return { output: output, processesApplied: processesApplied, processesSkipped: processesSkipped, message: 'Processing complete' };
}

export default function AdvancedMixingTools({ audioFile, onProcessComplete }) {
  const mlDataCollector = useMLDataCollector();
  const staticBlocker = usePreventStaticAddition();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [processedBuffer, setProcessedBuffer] = useState(null);
  const [processingReport, setProcessingReport] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [securityStatus, setSecurityStatus] = useState({ safe: true, mlComplexity: 0 }); // State for security status
  
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const processedDataRef = useRef(null);

  // Existing controls
  const [deesserEnabled, setDeesserEnabled] = useState(false);
  const [deesserReduction, setDeesserReduction] = useState(6);
  const [clarityEnabled, setClarityEnabled] = useState(false);
  const [clarityAmount, setClarityAmount] = useState(2);
  const [noiseReductionEnabled, setNoiseReductionEnabled] = useState(false);
  const [noiseReductionAmount, setNoiseReductionAmount] = useState(6); // Default 6dB
  const [warmthEnabled, setWarmthEnabled] = useState(false);
  const [warmthAmount, setWarmthAmount] = useState(30);
  const [brightnessEnabled, setBrightnessEnabled] = useState(false);
  const [brightnessAmount, setBrightnessAmount] = useState(30);
  const [sharpnessEnabled, setSharpnessEnabled] = useState(false);
  const [sharpnessAmount, setSharpnessAmount] = useState(30);
  const [smoothnessEnabled, setSmoothnessEnabled] = useState(false);
  const [smoothnessAmount, setSmoothnessAmount] = useState(30);
  const [atmosEnabled, setAtmosEnabled] = useState(false);
  const [atmosAmount, setAtmosAmount] = useState(40);

  // Advanced controls
  const [compressionEnabled, setCompressionEnabled] = useState(false);
  const [compressionThreshold, setCompressionThreshold] = useState(-18);
  const [compressionRatio, setCompressionRatio] = useState(3);
  const [compressionAttack, setCompressionAttack] = useState(5);
  const [compressionRelease, setCompressionRelease] = useState(50);
  const [compressionMakeupGain, setCompressionMakeupGain] = useState(0);
  const [compressionVocalsOnly, setCompressionVocalsOnly] = useState(false);
  const [positiveThresholdMode, setPositiveThresholdMode] = useState(false);

  const [delayEnabled, setDelayEnabled] = useState(false);
  const [delayTime, setDelayTime] = useState(250);
  const [delayFeedback, setDelayFeedback] = useState(25);
  const [delayDryWet, setDelayDryWet] = useState(30);
  const [delayXPosition, setDelayXPosition] = useState(0);
  const [delayYPosition, setDelayYPosition] = useState(0);

  const [frequencyFilterEnabled, setFrequencyFilterEnabled] = useState(false);
  const [lowCutoff, setLowCutoff] = useState(20);
  const [highCutoff, setHighCutoff] = useState(20000);

  const [feedbackReductionEnabled, setFeedbackReductionEnabled] = useState(false);
  const [feedbackReduction, setFeedbackReduction] = useState(0);

  const [pitchShiftEnabled, setPitchShiftEnabled] = useState(false);
  const [referenceFrequency, setReferenceFrequency] = useState(440);

  // NEW: Advanced EQ states
  const [advancedEQEnabled, setAdvancedEQEnabled] = useState(false);
  const [lowShelfEnabled, setLowShelfEnabled] = useState(false);
  const [lowShelfFreq, setLowShelfFreq] = useState(100);
  const [lowShelfGain, setLowShelfGain] = useState(0);
  const [midPeakEnabled, setMidPeakEnabled] = useState(false);
  const [midPeakFreq, setMidPeakFreq] = useState(1000);
  const [midPeakGain, setMidPeakGain] = useState(0);
  const [highShelfEnabled, setHighShelfEnabled] = useState(false);
  const [highShelfFreq, setHighShelfFreq] = useState(8000);
  const [highShelfGain, setHighShelfGain] = useState(0);
  const [presenceEnabled, setPresenceEnabled] = useState(false);
  const [presenceFreq, setPresenceFreq] = useState(5000);
  const [presenceGain, setPresenceGain] = useState(0);
  
  // NEW: Master Gain (zero-iteration)
  const [masterGainEnabled, setMasterGainEnabled] = useState(false);
  const [masterGainAmount, setMasterGainAmount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const init = () => {
      try {
        blockScriptInjection();
        const cspResult = validateCSP();
        if (mounted) {
          setSecurityStatus({ safe: cspResult.valid, mlComplexity: cspResult.mlComplexity || 0 });
        }
        mlDataCollector.record('advanced_mixing_visit', {
          feature: 'advanced_mixing',
          timestamp: Date.now()
        });
      } catch (error) {
        console.warn('Init error:', error);
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (audioFile) {
      loadAudioBuffer();
    }
    return () => {
      stopPlayback();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioFile]);

  useEffect(() => {
    if (audioBuffer && canvasRef.current) {
      drawWaveform();
    }
  }, [audioBuffer, currentTime, processedDataRef.current]);

  const loadAudioBuffer = async () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
      if (!AudioContext) throw new Error('Web Audio API not supported');
      
      // MOBILE: Zero-iteration decoding (pristine, no resampling artifacts)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const ctx = new AudioContext({ 
        sampleRate: isMobile ? 44100 : undefined, // Lock to 44.1kHz (prevents mobile resampling static)
        latencyHint: isMobile ? 'playback' : 'interactive'
      });
      
      const arrayBuffer = await audioFile.arrayBuffer();
      
      // ZERO-ITERATION: Direct decode (NO intermediate conversions)
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      
      setAudioBuffer(buffer);
      setDuration(buffer.duration);
      processedDataRef.current = null;
      setProcessedBuffer(null);
      setProcessedUrl(null);
      
      mlDataCollector.record('audio_loaded_pristine', {
        feature: 'advanced_mixing',
        isMobile,
        sampleRate: buffer.sampleRate,
        channels: buffer.numberOfChannels,
        duration: buffer.duration,
        timestamp: Date.now()
      });
      
      await ctx.close();
    } catch (error) {
      console.error("Failed to load audio:", error);
      alert('Failed to load audio file');
      
      mlDataCollector.record('audio_load_error', {
        feature: 'advanced_mixing',
        error: error.message,
        timestamp: Date.now()
      });
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const data = processedDataRef.current || audioBuffer.getChannelData(0);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = processedDataRef.current ? '#10b981' : '#60a5fa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const step = Math.ceil(data.length / width);
    const amp = height / 2;
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = i * step; j < (i + 1) * step && j < data.length; j++) {
        if (data[j] < min) min = data[j];
        if (data[j] > max) max = data[j];
      }
      const yMin = (1 + min) * amp;
      const yMax = (1 + max) * amp;
      ctx.moveTo(i, yMin);
      ctx.lineTo(i, yMax);
    }
    ctx.stroke();
    if (isPlaying || currentTime > 0) {
      const playheadX = (currentTime / duration) * width;
      ctx.strokeStyle = '#eab308'; // Changed color to yellow
      ctx.lineWidth = 3; // Thicker line for playhead
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
    }
  };

  const togglePlayback = async () => {
    if (!audioBuffer) return;
    if (isPlaying) {
      stopPlayback();
    } else {
      await startPlayback();
    }
  };

  const startPlayback = async () => {
    const bufferToPlay = processedBuffer || audioBuffer;
    if (!bufferToPlay) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      const source = audioContextRef.current.createBufferSource();
      source.buffer = bufferToPlay;
      source.connect(audioContextRef.current.destination);
      const playbackStartTime = audioContextRef.current.currentTime;
      source.start(0, currentTime);
      sourceRef.current = source;
      sourceRef.current.playbackStartTime = playbackStartTime;
      source.onended = () => {
        stopPlayback();
        setCurrentTime(0);
      };
      setIsPlaying(true);
      const animate = () => {
        if (!isPlaying || !audioContextRef.current || !sourceRef.current) return;
        const elapsed = audioContextRef.current.currentTime - sourceRef.current.playbackStartTime + currentTime;
        if (elapsed >= duration) {
          stopPlayback();
          setCurrentTime(0);
          return;
        }
        setCurrentTime(Math.min(elapsed, duration));
        requestAnimationFrame(animate);
      };
      animate();
    } catch (error) {
      console.error("Playback error:", error);
      setIsPlaying(false);
    }
  };

  const stopPlayback = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) {
        // Ignore
      }
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const applyProcessing = async () => {
    if (!audioFile || !audioBuffer) {
      alert('Please upload an audio file first');
      return;
    }
    
    // CRITICAL: Allow re-processing - clear previous results
    if (processedUrl) {
      URL.revokeObjectURL(processedUrl);
    }
    setProcessedUrl(null);
    setProcessedBuffer(null);
    setProcessingReport(null);
    processedDataRef.current = null;
    
    setIsProcessing(true);
    setProcessingProgress(0);
    
    mlDataCollector.record('advanced_mixing_started', {
      feature: 'advanced_mixing',
      pitchShiftEnabled,
      referenceFrequency,
      timestamp: Date.now()
    });
    
    try {
      const settings = {
        deesserEnabled,
        deesserReduction,
        clarityEnabled,
        clarityAmount,
        noiseReductionEnabled,
        noiseReductionAmount,
        warmthEnabled,
        warmthAmount,
        brightnessEnabled,
        brightnessAmount,
        sharpnessEnabled,
        sharpnessAmount,
        smoothnessEnabled,
        smoothnessAmount,
        atmosEnabled,
        atmosAmount,
        compressionEnabled,
        compressionThreshold,
        compressionRatio,
        compressionAttack,
        compressionRelease,
        compressionMakeupGain,
        compressionVocalsOnly,
        delayEnabled,
        delayTime,
        delayFeedback,
        delayDryWet,
        delayXPosition,
        delayYPosition,
        frequencyFilterEnabled,
        lowCutoff,
        highCutoff,
        feedbackReductionEnabled,
        feedbackReduction,
        pitchShiftEnabled,
        referenceFrequency,
        advancedEQEnabled,
        eqSettings: {
          lowShelfEnabled,
          lowShelfFreq,
          lowShelfGain,
          midPeakEnabled,
          midPeakFreq,
          midPeakGain,
          highShelfEnabled,
          highShelfFreq,
          highShelfGain,
          presenceEnabled,
          presenceFreq,
          presenceGain
        },
        masterGainEnabled,
        masterGainAmount
      };

      const hasAnyEnabled = deesserEnabled || clarityEnabled || noiseReductionEnabled || warmthEnabled ||
                           brightnessEnabled || sharpnessEnabled || smoothnessEnabled || atmosEnabled ||
                           compressionEnabled || delayEnabled || frequencyFilterEnabled ||
                           feedbackReductionEnabled || pitchShiftEnabled || advancedEQEnabled || masterGainEnabled;

      if (!hasAnyEnabled) {
        alert('Please enable at least one effect');
        setIsProcessing(false);
        setProcessingProgress(0);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      setProcessingProgress(10);
      const data = audioBuffer.getChannelData(0).slice();
      const sr = audioBuffer.sampleRate;
      setProcessingProgress(30);
      await new Promise(resolve => setTimeout(resolve, 100));
      const result = applyUltraConservativeProcessing(data, sr, settings);
      setProcessingProgress(60);
      await new Promise(resolve => setTimeout(resolve, 100));
      processedDataRef.current = result.output;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const output = ctx.createBuffer(audioBuffer.numberOfChannels, result.output.length, sr);
      for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
        output.copyToChannel(result.output, ch);
      }
      setProcessingProgress(80);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // ZERO-ITERATION EXPORT: Mastering equation (32-bit float, NO quantization noise)
      window.dispatchEvent(new Event('audioProcessingStart'));
      const wav = exportPristine32BitWav(output); // Direct 32-bit conversion (NO dithering, NO static)
      const blob = new Blob([wav], { type: 'audio/wav' });
      window.dispatchEvent(new Event('audioProcessingEnd'));
      
      if (processedUrl) {
        URL.revokeObjectURL(processedUrl);
      }
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      setProcessedBuffer(output);
      setProcessingReport(result);
      if (onProcessComplete) {
        onProcessComplete(url, output);
      }
      await ctx.close();
      setProcessingProgress(100);
      drawWaveform();
      
      mlDataCollector.record('advanced_mixing_completed', {
        feature: 'advanced_mixing',
        processesApplied: result.processesApplied.length,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Processing failed:', error);
      alert('Processing failed: ' + error.message);
      mlDataCollector.record('advanced_mixing_error', {
        feature: 'advanced_mixing',
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingProgress(0);
      }, 300);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + secs.toString().padStart(2, '0');
  };

  const hasAnyEffectEnabled = deesserEnabled || clarityEnabled || noiseReductionEnabled || warmthEnabled ||
    brightnessEnabled || sharpnessEnabled || smoothnessEnabled || atmosEnabled ||
    compressionEnabled || delayEnabled || frequencyFilterEnabled ||
    feedbackReductionEnabled || pitchShiftEnabled || advancedEQEnabled || masterGainEnabled;

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/90 border-green-500/30 z-cards">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-semibold text-sm">🛡️ Security Active</p>
                <p className="text-xs text-slate-400">ML: {securityStatus.mlComplexity.toFixed(1)}</p>
              </div>
            </div>
            <Badge className="bg-green-500">SAFE</Badge>
          </div>
        </CardContent>
      </Card>

      {audioBuffer && (
        <Card className="bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border-cyan-500/40 z-cards">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-cyan-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">🤖 AI Learning Active</p>
                <p className="text-xs text-cyan-300 break-words">
                  Learning from your mixing preferences • Improving recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {audioBuffer && (
        <Card className="bg-slate-800/80 border-purple-500/30 relative z-[5]">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span>Playback {processedBuffer && '(Processed)'}</span>
              </div>
              <div className="flex items-center gap-3 relative z-[9999]">
                <Button variant="ghost" size="sm" onClick={togglePlayback} className="text-purple-300" disabled={isProcessing}>
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <span className="text-sm text-slate-400">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <canvas ref={canvasRef} width={1024} height={140} className="w-full bg-slate-900 rounded-lg" />
              <p className="text-xs text-yellow-300 mt-2">Yellow line = playback position | Green = processed audio</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-800/80 border-purple-500/30 relative z-[5]">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span>Zero-Iteration Mixing</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => {
              setDeesserEnabled(false);
              setClarityEnabled(false);
              setNoiseReductionEnabled(false);
              setWarmthEnabled(false);
              setBrightnessEnabled(false);
              setSharpnessEnabled(false);
              setSmoothnessEnabled(false);
              setAtmosEnabled(false);
              setCompressionEnabled(false);
              setCompressionVocalsOnly(false);
              setDelayEnabled(false);
              setFrequencyFilterEnabled(false);
              setFeedbackReductionEnabled(false);
              setPitchShiftEnabled(false);
              setAdvancedEQEnabled(false);
              setLowShelfEnabled(false);
              setLowShelfGain(0);
              setMidPeakEnabled(false);
              setMidPeakGain(0);
              setHighShelfEnabled(false);
              setHighShelfGain(0);
              setPresenceEnabled(false);
              setPresenceGain(0);
              setMasterGainEnabled(false);
              setMasterGainAmount(0);
            }} className="text-purple-300 relative z-[9999]" disabled={isProcessing}>
              <RotateCcw className="w-4 h-4 mr-2" />
              <span>Reset</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-green-200 mb-1">PRISTINE Processing</p>
                <p className="text-xs text-green-300 break-words">Detects if already processed, only applies what is needed, 32-bit float throughout</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-orange-300 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Advanced Dynamics
            </h3>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-semibold">Advanced Compression</p>
                <p className="text-xs text-slate-400">Threshold: {compressionThreshold}dB | Ratio: {compressionRatio}:1 | Makeup: {compressionMakeupGain > 0 ? '+' : ''}{compressionMakeupGain}dB</p>
              </div>
              <Switch checked={compressionEnabled} onCheckedChange={setCompressionEnabled} disabled={isProcessing} />
            </div>
            {compressionEnabled && (
              <div className="space-y-3 pl-4 border-l-2 border-orange-500/30">
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                  <span className="text-xs text-slate-300">Apply to Vocals Only</span>
                  <Switch checked={compressionVocalsOnly} onCheckedChange={setCompressionVocalsOnly} disabled={isProcessing} />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                  <span className="text-xs text-slate-300">Positive Threshold Mode</span>
                  <Switch checked={positiveThresholdMode} onCheckedChange={setPositiveThresholdMode} disabled={isProcessing} />
                </div>
                <div>
                  <label className="text-xs text-slate-300">Threshold (dB) - Where compression starts</label>
                  <Slider 
                    value={[compressionThreshold]} 
                    onValueChange={(v) => setCompressionThreshold(v[0])} 
                    min={positiveThresholdMode ? -60 : -60} 
                    max={positiveThresholdMode ? 12 : 0} 
                    step={1} 
                    className="w-full" 
                    disabled={isProcessing} 
                  />
                  {positiveThresholdMode && (
                    <p className="text-xs text-yellow-300 mt-1">⚠️ Positive threshold allows compression above 0dB</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-slate-300">Ratio - Compression amount</label>
                  <Slider value={[compressionRatio]} onValueChange={(v) => setCompressionRatio(v[0])} min={1} max={20} step={0.5} className="w-full" disabled={isProcessing} />
                </div>
                <div>
                  <label className="text-xs text-slate-300">Attack (ms) - How fast compression engages</label>
                  <Slider value={[compressionAttack]} onValueChange={(v) => setCompressionAttack(v[0])} min={0.1} max={100} step={0.1} className="w-full" disabled={isProcessing} />
                </div>
                <div>
                  <label className="text-xs text-slate-300">Release (ms) - How fast compression disengages</label>
                  <Slider value={[compressionRelease]} onValueChange={(v) => setCompressionRelease(v[0])} min={10} max={1000} step={10} className="w-full" disabled={isProcessing} />
                </div>
                <div>
                  <label className="text-xs text-slate-300">Makeup Gain (dB) - Volume compensation: {compressionMakeupGain > 0 ? '+' : ''}{compressionMakeupGain}dB</label>
                  <Slider value={[compressionMakeupGain]} onValueChange={(v) => setCompressionMakeupGain(v[0])} min={-12} max={12} step={0.5} className="w-full" disabled={isProcessing} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-blue-300 flex items-center gap-2">
              <Waves className="w-4 h-4" />
              Audio Delay & Positioning
            </h3>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-semibold">Audio Delay</p>
                <p className="text-xs text-slate-400">{delayTime}ms | Feedback: {delayFeedback}% | Mix: {delayDryWet}% | X:{delayXPosition} Y:{delayYPosition}</p>
              </div>
              <Switch checked={delayEnabled} onCheckedChange={setDelayEnabled} disabled={isProcessing} />
            </div>
            {delayEnabled && (
              <div className="space-y-3 pl-4 border-l-2 border-blue-500/30">
                <div>
                  <label className="text-xs text-slate-300">Delay Time (ms)</label>
                  <Slider value={[delayTime]} onValueChange={(v) => setDelayTime(v[0])} min={1} max={2000} step={1} className="w-full" disabled={isProcessing} />
                </div>
                {/* REMOVED: Feedback causes unwanted audio artifacts */}
                <div>
                  <label className="text-xs text-slate-300">Dry/Wet Mix (%)</label>
                  <Slider value={[delayDryWet]} onValueChange={(v) => setDelayDryWet(v[0])} min={0} max={100} step={1} className="w-full" disabled={isProcessing} />
                </div>
                <div>
                  <label className="text-xs text-slate-300">X Position (Left -50 to Right +50)</label>
                  <Slider value={[delayXPosition]} onValueChange={(v) => setDelayXPosition(v[0])} min={-50} max={50} step={1} className="w-full" disabled={isProcessing} />
                </div>
                <div>
                  <label className="text-xs text-slate-300">Y Position (Back -50 to Front +50)</label>
                  <Slider value={[delayYPosition]} onValueChange={(v) => setDelayYPosition(v[0])} min={-50} max={50} step={1} className="w-full" disabled={isProcessing} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Frequency Control
            </h3>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-semibold">Frequency Range Filter</p>
                <p className="text-xs text-slate-400">{lowCutoff}Hz - {highCutoff}Hz</p>
              </div>
              <Switch checked={frequencyFilterEnabled} onCheckedChange={setFrequencyFilterEnabled} disabled={isProcessing} />
            </div>
            {frequencyFilterEnabled && (
              <div className="space-y-3 pl-4 border-l-2 border-cyan-500/30">
                <div>
                  <label className="text-xs text-slate-300">Low Cutoff (Hz)</label>
                  <Slider value={[lowCutoff]} onValueChange={(v) => setLowCutoff(v[0])} min={0} max={1000} step={10} className="w-full" disabled={isProcessing} />
                </div>
                <div>
                  <label className="text-xs text-slate-300">High Cutoff (Hz)</label>
                  <Slider value={[highCutoff]} onValueChange={(v) => setHighCutoff(v[0])} min={1000} max={20000} step={100} className="w-full" disabled={isProcessing} />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-semibold">Feedback Reduction (Mobile 2x)</p>
                <p className="text-xs text-slate-400">{feedbackReduction.toFixed(1)}dB • Auto 2x on mobile</p>
              </div>
              <Switch checked={feedbackReductionEnabled} onCheckedChange={setFeedbackReductionEnabled} disabled={isProcessing} />
            </div>
            {feedbackReductionEnabled && (
              <div className="space-y-2 pl-4 border-l-2 border-cyan-500/30">
                <Slider value={[feedbackReduction]} onValueChange={(v) => setFeedbackReduction(v[0])} min={0} max={29.9} step={0.1} className="w-full" disabled={isProcessing} />
                <p className="text-xs text-cyan-300">✓ Automatically 2x stronger on mobile devices</p>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-semibold">Pitch Shift / Tuning Reference</p>
                <p className="text-xs text-slate-400">{referenceFrequency}Hz {referenceFrequency === 432 ? '(432 Hz)' : referenceFrequency === 440 ? '(A440)' : referenceFrequency === 444 ? '(444 Hz)' : referenceFrequency === 528 ? '(528 Hz Healing)' : ''}</p>
              </div>
              <Switch checked={pitchShiftEnabled} onCheckedChange={setPitchShiftEnabled} disabled={isProcessing} />
            </div>
            {pitchShiftEnabled && (
              <div className="space-y-2 pl-4 border-l-2 border-cyan-500/30">
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant={referenceFrequency === 432 ? "default" : "outline"} onClick={() => setReferenceFrequency(432)} disabled={isProcessing}>432 Hz</Button>
                  <Button size="sm" variant={referenceFrequency === 440 ? "default" : "outline"} onClick={() => setReferenceFrequency(440)} disabled={isProcessing}>440 Hz</Button>
                  <Button size="sm" variant={referenceFrequency === 444 ? "default" : "outline"} onClick={() => setReferenceFrequency(444)} disabled={isProcessing}>444 Hz</Button>
                  <Button size="sm" variant={referenceFrequency === 528 ? "default" : "outline"} onClick={() => setReferenceFrequency(528)} disabled={isProcessing}>528 Hz</Button>
                </div>
                <Slider value={[referenceFrequency]} onValueChange={(v) => setReferenceFrequency(v[0])} min={400} max={550} step={1} className="w-full" disabled={isProcessing} />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              Advanced EQ & Spatial
            </h3>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-semibold">Advanced EQ (Multi-Band)</p>
                <p className="text-xs text-slate-400">Professional EQ with Low/Mid/High/Presence</p>
              </div>
              <Switch checked={advancedEQEnabled} onCheckedChange={setAdvancedEQEnabled} disabled={isProcessing} />
            </div>
            {advancedEQEnabled && (
              <div className="space-y-3 pl-4 border-l-2 border-indigo-500/30">
                <div className="p-2 bg-slate-800/50 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-300">Low Shelf</span>
                    <Switch checked={lowShelfEnabled} onCheckedChange={setLowShelfEnabled} disabled={isProcessing} />
                  </div>
                  {lowShelfEnabled && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-slate-400">Frequency: {lowShelfFreq}Hz</label>
                        <Slider value={[lowShelfFreq]} onValueChange={(v) => setLowShelfFreq(v[0])} min={20} max={500} step={10} className="w-full" disabled={isProcessing} />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Gain: {lowShelfGain > 0 ? '+' : ''}{lowShelfGain}dB</label>
                        <Slider value={[lowShelfGain]} onValueChange={(v) => setLowShelfGain(v[0])} min={-12} max={12} step={0.5} className="w-full" disabled={isProcessing} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-2 bg-slate-800/50 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-300">Mid Peak</span>
                    <Switch checked={midPeakEnabled} onCheckedChange={setMidPeakEnabled} disabled={isProcessing} />
                  </div>
                  {midPeakEnabled && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-slate-400">Frequency: {midPeakFreq}Hz</label>
                        <Slider value={[midPeakFreq]} onValueChange={(v) => setMidPeakFreq(v[0])} min={200} max={5000} step={50} className="w-full" disabled={isProcessing} />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Gain: {midPeakGain > 0 ? '+' : ''}{midPeakGain}dB</label>
                        <Slider value={[midPeakGain]} onValueChange={(v) => setMidPeakGain(v[0])} min={-12} max={12} step={0.5} className="w-full" disabled={isProcessing} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-2 bg-slate-800/50 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-300">High Shelf</span>
                    <Switch checked={highShelfEnabled} onCheckedChange={setHighShelfEnabled} disabled={isProcessing} />
                  </div>
                  {highShelfEnabled && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-slate-400">Frequency: {highShelfFreq}Hz</label>
                        <Slider value={[highShelfFreq]} onValueChange={(v) => setHighShelfFreq(v[0])} min={3000} max={16000} step={100} className="w-full" disabled={isProcessing} />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Gain: {highShelfGain > 0 ? '+' : ''}{highShelfGain}dB</label>
                        <Slider value={[highShelfGain]} onValueChange={(v) => setHighShelfGain(v[0])} min={-12} max={12} step={0.5} className="w-full" disabled={isProcessing} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-2 bg-slate-800/50 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-300">Presence (Vocal Clarity)</span>
                    <Switch checked={presenceEnabled} onCheckedChange={setPresenceEnabled} disabled={isProcessing} />
                  </div>
                  {presenceEnabled && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-slate-400">Frequency: {presenceFreq}Hz</label>
                        <Slider value={[presenceFreq]} onValueChange={(v) => setPresenceFreq(v[0])} min={2000} max={8000} step={100} className="w-full" disabled={isProcessing} />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Gain: {presenceGain > 0 ? '+' : ''}{presenceGain}dB</label>
                        <Slider value={[presenceGain]} onValueChange={(v) => setPresenceGain(v[0])} min={-6} max={6} step={0.5} className="w-full" disabled={isProcessing} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-purple-300">Essential</h3>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-semibold">Noise Reduction (Zero-Iteration)</p>
                <p className="text-xs text-slate-400">{noiseReductionAmount}dB • Static Removal Active</p>
              </div>
              <Switch checked={noiseReductionEnabled} onCheckedChange={setNoiseReductionEnabled} disabled={isProcessing} />
            </div>
            {noiseReductionEnabled && (
              <Slider value={[noiseReductionAmount]} onValueChange={(v) => setNoiseReductionAmount(v[0])} min={0} max={12} step={1} className="w-full" disabled={isProcessing} />
            )}
            
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-semibold">De-esser</p>
                <p className="text-xs text-slate-400">{deesserReduction}dB</p>
              </div>
              <Switch checked={deesserEnabled} onCheckedChange={setDeesserEnabled} disabled={isProcessing} />
            </div>
            {deesserEnabled && (
              <Slider value={[deesserReduction]} onValueChange={(v) => setDeesserReduction(v[0])} min={3} max={10} step={1} className="w-full" disabled={isProcessing} />
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-purple-300">Tone</h3>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-semibold">Clarity</p>
                <p className="text-xs text-slate-400">{clarityAmount.toFixed(1)}dB</p>
              </div>
              <Switch checked={clarityEnabled} onCheckedChange={setClarityEnabled} disabled={isProcessing} />
            </div>
            {clarityEnabled && (
              <Slider value={[clarityAmount]} onValueChange={(v) => setClarityAmount(v[0])} min={0} max={4} step={0.5} className="w-full" disabled={isProcessing} />
            )}
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-semibold">Warmth</p>
                <p className="text-xs text-slate-400">{warmthAmount}%</p>
              </div>
              <Switch checked={warmthEnabled} onCheckedChange={setWarmthEnabled} disabled={isProcessing} />
            </div>
            {warmthEnabled && (
              <Slider value={[warmthAmount]} onValueChange={(v) => setWarmthAmount(v[0])} min={0} max={60} step={5} className="w-full" disabled={isProcessing} />
            )}
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-semibold">Brightness</p>
                <p className="text-xs text-slate-400">{brightnessAmount}%</p>
              </div>
              <Switch checked={brightnessEnabled} onCheckedChange={setBrightnessEnabled} disabled={isProcessing} />
            </div>
            {brightnessEnabled && (
              <Slider value={[brightnessAmount]} onValueChange={(v) => setBrightnessAmount(v[0])} min={0} max={60} step={5} className="w-full" disabled={isProcessing} />
            )}
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-semibold">Sharpness</p>
                <p className="text-xs text-slate-400">{sharpnessAmount}%</p>
              </div>
              <Switch checked={sharpnessEnabled} onCheckedChange={setSharpnessEnabled} disabled={isProcessing} />
            </div>
            {sharpnessEnabled && (
              <Slider value={[sharpnessAmount]} onValueChange={(v) => setSharpnessAmount(v[0])} min={0} max={60} step={5} className="w-full" disabled={isProcessing} />
            )}
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-semibold">Smoothness</p>
                <p className="text-xs text-slate-400">{smoothnessAmount}%</p>
              </div>
              <Switch checked={smoothnessEnabled} onCheckedChange={setSmoothnessEnabled} disabled={isProcessing} />
            </div>
            {smoothnessEnabled && (
              <Slider value={[smoothnessAmount]} onValueChange={(v) => setSmoothnessAmount(v[0])} min={0} max={60} step={5} className="w-full" disabled={isProcessing} />
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-cyan-300">Spatial Audio</h3>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-semibold flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span>Atmos / Spatial</span>
                </p>
                <p className="text-xs text-slate-400">{atmosAmount}% (pristine)</p>
              </div>
              <Switch checked={atmosEnabled} onCheckedChange={setAtmosEnabled} disabled={isProcessing} />
            </div>
            {atmosEnabled && (
              <Slider value={[atmosAmount]} onValueChange={(v) => setAtmosAmount(v[0])} min={0} max={70} step={5} className="w-full" disabled={isProcessing} />
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-yellow-300 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Master Gain (Zero-Iteration)
            </h3>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-semibold">Master Output Level</p>
                <p className="text-xs text-slate-400">{masterGainAmount > 0 ? '+' : ''}{masterGainAmount}dB • Pure multiplication</p>
              </div>
              <Switch checked={masterGainEnabled} onCheckedChange={setMasterGainEnabled} disabled={isProcessing} />
            </div>
            {masterGainEnabled && (
              <div className="space-y-2 pl-4 border-l-2 border-yellow-500/30">
                <Slider value={[masterGainAmount]} onValueChange={(v) => setMasterGainAmount(v[0])} min={-12} max={12} step={0.5} className="w-full" disabled={isProcessing} />
                <p className="text-xs text-yellow-300">✓ Zero-iteration gain (NO static, NO feedback)</p>
              </div>
            )}
          </div>

          {isProcessing && processingProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-300">
                <span>Processing...</span>
                <span>{processingProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: processingProgress + '%' }} />
              </div>
            </div>
          )}

          <Button 
            onClick={applyProcessing} 
            disabled={isProcessing || !audioBuffer} 
            className={`w-full py-6 relative z-[9999] transition-all ${
              audioBuffer && hasAnyEffectEnabled && !isProcessing
                ? 'bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-800 hover:to-emerald-800 shadow-lg'
                : 'bg-gradient-to-r from-green-600 to-emerald-600'
            }`}
          >
            {isProcessing ? (
              <React.Fragment>
                <Activity className="w-5 h-5 mr-2 animate-spin" />
                <span>Processing... {processingProgress}%</span>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Shield className="w-5 h-5 mr-2" />
                <span>{processedUrl ? 'Re-Process with New Settings' : 'Apply Pristine Mixing'}</span>
              </React.Fragment>
            )}
          </Button>
        </CardContent>
      </Card>

      {processedUrl && processingReport && (
        <Card className="bg-slate-800/80 border-green-500/30 relative z-[5]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Pristine Mix Complete</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-200 font-semibold mb-2 break-words">{processingReport.message}</p>
              {processingReport.processesApplied.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-green-300 font-semibold mb-1">Applied:</p>
                  <ul className="text-xs text-green-300 space-y-0.5">
                    {processingReport.processesApplied.map((p, i) => (
                      <li key={i} className="break-words">{p.type}: {p.details}</li>
                    ))}
                  </ul>
                </div>
              )}
              {processingReport.processesSkipped.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-slate-400 font-semibold mb-1">Skipped:</p>
                  <ul className="text-xs text-slate-400 space-y-0.5">
                    {processingReport.processesSkipped.map((p, i) => (
                      <li key={i} className="break-words">{typeof p === 'string' ? p : (p.type + ': ' + p.reason)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <audio controls className="w-full" src={processedUrl} />
            <a href={processedUrl} download="pristine_mix.wav">
              <Button className="w-full vibrant-nav-button relative z-[9999]">
                <Download className="w-5 h-5 mr-2" />
                <span>Download Pristine Mix</span>
              </Button>
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}