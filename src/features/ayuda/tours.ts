/**
 * Guided-tour steps per screen, keyed to `data-tour` anchors we drop into the
 * pages. Pure module (no React, no driver.js), so it can be unit-tested.
 *
 * Each step's `descripcion` is a small paragraph — the point of the tour is to
 * explain what the section does, not just name it. Steps whose anchor is not on
 * screen (e.g. optional widgets, role-only bits) are dropped by the runner.
 */

import { Rol } from "@/auth/roles";

export interface PasoTour {
  /** CSS selector for the element to highlight. `null` centres the popover. */
  selector: string | null;
  titulo: string;
  descripcion: string;
  /** driver.js side; defaults are fine in most places. */
  lado?: "top" | "right" | "bottom" | "left";
}

const BIENVENIDA: PasoTour = {
  selector: null,
  titulo: "Recorrido de la sección",
  descripcion:
    "Te voy a mostrar qué hace cada bloque de esta pantalla. Podés avanzar con las flechas del teclado o los botones del recuadro, y salir en cualquier momento tocando Esc o la X.",
};

const NAVEGACION_LATERAL: PasoTour = {
  selector: '[data-slot="sidebar-content"]',
  titulo: "Menú principal",
  descripcion:
    "Desde acá saltás entre las pantallas del módulo. Se agrupan por tipo de tarea: gestión, comunidad y tu cuenta. La sección activa queda resaltada en azul.",
  lado: "right",
};

const BUSCADOR_HEADER: PasoTour = {
  selector: '[aria-label="Buscar reclamos"]',
  titulo: "Buscador global",
  descripcion:
    "Abre una paleta de comandos para saltar a cualquier pantalla o buscar un reclamo por título. También la abrís con Ctrl/Cmd + K desde cualquier lado.",
  lado: "bottom",
};

const AYUDA_FAB: PasoTour = {
  selector: '[data-tour="ayuda-fab"]',
  titulo: "Ayuda contextual",
  descripcion:
    "Este botón siempre está acá abajo. Presionalo en cualquier pantalla y te explico qué hace cada bloque. Podés apagarlo desde Configuración si te molesta.",
  lado: "left",
};

/** Reclamos: citizen ("Mis reclamos") vs staff ("Todos los reclamos"). */
function pasosReclamos(staff: boolean): PasoTour[] {
  return [
    BIENVENIDA,
    NAVEGACION_LATERAL,
    {
      selector: '[data-tour="reclamos-header"]',
      titulo: staff ? "Todos los reclamos" : "Mis reclamos",
      descripcion: staff
        ? "Es la vista general de todos los reclamos de la ciudad. Sirve para revisarlos, buscarlos y abrir el detalle. Para trabajar los pendientes de clasificar conviene la Bandeja."
        : "Acá aparecen los reclamos que vos cargaste. Cada tarjeta lleva al detalle donde ves el estado, la trazabilidad y los comentarios.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="reclamos-nuevo"]',
      titulo: staff ? "Cargar reclamo" : "Nuevo reclamo",
      descripcion:
        "Abre el formulario para registrar un reclamo nuevo. Antes de crearlo el sistema busca reclamos parecidos para que puedas sumarte a uno existente en vez de duplicarlo.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="reclamos-kpis"]',
      titulo: "Indicadores rápidos",
      descripcion:
        "Un vistazo del estado general: cuántos hay en total, cuántos abiertos, en proceso y resueltos. Se recalculan a medida que cambian los filtros.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="reclamos-tabs"]',
      titulo: "Filtrar por estado",
      descripcion:
        "Cambia rápido entre Todos, Abiertos, En proceso y Resueltos. El número al lado de cada pestaña te dice cuántos hay en ese estado.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="reclamos-filtros"]',
      titulo: "Búsqueda y filtros",
      descripcion:
        "Combiná la búsqueda por título con el filtro por categoría y el orden. El resultado se actualiza mientras escribís.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="reclamos-lista"]',
      titulo: "Listado de reclamos",
      descripcion:
        "Cada tarjeta resume un reclamo: título, estado, categoría, prioridad, barrio y adhesiones. Hacé clic para entrar al detalle.",
      lado: "top",
    },
    BUSCADOR_HEADER,
    AYUDA_FAB,
  ];
}

