import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Command,
  Inbox,
  ListChecks,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Sparkles,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

import { CategoriaReclamo, EstadoReclamo, PrioridadReclamo } from "@/domain/enums";
import { CATEGORIA_LABEL, ESTADO_LABEL, PRIORIDAD_LABEL } from "@/domain/labels";
import { CategoriaIcono, EstadoBadge, PrioridadBadge } from "@/features/reclamos/EstadoBadges";
import { IlustracionAyuda } from "@/features/CentroAyudaOperador";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ClaveCategoria =
  "primeros-pasos" | "seguimiento" | "clasificacion" | "participacion" | "cuenta";

interface CategoriaCiudadano {
  id: ClaveCategoria;
  titulo: string;
  descripcion: string;
  icon: LucideIcon;
  icono: string;
}

interface PreguntaCiudadano {
  id: string;
  categoria: ClaveCategoria;
  pregunta: string;
  respuesta: string;
}

const CATEGORIAS: CategoriaCiudadano[] = [
  {
    id: "primeros-pasos",
    titulo: "Primeros pasos",
    descripcion: "Cargar y describir un reclamo",
    icon: BookOpen,
    icono: "bg-chart-1/10 text-chart-1",
  },
  {
    id: "seguimiento",
    titulo: "Seguimiento",
    descripcion: "Estados y avances del reclamo",
    icon: CheckCircle2,
    icono: "bg-chart-3/15 text-chart-3",
  },
  {
    id: "clasificacion",
    titulo: "Clasificación",
    descripcion: "Categorías, prioridad y etiquetas",
    icon: ListChecks,
    icono: "bg-chart-2/12 text-chart-2",
  },
  {
    id: "participacion",
    titulo: "Participación",
    descripcion: "Adhesiones, comentarios y comunidad",
    icon: Users,
    icono: "bg-chart-4/12 text-chart-4",
  },
  {
    id: "cuenta",
    titulo: "Tu cuenta",
    descripcion: "Perfil, busqueda y notificaciones",
    icon: UserRound,
    icono: "bg-chart-5/10 text-chart-5",
  },
];

const PASOS_CIUDADANO = [
  'Toca "Nuevo reclamo" en el menú o en Mis reclamos.',
  "Escribí un título claro y una descripción con los detalles.",
  "Marcá la ubicación en el mapa y elegí una categoría (opcional).",
  "Envialo y seguí su estado desde Mis reclamos.",
];

const SIGNIFICADO_ESTADO: Record<EstadoReclamo, string> = {
  RECIBIDO: "El reclamo llegó y espera ser revisado.",
  EN_REVISION: "Un operador está evaluando el caso.",
  ASIGNADO: "Se derivó a un agente o área responsable.",
  EN_PROCESO: "Se está trabajando en la solución.",
  RESUELTO: "El problema se solucionó; queda un plazo para confirmarlo.",
  RECHAZADO: "No corresponde tramitarlo. No admite cambios.",
  CERRADO: "Finalizado. No admite cambios.",
};

const SIGNIFICADO_PRIORIDAD: Record<PrioridadReclamo, string> = {
  BAJA: "Molestia sin riesgo, se atiende en orden.",
  MEDIA: "Afecta la vida diaria del barrio.",
  ALTA: "Requiere atención pronta.",
  CRITICA: "Riesgo para las personas: se atiende primero.",
};

