// src/pages/professor/EstatisticasProfessor.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, get, child } from "firebase/database";
import style from "./estatisticasProf.module.css";
import { pdf } from "@react-pdf/renderer";
import PDFDocument from "./PDFDocument";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from "recharts";

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../api/fireBase"; // seu arquivo firebase.js
import {TutorialEstatisticas} from '../tutoriais/TutorialEstatisticas'
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF0000", "#AA00FF"];
const RADAR_LABELS = ["Lógica", "Memória", "Criatividade", "Resolução"];
import {EditarProf} from "../../../pages"; // ajuste o caminho se estiver em outro lugar

const EstatisticasProfessor = () => {
  const [professor, setProfessor] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [modoTexto, setModoTexto] = useState(false);
  const [graficoAmpliado, setGraficoAmpliado] = useState(null);
const [jogos, setJogos] = useState([]);
const [showEditarProf, setShowEditarProf] = useState(false);
// adicionar junto aos outros useState no topo do componente
const [viewMode, setViewMode] = useState("turma"); // 'turma' | 'aluno'
  const navigate = useNavigate();
  const userId = localStorage.getItem("professorId");
  const userType = localStorage.getItem("userType");

  useEffect(() => {
    if (!userId || userType !== "professor") {
      alert("Você precisa estar logado como professor!");
      navigate("/Professor");
    }
  }, [userId, userType, navigate]);

 
const loadData = async () => {
  try {
    // 1️⃣ Professores
    const professoresSnap = await getDocs(collection(db, "professores"));
    const profs = professoresSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const prof = profs.find((p) => p.id === userId);
    if (!prof) return;
    setProfessor(prof);

    // 2️⃣ Turmas
    const turmasSnap = await getDocs(collection(db, "turmas"));
    const allTurmas = turmasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const minhasTurmas = allTurmas.filter((t) =>
      prof.turmas?.map(String).includes(String(t.id))
    );
    setTurmas(minhasTurmas);

    // 3️⃣ Alunos
    const alunosSnap = await getDocs(collection(db, "alunos"));
    const allAlunos = alunosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    setAlunos(allAlunos || []);

    // 4️⃣ Categorias
    const categoriasSnap = await getDocs(collection(db, "categorias"));
    const categoriasData = categoriasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    setCategorias(categoriasData || []);

    // 5️⃣ Estatísticas da turma selecionada
    const turmaSelecionada = minhasTurmas[0]; // ou a turma que deseja analisar
    if (!turmaSelecionada) return;

    const turmaAlunos = allAlunos.filter(a => String(a.Turma) === String(turmaSelecionada.id));

    // Dias da semana
   // Inicializa contagem de dias da semana
const diasDaSemana = {
  "Domingo": 0,
  "Segunda": 0,
  "Terca": 0,
  "Quarta": 0,
  "Quinta": 0,
  "Sexta": 0,
  "Sabado": 0
};

turmaAlunos.forEach(a => {
  const diasLogin = a.diasQuefezlogin || []; // <--- corrigido
  diasLogin.forEach(diaStr => {
    const [dia, mes, ano] = diaStr.split("/").map(Number);
    const data = new Date(ano, mes - 1, dia); // JS month 0-indexed
    const diaSemana = data.getDay(); // 0 = Domingo ... 6 = Sábado
    const diaNome = ["Domingo","Segunda","Terca","Quarta","Quinta","Sexta","Sabado"][diaSemana];
    diasDaSemana[diaNome] += 1;
  });
});

const diasAtividadeArray = Object.entries(diasDaSemana)
  .map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value);

console.log(diasAtividadeArray);



    // Tempo médio de uso
    const tempoMedioUsoSegundos = turmaAlunos.length
      ? turmaAlunos.reduce((sum, a) => {
const tempoJogosArray = Array.isArray(a.tempoJogos) ? a.tempoJogos : [];
const tempoJogosTotal = tempoJogosArray.reduce((s, j) => s + (j.tempo || 0), 0);
          return sum + (tempoJogosTotal || a.tempoLogado || 0);
        }, 0) / turmaAlunos.length
      : 0;
    const tempoMedioUsoMin = parseFloat((tempoMedioUsoSegundos / 60).toFixed(2));

    console.log({
      turmaAlunos,
      diasDaSemana,
      tempoMedioUsoSegundos,
      tempoMedioUsoMin,
      diasAtividadeArray
    });



// 6️⃣ Jogos (adicione isso após carregar as categorias)
    const jogosSnap = await getDocs(collection(db, "jogos"));
    const jogosData = jogosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    setJogos(jogosData || []);



  } catch (err) {
    console.error(err);
    alert("Erro ao carregar dados do Firebase!");
  }






};

  useEffect(() => { loadData(); }, []);

  if (!professor) return <p>Carregando...</p>;

  // ----- Helpers -----
  const getCategoriaNome = (id) => {
    const cat = categorias.find(c => String(c.id) === String(id));
    return cat?.nome || "Sem Categoria";
  };

