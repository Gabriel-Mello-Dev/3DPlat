// src/pages/CriarConta.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Galaxy from "../../../public/GalaxyBg"; // fundo galaxy
import { Canvas } from "@react-three/fiber";
import { Float, Sphere, Box, OrbitControls } from "@react-three/drei";

// Firebase Firestore
import { db } from "../../firebase/firebaseConfig.js";
import { collection, getDocs, addDoc, doc, setDoc } from "firebase/firestore";

function CriarConta() {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const handleCreateAccount = async () => {
    if (!user || !email || !pass) {
      alert("❌ Preencha todos os campos.");
      return;
    }
  const usuariosRef = collection(db, "usuarios");
  const snapshot = await getDocs(usuariosRef);

  const ids= snapshot.docs
  .map(doc=> Number(doc.id)
  .filter(id => !isNaN(id)));
  
  const maiorId = ids.length > 0 ? Math.max(...ids) : 0;
  const novoId= maiorId+1;
    try {
      // Salva diretamente no Firestore
      await setDoc(doc(db, "usuarios", String(novoId)), {
        id: novoId,
        username: user,
        email: email,
        senha: pass, // cuidado: senha está em texto simples!
        criadoEm: new Date(),
      });

      alert(`✅ Conta criada com sucesso!\nUsuário: ${user}\nEmail: ${email}`);
      navigate("/"); // redireciona para login
    } catch (error) {
      alert("❌ Erro ao criar conta: " + error.message);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Fundo Galaxy */}
      <div className="absolute inset-0 -z-10">
        <Galaxy transparent="true" />
      </div>

      {/* Canvas 3D */}
      <Canvas className="absolute inset-0 z-0">
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          <Sphere args={[1, 32, 32]} position={[-2, 0, -5]}>
            <meshStandardMaterial color="#f59e0b" />
          </Sphere>
          <Box args={[1.5, 1.5, 1.5]} position={[2, 1, -4]}>
            <meshStandardMaterial color="#3b82f6" />
          </Box>
        </Float>
        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* Formulário */}
      <div className="absolute z-10 flex flex-col gap-4 p-8 transform -translate-x-1/2 -translate-y-1/2 shadow-xl top-1/2 left-1/2 bg-white/90 backdrop-blur-md rounded-2xl w-80">
        <h1 className="mb-4 text-2xl font-bold text-center text-gray-800">Criar Conta</h1>
        <input
          type="text"
          placeholder="Usuário"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Senha"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCreateAccount}
          className="py-2 mt-2 font-semibold text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
        >
          Criar Conta
        </button>
        <p className="mt-2 text-sm text-center text-gray-600">
          Já tem uma conta?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/")}
          >
            Faça login
          </span>
        </p>
      </div>
    </div>
  );
}

export { CriarConta };
