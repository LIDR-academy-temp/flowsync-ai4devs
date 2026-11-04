# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Cuantas filas aparecieron y que tramo consumio mas tiempo en la mas lenta

El comando `docker compose logs observability | grep "Trace ID" | sort -u | wc -l` arroja 48 lineas.
.

-

## 2. Que cambiaste para conseguir que llegaran

Inicialmente no encontraba ninguna, tras reiniciar con 'make start' y arrancar `observability` corrio sin problemas tras comprobar que @backend/bin/server.ts importaba otel.js y que los puertos y variables de entorno estaban bien configurados.

-

## 3. Tu duda

Dude si el servicio `observability` estaba corriendo cuando realice las trazas manualmente porque la primera medida decia 0 trazas, pero tras reiniciar el servicio las trazas estaban guardadas.

-
