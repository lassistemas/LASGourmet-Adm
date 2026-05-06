import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Sidebar.css";

export default function Sidebar({ sidebarCollapsed, setSidebarCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: "📊" },
    { label: "Pedidos", path: "/pedidos", icon: "📋" },
    { label: "Cardápios", path: "/cardapio", icon: "🍕" },
    { label: "Categorias", path: "/categorias", icon: "🍕" },
    { label: "Cupons", path: "/cupons", icon: "🎟️" },
    { label: "Pagamentos", path: "/pagamentos", icon: "💳" },
    { label: "Relatórios", path: "/relatorios", icon: "📈" },
    { label: "Configurações", path: "/configuracoes", icon: "⚙️" },
  ];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        {sidebarCollapsed ? "→" : "←"}
      </button>
      <div className="sidebar-header">
        <h1 className="sidebar-logo">LASDelivery</h1>
        <p className="sidebar-subtitle">Retaguarda Pro</p>

        <div className="sidebar-store">
          <div className="sidebar-store-icon">🏪</div>
          <div className="sidebar-store-name">LE VALLI PIZZARIA</div>
          <div>Loja fechada</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-button ${active ? "active" : ""}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout">
          Sair
        </button>
      </div>
    </aside>
  );
}
