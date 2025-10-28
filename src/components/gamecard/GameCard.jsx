import React from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader, MeshStandardMaterial } from "three";
import { Text } from "@react-three/drei";

function GameCard({ link, name, image, position = [0, 0, 0], size = [1.5, 2, 0.5] }) {
  const texture = useLoader(TextureLoader, image);

  const handleClick = () => {
    window.open(link, "_blank"); // abre o link em nova aba
  };

  // Criar 6 materiais iguais, um para cada face
  const materials = Array(6).fill(new MeshStandardMaterial({ map: texture }));

  return (
    <group position={position}>
      {/* Cubo com a mesma textura em todas as faces */}
      <mesh onClick={handleClick} scale={size} material={materials}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>

      <Text
        position={[0, size[1] - 0.3, 0]}
        fontSize={0.3}
        color="White"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}

export { GameCard };
