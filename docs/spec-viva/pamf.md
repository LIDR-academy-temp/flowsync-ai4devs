# Especificación: Cuentas y acceso

> Versión 0.1 — borrador derivado de la exploración del código existente (2026-11-01).
> Describe el comportamiento **actual** observable desde fuera (API HTTP y navegador), no el deseado.
> Las dudas se marcan explícitamente con **Duda** y se recogen al final; no deben leerse como comportamiento confirmado.

## Purpose

Permitir que una persona cree una cuenta en FlowSync, inicie y cierre sesión, mantenga su sesión entre recargas del navegador y consulte los datos de su perfil. Cubre tanto la API HTTP (bajo el prefijo `/api/v1`) como la aplicación web que la consume.

## Requirements

### Requirement: Formato de las respuestas de la API

La API SHALL responder siempre en JSON, independientemente de la cabecera `Accept` enviada por el cliente. Las respuestas correctas de registro, inicio de sesión y perfil SHALL envolver su contenido en una propiedad `data`. Las respuestas de error SHALL tener la forma `{ "errors": [ { "message": ... } ] }`, y en los errores de validación cada elemento SHALL incluir además `field` y `rule`.

#### Scenario: Respuesta correcta envuelta en `data`

- **WHEN** un cliente autenticado solicita `GET /api/v1/account/profile`
- **THEN** el cuerpo de la respuesta es un objeto JSON cuya única propiedad de primer nivel es `data`, que contiene el usuario

#### Scenario: Error devuelto como JSON aunque el cliente pida otro formato

- **WHEN** un cliente sin token solicita `GET /api/v1/account/profile` con la cabecera `Accept: text/html`
- **THEN** la respuesta es un 401 con cuerpo JSON `{ "errors": [ { "message": ... } ] }`

#### Scenario: Error de validación con campo y regla

- **WHEN** un cliente envía a `POST /api/v1/auth/signup` un `email` sin formato válido
- **THEN** la respuesta es un 422 y el array `errors` contiene un elemento con `field: "email"`, `rule: "email"` y un `message`

### Requirement: Registro de una cuenta nueva

El sistema SHALL permitir crear una cuenta mediante `POST /api/v1/auth/signup` con `fullName`, `email`, `password` y `passwordConfirmation`. Al registrarse correctamente, el sistema SHALL abrir sesión de inmediato devolviendo el usuario creado y un token de acceso. La contraseña SHALL almacenarse de forma irreversible (hash) y nunca devolverse.

#### Scenario: Registro correcto con nombre

- **WHEN** se envía un email no registrado, un `fullName` "Ada Lovelace", una contraseña de entre 8 y 32 caracteres y una confirmación idéntica
- **THEN** la respuesta es un 200 con `data.user` (con `id`, `fullName`, `email`, `initials`, `createdAt`, `updatedAt`) y `data.token`, una cadena que empieza por `oat_`

#### Scenario: Registro correcto sin nombre

- **WHEN** se envía un registro válido con `fullName: null`
- **THEN** la cuenta se crea y `data.user.fullName` es `null`

#### Scenario: El token del registro ya da acceso

- **WHEN** tras registrarse se usa el `data.token` devuelto como `Authorization: Bearer <token>` contra `GET /api/v1/account/profile`
- **THEN** la respuesta es un 200 con los datos del usuario recién creado

### Requirement: Validación de los datos de registro

El sistema SHALL rechazar con un 422 cualquier registro que no cumpla estas reglas: `fullName` presente como clave (texto o `null`); `email` con formato válido, como máximo 254 caracteres y no registrado previamente; `password` de 8 a 32 caracteres; `passwordConfirmation` de 8 a 32 caracteres e idéntica a `password`. El sistema SHALL tratar los valores de texto vacíos como ausentes.

#### Scenario: Email ya registrado

- **WHEN** se intenta registrar un email que ya pertenece a una cuenta existente
- **THEN** la respuesta es un 422 con un error en `field: "email"` y `rule: "database.unique"`, y no se crea ninguna cuenta

#### Scenario: Contraseña demasiado corta

- **WHEN** se envía una `password` de 7 caracteres
- **THEN** la respuesta es un 422 con un error en `field: "password"` y `rule: "minLength"`

#### Scenario: Contraseña demasiado larga

- **WHEN** se envía una `password` de 33 caracteres
- **THEN** la respuesta es un 422 con un error en `field: "password"` y `rule: "maxLength"`

