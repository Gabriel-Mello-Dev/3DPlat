import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Interactive,  } from '@react-three/xr'
import * as THREE from 'three'
import { createXRStore, XR } from '@react-three/xr'


const xrStore = createXRStore()
export default function Scene() {
  const boxRef = useRef()

  useFrame((_, delta) => {
    if (boxRef.current) {
      boxRef.current.rotation.y += delta * 0.3
    }
  })

  const handleClick = () => {
xrStore.session?.end()
    const user = prompt('👤 Digite o nome de usuário:')
    const pass = prompt('🔒 Digite a senha:')



    if (user === 'a' && pass === '123') {
      alert('✅ Login bem-sucedido!')
    } else {
      alert('❌ Usuário ou senha incorretos.')
    }

    xrStore.enterVR();
    xrStore.enterAR()
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
          {/* Texto 3D */}
        
        </mesh>
      </Interactive>
    </>
  )
}
