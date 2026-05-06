import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("las_user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);

      if (parsedUser.token) {
        api.defaults.headers.common["Authorization"] =
          `Bearer ${parsedUser.token}`;
      }
    }
  }, []);

  async function login(codigo, senha) {
    try {
      // Delphi endpoint esperado:
      // POST /auth/login
      const response = await api.post("/usuario/login", {
        codigo,
        senha,
      });

      const loggedUser = response.data;

      localStorage.setItem("las_user", JSON.stringify(loggedUser));

      api.defaults.headers.common["Authorization"] =
        `Bearer ${loggedUser.token}`;

      setUser(loggedUser);

      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  }

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
