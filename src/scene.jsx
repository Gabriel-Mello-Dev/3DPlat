import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Scene() {
  const boxRef = useRef()

  useFrame((_, delta) => {
    if (boxRef.current) {
      boxRef.current.rotation.y += delta * 0.3
      boxRef.current.rotation.x += delta * 0.15
    }
  })

  return (
    <>
      {/* Luz */}
      <ambientLight intensity={1} />
      <directionalLight position={[5, 10, 5]} intensity={1} />

      {/* Skybox 360° */}
      <mesh>
        <sphereGeometry args={[50, 64, 64]} />
        <meshBasicMaterial
          color="#87CEEB"
          side={THREE.BackSide} // importante para ver de dentro
        />
      </mesh>

      {/* Cubo flutuante */}
      <mesh ref={boxRef} position={[0, 1.5, -2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      {/* Chão */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </>
  )
}
