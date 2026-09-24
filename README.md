# APIS2-G5-RECLAMOS-FRONTEND

Frontend de **CityPass+** para el modulo de **Reclamos y Participacion Ciudadana**
(Grupo 5). Materia Desarrollo de Aplicaciones 2, UADE — 2026 2C.

Interfaz web para que un ciudadano cree, siga y gestione sus reclamos urbanos.
Consume la API REST del backend del grupo (`APIS2-G5-RECLAMOS-BACKEND`).

![cobertura](https://img.shields.io/badge/cobertura-%3E90%25-brightgreen)
![gate](https://img.shields.io/badge/gate%20de%20cobertura-60%25-blue)

## Stack

React 18 + TypeScript · Vite 5 · shadcn/ui (Radix + Tailwind) · React Router 6 ·
Leaflet + OpenStreetMap · Vitest.

Las decisiones de arquitectura estan documentadas en [`docs/adr/`](docs/adr/).

## Puesta en marcha

```bash
npm install
cp .env.example .env        # apunta VITE_API_BASE_URL al backend
npm run dev                 # http://localhost:5173
```

## Scripts

| Comando                | Que hace                                        |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo con HMR                  |
| `npm run build`        | Typecheck (`tsc`) + bundle de produccion        |
| `npm run preview`      | Sirve el build de produccion                    |
| `npm run lint`         | ESLint                                          |
| `npm run format`       | Prettier (escribe cambios)                      |
| `npm run format:check` | Prettier en modo verificacion (igual que en CI) |
| `npm test`             | Corre la suite de Vitest                        |
| `npm run test:cov`     | Tests + reporte de cobertura (gate **60%**)     |

## Cobertura de tests

La cobertura minima es **60%**, el umbral que pide la rubrica de la catedra. El
gate esta configurado en `vite.config.ts` (`test.coverage.thresholds`) y lo
aplica Vitest: si la cobertura baja del 60%, `npm run test:cov` falla y el CI
queda en rojo. Es el mismo enfoque que usa el backend con `pytest-cov`.

```bash
npm run test:cov
# genera coverage/ (HTML navegable en coverage/index.html) y coverage/lcov.info
```

## Integracion continua

`.github/workflows/ci.yml` corre en cada push y PR a `main` y `develop`:

1. **Lint + tests** — ESLint, Prettier `--check`, y `test:cov` con el gate de 60%.
2. **Build** — `npm run build` (typecheck + bundle) para asegurar que compila.
3. **Docker image** — construye la imagen de produccion.
4. **SonarCloud** — quality gate (bugs, vulnerabilidades, code smells + cobertura).

### Configurar SonarCloud

El job de SonarCloud solo corre cuando existe el secret `SONAR_TOKEN` (hasta
entonces se saltea y el CI queda verde). Para activarlo:

1. Importar el repo en [sonarcloud.io](https://sonarcloud.io) (organizacion +
   proyecto). Verificar que `sonar.projectKey` y `sonar.organization` en
   `sonar-project.properties` coincidan con los que asigna SonarCloud.
2. Generar un token en SonarCloud y cargarlo como secret del repo en
   GitHub → Settings → Secrets and variables → Actions → `SONAR_TOKEN`.
3. Opcional: en la proteccion de `main`/`develop`, marcar el check
   **SonarCloud Code Analysis** como requerido para bloquear el merge si el
   quality gate falla.

## Estructura

```
src/
├── api/         Cliente HTTP y endpoints tipados
├── domain/      Enums, maquina de estados y labels (espejo del backend)
├── features/    Componentes por feature (reclamos/)
├── pages/       Pantallas ruteadas
├── components/  Layout y UI compartida
├── hooks/       Hooks propios
├── lib/         Utilidades puras
└── theme/       Estilos globales y paleta CityPass+ (tokens de Tailwind)
```

Convenciones detalladas del repo en [`CLAUDE.md`](CLAUDE.md).

## Estado

- **Autenticacion:** login contra el endpoint de desarrollo del backend
  (JWT real). Manejo de sesion vencida (401) y de token al recargar. El Login
  Federado del Grupo 2 se integra mas adelante; el boton de Google es su
  placeholder.
- **Reclamos:** listado con filtros y KPIs, alta con clasificacion sugerida y
  mapa, detalle con trazabilidad, comentarios y adhesiones.
- **Feed publico** de la ciudad con filtros y orden (US-06/US-07).
- **Backoffice:** bandeja del operador, gestion de estado y reclasificacion.
- **Mapa publico** de reclamos geolocalizados (US-11) y **panel de metricas**
  para admin.
- **Calidad:** suite de Vitest con gate de cobertura (60%), ESLint + Prettier,
  build de produccion, imagen Docker y SonarCloud en el CI.
- **UI:** migrada de Mantine a shadcn/ui, con paleta Azul Urbano y modo oscuro
  opcional.
