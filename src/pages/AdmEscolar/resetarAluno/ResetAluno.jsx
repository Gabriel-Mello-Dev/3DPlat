// src/pages/admEscolar/ResetAluno/ResetAluno.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { app } from "../../../firebase/firebaseConfig";
import bcrypt from "bcryptjs";
import jsPDF from "jspdf";

const ResetAluno = () => {
  const db = getFirestore(app);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  useEffect(() => {
    const admId = localStorage.getItem("admEscolarId");
    if (!admId) {
      navigate("/", { replace: true });
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const admRef = doc(db, "AdminsEscolares", admId);
        const admSnap = await getDoc(admRef);
        if (!admSnap.exists()) {
          showMsg("error", "Admin não encontrado.");
          navigate("/", { replace: true });
          return;
        }

        const admData = admSnap.data();
        const turmasIds = (admData.turmas || []).map(String);
        const alunosIds = (admData.alunosCadastrados || []).map(String);

        const turmasSnap = await getDocs(collection(db, "turmas"));
        const todasTurmas = turmasSnap.docs.map(d => ({ docId: d.id, id: d.data().id || d.id, ...d.data() }));
        const minhasTurmas = todasTurmas.filter(t => turmasIds.includes(String(t.id)));
        setTurmas(minhasTurmas);

        const alunosSnap = await getDocs(collection(db, "alunos"));
        const todosAlunos = alunosSnap.docs.map(d => ({ docId: d.id, ...d.data() }));
        const meusAlunos = todosAlunos.filter(a => alunosIds.includes(String(a.docId)));
        setAlunos(meusAlunos);
      } catch (err) {
        console.error(err);
        showMsg("error", "Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [db, navigate]);

  const alunosFiltrados = useMemo(() => {
    let lista = alunos;
    if (turmaSelecionada) {
      lista = lista.filter(a => String(a.Turma) === String(turmaSelecionada.id));
    }
    return lista.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
  }, [alunos, turmaSelecionada]);

  const gerarSenhaAleatoria = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
  };

  const handleResetSenha = async () => {
    if (!alunoSelecionado) {
      showMsg("error", "Selecione um aluno primeiro.");
      return;
    }

    const novaSenha = gerarSenhaAleatoria();
    setResetting(true);

    try {
      const senhaHash = await bcrypt.hash(novaSenha, 10);
      const alunoRef = doc(db, "alunos", alunoSelecionado.docId);
      await updateDoc(alunoRef, { senha: senhaHash });

      showMsg("success", `Nova senha gerada: ${novaSenha}`);
      setAlunoSelecionado(prev => ({ ...prev, _novaSenhaTemp: novaSenha }));
    } catch (err) {
      console.error(err);
      showMsg("error", "Erro ao resetar senha.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center px-4 py-10 min-h-">
      <div className="p-8 bg-white shadow-lg w-[60vw] rounded-2xl">
        <h1 className="mb-6 text-2xl font-semibold text-center" style={{ color: "#3b4b8a" }}>
          Resetar Senha de Aluno
        </h1>

        {/* 1. Selecionar turma */}
        <div className="mb-5 text-center align-middle">
          <h2 className="mb-2 font-bold" style={{ color: "black", fontWeight: 600 }}>
            1. Selecione a Turma
          </h2>
          <select
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            value={turmaSelecionada?.id || ""}
            onChange={(e) => {
              const turma = turmas.find(t => t.id === e.target.value);
              setTurmaSelecionada(turma || null);
            }}
            style={{background: "#3a548e", }}
          >
            <option value="">Selecione <p className="text-end">▼</p></option>
            {turmas.map((t) => (
              <option key={t.docId} value={t.id}>
                {t.nome} - {t.ano} ({t.local || "Fatec Ourinhos"})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Selecionar aluno */}
        <div className="mb-5 text-center align-middle">
          <h2 className="mb-2 font-bold" style={{ color: "black", fontWeight: 600 }}>
            2. Selecione um Aluno
          </h2>
          <select
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            value={alunoSelecionado?.docId || ""}
            onChange={(e) => {
              const aluno = alunosFiltrados.find(a => a.docId === e.target.value);
              setAlunoSelecionado(aluno || null);
            }}
                        style={{background: "#3a548e", }}

          >
            <option value="">Selecione...</option>
            {alunosFiltrados.map((a) => (
              <option key={a.docId} value={a.docId}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Resetar Senha */}
      {alunoSelecionado && (
  <div className="flex items-center justify-center ">
    <div className="w-1/2 text-center rounded-md">
      <h2 className="mb-3 font-bold" style={{ color: "black", fontWeight: 600 }}>
        3. Resetar Senha
      </h2>

      <div className="bg-[#2f3b86] text-white rounded-lg p-4 mb-4 w-full text-center">
        <p>
          <strong>Aluno selecionado:</strong> {alunoSelecionado.nome}
        </p>
        <p>
          <strong>Login:</strong> {alunoSelecionado.Login}
        </p>
      </div>

      <button
        className="w-1/2 bg-[#4c74cd] text-white py-2 rounded-md font-semibold transition max-h-[2.5rem] text-[1rem]"
        onClick={handleResetSenha}
        disabled={resetting}
      >
        {resetting ? "Gerando..." : "Gerar nova senha"}
      </button>

      {alunoSelecionado._novaSenhaTemp && (
        <div className="p-3 mt-4 text-center border border-blue-300 rounded-md bg-blue-50">
          <p className="mb-1 font-semibold" style={{ color: "#1d3aa6" }}>
            Nova senha:
          </p>
          <code className="px-3 py-1 text-blue-700 bg-white border rounded">
            {alunoSelecionado._novaSenhaTemp}
          </code>
        </div>
      )}
    </div>
  </div>
)}


        {msg.text && (
          <p
            className={`mt-4 text-center ${
              msg.type === "error" ? "text-red-600" : "text-green-600"
            }`}
            style={{ fontWeight: 600 }}
          >
            {msg.text}
          </p>
        )}
      </div>
    </main>
  );
};

export { ResetAluno };
