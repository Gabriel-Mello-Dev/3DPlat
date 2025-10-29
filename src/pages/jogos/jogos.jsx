import React, { useState, useEffect } from "react";
import { createXRStore, XR, XROrigin, TeleportTarget } from "@react-three/xr";
import { TextureLoader, BackSide, Vector3 } from "three";
import { useLoader } from "@react-three/fiber";
import { GameCard, PlayerController } from "../../components";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const xrStore = createXRStore({
  hand: { teleportPointer: true },
  controller: { teleportPointer: true },
});

function Background({ image }) {
  const texture = useLoader(TextureLoader, image);
  return (
    <mesh>
      <sphereGeometry args={[50, 64, 64]} />
      <meshBasicMaterial map={texture} side={BackSide} />
    </mesh>
  );
}

function Jogos() {
  const [position, setPosition] = useState(new Vector3());
  const [jogos, setJogos] = useState([]);

  useEffect(() => {
    async function fetchJogos() {
      const jogosCol = collection(db, "jogos");
      const snapshot = await getDocs(jogosCol);

      const jogosData = snapshot.docs.map((doc, index) => {
        const data = doc.data();

        // Grid automático
        const cols = 3; // colunas
        const spacingX = 2.5; // espaçamento X
        const spacingY = 2;   // espaçamento Y
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = col * spacingX - (cols - 1) * spacingX / 2;
        const y = 1 - row * spacingY;
        const z = -3; // profundidade fixa

        return {
          id: Number(doc.id),
          pos: [x, y, z],
          name: data.nome,
          link: data.link,
          image: data.image,
        };
      });

      setJogos(jogosData);
    }

    fetchJogos();
  }, []);

  return (
    <XR store={xrStore}>
      <XROrigin position={position}>
        <Background image="/imgs/galaxiabg.png" />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 10, 5]} intensity={1} />

        <PlayerController speed={3} />

        {/* Chão */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="green" />
        </mesh>

        {jogos.map((jogo) => (
          <GameCard
            key={jogo.id}
            position={jogo.pos}
            name={jogo.name}
            link={jogo.link}
            image={jogo.image}
            size={[1, 1, 1]}
          />
        ))}

        <TeleportTarget onTeleport={(pos) => setPosition([pos.x, 1.2, pos.z])}>
          <mesh scale={[10, 0.1, 10]} position={[0, 0, 0]}>
            <boxGeometry />
            <meshBasicMaterial color="red" transparent opacity={0} />
          </mesh>
        </TeleportTarget>
      </XROrigin>
    </XR>
  );
}

export { Jogos };
