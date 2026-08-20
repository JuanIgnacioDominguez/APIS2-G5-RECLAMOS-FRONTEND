# CLAUDE.md — Convenciones del repo (frontend)

Guia para cualquiera (persona o agente) que toque este codigo.
**Modulo:** Reclamos y Participacion Ciudadana — Grupo 5, CityPass+ (UADE, DA2 2026 2C).
Este es el **frontend**. El backend (FastAPI) vive en `APIS2-G5-RECLAMOS-BACKEND`.

---

## 1. Stack

| Capa          | Eleccion                                             |
| ------------- | ---------------------------------------------------- |
| Framework     | React 18 + TypeScript 5                              |
| Build / dev   | Vite 5                                               |
| UI            | Mantine 7 (`@mantine/core`, `form`, `notifications`) |
| Iconos        | `@tabler/icons-react`                                |
| Ruteo         | React Router 6                                       |
| Tests         | Vitest + Testing Library, entorno jsdom              |
| Cobertura     | `@vitest/coverage-v8`, gate 60% (rubrica)            |
| Lint / format | ESLint (flat config) + Prettier                      |
| Identidad     | JWT emitido por el Grupo 2 (solo lo consumimos)      |

No agregar dependencias sin justificarlo en el PR. Preferir lo que ya trae
Mantine antes de sumar otra libreria de UI.

---

## 2. Idioma

La regla que mas se olvida, asi que va primero:

| Que                                                      | Idioma      |
| -------------------------------------------------------- | ----------- |
| Comentarios y JSDoc                                      | **Ingles**  |
| Identificadores del dominio (`reclamo`, `EstadoReclamo`) | **Espanol** |
| Texto que ve el usuario (labels, botones, mensajes)      | **Espanol** |
| Documentacion del repo (README, este archivo)            | **Espanol** |
| Mensajes de commit y PR                                  | **Espanol** |

El dominio es municipal argentino: traducir `reclamo` a `claim` rompe la
trazabilidad con el enunciado, la rubrica y el backend. Los comentarios en
ingles son la convencion de la catedra para el codigo.

Sin tildes ni `n` con virgulilla en identificadores ni en comentarios de
codigo (evita problemas de encoding entre Windows y Linux). En la
documentacion `.md` y en el texto de UI si.

---

## 3. Estructura y reglas de capas

```
src/
├── api/         Cliente HTTP y endpoints tipados del backend
├── domain/      Enums, maquina de estados, labels (espejo del backend)
├── features/    Componentes por feature (reclamos/)
├── pages/       Pantallas ruteadas
├── components/  UI compartida (layout)
├── hooks/       Hooks propios (useAsync)
├── lib/         Utilidades puras (formato de fechas, etc.)
├── theme/       Tema Mantine (paleta y tipografias del design system)
├── test/        Setup de Vitest y helpers de render
├── App.tsx      Definicion de rutas
└── main.tsx     Punto de entrada (providers)
```

**Las dependencias apuntan hacia adentro.** Concretamente:

- `domain/` no importa nada del proyecto: son valores y reglas puras. Es el
  espejo de `app/domain/enums.py` del backend; si el backend cambia un enum o
  una transicion, se actualiza aca **y** en el backend a la vez.
- `lib/` son funciones puras, sin React ni red.
- `api/` conoce `fetch` y los tipos (`api/types.ts`, espejo de los schemas
  Pydantic). No conoce React.
- `features/` y `pages/` son la capa de UI. Consumen `api/`, `domain/`, `lib/`
  y `hooks/`. La logica no trivial se extrae a un modulo puro y testeable
  (ej: `features/reclamos/validation.ts`) en vez de quedar dentro del JSX.

### Contrato con el backend

`src/api/types.ts` y `src/domain/enums.ts` son la copia en TypeScript del
contrato que publica el backend (OpenAPI + `app/domain/enums.py`). **No** se
inventan campos ni estados: si falta algo, primero existe en el backend.

