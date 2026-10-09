import { useState } from "react";
import supabase from "../lib/supabaseClient";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import AddPurchase from "../components/Dashboard/AddPurchase";
import Cards from "../components/Dashboard/Cards";
import FixedExpenses from "../components/Dashboard/FixedExpenses";
import FinancialSummary from "../components/Dashboard/FinancialSummary";
import SpendingControl from "../components/Dashboard/SpendingControl";
import SpendingByCategory from "../components/Dashboard/SpendingByCategory";
import "./Dashboard.css";

function Dashboard() {

  const [purchaseAdded, setPurchaseAdded] = useState(0);
  const [cardAdded, setCardAdded] = useState(0);
  const [fixedExpenseChanged, setFixedExpenseChanged] = useState(0);

  function handlePurchaseAdded() {
    setPurchaseAdded((previousValue) => previousValue + 1);
  }

  function handleCardAdded() {
    setCardAdded((previousValue) => previousValue + 1);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <section className="dashboard">
      <DashboardHeader />
      <AddPurchase onPurchaseAdded={handlePurchaseAdded}  cardAdded={cardAdded} />
      <FinancialSummary purchaseAdded={purchaseAdded} />
      <Cards onCardAdded={handleCardAdded} />
      <FixedExpenses cardAdded={cardAdded}  onFixedExpenseChanged={() =>
        setFixedExpenseChanged((previousValue) => previousValue + 1)} />
      <SpendingControl cardAdded={cardAdded} fixedExpenseChanged={fixedExpenseChanged} />
      <SpendingByCategory />
      <button className="dashboard__logout" type="button" onClick={handleLogout}>Sair</button>
    </section>
  );
}

export { Dashboard as default };
