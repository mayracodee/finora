import { useState, useEffect } from "react";
import supabase from "../../lib/supabaseClient";
import "./SpendingByCategory.css";

function SpendingByCategory() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const [selectedMonthValue, setSelectedMonthValue] = useState("");

  const months = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  async function fetchPurchases() {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      return;
    }

    const userId = userData.user.id;

    const { data: purchasesData, error: purchasesError } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", userId);

    if (purchasesError) {
      return;
    }
  }

  async function fetchInstallments() {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      return;
    }

    const userId = userData.user.id;

    const firstDay = `${selectedYear}-${selectedMonth}-01`;

    const lastDay = new Date(
      Number(selectedYear),
      Number(selectedMonth),
      0,
    ).getDate();

    const lastDayDate = `${selectedYear}-${selectedMonth}-${String(lastDay).padStart(2, "0")}`;

    const { data: installmentsData, error: installmentsError } = await supabase
      .from("purchase_installments")
      .select(
        `
      amount,
      invoice_due_date,
      purchases!inner(
        category,
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

    const categoryTotals = installmentsData.reduce((totals, installment) => {
      const category =
        categoryKeys[installment.purchases.category] ||
        installment.purchases.category;

      if (!totals[category]) {
        totals[category] = 0;
      }

      totals[category] += Number(installment.amount);

      return totals;
    }, {});

    return categoryTotals;
  }

  async function fetchFixedExpenses() {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      return;
    }

    const userId = userData.user.id;

    const selectedMonthStart = `${selectedYear}-${selectedMonth}-01`;

    const { data: fixedExpensesData, error: fixedExpensesError } =
      await supabase
        .from("fixed_expenses")
        .select("amount, category, start_date")
        .eq("user_id", userId);

    if (fixedExpensesError) {
      return;
    }

    const activeFixedExpenses = fixedExpensesData.filter((expense) => {
      return expense.start_date <= selectedMonthStart;
    });

    const categoryTotals = activeFixedExpenses.reduce((totals, expense) => {
      const category = categoryKeys[expense.category] || expense.category;

      if (!totals[category]) {
        totals[category] = 0;
      }

      totals[category] += Number(expense.amount);

      return totals;
    }, {});

    return categoryTotals;
  }

  useEffect(() => {
    if (!selectedMonth || !selectedYear) {
      return;
    }

    async function loadCategoryData() {
      const purchaseTotals = await fetchInstallments();
      const fixedTotals = await fetchFixedExpenses();
      const combinedTotals = { ...(purchaseTotals || {}) };

      Object.entries(fixedTotals || {}).forEach(([category, amount]) => {
        if (!combinedTotals[category]) {
          combinedTotals[category] = 0;
        }

        combinedTotals[category] += amount;
      });

      const totalAmount = Object.values(combinedTotals).reduce(
        (total, amount) => total + amount,
        0,
      );

      if (totalAmount === 0) {
        setCategoryData([]);
        return;
      }

      const formattedData = Object.entries(combinedTotals).map(
        ([category, amount]) => ({
          category,
          amount,
          percentage: (amount / totalAmount) * 100,
        }),
      );

      setCategoryData(formattedData);
    }

    loadCategoryData();
  }, [selectedMonth, selectedYear]);

  const categoryLabels = {
    alimentacao: "Alimentação",
    saude: "Saúde",
    compras: "Compras",
    moradia: "Moradia",
    transporte: "Transporte",
    assinaturas: "Assinaturas",
    educacao: "Educação",
    outros: "Outros",
  };

  const categoryKeys = {
    food: "alimentacao",
    health: "saude",
    shopping: "compras",
    moradia: "moradia",
    alimentacao: "alimentacao",
    transporte: "transporte",
    assinaturas: "assinaturas",
    educacao: "educacao",
    outros: "outros",
  };

  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <section className="spending-by-category">
      <div className="spending-by-category__panel">
        <h2 className="spending-by-category__title">Gastos por categoria</h2>

        <select
          className="spending-by-category__month-select"
          value={selectedMonthValue}
          onChange={(event) => {
            const [year, month] = event.target.value.split("-");
            setSelectedMonthValue(event.target.value);
            setSelectedYear(year);
            setSelectedMonth(month);
          }}
        >
          <option value="">Selecione o mês</option>

          {months.map((month) => (
            <option key={month.value} value={`${currentYear}-${month.value}`}>
              {month.label} {currentYear}
            </option>
          ))}
        </select>

        <div className="spending-by-category__list">
          {categoryData.map((item) => (
            <div key={item.category} className="spending-by-category__item">
              <h3>{categoryLabels[item.category] || item.category}</h3>

              <p>{currencyFormatter.format(item.amount)}</p>

              <p>{item.percentage.toFixed(2).replace(".", ",")}%</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SpendingByCategory;
