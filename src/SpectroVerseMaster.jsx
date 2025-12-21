// SpectroVerse_Base44_Compatible.jsx
// Base44-compatible SpectroVerse core (React + plain JS + three.js only).
// FIXED: No top-level await - using lazy loading pattern

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// FIXED: Lazy GLTFLoader - loads on first use, not at module load time
let GLTFLoader = null;
let loaderPromise = null;

// Initialize loader lazily when first needed
const getGLTFLoader = () => {
  if (GLTFLoader) {
    return Promise.resolve(GLTFLoader);
  }
  
  if (loaderPromise) {
    return loaderPromise;
  }
  
  loaderPromise = import("three/addons/loaders/GLTFLoader.js")
    .then(module => {
      GLTFLoader = module.GLTFLoader;
      console.log('✅ GLTFLoader loaded successfully');
      return GLTFLoader;
    })
    .catch(e1 => {
      console.warn('GLTFLoader not available from addons, trying examples path');
      return import("three/examples/jsm/loaders/GLTFLoader.js")
        .then(module => {
          GLTFLoader = module.GLTFLoader;
          console.log('✅ GLTFLoader loaded from examples path');
          return GLTFLoader;
        })
        .catch(e2 => {
          console.error('GLTFLoader not available:', e2);
          // Provide fallback mock loader
          GLTFLoader = class MockGLTFLoader {
            load(url, onLoad, onProgress, onError) {
              console.warn('⚠️ GLTF loading not available - using mock data');
              
              setTimeout(() => {
                const mockScene = new THREE.Group();
                mockScene.name = 'Mock Avatar';
                
                const geometry = new THREE.BoxGeometry(1, 2, 0.5);
                const material = new THREE.MeshStandardMaterial({ color: 0x8844ff });
                const mesh = new THREE.Mesh(geometry, material);
                mockScene.add(mesh);
                
                onLoad({
                  scene: mockScene,
                  scenes: [mockScene],
                  animations: [],
                  cameras: [],
                  asset: {}
                });
              }, 100);
            }
          };
          console.log('✅ Using fallback GLTF loader (mock data)');
          return GLTFLoader;
        });
    });
  
  return loaderPromise;
};

/* ===========================
   Config — change these if needed
   =========================== */
const DATA_CANDY_INDEX_URL = "/data/index.json";
const INDEX_CACHE_TTL_MS = 1000 * 60 * 5;
const MANIFEST_CACHE_TTL_MS = 1000 * 60 * 10;

/* ===========================
   Helpers
   =========================== */
const nowMS = () => Date.now();
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const short = (s, n = 150) => (s && s.length > n ? s.slice(0, n) + "…" : s);

/* ===========================
   Hook: useAvatarManifests (manifest-first, selective invalidation)
   =========================== */
export function useAvatarManifests({ listIndexUrl = DATA_CANDY_INDEX_URL, events = null } = {}) {
  const [indexList, setIndexList] = useState([]);
  const indexCacheKey = "spectro_index_cache_v1";
  const manifestCachePrefix = "spectro_manifest_v1:";

  const readIndexCache = () => {
    try {
      const raw = localStorage.getItem(indexCacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed._ts && nowMS() - parsed._ts < INDEX_CACHE_TTL_MS) return parsed.data;
    } catch (e) {}
    return null;
  };
  
  const writeIndexCache = (data) => {
    try {
      localStorage.setItem(indexCacheKey, JSON.stringify({ _ts: nowMS(), data }));
    } catch (e) {}
  };

  const refreshIndex = async (force = false) => {
    try {
      const cached = readIndexCache();
      if (cached && !force) {
        setIndexList(cached);
        return;
      }
      const r = await fetch(listIndexUrl, { cache: "no-cache" });
      if (!r.ok) throw new Error("Index fetch failed: " + r.status);
      const data = await r.json();
      setIndexList(data || []);
      writeIndexCache(data || []);
    } catch (err) {
      console.warn("refreshIndex error", err);
      const cached = readIndexCache();
      if (cached) setIndexList(cached);
    }
  };

  useEffect(() => {
    refreshIndex();
  }, [listIndexUrl]);

  const fetchManifest = async (manifestUrl, force = false) => {
    const key = manifestCachePrefix + manifestUrl;
    try {
      if (!force) {
        const raw = sessionStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed._ts && nowMS() - parsed._ts < MANIFEST_CACHE_TTL_MS) return parsed.data;
        }
      }
    } catch (e) {}
    const r = await fetch(manifestUrl, { cache: "no-cache" });
    if (!r.ok) throw new Error("Manifest fetch failed: " + r.status);
    const m = await r.json();
    try {
      sessionStorage.setItem(key, JSON.stringify({ _ts: nowMS(), data: m }));
    } catch (e) {}
    return m;
  };

  useEffect(() => {
    if (!events || !events.on) return;
    let timer = null;
    const handler = (payload) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          if (payload && payload.manifestUrl) {
            sessionStorage.removeItem(manifestCachePrefix + payload.manifestUrl);
          }
          if (payload && payload.id) {
            try {
              const rawIndex = localStorage.getItem(indexCacheKey);
              if (rawIndex) {
                const parsed = JSON.parse(rawIndex);
                if (parsed && parsed.data) {
                  const newIndex = parsed.data.filter((it) => it.id !== payload.id);
                  localStorage.setItem(indexCacheKey, JSON.stringify({ _ts: nowMS(), data: newIndex }));
                }
              }
            } catch (e) {}
          }
        } catch (e) {}
        refreshIndex(true);
      }, 400);
    };

    try {
      events.on("avatar.created", handler);
      events.on("avatar.updated", handler);
      events.on("avatar.deleted", handler);
    } catch (e) {}
    
    return () => {
      try {
        events.off("avatar.created", handler);
        events.off("avatar.updated", handler);
        events.off("avatar.deleted", handler);
      } catch (e) {}
      if (timer) clearTimeout(timer);
    };
  }, [events]);

  return { indexList, refreshIndex, fetchManifest };
}

