import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// SmokeParticles: colorful, slow-floating instanced spheres to mimic smoke
export default function SmokeParticles({ color = '#E6E6FA', count = 150 }) {
  const mesh = useRef();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (!mesh.current) return;
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      let { t, factor, speed, xFactor, yFactor, zFactor } = p;
      t = p.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);

      const x = (xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10) / 10;
      const y = (yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10) / 10;
      const z = (zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10) / 10;

      matrix.makeTranslation(x, y, z);
      mesh.current.setMatrixAt(i, matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]} frustumCulled={false}>
      <sphereGeometry args={[0.25, 16, 12]} />
      <meshStandardMaterial color={color} transparent opacity={0.35} />
    </instancedMesh>
  );
}
