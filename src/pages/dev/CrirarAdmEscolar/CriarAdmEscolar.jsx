import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import bcrypt from "bcryptjs";

const CriarAdmEscolar = () => {
  const navigate = useNavigate();
  const devId = localStorage.getItem("userId");

  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState("");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
const [planoSelecionado, setPlanoSelecionado] = useState(""); // 10, 20 ou 30 dias

  const [admins, setAdmins] = useState([]);

  const [cidadesDisponiveis, setCidadesDisponiveis] = useState([]);
  const [escolasDisponiveis, setEscolasDisponiveis] = useState([]);
  const [cidadesSelecionadas, setCidadesSelecionadas] = useState([]);
  const [escolasSelecionadas, setEscolasSelecionadas] = useState([]);

  const [loading, setLoading] = useState(false);

  // Validação dev logado
  useEffect(() => {
    const isDev = localStorage.getItem("dev");
    const devDocId = localStorage.getItem("devDocId"); // usado em outro ponto do app
    if (!isDev || isDev !== "true" || !devId || !devDocId) {
      return;
    }

    // opcional: você pode verificar aqui se o doc do dev realmente existe
  }, [navigate, devId]);

  // Carrega clientes
  useEffect(() => {
    const loadClientes = async () => {
      try {
        const snap = await getDocs(collection(db, "Clientes"));
        // Mapear para id (doc id) e conteúdo
        setClientes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
      }
    };
    loadClientes();
  }, []);

  // Quando cliente selecionado muda, atualiza cidades/escolas disponíveis
  useEffect(() => {
    if (!clienteSelecionado) {
      setCidadesDisponiveis([]);
      setEscolasDisponiveis([]);
      setCidadesSelecionadas([]);
      setEscolasSelecionadas([]);
      return;
    }
    const cliente = clientes.find((c) => c.id === clienteSelecionado);
    if (cliente) {
      setCidadesDisponiveis(cliente.cidades || []);
      setEscolasDisponiveis(cliente.escolas || []);
      setCidadesSelecionadas([]);
      setEscolasSelecionadas([]);
    }
  }, [clienteSelecionado, clientes]);

  const addAdminToList = () => {
    const n = nome.trim();
    const e = email.trim();
    const s = senha.trim();

    if (!n || !e || !s) {
      alert("Preencha nome, email e senha!");
      return;
    }

if (!planoSelecionado) {
  alert("Selecione um plano!");
  return;
}




    if (cidadesSelecionadas.length === 0 || escolasSelecionadas.length === 0) {
      alert("Selecione ao menos uma cidade e uma escola!");
      return;
    }

setAdmins((prev) => [
  ...prev,
  {
    nomeCompleto: n,
    email: e,
    senha: s,
    cidades: cidadesSelecionadas,
    escolas: escolasSelecionadas,
    plano: planoSelecionado,
    diasRestantes: parseInt(planoSelecionado, 10), // transforma em número
    criadoEm: new Date().toISOString(),
  },
]);

    // limpa campos
    setNome("");
    setEmail("");
    setSenha("");
    setCidadesSelecionadas([]);
    setEscolasSelecionadas([]);
  };

  const removeAdminFromList = (index) => {
    setAdmins((prev) => prev.filter((_, i) => i !== index));
  };

  const salvarAdmins = async () => {
    if (admins.length === 0) {
      alert("Adicione pelo menos um Admin Escolar!");
      return;
    }
    if (!clienteSelecionado) {
      alert("Selecione um cliente!");
      return;
    }


    

    setLoading(true);
    try {
      const clienteRef = doc(db, "Clientes", clienteSelecionado);
      const clienteData = clientes.find((c) => c.id === clienteSelecionado) || {};

      // pega ids existentes para calcular novo id incremental
      const adminsSnap = await getDocs(collection(db, "AdminsEscolares"));
      const existingIds = adminsSnap.docs
        .map((d) => parseInt(d.data()?.id, 10))
        .filter((n) => !isNaN(n));
      let maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;

      const novosAdminIds = [];

      for (const admin of admins) {
        maxId += 1;
        const adminIdStr = maxId.toString();

        // hash da senha (bcryptjs)
        const salt = await bcrypt.genSalt(12);
        const hashSenha = await bcrypt.hash(admin.senha, salt);
await setDoc(doc(db, "AdminsEscolares", adminIdStr), {
  id: adminIdStr,
  nomeCompleto: admin.nomeCompleto,
  email: admin.email,
  senha: hashSenha,
  clienteId: clienteSelecionado,
  cidades: admin.cidades,
  escolas: admin.escolas,
  devId: devId,
  ativo: true,
  plano: admin.plano,
  diasRestantes: admin.diasRestantes,
  criadoEm: admin.criadoEm,
});


        novosAdminIds.push(adminIdStr);
      }

      // Atualiza lista de Admins no Cliente
      try {
        await updateDoc(clienteRef, {
          AdminsEscolares: [...(clienteData?.AdminsEscolares || []), ...novosAdminIds],
        });
      } catch (err) {
        // se o doc não existir ou update falhar, tente setDoc (fallback)
        console.warn("updateDoc cliente falhou, tentando setDoc:", err);
        await setDoc(clienteRef, {
          ...(clienteData || {}),
          AdminsEscolares: [...(clienteData?.AdminsEscolares || []), ...novosAdminIds],
        }, { merge: true });
      }

      // Atualiza lista de admins cadastrados no Dev logado
      const devRef = doc(db, "desenvolvedores", devId);
      const devSnap = await getDoc(devRef);
      if (devSnap.exists()) {
        const devData = devSnap.data();
        await updateDoc(devRef, {
          adminsCriados: [...(devData?.adminsCriados || []), ...novosAdminIds],
        });
      } else {
        // cria dev do zero se não existe
        await setDoc(devRef, {
          adminsCriados: novosAdminIds,
          criadoEm: new Date().toISOString(),
        });
      }

      alert("Admins escolares cadastrados com sucesso!");
      // limpa tudo
      setAdmins([]);
      setNome("");
      setEmail("");
      setSenha("");
      setClienteSelecionado("");
      setCidadesSelecionadas([]);
      setEscolasSelecionadas([]);
    } catch (err) {
      console.error("Erro ao salvar admins:", err);
      alert("Erro ao salvar admins escolares!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#3f3f3f] flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-3xl bg-[#7a7a7a] rounded-lg p-8 shadow-md border border-black/30">
        <h2 className="mb-6 text-lg font-semibold text-center text-white">Criar Admin Escolar</h2>

        <div className="space-y-4">
          {/* Selecionar Cliente */}
          <div>
            <label className="sr-only">Selecionar Cliente</label>
            <select
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white border rounded-full shadow-sm border-black/10"
              value={clienteSelecionado}
              onChange={(e) => setClienteSelecionado(e.target.value)}
              style={{background: "white", color: "gray"}}
            >
              <option value="">-- Escolha um cliente --</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.Nome}
                </option>
              ))}
            </select>
          </div>

          {/* Nome */}
          <div>
            <label className="sr-only">Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white border rounded-full shadow-sm border-black/10"
              placeholder="Nome completo"
              style={{ background: "white", color: "gray" }}
            />
          </div>

          {/* Email */}
          <div>
            <label className="sr-only">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white border rounded-full shadow-sm border-black/10"
              placeholder="Email"
              style={{ background: "white", color: "gray" }}
            />
          </div>

          {/* Senha */}
          <div>
            <label className="sr-only">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white border rounded-full shadow-sm border-black/10"
              placeholder="Senha"
              style={{ background: "white", color: "gray" }}
            />
          </div>

          {/* Cidades (multiple) */}
          <div>
            <label className="text-[1.2rem]">Cidades atribuídas</label>
            <select
              multiple
              className="w-full h-40 px-4 py-3 text-gray-900 bg-white border rounded-lg shadow-sm border-black/10"
              value={cidadesSelecionadas}
              onChange={(e) =>
                setCidadesSelecionadas([...e.target.selectedOptions].map((opt) => opt.value))
              }
            >
              {cidadesDisponiveis.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-200">Segure Ctrl (ou Cmd) para selecionar múltiplas</p>
          </div>


<div>
  <label className="text-[1.2rem]">Plano</label>
  <select
    className="w-full px-4 py-3 text-gray-900 bg-white border rounded-full shadow-sm border-black/10"
    value={planoSelecionado}
    onChange={(e) => setPlanoSelecionado(e.target.value)}
    style={{ background: "white", color: "gray" }}
  >
    <option value="">-- Escolha um plano --</option>
    <option value="10">10 dias</option>
    <option value="20">20 dias</option>
    <option value="30">30 dias</option>
  </select>
</div>

          {/* Escolas (multiple) */}
          <div>
            
            <label className="text-[1.2rem]">Escolas atribuídas</label>
            <select
              multiple
              className="w-full h-40 px-4 py-3 text-gray-900 bg-white border rounded-lg shadow-sm border-black/10"
              value={escolasSelecionadas}
              onChange={(e) =>
                setEscolasSelecionadas([...e.target.selectedOptions].map((opt) => opt.value))
              }
            >
              {escolasDisponiveis.map((s, i) => (
                <option key={i} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-200">Segure Ctrl (ou Cmd) para selecionar múltiplas</p>
          </div>

          {/* Botões de adicionar / salvar */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={addAdminToList}
              className="min-w-[160px] bg-[#cfcfcf] text-black py-3 rounded-full font-medium shadow-sm hover:brightness-95 text-black"
              disabled={!nome && !email && !senha}
              style={{color: "black"}}
            >
              Adicionar à lista
            </button>

            <button
              onClick={salvarAdmins}
              className={`min-w-[160px] py-3 rounded-full font-medium shadow-sm ${
                loading ? "bg-gray-400 text-gray-700" : "bg-[#cfcfcf] text-black hover:brightness-95"
              }`}
              disabled={loading}
                            style={{color: "black"}}

            >
              {loading ? "Salvando..." : "Salvar Admin(s)"}
            </button>
          </div>

          {/* Lista de admins a serem cadastrados */}
          {admins.length > 0 && (
            <div className="p-4 mt-6 rounded-lg bg-black/10">
              <h4 className="mb-2 font-semibold text-white">Admins a serem cadastrados:</h4>
              <div className="space-y-2">
                {admins.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 px-4 py-2 rounded-full bg-white/90"
                  >
                    <div className="text-sm text-gray-900">
                      <strong>{a.nomeCompleto}</strong> ({a.email})<br />
                      <span className="text-xs text-gray-700">
                        Cidades: {a.cidades.join(", ")} • Escolas: {a.escolas.join(", ")}
                      </span>
                    </div>
                    <button
                      onClick={() => removeAdminFromList(i)}
                      className="px-3 py-1 text-white bg-red-500 rounded-full hover:opacity-90"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { CriarAdmEscolar };