/* ===========================
   three.js loader helper (LAZY LOADING - NO TOP-LEVEL AWAIT)
   =========================== */
async function threeLoadGLTF(url, { container } = {}) {
  // Wait for GLTFLoader to be available
  const LoaderClass = await getGLTFLoader();
  
  return new Promise((resolve, reject) => {
    try {
      const manager = new THREE.LoadingManager();
      const loader = new LoaderClass(manager);
      
      loader.load(
        url,
        (gltf) => {
          if (container) {
            let ctx = container.__spectro_ctx;
            if (!ctx) {
              ctx = {};
              const rect = container.getBoundingClientRect();
              ctx.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
              ctx.renderer.setSize(Math.max(300, rect.width), Math.max(300, rect.height));
              container.innerHTML = "";
              container.appendChild(ctx.renderer.domElement);
              ctx.scene = new THREE.Scene();
              ctx.camera = new THREE.PerspectiveCamera(50, rect.width / rect.height, 0.1, 1000);
              ctx.camera.position.set(0, 1.4, 2.2);
              const light = new THREE.DirectionalLight(0xffffff, 1.0);
              light.position.set(0.3, 1, 0.8);
              ctx.scene.add(light);
              ctx.clock = new THREE.Clock();
              container.__spectro_ctx = ctx;
              const animate = () => {
                try {
                  if (ctx.mixer) ctx.mixer.update(ctx.clock.getDelta());
                  ctx.renderer.render(ctx.scene, ctx.camera);
                } catch (err) {}
                ctx.raf = requestAnimationFrame(animate);
              };
              animate();
            }
            
            if (ctx.currentModel) {
              ctx.scene.remove(ctx.currentModel);
              if (ctx.currentModel.traverse) {
                ctx.currentModel.traverse((o) => {
                  if (o.geometry) o.geometry.dispose();
                  if (o.material) {
                    if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose && m.dispose());
                    else o.material.dispose && o.material.dispose();
                  }
                });
              }
            }
            const model = gltf.scene || gltf.scenes[0];
            ctx.scene.add(model);
            ctx.currentModel = model;
          }
          resolve(gltf);
        },
        undefined,
        (err) => reject(err)
      );
    } catch (err) {
      reject(err);
    }
  });
}

/* ===========================
   Perf scoring (PCM)
   =========================== */
export function computePerfScoreFromVariant(variant) {
  const triangles = Number(variant.triangles || 0);
  const textureKB = (Number(variant.textureBytes || variant.size || 0) || 0) / 1024.0;
  const drawCalls = Number(variant.drawCalls || 1);

  const triNorm = clamp01(1 - triangles / 60000);
  const texNorm = clamp01(1 - textureKB / 3000);
  const callNorm = clamp01(1 - drawCalls / 20);

  const w = { tri: 0.5, tex: 0.3, calls: 0.2 };
  const perfScore = triNorm * w.tri + texNorm * w.tex + callNorm * w.calls;
  return clamp01(perfScore);
}

/* ===========================
   Heuristic scorer
   =========================== */
