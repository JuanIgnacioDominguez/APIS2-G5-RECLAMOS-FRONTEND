import { useMemo } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  ClipboardCheck,
  Inbox as IconoBandeja,
  LayoutDashboard,
  List,
  MapPin,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Zap,
} from "lucide-react";

import {
  AccesoRapido,
  HeroAyuda,
  IlustracionAyuda,
  RejillaCategorias,
  TarjetaAccesos,
  TarjetaAtajoTeclado,
  TarjetaPreguntas,
  filtrarPreguntas,
  subtituloPreguntas,
  useCentroAyuda,
  type CategoriaAyuda,
  type PreguntaAyuda,
} from "@/features/ayuda/CentroAyudaBase";

export { IlustracionAyuda };

type ClaveCategoria = "primeros-pasos" | "gestion" | "dashboard-mapa" | "panel-metricas";

interface PreguntaFrecuenta extends PreguntaAyuda {
  categoria: ClaveCategoria;
  soloAdmin?: boolean;
}

const CATEGORIAS_STAFF: CategoriaAyuda<ClaveCategoria>[] = [
  {
    id: "primeros-pasos",
    titulo: "Primeros pasos",
    descripcion: "Conocé la bandeja y el flujo",
    icon: BookOpen,
    icono: "bg-chart-1/10 text-chart-1",
  },
  {
    id: "gestion",
    titulo: "Gestión de reclamos",
    descripcion: "Asignar, resolver y dar seguimiento",
    icon: ClipboardCheck,
    icono: "bg-chart-3/15 text-chart-3",
  },
  {
    id: "dashboard-mapa",
    titulo: "Dashboard y mapa",
    descripcion: "Métricas y geolocalización",
    icon: LayoutDashboard,
    icono: "bg-chart-2/12 text-chart-2",
  },
];

const CATEGORIAS_ADMIN: CategoriaAyuda<ClaveCategoria>[] = [
  ...CATEGORIAS_STAFF,
  {
    id: "panel-metricas",
    titulo: "Panel y métricas",
    descripcion: "Análisis y distribución global",
    icon: BarChart3,
    icono: "bg-chart-5/10 text-chart-5",
  },
];

const PREGUNTAS: PreguntaFrecuenta[] = [
  {
    id: "revisar-bandeja",
    categoria: "primeros-pasos",
    pregunta: "¿Cómo reviso los reclamos entrantes?",
    respuesta:
      "Abre Bandeja, usa Seleccionar para revisar varias filas y entra al detalle para cambiar su estado, clasificación o responsable.",
  },
  {
    id: "exportar-datos",
    categoria: "primeros-pasos",
    pregunta: "¿Cómo exporto información?",
    respuesta:
      "En la tabla de Bandeja, presioná Seleccionar, elegí las filas y usá Exportar para descargar CSV, Excel o JSON.",
  },
  {
    id: "buscar-rapido",
    categoria: "primeros-pasos",
    pregunta: "¿Cómo me muevo más rápido por la aplicación?",
    respuesta:
      "Usa Ctrl/Cmd + K para abrir la búsqueda global y saltar a una página o a un reclamo por título.",
  },
  {
    id: "asignar-reclamo",
    categoria: "gestion",
    pregunta: "¿Cómo asigno un reclamo?",
    respuesta:
      "Desde el detalle, elegí el estado Asignado, indicá el responsable y el área competente. Todo cambio queda en el historial.",
  },
  {
    id: "estados-reclamo",
    categoria: "gestion",
    pregunta: "¿Qué estados puede tener un reclamo?",
    respuesta:
      "El flujo habitual es Recibido, En revisión, Asignado, En proceso y Resuelto. Rechazado y Cerrado son finales y ya no admiten cambios.",
  },
  {
    id: "corregir-clasificacion",
    categoria: "gestion",
    pregunta: "¿Cómo corrijo la categoría o prioridad?",
    respuesta:
      "En el detalle podés reclasificar el reclamo. La corrección queda registrada y actualiza las métricas disponibles.",
  },
  {
    id: "datos-ciudadanos",
    categoria: "gestion",
    pregunta: "¿Puedo ver información personal de los ciudadanos?",
    respuesta:
      "No. El módulo no ofrece un padrón de ciudadanos ni expone identidades personales en la gestión de reclamos.",
  },
  {
    id: "mapa-reclamos",
    categoria: "dashboard-mapa",
    pregunta: "¿Qué muestra el mapa?",
    respuesta:
      "Muestra únicamente los reclamos que tienen coordenadas. Podés ver categoría, estado y barrio sin exponer datos personales del ciudadano.",
  },
  {
    id: "dashboard-datos",
    categoria: "dashboard-mapa",
    pregunta: "¿Qué datos muestra el Dashboard?",
    respuesta:
      "El administrador usa estadísticas globales. El operador ve una muestra de los 100 reclamos recientes, claramente identificada como tal.",
  },
  {
    id: "panel-datos",
    categoria: "panel-metricas",
    pregunta: "¿Qué datos muestra el Panel?",
    respuesta:
      "Muestra el total de reclamos, su distribución por estado, categoría y prioridad, y el tiempo histórico hasta la resolución.",
    soloAdmin: true,
  },
];

