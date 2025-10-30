// src/pages/dev/LayoutDev.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Gamepad2, PlusSquare, Settings } from "lucide-react";

function LayoutDev() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("devLogged");
    localStorage.removeItem("devId");
    navigate("/HomeDev");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 p-4 text-white bg-gray-900">
        <h1 className="mb-6 text-2xl font-bold text-center text-blue-400">
          Painel Dev
        </h1>

        <nav className="flex flex-col flex-1 gap-3">
          <NavLink
            to="/CriarJogo"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded-lg transition ${
                isActive ? "bg-blue-600" : "hover:bg-gray-700"
              }`
            }
          >
            <PlusSquare size={20} />
            Criar Jogo
          </NavLink>

          <NavLink
            to="/MeusJogos"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded-lg transition ${
                isActive ? "bg-blue-600" : "hover:bg-gray-700"
              }`
            }
          >
            <Gamepad2 size={20} />
            Meus Jogos
          </NavLink>

          <NavLink
            to="/ConfigDev"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded-lg transition ${
                isActive ? "bg-blue-600" : "hover:bg-gray-700"
              }`
            }
          >
            <Settings size={20} />
            Configurações
          </NavLink>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 p-2 mt-auto transition-colors rounded-lg hover:bg-red-600"
        >
          <LogOut size={20} />
          Sair
        </button>
      </aside>

      {/* Área de conteúdo */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet /> {/* Aqui as páginas filhas serão renderizadas */}
      </main>
    </div>
  );
}

export  {LayoutDev};
