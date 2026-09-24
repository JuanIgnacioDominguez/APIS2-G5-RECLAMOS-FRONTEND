/**
 * Thin fetch wrapper for the Reclamos API.
 *
 * The backend returns RFC 7807 problem+json on errors; we surface `title`/`detail`
 * as the message so the UI can show something meaningful instead of "500".
 */

import { CODIGO_RED, mensajeDeError } from "@/lib/erroresApi";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** In-memory bearer token, set after login (Group 2 issues the JWT). */
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

/**
 * Called when an authenticated request is rejected with 401 (typically an
 * expired JWT). The auth layer registers this to drop the session so the guard
 * sends the user back to login instead of leaving them "logged in" but broken.
 */
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function parseError(response: Response): Promise<ApiError> {
  let message = response.statusText || `HTTP ${response.status}`;
  let code: string | undefined;
  try {
    const data = await response.json();
    message = data.detail ?? data.title ?? message;
    code = data.code;
  } catch {
    // body was not JSON; keep the status-based message
  }
  // Prefer a stable, user-facing message keyed off the code/status over the raw
  // backend text. Falls back to the raw message when there is no known mapping.
  const amigable = mensajeDeError({ status: response.status, code });
  return new ApiError(response.status, amigable ?? message, code);
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, signal } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const teniaToken = authToken !== null;
  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    // fetch only rejects on network failure (offline, DNS, CORS) — never on an
    // HTTP status. Surface it as a typed error so the UI shows a "no connection"
    // state with retry instead of a raw TypeError. Aborts are re-thrown as-is.
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(0, mensajeDeError({ code: CODIGO_RED })!, CODIGO_RED);
  }

  if (!response.ok) {
    // An authenticated request that comes back 401 means the session expired or
    // was revoked: drop it so the guard redirects to login. A 401 on the login
    // call itself (no token yet) is just wrong credentials and is left alone.
    if (response.status === 401 && teniaToken) onUnauthorized?.();
    throw await parseError(response);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
