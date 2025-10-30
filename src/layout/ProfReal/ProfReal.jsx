import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Head, Foot } from "../../components";
import style from "../layout.module.css"; // usa o CSS padrão do layout

const ProfReal = ({ children }) => {
  const [showStatsButton, setShowStatsButton] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const professorId = localStorage.getItem("professorId");
    if (professorId) {
      setShowStatsButton(true);
    }
  }, []);

  const buttons = [
   
  ];

  // Adiciona botão de estatísticas se o professor estiver logado
  

  return (
            <div className={style['no-retropix']}>
    
    <div className={style.layout}>
     
     
            <Outlet/>

      <main >{children}</main>
      <Foot text="Sistema Escolar - Professor" />
    </div>
    </div>
  );
};

export { ProfReal };