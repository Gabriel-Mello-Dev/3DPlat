import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../api/fireBase"; 
import { collection, getDocs, query, where, doc, setDoc, getDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";
import { validarEmail } from "../../../utils/validacoes";

const CriarProfessor = () => {
  const [nome, setNome] = useState("");
  const [formacoes, setFormacoes] = useState([]);
  const [inputFormacao, setInputFormacao] = useState("");

  const [disciplinas, setDisciplinas] = useState([]);
  const [inputDisciplina, setInputDisciplina] = useState("");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [escolas, setEscolas] = useState([]);
  const [inputEscola, setInputEscola] = useState("");

  const [cidades, setCidades] = useState([]);
  const [inputCidade, setInputCidade] = useState("");

  const [turmas, setTurmas] = useState([]);
  const [turmasSelecionadas, setTurmasSelecionadas] = useState([]);
  const [inputTurma, setInputTurma] = useState("");

  const [logins, setLogins] = useState(10);

  const navigate = useNavigate();

  // Validação de login Admin Escolar
  useEffect(() => {
    const admEscolarId = localStorage.getItem("admEscolarId");
    const userType = localStorage.getItem("userType");
    if (!admEscolarId || userType !== "admEscolar") {
      alert("Você precisa estar logado como Admin Escolar!");
      navigate("/Escola");
      return;
    }
  }, [navigate]);

  // Carregar dados do Admin Escolar (escolas, cidades e turmas)
  useEffect(() => {
    const loadDadosAdmin = async () => {
      try {
        const admEscolarId = localStorage.getItem("admEscolarId");
        if (!admEscolarId) return;

        const admRef = doc(db, "AdminsEscolares", admEscolarId);
        const admSnap = await getDoc(admRef);
        if (!admSnap.exists()) return;

        const admData = admSnap.data();
        setEscolas(Array.isArray(admData.escolas) ? admData.escolas : []);
        setCidades(Array.isArray(admData.cidades) ? admData.cidades : []);

        const turmasRef = collection(db, "turmas");
        const turmasSnap = await getDocs(turmasRef);
        const turmasDoAdmin = turmasSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(t => (admData.turmas || []).includes(t.id));

        setTurmas(turmasDoAdmin);
      } catch (err) {
        console.error("Erro ao carregar dados do admin:", err);
      }
    };
    loadDadosAdmin();
  }, []);

  // Adicionar item em lista
  const addItemToList = (item, listSetter, inputSetter, list) => {
    const trimmed = item.trim();
    if (trimmed && !list.includes(trimmed)) {
      listSetter([...list, trimmed]);
      inputSetter("");
    }
  };

  // Remover item da lista
  const removeItemFromList = (item, listSetter, list) => {
    listSetter(list.filter(i => i !== item));
  };

  // Criar Professor
  const criarProfessor = async () => {
    if (!nome || !email || !senha || formacoes.length === 0 || !inputCidade || !inputEscola || turmasSelecionadas.length === 0) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }
  if (!validarEmail(email)) {
    alert("Digite um email válido!");
    return;
  }


    // gerar hash da senha
    const salt = await bcrypt.genSalt(12);
    const hashSenha = await bcrypt.hash(senha, salt);

    try {
      const professoresRef = collection(db, "professores");
      const q = query(professoresRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        alert("Professor já cadastrado!");
        return;
      }

      const todosProfessoresSnap = await getDocs(professoresRef);
      const todosIds = todosProfessoresSnap.docs.map(doc => parseInt(doc.data().id, 10)).filter(n => !isNaN(n));
      const maiorId = todosIds.length > 0 ? Math.max(...todosIds) : 100;
      const novoId = String(maiorId + 1);

      const admEscolarId = localStorage.getItem("admEscolarId");

      const novoProfessor = {
        id: novoId,
        nome,
        formacoes,
        disciplinas,
        email,
        senha: hashSenha,
        tipo: "professor",
        adminId: admEscolarId,
        escolas: [inputEscola],
        cidades: [inputCidade],
        turmas: turmasSelecionadas.map(t => t.id),
        alunosCadastrados: []
      };

      await setDoc(doc(professoresRef, novoId), novoProfessor);

      // Atualizar Admin Escolar
      const admRef = doc(db, "AdminsEscolares", admEscolarId);
      const admSnap = await getDoc(admRef);
      const admData = admSnap.exists() ? admSnap.data() : {};
      await setDoc(admRef, {
        ...admData,
        professoresCadastrados: [...(admData.professoresCadastrados || []), novoId]
      }, { merge: true });

      alert("Professor cadastrado com sucesso!");
      navigate("/CriarUser", { state: { professorId: novoId } });

      // Reset campos
      setNome(""); setFormacoes([]); setInputFormacao(""); setDisciplinas([]); setInputDisciplina("");
      setEmail(""); setSenha(""); setInputCidade(""); setInputEscola(""); setInputTurma("");
      setTurmasSelecionadas([]); setLogins(10);
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar professor!");
    }
  };

  return (
    <div className="flex items-start min-h-screen py-10 ">
      <div className="w-full max-w-3xl mx-auto overflow-hidden borderounded-lg">
        <div className="px-8 py-6">
          <h2 className="mb-6 text-lg font-semibold text-blue-600 text-start text-[1.6rem]" style={{color: "#314c89", fontWeight: 800}}>Cadastrar Professor</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Coluna esquerda */}
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-700 text-[1.5rem]" style={{color: "black", fontWeight: 600}}>Nome completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Insira o nome completo do professor"
                  className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                  style={{background: "#e9e9e9", color: "black"}}
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700 text-[1.5rem]" style={{color: "black", fontWeight: 600}}>Formações</label>
                <input
                  type="text"
                  value={inputFormacao}
                  onChange={e => setInputFormacao(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addItemToList(inputFormacao, setFormacoes, setInputFormacao, formacoes)}
                  placeholder="Digite e pressione Enter"
                  className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md focus:outline-none"
                  style={{background: "#e9e9e9", color: "black"}}

                />
                <div className="flex flex-wrap mt-2">
                  {formacoes.map(f => (
                    <span key={f} className="inline-flex items-center px-3 py-1 mb-2 mr-2 text-sm text-gray-800 bg-gray-200 rounded-full">
                      {f}
                      <button
                        onClick={() => removeItemFromList(f, setFormacoes, formacoes)}
                        className="ml-2 text-gray-500 hover:text-gray-800"
                        aria-label={`remover ${f}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700 text-[1.5rem]" style={{color: "black", fontWeight: 600}}>Disciplinas</label>
                <input
                  type="text"
                  value={inputDisciplina}
                  onChange={e => setInputDisciplina(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addItemToList(inputDisciplina, setDisciplinas, setInputDisciplina, disciplinas)}
                  placeholder="Digite e pressione Enter"
                  className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md focus:outline-none"
                                    style={{background: "#e9e9e9", color: "black"}}

                />
                <div className="flex flex-wrap mt-2">
                  {disciplinas.map(d => (
                    <span key={d} className="inline-flex items-center px-3 py-1 mb-2 mr-2 text-sm text-gray-800 bg-gray-200 rounded-full">
                      {d}
                      <button
                        onClick={() => removeItemFromList(d, setDisciplinas, disciplinas)}
                        className="ml-2 text-gray-500 hover:text-gray-800"
                        aria-label={`remover ${d}`}
                        style={{color: "red"}}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700 text-[1.5rem]" style={{color: "black", fontWeight: 600}}>Email/Login</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md 0 focus:outline-none"
                       style={{background: "#e9e9e9", color: "black"}}             

                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700 text-[1.5rem]" style={{color: "black", fontWeight: 600}}>Senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md focus:outline-none"
      style={{background: "#e9e9e9", color: "black"}}
                />
              </div>
            </div>

            {/* Coluna direita */}
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-700 text-[1.5rem]" style={{color: "black", fontWeight: 600}}>Cidade</label>
                <div className="relative">
                  <select
                    value={inputCidade}
                    onChange={e => setInputCidade(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md appearance-none"
                          style={{background: "#e9e9e9", color: "black"}}
                  >
                    <option value="">Selecione uma cidade</option>
                    {cidades.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute inset-y-0 flex items-center text-gray-400 pointer-events-none right-3">▾</div>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700 text-[1.5rem]" style={{color: "black", fontWeight: 600}}>Escolas</label>
                <div className="relative">
                  <select
                    value={inputEscola}
                    onChange={e => setInputEscola(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md appearance-none"
                    disabled={!inputCidade}
                          style={{background: "#e9e9e9", color: "black"}}
                  >
                    <option value="">Selecione uma escola</option>
                    {escolas.map((escola) => (
                      <option key={escola} value={escola}>
                        {escola}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 flex items-center text-gray-400 pointer-events-none right-3">▾</div>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700 text-[1.5rem]" style={{color: "black", fontWeight: 600}}>Turmas</label>
                <div className="relative">
                  <select
                    value={inputTurma}
                          style={{background: "#e9e9e9", color: "black"}}
                    onChange={(e) => {
                      const turmaId = e.target.value;
                      setInputTurma(turmaId);

                      if (!turmaId) return;

                      const turmaObj = turmas.find((t) => t.id === turmaId);
                      const jaSelecionada = turmasSelecionadas.some((t) => t.id === turmaId);

                      if (turmaObj && !jaSelecionada) {
                        setTurmasSelecionadas((prev) => [...prev, turmaObj]);
                      }

                      // volta o select para o placeholder
                      setTimeout(() => setInputTurma(""), 0);
                    }}
                    className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md appearance-none"
                  >
                    <option value="">Selecione uma turma</option>
                    {turmas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome} - {t.ano} ({t.escola} / {t.cidade})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 flex items-center text-gray-400 pointer-events-none right-3">▾</div>
                </div>

                <div className="flex flex-wrap mt-2">
                  {turmasSelecionadas.map(t => (
                    <span key={t.id} className="inline-flex items-center px-3 py-1 mb-2 mr-2 text-sm bg-gray-100 border border-gray-200 rounded-md" style={{color: "black"}}>
                      {t.nome} - {t.ano} ({t.escola} / {t.cidade})
                      <button
                        onClick={() =>
                          setTurmasSelecionadas(
                            turmasSelecionadas.filter(x => x.id !== t.id)
                          )
                        }
                        className="ml-3 text-gray-500 hover:text-red-800"
                        aria-label={`remover turma ${t.nome}`}
                        style={{color: "red"}}                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700 text-[1.5rem]" style={{color: "black", fontWeight: 600}}>Logins Disponiveis</label>
                <input
                  type="number"
                  value={logins}
                        style={{background: "#e9e9e9", color: "black"}}
                  onChange={e => setLogins(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={criarProfessor}
              className="px-6 py-2 text-sm  text-white bg-[#4c74cd] rounded-full shadow hover:bg-blue-700 font-black"
            >
              Cadastrar Professor
            </button>
          </div>
        </div>

        {/* footer com linha roxa similar à imagem */}
      </div>
    </div>
  );
};

export { CriarProfessor };