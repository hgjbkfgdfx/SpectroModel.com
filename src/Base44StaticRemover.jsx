/**
 * BASE44 ML-POWERED STATIC PREVENTION
 * Uses machine learning to detect and prevent static before processing
 * Direct file-to-AudioBuffer workflow (no unnecessary conversions)
 */

import { AudioQualityPredictor, detectStatic } from './MLAudioQualityMonitor';

// Utility functions
function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function mixdownToMono(audioBuffer) {
  if (audioBuffer.numberOfChannels === 1) {
    return audioBuffer.getChannelData(0);
  }
  
  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);
  const mono = new Float32Array(left.length);
  
  for (let i = 0; i < left.length; i++) {
    mono[i] = (left[i] + right[i]) / 2;
  }
  
  return mono;
}

// ML-based static detection on file
export async function detectStaticInFile(audioFile) {
  console.log("🤖 ML Static Detection: Analyzing file...");
  
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const mono = mixdownToMono(audioBuffer);
        const sr = audioBuffer.sampleRate;
        
        // ML static detection
        const staticAnalysis = detectStatic(mono, sr);
        
        console.log("📊 ML Static Analysis Results:", {
          hasStatic: staticAnalysis.hasStatic,
          staticRatio: (staticAnalysis.staticRatio * 100).toFixed(2) + '%',
          noiseFloor: staticAnalysis.noiseFloor.toFixed(3),
          highFreqEnergy: (staticAnalysis.highFreqEnergy * 100).toFixed(2) + '%',
          confidence: (staticAnalysis.confidence * 100).toFixed(1) + '%'
        });
        
        // ML quality prediction
        const predictor = new AudioQualityPredictor();
        const features = predictor.extractFeatures(mono, sr);
        const prediction = predictor.predict(features);
        
        console.log("🎯 ML Quality Prediction:", {
          qualityScore: prediction.qualityScore.toFixed(3),
          isAcceptable: prediction.isAcceptable,
          spectralFlatness: features.spectralFlatness.toFixed(3),
          crestFactor: features.crestFactor.toFixed(2)
        });
        
        resolve({
          audioBuffer,
          staticAnalysis,
          qualityPrediction: prediction,
          features,
          recommendations: generateRecommendations(staticAnalysis, features, prediction)
        });
        
      } catch (error) {
        console.error("❌ ML static detection failed:", error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(audioFile);
  });
}

function generateRecommendations(staticAnalysis, features, prediction) {
  const recommendations = [];
  
  // High static detected
  if (staticAnalysis.hasStatic) {
    recommendations.push({
      severity: 'high',
      type: 'static',
      message: `High static/noise detected (${(staticAnalysis.staticRatio * 100).toFixed(1)}%). Recommend re-recording or using noise reduction before mastering.`,
      action: 'abort_or_reduce_gain'
    });
  }
  
  // High spectral flatness (white noise)
  if (features.spectralFlatness > 0.4) {
    recommendations.push({
      severity: 'medium',
      type: 'noise',
      message: `High noise floor detected (spectral flatness: ${features.spectralFlatness.toFixed(3)}). Reduce gain to prevent noise amplification.`,
      action: 'reduce_lufs_target'
    });
  }
  
  // Low crest factor (over-compressed source)
  if (features.crestFactor < 2.0) {
    recommendations.push({
      severity: 'medium',
      type: 'dynamics',
      message: `Audio already heavily compressed (crest factor: ${features.crestFactor.toFixed(2)}). Use minimal compression to avoid artifacts.`,
      action: 'reduce_compression_ratio'
    });
  }
  
  // High peak levels
  if (features.peakLevel > 0.95) {
    recommendations.push({
      severity: 'low',
      type: 'levels',
      message: `High peak levels detected (${ampToDb(features.peakLevel).toFixed(2)}dB). Use strict limiting.`,
      action: 'stricter_limiter'
    });
  }
  
  // Low quality score
  if (!prediction.isAcceptable) {
    recommendations.push({
      severity: 'high',
      type: 'quality',
      message: `ML quality score below threshold (${prediction.qualityScore.toFixed(3)}). Source audio may have quality issues.`,
      action: 'inspect_source'
    });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      severity: 'info',
      type: 'clean',
      message: 'Audio quality excellent. Safe to proceed with conservative mastering.',
      action: 'proceed'
    });
  }
  
  return recommendations;
}

function ampToDb(amp) {
  return 20 * Math.log10(Math.max(amp, 1e-12));
}

