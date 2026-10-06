# Plan 002 — Exportar e importar sesiones

## 1. Archivos y responsabilidades
- `logic.js` (se modifica, solo añade lógica pura): validación del contenido a importar, construcción del nombre de exportación y cálculo de la fusión. No toca DOM ni almacenamiento. Cubre RF-1, RF-4, RF-5, RF-6, RF-7.
- `app.js` (se modifica, solo capa de interfaz y guardado): lee lo guardado, pide la descarga, lee el archivo elegido, llama a la lógica pura, muestra resúmenes y confirmación, y guarda solo tras confirmar. Cubre RF-1, RF-2, RF-3, RF-8, RF-9, RF-10, RF-11.
- `index.html` (se modifica, solo estructura): nueva sección "Copia de seguridad" con botón de exportar, botón de importar, selector de archivos oculto y zona de mensajes. Cubre RF-1, RF-3, RF-8 y RNF-2.
- `styles.css` (se modifica, solo estilos mínimos): los dos botones a ancho completo en móvil para que no haya desplazamiento horizontal. Cubre RNF-2.
- `logic.test.js` (se modifica, solo pruebas): pruebas de la validación y la fusión con `node --test`. Cubre RF-4, RF-5, RF-6, RF-7 y la base de RF-8/RF-9.
- No se crea ningún archivo nuevo (constitución: simplicidad primero).

## 2. Funciones puras necesarias (en `logic.js`, sin DOM ni almacenamiento)
Todas las que dependen de la fecha reciben el día de referencia `today` ("AAAA-MM-DD" en fecha local) como parámetro (constitución: lógica separada).

- `buildExportName(today)` → texto del nombre propuesto.
  Recibe `today` y devuelve el nombre con la fecha local incluida. Cubre RF-1.
- `parseImportContent(text, fileBytes)` → resultado de lectura y validación general.
  Recibe el texto del archivo y su tamaño en bytes. Comprueba por orden: tamaño, JSON bien formado, que sea lista, que no supere 10.000 elementos. Devuelve "válido con lista" o "rechazo con un único motivo" (el primero que falle). No guarda nada. Cubre RF-3, RF-4, RF-5 y RNF-3.
- `isValidSession(value)` → sí o no.
  Comprueba una sesión: identificador obligatorio (texto no vacío o número finito, por compatibilidad con lo ya guardado); fecha con formato `AAAA-MM-DD` correspondiente a una fecha real de calendario (misma comprobación local ya existente, sin UTC); tema como texto que sigue no vacío tras quitar espacios de los extremos; minutos como número finito mayor que 0. Las fechas futuras se aceptan como válidas. Cubre RF-6.
- `validateImportList(list)` → válido o rechazo.
  Recorre la lista y si alguna sesión no es válida, rechaza todo indicando la posición de la primera rota. No guarda nada. Cubre RF-6 y el caso límite de "una rota entre miles".
- `mergeSessions(saved, incoming)` → `{ toAdd, skipped }`.
  Compara por identificador: las del archivo cuyo identificador ya existe en lo guardado van a omitidas; el resto van a añadir. No modifica ninguna lista de entrada y no borra nada. Cubre RF-7, RF-9, RF-11 y los casos límite de lista vacía, todo duplicado y mezcla.

## 3. Algoritmo en pseudocódigo
### Exportación (cubre RF-1, RF-2, RF-11, RNF-1)
```
SI no hay sesiones guardadas:
    MOSTRAR aviso "Todavía no tienes sesiones para exportar" y TERMINAR sin descargar
SINO:
    nombre = buildExportName(hoy local)
    contenido = serie JSON de las sesiones en el orden guardado, sin filtrar ni reordenar
    OFRECER descarga del contenido con ese nombre
    NO modificar lo guardado
```

### Importación (cubre RF-3 a RF-11 y RNF-1/RNF-3)
```
CUANDO el estudiante elige un archivo:
    LEER el archivo como texto con su tamaño en bytes, SIN guardar nada (RF-3)
    resultado = parseImportContent(texto, tamaño)
    SI resultado es rechazo:
        MOSTRAR mensaje en español con el único motivo (no legible / no esperado / demasiado grande) y TERMINAR sin guardar (RF-4, RF-5)
    lista = resultado.lista
    SI lista supera 10.000 elementos:
        RECHAZAR todo con mensaje de tamaño y TERMINAR sin guardar (RF-4)
    validación = validateImportList(lista)
    SI validación es rechazo:
        MOSTRAR mensaje en español (qué posición falla, sin tecnicismos) y TERMINAR sin guardar (RF-6)
    cálculo = mergeSessions(guardadas, lista)  // nuevas frente a duplicadas (RF-7, RF-11)
    MOSTRAR resumen "Se añadirán N nuevas, se omitirán M duplicadas" y PEDIR confirmación (RF-8)
    SI el estudiante cancela:
        TERMINAR sin guardar nada (RF-10)
    SINO:
        GUARDAR guardadas + cálculo.añadir, sin tocar las existentes (RF-9, RF-11)
        MOSTRAR resumen final "N añadidas, M omitidas" (RF-9)
        REPINTAR racha, semana, mes, lista y mapa con los mismos cálculos de siempre
```

