// Tests del mapa de calor (T1–T4): ventana, niveles, suma e ignorados.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { shiftDays, windowDays, levelForMinutes, dayMinutes, buildHeatMap, weekdayIndex, buildExportName, parseImportContent, isValidSession, validateImportList, mergeSessions } = require("./logic");

// T1 — Ventana de 56 días (RF-1)
test("windowDays devuelve 56 días desde hoy menos 55 hasta hoy", function () {
  const days = windowDays("2026-10-04");
  assert.equal(days.length, 56);
  assert.equal(days[0], "2026-08-10");
  assert.equal(days[55], "2026-10-04");
});

// T1 — Niveles exactos (RF-2)
test("levelForMinutes aplica los umbrales exactos", function () {
  assert.equal(levelForMinutes(0), "empty");
  assert.equal(levelForMinutes(1), "low");
  assert.equal(levelForMinutes(15), "low");
  assert.equal(levelForMinutes(16), "medium");
  assert.equal(levelForMinutes(30), "medium");
  assert.equal(levelForMinutes(31), "high");
  assert.equal(levelForMinutes(60), "high");
  assert.equal(levelForMinutes(61), "max");
});

// T3 — Estructura semanal de exactamente 8 columnas (RF-1)
test("buildHeatMap agrupa exactamente en 8 columnas de lunes a domingo para cualquier día", function () {
  for (const referenceDay of ["2026-10-04", "2026-10-01", "2026-09-28"]) {
    const map = buildHeatMap([], referenceDay);
    assert.equal(map.weeks.length, 8);
    let totalDays = 0;
    for (const week of map.weeks) {
      assert.equal(week.days.length, 7);
      totalDays += week.days.length;
    }
    assert.equal(totalDays, 56);
    assert.equal(map.weeks[0].days[0].date, shiftDays(referenceDay, -(weekdayIndex(referenceDay) + 49)));
    assert.equal(map.weeks[7].days[weekdayIndex(referenceDay)].date, referenceDay);
  }
});

// T4 — Suma de varias sesiones del mismo día (RF-3)
test("dayMinutes suma las sesiones válidas del mismo día", function () {
  const sessions = [
    { fecha: "2026-10-02", minutos: 20 },
    { fecha: "2026-10-02", minutos: 15 }
  ];
  assert.equal(dayMinutes(sessions, "2026-10-02", "2026-10-04"), 35);
});

// T4 — Futuras, fuera de ventana y no válidas se ignoran (RF-3)
test("dayMinutes ignora futuras, fuera de ventana y no válidas", function () {
  const sessions = [
    { fecha: "2026-10-05", minutos: 30 },
    { fecha: "2026-08-09", minutos: 30 },
    { fecha: "no-fecha", minutos: 30 },
    { fecha: "2026-10-03", minutos: -5 },
    { fecha: "2026-10-03", minutos: "x" }
  ];
  assert.equal(dayMinutes(sessions, "2026-10-05", "2026-10-04"), 0);
  assert.equal(dayMinutes(sessions, "2026-08-09", "2026-10-04"), 0);
  assert.equal(dayMinutes(sessions, "2026-10-03", "2026-10-04"), 0);
});

// T4 — Días futuros como huecos neutros (RF-4)
test("los días futuros salen en nivel vacío", function () {
  const sessions = [{ fecha: "2026-09-29", minutos: 40 }];
  const map = buildHeatMap(sessions, "2026-09-28");
  // La última semana del mapa con hoy "2026-09-28" (lunes)
  const lastWeekDays = map.weeks[map.weeks.length - 1].days;
  assert.equal(lastWeekDays[0].date, "2026-09-28");
  assert.equal(lastWeekDays[0].future, false);
  for (const cell of lastWeekDays.slice(1)) {
    assert.equal(cell.future, true);
    assert.equal(cell.minutes, 0);
    assert.equal(cell.level, "empty");
  }
});

// T4 — Sin sesiones: todo vacío (caso límite)
test("sin sesiones el mapa sale vacío", function () {
  const map = buildHeatMap([], "2026-10-04");
  for (const week of map.weeks) {
    for (const cell of week.days) {
      assert.equal(cell.level, "empty");
    }
  }
});

// T4 — Todo en un único día: solo esa casilla tiene color (caso límite)
test("una sola sesión colorea una única casilla", function () {
  const sessions = [{ fecha: "2026-10-02", minutos: 20 }];
  const map = buildHeatMap(sessions, "2026-10-04");
  let colored = 0;
  for (const week of map.weeks) {
    for (const cell of week.days) {
      if (cell.level !== "empty") {
        colored = colored + 1;
        assert.equal(cell.date, "2026-10-02");
      }
    }
  }
  assert.equal(colored, 1);
});

// Spec 002 T1 — Nombre de exportación con fecha local (RF-1)
test("buildExportName incluye la fecha local recibida", function () {
  assert.equal(buildExportName("2026-10-06"), "diario-estudio-2026-10-06.json");
});

// Spec 002 T1 — Lectura general válida (RF-3)
test("parseImportContent acepta una lista JSON válida", function () {
  const text = JSON.stringify([{ id: "a", fecha: "2026-10-01", tema: "Mates", minutos: 30 }]);
  const result = parseImportContent(text, text.length);
  assert.equal(result.ok, true);
  assert.equal(result.list.length, 1);
});

// Spec 002 T1 — Rechazo por tamaño (RF-4)
test("parseImportContent rechaza archivos de más de 5 MB", function () {
  const result = parseImportContent("[]", 5 * 1024 * 1024 + 1);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "too-large");
});

