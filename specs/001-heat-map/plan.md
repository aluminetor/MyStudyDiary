# Plan — Mapa de calor (001-heat-map)

## Alineación con la constitución
- Simplicidad: solo ficheros estáticos clásicos, sin dependencias ni build; sigue abriendo con doble clic.
- La spec manda: este plan solo cubre RF-1…RF-6 y RNF-1…RNF-2; nada fuera de la spec.
- Lógica separada: todo el cálculo en funciones puras con el día de referencia como parámetro; la interfaz solo pinta.
- Tests como puerta: pruebas con `node --test`, prohibido avanzar en rojo.
- Datos sagrados: no se cambia el formato guardado; fechas en hora local; el mapa nunca escribe sesiones.
- Idioma: identificadores en inglés; textos visibles y documentación en español.

## Archivos: qué se crea o modifica y qué responsabilidad tiene (con RF)
- `logic.js` (nuevo): lógica pura del mapa — ventana, suma por día, niveles y estructura de semanas. Cubre RF-1, RF-2, RF-3, RF-4.
- `logic.test.js` (nuevo): pruebas de la lógica pura con `node --test`. Cubre RF-1…RF-4 y la puerta de pruebas del cierre.
- `index.html` (modifica): añade la sección del mapa con título "Últimas 8 semanas", contenedor de columnas y leyenda con los cinco rangos. Cubre RF-1, RF-5.
- `styles.css` (modifica): rejilla de 8 columnas lunes–domingo, cinco niveles de intensidad y leyenda legible a 375 px. Cubre RF-1, RF-2, RF-5, RNF-1, RNF-2.
- `app.js` (modifica): obtiene las sesiones, pide la estructura a la lógica con hoy local y pinta el mapa; repinta al registrar o eliminar. Cubre RF-6 y el repintado de RF-1…RF-5.

## Funciones puras de lógica (todas reciben el día de referencia)
- `dayMinutes(sessions, day, today)`: suma los minutos válidos de un día; devuelve 0 si el día es futuro, está fuera de la ventana o no hay sesiones válidas. Cubre RF-3, RF-4.
- `levelForMinutes(minutes)`: traduce minutos al nivel exacto (vacío, suave, medio, fuerte, máximo). Cubre RF-2.
- `windowDays(today)`: devuelve la lista ordenada de los 56 días desde hoy menos 55 hasta hoy. Cubre RF-1.
- `buildHeatMap(sessions, today)`: devuelve las 8 columnas semanales con cada día, sus minutos y su nivel, ya ordenadas para pintar. Cubre RF-1…RF-4.

## Algoritmo del mapa (pseudocódigo)
1. Tomar el día de referencia recibido como parámetro.
2. Construir la lista de 56 días desde referencia menos 55 hasta referencia.
3. Para cada día: si es posterior a referencia, minutos = 0; si no, sumar solo sesiones válidas de ese día dentro de la ventana.
4. Convertir los minutos de cada día a su nivel según los umbrales fijos.
5. Agrupar los días por su semana (lunes a domingo), de la semana más antigua a la actual, manteniendo el orden lunes arriba y domingo abajo.
6. Devolver la estructura de columnas con día, minutos y nivel.

## Cómo se pinta en la interfaz
- Una sección con el título, una rejilla de 8 columnas (semanas de antigua a actual) y la leyenda con los cinco rangos numéricos. Cubre RF-1, RF-5.
- Cada casilla muestra solo el color de su nivel, sin acciones al pulsar. Cubre RF-5.
- Los días futuros de la semana actual se pintan con el nivel vacío, igual que un día pasado sin estudio. Cubre RF-4.
- Al arrancar y al registrar o eliminar una sesión, se recalcula con hoy local y se repinta todo el mapa. Cubre RF-6.
- A 375 px las 8 columnas caben sin desplazamiento horizontal y los textos mantienen contraste; la leyenda identifica cada nivel por su número, no solo por el color. Cubre RNF-1, RNF-2.

## Decisiones técnicas justificadas (y alternativa descartada)
1. Lógica en fichero clásico separado, cargado con etiqueta de guion clásica y reutilizado por las pruebas sin empaquetado. Justificación: mantiene el doble clic y la testabilidad con `node --test`. Descartada: duplicar el cálculo en el fichero de interfaz, porque mezcla lógica e interfaz y viola el principio 3.
2. Ventana calculada como 56 días móviles agrupados por semana, en vez de 8 semanas naturales. Justificación: es lo único compatible con "terminando hoy" de RF-1. Descartada: semanas naturales, porque la última no terminaría hoy.
3. Sesiones no válidas ignoradas a nivel de suma diaria, sin migrar ni corregir datos guardados. Justificación: protege los datos del usuario y mantiene compatibilidad hacia atrás. Descartada: sanear el guardado, porque reescribiría sesiones del usuario.
4. Leyenda con rangos numéricos visibles. Justificación: hace el mapa legible sin depender solo del color (RNF-2). Descartada: mapa solo con color, porque incumple RNF-2.

## Estrategia de pruebas con `node --test`
- Puerta: todo en verde antes de tocar la interfaz; cualquier rojo detiene el avance.
- Ventana (RF-1): con una referencia fija, la estructura trae 56 días, 8 columnas, orden lunes–domingo y de antigua a actual.
- Niveles (RF-2): un caso por cada frontera (0, 1, 15, 16, 30, 31, 60, 61).
- Suma e ignorados (RF-3): varias sesiones el mismo día se suman; futuras, fuera de ventana y no válidas no alteran el resultado.
- Futuro (RF-4): los días posteriores a la referencia salen en nivel vacío.
- Semana en lunes (caso límite): 6 huecos neutros en la columna actual.
- Sin sesiones y todo en un día (casos límite): mapa vacío y mapa con una sola casilla coloreada.
- Verificación manual final (cierre): registrar y eliminar actualizan el mapa, consola sin errores y 375 px sin desplazamiento horizontal.
