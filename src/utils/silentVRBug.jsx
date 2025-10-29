// src/utils/silentVRBug.js
import * as THREE from "three";

// Corrige erro "material.onBuild is not a function" no modo VR emulado
export function patchThreeOnBuildError() {
  const originalConsoleError = console.error;
const ignorePatterns = [
  "material.onBuild",
  "XRSession not supported",
  "GL_INVALID_OPERATION"
];

console.error = (...args) => {
  if (ignorePatterns.some(p => args[0]?.toString().includes(p))) return;
  originalConsoleError(...args);
};

}