// Spec 002 T1 — JSON ilegible y no-lista (RF-5)
test("parseImportContent rechaza JSON malformado", function () {
  const result = parseImportContent("{no json", 10);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "invalid-json");
});

test("parseImportContent rechaza JSON que no es lista", function () {
  for (const text of ['{"a":1}', "42", "null", '"hola"']) {
    const result = parseImportContent(text, text.length);
    assert.equal(result.ok, false);
    assert.equal(result.reason, "not-array");
  }
});

// Spec 002 T1 — Demasiadas sesiones (RF-4)
test("parseImportContent rechaza más de 10.000 sesiones", function () {
  const big = new Array(10001).fill(0);
  const text = JSON.stringify(big);
  const result = parseImportContent(text, text.length);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "too-many");
});

// Spec 002 T2 — Sesión válida, incluida futura (RF-6)
test("isValidSession acepta sesiones válidas y futuras", function () {
  assert.equal(isValidSession({ id: "a1", fecha: "2026-10-01", tema: "Mates", minutos: 30 }), true);
  assert.equal(isValidSession({ id: "a2", fecha: "2099-01-01", tema: "Mates", minutos: 30 }), true);
});

// Spec 002 T2 — Sesiones no válidas (RF-6)
test("isValidSession rechaza identificador ausente o vacío", function () {
  assert.equal(isValidSession({ fecha: "2026-10-01", tema: "Mates", minutos: 30 }), false);
  assert.equal(isValidSession({ id: "", fecha: "2026-10-01", tema: "Mates", minutos: 30 }), false);
  assert.equal(isValidSession({ id: null, fecha: "2026-10-01", tema: "Mates", minutos: 30 }), false);
});

test("isValidSession acepta identificador numérico (compatibilidad con guardados previos)", function () {
  assert.equal(isValidSession({ id: 1728000000000, fecha: "2026-10-01", tema: "Mates", minutos: 30 }), true);
});

test("isValidSession rechaza fecha malformada o inexistente", function () {
  assert.equal(isValidSession({ id: "a", fecha: "01/10/2026", tema: "Mates", minutos: 30 }), false);
  assert.equal(isValidSession({ id: "a", fecha: "2026-02-30", tema: "Mates", minutos: 30 }), false);
  assert.equal(isValidSession({ id: "a", fecha: null, tema: "Mates", minutos: 30 }), false);
});

test("isValidSession rechaza tema vacío o solo con espacios", function () {
  assert.equal(isValidSession({ id: "a", fecha: "2026-10-01", tema: "", minutos: 30 }), false);
  assert.equal(isValidSession({ id: "a", fecha: "2026-10-01", tema: "   ", minutos: 30 }), false);
  assert.equal(isValidSession({ id: "a", fecha: "2026-10-01", tema: 42, minutos: 30 }), false);
});

test("isValidSession rechaza minutos no numéricos o no mayores que 0", function () {
  assert.equal(isValidSession({ id: "a", fecha: "2026-10-01", tema: "Mates", minutos: 0 }), false);
  assert.equal(isValidSession({ id: "a", fecha: "2026-10-01", tema: "Mates", minutos: -5 }), false);
  assert.equal(isValidSession({ id: "a", fecha: "2026-10-01", tema: "Mates", minutos: "30" }), false);
  assert.equal(isValidSession({ id: "a", fecha: "2026-10-01", tema: "Mates" }), false);
});

// Spec 002 T2 — Rechazo total ante una rota (RF-6)
test("validateImportList rechaza todo e indica la primera rota", function () {
  const good = { id: "ok", fecha: "2026-10-01", tema: "Mates", minutos: 30 };
  const bad = { id: "rota", fecha: "2026-10-01", tema: "   ", minutos: 30 };
  const list = [good, good, bad, good];
  const result = validateImportList(list);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "invalid-session");
  assert.equal(result.index, 2);
});

test("validateImportList acepta lista válida y lista vacía", function () {
  const good = { id: "ok", fecha: "2026-10-01", tema: "Mates", minutos: 30 };
  assert.equal(validateImportList([good, good]).ok, true);
  assert.equal(validateImportList([]).ok, true);
});

// Spec 002 T3 — Fusión con lista vacía y todo duplicado (RF-7, RF-11)
test("mergeSessions con lista vacía no añade nada", function () {
  const saved = [{ id: "a", fecha: "2026-10-01", tema: "Mates", minutos: 30 }];
  const result = mergeSessions(saved, []);
  assert.equal(result.toAdd.length, 0);
  assert.equal(result.skipped, 0);
});

test("mergeSessions con todo duplicado no añade nada", function () {
  const saved = [{ id: "a", fecha: "2026-10-01", tema: "Mates", minutos: 30 }];
  const incoming = [{ id: "a", fecha: "2026-10-01", tema: "Mates", minutos: 30 }];
  const result = mergeSessions(saved, incoming);
  assert.equal(result.toAdd.length, 0);
  assert.equal(result.skipped, 1);
});

// Spec 002 T3 — Mezcla sin tocar lo guardado (RF-7, RF-9, RF-11)
test("mergeSessions solo añade las nuevas y conserva lo guardado", function () {
  const saved = [{ id: "a", fecha: "2026-10-01", tema: "Mates", minutos: 30 }];
  const incoming = [
    { id: "a", fecha: "2026-10-01", tema: "Mates", minutos: 30 },
    { id: "b", fecha: "2026-10-02", tema: "Lengua", minutos: 20 }
  ];
  const result = mergeSessions(saved, incoming);
  assert.equal(result.toAdd.length, 1);
  assert.equal(result.toAdd[0].id, "b");
  assert.equal(result.skipped, 1);
  assert.equal(saved.length, 1);
  assert.equal(incoming.length, 2);
});
