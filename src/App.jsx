// App.jsx
import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { createXRStore, XR } from '@react-three/xr'
import Scene from '../src/scene'

const xrStore = createXRStore()

export default function App() {
  const [logado, setLogado] = useState(false)
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')

  const handleLogin = () => {
    if (user === 'a' && pass === '123') {
      setLogado(true)
      alert('✅ Login bem-sucedido!')
    } else {
      alert('❌ Usuário ou senha incorretos.')
    }
  }

  const enterVr = () => {
    if (logado) {
      xrStore.enterVR()
      // xrStore.enterAR() // normalmente não entram os dois ao mesmo tempo
    } else {
      alert('❌ Faça login primeiro!')
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {!logado && (
        <div
          style={{
            position: 'absolute',
            zIndex: 20,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#ffffffaa',
            padding: '20px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            minWidth: '250px',
          }}
        >
          <input
            type="text"
            placeholder="Usuário"
            value={user}
            onChange={e => setUser(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <input
            type="password"
            placeholder="Senha"
            value={pass}
            onChange={e => setPass(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <button
            onClick={handleLogin}
            style={{
              padding: '10px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Login
          </button>
        </div>
      )}

      {/* Botões de VR/AR */}
      {logado && (
        <div style={{ position: 'absolute', zIndex: 10, left: 20, top: 20 }}>
          <button onClick={enterVr}>🥽 Enter VR</button>
          <button onClick={() => xrStore.enterAR()}>📱 Enter AR</button>
        </div>
      )}

      <Canvas shadows gl={{ antialias: true }} frameloop="always">
        <XR store={xrStore}>
          <Scene />
        </XR>
      </Canvas>
    </div>
  )
}
