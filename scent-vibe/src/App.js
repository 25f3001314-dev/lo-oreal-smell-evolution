
import React, { useRef, useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import useAudioAnalyzer from './hooks/useAudioAnalyzer';
import PhysicsParticles from './PhysicsParticles';
import SmokeParticles from './SmokeParticles';

// WispySmoke Component
const WispySmoke = React.memo(({ params = {} }) => {
  const group = useRef();
  const { mouse } = useThree();
  const particles = useRef(new Float32Array(20000)).current;
  useEffect(() => {
    const cones = 10;
    const perCone = 2000;
    for (let c = 0; c < cones; c++) {
      const angle = (c / cones) * Math.PI * 2;
      const coneAxis = [Math.cos(angle), 1, Math.sin(angle)];
      for (let i = 0; i < perCone; i++) {
        const idx = (c * perCone + i) * 3;
        const r = Math.random() * 1.5 + 0.5;
        const h = Math.random() * 8;
        particles[idx + 0] = coneAxis[0] * r + (Math.random() - 0.5) * 0.5;
        particles[idx + 1] = h + (Math.random() - 0.5) * 0.5;
        particles[idx + 2] = coneAxis[2] * r + (Math.random() - 0.5) * 0.5;
      }
    }
  }, []);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y += 0.003;
      group.current.position.y = Math.sin(t * 0.5) * 0.2;
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x, 
        mouse.y * 0.5, 
        0.08
      );
      group.current.rotation.z = Math.sin(t * 0.2) * 0.04;
    }
  });
  return (
    <group ref={group}>
      <Points positions={particles} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={params.color || "#888"}
          size={0.06}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
});

// Audio hook
const useAudio = (url, play) => {
  useEffect(() => {
    if (!url || !play) return;
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.6;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => console.log('Audio play failed:', e));
    }
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [url, play]);
};

// Speech hook
const useSpeech = (text, play) => {
  useEffect(() => {
    if (!play || !text) return;
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    return () => window.speechSynthesis.cancel();
  }, [text, play]);
};

// Spinner
const Spinner = () => (
  <div style={{
    position: 'fixed', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.8)', zIndex: 9999
  }}>
    <div style={{
      border: '4px solid #333', borderTop: '4px solid #b19cd9',
      borderRadius: '50%', width: 50, height: 50,
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`@keyframes spin {0% { transform: rotate(0deg); }100% { transform: rotate(360deg); }}`}</style>
  </div>
);

// Main App
export default function App() {
  const [immersive, setImmersive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scent, setScent] = useState(null);
  const [error, setError] = useState(null);
  const { audioData, bassEnergy, isActive } = useAudioAnalyzer({ fftSize: 128 });

  const fetchScent = useCallback(async (type = 'default') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scent/${type}`);
      if (!res.ok) throw new Error('Scent not found');
      const data = await res.json();
      setScent(data);
      setImmersive(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger on mount
  useEffect(() => {
    fetchScent();
  }, [fetchScent]);

  // Audio & Speech
  useAudio(scent?.audio_track, immersive);
  useSpeech(scent?.vibe, immersive);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = immersive ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [immersive]);

  if (loading) return <Spinner />;

  return (
    <>
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        {immersive ? (
          <Suspense fallback={null}>
            <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
              <ambientLight intensity={0.6} />
              {/* layered smoke to emulate the reference animation */}
              <SmokeParticles color="#E6E6FA" count={160} />
              <SmokeParticles color="#FFB6C1" count={140} />
              <SmokeParticles color="#87CEEB" count={120} />
              <OrbitControls enableZoom={false} />
            </Canvas>
          </Suspense>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <h1>Scent Immersion</h1>
            <button onClick={() => fetchScent('lavender')}>
              Enter Lavender World
            </button>
            {/* Hidden YouTube iframe for background audio (autoplay may be blocked by browser) */}
            <iframe
              title="lavender-audio"
              width="0"
              height="0"
              src="https://www.youtube.com/embed/aO0HZfpScwg?autoplay=1&loop=1&playlist=aO0HZfpScwg&mute=0"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              style={{ display: 'none' }}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
