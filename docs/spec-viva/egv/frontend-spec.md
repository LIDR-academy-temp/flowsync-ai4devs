## Purpose

Ofrecer una aplicación web en castellano con la que una persona pueda crear una cuenta, iniciar y cerrar sesión y ver su perfil. Es lo único que la aplicación hace hoy: todavía no existe ninguna pantalla de tareas ni de equipos.

## Requirements

### Requirement: Registro desde la aplicación

El sistema SHALL ofrecer un formulario de registro con nombre completo opcional, email, contraseña y repetición de la contraseña, y SHALL dejar a la persona con la sesión iniciada cuando el registro tiene éxito.

#### Scenario: Registro correcto

- **WHEN** una persona anónima rellena el formulario de registro con datos válidos y lo envía
- **THEN** el sistema crea la cuenta, inicia la sesión y la lleva a su perfil

#### Scenario: Nombre completo vacío

- **WHEN** una persona deja el nombre completo vacío o con solo espacios y envía el formulario con el resto de datos válidos
- **THEN** el sistema registra la cuenta sin nombre, y el perfil mostrará «Sin nombre»

#### Scenario: Contraseñas distintas

- **WHEN** la contraseña y su repetición no coinciden al enviar el formulario
- **THEN** el sistema muestra el aviso «Las contraseñas no coinciden.» bajo el campo de repetición sin llegar a contactar con el servidor

#### Scenario: Orientación sobre la contraseña

- **WHEN** el formulario de registro se muestra sin errores en el campo de contraseña
- **THEN** el sistema indica bajo ese campo que la contraseña debe tener entre 8 y 32 caracteres

#### Scenario: Envío en curso

- **WHEN** el formulario de registro se está enviando
- **THEN** el botón queda deshabilitado y muestra «Creando cuenta…» hasta recibir respuesta

#### Scenario: Acceso desde el registro al inicio de sesión

- **WHEN** una persona que ya tiene cuenta está en el formulario de registro
- **THEN** el sistema le ofrece un enlace para ir al inicio de sesión

### Requirement: Inicio de sesión desde la aplicación

El sistema SHALL ofrecer un formulario de inicio de sesión con email y contraseña.

#### Scenario: Inicio de sesión correcto

- **WHEN** una persona anónima introduce credenciales correctas y envía el formulario
- **THEN** el sistema inicia la sesión y la lleva a su perfil

#### Scenario: Credenciales incorrectas

- **WHEN** una persona envía un email o una contraseña que el servidor no reconoce
- **THEN** el sistema muestra en un aviso destacado el mensaje «El email o la contraseña no son correctos.»

#### Scenario: Envío en curso

- **WHEN** el formulario de inicio de sesión se está enviando
- **THEN** el botón queda deshabilitado y muestra «Entrando…» hasta recibir respuesta

#### Scenario: Acceso desde el inicio de sesión al registro

- **WHEN** una persona que aún no tiene cuenta está en el formulario de inicio de sesión
- **THEN** el sistema le ofrece un enlace para ir al registro

### Requirement: Errores comprensibles y asociados a su campo

El sistema SHALL traducir los fallos de validación y de comunicación con el servidor a mensajes en castellano y SHALL colocar cada error bajo el campo al que se refiere.

#### Scenario: Error de validación sobre un campo visible

- **WHEN** el servidor rechaza un envío por un problema en un campo que está en pantalla, como un email ya registrado, un email inválido, una contraseña demasiado corta o demasiado larga o un campo obligatorio vacío
- **THEN** el sistema muestra un mensaje explicativo en castellano bajo ese campo, lo marca como inválido y no repite el mensaje en el aviso general

#### Scenario: Email ya registrado

- **WHEN** el servidor informa de que el email indicado en el registro ya existe
- **THEN** el sistema muestra «Ese email ya está registrado. Inicia sesión en su lugar.» bajo el campo de email

#### Scenario: Error sobre un campo que no está en pantalla

- **WHEN** el servidor rechaza un envío por un campo que el formulario actual no muestra
- **THEN** el sistema muestra el mensaje en el aviso general del formulario para que no quede sin enseñar

#### Scenario: Servidor inalcanzable

- **WHEN** el envío de un formulario falla porque no se puede contactar con el servidor
- **THEN** el sistema muestra «No se pudo conectar con el servidor. Comprueba que el backend está arrancado.»

#### Scenario: Error inesperado del servidor

- **WHEN** el servidor responde con un fallo interno u otro error no previsto
- **THEN** el sistema muestra «Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento.»

#### Scenario: Accesibilidad de los errores

