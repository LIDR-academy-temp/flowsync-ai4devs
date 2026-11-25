# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Lo que falló y lo que siguió en verde

Cuántos de tus casos nuevos fallaron y cuántos de los que ya había siguieron en verde, con la cifra
que dio la pantalla. La cifra sale de la salida de `make test-e2e`.

- De mis 7 casos nuevos fallaron 3, y los 40 que ya había siguieron en verde: `make test-e2e` dio «Tests 44 passed, 3 failed (47)», y los tres errores son todos de `Tasks | vencimiento`.

## 2. El caso nuevo que pasó

Cuál de tus casos nuevos pasó, si alguno pasó, y por qué crees que pasó. La respuesta no está en
ningún sitio: se deduce mirando qué tienen en común los que fallaron.

- Pasaron 4 («Vencer hoy todavía no es estar vencida», «Fecha futura», «Sin fecha no se vence nunca» y «Una tarea hecha con la fecha pasada»): los 3 que fallaron necesitan ver `isOverdue: true` en algún momento y los 4 que pasaron solo esperan `false`, así que creo que pasaron porque el endpoint nunca devuelve `true`, no porque la regla esté bien; el unitario lo apoya: con la fecha como `Date`, que es como la entrega `pg`, el día anterior da `false`, y la regla ni siquiera mira el estado.

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

- Dudé de cómo mandar `today` en el `PUT` de la fecha (la spec dice «parámetro», no si va en la query o en el cuerpo) y lo decidí yo leyendo el validador en vez de preguntar; y no pude comprobar el THEN de «Darla por hecha la deja de vencer» ni el de «Aplazar resuelve el vencimiento», porque los dos se pararon antes, en la precondición: la tarea nunca llegó vencida.
