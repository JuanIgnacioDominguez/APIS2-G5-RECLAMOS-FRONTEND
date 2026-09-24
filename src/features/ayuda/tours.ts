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

// ---------------------------------------------------------------------------
// Common building blocks reused across screens.
// ---------------------------------------------------------------------------

const BIENVENIDA = (titulo: string): PasoTour => ({
  selector: null,
  titulo,
  descripcion:
    "Te voy a mostrar qué hace cada bloque de esta pantalla y cómo aprovecharla al máximo. Podés avanzar con las flechas del teclado o los botones del recuadro, y salir en cualquier momento tocando Esc o la X del recuadro.",
});

const SIDEBAR_MARCA: PasoTour = {
  selector: '[data-slot="sidebar-header"]',
  titulo: "CityPass+",
  descripcion:
    "La marca del módulo. Al hacer clic sobre el logo también podés colapsar o expandir la barra lateral, para que la pantalla te quede más despejada.",
  lado: "right",
};

const SIDEBAR_NAV: PasoTour = {
  selector: '[data-slot="sidebar-content"]',
  titulo: "Menú principal",
  descripcion:
    "Desde acá saltás entre las pantallas del módulo. Están agrupadas por tipo de tarea: gestión (bandeja, reclamos), comunidad (feed, mapa) y tu cuenta. La sección activa queda resaltada en azul; algunos ítems muestran un contador vivo con el trabajo pendiente.",
  lado: "right",
};

const SIDEBAR_USUARIO: PasoTour = {
  selector: '[data-slot="sidebar-footer"] button',
  titulo: "Tu cuenta",
  descripcion:
    "Muestra con qué usuario y rol estás conectado. Al hacer clic se abre el menú con tu email y el botón para cerrar sesión.",
  lado: "right",
};

const HEADER_BUSCAR: PasoTour = {
  selector: '[aria-label="Buscar reclamos"]',
  titulo: "Buscador global",
  descripcion:
    "Abre una paleta de comandos (estilo Spotlight) para saltar a cualquier pantalla o buscar un reclamo por título. También la abrís desde el teclado con Ctrl/Cmd + K, aunque estés a la mitad de otra tarea.",
  lado: "bottom",
};

const HEADER_TEMA: PasoTour = {
  selector: '[aria-label="Cambiar tema"], [aria-label*="tema"], [aria-label*="Tema"]',
  titulo: "Modo claro y oscuro",
  descripcion:
    "Alterna entre el tema claro y el oscuro sin ir a Configuración. La preferencia se guarda en tu navegador y sólo aplica a este dispositivo.",
  lado: "bottom",
};

const HEADER_NOTIFICACIONES: PasoTour = {
  selector: '[aria-label="Notificaciones"]',
  titulo: "Notificaciones",
  descripcion:
    "Los avisos importantes de tus reclamos: cambios de estado, respuestas oficiales y adhesiones. El punto rojo aparece cuando hay algo sin leer.",
  lado: "bottom",
};

const AYUDA_FAB: PasoTour = {
  selector: '[data-tour="ayuda-fab"]',
  titulo: "Ayuda contextual",
  descripcion:
    "Este botón siempre está acá abajo. Presionalo en cualquier pantalla y te explico qué hace cada bloque. Podés apagarlo desde Configuración → Ayuda guiada si ya no lo necesitás.",
  lado: "left",
};

const CIERRE_GENERICO: PasoTour = {
  selector: null,
  titulo: "¡Listo!",
  descripcion:
    "Ya conocés lo importante de esta pantalla. Si te queda alguna duda, en cualquier momento podés volver a abrir el recorrido con el botón flotante de ayuda o consultar el Centro de ayuda.",
};

// ---------------------------------------------------------------------------
// Screen-specific tours.
// ---------------------------------------------------------------------------