export function CentroAyudaOperador({ esAdmin }: { esAdmin: boolean }) {
  const {
    consulta,
    consultaLimpia,
    terminoConsulta,
    categoriaActiva,
    buscar,
    mostrarCategoria,
    verTodas,
  } = useCentroAyuda<ClaveCategoria>();
  const categorias = esAdmin ? CATEGORIAS_ADMIN : CATEGORIAS_STAFF;
  const categoriaSeleccionada = categorias.find((categoria) => categoria.id === categoriaActiva);
  const resultados = useMemo(
    () =>
      filtrarPreguntas(
        PREGUNTAS.filter((item) => !item.soloAdmin || esAdmin),
        categoriaActiva,
        terminoConsulta,
      ),
    [categoriaActiva, terminoConsulta, esAdmin],
  );

  const subtitulo = subtituloPreguntas({
    terminoConsulta,
    consultaLimpia,
    hayCategoria: Boolean(categoriaSeleccionada),
    cantidad: resultados.length,
    porDefecto: "Respuestas rápidas sobre el trabajo diario.",
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
      <HeroAyuda
        inputId="busqueda-ayuda"
        descripcion="Encontrá respuestas para operar la bandeja, revisar el mapa y consultar los datos disponibles de tu rol."
        consulta={consulta}
        onConsultaChange={buscar}
      />

      <RejillaCategorias
        categorias={categorias}
        activa={categoriaActiva}
        onSeleccionar={mostrarCategoria}
        className={`grid gap-3 sm:grid-cols-2 ${esAdmin ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}
      />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <TarjetaPreguntas
          titulo={categoriaSeleccionada ? categoriaSeleccionada.titulo : "Preguntas frecuentes"}
          subtitulo={subtitulo}
          mostrarVerTodas={Boolean(terminoConsulta || categoriaActiva)}
          onVerTodas={verTodas}
          resultados={resultados}
          hintVacio={
            <>
              Probá con “bandeja”, “asignar” o “mapa”
              {esAdmin ? " o “métricas”" : ""}.
            </>
          }
        />

        <aside className="grid gap-4">
          <TarjetaAccesos
            icono={Zap}
            descripcion="Saltá directo a las herramientas disponibles para tu rol."
            notaIcono={ShieldCheck}
            notaTexto="No se muestran datos personales de ciudadanos."
          >
            <AccesoRapido to="/backoffice" icon={IconoBandeja} label="Bandeja" />
            <AccesoRapido to="/reclamos" icon={List} label="Todos los reclamos" />
            <AccesoRapido to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <AccesoRapido to="/mapa" icon={MapPin} label="Mapa" />
            <AccesoRapido to="/notificaciones" icon={Bell} label="Notificaciones" />
            <AccesoRapido to="/cuenta" icon={UserRound} label="Mi cuenta" />
            <AccesoRapido to="/configuracion" icon={Settings} label="Configuración" />
            {esAdmin ? <AccesoRapido to="/panel" icon={BarChart3} label="Panel" /> : null}
          </TarjetaAccesos>

          <TarjetaAtajoTeclado
            icono={Search}
            descripcionEncabezado="Abrí el buscador global desde cualquier página."
            descripcionInterna="Encontrá una página o un reclamo por título."
          />
        </aside>
      </div>
    </div>
  );
}
