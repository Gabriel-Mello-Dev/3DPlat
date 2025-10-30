import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../../firebase/firebaseConfig";
import { collection, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";

const CriarCliente = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [contato, setContato] = useState("");
  const [adminEscolar, setAdminEscolar] = useState([]);
  const [inputAdmin, setInputAdmin] = useState("");
  const [cidades, setCidades] = useState([]);
  const [inputCidade, setInputCidade] = useState("");
  const [escolas, setEscolas] = useState([]);
  const [inputEscola, setInputEscola] = useState("");

  const devId = localStorage.getItem("userId"); // id do doc do dev logado

  const addAdmin = () => {
    const trimmed = inputAdmin.trim();
    if (trimmed && !adminEscolar.includes(trimmed)) {
      setAdminEscolar([...adminEscolar, trimmed]);
      setInputAdmin("");
    }
  };
  const removeAdmin = (name) => setAdminEscolar(adminEscolar.filter((a) => a !== name));
  const addCidade = () => {
    const trimmed = inputCidade.trim();
    if (trimmed && !cidades.includes(trimmed)) {
      setCidades([...cidades, trimmed]);
      setInputCidade("");
    }
  };
  const removeCidade = (name) => setCidades(cidades.filter((c) => c !== name));
  const addEscola = () => {
    const trimmed = inputEscola.trim();
    if (trimmed && !escolas.includes(trimmed)) {
      setEscolas([...escolas, trimmed]);
      setInputEscola("");
    }
  };
  const removeEscola = (name) => setEscolas(escolas.filter((e) => e !== name));

  const criarCliente = async () => {
    if (!nome || !endereco || !telefone || !contato || adminEscolar.length === 0) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      // --- cria cliente novo ---
      const clientesRef = collection(db, "Clientes");
      const clientesDocs = await getDocs(clientesRef);
      const todosIds = clientesDocs.docs
        .map((d) => parseInt(d.data().id, 10))
        .filter((n) => !isNaN(n));
      const novoId = todosIds.length > 0 ? (Math.max(...todosIds) + 1).toString() : "1";

      const novoCliente = {
        id: novoId,
        Nome: nome,
        Endereço: endereco,
        Telefone: telefone,
        Contato: contato,
        AdminEscolar: adminEscolar,
        cidades,
        escolas,
      };

      await setDoc(doc(clientesRef, novoId), novoCliente);

      // --- vincula ao dev ---
      const devRef = doc(db, "desenvolvedores", devId);
      const devSnap = await getDoc(devRef);

      if (devSnap.exists()) {
        const devData = devSnap.data();
        await updateDoc(devRef, {
          clientes: [...(devData.clientes || []), novoId],
        });
      } else {
        // cria dev do zero se não existe
        await setDoc(devRef, {
          clientes: [novoId],
          criadoEm: new Date().toISOString(),
        });
      }

      alert("Cliente criado com sucesso!");
      navigate("/criarAdmEscolar");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar cliente!");
    }
  };

  // --- valida dev logado ---
  useEffect(() => {
    const isDev = localStorage.getItem("dev");
    const devDocId = localStorage.getItem("devDocId");

    if (!isDev || isDev !== "true" || !devDocId) {
      return;
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#3f3f3f] flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-3xl bg-[#7a7a7a] rounded-lg p-8 shadow-md border border-black/30">
        <h2 className="mb-6 text-lg font-semibold text-center text-white">Criar Cliente</h2>

        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="sr-only">Nome</label>
            <input
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white border rounded-full shadow-sm border-black/10"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
                            style={{background: "white", color: "gray"}}
            />
          </div>

          {/* Endereço */}
          <div>
            <label className="sr-only">Endereço</label>
            <input
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white border rounded-full shadow-sm border-black/10"
              placeholder="Endereço"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
                            style={{background: "white", color: "gray"}}

            />
          </div>

          {/* Telefone */}
          <div>
            <label className="sr-only">Telefone</label>
            <input
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white border rounded-full shadow-sm border-black/10"
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
                            style={{background: "white", color: "gray"}}

            />
          </div>

          {/* Contato */}
          <div>
            <label className="sr-only">Contato</label>
            <input
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white border rounded-full shadow-sm border-black/10"
              placeholder="Contato"
              value={contato}
              onChange={(e) => setContato(e.target.value)}
                            style={{background: "white", color: "gray"}}

            />
          </div>

          {/* Admin Escolar (input + chips) */}
          <div>
            <label className="sr-only">Admin Escolar</label>
            <input
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white border rounded-full shadow-sm border-black/10"
              placeholder="Admin Escolar (digite e pressione Enter)"
              value={inputAdmin}
              onChange={(e) => setInputAdmin(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAdmin();
                }
              }}
                            style={{background: "white", color: "gray"}}

            />
            <div className="flex flex-wrap gap-2 mt-3">
              {adminEscolar.map((a) => (
                <span
                  key={a}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-white rounded-full"
                >
                  <span className="font-medium text-gray-900">{a}</span>
                  <button
                    onClick={() => removeAdmin(a)}
                    className="bg-black/10 hover:bg-black/20 text-sm rounded-full px-2 py-0.5"
                    aria-label={`Remover ${a}`}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Cidades */}
          <div>
            <label className="sr-only">Cidades</label>
            <input
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white border rounded-full shadow-sm border-black/10"
              placeholder="Cidades (digite e pressione Enter)"
              value={inputCidade}
              onChange={(e) => setInputCidade(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCidade();
                }
              }}
                            style={{background: "white", color: "gray"}}

            />
            <div className="flex flex-wrap gap-2 mt-3">
              {cidades.map((c) => (
                <span
                  key={c}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-white rounded-full"
                >
                  <span className="text-gray-900">{c}</span>
                  <button
                    onClick={() => removeCidade(c)}
                    className="bg-black/10 hover:bg-black/20 text-sm rounded-full px-2 py-0.5"
                    aria-label={`Remover ${c}`}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Escolas */}
          <div>
            <label className="sr-only">Escolas</label>
            <input
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white border rounded-full shadow-sm border-black/10"
              placeholder="Escolas (digite e pressione Enter)"
              value={inputEscola}
              onChange={(e) => setInputEscola(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addEscola();
                }
              }}
                            style={{background: "white", color: "gray"}}

            />
            <div className="flex flex-wrap gap-2 mt-3">
              {escolas.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-white rounded-full"
                >
                  <span className="text-gray-900">{s}</span>
                  <button
                    onClick={() => removeEscola(s)}
                    className="bg-black/10 hover:bg-black/20 text-sm rounded-full px-2 py-0.5"
                    aria-label={`Remover ${s}`}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Botão centrado */}
          <div className="flex justify-center mt-4">
            <button
              onClick={criarCliente}
              className="w-1/3 min-w-[180px] bg-[#cfcfcf] text-black py-3 rounded-full font-medium shadow-sm hover:brightness-95 text-[black]"
            >
              Criar Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CriarCliente };
