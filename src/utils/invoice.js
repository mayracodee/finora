function getLastDayOfMonth(year, month) {
  const lastDay = new Date(year, month + 1, 0);

  return lastDay.getDate();
}

function getInvoiceClosingDate(purchaseDate, closingDay) {
  const purchaseDay = purchaseDate.getDate();
  const purchaseMonth = purchaseDate.getMonth();
  const purchaseYear = purchaseDate.getFullYear();

  if (purchaseDay < closingDay) {
    const lastDayOfMonth = getLastDayOfMonth(purchaseYear, purchaseMonth);

    const closingDate = new Date(
      purchaseYear,
      purchaseMonth,
      Math.min(closingDay, lastDayOfMonth),
    );
    return closingDate;
  } else {
    const nextMonth = purchaseMonth + 1;

    const lastDayOfNextMonth = getLastDayOfMonth(purchaseYear, nextMonth);

    const closingDate = new Date(
      purchaseYear,
      nextMonth,
      Math.min(closingDay, lastDayOfNextMonth),
    );
    return closingDate;
  }
}

function getInvoiceDueDate(closingDate, dueDay) {
  const closingDay = closingDate.getDate();
  const closingMonth = closingDate.getMonth();
  const closingYear = closingDate.getFullYear();

  if (dueDay < closingDay) {
    const lastDayOfNextMonth = getLastDayOfMonth(closingYear, closingMonth + 1);

    const validDueDay = Math.min(dueDay, lastDayOfNextMonth);

    const dueDate = new Date(closingYear, closingMonth + 1, validDueDay);

    return dueDate;
  } else {
    const lastDayOfMonth = getLastDayOfMonth(
      closingYear,
      closingMonth
    );

    const validDueDay = Math.min(
      dueDay,
      lastDayOfMonth
    );

    const dueDate = new Date(
      closingYear,
      closingMonth,
      validDueDay
    );

    return dueDate;
  }
}

export {getLastDayOfMonth, getInvoiceClosingDate, getInvoiceDueDate}