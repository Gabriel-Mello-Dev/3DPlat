import { useFrame } from "@react-three/fiber";
import { useXR } from "@react-three/xr";
import * as THREE from "three";
import { useEffect } from "react";

 function PlayerController({ speed = 2 }) {
  const { player, controllers } = useXR();
  if (!player) return;

  useEffect(() => {
    console.log("🕹️ Controles XR detectados:", controllers);
  }, [controllers]);
useFrame((_, delta) => {
  if (!player) {
    return;
  }

  controllers.forEach((ctrl) => {
    const input = ctrl.inputSource?.gamepad;
    if (!input || !input.axes) {
      console.log("Controlador sem gamepad ou eixos");
      return;
    }

    const [x, y] = input.axes;
    console.log("Eixos do joystick:", x, y);

    if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
      const dir = new THREE.Vector3();
      player.getWorldDirection(dir);
      dir.y = 0;

      player.position.addScaledVector(dir, -y * delta * speed);

      const right = new THREE.Vector3().crossVectors(dir, player.up);
      player.position.addScaledVector(right, x * delta * speed);

      console.log("Nova posição do player:", player.position);
    }
  });
});

  return null;
}

export {PlayerController}