import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { blockScriptInjection, validateCSP } from '@/components/shared/SecurityValidator';
import { useAntiSpyware } from '@/components/shared/AntiSpywareProtection';

export default function LyricVideo3D({ 
  audioFile, 
  lyricsText, 
  title = "Untitled",
  onLoadStart,
  onLoadComplete,
  onError 
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const particlesRef = useRef([]);
  const lyricsGroupRef = useRef(null);
  const animationIdRef = useRef(null);
  const blobUrlRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const hasCreatedSourceRef = useRef(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [error, setError] = useState(null);
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  
  const mlDataCollector = useMLDataCollector();
  const antiSpyware = useAntiSpyware();

  useEffect(() => {
    let mounted = true;

    const initVideo = async () => {
      if (!containerRef.current || !audioFile || !lyricsText) {
        mlDataCollector.record('video_init_missing_props', {
          feature: 'lyric_video_3d',
          timestamp: Date.now()
        });
        return;
      }

      try {
        if (!(audioFile instanceof File) && !(audioFile instanceof Blob)) {
          throw new Error('Invalid audio file');
        }

        if (audioFile.size === 0) {
          throw new Error('Audio file is empty');
        }

        blockScriptInjection();
        const cspResult = validateCSP();
        
        if (mounted) {
          setSecurityStatus({
            safe: cspResult.valid,
            threats: cspResult.violations?.length || 0
          });
        }

        if (onLoadStart) onLoadStart();

        const lyrics = lyricsText.split('\n').filter(l => l.trim());
        if (lyrics.length === 0) {
          throw new Error('No lyrics provided');
        }

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
        camera.position.z = 15;
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xff00ff, 2, 100);
        pointLight1.position.set(10, 10, 10);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x00ffff, 2, 100);
        pointLight2.position.set(-10, -10, 10);
        scene.add(pointLight2);

        const particleCount = 1000;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 100;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
          colors[i * 3] = Math.random();
          colors[i * 3 + 1] = Math.random();
          colors[i * 3 + 2] = Math.random();
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
          size: 0.5,
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);
        particlesRef.current.push(particles);

        // FIXED: Check if file is already WAV format from AudioConverter
        const isWAV = audioFile.type === 'audio/wav' || audioFile.type === 'audio/x-wav';

        const setupAudio = async () => {
          try {
            if (blobUrlRef.current) {
              URL.revokeObjectURL(blobUrlRef.current);
              blobUrlRef.current = null;
            }

            const audioUrl = URL.createObjectURL(audioFile);
            blobUrlRef.current = audioUrl;

            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.src = '';
              audioRef.current.load();
              audioRef.current = null;
            }

            const audio = new Audio();
            audio.crossOrigin = 'anonymous';
            audio.preload = 'auto';
            audioRef.current = audio;

            const handleAudioError = (e) => {
              let errorMsg = 'Audio format not supported. Please use MP3 or WAV format.';
              
              mlDataCollector.record('audio_load_error', {
                feature: 'lyric_video_3d',
                audioType: audioFile.type,
                audioSize: audioFile.size,
                timestamp: Date.now()
              });

              if (mounted) {
                setError(errorMsg);
                if (onError) onError(new Error(errorMsg));
              }
            };

            const setupAudioContext = () => {
              try {
                if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                  audioContextRef.current.close();
                  audioContextRef.current = null;
                  sourceRef.current = null;
                  hasCreatedSourceRef.current = false;
                }

                if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                  audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                  hasCreatedSourceRef.current = false;
                }

                if (!hasCreatedSourceRef.current && audioRef.current) {
                  const source = audioContextRef.current.createMediaElementSource(audioRef.current);
                  sourceRef.current = source;
                  hasCreatedSourceRef.current = true;
                  
                  const analyser = audioContextRef.current.createAnalyser();
                  analyser.fftSize = 256;
                  source.connect(analyser);
                  analyser.connect(audioContextRef.current.destination);
                  analyserRef.current = analyser;
                }

                const lyricsGroup = new THREE.Group();
                lyricsGroupRef.current = lyricsGroup;
                scene.add(lyricsGroup);

                const duration = audio.duration;
                const timePerLyric = duration / lyrics.length;

                lyrics.forEach((lyric, index) => {
                  const canvas = document.createElement('canvas');
                  const context = canvas.getContext('2d');
                  canvas.width = 1024;
                  canvas.height = 256;

                  context.fillStyle = '#FFFFFF';
                  context.font = 'bold 60px Arial';
                  context.textAlign = 'center';
                  context.textBaseline = 'middle';
                  context.fillText(lyric, canvas.width / 2, canvas.height / 2);

                  const texture = new THREE.CanvasTexture(canvas);
                  const material = new THREE.SpriteMaterial({ 
                    map: texture,
                    transparent: true,
                    opacity: 0
                  });
                  const sprite = new THREE.Sprite(material);
                  sprite.scale.set(20, 5, 1);
                  sprite.position.set(0, 0, 0);
                  sprite.userData = { 
                    lyricIndex: index, 
                    startTime: index * timePerLyric,
                    endTime: (index + 1) * timePerLyric,
                    lyricText: lyric
                  };
                  lyricsGroup.add(sprite);
                });

                setIsInitialized(true);
                if (onLoadComplete) onLoadComplete();
              } catch (error) {
                console.error('Audio context setup error:', error);
                throw error;
              }
            };

            audio.addEventListener('error', handleAudioError);
            audio.addEventListener('loadeddata', setupAudioContext, { once: true });

            audio.src = audioUrl;
            audio.load();

          } catch (error) {
            console.error('Audio setup error:', error);
            throw error;
          }
        };

        await setupAudio();

        const animate = (time) => {
          if (!mounted) return;
          
          animationIdRef.current = requestAnimationFrame(animate);

          particlesRef.current.forEach(particles => {
            particles.rotation.y += 0.001;
            particles.rotation.x += 0.0005;
          });

          if (cameraRef.current) {
            cameraRef.current.position.x = Math.sin(time * 0.0003) * 5;
            cameraRef.current.position.y = Math.cos(time * 0.0003) * 3;
            cameraRef.current.lookAt(0, 0, 0);
          }

          if (analyserRef.current && audioRef.current && !audioRef.current.paused) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);

            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const scale = 1 + (average / 255) * 0.5;

            particlesRef.current.forEach(particles => {
              particles.scale.setScalar(scale);
            });

            const currentTime = audioRef.current.currentTime;
            lyricsGroupRef.current?.children.forEach(sprite => {
              const { startTime, endTime, lyricIndex } = sprite.userData;
              
              if (currentTime >= startTime && currentTime <= endTime) {
                sprite.material.opacity = Math.min(1, sprite.material.opacity + 0.05);
                sprite.scale.set(20 * scale, 5 * scale, 1);
                
                if (lyricIndex !== currentLyricIndex) {
                  setCurrentLyricIndex(lyricIndex);
                }
              } else if (currentTime > endTime) {
                sprite.material.opacity = Math.max(0, sprite.material.opacity - 0.02);
              } else {
                sprite.material.opacity = Math.max(0, sprite.material.opacity - 0.05);
              }
            });
          }

          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
        };

        animate(0);

        const handleResize = () => {
          if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
          
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };

      } catch (error) {
        console.error('Video initialization error:', error);
        setError(error.message);
        if (onError) onError(error);
      }
    };

    initVideo();

    return () => {
      mounted = false;
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
        audioRef.current = null;
      }

      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      sourceRef.current = null;
      hasCreatedSourceRef.current = false;
      
      if (rendererRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {}
        rendererRef.current.dispose();
      }
      
      if (sceneRef.current) {
        sceneRef.current.traverse(object => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [audioFile, lyricsText]);

  const handlePlayPause = () => {
    if (!audioRef.current || !isInitialized) return;

    if (audioRef.current.paused) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        setError('Playback failed: ' + err.message);
      });
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900 to-black p-8">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-white text-xl font-bold mb-2">Video Generation Error</h3>
          <p className="text-red-300 mb-4 text-sm">{error}</p>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
            <p className="text-yellow-300 text-xs">
              💡 Make sure audio is MP3 or WAV format, less than 50MB.
            </p>
          </div>
          <button
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={containerRef} className="w-full h-full" />
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-white text-2xl font-bold mb-2">{title}</h2>
          <p className="text-purple-300 text-sm mb-4">
            AI-Enhanced 3D • Beat-Synced • Secure
          </p>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              disabled={!isInitialized}
              className={`px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full font-bold transition-all vibrant-nav-button ${!isInitialized ? 'opacity-50' : ''}`}
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            
            {securityStatus.safe && (
              <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full">
                <p className="text-green-300 text-xs font-semibold">🛡️ Secure</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {!isInitialized && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold">Initializing 3D Video...</p>
            <p className="text-purple-300 text-sm mt-2">AI Processing</p>
          </div>
        </div>
      )}
    </div>
  );
}