// Command parsing (kept for compatibility)
export function parseCommands(text) {
  console.log("🎵 Base44 ML-POWERED STATIC PREVENTION");
  console.log("   ✅ ML analysis before processing");
  console.log("   ✅ Static detection with confidence scores");
  console.log("   ✅ Automatic parameter optimization");
  
  return {
    lines: text.split(/\r?\n/).map(s => s.trim()).filter(Boolean),
    cfg: {
      ignoreVocalsAndInstrumental: true,
      removeStaticOnly: false,
      neverAddStatic: true,
      mlEnabled: true
    }
  };
}

// Main processing function - ML-POWERED
export async function processBase44(audioFile, commands, preset = 'balanced') {
  console.log("🤖 Base44 ML-POWERED STATIC PREVENTION");
  console.log(`   Analyzing file with machine learning...`);
  console.log(`   Commands: ${commands}`);
  console.log(`   Preset: ${preset}`);
  
  try {
    // STEP 1: ML Analysis (file → audioBuffer directly)
    const mlAnalysis = await detectStaticInFile(audioFile);
    
    console.log("✅ ML Analysis Complete");
    console.log("📊 Recommendations:", mlAnalysis.recommendations);
    
    // STEP 2: Check if we should abort
    const criticalIssues = mlAnalysis.recommendations.filter(r => r.severity === 'high');
    
    if (criticalIssues.length > 0) {
      console.warn("⚠️ CRITICAL ISSUES DETECTED:");
      criticalIssues.forEach(issue => {
        console.warn(`   - ${issue.message}`);
      });
      
      // Return with warnings but don't block
      const mono = mixdownToMono(mlAnalysis.audioBuffer);
      
      return {
        audioBuffer: mlAnalysis.audioBuffer,
        processed: mono,
        regions: [],
        staticDetected: mlAnalysis.staticAnalysis.hasStatic,
        mlAnalysis: {
          staticAnalysis: mlAnalysis.staticAnalysis,
          qualityPrediction: mlAnalysis.qualityPrediction,
          features: mlAnalysis.features,
          recommendations: mlAnalysis.recommendations
        },
        config: { mlEnabled: true, neverAddStatic: true },
        message: criticalIssues.map(i => i.message).join(' | ')
      };
    }
    
    // STEP 3: Return clean audio with ML metadata
    const mono = mixdownToMono(mlAnalysis.audioBuffer);
    const sr = mlAnalysis.audioBuffer.sampleRate;
    
    console.log("✅ Base44 ML Analysis complete!");
    console.log(`   Audio: ${(mono.length/sr).toFixed(2)}s @ ${sr}Hz`);
    console.log(`   🛡️ ZERO modifications made`);
    console.log(`   ✅ ML quality verified`);
    console.log(`   📊 ${mlAnalysis.recommendations.length} recommendations provided`);
    
    return {
      audioBuffer: mlAnalysis.audioBuffer,
      processed: mono,
      regions: [],
      staticDetected: mlAnalysis.staticAnalysis.hasStatic,
      mlAnalysis: {
        staticAnalysis: mlAnalysis.staticAnalysis,
        qualityPrediction: mlAnalysis.qualityPrediction,
        features: mlAnalysis.features,
        recommendations: mlAnalysis.recommendations
      },
      config: { mlEnabled: true, neverAddStatic: true },
      message: mlAnalysis.recommendations[0]?.message || "Audio passed ML quality checks. Ready for conservative mastering."
    };
    
  } catch (error) {
    console.error("❌ Base44 ML analysis failed:", error);
    throw new Error("ML static prevention failed: " + error.message);
  }
}

// Waveform drawing function
export function drawWaveform(canvas, audioData, sampleRate, regions = []) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);
  
  // Draw waveform
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 1;
  ctx.beginPath();
  
  const step = Math.ceil(audioData.length / width);
  const amp = height / 2;
  
  for (let i = 0; i < width; i++) {
    const min = Math.min(...Array.from({ length: step }, (_, j) => audioData[i * step + j] || 0));
    const max = Math.max(...Array.from({ length: step }, (_, j) => audioData[i * step + j] || 0));
    
    const yMin = (1 + min) * amp;
    const yMax = (1 + max) * amp;
    
    if (i === 0) {
      ctx.moveTo(i, yMin);
    } else {
      ctx.lineTo(i, yMin);
    }
    ctx.lineTo(i, yMax);
  }
  
  ctx.stroke();
  
  // Draw regions (if any)
  if (regions && regions.length > 0) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
    
    for (const region of regions) {
      const startX = Math.floor((region.start / audioData.length) * width);
      const endX = Math.ceil((region.end / audioData.length) * width);
      ctx.fillRect(startX, 0, endX - startX, height);
    }
  }
}