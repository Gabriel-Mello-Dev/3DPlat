import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {Sidebar} from '../../components'; // ajuste o caminho conforme sua estrutura
// import Head, Foot se precisar — eu omiti Head para evitar duplicação, mas você pode reintegrar.
const LayoutProfessor = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (!window.confirm('Deseja sair da sua sessão?')) return;
    // Remova apenas chaves relevantes
    localStorage.removeItem('admEscolarId');
    localStorage.removeItem('professorId');
    localStorage.removeItem('userType');
    // redireciona para login
    navigate('/Escola', { replace: true });
  };

  const goProfile = () => {
    navigate('/PerfilAdm');
  };

  return (

    <div className="flex min-h-screen">
      
      <Sidebar />

      <div className="flex-1 bg-[#dbe7f6] min-h-screen" >
        {/* Top bar com perfil e sair à direita */}
        <header className="flex items-center justify-end gap-4 p-6">
          <button
            onClick={goProfile}
            className="flex items-center gap-2 text-[#27406a] bg-white/60 px-3 py-1 rounded-full hover:brightness-95"
            aria-label="Perfil"
          >
            <span className="hidden sm:inline" style={{fontWeight: 800}}>Perfil</span>
            <span className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow">👤</span>
          </button>

          <button
            onClick={handleLogout}
            className="text-[#27406a] hover:text-white border border-[#27406a] hover:bg-[#c94b4b] transition-colors px-3 py-1 rounded-md"
            aria-label="Sair"
          >
            Sair
          </button>
        </header>

        {/* Área principal onde as páginas aparecem */}
        <main className="max-w-6xl p-6 mx-auto">
          {/* Se quiser um título global, descomente abaixo e deixe cada página controlar o seu título */}
          {/* <h1 className="text-2xl font-semibold text-center text-[#27406a] mb-6">Painel Administrativo Escolar</h1> */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export { LayoutProfessor };