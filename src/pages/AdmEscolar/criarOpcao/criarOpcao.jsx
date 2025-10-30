import { useState } from "react";
import { CriarProfessor } from "../criarProf";
import { CriarAluno } from "../../CriarConta";
import { AdicionarTurma } from "../adicionarTurma"; // importa o componente de turma

// Tailwind classnames usados no componente
const buttonsTipoClass =
  "inline-flex gap-3 bg-transparent p-1 items-center";

const activeClass =
  "px-5 py-2 rounded-full text-sm font-semibold select-none transition-colors bg-[#91b2ea] text-slate-900 shadow-inner ring-1 ring-blue-300 ";

const inactiveClass =
  "px-5 py-2 rounded-full text-sm font-semibold select-none transition-colors bg-[#d2dcef] text-slate-700 ring-1 ring-gray-200 hover:bg-gray-200";

const formContainerClass = "mt-6";

const CriarOpcao = () => {
  const [tipo, setTipo] = useState("professor"); // default: professor

  return (
    <div className="p-6 rounded-md bg-white/100">
      <h1 className="font-black text-[1.4rem]" style={{ color: "#314c89" }}>
        Cadastrar Usuário
      </h1>

      <div className="space-x-4 text-center">
        <button
          type="button"
          aria-pressed={tipo === "professor"}
          onClick={() => setTipo("professor")}
          className={tipo === "professor" ? activeClass : inactiveClass}
          style={{color: "black", fontWeight: 600}}
        >
          Professor
        </button>

        <button
          type="button"
          aria-pressed={tipo === "aluno"}
          onClick={() => setTipo("aluno")}
          className={tipo === "aluno" ? activeClass : inactiveClass}
                    style={{color: "black", fontWeight: 600}}

        >
          Aluno
        </button>

        <button
          type="button"
          aria-pressed={tipo === "turma"}
          onClick={() => setTipo("turma")}
          className={tipo === "turma" ? activeClass : inactiveClass}
                    style={{color: "black", fontWeight: 600}}

        >
          Turma
        </button>
      </div>

      <div className={formContainerClass}>
        {tipo === "professor" && <CriarProfessor />}
        {tipo === "aluno" && <CriarAluno />}
        {tipo === "turma" && <AdicionarTurma />}
      </div>
    </div>
  );
};

export { CriarOpcao };