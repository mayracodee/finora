import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import "./FinancialSummary.css";


function FinancialSummary({ purchaseAdded }) {
  const [currentMonthTotal, setCurrentMonthTotal] = useState(0);
  const [nextMonthTotal, setNextMonthTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  async function fetchInstallments() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error(error);
      setErrorMessage("Não foi possível carregar seu resumo financeiro.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    const userId = data.user.id;

    const { data: installmentsData, error: installmentsError } = await supabase
      .from("purchase_installments")
      .select(`
            amount,
            invoice_due_date,
            purchases!inner(user_id)
        `)
      .eq("purchases.user_id", userId);

    if (installmentsError) {
      console.error(installmentsError);
      setErrorMessage("Não foi possível carregar seu resumo financeiro.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);

    const nextMonth = nextMonthDate.getMonth();
    const nextYear = nextMonthDate.getFullYear();

    let currentTotal = 0;
    let nextTotal = 0;

    for (const installment of installmentsData) {
      const dueDate = new Date(`${installment.invoice_due_date}T00:00:00`);
      const dueMonth = dueDate.getMonth();
      const dueYear = dueDate.getFullYear();

      if (dueMonth === currentMonth && dueYear === currentYear) {
        currentTotal += Number(installment.amount);
      }

      if (dueMonth === nextMonth && dueYear === nextYear) {
        nextTotal += Number(installment.amount);
      }
    }

    setCurrentMonthTotal(currentTotal);
    setNextMonthTotal(nextTotal);
  }

  useEffect(() => {
    fetchInstallments();
  }, [purchaseAdded]);

  return (
    <section className="financial-summary">
      {errorMessage && <p>{errorMessage}</p>}

      <div className="financial-summary__card">
        <h2>Gasto este mês</h2>
        <p>{currencyFormatter.format(currentMonthTotal)}</p>
      </div>

      <div className="financial-summary__card">
        <h2>Gasto próximo mês</h2>
        <p>{currencyFormatter.format(nextMonthTotal)}</p>
      </div>
    </section>
  );
}

export default FinancialSummary;
