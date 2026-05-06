import { useState } from "react";
import "./Topbar.css";
import { useAuth } from "../../contexts/AuthContext";

export default function Topbar({ titulo = "Dashboard" }) {
  const [busca, setBusca] = useState("");
  const { user, logout } = useAuth();
  const pedidosPendentes = 3;

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>{titulo}</h1>
        <p>Painel administrativo LASDelivery</p>
      </div>

      <div className="topbar-actions">
        <div className="topbar-search">
          <span>🔎</span>

          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar pedidos, clientes..."
          />
        </div>

        <button className="topbar-bell">
          🔔
          {pedidosPendentes > 0 && <span className="pulse-dot"></span>}
        </button>

        <div className="topbar-user">
          <span style={{ fontSize: "24px" }}>
            {user?.usu_nomusu?.charAt(0)?.toUpperCase() || "A"}
          </span>

          <div className="topbar-user-info">
            <strong>
              <p>{user?.usu_nomusu || "Administrador"}</p>
            </strong>
            <span>
              <p>{user ? "Online" : "Offline"}</p>
            </span>
          </div>
          <button onClick={logout} className="topbar-logout">
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
