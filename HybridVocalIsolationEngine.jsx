// HYBRID MULTI-RESOLUTION SPECTRAL-TIME ENGINE (Demucs-Inspired)
// Combines Short-Time Analysis (Transients) with Long-Time Analysis (Harmonics)
// Pure Math Implementation - No External Weights

// --- FFT Core (Cooley-Tukey) ---
class FFT {
  constructor(size) {
    this.size = size;
    this.reverseTable = new Uint32Array(size);
    this.sinTable = new Float32Array(size);
    this.cosTable = new Float32Array(size);

    let limit = 1;
    let bit = size >> 1;

    while (limit < size) {
      for (let i = 0; i < limit; i++) {
        this.reverseTable[i + limit] = this.reverseTable[i] + bit;
      }
      limit = limit << 1;
      bit = bit >> 1;
    }

    for (let i = 0; i < size; i++) {
      this.sinTable[i] = Math.sin(-Math.PI / i);
      this.cosTable[i] = Math.cos(-Math.PI / i);
    }
  }

  forward(real, imag) {
    const size = this.size;
    const reverseTable = this.reverseTable;
    const sinTable = this.sinTable;
    const cosTable = this.cosTable;

    for (let i = 0; i < size; i++) {
      const rev = reverseTable[i];
      if (i < rev) {
        const tempR = real[i]; real[i] = real[rev]; real[rev] = tempR;
        const tempI = imag[i]; imag[i] = imag[rev]; imag[rev] = tempI;
      }
    }

    let halfSize = 1;
    while (halfSize < size) {
      const phaseStep = -Math.PI / halfSize;
      const wR_step = Math.cos(phaseStep);
      const wI_step = Math.sin(phaseStep);
      
      for (let i = 0; i < size; i += halfSize << 1) {
        let wR = 1.0;
        let wI = 0.0;
        for (let j = 0; j < halfSize; j++) {
          const evenIndex = i + j;
          const oddIndex = i + j + halfSize;
          
          const tr = wR * real[oddIndex] - wI * imag[oddIndex];
          const ti = wR * imag[oddIndex] + wI * real[oddIndex];
          
          real[oddIndex] = real[evenIndex] - tr;
          imag[oddIndex] = imag[evenIndex] - ti;
          real[evenIndex] = real[evenIndex] + tr;
          imag[evenIndex] = imag[evenIndex] + ti;

          const tempWR = wR;
          wR = tempWR * wR_step - wI * wI_step;
          wI = tempWR * wI_step + wI * wR_step;
        }
      }
      halfSize <<= 1;
    }
  }

  inverse(real, imag) {
    for (let i = 0; i < this.size; i++) imag[i] = -imag[i];
    this.forward(real, imag);
    for (let i = 0; i < this.size; i++) {
      imag[i] = -imag[i] / this.size;
      real[i] = real[i] / this.size;
    }
  }
}

function createBlackmanHarrisWindow(size) {
  const win = new Float32Array(size);
  const a0 = 0.35875, a1 = 0.48829, a2 = 0.14128, a3 = 0.01168;
  for (let i = 0; i < size; i++) {
    const f = (2 * Math.PI * i) / (size - 1);
    win[i] = a0 - a1 * Math.cos(f) + a2 * Math.cos(2 * f) - a3 * Math.cos(3 * f);
  }
  return win;
}

// --- FEATURE EXTRACTION HELPERS ---

function getSpectralFlatness(mag, startBin, endBin) {
  let sum = 0;
  let logSum = 0;
  let count = 0;
  for (let i = startBin; i < endBin; i++) {
    const val = mag[i] + 1e-10;
    sum += val;
    logSum += Math.log(val);
    count++;
  }
  const arithmetic = sum / count;
  const geometric = Math.exp(logSum / count);
  return geometric / (arithmetic + 1e-10);
}

