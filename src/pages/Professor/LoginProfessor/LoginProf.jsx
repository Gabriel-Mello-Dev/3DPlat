import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import bcrypt from "bcryptjs";
import style from './loginProf.module.css'
const LoginProf = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState(false);
  const [msgText, setMsgTxt] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const navigate = useNavigate();
  const db = getFirestore(db);

  const login = async () => {
    if (!email || !senha) {
      setMsg(true);
      setMsgTxt("Preencha todos os campos!");
      return;
    }

    setMsg(false);
    setMsgTxt("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const professoresRef = collection(db, "professores");
      const q = query(professoresRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setIsLoading(false);
        setMsg(true);
        setMsgTxt("Email ou senha incorretos!");
        return;
      }

      const professorDoc = querySnapshot.docs[0];
      const professor = { id: professorDoc.id, ...professorDoc.data() };

      const senhaValida = await bcrypt.compare(senha, professor.senha);
      if (!senhaValida) {
        setIsLoading(false);
        setMsg(true);
        setMsgTxt("Email ou senha incorretos!");
        return;
      }

      const professorRef = doc(db, "professores", professor.id);

      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(professorRef);

          if (!snap.exists()) {
            throw new Error("Professor não encontrado");
          }

          const dadosProf = snap.data();
          const acessoAtual = dadosProf.acessoSeq ?? 0;
          const proximoAcesso = acessoAtual + 1;

          tx.update(professorRef, {
            ultimoAcesso: serverTimestamp(),
            acessoSeq: proximoAcesso
          });

          const acessoDocRef = doc(collection(professorRef, "acessos"), String(proximoAcesso));
          tx.set(acessoDocRef, {
            id: proximoAcesso,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent || null,
            email: email
          });
        });

        console.log("✅ Acesso registrado com sucesso!");
      } catch (e) {
        console.error("⚠️ Erro ao registrar acesso:", e);
        // não bloqueia o login, apenas loga o erro
      }

      // Limpa e salva localStorage
      localStorage.removeItem("userId");
      localStorage.removeItem("professorId");
      localStorage.removeItem("dev");

      localStorage.setItem("userType", "professor");
      localStorage.setItem("professorId", professor.id);

      setIsLoading(false);
      setSuccessMsg("Logado com sucesso!");

      setTimeout(() => {
        navigate("/HomeProfessor");
      }, 800);
    } catch (err) {
      setIsLoading(false);
      setMsg(true);
      setMsgTxt("Erro ao realizar login!");
      console.error(err);
    }
  };

  return (
                <div className={style['no-retropix']}>

    <div className="flex items-center justify-center min-h-screen p-6 bg-slate-100">
      <div className="w-full max-w-lg p-10 bg-white shadow-lg rounded-2xl">
        <h2 className="mb-8 text-2xl font-medium text-center md:text-3xl text-slate-900 text-[2rem]">
          Login Professor
        </h2>

        <label className="block mb-2 text-sm text-slate-700 text-[1.5rem]">Login</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-6 h-10 px-4 rounded-full bg-[#334a7a] text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
        />

        <label className="block mb-2 text-sm text-slate-700 text-[1.5rem]">Senha</label>
      <div className="relative mb-8">
          <input
            type={mostrarSenha ? "text" : "password"}
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full bg-[#b8c7d6] rounded-full h-10 px-4 pr-20 outline-none focus:ring-2 focus:ring-[#9fb0c2]"
          />
         
          <button
    type="button"
    onClick={() => setMostrarSenha(!mostrarSenha)}
    className="absolute text-lg -translate-y-1/2 right-3 top-1/2"
  >
    {mostrarSenha ? "👁️" : "🔒"}
  </button>
        </div>

        {msg && (
          <div className="mb-4 text-sm text-red-600 rounded-md">
            {msgText}
          </div>
        )}

        {isLoading && (
          <div className="mb-4 text-sm text-blue-600">Carregando...</div>
        )}

        {successMsg && (
          <div className="mb-4 text-sm text-green-600">{successMsg}</div>
        )}

        <div className="flex justify-center">
          <button
            onClick={login}
            disabled={isLoading}
            className={`px-8 py-2 rounded-full text-white font-medium shadow-md transition transform active:scale-95
              ${isLoading ? "bg-slate-400 cursor-not-allowed" : "bg-[#334a7a] hover:bg-[#273e66]"}`}
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export { LoginProf };