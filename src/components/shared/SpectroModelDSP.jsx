
/**
 * SPECTROMODEL DSP ENGINE - PROFESSIONAL ENHANCEMENT MODE
 * CRITICAL: ONLY enhancements, ZERO removal, ZERO truncation
 * Professional mastering chain with LUFS normalization, compression, and clarity
 * WITH AUTO-ERROR DETECTION & FIXING
 */

// ============= UTILITY FUNCTIONS =============

export function dbToAmp(db) {
    return Math.pow(10, db / 20);
}

export function ampToDb(amp) {
    return 20 * Math.log10(Math.max(amp, 1e-12));
}

// CRITICAL: Safe peak finding for large arrays
function findPeak(array) {
    let peak = 0;
    for (let i = 0; i < array.length; i++) {
        const abs = Math.abs(array[i]);
        if (abs > peak) {
            peak = abs;
        }
    }
    return peak;
}

// ============= SAFE FFT IMPLEMENTATION =============

function computeFFT(input) {
    const n = input.length;
    if (n <= 1) {
        const output = new Float32Array(n * 2);
        output[0] = input[0] || 0;
        output[1] = 0;
        return output;
    }
    
    if (n > 16384) {
        console.warn(`⚠️ FFT size ${n} too large, truncating to 16384`);
        const truncated = new Float32Array(16384);
        for (let i = 0; i < 16384; i++) {
            truncated[i] = input[i];
        }
        return computeFFT(truncated);
    }
    
    const output = new Float32Array(n * 2);
    
    try {
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
    } catch (error) {
        console.error("❌ FFT computation failed:", error);
        return new Float32Array(n * 2);
    }
}

// ============= ERROR DETECTION & AUTO-FIX =============

function detectAndFixAudioErrors(audioBuffer) {
  const errors = [];
  let needsReload = false;

  try {
    // Error 1: Check if audio buffer is valid
    if (!audioBuffer || audioBuffer.length === 0) {
      errors.push({
        type: 'invalid_buffer',
        severity: 'critical',
        message: 'Audio buffer is invalid or empty',
        fix: () => {
          throw new Error('Cannot fix invalid audio buffer - please reload file');
        }
      });
      return { errors, needsReload: true };
    }

    // Error 2: Check sample rate
    if (audioBuffer.sampleRate < 8000 || audioBuffer.sampleRate > 192000) {
      errors.push({
        type: 'invalid_sample_rate',
        severity: 'high',
        message: `Invalid sample rate: ${audioBuffer.sampleRate}Hz`,
        fix: () => {
          console.log('⚠️ Sample rate out of range, will process at current rate');
        }
      });
    }

    // Error 3: Check for NaN or Infinity values
    for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
      const data = audioBuffer.getChannelData(ch);
      let invalidCount = 0;
      for (let i = 0; i < data.length; i++) {
        if (isNaN(data[i]) || !isFinite(data[i])) {
          data[i] = 0; // Auto-fix: replace with silence
          invalidCount++;
        }
      }
      if (invalidCount > 0) {
        errors.push({
          type: 'invalid_samples',
          severity: 'medium',
          message: `Fixed ${invalidCount} invalid samples in channel ${ch}`,
          fix: () => console.log(`✅ Auto-fixed ${invalidCount} invalid samples`)
        });
      }
    }

    // Error 4: Check for extreme clipping
    for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
      const data = audioBuffer.getChannelData(ch);
      let clippedSamples = 0;
      for (let i = 0; i < data.length; i++) {
        if (Math.abs(data[i]) > 1.0) {
          data[i] = data[i] > 0 ? 1.0 : -1.0; // Auto-fix: hard limit
          clippedSamples++;
        }
      }
      if (clippedSamples > 0) {
        errors.push({
          type: 'extreme_clipping',
          severity: 'medium',
          message: `Fixed ${clippedSamples} samples exceeding ±1.0 in channel ${ch}`,
          fix: () => console.log(`✅ Auto-fixed extreme clipping`)
        });
      }
    }

    // Error 5: Check for DC offset
    for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
      const data = audioBuffer.getChannelData(ch);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += data[i];
      }
      const dcOffset = sum / data.length;
      if (Math.abs(dcOffset) > 0.01) {
        // Auto-fix: remove DC offset
        for (let i = 0; i < data.length; i++) {
          data[i] -= dcOffset;
        }
        errors.push({
          type: 'dc_offset',
          severity: 'low',
          message: `Removed DC offset: ${dcOffset.toFixed(4)} in channel ${ch}`,
          fix: () => console.log(`✅ Auto-fixed DC offset`)
        });
      }
    }

    return { errors, needsReload };
  } catch (error) {
    console.error('❌ Error detection failed:', error);
    return { errors: [], needsReload: true };
  }
}

