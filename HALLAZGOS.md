# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Dónde aterrizó la pieza y con qué valores con los números que contaste: dentro o fuera del catálogo, cuántos colores a pelo había antes y cuántos después.


La barra se codifico fuera del catalogo en @frontend/src/components/task-progress.tsx; medi que no habia colores a pelo ni antes ni despues de la parte A pero al ampliar el patron si mostro el text-white existente; la barra no usaba colores literales y tenia bg-primary al principio.

-

## 2. Qué crees que decidió eso. Es la pregunta interesante del ejercicio, y la respuesta no está en ningún sitio: se deduce mirando qué información tenía delante el agente cuando escribió. Si tu resultado no es el que esperabas al leer las lecciones, dilo tal cual: es el dato del ejercicio.


Creo que Claude Code reviso los componentes de tareas existentes del frontend en @frontend/src/components/ que al no tener una regla que forzase a revisar, no revisaba nada mas inicialmente (por eso corrigio al pedirle el hook mas tarde) y se limitaba a copiar los componentes visuales cercanos con nomenclatura parecida.

-

## 3. Qué avisó el guardarraíl y qué no pudo ver. Un script solo caza lo que es mecánico; lo demás se queda fuera, y saber cuál es ese resto es la mitad del asunto.


El hook si avisaba de bg-blue-600 y pero no bloqueaba la edición porque es meramente informativo como PostToolUse; no pudo detectar que progress.tsx había quedado fuera del catalogo ni decidir si debía crear o reutilizar la pieza, porque esa decisión requiere contexto que no debia darle en los Prompts y ademas ya tenia en el CLAUDE.md una regla para ello.

-
