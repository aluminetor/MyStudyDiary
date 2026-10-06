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

// Construye las últimas 8 semanas naturales (lunes a domingo, la actual la última):
// desde el lunes de hace 7 semanas hasta el domingo de la semana actual.
// Los días futuros salen como huecos neutros en vacío.
function buildHeatMap(sessions, today) {
  let monday = shiftDays(today, -(weekdayIndex(today) + 49));
  const weeks = [];
  for (let w = 0; w < 8; w++) {
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

// Límites de la importación (plan 002): 5 MB y 10.000 sesiones
const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
const MAX_IMPORT_SESSIONS = 10000;

// Nombre propuesto para la copia exportada, con la fecha local recibida
function buildExportName(today) {
  return "diario-estudio-" + today + ".json";
}

// Lee y valida el contenido general del archivo a importar (sin guardar nada).
// Orden: tamaño, JSON bien formado, lista, tope de sesiones.
function parseImportContent(text, fileBytes) {
  if (fileBytes > MAX_IMPORT_BYTES) {
    return { ok: false, reason: "too-large" };
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { ok: false, reason: "invalid-json" };
  }
  if (!Array.isArray(data)) {
    return { ok: false, reason: "not-array" };
  }
  if (data.length > MAX_IMPORT_SESSIONS) {
    return { ok: false, reason: "too-many" };
  }
  return { ok: true, list: data };
}

// Comprueba que un valor es una sesión válida para importar:
// identificador obligatorio, fecha real de calendario (futura incluida),
// tema no vacío tras quitar espacios, minutos en número mayor que 0.
function isValidSession(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if ((typeof value.id !== "string" || value.id === "") &&
      (typeof value.id !== "number" || !Number.isFinite(value.id))) {
    return false;
  }
  if (typeof value.fecha !== "string" || !isValidDate(value.fecha)) {
    return false;
  }
  if (typeof value.tema !== "string" || value.tema.trim() === "") {
    return false;
  }
  if (typeof value.minutos !== "number" || !Number.isFinite(value.minutos) || value.minutos <= 0) {
    return false;
  }
  return true;
}

// Valida la lista completa: una sola rota rechaza todo,
// indicando la posición de la primera rota. No guarda nada.
function validateImportList(list) {
  for (let i = 0; i < list.length; i++) {
    if (!isValidSession(list[i])) {
      return { ok: false, reason: "invalid-session", index: i };
    }
  }
  return { ok: true, list: list };
}

// Calcula la fusión por identificador: las del archivo que ya existen
// van a omitidas y el resto a añadir. No modifica ninguna lista.
function mergeSessions(saved, incoming) {
  const savedIds = new Set(saved.map(function (s) { return s.id; }));
  const toAdd = [];
  let skipped = 0;
  for (const session of incoming) {
    if (savedIds.has(session.id)) {
      skipped = skipped + 1;
    } else {
      toAdd.push(session);
    }
  }
  return { toAdd: toAdd, skipped: skipped };
}

// Exporta para `node --test` sin romper la carga clásica en el navegador
if (typeof module !== "undefined") {
  module.exports = { shiftDays, windowDays, levelForMinutes, dayMinutes, buildHeatMap, weekdayIndex, buildExportName, parseImportContent, isValidSession, validateImportList, mergeSessions };
}
