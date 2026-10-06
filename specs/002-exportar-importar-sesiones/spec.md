# Spec 002 — Exportar e importar sesiones
Estado: borrador

## Contexto y objetivo
El Diario de Estudio guarda el progreso del estudiante (sus sesiones con fecha, tema y minutos). Hoy ese progreso solo vive en el navegador donde se registró: si el estudiante cambia de dispositivo, borra los datos del navegador o quiere guardar una copia de seguridad, puede perderlo todo. El objetivo es darle una forma sencilla de guardar una copia descargable de sus sesiones y de recuperarlas después, fusionándolas con las que ya tenga, sin perder nunca su progreso.

## Usuarios
- Estudiante que registra sesiones y quiere guardar una copia de seguridad o trasladar su progreso a otro navegador o dispositivo.

## Historias de usuario
- HU-1. Como estudiante, quiero descargar mis sesiones en un archivo JSON para guardar una copia de seguridad o llevármelas a otro dispositivo.
- HU-2. Como estudiante, quiero importar un archivo JSON guardado antes para recuperar mis sesiones sin perder las que ya tengo.
- HU-3. Como estudiante, quiero saber qué va a pasar antes de importar (cuántas sesiones nuevas se añadirán) para decidir con confianza.

## Definiciones
- Sesión válida: una sesión con fecha con formato AAAA-MM-DD correspondiente a una fecha real de calendario, tema como texto no vacío (un texto compuesto solo por espacios en blanco se considera vacío) y minutos como número mayor que 0.
- Duplicada: una sesión del archivo a importar cuyo identificador coincide con el de una sesión ya guardada en el diario.
- Fusión: añadir al diario solo las sesiones nuevas del archivo, sin borrar ni modificar ninguna sesión ya guardada.

## Requisitos funcionales
- RF-1: CUANDO el estudiante solicita exportar, EL SISTEMA genera un archivo JSON descargable con todas las sesiones guardadas, cuyo nombre incluye la fecha local de exportación en formato AAAA-MM-DD.
- RF-2: SI no hay ninguna sesión guardada al solicitar exportar, ENTONCES EL SISTEMA muestra un aviso en español y no descarga ningún archivo.
- RF-3: CUANDO el estudiante elige un archivo para importar, EL SISTEMA lo lee y lo valida sin guardar ningún cambio todavía.
- RF-4: SI el archivo supera 5 MB o contiene más de 10.000 sesiones, ENTONCES EL SISTEMA rechaza la importación completa y muestra un mensaje de error en español.
- RF-5: SI el archivo no es un JSON bien formado o no contiene una lista de sesiones, ENTONCES EL SISTEMA rechaza la importación completa y muestra un mensaje de error en español.
- RF-6: SI alguna sesión del archivo no es una sesión válida, ENTONCES EL SISTEMA rechaza la importación completa y muestra un mensaje de error en español, sin guardar ningún cambio.
- RF-7: MIENTRAS el archivo es válido, EL SISTEMA detecta las sesiones duplicadas y las marca para omitirlas, conservando intactas las sesiones ya guardadas.
- RF-8: CUANDO el archivo es válido, EL SISTEMA muestra antes de guardar un resumen con el número de sesiones nuevas que se añadirán y el número de duplicadas que se omitirán, y pide confirmación al estudiante.
- RF-9: CUANDO el estudiante confirma la importación, EL SISTEMA añade solo las sesiones nuevas, sin borrar ni modificar ninguna sesión ya guardada, y muestra un resumen final en español (añadidas y omitidas).
- RF-10: SI el estudiante cancela la confirmación, ENTONCES EL SISTEMA no guarda ningún cambio.
- RF-11: EL SISTEMA nunca borra ni modifica sesiones ya guardadas como consecuencia de exportar o importar.

## Requisitos no funcionales
- RNF-1: Todos los mensajes, resúmenes y errores se muestran en español con un lenguaje que un estudiante sin conocimientos técnicos entiende.
- RNF-2: Con un ancho de 375 px, las acciones de exportar e importar y sus mensajes permanecen visibles y utilizables sin desplazamiento horizontal.
- RNF-3: La validación informa del motivo del rechazo (archivo no legible, contenido no esperado, sesión no válida o tamaño excesivo) sin tecnicismos.

## Casos límite
- Diario sin sesiones al exportar: aviso y sin descarga.
- Archivo con lista vacía: se considera válido pero sin sesiones nuevas; el resumen muestra 0 nuevas y no se guarda nada tras confirmar.
- Archivo donde todas las sesiones ya existen: el resumen muestra 0 nuevas y todas omitidas; al confirmar no cambia nada.
- Archivo con mezcla de nuevas y duplicadas: solo se añaden las nuevas, las guardadas quedan intactas.
- Archivo con una sola sesión rota entre miles válidas: se rechaza todo y no se guarda nada.
- Sesiones con fechas futuras en el archivo: se aceptan como sesiones válidas; no suman en rachas ni totales hasta llegar su fecha (según las reglas de fechas del diario).

## Fuera de alcance
- Exportar o importar en otros formatos (por ejemplo, CSV o PDF).
- Exportación parcial (por rango de fechas, por tema o selección manual).
- Reemplazo total o borrado de lo guardado desde la importación.
- Sincronización automática entre dispositivos o cuentas en la nube.
- Edición o corrección de sesiones rotas durante la importación.

## Criterios de finalización
- Con sesiones guardadas, exportar produce un archivo JSON descargable que contiene todas las sesiones y cuyo nombre incluye la fecha local de exportación en formato AAAA-MM-DD.
- Con el diario vacío, exportar muestra un aviso y no descarga nada.
- Importar un archivo válido muestra primero el recuento de nuevas y duplicadas y pide confirmación; al confirmar, solo se añaden las nuevas y lo guardado antes sigue intacto.
- Importar un archivo no legible, con contenido no esperado, con alguna sesión no válida, o que supere 5 MB o 10.000 sesiones, no guarda nada y muestra un mensaje de error en español.
- Cancelar la confirmación no guarda nada.
- Verificado abriendo el diario con doble clic: exportar, importar con duplicados, importar corrupto y cancelar, con consola sin errores y vista a 375 px utilizable.

## Dudas abiertas
- Ninguna.
