import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import "@/index.css";
import "@/theme/global.css";

import { aplicarTemaInicial } from "@/lib/tema";
import { AuthProvider } from "@/auth/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { store } from "@/store/store";
import { App } from "@/App";

aplicarTemaInicial();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <TooltipProvider delayDuration={200}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
        <Toaster richColors closeButton expand position="top-right" />
      </TooltipProvider>
    </Provider>
  </StrictMode>,
);
