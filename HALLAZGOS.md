# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Los casos nuevos que fallaron y los que ya había

Cuántos de tus casos nuevos fallaron y cuántos de los que ya había siguieron en verde, con la cifra que te dio la pantalla.

- Fallaron 5 de los 15 casos nuevos (3 de 7 funcionales en `make test-e2e`, 2 de 8 unitarios en `make test-unit`) y los 40 tests anteriores siguieron en verde: los 3 funcionales que exigían ver vencida una tarea con fecha pasada recibieron `isOverdue: false` porque PostgreSQL entrega `dueDate` como `Date` aunque el tipo declarado diga `string`, el unitario «done con fecha anterior» devolvió `true` porque `isOverdueOn` no comprueba el estado, y el unitario «fecha anterior como texto y como Date» dio `true` con texto y `false` con `Date`.

## 2. Los casos nuevos que pasaron y por qué

Cuál de tus casos nuevos pasó, si alguno pasó, y por qué crees que pasó.

- Pasaron 10 de los 15 (4 funcionales y 6 unitarios), y el verde engañoso es el de los unitarios «fecha igual» y «fecha posterior» como `Date`, junto con el funcional «una tarea hecha con la fecha pasada no llega vencida»: los tres esperaban `false` y pasaron porque comparar un `Date` con un texto `AAAA-MM-DD` devuelve siempre `false`, no porque la regla funcione; lo que tienen en común los que fallaron es que todos necesitaban un `true` o un estado `done` distinguido.

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

- Dudé de si el verde de los casos «fecha igual» y «fecha posterior» con `Date` demostraba que la regla era compatible con `string` y con `Date`, y los tests mostraron que no: el caso «fecha anterior» con `Date` dio `false` donde con texto daba `true`.
