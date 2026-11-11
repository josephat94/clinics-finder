---
name: Clinics Finder
description: Directorio interno de clínicas como etiquetas de dispensación de farmacia, con papel blanco, tinta navy, pegatinas de estado en pastilla y movimiento sobrio.
colors:
  background: "#f4f5f7"
  paper: "#eceef2"
  card: "#ffffff"
  ink-navy: "#14213d"
  muted-slate: "#4a5568"
  line: "#d9dee7"
  link-blue: "#1d4ed8"
  sticker-orange: "#f26b21"
  sticker-orange-soft: "#fff1e8"
  sticker-yellow: "#ffd23f"
  sticker-yellow-soft: "#fff8dc"
  sticker-green: "#157a52"
  sticker-green-soft: "#e6f4ee"
  sticker-red: "#c0261c"
  sticker-red-soft: "#fdecea"
typography:
  hero:
    fontFamily: "Figtree, Segoe UI, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  page-title:
    fontFamily: "Figtree, Segoe UI, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  heading:
    fontFamily: "Figtree, Segoe UI, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Figtree, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  data:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    fontFeature: "tabular-nums"
  label:
    fontFamily: "Figtree, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  card: "24px"
  grid-gap: "24px"
  modal: "24px"
components:
  button-primary:
    backgroundColor: "{colors.ink-navy}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    height: "40px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.link-blue}"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.xl}"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.sticker-red}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
  badge-ok:
    backgroundColor: "{colors.sticker-green}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  badge-caution:
    backgroundColor: "{colors.sticker-yellow}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.full}"
  badge-updated:
    backgroundColor: "{colors.sticker-orange}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.full}"
  badge-danger:
    backgroundColor: "{colors.sticker-red}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "8px 12px"
---

# Design System: Clinics Finder

## Overview

**Creative North Star: "La etiqueta de dispensación"**

Cada clínica es una etiqueta de farmacia: papel blanco sobre un fondo gris frío, tinta navy, campos rotulados separados por filetes y el estado como pegatina de color. El sistema es denso y de herramienta diaria; la expresividad se gasta en el color de estado y en un movimiento corto, no en superficies decorativas. Sin gradientes, sin vidrio, sin desenfoque. Las esquinas son amables y las sombras suaves y difusas.

La app sirve a personal interno que repite tareas (buscar, leer estado, editar, abrir mapa o PDF), así que la jerarquía es de lectura rápida: nombre grande en Figtree bold, campos rotulados en mono tabular, pegatina de estado arriba. Solo existe tema claro (`color-scheme: light`); el modo oscuro no está entregado.

Estado de entrega, dicho con honestidad: la pegatina naranja existe como «Actualizada» (registro editado en los últimos 7 días, derivado de `updated_at`). La marca naranja «hasta revisarlo», que retiene el color hasta que alguien revise, no se entregó porque exige guardar un estado de revisión. El landing conserva su rejilla de tarjetas con icono. El filtro de /clinics sigue en dos bandas (buscador de inventario y barra de filtro/orden).

**Key Characteristics:**
- Papel #ffffff sobre #f4f5f7, tinta navy #14213d, líneas #d9dee7.
- Cuatro pegatinas de estado en pastilla, cada una con un único trabajo.
- Dos familias: Figtree (títulos y cuerpo) y Geist Mono tabular (datos).
- Esquinas de 12 a 20px, sombra suave, solo tema claro.
- Movimiento de entrada escalonado, siempre condicionado a `prefers-reduced-motion: no-preference`.

## Colors

Paleta de papel y tinta con color reservado para el estado: casi todo es navy, blanco y gris; el color aparece solo donde algo significa algo.

### Primary
- **Tinta navy** (`ink-navy`): texto, botón primario, borde de botón outline, filete superior del dato de distancia, `accent-color` de checkbox y radio.
- **Azul de enlace y foco** (`link-blue`): anillo de foco, hover del botón primario, enlaces de sitio web. No es color de marca de superficie.

