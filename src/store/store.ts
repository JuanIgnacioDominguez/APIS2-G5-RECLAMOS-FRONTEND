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
  return store;
}

export const store = crearStore();
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