/** Reclamos: citizen ("Mis reclamos") vs staff ("Todos los reclamos"). */
function pasosReclamos(staff: boolean): PasoTour[] {
  return [
    BIENVENIDA(staff ? "Todos los reclamos" : "Mis reclamos"),
    SIDEBAR_MARCA,
    SIDEBAR_NAV,
    {
      selector: '[data-tour="reclamos-header"]',
      titulo: staff ? "Todos los reclamos" : "Mis reclamos",
      descripcion: staff
        ? "Es la vista general de todos los reclamos de la ciudad. Sirve para revisarlos, buscarlos y abrir el detalle. Para trabajar los pendientes de clasificar conviene la Bandeja."
        : "Acá aparecen los reclamos que vos cargaste, ordenados de más recientes a más antiguos. Cada tarjeta lleva al detalle donde ves el estado, la trazabilidad y los comentarios.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="reclamos-nuevo"]',
      titulo: staff ? "Cargar reclamo" : "Nuevo reclamo",
      descripcion:
        "Abre el formulario para registrar un reclamo nuevo. Antes de crearlo el sistema busca reclamos parecidos para que puedas sumarte a uno existente en vez de duplicarlo — esto ahorra trabajo al municipio y le da más fuerza al reclamo.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="reclamos-kpis"]',
      titulo: "Indicadores rápidos",
      descripcion:
        "Un vistazo del estado general: total, abiertos, en proceso y resueltos. Se recalculan a medida que cambian los filtros, así que también sirven para verificar los resultados de tu búsqueda.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="reclamos-tabs"]',
      titulo: "Filtro por estado",
      descripcion:
        "Cambia rápido entre Todos, Abiertos, En proceso y Resueltos. El número al lado de cada pestaña te dice cuántos hay en ese estado; se actualiza sobre el conjunto filtrado.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="reclamos-filtros"]',
      titulo: "Búsqueda y filtros",
      descripcion:
        "Combiná la búsqueda por título con el filtro por categoría y el orden (más recientes, más antiguos o más apoyados). Los filtros se aplican del lado del cliente: la lista se actualiza mientras escribís, sin recargar del servidor.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="reclamos-lista"]',
      titulo: "Listado de reclamos",
      descripcion:
        "Cada tarjeta resume un reclamo: título, estado, categoría, prioridad, barrio y adhesiones. El color del estado y la línea de la prioridad te dan la lectura rápida. Hacé clic en cualquier tarjeta para entrar al detalle.",
      lado: "top",
    },
    HEADER_BUSCAR,
    HEADER_TEMA,
    HEADER_NOTIFICACIONES,
    SIDEBAR_USUARIO,
    AYUDA_FAB,
    CIERRE_GENERICO,
  ];
}

/** Backoffice inbox (staff). */
function pasosBandeja(): PasoTour[] {
  return [
    BIENVENIDA("Bandeja de reclamos"),
    SIDEBAR_NAV,
    {
      selector: '[data-tour="bandeja-header"]',
      titulo: "Bandeja de reclamos",
      descripcion:
        "Es tu cola de trabajo: los reclamos entrantes ordenados por antigüedad. Desde acá los clasificás, asignás y avanzás su estado. El botón 'Actualizar' fuerza una recarga cuando querés ver lo último.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="bandeja-kpis"]',
      titulo: "Panel de estado",
      descripcion:
        "Los indicadores muestran cuántos hay entrantes, sin clasificar, en revisión y cuántos fueron clasificados automáticamente por el modelo. El total de resueltos es global (no sólo de la bandeja), así ves el impacto acumulado.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="bandeja-buscar"]',
      titulo: "Buscador de la bandeja",
      descripcion:
        "Filtra la tabla por texto libre en cualquier columna mientras escribís. Útil cuando la cola crece y necesitás encontrar un reclamo por su título, barrio o categoría.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="bandeja-tabla"]',
      titulo: "Tabla de reclamos",
      descripcion:
        "Cada fila es un reclamo con su categoría, prioridad, estado, adhesiones y cuándo ingresó. Podés ordenar por cualquier columna haciendo clic en su encabezado, seleccionar varias filas con las casillas y exportar el resultado. Hacé clic en una fila para abrir el detalle y trabajarlo.",
      lado: "top",
    },
    HEADER_BUSCAR,
    HEADER_NOTIFICACIONES,
    SIDEBAR_USUARIO,
    AYUDA_FAB,
    CIERRE_GENERICO,
  ];
}

/** Metrics dashboard (staff). */
function pasosDashboard(): PasoTour[] {
  return [
    BIENVENIDA("Dashboard de métricas"),
    SIDEBAR_NAV,
    {
      selector: '[data-tour="dashboard-kpis"]',
      titulo: "Indicadores principales",
      descripcion:
        "Las métricas clave del módulo en tiempo real: total de reclamos, cuántos están abiertos o resueltos y el tiempo promedio de resolución. La flecha al costado de cada valor indica si la tendencia mejora o empeora respecto al período anterior.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="dashboard-heatmap"]',
      titulo: "Mapa de calor y prioridades",
      descripcion:
        "El mapa muestra dónde se concentran los reclamos en la ciudad; las zonas más rojas son las de mayor volumen y sirven para planificar recorridas o cuadrillas. A la derecha, la distribución por prioridad te dice qué tan urgente es el trabajo pendiente.",
      lado: "left",
    },
    {
      selector: '[data-tour="dashboard-recientes"]',
      titulo: "Últimos reclamos",
      descripcion:
        "Los que ingresaron más recientemente. Es un atajo para ver qué está pasando ahora sin tener que abrir la bandeja completa. Hacé clic en cualquiera para saltar directo a su detalle.",
      lado: "top",
    },
    HEADER_NOTIFICACIONES,
    SIDEBAR_USUARIO,
    AYUDA_FAB,
    CIERRE_GENERICO,
  ];
}