### Secondary (pegatinas de estado)
- **Naranja** (`sticker-orange`, suave `sticker-orange-soft`): «Actualizada» (cambio en 7 días) y tercer puesto por tiempo de viaje.
- **Amarillo** (`sticker-yellow`, suave `sticker-yellow-soft`): precaución (clínica deshabilitada, sin coordenadas), primer puesto por tiempo, subrayado de la navegación activa y selección de texto.
- **Verde** (`sticker-green`, suave `sticker-green-soft`): activa/ok, éxito de toast.
- **Rojo** (`sticker-red`, suave `sticker-red-soft`): lista negra, error, acción destructiva.

### Neutral
- **Fondo frío** (`background`): lienzo de página.
- **Papel** (`paper`): hover de botones y filas, badge neutro, segundo puesto.
- **Tarjeta** (`card`): etiquetas, barras, campos, modales.
- **Pizarra** (`muted-slate`): texto secundario y rótulos.
- **Línea** (`line`): bordes, divisores y bloques de esqueleto (`bg-hub-line`).

### Named Rules
**The One Job Rule.** Cada color de pegatina tiene un solo significado (naranja = cambiado, amarillo = precaución, verde = ok, rojo = peligro). No se usa un color de estado como decoración.

**The Real Field Rule.** Una pegatina de estado se deriva de un campo real del registro (`banned`, `enabled`, `lat/lng`, `updated_at`). No se pinta un estado que los datos no respaldan.

## Typography

**Display Font:** Figtree (con Segoe UI, sans-serif), pesos 400 a 800 cargados; variable `--font-figtree`
**Body Font:** Figtree (misma familia)
**Label/Mono Font:** Geist Mono (con ui-monospace), variable `--font-geist-mono`

**Character:** Una sola sans geométrica y cálida, con peso bold para nombrar y regular para leer, y mono con cifras tabulares para teléfonos, distancias y datos.

### Hierarchy
- **Hero** (Figtree 700, 3rem a 4.5rem según breakpoint, tracking ajustado): solo el titular del landing.
- **Page title** (Figtree 700, 1.875rem/30px, -0.01em): título de página, p. ej. «N clínicas».
- **Heading** (Figtree 700, 1.5rem/24px, interlínea 1.25): nombre de la clínica en cada etiqueta y títulos de sección del landing (1.875 a 2.25rem). h1 a h4 llevan -0.01em.
- **Brand** (Figtree 700, 1.25rem): nombre en la barra superior.
- **Body** (Figtree 400, 1rem; 14px en controles pequeños): texto general.
- **Data** (Geist Mono, 14px, cifras tabulares, clase `.tabular`): valores de campo, distancia.
- **Label** (Figtree 600, 12px, color pizarra, sin mayúsculas): rótulo de campo dentro de la etiqueta y texto de pegatina.

### Named Rules
**The Tabular Data Rule.** Todo valor que se compara o se marca por teléfono (teléfonos, fax, distancias, ids) va en mono tabular.

**The Sentence Case Rule.** Rótulos y pegatinas van en minúsculas con inicial de frase; ningún texto de interfaz se pone en mayúsculas.

## Layout

Retícula de celdas. Contenedor de página con `py-8 md:py-12 px-4` y separación vertical de 24px entre bandas. Las etiquetas de clínica van en rejilla de 1 columna en móvil, 2 desde `md` y 3 desde `lg` (modo lista: 1 columna), con 24px de separación y altura igualada. Dentro de cada etiqueta, los campos forman una rejilla `dl` de 1 columna en móvil y 2 desde `sm` (separación 20px por 16px), bajo un filete `line`; dirección, email y horario ocupan ambas columnas. Relleno de tarjeta 24px (las etiquetas de clínica), de modal 24px, de tarjeta de landing 32px. Los objetivos táctiles de navegación y campos miden 44px de alto. La barra superior es una fila blanca con borde inferior; en móvil la navegación se pliega en un botón de menú y el selector de idioma queda visible. Puntos de corte de Tailwind: 640, 768, 1024 y 1536px.

## Elevation & Depth

Híbrido suave: borde de 1px más una sombra difusa de bajo contraste en reposo; la tarjeta se eleva al pasar el cursor. Las sombras son de tinta navy translúcida, nunca negras duras ni desplazadas.

