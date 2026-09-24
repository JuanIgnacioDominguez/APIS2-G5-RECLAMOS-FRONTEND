import { useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { ApiError } from "@/api/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/Logo";
import { LoginAside } from "@/components/LoginAside";
import { SESION_VENCIDA_KEY, useAuth } from "@/auth/AuthContext";
import { ROL_LABEL } from "@/auth/roles";
import { CREDENCIALES_DEMO, type CredencialDemo } from "@/auth/users";
import { homePorRol } from "@/config/navigation";

function GoogleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/**
 * Login page. Authenticates against the backend dev endpoint
 * (`POST /auth/dev/login`), which returns a real JWT with hardcoded users until
 * Group 2's federated login is integrated. The Google button is a placeholder
 * for that future flow.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);
  const [credencialesIncorrectas, setCredencialesIncorrectas] = useState(false);
  const [sesionVencida, setSesionVencida] = useState(false);

  // Show a notice when we landed here because a 401 expired the session.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESION_VENCIDA_KEY)) {
        setSesionVencida(true);
        sessionStorage.removeItem(SESION_VENCIDA_KEY);
      }
    } catch {
      // storage unavailable: no notice, not critical
    }
  }, []);

  async function ingresar(usuarioVal: string, passwordVal: string) {
    setCargando(true);
    setErrorLogin(null);
    setCredencialesIncorrectas(false);
    setSesionVencida(false);
    try {
      const u = await login(usuarioVal, passwordVal);
      navigate(homePorRol(u.rol));
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "No se pudo iniciar sesion";
      setErrorLogin(mensaje);
      if (err instanceof ApiError && err.status === 401) {
        setCredencialesIncorrectas(true);
        toast.error("Datos incorrectos", {
          description: "Verificá tu usuario y contraseña e intentá nuevamente.",
        });
      }
    } finally {
      setCargando(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    ingresar(usuario.trim(), password);
  }

  function entrarDemo(c: CredencialDemo) {
    ingresar(c.usuario, c.password);
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
              <p className="text-2xl font-bold">Ingresa a tu cuenta</p>
              <p className="text-sm text-muted-foreground">
                Usa tu cuenta ciudadana para continuar.
              </p>
            </div>

            {sesionVencida && !errorLogin && (
              <Alert>
                <Info className="size-4" />
                <AlertDescription>Tu sesion expiro, volve a ingresar.</AlertDescription>
              </Alert>
            )}

            {errorLogin && (
              <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <AlertDescription>{errorLogin}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} noValidate>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="usuario">
                    Usuario <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="usuario"
                    placeholder="vecino1"
                    autoComplete="username"
                    aria-invalid={credencialesIncorrectas}
                    value={usuario}
                    onChange={(e) => {
                      setUsuario(e.target.value);
                      setCredencialesIncorrectas(false);
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
                    aria-invalid={credencialesIncorrectas}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setCredencialesIncorrectas(false);
                    }}
                  />
                </div>
                <Button type="submit" disabled={cargando} className="mt-1 w-full">
                  {cargando && <Loader2 className="size-4 animate-spin" />}
                  Ingresar
                </Button>
              </div>
            </form>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">o</span>
              <Separator className="flex-1" />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                toast("Proximamente", {
                  description: "Se habilita al integrar el Login Federado (Grupo 2).",
                })
              }
            >
              <GoogleIcon />
              Continuar con Google
            </Button>

            <div className="flex flex-col gap-1.5">
              <p className="text-center text-xs text-muted-foreground">
                Acceso rapido (demo, hasta integrar el Login Federado del Grupo 2)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {CREDENCIALES_DEMO.map((c) => (
                  <Button
                    key={c.usuario}
                    variant="secondary"
                    size="sm"
                    disabled={cargando}
                    onClick={() => entrarDemo(c)}
                  >
                    {ROL_LABEL[c.rol]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden flex-1 md:block">
        <LoginAside />
      </div>
    </div>
  );
}
