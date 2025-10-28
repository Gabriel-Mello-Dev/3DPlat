import React from "react";
import { Routes, Route } from "react-router-dom";
import { Home, Scene, Jogos, CriarConta } from "./pages";
import { LayoutPadrao } from "./layout";
import { createXRStore } from "@react-three/xr";

const xrStore = createXRStore();

function RoutesApp() {
  return (
    <Routes>
      {/* Página inicial (login) */}
      <Route path="/" element={<Home />} />
      <Route path="/CriarConta" element={<CriarConta />} />

      {/* Rotas que usam LayoutPadrao com Canvas/XR */}
      <Route element={<LayoutPadrao xrStore={xrStore} Scene={Scene} />}>
        <Route path="/scene" element={null} />
      </Route>

      <Route element={<LayoutPadrao xrStore={xrStore} Scene={Jogos} />}>
        <Route path="/jogos" element={null} />
      </Route>
    </Routes>
  );
}

export { RoutesApp };