const PREGUNTAS: PreguntaCiudadano[] = [
  {
    id: "crear-reclamo",
    categoria: "primeros-pasos",
    pregunta: "¿Cómo cargo un reclamo?",
    respuesta:
      "Toca Nuevo reclamo, escribí un título y una descripción, marcá la ubicación y elegí una categoría si ya la conocés. Al enviarlo, el reclamo aparece en Mis reclamos.",
  },
  {
    id: "similares",
    categoria: "primeros-pasos",
    pregunta: "¿Qué pasa si ya existe un reclamo similar?",
    respuesta:
      "El sistema puede mostrarte una coincidencia. Podés sumarte a ese reclamo con A mí también me pasa o cargar igual el tuyo si el problema es diferente.",
  },
  {
    id: "ubicacion",
    categoria: "primeros-pasos",
    pregunta: "¿Cómo ubico el problema?",
    respuesta:
      "Podés marcar un punto en el mapa, escribir la dirección o usar tu ubicación si el navegador te da permiso. También podés elegir el barrio.",
  },
  {
    id: "seguimiento-estado",
    categoria: "seguimiento",
    pregunta: "¿Cómo sé en qué estado está mi reclamo?",
    respuesta:
      "Abrí el reclamo desde Mis reclamos. En la tarjeta de Clasificación ves el estado actual y en Seguimiento podés consultar todos los cambios, con fecha y motivo.",
  },
  {
    id: "estados",
    categoria: "seguimiento",
    pregunta: "¿Qué significa cada estado?",
    respuesta:
      "Recibido: espera revisión. En revisión: está siendo evaluado. Asignado: tiene un responsable. En proceso: se está trabajando. Resuelto: tiene solución. Rechazado y Cerrado son finales.",
  },
  {
    id: "resolucion",
    categoria: "seguimiento",
    pregunta: "¿Qué pasa cuando el reclamo se resuelve?",
    respuesta:
      "El estado cambia a Resuelto y el municipio puede publicar la resolución. Revisá el detalle y los comentarios oficiales para conocer el resultado.",
  },
  {
    id: "responsable",
    categoria: "seguimiento",
    pregunta: "¿Puedo ver quién está trabajando en mi reclamo?",
    respuesta:
      "El detalle muestra el estado y el seguimiento. No se muestran datos personales del operador o de otros vecinos.",
  },
  {
    id: "categoria",
    categoria: "clasificacion",
    pregunta: "¿Qué son las categorías?",
    respuesta:
      "La categoría describe el tipo de problema, como alumbrado, baches, residuos, arbolado, agua, tránsito, seguridad u otros. Ayuda a organizar y priorizar los reclamos.",
  },
  {
    id: "prioridad",
    categoria: "clasificacion",
    pregunta: "¿Qué significan las prioridades?",
    respuesta:
      "Baja es una molestia sin riesgo, Media afecta la vida diaria, Alta requiere atención pronta y Crítica representa un riesgo para las personas.",
  },
  {
    id: "quien-clasifica",
    categoria: "clasificacion",
    pregunta: "¿Quién decide la categoría y la prioridad?",
    respuesta:
      "Podés elegirlas al cargar el reclamo. Si no lo hacés, el clasificador automático sugiere una opción y un operador puede corregirla.",
  },
  {
    id: "adhesiones",
    categoria: "participacion",
    pregunta: "¿Qué significa A mí también me pasa?",
    respuesta:
      "Sumás tu apoyo a un reclamo existente en lugar de duplicarlo. Cuantas más adhesiones tenga, más peso puede tener. No podés adherirte a tu propio reclamo.",
  },
  {
    id: "comentarios",
    categoria: "participacion",
    pregunta: "¿Puedo comentar un reclamo?",
    respuesta:
      "Sí. Podés dejar información adicional desde el detalle. Las respuestas oficiales del municipio se distinguen de los aportes de otros vecinos.",
  },
  {
    id: "ciudad",
    categoria: "participacion",
    pregunta: "¿Dónde veo los reclamos de la ciudad?",
    respuesta:
      "En Reclamos de la ciudad y en el Mapa podés explorar los reclamos públicos. Se muestran categoría, estado y barrio, sin datos personales.",
  },
  {
    id: "mapa",
    categoria: "participacion",
    pregunta: "¿Qué muestra el mapa?",
    respuesta:
      "Muestra los reclamos que tienen coordenadas. Podés filtrar por categoría y abrir el detalle de cada problema.",
  },
  {
    id: "datos",
    categoria: "participacion",
    pregunta: "¿Se muestran mis datos o los de otros vecinos?",
    respuesta:
      "No. La gestión y las vistas públicas no exponen identidades personales. Tu nombre y correo solo se usan para tu sesión.",
  },
  {
    id: "perfil",
    categoria: "cuenta",
    pregunta: "¿Puedo editar mi nombre o correo?",
    respuesta:
      "No desde este módulo. Tu identidad viene del login federado y acá solo se muestra para que sepas qué sesión estás usando.",
  },
  {
    id: "notificaciones",
    categoria: "cuenta",
    pregunta: "¿Dónde veo las notificaciones?",
    respuesta:
      "La campana del encabezado muestra un punto rojo cuando hay avisos sin leer. Al entrar a Notificaciones podés ver los cambios de estado y comentarios relacionados.",
  },
  {
    id: "busqueda",
    categoria: "cuenta",
    pregunta: "¿Cómo busco algo rápido?",
    respuesta:
      "Usá la lupa del encabezado o Ctrl/Cmd + K para abrir el buscador global y saltar a un reclamo o a cualquier página.",
  },
];