/** Backoffice inbox (staff). */
function pasosBandeja(): PasoTour[] {
  return [
    BIENVENIDA,
    {
      selector: '[data-tour="bandeja-header"]',
      titulo: "Bandeja de reclamos",
      descripcion:
        "Es tu cola de trabajo: los reclamos entrantes ordenados por antigüedad. Desde acá los clasificás, asignás y avanzás su estado.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="bandeja-kpis"]',
      titulo: "Panel de estado",
      descripcion:
        "Los indicadores muestran cuántos hay entrantes, sin clasificar, en revisión y cuántos fueron clasificados automáticamente por el modelo.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="bandeja-buscar"]',
      titulo: "Buscador de la bandeja",
      descripcion:
        "Filtra la tabla por texto del título mientras escribís. Útil cuando ya tenés muchas filas.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="bandeja-tabla"]',
      titulo: "Tabla de reclamos",
      descripcion:
        "Cada fila es un reclamo con su categoría, prioridad, estado, adhesiones y cuándo ingresó. Hacé clic para abrir el detalle y trabajarlo.",
      lado: "top",
    },
    NAVEGACION_LATERAL,
    AYUDA_FAB,
  ];
}

/** Metrics dashboard (staff). */
function pasosDashboard(): PasoTour[] {
  return [
    BIENVENIDA,
    {
      selector: '[data-tour="dashboard-kpis"]',
      titulo: "Indicadores principales",
      descripcion:
        "Métricas del módulo en tiempo real: total de reclamos, cuántos están abiertos, resueltos y el tiempo promedio de resolución.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="dashboard-heatmap"]',
      titulo: "Mapa de calor",
      descripcion:
        "Muestra dónde se concentran los reclamos en la ciudad. Las zonas rojas son las de mayor volumen; sirve para planificar recorridas o cuadrillas.",
      lado: "left",
    },
    {
      selector: '[data-tour="dashboard-recientes"]',
      titulo: "Últimos reclamos",
      descripcion:
        "Los que ingresaron más recientemente. Es un atajo para ver qué está pasando ahora sin tener que abrir la bandeja completa.",
      lado: "top",
    },
    {
      selector: '[data-tour="dashboard-top"]',
      titulo: "Reclamos con más apoyo",
      descripcion:
        "Los que juntaron más adhesiones. Suelen ser los que más impacto tienen entre los vecinos y merecen prioridad.",
      lado: "top",
    },
    NAVEGACION_LATERAL,
    AYUDA_FAB,
  ];
}

/** New claim form. */
function pasosNuevoReclamo(): PasoTour[] {
  return [
    BIENVENIDA,
    {
      selector: '[data-tour="nuevo-paso1"]',
      titulo: "Datos del reclamo",
      descripcion:
        "Contá qué pasa. El título es un resumen corto y la descripción los detalles. Si dejás Categoría y Prioridad en 'La sugiere el clasificador', el sistema las infiere solo a partir del texto.",
      lado: "right",
    },
    {
      selector: '[data-tour="nuevo-paso2"]',
      titulo: "Ubicación del problema",
      descripcion:
        "Marcá dónde ocurre: podés tocar el mapa, usar tu ubicación actual o escribir la dirección y elegirla del listado. Cuanto más precisa la ubicación, mejor detectamos reclamos parecidos.",
      lado: "left",
    },
    {
      selector: '[data-tour="nuevo-enviar"]',
      titulo: "Enviar el reclamo",
      descripcion:
        "Antes de crear el reclamo el sistema busca reclamos similares. Si encuentra alguno, te ofrece sumarte en vez de duplicarlo; si no hay, se crea directo.",
      lado: "left",
    },
    AYUDA_FAB,
  ];
}

