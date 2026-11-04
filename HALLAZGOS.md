# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Cuántas trazas aparecieron y qué tramo consumió más tiempo en la más lenta?

Han llegado 25 trazas con 115 spans en total. La más lenta tardó 69,94 ms: GET /api/v1/account/profile (traza 03155623…, a las 02:52:40 UTC).

## 2. Qué cambiaste para conseguir que llegaran. Si al principio no aparecieron, explica cuál era el problema. Si funcionó al primer intento, indícalo también.

Las trazas llegaron al primer intento. El backend envía por OTLP/HTTP a localhost:4318 y el collector las escribe enteras en su log.

## 3. Cuánto presupuesto de error obtuviste, expresado en peticiones, y si te parece mucho o poco para un mes de uso real de FlowSync.

El presupuesto es de 200 peticiones malas cada 28 días: el 1 % de las 20.000 peticiones supuestas. Como número es poco. Como tolerancia de cara a las personas usuarias no es exigente.

Por qué es poco
- Un solo incidente lo agota. Con 6 personas en 20 días laborables, 20.000 peticiones son unas 125 por hora de oficina. Una caída total de hora y media en horario de trabajo consume el mes entero. Ese 99 % suena a unas 6,7 h de margen, pero al medirse por peticiones y no por tiempo, el margen real en horas de uso es mucho menor.
- Pocas peticiones lentas también lo gastan. Basta un despliegue que deje una ruta por encima de 500 ms durante media mañana.

Por qué no es poco exigente
- Una pantalla son varias peticiones. El frontend no hace polling: lo he comprobado y no hay setInterval ni nada parecido. Pero en las trazas, cada carga de la lista lanzó unas 6 peticiones GET /api/v1/tasks seguidas. Así, 200 peticiones malas son unas 33 pantallas fallidas al mes, unas 5 o 6 por persona. Es decir, que a cada persona se le rompa la lista una vez por semana. Para una herramienta que pretende sustituir la ronda de la daily, eso se nota, pero se tolera.

-
