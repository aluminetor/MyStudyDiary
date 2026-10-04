// Clave donde guardamos las sesiones en localStorage
const CLAVE = "diario-estudio-sesiones";

// Elementos de la página
const form = document.getElementById("form-sesion");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const lista = document.getElementById("lista");
const mensajeVacio = document.getElementById("vacio");
const numeroRacha = document.getElementById("racha");
const detalleRacha = document.getElementById("racha-detalle");
const numeroMejorRacha = document.getElementById("mejor-racha");
const unidadMejorRacha = document.getElementById("mejor-racha-unidad");
const numeroMinutosSemana = document.getElementById("minutos-semana");
const rangoSemana = document.getElementById("rango-semana");
const numeroDiasMes = document.getElementById("dias-mes");
const unidadDiasMes = document.getElementById("dias-mes-unidad");
const error = document.getElementById("error");
const mapa = document.getElementById("heat-map");

// Devuelve hoy en fecha local con formato "AAAA-MM-DD" (sin usar UTC)
function hoyLocal() {
  const ahora = new Date();
  const ano = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return ano + "-" + mes + "-" + dia;
}

// Suma (o resta) días a una fecha "AAAA-MM-DD" usando fecha local
function moverDias(fechaTexto, dias) {
  const partes = fechaTexto.split("-");
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  fecha.setDate(fecha.getDate() + dias);
  const ano = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return ano + "-" + mes + "-" + dia;
}

// Lee las sesiones guardadas. Si no hay nada, devuelve una lista vacía.
function cargarSesiones() {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (!texto) {
      return [];
    }
    const datos = JSON.parse(texto);
    if (!Array.isArray(datos)) {
      return [];
    }
    return datos;
  } catch (e) {
    return [];
  }
}

// Guarda las sesiones en localStorage
function guardarSesiones(sesiones) {
  localStorage.setItem(CLAVE, JSON.stringify(sesiones));
}

// Calcula la racha: días consecutivos con sesión que terminan hoy.
// Si hoy aún no tiene sesión, se empieza a contar desde ayer.
function calcularRacha(sesiones) {
  const diasConEstudio = new Set(sesiones.map(function (s) { return s.fecha; }));

  let dia = hoyLocal();

  // Si hoy todavía no hay sesión, la racha sigue viva desde ayer
  if (!diasConEstudio.has(dia)) {
    dia = moverDias(dia, -1);
  }

  let racha = 0;
  while (diasConEstudio.has(dia)) {
    racha = racha + 1;
    dia = moverDias(dia, -1);
  }
  return racha;
}

// Muestra la racha en grande
function mostrarRacha(sesiones) {
  const racha = calcularRacha(sesiones);
  numeroRacha.textContent = racha;
  if (racha === 1) {
    detalleRacha.textContent = "día seguido estudiando";
  } else {
    detalleRacha.textContent = "días seguidos estudiando";
  }
}

// Devuelve el lunes de la semana de una fecha "AAAA-MM-DD", en fecha local
function inicioSemana(fechaTexto) {
  const partes = fechaTexto.split("-");
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  const desfase = (fecha.getDay() + 6) % 7;
  fecha.setDate(fecha.getDate() - desfase);
  const ano = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return ano + "-" + mes + "-" + dia;
}

// Convierte "AAAA-MM-DD" en "día mes", ej. "2026-09-29" -> "29 sep"
function formatearDia(fechaTexto) {
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const partes = fechaTexto.split("-");
  return Number(partes[2]) + " " + meses[Number(partes[1]) - 1];
}

// Calcula la mejor racha: la serie consecutiva más larga de todo el historial.
// Un día cuenta si tiene al menos una sesión. Las fechas futuras no suman.
function calcularMejorRacha(sesiones) {
  const hoy = hoyLocal();
  const dias = [...new Set(sesiones.map(function (s) { return s.fecha; }))]
    .filter(function (fecha) { return fecha <= hoy; })
    .sort();

  if (dias.length === 0) {
    return 0;
  }

  let mejor = 1;
  let actual = 1;
  for (let i = 1; i < dias.length; i++) {
    if (dias[i] === moverDias(dias[i - 1], 1)) {
      actual = actual + 1;
    } else {
      actual = 1;
    }
    if (actual > mejor) {
      mejor = actual;
    }
  }
  return mejor;
}

// Muestra la mejor racha junto a la racha actual
function mostrarMejorRacha(sesiones) {
  const mejor = calcularMejorRacha(sesiones);
  numeroMejorRacha.textContent = mejor;
  if (mejor === 1) {
    unidadMejorRacha.textContent = "día";
  } else {
    unidadMejorRacha.textContent = "días";
  }
}

// Muestra los minutos estudiados esta semana (lunes a domingo)
function mostrarMinutosSemana(sesiones) {
  const hoy = hoyLocal();
  const inicio = inicioSemana(hoy);
  const fin = moverDias(inicio, 6);
  let total = 0;
  for (const s of sesiones) {
    if (s.fecha >= inicio && s.fecha <= hoy) {
      total = total + s.minutos;
    }
  }
  numeroMinutosSemana.textContent = total;
  rangoSemana.textContent = formatearDia(inicio) + " – " + formatearDia(fin);
}

