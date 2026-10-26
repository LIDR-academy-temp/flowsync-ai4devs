# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Las filas que cambian y la rama

Cuántas filas cambian de valor en tu cambio de esquema, medido con una consulta, y en qué rama del
árbol de reversibilidad cae. Si tu migración no toca datos, dilo tal cual: también es una respuesta.

-

## 2. Lo que la batería de pruebas no podía ver

Una cosa que la batería de pruebas no podía ver. Si no encontraste ninguna, escribe qué buscaste y dónde.

-

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

- `make ci-lint` salió con código 2 sin que actionlint llegara a correr: en Git Bash sobre Windows el `-w /repo` del `docker run` llega convertido y Docker contesta literalmente `docker: Error response from daemon: the working directory 'C:/Program Files/Git/repo' is invalid, it needs to be an absolute path` (`make: *** [Makefile:186: ci-lint] Error 125`); el mismo target con `MSYS_NO_PATHCONV=1` sí ejecuta actionlint, y el Makefile ya avisa de que Windows sin WSL no está soportado.
