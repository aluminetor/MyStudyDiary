# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- v1.3 funcionando: registrar y eliminar sesiones, racha actual, mejor racha,
  total semanal con rango y lista.
- Datos en localStorage, sin cambios de formato.
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Mejor racha y total semanal recalculados desde las sesiones (no guardados):
  evita migraciones y pérdida de datos.
- Semana = lunes a domingo: estándar en España; rango visible junto al total.
- Borrado con `confirm()` nativo y repintado total: simple y coherente con el código.
## Aprendizajes y errores a evitar
- Comparar fechas `AAAA-MM-DD` como texto solo vale para ordenar/filtrar; para saber
si son consecutivas hay que usar `moverDias()`.
## Próximos pasos
- (vacío por ahora) 

