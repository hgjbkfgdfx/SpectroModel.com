import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { User } from "@/api/entities";

export default function SoundEffectsToggle() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const user = await User.me();
        setSoundEnabled(user?.sound_effects_enabled !== false);
      } catch (error) {
        console.log("Using default sound settings");
      }
    };
    loadPreference();
  }, []);

  const toggleSound = async () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    
    try {
      await User.updateMyUserData({ sound_effects_enabled: newState });
      
      if (newState) {
        playTransitionSound();
      }
    } catch (error) {
      console.error("Failed to save sound preference:", error);
    }
  };

  const playTransitionSound = () => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  if (typeof window !== 'undefined') {
    window.playNavigationSound = () => {
      if (soundEnabled) {
        playTransitionSound();
      }
    };
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSound}
      className="bg-white hover:bg-slate-200"
      title={soundEnabled ? "Disable Sound Effects" : "Enable Sound Effects"}
    >
      {soundEnabled ? (
        <Volume2 className="w-5 h-5 text-black font-black" style={{ fontWeight: 900 }} />
      ) : (
        <VolumeX className="w-5 h-5 text-black font-black" style={{ fontWeight: 900 }} />
      )}
    </Button>
  );
}