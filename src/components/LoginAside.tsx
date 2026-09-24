import { MapPin } from "lucide-react";

import { CitySkyline } from "@/components/CitySkyline";
import "./LoginAside.css";

/**
 * Decorative animated panel for the right side of the login. Purely cosmetic;
 * hidden from assistive tech and motion-safe (respects prefers-reduced-motion).
 */
export function LoginAside() {
  return (
    <div className="loginAside flex h-full flex-col justify-between p-8" aria-hidden="true">
      <div className="loginAside__glow loginAside__glow--a" />
      <div className="loginAside__glow loginAside__glow--b" />

      <MapPin className="loginAside__pin loginAside__pin--1" size={28} />
      <MapPin className="loginAside__pin loginAside__pin--2" size={36} />
      <MapPin className="loginAside__pin loginAside__pin--3" size={24} />

      <div />

      <div className="relative z-10 flex flex-col gap-2">
        <h2 className="max-w-[360px] text-2xl font-semibold text-white">
          Todos los reclamos de tu ciudad, en un solo lugar.
        </h2>
        <p className="max-w-[340px] text-gray-300">
          Crea, segui y gestiona tus reclamos vecinales de forma agil y transparente.
        </p>
      </div>

      <div className="relative z-10 opacity-90">
        <CitySkyline />
      </div>
    </div>
  );
}
