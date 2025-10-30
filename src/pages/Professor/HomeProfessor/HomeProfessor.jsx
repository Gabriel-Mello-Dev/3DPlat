import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import style from "./homeProfessor.module.css";
import { ProfessorTutorial} from '../tutoriais/ProfessorTutorial'

const HomeProfessor = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("professorId");
  const userType = localStorage.getItem("userType");

  useEffect(() => {
    if (!userId || userType !== "professor") {
      alert("Você precisa estar logado como professor!");
      navigate("/Professor");
    }
  }, [userId, userType, navigate]);

  const logout = () => {
    localStorage.removeItem("professorId");
    localStorage.removeItem("userType");
    navigate("/Professor");
  };

  return (
    <div className={style.container}>
      <h1 className={style.title}>Bem-vindo ao Painel do Professor!</h1>

      <div className={style.buttonContainer}>
        <div id="turmas">  
        <button className={style.mainButton} onClick={() => navigate("/Turmas")}>
          Minhas Turmas
        </button>
</div>

        <div id="editarPerfil">  

        <button className={style.mainButton} onClick={() => navigate("/PerfilProfessor")}>
          Editar Perfil
        </button>
        </div>


        <div id="ConferirJogos">  

        <button className={style.mainButton} onClick={() => navigate("/JogosProf")}>
         Conferir Jogos
        </button>

      </div>




      </div>

      <button className={style.logoutButton} onClick={logout}>
        Logout
      </button>

      <ProfessorTutorial user={userId}/>
    </div>
  );
};

export { HomeProfessor };
