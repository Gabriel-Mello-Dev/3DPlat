import React from "react";
import { Routes, Route } from "react-router-dom";
import { Home, Scene, Jogos, CriarConta, HomeDev, Error, CriarJogo, CriarAdmEscolar, CriarCliente} from "./pages";
import { LayoutPadrao, LayoutDev, LayoutProfessor } from "./layout";
import { createXRStore } from "@react-three/xr";
import { LoginDev } from "./pages/dev/LoginDev/LoginDev";

const xrStore = createXRStore();

function RoutesApp() {
  return (
    <Routes>
      {/* Página inicial (login) */}
      <Route path="/" element={<Home />} />
            <Route path="*" element={<Error />} />
{/* Dev */}

      <Route element={<LayoutDev/>}>
      <Route path="/CriarConta" element={<CriarConta />} />
      <Route path="/CriarJogo" element={<CriarJogo />} />
      <Route path="/MeusJogos" element={<HomeDev />} />
      <Route path="/CriarAdmin" element={<CriarAdmEscolar />} />
      <Route path="/CriarCliente" element={<CriarCliente />} />
      </Route>

{/* Admin */}
       <Route path="/" element={<LayoutProfessor />}>
          <Route path="CriarUser" element={<motion.div {...pageTransition}><CriarOpcao /></motion.div>} />
          <Route path="Criar" element={<motion.div {...pageTransition}><CriarAluno /></motion.div>} />
          <Route path="AdicionarTurma" element={<motion.div {...pageTransition}><AdicionarTurma /></motion.div>} />
          <Route path="" element={<motion.div {...pageTransition}><HomeAdmEscolar /></motion.div>} />
          <Route path="TurmasAdm" element={<motion.div {...pageTransition}><TurmasAdm /></motion.div>} />
          <Route path="PerfilAdm" element={<motion.div {...pageTransition}><PerfilAdm /></motion.div>} />
          <Route path="ResetAluno" element={<motion.div {...pageTransition}><ResetAluno /></motion.div>} />
        </Route>
<Route>
            <Route path="Escola" element={<motion.div {...pageTransition}><LoginAdmEscolar /></motion.div>} />

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
