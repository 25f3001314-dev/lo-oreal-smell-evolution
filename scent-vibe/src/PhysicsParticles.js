import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { useThree, useFrame } from '@react-three/fiber';
import Stats from 'stats.js';

// Robust PhysicsParticles (React) adapted from the fixed SolidJS example.
export default function PhysicsParticles({ audioData = new Uint8Array(), bassEnergy = 0, isActive = false, children = null }) {
  const { scene, camera, gl: renderer } = useThree();
  const worldRef = useRef(null);
  const meshRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const statsRef = useRef(null);
  const dummy = useRef(new THREE.Object3D());

  const [instancedReady, setInstancedReady] = useState(false);

  useEffect(() => {
    // FPS stats
    const stats = new Stats();
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '0';
    document.body?.appendChild(stats.dom);
    statsRef.current = stats;

    // Renderer optimizations
    try {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    } catch (e) {}

    initWorld();

    return () => {
      cancelAnimationFrame(rafRef.current);
      statsRef.current?.dom.remove();
      if (worldRef.current) {
        worldRef.current.bodies.slice().forEach(b => { try { worldRef.current.removeBody(b); } catch (e) {} });
      }
      if (meshRef.current) { try { scene.remove(meshRef.current); } catch (e) {} }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initWorld() {
    try {
      const world = new CANNON.World();
      world.gravity.set(0, -15, 0);
      // Use NaiveBroadphase to avoid internal .length access issues
      world.broadphase = new CANNON.NaiveBroadphase();
      world.solver.iterations = 5;
      worldRef.current = world;

      // Ground
      const groundShape = new CANNON.Plane();
      const groundBody = new CANNON.Body({ mass: 0 });
      groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
      groundBody.addShape(groundShape);
      world.addBody(groundBody);

      // Instanced mesh
      const count = 500;

      // create physics bodies

      const particles = [];
      for (let i = 0; i < count; i++) {
        const shape = new CANNON.Sphere(0.04);
        const body = new CANNON.Body({ mass: 0.5 });
        body.addShape(shape);
        body.position.set((Math.random() - 0.5) * 8, Math.random() * 4 + 5, (Math.random() - 0.5) * 8);
        // add small upward velocity to prevent immediate ground sinking
        body.velocity.set((Math.random() - 0.5) * 0.2, Math.random() * 0.5 + 0.1, (Math.random() - 0.5) * 0.2);
        body.addEventListener('collide', (event) => {
          try {
            const contact = event.contact;
            const impulse = contact.getImpactVelocityAlongNormal();
            if (impulse > 5) {
              console.log('Collision impulse', impulse);
            }
          } catch (e) {
            // ignore
          }
        });
        world.addBody(body);
        particles.push({ index: i, body });
      }
      // per-particle random seed for gentle turbulence
      for (let i = 0; i < particles.length; i++) {
        particles[i].seed = Math.random() * 1000;
      }
      // tweak body damping so they float
      particles.forEach(p => { p.body.linearDamping = 0.08; p.body.angularDamping = 0.9; });

      particlesRef.current = particles;
      setInstancedReady(true);

      // start RAF
      // start RAF handled by useFrame
    } catch (error) {
      console.error('Physics init error:', error);
    }
  }
  // useFrame loop drives physics and instance updates
  useFrame((state) => {
    const world = worldRef.current;
    const mesh = meshRef.current;
    if (!world || !mesh) return;

    statsRef.current?.begin();
    const t = state.clock.getElapsedTime();
    const delta = Math.min(1 / 60, state.clock.getDelta() || 0.016);
    world.step(1 / 60, delta, 3);

    const dummyObj = dummy.current;
    const particles = particlesRef.current;
    const len = particles.length;

    for (let i = 0; i < len; i++) {
      const { index, body } = particles[i];
      // copy CANNON to THREE
      dummyObj.position.set(body.position.x, body.position.y, body.position.z);
      dummyObj.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);

      // gentle turbulence + attractor
      const seed = body._seed || (body._seed = particles[i].seed || Math.random() * 1000);
      const nx = Math.sin(t * 0.3 + seed) * 0.02;
      const nz = Math.cos(t * 0.27 + seed) * 0.02;
      body.applyForce(new CANNON.Vec3(nx, 0.01, nz), body.position);

      // attractor moving in a small circle
      const attractor = new CANNON.Vec3(Math.sin(t * 0.2) * 1.5, 2.5 + Math.sin(t * 0.5) * 0.5, Math.cos(t * 0.2) * 1.5);
      const toAttractor = attractor.vsub(body.position);
      toAttractor.scale(0.02, toAttractor);
      body.applyForce(toAttractor, body.position);

      // audio-reactive scale
      let scale = 1.0;
      if (audioData && audioData.length > 0) {
        const freqIndex = Math.floor((index / len) * audioData.length);
        const v = audioData[freqIndex] / 255;
        scale = 0.6 + v * 2.2;
      }
      dummyObj.scale.setScalar(scale);

      // bass impulse: stronger, but capped
      if (bassEnergy > 0.18 && isActive) {
        const mag = Math.min(1.6, bassEnergy * 6);
        const impulse = new CANNON.Vec3((Math.random() - 0.5) * 8 * mag, 8 * mag, (Math.random() - 0.5) * 8 * mag);
        body.applyImpulse(impulse, body.position);
      }

      dummyObj.updateMatrix();
      mesh.setMatrixAt(index, dummyObj.matrix);
      const hue = (index / len + t * 0.05) % 1;
      const sat = 0.9;
      const light = 0.5 + Math.min(0.6, bassEnergy * 1.5);
      const col = new THREE.Color().setHSL(hue, sat, light);
      if (typeof mesh.setColorAt === 'function') mesh.setColorAt(index, col);
    }

    mesh.instanceMatrix.needsUpdate = true;
    try { if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; } catch (e) {}
    statsRef.current?.end();
  });

  const geom = useMemo(() => new THREE.SphereGeometry(0.08, 10, 8), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }), []);
  const count = 500;

  return (
    <>
      {instancedReady && (
        <instancedMesh ref={meshRef} args={[geom, mat, count]} castShadow frustumCulled={false}>
        </instancedMesh>
      )}
      {children}
    </>
  );
}