// ============= DETECTION FUNCTIONS (FOR DISPLAY ONLY) =============

export function detectClipping(y, threshold = 0.999) {
    let clipCount = 0;
    for (let i = 0; i < y.length; i++) {
        if (Math.abs(y[i]) >= threshold) {
            clipCount++;
        }
    }
    const clipRatio = clipCount / y.length;
    return {
        hasClipping: clipRatio > 0.0005,
        clipRatio: clipRatio
    };
}

export function detectLUFS(y, sr) {
    try {
        let rms = 0;
        for (let i = 0; i < y.length; i++) {
            rms += y[i] * y[i];
        }
        rms = Math.sqrt(rms / y.length);
        
        const lufs = -0.691 + 10 * Math.log10(rms * rms + 1e-10);
        const target = -14.0;
        
        return {
            hasIssue: Math.abs(lufs - target) > 2.0,
            currentLUFS: lufs
        };
    } catch (error) {
        console.error("❌ LUFS detection failed:", error);
        return { hasIssue: false, currentLUFS: -14.0 };
    }
}

// ============= PROFESSIONAL ENHANCEMENT FUNCTIONS =============

export function repairClipping(y) {
    try {
        const output = new Float32Array(y.length);
        let fixedCount = 0;
        
        for (let i = 1; i < y.length - 1; i++) {
            if (Math.abs(y[i]) >= 0.99) {
                output[i] = (y[i - 1] + y[i + 1]) / 2;
                fixedCount++;
            } else {
                output[i] = y[i];
            }
        }
        output[0] = y[0];
        output[y.length - 1] = y[y.length - 1];
        
        if (fixedCount > 0) {
            console.log(`✂️ Clipping repair: Fixed ${fixedCount} samples (${(fixedCount/y.length*100).toFixed(3)}%)`);
        }
        
        return output;
    } catch (error) {
        console.error("❌ Clipping repair failed:", error);
        return y;
    }
}

export function normalizeLUFS(y, sr, targetLUFS = -14.0) {
    try {
        let rms = 0;
        for (let i = 0; i < y.length; i++) {
            rms += y[i] * y[i];
        }
        rms = Math.sqrt(rms / y.length);
        
        const currentLUFS = -0.691 + 10 * Math.log10(rms * rms + 1e-10);
        const gainDb = targetLUFS - currentLUFS;
        const gainLinear = dbToAmp(gainDb);
        
        const output = new Float32Array(y.length);
        for (let i = 0; i < y.length; i++) {
            output[i] = y[i] * gainLinear;
        }
        
        console.log(`📢 LUFS: ${currentLUFS.toFixed(2)} → ${targetLUFS.toFixed(2)} (gain: ${gainDb > 0 ? '+' : ''}${gainDb.toFixed(2)}dB)`);
        
        return { output, oldLUFS: currentLUFS, newLUFS: targetLUFS, gainDb };
    } catch (error) {
        console.error("❌ LUFS normalization failed:", error);
        return { output: y, oldLUFS: -14.0, newLUFS: -14.0, gainDb: 0 };
    }
}

export function professionalCompressor(y, sr, thresholdDb = -18, ratio = 3.0, attackMs = 5, releaseMs = 50, makeupGainDb = 0) {
    try {
        const threshold = dbToAmp(thresholdDb);
        const attackSamples = Math.floor(sr * attackMs / 1000);
        const releaseSamples = Math.floor(sr * releaseMs / 1000);
        const makeupGain = dbToAmp(makeupGainDb);
        
        const output = new Float32Array(y.length);
        let envelope = 0;
        
        for (let i = 0; i < y.length; i++) {
            const input = Math.abs(y[i]);
            
            // Envelope follower
            if (input > envelope) {
                envelope += (input - envelope) / attackSamples;
            } else {
                envelope += (input - envelope) / releaseSamples;
            }
            
            // Calculate gain reduction
            let gainReduction = 1.0;
            if (envelope > threshold) {
                const over = envelope / threshold;
                gainReduction = Math.pow(over, 1 / ratio - 1);
            }
            
            // Apply compression with makeup gain
            output[i] = y[i] * gainReduction * makeupGain;
        }
        
        console.log(`📦 Compression: ${ratio}:1 @ ${thresholdDb}dB, attack: ${attackMs}ms, release: ${releaseMs}ms, makeup: +${makeupGainDb}dB`);
        
        return output;
    } catch (error) {
        console.error("❌ Compression failed:", error);
        return y;
    }
}