### Shadow Vocabulary
- **Reposo de superficie** (`box-shadow: 0 1px 2px rgba(20, 33, 61, 0.05), 0 6px 20px rgba(20, 33, 61, 0.05)`): tarjeta, modal y barra de filtro (`.glass-card`).
- **Hover de tarjeta** (`box-shadow: 0 2px 4px rgba(20, 33, 61, 0.06), 0 14px 32px rgba(20, 33, 61, 0.1)`, borde `#b9c1d0`, `translateY(-3px)`): solo con `prefers-reduced-motion: no-preference`, en `.glass-card-hover`.
- **Tarjeta destacada** (`shadow-sm` más anillo tenue del color de su pegatina): primer, segundo y tercer puesto por tiempo de viaje.
- **Toast** (`shadow-md`): único elemento flotante con sombra mayor.
- **Velo de modal** (`bg-hub-fg/60`, navy al 60%): fondo del diálogo.

### Named Rules
**The Soft Lift Rule.** La sombra es difusa y de tinta navy; solo crece como respuesta al cursor o a la flotación real (toast, modal). Nunca una sombra dura desplazada.

## Shapes

Esquinas amables con escala `@theme`: `--radius-sm` 0.5rem (8px), `--radius-md` 0.75rem (12px), `--radius-lg` 1rem (16px), `--radius-xl` 1.25rem (20px). Tarjetas y modales: 16px (`.glass-card`). Botones y toast: 20px (`rounded-xl`). Campos, botón de menú y bloques de icono: 12px (`rounded-md`). Pegatinas: pastilla completa (`rounded-full`). Bordes de 1px en `line`; el dato de distancia lleva un filete sólido navy. Las tarjetas destacadas por tiempo de viaje usan borde de 2px más anillo tenue del color de su pegatina.

## Components

### Buttons
- **Shape:** esquina de 20px (`rounded-xl`); alturas 32/40/48px (sm/md/lg), peso semibold.
- **Primary:** fondo navy, texto blanco; hover pasa a azul de enlace. Una acción primaria por banda («Nueva clínica»).
- **Secondary / Outline / Ghost:** secundario = superficie `.glass-card`; outline = borde navy sobre blanco; ghost = transparente. Hover en `paper`. También se usan como conmutadores (activo = primary, inactivo = outline).
- **Danger:** fondo rojo, texto blanco, anillo de foco rojo.
- **Focus / Active:** anillo de 2px azul con separación de 2px; presionado `active:scale-[0.97]`; deshabilitado al 50%. Transición de 200ms.

### Badges (pegatinas)
- **Style:** pastilla (`rounded-full`), semibold, sin mayúsculas, texto de 12px (tamaño sm) con relleno 8px por 2px. Verde y rojo con texto blanco; amarillo y naranja con texto navy; neutro en `paper`.
- **Uso:** estado de la clínica al inicio de la etiqueta (Lista negra, Deshabilitada, Sin coordenadas, Actualizada, Activa) y tiempo de viaje flotante en la esquina de la tarjeta.
- **Actualizada:** lleva un punto con pulso suave (`.sticker-ping`, 2.2s, bajo `no-preference`).

### Cards / Containers
- **Corner Style:** 16px. **Background:** blanco con borde `line`. **Shadow:** suave en reposo, elevación al hover, ver Elevation.
- **Estructura de etiqueta:** pegatinas, nombre en Figtree bold 24px, rejilla de campos rotulados bajo un filete, notas, y dato de distancia al pie con filete navy.
- **Estado excluido:** una clínica en lista negra lleva tachado y texto pizarra en nombre y dirección.

### Inputs / Fields
- **Style:** fondo blanco, borde `line` (`.glass-field`), esquina de 12px, alto mínimo 44px, marcador en pizarra. Checkbox y radio con `accent-color` navy.
- **Focus:** anillo azul de 2px con separación. **Error:** anillo rojo y mensaje rojo con `role="alert"`.

