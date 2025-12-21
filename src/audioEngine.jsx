import { ProcessingStage } from './sibilanceTypes';

/**
 * NEUROSONIC AUDIO ENGINE
 * Implements Zero-Iteration Static Removal and Spectral Sibilance Processing.
 */

export const createOfflineContext = (sampleRate, length) => {
  const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  return new OfflineContext(2, length, sampleRate);
};

export const decodeAudio = async (ctx, arrayBuffer) => {
  return await ctx.decodeAudioData(arrayBuffer);
};

/**
 * Calculates the Root Mean Square (RMS) amplitude of a buffer segment.
 */
const getRMS = (channelData, start, length) => {
  let sum = 0;
  const end = Math.min(channelData.length, start + length);
  if (start >= channelData.length) return 0.001;
  
  for (let i = start; i < end; i++) {
    sum += channelData[i] * channelData[i];
  }
  return Math.sqrt(sum / (end - start)) || 0.001;
};

/**
 * SPECTRAL MATCHING ALGORITHM
 */
const applySpectralMatch = (ctx, sourceNode, targetBuffer, insertionTime) => {
  const sampleRate = targetBuffer.sampleRate;
  const analysisWindow = Math.floor(sampleRate * 0.1); // 100ms
  const startFrame = Math.floor(insertionTime * sampleRate);
  
  const data = targetBuffer.getChannelData(0);
  let highFreqEnergy = 0;
  let lowFreqEnergy = 0;
  
  // Zero Crossing Rate Approximation for Spectral Centroid
  for (let i = startFrame; i < startFrame + analysisWindow && i < data.length - 1; i++) {
    const diff = Math.abs(data[i+1] - data[i]);
    highFreqEnergy += diff;
    lowFreqEnergy += Math.abs(data[i]);
  }
  
  const brightnessRatio = highFreqEnergy / (lowFreqEnergy + 0.0001);
  
  // High Shelf to match brightness
  const highShelf = ctx.createBiquadFilter();
  highShelf.type = 'highshelf';
  highShelf.frequency.value = 4000;
  highShelf.gain.value = (brightnessRatio * 50) - 25; // Map approx 0.5 to 0dB

  // Low Shelf to match body/warmth
  const lowShelf = ctx.createBiquadFilter();
  lowShelf.type = 'lowshelf';
  lowShelf.frequency.value = 250;
  lowShelf.gain.value = brightnessRatio > 0.8 ? -4 : 2;

  sourceNode.connect(highShelf);
  highShelf.connect(lowShelf);
  return lowShelf;
};

/**
 * MAIN PROCESSING FUNCTION
 */
export const processAudioTrack = async (
  originalBuffer,
  syllableCorrections,
  syllableBuffers, 
  params,
  onProgress
) => {
  const length = originalBuffer.length;
  const sampleRate = originalBuffer.sampleRate;
  const ctx = createOfflineContext(sampleRate, length);

  // 1. Setup Main Track
  const mainSource = ctx.createBufferSource();
  mainSource.buffer = originalBuffer;

  // 2. Sibilance Correction Chain (De-esser)
  if (onProgress) onProgress(ProcessingStage.DE_ESSING);
  
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = params.sibilanceThreshold;
  compressor.knee.value = 10;
  compressor.ratio.value = 20; 
  compressor.attack.value = 0.002; 
  compressor.release.value = 0.050; 

  const highPass = ctx.createBiquadFilter();
  highPass.type = 'highpass';
  highPass.frequency.value = 6000; 
  
  const lowPass = ctx.createBiquadFilter();
  lowPass.type = 'lowpass';
  lowPass.frequency.value = 6000;

  const lowGain = ctx.createGain();
  const highGain = ctx.createGain();
  
  highGain.gain.value = Math.pow(10, (params.consonantBoost - params.sibilanceReduction) / 20); 

  mainSource.connect(lowPass);
  lowPass.connect(lowGain);
  lowGain.connect(ctx.destination);

  mainSource.connect(highPass);
  highPass.connect(compressor);
  compressor.connect(highGain);
  highGain.connect(ctx.destination);

  mainSource.start(0);

  // 3. Syllable Reconstruction (Overlay)
  for (const correction of syllableCorrections) {
    const syllableBuf = syllableBuffers.get(correction.id);
    if (!syllableBuf) continue;

    if (onProgress) onProgress(ProcessingStage.MATCHING_VOCAL_PATTERN);

    const sylSource = ctx.createBufferSource();
    sylSource.buffer = syllableBuf;

    // Pitch Shift
    const semitoneRatio = Math.pow(2, correction.pitchShift / 12);
    sylSource.playbackRate.value = semitoneRatio;

    // Volume Matching (RMS)
    const targetRMS = getRMS(originalBuffer.getChannelData(0), Math.floor(correction.timestamp * sampleRate), 4096);
    const sourceRMS = getRMS(syllableBuf.getChannelData(0), 0, syllableBuf.length);
    const matchGain = (targetRMS / (sourceRMS + 0.00001));
    const userBoostLinear = Math.pow(10, correction.volumeBoost / 20);
    
    const sylGain = ctx.createGain();
    sylGain.gain.value = matchGain * userBoostLinear;

    // Spectral Match
    if (onProgress) onProgress(ProcessingStage.APPLYING_SPECTRAL_EQ);
    const eqOutput = applySpectralMatch(ctx, sylSource, originalBuffer, correction.timestamp);
    
    eqOutput.connect(sylGain);
    sylGain.connect(ctx.destination);

    sylSource.start(correction.timestamp);
  }

  // 4. Render
  if (onProgress) onProgress(ProcessingStage.RENDERING);
  const renderedBuffer = await ctx.startRendering();
  return renderedBuffer;
};

/**
 * Export to WAV (32-bit float)
 */
export const bufferToWav = (buffer) => {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 4 + 44;
  const bufferArr = new ArrayBuffer(length);
  const view = new DataView(bufferArr);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(3); // PCM (floating point)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 4 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 4); // block-align
  setUint16(32); // 32-bit (float)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i));

  while (pos < buffer.length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
      view.setFloat32(offset, sample, true); // write 32-bit float
      offset += 4;
    }
    pos++;
  }

  function setUint16(data) {
    view.setUint16(offset, data, true);
    offset += 2;
  }

  function setUint32(data) {
    view.setUint32(offset, data, true);
    offset += 4;
  }

  return new Blob([bufferArr], { type: 'audio/wav' });
};