// Short polling so a change that happens elsewhere (for example a weather alert
// that arrives through the event bus) shows up without a manual reload.
export const REFRESCO_PANTALLA_MS = 8_000;

// `skipPollingIfUnfocused` stays false on purpose: when the screen is shared next
// to a terminal or a slide deck the browser loses focus, and RTK Query would
// pause the refresh exactly when someone is watching it.
export const OPCIONES_REFRESCO = {
  pollingInterval: REFRESCO_PANTALLA_MS,
  skipPollingIfUnfocused: false,
} as const;