### Navigation
- Barra blanca con borde inferior. Enlaces semibold de 14px en pizarra; el activo va en navy con subrayado amarillo de 2px. Logo (`icon.png`) más nombre en Figtree bold. En móvil, botón de menú de 44px con borde y esquina de 12px.

### Modal y Toast
- **Modal:** superficie `.glass-card` (16px), cabecera con borde inferior y título semibold de 20px; atrapa el foco, cierra con Escape, entra con resorte.
- **Toast:** esquina de 20px, relleno sólido (verde éxito, rojo error, navy info), abajo a la derecha, entra con `.toast-in` (380ms, sube y escala desde 0.97); sustituye a `alert()`.

### Skeleton
- Bloques en `line` (`bg-hub-line`) con `animate-pulse`; esquina de 4px (circular para avatares).

### Movimiento
- **Easing:** `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`, definido solo bajo `no-preference`.
- **Entrada escalonada (`.rise`):** 520ms, sube 14px con fundido; `--i` fija el índice con retardo de 55ms por paso y tope en 8. Se usa en el titular del landing y en cada tarjeta de la lista de clínicas.
- **Aparición con scroll (`.reveal-on-scroll`):** `animation-timeline: view()` con rango `entry 0% a 35%`, mejora progresiva dentro de `@supports`; se usa en las tarjetas del landing.
- **Subrayado dibujado (`.underline-draw`):** filete de 0.14em que se dibuja una vez en 700ms; solo en el titular del landing.
- **Hover de tarjeta (`.glass-card-hover`):** 280ms, se eleva 3px.
- Todo lo anterior se envuelve en `prefers-reduced-motion: no-preference`; con `reduce` solo se fuerza `scroll-behavior: auto`.

## Do's and Don'ts

### Do:
- **Do** usar navy `#14213d` para texto y acción primaria, y reservar los colores de pegatina para estado real.
- **Do** componer cada registro como etiqueta: pegatinas, nombre en Figtree bold, campos rotulados en mono tabular.
- **Do** mantener tarjetas y modales en 16px, campos en 12px, botones en 20px, pegatinas en pastilla, y borde de 1px `#d9dee7`.
- **Do** usar el anillo de foco azul de 2px en todo control interactivo y objetivos de 44px en navegación y campos.
- **Do** envolver cada animación en `prefers-reduced-motion: no-preference` y escalonar entradas con `--i`.
- **Do** informar acciones con toast, nunca con `alert()`.

### Don't:
- **Don't** usar gradientes de superficie, vidrio o desenfoque; el nombre `glass-*` de las clases es heredado y no describe el sistema.
- **Don't** usar un color de pegatina fuera de su significado.
- **Don't** añadir sombras duras desplazadas ni sombras de adorno; la sombra suave responde a superficie, cursor o flotación.
- **Don't** introducir tema oscuro sin definir antes sus tokens; hoy solo existe el claro.
- **Don't** mostrar una pegatina de estado que no salga de un campo real.
- **Don't** poner rótulos, pegatinas ni etiquetas en mayúsculas.

## Not canonized

Defectos o desvíos de lo construido que no forman parte del sistema y no deben heredarse: iconos tipográficos de react-icons (Fa*) en menús y botones, junto a Phosphor en la navegación, sin una librería de iconos única; rótulos en mayúsculas con tracking que sobreviven en `ClinicHistoryDetailModal.tsx` y `weekly-schedule-editor.tsx` (contradicen la regla de minúsculas); insignia flotante en `-top-4 -right-4` que sale del borde de la tarjeta; anillos de resplandor en las tarjetas destacadas; variante `Badge info` mapeada a naranja (el nombre no dice «actualizada»); subrayado naranja del titular del landing (`.underline-draw`) que usa el color de «cambiado» como adorno y choca con The One Job Rule; clases `rounded-md` y `rounded-2xl` en Modal y Card que `.glass-card` anula por orden de cascada; `app/design-system/page.tsx` con `text-black` y títulos fuera del sistema; landing con rejilla de tarjetas con icono; filtro en dos bandas; ausencia de la marca naranja «hasta revisarlo».
