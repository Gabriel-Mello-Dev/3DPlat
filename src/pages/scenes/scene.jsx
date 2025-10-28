import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { createXRStore, XR } from '@react-three/xr'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'

const xrStore = createXRStore()

function Scene() {
  const boxRef = useRef()
  const [cubes, setCubes] = useState([])
  const navigate = useNavigate()

  useFrame((_, delta) => {
    if (boxRef.current) {
      boxRef.current.rotation.y += delta * 0.5 // rotação leve
    }
  })

  // Ao clicar, vai para /Jogos
  const handleClick = () => {
    navigate('/Jogos')
  }

  const handleDiminuir = () => {
    setCubes(prev => {
      if (prev.length === 0) return prev
      return prev.slice(0, -1)
    })
  }

  return (
    <XR store={xrStore}>
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

      {/* Botão que navega para /Jogos */}
      <group position={[0, 1.2, -3]}>
        <mesh ref={boxRef} onClick={handleClick}>
          <boxGeometry args={[1.5, 0.5, 0.2]} />
          <meshStandardMaterial color="#2563eb" />
        </mesh>
        <Text position={[0, 0, 0.3]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
          Ir para Jogos
        </Text>
      </group>

      {/* Cubos criados dinamicamente */}
      {cubes.map((c, i) => (
        <mesh
          key={i}
          position={[Math.random() * 4 - 2, 1, Math.random() * -4]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={c.color || '#ff0000'} />
        </mesh>
      ))}
    </XR>
  )
}

export {Scene}