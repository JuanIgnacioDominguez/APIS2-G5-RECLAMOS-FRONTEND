import { useState, type FormEvent } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "@/api/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { LoginAside } from "@/components/LoginAside";
import { useAuth } from "@/auth/AuthContext";
import { homePorRol } from "@/config/navigation";
import {
  hayErrores,
  PASSWORD_MIN,
  validarRegistro,
  type ErroresRegistro,
} from "@/features/auth/validacionRegistro";

export function RegistroPage() {
  const navigate = useNavigate();
  const { registrarCiudadano } = useAuth();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState<ErroresRegistro>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [emailDuplicado, setEmailDuplicado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral(null);
    setEmailDuplicado(false);

    const datos = { nombre: nombre.trim(), email: email.trim(), password };
    const validacion = validarRegistro(datos);
    if (hayErrores(validacion)) {
      setErrores(validacion);
      return;
    }
    setErrores({});

    setCargando(true);
    try {
      // The registration already returns the token: no need to log in afterwards.
      const u = await registrarCiudadano(datos);
      navigate(homePorRol(u.rol));
    } catch (err) {
      // Discriminate by code, not by the error text, which may change.
      if (err instanceof ApiError && err.code === "email_ya_registrado") {
        setEmailDuplicado(true);
        setErrores((prev) => ({ ...prev, email: err.message }));
      } else {
        setErrorGeneral(err instanceof Error ? err.message : "No se pudo crear la cuenta");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 bg-background">
        <div className="flex h-full items-center justify-center p-8">
          <div className="flex w-full max-w-[380px] flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <Logo size={40} />
              <p className="text-sm text-muted-foreground">Reclamos y Participacion Ciudadana</p>
            </div>

            <div>
              <p className="text-2xl font-bold">Crear cuenta</p>
              <p className="text-sm text-muted-foreground">
                Registrate como vecino para cargar reclamos.
              </p>
            </div>

            {errorGeneral && (
              <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <AlertDescription>{errorGeneral}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} noValidate>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nombre">
                    Nombre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    placeholder="Como queres que te mostremos"
                    autoComplete="name"
                    aria-invalid={Boolean(errores.nombre)}
                    aria-describedby={errores.nombre ? "nombre-error" : undefined}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                  {errores.nombre && (
                    <p id="nombre-error" className="text-xs text-destructive">
                      {errores.nombre}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vecina@ejemplo.com"
                    autoComplete="email"
                    aria-invalid={Boolean(errores.email)}
                    aria-describedby={errores.email ? "email-error" : undefined}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailDuplicado(false);
                    }}
                  />
                  {errores.email && (
                    <p id="email-error" className="text-xs text-destructive">
                      {errores.email}
                      {emailDuplicado && (
                        <>
                          {" "}
                          <Link to="/login" className="underline">
                            Inicia sesion
                          </Link>
                        </>
                      )}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">
                    Contrasena <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={`Al menos ${PASSWORD_MIN} caracteres`}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errores.password)}
                    aria-describedby={errores.password ? "password-error" : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errores.password && (
                    <p id="password-error" className="text-xs text-destructive">
                      {errores.password}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={cargando} className="mt-1 w-full">
                  {cargando && <Loader2 className="size-4 animate-spin" />}
                  Crear cuenta
                </Button>
              </div>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tenes cuenta?{" "}
              <Link to="/login" className="font-medium text-foreground underline">
                Ingresa
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden flex-1 md:block">
        <LoginAside />
      </div>
    </div>
  );
}
