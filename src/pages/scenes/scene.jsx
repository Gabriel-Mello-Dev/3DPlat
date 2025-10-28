import React, { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import * as THREE from "three";
import { Text, Text3D } from "@react-three/drei";
import { useNavigate } from "react-router-dom";

const xrStore = createXRStore();

function Scene() {
  const navigate = useNavigate();
  const bgTexture = useLoader(THREE.TextureLoader, "/imgs/galaxy.jpg"); // fundo 3D
  const logoTexture = useLoader(THREE.TextureLoader, "/imgs/Animus.png"); // logo

  const buttonRef = useRef(); // referência do grupo do botão

const handleClick = () => navigate("/Jogos");

  return (
    <XR store={xrStore}>
      {/* Luzes */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 5, 2]} intensity={1} />

      {/* Fundo 3D com textura de galáxia */}
      <mesh>
        <sphereGeometry args={[60, 64, 64]} />
        <meshBasicMaterial map={bgTexture} side={THREE.BackSide} />
      </mesh>

      {/* Painel preto de fundo */}
      <mesh position={[0, 1, -3]}>
        <boxGeometry args={[10, 10, 0.2]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Logo flutuante */}
      <mesh
        position={[0, 4, -2.85]}
        scale={[2, 4, 1]}
      >
        <planeGeometry args={[2.5, 1.2]} />
        <meshBasicMaterial map={logoTexture} transparent />
      </mesh>

      {/* Texto com nome da empresa */}
      <Text
        position={[0, 0.8, -2.85]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        ANIMUS REALITY
      </Text>

      {/* Placeholder de descrição */}
      <Text
        position={[0, 0.2, -2.85]}
        fontSize={0.22}
        color="#d1d5db"
        anchorX="center"
        anchorY="middle"
        maxWidth={5}
      >
        Plataforma imersiva para experiências em Realidade Virtual e Aumentada.
      </Text>

      {/* Botão de entrada como grupo (para poder mover) */}
      <group ref={buttonRef} position={[0, -0.8, -2.85]} onClick={handleClick}>
        {/* Quadrado do botão */}
        <mesh>
          <boxGeometry args={[2.5, 0.8, 0.2]} />
          <meshStandardMaterial color="#2563eb" transparent opacity={0.6} />
        </mesh>

        {/* Texto 3D centralizado no quadrado */}
        <Text3D
          font={"/fonts/droid_sans_mono_regular.typeface.json"}
          size={0.5}       
          height={0.05}     
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.01}
          bevelSize={0.01}
          anchorX="center"
          anchorY="middle"
          position={[-1.2, -0.2, 0.05]} // ligeiro offset para frente
        >
          Entrar
          <meshStandardMaterial color="white" />
        </Text3D>
      </group>

      
    </XR>
  );
}

export { Scene };
