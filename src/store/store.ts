/**
 * Application store. Today it only wires the RTK Query API slice; if we ever
 * need domain-specific slices (filters, UI state to share across pages) they
 * plug in here without touching consumers.
 */

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { citypassApi } from "./citypassApi";

export function crearStore() {
  const store = configureStore({
    reducer: {
      [citypassApi.reducerPath]: citypassApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(citypassApi.middleware),
  });
  // Enables RTK Query's `refetchOn*` options (focus, reconnect).
  setupListeners(store.dispatch);
  return store;
}

// Singleton for the app: one store per browser tab, shared by every screen.
export const store = crearStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
