import React from "react";
import { Text } from "@react-three/drei";
import { createXRStore, XR } from "@react-three/xr";
import { Canvas } from "@react-three/fiber";

const xrStore = createXRStore();

function Jogos() {
  const jogos = [
    { id: 1, pos: [-2, 1, -3] },
    { id: 2, pos: [0, 1, -3] },
    { id: 3, pos: [2, 1, -3] },
    { id: 4, pos: [-2, -1.5, -3] },
    { id: 5, pos: [0, -1.5, -3] },
    { id: 6, pos: [2, -1.5, -3] },
  ];

  return (
    <XR store={xrStore}>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 10, 5]} intensity={1} />

      {/* Grid de cubos com texto */}
      {jogos.map((jogo) => (
        <group key={jogo.id} position={jogo.pos}>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#2563eb" />
          </mesh>
          <Text
            position={[0, 0, 0.6]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Jogo {jogo.id}
          </Text>
        </group>
      ))}

      {/* Chão */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </XR>
  );
}

export {Jogos}