function defaultHeuristicScore(manifest) {
  const sym = clamp01(Number(manifest.metrics?.symmetry ?? 0.6));
  const prop = clamp01(Number(manifest.metrics?.proportions ?? 0.6));
  const texCoh = clamp01(Number(manifest.metrics?.textureCoherence ?? 0.6));
  const expr = clamp01(Number(manifest.metrics?.expressionNaturalness ?? 0.6));

  const qqm = clamp01(0.30 * sym + 0.30 * prop + 0.25 * texCoh + 0.15 * expr);

  const variantKeys = Object.keys(manifest.variants || {});
  let chosen = variantKeys.length ? (manifest.recommended?.desktop || variantKeys[0]) : null;
  if (!chosen && variantKeys.length) chosen = variantKeys[0];
  const variant = manifest.variants?.[chosen] || {};
  const perf = computePerfScoreFromVariant(variant);

  const combined = clamp01(0.6 * qqm + 0.4 * perf);
  return { qqm, perf, combined };
}

/* ===========================
   Calibrator
   =========================== */
async function calibrateWeights(manifestsWithLabels) {
  if (!manifestsWithLabels || manifestsWithLabels.length < 6) return { wAppearance: 0.6 };
  const candidates = [];
  for (let w = 0; w <= 10; w++) {
    const wa = w / 10.0;
    let sse = 0;
    for (const item of manifestsWithLabels) {
      const m = item.manifest;
      const label = clamp01(Number(item.label));
      const { qqm, perf } = defaultHeuristicScore(m);
      const pred = clamp01(wa * qqm + (1 - wa) * perf);
      const e = pred - label;
      sse += e * e;
    }
    candidates.push({ wa, sse });
  }
  candidates.sort((a, b) => a.sse - b.sse);
  return { wAppearance: candidates[0].wa, bestCandidates: candidates.slice(0, 3) };
}

/* ===========================
   Gate: decide publish
   =========================== */
export async function generateMLAvatarGate({
  candidateManifest,
  humanSampleFn = null,
  labelCalibrations = null,
  publishThreshold = 0.72
} = {}) {
  try {
    let { qqm, perf, combined } = defaultHeuristicScore(candidateManifest);
    let calibrated = { wAppearance: 0.6 };
    if (labelCalibrations && labelCalibrations.length >= 6) {
      try {
        calibrated = await calibrateWeights(labelCalibrations);
        combined = clamp01(calibrated.wAppearance * qqm + (1 - calibrated.wAppearance) * perf);
      } catch (e) {
        console.warn("calibration failed", e);
      }
    }

    let humanScore = null;
    if (typeof humanSampleFn === "function") {
      try {
        const sample = await humanSampleFn(candidateManifest);
        if (typeof sample === "number") humanScore = clamp01(sample);
      } catch (e) {
        console.warn("humanSampleFn error", e);
      }
    }

    const raterScores = Array.isArray(candidateManifest.raterScores) ? candidateManifest.raterScores : [];
    let reliability = 0.8;
    if (raterScores.length >= 3) {
      const mean = raterScores.reduce((a, b) => a + b, 0) / raterScores.length;
      const varSum = raterScores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / raterScores.length;
      reliability = clamp01(1 - Math.min(varSum, 1));
    }

    const finalScore = clamp01(
      qqm * 0.30 + perf * 0.20 + combined * 0.30 + reliability * 0.20
    );

    const publish = finalScore >= publishThreshold && (humanScore === null || humanScore >= 0.6);
    const reason = publish ? "pass: finalScore OK" : "fail: below threshold or human sample low";

    return {
      publish,
      reason,
      scores: { qqm, perf, combined, calibrated, humanScore, reliability, finalScore }
    };
  } catch (err) {
    return { publish: false, reason: "gate error: " + String(err), scores: null };
  }
}

/* ===========================
   High-level React component for Base44
   =========================== */
