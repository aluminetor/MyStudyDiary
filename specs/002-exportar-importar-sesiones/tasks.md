# Tareas 002 — Exportar e importar sesiones
Orden estricto de dependencia. Una sola tarea cada vez: tests en rojo, código, `node --test` en verde, marcar y parar.

- [x] **T1. Nombre de exportación y lectura general en lógica pura.** RF-1, RF-3, RF-4, RF-5
  - Hecho cuando: `node --test` en verde comprueba nombre con fecha local `today`, rechazo por tamaño, JSON ilegible, no-lista y más de 10.000.
- [x] **T2. Validez de sesión y rechazo total en lógica pura.** RF-6
  - Hecho cuando: `node --test` en verde comprueba que una rota entre miles rechaza todo, y que fecha inexistente, tema solo-espacios, minutos 0/negativos o sin id son no válidas mientras la futura válida se acepta.
- [x] **T3. Fusión por identificador en lógica pura.** RF-7, RF-11
  - Hecho cuando: `node --test` en verde comprueba lista vacía → 0 nuevas, todo duplicado → 0 nuevas, mezcla → solo nuevas, sin modificar las entradas ni lo guardado.
- [x] **T4. Sección "Copia de seguridad" en interfaz y estilos.** RF-1, RF-3, RNF-2
  - Hecho cuando: abriendo `index.html` con doble clic se ven los botones Exportar/Importar y la zona de mensajes, y a 375 px no hay desplazamiento horizontal.
- [x] **T5. Exportar desde la interfaz.** RF-1, RF-2, RF-11, RNF-1
  - Hecho cuando: con sesiones se descarga un JSON con todas y nombre con fecha local sin modificar lo guardado; sin sesiones muestra aviso en español y no descarga nada.
- [x] **T6. Importar desde la interfaz con confirmación y guardado.** RF-3, RF-8, RF-9, RF-10, RF-11, RNF-1, RNF-3
  - Hecho cuando: un archivo válido muestra resumen de nuevas/omitidas y pide confirmación; al confirmar solo añade nuevas y muestra resumen final; al cancelar o ante rechazo no guarda nada y muestra el motivo en español.
- [x] **T7. Validación manual final en Chrome.** Criterios de finalización de la spec (RF-1 a RF-11, RNF-1 a RNF-3)
  - Hecho cuando: con `file://` se verifican exportar, importar con duplicados, importar corrupto y cancelar, con consola sin errores y vista a 375 px utilizable.