/** New claim form. */
function pasosNuevoReclamo(): PasoTour[] {
  return [
    BIENVENIDA("Cargar un reclamo"),
    {
      selector: '[data-tour="nuevo-paso1"]',
      titulo: "Paso 1 · Qué pasa",
      descripcion:
        "Contá el problema con tus palabras. El título es un resumen corto (ej.: 'Luminaria apagada en la plaza') y la descripción tiene los detalles: qué pasa, hace cuánto, si es peligroso. Cuanto más claro, más rápido lo pueden resolver.",
      lado: "right",
    },
    {
      selector: "#titulo, [name=titulo]",
      titulo: "Título del reclamo",
      descripcion:
        "Un enunciado corto y directo. Se muestra en el listado y en las notificaciones, así que evitá poner sólo la ubicación o palabras vagas como 'Problema'. Al menos 5 caracteres.",
      lado: "right",
    },
    {
      selector: "#descripcion, [name=descripcion]",
      titulo: "Descripción del reclamo",
      descripcion:
        "Ampliá el título contando qué está pasando, hace cuánto y por qué es importante resolverlo. Este texto también alimenta al clasificador automático: cuanto más específico, mejor sugerencia recibís.",
      lado: "right",
    },
    {
      selector: "#categoria, [name=categoria]",
      titulo: "Categoría y prioridad (opcional)",
      descripcion:
        "Si no las elegís, el sistema las sugiere al detectar palabras clave en tu descripción ('luz apagada' → Alumbrado, por ejemplo). Podés aplicar la sugerencia con un clic o elegirlas a mano si preferís.",
      lado: "left",
    },
    {
      selector: '[data-tour="nuevo-paso2"]',
      titulo: "Paso 2 · Dónde pasa",
      descripcion:
        "Marcá dónde ocurre el problema. Podés hacerlo de tres maneras: tocando directamente el mapa, usando tu ubicación actual, o escribiendo la dirección y eligiendo una sugerencia del listado. Cuanto más precisa la ubicación, mejor detectamos reclamos parecidos y llegamos al lugar exacto.",
      lado: "left",
    },
    {
      selector: '[data-tour="nuevo-enviar"]',
      titulo: "Enviar el reclamo",
      descripcion:
        "Antes de crear el reclamo el sistema busca reclamos similares. Si encuentra alguno, te ofrece sumarte en vez de duplicarlo; si no hay parecidos, se crea directo y te llevamos a la pantalla de detalle para que puedas hacer el seguimiento.",
      lado: "left",
    },
    AYUDA_FAB,
    CIERRE_GENERICO,
  ];
}

