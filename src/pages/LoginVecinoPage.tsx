import { useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, Info, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { LoginAside } from "@/components/LoginAside";
import { SESION_VENCIDA_KEY, useAuth } from "@/auth/AuthContext";
import { homePorRol } from "@/config/navigation";

export function LoginVecinoPage() {
  const navigate = useNavigate();
  const { loginCiudadano } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credencialesInvalidas, setCredencialesInvalidas] = useState(false);
  const [sesionVencida, setSesionVencida] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESION_VENCIDA_KEY)) {
        setSesionVencida(true);
        sessionStorage.removeItem(SESION_VENCIDA_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setCredencialesInvalidas(false);
    setSesionVencida(false);
    try {
      const u = await loginCiudadano(email.trim(), password);
      navigate(homePorRol(u.rol));
    } catch (err) {
      // One generic message for any credential problem: the backend returns the
      // same response for wrong password, unknown email or disabled account.
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesion");
      setCredencialesInvalidas(true);
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
              <p className="text-2xl font-bold">Ingreso vecinos</p>
              <p className="text-sm text-muted-foreground">
                Entra con tu email para cargar y seguir tus reclamos.
              </p>
            </div>

            {sesionVencida && !error && (
              <Alert>
                <Info className="size-4" />
                <AlertDescription>Tu sesion expiro, volve a ingresar.</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} noValidate>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vecina@ejemplo.com"
                    autoComplete="email"
                    aria-invalid={credencialesInvalidas}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setCredencialesInvalidas(false);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">
                    Contrasena <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Tu contrasena"
                    autoComplete="current-password"
                    aria-invalid={credencialesInvalidas}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setCredencialesInvalidas(false);
                    }}
                  />
                </div>
                <Button type="submit" disabled={cargando} className="mt-1 w-full">
                  {cargando && <Loader2 className="size-4 animate-spin" />}
                  Ingresar
                </Button>
              </div>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              ¿No tenes cuenta?{" "}
              <Link to="/registro" className="font-medium text-foreground underline">
                Crear una
              </Link>
            </p>

            <p className="text-center text-xs text-muted-foreground">
              ¿Sos personal municipal?{" "}
              <Link to="/empleados" className="underline">
                Ingresa por aca
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
