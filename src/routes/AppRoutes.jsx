import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import PedidosPage from "../pages/Pedidos/PedidosPage";
import CategoriasPage from "../pages/Categorias/CategoriasPage";
import CardapioPage from "../pages/Cardapio/CardapioPage";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pedidos"
        element={
          <ProtectedRoute>
            <PedidosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/categorias"
        element={
          <ProtectedRoute>
            <CategoriasPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cardapio"
        element={
          <ProtectedRoute>
            <CardapioPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