---

## 4. Convenciones de codigo

- **Tipado explicito** en todo lo exportado. Nada de `any`: usar `unknown` y
  reducir el tipo.
- **Componentes**: funcion nombrada exportada (`export function ReclamoCard`),
  archivo en PascalCase.
- **Server-state**: se resuelve con el hook `useAsync` (loading / error / data).
  No dejar promesas sin manejo de error.
- **Estilos**: utilidades y props de Mantine. Los colores salen del tema
  (`azulUrbano`, `verdeUrbano`, `ambar`, `rojoEmergencia`, `azulNoche`), nunca
  hex hardcodeado en el JSX.
- **Textos de UI en espanol**; los `aria-label` tambien.
- Linea de 100 caracteres. Lo impone Prettier, no se discute con el reviewer.
- `console.log` solo en desarrollo; sacarlo antes de commitear.

### Pantalla nueva

1. Tipos de entrada/salida en `src/api/types.ts` si tocan el backend.
2. Endpoint en `src/api/reclamos.ts`.
3. Logica pura (validaciones, transformaciones) en un modulo aparte y testeado.
4. Componente en `features/` o pagina en `pages/`, ruteada desde `App.tsx`.
5. Test que cubra el camino feliz y al menos un caso de error.

---

## 5. Tests

- Correr todo: `npm test`. Con cobertura: `npm run test:cov`.
- La cobertura minima es **60%** (rubrica) y el gate esta en `vite.config.ts`
  (`test.coverage.thresholds`). Hoy estamos por encima: no bajarlo.
- Los modulos puros (`domain/`, `lib/`, `api/`, `validation.ts`) se testean
  directo, sin render. Son los que mas cobertura aportan.
- Los componentes se renderizan con `renderWithProviders` (`src/test/render.tsx`),
  que envuelve en `MantineProvider` + router.
- La red se mockea: `vi.spyOn(reclamosApi, "...")` o `vi.stubGlobal("fetch", ...)`.
  Ningun test pega contra un backend real.
- Nombres de test en espanol y descriptivos: `test("no envia cuando el titulo es invalido")`.
  Los comentarios dentro del test, en ingles.
- Todo bug que se arregla entra con un test que falla antes del fix.

---

## 6. Git

### Branches

```
main       # estable, protegida
develop    # integracion
feature/G5D-<nro>-descripcion-corta
```

### Commits

**Todos los commits llevan el prefijo `G5D-<nro>`**, donde `<nro>` es el numero
de tarjeta del board:

```
G5D-12: agrega el formulario de alta de reclamo
G5D-13: corrige el badge de prioridad critica
```

- Mensaje en espanol, imperativo, en minuscula despues del prefijo.
- Un commit = un cambio coherente. Nada de `wip`.
- No commitear `.env`, `node_modules/`, `dist/` ni `coverage/`.

### Pull requests

A `develop`, con CI en verde (ESLint + Prettier + tests con cobertura + build).

---

## 7. Comandos

```bash
# entorno
npm install
copy .env.example .env        # Windows

# desarrollo
npm run dev                   # http://localhost:5173

# calidad
npm run lint                  # ESLint
npm run format                # Prettier (escribe)
npm run format:check          # Prettier (solo verifica, como en CI)
npm test                      # Vitest
npm run test:cov              # Vitest + cobertura (gate 60%)

# produccion
npm run build                 # typecheck + bundle
npm run preview               # sirve el build
```

---

## 8. Integracion con los otros grupos

| Grupo              | Que nos da / que le damos                                          |
| ------------------ | ------------------------------------------------------------------ |
| 2 — Login Federado | Emite los JWT. El front los guarda y los manda en `Authorization`. |
| 5 — Backend propio | Expone la API REST de reclamos que este front consume.             |

El backend es la fuente de verdad del contrato. Ante una duda de forma de datos,
se mira el OpenAPI del backend (`/docs`), no se adivina en el front.
