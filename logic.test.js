// Tests del mapa de calor (T1–T4): ventana, niveles, suma e ignorados.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { windowDays, levelForMinutes, dayMinutes, buildHeatMap } = require("./logic");

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

// T3 — Estructura semanal con referencia en domingo (RF-1)
test("buildHeatMap agrupa en 8 columnas de lunes a domingo", function () {
  const map = buildHeatMap([], "2026-10-04");
  assert.equal(map.weeks.length, 8);
  for (const week of map.weeks) {
    assert.equal(week.days.length, 7);
  }
  assert.equal(map.weeks[0].days[0].date, "2026-08-10");
  assert.equal(map.weeks[7].days[6].date, "2026-10-04");
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
  const current = map.weeks[map.weeks.length - 1].days;
  assert.equal(current[0].date, "2026-09-28");
  for (const cell of current.slice(1)) {
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
