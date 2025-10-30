

// src/pages/professor/PDFDocument.jsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const pdfStyles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
  },
  section: {
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: 700,
  },
  text: {
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    paddingVertical: 2,
    alignItems: "center",
  },
  cell: {
    flex: 1,
    paddingRight: 4,
  },
  avatar: {
    width: 30,
    height: 30,
    marginBottom: 4,
  },
});

const PDFDocument = ({ professor, turmas, alunos, categorias }) => {
  const getCategoriaNome = (categoriaId) => {
    const cat = categorias.find(c => String(c.id) === String(categoriaId));
    return cat ? cat.nome : categoriaId;
  };

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.title}>Estatísticas do Professor: {professor.nome || professor.email}</Text>

        {turmas.map((turma) => {
          const alunosDaTurma = alunos.filter(a => String(a.Turma) === String(turma.id));
          const totalTempoLogado = alunosDaTurma.reduce((s,a)=>s+(a.tempoLogado||0),0);
          const totalTempoTotal = alunosDaTurma.reduce((s,a)=>s+(a.tempoTotal||0),0);

          return (
            <View key={turma.id} style={pdfStyles.section}>
              <Text style={pdfStyles.subtitle}>Turma: {turma.nome} - Ano: {turma.ano}</Text>
              <Text style={pdfStyles.text}>Cidade: {turma.cidade || "-"} | Escola: {turma.escola || "-"}</Text>
              <Text style={pdfStyles.text}>Total de alunos: {alunosDaTurma.length}</Text>
              <Text style={pdfStyles.text}>Tempo total logado (min): {Math.round(totalTempoLogado/60)}</Text>
              <Text style={pdfStyles.text}>Tempo total na plataforma (min): {Math.round(totalTempoTotal/60)}</Text>

              {alunosDaTurma.map(aluno => {
                const jogoMaisJogado = aluno.jogosPlays?.length ? aluno.jogosPlays.reduce((p,c)=>c.total>p.total?c:p).jogoNome : "-";
                return (
                  <View key={aluno.id} style={{ marginBottom: 10 }}>
                    <Text style={{ fontWeight: 700 }}>Aluno: {aluno.nome}</Text>
                    <Text>Login: {aluno.Login || "-"}</Text>
                    <Text>Senha: {aluno.senha || "-"}</Text>
                    <Text>Escolaridade: {aluno.escolaridade || "-"}</Text>
                    <Text>Tempo logado: {Math.round((aluno.tempoLogado||0)/60)} min</Text>
                    <Text>Tempo total: {Math.round((aluno.tempoTotal||0)/60)} min</Text>
                    <Text>Favoritos: {aluno.favoritos?.join(", ") || "-"}</Text>
                    <Text>Jogo mais jogado: {jogoMaisJogado}</Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </Page>
    </Document>
  );
};


export default PDFDocument;

