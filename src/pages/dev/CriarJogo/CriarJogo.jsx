import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Sphere, Box, Stars } from "@react-three/drei";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

function CriarJogo() {
  const [nome, setNome] = useState("");
  const [link, setLink] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const navigate = useNavigate()  ;
const devId= localStorage.getItem("devId")
  // Converte arquivo para Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result); // resultado em base64
    };
    reader.readAsDataURL(file);
  };

  async function handleCriarJogo() {
    if (!nome || !link || !imageBase64) {
      alert("Preencha todos os campos!");
      return;
    }

    // Pegar todos os jogos para calcular o próximo id
    const jogosCol = collection(db, "jogos");
    const snapshot = await getDocs(jogosCol);

    let maxId = 0;
    snapshot.forEach((doc) => {
      const idNum = Number(doc.id);
      if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
    });

    const newId = maxId + 1;

    // Criar novo documento com imagem em Base64
    await setDoc(doc(db, "jogos", String(newId)), {
      nome,
      link,
      image: imageBase64,
      devId,
    });

    alert("Jogo criado com sucesso!");
    setNome("");
    setLink("");
    setImageBase64("");
  }

  return (
   <div className="relative flex items-center justify-center w-screen h-screen overflow-hidden text-white">

  {/* Container principal */}
  <div className="relative z-10 w-[420px] bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 text-center">

    {/* Título */}
    <h1 className="mb-6 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
      Criar Jogo
    </h1>

    {/* Inputs */}
    <div className="flex flex-col gap-4 text-left">
      <div>
        <label className="block mb-1 text-sm font-semibold text-gray-200">Nome do Jogo</label>
        <input
          type="text"
          placeholder="Digite o nome do jogo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-semibold text-gray-200">Link do Jogo</label>
        <input
          type="text"
          placeholder="https://"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-semibold text-gray-200">Imagem do Jogo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    {/* Botão */}
    <button
      onClick={handleCriarJogo}
      className="w-full py-3 mt-6 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
    >
      Criar Jogo
    </button>
  </div>

  {/* Fundo animado opcional */}
  <div className="absolute inset-0 opacity-20">
    <Canvas>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} />
      <Float speed={1.5} rotationIntensity={2} floatIntensity={3}>
        <Sphere args={[1, 32, 32]} position={[0, 0, -3]}>
          <meshStandardMaterial color="#00ffcc" wireframe />
        </Sphere>
      </Float>
      <Stars />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  </div>
</div>

  );
}

export { CriarJogo };
