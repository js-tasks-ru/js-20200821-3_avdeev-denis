/**
 * Возвращает последний день месяца
 */
export const getLastDayOfMonth = date => {
  const cloneDate = new Date(date);

  cloneDate.setMonth(cloneDate.getMonth() + 1);
  cloneDate.setDate(0);

  return cloneDate.getDate();
};

/**
 * Возвращает первый день месяца
 */
export const getFirstDayOfMonth = date => {
  const cloneDate = new Date(date);

  cloneDate.setDate(1);

  return cloneDate.getDay();
};

/**
 * Возвращает полное название месяца на английском
 */
export const getMonthName = date => {
  return new Date(date).toLocaleDateString('ru-RU', {
    month: 'long'
  });
};

/**
 * Возвращает дату в формате 'DD.MM.YY'
 */
export const getDateName = date => {
  return new Date(date).toLocaleDateString('ru-RU', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
};