#### Scenario: Confirmación distinta

- **WHEN** `passwordConfirmation` difiere de `password`
- **THEN** la respuesta es un 422 con un error en `field: "passwordConfirmation"` y `rule: "sameAs"`

#### Scenario: Falta la clave `fullName`

- **WHEN** se envía un registro por lo demás válido pero sin la propiedad `fullName`
- **THEN** la respuesta es un 422 con un error en `field: "fullName"` y `rule: "required"`

#### Scenario: Email vacío

- **WHEN** se envía `email: ""`
- **THEN** la respuesta es un 422 con un error en `field: "email"` y `rule: "required"`

> **Duda (D1):** el email no parece normalizarse (ni minúsculas ni recorte de espacios) y la comparación de unicidad parece sensible a mayúsculas, por lo que `Ana@x.com` y `ana@x.com` podrían dar lugar a dos cuentas distintas. Pendiente de verificar ejecutando el sistema.

### Requirement: Inicio de sesión

El sistema SHALL permitir iniciar sesión mediante `POST /api/v1/auth/login` con `email` y `password`. Con credenciales correctas SHALL devolver el usuario y un token de acceso **nuevo** en cada inicio de sesión, sin invalidar los tokens emitidos anteriormente.

#### Scenario: Credenciales correctas

- **WHEN** existe una cuenta con email `ana@x.com` y se envían ese email y su contraseña
- **THEN** la respuesta es un 200 con `data.user` y `data.token`

#### Scenario: Sesiones simultáneas

- **WHEN** la misma cuenta inicia sesión dos veces y obtiene dos tokens distintos
- **THEN** ambos tokens dan acceso a `GET /api/v1/account/profile`

### Requirement: Rechazo de credenciales incorrectas

Ante credenciales incorrectas el sistema SHALL responder con un 400 y SHALL dar la misma respuesta tanto si el email no existe como si la contraseña es errónea, sin revelar cuál de los dos ha fallado.

#### Scenario: Contraseña errónea

- **WHEN** se envía el email de una cuenta existente con una contraseña que no es la suya
- **THEN** la respuesta es un 400 con un error genérico de credenciales inválidas y no se emite token

#### Scenario: Email inexistente

- **WHEN** se envía un email con formato válido que no pertenece a ninguna cuenta
- **THEN** la respuesta es idéntica (código y cuerpo) a la del escenario de contraseña errónea

> **Duda (D2):** el registro sí revela si un email existe (error `database.unique`), lo que anula en la práctica la protección del inicio de sesión frente a la enumeración de cuentas. No está claro si es una decisión aceptada.

### Requirement: Validación de los datos de inicio de sesión

El sistema SHALL rechazar con un 422, antes de comprobar credenciales, un inicio de sesión cuyo `email` no tenga formato válido o supere 254 caracteres, o cuya `password` esté ausente o vacía. La `password` del inicio de sesión SHALL NOT estar sujeta a límites de longitud.

#### Scenario: Email con formato inválido

- **WHEN** se envía `email: "no-es-un-email"` y cualquier contraseña
- **THEN** la respuesta es un 422 con un error en `field: "email"`

#### Scenario: Contraseña vacía

- **WHEN** se envía un email válido y `password: ""`
- **THEN** la respuesta es un 422 con un error en `field: "password"` y `rule: "required"`

### Requirement: Acceso autenticado por token

Las rutas bajo `/api/v1/account/` SHALL exigir un token de acceso válido en la cabecera `Authorization: Bearer <token>`. Sin token, con un token desconocido o con un token revocado, el sistema SHALL responder con un 401.

#### Scenario: Sin cabecera de autorización

- **WHEN** se solicita `GET /api/v1/account/profile` sin cabecera `Authorization`
- **THEN** la respuesta es un 401

#### Scenario: Token manipulado

- **WHEN** se solicita `GET /api/v1/account/profile` con un token alterado o inventado
- **THEN** la respuesta es un 401

### Requirement: Vigencia de los tokens

Un token de acceso SHALL seguir siendo válido mientras no se revoque mediante el cierre de sesión.

#### Scenario: Token antiguo sigue funcionando

- **WHEN** se usa un token emitido hace tiempo que no ha sido revocado
- **THEN** `GET /api/v1/account/profile` responde con un 200

