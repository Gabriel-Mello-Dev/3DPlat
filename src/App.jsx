import React from 'react'
import { Canvas } from '@react-three/fiber'
import { createXRStore, XR } from '@react-three/xr'
import Scene from '../src/scene'

const xrStore = createXRStore()

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ position: 'absolute', zIndex: 10, left: 20, top: 20 }}>
        <button onClick={() => xrStore.enterVR()}>🥽 Enter VR</button>
        <button onClick={() => xrStore.enterAR()}>📱 Enter AR</button>
      </div>

      <Canvas shadows gl={{ antialias: true }} frameloop="always">
        <XR store={xrStore}>
          <Scene />
        </XR>
      </Canvas>
    </div>
  )
}
