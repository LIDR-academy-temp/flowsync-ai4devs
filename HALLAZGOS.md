# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Dónde aterrizó la pieza

Dónde aterrizó la pieza y con qué valores, con los números que contaste: dentro o fuera del catálogo, cuántos colores a pelo había antes y cuántos después.

Los dos ficheros del componente aterrizaron dentro de la carpeta del catalogo:
frontend/src/components/ui/progress.tsx
frontend/src/components/Progress-bar.tsx

El fichero de documentacion del compoente aterrizo en la carpeta docs:
docs/interfaz/barra-de-progreso.md

El comando grep -c "^  --" frontend/src/index.css  devolvio 59 antes, y el mismo numero después que se agrego la barra de progreso. Crear el componente no añadió nada.

## 2. Qué crees que decidió eso.

Que leyó en el CLAUDE.md la especificación del stack para el frontend, se dice que se usa: **Tailwind v4** (plugin de Vite, sin `tailwind.config.js`; los tokens viven en `src/index.css`), **shadcn/ui** (`components.json`, componentes generados en `src/components/ui/` — se traen con `npx shadcn@latest add <componente>` y no se editan a mano).

## 3. Qué avisó el guardarraíl y qué no pudo ver.

Qué avisó. Al guardar el cambio en progress-bar.tsx, el hook detectó el color hexadecimal en la línea 74 y dejó dos mensajes:
«Color a pelo en frontend/src/components/progress-bar.tsx: #2563eb».

El text-white que ya estaba en ui/button.tsx. El hook solo revisa el texto nuevo de cada Write o Edit, y esa pieza se añadió con npx shadcn add, que corre por Bash.