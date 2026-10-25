## Purpose

Ofrecer una API JSON que permita a las personas crear una cuenta, iniciar y cerrar sesión mediante tokens de acceso, y consultar los datos de su propio perfil. Es lo único que el backend hace hoy: todavía no existe ninguna funcionalidad de tareas ni de equipos.

## Requirements

### Requirement: Registro de cuentas

El sistema SHALL permitir crear una cuenta nueva a partir de un nombre completo opcional, un email, una contraseña y la confirmación de esa contraseña, y SHALL iniciar sesión automáticamente en la cuenta recién creada.

#### Scenario: Registro con datos válidos

- **WHEN** se envía una solicitud de registro con un email que no está en uso, una contraseña de entre 8 y 32 caracteres y una confirmación idéntica a la contraseña
- **THEN** el sistema crea la cuenta y responde con los datos públicos de la persona usuaria y un token de acceso listo para usar

#### Scenario: Registro sin nombre completo

- **WHEN** se envía una solicitud de registro válida en la que el nombre completo es nulo
- **THEN** el sistema crea la cuenta igualmente, sin nombre asociado

#### Scenario: Email ya registrado

- **WHEN** se envía una solicitud de registro con un email que ya pertenece a otra cuenta
- **THEN** el sistema rechaza la solicitud con un error de validación sobre el campo email y no crea ninguna cuenta

#### Scenario: Contraseña fuera de longitud

- **WHEN** se envía una solicitud de registro con una contraseña de menos de 8 o de más de 32 caracteres
- **THEN** el sistema rechaza la solicitud con un error de validación sobre el campo contraseña

#### Scenario: Confirmación de contraseña distinta

- **WHEN** se envía una solicitud de registro cuya confirmación de contraseña no coincide con la contraseña
- **THEN** el sistema rechaza la solicitud con un error de validación sobre el campo de confirmación

#### Scenario: Email con formato inválido

- **WHEN** se envía una solicitud de registro con un email que no es una dirección válida o que supera los 254 caracteres
- **THEN** el sistema rechaza la solicitud con un error de validación sobre el campo email

#### Scenario: Varios errores a la vez

- **WHEN** se envía una solicitud de registro con más de un campo inválido
- **THEN** el sistema devuelve en una sola respuesta la lista de errores, cada uno indicando el campo afectado y la regla incumplida

### Requirement: Inicio de sesión

El sistema SHALL permitir iniciar sesión con email y contraseña y SHALL entregar un token de acceso nuevo en cada inicio de sesión correcto.

#### Scenario: Credenciales correctas

- **WHEN** se envía una solicitud de inicio de sesión con el email y la contraseña de una cuenta existente
- **THEN** el sistema responde con los datos públicos de la persona usuaria y un token de acceso

#### Scenario: Sesiones simultáneas

- **WHEN** una misma persona inicia sesión varias veces con credenciales correctas
- **THEN** el sistema entrega un token distinto en cada ocasión y todos ellos permanecen válidos de forma independiente

#### Scenario: Credenciales incorrectas

- **WHEN** se envía una solicitud de inicio de sesión con un email inexistente o con una contraseña que no corresponde a la cuenta
- **THEN** el sistema rechaza la solicitud con un error de credenciales inválidas, sin revelar si fallaron el email o la contraseña, y no entrega ningún token

#### Scenario: Datos de inicio de sesión incompletos o malformados

- **WHEN** se envía una solicitud de inicio de sesión sin contraseña o con un email que no es una dirección válida
- **THEN** el sistema rechaza la solicitud con un error de validación sobre el campo afectado

### Requirement: Consulta del perfil propio

El sistema SHALL devolver, a quien se identifica con un token de acceso válido, los datos de su propia cuenta.

#### Scenario: Consulta con token válido

- **WHEN** se solicita el perfil presentando un token de acceso válido
- **THEN** el sistema responde con el identificador, el nombre completo, el email, las fechas de creación y de última actualización y las iniciales de la persona propietaria del token

#### Scenario: Consulta sin identificación o con token inválido

- **WHEN** se solicita el perfil sin presentar token, o presentando un token desconocido o ya revocado
- **THEN** el sistema rechaza la solicitud como no autenticada y no devuelve ningún dato

#### Scenario: Datos sensibles

