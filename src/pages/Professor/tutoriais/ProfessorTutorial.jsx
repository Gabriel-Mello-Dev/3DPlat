import { useEffect, useRef, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

function ProfessorTutorial({ user }) {
  const driverRef = useRef(null);
  const [tutorialAtivo, setTutorialAtivo] = useState(false);

 useEffect(() => {
  if (!user) return;

  const fetchUser = async () => {
    try {
      const userRef = doc(db, "professores", user);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();

        // Ativa tutorial se ainda não viu no banco nem no localStorage
        if (!data.jaViuTutorialProfessor && !localStorage.getItem("jaViuTutorialProfessor")) {
          setTutorialAtivo(true);
        }

        setUser({ ...data, id: user }); // guarda os dados do usuário
      }
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
    }
  };

  fetchUser();
}, [user]);


  useEffect(() => {
    if (!tutorialAtivo) return;

    driverRef.current = driver({
      showProgress: true,
      animate: true,
      steps: [
        { element: "#turmas", popover: { title: "Suas Turmas", description: "Aqui você pode ver as estatisticas das suas turmas", side: "bottom", align: "start" }, shape: "rect", padding: 10 },
        { element: "#editarPerfil", popover: { title: "Editar Seu Perfil", description: "Aqui você pode ver seu login, senha, formações, escolas que trabalha, e editar estas informações", side: "bottom", align: "start" }, shape: "rect", padding: 10 },
        { element: "#ConferirJogos", popover: { title: "Confira os jogos", description: "Aqui você pode conferir os jogos que seus alunos tem acesso", side: "bottom", align: "start" }, shape: "rect", padding: 10 },
       
      ]
    });

    driverRef.current.drive();

    const userRef = doc(db, "professores", user);
    updateDoc(userRef, { jaViuTutorialProfessor: true }).catch(err => console.error("Erro ao atualizar tutorial no BD:", err));

  }, [tutorialAtivo, user]);

  return null;
}

export { ProfessorTutorial };
