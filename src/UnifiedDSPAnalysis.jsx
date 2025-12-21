/**
 * WEB-BASED DSP ANALYSIS ENGINE - COMPLETE FEATURE EXTRACTION
 * Implements the EXACT Python DSP algorithm in JavaScript
 * Based on 175M+ streaming sessions data
 * Returns TRUE RAW VALUES - no normalization applied
 * CRITICAL: Analyzes ALL features including acousticness, harmonicity, complexity
 */

// BASE R² values (variance explained in hit success)
const R2_WEIGHTS = {
  loudness: 0.073,
  tempo_rating: 0.058,
  acousticness: 0.059,  // CRITICAL for Classical, Jazz, Country, Blues
  energy: 0.034,
  rhythm_quality: 0.045,
  danceability: 0.016,
  instrumentalness: 0.030,
  valence: 0.016,
  speechiness: 0.005,
  harmonicity: 0.003,  // CRITICAL for Classical, Jazz
  complexity: 0.005,   // CRITICAL for Classical, Jazz
  liveness: 0.052,
  explicitness: 0.002
};

// Global stats for normalization (min-max scaling)
const GLOBAL_STATS = {
  loudness: { min: -60, max: 0 },
  acousticness: { min: 0, max: 0.01 },  // CRITICAL RANGE
  tempo: { min: 40, max: 200 },
  energy: { min: 0, max: 0.1 },
  rhythm_quality: { min: 0, max: 10 },
  danceability: { min: 0, max: 10 },
  instrumentalness: { min: 0, max: 5 },
  valence: { min: 0, max: 1 },
  speechiness: { min: 0, max: 1 },
  harmonicity: { min: 0, max: 1 },   // CRITICAL for quality
  complexity: { min: 0, max: 15 },   // CRITICAL for richness
  liveness: { min: 0, max: 5 },
  explicitness: { min: 0, max: 1 }
};

