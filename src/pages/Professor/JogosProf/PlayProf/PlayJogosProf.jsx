import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs
} from "firebase/firestore";
import { app } from "../../../firebase/firebaseConfig";
import { GamesProfCard, Games } from "../../../../components"; // ajuste o path se necessário
import {Filter} from "bad-words";

const PlayJogosProf = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const db = getFirestore(app);

  const iframeRef = useRef();

  // Estado principal
  const [game, setGame] = useState(null);
  const [comentario, setComentario] = useState("");
  const [comentarios, setComentarios] = useState([]);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [mensagemFeedback, setMensagemFeedback] = useState("");
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState(""); // "professor" | "admEscolar"
  const [loading, setLoading] = useState(true);

  // Recomendações
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  // Decodifica link da querystring (se existir)
  const gameLink = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const encoded = params.get("link") || "";
    try {
      return decodeURIComponent(encoded);
    } catch {
      return encoded || "";
    }
  }, [location.search]);

  // Determina user (professor/admin) e carrega dados do jogo
  useEffect(() => {
    const professorId = localStorage.getItem("professorId");
    const admEscolarId = localStorage.getItem("admEscolarId");
    const gameId = localStorage.getItem("currentGameId");

    if ((!professorId && !admEscolarId) || !gameId) {
      // não autorizado / dados insuficientes -> volta para lista
      navigate("/JogosProf", { replace: true });
      return;
    }

    const currentUserId = professorId || admEscolarId;
    const currentUserType = professorId ? "professor" : "admEscolar";
    setUserId(currentUserId);
    setUserType(currentUserType);

    const load = async () => {
      setLoading(true);
      try {
        // Carrega nome do usuário
        const collectionName = currentUserType === "professor" ? "professores" : "AdminsEscolares";
        const userRef = doc(db, collectionName, currentUserId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const d = userSnap.data();
          const nome = currentUserType === "professor" ? (d.nome || "Professor") : (d.nomeCompleto || "Admin Escolar");
          setUserName(nome);
        } else {
          setUserName(currentUserType === "professor" ? "Professor" : "Admin Escolar");
        }

        // Carrega jogo
        const gameRef = doc(db, "jogos", gameId);
        const gameSnap = await getDoc(gameRef);
        if (!gameSnap.exists()) {
          navigate("/JogosProf", { replace: true });
          return;
        }

        const jogo = gameSnap.data();

        // Normaliza arrays
        jogo.comentariosProfessores = Array.isArray(jogo.comentariosProfessores) ? jogo.comentariosProfessores : [];
        jogo.likedByProfessores = Array.isArray(jogo.likedByProfessores) ? jogo.likedByProfessores : [];
        jogo.dislikedByProfessores = Array.isArray(jogo.dislikedByProfessores) ? jogo.dislikedByProfessores : [];

        setGame({ ...jogo, id: gameId, link: gameLink || jogo.link });
        setComentarios(jogo.comentariosProfessores || []);
        setLikes(jogo.likesProfessores || 0);
        setDislikes(jogo.dislikesProfessores || 0);
      } catch (err) {
        console.error("Erro ao carregar PlayJogosProf:", err);
        navigate("/JogosProf", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [db, navigate, gameLink]);

  // Funções: fullscreen
  const goFullscreen = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    if (iframe.requestFullscreen) iframe.requestFullscreen();
    else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
    else if (iframe.mozRequestFullScreen) iframe.mozRequestFullScreen();
    else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
  };


// Import correto

// Cria o filtro
const filtro = new Filter();

// Adiciona palavras em português + variações
filtro.addWords(
  "cacete", "c4c3t3", "merda", "m3rd@", "porra", "p0rr@", 
  "caralho", "c@ralho", "bosta", "b0st@", 
  "puta", "p0ta", "p*ta", 
  "foda", "f0d@", "f0da", 
  "idiota", "imbecil", "burro", "otário", "otario"
);


  // Comentários (professores/admin)
  const enviarComentario = async () => {
     if (!comentario.trim() || !userId || !game) return;

  // Verifica se contém palavrões
if (filtro.isProfane(comentario)) {
    alert("Comentário contém palavras ofensivas.");
    return;
}

  const novo = { id: userId, user: userName, texto: comentario, tipo: userType };

  try {
    const gameRef = doc(db, "jogos", game.id);
    const gameSnap = await getDoc(gameRef);
    if (!gameSnap.exists()) return;

    const jogo = gameSnap.data();
    const arr = Array.isArray(jogo.comentariosProfessores) 
      ? [...jogo.comentariosProfessores, novo] 
      : [novo];

    await updateDoc(gameRef, { comentariosProfessores: arr });
    setComentarios(arr);  // Se você estiver mostrando os dois tipos juntos, talvez precise unir arrays
    setComentario("");
  } catch (err) {
    console.error("Erro ao enviar comentário (prof):", err);
  }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") enviarComentario();
  };

  // Excluir comentário (só autor)
const excluirComentario = async (index) => {
  if (!game || !userId) return;
  const target = comentarios[index];
  if (!target || target.id !== userId) return;

  const confirma = window.confirm("Excluir seu comentário?");
  if (!confirma) return;

  try {
    const gameRef = doc(db, "jogos", game.id);
    const gameSnap = await getDoc(gameRef);
    if (!gameSnap.exists()) return;
    const jogo = gameSnap.data();
    const lista = Array.isArray(jogo.comentariosProfessores) ? jogo.comentariosProfessores : [];

    // filtra pelo id + texto para evitar problemas de índice
    const nova = lista.filter(c => !(c.id === target.id && c.texto === target.texto));

    await updateDoc(gameRef, { comentariosProfessores: nova });
    setComentarios(nova);
  } catch (err) {
    console.error("Erro ao excluir comentário (prof):", err);
  }
};

  // Likes / Dislikes (professores/admin)
  const darLike = async () => {
    if (!userId || !game) return;
    const gameRef = doc(db, "jogos", game.id);
    try {
      const gameSnap = await getDoc(gameRef);
      if (!gameSnap.exists()) return;
      const jogo = gameSnap.data();

      jogo.likedByProfessores = Array.isArray(jogo.likedByProfessores) ? jogo.likedByProfessores : [];
      jogo.dislikedByProfessores = Array.isArray(jogo.dislikedByProfessores) ? jogo.dislikedByProfessores : [];

      if (jogo.likedByProfessores.includes(userId)) return;

      // remove de disliked se presente
      if (jogo.dislikedByProfessores.includes(userId)) {
        jogo.dislikedByProfessores = jogo.dislikedByProfessores.filter(u => u !== userId);
      }

      jogo.likedByProfessores.push(userId);

      const novoLikes = jogo.likedByProfessores.length;
      const novoDislikes = jogo.dislikedByProfessores.length;

      await updateDoc(gameRef, {
        likesProfessores: novoLikes,
        dislikesProfessores: novoDislikes,
        likedByProfessores: jogo.likedByProfessores,
        dislikedByProfessores: jogo.dislikedByProfessores
      });

      setLikes(novoLikes);
      setDislikes(novoDislikes);
      setMensagemFeedback("Obrigado pelo feedback!");
    } catch (err) {
      console.error("Erro ao dar like (prof):", err);
    }
  };

  const darDislike = async () => {
    if (!userId || !game) return;
    const gameRef = doc(db, "jogos", game.id);
    try {
      const gameSnap = await getDoc(gameRef);
      if (!gameSnap.exists()) return;
      const jogo = gameSnap.data();

      jogo.likedByProfessores = Array.isArray(jogo.likedByProfessores) ? jogo.likedByProfessores : [];
      jogo.dislikedByProfessores = Array.isArray(jogo.dislikedByProfessores) ? jogo.dislikedByProfessores : [];

      if (jogo.dislikedByProfessores.includes(userId)) return;

      if (jogo.likedByProfessores.includes(userId)) {
        jogo.likedByProfessores = jogo.likedByProfessores.filter(u => u !== userId);
      }

      jogo.dislikedByProfessores.push(userId);

      const novoLikes = jogo.likedByProfessores.length;
      const novoDislikes = jogo.dislikedByProfessores.length;

      await updateDoc(gameRef, {
        likesProfessores: novoLikes,
        dislikesProfessores: novoDislikes,
        likedByProfessores: jogo.likedByProfessores,
        dislikedByProfessores: jogo.dislikedByProfessores
      });

      setLikes(novoLikes);
      setDislikes(novoDislikes);
      setMensagemFeedback("Obrigado pelo feedback!");
    } catch (err) {
      console.error("Erro ao dar dislike (prof):", err);
    }
  };

  // Recomendações (vertical à direita)
  useEffect(() => {
    if (!game) return;
    let mounted = true;
    const limit = 8;

    const fetchRecs = async () => {
      setLoadingRecommended(true);
      try {
        const snap = await getDocs(collection(db, "jogos"));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const currentCats = Array.isArray(game.categorias) ? game.categorias.map(String) : [];

        // Prioriza mesma categoria
        let sameCat = all.filter(g =>
          g.id !== game.id &&
          Array.isArray(g.categorias) &&
          g.categorias.some(c => currentCats.includes(String(c)))
        );

        // fallback random
        const shuffle = arr => {
          const a = [...arr];
          for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
          }
          return a;
        };

        sameCat = shuffle(sameCat);

        let selected = sameCat.slice(0, limit);
        if (selected.length < limit) {
          const remaining = shuffle(all.filter(g => g.id !== game.id && !selected.some(s => s.id === g.id)));
          selected = selected.concat(remaining.slice(0, limit - selected.length));
        }

        if (mounted) setRecommendedGames(selected);
      } catch (err) {
        console.error("Erro ao buscar recomendações (prof):", err);
        if (mounted) setRecommendedGames([]);
      } finally {
        if (mounted) setLoadingRecommended(false);
      }
    };

    fetchRecs();
    return () => { mounted = false; };
  }, [game, db]);

  const playRecommended = (g) => {
    if (!g || !g.link) return;
    // atualiza localStorage e recarrega a página (ou navega)
    localStorage.setItem("currentGameId", String(g.id));
    localStorage.setItem("currentGameLink", String(g.link));
    // mantém rota, mas força reload para recarregar dados
    navigate(`/PlayJogosProf?link=${encodeURIComponent(g.link)}`, { replace: false });
    // scroll up
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render guard
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <p className="text-lg text-slate-700">Carregando jogo...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-700">Jogo não encontrado.</p>
      </div>
    );
  }
  const isProfessor = !!localStorage.getItem("professorId");
  const isAdmin = !!localStorage.getItem("admEscolarId");

  // Emoji para identificar o autor do comentário (simples)
  const getUserEmoji = tipo => (tipo === "admEscolar" ? "👨‍🏫⭐" : "👨‍🏫");

  return (
    <div className="min-h-screen p-6 bg-[#e4edf4]">

 <header className="flex items-center justify-between gap-4 px-4 py-3 bg-[#e4edf4]">
        <div className="flex items-center gap-3">
     <h2 className="text-[1.6rem]" style={{color: "#314c89"}}>Nome <br /> site</h2>
        </div>

        {/* Central pill with two main buttons (como na imagem) */}
        <div className="flex items-center gap-2 px-1 py-1 bg-white rounded-full shadow-sm">
          <button
            onClick={() => {
              if (isProfessor) navigate("/HomeProfessor");
              else if (isAdmin) navigate("/PerfilAdm");
              else navigate("/");
            }}
            className="px-4 py-2 font-medium text-white transition rounded-full text-[#314c89] "
            style={{fontWeight: 600}}
          >
Voltar para Home     
     </button>

          <button
            
            className="px-4 py-2 font-medium text-blue-600 transition bg-[#ebf2ff] rounded-full hover:bg-slate-100 text-[#314c89]" style={{fontWeight: 600}}
          onClick={()=> navigate("/JogosProf")}
          >
            Conferir Jogos
          </button>
        </div>

        {/* Perfil button */}
        <div>
         
        </div>
      </header>
      
      <div className="grid grid-cols-12 gap-6 mx-auto ">
        {/* Coluna principal (iframe + comentários) */}
        <div className="flex flex-col col-span-8 gap-4">
          {/* Header do jogo */}
        

          {/* Área do IFRAME */}
          <div className="bg-[#c6d6f3] rounded-2xl p-4 shadow-inner">
                          <div className="text-lg font-semibold">{game.nome}</div>

            <div className="p-4 rounded-xl">
              <iframe
                ref={iframeRef}
                src={encodeURI(game.link || "/jogos/404.html")}
                title={game.nome}
                className="w-full h-[40vw] rounded-md border-0"
              />
            </div>
          </div>

          {/* Área de interação - likes, input e comentários */}
          <div className="bg-[#c6d6f3] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4" style={{alignSelf: "center"}}>
                <button
                  onClick={darLike}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white"
                >
  <img
    src="https://cdn-icons-png.flaticon.com/512/6416/6416364.png"
    alt="Like"
    className="w-10 h-10 transition-transform duration-200 cursor-pointer active:-translate-y-2"
    onClick={() => console.log("Like!")}
  />                  <span className="font-semibold text-black">{likes}</span>
                </button>

                <button
                  onClick={darDislike}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white"
                >



                  
<img
    src="https://cdn-icons-png.flaticon.com/256/10187/10187338.png"
    alt="Dislike"
    className="w-10 h-10 transition-transform duration-200 cursor-pointer active:translate-y-2"
    onClick={() => console.log("Dislike!")}
  />                  <span className="font-semibold text-black">{dislikes}</span>
                </button>
              </div>

              <div className="text-sm text-slate-700">
                {mensagemFeedback && <span className="text-green-700">{mensagemFeedback}</span>}
              </div>
            </div>

            {/* Input */}
            <div className="flex items-center gap-3 mb-6">
              <input
                type="text"
                placeholder={`Adicionar comentário (${userType === "professor" ? "professores" : "administração escolar"})`}
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 px-4 py-3 bg-white rounded-full text-slate-800 placeholder-slate-400"
              />
              <button
                onClick={enviarComentario}
                className="px-4 py-3 text-white bg-green-600 rounded-full hover:bg-green-700"
              >
                Postar
              </button>
            </div>

            {/* Lista de comentários */}
            <div className="space-y-4">
              {comentarios.length === 0 && (
                <div className="text-slate-700">Sem comentários ainda.</div>
              )}

              {comentarios.map((c, i) => (
                <div key={i} className="flex items-start justify-between p-4 rounded-lg bg-white/90 text-[#314c89]">
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-10 h-10 font-semibold rounded-full bg-slate-200">
                      {c.user?.[0] || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="font-semibold">{c.user}</div>
                        <div className="text-sm text-slate-500">{getUserEmoji(c.tipo)}</div>
                      </div>
                      <p className="mt-2 text-slate-700 text-[#314c89] text-[1.2rem]">{c.texto}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                   {c.id === userId && c.tipo === userType && (
  <button
    onClick={() => excluirComentario(i)}
    className="text-sm text-red-600 hover:underline"
    style={{ color: "black" }}
  >
    Excluir
  </button>
)}

                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna direita (descrição + outros jogos) */}
        <aside className="flex flex-col col-span-4 gap-6">
          {/* Descrição e controles */}
          <div className="bg-[#c6d6f3] rounded-2xl p-4 h-auto shadow-sm">
            <h3 className="mb-3 font-semibold">Descrição do Jogo</h3>
            <div className="bg-white/80 rounded-lg p-3 mb-4 min-h-[160px]">
              <p className="text-sm text-slate-800">{game.descricao || "Descrição..."}</p>
            </div>

                   {game.controles && (
  <div className="mt-4">
    <h4 className="text-sm font-medium text-[1.4rem] underline">Controles</h4>
    <div className="flex gap-4 mt-2">
      {game.controles.mouse && (
        <img
          src="https://images.vexels.com/media/users/3/137138/isolated/preview/e9faff025a6537a284b99f14fd7f156f-icone-de-mouse-sem-fio.png"
          alt="Mouse"
          className="h-[5rem]"
        />
      )}
      {game.controles.controle && (
        <img
          src="https://stickersllamita.com/wp-content/uploads/2022/02/awsd.png"
          alt="Controle"
          className="h-[5rem]"
        />
      )}
    </div>
  </div>
)}

            {game.dispositivos && (
              <div>
                <h4 className="mb-2 font-medium">Dispositivos</h4>
                <div className="p-3 rounded-lg bg-white/80">
                  <p className="text-sm text-slate-800">{game.dispositivos}</p>
                </div>
              </div>
            )}
          </div>

          {/* Outros jogos (vertical) */}
          <div className="p-4 rounded-2xl">
            <h4 className="mb-3 font-semibold">Outros jogos</h4>

            {loadingRecommended ? (
              <p className="text-sm text-slate-500">Carregando...</p>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
                {recommendedGames.map((g, idx) => (
                  <div key={g.id} className="w-full">
                    {/* Reaproveitamos GamesProfCard - se ele for muito largo, ajuste min-w ou forneça uma variante pequena */}
                    <div className="cursor-pointer" onClick={() => playRecommended(g)}>
                      <div className="flex items-center gap-3 bg-[#334a7a] rounded-lg p-3">
                        <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-md bg-white/10">
                          {g.foto ? (
                            <img src={g.foto} alt={g.nome} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full bg-slate-200" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="font-medium text-white">{g.nome}</div>
                          <div className="mt-2">
                            <div className="inline-block px-3 py-1 rounded-full bg-[#9fb7e9] text-white text-sm">
                              Jogar novamente
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export { PlayJogosProf };