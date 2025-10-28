import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
const Navigate= useNavigate();
  const handleLogin = () => {
    if (user === "a" && pass === "123") {
      alert("✅ Login bem-sucedido!");
      Navigate("/Scene")
    } else {
      alert("❌ Usuário ou senha incorretos.");
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 20,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#ffffffaa",
        padding: "20px",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        minWidth: "250px",
      }}
    >
      <input
        type="text"
        placeholder="Usuário"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
      />
      <input
        type="password"
        placeholder="Senha"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
      />
      <button
        onClick={handleLogin}
        style={{
          padding: "10px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Login
      </button>
    </div>
  );
}

export { Home };