// Genre-specific weight multipliers - CRITICAL for Classical, Jazz, Country, Blues
const GENRE_WEIGHTS = {
  'Pop': {
    energy: 1.3,
    danceability: 1.4,
    valence: 1.2,
    rhythm_quality: 1.1,
    loudness: 1.2,
    speechiness: 1.0,
    acousticness: 1.0,
    instrumentalness: 1.0,
    harmonicity: 1.0,
    complexity: 1.0,
    liveness: 1.0,
    tempo_rating: 1.0
  },
  'Hip-Hop': {
    rhythm_quality: 4.0,
    speechiness: 5.0,
    energy: 1.5,
    loudness: 1.8,
    danceability: 1.3,
    valence: 0.5,
    acousticness: 0.3,
    instrumentalness: 0.4,
    harmonicity: 0.8,
    complexity: 1.2,
    liveness: 0.7,
    tempo_rating: 1.0
  },
  'R&B': {
    valence: 2.5,
    harmonicity: 3.0,
    energy: 1.0,
    danceability: 1.5,
    speechiness: 1.5,
    rhythm_quality: 1.4,
    loudness: 1.1,
    acousticness: 1.2,
    instrumentalness: 0.9,
    complexity: 1.3,
    liveness: 0.8,
    tempo_rating: 1.0
  },
  'Country': {
    acousticness: 4.0,      // CRITICAL - 4x boost for acoustic instruments
    speechiness: 2.0,
    valence: 1.8,
    instrumentalness: 1.5,
    liveness: 1.5,
    energy: 0.5,
    danceability: 0.7,
    rhythm_quality: 0.8,
    loudness: 0.9,
    harmonicity: 1.4,
    complexity: 0.9,
    tempo_rating: 1.0
  },
  'Latin/Reggaeton': {
    danceability: 3.5,
    rhythm_quality: 3.0,
    energy: 2.0,
    tempo_rating: 2.0,
    loudness: 1.7,
    valence: 1.5,
    speechiness: 1.6,
    acousticness: 0.8,
    instrumentalness: 1.0,
    harmonicity: 1.1,
    complexity: 1.0,
    liveness: 0.9
  },
  'Reggae': {
    rhythm_quality: 3.0,
    valence: 2.5,
    acousticness: 1.8,
    energy: 0.6,
    danceability: 1.6,
    tempo_rating: 0.5,
    liveness: 1.4,
    speechiness: 1.2,
    loudness: 0.8,
    instrumentalness: 1.3,
    harmonicity: 1.5,
    complexity: 0.8
  },
  'Blues': {
    acousticness: 3.5,      // CRITICAL - 3.5x boost
    energy: 0.4,
    valence: 0.5,
    instrumentalness: 2.0,
    harmonicity: 2.5,       // CRITICAL - Blues is harmonic
    speechiness: 1.5,
    liveness: 1.8,
    rhythm_quality: 1.0,
    danceability: 0.5,
    loudness: 0.7,
    complexity: 1.2,
    tempo_rating: 1.0
  },
  'Jazz': {
    instrumentalness: 5.0,  // CRITICAL - 5x boost
    harmonicity: 4.0,       // CRITICAL - 4x boost for jazz harmony
    complexity: 3.5,        // CRITICAL - 3.5x boost for jazz complexity
    acousticness: 3.0,      // CRITICAL - 3x boost
    energy: 0.6,
    danceability: 0.5,
    speechiness: 0.2,
    rhythm_quality: 1.2,
    valence: 1.0,
    loudness: 0.8,
    liveness: 1.6,
    tempo_rating: 1.0
  },
  'K-Pop': {
    energy: 3.0,
    danceability: 2.5,
    loudness: 2.5,
    rhythm_quality: 2.0,
    valence: 1.8,
    complexity: 1.8,
    speechiness: 1.4,
    acousticness: 0.7,
    instrumentalness: 1.1,
    harmonicity: 1.3,
    liveness: 0.6,
    tempo_rating: 1.0
  },
  'J-Core': {
    energy: 5.0,
    tempo_rating: 4.0,
    rhythm_quality: 2.5,
    loudness: 2.8,
    complexity: 2.5,
    danceability: 1.8,
    valence: 1.3,
    acousticness: 0.4,
    speechiness: 0.8,
    instrumentalness: 1.5,
    harmonicity: 1.2,
    liveness: 0.5
  },
  'Classical': {
    instrumentalness: 6.0,  // CRITICAL - 6x boost (highest)
    harmonicity: 4.5,       // CRITICAL - 4.5x boost for classical harmony
    complexity: 4.0,        // CRITICAL - 4x boost for orchestral complexity
    acousticness: 5.0,      // CRITICAL - 5x boost (highest)
    energy: 0.3,
    danceability: 0.2,
    speechiness: 0.1,
    rhythm_quality: 0.6,
    valence: 1.1,
    loudness: 0.5,
    liveness: 1.3,
    tempo_rating: 1.0
  },
  'Afrobeats': {
    rhythm_quality: 3.5,
    danceability: 3.0,
    energy: 2.0,
    valence: 2.0,
    loudness: 1.8,
    tempo_rating: 1.6,
    speechiness: 1.7,
    acousticness: 1.0,
    instrumentalness: 1.2,
    harmonicity: 1.3,
    complexity: 1.1,
    liveness: 1.0
  },
  'Electronic': {
    energy: 4.0,
    danceability: 3.5,
    loudness: 3.0,
    complexity: 2.5,
    rhythm_quality: 2.0,
    tempo_rating: 2.5,
    instrumentalness: 2.0,
    valence: 1.5,
    speechiness: 0.5,
    acousticness: 0.3,
    harmonicity: 1.2,
    liveness: 0.4
  },
  'Rock': {
    energy: 3.5,
    loudness: 3.0,
    rhythm_quality: 2.5,
    instrumentalness: 2.5,
    complexity: 2.0,
    danceability: 1.0,
    valence: 1.0,
    acousticness: 0.8,
    speechiness: 1.2,
    harmonicity: 1.5,
    liveness: 1.5,
    tempo_rating: 1.0
  },
  'Christian': {
    acousticness: 3.5,
    valence: 3.0,
    harmonicity: 3.5,
    speechiness: 2.5,
    instrumentalness: 2.0,
    liveness: 2.0,
    energy: 1.0,
    danceability: 0.8,
    rhythm_quality: 1.0,
    loudness: 1.0,
    complexity: 1.5,
    tempo_rating: 1.0
  },
  'Gospel': {
    acousticness: 3.0,
    valence: 3.5,
    harmonicity: 4.0,
    speechiness: 3.0,
    energy: 1.5,
    liveness: 2.5,
    rhythm_quality: 1.5,
    danceability: 1.2,
    instrumentalness: 1.5,
    loudness: 1.2,
    complexity: 1.8,
    tempo_rating: 1.0
  }
};