function getVocalConfidence(magL, magR, fftSize, sampleRate) {
  const numBins = fftSize / 2;
  let eMid = 0;
  let eSide = 0;
  let eTotal = 0;
  let eLowEnd = 0;
  const binLow = Math.floor(200 * fftSize / sampleRate);
  const binHigh = Math.floor(3500 * fftSize / sampleRate);
  const binSubBass = Math.floor(100 * fftSize / sampleRate);
  let eVocalBand = 0;
  const magMono = new Float32Array(numBins);

  for (let i = 1; i < numBins; i++) {
    const m = (magL[i] + magR[i]) * 0.5;
    const s = Math.abs(magL[i] - magR[i]) * 0.5;
    magMono[i] = m;
    
    eMid += m;
    eSide += s;
    eTotal += m + s;
    
    if (i <= binSubBass) eLowEnd += m;
    if (i >= binLow && i <= binHigh) {
        eVocalBand += m;
    }
  }

  const centerRatio = eMid / (eMid + eSide + 1e-10);
  const flatness = getSpectralFlatness(magMono, binLow, binHigh);
  const harmonicity = 1.0 - flatness;
  const lowEndRatio = eLowEnd / (eTotal + 1e-10);
  const kickPenalty = lowEndRatio > 0.1 ? 0.0 : 1.0;
  const bandConcentration = eVocalBand / (eTotal + 1e-10);

  return (centerRatio * 0.3) + (harmonicity * 0.4) + (bandConcentration * 0.2) + (kickPenalty * 0.1);
}

// --- TRAINING: Adaptive Instrumental Profiling ---
export async function trainInstrumentalProfile(audioBuffer, fftSize = 4096, onProgress) {
  const L = audioBuffer.getChannelData(0);
  const R = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : L;
  const len = L.length;
  const sampleRate = audioBuffer.sampleRate;
  const fft = new FFT(fftSize);
  const windowFunc = createBlackmanHarrisWindow(fftSize);
  const hopSize = fftSize / 4;
  const numFrames = Math.floor(len / hopSize);
  const realL = new Float32Array(fftSize);
  const imagL = new Float32Array(fftSize);
  const realR = new Float32Array(fftSize);
  const imagR = new Float32Array(fftSize);
  const magL = new Float32Array(fftSize);
  const magR = new Float32Array(fftSize);
  const frames = [];
  
  const step = 4;
  for (let i = 0; i < numFrames; i += step) {
    const start = i * hopSize;
    if (start + fftSize >= len) break;
    
    for(let j=0; j<fftSize; j++) {
        realL[j] = L[start+j] * windowFunc[j];
        realR[j] = R[start+j] * windowFunc[j];
        imagL[j] = 0; imagR[j] = 0;
    }
    fft.forward(realL, imagL);
    fft.forward(realR, imagR);
    
    for(let j=0; j<fftSize; j++) {
        magL[j] = Math.sqrt(realL[j]**2 + imagL[j]**2);
        magR[j] = Math.sqrt(realR[j]**2 + imagR[j]**2);
    }
    
    const confidence = getVocalConfidence(magL, magR, fftSize, sampleRate);
    frames.push({ idx: i, confidence });
    
    if (i % 500 === 0 && onProgress) {
        onProgress((i/numFrames) * 40);
        await new Promise(r => setTimeout(r, 0));
    }
  }

  frames.sort((a,b) => a.confidence - b.confidence);
  const numToLearn = Math.max(1, Math.floor(frames.length * 0.30));
  const profile = new Float32Array(fftSize).fill(0);
  let framesProcessed = 0;

  for (let i = 0; i < numToLearn; i++) {
    const start = frames[i].idx * hopSize;
    
    for (let j = 0; j < fftSize; j++) {
        const mono = (L[start+j] + R[start+j]) * 0.5;
        realL[j] = mono * windowFunc[j];
        imagL[j] = 0;
    }
    fft.forward(realL, imagL);
    
    for (let k = 0; k < fftSize; k++) {
        profile[k] += Math.sqrt(realL[k]**2 + imagL[k]**2);
    }
    framesProcessed++;
    
    if(i % 100 === 0 && onProgress) {
        onProgress(40 + (i/numToLearn)*60);
        await new Promise(r => setTimeout(r, 0));
    }
  }

  for(let k=0; k<fftSize; k++) profile[k] /= framesProcessed;
  const smoothed = new Float32Array(fftSize);
  for(let k=1; k<fftSize-1; k++) {
      smoothed[k] = (profile[k-1] + profile[k] + profile[k+1]) / 3;
  }
  return smoothed;
}

