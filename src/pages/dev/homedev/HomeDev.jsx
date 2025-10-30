import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

function HomeDev() {
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarJogos() {
      try {
        const devId = localStorage.getItem("devId");
        if (!devId) {
          console.warn("Nenhum devId encontrado no localStorage");
          setLoading(false);
          return;
        }

        const jogosRef = collection(db, "jogos");
        const q = query(jogosRef, where("devId", "==", devId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.log("⚠️ Nenhum jogo encontrado para este dev");
          setJogos([]);
        } else {
          const lista = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setJogos(lista);
        }
      } catch (err) {
        console.error("Erro ao carregar jogos:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarJogos();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600">Carregando jogos...</p>;
  }

  if (jogos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg text-gray-500">Você ainda não criou nenhum jogo 😅</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="mb-6 text-3xl font-bold text-gray-800">Meus Jogos</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jogos.map((jogo) => (
          <div
            key={jogo.id}
            className="flex flex-col p-4 transition bg-white shadow-lg rounded-xl hover:shadow-xl"
          >
            <h3 className="mb-2 text-xl font-semibold">{jogo.nome || "Sem nome"}</h3>
            {jogo.image && (
              <img
                src={jogo.image}
                alt={jogo.nome}
                className="object-cover w-full h-40 mb-3 rounded-lg"
              />
            )}
            <p className="text-sm text-gray-600">
              Descrição: {jogo.descricao || "Sem descrição"}
            </p>
            <a
              href={jogo.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 mt-auto text-center text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Conferir na meta store
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export  {HomeDev};
