# Tareas — Mapa de calor (001-heat-map)

Orden de dependencia: lógica y pruebas primero; interfaz después; cableado y verificación al final.

- [x] T1 — Ventana y niveles en la lógica (RF-1, RF-2)
  Hecho cuando: la ventana devuelve 56 días (hoy−55 a hoy) y cada frontera (0, 1, 15, 16, 30, 31, 60, 61) da su nivel exacto.
- [x] T2 — Suma diaria y estructura semanal (RF-1, RF-3, RF-4)
  Hecho cuando: varias sesiones del mismo día se suman y la estructura sale en 8 columnas lunes–domingo de antigua a actual, con futuros en vacío.
- [x] T3 — Pruebas de ventana y niveles (RF-1, RF-2)
  Hecho cuando: `node --test` pasa los casos de 56 días, orden de columnas/filas y las 8 fronteras de nivel.
- [x] T4 — Pruebas de suma, ignorados y límites (RF-3, RF-4)
  Hecho cuando: `node --test` pasa suma múltiple, futuras/fuera de ventana/no válidas ignoradas, semana en lunes con 6 neutros, vacío total y un solo día con color.
- [x] T5 — Sección del mapa en la página (RF-1, RF-5)
  Hecho cuando: la página muestra el título "Últimas 8 semanas", el contenedor de columnas y la leyenda con los cinco rangos, sin acciones al pulsar.
- [x] T6 — Estilos del mapa y leyenda (RF-2, RF-5, RNF-1, RNF-2)
  Hecho cuando: a 375 px se ven las 8 columnas sin desplazamiento horizontal y cada nivel se distingue con su rango numérico legible.
- [x] T7 — Pintado y repintado desde la página (RF-6; repinta RF-1…RF-5)
  Hecho cuando: al abrir, registrar y eliminar, el mapa se recalcula con hoy local y se repinta sin errores ni pérdida de sesiones.
- [x] T8 — Verificación final de cierre (todos los RF y RNF)
  Hecho cuando: pruebas en verde, registrar/eliminar actualizan el mapa, consola sin errores y 375 px sin desplazamiento horizontal.
