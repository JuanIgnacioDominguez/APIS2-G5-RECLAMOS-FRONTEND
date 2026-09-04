import "@testing-library/jest-dom/vitest";
import { createElement, type ReactNode } from "react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Leaflet needs a real DOM (element sizing, canvas) that jsdom lacks, so we
// stub react-leaflet to plain containers. The map's logic is tested apart.
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children?: ReactNode }) =>
    createElement("div", { "data-testid": "mapa" }, children),
  TileLayer: () => null,
  CircleMarker: ({ children }: { children?: ReactNode }) => createElement("div", null, children),
  Popup: ({ children }: { children?: ReactNode }) => createElement("div", null, children),
  useMap: () => ({
    setView: vi.fn(),
    getZoom: () => 13,
    invalidateSize: vi.fn(),
    fitBounds: vi.fn(),
    getContainer: () => document.createElement("div"),
  }),
  useMapEvents: () => null,
}));

// jsdom does not implement matchMedia; Mantine reads it on mount.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// jsdom lacks ResizeObserver, used by some Mantine components.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;

// Silence scrollIntoView calls from Mantine Select in jsdom.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

afterEach(() => {
  cleanup();
  localStorage.clear();
});
