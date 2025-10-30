import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../api/fireBase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { TutorialEditarProf } from '../tutoriais/TutorialEditarProf';
import { validarEmail } from "../../../utils/validacoes";

const EditarProf = () => {
  const navigate = useNavigate();
  const professorId = localStorage.getItem("professorId");
  const userType = localStorage.getItem("userType");

  const [professor, setProfessor] = useState(null);
const [email, setEmail] = useState("");

  const [nome, setNome] = useState("");
  const [formacoes, setFormacoes] = useState([]);
  const [inputFormacao, setInputFormacao] = useState("");
  const [disciplinas, setDisciplinas] = useState([]);
  const [inputDisciplina, setInputDisciplina] = useState("");

  const [escolas, setEscolas] = useState([]);
  const [inputEscola, setInputEscola] = useState("");

  const [cidades, setCidades] = useState([]);
  const [inputCidade, setInputCidade] = useState("");

  // Turmas
  const [todasTurmas, setTodasTurmas] = useState([]); // todas as turmas do Firebase
  const [turmasSelecionadas, setTurmasSelecionadas] = useState([]); // turmas do professor
  const [filtroTurma, setFiltroTurma] = useState(""); // busca

  useEffect(() => {
    if (!professorId || userType !== "professor") {
      alert("Você precisa estar logado como professor!");
      navigate("/");
      return;
    }

    const fetchProfessor = async () => {
      try {
        const profSnap = await getDocs(collection(db, "professores"));
        const profDoc = profSnap.docs.find(d => d.id === professorId);
        if (!profDoc) {
          alert("Professor não encontrado!");
          navigate("/");
          return;
        }
        const profData = { id: profDoc.id, ...profDoc.data() };
        setProfessor(profData);
setEmail(profData.email || "");

        // Preencher campos
        setNome(profData.nome || "");
        setFormacoes(profData.formacoes || []);
        setDisciplinas(profData.disciplinas || []);
        setEscolas(profData.escolas || []);
        setCidades(profData.cidades || []);
        setTurmasSelecionadas(profData.turmas || []);
      } catch (err) {
        console.error(err);
        alert("Erro ao carregar dados!");
      }
    };

    const fetchTurmas = async () => {
      try {
        const turmasSnap = await getDocs(collection(db, "turmas"));
        const turmas = turmasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTodasTurmas(turmas);
      } catch (err) {
        console.error("Erro ao carregar turmas:", err);
      }
    };

    fetchProfessor();
    fetchTurmas();
  }, [professorId, userType, navigate]);

  const addItemToList = (item, listSetter, inputSetter, list) => {
    const trimmed = item.trim();
    if (trimmed && !list.includes(trimmed)) {
      listSetter([...list, trimmed]);
      inputSetter("");
    }
  };

  const removeItemFromList = (item, listSetter, list) => {
    listSetter(list.filter(i => i !== item));
  };

  // Filtra turmas pelas cidades e escolas do professor
  const turmasFiltradas = todasTurmas.filter(t => {
    const turmaEscola = String(t.escola || "").trim();
    const turmaCidade = String(t.cidade || "").trim();
    const turmaNome = String(t.nome || t.nomeTurma || "").toLowerCase();

 const matchEscola =
  escolas.length === 0 ||
  escolas.some(e => String(e).trim().toLowerCase() === turmaEscola.toLowerCase());

const matchCidade =
  cidades.length === 0 ||
  cidades.some(c => String(c).trim().toLowerCase() === turmaCidade.toLowerCase());

    const matchFiltro = !filtroTurma || turmaNome.includes(filtroTurma.toLowerCase());

    return matchEscola && matchCidade && matchFiltro;
  });

  const toggleTurma = (turmaId) => {
    setTurmasSelecionadas(prev =>
      prev.includes(turmaId) ? prev.filter(id => id !== turmaId) : [...prev, turmaId]
    );
  };

  const salvarAlteracoes = async () => {
    if (!nome || formacoes.length === 0) {
      alert("Preencha nome e pelo menos uma formação!");
      return;
    }

if (!validarEmail(email)) {
  alert("Digite um email válido!");
  return;
}
    try {
      const profRef = doc(db, "professores", professorId);
 const atualizado = {
  ...professor,
  nome,
  email,
  formacoes,
  disciplinas,
  escolas,
  cidades,
  turmas: turmasSelecionadas
};
await updateDoc(profRef, atualizado);

      alert("Informações atualizadas com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar professor!");
    }
  };

  if (!professor) return <p className="p-6 text-center text-gray-600">Carregando...</p>;

  return (
    <div className="min-h-screen pb-24 min-w-[60vw]">
      {/* Top greeting like in the screenshot */}
      <header className="py-6">
        <h1 className="text-2xl font-extrabold text-center text-blue-800 sm:text-3xl text-[#314c89]">Bem Vindo, Professor!</h1>
      </header>

      {/* Card container */}
      <main className="relative px-6 py-8 mx-auto bg-white shadow-md rounded-2xl sm:px-10">
        {/* Back link */}

        <h2 className="mb-6 text-xl font-semibold text-blue-800 text-[#314c89] text-[2rem]">Editar Perfil</h2>

        {/* Nome */}
        <div id="nome" className="mb-6">
          <label className="block mb-2 font-medium text-blue-800 text-[1.5rem]">Nome Completo</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full max-w-lg px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{background: "#e9e9e9", color: "black"}}
          />
        </div>

{/* Email */}
<div id="email" className="mb-6">
  <label className="block mb-2 font-medium text-blue-800 text-[1.5rem]">Email</label>
  <input
    type="email"
    value={email}
    onChange={e => setEmail(e.target.value)}
    className="w-full max-w-lg px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
    placeholder="Digite seu email"
    style={{background: "#e9e9e9", color: "black"}}
  />
</div>


        {/* Formações */}
        <div id="formacoes" className="mb-6">
          <label className="block mb-2 font-medium text-blue-800 text-[1.5rem]">Formações</label>
          <div className="max-w-lg">
            <input
              type="text"
              value={inputFormacao}
              onChange={e => setInputFormacao(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addItemToList(inputFormacao, setFormacoes, setInputFormacao, formacoes)}
              className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Digite e pressione Enter"
                          style={{background: "#e9e9e9", color: "black"}}

            />
            <div className="flex flex-wrap gap-2 mt-3">
              {formacoes.map(f => (
                <span key={f}  className="flex items-center gap-2 px-2 py-1 text-sm bg-[#e9e9e9] border border-gray-200 rounded text-black">
                  <span>{f}</span>
                  <button
                    onClick={() => removeItemFromList(f, setFormacoes, formacoes)}
                    className="text-xs text-gray-600 hover:text-red-600"
                    aria-label={`Remover ${f}`}
                  >×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Disciplinas */}
        <div id="disciplinas" className="mb-6">
          <label className="block mb-2 font-medium text-blue-800 text-[1.5rem]">Disciplinas</label>
          <div className="max-w-lg">
            <input
              type="text"
              value={inputDisciplina}
              onChange={e => setInputDisciplina(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addItemToList(inputDisciplina, setDisciplinas, setInputDisciplina, disciplinas)}
              className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Digite e pressione Enter"
                          style={{background: "#e9e9e9", color: "black"}}

            />
            <div className="flex flex-wrap gap-2 mt-3">
              {disciplinas.map(d => (
                <span key={d}  className="flex items-center gap-2 px-2 py-1 text-sm bg-[#e9e9e9] border border-gray-200 rounded text-black">
                  <span>{d}</span>
                  <button onClick={() => removeItemFromList(d, setDisciplinas, disciplinas)} className="text-xs text-gray-600 hover:text-red-600">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Escolas */}
        <div id="escolas" className="mb-6">
          <label className="block mb-2 font-medium text-blue-800 text-[1.5rem]">Escolas</label>
          <div className="max-w-lg">
            <input
              type="text"
              value={inputEscola}
              onChange={e => setInputEscola(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addItemToList(inputEscola, setEscolas, setInputEscola, escolas)}
              className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Digite e pressione Enter"
                          style={{background: "#e9e9e9", color: "black"}}

            />
            <div className="flex flex-wrap gap-2 mt-3">
              {escolas.map(e => (
                <span key={e}  className="flex items-center gap-2 px-2 py-1 text-sm bg-[#e9e9e9] border border-gray-200 rounded text-black">
                  <span>{e}</span>
                  <button onClick={() => removeItemFromList(e, setEscolas, escolas)} className="text-xs text-gray-600 hover:text-red-600">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Cidades */}
        <div id="cidades" className="mb-6">
          <label className="block mb-2 font-medium text-blue-800 text-[1.5rem]">Cidades</label>
          <div className="max-w-lg">
            <input
              type="text"
              value={inputCidade}
              onChange={e => setInputCidade(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addItemToList(inputCidade, setCidades, setInputCidade, cidades)}
              className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Digite e pressione Enter"
                          style={{background: "#e9e9e9", color: "black"}}

            />
            <div className="flex flex-wrap gap-2 mt-3">
              {cidades.map(c => (
                <span key={c}  className="flex items-center gap-2 px-2 py-1 text-sm bg-[#e9e9e9] border border-gray-200 rounded text-black">
                  <span>{c}</span>
                  <button onClick={() => removeItemFromList(c, setCidades, cidades)} className="text-xs text-gray-600 hover:text-red-600">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Turmas */}
        <div id="turmas" className="mb-12">
          <label className="block mb-2 font-medium text-blue-800 text-[1.5rem]">Turmas</label>
          <p className="mb-3 text-sm text-gray-500">
            Selecione as turmas das escolas e cidades onde você dá aula.
            {turmasSelecionadas.length > 0 && <span className="ml-1 text-gray-700">({turmasSelecionadas.length} selecionadas)</span>}
          </p>

          <div className="max-w-lg">
            <input
              type="search"
              className="w-full px-3 py-2 mb-3 text-sm bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Buscar turma..."
              value={filtroTurma}
              onChange={e => setFiltroTurma(e.target.value)}
                          style={{background: "#e9e9e9", color: "black"}}

            />

            {turmasFiltradas.length === 0 ? (
              <p className="text-sm text-gray-500">
                {escolas.length === 0 && cidades.length === 0
                  ? "Adicione escolas e cidades para ver as turmas disponíveis."
                  : "Nenhuma turma encontrada para suas escolas/cidades."}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {turmasFiltradas.map(t => {
                  const checked = turmasSelecionadas.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${
                        checked ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTurma(t.id)}
                        className="w-4 h-4"
                        
                      />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-800">{t.nome || t.nomeTurma || `Turma ${t.id}`}</div>
                        <div className="text-xs text-gray-500">{t.escola || "-"} • {t.cidade || "-"}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mudar senha link */}
        <div id="senha" className="mb-3">
          <a href="/TrocarSenha" className="text-sm underline text-[1.4rem] text-[#314c89] ">Mudar senha</a>
        </div>

        <TutorialEditarProf user={professorId} />

        {/* Save button positioned bottom-right like the photo */}
        <div id="salvar" className="absolute right-6 bottom-6">
          <button
            onClick={salvarAlteracoes}
            className="px-5 py-2 text-sm text-white bg-blue-600 rounded-full shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Salvar Alterações
          </button>
        </div>
      </main>
    </div>
  );
};

export { EditarProf };