> **Duda (D3):** los tokens no tienen caducidad configurada. Se desconoce si es intencionado o si debería existir una caducidad. Mientras tanto, el mensaje del cliente «Tu sesión ha caducado» solo aparece cuando el token ha sido revocado o es inválido, no por paso del tiempo.

### Requirement: Consulta del perfil

El sistema SHALL devolver, mediante `GET /api/v1/account/profile`, los datos del usuario dueño del token: `id`, `fullName` (texto o `null`), `email`, `initials`, `createdAt` y `updatedAt`. La respuesta SHALL NOT incluir la contraseña ni su hash. El perfil SHALL ser de solo lectura: no existe forma de editarlo, cambiar la contraseña ni eliminar la cuenta.

#### Scenario: Perfil del usuario autenticado

- **WHEN** un usuario autenticado solicita su perfil
- **THEN** la respuesta es un 200 con `data` conteniendo exactamente `id`, `fullName`, `email`, `initials`, `createdAt` y `updatedAt`, sin ningún campo de contraseña

### Requirement: Iniciales del usuario

El sistema SHALL calcular las iniciales en mayúsculas así: si el usuario tiene nombre con al menos dos palabras, la primera letra de las dos primeras palabras; si el nombre tiene una sola palabra, sus dos primeras letras; si no tiene nombre, la primera letra de la parte del email anterior a `@` seguida de la primera letra de la parte posterior.

#### Scenario: Nombre de dos palabras

- **WHEN** el usuario se llama "Ada Lovelace"
- **THEN** `initials` vale `AL`

#### Scenario: Nombre de una palabra

- **WHEN** el usuario se llama "Ada"
- **THEN** `initials` vale `AD`

#### Scenario: Sin nombre

- **WHEN** el usuario no tiene nombre y su email es `ana@xmail.com`
- **THEN** `initials` vale `AX`

> **Duda (D4):** el caso sin nombre usa la inicial del dominio, lo que no parece intencionado. Tampoco está definido el resultado para nombres con espacios iniciales o dobles espacios.

### Requirement: Cierre de sesión en la API

El sistema SHALL permitir cerrar sesión mediante `POST /api/v1/account/logout`, revocando **solo** el token con el que se hace la petición. Los demás tokens de la misma cuenta SHALL seguir siendo válidos. La respuesta correcta SHALL ser `{ "message": "Logged out successfully" }`, sin envoltorio `data`.

#### Scenario: Logout revoca el token usado

- **WHEN** un usuario autenticado llama a `POST /api/v1/account/logout` con su token
- **THEN** la respuesta es un 200 con `{ "message": "Logged out successfully" }` y una petición posterior a `GET /api/v1/account/profile` con ese mismo token responde con un 401

#### Scenario: Otros tokens no se ven afectados

- **WHEN** una cuenta tiene dos tokens activos y cierra sesión con uno de ellos
- **THEN** el otro token sigue dando acceso al perfil

> **Duda (D5):** la respuesta del logout es la única que no usa el envoltorio `data`. No consta si es intencionado. Tampoco existe forma de cerrar todas las sesiones de una cuenta.

### Requirement: Navegación según el estado de la sesión (web)

La aplicación web SHALL ofrecer las pantallas `/login`, `/register` y `/profile`. Sin sesión, `/profile` SHALL redirigir a `/login`. Con sesión, `/login` y `/register` SHALL redirigir a `/profile`. Cualquier otra ruta SHALL redirigir a `/profile`, y desde ahí a `/login` si no hay sesión. Mientras se comprueba una sesión guardada, la aplicación SHALL mostrar un indicador de carga a pantalla completa en lugar de redirigir.

#### Scenario: Visitante anónimo intenta ver el perfil

- **WHEN** una persona sin sesión abre `/profile`
- **THEN** la aplicación la lleva a `/login`

#### Scenario: Usuario con sesión abre el login

- **WHEN** una persona con sesión activa abre `/login` o `/register`
- **THEN** la aplicación la lleva a `/profile`

#### Scenario: Ruta desconocida

- **WHEN** una persona sin sesión abre `/cualquier-cosa`
- **THEN** la aplicación termina mostrando `/login`

#### Scenario: Recarga con sesión guardada

- **WHEN** una persona con un token guardado recarga `/profile`
- **THEN** ve un indicador de carga hasta que se confirma la sesión, y no es expulsada a `/login` durante esa espera

### Requirement: Persistencia y restauración de la sesión (web)

