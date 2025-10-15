import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Interactive } from '@react-three/xr'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

export default function Scene() {
  const boxRef = useRef()
  const [username, setUsername] = useState('')

  useFrame((_, delta) => {
    if (boxRef.current) {
      boxRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 10, 5]} intensity={1} />

      {/* Skybox */}
      <mesh>
        <sphereGeometry args={[50, 64, 64]} />
        <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
      </mesh>

      {/* Chão */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="green" />
      </mesh>

      {/* Botão para abrir teclado */}
      <Interactive>
        <mesh position={[0, 1.5, -3]}>
          <boxGeometry args={[2, 0.6, 0.2]} />
          <meshStandardMaterial color="#2563eb" />
        </mesh>
        <Html position={[0, 0, 0.15]} transform occlude>
          <input
            type="text"
            placeholder="Digite seu nome"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              fontSize: '16px',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              width: '200px'
            }}
          />
        </Html>
      </Interactive>
    </>
  )
}
