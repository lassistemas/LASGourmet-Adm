import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 CONTROLE DE CARREGAMENTO

  // 🔥 Carrega usuário do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("las_user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);

        if (parsedUser.token) {
          api.defaults.headers.common["Authorization"] =
            `Bearer ${parsedUser.token}`;
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        localStorage.removeItem("las_user");
      }
    }

    setLoading(false); // 👈 ESSENCIAL
  }, []);

  // 🔐 LOGIN
  async function login(codigo, senha) {
    try {
      const response = await api.post("/usuario/login", {
        codigo,
        senha,
      });

      const loggedUser = response.data;

      localStorage.setItem("las_user", JSON.stringify(loggedUser));

      if (loggedUser.token) {
        api.defaults.headers.common["Authorization"] =
          `Bearer ${loggedUser.token}`;
      }

      setUser(loggedUser);

      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  }

  // 🚪 LOGOUT
  function logout() {
    localStorage.removeItem("las_user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading, // 👈 AGORA DISPONÍVEL
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 🔁 Hook padrão
export function useAuth() {
  return useContext(AuthContext);
}
