# Hallazgos

1. Llegaron 12 trazas distintas; la más lenta fue `POST /api/v1/auth/signup` (83 ms), donde el tramo `Server` consumió los 83 ms y sus consultas a la base solo sumaron 14,3 ms; en `/api/v1/tasks`, la más lenta fue `GET` con 41,8 ms, de los que 13,4 ms fueron de base.
2. No hubo que cambiar nada de la instrumentación: el primer recuento dio 0 porque medí sin haber generado tráfico contra la API, y al usar la aplicación desde el navegador y esperar unos segundos las trazas llegaron.
3. Son 200 peticiones de presupuesto (20.000 × 1 %), unas 7 al día; me parece poco para un mes de uso real de FlowSync, porque alcanza para fallos sueltos, pero con el uso concentrado en horario laboral una caída de pocas horas lo gasta entero.
