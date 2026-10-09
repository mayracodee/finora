import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import "./DashboardHeader.css";


function DashboardHeader() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function buscarUsuario() {
      const { data } = await supabase.auth.getUser();
      setUserName(data.user.user_metadata.name);
    }

    buscarUsuario();
  }, []);

  return (
    <section className="dashboard-header">
      <h1 className="dashboard-header__title">Olá, {userName}! Aqui está o resumo das suas finanças.</h1>
    </section>
  );
}

export default DashboardHeader;
