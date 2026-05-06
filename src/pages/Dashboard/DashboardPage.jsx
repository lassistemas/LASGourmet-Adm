import { useEffect, useState } from "react";
import LayoutBase from "../../components/layout/LayoutBase";
import api from "../../services/api";
import "./DashboardPage.css";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const response = await api.get("/pedido/delivery/dashboard");
        setDashboard(response.data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, []);

  if (loading) {
    return (
      <LayoutBase titulo="Dashboard">
        <div>Carregando dashboard...</div>
      </LayoutBase>
    );
  }

  if (!dashboard) {
    return (
      <LayoutBase titulo="Dashboard">
        <div>Não foi possível carregar os dados.</div>
      </LayoutBase>
    );
  }

  const cards = [
    {
      titulo: "Pedidos Abertos",
      valor: dashboard.pedidos_abertos || 0,
      icon: "📋",
    },
    {
      titulo: "Em Produção",
      valor: dashboard.em_producao || 0,
      icon: "⏱️",
    },
    {
      titulo: "Saiu p/ Entrega",
      valor: dashboard.saiu_entrega || 0,
      icon: "🚚",
    },
    {
      titulo: "Faturamento Hoje",
      valor: dashboard.faturamento_hoje || "R$ 0,00",
      icon: "💰",
    },
  ];

  return (
    <LayoutBase titulo="Dashboard">
      <section className="dashboard-grid">
        {cards.map((card) => (
          <div key={card.titulo} className="dashboard-card">
            <div className="dashboard-card-header">
              <div>
                <p className="dashboard-card-title">{card.titulo}</p>
                <h2 className="dashboard-card-value">{card.valor}</h2>
              </div>

              <span className="dashboard-icon">{card.icon}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="dashboard-section">
        <h2>Resumo do Dia</h2>

        <p>✅ Pedidos finalizados: {dashboard.finalizados || 0}</p>
        <p>❌ Cancelados: {dashboard.cancelados || 0}</p>
        <p>🍕 Produto mais vendido: {dashboard.produto_top || "N/D"}</p>
        <p>💳 Forma mais usada: {dashboard.pagamento_top || "N/D"}</p>
      </section>
    </LayoutBase>
  );
}
