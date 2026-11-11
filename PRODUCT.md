# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Personal interno que gestiona un directorio de clínicas: consultan y buscan clínicas por ubicación, editan registros, anotan PDFs en el navegador y (administradores) gestionan usuarios e historial de auditoría. El landing público habla a pacientes, pero es secundario. (Confirmado por el dueño.)

## Product Purpose
Clinics Finder permite encontrar clínicas cercanas (búsqueda por dirección, distancias y tiempos de viaje, mapa con Street View exterior), mantener el directorio de clínicas con roles y auditoría, y anotar PDFs sin que el archivo salga del equipo. Éxito: el equipo encuentra y actualiza una clínica rápido y sin errores.

## Capabilities and Constraints
- Next.js 16 (App Router), React 19, Tailwind v4, next-intl (es por defecto, en), Supabase con RLS, Mapbox, proxy de Street View, editor PDF (pdfjs, pdf-lib).
- Bilingüe es/en; los textos deben pasar por messages/*.json.
- Rutas protegidas: /clinics, /pdf-editor, /admin. Roles: admin y usuario.

## Brand Commitments
- Mantener el logo actual (`public/icon.png`) y el nombre "Clinics Finder".
- Sin otra restricción de marca: paleta, tipografía y tema pueden reemplazarse (decisión del dueño: rediseño del tema).

## Evidence on Hand
Sin testimonios, clientes ni métricas reales; no inventarlos. Las imágenes de `public/signs/` son retratos de ejemplo.

## Product Principles
- Rapidez de operación sobre expresividad: el personal repite tareas a diario.
- Feedback claro en cada acción (sin `alert()` ni recargas bruscas).
- Un solo sistema de tokens como fuente de verdad.
- Accesible y legible por defecto (contraste, foco, objetivos táctiles).

## Accessibility & Inclusion
Sin estándar formal exigido; se apunta a buen contraste y navegación por teclado como buena práctica.
