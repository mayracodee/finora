import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import "./SpendingControl.css";

function SpendingControl({ cardAdded, fixedExpenseChanged }) {
  const [currentDate] = useState(new Date());
  const [spendingLimits, setSpendingLimits] = useState([]);
  const [cards, setCards] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [limitAmount, setLimitAmount] = useState("");
  const [selectedCardId, setSelectedCardId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingLimitId, setEditingLimitId] = useState(null);

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const currentMonthStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;

  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  async function findExistingLimit() {
    if (!selectedCardId) {
      setEditingLimitId(null);
      setLimitAmount("");
      return;
    }

    const { data: existingLimit, error: limitError } = await supabase
      .from("spending_limits")
      .select("*")
      .eq("card_id", selectedCardId)
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .maybeSingle();

    if (limitError) {
      return;
    }

    if (existingLimit) {
      setEditingLimitId(existingLimit.id);
      setLimitAmount(existingLimit.limit_amount);
    }

    if (!existingLimit) {
      setEditingLimitId(null);
      setLimitAmount("");
    }
  }

  async function fetchSpendingLimits() {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      return;
    }

    const userId = userData.user.id;

    const { data: limitsData, error: limitsError } = await supabase
      .from("spending_limits")
      .select("*")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .eq("year", currentYear);

    if (limitsError) {
      return;
    }

    setSpendingLimits(limitsData);
  }

  async function handleSaveLimit() {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      return;
    }

    const userId = userData.user.id;

    if (!selectedCardId) {
      return;
    }

    if (!limitAmount || Number(limitAmount) <= 0) {
      return;
    }

    const newLimit = {
      user_id: userId,
      card_id: selectedCardId,
      month: currentMonth,
      year: currentYear,
      limit_amount: Number(limitAmount),
    };

    if (editingLimitId) {
      const { data: updatedLimit, error: updateError } = await supabase
        .from("spending_limits")
        .update({
          limit_amount: Number(limitAmount),
        })
        .eq("id", editingLimitId)
        .select()
        .single();

      if (updateError) {
        return;
      }

      setSpendingLimits((previousLimits) =>
        previousLimits.map((limit) =>
          limit.id === updatedLimit.id ? updatedLimit : limit,
        ),
      );

      setSuccessMessage("Limite mensal atualizado com sucesso!");
      setEditingLimitId(null);
      setLimitAmount("");
      setSelectedCardId("");
      return;
    } else {
      const { data: insertedLimit, error: insertError } = await supabase
        .from("spending_limits")
        .insert(newLimit)
        .select()
        .single();

      if (insertError) {
        setSuccessMessage(
          "Esse cartão já possui um limite definido para este mês.",
        );
        return;
      }

      setSpendingLimits((previousLimits) => [...previousLimits, insertedLimit]);

      setLimitAmount("");
      setSelectedCardId("");
      setSuccessMessage("Limite mensal definido com sucesso!");
    }
  }

  useEffect(() => {
    fetchSpendingLimits();
    fetchCards();
    fetchInstallments();
    fetchFixedExpenses();
  }, [cardAdded, fixedExpenseChanged]);

  async function fetchFixedExpenses() {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      return;
    }

    const userId = userData.user.id;

    const { data: fixedExpensesData, error: fixedExpensesError } =
      await supabase.from("fixed_expenses").select("*").eq("user_id", userId);

    if (fixedExpensesError) {
      return;
    }

    setFixedExpenses(fixedExpensesData);
  }

  useEffect(() => {
    findExistingLimit();
  }, [selectedCardId]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  async function fetchCards() {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      return;
    }

    const userId = userData.user.id;

    const { data: cardsData, error: cardsError } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", userId);

    if (cardsError) {
      return;
    }

    setCards(cardsData);
  }

  function getCardName(cardId) {
    const card = cards.find((cardItem) => cardItem.id === cardId);

    return card ? card.name : "Cartão";
  }

  async function fetchInstallments() {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      return;
    }

    const userId = userData.user.id;

    const firstDay = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;

    const lastDay = new Date(currentYear, currentMonth, 0).getDate();

    const lastDayDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const { data: installmentsData, error: installmentsError } = await supabase
      .from("purchase_installments")
      .select(
        `
      amount,
      invoice_due_date,
      purchases!inner(
      card_id,
      user_id
     )
    `,
      )
      .eq("purchases.user_id", userId)
      .gte("invoice_due_date", firstDay)
      .lte("invoice_due_date", lastDayDate);

    if (installmentsError) {
      return;
    }

    setInstallments(installmentsData);
  }

  function getCardSpent(cardId) {
    return installments
      .filter((installment) => installment.purchases.card_id === cardId)
      .reduce((total, installment) => total + Number(installment.amount), 0);
  }

  function getCardFixedExpenses(cardId) {
    return fixedExpenses
      .filter(
        (expense) =>
          expense.card_id === cardId && expense.start_date <= currentMonthStart,
      )
      .reduce((total, expense) => total + Number(expense.amount), 0);
  }

  function getCardTotalSpent(cardId) {
    return getCardSpent(cardId) + getCardFixedExpenses(cardId);
  }

  function getCardRemaining(limitAmount, cardId) {
    const spent = getCardTotalSpent(cardId);

    return Number(limitAmount) - spent;
  }

  function getAmountExceeded(limitAmount, cardId) {
    const spent = getCardTotalSpent(cardId);

    return spent - Number(limitAmount);
  }

  function isLimitExceeded(limitAmount, cardId) {
    const spent = getCardTotalSpent(cardId);

    return spent > Number(limitAmount);
  }

  function isLimitReached(limitAmount, cardId) {
    const spent = getCardTotalSpent(cardId);

    return spent === Number(limitAmount);
  }

  return (
    <section className="spending-control">
      <div className="spending-control__panel">
        <h2 className="spending-control__title">Controle de gastos</h2>
        <div className="spending-control__form">
          <div className="spending-control__field">
            <label htmlFor="spending-card">Cartão</label>

            <select
              id="spending-card"
              value={selectedCardId}
              onChange={(event) => setSelectedCardId(event.target.value)}
            >
              <option value="">Selecione um cartão</option>

              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
          </div>

          <div className="spending-control__field">
            <label htmlFor="spending-limit">Limite mensal</label>

            <input
              id="spending-limit"
              type="number"
              value={limitAmount}
              onChange={(event) => setLimitAmount(event.target.value)}
              placeholder="Digite o limite mensal"
            />
          </div>
        </div>

        <button
          className="spending-control__submit"
          type="button"
          onClick={handleSaveLimit}
        >
          {editingLimitId ? "Atualizar limite" : "Definir limite"}
        </button>
      </div>

      {successMessage && <p>{successMessage}</p>}

      <div className="spending-control__summaries">
        {spendingLimits
          .filter((limit) => limit.card_id === selectedCardId)
          .map((limit) => (
            <div key={limit.id} className="spending-control__summary">
              <h3>{getCardName(limit.card_id)}</h3>
              <p>
                Limite mensal: {currencyFormatter.format(limit.limit_amount)}
              </p>
              <p>
                Compras: {currencyFormatter.format(getCardSpent(limit.card_id))}
              </p>
              <p>
                Gasto fixo:{" "}
                {currencyFormatter.format(getCardFixedExpenses(limit.card_id))}
              </p>
              <p>
                Gasto:{" "}
                {currencyFormatter.format(getCardTotalSpent(limit.card_id))}
              </p>
              {isLimitExceeded(limit.limit_amount, limit.card_id) ? (
                <p>
                  Ultrapassado:{" "}
                  {currencyFormatter.format(
                    getAmountExceeded(limit.limit_amount, limit.card_id),
                  )}
                </p>
              ) : (
                <p>
                  Restante:{" "}
                  {currencyFormatter.format(
                    getCardRemaining(limit.limit_amount, limit.card_id),
                  )}
                </p>
              )}
              {isLimitExceeded(limit.limit_amount, limit.card_id) && (
                <p>Limite ultrapassado.</p>
              )}
              {isLimitReached(limit.limit_amount, limit.card_id) && (
                <p>Limite atingido.</p>
              )}
            </div>
          ))}
      </div>
    </section>
  );
}

export default SpendingControl;