/** Claim detail: differs staff vs citizen. */
function pasosDetalle(staff: boolean): PasoTour[] {
  if (staff) {
    return [
      BIENVENIDA("Detalle del reclamo"),
      {
        selector: '[data-tour="detalle-header"]',
        titulo: "Encabezado del reclamo",
        descripcion:
          "El identificador corto, el título, el estado actual y las etiquetas principales (categoría, prioridad, barrio, canal). Con el botón de refrescar volvés a pedir los datos al servidor cuando necesitás asegurarte de tener lo último.",
        lado: "bottom",
      },
      {
        selector: '[data-tour="detalle-gestion"]',
        titulo: "Gestión del reclamo",
        descripcion:
          "Acá cambiás el estado, asignás a un operador y definís el área responsable. Sólo se ofrecen las transiciones válidas para el estado actual (por ejemplo, no podés pasar de Cerrado a En proceso). Todo cambio queda registrado en la trazabilidad.",
        lado: "right",
      },
      {
        selector: '[data-tour="detalle-clasificacion"]',
        titulo: "Clasificación",
        descripcion:
          "Categoría y prioridad del reclamo. Si el clasificador se equivocó, corregilo desde acá; la reclasificación se registra en la trazabilidad y ayuda a mejorar el modelo con el tiempo.",
        lado: "left",
      },
      {
        selector: '[data-tour="detalle-ubicacion"]',
        titulo: "Ubicación",
        descripcion:
          "Punto exacto del reclamo. Con 'Ver en mapa' lo abrís en OpenStreetMap para ver el contexto de la zona o compartir el enlace con una cuadrilla.",
        lado: "left",
      },
      {
        selector: '[data-tour="detalle-detalles"]',
        titulo: "Detalles",
        descripcion:
          "La ficha resumen: barrio, asignado, área responsable, canal por el que entró (app, web, teléfono…) y última actualización. Sirve para saber de un vistazo quién lo tiene entre manos.",
        lado: "left",
      },
      {
        selector: '[data-tour="detalle-trazabilidad"]',
        titulo: "Trazabilidad",
        descripcion:
          "Historial de cambios de estado con la fecha, quién lo hizo y el motivo. Es la auditoría del reclamo: cualquier acción — clasificación, asignación, cambio de estado — queda registrada.",
        lado: "left",
      },
      {
        selector: '[data-tour="detalle-informacion"]',
        titulo: "Información del reclamo",
        descripcion:
          "La descripción completa que dejó el vecino, la resolución si ya se cerró y las fotos adjuntas si las hay. Podés descargar cualquier adjunto haciendo clic en su ícono.",
        lado: "top",
      },
      {
        selector: '[data-tour="detalle-comentarios"]',
        titulo: "Comentarios",
        descripcion:
          "Hilo público del reclamo. Como operador, tus mensajes salen marcados como respuesta oficial y quedan destacados para el vecino y para futuros operadores que retomen el caso.",
        lado: "top",
      },
      AYUDA_FAB,
      CIERRE_GENERICO,
    ];
  }
  // Citizen view.
  return [
    BIENVENIDA("Detalle del reclamo"),
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
        "Si te pasa lo mismo, adherite. Los reclamos con más vecinos apoyando toman prioridad para el municipio. Si el reclamo es tuyo no aparece el botón: no podés adherirte a tu propio reclamo.",
      lado: "top",
    },
    {
      selector: '[data-tour="detalle-ubicacion"]',
      titulo: "Ubicación",
      descripcion:
        "Dónde ocurre el problema. Podés abrirlo en OpenStreetMap para ver el contexto de la zona o compartir la ubicación exacta.",
      lado: "left",
    },
    {
      selector: '[data-tour="detalle-trazabilidad"]',
      titulo: "Trazabilidad",
      descripcion:
        "El historial de estados por los que pasó el reclamo. Así ves si alguien ya lo tomó y en qué está: cada movimiento incluye la fecha y, cuando corresponde, un motivo.",
      lado: "left",
    },
    {
      selector: '[data-tour="detalle-comentarios"]',
      titulo: "Comentarios",
      descripcion:
        "Podés dejar un comentario si querés aportar más información. Las respuestas del municipio aparecen destacadas para que las distingas de los aportes de otros vecinos.",
      lado: "top",
    },
    AYUDA_FAB,
    CIERRE_GENERICO,
  ];
}

function pasosFeed(): PasoTour[] {
  return [
    BIENVENIDA("Reclamos de la ciudad"),
    SIDEBAR_NAV,
    {
      selector: '[data-tour="feed-header"]',
      titulo: "Reclamos de la ciudad",
      descripcion:
        "Muestra los reclamos públicos que otros vecinos reportaron. Sirve para saber qué está pasando en tu barrio o zonas cercanas, y para descubrir problemas a los que quieras sumarte.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="feed-filtros"]',
      titulo: "Filtros y orden",
      descripcion:
        "Filtrá por categoría, barrio y estado, y elegí el orden: los más recientes primero, los más antiguos, o los que juntaron más apoyo. El contador te muestra cuántos coinciden con los filtros.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="feed-lista"]',
      titulo: "Reclamos visibles",
      descripcion:
        "Cada tarjeta lleva al detalle. Los reclamos que ya son tuyos aparecen etiquetados como 'Tuyo' — el resto son de otros vecinos, y podés sumarte a los que te pasen a vos también.",
      lado: "top",
    },
    HEADER_BUSCAR,
    SIDEBAR_USUARIO,
    AYUDA_FAB,
    CIERRE_GENERICO,
  ];
}

