import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import supabase from "../lib/supabaseClient";
import "./Register.css";
import logo from "../assets/logo/finora-logo.png";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  async function handleRegister(event) {
    event.preventDefault();
    setSuccess("");

    if (name.trim() === "") {
      setError("Digite seu nome");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user.identities.length === 0) {
      setError("Não foi possível criar a conta com este e-mail.");
      return;
    }

    setSuccess("Conta criada! Verifique seu e-mail para confirmar sua conta.");

    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <section className="register">
      <img src={logo} alt="Finora" />

      <p className="register-description">
        Comece agora a organizar sua vida financeira.
      </p>

      <h1 className="register-title">Criar sua conta</h1>

      <form className="register-form" onSubmit={handleRegister}>
        <label htmlFor="name">Como você quer ser chamado?</label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
        />

        {error === "Digite seu nome" && <p className="form-error">{error}</p>}

        <label htmlFor="email">E-mail</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="password">Senha</label>
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            required
          />

          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <Eye /> : <EyeOff />}
          </button>
        </div>

        {error === "A senha deve ter pelo menos 8 caracteres" && (
          <p className="form-error">{error}</p>
        )}

        <label htmlFor="confirmPassword">Confirmar senha</label>
        <div className="password-field">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setError("");
            }}
            required
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {error === "As senhas não coincidem" && (
          <p className="form-error">{error}</p>
        )}

        <button type="submit">Criar conta</button>

        {success && <p className="form-success">{success}</p>}

        {error &&
          error !== "Digite seu nome" &&
          error !== "A senha deve ter pelo menos 8 caracteres" &&
          error !== "As senhas não coincidem" && (
            <p className="form-error">{error}</p>
          )}
      </form>

      <p>
        Já tenho uma conta →{" "}
        <button type="button" onClick={() => navigate("/login")}>
          Entrar
        </button>
      </p>
    </section>
  );
}

export default Register;
