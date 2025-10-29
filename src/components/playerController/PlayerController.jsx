import { useFrame } from "@react-three/fiber";
import { useXR } from "@react-three/xr";
import * as THREE from "three";

 function PlayerController({ speed = 2 }) {
  const { player, controllers } = useXR();

  useFrame((_, delta) => {
    if (!player) return;

    controllers.forEach((ctrl) => {
      const input = ctrl.inputSource?.gamepad;
      if (!input || !input.axes) return;

      const [x, y] = input.axes; // Eixo esquerdo do analógico (x = horizontal, y = vertical)

      // Evita pequenos ruídos do joystick
      if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
        const dir = new THREE.Vector3();
        player.getWorldDirection(dir);
        dir.y = 0; // Mantém movimento no plano horizontal

        // Frente/trás
        player.position.addScaledVector(dir, -y * delta * speed);

        // Direita/esquerda (cruza com "up" para calcular lateral)
        const right = new THREE.Vector3().crossVectors(dir, player.up);
        player.position.addScaledVector(right, x * delta * speed);
      }
    });
  });

  return null;
}

export {PlayerController}