La aplicación web SHALL guardar el token en el almacenamiento local del navegador al registrarse o iniciar sesión, y SHALL validarlo contra el perfil de la API al cargar la aplicación. Si la API rechaza el token, SHALL descartarlo y avisar de que la sesión ha caducado. Si la API no está disponible o falla, SHALL mostrar la aplicación sin sesión pero conservar el token, de modo que una recarga posterior con la API disponible restaure la sesión.

#### Scenario: Sesión restaurada tras recargar

- **WHEN** hay un token guardado válido y se recarga la aplicación
- **THEN** la persona sigue autenticada y ve su perfil

#### Scenario: Token rechazado al recargar

- **WHEN** hay un token guardado que la API rechaza con un 401 y se recarga la aplicación
- **THEN** el token se elimina del navegador y la pantalla de login muestra «Tu sesión ha caducado. Vuelve a iniciar sesión.»

#### Scenario: API caída al recargar

- **WHEN** hay un token guardado y la API no responde al cargar la aplicación
- **THEN** se muestra la pantalla de login con «No se pudo conectar con el servidor. Comprueba que el backend está arrancado.», el token sigue guardado, y al recargar con la API ya disponible la sesión se restaura

> **Duda (D6):** el aviso de sesión perdida solo se muestra en la pantalla de login; si la persona navega a `/register`, no lo ve. No consta si es intencionado.

### Requirement: Formulario de registro (web)

La pantalla de registro SHALL pedir nombre completo (opcional), email, contraseña y confirmación, e indicar «Entre 8 y 32 caracteres» bajo la contraseña. Si las contraseñas no coinciden, SHALL mostrar el error bajo la confirmación sin llamar a la API. Si el nombre queda vacío o solo con espacios, SHALL enviarlo como ausente (`null`). Durante el envío, el botón SHALL mostrar «Creando cuenta…» y estar deshabilitado. Tras un registro correcto, SHALL llevar a la persona a su perfil con la sesión iniciada.

#### Scenario: Contraseñas distintas en el cliente

- **WHEN** la persona escribe contraseñas distintas y pulsa «Crear cuenta»
- **THEN** aparece «Las contraseñas no coinciden.» bajo el campo de confirmación y no se realiza ninguna petición a la API

#### Scenario: Registro correcto

- **WHEN** la persona rellena datos válidos y pulsa «Crear cuenta»
- **THEN** el botón muestra «Creando cuenta…» mientras espera y, al terminar, se muestra su perfil

#### Scenario: Nombre en blanco

- **WHEN** la persona deja el nombre con solo espacios y completa el resto correctamente
- **THEN** la cuenta se crea sin nombre y el perfil muestra «Sin nombre»

### Requirement: Formulario de inicio de sesión (web)

La pantalla de inicio de sesión SHALL pedir email y contraseña, mostrar «Entrando…» con el botón deshabilitado durante el envío y llevar al perfil tras un inicio de sesión correcto. Las validaciones nativas del navegador SHALL NOT impedir el envío; la validación la realiza la API.

#### Scenario: Inicio de sesión correcto

- **WHEN** la persona introduce credenciales válidas y pulsa «Entrar»
- **THEN** el botón muestra «Entrando…» y, al terminar, se muestra su perfil

#### Scenario: Credenciales incorrectas

- **WHEN** la persona introduce una contraseña errónea y pulsa «Entrar»
- **THEN** aparece un aviso general «El email o la contraseña no son correctos.» y el botón vuelve a estar disponible

### Requirement: Presentación de errores en los formularios (web)

La aplicación web SHALL mostrar los errores de validación de la API en castellano y bajo el campo afectado, como máximo uno por campo. Los errores que no correspondan a un campo visible SHALL mostrarse en un aviso general sobre el formulario. Los fallos de conexión y de servidor SHALL mostrarse como aviso general con un mensaje específico.

Mensajes mostrados por tipo de error:

| Situación | Mensaje |
|---|---|
| Email ya registrado | «Ese email ya está registrado. Inicia sesión en su lugar.» |
| Contraseñas no coinciden | «Las contraseñas no coinciden.» |
| Email con formato inválido | «Introduce una dirección de email válida.» |
| Campo obligatorio vacío | «Falta rellenar \<campo\>.» |
| Longitud mínima | «\<campo\> debe tener al menos N caracteres.» |
| Longitud máxima | «\<campo\> no puede superar los N caracteres.» |
| Otra regla | «Revisa \<campo\>.» |
| Credenciales incorrectas (400) | «El email o la contraseña no son correctos.» |
| Sesión rechazada (401) | «Tu sesión ha caducado. Vuelve a iniciar sesión.» |
| Sin conexión con la API | «No se pudo conectar con el servidor. Comprueba que el backend está arrancado.» |
| Otro error del servidor | «Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento.» |

