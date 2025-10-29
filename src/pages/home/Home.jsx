import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Galaxy from "../../../public/GalaxyBg"; // Seu componente de fundo galaxy
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Sphere, Box, Stars } from "@react-three/drei";
import {Star} from '../../components'
import { collection, query, where, getDocs } from "firebase/firestore";
import {db} from '../../firebase/firebaseConfig'
function Home({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  async function handleLogin(){
 

    
if (!user || !pass){
alert("Preencha todos os campos")
  return;
}

const users= collection(db,"usuarios")
  const q = query(
    users,
    where("email", "==", user),
    where("senha", "==", pass)
  );


const snapshot= await getDocs(q);
 if (snapshot.empty) {
    console.log("❌ Nenhum usuário encontrado com essas credenciais");
    return null;
  }

  // Firestore pode retornar mais de um, mas normalmente será só 1
  const doc = snapshot.docs[0];
  const userData = { id: Number(doc.id), ...doc.data() };
localStorage.setItem("user", true);
localStorage.setItem("userId", String(userData.id))

navigate("/scene")
  return userData;

  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black/100">
      {/* Fundo Galaxy atrás de tudo */}
      <div className="absolute inset-0 -z-10">
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

<Stars></Stars>
        </Float>
        <OrbitControls enableZoom={false} />
      </Canvas>
      {/* Formulário de login */}
      <div className="absolute z-10 flex flex-col gap-4 p-8 transform -translate-x-1/2 -translate-y-1/2 shadow-xl top-1/2 left-1/2 bg-white/90 backdrop-blur-md rounded-2xl w-80">
        <h1 className="mb-4 text-2xl font-bold text-center text-gray-800">Login</h1>
        <input
          type="text"
          placeholder="Usuário"
          value={user}
          onChange={(e) => setUser(e.target.value)}
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
        onClick={(e)=>       navigate("/CriarConta")}
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

export { Home };
