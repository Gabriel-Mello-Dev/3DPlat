import React from "react";
import { Routes, Route } from "react-router-dom";
import { Home, Scene, Jogos, CriarConta, HomeDev, Error, CriarJogo} from "./pages";
import { LayoutPadrao, LayoutDev } from "./layout";
import { createXRStore } from "@react-three/xr";
import { LoginDev } from "./pages/dev/LoginDev/LoginDev";

const xrStore = createXRStore();

function RoutesApp() {
  return (
    <Routes>
      {/* Página inicial (login) */}
      <Route path="/" element={<Home />} />
            <Route path="*" element={<Error />} />

      <Route element={<LayoutDev/>}>
      <Route path="/CriarConta" element={<CriarConta />} />
      <Route path="/CriarJogo" element={<CriarJogo />} />
      <Route path="/MeusJogos" element={<HomeDev />} />
      </Route>

      <Route path="/Dev" element={<LoginDev />} />

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
