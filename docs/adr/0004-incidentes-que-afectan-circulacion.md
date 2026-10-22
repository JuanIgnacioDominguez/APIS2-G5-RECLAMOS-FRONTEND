# ADR 0004 — Incidentes que afectan la circulación (CU-INT-01)

- **Estado:** Aceptada
- **Fecha:** 2026-10-22
- **Contexto:** Grupo 5 (Reclamos y Participación Ciudadana) · Caso de uso integrado CU-INT-01

## Contexto

En el caso de uso integrado "Ruta urbana inteligente con incidentes en tiempo
real", Reclamos publica `com.citypass.reclamos.ReclamoCreado` en el gateway del
Grupo 1 con el campo `afectaCirculacion`. Es `true` para las categorías
TRANSITO, BACHES y ARBOLADO: Movilidad lo usa para no recomendar estaciones
cerca y Espacios Públicos para avisar a los inscriptos de un evento cercano.

El backend define la regla en `CATEGORIAS_QUE_AFECTAN_CIRCULACION`
(`app/domain/enums.py`) y la aplica solo al traducir el evento para el
gateway: la API REST que consume este frontend no expone ese campo.

El frontend necesita mostrar la marca en el mapa, la bandeja, las tarjetas, el
detalle y el formulario de alta, para que vecinos y operadores sepan qué
reclamos se comparten con otros módulos.

## Opciones consideradas

### A. Esperar a que la API exponga `afecta_circulacion`

- ✅ Una sola fuente de verdad: el frontend no duplica la regla.
- ❌ Bloquea la integración hasta que el backend agregue el campo a cuatro
  schemas (resumen, detalle, listado y bandeja).
- ❌ El formulario de alta igual necesita la regla antes de que exista el
  reclamo, para avisar mientras el vecino elige la categoría.

### B. Inferirlo en cada componente con un `if` sobre la categoría

- ✅ Rápido.
- ❌ La regla queda repetida en cinco lugares y se desincroniza al primer
  cambio.

### C. Espejo de la regla en `domain/` _(elegida)_

- ✅ Sigue la convención del repo: `domain/` ya es el espejo de
  `app/domain/enums.py` (estados, transiciones, labels).
- ✅ Un único módulo puro (`domain/circulacion.ts`), testeado sin renderizar.
- ✅ Funciona también en el alta, antes de que el reclamo exista.
- ❌ Si el backend cambia el conjunto, hay que actualizarlo acá a la vez (igual
  que hoy con los estados).

## Decisión

`domain/enums.ts` replica `CATEGORIAS_QUE_AFECTAN_CIRCULACION` y
`domain/circulacion.ts` expone dos funciones:

- `afectaCirculacion(categoria)`: la regla tal cual la publica el backend.
- `esIncidenteActivo(reclamo)`: además exige que el reclamo siga abierto. Un
  reclamo RESUELTO, RECHAZADO o CERRADO ya no corta la circulación, así que deja
  de marcarse en el mapa, la bandeja y las tarjetas.

Toda la UI pasa por esas dos funciones; ningún componente compara categorías.

También se replica `USUARIO_SISTEMA = "sistema"`: los comentarios que el
backend agrega al escalar reclamos por un evento cultural o una emergencia se
muestran como **Automático** y no como respuesta de un operador.

## Consecuencias

**Positivas.** La integración se ve en el frontend sin esperar cambios de
contrato. La regla está en un solo lugar y con tests.

**Negativas.** Hay una regla duplicada entre backend y frontend, igual que la
máquina de estados.

**A revisar.** Si el backend expone `afecta_circulacion` en la API, se lee ese
campo y `afectaCirculacion()` queda solo para el formulario de alta.
