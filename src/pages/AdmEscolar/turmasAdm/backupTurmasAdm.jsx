import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import style from "./turmasAdm.module.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer
} from "recharts";

import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

// 🎨 paleta escura
const COLORS = ["#4FC3F7", "#81C784", "#FFD54F", "#FF8A65", "#E57373", "#BA68C8"];
const RADAR_LABELS = ["Lógica", "Memória", "Criatividade", "Resolução"];

const TurmasAdm = () => {
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [adminDoc, setAdminDoc] = useState(null);
  const [painel, setPainel] = useState("turmas");
  const [graficoAmpliado, setGraficoAmpliado] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("admEscolarId");
  const userType = localStorage.getItem("userType");
  const navigate = useNavigate();

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

  const loadData = async () => {
    setLoading(true);
    try {
      const [turmasSnap, alunosSnap, profSnap, catSnap] = await Promise.all([
        getDocs(collection(db, "turmas")),
        getDocs(collection(db, "alunos")),
        getDocs(collection(db, "professores")),
        getDocs(collection(db, "categorias"))
      ]);
      setTurmas(turmasSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAlunos(alunosSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setProfessores(profSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCategorias(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));

const possibleCollections = ["AdminsEscolares", "admEscolas", "admins", "clientes", "escolas"];
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
      console.error("Erro loadData TurmasAdm:", err);
      alert("Erro ao carregar dados do Firebase!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const getCategoriaNome = (id) => {
    const cat = categorias.find(c => String(c.id) === String(id));
    return cat?.nome || "Sem Categoria";
  };

  // --- Filtrar apenas os registros criados pelo admin ---
  const alunosCriadosPorAdmin = useMemo(() => {
    if (!adminDoc?.alunosCadastrados?.length) return [];
    const ids = adminDoc.alunosCadastrados.map(String);
    return alunos.filter(a => ids.includes(String(a.id)));
  }, [adminDoc, alunos]);

  const professoresCriadosPorAdmin = useMemo(() => {
    if (!adminDoc?.professoresCadastrados?.length) return [];
    const ids = adminDoc.professoresCadastrados.map(String);
    return professores.filter(p => ids.includes(String(p.id)));
  }, [adminDoc, professores]);

  const turmasCriadasPorAdmin = useMemo(() => {
    if (!adminDoc?.turmas?.length) return [];
    const ids = adminDoc.turmas.map(String);
    return turmas.filter(t => ids.includes(String(t.id)));
  }, [adminDoc, turmas]);

  // --- Estatísticas filtradas pelo admin ---
  const estatisticasTurmasGerais = useMemo(() => {
    const jogosPlays = {};
    const tipoDeJogos = {};
    let totalAlunos = alunosCriadosPorAdmin.length;
    let ativos = alunosCriadosPorAdmin.filter(a => (a.tempoLogado || 0) > 0).length;
    const diasDaSemana = { Domingo:0, Segunda:0, Terca:0, Quarta:0, Quinta:0, Sexta:0, Sabado:0 };
    const horarios = {};

    alunosCriadosPorAdmin.forEach(a => {
      (a.historicoJogos || []).forEach(j => {
        const nome = j.nome || "Desconhecido";
        jogosPlays[nome] = (jogosPlays[nome] || 0) + (j.vezesJogadas || 1);
      });
      (a.tipoDeJogos || []).forEach(t => {
        if (t?.categoriaId) tipoDeJogos[t.categoriaId] = (tipoDeJogos[t.categoriaId]||0) + (t.total || 0);
      });
      if (a.historicoAcessos?.dias) {
        Object.entries(a.historicoAcessos.dias).forEach(([d,v]) => {
          if (diasDaSemana.hasOwnProperty(d)) diasDaSemana[d] += v || 0;
        });
      }
      if (a.historicoAcessos?.horarios) {
        Object.entries(a.historicoAcessos.horarios).forEach(([h,v]) => { horarios[h] = (horarios[h]||0) + (v||0); });
      }
    });

    return {
      totalAlunos,
      ativos,
      jogosData: Object.entries(jogosPlays).map(([name,total])=>({name,total})).sort((a,b)=>b.total-a.total),
      tiposData: Object.entries(tipoDeJogos).map(([id,total])=>({name:getCategoriaNome(id),total})),
      diasAtividade: Object.entries(diasDaSemana).map(([d,v])=>({name:d,value:v})),
      horariosData: Object.entries(horarios).map(([h,v])=>({name:h,value:v}))
    };
  }, [alunosCriadosPorAdmin, categorias]);

  const estatisticasAlunos = useMemo(() => {
    const cities = {};
    const schools = {};
    const jogosPlays = {};
    const radarAgg = { Lógica:0, Memória:0, Criatividade:0, Resolução:0, count:0 };

    alunosCriadosPorAdmin.forEach(a => {
      const c = a.cidade || a.cidades?.[0] || (adminDoc?.cidades?.[0] || "");
      if (c !== undefined) cities[c] = (cities[c] || 0) + 1;
      const s = a.escola || a.escolas?.[0] || (adminDoc?.escolas?.[0] || "");
      if (s !== undefined) schools[s] = (schools[s] || 0) + 1;

      (a.historicoJogos || []).forEach(j => {
        const nome = j.nome || "Desconhecido";
        jogosPlays[nome] = (jogosPlays[nome] || 0) + (j.vezesJogadas || 1);
      });

      (a.jogosTagsScores || []).forEach(js => {
        radarAgg["Lógica"] += js["Lógica"] || js["Logica"] || 0;
        radarAgg["Memória"] += js["Memória"] || js["Memoria"] || 0;
        radarAgg["Criatividade"] += js["Criatividade"] || 0;
        radarAgg["Resolução"] += js["Resolução"] || js["Resolucao"] || 0;
        radarAgg.count++;
      });
      if (a.tagsScores) {
        radarAgg["Lógica"] += a.tagsScores["Lógica"] || a.tagsScores["Logica"] || 0;
        radarAgg["Memória"] += a.tagsScores["Memória"] || a.tagsScores["Memoria"] || 0;
        radarAgg["Criatividade"] += a.tagsScores["Criatividade"] || 0;
        radarAgg["Resolução"] += a.tagsScores["Resolução"] || a.tagsScores["Resolucao"] || 0;
        radarAgg.count++;
      }
    });

    const radarData = RADAR_LABELS.map(label => ({ subject: label, A: radarAgg.count ? Math.round((radarAgg[label] || 0) / radarAgg.count) : 0 }));

    return {
      byCity: Object.entries(cities).map(([k,v])=>({ name: k || "Sem cidade", value: v })),
      bySchool: Object.entries(schools).map(([k,v])=>({ name: k || "Sem escola", value: v })),
      jogosTop: Object.entries(jogosPlays).map(([name,total])=>({ name, total })).sort((a,b)=>b.total-a.total),
      radarData
    };
  }, [alunosCriadosPorAdmin, adminDoc]);

  const estatisticasProfessores = useMemo(() => {
    const porEscola = {};
    const profTurmas = {};
    professoresCriadosPorAdmin.forEach(p => {
      const escolasP = p.escolas || p.escola || (adminDoc?.escolas || []);
      if (Array.isArray(escolasP)) {
        escolasP.forEach(e => { porEscola[e] = (porEscola[e]||0) + 1; });
      } else if (escolasP) {
        porEscola[escolasP] = (porEscola[escolasP]||0) + 1;
      }
      profTurmas[p.id] = turmasCriadasPorAdmin.filter(t => String(t.professorId || t.Professor || "") === String(p.id)).length;
    });

    return {
      totalProfessores: professoresCriadosPorAdmin.length,
      porEscola: Object.entries(porEscola).map(([k,v])=>({ name:k || "Sem escola", value:v })),
      profTurmas: Object.entries(profTurmas).map(([id, count]) => {
        const p = professoresCriadosPorAdmin.find(x => String(x.id) === String(id));
        return { name: p?.nome || p?.nomeCompleto || (`Prof ${id}`), count };
      })
    };
  }, [professoresCriadosPorAdmin, turmasCriadasPorAdmin, adminDoc]);

  // --- UI: grid de gráficos com clique para ampliar ---
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
            <ResponsiveContainer width="100%" height={420}>
              {g.chart}
            </ResponsiveContainer>
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

  // --- listas de gráficos por painel ---
  // --- GRÁFICOS DE TURMAS (apenas dados filtrados pelo admin) ---
  const graficoTurmas = [
    { id: 1, title: "Número de alunos por turma (admin)", chart: <BarChart data={turmasCriadasPorAdmin.map(t => ({ name: t.nome || `Turma ${t.id}`, total: alunosCriadosPorAdmin.filter(a => String(a.Turma) === String(t.id)).length }))}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill={COLORS[0]} /></BarChart> },
    { id: 2, title: "Ativos x Inativos por turma (admin)", chart: <BarChart data={turmasCriadasPorAdmin.map(t => { const turmaAl = alunosCriadosPorAdmin.filter(a => String(a.Turma) === String(t.id)); const ativos = turmaAl.filter(a => (a.tempoLogado || 0) > 0).length; return { name: t.nome || `Turma ${t.id}`, ativos, inativos: turmaAl.length - ativos }; })}><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="ativos" fill={COLORS[1]} /><Bar dataKey="inativos" fill={COLORS[4]} /></BarChart> },
    { id: 3, title: "Tempo médio (min) por turma (admin)", chart: <BarChart data={turmasCriadasPorAdmin.map(t => { const turmaAl = alunosCriadosPorAdmin.filter(a => String(a.Turma) === String(t.id)); const total = turmaAl.reduce((s,a)=>s + (a.tempoLogado || 0), 0); const avg = turmaAl.length ? Math.round(total / turmaAl.length / 60) : 0; return { name: t.nome || `Turma ${t.id}`, valor: avg }; })}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="valor" fill={COLORS[2]} /></BarChart> },
    { id: 4, title: "Jogos mais acessados (turmas do admin)", chart: <BarChart data={estatisticasTurmasGerais.jogosData.slice(0, 12)}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill={COLORS[0]} /></BarChart> },
    { id: 5, title: "Distribuição por categoria (turmas do admin)", chart: <PieChart><Pie data={estatisticasTurmasGerais.tiposData} dataKey="total" nameKey="name" outerRadius={70}>{(estatisticasTurmasGerais.tiposData||[]).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Pie><Legend /><Tooltip /></PieChart> },
    { id: 6, title: "Dias de maior atividade (turmas do admin)", chart: <BarChart data={estatisticasTurmasGerais.diasAtividade}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill={COLORS[3]} /></BarChart> },
    { id: 7, title: "Horários de maior atividade (turmas do admin)", chart: <BarChart data={estatisticasTurmasGerais.horariosData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill={COLORS[5]} /></BarChart> },
    { id: 8, title: "Turmas criadas pelo admin", chart: <BarChart data={turmasCriadasPorAdmin.map(t => ({ name: t.nome || `Turma ${t.id}`, total: alunosCriadosPorAdmin.filter(a => String(a.Turma) === String(t.id)).length }))}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill={COLORS[4]} /></BarChart>, description: "Turmas atribuídas ao admin (se houver registro)" },
    { id: 9, title: "Menos acessados (top 10, turmas do admin)", chart: <BarChart data={(estatisticasTurmasGerais.jogosData.slice().reverse()).slice(0,10)}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill={COLORS[2]} /></BarChart> },
    { id: 10, title: "Alunos totais (turmas do admin)", chart: <BarChart data={[{ name: "Alunos", total: alunosCriadosPorAdmin.length }]}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill={COLORS[1]} /></BarChart> }
  ];

  // --- GRÁFICOS DE ALUNOS (apenas dados filtrados pelo admin) ---
  const graficoAlunos = [
    { id: 1, title: "Distribuição por cidade (alunos do admin)", chart: <BarChart data={estatisticasAlunos.byCity}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill={COLORS[0]} /></BarChart> },
    { id: 2, title: "Distribuição por escola (alunos do admin)", chart: <BarChart data={estatisticasAlunos.bySchool}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill={COLORS[1]} /></BarChart> },
    { id: 3, title: "Top jogos (alunos do admin)", chart: <BarChart data={estatisticasAlunos.jogosTop.slice(0,12)}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill={COLORS[2]} /></BarChart> },
    { id: 4, title: "Radar de habilidades (média, alunos do admin)", chart: <RadarChart cx="50%" cy="50%" outerRadius={70} width={300} height={250} data={estatisticasAlunos.radarData}><PolarGrid    /><PolarAngleAxis dataKey="subject" /><PolarRadiusAxis /><Radar name="Alunos" dataKey="A" stroke={COLORS[3]} fill={COLORS[3]} fillOpacity={0.3} /></RadarChart> },
    { id: 5, title: "Alunos por turma (top 10, admin)", chart: <BarChart data={turmasCriadasPorAdmin.map(t => ({ name: t.nome || `Turma ${t.id}`, total: alunosCriadosPorAdmin.filter(a => String(a.Turma) === String(t.id)).length })).sort((a,b)=>b.total-a.total).slice(0,10)}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill={COLORS[4]} /></BarChart> },
    { id: 6, title: "Alunos criados pelo admin", chart: <BarChart data={alunosCriadosPorAdmin.map(a => ({ name: a.nome || a.nomeCompleto || `Aluno ${a.id}`, total: 1 }))}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill={COLORS[5]} /></BarChart>, description: "Alunos cujo registro aponta ao admin (campo alunosCadastrados)" },
    { id: 7, title: "Ativos vs Inativos (alunos do admin)", chart: <PieChart><Pie data={[{ name: "Ativos", value: estatisticasTurmasGerais.ativos }, { name: "Inativos", value: estatisticasTurmasGerais.totalAlunos - estatisticasTurmasGerais.ativos }]} dataKey="value" nameKey="name" outerRadius={70}>{[0,1].map(i => <Cell key={i} fill={COLORS[i]} />)}</Pie><Legend /><Tooltip /></PieChart> },
    { id: 8, title: "Dias de acesso (alunos do admin)", chart: <BarChart data={estatisticasTurmasGerais.diasAtividade}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill={COLORS[2]} /></BarChart> },
    { id: 9, title: "Horários de acesso (alunos do admin)", chart: <BarChart data={estatisticasTurmasGerais.horariosData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill={COLORS[3]} /></BarChart> },
    { id: 10, title: "Tempo médio por aluno (min, admin)", chart: <BarChart data={[{ name: "Média (min)", total: Math.round((alunosCriadosPorAdmin.reduce((s,a)=>s+(a.tempoLogado||0),0) / (alunosCriadosPorAdmin.length||1))/60) }]}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill={COLORS[1]} /></BarChart> }
  ];

  // --- GRÁFICOS DE PROFESSORES (apenas dados filtrados pelo admin) ---
  const graficoProfessores = [
    { id: 1, title: "Professores por escola (admin)", chart: <BarChart data={estatisticasProfessores.porEscola}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill={COLORS[0]} /></BarChart> },
    { id: 2, title: "Total de professores (admin)", chart: <BarChart data={[{ name: "Professores", total: professoresCriadosPorAdmin.length }]}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill={COLORS[2]} /></BarChart> },
    { id: 3, title: "Professores x nº de turmas (admin)", chart: <BarChart data={professoresCriadosPorAdmin.map(p => ({ name: p.nome || p.nomeCompleto || `Prof ${p.id}`, total: turmasCriadasPorAdmin.filter(t => String(t.professorId || t.Professor || "") === String(p.id)).length }))}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill={COLORS[3]} /></BarChart> },
{
  id: 4,
  title: "Turmas por professor (admin)",
  chart: (
    <BarChart
      data={turmasCriadasPorAdmin.map(t => {
        const prof = professoresCriadosPorAdmin.find(
          p => String(p.id) === String(t.professorId || t.Professor || "")
        );
        return {
          name: prof?.nome || prof?.nomeCompleto || `Turma ${t.id}`,
          total: 1
        };
      })}
    >
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="total" fill={COLORS[4]} />
    </BarChart>
  )
},
    { id: 5, title: "Professores criados pelo admin", chart: <BarChart data={professoresCriadosPorAdmin.map(p => ({ name: p.nome || p.nomeCompleto || `Prof ${p.id}`, total: 1 }))}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill={COLORS[5]} /></BarChart> },
    { id: 6, title: "Distribuição de turmas (por escola, admin)", chart: <BarChart data={(() => { const map = {}; turmasCriadasPorAdmin.forEach(t => { const e = t.escola || t.escolas?.[0] || (adminDoc?.escolas?.[0] || "Sem escola"); map[e] = (map[e]||0)+1; }); return Object.entries(map).map(([k,v])=>({ name:k, value:v })); })()}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill={COLORS[1]} /></BarChart> },
    { id: 7, title: "Professores x alunos (estimativa, admin)", chart: <BarChart data={professoresCriadosPorAdmin.map(p => ({ name: p.nome || p.nomeCompleto || `Prof ${p.id}`, total: turmasCriadasPorAdmin.filter(t => String(t.professorId || t.Professor || "") === String(p.id)).reduce((s,t) => s + alunosCriadosPorAdmin.filter(a => String(a.Turma) === String(t.id)).length, 0) }))}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill={COLORS[0]} /></BarChart> },
    { id: 8, title: "Top professores por turmas (admin)", chart: <BarChart data={estatisticasProfessores.profTurmas.sort((a,b)=>b.count-a.count).slice(0,10)}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="count" fill={COLORS[2]} /></BarChart> },
    { id: 9, title: "Atividade média dos professores (admin)", chart: <BarChart data={[{ name: "Atividade Média", value: professoresCriadosPorAdmin.length ? Math.round(professoresCriadosPorAdmin.reduce((s,p)=>s + (p.atividade || 0), 0) / professoresCriadosPorAdmin.length) : 0 }]}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill={COLORS[3]} /></BarChart> },
    { id: 10, title: "Resumo: turmas totais (admin)", chart: <BarChart data={[{ name: "Turmas", total: turmasCriadasPorAdmin.length }]}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill={COLORS[5]} /></BarChart> }
  ];

  // --- render principal ---
  if (loading) return <div className={style.loading}>Carregando dados...</div>;

  return (
    <div className={style.layout}>
      <aside className={style.sidebarLeft}>
        <div className={style.logoBox}>
          <h3>Admin Escolar</h3>
          <small>{adminDoc?.nomeCompleto || adminDoc?.email || `ID: ${userId}`}</small>
        </div>
        <nav className={style.menu}>
          <button className={`${style.menuBtn} ${painel === "turmas" ? style.active : ""}`} onClick={() => setPainel("turmas")}>Turmas</button>
          <button className={`${style.menuBtn} ${painel === "alunos" ? style.active : ""}`} onClick={() => setPainel("alunos")}>Alunos</button>
          <button className={`${style.menuBtn} ${painel === "professores" ? style.active : ""}`} onClick={() => setPainel("professores")}>Professores</button>
        </nav>
        <div className={style.sideActions}>
          <button className={style.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className={style.main}>
        <header className={style.header}>
          <h1>{painel === "turmas" ? "Visão Geral - Turmas (Admin)" : painel === "alunos" ? "Visão Geral - Alunos (Admin)" : "Visão Geral - Professores (Admin)"}</h1>
          <div className={style.headerRight}>
            <span className={style.smallInfo}>Turmas: {turmasCriadasPorAdmin.length}</span>
            <span className={style.smallInfo}>Alunos: {alunosCriadosPorAdmin.length}</span>
            <span className={style.smallInfo}>Professores: {professoresCriadosPorAdmin.length}</span>
          </div>
        </header>

        <section className={style.content}>
          {painel === "turmas" && <GraficoGrid list={graficoTurmas} />}
          {painel === "alunos" && <GraficoGrid list={graficoAlunos} />}
          {painel === "professores" && <GraficoGrid list={graficoProfessores} />}
        </section>
      </main>

      <aside className={style.sidebarRight}>
        {/* Dados do Admin */}
        <div className={style.card}>
          <h3>Dados do Admin</h3>
          {adminDoc ? (
            <div className={style.cardBody}>
              <p><strong>Nome:</strong> {adminDoc.nomeCompleto || adminDoc.nome || "-"}</p>
              <p><strong>Email:</strong> {adminDoc.email || "-"}</p>
              <p><strong>ClienteId:</strong> {adminDoc.clienteId || adminDoc.cliente || "-"}</p>
              <p><strong>Cidades:</strong> {(adminDoc.cidades || []).join(", ") || "-"}</p>
              <p><strong>Escolas:</strong> {(adminDoc.escolas || []).join(", ") || "-"}</p>
              <p><strong>Alunos Cadastrados:</strong> {adminDoc.alunosCadastrados?.length || 0}</p>
              <p><strong>Professores Cadastrados:</strong> {adminDoc.professoresCadastrados?.length || 0}</p>
              <p><strong>Turmas:</strong> {adminDoc.turmas?.length || 0}</p>
            </div>
          ) : (
            <div className={style.cardBody}><p>Nenhum documento de admin encontrado. Mostrando dados filtrados (se aplicável).</p></div>
          )}
        </div>

        {/* Listas de Professores (exemplo; você pode adicionar listas para alunos e turmas se quiser) */}
        <div className={style.card}>
          <h3>Professores cadastrados (admin)</h3>
          <div className={style.cardBody}>
            <ul className={style.listSmall}>
              {professoresCriadosPorAdmin.slice(0, 5).map(p => (  // Limitado a 5 para não sobrecarregar
                <li key={p.id}>{p.nome || p.nomeCompleto || p.email || `Prof ${p.id}`}</li>
              ))}
            </ul>
            {professoresCriadosPorAdmin.length === 0 && <p>Nenhum professor cadastrado pelo admin.</p>}
            {professoresCriadosPorAdmin.length > 5 && <p>... e mais {professoresCriadosPorAdmin.length - 5}</p>}
          </div>
        </div>

        {/* Lista de Alunos (opcional, para completar o sidebar) */}
        <div className={style.card}>
          <h3>Alunos cadastrados (admin)</h3>
          <div className={style.cardBody}>
            <ul className={style.listSmall}>
              {alunosCriadosPorAdmin.slice(0, 5).map(a => (
                <li key={a.id}>{a.nome || a.nomeCompleto || `Aluno ${a.id}`}</li>
              ))}
            </ul>
            {alunosCriadosPorAdmin.length === 0 && <p>Nenhum aluno cadastrado pelo admin.</p>}
            {alunosCriadosPorAdmin.length > 5 && <p>... e mais {alunosCriadosPorAdmin.length - 5}</p>}
          </div>
        </div>

        {/* Lista de Turmas (opcional) */}
        <div className={style.card}>
          <h3>Turmas criadas (admin)</h3>
          <div className={style.cardBody}>
            <ul className={style.listSmall}>
              {turmasCriadasPorAdmin.slice(0, 5).map(t => (
                <li key={t.id}>{t.nome || `Turma ${t.id}`}</li>
              ))}
            </ul>
            {turmasCriadasPorAdmin.length === 0 && <p>Nenhuma turma criada pelo admin.</p>}
            {turmasCriadasPorAdmin.length > 5 && <p>... e mais {turmasCriadasPorAdmin.length - 5}</p>}
          </div>
        </div>
      </aside>
    </div>
  );
};

// export { TurmasAdm };
