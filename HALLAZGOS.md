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

- Pasaron 4, pero no por lo mismo: «Sin fecha no se vence nunca» no pasa por casualidad, porque pasaría igual con la regla bien hecha; los otros tres («Vencer hoy todavía no es estar vencida», «Fecha futura» y «Una tarea hecha con la fecha pasada») solo esperan `isOverdue: false`, mientras que los 3 que fallaron necesitan ver un `true`, así que creo que esos tres pasan porque el endpoint nunca devuelve `true`, no porque la regla esté bien; el unitario lo apoya: con la fecha como `Date`, que es como la entrega `pg`, el día anterior da `false`, y la regla ni siquiera mira el estado.

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

- Dudé de cómo mandar `today` en el `PUT` de la fecha, pero la duda no estaba abierta: `docs/capabilities/tasks/README.md` ya decía que va en el cuerpo, y yo lo decidí sin preguntar y mal, en la query, porque el validador también lo aceptaba ahí; y no pude comprobar el THEN de «Darla por hecha la deja de vencer» ni el de «Aplazar resuelve el vencimiento», porque los dos se pararon antes, en la precondición: la tarea nunca llegó vencida.
