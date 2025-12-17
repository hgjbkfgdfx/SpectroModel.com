import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Users, Music, Zap, Download, MousePointer, Activity, Wind, Magnet, Volume2, Brain, Wand2, Play, Pause, Globe, Loader2, BarChart3 } from 'lucide-react';
import * as THREE from 'three';
import { base44 } from '@/api/base44Client';

export default function MetaverseSceneGenerator({ onInteraction, mlModel, mlImprovements, onSceneGenerated }) {
  const [sceneType, setSceneType] = useState('concert');
  const [crowdSize, setCrowdSize] = useState(500);
  const [lightingIntensity, setLightingIntensity] = useState(75);
  const [avatarCount, setAvatarCount] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScene, setGeneratedScene] = useState(null);
  const [show3DPreview, setShow3DPreview] = useState(true);
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [interactivityEnabled, setInteractivityEnabled] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);
  const cameraRef = useRef(null);
  const raycasterRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const physicsObjectsRef = useRef([]);
  const interactiveAvatarsRef = useRef([]);

  const [windZones, setWindZones] = useState([]);
  const [forceFields, setForceFields] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  const audioContextRef = useRef(null);
  const windZonesRef = useRef([]);
  const forceFieldsRef = useRef([]);

  const [sceneStats, setSceneStats] = useState({ triangles: 0, drawCalls: 0, physicsObjects: 0, fps: 0 });
  const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now(), fps: 0 });

  const [showMLIndicators, setShowMLIndicators] = useState(true);
  const [showAvatarCustomization, setShowAvatarCustomization] = useState(true);

  const [aiDirectorActive, setAiDirectorActive] = useState(false);
  const [directorSuggestions, setDirectorSuggestions] = useState([]);

  const [audioFile, setAudioFile] = useState(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioSourceRef = useRef(null);

  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [adaptationHistory, setAdaptationHistory] = useState([]);
  const mlAdaptationRef = useRef(null);

  const [concertMetrics, setConcertMetrics] = useState({
    synchronization: 0,
    energyLevel: 0,
    crowdEngagement: 0,
    catchinessScore: 0,
    overallPerformance: 0
  });

  const [behavioralGoal, setBehavioralGoal] = useState(null);
  const [availableGoals, setAvailableGoals] = useState([
    { id: 'increase_energy', label: 'Increase Energy', description: 'Boost crowd energy and excitement', icon: '⚡' },
    { id: 'improve_sync', label: 'Improve Synchronization', description: 'Enhance avatar coordination and timing', icon: '🎯' },
    { id: 'spontaneous_moment', label: 'Create Spontaneous Moment', description: 'Generate unexpected crowd reactions', icon: '✨' },
    { id: 'calm_crowd', label: 'Calm the Crowd', description: 'Reduce energy for emotional moments', icon: '🌊' },
    { id: 'maximize_engagement', label: 'Maximize Engagement', description: 'Peak audience participation', icon: '🔥' },
    { id: 'dramatic_entrance', label: 'Dramatic Entrance', description: 'Create an impactful opening', icon: '🎭' },
    { id: 'build_anticipation', label: 'Build Anticipation', description: 'Gradual tension increase', icon: '📈' },
    { id: 'climax_moment', label: 'Climax Moment', label: 'Peak performance intensity', icon: '💥' }
  ]);

  const [activeGoalPlan, setActiveGoalPlan] = useState(null);
  const [goalHistory, setGoalHistory] = useState([]);
  const [learnedStrategies, setLearnedStrategies] = useState({});
  const [executingPlan, setExecutingPlan] = useState(false);
  const [planProgress, setPlanProgress] = useState(0);

  useEffect(() => {
    if (!generatedScene) handleQuickGenerate();
  }, []);

  useEffect(() => {
    if (onInteraction) {
      onInteraction({
        type: 'report_metrics',
        payload: {
          concertMetrics: concertMetrics,
          currentAudioFileName: audioFile ? audioFile.name : null
        }
      });
    }
  }, [concertMetrics, audioFile, onInteraction]);

  useEffect(() => {
    if (!adaptiveMode || !mlImprovements || !concertMetrics) return;

    const interval = setInterval(() => {
      adaptSceneWithML();
    }, 2000); // Adapt every 2 seconds

    return () => clearInterval(interval);
  }, [adaptiveMode, mlImprovements, concertMetrics, crowdSize, lightingIntensity, avatarCount, physicsEnabled, windZones.length, forceFields.length]);

  const getMLEnhancedValue = (baseValue, improvementType) => {
    if (!mlImprovements || !mlImprovements[improvementType]) return baseValue;
    
    const improvement = mlImprovements[improvementType] / 100; // Convert % to multiplier
    return baseValue * (1 + improvement * 0.3); // Up to 30% improvement
  };

  const handleQuickGenerate = () => {
    const baseAvatars = avatarCount;
    const baseCrowd = crowdSize;
    const baseLighting = lightingIntensity;
    
    const mlEnhancedAvatarCount = Math.min(200, Math.round(getMLEnhancedValue(baseAvatars, 'sceneOptimization')));
    const mlEnhancedCrowdSize = Math.min(10000, Math.round(getMLEnhancedValue(baseCrowd, 'sceneOptimization')));
    const mlEnhancedLightingIntensity = Math.min(100, Math.round(getMLEnhancedValue(baseLighting, 'sceneOptimization')));

    const scene = {
      scene_name: `${sceneType.charAt(0).toUpperCase() + sceneType.slice(1)} Concert`,
      scene_type: sceneType,
      crowd: { 
        avatar_count: mlEnhancedAvatarCount, 
        total_crowd: mlEnhancedCrowdSize, 
        distribution: crowdSize > 300 ? 'semicircle' : 'block' 
      },
      lightingIntensity: mlEnhancedLightingIntensity,
      physicsEnabled: physicsEnabled,
      ml_enhancements: mlImprovements,
      mlEnhanced: mlImprovements ? true : false,
      mlQualityScore: mlImprovements?.sceneOptimization || 0
    };
    setGeneratedScene(scene);
    console.log('✅ Scene generated (or re-generated) with ML enhancements:', scene);
  };

  // ENHANCED: ML-powered scene generation with physics
  const generateScene = async () => {
    try {
      setIsGenerating(true);
      console.log('🎨 Generating scene with ML & physics enhancements...');

      // CHUNKED PROCESSING: Generate in phases
      await new Promise(resolve => setTimeout(resolve, 50));

      // PHASE 1: Calculate lighting using physics
      // Using existing lightingIntensity state directly
      const currentLightingIntensity = lightingIntensity / 100; // Convert to 0-1 range
      const lightPower = currentLightingIntensity * 1000; // Assume max 1000W, scalable
      const viewDistance = 10; // meters (arbitrary average distance to perceive lighting)
      const illumination = lightPower / (4 * Math.PI * viewDistance * viewDistance); // Inverse square law for general illumination

      await new Promise(resolve => setTimeout(resolve, 50));

      // PHASE 2: ML prediction for optimal crowd distribution
      const mlQuality = (mlImprovements?.sceneOptimization || 0) / 100;
      const crowdDensity = 0.3 + (mlQuality * 0.5); // ML improves crowd management, higher ML quality allows higher density
      
      // PHYSICS: Calculate crowd capacity using area and density
      const arenaArea = 1000; // m² (example arena floor area)
      const optimalCrowdSize = Math.floor(arenaArea * crowdDensity);

      await new Promise(resolve => setTimeout(resolve, 50));

      // PHASE 3: Generate scene with all enhancements
      const scene = {
        scene_name: `Scene_${Date.now()}`,
        environment: sceneType, // Use existing sceneType state
        
        // PHYSICS-BASED LIGHTING
        lighting: {
          intensity: lightingIntensity, // Use current state value
          illumination: illumination.toFixed(2) + ' lux',
          type: 'pbr', // Physically-based rendering
          shadows: mlQuality > 0.5,
          globalIllumination: mlQuality > 0.7
        },
        
        // ML-OPTIMIZED CROWD
        crowd: {
          size: optimalCrowdSize,
          density: crowdDensity,
          distribution: mlQuality > 0.6 ? 'ml_optimized' : 'random',
          behavior: mlQuality > 0.7 ? 'intelligent' : 'scripted'
        },
        
        // PHYSICS SIMULATION
        physics: {
          gravity: 9.81,
          windSpeed: Math.random() * 10,
          particleSystem: mlQuality > 0.5,
          fluidDynamics: mlQuality > 0.8,
          collisionDetection: true
        },
        
        // ML ENHANCEMENTS
        mlEnhancements: {
          autoOptimization: true,
          qualityBoost: (mlQuality * 100).toFixed(0) + '%',
          intelligentLOD: mlQuality > 0.6,
          predictiveLoading: mlQuality > 0.7
        },

        created_at: Date.now(),
        generation_method: 'ml_physics_hybrid',
        quality_score: 0.8 + (mlQuality * 0.2)
      };

      console.log('✅ Scene generated with ML & physics:', scene.scene_name);
      console.log('📊 Illumination:', scene.lighting.illumination);
      console.log('👥 Optimal crowd:', scene.crowd.size, 'people');

      // Save to database
      try {
        const saved = await base44.entities.SceneSession.create({
          session_name: scene.scene_name,
          owner_email: (await base44.auth.me()).email,
          scene_data: scene
        });

        console.log('💾 Scene saved with ID:', saved.id);
        
        if (onSceneGenerated) {
          onSceneGenerated(saved);
        }
      } catch (error) {
        console.error('⚠️ Failed to save scene:', error);
      }

      setGeneratedScene(scene);
      setIsGenerating(false);

      alert(`✅ Scene "${scene.scene_name}" generated!\n\nCrowd: ${scene.crowd.size} people\nML Quality: ${scene.mlEnhancements.qualityBoost}\nLighting: ${scene.lighting.illumination}`);

    } catch (error) {
      console.error('❌ Scene generation failed:', error);
      setIsGenerating(false);
      alert('Failed to generate scene: ' + error.message);
    }
  };

  const playMusic = async (file) => {
    if (!file) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start(0);
      source.loop = true;
      audioSourceRef.current = source;
      setIsPlayingMusic(true);
      
      console.log('🎵 Music playing');
    } catch (error) {
      console.error('Failed to play music:', error);
    }
  };

  const stopMusic = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsPlayingMusic(false);
  };

  const activateAIDirector = () => {
    if (!mlImprovements) return;
    setAiDirectorActive(true);
    const suggestions = [];
    if (mlImprovements.avatarIntelligence > 70) {
      suggestions.push({ type: 'avatars', message: `IQ ${mlImprovements.avatarIntelligence.toFixed(0)}% - Add avatars`, action: () => setAvatarCount(prev => Math.min(50, prev + 10)) });
    }
    if (mlImprovements.physicsAccuracy > 80) {
      suggestions.push({ type: 'physics', message: `Physics ${mlImprovements.physicsAccuracy.toFixed(0)}% - Add fields`, action: () => { addForceField('attract'); addForceField('repel'); } });
    }
    setDirectorSuggestions(suggestions);
  };

  const generateMLCrowd = () => {
    if (!mlImprovements || mlImprovements.avatarIntelligence === 0) return;
    const intelligence = mlImprovements.avatarIntelligence;
    const newSize = Math.min(2000, Math.round(crowdSize * (1 + intelligence / 100)));
    setCrowdSize(newSize);
    setAvatarCount(Math.min(50, Math.round(avatarCount * (1 + intelligence / 200))));
    console.log(`🧠 ML Crowd: ${newSize} total, ${avatarCount} detailed`);
  };

  const adaptSceneWithML = () => {
    if (!mlImprovements || Object.values(mlImprovements).every(v => v === 0)) return;

    const adaptations = {
      timestamp: Date.now(),
      changes: []
    };

    // 1. ADAPTIVE LIGHTING based on energy level and ML sound quality
    const energyLevel = concertMetrics.energyLevel || 50;
    const soundQuality = mlImprovements.soundQuality || 0;
    
    if (energyLevel > 80 && soundQuality > 70) {
      const newLighting = Math.min(100, lightingIntensity + 5);
      if (newLighting !== lightingIntensity) {
        setLightingIntensity(newLighting);
        adaptations.changes.push({
          type: 'lighting_boost',
          reason: `High energy (${energyLevel.toFixed(0)}%) + ML sound quality (${soundQuality.toFixed(0)}%)`,
          from: lightingIntensity,
          to: newLighting
        });
      }
    } else if (energyLevel < 30 && soundQuality < 50) {
      const newLighting = Math.max(30, lightingIntensity - 3);
      if (newLighting !== lightingIntensity) {
        setLightingIntensity(newLighting);
        adaptations.changes.push({
          type: 'lighting_dim',
          reason: `Low energy (${energyLevel.toFixed(0)}%) + Low ML quality (${soundQuality.toFixed(0)}%)`,
          from: lightingIntensity,
          to: newLighting
        });
      }
    }

    // 2. ADAPTIVE CROWD DENSITY based on engagement and ML scene optimization
    const crowdEngagement = concertMetrics.crowdEngagement || 50;
    const sceneOptimization = mlImprovements.sceneOptimization || 0;
    
    if (crowdEngagement > 75 && sceneOptimization > 60) {
      const newCrowdSize = Math.min(2000, Math.round(crowdSize * 1.1));
      if (newCrowdSize !== crowdSize) {
        setCrowdSize(newCrowdSize);
        adaptations.changes.push({
          type: 'crowd_increase',
          reason: `High engagement (${crowdEngagement.toFixed(0)}%) + ML optimization (${sceneOptimization.toFixed(0)}%)`,
          from: crowdSize,
          to: newCrowdSize
        });
      }
    } else if (crowdEngagement < 40 && sceneOptimization < 40) {
      const newCrowdSize = Math.max(100, Math.round(crowdSize * 0.9));
      if (newCrowdSize !== crowdSize) {
        setCrowdSize(newCrowdSize);
        adaptations.changes.push({
          type: 'crowd_decrease',
          reason: `Low engagement (${crowdEngagement.toFixed(0)}%) + Low ML optimization (${sceneOptimization.toFixed(0)}%)`,
          from: crowdSize,
          to: newCrowdSize
        });
      }
    }

    // 3. ADAPTIVE AVATAR COUNT based on ML avatar intelligence
    const avatarIntelligence = mlImprovements.avatarIntelligence || 0;
    const overallPerformance = concertMetrics.overallPerformance || 50;
    
    if (avatarIntelligence > 80 && overallPerformance > 70) {
      const newAvatarCount = Math.min(50, avatarCount + 2);
      if (newAvatarCount !== avatarCount) {
        setAvatarCount(newAvatarCount);
        adaptations.changes.push({
          type: 'avatar_count_increase',
          reason: `ML Avatar IQ (${avatarIntelligence.toFixed(0)}%) + Performance (${overallPerformance.toFixed(0)}%)`,
          from: avatarCount,
          to: newAvatarCount
        });
      }
    }

    // 4. ADAPTIVE PHYSICS based on ML physics accuracy
    const physicsAccuracy = mlImprovements.physicsAccuracy || 0;
    const synchronization = concertMetrics.synchronization || 50;
    
    if (physicsAccuracy > 75 && synchronization > 80 && !physicsEnabled) {
      setPhysicsEnabled(true);
      adaptations.changes.push({
        type: 'physics_enabled',
        reason: `ML Physics accuracy (${physicsAccuracy.toFixed(0)}%) + Sync (${synchronization.toFixed(0)}%)`,
        from: false,
        to: true
      });
    } else if (physicsAccuracy < 40 && synchronization < 40 && physicsEnabled) {
      setPhysicsEnabled(false);
      adaptations.changes.push({
        type: 'physics_disabled',
        reason: `Low ML Physics (${physicsAccuracy.toFixed(0)}%) + Low Sync (${synchronization.toFixed(0)}%)`,
        from: true,
        to: false
      });
    }

    // 5. ADAPTIVE STAGE EFFECTS based on catchiness score and ML animation quality
    const catchiness = concertMetrics.catchinessScore || 50;
    const animationQuality = mlImprovements.animationQuality || 0;
    
    if (catchiness > 80 && animationQuality > 70) {
      // Auto-add environmental effects
      if (windZones.length < 3) {
        addWindZone();
        adaptations.changes.push({
          type: 'wind_zone_added',
          reason: `High catchiness (${catchiness.toFixed(0)}%) + ML animation (${animationQuality.toFixed(0)}%)`,
          count: windZones.length + 1
        });
      }
      
      if (forceFields.length < 2) {
        addForceField('attract');
        adaptations.changes.push({
          type: 'force_field_added',
          reason: `High catchiness (${catchiness.toFixed(0)}%) + ML animation (${animationQuality.toFixed(0)}%)`,
          count: forceFields.length + 1
        });
      }
    }

    // Log and store adaptations
    if (adaptations.changes.length > 0) {
      console.log('🤖 ML Scene Adaptation:', adaptations);
      setAdaptationHistory(prev => [...prev.slice(-20), adaptations]); // Keep last 20 adaptations
      
      // Trigger scene regeneration with new parameters
      handleQuickGenerate();
      
      // Record interaction for ML learning
      if (onInteraction) {
        onInteraction({
          type: 'ml_scene_adaptation',
          adaptations: adaptations,
          metrics: concertMetrics,
          mlState: mlImprovements
        });
      }
    }
  };

  const forceMLAdaptation = () => {
    if (!mlImprovements) {
      alert('⚠️ ML Engine not trained yet. Please train the model first.');
      return;
    }
    adaptSceneWithML();
    alert('✅ ML-driven scene adaptation applied!');
  };

  const resetSceneToBaseline = () => {
    setCrowdSize(500);
    setLightingIntensity(75);
    setAvatarCount(20);
    setPhysicsEnabled(true);
    setWindZones([]);
    setForceFields([]);
    windZonesRef.current = [];
    forceFieldsRef.current = [];
    handleQuickGenerate();
    console.log('🔄 Scene reset to baseline');
  };

  const playSound = (type, param) => {
    if (!soundEnabled) return;
    const audioCtx = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioCtx;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    if (type === 'jump') {
      osc.frequency.setValueAtTime(400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.2);
      osc.type = 'square';
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'collision') {
      osc.frequency.setValueAtTime(100 + param * 5, audioCtx.currentTime);
      osc.type = 'sine';
      gain.gain.setValueAtTime(Math.min(0.3, param / 200), audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    }
  };

  class PhysicsObject {
    constructor(mesh, mass = 1, mlQuality = 0) {
      this.mesh = mesh;
      this.mass = mass;
      this.mlQuality = mlQuality;
      this.position = mesh.position.clone();
      this.previousPosition = mesh.position.clone();
      this.velocity = new THREE.Vector3();
      this.forces = new THREE.Vector3();
      this.radius = 0.5;
      this.damping = 0.98 + (mlQuality / 100) * 0.01;
      this.restitution = 0.4 + (mlQuality / 100) * 0.1;
      this.isGrounded = false;
      this.isSleeping = false;
      this.sleepFrames = 0;
    }
    applyForce(force) { this.forces.add(force); this.isSleeping = false; }
    applyGravity() { this.applyForce(new THREE.Vector3(0, -9.81 * this.mass, 0)); }
    update(dt) {
      if (this.isSleeping) return;
      const speed = this.velocity.copy(this.position).sub(this.previousPosition).divideScalar(dt).length();
      if (speed < 0.05 && this.isGrounded) {
        this.sleepFrames++;
        if (this.sleepFrames > 60) { this.isSleeping = true; return; }
      } else { this.sleepFrames = 0; }
      const temp = this.position.clone();
      const accel = this.forces.clone().multiplyScalar(1 / this.mass);
      this.position.multiplyScalar(2).sub(this.previousPosition).add(accel.multiplyScalar(dt * dt));
      this.previousPosition.copy(temp);
      this.mesh.position.copy(this.position);
      if (this.position.y <= 0) {
        this.position.y = 0;
        this.mesh.position.y = 0;
        this.velocity.y = 0;
        this.isGrounded = true;
      }
      this.forces.set(0, 0, 0);
    }
  }

  class WindZone {
    constructor(pos, radius, strength, dir) {
      this.position = pos;
      this.radius = radius;
      this.strength = strength;
      this.direction = dir.normalize();
      const geo = new THREE.CylinderGeometry(radius, radius, 10, 32, 1, true);
      const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.2, wireframe: true });
      this.mesh = new THREE.Mesh(geo, mat);
      this.mesh.position.copy(pos);
      this.mesh.position.y = 5;
    }
    applyToObject(obj) {
      if (obj.isSleeping) return;
      const dist = this.mesh.position.distanceTo(obj.position);
      if (dist < this.radius) {
        const falloff = 1 - (dist / this.radius);
        obj.applyForce(this.direction.clone().multiplyScalar(this.strength * falloff));
      }
    }
  }

  class ForceField {
    constructor(pos, radius, strength, type) {
      this.position = pos;
      this.radius = radius;
      this.strength = strength;
      this.type = type;
      const geo = new THREE.SphereGeometry(radius, 32, 32);
      const mat = new THREE.MeshBasicMaterial({ color: type === 'attract' ? 0xff00ff : 0xff0000, transparent: true, opacity: 0.15, wireframe: true });
      this.mesh = new THREE.Mesh(geo, mat);
      this.mesh.position.copy(pos);
    }
    applyToObject(obj) {
      if (obj.isSleeping) return;
      const dir = new THREE.Vector3().subVectors(this.position, obj.position);
      const dist = dir.length();
      if (dist < this.radius && dist > 0.1) {
        dir.normalize();
        const falloff = 1 - (dist / this.radius);
        obj.applyForce(dir.multiplyScalar(this.strength * falloff * (this.type === 'attract' ? 1 : -1)));
      }
    }
  }

  const addWindZone = () => {
    const pos = new THREE.Vector3((Math.random() - 0.5) * 30, 5, (Math.random() - 0.5) * 30);
    const dir = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5);
    const wz = new WindZone(pos, 8, 100, dir);
    setWindZones(prev => [...prev, wz]);
    windZonesRef.current.push(wz);
  };

  const addForceField = (type = 'attract') => {
    const pos = new THREE.Vector3((Math.random() - 0.5) * 25, 5, (Math.random() - 0.5) * 25);
    const ff = new ForceField(pos, 10, 150, type);
    setForceFields(prev => [...prev, ff]);
    forceFieldsRef.current.push(ff);
  };

  class InteractiveAvatar {
    constructor(mesh, id, physicsActive, mlInt) {
      this.mesh = mesh;
      this.id = id;
      this.state = 'idle';
      this.isSelected = false;
      this.mlIntelligence = mlInt || 0;
      this.mesh.userData.animOffset = Math.random() * Math.PI * 2;
      this.mesh.userData.danceSpeed = 0.5 + Math.random() * 0.5;
      this.physicsBody = physicsActive ? new PhysicsObject(mesh, 1, mlInt) : null;
      this.energyLevel = 50;
      this.activityCount = 0;
    }
    onClick() {
      this.isSelected = !this.isSelected;
      this.activityCount++;
      
      const mlBehaviorThreshold = this.mlIntelligence / 100;
      const behaviors = ['dancing', 'jumping', 'waving', 'spinning'];
      const behaviorIndex = Math.floor(mlBehaviorThreshold * behaviors.length);
      this.state = this.isSelected ? behaviors[Math.min(behaviorIndex, behaviors.length - 1)] : 'idle';
      
      if (this.physicsBody && this.physicsBody.isGrounded) {
        const jumpForce = 500 + (this.mlIntelligence * 3);
        this.physicsBody.applyForce(new THREE.Vector3(0, jumpForce, 0));
        this.physicsBody.isGrounded = false;
        playSound('jump');
      }
      
      this.energyLevel = Math.min(100, this.energyLevel + 10);
      
      try {
        const head = this.mesh.getObjectByName('Head');
        if (head?.material?.color) head.material.color.setHex(this.isSelected ? 0xffff00 : 0xffdbac);
      } catch (e) {}
    }
    updateAnimation(time, physActive) {
      const offset = this.mesh.userData.animOffset;
      const mlSpeedBoost = 1 + (this.mlIntelligence / 150);
      const speed = this.mesh.userData.danceSpeed * mlSpeedBoost;
      
      const leftArm = this.mesh.getObjectByName('LeftArm');
      const rightArm = this.mesh.getObjectByName('RightArm');
      
      if (leftArm && rightArm) {
        const mlAmp = 1 + (this.mlIntelligence / 150);
        
        switch(this.state) {
          case 'dancing':
            leftArm.rotation.z = Math.sin(time * speed * 3 + offset) * 0.9 * mlAmp;
            rightArm.rotation.z = -Math.sin(time * speed * 3 + offset) * 0.9 * mlAmp;
            leftArm.rotation.x = Math.cos(time * speed * 2 + offset) * 0.4 * mlAmp;
            rightArm.rotation.x = -Math.cos(time * speed * 2 + offset) * 0.4 * mlAmp;
            break;
          case 'waving':
            leftArm.rotation.z = Math.sin(time * 5 + offset) * 0.6 + 0.6;
            rightArm.rotation.z = -Math.sin(time * 5 + offset) * 0.3;
            leftArm.rotation.x = Math.sin(time * 5 + offset) * 0.2;
            break;
          case 'spinning':
            this.mesh.rotation.y = time * speed * 2;
            leftArm.rotation.z = 0.5;
            rightArm.rotation.z = -0.5;
            break;
          case 'jumping':
            leftArm.rotation.z = 0.6;
            rightArm.rotation.z = -0.6;
            if (physActive && this.physicsBody?.isGrounded) this.state = 'idle';
            break;
          default:
            leftArm.rotation.z = Math.sin(time * speed * 0.5 + offset) * 0.05;
            rightArm.rotation.z = -Math.sin(time * speed * 0.5 + offset) * 0.05;
        }
      }
      
      if (!physActive) {
        this.mesh.position.y = this.state !== 'idle' ? 1 + Math.abs(Math.sin(time * speed * 3 + offset)) * 0.5 : 1;
      }
      
      this.energyLevel = Math.max(0, this.energyLevel - 0.05);
    }
  }

  function createAvatar() {
    const avatar = new THREE.Group();
    avatar.name = 'RealisticAvatar';
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 1.2, 8, 16), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5), roughness: 0.8 }));
    body.position.y = 1.2;
    body.castShadow = true;
    body.name = 'Body';
    avatar.add(body);
    
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.9 }));
    head.position.y = 2.1;
    head.castShadow = true;
    head.name = 'Head';
    avatar.add(head);
    
    const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.9, 4, 8), new THREE.MeshStandardMaterial({ color: 0xffdbac }));
    leftArm.position.set(-0.5, 1.3, 0);
    leftArm.rotation.z = Math.PI / 6;
    leftArm.name = 'LeftArm';
    avatar.add(leftArm);
    
    const rightArm = leftArm.clone();
    rightArm.position.set(0.5, 1.3, 0);
    rightArm.rotation.z = -Math.PI / 6;
    rightArm.name = 'RightArm';
    avatar.add(rightArm);
    
    return avatar;
  }

  useEffect(() => {
    if (!show3DPreview || !sceneRef.current) return;
    
    const width = sceneRef.current.clientWidth;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    
    const camera = new THREE.PerspectiveCamera(75, width / 500, 0.1, 1000);
    camera.position.set(0, 15, 30);
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, 500);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    sceneRef.current.appendChild(renderer.domElement);
    
    const raycaster = new THREE.Raycaster();
    raycasterRef.current = raycaster;
    
    scene.add(new THREE.AmbientLight(0x404060, 0.4));
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(15, 25, 15);
    light.castShadow = true;
    scene.add(light);
    
    const stage = new THREE.Mesh(new THREE.BoxGeometry(25, 1.5, 15), new THREE.MeshStandardMaterial({ color: 0x2c3e50 }));
    stage.position.set(0, 0.75, -5);
    stage.receiveShadow = true;
    scene.add(stage);
    
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x1a1a2e }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const interactiveAvatars = [];
    const physicsObjects = [];
    const mlInt = mlImprovements?.avatarIntelligence || 0;
    const mlSound = mlImprovements?.soundQuality || 0;
    const mlIndicators = [];
    const soundReactive = [];
    
    for (let i = 0; i < avatarCount; i++) {
      const avatarMesh = createAvatar();
      const row = Math.floor(i / 5);
      const col = i % 5;
      avatarMesh.position.set((col - 2) * 4, physicsEnabled ? 2 : 0, 15 + row * 3);
      
      const avatar = new InteractiveAvatar(avatarMesh, i, physicsEnabled, mlInt);
      interactiveAvatars.push(avatar);
      if (physicsEnabled && avatar.physicsBody) physicsObjects.push(avatar.physicsBody);
      scene.add(avatarMesh);
      
      if (showMLIndicators && mlInt > 1) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.3, 0.35, 16),
          new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(mlInt / 300, 1, 0.5), transparent: true, opacity: 0.7, side: THREE.DoubleSide })
        );
        ring.position.copy(avatarMesh.position);
        ring.position.y += 3;
        ring.rotation.x = -Math.PI / 2;
        ring.userData.parentAvatar = avatarMesh;
        ring.userData.soundReactive = true;
        mlIndicators.push(ring);
        soundReactive.push(ring);
        scene.add(ring);
      }
    }
    
    interactiveAvatarsRef.current = interactiveAvatars;
    physicsObjectsRef.current = physicsObjects;

    for (let i = 0; i < 16; i++) {
      const vis = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 16, 1, 0.5), emissive: new THREE.Color().setHSL(i / 16, 1, 0.3) })
      );
      vis.position.set((i - 8) * 1.5, 1, -12);
      vis.userData.soundReactive = true;
      vis.userData.frequencyBand = i;
      soundReactive.push(vis);
      scene.add(vis);
    }

    const crowdMeshes = [];
    for (let i = 0; i < Math.min(crowdSize, 500); i++) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 1.5, 6),
        new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.5, 0.4) })
      );
      const angle = (i / 500) * Math.PI * 2;
      const radius = 25 + Math.random() * 10;
      cone.position.set(Math.cos(angle) * radius, 0.75, Math.sin(angle) * radius);
      crowdMeshes.push(cone);
      scene.add(cone);
    }

    windZonesRef.current.forEach(wz => scene.add(wz.mesh));
    forceFieldsRef.current.forEach(ff => scene.add(ff.mesh));

    const onMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = (e) => {
      if (!interactivityEnabled) return;
      raycaster.setFromCamera(mouseRef.current, camera);
      const meshes = interactiveAvatars.map(a => a.mesh);
      const hits = raycaster.intersectObjects(meshes, true);
      
      if (hits.length > 0) {
        e.stopPropagation();
        const clicked = hits[0].object.parent?.name === 'RealisticAvatar' ? hits[0].object.parent : hits[0].object;
        const avatar = interactiveAvatars.find(a => a.mesh === clicked);
        if (avatar) {
          avatar.onClick();
          setSelectedAvatar(avatar.id);
        }
      }
    };

    const onKeyDown = (e) => {
      if (e.code === 'Space' && selectedAvatar !== null) {
        const avatar = interactiveAvatars[selectedAvatar];
        if (avatar?.physicsBody?.isGrounded) {
          avatar.physicsBody.applyForce(new THREE.Vector3(0, 800, 0));
          avatar.physicsBody.isGrounded = false;
          playSound('jump');
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);
    window.addEventListener('keydown', onKeyDown);

    let time = 0;
    let lastTime = performance.now();

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;
      time += dt;

      fpsCounterRef.current.frames++;
      if (now - fpsCounterRef.current.lastTime >= 1000) {
        fpsCounterRef.current.fps = fpsCounterRef.current.frames;
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastTime = now;
      }

      const reactivity = Math.sin(time * 10) * 0.5 + 0.5;
      const mlBoost = 1 + (mlSound / 100);
      
      soundReactive.forEach((obj, idx) => {
        if (obj.geometry.type === 'BoxGeometry') {
          obj.scale.y = 0.5 + reactivity * mlBoost * 5;
          obj.position.y = 1 + (obj.scale.y / 2);
        } else if (obj.geometry.type === 'RingGeometry' && obj.userData.parentAvatar) {
          obj.position.copy(obj.userData.parentAvatar.position);
          obj.position.y += 3 + Math.sin(time * 2 + idx * 0.5) * 0.2;
          const ml = mlImprovements?.avatarIntelligence || 0;
          obj.material.color.setHSL(ml / 300, 1, 0.5);
          obj.scale.set(1 + reactivity * mlBoost * 0.5, 1 + reactivity * mlBoost * 0.5, 1);
        }
      });

      crowdMeshes.forEach((cone, i) => {
        cone.position.y = 0.75 + Math.sin(time * 2 + i * 0.1) * 0.2;
        cone.rotation.y = Math.sin(time + i * 0.05) * 0.3;
      });

      if (physicsEnabled) {
        physicsObjects.forEach(obj => {
          if (!obj.isSleeping) {
            obj.applyGravity();
            windZonesRef.current.forEach(wz => wz.applyToObject(obj));
            forceFieldsRef.current.forEach(ff => ff.applyToObject(obj));
            obj.update(dt);
          }
        });
      }

      let totalEnergy = 0;
      let totalActivity = 0;
      let activeDancers = 0;
      
      interactiveAvatars.forEach(avatar => {
        avatar.mlIntelligence = mlImprovements?.avatarIntelligence || 0;
        avatar.updateAnimation(time, physicsEnabled);
        totalEnergy += avatar.energyLevel;
        totalActivity += avatar.activityCount;
        if (avatar.state === 'dancing' || avatar.isSelected) activeDancers++;
      });

      const avgEnergy = totalEnergy / interactiveAvatars.length;
      const mlQuality = (mlImprovements?.avatarIntelligence || 0) / 100;
      
      setSceneStats({ triangles: renderer.info.render.triangles, drawCalls: renderer.info.render.calls, physicsObjects: physicsObjects.length, fps: fpsCounterRef.current.fps });
      
      setConcertMetrics({
        synchronization: Math.min(100, 60 + (activeDancers / interactiveAvatars.length) * 40 * mlQuality),
        energyLevel: Math.min(100, avgEnergy * mlQuality),
        crowdEngagement: Math.min(100, (totalActivity / interactiveAvatars.length) * 10 * mlQuality),
        catchinessScore: Math.min(100, ((avgEnergy + (activeDancers / interactiveAvatars.length) * 100) / 2) * mlQuality),
        overallPerformance: Math.min(100, (avgEnergy * 0.3 + (activeDancers / interactiveAvatars.length) * 40 + mlQuality * 30))
      });

      camera.position.x = Math.sin(time * 0.08) * 35;
      camera.position.z = Math.cos(time * 0.08) * 35;
      camera.position.y = 15;
      camera.lookAt(0, 5, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (sceneRef.current && renderer.domElement) sceneRef.current.removeChild(renderer.domElement);
      renderer?.dispose();
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [show3DPreview, avatarCount, crowdSize, physicsEnabled, interactivityEnabled, selectedAvatar, soundEnabled, mlImprovements, showMLIndicators, windZones.length, forceFields.length, lightingIntensity]);

  const translateGoalToActions = (goal) => {
    console.log(`🎬 AI Director translating goal: ${goal.id}`);

    const actionPlans = {
      'increase_energy': {
        targetMetrics: {
          energyLevel: { target: 90, weight: 1.0 },
          crowdEngagement: { target: 85, weight: 0.8 }
        },
        actions: [
          { type: 'avatar_behavior', action: 'mass_dance', delay: 0, duration: 5000, avatarPercentage: 0.7 },
          { type: 'lighting', action: 'intensity_boost', from: lightingIntensity, to: Math.min(100, lightingIntensity + 20), duration: 2000 },
          { type: 'avatar_behavior', action: 'synchronized_jump', delay: 3000, avatarPercentage: 0.5 },
          { type: 'effect', action: 'add_force_field', subtype: 'attract', delay: 4000 },
          { type: 'tempo_boost', action: 'increase_animation_speed', multiplier: 1.3, duration: 5000 }
        ],
        learningMetrics: ['energyLevel', 'crowdEngagement']
      },
      'improve_sync': {
        targetMetrics: {
          synchronization: { target: 95, weight: 1.0 },
          overallPerformance: { target: 85, weight: 0.6 }
        },
        actions: [
          { type: 'avatar_behavior', action: 'reset_all_states', delay: 0 },
          { type: 'avatar_behavior', action: 'synchronized_wave', delay: 1000, avatarPercentage: 1.0 },
          { type: 'physics', action: 'disable_temporarily', duration: 5000 },
          { type: 'avatar_behavior', action: 'synchronized_dance_pattern', delay: 2000, pattern: 'wave', duration: 8000 },
          { type: 'effect', action: 'visual_grid', delay: 0, duration: 10000 }
        ],
        learningMetrics: ['synchronization', 'overallPerformance']
      },
      'spontaneous_moment': {
        targetMetrics: {
          crowdEngagement: { target: 80, weight: 0.8 },
          catchinessScore: { target: 75, weight: 0.7 }
        },
        actions: [
          { type: 'avatar_behavior', action: 'random_selection', count: 5, behavior: 'jump', delay: 0 },
          { type: 'effect', action: 'add_wind_zone', delay: 1000 },
          { type: 'avatar_behavior', action: 'chain_reaction', startCount: 3, spreadRate: 0.3, delay: 2000, duration: 6000 },
          { type: 'lighting', action: 'flicker', intensity: 0.3, duration: 4000 },
          { type: 'crowd', action: 'pulse_animation', delay: 3000, duration: 3000 }
        ],
        learningMetrics: ['crowdEngagement', 'catchinessScore', 'energyLevel']
      },
      'calm_crowd': {
        targetMetrics: {
          energyLevel: { target: 35, weight: 1.0 },
          synchronization: { target: 70, weight: 0.5 }
        },
        actions: [
          { type: 'lighting', action: 'dim_gradually', to: 40, duration: 3000 },
          { type: 'avatar_behavior', action: 'slow_sway', delay: 1000, avatarPercentage: 0.8, duration: 10000 },
          { type: 'effect', action: 'remove_all_force_fields', delay: 0 },
          { type: 'effect', action: 'remove_all_wind_zones', delay: 0 },
          { type: 'tempo_boost', action: 'decrease_animation_speed', multiplier: 0.6, duration: 8000 }
        ],
        learningMetrics: ['energyLevel', 'synchronization']
      },
      'maximize_engagement': {
        targetMetrics: {
          crowdEngagement: { target: 95, weight: 1.0 },
          energyLevel: { target: 85, weight: 0.8 },
          overallPerformance: { target: 90, weight: 0.9 }
        },
        actions: [
          { type: 'avatar_behavior', action: 'select_all', behavior: 'dance', delay: 0 },
          { type: 'crowd', action: 'increase_size', amount: Math.min(2000, Math.round(crowdSize * 1.3)), duration: 2000 },
          { type: 'lighting', action: 'dynamic_pulse', intensity: 0.8, frequency: 2, duration: 10000 },
          { type: 'effect', action: 'add_multiple_force_fields', count: 2, delay: 2000 },
          { type: 'avatar_behavior', action: 'interactive_response', delay: 3000, duration: 8000 }
        ],
        learningMetrics: ['crowdEngagement', 'energyLevel', 'overallPerformance']
      },
      'dramatic_entrance': {
        targetMetrics: {
          energyLevel: { target: 70, weight: 0.8 },
          synchronization: { target: 85, weight: 1.0 }
        },
        actions: [
          { type: 'lighting', action: 'blackout', duration: 1000 },
          { type: 'avatar_behavior', action: 'hide_all', delay: 0 },
          { type: 'lighting', action: 'spotlight_center', delay: 1500, duration: 3000 },
          { type: 'avatar_behavior', action: 'reveal_gradually', startCenter: true, delay: 2000, duration: 4000 },
          { type: 'effect', action: 'add_force_field', subtype: 'attract', position: 'center', delay: 3000 }
        ],
        learningMetrics: ['energyLevel', 'synchronization', 'overallPerformance']
      },
      'build_anticipation': {
        targetMetrics: {
          energyLevel: { target: 65, weight: 0.7 },
          crowdEngagement: { target: 75, weight: 0.8 }
        },
        actions: [
          { type: 'lighting', action: 'gradual_increase', from: lightingIntensity, to: Math.min(100, lightingIntensity + 30), duration: 8000 },
          { type: 'avatar_behavior', action: 'gradual_activation', startPercentage: 0.2, endPercentage: 0.9, duration: 8000 },
          { type: 'tempo_boost', action: 'gradual_speed_increase', from: 1.0, to: 1.4, duration: 8000 },
          { type: 'crowd', action: 'wave_motion', delay: 3000, duration: 5000 }
        ],
        learningMetrics: ['energyLevel', 'crowdEngagement', 'synchronization']
      },
      'climax_moment': {
        targetMetrics: {
          energyLevel: { target: 100, weight: 1.0 },
          crowdEngagement: { target: 95, weight: 1.0 },
          overallPerformance: { target: 95, weight: 1.0 }
        },
        actions: [
          { type: 'avatar_behavior', action: 'everyone_jump', delay: 0 },
          { type: 'lighting', action: 'max_intensity', delay: 0 },
          { type: 'effect', action: 'add_multiple_wind_zones', count: 3, delay: 500 },
          { type: 'effect', action: 'add_multiple_force_fields', count: 3, delay: 1000 },
          { type: 'crowd', action: 'explosion_pattern', delay: 1500 },
          { type: 'avatar_behavior', action: 'mass_dance', avatarPercentage: 1.0, delay: 2000, duration: 5000 }
        ],
        learningMetrics: ['energyLevel', 'crowdEngagement', 'overallPerformance', 'catchinessScore']
      }
    };

    return actionPlans[goal.id] || null;
  };

  const executeGoalPlan = async (plan) => {
    if (!plan || executingPlan) return;

    console.log('🎬 AI Director executing plan:', plan);
    setExecutingPlan(true);
    setPlanProgress(0);
    setActiveGoalPlan(plan);

    const startTime = Date.now();
    const initialMetrics = { ...concertMetrics };

    try {
      const sortedActions = [...plan.actions].sort((a, b) => (a.delay || 0) - (b.delay || 0));

      for (let i = 0; i < sortedActions.length; i++) {
        const action = sortedActions[i];
        
        if (action.delay) {
          await new Promise(resolve => setTimeout(resolve, action.delay));
        }

        await executeAction(action);
        
        setPlanProgress(((i + 1) / sortedActions.length) * 100);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      const endTime = Date.now();
      const finalMetrics = { ...concertMetrics };
      const success = evaluatePlanSuccess(plan, initialMetrics, finalMetrics);

      const strategy = {
        goal: behavioralGoal,
        plan: plan,
        initialMetrics: initialMetrics,
        finalMetrics: finalMetrics,
        success: success,
        improvement: calculateImprovement(initialMetrics, finalMetrics, plan.learningMetrics),
        timestamp: Date.now(),
        duration: endTime - startTime
      };

      setGoalHistory(prev => [...prev, strategy]);
      
      if (success.overall > 0.6) {
        setLearnedStrategies(prev => ({
          ...prev,
          [behavioralGoal.id]: {
            ...strategy,
            successRate: prev[behavioralGoal.id] 
              ? (prev[behavioralGoal.id].successRate * 0.8 + success.overall * 0.2)
              : success.overall
          }
        }));
        console.log(`✅ Learned successful strategy for ${behavioralGoal.id}: ${(success.overall * 100).toFixed(0)}% effective`);
      } else {
        console.log(`❌ Strategy for ${behavioralGoal.id} was not effective enough (${(success.overall * 100).toFixed(0)}%), not updating learned strategy.`);
      }

      if (onInteraction) {
        onInteraction({
          type: 'goal_execution_complete',
          goal: behavioralGoal,
          strategy: strategy,
          metrics: finalMetrics
        });
      }

    } catch (error) {
      console.error('❌ Goal execution failed:', error);
    } finally {
      setExecutingPlan(false);
      setPlanProgress(0);
      setActiveGoalPlan(null);
    }
  };

  const executeAction = async (action) => {
    console.log(`  → Executing action: ${action.type} - ${action.action}`);

    switch (action.type) {
      case 'avatar_behavior':
        await executeAvatarBehavior(action);
        break;
      case 'lighting':
        await executeLightingAction(action);
        break;
      case 'effect':
        await executeEffectAction(action);
        break;
      case 'physics':
        await executePhysicsAction(action);
        break;
      case 'tempo_boost':
        await executeTempoAction(action);
        break;
      case 'crowd':
        await executeCrowdAction(action);
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  };

  const executeAvatarBehavior = async (action) => {
    const avatars = interactiveAvatarsRef.current;
    if (!avatars || avatars.length === 0) return;

    switch (action.action) {
      case 'mass_dance':
        const danceCount = Math.floor(avatars.length * (action.avatarPercentage || 0.7));
        avatars.slice(0, danceCount).forEach(avatar => {
          avatar.state = 'dancing';
          avatar.isSelected = true;
        });
        break;

      case 'synchronized_jump':
        const jumpCount = Math.floor(avatars.length * (action.avatarPercentage || 0.5));
        avatars.slice(0, jumpCount).forEach(avatar => {
          if (avatar.physicsBody?.isGrounded) {
            avatar.physicsBody.applyForce(new THREE.Vector3(0, 600, 0));
            avatar.physicsBody.isGrounded = false;
            avatar.state = 'jumping';
          }
        });
        playSound('jump');
        break;

      case 'reset_all_states':
        avatars.forEach(avatar => {
          avatar.state = 'idle';
          avatar.isSelected = false;
        });
        break;

      case 'synchronized_wave':
        const waveCount = Math.floor(avatars.length * (action.avatarPercentage || 1.0));
        avatars.slice(0, waveCount).forEach((avatar, i) => {
          setTimeout(() => {
            avatar.state = 'waving';
            avatar.isSelected = true;
          }, i * 100);
        });
        break;

      case 'random_selection':
        const count = action.count || 5;
        for (let i = 0; i < count; i++) {
          const randomIdx = Math.floor(Math.random() * avatars.length);
          const avatar = avatars[randomIdx];
          avatar.state = action.behavior || 'jumping';
          avatar.isSelected = true;
          if (action.behavior === 'jump' && avatar.physicsBody?.isGrounded) {
            avatar.physicsBody.applyForce(new THREE.Vector3(0, 500, 0));
            avatar.physicsBody.isGrounded = false;
          }
        }
        break;

      case 'chain_reaction':
        const startCount = action.startCount || 3;
        const spreadRate = action.spreadRate || 0.3;
        const activated = new Set();
        
        for (let i = 0; i < startCount; i++) {
          const idx = Math.floor(Math.random() * avatars.length);
          if (!activated.has(idx)) {
            avatars[idx].state = 'dancing';
            avatars[idx].isSelected = true;
            activated.add(idx);
          }
        }

        const spreadInterval = setInterval(() => {
          const newActivations = [];
          activated.forEach(idx => {
            const baseAvatar = avatars[idx];
            avatars.forEach((avatar, i) => {
              if (!activated.has(i)) {
                const distance = baseAvatar.mesh.position.distanceTo(avatar.mesh.position);
                if (distance < 8 && Math.random() < spreadRate) {
                  newActivations.push(i);
                }
              }
            });
          });

          newActivations.forEach(idx => {
            avatars[idx].state = 'dancing';
            avatars[idx].isSelected = true;
            activated.add(idx);
          });

          if (newActivations.length === 0 || activated.size >= avatars.length) {
            clearInterval(spreadInterval);
          }
        }, 500);

        if (action.duration) {
          setTimeout(() => clearInterval(spreadInterval), action.duration);
        }
        break;

      case 'select_all':
        avatars.forEach(avatar => {
          avatar.state = action.behavior || 'dancing';
          avatar.isSelected = true;
        });
        break;

      case 'everyone_jump':
        avatars.forEach(avatar => {
          if (avatar.physicsBody?.isGrounded) {
            avatar.physicsBody.applyForce(new THREE.Vector3(0, 700, 0));
            avatar.physicsBody.isGrounded = false;
            avatar.state = 'jumping';
          }
        });
        playSound('jump');
        break;
      
      case 'hide_all':
        avatars.forEach(avatar => avatar.mesh.visible = false);
        break;

      case 'reveal_gradually':
        avatars.forEach((avatar, i) => {
          setTimeout(() => avatar.mesh.visible = true, i * (action.duration / avatars.length));
        });
        break;

      case 'gradual_activation':
        const startPerc = action.startPercentage || 0;
        const endPerc = action.endPercentage || 1;
        const totalAvatars = avatars.length;
        avatars.forEach((avatar, i) => {
          if (i / totalAvatars >= startPerc && i / totalAvatars <= endPerc) {
            setTimeout(() => {
              avatar.state = 'dancing';
              avatar.isSelected = true;
            }, i * (action.duration / (totalAvatars * (endPerc - startPerc))));
          }
        });
        break;

      default:
        console.warn(`Unknown avatar action: ${action.action}`);
    }
  };

  const executeLightingAction = async (action) => {
    switch (action.action) {
      case 'intensity_boost':
        const targetIntensity = action.to || Math.min(100, lightingIntensity + 20);
        setLightingIntensity(targetIntensity);
        break;

      case 'dim_gradually':
        const dimTarget = action.to || 40;
        const dimSteps = 20;
        const initialLighting = lightingIntensity;
        for (let i = 0; i <= dimSteps; i++) {
          const newIntensity = initialLighting + (dimTarget - initialLighting) * (i / dimSteps);
          setLightingIntensity(newIntensity);
          await new Promise(resolve => setTimeout(resolve, (action.duration || 3000) / dimSteps));
        }
        break;

      case 'gradual_increase':
        const increaseSteps = 30;
        const initialIncreaseLighting = lightingIntensity;
        const targetIncreaseLighting = action.to || Math.min(100, lightingIntensity + 30);
        for (let i = 0; i <= increaseSteps; i++) {
          const newIntensity = initialIncreaseLighting + (targetIncreaseLighting - initialIncreaseLighting) * (i / increaseSteps);
          setLightingIntensity(newIntensity);
          await new Promise(resolve => setTimeout(resolve, (action.duration || 8000) / increaseSteps));
        }
        break;

      case 'max_intensity':
        setLightingIntensity(100);
        break;
      
      case 'blackout':
        setLightingIntensity(0);
        if (action.duration) {
          await new Promise(resolve => setTimeout(resolve, action.duration));
        }
        break;

      case 'spotlight_center':
        setLightingIntensity(80);
        break;

      case 'flicker':
        const originalIntensity = lightingIntensity;
        const flickerInterval = setInterval(() => {
          setLightingIntensity(Math.random() < 0.5 ? originalIntensity * (1 - action.intensity) : originalIntensity * (1 + action.intensity));
        }, 100);
        if (action.duration) {
          setTimeout(() => {
            clearInterval(flickerInterval);
            setLightingIntensity(originalIntensity);
          }, action.duration);
        }
        break;

      case 'dynamic_pulse':
        const pulseOriginalIntensity = lightingIntensity;
        const pulseInterval = setInterval(() => {
          setLightingIntensity(pulseOriginalIntensity * (1 + action.intensity * Math.sin(Date.now() * 0.001 * action.frequency)));
        }, 50);
        if (action.duration) {
          setTimeout(() => {
            clearInterval(pulseInterval);
            setLightingIntensity(pulseOriginalIntensity);
          }, action.duration);
        }
        break;

      default:
        console.warn(`Unknown lighting action: ${action.action}`);
    }
  };

  const executeEffectAction = async (action) => {
    switch (action.action) {
      case 'add_force_field':
        addForceField(action.subtype || 'attract');
        break;

      case 'add_wind_zone':
        addWindZone();
        break;

      case 'add_multiple_force_fields':
        for (let i = 0; i < (action.count || 2); i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          addForceField(i % 2 === 0 ? 'attract' : 'repel');
        }
        break;

      case 'add_multiple_wind_zones':
        for (let i = 0; i < (action.count || 3); i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          addWindZone();
        }
        break;

      case 'remove_all_force_fields':
        setForceFields([]);
        forceFieldsRef.current = [];
        break;

      case 'remove_all_wind_zones':
        setWindZones([]);
        windZonesRef.current = [];
        break;
      
      case 'visual_grid':
        console.log("Simulating 'visual_grid' effect (visual not implemented)");
        break;

      default:
        console.warn(`Unknown effect action: ${action.action}`);
    }
  };

  const executePhysicsAction = async (action) => {
    switch (action.action) {
      case 'disable_temporarily':
        setPhysicsEnabled(false);
        if (action.duration) {
          setTimeout(() => setPhysicsEnabled(true), action.duration);
        }
        break;

      default:
        console.warn(`Unknown physics action: ${action.action}`);
    }
  };

  const executeTempoAction = async (action) => {
    console.log(`Tempo action: ${action.action}, multiplier: ${action.multiplier || action.to}`);
  };

  const executeCrowdAction = async (action) => {
    switch (action.action) {
      case 'increase_size':
        setCrowdSize(action.amount || Math.min(2000, crowdSize + 200));
        break;

      case 'pulse_animation':
        console.log("Simulating 'pulse_animation' for crowd (visual not implemented)");
        break;

      case 'wave_motion':
        console.log("Simulating 'wave_motion' for crowd (visual not implemented)");
        break;
      
      case 'explosion_pattern':
        console.log("Simulating 'explosion_pattern' for crowd (visual not implemented)");
        break;

      default:
        console.warn(`Unknown crowd action: ${action.action}`);
    }
  };

  const evaluatePlanSuccess = (plan, initialMetrics, finalMetrics) => {
    const results = {};
    let totalWeight = 0;
    let weightedScore = 0;

    Object.entries(plan.targetMetrics).forEach(([metric, { target, weight }]) => {
      const initial = initialMetrics[metric] || 0;
      const final = finalMetrics[metric] || 0;
      
      let score = 0;
      if (initial <= target) {
          score = (final - initial) / (target - initial || 1);
      } else {
          score = (initial - final) / (initial - target || 1);
      }
      
      results[metric] = {
        initial,
        final,
        target,
        score: Math.max(0, Math.min(1, score))
      };

      weightedScore += results[metric].score * weight;
      totalWeight += weight;
    });

    const overallSuccess = totalWeight > 0 ? weightedScore / totalWeight : 0;

    return {
      overall: overallSuccess,
      metrics: results,
      rating: overallSuccess > 0.8 ? 'excellent' : overallSuccess > 0.6 ? 'good' : overallSuccess > 0.4 ? 'moderate' : 'poor'
    };
  };

  const calculateImprovement = (initialMetrics, finalMetrics, learningMetrics) => {
    const improvements = {};
    learningMetrics.forEach(metric => {
      const initial = initialMetrics[metric] || 0;
      const final = finalMetrics[metric] || 0;
      improvements[metric] = {
        absolute: final - initial,
        percentage: initial !== 0 ? ((final - initial) / Math.abs(initial)) * 100 : 0
      };
    });
    return improvements;
  };

  const applyLearnedStrategy = (goalId) => {
    const strategy = learnedStrategies[goalId];
    if (!strategy) {
      console.warn(`No learned strategy for goal: ${goalId}`);
      return;
    }

    console.log(`🧠 Applying learned strategy for ${goalId} (success rate: ${(strategy.successRate * 100).toFixed(0)}%)`);
    executeGoalPlan(strategy.plan);
  };

  const getStrategyRecommendation = (currentMetrics) => {
    if (Object.keys(learnedStrategies).length === 0) {
      return null;
    }

    let bestGoalId = null;
    let bestScore = -1;

    Object.entries(learnedStrategies).forEach(([goalId, strategy]) => {
      let fitnessScore = 0;
      let totalMetricWeight = 0;

      Object.entries(strategy.plan.targetMetrics).forEach(([metric, { target, weight }]) => {
        const current = currentMetrics[metric];
        if (current === undefined) return;

        const initialMetricValue = strategy.initialMetrics[metric];
        
        if (initialMetricValue !== undefined && Math.abs(target - initialMetricValue) > 0.1) {
            if (target > initialMetricValue && current < target) {
                fitnessScore += weight * (1 - (current / target));
            } 
            else if (target < initialMetricValue && current > target) {
                fitnessScore += weight * (current / initialMetricValue);
            }
        }
        totalMetricWeight += weight;
      });

      if (totalMetricWeight > 0) {
          fitnessScore = (fitnessScore / totalMetricWeight) * strategy.successRate;
      } else {
          fitnessScore = strategy.successRate;
      }

      if (fitnessScore > bestScore && strategy.successRate > 0.5) {
        bestScore = fitnessScore;
        bestGoalId = goalId;
      }
    });

    return bestGoalId ? {
      goalId: bestGoalId,
      confidence: bestScore,
      strategy: learnedStrategies[bestGoalId]
    } : null;
  };


  return (
    <div className="space-y-6">
      {/* ML Status Indicator */}
      {mlImprovements && mlImprovements.sceneOptimization > 0 && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 font-semibold">
                  ✅ ML Scene Optimization: {mlImprovements.sceneOptimization.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400">
                  Enhanced avatars, lighting, and crowd dynamics powered by machine learning
                </p>
              </div>
              <Badge className="bg-green-500 text-white">ACTIVE</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-Time ML Adaptation Dashboard - CARD FORMAT */}
      <Card className="bg-slate-950/98 border-purple-500/40">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
            🤖 Real-Time ML Adaptation Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-slate-950/90 rounded-lg border border-purple-500/40">
            <h4 className="text-purple-300 font-semibold mb-2">🧠 How ML Adaptation Works:</h4>
            <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="space-y-2">
                <p><strong className="text-white">💡 Lighting:</strong> Adjusts based on energy level + ML sound quality</p>
                <p><strong className="text-white">👥 Crowd:</strong> Scales with engagement + ML scene optimization</p>
                <p><strong className="text-white">🎭 Avatars:</strong> Increases with ML avatar intelligence</p>
              </div>
              <div className="space-y-2">
                <p><strong className="text-white">⚙️ Physics:</strong> Enabled when ML physics accuracy is high</p>
                <p><strong className="text-white">🌪️ Effects:</strong> Added when catchiness + ML animation quality peak</p>
                <p><strong className="text-white">🔄 Updates:</strong> Every 2 seconds in adaptive mode</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card 
              onClick={() => setAdaptiveMode(!adaptiveMode)}
              className={`${adaptiveMode ? 'bg-green-500/20 border-green-400' : 'bg-slate-800/50 border-slate-600'} hover:scale-105 transition-all cursor-pointer`}
            >
              <CardContent className="p-4 text-center">
                <Brain className={`w-8 h-8 mx-auto mb-2 ${adaptiveMode ? 'text-green-400' : 'text-slate-400'}`} />
                <p className={`font-semibold text-sm ${adaptiveMode ? 'text-green-300' : 'text-slate-300'}`}>
                  {adaptiveMode ? '✓ ADAPTIVE' : 'MANUAL'}
                </p>
              </CardContent>
            </Card>
              <Card
                onClick={forceMLAdaptation}
                className="bg-purple-500/20 border-purple-400 hover:bg-purple-500/30 hover:scale-105 transition-all cursor-pointer"
              >
                <CardContent className="p-4 text-center">
                  <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-purple-300 font-semibold text-sm">Adapt Now</p>
                </CardContent>
              </Card>
          </div>

          {adaptiveMode && adaptationHistory.length > 0 && (
            <div className="p-4 bg-blue-950/50 rounded-lg border border-blue-500/40">
              <h4 className="text-blue-300 font-semibold mb-2 flex items-center justify-between">
                <span>📊 Recent ML Adaptations ({adaptationHistory.length})</span>
                <Button size="sm" variant="outline" onClick={() => setAdaptationHistory([])} className="text-slate-300 border-slate-600 hover:bg-slate-700">
                  Clear
                </Button>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {adaptationHistory.slice(-5).reverse().map((adaptation, idx) => (
                  <div key={idx} className="p-2 bg-slate-900/70 rounded text-xs">
                    <p className="text-slate-400 mb-1">
                      {new Date(adaptation.timestamp).toLocaleTimeString()}
                    </p>
                    {adaptation.changes.map((change, cidx) => (
                      <div key={cidx} className="flex items-start gap-2 mb-1">
                        <Badge className={
                          change.type.includes('increase') || change.type.includes('boost') || change.type.includes('enabled') || change.type.includes('added')
                            ? 'bg-green-500'
                            : change.type.includes('decrease') || change.type.includes('dim') || change.type.includes('disabled')
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                        }>
                          {change.type}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-slate-300">{change.reason}</p>
                          {change.from !== undefined && (
                            <p className="text-slate-500">
                              {typeof change.from === 'boolean' ? (change.from ? 'ON' : 'OFF') : change.from} 
                              → 
                              {typeof change.to === 'boolean' ? (change.to ? 'ON' : 'OFF') : change.to}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Card 
              onClick={resetSceneToBaseline}
              className="bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 hover:scale-105 transition-all cursor-pointer"
            >
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-orange-300 font-semibold text-sm">🔄 Reset to Baseline</p>
              </CardContent>
            </Card>
            <Card
              onClick={() => {
                const summary = `🤖 ML Adaptation Summary\n\n${adaptationHistory.length} total adaptations\n\n${adaptationHistory.slice(-5).map(a => `• ${new Date(a.timestamp).toLocaleTimeString()}: ${a.changes.length} changes`).join('\n')}`;
                alert(summary);
              }}
              className="bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 hover:scale-105 transition-all cursor-pointer"
            >
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-blue-300 font-semibold text-sm">📊 View Summary</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* ML Status - DARK */}
      <Card className="bg-slate-900/90 border-green-500/30">
        <CardContent className="p-4">
          <Brain className="w-6 h-6 text-green-400 animate-pulse mb-2" />
          <h4 className="text-white font-semibold mb-2">🧠 ML Concert LIVE</h4>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(mlImprovements || {}).map(([key, val]) => (
              <div key={key} className="p-2 bg-purple-500/20 border border-purple-500/50 rounded text-center">
                <p className="text-xs text-purple-300">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="text-lg font-bold text-white animate-pulse">{val?.toFixed(1) || 0}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Concert Performance Metrics - DARK */}
      <Card className="bg-slate-900/90 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white">🎯 Concert Performance Analytics (ML-Powered)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 bg-blue-500/20 border border-blue-500/50 rounded text-center">
              <p className="text-xs text-blue-300">Synchronization</p>
              <p className="text-2xl font-bold text-white">{concertMetrics.synchronization.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-500/20 border border-purple-500/50 rounded text-center">
              <p className="text-xs text-purple-300">Energy Level</p>
              <p className="text-2xl font-bold text-white">{concertMetrics.energyLevel.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-green-500/20 border border-green-500/50 rounded text-center">
              <p className="text-xs text-green-300">Crowd Engage</p>
              <p className="text-2xl font-bold text-white">{concertMetrics.crowdEngagement.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-orange-500/20 border border-orange-500/50 rounded text-center">
              <p className="text-xs text-orange-300">Catchiness</p>
              <p className="text-2xl font-bold text-white">{concertMetrics.catchinessScore.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-center">
              <p className="text-xs text-red-300">Overall</p>
              <p className="text-2xl font-bold text-white">{concertMetrics.overallPerformance.toFixed(1)}%</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-3 text-center">
            ✨ Metrics improve with ML training • Click avatars to boost engagement
          </p>
        </CardContent>
      </Card>

      {/* Behavioral Goal Control System - DARK */}
      <Card className="bg-slate-950/98 border-blue-500/40">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-blue-400 animate-pulse" />
              🎬 AI Director: Behavioral Goals
            </div>
            {executingPlan && (
              <Badge className="bg-blue-500 animate-pulse">Executing...</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Goal Selection */}
          <div className="p-4 bg-slate-950/90 rounded-lg border border-blue-500/40">
            <h4 className="text-blue-300 font-semibold mb-3">🎯 Select Behavioral Goal:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableGoals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => setBehavioralGoal(goal)}
                  disabled={executingPlan}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    behavioralGoal?.id === goal.id
                      ? 'bg-blue-500/30 border-blue-400'
                      : 'bg-slate-900/50 border-slate-700 hover:border-blue-500/50'
                  } ${executingPlan ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="text-2xl mb-1">{goal.icon}</div>
                  <div className="text-xs text-white font-semibold">{goal.label}</div>
                  {learnedStrategies[goal.id] && (
                    <Badge className="mt-1 bg-green-500 text-white text-[10px]">
                      {(learnedStrategies[goal.id].successRate * 100).toFixed(0)}% ✓
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Goal Info */}
          {behavioralGoal && (
            <div className="p-4 bg-blue-950/50 rounded-lg border border-blue-500/40">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-blue-300 font-semibold flex items-center gap-2">
                    <span className="text-2xl">{behavioralGoal.icon}</span>
                    {behavioralGoal.label}
                  </h4>
                  <p className="text-sm text-slate-400 mt-1">{behavioralGoal.description}</p>
                </div>
                {learnedStrategies[behavioralGoal.id] && (
                  <div className="text-right">
                    <Badge className="bg-green-500">Learned</Badge>
                    <p className="text-xs text-green-300 mt-1">
                      {(learnedStrategies[behavioralGoal.id].successRate * 100).toFixed(0)}% success rate
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Card
                  onClick={() => {
                    if (!executingPlan) {
                      const plan = translateGoalToActions(behavioralGoal);
                      if (plan) executeGoalPlan(plan);
                    }
                  }}
                  className={`bg-blue-500/20 border-blue-400 hover:bg-blue-500/30 hover:scale-105 transition-all ${executingPlan ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <CardContent className="p-4 text-center">
                    <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-blue-300 font-semibold text-sm">Execute Goal</p>
                  </CardContent>
                </Card>
                {learnedStrategies[behavioralGoal.id] && (
                  <Card
                    onClick={() => !executingPlan && applyLearnedStrategy(behavioralGoal.id)}
                    className={`bg-green-500/20 border-green-400 hover:bg-green-500/30 hover:scale-105 transition-all ${executingPlan ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <CardContent className="p-4 text-center">
                      <Brain className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-300 font-semibold text-sm">Use Learned</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Execution Progress */}
          {executingPlan && activeGoalPlan && (
            <div className="p-4 bg-purple-950/50 rounded-lg border border-purple-500/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-300 font-semibold">Executing Plan...</span>
                <span className="text-purple-400 text-sm">{planProgress.toFixed(0)}%</span>
              </div>
              <Progress value={planProgress} className="h-2 mb-3 bg-purple-200" indicatorClassName="bg-purple-600" />
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(activeGoalPlan.targetMetrics).map(([metric, { target }]) => (
                  <div key={metric} className="p-2 bg-slate-900/50 rounded">
                    <p className="text-slate-400">{metric}</p>
                    <p className="text-white font-bold">Target: {target}%</p>
                    <p className="text-purple-300">Current: {concertMetrics[metric]?.toFixed(0)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {!executingPlan && Object.keys(learnedStrategies).length > 0 && (
            <div className="p-4 bg-green-950/50 rounded-lg border border-green-500/40">
              <h4 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                🤖 AI Recommendation
              </h4>
              {(() => {
                const recommendation = getStrategyRecommendation(concertMetrics);
                if (!recommendation) return <p className="text-sm text-slate-400">No recommendations yet - execute more goals to learn!</p>;
                
                const goal = availableGoals.find(g => g.id === recommendation.goalId);
                return (
                  <div>
                    <p className="text-sm text-green-200 mb-2">
                      Based on current metrics, I recommend: <strong>{goal?.label}</strong>
                    </p>
                    <p className="text-xs text-slate-400 mb-3">
                      Confidence: {(recommendation.confidence * 100).toFixed(0)}% (learned from {goalHistory.filter(h => h.goal.id === recommendation.goalId).length} previous executions)
                    </p>
                    <Card
                      onClick={() => {
                        setBehavioralGoal(goal);
                        applyLearnedStrategy(recommendation.goalId);
                      }}
                      className="bg-green-500/20 border-green-400 hover:bg-green-500/30 hover:scale-105 transition-all cursor-pointer"
                    >
                      <CardContent className="p-3 text-center">
                        <p className="text-green-300 font-semibold text-sm">Apply Recommendation</p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Goal History */}
          {goalHistory.length > 0 && (
            <div className="p-4 bg-slate-950/90 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-slate-300 font-semibold">📊 Execution History ({goalHistory.length})</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setGoalHistory([])}
                  className="text-slate-400 border-slate-600"
                >
                  Clear
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {goalHistory.slice(-5).reverse().map((record, idx) => (
                  <div key={idx} className="p-2 bg-slate-900/70 rounded text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-semibold">{record.goal.icon} {record.goal.label}</span>
                      <Badge className={
                        record.success.rating === 'excellent' ? 'bg-green-500' :
                        record.success.rating === 'good' ? 'bg-blue-500' :
                        record.success.rating === 'moderate' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }>
                        {record.success.rating} ({(record.success.overall * 100).toFixed(0)}%)
                      </Badge>
                    </div>
                    <p className="text-slate-400">
                      {new Date(record.timestamp).toLocaleTimeString()} • Duration: {(record.duration / 1000).toFixed(1)}s
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(record.improvement).map(([metric, data]) => (
                        <span key={metric} className={`text-[10px] px-1 py-0.5 rounded ${
                          data.absolute > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {metric}: {data.absolute > 0 ? '+' : ''}{data.absolute.toFixed(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-xs text-blue-300">
              💡 <strong>How It Works:</strong> The AI Director translates your high-level goals into specific avatar actions, lighting changes, and environmental effects. It learns from crowd responses (concert metrics) and improves strategies over time. Successful strategies are saved and can be reapplied with higher confidence!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performers Grid - DARK */}
      <Card className="bg-slate-900/90 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex justify-between">
            <div><Users className="w-5 h-5 inline mr-2" />🎭 Performers ({avatarCount})</div>
            <Badge className="bg-green-500">LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {Array.from({ length: avatarCount }).map((_, idx) => (
              <div key={idx} className={`p-2 rounded border-2 cursor-pointer transition-all ${selectedAvatar === idx ? 'bg-purple-500/30 border-purple-400 scale-110' : 'bg-slate-800/50 border-slate-600 hover:border-purple-500'}`} onClick={() => setSelectedAvatar(idx)}>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center relative">
                    <Users className="w-6 h-6 text-white" />
                    {mlImprovements?.avatarIntelligence > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-white font-bold text-xs">#{idx + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Director - DARK */}
      <Card className="bg-slate-900/90 border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-white flex justify-between">
            <div><Wand2 className="w-5 h-5 inline mr-2" />🎬 AI Director</div>
            {aiDirectorActive && <Badge className="bg-green-500">ACTIVE</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded">
            <h4 className="text-blue-300 font-semibold mb-2">🎵 Upload Music</h4>
            <Input type="file" accept="audio/*" onChange={(e) => {
              if (e.target.files[0]) {
                setAudioFile(e.target.files[0]);
                playMusic(e.target.files[0]);
              }
            }} className="bg-slate-800 text-white" />
            {audioFile && (
              <div className="mt-3 p-2 bg-green-500/10 rounded flex justify-between items-center">
                <p className="text-green-300 text-sm">✅ {audioFile.name}</p>
                <Button size="sm" onClick={isPlayingMusic ? stopMusic : () => playMusic(audioFile)} className={isPlayingMusic ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}>
                  {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card onClick={activateAIDirector} className="bg-orange-500/20 border-orange-400 hover:bg-orange-500/30 hover:scale-105 transition-all cursor-pointer">
              <CardContent className="p-4 text-center">
                <Brain className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-orange-300 font-semibold text-sm">Activate</p>
              </CardContent>
            </Card>
            <Card onClick={generateMLCrowd} className="bg-purple-500/20 border-purple-400 hover:bg-purple-500/30 hover:scale-105 transition-all cursor-pointer">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-purple-300 font-semibold text-sm">ML Crowd</p>
              </CardContent>
            </Card>
          </div>
          {directorSuggestions.map((sug, idx) => (
            <div key={idx} className="p-3 bg-slate-800/50 rounded flex gap-3">
              <div className="flex-1">
                <Badge className="mb-1">{sug.type}</Badge>
                <p className="text-sm text-slate-300">{sug.message}</p>
              </div>
              <Button size="sm" onClick={sug.action} className="bg-green-600 hover:bg-green-700">Apply</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Scene Controls - DARK */}
      <Card className="bg-slate-950/95 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              Scene Generator
            </div>
            {mlImprovements && (
              <Badge className="bg-green-500 animate-pulse">
                <Brain className="w-3 h-3 mr-1" />
                ML: {(mlImprovements.sceneOptimization || 0).toFixed(0)}%
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={sceneType} onValueChange={setSceneType}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="concert"><Music className="w-4 h-4 mr-2" />Concert</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="club">Club</TabsTrigger>
              <TabsTrigger value="arena">Arena</TabsTrigger>
            </TabsList>
          </Tabs>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-300">Detailed Avatars</label>
              <Badge>{avatarCount}</Badge>
            </div>
            <Slider value={[avatarCount]} onValueChange={(v) => setAvatarCount(v[0])} min={5} max={50} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-300">Crowd Size</label>
              <Badge>{crowdSize}</Badge>
            </div>
            <Slider value={[crowdSize]} onValueChange={(v) => setCrowdSize(v[0])} min={10} max={2000} step={10} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-300">Lighting</label>
              <Badge>{lightingIntensity}%</Badge>
            </div>
            <Slider value={[lightingIntensity]} onValueChange={(v) => setLightingIntensity(v[0])} min={0} max={100} step={5} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant={physicsEnabled ? "default" : "outline"} onClick={() => setPhysicsEnabled(!physicsEnabled)} className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-900">
              <Activity className="w-4 h-4 mr-2" />
              Physics {physicsEnabled ? 'ON' : 'OFF'}
            </Button>
            <Button variant={interactivityEnabled ? "default" : "outline"} onClick={() => setInteractivityEnabled(!interactivityEnabled)} className="border-purple-500/50 text-purple-300 hover:bg-purple-900">
              <MousePointer className="w-4 h-4 mr-2" />
              Interactive {interactivityEnabled ? 'ON' : 'OFF'}
            </Button>
          </div>
          <Button
            onClick={generateScene}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating (chunked)...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Scene
              </>
            )}
          </Button>

          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-xs text-purple-300 text-center">
              <Zap className="w-3 h-3 inline mr-1" />
              Physics-based lighting • ML crowd optimization • Chunked processing prevents freezing
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pass audioFile state up */}
      <input type="hidden" value={audioFile?.name || ''} />

      {/* 3D Concert View - DARK */}
      <Card className="bg-slate-900/90 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white flex justify-between">
            <div>🎮 LIVE CONCERT - {avatarCount} Performers + {crowdSize} Crowd</div>
            <Badge className="bg-green-500">FPS: {sceneStats.fps || '--'}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={sceneRef} className="w-full rounded-lg border-2 border-green-500/30" style={{ height: '500px', background: '#0a0a1a' }} />
          <div className="mt-4 grid grid-cols-4 gap-2">
            <div className="p-2 bg-purple-500/20 rounded text-center">
              <p className="text-xs text-purple-300">Performers</p>
              <p className="text-2xl font-bold text-white">{avatarCount}</p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded text-center">
              <p className="text-xs text-blue-300">Crowd</p>
              <p className="text-2xl font-bold text-white">{crowdSize}</p>
            </div>
            <div className="p-2 bg-green-500/20 rounded text-center">
              <p className="text-xs text-green-300">FPS</p>
              <p className="text-2xl font-bold text-green-400">{sceneStats.fps || '--'}</p>
            </div>
            <div className="p-2 bg-orange-500/20 rounded text-center">
              <p className="text-xs text-orange-300">Triangles</p>
              <p className="text-2xl font-bold text-white">{(sceneStats.triangles / 1000).toFixed(0)}K</p>
            </div>
          </div>
          {physicsEnabled && (
            <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded">
              <h4 className="text-cyan-300 font-semibold text-sm mb-2">🌪️ Environmental Physics</h4>
              <div className="grid grid-cols-3 gap-2">
                <Card onClick={addWindZone} className="bg-cyan-500/20 border-cyan-400 hover:bg-cyan-500/30 hover:scale-105 transition-all cursor-pointer">
                  <CardContent className="p-3 text-center">
                    <Wind className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                    <p className="text-cyan-300 font-semibold text-xs">Wind</p>
                  </CardContent>
                </Card>
                <Card onClick={() => addForceField('attract')} className="bg-purple-500/20 border-purple-400 hover:bg-purple-500/30 hover:scale-105 transition-all cursor-pointer">
                  <CardContent className="p-3 text-center">
                    <Magnet className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                    <p className="text-purple-300 font-semibold text-xs">Attract</p>
                  </CardContent>
                </Card>
                <Card onClick={() => addForceField('repel')} className="bg-red-500/20 border-red-400 hover:bg-red-500/30 hover:scale-105 transition-all cursor-pointer">
                  <CardContent className="p-3 text-center">
                    <Magnet className="w-6 h-6 text-red-400 mx-auto mb-1" />
                    <p className="text-red-300 font-semibold text-xs">Repel</p>
                  </CardContent>
                </Card>
              </div>
              <p className="text-xs text-slate-300 mt-2">{windZones.length} winds • {forceFields.length} fields</p>
            </div>
          )}
          <div className="mt-4 p-3 bg-cyan-500/10 rounded">
            <h4 className="text-cyan-300 font-semibold text-sm mb-2">🎮 Controls:</h4>
            <ul className="text-xs text-slate-300 ml-4 list-disc space-y-1">
              <li><strong>Click</strong> performers → They dance/jump/wave (ML controls behavior)</li>
              <li><strong>Spacebar</strong> → Jump selected performer</li>
              <li><strong>ML Rings</strong> → Color shows training quality (red→green)</li>
              <li><strong>Crowd</strong> → Background dancers pulse with music</li>
              <li>Selected: {selectedAvatar !== null ? `#${selectedAvatar + 1}` : 'Click a performer'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Generated Scene Details - DARK */}
      {generatedScene && (
        <Card className="bg-slate-900/90 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white flex justify-between">
              <span>🎪 {generatedScene.scene_name}</span>
              <Button onClick={() => {
                const data = JSON.stringify(generatedScene, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'concert.json';
                link.click();
              }} size="sm" className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-purple-500/10 rounded">
              <h4 className="text-purple-300 font-semibold mb-2">🎭 Performance Details</h4>
              <div className="text-xs text-slate-300 space-y-1">
                <p>• Type: {generatedScene.environment}</p>
                <p>• Performers: {generatedScene.crowd?.avatar_count || avatarCount}</p>
                <p>• Crowd: {generatedScene.crowd?.size}</p>
                <p>• Formation: {generatedScene.crowd?.distribution}</p>
                {generatedScene.lighting?.intensity !== undefined && <p>• Lighting: {generatedScene.lighting.intensity}%</p>}
                {generatedScene.physicsEnabled !== undefined && <p>• Physics: {generatedScene.physicsEnabled ? 'On' : 'Off'}</p>}
              </div>
            </div>
            {generatedScene.mlEnhancements && (
              <div className="mt-3 p-3 bg-green-500/10 rounded">
                <p className="text-green-300 font-semibold">🧠 ML ACTIVE</p>
                <p className="text-xs text-slate-300">✅ Avatars learning • Metrics improving • Performance optimizing</p>
                {generatedScene.mlEnhancements.qualityBoost && <p className="text-xs text-slate-300">• Scene Optimization Score: {generatedScene.mlEnhancements.qualityBoost}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}