Orden fijo de motivos de rechazo (resuelve el caso de varios fallos a la vez): tamaño del archivo → JSON ilegible → no es lista → demasiadas sesiones → sesión rota. Siempre se informa solo del primero.

## 4. Interfaz
- Nueva sección "Copia de seguridad" tras "Mis sesiones": botón "Exportar copia", botón "Importar copia" y un selector de archivos oculto que solo acepta JSON. El botón de importar abre el selector; si el estudiante cancela el selector, no pasa nada.
- Zona de mensajes con `aria-live` para avisos, resúmenes y errores en español (RNF-1). La confirmación previa (RF-8) reutiliza el diálogo nativo de confirmación con el texto del resumen, coherente con el borrado actual.
- Tras importar con éxito o rechazar, la zona de mensajes conserva el último resumen o motivo; al confirmar, la vista completa (racha, semana, mes, lista, mapa) se repinta como al guardar una sesión.
- A 375 px los dos botones ocupan todo el ancho y los mensajes no provocan desplazamiento horizontal (RNF-2).

## 5. Decisiones justificadas (y alternativa descartada)
1. Identificador obligatorio (texto no vacío o número finito; así valen las copias exportadas por la propia app, que guarda números); si falta o no es de esos tipos, la sesión es no válida y provoca rechazo total (RF-6/RF-7). Descartado: generar identificadores nuevos a las que no lo traen, porque modificaría datos importados y rompería RF-11.
2. Validación estricta de tipos (minutos solo número finito > 0, sin aceptar cadenas numéricas). Descartado: convertir con `Number()`, porque ocultaría archivos corruptos y contradice el rechazo total de RF-6.
3. Rechazo total ante la primera sesión rota, sin importación parcial. Descartado: importar las válidas y saltar las rotas, porque el usuario eligió rechazo total y parcial complica la confianza (RF-6).
4. Confirmación con diálogo nativo sobre el resumen calculado por la lógica pura. Descartado: modal propio, porque añade estructura y estilos contra la simplicidad y ya se usa el nativo para borrar.
5. Tope medido como bytes del archivo (5 × 1024 × 1024) y longitud de la lista (10.000), comprobados antes de validar sesión por sesión. Descartado: medir el texto ya parseado o contar tras validar, porque permitiría archivos enormes antes de frenar.
6. Exportación en el orden guardado, sin filtrar futuras ni reordenar. Descartado: ordenar o excluir futuras, porque cambiaría la copia respecto a lo guardado y complicaría la compatibilidad (principio de datos sagrados).
7. Nombre de exportación fijo con fecha local del día (`today`) ya incluido en la spec. Si se exporta dos veces el mismo día, se deja que el navegador distinga las copias. Descartado: añadir hora o contador propio, porque añade complejidad innecesaria.

## 6. Estrategia de tests con `node --test` (solo lógica pura, sin DOM ni almacenamiento)
- Nombre de exportación: incluye la fecha local recibida como `today` (RF-1).
- Lectura general: texto no JSON → rechazo "no legible"; JSON que no es lista (objeto, número, `null`) → rechazo "no esperado"; lista de 10.001 → rechazo por cantidad; archivo de más de 5 MB → rechazo por tamaño (RF-4, RF-5).
- Validez de sesión: una rota entre miles → rechazo total indicando la primera posición; fecha inexistente, tema solo con espacios, minutos 0/negativos o identificador ausente → no válida; fecha futura con resto correcto → válida (RF-6).
- Fusión: lista vacía → 0 nuevas; todas duplicadas → 0 nuevas; mezcla → solo las nuevas, sin alterar las guardadas ni las entradas (RF-7, RF-11).
- Puerta verde: prohibido pasar a la implementación con tests en rojo (constitución: tests como puerta). La verificación manual con doble clic (exportar, importar con duplicados, corrupto y cancelar, consola limpia, 375 px) queda para la fase de validación, no para los tests.
