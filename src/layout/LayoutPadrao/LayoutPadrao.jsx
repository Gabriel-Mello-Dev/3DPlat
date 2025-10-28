import React from "react";
import { Canvas } from "@react-three/fiber";
import { XR } from "@react-three/xr";
import { OrbitControls } from "@react-three/drei";
import { Outlet } from "react-router-dom";

function LayoutPadrao({ xrStore, Scene }) {
  const enterVr = () => xrStore.enterVR();
  const enterAr = () => xrStore.enterAR();

  return (
    <>
      {/* Botões fixos fora do Canvas */}
      <div style={{ position: "absolute", zIndex: 10, left: 20, top: 20 }}>
        <button onClick={enterVr}>🥽 Enter VR</button>
        <button onClick={enterAr}>📱 Enter AR</button>
      </div>

      {/* Canvas 3D só se houver Scene */}
      {Scene && (
        <Canvas
          shadows
          gl={{ antialias: true }}
          frameloop="always"
          camera={{ position: [0, 0, 15], fov: 25 }}
          style={{ width: "100vw", height: "100vh" }}
        >
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={8}
            maxDistance={20}
            minAzimuthAngle={-0.4}
            maxAzimuthAngle={0.4}
          />
          <XR store={xrStore}>
            <Scene />
          </XR>
        </Canvas>
      )}

      {/* Conteúdo React normal */}
      <Outlet />
    </>
  );
}

export { LayoutPadrao };