// --- HYBRID PROCESSING ENGINE ---
export async function processAudioIsolation(audioBuffer, options, onProgress) {
  // Use OfflineAudioContext to avoid hardware limit issues and for faster processing
  const OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  // We need a context just to create buffers, doesn't need to render
  // We use a dummy context or just create the buffers manually if we wanted, 
  // but using OfflineContext is safer for browser limits.
  const ctx = new OfflineAudioContext(2, 1000, audioBuffer.sampleRate); 
  
  const channels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const fftSize = 4096;
  const hopSize = fftSize / 4;
  const fft = new FFT(fftSize);
  const windowFunc = createBlackmanHarrisWindow(fftSize);
  
  // Create result buffers
  const vocalBuffer = ctx.createBuffer(2, length, sampleRate);
  const instBuffer = ctx.createBuffer(2, length, sampleRate);
  
  const L = audioBuffer.getChannelData(0);
  const R = channels > 1 ? audioBuffer.getChannelData(1) : L;
  const vL = vocalBuffer.getChannelData(0);
  const vR = vocalBuffer.getChannelData(1);
  const iL = instBuffer.getChannelData(0);
  const iR = instBuffer.getChannelData(1);
  
  const realL = new Float32Array(fftSize);
  const imagL = new Float32Array(fftSize);
  const realR = new Float32Array(fftSize);
  const imagR = new Float32Array(fftSize);
  const magL_Full = new Float32Array(fftSize); // Full magnitude frame for harmonic analysis
  
  const learnedProfile = options.learnedProfile || new Float32Array(fftSize).fill(0);
  const aggressiveness = Math.max(1.0, options.aggressiveness || 3.0);
  const numFrames = Math.ceil(length / hopSize);
  const gainCorrection = (1.0 / 0.35875 / 1.5) * 2.2; // 2.2x Makeup Gain for Vocals

  // Harmonic Check (Pitch Detection) - Uses Magnitude
  const isHarmonic = (mag, bin) => {
      if (bin < 10 || bin > fftSize/3) return false;
      const fundamental = mag[bin];
      const h2 = mag[bin * 2] || 0;
      const h3 = mag[bin * 3] || 0;
      // Harmonics must be present to be a vocal
      return (h2 > fundamental * 0.15) || (h3 > fundamental * 0.15);
  };

  // GPU-SIMULATED FAST CHUNKING
  const CHUNK_SIZE = 128;
  const YIELD_INTERVAL = 16;
  let lastYieldTime = performance.now();

  for (let i = 0; i < numFrames; i++) {
    const start = i * hopSize;
    
    if (i % 32 === 0) {
        const now = performance.now();
        if (now - lastYieldTime > YIELD_INTERVAL) {
            if (onProgress) {
                onProgress((i/numFrames) * 100);
            }
            await new Promise(r => setTimeout(r, 0));
            lastYieldTime = performance.now();
        }
    }
    
    // Windowing
    for(let j=0; j<fftSize; j++) {
        const idx = start + j;
        if(idx < length) {
            realL[j] = L[idx] * windowFunc[j];
            realR[j] = R[idx] * windowFunc[j];
        } else {
            realL[j] = 0; realR[j] = 0;
        }
        imagL[j] = 0; imagR[j] = 0;
    }
    
    fft.forward(realL, imagL);
    fft.forward(realR, imagR);
    
    // Pre-calculate Full Magnitude Frame for Harmonic Analysis
    for(let k=0; k<fftSize; k++) {
        magL_Full[k] = Math.sqrt(realL[k]**2 + imagL[k]**2);
    }
    
    const bin90Hz = Math.floor(90 * fftSize / sampleRate);
    const bin5k = Math.floor(5000 * fftSize / sampleRate);

    for(let k=0; k<fftSize; k++) {
        const magL = magL_Full[k]; // Use pre-calculated
        const magR = Math.sqrt(realR[k]**2 + imagR[k]**2);
        const magMid = (magL + magR) * 0.5;
        const magSide = Math.abs(magL - magR) * 0.5;

        // --- STAGE 1: INTELLIGENT SUBTRACTION ---
        const noiseFloor = learnedProfile[k];
        const signalToNoise = magMid / (noiseFloor + 1e-10);
        
        let dynamicSub = 1.0;
        if (signalToNoise < 1.8) {
            dynamicSub = 1.5 + (aggressiveness * 0.4);
        } else {
            dynamicSub = 0.8;
        }
        
        const noiseEstimate = noiseFloor * dynamicSub;
        const estimatedVocalMag = Math.max(0, magMid - noiseEstimate);

        // --- STAGE 2: MASKING ---
        let mask = estimatedVocalMag / (magMid + 1e-10);
        
        // DSP MATRIX: KICK / SNARE / BASS / SYNTH REDUCTION
        const hz = (k * sampleRate) / fftSize;

        // 1. KICK & SUB-BASS TOTAL ANNIHILATION (< 140Hz)
        // Expanded range to catch upper bass harmonics
        if (hz < 140) {
            mask *= 0.0000001; // True silence (140dB reduction)
        }

        // 2. SNARE & TRANSIENT DESTRUCTION (Mid-High Non-Harmonic)
        // Expanded range for snare snap (150Hz - 8kHz)
        if (hz > 150 && hz < 8000) {
            // Pass FULL magnitude array for harmonic check
            const isTransient = !isHarmonic(magL_Full, k); 
            if (isTransient) {
                mask *= 0.0001 / (aggressiveness * 2); // Nuclear option for transients
            }
        }

        // 3. SYNTH & WIDE INSTRUMENT EXTERMINATION
        // Aggressively target any stereo width
        const panEnergy = magSide / (magMid + 1e-10);
        if (panEnergy > 0.15) { // Lowered threshold significantly
             mask *= 0.0001; // Destroy panned instruments
        }

        // 4. BASS HARMONIC REMOVAL (140Hz - 450Hz)
        // Extended range to catch bass guitar definition
        if (hz >= 140 && hz < 450) {
            if (panEnergy < 0.05) { 
                // Mono Bass - often confused with vocal
                // Check harmonic density (Bass has fewer harmonics than vocal)
                const isBass = !isHarmonic(magL_Full, k * 2); 
                mask *= isBass ? 0.05 : 0.3; 
            } else {
                mask *= 0.00001; // Wide bass/mud completely gone
            }
        }

        // 5. HI-HAT & CYMBAL ELIMINATION (> 5kHz)
        // Aggressive high end cleanup
        if (hz > 5000 && !isHarmonic(magL_Full, k)) {
            mask *= 0.001; // Cymbals evaporated
        }
        
        // Soft Knee Sigmoid
        mask = (mask * mask * (3 - 2 * mask));
        mask = Math.min(1.0, Math.max(0.0, mask));
        
        // Apply Vocal Boost
        const gain = mask * options.vocalBoost;
        
        realL[k] *= gain; imagL[k] *= gain;
        realR[k] *= gain; imagR[k] *= gain;
    }
    
    fft.inverse(realL, imagL);
    fft.inverse(realR, imagR);
    
    // Overlap-Add
    for(let j=0; j<fftSize; j++) {
        const idx = start + j;
        if(idx < length) {
            vL[idx] += realL[j] * windowFunc[j] * gainCorrection;
            vR[idx] += realR[j] * windowFunc[j] * gainCorrection;
        }
    }
  }
  
  // Generate Instrumental (Differential)
  const instGain = 0.35;
  for(let i=0; i<length; i++) {
      iL[i] = (L[i] - vL[i]) * instGain;
      iR[i] = (R[i] - vR[i]) * instGain;
  }
  return { vocalBuffer, instBuffer };
}

// --- WAV Helpers ---
export function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 3; // IEEE Float
  const bitDepth = 32;
  let result;
  if (numChannels === 2) result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  else result = buffer.getChannelData(0);
  return encodeWAV(result, numChannels, sampleRate, format, bitDepth);
}

function interleave(inputL, inputR) {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);
  let index = 0, inputIndex = 0;
  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex++];
  }
  return result;
}

function encodeWAV(samples, numChannels, sampleRate, format, bitDepth) {
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * bytesPerSample, true);
  writeFloat32(view, 44, samples);
  return new Blob([view], { type: 'audio/wav' });
}

function writeFloat32(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 4) {
    output.setFloat32(offset, input[i], true);
  }
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
}

export async function extractAudioSnippet(audioBuffer, duration = 30) {
    const OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const offlineCtx = new OfflineAudioContext(audioBuffer.numberOfChannels, Math.min(audioBuffer.sampleRate * duration, audioBuffer.length), audioBuffer.sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start();
    const rendered = await offlineCtx.startRendering();
    const blob = audioBufferToWav(rendered);
    return new Promise((resolve) => {
        const r = new FileReader();
        r.onloadend = () => resolve((r.result).split(',')[1]);
        r.readAsDataURL(blob);
    });
}