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
    <div className="relative w-screen h-screen overflow-hidden text-center bg-black align">
      {/* Canvas 3D */}
     

      {/* Formulário */}
      <div className="absolute z-10 flex flex-col gap-4 p-8 transform -translate-x-1/2 -translate-y-1/2 shadow-xl top-1/2 left-1/2 bg-white/90 backdrop-blur-md rounded-2xl w-96">
        <h1 className="mb-4 text-2xl font-bold text-center text-gray-800">Criar Jogo</h1>

        <input
          type="text"
          placeholder="Nome do Jogo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Link do Jogo"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleCriarJogo}
          className="py-2 mt-2 font-semibold text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
        >
          Criar Jogo
        </button>
      </div>
    </div>
  );
}

export { CriarJogo };
