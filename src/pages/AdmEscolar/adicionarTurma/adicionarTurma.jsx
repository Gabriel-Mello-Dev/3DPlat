import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase/firebaseConfig";
import { collection, getDocs, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";

const AdicionarTurma = () => {
  const navigate = useNavigate();
  const admEscolarId = localStorage.getItem("admEscolarId");
  const userType = localStorage.getItem("userType");

  const [admEscolar, setAdmEscolar] = useState({ cidades: [], escolas: [], turmas: [] });
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState("");
  const [nomeTurma, setNomeTurma] = useState("");
  const [anoTurma, setAnoTurma] = useState(new Date().getFullYear().toString());
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [escolaSelecionada, setEscolaSelecionada] = useState("");

  useEffect(() => {
    if (!admEscolarId || userType !== "admEscolar") {
      alert("Você precisa estar logado como Admin Escolar!");
      navigate("/Escola");
      return;
    }

    const fetchData = async () => {
      try {
        // buscar admin escolar
        const admRef = doc(db, "AdminsEscolares", admEscolarId);
        const admSnap = await getDoc(admRef);
        if (!admSnap.exists()) {
          alert("Admin Escolar não encontrado!");
          navigate("/Escola");
          return;
        }
        const admData = admSnap.data();
        setAdmEscolar({ id: admEscolarId, ...admData });

        // turmas cadastradas (todas)
        const turmasSnap = await getDocs(collection(db, "turmas"));
        const todasTurmas = turmasSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // filtrar pelas turmas do admin (se houver)
        const filtradas = todasTurmas.filter(t => admData.turmas?.includes(t.id));
        setTurmas(filtradas);

        // defaults
        if (admData.cidades?.length > 0) setCidadeSelecionada(admData.cidades[0]);
        if (admData.escolas?.length > 0) setEscolaSelecionada(admData.escolas[0]);
        if (filtradas.length > 0) setTurmaSelecionadaId(filtradas[0].id);
      } catch (err) {
        console.error(err);
        alert("Erro ao carregar dados!");
      }
    };

    fetchData();
  }, [admEscolarId, userType, navigate]);

  const adicionarTurma = async () => {
    if (!nomeTurma || !anoTurma || !cidadeSelecionada || !escolaSelecionada) {
      alert("Preencha todos os campos da turma!");
      return;
    }

    try {
      // verificar se já existe (entre turmas do admin)
      let turmaExistente = turmas.find(t =>
        t.nome === nomeTurma &&
        String(t.ano) === String(anoTurma) &&
        t.cidade === cidadeSelecionada &&
        t.escola === escolaSelecionada
      );

      if (!turmaExistente) {
        // buscar todos os documentos de turmas para gerar novo ID numérico
        const turmasSnap = await getDocs(collection(db, "turmas"));
        const nums = turmasSnap.docs
          .map(d => {
            const fromData = d.data()?.id ?? d.id;
            const n = parseInt(fromData, 10);
            return Number.isNaN(n) ? null : n;
          })
          .filter(n => n !== null);

        const novoId = nums.length > 0 ? String(Math.max(...nums) + 1) : "1";

        turmaExistente = {
          id: novoId,
          nome: nomeTurma,
          ano: anoTurma,
          cidade: cidadeSelecionada,
          escola: escolaSelecionada,
          alunos: []
        };

        await setDoc(doc(db, "turmas", turmaExistente.id), turmaExistente);
      }

      // atualizar lista de turmas do admin
      const admRef = doc(db, "AdminsEscolares", admEscolarId);
      const novasTurmas = [...(admEscolar.turmas || []), turmaExistente.id];
      await updateDoc(admRef, { turmas: novasTurmas });

      alert("Turma adicionada com sucesso!");
      navigate("/CriarUser");
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar turma!");
    }
  };

  return (
    <div className="flex items-start min-h-screen py-8 ">
  <div className="w-full max-w-2xl p-6 mx-auto bg-white rounded-lg shadow">
    <h2
      className="mb-6 text-xl font-semibold text-blue-700 text-start"
      style={{ color: "#6277a5", fontWeight: 800 }}
    >
      Cadastrar Turma
    </h2>

   <div className="mb-4">
  <label
    className="block mb-2 text-sm font-medium text-gray-700"
    style={{ color: "black", fontWeight: 600 }}
  >
    Turmas Registradas
  </label>

  <div className="w-full px-3 py-2 bg-[#e9e9e9] rounded-md text-black">
    {turmas.length === 0 ? (
      <p className="italic text-gray-500">Nenhuma turma registrada</p>
    ) : (
      <ul className="pl-5 space-y-1 list-disc">
        {turmas.map(t => (
          <li key={t.id}>
            {t.nome} - {t.ano} ({t.escola} {t.cidade ? `/ ${t.cidade}` : ""})
          </li>
        ))}
      </ul>
    )}
  </div>
</div>

 <div className="mb-4">
  <label
    className="block mb-2 text-sm font-medium text-gray-700"
    style={{ color: "black", fontWeight: 600 }}
  >
    Cidade
  </label>
  <select
    value={cidadeSelecionada}
    onChange={(e) => setCidadeSelecionada(e.target.value)}
    className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md appearance-none"
    style={{ color: "black", background: "#e9e9e9" }}
  >
    {(admEscolar.cidades || []).length === 0 ? (
      <option value="">Nenhuma cidade cadastrada</option>
    ) : (
      admEscolar.cidades.map(c => (
        <option key={c} value={c}>
          {c}
        </option>
      ))
    )}
  </select>
</div>


    <div className="mb-4">
      <label
        className="block mb-2 text-sm font-medium text-gray-700"
        style={{ color: "black", fontWeight: 600 }}
      >
        Escola
      </label>
      <select
        value={escolaSelecionada}
        onChange={(e) => setEscolaSelecionada(e.target.value)}
        className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md appearance-none"
        style={{ color: "black", background: "#e9e9e9" }}
      >
        {(admEscolar.escolas || []).map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>

    <div className="mb-4">
      <label
        className="block mb-2 text-sm font-medium text-gray-700"
        style={{ color: "black", fontWeight: 600 }}
      >
        Nome da Turma
      </label>
      <input
        value={nomeTurma}
        onChange={e => setNomeTurma(e.target.value)}
        placeholder="Nome"
        className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md"
        style={{ color: "black", background: "#e9e9e9" }}
      />
    </div>

    <div className="mb-6">
      <label
        className="block mb-2 text-sm font-medium text-gray-700"
        style={{ color: "black", fontWeight: 600 }}
      >
        Ano da Turma
      </label>
      <input
        type="number"
        value={anoTurma}
        onChange={e => setAnoTurma(e.target.value)}
        className="w-full px-3 py-2 text-gray-800 bg-gray-100 rounded-md"
        style={{ color: "black", background: "#e9e9e9" }}
      />
    </div>

    <div className="flex justify-center">
      <button
        onClick={adicionarTurma}
        className="px-6 py-2 text-white transition bg-blue-600 rounded-full shadow hover:bg-blue-700"
      >
        Adicionar Turma
      </button>
    </div>
  </div>
</div>
  );
};

export { AdicionarTurma };