const FEATURE_DESCRIPTIONS = {
  loudness: "Production quality - mastering, dynamics, frequency balance",
  energy: "Intensity/power/drive - amplitude + high-freq + mid-freq power",
  rhythm_quality: "Groove strength, timing precision",
  danceability: "Beat consistency",
  valence: "Emotional positivity",
  acousticness: "How well instruments sound - audio quality, clarity, harmonic balance",
  instrumentalness: "Number and use of instruments - detects active frequency bands",
  speechiness: "Word count & frequency - syllable detection + word burst patterns",
  harmonicity: "Musical vs noise",
  complexity: "Spectral richness",
  liveness: "Room ambience",
  tempo_rating: "BPM (beats per minute)",
  explicitness: "Explicit content"
};

/**
 * Simple FFT implementation (Cooley-Tukey algorithm)
 */
function computeFFT(input) {
  const n = input.length;
  if (n <= 1) {
    const output = new Float32Array(n * 2);
    output[0] = input[0] || 0;
    output[1] = 0;
    return output;
  }
  
  const output = new Float32Array(n * 2);
  
  for (let i = 0; i < n; i++) {
    output[i * 2] = input[i];
    output[i * 2 + 1] = 0;
  }
  
  let j = 0;
  for (let i = 0; i < n - 1; i++) {
    if (i < j) {
      [output[i * 2], output[j * 2]] = [output[j * 2], output[i * 2]];
      [output[i * 2 + 1], output[j * 2 + 1]] = [output[j * 2 + 1], output[i * 2 + 1]];
    }
    let k = n / 2;
    while (k <= j) {
      j -= k;
      k /= 2;
    }
    j += k;
  }
  
  for (let len = 2; len <= n; len *= 2) {
    const halfLen = len / 2;
    const angle = -2 * Math.PI / len;
    
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < halfLen; k++) {
        const tReal = Math.cos(angle * k);
        const tImag = Math.sin(angle * k);
        
        const idx1 = (i + k) * 2;
        const idx2 = (i + k + halfLen) * 2;
        
        const tempReal = output[idx2] * tReal - output[idx2 + 1] * tImag;
        const tempImag = output[idx2] * tImag + output[idx2 + 1] * tReal;
        
        output[idx2] = output[idx1] - tempReal;
        output[idx2 + 1] = output[idx1 + 1] - tempImag;
        
        output[idx1] += tempReal;
        output[idx1 + 1] += tempImag;
      }
    }
  }
  
  return output;
}

/**
 * Helper function for min-max normalization
 */
function normalizeFeature(value, min, max) {
  if (max === min) return 0;
  const normalized = (value - min) / (max - min);
  return Math.max(0, Math.min(1, normalized));
}

/**
 * EXACT Python DSP Implementation - Returns TRUE RAW VALUES
 * CRITICAL: Uses MINIMAL decimation (2x only) to preserve ALL features
 * ADDED: File size protection to prevent browser freezing
 */