- **WHEN** un campo tiene un error mostrado
- **THEN** el campo queda marcado como inválido y el mensaje queda asociado al campo para las tecnologías de apoyo

### Requirement: Persistencia de la sesión entre visitas

El sistema SHALL conservar la sesión en el navegador y SHALL restaurarla al volver a abrir o recargar la aplicación si el servidor sigue reconociéndola.

#### Scenario: Recarga con sesión válida

- **WHEN** una persona con una sesión previa recarga la aplicación y el servidor reconoce su sesión
- **THEN** el sistema recupera sus datos y la mantiene identificada sin pedirle credenciales

#### Scenario: Comprobación en curso

- **WHEN** la aplicación está verificando con el servidor una sesión guardada
- **THEN** el sistema muestra una pantalla de carga con el texto accesible «Cargando…» y no redirige a ninguna otra pantalla hasta terminar

#### Scenario: Sesión caducada o rechazada

- **WHEN** el servidor rechaza la sesión guardada al restaurarla
- **THEN** el sistema olvida esa sesión, lleva a la persona al inicio de sesión y le muestra en un aviso «Tu sesión ha caducado. Vuelve a iniciar sesión.»

#### Scenario: Servidor caído al restaurar

- **WHEN** no se puede contactar con el servidor o este falla mientras se restaura una sesión guardada
- **THEN** el sistema lleva a la persona al inicio de sesión con un aviso que explica el motivo, y una recarga posterior con el servidor disponible restaura la sesión sin pedir credenciales

### Requirement: Pantalla de perfil

El sistema SHALL mostrar a la persona identificada su perfil con sus iniciales, su nombre, su email y la fecha desde la que es miembro.

#### Scenario: Perfil con nombre

- **WHEN** una persona identificada con nombre completo abre su perfil
- **THEN** el sistema muestra un distintivo con sus iniciales, su nombre completo, su email y «Miembro desde» seguido de la fecha de creación de la cuenta en formato largo en castellano

#### Scenario: Perfil sin nombre

- **WHEN** una persona identificada sin nombre completo abre su perfil
- **THEN** el sistema muestra «Sin nombre» en lugar del nombre

### Requirement: Cierre de sesión desde la aplicación

El sistema SHALL permitir cerrar la sesión desde el perfil y SHALL dejar a la persona sin sesión en el navegador aunque el servidor no responda.

#### Scenario: Cierre correcto

- **WHEN** una persona identificada pulsa «Cerrar sesión» en su perfil
- **THEN** el sistema deja de considerarla identificada, borra la sesión guardada en el navegador y la lleva al inicio de sesión

#### Scenario: Cierre en curso

- **WHEN** el cierre de sesión está en marcha
- **THEN** el botón queda deshabilitado y muestra «Cerrando sesión…»

#### Scenario: Servidor no disponible al cerrar sesión

- **WHEN** una persona pulsa «Cerrar sesión» y el servidor no responde o rechaza la solicitud
- **THEN** el sistema cierra igualmente la sesión local y la lleva al inicio de sesión

#### Scenario: Aviso previo descartado

- **WHEN** una persona cierra sesión voluntariamente
- **THEN** el inicio de sesión no muestra ningún aviso sobre sesiones perdidas anteriormente

### Requirement: Acceso a pantallas según el estado de la sesión

El sistema SHALL reservar el perfil a las personas identificadas y el inicio de sesión y el registro a las anónimas, y SHALL redirigir cualquier otra dirección al perfil.

#### Scenario: Perfil sin sesión

- **WHEN** una persona anónima intenta abrir el perfil
- **THEN** el sistema la redirige al inicio de sesión

#### Scenario: Inicio de sesión o registro con sesión activa

- **WHEN** una persona identificada intenta abrir el inicio de sesión o el registro
- **THEN** el sistema la redirige a su perfil

#### Scenario: Dirección desconocida

- **WHEN** se abre una dirección que no corresponde a ninguna pantalla de la aplicación
- **THEN** el sistema redirige al perfil, y desde ahí al inicio de sesión si la persona es anónima

#### Scenario: Recarga en una pantalla protegida

- **WHEN** una persona con sesión guardada recarga la aplicación estando en una pantalla protegida
- **THEN** el sistema espera a verificar la sesión antes de decidir y no la expulsa mientras tanto

1. Escribió 7 requirements. No se mucho sobre Adonis y React, pero por lo que puedo ver en las pages del frontend, si creo que los 7 requerimientos existen de verdad.
2. No veo incoherencias.
3. Lo mismo que en la parte backend. No he tenido que elegir en ningún momento si era bug o contrato, porque simplemente he lanzado un prompt con el objectivo de construir la spec (con sus capabilities) a partir del codebase.