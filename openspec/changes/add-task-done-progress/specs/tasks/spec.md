## ADDED Requirements

### Requirement: El progreso de lo que se está viendo

La interfaz SHALL mostrar en la pantalla de la lista, encima del listado, qué parte de las tareas que se están viendo está en estado «Hecho»: el recuento, escrito como «N de M», y el porcentaje, acompañados de una barra que se llena en esa proporción. La base del cálculo SHALL ser exactamente el conjunto de filas que se están pintando con el filtro aplicado, y no todas las tareas del espacio ni las que trajo la API antes de aplicar el filtro de pantalla. Los números SHALL salir de la lista que la interfaz ya tiene, sin ninguna petición adicional al servidor.

#### Scenario: Recuento y porcentaje de la vista

- **WHEN** la lista está acotada y se ven 4 tareas, de las que 1 está en estado «Hecho»
- **THEN** encima del listado se lee «1 de 4» y «25 %», y la barra está llena en un cuarto

#### Scenario: La vista por defecto no tiene nada hecho a la vista

- **WHEN** se mira la vista por defecto, que deja fuera las tareas hechas, y en ella hay 21 tareas
- **THEN** el indicador dice «0 de 21» y «0 %», porque ninguna de las que se ven está hecha

#### Scenario: Acotada por «Hecho»

- **WHEN** se acota la lista por «Hecho» y hay 7 tareas en ese estado
- **THEN** el indicador dice «7 de 7» y «100 %»

#### Scenario: Se recalcula sin volver a pedir la lista

- **WHEN** desde una fila se cambia el estado de una tarea y, por ello, la tarea sale de la vista
- **THEN** el indicador se recalcula al momento sobre las filas que quedan, sin esperar a ninguna nueva respuesta del servidor

#### Scenario: Ningún dato nuevo

- **WHEN** se carga la pantalla de la lista con el indicador visible
- **THEN** las únicas peticiones a la API son las que la pantalla ya hacía sin el indicador

### Requirement: El indicador solo aparece si hay tareas a la vista

La interfaz SHALL mostrar el indicador de progreso únicamente cuando la lista pinta al menos una tarea. NO SHALL mostrarse mientras la lista carga, ante un error de carga, ni en ninguno de los finales de una lista sin filas: filtro que no existe, filtro válido sin resultados, nada abierto pero sí tareas hechas, y espacio sin ninguna tarea. En esos casos NO SHALL mostrarse un «0 de 0» ni una barra vacía.

#### Scenario: Lista vacía por el filtro

- **WHEN** se acota por «En curso» y no hay ninguna tarea en ese estado
- **THEN** no aparece el indicador, solo el mensaje de que no hay ninguna tarea en ese estado

#### Scenario: Espacio sin tareas

- **WHEN** se entra en la lista de un espacio en el que no se ha creado ninguna tarea
- **THEN** no aparece el indicador, solo la explicación del espacio vacío

#### Scenario: Mientras carga o si falla

- **WHEN** la lista todavía se está cargando, o su carga ha fallado
- **THEN** no aparece el indicador

#### Scenario: Se va con la última fila

- **WHEN** se cambia el estado de la última tarea que quedaba a la vista y la lista se queda sin filas
- **THEN** el indicador desaparece junto con la última fila

### Requirement: El porcentaje no exagera ni esconde

El porcentaje SHALL expresarse como un número entero. SHALL ser «100 %» únicamente cuando todas las tareas a la vista están hechas, y «0 %» únicamente cuando no lo está ninguna; cuando haya alguna hecha y alguna sin hacer, el redondeo NO SHALL dar ninguno de esos dos valores.

#### Scenario: Casi todo hecho

- **WHEN** se ven 200 tareas y 199 están hechas
- **THEN** el porcentaje que se muestra es «99 %», no «100 %»

#### Scenario: Casi nada hecho

- **WHEN** se ven 200 tareas y 1 está hecha
- **THEN** el porcentaje que se muestra es «1 %», no «0 %»

#### Scenario: Redondeo ordinario

- **WHEN** se ven 3 tareas y 2 están hechas
- **THEN** el porcentaje que se muestra es «67 %»

### Requirement: El progreso se percibe sin la vista

El indicador SHALL exponerse a las tecnologías de asistencia como una barra de progreso con nombre propio y con su valor actual, su mínimo y su máximo, y SHALL anunciar el progreso en palabras con el mismo recuento que se lee en pantalla. El recuento y el porcentaje SHALL estar escritos en texto visible, de modo que la información no dependa solo del ancho ni del color de la barra.

#### Scenario: Con lector de pantalla

- **WHEN** un lector de pantalla llega al indicador con 1 de 4 tareas hechas
- **THEN** anuncia una barra de progreso con su nombre y el valor «1 de 4 hechas»

#### Scenario: Sin distinguir colores

- **WHEN** se mira el indicador sin poder distinguir el color de la barra
- **THEN** el recuento y el porcentaje siguen leyéndose en el texto que la acompaña
