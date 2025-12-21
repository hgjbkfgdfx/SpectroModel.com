import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Upload, Music, Brain, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";

export default function MeditativePlayer() {
  const mlDataCollector = useMLDataCollector();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [mode, setMode] = useState('preset');
  const [currentPreset, setCurrentPreset] = useState('piano_classical');
  const [userFile, setUserFile] = useState(null);
  const [userFileUrl, setUserFileUrl] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const gainNodeRef = useRef(null);
  const userAudioRef = useRef(null);
  const intervalRef = useRef(null);
  const activeNodesRef = useRef([]);

  const presets = {
    ai_flow: {
      name: "✨ AI Feed",
      type: "generative",
      style: "mixed",
      description: "Evolving stream",
      color: "text-purple-400"
    },
    piano_classical: { 
      name: "Classical Piano", 
      type: "generative",
      instrument: "piano",
      style: "classical",
      scale: "major",
      tempo: 400,
      description: "Piano arpeggios",
      color: "text-slate-100"
    },
    guitar_classical: { 
      name: "Classical Guitar", 
      type: "generative",
      instrument: "guitar",
      style: "classical",
      scale: "harmonic_minor",
      tempo: 300,
      description: "Fingerstyle guitar",
      color: "text-amber-400"
    },
    orchestra_symphony: { 
      name: "Orchestra", 
      type: "generative",
      instrument: "orchestra",
      style: "cinematic",
      scale: "minor",
      tempo: 2000,
      description: "Full orchestra",
      color: "text-rose-300"
    },
    piano_gentle: { 
      name: "Gentle Piano", 
      type: "generative",
      instrument: "piano",
      style: "ambient",
      scale: "major_pentatonic",
      tempo: 3000,
      description: "Lullaby keys",
      color: "text-blue-200"
    },
    om: { 
      name: "Tibetan Om", 
      type: "drone",
      base: 136.1, 
      description: "Drone",
      color: "text-orange-500"
    },
    bowl: { 
      name: "Crystal Bowls", 
      type: "bowl",
      base: 432, 
      description: "Healing tones",
      color: "text-blue-300"
    }
  };

  useEffect(() => {
    try {
      blockScriptInjection();
      validateCSP();
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (mode === 'preset' && isPlaying) {
      startOscillators();
    } else {
      stopOscillators();
    }
  }, [mode, isPlaying, currentPreset]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioContextRef.current.currentTime, 0.1);
    }
    if (userAudioRef.current) {
      userAudioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (mode === 'user' && userAudioRef.current) {
      if (isPlaying) {
        userAudioRef.current.play().catch(() => {});
      } else {
        userAudioRef.current.pause();
      }
    }
  }, [mode, isPlaying, userFileUrl]);

  useEffect(() => {
    // Keep music playing when collapsed
    if (isCollapsed && isPlaying) {
      if (mode === 'preset' && !intervalRef.current) {
        startOscillators();
      }
    }
  }, [isCollapsed, isPlaying, mode]);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const startOscillators = () => {
    initAudioContext();
    stopOscillators(); 
    const ctx = audioContextRef.current;
    const preset = presets[currentPreset];
    const now = ctx.currentTime;

    if (preset.type === 'generative') {
      const baseScales = {
        major: [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94],
        minor: [130.81, 146.83, 155.56, 174.61, 196.00, 207.65, 233.08],
        harmonic_minor: [130.81, 146.83, 155.56, 174.61, 196.00, 207.65, 246.94],
        dorian: [130.81, 146.83, 155.56, 174.61, 196.00, 220.00, 233.08],
      };
      
      const createFullScale = (base) => [...base, ...base.map(f => f * 2), ...base.map(f => f * 4)];
      const scales = {
        major: createFullScale(baseScales.major),
        minor: createFullScale(baseScales.minor),
        harmonic_minor: createFullScale(baseScales.harmonic_minor),
        dorian: createFullScale(baseScales.dorian),
        major_pentatonic: createFullScale([130.81, 146.83, 164.81, 196.00, 220.00]),
      };

      let currentScale = scales[preset.scale] || scales.major;
      let currentInstrument = preset.instrument;
      let currentTempo = preset.tempo || 2000;
      let chordStep = 0;
      const progressions = { classical: [[0, 2, 4], [3, 5, 7], [4, 6, 1], [0, 2, 4]], jazz: [[1, 3, 5, 8], [4, 6, 8, 11], [0, 2, 4, 7]], ambient: [[0, 4], [5, 9], [3, 7]] };
      let currentProgression = progressions[preset.style] || progressions.classical;

      const playNote = () => {
        if (!intervalRef.current) return;
        let freqsToPlay = [];
        if (preset.style === 'classical' || preset.style === 'jazz') {
          const chordIndices = currentProgression[Math.floor(chordStep / 4) % currentProgression.length];
          const noteIndex = chordIndices[chordStep % chordIndices.length];
          const safeIndex = (noteIndex + Math.floor(Math.random() * 2) * 7) % currentScale.length;
          freqsToPlay = [currentScale[safeIndex]];
          chordStep++;
          if (chordStep % 4 === 1) freqsToPlay.push(currentScale[chordIndices[0] % 7] / 2);
        } else {
          freqsToPlay = [currentScale[Math.floor(Math.random() * currentScale.length)]];
        }
        
        freqsToPlay.forEach(freq => {
          if (!freq) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          const panner = ctx.createStereoPanner();
          const t = ctx.currentTime;
          let duration = 2.5;
          osc.type = currentInstrument === 'piano' ? 'triangle' : 'sine';
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.5, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
          osc.frequency.value = freq;
          panner.pan.value = (Math.random() * 1.5) - 0.75;
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(panner);
          panner.connect(gainNodeRef.current);
          osc.start(t);
          osc.stop(t + duration);
          activeNodesRef.current.push(osc, gain, panner, filter);
        });
      };

      playNote();
      intervalRef.current = setInterval(playNote, currentTempo);
      return;
    }

    const newOscillators = [];
    const createOsc = (freq, type, pan, gainMod = 1) => {
      const osc = ctx.createOscillator();
      const panner = ctx.createStereoPanner();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      panner.pan.value = pan;
      gain.gain.value = gainMod;
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(gainNodeRef.current);
      osc.start(now);
      newOscillators.push(osc);
    };

    if (preset.type === 'bowl') {
      createOsc(preset.base, 'sine', 0, 0.6);
      createOsc(preset.base * 1.5, 'sine', -0.3, 0.2);
    } else if (preset.type === 'drone') {
      createOsc(preset.base, 'sine', 0, 0.4);
      createOsc(preset.base / 2, 'sine', 0, 0.3);
    }
    oscillatorsRef.current = newOscillators;
  };

  const stopOscillators = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    oscillatorsRef.current.forEach(osc => { try { osc.stop(); osc.disconnect(); } catch (e) {} });
    oscillatorsRef.current = [];
    activeNodesRef.current.forEach(node => { try { node.stop ? node.stop() : node.disconnect(); } catch(e) {} });
    activeNodesRef.current = [];
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserFile(file);
      setUserFileUrl(URL.createObjectURL(file));
      setMode('user');
      setIsPlaying(true);
      mlDataCollector.record('meditative_player_upload', { fileName: file.name, timestamp: Date.now() });
    }
  };

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    if (newState) initAudioContext();
    mlDataCollector.record('meditative_player_toggle', { isPlaying: newState, preset: currentPreset, timestamp: Date.now() });
  };

  // When collapsed, show mini button but keep audio playing
  if (isCollapsed) {
    return (
      <>
        <button
          onClick={() => setIsCollapsed(false)}
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-purple-500/30 rounded-full px-4 py-2 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors z-50 shadow-lg ${isPlaying ? 'animate-pulse' : ''}`}
        >
          <Music className="w-4 h-4" />
          {isPlaying && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          <ChevronUp className="w-4 h-4" />
          <span className="text-[10px] font-mono uppercase">{isPlaying ? 'Playing' : 'Music'}</span>
        </button>
        {/* Keep audio element mounted when collapsed */}
        <audio ref={userAudioRef} src={userFileUrl || ""} onEnded={() => setIsPlaying(false)} className="hidden" />
      </>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950/98 border-t border-purple-500/30 backdrop-blur-xl z-50 safe-area-pb transition-all duration-300">
      {/* Hide Button - music continues playing */}
      <button
        onClick={() => setIsCollapsed(true)}
        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950/98 border border-purple-500/30 border-b-0 rounded-t-lg px-4 py-1 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
        title="Hide player (music continues)"
      >
        <ChevronDown className="w-4 h-4" />
        <span className="text-[10px] font-mono uppercase">Hide</span>
      </button>

      <div className="w-full px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Info - responsive */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className={`p-1.5 sm:p-2 rounded-full shrink-0 ${isPlaying ? 'bg-purple-500/20 animate-pulse' : 'bg-slate-800'}`}>
            {mode === 'preset' ? <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" /> : <Music className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />}
          </div>
          <div className="min-w-0 hidden xs:block">
            <h3 className="text-white font-bold text-xs sm:text-sm truncate">
              {mode === 'preset' ? presets[currentPreset].name : (userFile?.name?.slice(0,15) || "Upload")}
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate hidden sm:block">
              {mode === 'preset' ? presets[currentPreset].description : "Custom"}
            </p>
          </div>
        </div>

        {/* Center: Play button */}
        <Button 
          size="icon" 
          variant="ghost" 
          className="text-white hover:bg-purple-500/20 rounded-full h-10 w-10 sm:h-11 sm:w-11 border border-purple-500/30 shrink-0"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </Button>
        
        {/* Right: Selector - hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 flex-1 justify-end">
          <Select value={mode === 'preset' ? currentPreset : 'custom'} onValueChange={(val) => {
            if (val === 'custom') {
              document.getElementById('meditative-upload').click();
            } else {
              setMode('preset');
              setCurrentPreset(val);
            }
          }}>
            <SelectTrigger className="w-[120px] md:w-[160px] bg-slate-900 border-slate-700 text-white h-8 text-xs">
              <SelectValue placeholder="Sound" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-[200px]">
              <SelectItem value="custom" className="text-blue-400 text-xs">
                <Upload className="w-3 h-3 mr-1 inline" /> Upload...
              </SelectItem>
              {Object.entries(presets).map(([key, p]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  <span className={p.color}>●</span> {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="file" id="meditative-upload" accept="audio/*" className="hidden" onChange={handleFileUpload} />
        </div>
      </div>
      <audio ref={userAudioRef} src={userFileUrl || ""} onEnded={() => setIsPlaying(false)} className="hidden" />
    </div>
  );
}