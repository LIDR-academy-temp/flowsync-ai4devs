# Hallazgos

## 1. Dónde aterrizó la pieza y con qué valores

- La barra quedó fuera del catálogo, en `frontend/src/components/task-progress.tsx`: las piezas de `components/ui` permanecieron en 5; la medición inicial estrecha de colores dio 0 antes y 0 después de la Parte A, y al ampliar el patrón apareció 1 literal preexistente (`text-white`), por lo que la comparación corregida es 1→1; la barra usó inicialmente `bg-primary` y no añadió colores literales.

## 2. Qué creo que decidió eso

- Creo que el agente siguió la estructura que tenía más cerca —los componentes de tareas ya estaban directamente en `frontend/src/components/`— y, como no había una regla que le exigiera revisar `components/ui`, creó allí otra pieza aunque sí imitó los valores visuales con nombre que encontró en el código.

## 3. Qué avisó el guardarraíl y qué no pudo ver

- El hook avisó de `bg-blue-600` y permitió la edición porque es informativo; no pudo detectar que `task-progress.tsx` había quedado fuera del catálogo ni decidir si debía reutilizar o crear una pieza, porque esa decisión requiere contexto y queda cubierta por la regla de `CLAUDE.md`.