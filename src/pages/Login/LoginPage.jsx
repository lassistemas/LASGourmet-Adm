import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/LASGourmet-logo-500-500.png"; // ajuste para o caminho real da sua logo
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    codigo: "",
    senha: "",
  });

  const [erro, setErro] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleLogin(e) {
    e.preventDefault();

    setErro("");

    const sucesso = await login(form.codigo, form.senha);

    if (sucesso) {
      navigate("/dashboard");
    } else {
      setErro("Usuário ou senha inválidos.");
    }
  }

  return (
    <div className="login-page">
      {/* LADO ESQUERDO
      <div className="login-brand">
        <img src={logo} alt="LAS Delivery" />

        <h1>
          LAS<span>Delivery</span>
        </h1>

        <p>Sistema de Delivery</p>
      </div> */}
      <div className="login-box">
        <div className="login-card">
          <div className="login-brand">
            <img src={logo} alt="LAS Delivery" />
            <h1>
              LAS<span>Delivery</span>
            </h1>
            <p>Administrativo</p>
          </div>
          {/*<img src={logo} alt="LAS Delivery" className="login-logo" />*/}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Usuário</label>
              <input
                type="text"
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                placeholder="Seu usuário"
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                name="senha"
                value={form.senha}
                onChange={handleChange}
                placeholder="Sua senha"
              />
            </div>

            {erro && <div className="login-error">{erro}</div>}

            <button type="submit" className="login-button">
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
