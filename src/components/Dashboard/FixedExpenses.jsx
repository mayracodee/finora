import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import "./FixedExpenses.css";

function FixedExpenses({ cardAdded, onFixedExpenseChanged }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [category, setCategory] = useState("");
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [cards, setCards] = useState([]);
  const [cardId, setCardId] = useState("");

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

  useEffect(() => {
    fetchCards();
  }, [cardAdded]);

  function handleEdit(expense) {
    console.log("Despesa para editar:", expense);
    setEditingExpense(expense);
    setName(expense.name);
    setAmount(expense.amount);
    setDueDay(expense.due_day);
    setCategory(expense.category);
    setCardId(expense.card_id);
  }

  async function handleDelete(expense) {
    const expenseId = expense.id;

    const { error: deleteError } = await supabase
      .from("fixed_expenses")
      .delete()
      .eq("id", expenseId);

    if (deleteError) {
      return;
    }

    setFixedExpenses((previousExpenses) =>
      previousExpenses.filter((expense) => expense.id !== expenseId),
    );

    onFixedExpenseChanged();
  }

  async function fetchFixedExpenses() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return;
    }

    const userId = data.user.id;

    const { data: fixedExpensesData, error: fixedExpensesError } =
      await supabase.from("fixed_expenses").select("*").eq("user_id", userId);

    if (fixedExpensesError) {
      return;
    }

    setFixedExpenses(fixedExpensesData);
  }

  useEffect(() => {
    fetchFixedExpenses();
  }, []);

  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const categoryLabels = {
    moradia: "Moradia",
    alimentacao: "Alimentação",
    transporte: "Transporte",
    assinaturas: "Assinaturas",
    educacao: "Educação",
    outros: "Outros",
  };

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (amount === "" || Number(amount) <= 0) {
      return;
    }

    if (dueDay === "" || Number(dueDay) < 1 || Number(dueDay) > 31) {
      return;
    }

    if (!category) {
      return;
    }

    if (!cardId) {
      return;
    }

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return;
    }

    const userId = data.user.id;

    const fixedExpense = {
      user_id: userId,
      name: name.trim().charAt(0).toUpperCase() + name.trim().slice(1),
      amount: Number(amount),
      due_day: Number(dueDay),
      category,
      card_id: cardId,
    };

    if (editingExpense) {
      const { error: updateError } = await supabase
        .from("fixed_expenses")
        .update(fixedExpense)
        .eq("id", editingExpense.id);

      if (updateError) {
        return;
      }

      setFixedExpenses((previousExpenses) =>
        previousExpenses.map((expense) =>
          expense.id === editingExpense.id
            ? { ...expense, ...fixedExpense }
            : expense,
        ),
      );

      onFixedExpenseChanged();

      setEditingExpense(null);
      setName("");
      setAmount("");
      setDueDay("");
      setCategory("");
      setCardId("");
      setSuccessMessage("Despesa fixa atualizada com sucesso!");
    } else {
      const { data: insertedExpense, error: insertError } = await supabase
        .from("fixed_expenses")
        .insert(fixedExpense)
        .select()
        .single();

      if (insertError) {
        return;
      }

      setFixedExpenses((previousExpenses) => [
        ...previousExpenses,
        insertedExpense,
      ]);

      onFixedExpenseChanged();

      setSuccessMessage("Despesa fixa adicionada com sucesso!");

      setName("");
      setAmount("");
      setDueDay("");
      setCategory("");
      setCardId("");
    }
  }

  return (
    <section className="fixed-expenses">
      <div className="fixed-expenses__panel">
        <h2 className="fixed-expenses__title">Despesas fixas</h2>

        <form className="fixed-expenses__form" onSubmit={handleSubmit}>
          <div className="fixed-expenses__field">
            <label htmlFor="name">Nome da despesa</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="fixed-expenses__field">
            <label htmlFor="amount">Valor</label>

            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <div className="fixed-expenses__field">
            <label htmlFor="dueDay">Dia de vencimento</label>

            <input
              id="dueDay"
              type="number"
              value={dueDay}
              onChange={(event) => setDueDay(event.target.value)}
            />
          </div>

          <div className="fixed-expenses__field">
            <label htmlFor="category">Categoria</label>

            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Selecione uma categoria</option>
              <option value="moradia">Moradia</option>
              <option value="alimentacao">Alimentação</option>
              <option value="transporte">Transporte</option>
              <option value="assinaturas">Assinaturas</option>
              <option value="educacao">Educação</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <div className="fixed-expenses__field">
            <label htmlFor="card">Cartão</label>
            <select
              id="card"
              value={cardId}
              onChange={(event) => setCardId(event.target.value)}
            >
              <option value="">Selecione um cartão</option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit">
            {" "}
            {editingExpense ? "Salvar alterações" : "Adicionar despesa"}{" "}
          </button>
        </form>
      </div>

      {successMessage && <p>{successMessage}</p>}

      <div className="fixed-expenses__list">
        <h3 className="fixed-expenses__list-title">Despesas cadastradas</h3>
        {fixedExpenses.map((expense) => (
          <div key={expense.id} className="fixed-expenses__item">
            <p>{expense.name}</p>
            <p>{currencyFormatter.format(expense.amount)}</p>
            <p>Vencimento: dia {expense.due_day}</p>
            <p>Categoria: {categoryLabels[expense.category]}</p>
            <p>
              Cartão: {cards.find((card) => card.id === expense.card_id)?.name}
            </p>
            <div className="fixed-expenses__actions">
              <button type="button" onClick={() => handleEdit(expense)}>
                Editar
              </button>

              <button type="button" onClick={() => handleDelete(expense)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FixedExpenses;
