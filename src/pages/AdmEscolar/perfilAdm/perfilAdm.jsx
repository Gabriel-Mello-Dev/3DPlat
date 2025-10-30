import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { app } from "../../../api/fireBase";
import { validarEmail } from "../../../utils/validacoes";

const PerfilAdm = () => {
  const db = getFirestore(app);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [allEscolas, setAllEscolas] = useState([]);
  const [selectedEscolas, setSelectedEscolas] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingEscolas, setSavingEscolas] = useState(false);
  const [filter, setFilter] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const showMsg = useCallback((type, text) => {
    setMsg({ type, text });
    window.clearTimeout(showMsg._t);
    showMsg._t = window.setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  }, []);

  useEffect(() => {
    const admId = localStorage.getItem("admEscolarId");
    if (!admId) {
      navigate("/", { replace: true });
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const userRef = doc(db, "AdminsEscolares", admId);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          navigate("/", { replace: true });
          return;
        }
        const data = snap.data() || {};
        setUser({ id: admId, ...data });
        setEmail(data.email || data.Login || "");
        const adminEscolas = (data.escolas || []).map((e) => String(e).trim());
        setSelectedEscolas(adminEscolas);

        const clienteId = data.clienteId;
        if (!clienteId) {
          setAllEscolas([]);
        } else {
          const clienteRef = doc(db, "Clientes", clienteId);
          const clienteSnap = await getDoc(clienteRef);
          if (clienteSnap.exists()) {
            const clienteData = clienteSnap.data() || {};
            const clienteEscolas = (clienteData.escolas || []).map((e) => String(e).trim());
            setAllEscolas(clienteEscolas.sort((a, b) => a.localeCompare(b)));
          } else {
            setAllEscolas([]);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        showMsg("error", "Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [db, navigate, showMsg]);

  const filteredEscolas = useMemo(() => {
    return allEscolas.filter((e) => e.toLowerCase().includes(filter.toLowerCase()));
  }, [allEscolas, filter]);

  const hasEmailChange = useMemo(() => {
    if (!user) return false;
    return email.trim() !== (user.email || user.Login || "");
  }, [email, user]);

  const handleSalvarEmail = async () => {
    const value = email.trim();
    if (!value) {
      showMsg("error", "Email/Login não pode estar vazio.");
      return;
    }
  if (!validarEmail(email)) {
    alert("Digite um email válido!");
    return;
  }


    
    setSavingEmail(true);
    try {
      const userRef = doc(db, "AdminsEscolares", user.id);
      await updateDoc(userRef, { email: value });
      setUser((u) => ({ ...u, email: value }));
      showMsg("success", "Email/Login atualizado com sucesso.");
    } catch (err) {
      console.error("Erro ao atualizar email:", err);
      showMsg("error", "Erro ao atualizar Email/Login.");
    } finally {
      setSavingEmail(false);
    }
  };

  const handleToggleEscola = (escolaNome) => {
    setSelectedEscolas((prev) =>
      prev.includes(escolaNome) ? prev.filter((n) => n !== escolaNome) : [...prev, escolaNome]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEscolas.length === allEscolas.length) {
      setSelectedEscolas([]);
    } else {
      setSelectedEscolas(allEscolas);
    }
  };

  const salvarEscolas = async () => {
    setSavingEscolas(true);
    try {
      const userRef = doc(db, "AdminsEscolares", user.id);
      await updateDoc(userRef, { escolas: selectedEscolas });
      showMsg("success", "Escolas atualizadas com sucesso.");
    } catch (err) {
      console.error("Erro ao atualizar escolas:", err);
      showMsg("error", "Erro ao atualizar escolas.");
    } finally {
      setSavingEscolas(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#27406a]">Perfil do Administrador Escolar</h1>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#dbe7f6] p-6" role="main" aria-labelledby="pageTitle">
      {/* Page title */}
      <div className="max-w-5xl mx-auto">
        <h1 id="pageTitle" className="text-center text-2xl sm:text-3xl font-bold text-[#27406a] mb-6">
          Perfil Administrador Escolar
        </h1>

        {/* Toast message */}
        {msg.text && (
          <div
            role="status"
            aria-live="polite"
            className={`mx-auto mb-4 max-w-md p-3 rounded shadow text-sm text-center ${
              msg.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-800"
            }`}
          >
            {msg.text}
          </div>
        )}



        {/* Dados + Assinatura card */}
        <section className="p-6 mb-6 bg-white rounded-lg shadow-md">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 ">
              <h2 className="text-[#27406a] font-semibold mb-4 ">Dados</h2>

              {/* Assinatura */}
          <div className="flex-col justify-end w-full gap-2 lg:justify-end text-end">
  <p className="text-[#27406a] font-semibold mb-0 text-end text-[1.5rem]">Assinatura</p>

  <span
    className={` px-3 py-1 rounded-full font-semibold text-sm text-[1rem] ${
      user.ativo ? "bg-[#c9ef9a] text-[#27406a]" : "bg-yellow-100 text-yellow-800"
    } lg:-mt-2`}
  >
    {user.ativo ? "Plano em dia" : "Plano pendente"}
  </span>
</div>

              <div className="w-1/2 mb-4">
                <label className="block text-sm font-medium text-[#0b1a2a] mb-1 h-[1rem]">Nome Completo</label>
                <div className="bg-gray-100 rounded px-3 py-2 text-[#0b1a2a]">{user.nomeCompleto || "-"}</div>
                
              </div>

  
            
              <div className="w-1/2 mb-4">
                <label htmlFor="emailLogin" className="block text-sm font-medium text-[#0b1a2a] mb-1">
                  Email/Login
                </label>
                <div className="flex items-center gap-3 ">
                  <input
                    id="emailLogin"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@escola.com"
                    className="flex-1 bg-gray-100 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#9fb0da]"
                    style={{color: "black"}}
                  />
                  <button
                    onClick={handleSalvarEmail}
                    disabled={savingEmail || !hasEmailChange}
                    className={`px-3 py-2 rounded text-white text-sm font-medium transition-colors ${
                      savingEmail || !hasEmailChange
                        ? "bg-slate-300 cursor-not-allowed"
                        : "bg-[#7f99d0] hover:brightness-95"
                    }`}
                    aria-busy={savingEmail}
                  >
                    {savingEmail ? "Salvando..." : "Salvar"}
                  </button>
                </div>
                {!hasEmailChange && (
                  <p className="mt-2 text-xs text-gray-400">Dica: altere o e-mail e clique em Salvar.</p>
                )}

                
              </div>
            </div>

        

 <button
              onClick={() => navigate("/TrocarSenha")}
className="w-1/4 h-8 flex items-center justify-center px-4  bg-[#7f99d0] text-white hover:brightness-95 rounded-md text-[1rem]"           >
              Trocar Senha
            </button>

          </div>



        </section>


        {/* Escolas associadas card */}
        <section className="p-6 mb-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#27406a] font-semibold">Escolas Associadas</h2>

            <div className="items-center hidden gap-3 sm:flex">
              <span className="text-sm text-gray-400">
                {selectedEscolas.length}/{allEscolas.length} selecionadas
              </span>
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50"
              >
                {selectedEscolas.length === allEscolas.length ? "Limpar" : "Selecionar tudo"}
              </button>
            </div>
          </div>

          <div className="flex flex-row gap-4 mb-6 sm:flex-row sm:items">
            <div className="flex flex-1 gap-2">
              <input
                type="search"
                className=" bg-[#d1d9ee] rounded-full px-4 py-2 outline-none placeholder-gray-600 w-1/2 "
                placeholder="🔎Buscar escola..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Buscar escola"
                                style={{color: "gray"}}

              />
            </div>

            <div className="flex items-center gap-2 sm:hidden ">
              <span className="text-sm text-gray-400 text-[1.2rem]">
                {selectedEscolas.length}/{allEscolas.length} selecionadas
              </span>
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 bg-[#ced7e8]"
                style={{color: "black"}}
              >
                {selectedEscolas.length === allEscolas.length ? "Limpar" : "Selecionar tudo"}
              </button>
            </div>
          </div>

          {allEscolas.length === 0 ? (
            <p className="text-gray-500">Nenhuma escola encontrada para este cliente.</p>
          ) : filteredEscolas.length === 0 ? (
            <p className="text-gray-500">Nenhum resultado para “{filter}”.</p>
          ) : (
            <div className="grid grid-rows-1 gap-6 sm:grid-cols-3">
              {filteredEscolas.map((escola) => {
                const checked = selectedEscolas.includes(escola);
                return (
                  <label
                    key={escola}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-md cursor-pointer transition-shadow ${
                      checked ? "bg-[#3b61b3] text-white shadow-md" : "bg-[#567fc9]/80 text-white/95"
                    }`}
                  >
                    <input
    type="checkbox"
    checked={checked}
    onChange={() => handleToggleEscola(escola)}
    aria-label={`Selecionar escola ${escola}`}
    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 lg:w-7 lg:h-7 border-none
     accent-[#27406a] focus:ring-2 focus:ring-[#9fb0da]
 
     "
  />
                    <div className="mt-3 text-sm font-bold pt-15">{escola}</div>
                  </label>
                );
              })}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={salvarEscolas}
              disabled={savingEscolas}
              aria-busy={savingEscolas}
              className={`px-4 py-2 rounded-full text-white font-medium transition-colors ${
                savingEscolas ? "bg-slate-300 cursor-not-allowed" : "bg-[#3b61b3] hover:brightness-95"
              }`}
            >
              {savingEscolas ? "Salvando..." : "Salvar Escola"}
            </button>
          </div>
        </section>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-3">
           
          
          </div>

          <div className="text-sm text-gray-400">© Sistema Escolar</div>
        </div>
      </div>
    </main>
  );
};

export { PerfilAdm };