# Hallazgos

1. Llegaron 9 trazas distintas, todas de `/api/v1/tasks`; la más lenta fue `POST /api/v1/tasks` con 145,1 ms en el tramo Server, de los que el `insert flowsync.tasks` solo ocupó 4,4 ms: el resto es tiempo de la aplicación, probablemente arranque en frío, porque la segunda creación tardó 27,5 ms.
2. Llegaron a la primera (los receptores del recolector escuchan en `0.0.0.0` desde el principio); al principio solo conté 3 porque el SDK exporta por lotes y conté antes de que se enviaran, y al repetir eran 9.
3. El presupuesto es de 200 peticiones en 28 días con 20.000 supuestas, y me parece poco: son unas 7 al día, así que una caída de pocos minutos o un despliegue lento con el tráfico de un equipo trabajando lo agota.
