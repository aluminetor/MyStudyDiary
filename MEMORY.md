# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- v1.5 diseño cuaderno: cabecera alineada a la izquierda con filete verde,
  racha en serif grande con subrayado marcador, stats en rejilla, lista con
  lomo verde. Sin cambios de lógica ni de datos (mismos ids).
- v1.4 funcionando: registrar y eliminar sesiones, racha actual, mejor racha,
  total semanal con rango, días distintos estudiados este mes y lista.
- Datos en localStorage, sin cambios de formato.
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Mejor racha y total semanal recalculados desde las sesiones (no guardados):
  evita migraciones y pérdida de datos.
- Semana = lunes a domingo: estándar en España; rango visible junto al total.
- Días del mes = mes natural en fecha local, con `Set` de fechas y recalculado:
  simple, sin migraciones y coherente con mejor racha/semana.
- Borrado con `confirm()` nativo y repintado total: simple y coherente con el código.
## Aprendizajes y errores a evitar
- Comparar fechas `AAAA-MM-DD` como texto solo vale para ordenar/filtrar; para saber
si son consecutivas hay que usar `moverDias()`.
- Verificado en Chrome (file://, 2026-10-04): 3 sesiones seguidas -> racha 3,
  mejor 3, semana 75 min, sin errores en consola. Captura en `captura-movil-375.png`.
## Próximos pasos
- Cambio 001a aplicado (8 semanas naturales): spec, plan y tareas 001 actualizados; `node --test` 14/14 en verde.
- T1 de spec 002 marcada (RF-1, RF-3, RF-4, RF-5). T2 marcada (RF-6). T3 marcada (RF-7, RF-11). T4 marcada (RF-1, RF-3, RNF-2). T5 marcada (RF-1, RF-2, RF-11, RNF-1). T6 marcada (RF-3, RF-8, RF-9, RF-10, RF-11, RNF-1, RNF-3): lectura sin guardar, rechazo con motivo, confirmación nativa, fusión y repintado; verificado en Chrome (válido, cancelar, corrupto, roto). Ajuste: id numérico aceptado (compatibilidad con guardados previos). `node --test` 25/25. T7 marcada: validación manual Chrome (file://) 2026-10-06 — exportar con/sin sesiones, duplicados 1+1, corrupto, cancelar, consola limpia, 375 px sin desplazamiento. Spec 002 completa. No empezada.

