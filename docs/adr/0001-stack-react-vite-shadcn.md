# ADR 0001 — Stack del frontend: React + Vite + TypeScript, UI en shadcn/ui

- **Estado:** Aceptada
- **Fecha:** 2026-09-23
- **Contexto:** Grupo 5 (Reclamos y Participación Ciudadana) · Entrega 1

## Contexto

El módulo necesita una SPA que consuma la API REST del backend propio, muestre
la bandeja del operador, el alta de reclamos con mapa, el feed público, el mapa
y un panel de métricas. El equipo son 5 personas trabajando en paralelo y la
rúbrica evalúa modularidad, separación de responsabilidades y calidad de la UI.

La identidad (JWT) la emite el Grupo 2; nosotros sólo la consumimos. No hay
requerimiento de SEO ni de renderizado en servidor: es una herramienta interna
detrás de login.

## Opciones consideradas

### Framework de build

#### A. Next.js (App Router)

- ✅ Estándar de la industria, SSR/SSG, routing por archivos.
- ❌ SSR no aporta nada a una app detrás de login sin SEO; suma complejidad
  (server components, límites cliente/servidor) que no necesitamos.
- ❌ Más superficie para que 5 personas nuevas en el stack se traben.

#### B. Vite + React + React Router *(elegida)*

- ✅ Dev server instantáneo, build simple, sólo lo que usamos.
- ✅ React Router alcanza de sobra para las ~8 rutas del módulo.
- ⚠️ El ruteo y los providers se arman a mano (no hay convención de archivos).

### Librería de UI

#### C. Mantine 7 *(elegida al inicio, luego reemplazada)*

- ✅ Componentes completos con theming; arrancamos rápido en Sprint 0.
- ❌ Look "de librería" difícil de alinear con el design system del equipo.
- ❌ Menos control fino sobre estados, animaciones y modo oscuro.

#### D. shadcn/ui (Radix + Tailwind CSS) *(elegida ahora)*

- ✅ Los componentes se copian al repo (`components/ui/`): son nuestros, se
  editan sin pelear con la librería.
- ✅ Radix aporta accesibilidad (focus, teclado, ARIA) sin atarnos a un look.
- ✅ Tailwind + tokens CSS dan la paleta Azul Urbano y el modo claro/oscuro con
  control total.
- ⚠️ Hay que componer más a mano que con Mantine.

## Decisión

**Vite + React + TypeScript + React Router**, con la UI en **shadcn/ui**
(Radix + Tailwind) sobre la paleta Azul Urbano del equipo.

El proyecto arrancó con Mantine para no frenar el Sprint 0 y **migró a shadcn/ui**
cuando la UI empezó a necesitar un look propio, animaciones y modo oscuro que
Mantine no daba cómodo. La migración se hizo pantalla por pantalla para no
romper la app en el medio.

Reglas de capas (ver `CLAUDE.md`): las dependencias apuntan hacia adentro —
`domain/` puro, `lib/` funciones puras, `api/` conoce `fetch` y los tipos,
`features/` y `pages/` son la capa de UI. La lógica no trivial se extrae a
módulos puros y testeables (`validation.ts`, `feed.ts`, `filters.ts`).

## Consecuencias

**Positivas.** Build y dev rápidos. La UI quedó alineada al design system y con
modo claro/oscuro. La lógica pura se testea sin render y sostiene la cobertura
(>90% de líneas, muy por encima del 60% de la rúbrica).

**Negativas.** La migración Mantine → shadcn fue trabajo extra y por un tiempo
convivieron ambas. Componer con shadcn pide más código por pantalla.

**A revisar.** Si el módulo necesitara páginas públicas indexables, reconsiderar
Next.js sólo para esa parte.
