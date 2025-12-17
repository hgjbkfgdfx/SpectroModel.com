import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, Maximize2, Activity, Zap, AlertTriangle, WifiOff } from 'lucide-react';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';

export default function Avatar3DRenderer({ avatarData, mlImprovements = {} }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const avatarRef = useRef(null);
  const animationIdRef = useRef(null);
  const clockRef = useRef(null);
  const mlDataCollector = useMLDataCollector();

  const [isPlaying, setIsPlaying] = useState(true);
  const [fps, setFps] = useState(60);
  const [triangleCount, setTriangleCount] = useState(0);
  const [renderQuality, setRenderQuality] = useState([1]);
  const [loadError, setLoadError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [renderKey, setRenderKey] = useState(0);

  const lastFrameTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const fpsUpdateIntervalRef = useRef(null);

  // Robust initialization with retry logic
  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;

    const initScene = () => {
      try {
        setLoadError(null);
        
        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a1a);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(
          45,
          containerRef.current.clientWidth / containerRef.current.clientHeight,
          0.1,
          1000
        );
        camera.position.set(0, 1.6, 3);
        camera.lookAt(0, 1.2, 0);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        scene.add(directionalLight);

        const fillLight = new THREE.DirectionalLight(0x4444ff, 0.3);
        fillLight.position.set(-5, 5, -5);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xff44ff, 0.4);
        rimLight.position.set(0, 5, -10);
        scene.add(rimLight);

        // Clock for animations
        clockRef.current = new THREE.Clock();

        // FPS counter
        fpsUpdateIntervalRef.current = setInterval(() => {
          const now = performance.now();
          const delta = now - lastFrameTimeRef.current;
          const currentFps = Math.round((frameCountRef.current * 1000) / delta);
          if (mounted) {
            setFps(currentFps);
          }
          frameCountRef.current = 0;
          lastFrameTimeRef.current = now;
        }, 1000);

        console.log('✅ 3D scene initialized');
        
        mlDataCollector.record('renderer_initialized', {
          feature: '3d_renderer',
          timestamp: Date.now()
        });

      } catch (error) {
        console.error('❌ Scene initialization failed:', error);
        if (mounted) {
          setLoadError('Failed to initialize 3D renderer');
        }
        
        mlDataCollector.record('renderer_error', {
          feature: '3d_renderer',
          error: error.message,
          timestamp: Date.now()
        });
      }
    };

    initScene();

    return () => {
      mounted = false;
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (fpsUpdateIntervalRef.current) {
        clearInterval(fpsUpdateIntervalRef.current);
      }
      
      if (rendererRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {}
        rendererRef.current.dispose();
      }
      
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(mat => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [renderKey]);

  // Load avatar with retry logic
  useEffect(() => {
    if (!avatarData || !sceneRef.current) return;

    let mounted = true;
    let retries = 0;
    const maxRetries = 3;

    const loadAvatarWithRetry = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        if (avatarRef.current) {
          sceneRef.current.remove(avatarRef.current);
          avatarRef.current.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(mat => mat.dispose());
              } else {
                object.material.dispose();
              }
            }
          });
          avatarRef.current = null;
        }

        const avatarGroup = new THREE.Group();

        // Head
        const headGeo = new THREE.SphereGeometry(0.15, 32, 32);
        const skinColor = new THREE.Color(avatarData.facial_features?.skin_tone || '#ffdbac');
        const headMat = new THREE.MeshStandardMaterial({ 
          color: skinColor,
          roughness: 0.6,
          metalness: 0.1
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.6;
        head.castShadow = true;
        avatarGroup.add(head);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.025, 16, 16);
        const eyeColor = new THREE.Color(avatarData.facial_features?.eye_color || '#8B4513');
        const eyeMat = new THREE.MeshStandardMaterial({ color: eyeColor });
        
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.05, 1.62, 0.13);
        avatarGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.05, 1.62, 0.13);
        avatarGroup.add(rightEye);

        // Hair
        const hairColor = new THREE.Color(avatarData.hairstyle?.color || '#000000');
        const hairGeo = new THREE.SphereGeometry(0.17, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const hairMat = new THREE.MeshStandardMaterial({ 
          color: hairColor,
          roughness: 0.8,
          metalness: 0.0
        });
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.set(0, 1.68, 0);
        avatarGroup.add(hair);

        // Torso
        const torsoGeo = new THREE.BoxGeometry(0.4, 0.6, 0.25, 8, 8, 8);
        const clothingColor = new THREE.Color(avatarData.clothing?.color_primary || '#4169E1');
        const torsoMat = new THREE.MeshStandardMaterial({ 
          color: clothingColor,
          roughness: 0.7,
          metalness: 0.2
        });
        const torso = new THREE.Mesh(torsoGeo, torsoMat);
        torso.position.y = 1.1;
        torso.castShadow = true;
        avatarGroup.add(torso);

        // Arms
        const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 16);
        const armMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6 });
        
        const leftArm = new THREE.Mesh(armGeo, armMat);
        leftArm.position.set(-0.25, 1.1, 0);
        leftArm.rotation.z = 0.2;
        leftArm.castShadow = true;
        avatarGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeo, armMat);
        rightArm.position.set(0.25, 1.1, 0);
        rightArm.rotation.z = -0.2;
        rightArm.castShadow = true;
        avatarGroup.add(rightArm);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.9, 16);
        const pantsColor = new THREE.Color(avatarData.clothing?.color_secondary || '#2C3E50');
        const legMat = new THREE.MeshStandardMaterial({ 
          color: pantsColor,
          roughness: 0.8,
          metalness: 0.1
        });
        
        const leftLeg = new THREE.Mesh(legGeo, legMat);
        leftLeg.position.set(-0.12, 0.45, 0);
        leftLeg.castShadow = true;
        avatarGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeo, legMat);
        rightLeg.position.set(0.12, 0.45, 0);
        rightLeg.castShadow = true;
        avatarGroup.add(rightLeg);

        // Accessories
        if (avatarData.accessories?.has_glasses) {
          const glassesGeo = new THREE.TorusGeometry(0.06, 0.01, 8, 16);
          const glassesMat = new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            metalness: 0.8,
            roughness: 0.2
          });
          const leftGlass = new THREE.Mesh(glassesGeo, glassesMat);
          leftGlass.position.set(-0.05, 1.62, 0.13);
          leftGlass.rotation.y = Math.PI / 2;
          avatarGroup.add(leftGlass);
          
          const rightGlass = new THREE.Mesh(glassesGeo, glassesMat);
          rightGlass.position.set(0.05, 1.62, 0.13);
          rightGlass.rotation.y = Math.PI / 2;
          avatarGroup.add(rightGlass);
        }

        // Ground shadow
        const shadowGeo = new THREE.CircleGeometry(0.5, 32);
        const shadowMat = new THREE.MeshBasicMaterial({ 
          color: 0x000000, 
          transparent: true, 
          opacity: 0.3 
        });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.01;
        avatarGroup.add(shadow);

        sceneRef.current.add(avatarGroup);
        avatarRef.current = avatarGroup;

        // Count triangles
        let triangles = 0;
        avatarGroup.traverse((object) => {
          if (object.geometry) {
            if (object.geometry.index) {
              triangles += object.geometry.index.count / 3;
            } else {
              triangles += object.geometry.attributes.position.count / 3;
            }
          }
        });

        if (mounted) {
          setTriangleCount(Math.round(triangles));
          setIsLoading(false);
          console.log('✅ Avatar loaded:', avatarData.avatar_name);
          
          mlDataCollector.record('avatar_loaded', {
            feature: '3d_renderer',
            avatarName: avatarData.avatar_name,
            triangles: Math.round(triangles),
            timestamp: Date.now()
          });
        }

      } catch (error) {
        console.error(`❌ Avatar load error (attempt ${retries + 1}/${maxRetries}):`, error.message);
        
        mlDataCollector.record('avatar_load_error', {
          feature: '3d_renderer',
          error: error.message,
          attempt: retries + 1,
          timestamp: Date.now()
        });
        
        if (retries < maxRetries - 1) {
          retries++;
          setRetryCount(retries);
          
          const retryDelay = Math.min(1000 * Math.pow(2, retries), 5000);
          setTimeout(() => {
            if (mounted) {
              loadAvatarWithRetry();
            }
          }, retryDelay);
        } else {
          if (mounted) {
            setLoadError('Failed to load avatar. Using fallback.');
            setIsLoading(false);
          }
        }
      }
    };

    loadAvatarWithRetry();

    return () => {
      mounted = false;
    };
  }, [avatarData, renderKey]);

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const animate = () => {
      if (isPlaying) {
        const delta = clockRef.current.getDelta();

        if (avatarRef.current) {
          avatarRef.current.rotation.y += delta * 0.5;
          
          const breathScale = 1 + Math.sin(Date.now() * 0.001) * 0.02;
          avatarRef.current.scale.y = breathScale;
        }

        rendererRef.current.render(sceneRef.current, cameraRef.current);
        frameCountRef.current++;
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isPlaying]);

  // Handle orientation and resize
  useEffect(() => {
    const handleOrientationChange = () => {
      console.log('📱 Orientation changed - re-rendering avatar');
      setRenderKey(prev => prev + 1);

      setTimeout(() => {
        if (rendererRef.current && cameraRef.current && containerRef.current) {
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          
          rendererRef.current.setSize(width, height);
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
        }
      }, 300);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Handle quality change
  useEffect(() => {
    if (!rendererRef.current) return;
    const quality = renderQuality[0];
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio * quality, 2));
  }, [renderQuality]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    mlDataCollector.record('renderer_play_pause', {
      feature: '3d_renderer',
      action: !isPlaying ? 'play' : 'pause',
      timestamp: Date.now()
    });
  };

  const handleReset = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 1.6, 3);
      cameraRef.current.lookAt(0, 1.2, 0);
    }
    if (avatarRef.current) {
      avatarRef.current.rotation.set(0, 0, 0);
    }
    mlDataCollector.record('renderer_reset', {
      feature: '3d_renderer',
      timestamp: Date.now()
    });
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    }
    mlDataCollector.record('renderer_fullscreen', {
      feature: '3d_renderer',
      timestamp: Date.now()
    });
  };

  const mlBoost = mlImprovements?.accuracy 
    ? Math.round(mlImprovements.accuracy * 100) 
    : 30;

  return (
    <Card className="bg-slate-950/95 border-cyan-500/30 h-full z-cards">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="text-white flex items-center justify-between flex-wrap gap-2 text-sm sm:text-base">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-pulse shrink-0" />
            <span className="break-words truncate">Live Avatar</span>
          </div>
          {loadError && (
            <Badge className="bg-orange-500 flex items-center gap-1 text-xs shrink-0">
              <AlertTriangle className="w-3 h-3" />
              Offline
            </Badge>
          )}
          {isLoading && (
            <Badge className="bg-blue-500 animate-pulse text-xs shrink-0">
              {retryCount > 0 ? `Retry ${retryCount}/3` : 'Loading'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 pt-0">
        <style>{`
          .avatar-container {
            width: 100% !important;
            height: 400px !important;
            position: relative !important;
          }
          @media (orientation: landscape) and (max-width: 1024px) {
            .avatar-container {
              height: 60vh !important;
              min-height: 350px !important;
            }
          }
          @media (orientation: portrait) {
            .avatar-container {
              height: 400px !important;
              min-height: 400px !important;
            }
          }
        `}</style>

        <div 
          ref={containerRef}
          className="avatar-container w-full relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden"
        >
          {loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-[20]">
              <div className="text-center p-4 sm:p-6">
                <WifiOff className="w-10 h-10 sm:w-12 sm:h-12 text-orange-400 mx-auto mb-3 animate-pulse" />
                <p className="text-white font-semibold mb-2 text-sm sm:text-base break-words">Offline Mode</p>
                <p className="text-xs sm:text-sm text-slate-300 mb-4 break-words">{loadError}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-orange-600 hover:bg-orange-700 text-sm z-[9999]"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 bg-cyan-500/10 border border-cyan-500/30 rounded text-center">
            <div className="text-cyan-400 text-xs sm:text-sm mb-1">FPS</div>
            <div className="text-white font-bold text-sm sm:text-lg">{fps}</div>
          </div>
          <div className="p-2 sm:p-3 bg-green-500/10 border border-green-500/30 rounded text-center">
            <div className="text-green-400 text-xs sm:text-sm mb-1">Tris</div>
            <div className="text-white font-bold text-sm sm:text-lg">{triangleCount > 999 ? `${(triangleCount/1000).toFixed(1)}k` : triangleCount}</div>
          </div>
          <div className="p-2 sm:p-3 bg-purple-500/10 border border-purple-500/30 rounded text-center">
            <div className="text-purple-400 text-xs sm:text-sm mb-1 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" />
              ML
            </div>
            <div className="text-white font-bold text-sm sm:text-lg">{mlBoost}%</div>
          </div>
        </div>

        <div className="space-y-3 relative z-[9999]">
          <div className="flex gap-2">
            <Button
              onClick={handlePlayPause}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-sm sm:text-base py-2 sm:py-3"
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              onClick={handleReset}
              className="bg-slate-700 hover:bg-slate-600 px-3 sm:px-4"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleFullscreen}
              className="bg-slate-700 hover:bg-slate-600 px-3 sm:px-4"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs sm:text-sm text-slate-300">Render Quality</span>
              <Badge className="text-xs">{Math.round(renderQuality[0] * 100)}%</Badge>
            </div>
            <Slider
              value={renderQuality}
              onValueChange={setRenderQuality}
              min={0.5}
              max={2}
              step={0.1}
            />
          </div>
        </div>

        {avatarData && (
          <div className="p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20">
            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="text-cyan-300 font-semibold truncate ml-2">{avatarData.avatar_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Quality:</span>
                <span className="text-green-300">{((avatarData.quality_score || 0.9) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Realism:</span>
                <span className="text-purple-300">{((avatarData.realism_score || 0.95) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}