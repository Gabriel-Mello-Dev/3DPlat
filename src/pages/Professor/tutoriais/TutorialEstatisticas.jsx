// src/pages/professor/tutoriais/TutorialEstatisticas.jsx
import { useEffect, useRef, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

function TutorialEstatisticas({ user }) {
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

          if (!data.jaViuTutorialProfessor) {
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

  const steps = [
    {
      element: "#turmas",
      popover: {
        title: "Suas Turmas",
        description: "Clique em uma turma para ver os alunos e estatísticas",
        side: "right",
        align: "center",
      },
      onNext: () => {
        const el = document.querySelector("#turmas li");
        if (el) el.click(); // seleciona a primeira turma automaticamente
      },
    },
    {
      element: "#alunos",
      popover: {
        title: "Alunos da Turma",
        description: "Agora você pode selecionar um aluno para ver estatísticas detalhadas",
        side: "right",
        align: "center",
      },
      onNext: () => {
        const el = document.querySelector("#alunos li");
        if (el) el.click(); // seleciona o primeiro aluno automaticamente
      },
    },
    {
      element: "#painelPrincipal", // painel central onde os gráficos aparecem
      popover: {
        title: "Paniel Principal",
        description: "Aqui você vê os gráficos detalhados da turma ou aluno selecionado",
        side: "top",
        align: "center",
      },
    },
    {
      element: "#botaoPDF",
      popover: {
        title: "Gerar PDF",
        description: "Clique aqui para gerar o relatório da turma ou do aluno",
        side: "top",
        align: "center",
      },
    },
  ];

  // Função para aguardar elemento aparecer no DOM
  const waitForElement = (selector, timeout = 3000) =>
    new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        reject(`Elemento ${selector} não apareceu a tempo`);
      }, timeout);
    });

  // Espera cada passo antes de mostrar o próximo
  const startTutorial = async () => {
    for (const step of steps) {
      try {
        await waitForElement(step.element);
        driverRef.current = driver({ steps: [step], showProgress: true });
        driverRef.current.drive();

        if (step.onNext) step.onNext();

        // aguarda 1s para o usuário ver o popover antes de continuar
        await new Promise(res => setTimeout(res, 3000));
      } catch (err) {
        console.warn(err);
      }
    }
  };

  startTutorial();

  const userRef = doc(db, "professores", user);
  updateDoc(userRef, { jaViuTutorialProfessor: false }).catch(err =>
    console.error("Erro ao atualizar tutorial no BD:", err)
  );
}, [tutorialAtivo, user]);



  return null;
}

export { TutorialEstatisticas };