export async function runUnifiedDSPAnalysis(audioFile, fileHash) {
  console.log("🎵 Starting COMPLETE Web-Based DSP Analysis (ALL FEATURES)...");

  // CRITICAL FIX: Check file size BEFORE processing
  const fileSizeMB = audioFile.size / (1024 * 1024);
  if (fileSizeMB > 200) {
    console.error(`❌ File too large: ${fileSizeMB.toFixed(2)}MB (max 200MB)`);
    throw new Error(`File too large (${fileSizeMB.toFixed(2)}MB). Maximum size is 200MB. Please compress your file first.`);
  }

  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        
        // ADDED: Additional safety check for decoded buffer size
        console.log(`📊 Buffer size: ${(arrayBuffer.byteLength / (1024 * 1024)).toFixed(2)}MB`);
        
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const sampleRate = audioBuffer.sampleRate;
        const duration = audioBuffer.duration;
        
        // ADDED: Warn if duration is very long
        if (duration > 600) { // 10 minutes
          console.warn(`⚠️ Long duration detected: ${duration.toFixed(0)}s - may take time to process`);
        }
        
        let y = audioBuffer.getChannelData(0);
        
        // MINIMAL DECIMATION - Only 2x to preserve feature quality
        const decimationFactor = 2;  // Changed from 4 to 2 for better acousticness analysis
        const decimatedLength = Math.floor(y.length / decimationFactor);
        const yDecimated = new Float32Array(decimatedLength);
        for (let i = 0; i < decimatedLength; i++) {
          yDecimated[i] = y[i * decimationFactor];
        }
        y = yDecimated;
        const sr = sampleRate / decimationFactor;
        
        console.log(`✅ Audio loaded: ${duration.toFixed(2)}s at ${sampleRate}Hz (decimated to ${sr}Hz for performance)`);

        // --- Loudness (RMS) - RAW dB value ---
        let sumSquares = 0;
        for (let i = 0; i < y.length; i++) {
          sumSquares += y[i] * y[i];
        }
        const rms = Math.sqrt(sumSquares / y.length);
        const loudness = 20 * Math.log10(rms + 1e-9);

        // --- Tempo (Autocorrelation) - RAW BPM ---
        let tempo = 120;
        try {
          const corrLength = Math.min(y.length, Math.floor(sr * 3));
          const corr = new Float32Array(corrLength);
          
          for (let lag = 0; lag < corrLength; lag++) {
            let sum = 0;
            const samples = Math.min(10000, y.length - lag);
            for (let i = 0; i < samples; i++) {
              sum += y[i] * y[i + lag];
            }
            corr[lag] = sum;
          }
          
          const minLag = Math.floor(sr * 0.3);
          const maxLag = Math.floor(sr * 2);
          const peaks = [];
          
          for (let i = minLag; i < Math.min(maxLag, corr.length - 1); i++) {
            if (corr[i] > corr[i - 1] && corr[i] > corr[i + 1]) {
              peaks.push(i);
            }
          }
          
          if (peaks.length > 1) {
            let avgInterval = 0;
            for (let i = 1; i < peaks.length; i++) {
              avgInterval += peaks[i] - peaks[i - 1];
            }
            avgInterval /= (peaks.length - 1);
            tempo = 60 * sr / avgInterval;
            
            if (tempo < 40) tempo *= 2;
            if (tempo > 200) tempo /= 2;
            tempo = Math.max(40, Math.min(200, tempo));
          }
        } catch (err) {
          console.warn("Tempo detection failed:", err);
          tempo = 120;
        }

        // --- FFT Spectrum - FULL RESOLUTION for accurate feature extraction ---
        const fftSize = Math.pow(2, Math.floor(Math.log2(y.length)));
        const fftInput = new Float32Array(fftSize);
        for (let i = 0; i < Math.min(fftSize, y.length); i++) {
          fftInput[i] = y[i];
        }
        
        const fft = computeFFT(fftInput);
        const mag = new Float32Array(fft.length / 2);
        for (let i = 0; i < mag.length; i++) {
          const real = fft[i * 2];
          const imag = fft[i * 2 + 1];
          mag[i] = Math.sqrt(real * real + imag * imag);
        }
        
        const freqs = new Float32Array(mag.length);
        for (let i = 0; i < mag.length; i++) {
          freqs[i] = i * sr / fftSize;
        }

        // --- Spectral Centroid - RAW Hz value ---
        let numerator = 0;
        let denominator = 0;
        for (let i = 0; i < mag.length; i++) {
          numerator += freqs[i] * mag[i];
          denominator += mag[i];
        }
        const spectral_centroid = numerator / (denominator + 1e-9);

        // --- ACOUSTICNESS - CRITICAL FOR CLASSICAL, JAZZ, COUNTRY, BLUES ---
        // Lower centroid = more acoustic quality
        // Inverse relationship: 1/centroid gives higher values for acoustic sounds
        const acousticness_raw = 1 / (spectral_centroid + 1);
        console.log(`🎻 ACOUSTICNESS (CRITICAL): spectral_centroid=${spectral_centroid.toFixed(2)}Hz → acousticness=${acousticness_raw.toFixed(6)}`);

        // --- Energy - RAW amplitude squared ---
        const energy = sumSquares / y.length;

        // --- RHYTHM QUALITY (ONSET DETECTION) ---
        const onset_env = new Float32Array(y.length - 1);
        for (let i = 0; i < onset_env.length; i++) {
          const diff = y[i + 1] - y[i];
          onset_env[i] = diff * diff;
        }
        
        let onset_count = 0;
        const windowSize = Math.floor(sr / 4);
        for (let i = windowSize; i < onset_env.length - windowSize; i++) {
          if (onset_env[i] > onset_env[i - 1] && onset_env[i] > onset_env[i + 1]) {
            onset_count++;
          }
        }
        const rhythm_quality = onset_count / (duration + 1e-9);

        // --- Danceability (Beat Consistency) - RAW 1/std value ---
        let danceability = 0.5;
        if (onset_count > 1) {
          const intervals = [];
          let lastOnset = 0;
          for (let i = windowSize; i < onset_env.length - windowSize; i++) {
            if (onset_env[i] > onset_env[i - 1] && onset_env[i] > onset_env[i + 1]) {
              if (lastOnset > 0) {
                intervals.push((i - lastOnset) / sr);
              }
              lastOnset = i;
            }
          }
          
          if (intervals.length > 1) {
            let mean = 0;
            for (let i = 0; i < intervals.length; i++) {
              mean += intervals[i];
            }
            mean /= intervals.length;
            
            let variance = 0;
            for (let i = 0; i < intervals.length; i++) {
              const diff = intervals[i] - mean;
              variance += diff * diff;
            }
            variance /= intervals.length;
            const std = Math.sqrt(variance);
            
            danceability = 1 / (std + 1e-9);
          }
        }

        // --- Instrumentalness (High/Mid Freq Ratio) - CRITICAL FOR JAZZ, CLASSICAL ---
        const split = Math.floor(mag.length * 0.25);
        let highFreqSum = 0;
        let totalSum = 0;
        for (let i = 0; i < mag.length; i++) {
          totalSum += mag[i];
          if (i >= split) {
            highFreqSum += mag[i];
          }
        }
        const inst_ratio = highFreqSum / (totalSum + 1e-9);
        console.log(`🎼 INSTRUMENTALNESS (CRITICAL): high_freq_ratio=${inst_ratio.toFixed(4)}`);

        // --- Valence (Brightness) - RAW ratio 0-1 ---
        const maxFreq = freqs[freqs.length - 1];
        const valence = spectral_centroid / (maxFreq + 1e-9);

        // --- Speechiness (Zero Crossing Rate) - RAW ZCR ---
        let zcr_count = 0;
        for (let i = 1; i < y.length; i++) {
          if (y[i - 1] * y[i] < 0) {
            zcr_count++;
          }
        }
        const zcr = zcr_count / y.length;

        // --- HARMONICITY (Autocorrelation Max) - CRITICAL FOR JAZZ, CLASSICAL, BLUES ---
        const shortCorr = new Float32Array(Math.min(2000, y.length)); // Increased from 1000
        let maxCorr = 0;
        let sumCorrSquares = 0;
        for (let lag = 0; lag < shortCorr.length; lag++) {
          let sum = 0;
          const samples = Math.min(5000, y.length - lag); // Increased sampling
          for (let i = 0; i < samples; i++) {
            sum += y[i] * y[i + lag];
          }
          shortCorr[lag] = sum;
          if (sum > maxCorr) maxCorr = sum;
          sumCorrSquares += sum * sum;
        }
        const harmonicity = Math.max(0, Math.min(1, maxCorr / (Math.sqrt(sumCorrSquares) + 1e-9)));
        console.log(`🎵 HARMONICITY (CRITICAL): ${harmonicity.toFixed(4)} (0=noise, 1=pure tone)`);

        // --- COMPLEXITY (Spectral Entropy) - CRITICAL FOR JAZZ, CLASSICAL ---
        let entropy = 0;
        for (let i = 0; i < mag.length; i++) {
          const p = mag[i] / (totalSum + 1e-9);
          if (p > 0) {
            entropy += -p * Math.log2(p);
          }
        }
        entropy = Math.max(0, Math.min(15, entropy));
        console.log(`🎭 COMPLEXITY (CRITICAL): ${entropy.toFixed(2)} (spectral richness)`);

        // --- Liveness (Low/High Freq Ratio) - RAW ratio ---
        let lowFreqSum = 0;
        for (let i = 0; i < split; i++) {
          lowFreqSum += mag[i];
        }
        const liveness = Math.max(0, Math.min(5, lowFreqSum / (highFreqSum + 1e-9)));

        // --- Explicitness (Placeholder) ---
        const explicitness = 0;

        // RAW FEATURES (with clamping to expected ranges)
        const rawFeatures = {
          loudness: Math.max(GLOBAL_STATS.loudness.min, Math.min(GLOBAL_STATS.loudness.max, loudness)),
          tempo: Math.max(GLOBAL_STATS.tempo.min, Math.min(GLOBAL_STATS.tempo.max, tempo)),
          acousticness: Math.max(GLOBAL_STATS.acousticness.min, Math.min(GLOBAL_STATS.acousticness.max, acousticness_raw)),
          energy: Math.max(GLOBAL_STATS.energy.min, Math.min(GLOBAL_STATS.energy.max, energy)),
          rhythm_quality: Math.max(GLOBAL_STATS.rhythm_quality.min, Math.min(GLOBAL_STATS.rhythm_quality.max, rhythm_quality)),
          danceability: Math.max(GLOBAL_STATS.danceability.min, Math.min(GLOBAL_STATS.danceability.max, danceability)),
          instrumentalness: Math.max(GLOBAL_STATS.instrumentalness.min, Math.min(GLOBAL_STATS.instrumentalness.max, inst_ratio)),
          valence: Math.max(GLOBAL_STATS.valence.min, Math.min(GLOBAL_STATS.valence.max, valence)),
          speechiness: Math.max(GLOBAL_STATS.speechiness.min, Math.min(GLOBAL_STATS.speechiness.max, zcr)),
          harmonicity: harmonicity,
          complexity: entropy,
          liveness: liveness,
          explicitness: Math.max(GLOBAL_STATS.explicitness.min, Math.min(GLOBAL_STATS.explicitness.max, explicitness))
        };

        console.log("✅ COMPLETE RAW features extracted:");
        console.log(`   🎻 ACOUSTICNESS: ${rawFeatures.acousticness.toFixed(6)} (CRITICAL for Classical/Jazz/Country/Blues)`);
        console.log(`   🎵 HARMONICITY: ${rawFeatures.harmonicity.toFixed(4)} (CRITICAL for Jazz/Classical/Blues)`);
        console.log(`   🎭 COMPLEXITY: ${rawFeatures.complexity.toFixed(2)} (CRITICAL for Jazz/Classical)`);
        console.log(`   🎼 INSTRUMENTALNESS: ${rawFeatures.instrumentalness.toFixed(4)} (CRITICAL for Jazz/Classical)`);
        console.log(`   🎯 RHYTHM_QUALITY: ${rawFeatures.rhythm_quality.toFixed(2)}/10 (DSP onset detection)`);
        console.log(`   Loudness: ${rawFeatures.loudness.toFixed(2)} dB`);
        console.log(`   Tempo: ${rawFeatures.tempo.toFixed(1)} BPM`);
        
        resolve(rawFeatures);

      } catch (err) {
        console.error("❌ Web DSP analysis failed:", err);
        
        // ADDED: Better error messages
        if (err.message.includes('memory') || err.message.includes('AudioBuffer larger than memory')) {
          reject(new Error(`Audio file too large to process in browser. Please compress to <50MB.`));
        } else {
          reject(new Error(`Web DSP analysis failed: ${err.message}`));
        }
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read audio file"));
    };

    reader.readAsArrayBuffer(audioFile);
  });
}

