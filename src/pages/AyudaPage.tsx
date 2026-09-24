import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Command,
  Hammer,
  Inbox,
  LifeBuoy,
  MapPin,
  Plus,
  ScanSearch,
  Sparkles,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { esStaff, Rol } from "@/auth/roles";
import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import {
  CATEGORIA_LABEL,
  ESTADO_HEX,
  ESTADO_LABEL,
  ESTADO_ON_COLOR,
  PRIORIDAD_LABEL,
} from "@/domain/labels";
import { CategoriaIcono, EstadoBadge, PrioridadBadge } from "@/features/reclamos/EstadoBadges";
import { CentroAyudaOperador } from "@/features/CentroAyudaOperador";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SIGNIFICADO_ESTADO: Record<EstadoReclamo, string> = {
  RECIBIDO: "El reclamo llego y espera ser revisado.",
  EN_REVISION: "Un operador esta evaluando el caso.",
  ASIGNADO: "Se derivo a un agente o area responsable.",
  EN_PROCESO: "Se esta trabajando en la solucion.",
  RESUELTO: "El problema se soluciono; queda un plazo para confirmarlo.",
  RECHAZADO: "No corresponde tramitarlo. No admite cambios.",
  CERRADO: "Finalizado. No admite cambios.",
};

const SIGNIFICADO_PRIORIDAD: Record<PrioridadReclamo, string> = {
  BAJA: "Molestia sin riesgo, se atiende en orden.",
  MEDIA: "Afecta la vida diaria del barrio.",
  ALTA: "Requiere atencion pronta.",
  CRITICA: "Riesgo para las personas: se atiende primero.",
};

/** The happy-path lifecycle, in order, each step with a representative icon. */
const FLUJO: { estado: EstadoReclamo; icono: LucideIcon }[] = [
  { estado: EstadoReclamo.RECIBIDO, icono: Inbox },
  { estado: EstadoReclamo.EN_REVISION, icono: ScanSearch },
  { estado: EstadoReclamo.ASIGNADO, icono: UserCheck },
  { estado: EstadoReclamo.EN_PROCESO, icono: Hammer },
  { estado: EstadoReclamo.RESUELTO, icono: CheckCircle2 },
];

/** Numbered how-to steps, tailored to the viewer's role. */
const PASOS_CIUDADANO = [
  'Toca "Nuevo reclamo" en el menu o en Mis reclamos.',
  "Escribi un titulo claro y una descripcion con los detalles.",
  "Marca la ubicacion en el mapa y elegi una categoria (opcional).",
  "Envialo y segui su estado desde Mis reclamos.",
];
const PASOS_STAFF = [
  "Revisa los reclamos entrantes en la Bandeja.",
  "Confirma o corregi la categoria y la prioridad.",
  "Asigna un area responsable y actualiza el estado.",
  "Toda accion queda registrada en la trazabilidad del reclamo.",
];

/** Frequently asked questions. Some entries only apply to staff. */
const FAQ: { q: string; a: string; soloStaff?: boolean }[] = [
  {
    q: "¿Puedo ver los reclamos de otros vecinos?",
    a: "Si. En “Reclamos de la ciudad” y en el “Mapa” aparecen todos los reclamos publicos, sin datos personales de quien los creo.",
  },
  {
    q: "¿Que significa adherir o “A mi tambien me pasa”?",
    a: "Es sumar tu apoyo a un reclamo que ya existe para darle mas peso. No podes adherir a un reclamo propio.",
  },
  {
    q: "¿Quien decide la categoria y la prioridad?",
    a: "Si no las elegis, un clasificador automatico las sugiere a partir del texto, y un operador puede corregirlas despues.",
  },
  {
    q: "¿Puedo editar mi nombre o correo?",
    a: "No. Tu identidad viene del login federado del Grupo 2; el modulo de Reclamos solo la muestra.",
  },
  {
    q: "¿Como busco algo rapido?",
    a: "Usa la lupa del encabezado o el atajo Ctrl/Cmd + K para abrir el buscador y saltar a un reclamo o a cualquier pagina.",
  },
  {
    q: "¿Donde gestiono los reclamos entrantes?",
    a: "En la Bandeja. Desde el detalle de cada reclamo cambias su estado y corregis su clasificacion.",
    soloStaff: true,
  },
];

/** One step chip in the lifecycle strip, solid in the state's own color with
 * white text, so it reads exactly like the real state badges. */
function PasoFlujo({ estado, icono: Icono }: { estado: EstadoReclamo; icono: LucideIcon }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
      style={{
        backgroundColor: ESTADO_HEX[estado],
        color: ESTADO_ON_COLOR[estado],
        textShadow: "var(--status-shadow)",
      }}
    >
      <Icono className="size-4 shrink-0" />
      {ESTADO_LABEL[estado]}
    </div>
  );
}

/** Accessible FAQ row as a controlled accordion, so open and close both
 * animate (native `details` snaps shut with no transition). */
