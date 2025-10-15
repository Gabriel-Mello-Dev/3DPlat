import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

export default function Scene({ xrStore }) {
  const boxRef = useRef()

  useFrame((_, delta) => {
    if (boxRef.current) {
      boxRef.current.rotation.y += delta * 0.3
      boxRef.current.rotation.x += delta * 0.15
    }
  })

  return (
    <>
      {/* Luzes */}
      <ambientLight intensity={1} />
      <directionalLight position={[5, 10, 5]} intensity={1} />

      {/* Skybox */}
      <mesh>
        <sphereGeometry args={[50, 64, 64]} />
        <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
      </mesh>

      {/* Cubo */}
      <mesh ref={boxRef} position={[0, 1.5, -2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      {/* Chão */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="green" />
      </mesh>

      {/* Botão de sair XR */}
      <Html
        transform
        occlude
        position={[0, 2.5, -2]} // ajuste a posição acima do cubo
        style={{ pointerEvents: 'auto' }}
      >
        <button
          onClick={() => xrStore.end()}
          style={{
            padding: '10px 16px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ❌ Exit XR
        </button>
      </Html>
    </>
  )
}