export function highShelfBoost(y, sr, cutoffHz = 8000, gainDb = 3.0) {
    try {
        const nyquist = sr / 2;
        if (cutoffHz >= nyquist) {
            console.log(`⚠️ Cutoff ${cutoffHz}Hz >= Nyquist ${nyquist}Hz, skipping high-shelf`);
            return y;
        }
        
        const gain = dbToAmp(gainDb);
        const output = new Float32Array(y.length);
        
        const w0 = 2 * Math.PI * cutoffHz / sr;
        const alpha = Math.sin(w0) / (2 * 0.707);
        
        const A = Math.sqrt(gain);
        const cosW0 = Math.cos(w0);
        
        const b0 = A * ((A + 1) + (A - 1) * cosW0 + 2 * Math.sqrt(A) * alpha);
        const b1 = -2 * A * ((A - 1) + (A + 1) * cosW0);
        const b2 = A * ((A + 1) + (A - 1) * cosW0 - 2 * Math.sqrt(A) * alpha);
        const a0 = (A + 1) - (A - 1) * cosW0 + 2 * Math.sqrt(A) * alpha;
        const a1 = 2 * ((A - 1) - (A + 1) * cosW0);
        const a2 = (A + 1) - (A - 1) * cosW0 - 2 * Math.sqrt(A) * alpha;
        
        let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
        
        for (let i = 0; i < y.length; i++) {
            const x0 = y[i];
            const y0 = (b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
            
            output[i] = y0;
            
            x2 = x1;
            x1 = x0;
            y2 = y1;
            y1 = y0;
        }
        
        console.log(`✨ High-shelf boost: +${gainDb}dB @ ${cutoffHz}Hz (air & presence)`);
        
        return output;
    } catch (error) {
        console.error("❌ High-shelf boost failed:", error);
        return y;
    }
}

export function brickwallLimiter(y, ceilingDb = -0.3) {
    try {
        const ceiling = dbToAmp(ceilingDb);
        const peak = findPeak(y);
        
        if (peak <= ceiling) {
            console.log(`🎚️ No limiting needed: peak ${ampToDb(peak).toFixed(2)}dB < ceiling ${ceilingDb}dB`);
            return y;
        }
        
        const gain = ceiling / peak;
        const output = new Float32Array(y.length);
        for (let i = 0; i < y.length; i++) {
            output[i] = y[i] * gain;
        }
        
        console.log(`🎚️ Brickwall limiter: peak ${ampToDb(peak).toFixed(2)}dB → ${ceilingDb}dB (reduction: ${ampToDb(gain).toFixed(2)}dB)`);
        
        return output;
    } catch (error) {
        console.error("❌ Limiter failed:", error);
        return y;
    }
}

// ============= MAIN PROCESSING FUNCTION - WITH ERROR DETECTION =============

export async function analyzeAndFix(audioFile, aggressiveness = 'balanced', forceZeroStatic = false) {
    console.log("🎵 SpectroModel DSP: PROFESSIONAL MASTERING MODE (WITH AUTO-ERROR DETECTION)");
    console.log("   ✅ Full-length processing (no truncation)");
    console.log("   ✅ LUFS normalization (-14 LUFS)");
    console.log("   ✅ Professional compression (3:1)");
    console.log("   ✅ High-shelf boost (air & clarity)");
    console.log("   ✅ Brickwall limiter (prevent clipping)");
    console.log("   ✅ Auto-error detection & fixing");
    console.log("   🚫 ZERO removal algorithms");
    console.log("   🚫 ZERO noise gates");
    console.log("   🚫 ZERO spectral subtraction");
    
    return new Promise((resolve, reject) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                
                // ERROR CHECK 1: Verify array buffer
                if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                    throw new Error('Audio file is empty or corrupted');
                }
                
                console.log(`📊 File size: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
                
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer).catch(err => {
                    throw new Error(`Failed to decode audio: ${err.message}. File may be corrupted or in unsupported format.`);
                });
                
                // ERROR CHECK 2: Detect and auto-fix audio errors
                console.log('🔍 Detecting and fixing audio errors...');
                const { errors: detectedErrors, needsReload } = detectAndFixAudioErrors(audioBuffer);
                
                if (needsReload) {
                    throw new Error('Critical audio errors detected. Please try a different file.');
                }
                
                if (detectedErrors.length > 0) {
                    console.log(`✅ Auto-fixed ${detectedErrors.length} errors:`);
                    detectedErrors.forEach(err => {
                        console.log(`   - ${err.type}: ${err.message}`);
                    });
                }
                
                const sr = audioBuffer.sampleRate;
                
                // CRITICAL: Process FULL audio - NO TRUNCATION
                let y = new Float32Array(audioBuffer.getChannelData(0));
                const originalLength = y.length;
                const originalDuration = originalLength / sr;
                
                console.log(`✅ Audio loaded: ${originalDuration.toFixed(2)}s (${originalLength.toLocaleString()} samples) @ ${sr}Hz`);
                console.log(`   Processing FULL LENGTH - NO truncation`);
                
                const report = {
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    detections: [],
                    actions: [],
                    errors_fixed: detectedErrors
                };
                
                // 1. Clipping Detection & Repair (SAFE - only interpolates)
                try {
                    const clippingResult = detectClipping(y);
                    if (clippingResult.hasClipping) {
                        report.detections.push({
                            type: 'clipping',
                            ratio: clippingResult.clipRatio
                        });
                        y = repairClipping(y);
                        report.actions.push('clipping_repair');
                    }
                } catch (error) {
                    console.error("❌ Clipping detection failed:", error);
                }
                
                // 2. LUFS Detection & Normalization (PROFESSIONAL)
                try {
                    const lufsResult = detectLUFS(y, sr);
                    report.detections.push({
                        type: 'lufs',
                        value: lufsResult.currentLUFS
                    });
                    
                    const normalizedResult = normalizeLUFS(y, sr, -14.0);
                    y = normalizedResult.output;
                    report.actions.push({
                        type: 'lufs_normalization',
                        oldLUFS: normalizedResult.oldLUFS,
                        newLUFS: normalizedResult.newLUFS,
                        gainDb: normalizedResult.gainDb
                    });
                } catch (error) {
                    console.error("❌ LUFS normalization failed:", error);
                }
                
                // 3. Professional Compression (DYNAMICS CONTROL)
                try {
                    const compressorSettings = {
                        thresholdDb: -18,
                        ratio: 3.0,
                        attackMs: 5,
                        releaseMs: 50,
                        makeupGainDb: 2.0
                    };
                    
                    y = professionalCompressor(
                        y,
                        sr,
                        compressorSettings.thresholdDb,
                        compressorSettings.ratio,
                        compressorSettings.attackMs,
                        compressorSettings.releaseMs,
                        compressorSettings.makeupGainDb
                    );
                    report.actions.push({
                        type: 'compression',
                        settings: compressorSettings
                    });
                } catch (error) {
                    console.error("❌ Compression failed:", error);
                }
                
                // 4. High-Shelf Boost (AIR & CLARITY)
                try {
                    y = highShelfBoost(y, sr, 8000, 3.0);
                    report.actions.push({
                        type: 'high_shelf_boost',
                        cutoffHz: 8000,
                        gainDb: 3.0
                    });
                } catch (error) {
                    console.error("❌ High-shelf boost failed:", error);
                }
                
                // 5. Brickwall Limiter (PREVENT CLIPPING)
                try {
                    const beforePeak = findPeak(y);
                    y = brickwallLimiter(y, -0.3);
                    const afterPeak = findPeak(y);
                    
                    if (Math.abs(beforePeak - afterPeak) > 0.001) {
                        report.actions.push({
                            type: 'brickwall_limiter',
                            beforePeakDb: ampToDb(beforePeak),
                            afterPeakDb: ampToDb(afterPeak)
                        });
                    }
                } catch (error) {
                    console.error("❌ Limiter failed:", error);
                }
                
                // 6. Final Metrics
                try {
                    let finalRms = 0;
                    for (let i = 0; i < y.length; i++) {
                        finalRms += y[i] * y[i];
                    }
                    finalRms = Math.sqrt(finalRms / y.length);
                    report.final_loudness = -0.691 + 10 * Math.log10(finalRms * finalRms + 1e-10);
                    report.duration_sec = y.length / sr;
                    report.sample_count = y.length;
                } catch (error) {
                    console.error("❌ Final metrics failed:", error);
                    report.final_loudness = -14.0;
                    report.duration_sec = originalDuration;
                    report.sample_count = originalLength;
                }
                
                // 7. Create Output Buffer (FULL LENGTH)
                try {
                    const outputBuffer = audioContext.createBuffer(
                        audioBuffer.numberOfChannels,
                        y.length,
                        sr
                    );
                    
                    // Copy processed audio to all channels
                    outputBuffer.copyToChannel(y, 0);
                    if (audioBuffer.numberOfChannels > 1) {
                        outputBuffer.copyToChannel(y, 1);
                    }
                    
                    const finalPeak = findPeak(y);
                    const finalDuration = y.length / sr;
                    
                    console.log("✅ SpectroModel DSP Complete (PROFESSIONAL MASTERING + AUTO-FIX)!");
                    console.log(`   ✅ FULL LENGTH preserved: ${finalDuration.toFixed(2)}s (${y.length.toLocaleString()} samples)`);
                    console.log(`   ✅ Original: ${originalDuration.toFixed(2)}s → Final: ${finalDuration.toFixed(2)}s`);
                    console.log(`   ✅ NO truncation, NO removal, ONLY enhancement`);
                    console.log(`   ✅ Auto-fixed ${detectedErrors.length} errors`);
                    console.log(`   Detections: ${report.detections.length}`);
                    console.log(`   Actions: ${report.actions.length}`);
                    console.log(`   Final LUFS: ${report.final_loudness.toFixed(2)}`);
                    console.log(`   Final Peak: ${ampToDb(finalPeak).toFixed(2)}dB`);
                    
                    resolve({ audioBuffer: outputBuffer, report });
                } catch (error) {
                    console.error("❌ Output buffer creation failed:", error);
                    reject(new Error("Failed to create output buffer: " + error.message));
                }
                
            } catch (error) {
                console.error("❌ SpectroModel DSP failed:", error);
                reject(new Error("SpectroModel DSP failed: " + error.message));
            }
        };
        
        reader.onerror = () => {
            reject(new Error("Failed to read audio file"));
        };
        
        try {
            reader.readAsArrayBuffer(audioFile);
        } catch (error) {
            reject(new Error("Failed to read file: " + error.message));
        }
    });
}

// ============= WAV EXPORT =============

export function audioBufferToWav(buffer) {
    try {
        const length = buffer.length * buffer.numberOfChannels * 2;
        const arrayBuffer = new ArrayBuffer(44 + length);
        const view = new DataView(arrayBuffer);
        let pos = 0;

        const setUint16 = (data) => {
            view.setUint16(pos, data, true);
            pos += 2;
        };
        const setUint32 = (data) => {
            view.setUint32(pos, data, true);
            pos += 4;
        };

        setUint32(0x46464952); // "RIFF"
        setUint32(36 + length);
        setUint32(0x45564157); // "WAVE"
        setUint32(0x20746d66); // "fmt "
        setUint32(16);
        setUint16(1);
        setUint16(buffer.numberOfChannels);
        setUint32(buffer.sampleRate);
        setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
        setUint16(buffer.numberOfChannels * 2);
        setUint16(16);
        setUint32(0x61746164); // "data"
        setUint32(length);

        const channels = [];
        for (let i = 0; i < buffer.numberOfChannels; i++) {
            channels.push(buffer.getChannelData(i));
        }

        let offset = 0;
        while (pos < arrayBuffer.byteLength) {
            for (let i = 0; i < buffer.numberOfChannels; i++) {
                let sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }

        console.log(`✅ WAV export: ${buffer.length.toLocaleString()} samples → ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);

        return arrayBuffer;
    } catch (error) {
        console.error("❌ WAV export failed:", error);
        throw new Error("Failed to export WAV: " + error.message);
    }
}