/** Claim detail: differs staff vs citizen. */
function pasosDetalle(staff: boolean): PasoTour[] {
  if (staff) {
    return [
      BIENVENIDA,
      {
        selector: '[data-tour="detalle-header"]',
        titulo: "Encabezado del reclamo",
        descripcion:
          "El identificador corto, el estado y las etiquetas principales. También podés refrescar los datos con el botón de la derecha.",
        lado: "bottom",
      },
      {
        selector: '[data-tour="detalle-gestion"]',
        titulo: "Gestión del reclamo",
        descripcion:
          "Acá cambiás el estado, asignás a un operador y definís el área responsable. Solo se ofrecen las transiciones válidas para el estado actual.",
        lado: "right",
      },
      {
        selector: '[data-tour="detalle-clasificacion"]',
        titulo: "Clasificación",
        descripcion:
          "Categoría y prioridad del reclamo. Si el clasificador se equivocó, corregilo desde acá; queda registrado como reclasificación en la trazabilidad.",
        lado: "left",
      },
      {
        selector: '[data-tour="detalle-ubicacion"]',
        titulo: "Ubicación",
        descripcion:
          "Punto exacto del reclamo. Con 'Ver en mapa' lo abrís en OpenStreetMap para ver el contexto o compartir el enlace.",
        lado: "left",
      },
      {
        selector: '[data-tour="detalle-detalles"]',
        titulo: "Detalles",
        descripcion:
          "Barrio, asignado, área, canal por el que entró y última actualización. Es la ficha resumen para saber quién lo tiene entre manos.",
        lado: "left",
      },
      {
        selector: '[data-tour="detalle-trazabilidad"]',
        titulo: "Trazabilidad",
        descripcion:
          "Historial de cambios de estado con la fecha y el motivo de cada transición. Es la auditoría del reclamo.",
        lado: "left",
      },
      {
        selector: '[data-tour="detalle-informacion"]',
        titulo: "Información del reclamo",
        descripcion: "Descripción completa que dejó el vecino y las fotos adjuntas si las hay.",
        lado: "top",
      },
      {
        selector: '[data-tour="detalle-comentarios"]',
        titulo: "Comentarios",
        descripcion:
          "Hilo público del reclamo. Como operador, tus mensajes salen marcados como respuesta oficial.",
        lado: "top",
      },
      AYUDA_FAB,
    ];
  }
  // Citizen view.
  return [
    BIENVENIDA,
    {
      selector: '[data-tour="detalle-header"]',
      titulo: "Reclamo en detalle",
      descripcion:
        "Estás viendo el reclamo con su título, estado actual, categoría y prioridad. El color del estado te dice si está avanzando (azul), en revisión (ámbar) o resuelto (verde).",
      lado: "bottom",
    },
    {
      selector: '[data-tour="detalle-adhesion"]',
      titulo: "Sumarte al reclamo",
      descripcion:
        "Si te pasa lo mismo, adherite. Los reclamos con más vecinos apoyando toman prioridad. Si el reclamo es tuyo no aparece el botón (no podés adherirte a tu propio reclamo).",
      lado: "top",
    },
    {
      selector: '[data-tour="detalle-ubicacion"]',
      titulo: "Ubicación",
      descripcion:
        "Dónde ocurre el problema. Podés abrirlo en OpenStreetMap para ver el contexto de la zona.",
      lado: "left",
    },
    {
      selector: '[data-tour="detalle-trazabilidad"]',
      titulo: "Trazabilidad",
      descripcion:
        "El historial de estados por los que pasó el reclamo. Así ves si alguien ya lo tomó y en qué está.",
      lado: "left",
    },
    {
      selector: '[data-tour="detalle-comentarios"]',
      titulo: "Comentarios",
      descripcion:
        "Podés dejar un comentario si querés aportar más información. Las respuestas del municipio aparecen destacadas.",
      lado: "top",
    },
    AYUDA_FAB,
  ];
}

function pasosFeed(): PasoTour[] {
  return [
    BIENVENIDA,
    {
      selector: '[data-tour="feed-header"]',
      titulo: "Reclamos de la ciudad",
      descripcion:
        "Muestra los reclamos públicos que otros vecinos reportaron. Sirve para saber qué está pasando en tu barrio o zonas cercanas.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="feed-filtros"]',
      titulo: "Filtros y orden",
      descripcion:
        "Filtrá por categoría, barrio y estado, y elegí si querés ver los más recientes, los más antiguos o los más apoyados.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="feed-lista"]',
      titulo: "Reclamos visibles",
      descripcion:
        "Cada tarjeta lleva al detalle. Si alguno te pasa a vos también, entrá y sumate al reclamo en vez de crear uno nuevo.",
      lado: "top",
    },
    NAVEGACION_LATERAL,
    AYUDA_FAB,
  ];
}

