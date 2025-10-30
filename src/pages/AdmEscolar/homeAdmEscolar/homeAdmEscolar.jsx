import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import style from "./HomeAdmEscolar.module.css";

const HomeAdmEscolar = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("admEscolarId");
  const userType = localStorage.getItem("userType");

  // Redirecionamento de sessão
  useEffect(() => {
    if (!userId || userType !== "admEscolar") {
      // Evite alert; use página/Toast. Se não houver, mantenha simples:
      // window.alert("Você precisa estar logado como Administrador Escolar.");
      navigate("/Escola", { replace: true });
    }
  }, [userId, userType, navigate]);

  // Logout seguro e confirmável
  const handleLogout = useCallback(() => {
    const confirmed = window.confirm("Deseja sair da sua sessão?");
    if (!confirmed) return;

    // Remova apenas o necessário (evita apagar preferências de outros módulos)
    localStorage.removeItem("admEscolarId");
    localStorage.removeItem("userType");

    // Opcional: invalidar token/cookie no backend aqui

    navigate("/login", { replace: true });
  }, [navigate]);

 return (
    <div className={style['no-retropix']}>
  
  <main
      className="min-h-screen bg-[#2f3b56] p-8 font-sans"
      role="main"
      aria-labelledby="pageTitle"
    >

      <nav
        className="grid max-w-6xl grid-cols-1 gap-8 mx-auto mb-8 sm:grid-cols-2 lg:grid-cols-3"
        role="navigation"
        aria-label="Ações principais do painel"
      >
        {/* Card 1 */}
        <button
          type="button"
          onClick={() => navigate("/PerfilAdm")}
          className="flex flex-col items-center justify-center gap-3 py-8 px-6 bg-[#b8c7d6] text-[#0b1a2a] rounded-[1.25rem] hover:brightness-95 transition-shadow duration-200 shadow-sm min-h-[120px]"
          aria-label="Editar meu perfil"
        >
          <span aria-hidden="true" className="text-5xl leading-none">👩‍💼</span>
          <span className="text-sm font-medium">Editar Meu Perfil</span>
        </button>

        {/* Card 2 */}
        <button
          type="button"
          onClick={() => navigate("/turmasAdm")}
          className="flex flex-col items-center justify-center gap-3 py-8 px-6 bg-[#b8c7d6] text-[#0b1a2a] rounded-[1.25rem] hover:brightness-95 transition-shadow duration-200 shadow-sm min-h-[120px]"
          aria-label="Ver professores"
        >
          <span aria-hidden="true" className="text-5xl leading-none">👩‍🏫</span>
          <span className="text-sm font-medium">Ver Professores</span>
        </button>

        {/* Card 3 (Cadastrar) */}
        <button
          type="button"
          onClick={() => navigate("/CriarUser")}
          className="flex flex-col items-center justify-center gap-3 py-8 px-6 bg-[#b8c7d6] text-[#0b1a2a] rounded-[1.25rem] hover:brightness-95 transition-shadow duration-200 shadow-sm min-h-[120px]"
          aria-label="Cadastrar"
        >
          <span aria-hidden="true" className="text-6xl leading-none">＋</span>
          <span className="text-sm font-medium">Cadastrar</span>
        </button>

        {/* Card 4 (Resetar Senhas) */}
        <button
          type="button"
          onClick={() => navigate("/ResetAluno")}
          className="flex flex-col items-center justify-center gap-3 py-8 px-6 bg-[#b8c7d6] text-[#0b1a2a] rounded-[1.25rem] hover:brightness-95 transition-shadow duration-200 shadow-sm min-h-[120px]"
          aria-label="Resetar senhas"
        >
          <span aria-hidden="true" className="text-5xl leading-none">🔒</span>
          <span className="text-sm font-medium">Resetar Senhas</span>
        </button>

        {/* Card 5 (Conferir Jogos) */}
        <button
          type="button"
          onClick={() => navigate("/JogosProf")}
          className="flex flex-col items-center justify-center gap-3 py-8 px-6 bg-[#b8c7d6] text-[#0b1a2a] rounded-[1.25rem] hover:brightness-95 transition-shadow duration-200 shadow-sm min-h-[120px]"
          aria-label="Conferir jogos"
        >
          <span aria-hidden="true" className="text-5xl leading-none">🎮</span>
          <span className="text-sm font-medium">Conferir Jogos</span>
        </button>
      </nav>

      <div className="flex justify-start max-w-6xl pt-8 mx-auto mt-auto">
        <button
          type="button"
          onClick={handleLogout}
          className="px-8 py-3 bg-[#c94b4b] text-white font-semibold rounded-lg shadow hover:brightness-90 transition-all duration-200"
          aria-label="Encerrar sessão"
        >
          Sair
        </button>
      </div>
      
    </main>
          </div>

);
};

export { HomeAdmEscolar };