import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import "@/index.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@/theme/global.css";

import { theme } from "@/theme/theme";
import { aplicarTemaInicial } from "@/lib/tema";
import { AuthProvider } from "@/auth/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { App } from "@/App";

aplicarTemaInicial();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <TooltipProvider delayDuration={200}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </MantineProvider>
  </StrictMode>,
);
