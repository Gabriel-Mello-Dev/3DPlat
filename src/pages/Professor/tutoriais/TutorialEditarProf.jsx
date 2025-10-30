// src/pages/professor/tutoriais/TutorialEditarProf.jsx
import { useEffect, useRef, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../api/fireBase";

function TutorialEditarProf({ user }) {
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

          // só ativa o tutorial se o professor ainda não tiver visto
          if (!data.jaViuTutorialEditarProf) {
            setTutorialAtivo(true);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar usuário:", err);
      }
    };

    fetchUser();
  }, [user]);

  useEffect(() => {
    if (!tutorialAtivo) return;

    // espera o DOM renderizar
    const iniciarTutorial = async () => {
      await new Promise(r => setTimeout(r, 300)); // aguarda 300ms

      driverRef.current = driver({
        showProgress: true,
        animate: true,
        steps: [
          {
            element: "#nome", // Nome
            popover: {
              title: "Nome do Professor",
              description: "Digite ou edite o nome do professor aqui",
              side: "bottom",
            },
            shape: "rect",
            padding: 10,
          },
          {
            element: "#formacoes", // Formações
            popover: {
              title: "Formações",
              description: "Adicione as formações do professor e pressione Enter",
              side: "bottom",
            },
            shape: "rect",
            padding: 10,
          },
          {
            element: "#disciplinas", // Disciplinas
            popover: {
              title: "Disciplinas",
              description: "Adicione as disciplinas que o professor ensina",
              side: "bottom",
            },
            shape: "rect",
            padding: 10,
          },
          {
            element: "#escolas", // Escolas
            popover: {
              title: "Escolas",
              description: "Adicione as escolas que o professor leciona",
              side: "bottom",
            },
            shape: "rect",
            padding: 10,
          },
          {
            element: "#cidades", // Cidades
            popover: {
              title: "Cidades",
              description: "Adicione as cidades onde o professor trabalha",
              side: "bottom",
            },
            shape: "rect",
            padding: 10,
          },
          {
            element: "#senha",
            popover: {
              title: "Mudar Senha",
              description: "Clique aqui para alterar sua senha",
              side: "bottom",
            },
            shape: "rect",
            padding: 10,
          },
          {
            element: "#salvar",
            popover: {
              title: "Salvar Alterações",
              description: "Clique aqui para salvar todas as alterações feitas",
              side: "top",
            },
            shape: "rect",
            padding: 10,
          },
        ],
      });

      driverRef.current.drive();

      // marca que o professor viu o tutorial
      const userRef = doc(db, "professores", user);
      updateDoc(userRef, { jaViuTutorialEditarProf: true }).catch(err =>
        console.error("Erro ao atualizar tutorial no BD:", err)
      );
    };

    iniciarTutorial();
  }, [tutorialAtivo, user]);

  return null;
}

export { TutorialEditarProf };
