// Lógica pura del mapa de calor (sin DOM ni localStorage).
// Todas las funciones reciben el día de referencia ("hoy") como parámetro
// y trabajan en fecha local: nunca se usa UTC.

// Desplaza una fecha "AAAA-MM-DD" un número de días (fecha local)
function shiftDays(dateText, days) {
  const parts = dateText.split("-");
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// Devuelve los 56 días de la ventana: desde hoy menos 55 hasta hoy
function windowDays(today) {
  const days = [];
  for (let offset = -55; offset <= 0; offset++) {
    days.push(shiftDays(today, offset));
  }
  return days;
}

// Traduce minutos al nivel exacto de intensidad
function levelForMinutes(minutes) {
  if (minutes <= 0) {
    return "empty";
  }
  if (minutes <= 15) {
    return "low";
  }
  if (minutes <= 30) {
    return "medium";
  }
  if (minutes <= 60) {
    return "high";
  }
  return "max";
}

// Comprueba que un texto es una fecha válida "AAAA-MM-DD" (fecha local)
function isValidDate(dateText) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    return false;
  }
  const parts = dateText.split("-");
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.getFullYear() === Number(parts[0]) &&
    date.getMonth() === Number(parts[1]) - 1 &&
    date.getDate() === Number(parts[2]);
}

// Posición del día en la semana: 0 = lunes, 6 = domingo (fecha local)
function weekdayIndex(dateText) {
  const parts = dateText.split("-");
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return (date.getDay() + 6) % 7;
}

// Suma los minutos válidos de un día. Devuelve 0 si el día es futuro,
// está fuera de la ventana de 56 días o no tiene sesiones válidas.
function dayMinutes(sessions, day, today) {
  if (!isValidDate(day) || day > today || day < shiftDays(today, -55)) {
    return 0;
  }
  let total = 0;
  for (const session of sessions) {
    if (session.fecha !== day) {
      continue;
    }
    const minutes = Number(session.minutos);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      continue;
    }
    total = total + minutes;
  }
  return total;
}

// Construye las columnas semanales (de la más antigua a la actual),
// con lunes arriba y domingo abajo. Los días futuros salen vacíos.
function buildHeatMap(sessions, today) {
  const start = shiftDays(today, -55);
  let monday = shiftDays(start, -weekdayIndex(start));
  const weeks = [];
  while (monday <= today) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = shiftDays(monday, i);
      const future = date > today;
      const minutes = future ? 0 : dayMinutes(sessions, date, today);
      days.push({ date: date, minutes: minutes, level: levelForMinutes(minutes), future: future });
    }
    weeks.push({ days: days });
    monday = shiftDays(monday, 7);
  }
  return { weeks: weeks };
}

// Exporta para `node --test` sin romper la carga clásica en el navegador
if (typeof module !== "undefined") {
  module.exports = { shiftDays, windowDays, levelForMinutes, dayMinutes, buildHeatMap };
}
