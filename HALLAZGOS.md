# Hallazgos

1. Cuántas trazas aparecieron y qué tramo consumió más tiempo en la más lenta, utilizando los datos que anotaste.

Aparecieron 10 trazas.
Análisis de la traza más lenta:
 - request:  POST /api/v1/auth/signup
 - duración: 143,4 ms
 - De lo que se puede ver en los tramos, el mayor tiempo se lo lleva código sin instrumentar, ya que las consultas a base suman 11.7 ms. 
 - Solamente se están instrumentando la petición HTTP y las consutlas a base de datos. El middleware y el controlador no generan tramos propios.


2. Qué cambiaste para conseguir que llegaran. Si al principio no aparecieron, explica cuál era el problema. Si funcionó al primer intento, indícalo también.

Interpreto que esta pregunta se refiere a si tuve algún problema para que las trazas llegaran al colector. La respuesta es que no tuve problemas, funcionó a la primera.


3. Cuánto presupuesto de error obtuviste, expresado en peticiones, y si te parece mucho o poco para un mes de uso real de FlowSync.

El presupuesto de error es de 200 peticiones en 28 días.

- Si suponemos que el tráfico real se concentra en horario laboral. Las 20.000 peticiones caen en unas 160 horas de trabajo (8 h × 20 días), salen unas 125 por hora. En ese caso, 1,6 horas de caída total en horario laboral se comen todo el presupuesto, y una hora de problemas gasta más del 60 %.
- Cuenta también la lentitud, no solo los errores. Unas pocas peticiones lentas sueltas, por ejemplo justo después de un despliegue, consumen presupuesto aunque nada falle. Cada incumplimiento es el 0,5 % del total.

Dado esto, el presupuesto de 200 peticiones parece ajustado.
