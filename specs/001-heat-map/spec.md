# Especificación — Mapa de calor de estudio

## Contexto y objetivo
El diario muestra totales (racha, semana, mes) pero no la constancia visual a lo largo del tiempo. El objetivo es ofrecer una vista de un vistazo de los días estudiados en las últimas semanas, donde la intensidad del color refleja los minutos estudiados.

## Usuarios
- Estudiante que registra sus sesiones y quiere ver su constancia de un vistazo.

## Historias de usuario
- HU-1: Como estudiante, quiero ver mis últimas 8 semanas en un mapa por días para reconocer mi constancia.
- HU-2: Como estudiante, quiero que los días con más minutos se vean más intensos para distinguir el esfuerzo de cada día.

## Requisitos funcionales
- RF-1: Mostrar las últimas 8 semanas naturales (de lunes a domingo) terminando en la semana actual, ordenadas de izquierda (más antigua) a derecha (actual); cada columna ordena sus días de arriba (lunes) a abajo (domingo). Los días más antiguos de la ventana de 56 días que queden fuera de esas 8 semanas no se dibujan (siguen contando en racha, semana y mes).
  - Criterio EARS: Cuando el estudiante abre el diario, el sistema debe mostrar las 8 semanas desde el lunes de hace 7 semanas hasta el domingo de la semana actual, colocando cada día en la columna de su semana y la fila de su día.
- RF-2: Asignar a cada día un nivel exacto según sus minutos: vacío (0), suave (1–15), medio (16–30), fuerte (31–60) y máximo (61 o más).
  - Criterio EARS: Si un día suma N minutos, entonces el sistema debe mostrarle el nivel que contiene a N, sin excepciones.
- RF-3: Sumar todas las sesiones válidas del mismo día (minutos mayores que 0 con fecha bien formada); ignorar las sesiones futuras, las fuera de la ventana y las no válidas.
  - Criterio EARS: Mientras existan varias sesiones válidas el mismo día, el sistema debe sumarlas en una sola casilla; si una sesión es futura, está fuera de la ventana o no es válida, el sistema debe ignorarla.
- RF-4: Mostrar cada día posterior a hoy como hueco neutro con nivel vacío, igual que un día pasado sin estudio.
  - Criterio EARS: Cuando un día sea posterior a hoy, el sistema debe mostrarlo vacío y sin cómputo.
- RF-5: Presentar el mapa como vista solo visual con título "Últimas 8 semanas" y leyenda con los cinco rangos ("0", "1–15", "16–30", "31–60", "61+"), sin acciones al pulsar las casillas.
  - Criterio EARS: Cuando el estudiante consulte el mapa, el sistema debe mostrar título, casillas y leyenda con sus rangos numéricos, sin ninguna acción al pulsar.
- RF-6: Actualizar el mapa al registrar o eliminar una sesión, usando como día de referencia hoy en fecha local del usuario.
  - Criterio EARS: Cuando se registre o elimine una sesión, el sistema debe recalcular el mapa con ese mismo día de referencia.

## Requisitos no funcionales
- RNF-1: A 375 px de ancho, las 8 columnas deben verse sin desplazamiento horizontal.
- RNF-2: Los textos (título y leyenda) deben tener contraste legible, y cada nivel debe identificarse por su rango numérico, sin depender solo del color.

## Casos límite
- Sin sesiones registradas: todas las casillas vacías con título y leyenda visibles.
- Todas las sesiones en un único día de la ventana: solo esa casilla tiene color.
- Sesiones solo futuras o solo fuera de la ventana: mapa vacío.
- Semana actual en lunes: 6 días futuros como huecos neutros.
- Los 0–6 días más antiguos de la ventana (hoy menos 55 en adelante) que caigan antes del lunes de hace 7 semanas no se dibujan; racha, semana y mes los siguen contando.
- Sesión no válida (fecha malformada o minutos no mayores que 0): se ignora.

## Fuera de alcance
- Detalle por día (minutos exactos por casilla, textos emergentes o navegación).
- Ventanas distintas de 8 semanas o configurables por el usuario.
- Escala relativa al máximo personal o personalización de umbrales.
- Distinción visual entre días futuros y días pasados sin estudio.

## Criterios de finalización
- Se ven las últimas 8 semanas naturales (lunes a domingo), con la semana actual la última.
- Cada día dibujado muestra exactamente el nivel de su rango.
- Registrar o eliminar una sesión actualiza el mapa.
- Las sesiones futuras, fuera de ventana o no válidas no alteran ningún cómputo.
- La lógica del mapa está cubierta por pruebas y no se acepta con pruebas en rojo.
- Verificado: registrar y eliminar actualizan el mapa, consola sin errores y vista a 375 px sin desplazamiento horizontal.

## Dudas abiertas
- Ninguna.
