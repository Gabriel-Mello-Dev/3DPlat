import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import style from "./TurmasAdm.module.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  collection, getDocs, doc, getDoc,
  query, orderBy
} from "firebase/firestore";
import { db } from "../../../api/fireBase";

// 🎨 paleta escura
const COLORS = ["#4FC3F7", "#81C784", "#FFD54F", "#FF8A65", "#E57373", "#BA68C8"];

const TurmasAdm = () => {
  const [professores, setProfessores] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [adminDoc, setAdminDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [graficoAmpliado, setGraficoAmpliado] = useState(null);

  // seleção e acessos
  const [professorSelecionado, setProfessorSelecionado] = useState(null);
  const [acessosProfessorSelecionado, setAcessosProfessorSelecionado] = useState([]); // lista completa ordenada desc

  const userId = localStorage.getItem("admEscolarId");
  const userType = localStorage.getItem("userType");
  const navigate = useNavigate();

  // 🔒 autenticação
  useEffect(() => {
    if (!userId || userType !== "admEscolar") {
      alert("Você precisa estar logado como Admin Escolar!");
      navigate("/Escola");
    }
  }, [userId, userType, navigate]);

  const logout = () => {
    localStorage.removeItem("admEscolarId");
    localStorage.removeItem("userType");
    navigate("/Escola");
  };

  // 🔄 carregamento de dados base
  const loadData = async () => {
    setLoading(true);
    try {
      const [profSnap, turmasSnap] = await Promise.all([
        getDocs(collection(db, "professores")),
        getDocs(collection(db, "turmas"))
      ]);
      const profs = profSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProfessores(profs);
      setTurmas(turmasSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // tenta encontrar o admin em possíveis coleções
      const possibleCollections = ["AdminsEscolares", "admEscolas", "admins"];
      let found = null;
      for (const col of possibleCollections) {
        try {
          const docRef = doc(db, col, userId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            found = { id: docSnap.id, ...docSnap.data(), __collection: col };
            break;
          }
        } catch {}
      }
      setAdminDoc(found);
    } catch (err) {
      console.error("Erro ao carregar:", err);
      alert("Erro ao carregar dados do Firebase!");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadData(); }, []);

  // ✅ professores filtrados pelo admin
  const professoresCriadosPorAdmin = useMemo(() => {
    if (!adminDoc?.professoresCadastrados?.length) return [];
    const ids = adminDoc.professoresCadastrados.map(String);
    return professores.filter(p => ids.includes(String(p.id)));
  }, [adminDoc, professores]);

const escolas = useMemo(() => {
  return Array.isArray(adminDoc?.escolas) ? adminDoc.escolas : [];
}, [adminDoc]);

  // 📊 estatísticas simples (mantém só os 3 gráficos existentes)
 const estatisticasProfessores = useMemo(() => {
  const porEscola = {};
  const profTurmas = {};

  // 1) Inicializa todas as escolas do admin com 0
  const escolasAdmin = Array.isArray(adminDoc?.escolas) ? adminDoc.escolas : [];
  escolasAdmin.forEach(e => {
    const key = e || "Sem escola";
    porEscola[key] = 0;
  });

  // 2) Percorre professores e incrementa contagens
  professoresCriadosPorAdmin.forEach(p => {
    const escolasP = p.escolas || p.escola || [];
    if (Array.isArray(escolasP)) {
      escolasP.forEach(e => {
        const key = e || "Sem escola";
        porEscola[key] = (porEscola[key] || 0) + 1;
      });
    } else if (escolasP) {
      const key = escolasP || "Sem escola";
      porEscola[key] = (porEscola[key] || 0) + 1;
    } else {
      // professor sem escola definida
      porEscola["Sem escola"] = (porEscola["Sem escola"] || 0) + 1;
    }

    // número de turmas = tamanho do array turmas do professor
    const countTurmas = Array.isArray(p.turmas) ? p.turmas.length : 0;
    profTurmas[p.id] = countTurmas;
  });

  // 3) Garante que "Sem escola" exista ao menos com 0 (opcional)
  if (!("Sem escola" in porEscola)) {
    porEscola["Sem escola"] = 0;
  }

  return {
    total: professoresCriadosPorAdmin.length,
    porEscola: Object.entries(porEscola).map(([k, v]) => ({
      name: k || "Sem escola",
      value: v
    })),
    profTurmas: Object.entries(profTurmas).map(([id, count]) => {
      const p = professoresCriadosPorAdmin.find(x => String(x.id) === String(id));
      return { name: p?.nome || p?.nomeCompleto || `Prof ${id}`, count };
    }),
  };
}, [professoresCriadosPorAdmin, adminDoc]);

  // --- UI: grid de gráficos com clique para ampliar (mantido) ---
  const GraficoGrid = ({ list }) => {
    if (!list || !list.length) return <p>Nenhum dado disponível para gráficos.</p>;
    if (graficoAmpliado) {
      const g = list.find(x => x.title === graficoAmpliado);
      if (!g) return null;
      return (
        <div className={style.graficoAmpliado}>
          <div className={style.graficoAmpliadoHeader}>
            <button onClick={() => setGraficoAmpliado(null)} className={style.voltarButton}>← Voltar</button>
            <h2>{g.title}</h2>
          </div>
          <div className={style.graficoAmpliadoChart}>
            <ResponsiveContainer width="100%" height={420}>{g.chart}</ResponsiveContainer>
          </div>
          {g.description && <p className={style.graficoDescricao}>{g.description}</p>}
        </div>
      );
    }

    return (
      <div className={style.gridContainer}>
        {list.map(g => (
          <div key={g.id} className={style.graficoQuadrado} onClick={() => setGraficoAmpliado(g.title)}>
            <h4 className={style.graficoTituloMini}>{g.title}</h4>
            <div className={style.graficoMini}>
              <ResponsiveContainer width="100%" height={150}>{g.chart}</ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const graficoProfessores = [
  {
    id: 1,
    title: "Professores por escola",
    chart: (
      // Donut / Pie com innerRadius para o "buraco"
      <PieChart>
        <Tooltip />
        <Pie
          data={(estatisticasProfessores.porEscola).filter(d=>Number(d.value)>0)}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="48%"
          outerRadius={70}
          innerRadius={36}      // cria o donut
          paddingAngle={4}
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelStyle={{ fontSize: 10 }} // 🔹 diminui o texto

        >
          {estatisticasProfessores.porEscola.map((entry, idx) => (
            <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    )
  },

  {
    id: 2,
    title: "Total de professores",
    chart: (
      // Um único "retângulo" preenchido — usado barSize grande + radius para bordas arredondadas
      <BarChart
        data={[{ name: "Professores", total: estatisticasProfessores.total }]}
        margin={{ top: 16, right: 8, left: 8, bottom: 8 }}
      >
        <Tooltip />
        {/* limpa ticks/linhas para ficar só o bloco */}
        <XAxis dataKey="name" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Bar
          dataKey="total"
          fill={COLORS[1]}
          barSize={120}               // largura grande para preencher o card
          radius={[14, 14, 14, 14]}   // bordas arredondadas (top-left, top-right, bottom-right, bottom-left)
        />
      </BarChart>
    )
  },

  {
    id: 3,
    title: "Professores x nº de turmas",
    chart: (
      // Pie convencional (com legend e cores)
      <PieChart>
        <Tooltip />
        <Pie
          data={estatisticasProfessores.profTurmas}
          dataKey="count"
          nameKey="name"
          cx="50%"
          cy="48%"
          outerRadius={70}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {estatisticasProfessores.profTurmas.map((entry, idx) => (
            <Cell key={entry.name} fill={COLORS[(idx + 2) % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    )
  }
];
  // helpers
  const formatLinhaAcesso = (ts) => {
    if (!ts) return "-";
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      const dia = date.getDate();
      const mes = date.toLocaleString("pt-BR", { month: "long" });
      const ano = date.getFullYear();
      const horario = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      return `${dia} de ${mes} de ${ano} as ${horario}`;
    } catch {
      return String(ts);
    }
  };

  // quando selecionar professor, carregar TODOS os acessos da subcoleção (ordenados desc)
  useEffect(() => {
    const fetchAcessos = async () => {
      if (!professorSelecionado?.id) {
        setAcessosProfessorSelecionado([]);
        return;
      }
      try {
        const acessosRef = collection(db, "professores", professorSelecionado.id, "acessos");
        const qy = query(acessosRef, orderBy("timestamp", "desc"));
        const snap = await getDocs(qy);
        const lista = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            email: data.email || "-",
            timestamp: data.timestamp || null,
            userAgent: data.userAgent || "-"
          };
        });
        setAcessosProfessorSelecionado(lista);
      } catch (e) {
        console.error("Erro ao carregar acessos:", e);
        setAcessosProfessorSelecionado([]);
      }
    };
    fetchAcessos();
  }, [professorSelecionado]);

  if (loading) return <div className={style.loading}>Carregando professores...</div>;

  return (
   <div >


  <main className={style.main}>
    <header className={style.header}>
      <h1>Professores (Admin)</h1>
      <div className={style.headerRight}>
        <span className={style.smallInfo}>Total Professores: {professoresCriadosPorAdmin.length}</span>
        <span className={style.smallInfo}>Total Turmas: {turmas.length}</span>
        <span className={style.smallInfo}>Total Escolas: {escolas.length}</span>
      </div>
    </header>

    <section className={style.content}>
      <GraficoGrid list={graficoProfessores} />

      {/* Últimos acessos do professor selecionado (dropdown em vez de clique) */}
      <div className={style.accessBox}>
        <h2 className={style.accessTitle}>Últimos acessos</h2>

        <div className={style.accessSelectorRow}>
          <label htmlFor="profSelect" style={{ fontWeight: 600, color: "#11445f" }}>
            Selecionar professor:
          </label>

          <div className={style.accessSelector} style={{ marginLeft: 8 }}>
            <select
              id="profSelect"
              value={professorSelecionado?.id || ""}
              onChange={(e) => {
                const id = e.target.value;
                const p = professoresCriadosPorAdmin.find(x => String(x.id) === String(id)) || null;
                setProfessorSelecionado(p);
              }}
           style={{
    background: "transparent",
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: 12,
    color: "#06243a", 
    cursor: "pointer",
    padding: "6px 8px",
    lineHeight: "2rem",  // 🔹 centraliza verticalmente
    height: "2rem",        // 🔹 define altura uniforme
    display: "flex",
    alignItems: "center", 
    verticalAlign: "center",
    boxShadow: "none",
overflow: "visible"
  }}
            >
              <option value="">— selecione —</option>
              {professoresCriadosPorAdmin.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome || p.nomeCompleto || `Prof ${p.id}`} {p.email ? `(${p.email})` : ""}
                </option>
              ))}
            </select>

            {/* pequena seta para a direita (pode remover se não quiser) */}
            <div style={{ marginLeft: 8, color: "#06243a" }}>▾</div>
          </div>
        </div>

        {/* área com os acessos (atualizada automaticamente pelo efeito que faz getDocs da subcoleção) */}
        <div className={style.accessListContainer} style={{ marginTop: 12 }}>
          {(!professorSelecionado) ? (
            <p style={{ color: "#083046" }}>Selecione um professor para ver os acessos.</p>
          ) : acessosProfessorSelecionado.length === 0 ? (
            <p style={{ color: "#083046" }}>Sem registros de acesso para este professor.</p>
          ) : (
            <ul>
              {acessosProfessorSelecionado.map((a) => (
                <li key={a.id} className={style.acessLi}> {formatLinhaAcesso(a.timestamp)} — {a.email}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  </main>

 
</div>
  );
};

export { TurmasAdm };