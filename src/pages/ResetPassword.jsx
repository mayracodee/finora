import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import supabase from "../lib/supabaseClient";
import "./ResetPassword.css";
import logo from "../assets/logo/finora-logo.png";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirm, setShowNewPasswordConfirm] = useState(false);

  async function handleResetPassword(event) {
    event.preventDefault();

    if (newPassword === "") {
      setError("Digite a nova senha");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setError("As senhas não coincidem");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setError("");
    navigate("/login", {
      state: {
        successMessage: "Senha redefinida com sucesso!",
      },
    });
  }

  return (
    <section className="reset-password">
      <img src={logo} alt="Finora" />

      <p className="reset-password-description">
        Crie uma nova senha e volte a ter acesso ao seu controle financeiro.
      </p>

      <h1>Redefinir senha</h1>

      <form onSubmit={handleResetPassword}>
        <label htmlFor="new-password">Nova Senha</label>
        <div>
          <input
            type={showNewPassword ? "text" : "password"}
            id="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? <Eye /> : <EyeOff />}
          </button>
        </div>

        <label htmlFor="confirm-password">Confirmar nova senha</label>
        <div>
          <input
            type={showNewPasswordConfirm ? "text" : "password"}
            id="confirm-password"
            value={newPasswordConfirm}
            onChange={(event) => setNewPasswordConfirm(event.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowNewPasswordConfirm(!showNewPasswordConfirm)}
          >
            {showNewPasswordConfirm ? <Eye /> : <EyeOff />}
          </button>
        </div>

        {error === "Digite a nova senha" && (
          <p className="form-error">{error}</p>
        )}

        {error === "As senhas não coincidem" && (
          <p className="form-error">{error}</p>
        )}

        {error &&
          error !== "Digite a nova senha" &&
          error !== "As senhas não coincidem" && (
            <p className="form-error">{error}</p>
          )}

        <button type="submit">Redefinir senha</button>
      </form>
    </section>
  );
}

export default ResetPassword;
