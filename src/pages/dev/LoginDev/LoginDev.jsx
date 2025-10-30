import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Sphere, Box, Stars } from "@react-three/drei";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useEffect } from "react";

function LoginDev({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  useEffect(() => {

    console.log("a")
  }, []);

  async function handleLogin() {
    if (!email || !senha) {
      alert("Preencha todos os campos");
      return;
    }

    const devsCollection = collection(db, "devs");
    const q = query(
      devsCollection,
      where("email", "==", email),
      where("senha", "==", senha)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log("❌ Nenhum dev encontrado com essas credenciais");
      alert("Email ou senha incorretos");
      return;
    }

    const doc = snapshot.docs[0];
    const devData = { id: doc.id, ...doc.data() };
    localStorage.setItem("devLogged", true);
    localStorage.setItem("devId", String(devData.id));

    navigate("/CriarJogo"); // redireciona para página de dev
    return devData;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Canvas 3D */}
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
          <Stars />
        </Float>
        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* Formulário */}
      <div className="absolute z-10 flex flex-col gap-4 p-8 transform -translate-x-1/2 -translate-y-1/2 shadow-xl top-1/2 left-1/2 bg-white/90 backdrop-blur-md rounded-2xl w-80">
        <h1 className="mb-4 text-2xl font-bold text-center text-gray-800">Login Dev</h1>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => navigate("/CriarContaDev")}
          className="py-2 mt-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Ainda não possui login?
        </button>
        <button
          onClick={handleLogin}
          className="py-2 mt-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}

export { LoginDev };
