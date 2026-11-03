1. recrea desde cero la especificacion del modulo de cuentas y acceso del proyecto en este archivo (registro, inicio de sesión, sesión y perfil).  Ten en cuenta para el backend rutas, controladores, modelo de usuario, validadores y middlewares y para el frontend pantallas de acceso, estado de sesión y protección de rutas. La especificacion deberia seguir este formato obligartorio:
## Purpose: una o dos frases que expliquen para qué existe esta capability.

## Requirements: sección que contiene los requisitos, cada uno encabezado por ### Requirement: y redactado con SHALL para indicar lo que debe hacer el sistema.

#### Scenario:: al menos uno por requisito, con dos viñetas: **WHEN***. Incluye las precondiciones dentro de WHEN, sin utilizar GIVEN.

Idioma: español, excepto las palabras clave de la RFC.
Respeta estas tres reglas:

No utilices ADDED, MODIFIED ni REMOVED. Son secciones propias de una especificación de cambios (delta). En este ejercicio nos centramos en documentar el comportamiento actual del sistema.

Describe solo comportamientos observables desde fuera. No incluyas nombres de clases, archivos ni rutas del código. En la API, describe peticiones y respuestas; en el frontend, lo que el usuario ve y puede hacer.

No modifiques el código. Aunque encuentres errores o inconsistencias, déjalos tal como están. Esos hallazgos forman parte del análisis de la parte B.
Basate en lo que ya existe y funciona en el proyecto y no inventes nada por fuera de ello. En caso de tener una duda concreta por favor ask first.

2. update the spec to omit implementation details on the software development process, this spec should be readed by nontechnical profiles. Update every part of this file to achieve this goal.