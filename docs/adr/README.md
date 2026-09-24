# Architecture Decision Records (frontend)

Registro de las decisiones de arquitectura del frontend de Reclamos (Grupo 5,
CityPass+). Cada ADR documenta una decisión con las opciones que se evaluaron,
por qué se eligió una y qué consecuencias trae, en el mismo formato que los del
backend (`APIS2-G5-RECLAMOS-BACKEND/docs/adr/`):

**Contexto → Opciones (✅/❌) → Decisión → Consecuencias.**

| #    | Decisión                                        | Estado   |
| ---- | ----------------------------------------------- | -------- |
| 0001 | Stack: React + Vite + TypeScript, UI en shadcn  | Aceptada |
| 0002 | Mapa y geocodificación: Leaflet + OpenStreetMap | Aceptada |
| 0003 | Sesión: JWT en localStorage                     | Aceptada |

Una decisión no se edita cuando cambia: se agrega un ADR nuevo que la supersede
y se marca la vieja como _Reemplazada por ADR N_.
