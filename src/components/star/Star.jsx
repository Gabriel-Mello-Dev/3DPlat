import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// Cria a forma 2D da estrela e extruda para 3D
function createStarShape(points = 5, outerRadius = 1, innerRadius = 0.5) {
  const shape = new THREE.Shape();
  const step = Math.PI / points;
  let angle = -Math.PI / 2;

  shape.moveTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
  for (let i = 1; i < points * 2; i++) {
    angle += step;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    shape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  shape.closePath();
  return shape;
}

 function Star({
  points = 5,
  outerRadius = 1.5,
  innerRadius = 0.7,
  depth = 0.4,
  color = "#ffdd33",
  spin = true,
  position = [0, 0, 0],
}) {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const shape = createStarShape(points, outerRadius, innerRadius);
    const extrudeSettings = {
      depth,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: depth * 0.12,
      bevelThickness: depth * 0.12,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, [points, outerRadius, innerRadius, depth]);

  useFrame((_, delta) => {
    if (spin && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8;
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={position} castShadow>
      <meshStandardMaterial
        color={color}
        metalness={0.5}
        roughness={0.3}
      />
    </mesh>
  );
}

export {Star}