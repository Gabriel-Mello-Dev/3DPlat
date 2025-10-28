import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Galaxy from "../../../public/GalaxyBg"; // Seu componente de fundo galaxy
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Sphere, Box } from "@react-three/drei";

function Home({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (user === "a" && pass === "123") {
      alert("✅ Login bem-sucedido!");
      navigate("/Scene");
    } else {
      alert("❌ Usuário ou senha incorretos.");
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Fundo Galaxy atrás de tudo */}
      <div className="absolute inset-0 -z-10">
        <Galaxy transparent="true" />
      </div>
<Canvas className="absolute inset-0 z-0">
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          <Sphere args={[1, 32, 32]} position={[-2, 0, -5]}>
            <meshStandardMaterial color="#fbbf24" />
          </Sphere>
          <Box args={[1.5, 1.5, 1.5]} position={[2, 1, -4]}>
            <meshStandardMaterial color="#3b82f6" />
          </Box>
        </Float>
        <OrbitControls enableZoom={false} />
      </Canvas>
      {/* Formulário de login */}
      <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl w-80 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Login</h1>
        <input
          type="text"
          placeholder="Usuário"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Senha"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleLogin}
          className="mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}

export { Home };