function Pregunta({ q, a }: { q: string; a: string }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="rounded-xl border px-4 transition-colors hover:bg-muted/40">
      <button
        type="button"
        onClick={() => setAbierto((o) => !o)}
        aria-expanded={abierto}
        className="flex w-full cursor-pointer items-center justify-between gap-3 py-3 text-left text-sm font-medium"
      >
        {q}
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-300 ${abierto ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${abierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="pb-3 text-sm text-muted-foreground">{a}</p>
        </div>
      </div>
    </div>
  );
}

/** In-app guide: how a claim flows, what each label means, and common questions. */
export function AyudaPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const staff = usuario ? esStaff(usuario.rol) : false;

  if (staff) return <CentroAyudaOperador esAdmin={usuario?.rol === Rol.ADMIN} />;

  const estados = Object.keys(ESTADO_LABEL) as EstadoReclamo[];
  const prioridades = Object.keys(PRIORIDAD_LABEL) as PrioridadReclamo[];
  const categorias = Object.keys(CATEGORIA_LABEL) as CategoriaReclamo[];
  const pasos = staff ? PASOS_STAFF : PASOS_CIUDADANO;
  const faq = FAQ.filter((f) => !f.soloStaff || staff);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        titulo="Ayuda"
        descripcion="Como funciona un reclamo, que significa cada etiqueta y las dudas mas comunes."
      />

      {/* Quick start, tailored to the role. */}
      <Card data-tour="ayuda-secciones">
        <CardHeader>
          <CardTitle className="text-base">
            {staff ? "Como gestionar un reclamo" : "Como cargar un reclamo"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <ol className="grid gap-3 sm:grid-cols-2">
            {pasos.map((paso, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary tabular-nums">
                  {i + 1}
                </span>
                <p className="pt-0.5 text-sm text-muted-foreground">{paso}</p>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
            {staff ? (
              <Button className="w-full gap-2 sm:w-auto" onClick={() => navigate("/backoffice")}>
                <Inbox className="size-4" />
                Ir a la bandeja
              </Button>
            ) : (
              <Button
                className="w-full gap-2 sm:w-auto"
                onClick={() => navigate("/reclamos/nuevo")}
              >
                <Plus className="size-4" />
                Cargar un reclamo
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full gap-2 sm:w-auto"
              onClick={() => navigate("/mapa")}
            >
              <MapPin className="size-4" />
              Ver el mapa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle strip. */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">El recorrido de un reclamo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {FLUJO.map((paso, i) => (
              <Fragment key={paso.estado}>
                <PasoFlujo estado={paso.estado} icono={paso.icono} />
                {i < FLUJO.length - 1 && (
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground/60" />
                )}
              </Fragment>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Ese es el camino habitual. En cualquier momento un reclamo puede terminar{" "}
            <span className="font-medium text-foreground">Rechazado</span> (no corresponde) o{" "}
            <span className="font-medium text-foreground">Cerrado</span> (finalizado): ninguno de
            los dos admite mas cambios.
          </p>
        </CardContent>
      </Card>

      {/* States + priorities, matched to the same height. */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estados</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-center gap-1">
            {estados.map((e) => (
              <div
                key={e}
                className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60"
              >
                <div className="w-22 shrink-0 pt-0.5">
                  <EstadoBadge estado={e} className="w-full justify-center px-1.5" />
                </div>
                <p className="text-sm text-muted-foreground">{SIGNIFICADO_ESTADO[e]}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prioridades</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-center gap-1">
            {prioridades.map((p) => (
              <div
                key={p}
                className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60"
              >
                <div className="w-24 shrink-0 pt-0.5">
                  <PrioridadBadge prioridad={p} />
                </div>
                <p className="text-sm text-muted-foreground">{SIGNIFICADO_PRIORIDAD[p]}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Categories. */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categorias</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {categorias.map((c) => (
              <div
                key={c}
                className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm font-medium ring-1 ring-transparent transition-colors hover:ring-border"
              >
                <CategoriaIcono categoria={c} className="size-4 shrink-0" />
                <span className="truncate">{CATEGORIA_LABEL[c]}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Si no elegis una categoria al cargar el reclamo, la sugiere el clasificador automatico y
            un operador puede corregirla.
          </p>
        </CardContent>
      </Card>

      {/* Two concept cards: adhesions and automatic classification. */}
      <div className="grid items-start gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-5 text-primary" />
              Adhesiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Con <span className="font-medium text-foreground">"A mi tambien me pasa"</span> sumas
              tu apoyo a un reclamo que ya existe, en vez de crear uno repetido. Cuantas mas
              adhesiones, mas peso tiene el pedido. No podes adherir a un reclamo propio.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-5 text-primary" />
              Clasificacion automatica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Al cargar un reclamo, un clasificador propone la categoria y la prioridad segun el
              texto. Un operador puede ajustarlas, y el reclamo muestra el nivel de confianza de esa
              sugerencia.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ. */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preguntas frecuentes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {faq.map((f) => (
            <Pregunta key={f.q} q={f.q} a={f.a} />
          ))}
        </CardContent>
      </Card>

      {/* Shortcuts + support. */}
      <Card className="bg-muted/30">
        <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LifeBuoy className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Un atajo util</p>
              <p className="text-sm text-muted-foreground">
                Abri el buscador desde cualquier pantalla con la lupa del encabezado o con{" "}
                <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-xs">
                  Ctrl
                </kbd>{" "}
                /{" "}
                <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-xs">
                  Cmd
                </kbd>{" "}
                +{" "}
                <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-xs">
                  K
                </kbd>
                .
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/feed")}>
            <Command className="size-4" />
            Explorar reclamos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
