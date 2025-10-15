// App.jsx
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { createXRStore, XR } from '@react-three/xr'
import Scene from '../src/scene'
import { useEffect } from 'react'


// cria o store XR uma única vez
const xrStore = createXRStore()

export default function App() {


  
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Botões HTML fixos */}
      <div style={{
        position: 'absolute',
        zIndex: 10,
        left: 20,
        top: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <button
          onClick={() => xrStore.enterVR()}
          style={{
            padding: '10px 16px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🥽 Enter VR
        </button>
        <button
          onClick={() => xrStore.enterAR()}
          style={{
            padding: '10px 16px',
            background: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          📱 Enter AR
        </button>
      </div>

      {/* Canvas com XR */}
    <Canvas
  style={{ width: '100%', height: '100%' }}
  shadows
  gl={{ antialias: true }}
  frameloop="always" // antes estava "never"
>


  
  <XR store={xrStore} sessionInit={{ requiredFeatures: [] }}>


    
    <Scene />
  </XR>
</Canvas>

    </div>
  )
}
