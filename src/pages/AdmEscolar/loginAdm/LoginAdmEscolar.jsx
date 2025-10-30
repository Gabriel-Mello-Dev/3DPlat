import { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from './loginAdmEscolar.module.css';
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { app } from "../../../firebase/firebaseConfig";
import bcrypt from "bcryptjs";

const LoginAdmEscolar = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [msg, setMsg] = useState(false);
  const [msgText, setMsgTxt] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const db = getFirestore(app);

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
      const adminsRef = collection(db, "AdminsEscolares");
      const q = query(adminsRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setIsLoading(false);
        setMsg(true);
        setMsgTxt("Email ou senha incorretos!");
        return;
      }

      const adminDoc = querySnapshot.docs[0];
      const admin = { id: adminDoc.id, ...adminDoc.data() };

      const senhaValida = await bcrypt.compare(senha, admin.senha);
      if (!senhaValida) {
        setIsLoading(false);
        setMsg(true);
        setMsgTxt("Email ou senha incorretos!");
        return;
      }

      if (admin.ativo === false) {
        setIsLoading(false);
        setMsg(true);
        setMsgTxt(
          <>
            Conta desativada, entre em contato com o suporte!{" "}
            <a href="mailto:gabrielMello8986@gmail.com" className="text-blue-600 underline">
              gabrielMello8986@gmail.com
            </a>
          </>
        );
        return;
      }

      localStorage.removeItem("userId");
      localStorage.removeItem("professorId");
      localStorage.removeItem("dev");

      localStorage.setItem("userType", "admEscolar");
      localStorage.setItem("admEscolarId", admin.id);

      setIsLoading(false);
      setSuccessMsg("Logado com sucesso!");

      setTimeout(() => {
        navigate("/PerfilAdm");
      }, 1500);

    } catch (err) {
      setIsLoading(false);
      setMsg(true);
      setMsgTxt("Erro ao realizar login!");
      console.error(err);
    }
  };

  return (
  <div className={style['no-retropix']}>
    <div
      className="min-h-screen flex items-center justify-center bg-[#2f3b56] font-serif"
      style={{ fontFamily: "sans-serif !important" }}
    >
      <div className="bg-white/90 w-[30rem] max-w-[92%] rounded-[1.25rem] p-10 shadow-md">
        <h2 className="mb-8 font-serif text-3xl font-light text-center text-black md:text-4xl">
          Login Admin Escolar
        </h2>

        <label className="block mb-2 text-sm" style={{ fontFamily: "sans-serif", color: "black"}}>
          Login
        </label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#b8c7d6] rounded-full h-10 px-4 outline-none focus:ring-2 focus:ring-[#9fb0c2] mb-6"
        />

        <label className="block mb-2 text-sm" style={{ fontFamily: "sans-serif", color: "black"}}>
          Senha
        </label>
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
          <div className="mt-1 text-sm text-red-600 rounded-full">{msgText}</div>
        )}

        {isLoading && <div className="mt-2 text-sm text-blue-600">Carregando...</div>}

        {successMsg && (
          <div className="mt-2 text-sm text-green-600 rounded-full">
            {successMsg}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            className={`rounded-full px-8 py-3 bg-[#9fb0c2] text-white transition-colors
              ${isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-[#8ca3b6]"}`}
            onClick={login}
            disabled={isLoading}
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};

export { LoginAdmEscolar };