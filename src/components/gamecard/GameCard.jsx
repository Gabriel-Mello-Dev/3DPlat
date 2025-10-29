import React from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader, MeshStandardMaterial } from "three";
import { Text } from "@react-three/drei";
import { Handle, HandleTarget } from "@react-three/handle";

function GameCard({ link, name, image, position = [0, 0, 0], size = [1.5, 2, 0.5] }) {
  const texture = useLoader(TextureLoader, image);

  const handleClick = () => {
window.open(link, "_blank"); // abre o link em nova aba
  };

  const materials = Array(6).fill(new MeshStandardMaterial({ map: texture }));

  return (
    <group position={position}>
      <HandleTarget>
        {/* Cubo "alvo" da manipulação */}
        <mesh scale={size} material={materials} onClick={handleClick}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>

        {/* Handle que permite arrastar o cubo */}
        <Handle targetRef="from-context" translate="all">
          <mesh scale={size} visible={false} /> {/* handle invisível, só para pegar o movimento */}
        </Handle>
      </HandleTarget>

      <Text
        position={[0, size[1] - 0.3, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}

export { GameCard };