export function SpectroVerseControl({ base44 = null, listIndexUrl = DATA_CANDY_INDEX_URL, renderCallback = null, humanSampleFn = null }) {
  const { indexList, refreshIndex, fetchManifest } = useAvatarManifests({ listIndexUrl, events: base44?.events ?? base44 });
  const [status, setStatus] = useState("idle");
  const [selected, setSelected] = useState(null);
  const [calibratorData, setCalibratorData] = useState([]);

  const manualRenderRef = useRef(null);

  useEffect(() => {
    if (!indexList || indexList.length === 0) refreshIndex();
  }, []);

  const loadAndRender = async (indexItem) => {
    try {
      setStatus("fetching manifest...");
      const manifest = await fetchManifest(indexItem.manifestUrl);
      setStatus("evaluating...");
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      const preferredKey = isMobile ? (manifest.recommended?.mobile || Object.keys(manifest.variants)[0]) : (manifest.recommended?.desktop || Object.keys(manifest.variants)[0]);
      const chosenVariantKey = preferredKey;
      const chosenVariant = manifest.variants?.[chosenVariantKey] || manifest.variants?.[Object.keys(manifest.variants)[0]];
      const perfScore = computePerfScoreFromVariant(chosenVariant);
      const { qqm, perf, combined } = defaultHeuristicScore(manifest);

      setSelected({ manifest, chosenVariantKey, chosenVariant, perfScore, qqm, combined });
      setStatus("loading asset...");

      if (typeof renderCallback === "function") {
        await renderCallback(chosenVariant.url, manifest, chosenVariantKey);
      } else {
        const container = manualRenderRef.current;
        await threeLoadGLTF(chosenVariant.url, { container });
      }
      setStatus("rendered");
    } catch (err) {
      console.error("loadAndRender err", err);
      setStatus("error: " + String(err));
    }
  };

  const runGate = async () => {
    if (!selected || !selected.manifest) {
      setStatus("no selection");
      return;
    }
    setStatus("running gate...");
    const res = await generateMLAvatarGate({ candidateManifest: selected.manifest, humanSampleFn, labelCalibrations: calibratorData, publishThreshold: 0.72 });
    setStatus("gate: " + res.reason + " final=" + (res.scores?.finalScore ?? "NA"));
    if (res.publish) {
      try {
        if (base44?.entities?.AvatarCustomization && typeof base44.entities.AvatarCustomization.create === "function") {
          await base44.entities.AvatarCustomization.create({ manifest: selected.manifest });
          setStatus("published via base44.entities.AvatarCustomization.create()");
        } else {
          setStatus("publish recommended - no base44 publish method present");
        }
      } catch (e) {
        console.warn("publish error", e);
        setStatus("publish attempt failed: " + String(e));
      }
    }
  };

  const labelSelected = (label01) => {
    if (!selected || !selected.manifest) return;
    setCalibratorData((s) => [...s, { manifest: selected.manifest, label: label01 }]);
    setStatus("label added");
  };

  return (
    <div className="p-3">
      <div className="mb-2 text-sm text-gray-300">SpectroVerse (Base44 Compatible) — index: {indexList.length} — status: {short(status, 120)}</div>
      <div className="flex gap-2 mb-3">
        <button className="px-3 py-1 bg-slate-700 rounded" onClick={() => refreshIndex(true)}>Refresh Index</button>
        <button className="px-3 py-1 bg-rose-600 rounded" onClick={() => { sessionStorage.clear(); localStorage.removeItem("spectro_index_cache_v1"); refreshIndex(true); }}>Clear Cache</button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {indexList.map((it) => (
          <div key={it.id} className="p-3 border rounded bg-neutral-900">
            <div className="font-medium">{it.id}</div>
            <div className="text-xs text-gray-400">{short(it.manifestUrl, 80)}</div>
            <div className="mt-2 flex gap-2">
              <button className="px-2 py-1 bg-sky-600 rounded" onClick={() => loadAndRender(it)}>Select</button>
              <button className="px-2 py-1 bg-gray-700 rounded" onClick={() => fetchManifest(it.manifestUrl, true).then((m)=>alert("refreshed: "+(m.id||"ok"))).catch(e=>alert("err "+e))}>Refetch</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        {selected && (
          <div className="p-3 border rounded bg-neutral-800">
            <div className="font-semibold">Selected: {selected.manifest.id} — {selected.chosenVariantKey}</div>
            <div className="text-sm text-gray-300 mt-1">Perf: {selected.perfScore.toFixed(3)} • QQM: {selected.qqm.toFixed(3)} • Combined: {selected.combined.toFixed(3)}</div>
            <div className="mt-2 flex gap-2">
              <button className="px-2 py-1 bg-emerald-600 rounded" onClick={() => runGate()}>Run Gate</button>
              <button className="px-2 py-1 bg-indigo-600 rounded" onClick={() => labelSelected(1)}>Label Good</button>
              <button className="px-2 py-1 bg-red-600 rounded" onClick={() => labelSelected(0)}>Label Bad</button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-xs text-gray-400">Render area:</div>
        <div ref={manualRenderRef} style={{ width: "100%", height: 360, border: "1px dashed rgba(255,255,255,0.06)", marginTop: 8 }} />
      </div>
    </div>
  );
}

/* ===========================
   Exports
   =========================== */
export const loadAvatars = async (indexUrl = DATA_CANDY_INDEX_URL) => {
  const r = await fetch(indexUrl);
  if (!r.ok) throw new Error("index fetch failed");
  return await r.json();
};

export const useAvatars = (opts) => useAvatarManifests(opts);
export const generateMLAvatar = async (opts) => generateMLAvatarGate(opts);

export default SpectroVerseControl;