function pasosMapa(): PasoTour[] {
  return [
    BIENVENIDA("Mapa de reclamos"),
    {
      selector: '[data-tour="mapa-canvas"]',
      titulo: "Mapa de reclamos",
      descripcion:
        "Cada punto es un reclamo público geolocalizado. El color viene del estado del reclamo; hacé clic sobre un punto para ver su información básica y saltar al detalle. Podés arrastrar el mapa y usar los controles + / - o la rueda del mouse para hacer zoom.",
      lado: "right",
    },
    {
      selector: '[data-tour="mapa-filtros"]',
      titulo: "Filtros del mapa",
      descripcion:
        "Recortá qué reclamos ver por categoría y por estado. El panel se puede colapsar tocando su encabezado, así ganás espacio de mapa cuando ya sabés qué estás buscando.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="mapa-leyenda"]',
      titulo: "Leyenda",
      descripcion:
        "Traduce los colores del mapa: cada estado tiene el suyo (recibido, en revisión, asignado, en proceso, resuelto, rechazado, cerrado). Si sos ciudadano, tus propios reclamos se marcan con un anillo dorado para que los distingas de un vistazo.",
      lado: "top",
    },
    SIDEBAR_NAV,
    AYUDA_FAB,
    CIERRE_GENERICO,
  ];
}

function pasosPanel(): PasoTour[] {
  return [
    BIENVENIDA("Panel de métricas"),
    SIDEBAR_NAV,
    {
      selector: '[data-tour="panel-kpis"]',
      titulo: "Indicadores globales",
      descripcion:
        "Total de reclamos y tiempo promedio de resolución. Son las métricas oficiales del módulo, las mismas que se comparten con el módulo de Analítica Urbana del sistema CityPass+.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="panel-distribuciones"]',
      titulo: "Distribuciones",
      descripcion:
        "Cómo se reparten los reclamos por estado, categoría y prioridad. La barra proporcional te da la lectura rápida de dónde se concentra el volumen: sirve tanto para reporting como para detectar categorías que se están escapando.",
      lado: "top",
    },
    AYUDA_FAB,
    CIERRE_GENERICO,
  ];
}

function pasosCuenta(): PasoTour[] {
  return [
    BIENVENIDA("Mi cuenta"),
    {
      selector: '[data-tour="cuenta-datos"]',
      titulo: "Tus datos",
      descripcion:
        "El perfil que usás en la app: nombre, email y rol. Los emite el Login Federado del Grupo 2; para cambiarlos hay que hacerlo desde ahí. El rol determina qué pantallas ves y qué acciones podés hacer.",
      lado: "bottom",
    },
    AYUDA_FAB,
    CIERRE_GENERICO,
  ];
}

function pasosNotificaciones(): PasoTour[] {
  return [
    BIENVENIDA("Notificaciones"),
    {
      selector: '[data-tour="notif-lista"]',
      titulo: "Bandeja de notificaciones",
      descripcion:
        "Los avisos que recibiste sobre tus reclamos: cambios de estado, respuestas oficiales del municipio y adhesiones nuevas. Están ordenados con las más recientes primero.",
      lado: "bottom",
    },
    AYUDA_FAB,
    CIERRE_GENERICO,
  ];
}

function pasosConfiguracion(): PasoTour[] {
  return [
    BIENVENIDA("Configuración"),
    {
      selector: '[data-tour="config-apariencia"]',
      titulo: "Apariencia",
      descripcion:
        "Elegí el tema claro u oscuro. La preferencia queda guardada en tu navegador y sólo aplica a este dispositivo; si iniciás sesión en otra máquina, ahí elegís de nuevo.",
      lado: "bottom",
    },
    {
      selector: '[data-tour="config-ayuda"]',
      titulo: "Ayuda guiada",
      descripcion:
        "Podés apagar el botón flotante de ayuda si ya no lo necesitás. La preferencia también queda en tu navegador y podés reactivarla desde acá cuando quieras. Al desactivarla, el botón desaparece al instante.",
      lado: "bottom",
    },
    AYUDA_FAB,
    CIERRE_GENERICO,
  ];
}

function pasosAyuda(): PasoTour[] {
  return [
    BIENVENIDA("Centro de ayuda"),
    {
      selector: '[data-tour="ayuda-secciones"]',
      titulo: "Centro de ayuda",
      descripcion:
        "Preguntas frecuentes y enlaces útiles sobre cómo usar la plataforma. Si preferís un recorrido paso a paso de la pantalla en la que estás, usá siempre el botón flotante de ayuda: te explica exactamente lo que ves en la pantalla actual.",
      lado: "bottom",
    },
    AYUDA_FAB,
    CIERRE_GENERICO,
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