Donde \<campo\> es «el nombre», «el email», «la contraseña» o «la confirmación de la contraseña».

#### Scenario: Email duplicado en el registro

- **WHEN** la persona intenta registrarse con un email ya existente
- **THEN** aparece «Ese email ya está registrado. Inicia sesión en su lugar.» bajo el campo email y no se muestra aviso general

#### Scenario: Contraseña corta en el registro

- **WHEN** la persona envía una contraseña de 5 caracteres (iguales en ambos campos)
- **THEN** aparece bajo el campo contraseña un mensaje que indica que debe tener al menos 8 caracteres

#### Scenario: API caída al enviar

- **WHEN** la API no está disponible y la persona envía cualquiera de los dos formularios
- **THEN** aparece el aviso general «No se pudo conectar con el servidor. Comprueba que el backend está arrancado.»

> **Duda (D7):** los mensajes de longitud empiezan en minúscula («la contraseña debe tener…»), lo que parece un descuido de redacción.
>
> **Duda (D8):** el cliente interpreta **cualquier** 400 como credenciales incorrectas. Hoy solo el inicio de sesión produce ese código, pero no está garantizado que siga siendo así.

### Requirement: Pantalla de perfil (web)

La pantalla de perfil SHALL mostrar un avatar con las iniciales del usuario, su nombre completo (o «Sin nombre» si no tiene), su email y la fecha de alta como «Miembro desde» en formato de fecha largo en español (por ejemplo, «1 de noviembre de 2026»).

#### Scenario: Usuario con nombre

- **WHEN** una persona llamada "Ada Lovelace", registrada el 1 de noviembre de 2026, abre su perfil
- **THEN** ve el avatar «AL», el nombre «Ada Lovelace», su email y «Miembro desde 1 de noviembre de 2026»

#### Scenario: Usuario sin nombre

- **WHEN** una persona registrada sin nombre abre su perfil
- **THEN** ve «Sin nombre» en lugar del nombre

### Requirement: Cierre de sesión (web)

Al pulsar «Cerrar sesión», la aplicación web SHALL mostrar «Cerrando sesión…», eliminar la sesión del navegador de inmediato y llevar a la persona a `/login`, y SHALL solicitar a la API la revocación del token. Un fallo en esa solicitud SHALL NOT impedir el cierre de sesión en el navegador ni mostrarse como error.

#### Scenario: Cierre de sesión normal

- **WHEN** una persona autenticada pulsa «Cerrar sesión» en su perfil
- **THEN** pasa a la pantalla de login, el token deja de estar guardado en el navegador y la API deja de aceptarlo

#### Scenario: API caída al cerrar sesión

- **WHEN** la API no está disponible y la persona pulsa «Cerrar sesión»
- **THEN** pasa igualmente a la pantalla de login sin ver ningún error

> **Duda (D9):** en el escenario anterior el token no se revoca en el servidor y sigue siendo válido indefinidamente (ver D3). No consta si este riesgo está aceptado.

## Dudas abiertas

| Id | Duda | Origen |
|---|---|---|
| D1 | ¿El email distingue mayúsculas en el registro y el inicio de sesión? Inferido del código, no comprobado. | Registro |
| D2 | El registro permite averiguar qué emails tienen cuenta; ¿se acepta? | Registro / Login |
| D3 | Los tokens no caducan nunca; ¿es intencionado? | Sesión |
| D4 | Iniciales sin nombre usan la inicial del dominio del email; casos con espacios sin definir. | Perfil |
| D5 | El logout no usa el envoltorio `data`; no existe «cerrar todas las sesiones». | Logout |
| D6 | El aviso de sesión perdida no se ve en la pantalla de registro. | Web |
| D7 | Mensajes de longitud empiezan en minúscula. | Web |
| D8 | Cualquier 400 se muestra como «credenciales incorrectas». | Web |
| D9 | Si el logout falla en el servidor, el token sigue vivo sin caducidad. | Web / Sesión |