function normalizar(texto: string): string {
  return texto
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function Pregunta({ pregunta }: { pregunta: PreguntaCiudadano }) {
  const [abierta, setAbierta] = useState(false);

  return (
    <div
      id={pregunta.id}
      className="scroll-mt-24 rounded-xl border bg-card transition-colors hover:bg-muted/30"
    >
      <button
        type="button"
        onClick={() => setAbierta((valor) => !valor)}
        aria-expanded={abierta}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-medium sm:px-5"
      >
        {pregunta.pregunta}
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            abierta ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          abierta ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-5">
            {pregunta.respuesta}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReferenciaEstados() {
  const estados = Object.keys(ESTADO_LABEL) as EstadoReclamo[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estados</CardTitle>
        <p className="text-sm text-muted-foreground">Así avanza un reclamo.</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {estados.map((estado) => (
          <div
            key={estado}
            className="flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-muted/50"
          >
            <EstadoBadge estado={estado} className="mt-0.5 shrink-0" />
            <p className="text-sm leading-5 text-muted-foreground">{SIGNIFICADO_ESTADO[estado]}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ReferenciaPrioridades() {
  const prioridades = Object.keys(PRIORIDAD_LABEL) as PrioridadReclamo[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prioridades</CardTitle>
        <p className="text-sm text-muted-foreground">Indican la urgencia.</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {prioridades.map((prioridad) => (
          <div
            key={prioridad}
            className="flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-muted/50"
          >
            <PrioridadBadge prioridad={prioridad} />
            <p className="text-sm leading-5 text-muted-foreground">
              {SIGNIFICADO_PRIORIDAD[prioridad]}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ReferenciaCategorias() {
  const categorias = Object.keys(CATEGORIA_LABEL) as CategoriaReclamo[];

  return (
    <Card className="lg:col-span-2 xl:col-span-1">
      <CardHeader>
        <CardTitle>Categorías</CardTitle>
        <p className="text-sm text-muted-foreground">Ayudan a encontrar reclamos parecidos.</p>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
        {categorias.map((categoria) => (
          <div
            key={categoria}
            className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm font-medium ring-1 ring-transparent transition-colors hover:ring-border"
          >
            <CategoriaIcono categoria={categoria} className="size-4 shrink-0" />
            <span className="truncate">{CATEGORIA_LABEL[categoria]}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function QuickStart() {
  return (
    <Card data-tour="ayuda-inicio" className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-chart-1/10 text-chart-1">
            <Plus className="size-5" />
          </span>
          <div>
            <CardTitle>Empezá en cuatro pasos</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Una forma simple de llevar un reclamo desde la calle hasta su seguimiento.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <ol className="grid gap-3 md:grid-cols-4">
          {PASOS_CIUDADANO.map((paso, indice) => (
            <li key={paso} className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {indice + 1}
              </span>
              <p className="pt-0.5 text-sm leading-5 text-muted-foreground">{paso}</p>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
          <Button asChild className="w-full gap-2 sm:w-auto">
            <Link to="/reclamos/nuevo">
              <Plus className="size-4" />
              Cargar un reclamo
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full gap-2 sm:w-auto">
            <Link to="/feed">
              <MapPin className="size-4" />
              Explorar la ciudad
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AccesoRapido({ to, icon: Icono, label }: { to: string; icon: LucideIcon; label: string }) {
  return (
    <Button
      asChild
      variant="secondary"
      className="h-auto min-h-16 w-full justify-start gap-3 px-3 py-2.5 text-left"
    >
      <Link to={to}>
        <Icono className="text-chart-1" />
        <span className="text-xs font-medium leading-tight">{label}</span>
      </Link>
    </Button>
  );
}

export function CentroAyudaCiudadano() {
  const [consulta, setConsulta] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState<ClaveCategoria | null>(null);
  const categoriaSeleccionada = CATEGORIAS.find((categoria) => categoria.id === categoriaActiva);
  const consultaLimpia = consulta.trim();
  const terminoConsulta = normalizar(consultaLimpia);
  const resultados = useMemo(() => {
    const porCategoria = categoriaActiva
      ? PREGUNTAS.filter((pregunta) => pregunta.categoria === categoriaActiva)
      : PREGUNTAS;
    if (!terminoConsulta) return porCategoria;
    return porCategoria.filter((pregunta) =>
      normalizar(`${pregunta.pregunta} ${pregunta.respuesta}`).includes(terminoConsulta),
    );
  }, [categoriaActiva, terminoConsulta]);

  function mostrarCategoria(categoria: ClaveCategoria): void {
    setCategoriaActiva(categoria);
    setConsulta("");
    window.setTimeout(() => {
      document.getElementById("preguntas-frecuentes")?.scrollIntoView?.({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function verTodas(): void {
    setCategoriaActiva(null);
    setConsulta("");
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-accent via-card to-card px-5 py-8 shadow-sm sm:px-8 sm:py-10">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <CircleHelp className="size-4" />
            Guía para vecinos
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Centro de ayuda
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            Encontrá respuestas para cargar un reclamo, seguir su avance y participar de la vida de
            tu barrio.
          </p>
          <form
            role="search"
            onSubmit={(event) => event.preventDefault()}
            className="relative mt-7 max-w-2xl"
          >
            <label htmlFor="busqueda-ayuda-ciudadano" className="sr-only">
              Buscar en el centro de ayuda
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="busqueda-ayuda-ciudadano"
              type="search"
              value={consulta}
              onChange={(event) => {
                setConsulta(event.target.value);
                setCategoriaActiva(null);
              }}
              placeholder="Buscar en la ayuda..."
              className="h-12 bg-card pr-4 pl-12 text-base shadow-sm"
            />
          </form>
        </div>
        <IlustracionAyuda />
      </section>

      <section
        data-tour="ayuda-secciones"
        aria-label="Categorías de ayuda"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        {CATEGORIAS.map((categoria) => {
          const Icono = categoria.icon;
          return (
            <button
              key={categoria.id}
              type="button"
              onClick={() => mostrarCategoria(categoria.id)}
              aria-pressed={categoriaActiva === categoria.id}
              className={`group flex items-center gap-3 rounded-xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none ${
                categoriaActiva === categoria.id ? "border-primary/40 bg-accent/50" : "bg-card"
              }`}
            >
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${categoria.icono}`}
              >
                <Icono className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{categoria.titulo}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {categoria.descripcion}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>
          );
        })}
      </section>

      <QuickStart />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <ReferenciaEstados />
        <ReferenciaPrioridades />
        <ReferenciaCategorias />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card id="preguntas-frecuentes" className="scroll-mt-24">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>
                  {categoriaSeleccionada ? categoriaSeleccionada.titulo : "Preguntas frecuentes"}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
                  {terminoConsulta
                    ? `${resultados.length} resultado${resultados.length === 1 ? "" : "s"} para “${consultaLimpia}”`
                    : categoriaSeleccionada
                      ? `${resultados.length} guía${resultados.length === 1 ? "" : "s"} en esta categoría.`
                      : "Respuestas rápidas para cuidar y seguir tu reclamo."}
                </p>
              </div>
              {terminoConsulta || categoriaActiva ? (
                <Button variant="ghost" size="sm" onClick={verTodas}>
                  Ver todas
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {resultados.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-12 text-center">
                <Search className="size-8 text-muted-foreground/60" />
                <p className="mt-3 font-medium">No encontramos esa ayuda</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Probá con “reclamo”, “mapa” o “estado”.
                </p>
              </div>
            ) : (
              resultados.map((pregunta) => <Pregunta key={pregunta.id} pregunta={pregunta} />)
            )}
          </CardContent>
        </Card>

        <aside className="grid gap-4">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-chart-1/10 text-chart-1">
                  <Sparkles className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold">Accesos rápidos</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Saltá directo a tus herramientas.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <AccesoRapido to="/reclamos" icon={Inbox} label="Mis reclamos" />
                <AccesoRapido to="/reclamos/nuevo" icon={Plus} label="Nuevo reclamo" />
                <AccesoRapido to="/feed" icon={MessageCircle} label="Reclamos de la ciudad" />
                <AccesoRapido to="/mapa" icon={MapPin} label="Mapa" />
                <AccesoRapido to="/notificaciones" icon={Bell} label="Notificaciones" />
                <AccesoRapido to="/cuenta" icon={UserRound} label="Mi cuenta" />
                <AccesoRapido to="/configuracion" icon={Settings} label="Configuración" />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                <Users className="size-4 shrink-0 text-chart-2" />
                Tus datos personales no se muestran públicamente.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-chart-1/10 text-chart-1">
                  <Command className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold">Atajo de teclado</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Buscá una página o un reclamo sin salir del lugar.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg bg-muted px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Buscador global</p>
                  <p className="mt-1 text-xs text-muted-foreground">Buscá por título o nombre.</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <kbd className="rounded-md border bg-card px-2 py-1 font-mono text-xs font-semibold shadow-sm">
                    Ctrl
                  </kbd>
                  <span className="text-xs text-muted-foreground">+</span>
                  <kbd className="rounded-md border bg-card px-2 py-1 font-mono text-xs font-semibold shadow-sm">
                    K
                  </kbd>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">En macOS, usá Cmd + K.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
