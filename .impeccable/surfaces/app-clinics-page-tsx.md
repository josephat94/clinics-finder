---
version: 1
slug: "app-clinics-page-tsx"
primary_target: "app/clinics/page.tsx"
related_targets: []
---

# Surface brief: app shell and /clinics (Operate)

Mode: Operate. Redesign of the theme for the whole app (tokens, shell, clinics directory, modals, admin tables). Users: internal staff, daily repeated tasks. Preserve: functions, copy, i18n, logo (public/icon.png). Open: dark mode is not implemented (light only).

## Direction contract

THESIS: Cada clínica es una etiqueta dispensada de farmacia: el estado vive como pegatina auxiliar de color y todo se alinea a una retícula de celdas estricta. Refuses the glass/gradient telemedicine-teal template and the generic admin dashboard.
OWN-WORLD: Papel térmico #ffffff sobre fondo #f4f5f7, tinta navy #14213d, líneas #d9dee7; pegatinas auxiliares naranja #f26b21 (revisar), amarillo #ffd23f (precaución), verde #157a52 (ok), rojo #c0261c (peligro). Una sola familia amable, Figtree, en títulos y cuerpo; datos en mono tabular (Geist Mono). Sin gradientes, sin glass; esquinas de 12 a 20px, sombras suaves y movimiento sobrio (entradas escalonadas, lift al hover, subrayado dibujado) bajo prefers-reduced-motion.
STORY: El personal localiza una clínica, lee estado y datos de un vistazo y actúa (editar, mapa, PDF) sin recargas ni alert(); las pegatinas de estado salen de campos reales; un registro editado en los últimos 7 días lleva pegatina naranja «Actualizada» (la marca «hasta revisarlo» queda pendiente: requiere guardar estado de revisión).
FIRST VIEWPORT: Barra superior blanca con logo, navegación y selector ES/EN siempre visible (menú móvil); debajo título de página, buscador/filtro/orden en una fila, rejilla de etiquetas de clínica 1/2/3 columnas con nombre grande, campos rotulados y pegatina de estado; botón primario navy «Nueva clínica» arriba a la derecha.
FORM: Etiqueta de dispensación, assigned candidate 5 of the grounded list; seed:a63708ce35cdc23b. Raises: from the gate board, a changed record holds its alert color until reviewed; from Crouwel, a single strict cell grid.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
