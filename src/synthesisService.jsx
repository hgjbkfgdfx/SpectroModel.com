// NEUROSONIC DSP SYNTHESIS ENGINE
// Replaces external AI with local, real-time formant synthesis

export const generateVocalSyllable = async (text) => {
  const sampleRate = 44100;
  // Dynamic duration: consonants are short, vowels slightly longer
  const duration = Math.min(0.8, Math.max(0.2, text.length * 0.15)); 
  const ctx = new OfflineAudioContext(1, sampleRate * duration, sampleRate);

  const out = ctx.destination;
  const phoneme = text.toLowerCase().trim();

  // --- DSP PRIMITIVES ---

  // ADSR Envelope Generator
  const createEnvelope = (attack, decay, sustain, release) => {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(1, attack);
    gain.gain.exponentialRampToValueAtTime(sustain, attack + decay);
    gain.gain.exponentialRampToValueAtTime(0.001, duration - release);
    return gain;
  };

  // Noise Generator (Consonants)
  const createNoise = (filterFreq, type = 'highpass', Q = 1.0) => {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = filterFreq;
    filter.Q.value = Q;
    
    noise.connect(filter);
    return { src: noise, node: filter };
  };

  // Vowel Formant Synthesizer
  // Uses a source oscillator + 2 parallel bandpass filters for F1/F2
  const createVowelTone = (f1, f2, f3) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; // Rich harmonics for filtering
    osc.frequency.value = 180; // Fundamental pitch (approximate avg male/female low range)

    // Formant 1
    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.value = f1;
    filter1.Q.value = 5.0;

    // Formant 2
    const filter2 = ctx.createBiquadFilter();
    filter2.type = 'bandpass';
    filter2.frequency.value = f2;
    filter2.Q.value = 6.0;

    const gain = ctx.createGain();
    gain.gain.value = 10.0; // Makeup gain for narrow filters

    osc.connect(filter1);
    osc.connect(filter2);
    filter1.connect(gain);
    filter2.connect(gain);

    if (f3) {
      const filter3 = ctx.createBiquadFilter();
      filter3.type = 'bandpass';
      filter3.frequency.value = f3;
      filter3.Q.value = 5.0;
      osc.connect(filter3);
      filter3.connect(gain);
    }

    return { src: osc, node: gain };
  };

  // --- PHONEME LOGIC ---

  let signalChain = null;
  let sources = [];

  // Vowel Formant Map (Approximate)
  const vowels = {
    'a': [800, 1200, 2500], // "father"
    'e': [500, 1800, 2500], // "bed"
    'i': [300, 2200, 3000], // "feet"
    'o': [500, 900, 2200],  // "bought"
    'u': [300, 800, 2200],  // "boot"
    'ea': [350, 2000, 2700], // "leaf" (similar to 'i')
    'mi': [300, 2200, 3000] // Specialized 'mi' handling
  };

  // Check for vowels first
  let matchedVowel = Object.keys(vowels).find(v => phoneme.includes(v));
  if (phoneme === 'mi') matchedVowel = 'mi'; // Priority

  if (phoneme.startsWith('s') || phoneme.startsWith('sh') || phoneme.startsWith('ch') || phoneme.startsWith('c')) {
    // Sibilant
    const { src, node } = createNoise(4500, 'highpass', 2.0);
    const env = createEnvelope(0.05, 0.1, 0.6, 0.1);
    node.connect(env);
    signalChain = env;
    sources.push(src);
  } else if (phoneme.startsWith('f') || phoneme.startsWith('th')) {
     // Fricative (softer)
    const { src, node } = createNoise(3000, 'highpass', 1.0);
    const env = createEnvelope(0.08, 0.1, 0.5, 0.1);
    node.connect(env);
    signalChain = env;
    sources.push(src);
  } else if (phoneme.startsWith('m')) {
    // Nasal 'm'
    const { src, node } = createVowelTone(250, 1000); // Muffled formants
    const env = createEnvelope(0.1, 0.2, 0.8, 0.2);
    node.connect(env);
    signalChain = env;
    sources.push(src);
    
    // If it's "mi", we blend into 'i'
    if (phoneme.includes('i')) {
      const v = vowels['i'];
      const { src: src2, node: node2 } = createVowelTone(v[0], v[1], v[2]);
      const env2 = ctx.createGain();
      // Start 'i' slightly after 'm'
      env2.gain.setValueAtTime(0, 0);
      env2.gain.setValueAtTime(0, 0.1);
      env2.gain.linearRampToValueAtTime(1, 0.2);
      env2.gain.linearRampToValueAtTime(0, duration);
      node2.connect(env2);
      env2.connect(out);
      src2.start();
    }
  } else if (matchedVowel) {
    // Pure Vowel Synthesis
    const v = vowels[matchedVowel];
    const { src, node } = createVowelTone(v[0], v[1], v[2]);
    const env = createEnvelope(0.1, 0.2, 0.8, 0.2);
    node.connect(env);
    signalChain = env;
    sources.push(src);
  } else {
    // Plosive Fallback (p, t, k, b, d, g)
    const { src, node } = createNoise(1000, 'lowpass', 1.0);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, 0);
    env.gain.linearRampToValueAtTime(1.0, 0.02); // Sharp attack
    env.gain.exponentialRampToValueAtTime(0.001, 0.1); // Fast decay
    node.connect(env);
    signalChain = env;
    sources.push(src);
  }

  if (signalChain) {
    signalChain.connect(out);
  }
  
  sources.forEach(s => s.start());

  const renderedBuffer = await ctx.startRendering();
  return bufferToWavBytes(renderedBuffer);
};

// Helper to convert AudioBuffer back to Wav ArrayBuffer for the 'decode' step in the UI
function bufferToWavBytes(buffer) {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length * numChannels * 2 + 44;
  const out = new ArrayBuffer(length);
  const view = new DataView(out);
  const channels = [];
  let offset = 0;
  let pos = 0;

  // Write WAV Header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numChannels);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numChannels); // avg. bytes/sec
  setUint16(numChannels * 2); // block-align
  setUint16(16); // 16-bit 

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i));

  while (pos < buffer.length) {
    for (let i = 0; i < numChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][pos])); 
      sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0; // 16-bit conversion
      view.setInt16(offset, sample, true); 
      offset += 2;
    }
    pos++;
  }

  function setUint16(data) { view.setUint16(offset, data, true); offset += 2; }
  function setUint32(data) { view.setUint32(offset, data, true); offset += 4; }

  return out;
}