import React, { useRef, useState} from 'react'
import { useFrame } from '@react-three/fiber'
import { Interactive,  } from '@react-three/xr'
import * as THREE from 'three'
import { createXRStore, XR } from '@react-three/xr'


const xrStore = createXRStore()
export default function Scene() {
  const boxRef = useRef()
const [cubes, setCubes] = useState([])
  useFrame((_, delta) => {
    if (boxRef.current) {
      boxRef.current.rotation.y += delta * 0.3
    }
  })

  const handleClick = () => {
  const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16)
    setCubes(prev => [...prev, { color: randomColor, id: prev.length }])
  }

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

      {/* Botão VR 3D */}
      <Interactive onSelect={handleClick}>
        <mesh position={[0, 1.2, -3]}>
          <boxGeometry args={[1.5, 0.5, 0.2]} />
          <meshStandardMaterial color="#2563eb" />
{cubes.map(c => ( <mesh key={c.id} position={[Math.random() * 4 - 2, 1, Math.random() * -4]} > <boxGeometry args={[1, 1, 1]} /> <meshStandardMaterial color={c.color} /> </mesh> ))}        
        </mesh>
      </Interactive>
    </>
  )
}
