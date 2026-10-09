import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import supabase from "../lib/supabaseClient";
import "./Login.css";
import logo from "../assets/logo/finora-logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.successMessage;

  async function handleLogin(event) {
    event.preventDefault();

    if (email.trim() === "") {
      setError("Digite seu e-mail");
      return;
    }

    if (password.trim() === "") {
      setError("Digite sua senha");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/dashboard");
  }

  async function handleForgotPassword(event) {
    setError("");
    setRecoveryMessage("");

    event.preventDefault();

    if (email.trim() === "") {
      setError("Digite seu e-mail");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password",
    });

    if (error) {
      setError(error.message);
      return;
    }

    setRecoveryMessage("Enviamos um link de recuperação para o seu e-mail.");
    setEmail("");
  }

  return (
    <section className="login">
      <img src={logo} alt="Finora" />
      <p className="login-description">
        Organize suas finanças. Entenda seus gastos. Tenha o controle.
      </p>
      <h1 className="login-title">
        {forgotPassword ? "Recuperar senha" : "Entrar"}
      </h1>

      {forgotPassword ? (
        <form className="login-form" onSubmit={handleForgotPassword}>
          <label htmlFor="email">E-mail</label>

          <input
            type="email"
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          {error && <p className="form-error">{error}</p>}
          {recoveryMessage && <p className="form-success">{recoveryMessage}</p>}

          <button className="recovery-button" type="submit">
            Enviar link de recuperação
          </button>
          <button
            className="back-to-login-button"
            type="button"
            onClick={() => {
              setForgotPassword(false);
              setError("");
              setRecoveryMessage("");
              setEmail("");
              setPassword("");
            }}
          >
            Voltar para o login
          </button>
        </form>
      ) : (
        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          {error === "Digite seu e-mail" && (
            <p className="form-error">{error}</p>
          )}

          <label htmlFor="password">Senha</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          </div>

          {error === "Digite sua senha" && (
            <p className="form-error">{error}</p>
          )}

          <button className="login-button" type="submit">
            Entrar
          </button>

          {error &&
            error !== "Digite seu e-mail" &&
            error !== "Digite sua senha" && (
              <p className="form-error">{error}</p>
            )}

          {successMessage && <p className="form-success">{successMessage}</p>}

          <button
            className="forgot-password-button"
            type="button"
            onClick={() => {
              setForgotPassword(true);
              setError("");
              setRecoveryMessage("");
              setEmail("");
              setPassword("");
            }}
          >
            Esqueci minha senha
          </button>

          <button
            className="register-button"
            type="button"
            onClick={() => navigate("/register")}
          >
            Criar minha conta
          </button>
        </form>
      )}
    </section>
  );
}

export default Login;