- **WHEN** el sistema devuelve los datos de una cuenta, ya sea tras el registro, el inicio de sesión o la consulta del perfil
- **THEN** la respuesta no incluye la contraseña ni ningún derivado de ella

### Requirement: Iniciales de la persona usuaria

El sistema SHALL calcular unas iniciales en mayúsculas para cada cuenta y SHALL incluirlas en los datos públicos de la persona usuaria.

#### Scenario: Nombre completo con nombre y apellido

- **WHEN** la cuenta tiene un nombre completo con al menos dos palabras
- **THEN** las iniciales son la primera letra de la primera palabra seguida de la primera letra de la segunda palabra del nombre, en mayúsculas

#### Scenario: Nombre completo de una sola palabra

- **WHEN** la cuenta tiene un nombre completo formado por una única palabra
- **THEN** las iniciales son las dos primeras letras de esa palabra, en mayúsculas

#### Scenario: Cuenta sin nombre completo

- **WHEN** la cuenta no tiene nombre completo
- **THEN** las iniciales se calculan con la primera letra de la parte del email anterior a la arroba y la primera letra de la parte posterior, en mayúsculas

### Requirement: Cierre de sesión

El sistema SHALL permitir cerrar la sesión revocando el token de acceso con el que se hace la solicitud.

#### Scenario: Cierre de sesión con token válido

- **WHEN** se solicita el cierre de sesión presentando un token de acceso válido
- **THEN** el sistema revoca ese token y responde con un mensaje que confirma que la sesión se cerró correctamente

#### Scenario: Token revocado

- **WHEN** se presenta, tras cerrar sesión, el mismo token en cualquier solicitud que exija identificación
- **THEN** el sistema lo rechaza como no autenticado

#### Scenario: Otras sesiones de la misma cuenta

- **WHEN** una persona con varios tokens válidos cierra sesión con uno de ellos
- **THEN** el resto de sus tokens siguen siendo válidos

#### Scenario: Cierre de sesión sin identificación

- **WHEN** se solicita el cierre de sesión sin presentar un token válido
- **THEN** el sistema rechaza la solicitud como no autenticada

### Requirement: Protección de las operaciones de cuenta

El sistema SHALL exigir un token de acceso válido para consultar el perfil y para cerrar sesión, y SHALL dejar abiertas, sin exigir identificación, las operaciones de registro e inicio de sesión.

#### Scenario: Registro e inicio de sesión sin token

- **WHEN** una persona anónima solicita registrarse o iniciar sesión
- **THEN** el sistema atiende la solicitud sin pedir ningún token

#### Scenario: Operación protegida sin token

- **WHEN** una solicitud a una operación protegida llega sin token de acceso
- **THEN** el sistema responde con un error de no autenticado

### Requirement: Formato uniforme de las respuestas

El sistema SHALL responder siempre en JSON y SHALL envolver los datos de las respuestas correctas de cuenta en un objeto con una clave de datos.

#### Scenario: Respuesta correcta con datos

- **WHEN** el registro, el inicio de sesión o la consulta del perfil se completan con éxito
- **THEN** el cuerpo de la respuesta es un objeto JSON cuyo contenido útil está bajo la clave de datos

#### Scenario: Cliente que no declara aceptar JSON

- **WHEN** una solicitud llega con una cabecera de aceptación distinta de JSON o sin ella
- **THEN** el sistema responde igualmente en JSON, incluidos los errores

#### Scenario: Error de validación

- **WHEN** una solicitud falla la validación de sus datos
- **THEN** el sistema responde con un error de validación cuyo cuerpo contiene una lista de errores, cada uno con su mensaje, la regla incumplida y el campo afectado

### Requirement: Respuesta de comprobación en la raíz

El sistema SHALL responder a una solicitud a la raíz del servicio con un objeto JSON de saludo fijo, sin exigir identificación.

#### Scenario: Solicitud a la raíz

- **WHEN** se solicita la raíz del servicio
- **THEN** el sistema responde con un objeto JSON que contiene la clave de saludo con el valor «world»


1. el agente ha escrito 8 requisitos. Por lo que me ha parecido entender en el codigo, los 8 existen.
2. Esto no lo entiendo.
3. Yo no he tenido que decidir si era un bug o contrato. Lo unico que le he pedido es que en base a codebase, liste las capabilities que existen para crear la spec siguiendo el formato especifico.
