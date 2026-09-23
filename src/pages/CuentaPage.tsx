import { Mail, ShieldCheck, User } from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { ROL_LABEL } from "@/auth/roles";
import { PageHeader } from "@/components/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Read-only profile of the logged-in user (identity comes from the JWT). */
export function CuentaPage() {
  const { usuario } = useAuth();
  if (!usuario) return null;

  const filas = [
    { icono: User, etiqueta: "Nombre", valor: usuario.nombre },
    { icono: Mail, etiqueta: "Correo", valor: usuario.email },
    { icono: ShieldCheck, etiqueta: "Rol", valor: ROL_LABEL[usuario.rol] },
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        icono={User}
        titulo="Mi cuenta"
        descripcion="Tus datos dentro del modulo de Reclamos."
      />
      <Card>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                {iniciales(usuario.nombre)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{usuario.nombre}</p>
              <p className="text-sm text-muted-foreground">{ROL_LABEL[usuario.rol]}</p>
            </div>
          </div>
          <dl className="divide-y">
            {filas.map(({ icono: Icono, etiqueta, valor }) => (
              <div key={etiqueta} className="flex items-center gap-3 py-3">
                <Icono className="size-5 text-primary" />
                <dt className="w-24 text-sm text-muted-foreground">{etiqueta}</dt>
                <dd className="text-sm font-medium">{valor}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
