# ADR 0002 — Mapa y geocodificación: Leaflet + OpenStreetMap/Nominatim

- **Estado:** Aceptada
- **Fecha:** 2026-09-23
- **Contexto:** Grupo 5 (Reclamos y Participación Ciudadana) · Entrega 1

## Contexto

El alta de reclamo necesita ubicar el problema en un mapa (marcar un punto,
buscar por dirección, geolocalizar al vecino) y el módulo tiene un mapa público
(US-11) que muestra los reclamos geolocalizados. Hace falta un componente de
mapa y un servicio de geocodificación (texto ↔ coordenadas).

Es un trabajo académico sin presupuesto: no podemos depender de un servicio que
exija tarjeta o facturación.

## Opciones consideradas

### A. Google Maps + Places

- ✅ La mejor calidad de tiles y de geocodificación.
- ❌ Requiere API key con facturación asociada; el free tier pide tarjeta.
- ❌ Nos vimos el cartel "API key required" al probar proveedores pagos: no es
  viable para la demo.

### B. Mapbox / Jawg (tiles lindos con token)

- ✅ Estética muy superior a los tiles crudos de OSM.
- ⚠️ Necesitan token; el free tier alcanza pero ata la demo a una cuenta y a un
  límite de requests.
- ➡️ Lo dejamos como mejora opcional: el código lee `VITE_JAWG_ACCESS_TOKEN` y,
  si está, usa Jawg; si no, cae a OSM. Sin token, funciona igual.

### C. Leaflet + OpenStreetMap + Nominatim *(elegida)*

- ✅ Todo gratis y sin API key: tiles de OSM, geocodificación con Nominatim.
- ✅ `react-leaflet` se integra bien con React; `CircleMarker` evita el problema
  de los íconos rotos de Leaflet en bundlers.
- ❌ Nominatim es un servicio externo **sin SLA** y con **límite de ~1 req/s**;
  si lo sobrepasás, bloquea la IP.
- ❌ Los tiles crudos de OSM se ven "cargados"; los suavizamos con un filtro CSS.

## Decisión

Adoptamos **Leaflet + OpenStreetMap** para el mapa y **Nominatim** para la
geocodificación, sin API key. Un `VITE_JAWG_ACCESS_TOKEN` opcional mejora los
tiles cuando está disponible, con fallback automático a OSM.

**Mitigación del límite de Nominatim** (ver ADR de contexto y el código en
`features/mapa/geocoding.ts` + `features/reclamos/ReclamoForm.tsx`):

1. Debounce de **1000 ms** sobre el autocompletado de dirección (la política de
   Nominatim permite ~1 req/s).
2. **Cache** en memoria por consulta+centro: volver a un prefijo ya buscado no
   vuelve a pegarle al servicio.
3. No se consulta con menos de 4 caracteres.
4. `Accept-Language: es` y sesgo por proximidad (viewbox) para resultados útiles.

## Consecuencias

**Positivas.** El mapa y la búsqueda funcionan sin costo, sin tarjeta y sin
registro. La app no se rompe si no hay token de tiles premium.

**Negativas.** Dependemos de la disponibilidad de un servicio público sin SLA.
Si Nominatim está lento o caído, la búsqueda por dirección degrada (el vecino
igual puede marcar el punto a mano en el mapa, así que nunca queda bloqueado).

**A revisar.** Si el uso creciera, montar un Nominatim propio o pasar a un
proveedor con token dedicado (el fallback a Jawg ya está preparado).