function pasosMapa(): PasoTour[] {
  return [
    BIENVENIDA,
    {
      selector: '[data-tour="mapa-filtros"]',
      titulo: "Filtros del mapa",
      descripcion:
        "Recortá qué reclamos ver por categoría y por estado. El contador de la derecha te dice cuántos quedan visibles en el mapa.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="mapa-canvas"]',
      titulo: "Mapa de reclamos",
      descripcion:
        "Cada punto es un reclamo público geolocalizado. El color viene del estado; hacé clic sobre un punto para ver su información. Si sos ciudadano, tus reclamos aparecen destacados con un anillo dorado.",
      lado: "top",
    },
    {
      selector: '[data-tour="mapa-leyenda"]',
      titulo: "Leyenda",
      descripcion:
        "Traduce los colores del mapa: recibido, en proceso, resuelto y rechazado. También aclara qué son tus reclamos si estás como ciudadano.",
      lado: "top",
    },
    AYUDA_FAB,
  ];
}

function pasosPanel(): PasoTour[] {
  return [
    BIENVENIDA,
    {
      selector: '[data-tour="panel-kpis"]',
      titulo: "Indicadores globales",
      descripcion:
        "Total de reclamos y tiempo promedio de resolución. Son las métricas que se comparten con el módulo de Analítica Urbana.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="panel-distribuciones"]',
      titulo: "Distribuciones",
      descripcion:
        "Cómo se reparten los reclamos por estado, categoría y prioridad. La barra proporcional te da la lectura rápida.",
      lado: "top",
    },
    AYUDA_FAB,
  ];
}

function pasosCuenta(): PasoTour[] {
  return [
    BIENVENIDA,
    {
      selector: '[data-tour="cuenta-datos"]',
      titulo: "Tus datos",
      descripcion:
        "El perfil que usás en la app: nombre, email y rol. Los emite el Login Federado del Grupo 2; para cambiarlos hay que hacerlo desde ahí.",
      lado: "bottom",
    },
    AYUDA_FAB,
  ];
}

function pasosNotificaciones(): PasoTour[] {
  return [
    BIENVENIDA,
    {
      selector: '[data-tour="notif-lista"]',
      titulo: "Bandeja de notificaciones",
      descripcion:
        "Los avisos que recibiste sobre tus reclamos: cambios de estado, respuestas oficiales y adhesiones.",
      lado: "bottom",
    },
    AYUDA_FAB,
  ];
}

function pasosConfiguracion(): PasoTour[] {
  return [
    BIENVENIDA,
    {
      selector: '[data-tour="config-apariencia"]',
      titulo: "Apariencia",
      descripcion:
        "Elegí el tema claro u oscuro. La preferencia queda guardada en tu navegador y sólo aplica a este dispositivo.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="config-ayuda"]',
      titulo: "Ayuda guiada",
      descripcion:
        "Podés apagar el botón flotante de ayuda si ya no lo necesitás. Volvés a activarlo desde acá cuando quieras.",
      lado: "bottom",
    },
    AYUDA_FAB,
  ];
}

function pasosAyuda(): PasoTour[] {
  return [
    BIENVENIDA,
    {
      selector: '[data-tour="ayuda-secciones"]',
      titulo: "Centro de ayuda",
      descripcion:
        "Preguntas frecuentes y enlaces útiles sobre cómo usar la plataforma. Si preferís un recorrido paso a paso de la pantalla en la que estás, usá siempre el botón flotante de ayuda.",
      lado: "bottom",
    },
    AYUDA_FAB,
  ];
}

/**
 * Steps for the current route + role. `null` means "no tour available here"
 * so the floating button can hide itself instead of opening an empty popover.
 */
export function pasosParaRuta(pathname: string, rol: Rol | null): PasoTour[] | null {
  const staff = rol === Rol.OPERADOR || rol === Rol.ADMIN;

  if (pathname === "/reclamos") return pasosReclamos(staff);
  if (pathname === "/reclamos/nuevo") return pasosNuevoReclamo();
  if (/^\/reclamos\/[^/]+$/.test(pathname)) return pasosDetalle(staff);
  if (pathname === "/backoffice") return pasosBandeja();
  if (pathname === "/dashboard") return pasosDashboard();
  if (pathname === "/feed") return pasosFeed();
  if (pathname === "/mapa") return pasosMapa();
  if (pathname === "/panel") return pasosPanel();
  if (pathname === "/cuenta") return pasosCuenta();
  if (pathname === "/notificaciones") return pasosNotificaciones();
  if (pathname === "/configuracion") return pasosConfiguracion();
  if (pathname === "/ayuda") return pasosAyuda();

  return null;
}