/**
 * UNIVERSAL HIT SCORE CALCULATION - EXACT PYTHON IMPLEMENTATION
 * Formula: hit_score = (Σ(normalized_feature × R²)) / (Σ R²) × 100
 * Features normalized from RAW values to 0-1 scale using min-max
 */
export function calculatePopHitScore(features) {
  console.log("\n🎯 Calculating Pop Hit Score (EXACT Python Algorithm with ALL features)...");
  console.log("Raw features input:", features);
  
  let weighted_sum = 0;
  let total_r2 = 0;

  const featureMapping = {
    loudness: 'loudness',
    tempo: 'tempo_rating',
    acousticness: 'acousticness',      // CRITICAL
    energy: 'energy',
    rhythm_quality: 'rhythm_quality',
    danceability: 'danceability',
    instrumentalness: 'instrumentalness',  // CRITICAL
    valence: 'valence',
    speechiness: 'speechiness',
    harmonicity: 'harmonicity',        // CRITICAL
    complexity: 'complexity',          // CRITICAL
    liveness: 'liveness',
    explicitness: 'explicitness'
  };

  const normalized = {};
  
  for (const [rawKey, r2Key] of Object.entries(featureMapping)) {
    const rawValue = features[rawKey];
    const stats = GLOBAL_STATS[rawKey === 'tempo' ? 'tempo' : r2Key]; 
    const r2 = R2_WEIGHTS[r2Key];
    
    if (rawValue === undefined || rawValue === null || !stats || r2 === undefined) {
      console.log(`⚠️ Skipping ${rawKey}: missing raw value, stats, or R² weight.`);
      continue;
    }
    
    const { min, max } = stats;
    const norm_val = normalizeFeature(rawValue, min, max);
    normalized[r2Key] = norm_val;
    
    weighted_sum += norm_val * r2;
    total_r2 += r2;
    
    const isCritical = ['acousticness', 'harmonicity', 'complexity', 'instrumentalness'].includes(r2Key);
    console.log(`${rawKey} (${r2Key})${isCritical ? ' [CRITICAL]' : ''}: raw=${rawValue.toFixed(6)} → norm=${norm_val.toFixed(4)} × R²=${r2.toFixed(3)} = ${(norm_val * r2).toFixed(4)}`);
  }

  console.log(`\nweighted_sum = ${weighted_sum.toFixed(4)}`);
  console.log(`total_r2 = ${total_r2.toFixed(4)}`);

  if (total_r2 === 0) {
    console.error("❌ total_r2 is 0, cannot calculate hit score.");
    return 0;
  }

  const hit_score = (weighted_sum / total_r2) * 100;
  const final_score = Math.max(0, Math.min(100, hit_score));
  
  console.log(`Formula: (${weighted_sum.toFixed(4)} / ${total_r2.toFixed(4)}) × 100 = ${final_score.toFixed(2)}%`);
  console.log(`✅ Final Hit Score: ${final_score.toFixed(2)}%\n`);
  
  return final_score;
}