Ninguno de estos comportamientos está cubierto hoy por tests automáticos; esta especificación se ha obtenido leyendo el código, no ejecutándolo.

---

## Parte B - Auditoría humana de la spec viva

> **Fecha:** 1 de noviembre de 2026. Esta sección recoge la comprobación posterior realizada por la persona que entrega el ejercicio. No forma parte de los requisitos generados originalmente por Claude y no modifica su redacción.

### 1. Requisitos generados y comprobados

- **Requisitos generados por el agente:** 18.
- **Requisitos comprobados personalmente contrastando el código:** 3.
- **Requisitos sin comprobación individual completa:** 15.

Los tres requisitos comprobados son:

| Requisito | Evidencia de la revisión humana |
|---|---|
| **Registro de una cuenta nueva** | Revisión del validador, controlador, modelo, transformación de usuario y mecanismo de hash. Pruebas HTTP 200 con nombre y con `fullName: null`, entrega del token y acceso posterior a `GET /api/v1/account/profile`. La contraseña no aparece en las respuestas examinadas. No se inspeccionó el hash directamente en SQLite. |
| **Validación de los datos de registro** | Revisión de `backend/app/validators/user.ts` y `backend/config/bodyparser.ts`. Pruebas HTTP 422 para email duplicado, vacío e inválido, contraseña de 7 y 33 caracteres, confirmación diferente y ausencia de la clave `fullName`. También se probaron los límites de longitud del email y el nombre vacío. |
| **Formulario de registro (web)** | Revisión de `register-page.tsx`, `api.ts`, `use-auth-form.ts`, `field-error.tsx`, `auth-provider.tsx` y el enrutamiento. Pruebas en navegador de email duplicado, confirmación distinta sin POST y registro con nombre formado solo por espacios, que terminó en `/profile` mostrando «Sin nombre». El estado «Creando cuenta…» está respaldado por el código, pero no se cronometró ni observó específicamente durante una petición lenta. |

El resto de requisitos no se da por verificado por el mero hecho de haber localizado o leído archivos relacionados. La revisión se concentró en los tres requisitos anteriores.

### 2. Incoherencias detectadas

- **Nombre opcional en el formulario frente a clave obligatoria en la API.** La pantalla presenta el nombre como opcional y envía `fullName: null` cuando se deja vacío o con espacios; sin embargo, si un consumidor HTTP omite la propiedad `fullName`, el backend responde 422 (`required`). **Dónde:** requisito «Formulario de registro (web)» y requisito «Validación de los datos de registro»; `frontend/src/pages/register-page.tsx` y `backend/app/validators/user.ts`. **Evidencia:** prueba con `fullName: null` → 200; petición sin esa propiedad → 422.
- **Redacción imprecisa sobre las cadenas vacías.** El requisito «Validación de los datos de registro» dice que los valores de texto vacíos se tratan «como ausentes». Técnicamente, el parser convierte `""` en `null`, sin eliminar la propiedad: `fullName: ""` se acepta y queda como `null`, mientras que `email: ""` provoca un 422 (`required`). **Dónde:** requisito «Validación de los datos de registro»; `backend/config/bodyparser.ts` y `backend/app/validators/user.ts`. **Evidencia:** ambas respuestas HTTP se comprobaron. Es una imprecisión del texto de la spec, no una prueba de fallo funcional.

### 3. Comportamiento ambiguo: ¿bug o contrato?

**Caso: omitir por completo `fullName` durante el registro.**

- **Comportamiento observado:** `POST /api/v1/auth/signup` devuelve 422 (`fullName` / `required`) cuando la propiedad no existe, pero acepta `fullName: null` y crea la cuenta con HTTP 200. El formulario web evita el problema porque siempre envía la propiedad.
- **Interpretación A - posible bug:** si el nombre es conceptualmente opcional, cualquier cliente debería poder no enviarlo; exigir la clave sería una restricción accidental del validador.
- **Interpretación B - contrato deliberado:** la API exige declarar explícitamente el campo, aunque el valor pueda ser `null`; el frontend implementa precisamente ese contrato.
- **Por qué no se puede resolver solo leyendo el código:** la implementación demuestra qué acepta y qué rechaza, pero no documenta si esa exigencia de presencia es una decisión de producto o una consecuencia no intencionada del esquema de validación. Se necesitaría aclaración del responsable funcional antes de cambiar el requisito o el código.
