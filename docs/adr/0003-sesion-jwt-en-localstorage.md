# ADR 0003 — Sesión: JWT en localStorage

- **Estado:** Aceptada
- **Fecha:** 2026-09-23
- **Contexto:** Grupo 5 (Reclamos y Participación Ciudadana) · Entrega 1

## Contexto

El backend (y a futuro el Login Federado del Grupo 2) emite un JWT que el
frontend tiene que guardar y mandar en `Authorization: Bearer <token>` en cada
pedido. El token hoy dura 8 horas (`expires_in`). Hace falta decidir **dónde**
se guarda para que sobreviva a un F5 y **cómo** se maneja su vencimiento.

El frontend no controla el backend de auth (lo provee otro grupo), así que no
podemos asumir que vaya a setear cookies `httpOnly` con la config de CORS/SameSite
que eso necesita.

## Opciones consideradas

### A. Sólo en memoria (variable de módulo)

- ✅ No queda expuesto a XSS ni persiste en disco.
- ❌ Se pierde en cada recarga: el vecino tendría que re-loguearse en cada F5.

### B. Cookie `httpOnly` seteada por el backend

- ✅ Inaccesible desde JS: es la defensa fuerte contra el robo por XSS.
- ❌ La tiene que setear y renovar **el backend de auth**, que es de otro grupo;
  requiere coordinar CORS, `SameSite` y dominio. Fuera de nuestro control para
  la Entrega 1.
- ❌ Complica el envío del token a nuestra API si los dominios no coinciden.

### C. `localStorage` _(elegida)_

- ✅ Sobrevive al F5 y es trivial de leer para poner el header.
- ✅ No depende de nada del backend de auth: lo maneja el frontend solo.
- ❌ Accesible desde JS: si hubiera un XSS, el token es robable.

## Decisión

Guardamos la sesión (usuario + token) en **`localStorage`** bajo
`citypass.auth.sesion`. El `AuthContext`:

1. Restaura la sesión en el inicializador del estado y **siembra el token en el
   cliente HTTP ahí mismo**, antes del primer render de los hijos, para que el
   primer pedido tras un F5 ya lleve el header (ver el fix del token faltante).
2. Ante un **401 con sesión activa** (token vencido/revocado) limpia la sesión,
   marca el vencimiento y redirige al login con el aviso "Tu sesión expiró". Un
   401 del **login** no dispara esto: es contraseña incorrecta.

## Consecuencias

**Positivas.** La sesión persiste entre recargas sin depender del backend de
auth. El manejo de 401 evita el estado "logueado pero todo roto".

**Negativas.** El token es accesible por JS: un XSS podría robarlo. Se acepta
el riesgo mientras dure el login de desarrollo, mitigado por el TTL de 8 h de
los tokens y porque no manejamos datos sensibles de pago.

**A revisar.** Cuando entre el Login Federado del Grupo 2, evaluar mover a
cookie `httpOnly` si ese backend puede setearla, y retirar las credenciales de
demo (`src/auth/users.ts`).
