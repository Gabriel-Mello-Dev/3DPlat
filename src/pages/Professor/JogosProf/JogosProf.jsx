import { useState, useEffect, useMemo } from "react";
import { GamesProfCard, Engrenagem, SquareLoad } from "../../../components";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../../../api/fireBase";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import HomeDev from './../../desenvolvedor/HomeDev/HomeDev';

const JogosProf = () => {
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [visibleGames, setVisibleGames] = useState([]);

  const navigate = useNavigate();

  // filtros locais (por enquanto vazios)
  const searchTerm = "";
  const selectedCategoria = null;

  useEffect(() => {
    const professorId = localStorage.getItem("professorId");
    const admEscolarId = localStorage.getItem("admEscolarId");
    const hasUser = Boolean(professorId || admEscolarId);
    if (!hasUser) navigate("/", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        await getDocs(collection(db, "categorias"));
        setOnline(true);
      } catch (err) {
        console.error("Firebase offline:", err);
        setOnline(false);
      }
    };
    checkFirebase();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const snapshotJogos = await getDocs(collection(db, "jogos"));
        const jogosData = snapshotJogos.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const jogosComStatus = await Promise.all(
          jogosData.map(async game => {
            const storageRef = ref(storage, `jogos/${game.desenvolvedores}/${game.nome}/index.html`);
            try {
              await getDownloadURL(storageRef);
              return { ...game, online: true };
            } catch {
              return { ...game, online: false };
            }
          })
        );

        const filtrados = jogosComStatus.filter(g => g.online);
        setGames(filtrados);
        setVisibleGames(filtrados.map(g => g.id));

        const snapshotCategorias = await getDocs(collection(db, "categorias"));
        const categoriasData = snapshotCategorias.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategorias(categoriasData);
      } catch (err) {
        console.error("Erro ao carregar dados do Firebase:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const baseGames = useMemo(() => games, [games]);

  const getGamesByCategoria = (categoria) => {
    const categoriaKey = categoria.id || categoria.nome;
    return baseGames
      .filter(game =>
        Array.isArray(game.categorias)
          ? game.categorias.includes(categoriaKey)
          : game.categorias === categoriaKey
      )
      .filter(game =>
        !searchTerm || game.nome?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const categoriasFiltradas = categorias
    .filter(cat => !selectedCategoria || cat.id === selectedCategoria)
    .filter(cat => getGamesByCategoria(cat).length > 0);

  const handleRemove = id => {
    setVisibleGames(prev => prev.filter(gid => gid !== id));
  };

  // helpers de navegação conforme tipo de usuário
  const isProfessor = !!localStorage.getItem("professorId");
  const isAdmin = !!localStorage.getItem("admEscolarId");

  const handleBack = () => {
    if (isProfessor) navigate("/HomeProfessor");
    else if (isAdmin) navigate("/HomeEscola");
    else navigate("/");
  };

  const handlePerfil = () => {
    if (isProfessor) navigate("/PerfilProfessor");
    else if (isAdmin) navigate("/PerfilAdm");
    else navigate("/Perfil");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-semibold text-slate-700">Carregando jogos...</h2>
          <div className="flex justify-center">
            <SquareLoad />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 px-4 py-3 bg-[#e4edf4] shadow-sm">
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
          >
            Conferir Jogos
          </button>
        </div>

        {/* Perfil button */}
        <div>
         
        </div>
      </header>

      {/* Conteúdo */}
      <main className="px-6 py-6 bg-[#e4edf4]">
        {online ? (
          categoriasFiltradas.length > 0 ? (
            categoriasFiltradas.map(categoria => {
              const jogosCategoria = getGamesByCategoria(categoria);
              return (
                <section key={categoria.id} className="mb-8">
                  {/* Cabeçalho categoria */}
                  <div className="flex items-center gap-4 px-4 py-2 mb-4 rounded-full ">
                    {categoria.foto && (
                      <img src={categoria.foto} alt={categoria.nome} className="object-contain w-12 h-12 rounded" />
                    )}
                    <h2 className="text-xl font-semibold select-none text-slate-900 text-[#314c89]">{categoria.nome}</h2>
                  </div>

                  {/* Linha de jogos (scroll horizontal) */}
<div className="flex gap-4 pb-2 overflow-x-auto bg-white min-h-[10rem] items-center">
                    {jogosCategoria.map((game, idx) => (
                      <div key={game.id} className="min-w-[280px] pl-5">
                        <GamesProfCard
                          id={game.id}
                          nome={game.nome}
                          link={game.link}
                          foto={game.foto}
                          gif={game.gif}
                          categorias={game.categorias}
                          visible={visibleGames.includes(game.id)}
                          delay={idx * 50}
                          onRemove={handleRemove}
                          onPlay={() => {
                            localStorage.setItem("currentGameId", game.id);
                            localStorage.setItem("currentGameLink", game.link);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg text-slate-600">Nenhum jogo encontrado</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <h2 className="mb-4 text-2xl font-semibold text-slate-700">Server off</h2>
            <Engrenagem />
          </div>
        )}
      </main>
    </div>
  );
};

export { JogosProf };