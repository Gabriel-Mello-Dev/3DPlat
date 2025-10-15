// Scene.jsx
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Scene() {
  const sphereRef = useRef()
  const boxRef = useRef()

  // Animação leve — só pra mostrar movimento
  useFrame((_, delta) => {
    boxRef.current.rotation.y += delta * 0.3
  })

  return (
    <>
      {/* Luz ambiente + direcional */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {/* Skybox — uma esfera invertida em volta da câmera */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[50, 64, 64]} />
        <meshBasicMaterial color="#1e3a8a" side={THREE.BackSide} />
      </mesh>

      {/* "Chão" */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {/* Cubo flutuando à frente */}
      <mesh ref={boxRef} position={[0, 1.5, -3]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      {/* Mais alguns objetos para dar profundidade */}
      <mesh position={[3, 0.5, -4]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="red" />
      </mesh>

      <mesh position={[-3, 0.5, -5]}>
        <torusKnotGeometry args={[0.5, 0.15, 100, 16]} />
        <meshStandardMaterial color="purple" />
      </mesh>
    </>
  )
}
