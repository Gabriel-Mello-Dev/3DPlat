import React from "react";
import { Text } from "@react-three/drei";
import { createXRStore, XR } from "@react-three/xr";
import { TextureLoader, BackSide } from "three";
import { useLoader } from "@react-three/fiber";
import { GameCard } from "../../components/gamecard";

const xrStore = createXRStore();

// Componente de fundo personalizado
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
  const frameWidth = 8;
  const frameHeight = 5;
  const frameDepth = 0.1;

  const jogos = [
    { id: 1, pos: [-2, 1, -3], name: "Jogo 1", link: "https://www.meta.com/pt-br/experiences/youtube/2002317119880945", image: "/imgs/crystal.png" },
    { id: 2, pos: [0, 1, -3], name: "Jogo 2", link: "https://example.com/2", image: "/imgs/galaxy.gif" },
    { id: 3, pos: [2, 1, -3], name: "Jogo 3", link: "https://example.com/3", image: "/imgs/galaxy.gif" },
    { id: 4, pos: [-2, -1.5, -3], name: "Jogo 4", link: "https://example.com/4", image: "/imgs/galaxy.gif" },
    { id: 5, pos: [0, -1.5, -3], name: "Jogo 5", link: "https://example.com/5", image: "/imgs/galaxy.gif" },
    { id: 6, pos: [2, -1.5, -3], name: "Jogo 6", link: "https://example.com/6", image: "/imgs/galaxy.gif" },
  ];

  return (
    <XR store={xrStore}>
      {/* Fundo personalizado */}
      <Background image="/imgs/galaxiabg.png" />

      <ambientLight intensity={1} />
      <directionalLight position={[5, 10, 5]} intensity={1} />

      {/* Geração dos GameCards */}
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

      {/* Chão */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="green" />
      </mesh>

      {/* Moldura verde */}
      <mesh position={[0, frameHeight / 2 - 0.05, -frameWidth / 2]}>
        <boxGeometry args={[frameWidth, frameDepth, frameDepth]} />
        <meshStandardMaterial color="green" />
      </mesh>
      <mesh position={[0, frameHeight / 2 - 0.05, frameWidth / 2]}>
        <boxGeometry args={[frameWidth, frameDepth, frameDepth]} />
        <meshStandardMaterial color="green" />
      </mesh>
      <mesh position={[-frameWidth / 2, frameHeight / 2 - 0.05, 0]}>
        <boxGeometry args={[frameDepth, frameDepth, frameWidth]} />
        <meshStandardMaterial color="green" />
      </mesh>
      <mesh position={[frameWidth / 2, frameHeight / 2 - 0.05, 0]}>
        <boxGeometry args={[frameDepth, frameDepth, frameWidth]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </XR>
  );
}

export { Jogos };
