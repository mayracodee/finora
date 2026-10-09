import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import {
  getLastDayOfMonth,
  getInvoiceClosingDate,
  getInvoiceDueDate,
} from "../../utils/invoice";
import "./AddPurchase.css";

function AddPurchase({ onPurchaseAdded, cardAdded }) {
  const [installmentOption, setInstallmentOption] = useState("");
  const [establishment, setEstablishment] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [cardUsed, setCardUsed] = useState("");
  const [installmentCount, setInstallmentCount] = useState("");
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [cards, setCards] = useState([]);

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
  }, [cardAdded]);

  async function readReceipt() {
    if (!receiptImage) {
      return;
    }

    try {
      const formData = new FormData();

      formData.append("image", receiptImage);

      const { data, error } = await supabase.functions.invoke("read-receipt", {
        body: formData,
      });

      if (error) {
        console.error("Erro ao ler comprovante:", error);

        setErrors({
          general: "Não foi possível ler o comprovante.",
        });

        return;
      }

      console.log("Dados extraídos do comprovante:", data);
    } catch (error) {
      console.error("Erro ao processar comprovante:", error);

      setErrors({
        general: "Não foi possível processar o comprovante.",
      });
    }
  }

  async function handleSavePurchase(event) {
    event.preventDefault();

    let hasErrors = false;

    setErrors({});

    if (establishment.trim() === "") {
      setErrors((previousErrors) => ({
        ...previousErrors,
        establishment: "Informe o estabelecimento.",
      }));

      hasErrors = true;
    }

    if (!purchasePrice || Number(purchasePrice) <= 0) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        purchasePrice:
          "Preço inválido! O valor não pode estar vazio e deve ser maior que zero.",
      }));

      hasErrors = true;
    }

    if (purchaseDate.trim() === "") {
      setErrors((previousErrors) => ({
        ...previousErrors,
        purchaseDate: "Informe a data da compra.",
      }));

      hasErrors = true;
    }

    if (cardUsed === "") {
      setErrors((previousErrors) => ({
        ...previousErrors,
        cardUsed: "Selecione um cartão.",
      }));

      hasErrors = true;
    }

    if (category === "") {
      setErrors((previousErrors) => ({
        ...previousErrors,
        category: "Selecione uma categoria.",
      }));

      hasErrors = true;
    }

    if (installmentOption === "installment" && installmentCount === "") {
      setErrors((previousErrors) => ({
        ...previousErrors,
        installmentCount: "Informe a quantidade de parcelas.",
      }));

      hasErrors = true;
    }

    if (installmentOption === "") {
      setErrors((previousErrors) => ({
        ...previousErrors,
        installmentOption: "Selecione uma opção de pagamento.",
      }));

      hasErrors = true;
    }

    if (
      installmentOption === "installment" &&
      (!Number.isInteger(Number(installmentCount)) ||
        Number(installmentCount) <= 0)
    ) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        installmentCount: "Informe uma quantidade de parcelas válida.",
      }));

      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error(error);

      setErrors({
        general: "Não foi possível identificar o usuário.",
      });

      return;
    }

    const userId = data.user.id;

    const purchase = {
      user_id: userId,
      description: establishment,
      total_amount: Number(purchasePrice),
      purchase_date: purchaseDate,
      card_id: cardUsed,
      total_installments:
        installmentOption === "single" ? 1 : Number(installmentCount),
      category,
    };

    const { data: purchaseData, error: purchaseError } = await supabase
      .from("purchases")
      .insert(purchase)
      .select()
      .single();

    if (purchaseError) {
      console.error(purchaseError);

      setErrors({
        general: "Não foi possível salvar a compra.",
      });

      return;
    }

    const purchaseId = purchaseData.id;
    const totalInstallments = purchase.total_installments;

    const purchaseDateObject = new Date(purchase.purchase_date);

    const selectedCard = cards.find((card) => card.id === cardUsed);

    const closingDay = selectedCard.closing_day;
    const dueDay = selectedCard.due_day;

    const invoiceClosingDate = getInvoiceClosingDate(
      purchaseDateObject,
      closingDay,
    );

    const invoiceDueDate = getInvoiceDueDate(invoiceClosingDate, dueDay);

    const installments = [];

    const installmentAmount = purchase.total_amount / totalInstallments;

    let totalDistributed = 0;

    for (
      let installmentNumber = 1;
      installmentNumber <= totalInstallments;
      installmentNumber++
    ) {
      const currentMonth =
        invoiceClosingDate.getMonth() + (installmentNumber - 1);

      const normalizedMonth = currentMonth % 12;

      const currentYear =
        invoiceClosingDate.getFullYear() + Math.floor(currentMonth / 12);

      const lastDayOfCurrentMonth = getLastDayOfMonth(
        currentYear,
        normalizedMonth,
      );

      const currentClosingDay = Math.min(
        invoiceClosingDate.getDate(),
        lastDayOfCurrentMonth,
      );

      const currentInvoiceClosingDate = new Date(
        currentYear,
        normalizedMonth,
        currentClosingDay,
      );

      const currentInvoiceDueDate = getInvoiceDueDate(
        currentInvoiceClosingDate,
        dueDay,
      );

      let currentInstallmentAmount = Number(installmentAmount.toFixed(2));

      if (installmentNumber === totalInstallments) {
        currentInstallmentAmount = Number(
          (purchase.total_amount - totalDistributed).toFixed(2),
        );
      }

      totalDistributed += currentInstallmentAmount;

      const installment = {
        purchase_id: purchaseId,
        installment_number: installmentNumber,
        amount: currentInstallmentAmount,
        invoice_closing_date: currentInvoiceClosingDate,
        invoice_due_date: currentInvoiceDueDate,
      };

      installments.push(installment);
    }

    const { error: installmentsError } = await supabase
      .from("purchase_installments")
      .insert(installments);

    if (installmentsError) {
      console.error(installmentsError);

      setErrors({
        general: "A compra foi salva, mas não foi possível salvar as parcelas.",
      });

      return;
    }

    onPurchaseAdded();

    setSuccess("Compra salva com sucesso!");
    setTimeout(() => setSuccess(""), 3000);
    setEstablishment("");
    setPurchasePrice("");
    setPurchaseDate("");
    setCardUsed("");
    setInstallmentOption("");
    setInstallmentCount("");
    setCategory("");
  }

  return (
    <section className="add-purchase">
      <h1 className="add-purchase__title">Adicionar compra</h1>
      {success && <p className="form-success" role="status">{success}</p>}
      {errors.general && <p className="form-error" role="alert">{errors.general}</p>}

      <form className="add-purchase__form" onSubmit={handleSavePurchase}>
        <h2 className="add-purchase__form-title">Confirmar compra</h2>

        <div className="add-purchase__field">
          <label htmlFor="establishment">Estabelecimento</label>

          <input
            type="text"
            id="establishment"
            value={establishment}
            onChange={(event) => setEstablishment(event.target.value)}
          />

          {errors.establishment && (
            <p className="form-error">{errors.establishment}</p>
          )}
        </div>

        <div className="add-purchase__field">
          <label htmlFor="purchase-price">Valor da compra</label>

          <input
            type="number"
            id="purchase-price"
            value={purchasePrice}
            onChange={(event) => setPurchasePrice(event.target.value)}
          />

          {errors.purchasePrice && (
            <p className="form-error">{errors.purchasePrice}</p>
          )}
        </div>

        <div className="add-purchase__field">
          <label htmlFor="purchase-date">Data da compra</label>

          <input
            type="date"
            id="purchase-date"
            value={purchaseDate}
            onChange={(event) => setPurchaseDate(event.target.value)}
          />

          {errors.purchaseDate && (
            <p className="form-error">{errors.purchaseDate}</p>
          )}
        </div>

        <div className="add-purchase__field">
          <label htmlFor="card-used">Cartão utilizado</label>

          <select
            id="card-used"
            value={cardUsed}
            onChange={(event) => setCardUsed(event.target.value)}
          >
            <option value="">Selecione um cartão</option>

            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name}
              </option>
            ))}
          </select>

          {errors.cardUsed && <p className="form-error">{errors.cardUsed}</p>}
        </div>

        <div className="add-purchase__field">
          <label htmlFor="installment">Parcelamento</label>

          <select
            id="installment"
            value={installmentOption}
            onChange={(event) => setInstallmentOption(event.target.value)}
          >
            <option value="">Selecione uma opção</option>
            <option value="single">À vista</option>
            <option value="installment">Parcelado</option>
          </select>

          {errors.installmentOption && (
            <p className="form-error">{errors.installmentOption}</p>
          )}
        </div>

        {installmentOption === "installment" && (
          <div className="add-purchase__field">
            <label htmlFor="installment-count">Quantidade de parcelas</label>

            <input
              type="number"
              id="installment-count"
              value={installmentCount}
              onChange={(event) => setInstallmentCount(event.target.value)}
            />

            {errors.installmentCount && (
              <p className="form-error">{errors.installmentCount}</p>
            )}
          </div>
        )}

        <div className="add-purchase__field">
          <label htmlFor="category">Categoria</label>

          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Selecione uma categoria</option>
            <option value="food">Alimentação</option>
            <option value="transport">Transporte</option>
            <option value="home">Casa</option>
            <option value="leisure">Lazer</option>
            <option value="health">Saúde</option>
            <option value="subscriptions">Assinaturas</option>
            <option value="shopping">Compras</option>
            <option value="other">Outros</option>
          </select>

          {errors.category && <p className="form-error">{errors.category}</p>}
        </div>

        <button type="submit">Confirmar compra</button>
      </form>
    </section>
  );
}

export default AddPurchase;