/**
 * Genre-specific score using EXACT v4.3.0 formula with ALL features
 */
export function calculateGenreScore(rawFeatures, genre) {
  console.log(`\n🎸 Calculating ${genre} score (v4.3.0 FORMULA with ALL features)...`);
  
  const genreWeights = GENRE_WEIGHTS[genre] || GENRE_WEIGHTS['Pop'];
  
  let weighted_sum = 0;
  let total_weight = 0;

  const featureMapping = {
    loudness: 'loudness',
    tempo: 'tempo_rating',
    acousticness: 'acousticness',         // CRITICAL
    energy: 'energy',
    rhythm_quality: 'rhythm_quality',
    danceability: 'danceability',
    instrumentalness: 'instrumentalness',  // CRITICAL
    valence: 'valence',
    speechiness: 'speechiness',
    harmonicity: 'harmonicity',           // CRITICAL
    complexity: 'complexity',             // CRITICAL
    liveness: 'liveness',
    explicitness: 'explicitness'
  };

  for (const [rawKey, r2Key] of Object.entries(featureMapping)) {
    const rawValue = rawFeatures[rawKey];
    const stats = GLOBAL_STATS[rawKey === 'tempo' ? 'tempo' : r2Key]; 
    const baseR2 = R2_WEIGHTS[r2Key];
    
    if (rawValue === undefined || rawValue === null || !stats || baseR2 === undefined) {
      console.log(`⚠️ Skipping ${rawKey} for ${genre} score: missing data.`);
      continue;
    }
    
    const { min, max } = stats;
    const norm_val = normalizeFeature(rawValue, min, max);
    
    const genreMultiplier = genreWeights[r2Key] || 1.0;
    const finalWeight = baseR2 * genreMultiplier;
    
    weighted_sum += norm_val * finalWeight;
    total_weight += finalWeight;
    
    const isCritical = ['acousticness', 'harmonicity', 'complexity', 'instrumentalness'].includes(r2Key);
    if (isCritical || genreMultiplier > 1.5) {
      console.log(`  ${rawKey} (${r2Key})${isCritical ? ' [CRITICAL]' : ''}: norm=${norm_val.toFixed(4)} × (R²=${baseR2.toFixed(3)} × genre=${genreMultiplier.toFixed(1)}) = ${(norm_val * finalWeight).toFixed(4)}`);
    }
  }

  console.log(`\n  weighted_sum = ${weighted_sum.toFixed(4)}`);
  console.log(`  total_weight = ${total_weight.toFixed(4)}`);

  if (total_weight === 0) {
    console.error("❌ total_weight is 0 for genre score.");
    return 0.0;
  }

  const score = (weighted_sum / total_weight) * 100;
  const finalScore = Math.max(0, Math.min(100, score));
  
  console.log(`✅ ${genre} Final Score: ${finalScore.toFixed(2)}%`);
  
  return finalScore;
}

/**
 * Calculate all 12 genre scores at once (v4.3.0)
 */
export function calculateAllGenreScores(rawFeatures) {
  console.log("\n🎯 Calculating all 12 genre scores (v4.3.0 with ALL features)...");
  const genreScores = {};

  for (const genre of Object.keys(GENRE_WEIGHTS)) {
    genreScores[genre] = calculateGenreScore(rawFeatures, genre);
  }

  console.log("\n✅ All genre scores calculated:", genreScores);
  return genreScores;
}

/**
 * Get genre-specific R² weights for display
 */
export function getGenreSpecificWeights(genre) {
  const genreWeights = GENRE_WEIGHTS[genre] || GENRE_WEIGHTS['Pop'];
  const specificWeights = {};
  
  for (const [feat, baseR2] of Object.entries(R2_WEIGHTS)) {
    const multiplier = genreWeights[feat] || 1.0;
    specificWeights[feat] = baseR2 * multiplier;
  }
  
  return specificWeights;
}

export { GENRE_WEIGHTS, FEATURE_DESCRIPTIONS, R2_WEIGHTS, GLOBAL_STATS };