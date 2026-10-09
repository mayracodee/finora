import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import "./Cards.css";

function Cards({ onCardAdded }) {
  const [name, setName] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [cards, setCards] = useState([]);
  const [editingCard, setEditingCard] = useState(null);

  async function fetchCards() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error(error);

      setErrors({
        general: "Não foi possível carregar seus cartões.",
      });

      return;
    }

    const userId = data.user.id;

    const { data: cardsData, error: cardsError } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", userId);

    if (cardsError) {
      console.error(cardsError);

      setErrors({
        general: "Não foi possível carregar seus cartões.",
      });

      return;
    }
    setCards(cardsData);
  }

  useEffect(() => {
    fetchCards();
  }, []);

  async function handleAddCard(event) {
    event.preventDefault();

    setErrors({});
    setSuccess("");

    let hasErrors = false;

    if (name.trim() === "") {
      setErrors((previousErrors) => ({
        ...previousErrors,
        name: "Informe o nome do cartão.",
      }));
      hasErrors = true;
    }

    if (closingDay.trim() === "") {
      setErrors((previousErrors) => ({
        ...previousErrors,
        closingDay: "Informe o dia de fechamento.",
      }));

      hasErrors = true;
    } else if (Number(closingDay) < 1 || Number(closingDay) > 31) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        closingDay: "Informe um dia entre 1 e 31.",
      }));
      hasErrors = true;
    }

    if (dueDay.trim() === "") {
      setErrors((previousErrors) => ({
        ...previousErrors,
        dueDay: "Informe o dia do vencimento.",
      }));

      hasErrors = true;
    } else if (Number(dueDay) < 1 || Number(dueDay) > 31) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        dueDay: "Informe um dia entre 1 e 31.",
      }));
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error(error);
      return;
    }

    const userId = data.user.id;

    const cardData = {
      user_id: userId,
      name,
      closing_day: Number(closingDay),
      due_day: Number(dueDay),
    };

    if (editingCard) {
      const { error: updateError } = await supabase
        .from("cards")
        .update(cardData)
        .eq("id", editingCard.id);

      if (updateError) {
        console.error(updateError);

        setErrors({
          general: "Não foi possível atualizar o cartão.",
        });

        return;
      }

      setCards((previousCards) =>
        previousCards.map((currentCard) =>
          currentCard.id === editingCard.id
            ? { ...currentCard, ...cardData }
            : currentCard,
        ),
      );

      setSuccess("Cartão atualizado com sucesso!");

      setEditingCard(null);

      setTimeout(() => {
        setSuccess("");
      }, 3000);

      setName("");
      setClosingDay("");
      setDueDay("");
    } else {
      const { data: insertedCard, error: insertError } = await supabase
        .from("cards")
        .insert(cardData)
        .select()
        .single();

      if (insertError) {
        setErrors({
          general: insertError.message,
        });

        return;
      }

      setCards((previousCards) => [...previousCards, insertedCard]);

      onCardAdded();

      setSuccess("Cartão cadastrado com sucesso!");

      setTimeout(() => {
        setSuccess("");
      }, 3000);

      setName("");
      setClosingDay("");
      setDueDay("");
    }
  }

  async function handleDelete(card) {
    setErrors({});
    setSuccess("");

    const { error } = await supabase.from("cards").delete().eq("id", card.id);

    if (error) {
      console.error(error);

      setErrors({
        general: "Não foi possível excluir o cartão.",
      });

      return;
    }

    setCards((previousCards) =>
      previousCards.filter((currentCard) => currentCard.id !== card.id),
    );
  }

  function handleEdit(card) {
    setEditingCard(card);
    setName(card.name);
    setClosingDay(String(card.closing_day));
    setDueDay(String(card.due_day));
  }

  return (
    <section className="cards-section">
      <div className="cards-section__panel">
        <h2 className="cards-section__title">Meus cartões</h2>
        {success && <p>{success}</p>}
        {errors.general && <p className="form-error">{errors.general}</p>}

        <form className="cards-section__form" onSubmit={handleAddCard}>
          <div className="cards-section__field">
            <label htmlFor="card-name">Nome do cartão</label>

            <input
              type="text"
              id="card-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="cards-section__field">
            <label htmlFor="closing-day">Dia de fechamento</label>

            <input
              type="number"
              id="closing-day"
              value={closingDay}
              onChange={(event) => setClosingDay(event.target.value)}
            />

            {errors.closingDay && (
              <p className="form-error">{errors.closingDay}</p>
            )}
          </div>

          <div className="cards-section__field">
            <label htmlFor="due-day">Dia de vencimento</label>

            <input
              type="number"
              id="due-day"
              value={dueDay}
              onChange={(event) => setDueDay(event.target.value)}
            />

            {errors.dueDay && <p className="form-error">{errors.dueDay}</p>}
          </div>

          <button type="submit">
            {editingCard ? "Salvar alterações" : "Cadastrar cartão"}
          </button>
        </form>
      </div>

      <div className="cards-section__list">
        {cards.map((card) => (
          <div key={card.id} className="card-item">
            <h3>{card.name}</h3>
            <p>Dia de fechamento: {card.closing_day}</p>
            <p>Dia de vencimento: {card.due_day}</p>

            <div className="card-actions">
              <button type="button" onClick={() => handleEdit(card)}>
                Editar
              </button>

              <button type="button" onClick={() => handleDelete(card)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Cards;