// Calcula cuántos días distintos tienen sesión este mes natural (fecha local).
// Varias sesiones el mismo día cuentan como un día. Las futuras no suman.
function calcularDiasMes(sesiones) {
  const hoy = hoyLocal();
  const prefijoMes = hoy.slice(0, 7);
  const dias = new Set();
  for (const s of sesiones) {
    if (s.fecha.slice(0, 7) === prefijoMes && s.fecha <= hoy) {
      dias.add(s.fecha);
    }
  }
  return dias.size;
}

// Muestra los días estudiados este mes
function mostrarDiasMes(sesiones) {
  const dias = calcularDiasMes(sesiones);
  numeroDiasMes.textContent = dias;
  if (dias === 1) {
    unidadDiasMes.textContent = "día";
  } else {
    unidadDiasMes.textContent = "días";
  }
}

// Muestra el mapa de calor de las últimas semanas (solo visual)
function mostrarMapa(sesiones) {
  const datos = buildHeatMap(sesiones, hoyLocal());
  mapa.innerHTML = "";
  for (const semana of datos.weeks) {
    for (const dia of semana.days) {
      const celda = document.createElement("div");
      celda.className = "m-celda nivel-" + dia.level;
      celda.setAttribute("aria-hidden", "true");
      mapa.appendChild(celda);
    }
  }
}

// Elimina una sesión por su id y repinta todo
function eliminarSesion(id) {
  const sesiones = cargarSesiones().filter(function (s) { return s.id !== id; });
  guardarSesiones(sesiones);
  mostrarRacha(sesiones);
  mostrarMejorRacha(sesiones);
  mostrarMinutosSemana(sesiones);
  mostrarDiasMes(sesiones);
  mostrarMapa(sesiones);
  mostrarSesiones(sesiones);
}

// Muestra la lista de sesiones, de la más reciente a la más antigua
function mostrarSesiones(sesiones) {
  const ordenadas = [...sesiones].sort(function (a, b) {
    if (a.fecha < b.fecha) { return 1; }
    if (a.fecha > b.fecha) { return -1; }
    return b.id - a.id;
  });

  lista.innerHTML = "";

  if (ordenadas.length === 0) {
    mensajeVacio.hidden = false;
    return;
  }
  mensajeVacio.hidden = true;

  for (const sesion of ordenadas) {
    const item = document.createElement("li");

    const izquierda = document.createElement("div");

    const tema = document.createElement("p");
    tema.className = "tema";
    tema.textContent = sesion.tema;

    const fecha = document.createElement("p");
    fecha.className = "fecha";
    fecha.textContent = sesion.fecha;

    izquierda.appendChild(tema);
    izquierda.appendChild(fecha);

    const minutos = document.createElement("span");
    minutos.className = "min";
    minutos.textContent = sesion.minutos + " min";

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "borrar";
    boton.textContent = "Eliminar";
    boton.addEventListener("click", function () {
      if (confirm("¿Eliminar esta sesión?")) {
        eliminarSesion(sesion.id);
      }
    });

    const derecha = document.createElement("div");
    derecha.className = "derecha";
    derecha.appendChild(minutos);
    derecha.appendChild(boton);

    item.appendChild(izquierda);
    item.appendChild(derecha);
    lista.appendChild(item);
  }
}

// Muestra un mensaje de error en el formulario
function mostrarError(mensaje) {
  error.textContent = mensaje;
  error.hidden = false;
}

function ocultarError() {
  error.textContent = "";
  error.hidden = true;
}

// Al enviar el formulario, valida y guarda la sesión
form.addEventListener("submit", function (evento) {
  evento.preventDefault();
  ocultarError();

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  if (!fecha) {
    mostrarError("Elige una fecha.");
    return;
  }
  if (fecha > hoyLocal()) {
    mostrarError("La fecha no puede ser futura.");
    return;
  }
  if (tema === "") {
    mostrarError("El tema es obligatorio.");
    return;
  }
  if (!Number.isInteger(minutos) || minutos <= 0) {
    mostrarError("Los minutos tienen que ser un número mayor que 0.");
    return;
  }

  const sesiones = cargarSesiones();
  sesiones.push({
    id: Date.now(),
    fecha: fecha,
    tema: tema,
    minutos: minutos
  });
  guardarSesiones(sesiones);

  // Limpia el formulario y deja la fecha en hoy
  campoFecha.value = hoyLocal();
  campoTema.value = "";
  campoMinutos.value = "";

  mostrarRacha(sesiones);
  mostrarMejorRacha(sesiones);
  mostrarMinutosSemana(sesiones);
  mostrarDiasMes(sesiones);
  mostrarMapa(sesiones);
  mostrarSesiones(sesiones);
});

// Al arrancar: fecha por defecto = hoy, y pinta datos guardados
campoFecha.value = hoyLocal();
const iniciales = cargarSesiones();
mostrarRacha(iniciales);
mostrarMejorRacha(iniciales);
mostrarMinutosSemana(iniciales);
mostrarDiasMes(iniciales);
mostrarMapa(iniciales);
mostrarSesiones(iniciales);