const getJogoNome = (id) => {
  const jogo = jogos.find(j => String(j.id) === String(id));
  return jogo?.nome || "Jogo Desconhecido"
}


  const alunosDaTurma = turmaSelecionada
    ? alunos.filter((a) => String(a.Turma) === String(turmaSelecionada.id))
    : [];

  const estatisticasTurma = (turma = turmaSelecionada) => {
    const turmaAlunos = turma
      ? alunos.filter((a) => String(a.Turma) == String(turma.id))
      : [];

    const totalTempoLogado = turmaAlunos.reduce((s, a) => s + (a.tempoLogado || 0), 0);
const totalTempoTotal = turmaAlunos.reduce((s, a) => s + (a.tempoJogos.tempoTotal || 0), 0)/60;

// Média total por aluno em segundos
const tempoMedioTotal = turmaAlunos.length ? Math.round(totalTempoTotal / turmaAlunos.length) : 0;

// Média total em minutos
const tempoMedioTotalMin = Math.round(tempoMedioTotal / 60);


    const jogosPlays = {};
    const tipoDeJogos = {};
    let jogosCompletos = 0;
    let jogosIniciados = 0;
    let totalConclusaoPercentual = 0;
    let totalConclusaoContagem = 0;
    let totalTentativas = 0;
    let tentativasContagem = 0;

    const diasDaSemana = { Domingo:0, Segunda:0, Terca:0, Quarta:0, Quinta:0, Sexta:0, Sabado:0 };

 turmaAlunos.forEach(a => {
  (a.historicoJogos || []).forEach(j => {
    const nome = j.nome || "Desconhecido";
    const total = typeof j.vezesJogadas === "number" ? j.vezesJogadas : 1; // usa vezesJogadas
    jogosPlays[nome] = (jogosPlays[nome] || 0) + total;

    if (typeof j.percentualConclusao === "number") {
      totalConclusaoPercentual += j.percentualConclusao;
      totalConclusaoContagem++;
    }

});



      (a.tipoDeJogos || []).forEach(t => {
        if (t?.categoriaId) tipoDeJogos[t.categoriaId] = (tipoDeJogos[t.categoriaId]||0)+ (t.total || 0);
      });

      if (a.historicoAcessos?.dias) {
        Object.entries(a.historicoAcessos.dias).forEach(([d, v]) => {
          if (diasDaSemana.hasOwnProperty(d)) diasDaSemana[d] += v || 0;
        });
      }
      if (a.historicoAcessos?.horarios) {
        Object.entries(a.historicoAcessos.horarios).forEach(([h, v]) => {
          horarios[h] = (horarios[h]||0) + (v || 0);
        });
      }

      (a.progressoJogos || []).forEach(p => {
        if (typeof p.percentualConclusao === "number") {
          totalConclusaoPercentual += p.percentualConclusao;
          totalConclusaoContagem++;
        }
        if (typeof p.tentativas === "number") {
          totalTentativas += p.tentativas;
          tentativasContagem++;
        }
      });
    });

    const avgConclusaoPercentual = totalConclusaoContagem ? Math.round(totalConclusaoPercentual / totalConclusaoContagem) : 0;
    const avgTentativas = tentativasContagem ? Math.round(totalTentativas / tentativasContagem) : 0;
    const ativos = turmaAlunos.filter(a => (a.tempoJogos.tempoLogado || 0) > 0 || (a.frequencia || 0) > 0).length;
    console.log("ativos:", ativos)
    const matriculados = turmaAlunos.length;
    const taxaParticipacao = matriculados ? Math.round((ativos / matriculados) * 100) : 0;
    const tempoMedioUsoSegundos = turmaAlunos.length ? Math.round(totalTempoLogado / turmaAlunos.length) : 0;
    const tempoMedioUsoMin = Math.round(tempoMedioUsoSegundos / 60);

    let evolucao = [];
    if (turma?.historico?.length) {
      evolucao = turma.historico.map(h=>({ date: h.date, valor: h.valor || 0 }));
    } else {
      const mapDatas = {};
      turmaAlunos.forEach(a => {
        (a.historicoAcessos?.porData || []).forEach(entry => {
          const d = entry.date || entry.data;
          if (!d) return;
          mapDatas[d] = (mapDatas[d] || 0) + (entry.valor || 0);
        });
      });
      evolucao = Object.entries(mapDatas).map(([date, valor]) => ({ date, valor }));
    }

    const jogosRanking = Object.entries(jogosPlays).map(([name, total]) => ({ name, total })).sort((a,b)=>b.total - a.total);

    const radarAgg = { Lógica:0, Memória:0, Criatividade:0, Resolução:0, count:0 };
    turmaAlunos.forEach(a => {
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
    const finalRadar = RADAR_LABELS.map((label) => ({ subject: label, A: radarAgg.count ? Math.round((radarAgg[label] || 0) / radarAgg.count) : 0 }));


turmaAlunos.forEach(a => {
  const diasLogin = a.diasQuefezlogin || []; // <--- corrigido
  diasLogin.forEach(diaStr => {
    const [dia, mes, ano] = diaStr.split("/").map(Number);
    const data = new Date(ano, mes - 1, dia); // JS month 0-indexed
    const diaSemana = data.getDay(); // 0 = Domingo ... 6 = Sábado
    const diaNome = ["Domingo","Segunda","Terca","Quarta","Quinta","Sexta","Sabado"][diaSemana];
    diasDaSemana[diaNome] += 1;
  });
});

const diasAtividadeArray = Object.entries(diasDaSemana)
  .map(([name, value]) => ({ name, value }))
 

console.log(diasAtividadeArray);
// Inicializa um objeto para contar sessões por hora
const horarios = {};

// Inicializa todas as horas com 0
for (let h = 0; h < 24; h++) {
  horarios[h] = 0;
}

// Para cada aluno
turmaAlunos.forEach(a => {
  const registrosPorDiaHora = {}; // evita contar múltiplas sessões no mesmo dia/hora

  (a.sessoes || []).forEach(sessao => {
    const dateObj = sessao.timestamp ? new Date(sessao.timestamp) : new Date(sessao.data);
    const dia = dateObj.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const hora = dateObj.getHours();

    const chave = `${dia}-${hora}`; // combina dia + hora
    if (!registrosPorDiaHora[chave]) {
      registrosPorDiaHora[chave] = true;
      horarios[hora] += 1; // incrementa só uma vez por dia/hora
    }
  });
});

// Converte em array para o gráfico, todas as horas já estão garantidas
const horariosArray = Object.entries(horarios)
  .map(([h, v]) => ({ name: h + "h", value: v }))



console.log(horariosArray);

  

console.log(horariosArray);

   return {
  totalTempoLogado,
  totalTempoTotal,       // soma de todos os alunos
  tempoMedioTotal,
  tempoMedioTotalMin,       // média de tempo total
  jogosPlays,
  tipoDeJogos,
  avgConclusaoPercentual,
  taxaParticipacao,
  tempoMedioUsoMin,
  evolucao,
  jogosRanking,
  habilidadeRadar: finalRadar,
  diasAtividadeArray,
  horariosArray,
  taxaConclusao: { iniciaram: jogosIniciados || 0, finalizaram: jogosCompletos || 0 },
  mediaTentativas: avgTentativas,
  matriculados,
  ativos
};

  };


  // Estatísticas comparativas entre turmas (retorna lista com média de conclusão por turma)
  const comparacaoEntreTurmas = () => {
    return turmas.map(t => {
      const s = estatisticasTurma(t);
      return {
        turmaId: t.id,
        nome: t.nome,
        avgConclusaoPercentual: s.avgConclusaoPercentual || 0,
        tempoMedioUsoMin: s.tempoMedioUsoMin || 0,
        matriculados: s.matriculados || 0
      };
    });
  };

  // Tooltip custom já existente
  const CustomTooltip = ({ payload, label, active }) => {
    if (active && payload && payload.length) {
      return (
        <div className={style.customTooltip}>
          <p>{`${label}: ${payload.map(p => `${p.name || p.dataKey || p.payload?.name} = ${p.value}`).join(", ")}`}</p>
        </div>
      );
    }
    return null;
  };

  const toggleModo = () => setModoTexto(!modoTexto);

const renderGraficosTurma = () => {
  if (!turmaSelecionada) return <p className="text-[2rem] text-[#314c89] text-center">Selecione uma turma para ver estatísticas.</p>;

  const stats = estatisticasTurma(); // pega dados de todos os alunos da turma

  // jogos mais acessados
  const jogosData = Object.entries(stats.jogosPlays || {})
    .filter(([name]) => name)
    .map(([name, total]) => ({ name, total }));

  // distribuição por categoria
  const tiposData = Object.entries(stats.tipoDeJogos || {})
    .map(([id, total]) => ({ name: getCategoriaNome(id), total }))
    .filter(Boolean);

  // tempo médio de uso por aluno
const tempoTurmaData = [
  { name: "Tempo médio por aluno (min)", valor: stats.tempoMedioTotalMin },
  { name: "Tempo total turma (min)", valor: Math.round(stats.totalTempoTotal / 60) }
];


  // dias de maior atividade
const diasAtividadeData = stats.diasAtividadeArray;
console.log("data da semana:" ,diasAtividadeData);
  // horários de maior atividade
  const horariosData = stats.horariosArray.map(h => ({ name: h.name, value: h.value }));

  // ranking de jogos menos acessados
  const menosAcessados = [...(stats.jogosRanking || [])].slice().reverse().slice(0, 10);

  // radar de habilidades
  const radarData = stats.habilidadeRadar;

  // lista completa de gráficos
  const graficoList = [
    {
      id: 1,
      title: "1. Jogos mais acessados",
      chart: <BarChart data={jogosData}><XAxis dataKey="name" /><YAxis /><Tooltip content={<CustomTooltip />} /><Legend /><Bar dataKey="total" fill={COLORS[0]} /></BarChart>
    },
    {
      id: 2,
      title: "2. Distribuição por categoria",
      chart: <PieChart>
 <Pie
  data={tiposData}
  dataKey="total"
  nameKey="name"
  outerRadius={graficoAmpliado ? 120 : 60}
 
>

    {tiposData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
  </Pie>
<Legend 
  layout="vertical"
  verticalAlign="middle"
  align="right"
  wrapperStyle={{ 
    fontSize: graficoAmpliado ? 14 : 10, 
    height: graficoAmpliado ? 400 : 150, // aumentei a altura
    width: graficoAmpliado ? 400 : 80,  // opcional: define largura
  }}
formatter={(value) => 
  graficoAmpliado 
    ? value // mostra completo quando ampliado
    : value.length > 10 
      ? value.substring(0, 10) + "..." // corta quando não ampliado
      : value
}
/>


  <Tooltip />
</PieChart>

    },
    {
      id: 3,
      title: "3. Tempo médio de uso por aluno (minutos)",
      chart: <BarChart data={tempoTurmaData}><XAxis dataKey="name" /><YAxis /><Tooltip content={<CustomTooltip />} /><Legend /><Bar dataKey="valor" fill={COLORS[1]} /></BarChart>
    },
    {
      id: 4,
      title: "4. Dias de maior atividade",
      chart:<BarChart
  width={500}      // largura em pixels
  height={300}     // altura em pixels
  data={diasAtividadeData}
>
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip content={<CustomTooltip />} />
  <Bar dataKey="value" fill={COLORS[2]} />
</BarChart>

    },
    {
      id: 5,
      title: "5. Horários de maior atividade",
      chart: <BarChart data={horariosData}><XAxis dataKey="name" /><YAxis /><Tooltip content={<CustomTooltip />} /><Bar dataKey="value" fill={COLORS[3]} /></BarChart>
    },
    {
      id: 6,
      title: "6. Taxa de participação",
      chart: <PieChart>
        <Pie data={[
          { name: "Ativos", value: stats.ativos },
          { name: "Inativos", value: stats.matriculados - stats.ativos }
        ]} dataKey="value" nameKey="name" outerRadius={graficoAmpliado ? 150 : 60} label={({ name, value }) => `${name}: ${value}`}>
          <Cell fill={COLORS[0]} />
          <Cell fill={COLORS[4]} />
        </Pie>
        <Legend />
        <Tooltip />
      </PieChart>
    },
    {
      id: 7,
      title: "7. Percentual médio de conclusão dos jogos",
      chart: <BarChart data={[{ name: "Conclusão média (%)", valor: stats.avgConclusaoPercentual }]}><XAxis dataKey="name" /><YAxis /><Tooltip content={<CustomTooltip />} /><Bar dataKey="valor" fill={COLORS[5]} /></BarChart>
    },
    {
      id: 8,
      title: "8. Comparação entre turmas (média de conclusão)",
      chart: <BarChart data={comparacaoEntreTurmas()}><XAxis dataKey="nome" /><YAxis /><Tooltip content={<CustomTooltip />} /><Bar dataKey="avgConclusaoPercentual" fill={COLORS[1]} /></BarChart>
    },
    {
      id: 9,
      title: "9. Evolução da turma ao longo do tempo",
      chart: <LineChart data={stats.evolucao}><XAxis dataKey="date" /><YAxis /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="valor" stroke={COLORS[0]} /></LineChart>
    },
    {
      id: 10,
      title: "10. Radar coletivo - habilidades",
      chart: <RadarChart cx="50%" cy="50%" outerRadius={graficoAmpliado ? 120 : 70} width={300} height={250} data={radarData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis />
        <Radar name="Turma" dataKey="A" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.3} />
      </RadarChart>
    },
    {
      id: 11,
      title: "11. Taxa de conclusão da turma",
      chart: <PieChart>
        <Pie data={[
          { name: "Iniciaram", value: stats.taxaConclusao.iniciaram },
          { name: "Finalizaram", value: stats.taxaConclusao.finalizaram }
        ]} dataKey="value" nameKey="name" outerRadius={graficoAmpliado ? 150 : 60} label={({ name, value }) => `${name}: ${value}`}>
          <Cell fill={COLORS[0]} />
          <Cell fill={COLORS[1]} />
        </Pie>
        <Legend />
        <Tooltip />
      </PieChart>
    },
    {
      id: 12,
      title: "12. Média de tentativas por desafio",
      chart: <BarChart data={[{ name: "Média tentativas", valor: stats.mediaTentativas }]}><XAxis dataKey="name" /><YAxis /><Tooltip content={<CustomTooltip />} /><Bar dataKey="valor" fill={COLORS[2]} /></BarChart>
    }
  ];

  if (graficoAmpliado) {
    const g = graficoList.find(gr => gr.title === graficoAmpliado);
    return (
      <div className={style.graficoAmpliado}>
        <button className={style.voltarButton} onClick={()=>setGraficoAmpliado(null)}>← Voltar</button>
        <h2>{g.title}</h2>
        <ResponsiveContainer width="100%" height={400}>{g.chart}</ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className={style.gridContainer}>
      {graficoList.map(g => (
        <div key={g.id} className={style.graficoQuadrado} onClick={()=>setGraficoAmpliado(g.title)}>
          <h4>{g.title}</h4>
          <ResponsiveContainer width="100%" height={150}>{g.chart}</ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};


  const renderGraficos = () => {
  if (!alunoSelecionado) return <p>Selecione um aluno para ver estatísticas.</p>;

const { historicoJogos = [], sessoes = [], diasQuefezlogin = [], dispositivosUsados = [], jogosLike = [], comparativoProgresso = [] } = alunoSelecionado;
  // Agrupa sessões por dia para o gráfico de tempo de uso
  const dataTempoUsoMap = {};
  sessoes.forEach(s => {
    if (!s.data) return;
    dataTempoUsoMap[s.data] = (dataTempoUsoMap[s.data] || 0) + (s.tempo || 0);
  });
  const dataTempoUso = Object.entries(dataTempoUsoMap).map(([dia, tempo]) => ({ dia, tempo }));

  const dataHistorico = historicoJogos.map(j => ({ jogo: j.nome, vezes: j.vezesJogadas, tempo: j.tempoJogado }));
const dataFavoritos = jogosLike.map(jogoId => ({ 
    jogo: getJogoNome(jogoId), 
    valor: 1 
  }));
    const dataFrequencia = diasQuefezlogin.map(d => ({ dia: d, acesso: 1 }));
  const dataRegularidade = [
    { status: "Dias Ativos", valor: diasQuefezlogin.length },
    { status: "Dias Inativos", valor: 30 - diasQuefezlogin.length },
  ];
  const dataDispositivos = dispositivosUsados.map(d => ({ dispositivo: d.tipo, valor: d.total }));
  const dataConclusao = historicoJogos.map(j => ({ jogo: j.nome, percentual: j.vezesJogadas }));
  const dataComparativo = comparativoProgresso.map(c => ({ jogo: c.nome, aluno: c.aluno, turma: c.turma }));
const dataTempoMedio = historicoJogos.map(j => ({
  jogo: j.nome,
  // tempoJogado está em segundos, dividimos por 60 para obter minutos
  tempoMedio: j.vezesJogadas > 0 
    ? parseFloat((j.tempoJogado / j.vezesJogadas / 60).toFixed(2)) 
    : 0
}));


  const dataTentativas = historicoJogos.map(j => ({ jogo: j.nome, tentativas: j.vezesJogadas }));
  const dataDesistencia = [
    { status: "Desistências", valor: historicoJogos.filter(j => j.vezesJogadas < 3).length },
    { status: "Concluídos", valor: historicoJogos.filter(j => j.vezesJogadas >= 3).length },
  ];

  const graficoList = [
    { id:1, title:"Histórico de Jogos", chart: <BarChart data={dataHistorico}><XAxis dataKey="jogo"/><YAxis/><Tooltip/><Legend /><Bar dataKey="vezes" fill={COLORS[0]} /></BarChart> },
    { 
      id:2, 
      title:"Jogos Favoritos", 
      chart: (
        <PieChart>
          <Pie
            data={dataFavoritos}
            dataKey="valor"
            nameKey="jogo"
            outerRadius={graficoAmpliado ? 120 : 60}
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {dataFavoritos.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: graficoAmpliado ? 14 : 10 }} />
          <Tooltip />
        </PieChart>
      )
    },
{ id:3, title:"Tempo total de uso (por sessões)", 
  chart: (
    <BarChart data={dataTempoUso}>
      <XAxis dataKey="dia"/>
      <YAxis tickFormatter={(value) => (value / 60).toFixed(1)} label={{ value: "Tempo (minutos)", angle: -90, position: 'insideLeft' }}/>
      <Tooltip formatter={(value) => [(value / 60).toFixed(1), "minutos"]}/>
      <Legend/>
      <Bar dataKey="tempo" fill={COLORS[1]} />
    </BarChart>
  )
},
    { id:4, title:"Frequência de Acesso", chart: <BarChart data={dataFrequencia}><XAxis dataKey="dia"/><YAxis/><Tooltip/><Legend/><Bar dataKey="acesso" fill={COLORS[2]} /></BarChart> },
    { 
      id:5, 
      title:"Regularidade", 
      chart: (
        <PieChart>
          <Pie
            data={dataRegularidade}
            dataKey="valor"
            nameKey="status"
            outerRadius={graficoAmpliado ? 120 : 60}
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {dataRegularidade.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: graficoAmpliado ? 14 : 10 }} />
          <Tooltip />
        </PieChart>
      )
    },
    { id:6, title:"Dispositivos usados", chart: <BarChart data={dataDispositivos}><XAxis dataKey="dispositivo"/><YAxis/><Tooltip/><Legend/><Bar dataKey="valor" fill={COLORS[3]} /></BarChart> },
    { id:7, title:"Conclusão por jogo", chart: <BarChart data={dataConclusao}><XAxis dataKey="jogo"/><YAxis/><Tooltip/><Legend/><Bar dataKey="percentual" fill={COLORS[4]} /></BarChart> },
    { id:8, title:"Comparativo aluno x turma", chart: <BarChart data={dataComparativo}><XAxis dataKey="jogo"/><YAxis/><Tooltip/><Legend/><Bar dataKey="aluno" fill={COLORS[0]} /><Bar dataKey="turma" fill={COLORS[1]} /></BarChart> },
    { id:9, title:"Tempo médio por jogo", chart: <LineChart data={dataTempoMedio}><XAxis dataKey="jogo"/><YAxis/><Tooltip formatter={(value) => [(value).toFixed(1), "minutos"]}/>
<Legend/><Line type="monotone" dataKey="tempoMedio" stroke={COLORS[2]} /></LineChart> },
    { id:10, title:"Tentativas antes do sucesso", chart: <BarChart data={dataTentativas}><XAxis dataKey="jogo"/><YAxis/><Tooltip/><Legend/><Bar dataKey="tentativas" fill={COLORS[5]} /></BarChart> },
    { 
      id:11, 
      title:"Taxa de desistência", 
      chart: (
        <PieChart>
          <Pie
            data={dataDesistencia}
            dataKey="valor"
            nameKey="status"
            outerRadius={graficoAmpliado ? 120 : 60}
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {dataDesistencia.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: graficoAmpliado ? 14 : 10 }} />
          <Tooltip />
        </PieChart>
      )
    },
  ];

  if (graficoAmpliado) {
    const g = graficoList.find(gr => gr.title === graficoAmpliado);
    return (
      <div className={style.graficoAmpliado}>
        <button className={style.voltarButton} onClick={()=>setGraficoAmpliado(null)}>← Voltar</button>
        <h2>{g.title}</h2>
        <ResponsiveContainer width="100%" height={400}>{g.chart}</ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className={style.gridContainer}>
      {graficoList.map(g => (
        <div key={g.id} className={style.graficoQuadrado} onClick={()=>setGraficoAmpliado(g.title)}>
          <h4>{g.title}</h4>
          <ResponsiveContainer width="100%" height={150}>{g.chart}</ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};

  // PDF download - mantive o seu comportamento
  const handleDownloadTurma = async () => {
    const blob = await pdf(
      <PDFDocument
        professor={professor}
        turmas={[turmaSelecionada]}
        alunos={alunoSelecionado ? [alunoSelecionado] : alunosDaTurma}
        categorias={categorias}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = alunoSelecionado
      ? `estatisticas_${alunoSelecionado.nome}.pdf`
      : `estatisticas_turma_${turmaSelecionada.nome}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Painel central (turma ou aluno)
const renderPainelCentral = () => {
  // Se o usuário abriu o editor de perfil, mostra o componente de edição
  if (showEditarProf) {
    return (
      <div>
        {/* Passe props conforme necessário; onClose fecha o editor */}
        <EditarProf professor={professor} onClose={() => setShowEditarProf(false)} />
      </div>
    );
  }

  if (!turmaSelecionada) {
    return (
      <div className="flex items-center justify-between">
        <h2 className="text-[2rem] text-[#314c89] text-center">Selecione uma turma para ver estatísticas</h2>
    
      </div>
    );
  }

  if (alunoSelecionado) {
    const a = alunoSelecionado;
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
         
        </div>

        {modoTexto ? (
          <div>
            <p><strong>Login:</strong> {a.Login}</p>
            <p><strong>Senha:</strong> {a.senha}</p>
            <p><strong>Escolaridade:</strong> {a.escolaridade}</p>
            <p><strong>Data de Criação:</strong> {a.dataCriacao ? new Date(a.dataCriacao).toLocaleDateString() : "-"}</p>
            <p><strong>Últimos Jogos:</strong> {a.ultimosJogosJogados || "-"}</p>
            <p><strong>Favoritos:</strong> {a.favoritos?.filter(f=>f).join(", ") || "-"}</p>
            <p><strong>Tempo Logado:</strong> {a.tempoLogado ? Math.round(a.tempoLogado / 60) + " min" : "0 min"}</p>
            <p><strong>Tempo Total:</strong> {a.tempoTotal ? Math.round(a.tempoTotal / 60) + " min" : "0 min"}</p>
            <p><strong>Frequência de Acesso:</strong> {a.frequenciaAcesso || 0}</p>
            <p><strong>Regularidade:</strong> {a.regularidade ? `${a.regularidade.diasConsecutivos || 0} dias consecutivos, ${a.regularidade.diasAtivosNoMes || 0} dias ativos no mês` : "-"}</p>
            <p><strong>Dispositivos usados:</strong> {Object.entries(a.dispositivosUsados || {}).map(([d, v]) => `${d}: ${v}`).join(", ") || "-"}</p>
          </div>
        ) : (
          renderGraficos(a)
        )}

        <div style={{ marginTop: "1rem" }}>
        </div>
      </div>
    );
  }

  // Caso padrão: turma selecionada e nenhum aluno selecionado
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
    
        </div>
      </div>

      {renderGraficosTurma()}
    </div>
  );
};
    const logout = () => {
    localStorage.removeItem("professorId");
    localStorage.removeItem("userType");
    navigate("/Professor");
  };
return (
    <div className="min-h-screen bg-[#e4edf4]">
      {/* Top bar (central tabs + sair/avatar) */}
      <header className="flex items-center justify-between w-full h-20 px-6">
        <div className="w-48">   {/* Título */}
    <div className="mt-2 mb-6 text-center">
      <div className="text-lg font-bold leading-tight text-indigo-700 text-[1.6rem]">Nome<br/>Site</div>
    </div></div>

        <div className="flex items-center gap-2 bg-[#edf4fb] rounded-full px-1 py-1 shadow-sm">
          <button             className="px-4 py-2 font-medium text-blue-600 transition bg-[#acc9ff] rounded-full hover:bg-slate-100 text-[#314c89]" style={{fontWeight: 600}}>
            Minhas Turmas
            </button>
            
      <button             className="px-4 py-2 font-medium text-white transition rounded-full text-[#314c89] " style={{fontWeight: 600}} onClick={()=>navigate("/JogosProf")}>
            Conferir Jogos
            </button>
        </div>




        <div className="flex items-center gap-4">
          <button className="font-medium text-indigo-700 text-[#314c89] text-[1.2rem]" style={{fontWeight: 600}} onClick={logout}>Sair</button>
          <div className="flex items-center justify-center bg-white rounded-full shadow w-18 h-18">
            <button onClick={()=>setShowEditarProf(true)}>
                      <img src="https://cdn-icons-png.flaticon.com/512/3135/3135707.png" alt="" />
 </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
<aside className="w-56 h-[75vw] px-6 py-6 bg-[#f2f7fa]">
 

    {/* nav pills */}
    <nav className="flex flex-col items-center gap-4 mt-6">
      <button
        aria-pressed={viewMode === "turma"}
        onClick={() => { setViewMode("turma"); setAlunoSelecionado(null); setShowEditarProf(false) }}
        className={`flex items-center gap-3 px-4 py-3 rounded-full w-44 justify-start transition-shadow
          ${viewMode === "turma" ? "bg-indigo-800 text-white shadow-md" : "bg-indigo-300 text-white"}`}
      >
        <span className={`flex items-center justify-center rounded-full w-9 h-9 
          ${viewMode === "turma" ? "bg-white/20 text-white" : "bg-white text-indigo-700"}`}>
          {/* ícone de turmas (chapéu) */}
         <img src="https://cdn-icons-png.flaticon.com/512/1995/1995574.png" alt="" />
        </span>
        <span className="font-semibold">Turmas</span>
      </button>

      <button
        aria-pressed={viewMode === "aluno"}
        onClick={() => { setViewMode("aluno");  setShowEditarProf(false) }}
        className={`flex items-center gap-3 px-4 py-3 rounded-full w-44 justify-start transition-shadow
          ${viewMode === "aluno" ? "bg-indigo-800 text-white shadow-md" : "bg-indigo-300 text-white"}`}
      >
        <span className={`flex items-center justify-center rounded-full w-9 h-9
          ${viewMode === "aluno" ? "bg-white/20 text-white" : "bg-white text-indigo-700"}`}>
          {/* ícone de aluno (livro/pessoa) */}
     <img src="https://cdn-icons-png.flaticon.com/512/10550/10550917.png" alt="" />
        </span>
        <span className="font-semibold">Alunos</span>
      </button>
    </nav>

    {/* espaço livre abaixo para alinhamento igual à imagem */}
    <div className="flex-1" />

    {/* link voltar (opcional) */}
    <div className="mt-4">
      <a href="/HomeProfessor" className="text-sm text-indigo-600 hover:underline">← Voltar</a>
    </div>
</aside>

        {/* Main content */}
       {/* Main content */}
<main className="flex-1 px-10 py-8">
  {/* Botões de troca (opcional, também já têm os da sidebar) */}
  <div className="flex items-center gap-3 mb-6">
   
  </div>

  {/* Select condicional: Turma ou Aluno */}
 {!showEditarProf && (
  <div className="mb-6">
    {viewMode === "turma" ? (
      <div className="max-w-md mt-2">
        <select
          value={turmaSelecionada?.id || ""}
          onChange={(e) => {
            const t = turmas.find(x => String(x.id) === String(e.target.value));
            setTurmaSelecionada(t || null);
            setAlunoSelecionado(null);
          }}
          className="w-1/2 px-4 py-2 text-indigo-900 bg-indigo-100 rounded-full focus:outline-none bg-[#91b2ea] text-[1.3rem] text-[#314c89]"
        >
          <option value="" disabled>Selecione a turma ▼</option>
          {turmas.map(t => (
            <option key={t.id} value={t.id}>
              {t.nome} ({t.ano})
            </option>
          ))}
        </select>
      </div>
    ) : (
      <div className="max-w-md mt-2">
        <select
          value={alunoSelecionado?.id || ""}
          onChange={(e) => {
            const a = alunosDaTurma.find(x => String(x.id) === String(e.target.value));
            setAlunoSelecionado(a || null);
          }}
          disabled={!turmaSelecionada}
          className="w-1/2 px-4 py-2 text-indigo-900 bg-indigo-100 rounded-full focus:outline-none bg-[#91b2ea] text-[1.3rem] text-[#314c89]"
        >
          <option value="">{turmaSelecionada ? "Selecione o aluno ▼" : "Selecione uma turma primeiro"}</option>
          {alunosDaTurma.map(a => (
            <option key={a.id} value={a.id}>{a.nome}</option>
          ))}
        </select>
      </div>
    )}
  </div>
)}
  {/* Cabeçalho e painel continuam iguais */}

  <div className="mt-8">
    <div className="p-6 rounded-md ">
      {renderPainelCentral()}
    </div>
  </div>

  {turmaSelecionada && (
    <div className="flex justify-end mt-6">

    </div>
  )}
</main>
      </div>
    </div>
  );
};
export { EstatisticasProfessor };
