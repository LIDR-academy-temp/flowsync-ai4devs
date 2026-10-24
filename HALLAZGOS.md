# Hallazgos

## 1. Dónde aterrizó la pieza y con qué valores

con los números que contaste: dentro o fuera del catálogo, cuántos colores a pelo había antes y cuántos después.
-

- La pieza aterrizó fuera del catálogo, en `frontend/src/components/task-progress.tsx`: `components/ui/` tenía 5 piezas antes y sigue con 5. Colores a pelo: 1 antes y 1 después (`text-white` en `ui/button.tsx`, heredado de shadcn), así que no añadió ninguno; para los colores usó solo valores con nombre de `src/index.css` (`bg-primary`, `bg-primary/20`, `bg-background`, `text-muted-foreground`), que siguen siendo 59.


## 2. Qué crees que decidió eso. 

Es la pregunta interesante del ejercicio, y la respuesta no está en ningún sitio: se deduce mirando qué información tenía delante el agente cuando escribió. Si tu resultado no es el que esperabas al leer las lecciones, dilo tal cual: es el dato del ejercicio.
-

El resultado fue el esperado. 
- El promt no hacía referencia al catálogo
- Si bien el claude.mde describe el catálogo, no indica que que una pieza nueva tenga que salir de ahí. 

## 3. Qué avisó el guardarraíl y qué no pudo ver
Un script solo caza lo que es mecánico; lo demás se queda fuera, y saber cuál es ese resto es la mitad del asunto.
-

- Avisó, sin bloquear, de los dos `#2563eb` que metió el agente cuando le pedí el azul a propósito; el agente siguió y lo commiteó igual. 
Lo que no pudo ver es que la la barra de progreso está fuera del catálogo.
