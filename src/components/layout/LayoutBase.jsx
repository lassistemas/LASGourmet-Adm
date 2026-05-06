import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./LayoutBase.css";
import { useAuth } from "../../contexts/AuthContext";

export default function LayoutBase({ titulo, children }) {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div
      className={`layout-base ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <div className="layout-main">
        <Topbar titulo={titulo} />

        <div className="layout-content">{children}</div>
      </div>
    </div>
  );
}
