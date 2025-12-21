
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Genre3DIcon({ genre, size = 60 }) {
  const mountRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    
    if (currentMount) {
      currentMount.appendChild(renderer.domElement);
    }

    // Premium Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const keyLight = new THREE.DirectionalLight(0xffffff, 1);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);
    
    const fillLight = new THREE.PointLight(0x4444ff, 0.5);
    fillLight.position.set(-5, 0, 3);
    scene.add(fillLight);
    
    const rimLight = new THREE.PointLight(0xff44ff, 0.5);
    rimLight.position.set(0, -5, -3);
    scene.add(rimLight);

    let group = new THREE.Group();
    const genreLower = genre.toLowerCase();

    // POP - Crystal Diamond
    if (genreLower.includes('pop')) {
      const geometry = new THREE.OctahedronGeometry(1.2, 0);
      const material = new THREE.MeshPhysicalMaterial({ 
        color: 0xff1493,
        metalness: 0,
        roughness: 0,
        transmission: 0.9,
        thickness: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0
      });
      const diamond = new THREE.Mesh(geometry, material);
      group.add(diamond);
      
      // Outer glow rings
      for (let i = 0; i < 3; i++) {
        const ringGeo = new THREE.TorusGeometry(1.5 + i * 0.3, 0.05, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ 
          color: 0xff69b4,
          transparent: true,
          opacity: 0.4 - i * 0.1
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
      }
    }
    
    // HIP-HOP - Gold Chain Link
    else if (genreLower.includes('hip') || genreLower.includes('rap')) {
      const chainMat = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        metalness: 1,
        roughness: 0.2,
        emissive: 0xffaa00,
        emissiveIntensity: 0.3
      });
      
      // Chain links
      for (let i = 0; i < 3; i++) {
        const linkGeo = new THREE.TorusGeometry(0.5, 0.15, 16, 32);
        const link = new THREE.Mesh(linkGeo, chainMat);
        link.position.y = i * 0.8 - 0.8;
        link.rotation.x = i % 2 === 0 ? 0 : Math.PI / 2;
        group.add(link);
      }
      
      // Diamond pendant
      const pendantGeo = new THREE.OctahedronGeometry(0.4, 0);
      const pendantMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x00ffff,
        metalness: 1,
        roughness: 0,
        clearcoat: 1,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5
      });
      const pendant = new THREE.Mesh(pendantGeo, pendantMat);
      pendant.position.y = -1.8;
      group.add(pendant);
    }
    
    // R&B - Liquid Heart
    else if (genreLower.includes('r&b') || genreLower.includes('rnb')) {
      const heartShape = new THREE.Shape();
      heartShape.moveTo(0, 0);
      heartShape.bezierCurveTo(0, -0.4, -0.8, -0.4, -0.8, 0.1);
      heartShape.bezierCurveTo(-0.8, 0.6, 0, 1.2, 0, 1.6);
      heartShape.bezierCurveTo(0, 1.2, 0.8, 0.6, 0.8, 0.1);
      heartShape.bezierCurveTo(0.8, -0.4, 0, -0.4, 0, 0);
      
      const extrudeSettings = { 
        depth: 0.5, 
        bevelEnabled: true, 
        bevelThickness: 0.2, 
        bevelSize: 0.2,
        bevelSegments: 10
      };
      
      const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
      const material = new THREE.MeshPhysicalMaterial({ 
        color: 0x8b5cf6,
        metalness: 0.2,
        roughness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0,
        transmission: 0.3,
        emissive: 0x8b5cf6,
        emissiveIntensity: 0.4
      });
      
      const heart = new THREE.Mesh(geometry, material);
      heart.rotation.z = Math.PI;
      heart.position.y = -0.7;
      group.add(heart);
      
      // Pulsing glow
      const glowGeo = new THREE.SphereGeometry(1.2, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({ 
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.15
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      group.add(glow);
    }
    
    // COUNTRY - Acoustic Guitar Body
    else if (genreLower.includes('country')) {
      // Guitar body
      const bodyGeo = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.5);
      const bodyMat = new THREE.MeshStandardMaterial({ 
        color: 0xd97706,
        metalness: 0.1,
        roughness: 0.4,
        map: null
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.x = -Math.PI / 2;
      group.add(body);
      
      // Sound hole with decorative ring
      const holeGeo = new THREE.CircleGeometry(0.35, 32);
      const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.position.z = 0.1;
      group.add(hole);
      
      const ringGeo = new THREE.TorusGeometry(0.4, 0.03, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({ 
        color: 0xfbbf24,
        metalness: 1,
        roughness: 0.2
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = 0.12;
      group.add(ring);
      
      // Strings
      for (let i = 0; i < 6; i++) {
        const stringGeo = new THREE.CylinderGeometry(0.01, 0.01, 2, 8);
        const stringMat = new THREE.MeshStandardMaterial({ 
          color: 0xe5e7eb,
          metalness: 1,
          roughness: 0.3
        });
        const string = new THREE.Mesh(stringGeo, stringMat);
        string.position.set(-0.15 + i * 0.06, 0.5, 0.15);
        group.add(string);
      }
    }
    
    // LATIN/REGGAETON - Tropical Sun Burst
    else if (genreLower.includes('latin') || genreLower.includes('reggaeton')) {
      // Core sun
      const coreGeo = new THREE.IcosahedronGeometry(0.7, 1);
      const coreMat = new THREE.MeshStandardMaterial({ 
        color: 0xfbbf24,
        emissive: 0xff8800,
        emissiveIntensity: 1,
        metalness: 0.5,
        roughness: 0.2
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      group.add(core);
      
      // Sun rays
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const rayGeo = new THREE.ConeGeometry(0.15, 1, 4);
        const gradient = i % 2 === 0 ? 0xfbbf24 : 0xff6b00;
        const rayMat = new THREE.MeshStandardMaterial({ 
          color: gradient,
          emissive: gradient,
          emissiveIntensity: 0.7,
          metalness: 0.6,
          roughness: 0.3
        });
        const ray = new THREE.Mesh(rayGeo, rayMat);
        ray.position.x = Math.cos(angle) * 1.2;
        ray.position.y = Math.sin(angle) * 1.2;
        ray.rotation.z = angle - Math.PI / 2;
        group.add(ray);
      }
      
      // Inner glow sphere
      const innerGeo = new THREE.SphereGeometry(0.5, 32, 32);
      const innerMat = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 0.6
      });
      const inner = new THREE.Mesh(innerGeo, innerMat);
      group.add(inner);
    }
    
    // REGGAE - Complex Rasta Lion Head with Dreads
    else if (genreLower.includes('reggae')) {
      // Lion head (golden sphere)
      const headGeo = new THREE.SphereGeometry(0.6, 32, 32);
      const headMat = new THREE.MeshStandardMaterial({ 
        color: 0xfbbf24,
        metalness: 0.3,
        roughness: 0.6
      });
      const head = new THREE.Mesh(headGeo, headMat);
      group.add(head);
      
      // Mane - Rasta colored dreads in circle
      const dreadColors = [0x10b981, 0xfbbf24, 0xef4444]; // Green, Yellow, Red
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const colorIndex = i % 3;
        
        // Dread strand
        const dreadGeo = new THREE.CylinderGeometry(0.08, 0.04, 1.2, 8);
        const dreadMat = new THREE.MeshStandardMaterial({ 
          color: dreadColors[colorIndex],
          emissive: dreadColors[colorIndex],
          emissiveIntensity: 0.4,
          metalness: 0.2,
          roughness: 0.7
        });
        const dread = new THREE.Mesh(dreadGeo, dreadMat);
        
        const radius = 0.7;
        dread.position.x = Math.cos(angle) * radius;
        dread.position.z = Math.sin(angle) * radius;
        dread.position.y = -0.3;
        
        // Rotate dreads outward
        dread.rotation.z = angle;
        dread.rotation.x = Math.PI / 6;
        
        group.add(dread);
      }
      
      // Eyes
      const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const eyeMat = new THREE.MeshStandardMaterial({ 
        color: 0xef4444,
        emissive: 0xef4444,
        emissiveIntensity: 0.8
      });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.2, 0.15, 0.55);
      group.add(leftEye);
      
      const rightEye = leftEye.clone();
      rightEye.position.x = 0.2;
      group.add(rightEye);
      
      // Nose (black)
      const noseGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const noseMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
      const nose = new THREE.Mesh(noseGeo, noseMat);
      nose.position.set(0, 0, 0.6);
      group.add(nose);
      
      // Crown (rasta colors stacked)
      const crownLayers = [
        { color: 0xef4444, y: 0.9, size: 0.4 },   // Red top
        { color: 0xfbbf24, y: 0.75, size: 0.45 }, // Yellow middle
        { color: 0x10b981, y: 0.6, size: 0.5 }    // Green bottom
      ];
      
      crownLayers.forEach(layer => {
        const crownGeo = new THREE.CylinderGeometry(layer.size, layer.size, 0.1, 8);
        const crownMat = new THREE.MeshStandardMaterial({ 
          color: layer.color,
          emissive: layer.color,
          emissiveIntensity: 0.5,
          metalness: 0.6,
          roughness: 0.3
        });
        const crown = new THREE.Mesh(crownGeo, crownMat);
        crown.position.y = layer.y;
        group.add(crown);
      });
      
      // Peace sign glow behind
      const glowGeo = new THREE.RingGeometry(0.8, 1.2, 32);
      const glowMat = new THREE.MeshBasicMaterial({ 
        color: 0x10b981,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.z = -0.5;
      group.add(glow);
    }
    
    // BLUES - Electric Guitar Headstock
    else if (genreLower.includes('blues')) {
      // Headstock
      const headGeo = new THREE.BoxGeometry(0.4, 1.5, 0.2);
      const headMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e3a8a,
        metalness: 0.8,
        roughness: 0.3
      });
      const head = new THREE.Mesh(headGeo, headMat);
      group.add(head);
      
      // Tuning pegs
      for (let i = 0; i < 6; i++) {
        const pegGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16);
        const pegMat = new THREE.MeshStandardMaterial({ 
          color: 0xffd700,
          metalness: 1,
          roughness: 0.2
        });
        const peg = new THREE.Mesh(pegGeo, pegMat);
        peg.rotation.z = Math.PI / 2;
        peg.position.set(
          i % 2 === 0 ? 0.35 : -0.35,
          0.6 - (Math.floor(i / 2) * 0.4),
          0
        );
        group.add(peg);
      }
      
      // Lightning bolt overlay
      const boltShape = new THREE.Shape();
      boltShape.moveTo(0, 0.8);
      boltShape.lineTo(0.2, 0.2);
      boltShape.lineTo(0.1, 0.2);
      boltShape.lineTo(0.25, -0.8);
      boltShape.lineTo(-0.1, 0);
      boltShape.lineTo(0, 0);
      boltShape.closePath();
      
      const boltGeo = new THREE.ExtrudeGeometry(boltShape, { depth: 0.1, bevelEnabled: false });
      const boltMat = new THREE.MeshStandardMaterial({ 
        color: 0x60a5fa,
        emissive: 0x3b82f6,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.9
      });
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      bolt.position.z = 0.15;
      group.add(bolt);
    }
    
    // JAZZ - Saxophone
    else if (genreLower.includes('jazz')) {
      // Saxophone body curve
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, -0.5, 0),
        new THREE.Vector3(0.3, 0, 0),
        new THREE.Vector3(0.5, 0.5, 0),
        new THREE.Vector3(0.4, 1, 0)
      ]);
      
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.2, 16, false);
      const tubeMat = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        metalness: 1,
        roughness: 0.2,
        emissive: 0xffaa00,
        emissiveIntensity: 0.2
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      group.add(tube);
      
      // Bell
      const bellGeo = new THREE.ConeGeometry(0.5, 0.6, 32, 1, true);
      const bell = new THREE.Mesh(bellGeo, tubeMat);
      bell.position.set(0.4, 1.2, 0);
      bell.rotation.z = -Math.PI / 4;
      group.add(bell);
      
      // Keys
      for (let i = 0; i < 6; i++) {
        const keyGeo = new THREE.SphereGeometry(0.08, 16, 16);
        const keyMat = new THREE.MeshStandardMaterial({ 
          color: 0xffffff,
          metalness: 0.9,
          roughness: 0.1
        });
        const key = new THREE.Mesh(keyGeo, keyMat);
        key.position.set(0.25 + Math.sin(i) * 0.1, -0.6 + i * 0.2, 0.22);
        group.add(key);
      }
    }
    
    // K-POP - Holographic Star
    else if (genreLower.includes('k-pop') || genreLower.includes('kpop')) {
      const starShape = new THREE.Shape();
      const outerR = 1.3;
      const innerR = 0.5;
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const radius = i % 2 === 0 ? outerR : innerR;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) starShape.moveTo(x, y);
        else starShape.lineTo(x, y);
      }
      starShape.closePath();
      
      const starGeo = new THREE.ExtrudeGeometry(starShape, { 
        depth: 0.3, 
        bevelEnabled: true, 
        bevelThickness: 0.1, 
        bevelSize: 0.1 
      });
      
      const starMat = new THREE.MeshPhysicalMaterial({ 
        color: 0xff1493,
        metalness: 1,
        roughness: 0,
        clearcoat: 1,
        transmission: 0.5,
        emissive: 0xff69b4,
        emissiveIntensity: 0.5
      });
      
      const star = new THREE.Mesh(starGeo, starMat);
      group.add(star);
      
      // Holographic rings
      for (let i = 0; i < 4; i++) {
        const ringGeo = new THREE.TorusGeometry(1.6 + i * 0.2, 0.02, 8, 64);
        const ringMat = new THREE.MeshBasicMaterial({ 
          color: i % 2 === 0 ? 0x00ffff : 0xff00ff,
          transparent: true,
          opacity: 0.5 - i * 0.1
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = (i * Math.PI) / 8;
        group.add(ring);
      }
    }
    
    // J-CORE - Neon Hexagon
    else if (genreLower.includes('j-core') || genreLower.includes('jcore')) {
      const hexGeo = new THREE.CylinderGeometry(1, 1, 0.3, 6);
      const hexMat = new THREE.MeshStandardMaterial({ 
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 1,
        metalness: 1,
        roughness: 0
      });
      const hex = new THREE.Mesh(hexGeo, hexMat);
      group.add(hex);
      
      // Neon edges
      const edgeGeo = new THREE.EdgesGeometry(hexGeo);
      const edgeMat = new THREE.LineBasicMaterial({ 
        color: 0xff00ff,
        linewidth: 3
      });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);
      group.add(edges);
      
      // Pulsing core
      const coreGeo = new THREE.SphereGeometry(0.5, 32, 32);
      const coreMat = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      group.add(core);
      
      // Outer rings
      for (let i = 0; i < 3; i++) {
        const ringGeo = new THREE.TorusGeometry(1.3 + i * 0.3, 0.04, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ 
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.6 - i * 0.15
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = (i * Math.PI) / 6;
        group.add(ring);
      }
    }
    
    // CLASSICAL - Golden Trophy
    else if (genreLower.includes('classical')) {
      const cupGeo = new THREE.CylinderGeometry(0.7, 0.5, 1.2, 32);
      const cupMat = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        metalness: 1,
        roughness: 0.1,
        emissive: 0xffaa00,
        emissiveIntensity: 0.2
      });
      const cup = new THREE.Mesh(cupGeo, cupMat);
      cup.position.y = 0.3;
      group.add(cup);
      
      // Decorative rim
      const rimGeo = new THREE.TorusGeometry(0.7, 0.08, 16, 32);
      const rim = new THREE.Mesh(rimGeo, cupMat);
      rim.position.y = 0.9;
      group.add(rim);
      
      // Base
      const baseGeo = new THREE.CylinderGeometry(0.6, 0.7, 0.4, 32);
      const base = new THREE.Mesh(baseGeo, cupMat);
      base.position.y = -0.5;
      group.add(base);
      
      // Handles
      const handleGeo = new THREE.TorusGeometry(0.4, 0.08, 16, 32, Math.PI);
      const handle1 = new THREE.Mesh(handleGeo, cupMat);
      handle1.rotation.y = Math.PI / 2;
      handle1.position.set(0.7, 0.4, 0);
      group.add(handle1);
      
      const handle2 = handle1.clone();
      handle2.position.x = -0.7;
      handle2.rotation.y = -Math.PI / 2;
      group.add(handle2);
      
      // Crown on top
      const crownGeo = new THREE.ConeGeometry(0.3, 0.4, 8);
      const crown = new THREE.Mesh(crownGeo, cupMat);
      crown.position.y = 1.3;
      group.add(crown);
    }
    
    // AFROBEATS - Tribal Drum
    else if (genreLower.includes('afro')) {
      // Drum body
      const drumGeo = new THREE.CylinderGeometry(0.7, 0.8, 1.5, 32);
      const drumMat = new THREE.MeshStandardMaterial({ 
        color: 0x92400e,
        metalness: 0.1,
        roughness: 0.8
      });
      const drum = new THREE.Mesh(drumGeo, drumMat);
      group.add(drum);
      
      // Drum heads
      const headGeo = new THREE.CircleGeometry(0.7, 32);
      const headMat = new THREE.MeshStandardMaterial({ 
        color: 0xfbbf24,
        metalness: 0,
        roughness: 0.9
      });
      const topHead = new THREE.Mesh(headGeo, headMat);
      topHead.rotation.x = -Math.PI / 2;
      topHead.position.y = 0.75;
      group.add(topHead);
      
      const bottomHead = topHead.clone();
      bottomHead.position.y = -0.75;
      bottomHead.rotation.x = Math.PI / 2;
      group.add(bottomHead);
      
      // Decorative pattern
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const patternGeo = new THREE.BoxGeometry(0.1, 1.5, 0.1);
        const patternMat = new THREE.MeshStandardMaterial({ 
          color: i % 2 === 0 ? 0xef4444 : 0xfbbf24,
          emissive: i % 2 === 0 ? 0xef4444 : 0xfbbf24,
          emissiveIntensity: 0.3
        });
        const pattern = new THREE.Mesh(patternGeo, patternMat);
        pattern.position.x = Math.cos(angle) * 0.85;
        pattern.position.z = Math.sin(angle) * 0.85;
        group.add(pattern);
      }
      
      // Flame effect on top
      const flameGeo = new THREE.ConeGeometry(0.3, 0.6, 8);
      const flameMat = new THREE.MeshStandardMaterial({ 
        color: 0xff6b00,
        emissive: 0xff4400,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.8
      });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.y = 1.3;
      group.add(flame);
    }
    
    else {
      const geometry = new THREE.IcosahedronGeometry(1, 1);
      const material = new THREE.MeshPhysicalMaterial({ 
        color: 0xa855f7,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1,
        emissive: 0xa855f7,
        emissiveIntensity: 0.3
      });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
    }

    scene.add(group);

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      
      group.rotation.y += 0.015;
      group.rotation.x = Math.sin(time * 0.5) * 0.1;
      group.position.y = Math.sin(time * 0.8) * 0.1;
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [genre, size]);

  return <div ref={mountRef} style={{ width: size, height: size, display: 'inline-block' }} />;
}
