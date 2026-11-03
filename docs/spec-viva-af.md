# Spec viva — Cuentas y acceso

> **Qué documenta:** el comportamiento **actual** de la capacidad de cuentas y acceso de FlowSync: alta de cuenta, inicio de sesión, restauración y cierre de sesión, y consulta del perfil. Describe la API y lo que el usuario observa en la interfaz.
> **Rama de referencia:** `spec-viva-af` (commit `da921c7`).
> **Cómo se lee:** los *requisitos* dicen lo que el sistema hace y debe seguir haciendo; la *evidencia* dice dónde está en el código; las *comprobaciones pendientes* y las *dudas* dicen lo que todavía no está verificado o decidido.
> **Alcance:** esta spec no incluye el dominio de tareas ni ninguna funcionalidad futura. Las decisiones de producto que aún no están tomadas aparecen al final, en *Dudas sobre bug o contrato*, y **no** se han convertido en requisitos.

---

## Purpose

Cuentas y acceso da a una persona la capacidad de crear su cuenta, entrar con ella, recuperar su sesión cuando vuelve al navegador y cerrarla, y consultar los datos de su propio perfil. El sistema es stateless: toda la autenticación descansa en un token de acceso opaco que el navegador conserva y que el servidor valida en cada petición.

---

## Requirements

### Requirement: El alta de una cuenta abre sesión en la misma respuesta

El sistema SHALL crear la cuenta y SHALL devolver una sesión iniciada en la misma respuesta, sin exigir un paso posterior de inicio de sesión.

#### Scenario: Alta válida
- **WHEN** se envía el formulario de alta con un email libre, una contraseña de 8 a 32 caracteres, su confirmación coincidente y un nombre
- **THEN** la API responde 200 con el perfil de la cuenta recién creada y un token de acceso, y la interfaz entra en la vista de perfil sin volver a pedir credenciales

#### Scenario: La respuesta no expone la contraseña
- **WHEN** el alta se completa correctamente
- **THEN** el perfil devuelto contiene identificador, nombre, email, iniciales, fecha de alta y fecha de modificación, y no contiene ningún campo de contraseña

### Requirement: El formulario de alta envía siempre el nombre completo

El formulario de alta SHALL incluir la clave del nombre completo en la petición, con el valor `null` cuando el campo queda vacío.

#### Scenario: Nombre en blanco
- **WHEN** el campo de nombre completo se deja vacío
- **THEN** la petición incluye la clave del nombre con valor `null`, y la cuenta se crea sin nombre

#### Scenario: Nombre con espacios sobrantes
- **WHEN** el campo de nombre completo contiene texto
- **THEN** la petición incluye la clave del nombre con el texto sin espacios al principio ni al final

### Requirement: La API exige la presencia del nombre completo y admite su valor nulo

La API SHALL rechazar una petición de alta en la que falte la clave del nombre completo, y SHALL aceptar una petición de alta en la que esa clave viaje con valor `null`.

#### Scenario: Omisión de la clave
- **WHEN** se envía directamente a la API una petición de alta que no incluye la clave del nombre completo, y los demás datos son válidos
- **THEN** la API rechaza la petición con un error de campo obligatorio en el nombre completo, y no se crea ninguna cuenta

#### Scenario: Nombre a null
- **WHEN** se envía directamente a la API una petición de alta con la clave del nombre completo a `null` y los demás datos son válidos
- **THEN** la API acepta la petición y la cuenta se crea sin nombre

### Requirement: La confirmación de contraseña es obligatoria y debe coincidir

El sistema SHALL exigir la clave de confirmación de contraseña en toda petición de alta, y SHALL rechazar la petición cuando su valor no coincida con la contraseña.

#### Scenario: Confirmación ausente
- **WHEN** se envía directamente a la API una petición de alta que no incluye la clave de confirmación de contraseña, y los demás datos son válidos
- **THEN** la API responde 422 con un error de campo obligatorio en la confirmación de contraseña, y no se crea ninguna cuenta

#### Scenario: Confirmación distinta en una petición directa a la API
- **WHEN** se envía directamente a la API una petición de alta cuya confirmación de contraseña no coincide con la contraseña, y los demás datos son válidos
- **THEN** la API responde 422 con un error de campo en la confirmación de contraseña, y no se crea ninguna cuenta

#### Scenario: Comprobación anticipada en el formulario
- **WHEN** en el formulario de alta las dos contraseñas no coinciden y se envía el formulario
- **THEN** no se realiza ninguna petición al servidor y el error se muestra bajo el campo de confirmación

### Requirement: Los datos de alta inválidos se señalan junto a su campo

El sistema SHALL responder 422 cuando un dato del alta no cumpla las reglas, e indicar el campo y la regla incumplida.

#### Scenario: Email con formato inválido
- **WHEN** se envía un email con formato inválido y los demás datos de alta son válidos
- **THEN** la API responde 422 señalando el campo del email, y la interfaz muestra el aviso bajo ese campo

#### Scenario: Contraseña demasiado corta
- **WHEN** se envía una contraseña de menos de 8 caracteres y los demás datos de alta son válidos
- **THEN** la API responde 422 señalando el campo de la contraseña, y la interfaz muestra el aviso bajo ese campo

#### Scenario: Contraseña demasiado larga
- **WHEN** se envía una contraseña de más de 32 caracteres y los demás datos de alta son válidos
- **THEN** la API responde 422 señalando el campo de la contraseña

### Requirement: El email es único

El sistema SHALL rechazar el alta de una cuenta cuyo email ya esté registrado.

#### Scenario: Email ya registrado
- **WHEN** se envía un alta con un email que ya pertenece a otra cuenta y los demás datos de alta son válidos
- **THEN** la API responde 422, y la interfaz muestra «Ese email ya está registrado. Inicia sesión en su lugar.»

### Requirement: El inicio de sesión con credenciales correctas abre la sesión

El sistema SHALL autenticar con email y contraseña correctos y SHALL devolver el perfil de la cuenta y un token de acceso.

#### Scenario: Credenciales correctas
- **WHEN** se envía el formulario de inicio de sesión con el email y la contraseña de una cuenta existente
- **THEN** la API responde 200 con el perfil y un token de acceso, y la interfaz entra en la vista de perfil

### Requirement: Las credenciales incorrectas no dan acceso

El sistema SHALL rechazar el inicio de sesión con credenciales incorrectas y SHALL explicar el motivo sin revelar si el email existe.

#### Scenario: Contraseña incorrecta
- **WHEN** se envía el email de una cuenta existente con una contraseña que no es la suya
- **THEN** la API responde 400, y la interfaz muestra «El email o la contraseña no son correctos.» y no accede a la vista de perfil

#### Scenario: Email inexistente
- **WHEN** se envía un email que no corresponde a ninguna cuenta
- **THEN** la API responde 400 con el mismo mensaje que en el caso anterior

### Requirement: El email se valida al iniciar sesión

El sistema SHALL exigir que el email tenga un formato válido en el inicio de sesión.

#### Scenario: Email mal formado en el inicio de sesión
- **WHEN** se envía un email con formato inválido y la contraseña es válida
- **THEN** la API responde 422 señalando el campo del email, y la interfaz muestra el aviso bajo ese campo

### Requirement: La sesión se restaura al recargar la página

El sistema SHALL conservar la sesión entre recargas de página y SHALL validarla contra el servidor antes de dar por buena una sesión guardada.

#### Scenario: Recarga con token válido
- **WHEN** se recarga la página en un navegador que tiene un token guardado y el servidor reconoce ese token
- **THEN** la interfaz pide los datos del usuario al servidor y entra directamente en la vista de perfil, sin mostrar el formulario de inicio de sesión

#### Scenario: La restauración consulta el perfil
- **WHEN** el navegador tiene un token guardado y la aplicación arranca
- **THEN** la interfaz solicita GET /api/v1/account/profile con ese token y espera su respuesta antes de decidir si deja entrar

### Requirement: Un token no reconocido cierra la sesión

El sistema SHALL eliminar el token guardado cuando el servidor lo rechace y SHALL explicar que la sesión se perdió.

#### Scenario: Token rechazado
- **WHEN** el servidor responde 401 a la comprobación del token guardado
- **THEN** el token se elimina del navegador, la interfaz queda como visitante y la pantalla de inicio de sesión muestra «Tu sesión ha caducado. Vuelve a iniciar sesión.»

### Requirement: Un servidor no disponible no borra la sesión guardada

El sistema SHALL conservar el token guardado cuando la comprobación falle por un motivo distinto de un token rechazado, y SHALL avisar al usuario.

#### Scenario: Backend caído al arrancar
- **WHEN** la comprobación del token guardado falla porque el servidor no está disponible o devuelve un error que no sea un rechazo del token
- **THEN** el token se conserva en el navegador, la interfaz queda como visitante y la pantalla de inicio de sesión muestra el motivo del fallo

#### Scenario: Recuperación tras el corte
- **WHEN** el servidor vuelve a estar disponible, se recarga la página con el token conservado y ese token sigue siendo válido
- **THEN** la sesión se restablece y la interfaz entra en la vista de perfil

### Requirement: Cerrar sesión revoca el token en el servidor cuando la petición llega y se procesa

El sistema SHALL invalidar el token de acceso en el servidor cuando el usuario cierra sesión y la petición de cierre de sesión llega al servidor y se procesa correctamente.

#### Scenario: Cierre de sesión
- **WHEN** el usuario pulsa «Cerrar sesión» en la vista de perfil y la petición de cierre de sesión llega al servidor y se procesa correctamente
- **THEN** la interfaz envía POST /api/v1/account/logout con el token de acceso, el servidor elimina ese token y las peticiones posteriores con el mismo token son rechazadas con 401

### Requirement: El cierre de sesión local no depende del servidor

El sistema SHALL cerrar la sesión en el navegador aunque la petición de cierre de sesión no se complete.

#### Scenario: Cierre de sesión con el servidor caído
- **WHEN** el usuario pulsa «Cerrar sesión» y la petición al servidor no llega a completarse
- **THEN** la sesión local se cierra igualmente y el usuario vuelve a la pantalla de inicio de sesión

### Requirement: La vista de perfil exige sesión

El sistema SHALL impedir el acceso a la vista de perfil sin una sesión válida.

#### Scenario: Acceso sin sesión
- **WHEN** se abre la ruta de perfil sin una sesión válida
- **THEN** la interfaz redirige a la pantalla de inicio de sesión y no muestra ningún dato de cuenta

#### Scenario: Navegación atrás tras cerrar sesión
- **WHEN** el usuario cierra sesión y después vuelve atrás en el navegador
- **THEN** la vista de perfil vuelve a redirigir al inicio de sesión

### Requirement: El inicio de sesión y el alta no son accesibles con sesión activa

El sistema SHALL redirigir a la vista de perfil a quien intente abrir el inicio de sesión o el alta con una sesión activa.

#### Scenario: Inicio de sesión con sesión activa
- **WHEN** se abre la pantalla de inicio de sesión con una sesión activa
- **THEN** la interfaz redirige a la vista de perfil

### Requirement: Las rutas desconocidas llevan al perfil

El sistema SHALL redirigir cualquier ruta no reconocida a la vista de perfil.

#### Scenario: Ruta inexistente
- **WHEN** se abre una ruta que la aplicación no reconoce
- **THEN** la interfaz redirige a la vista de perfil, que a su vez lleva al inicio de sesión si no hay sesión

### Requirement: El perfil se consulta con GET

El sistema SHALL obtener los datos de la cuenta mediante GET /api/v1/account/profile.

#### Scenario: Consulta del perfil
- **WHEN** la interfaz necesita los datos del usuario de la sesión
- **THEN** envía GET /api/v1/account/profile con el token de acceso y recibe el perfil de la cuenta

### Requirement: La vista de perfil muestra los datos de la cuenta

El sistema SHALL mostrar en la vista de perfil las iniciales, el nombre, el email y la fecha de alta de la cuenta en sesión.

#### Scenario: Perfil con nombre
- **WHEN** se abre la vista de perfil con una cuenta que tiene nombre
- **THEN** se muestran las iniciales calculadas a partir del nombre, el nombre, el email y la fecha de alta

#### Scenario: Perfil sin nombre
- **WHEN** se abre la vista de perfil con una cuenta sin nombre
- **THEN** se muestran las iniciales calculadas a partir del email, el texto «Sin nombre» en lugar del nombre, y el email

### Requirement: Los errores de conexión se explican en el alta, el inicio de sesión y la restauración

El sistema SHALL informar de forma comprensible cuando la API no está disponible al enviar el formulario de alta, al enviar el formulario de inicio de sesión o al comprobar si una sesión guardada sigue siendo válida.

#### Scenario: Servidor inaccesible al iniciar sesión
- **WHEN** se envía el formulario de inicio de sesión y la petición a la API no llega a completarse porque el servidor no está disponible
- **THEN** la interfaz muestra «No se pudo conectar con el servidor. Comprueba que el backend está arrancado.» y no se abre ninguna sesión

#### Scenario: Servidor inaccesible al comprobar la sesión guardada
- **WHEN** la aplicación comprueba si el token guardado sigue siendo válido y la petición a la API no llega a completarse porque el servidor no está disponible
- **THEN** la pantalla de inicio de sesión muestra «No se pudo conectar con el servidor. Comprueba que el backend está arrancado.» y el token se conserva en el navegador

#### Scenario: El cierre de sesión no avisa de un fallo de conexión
- **WHEN** el usuario pulsa «Cerrar sesión» y la petición de cierre de sesión no llega a completarse
- **THEN** no se muestra ningún aviso de error de conexión, y la sesión local se cierra igualmente

### Requirement: Los errores de campo no se duplican

El sistema SHALL mostrar cada error de validación junto a su campo y SHALL mostrar en un aviso general únicamente los errores que no correspondan a un campo visible.

#### Scenario: Todos los errores tienen campo en pantalla
- **WHEN** la validación falla en campos que la pantalla muestra
- **THEN** cada mensaje aparece junto a su campo y no hay aviso general adicional

#### Scenario: Un error no corresponde a ningún campo visible
- **WHEN** la validación falla en un campo que la pantalla no muestra
- **THEN** ese error aparece en el aviso general de la pantalla

---

## Evidencia de la exploración

**Origen de toda la evidencia: lectura de código.** No he ejecutado la aplicación, ni el servidor de desarrollo, ni ninguna prueba automatizada, ni he enviado una sola petición HTTP real. Las referencias a la versión instalada de las librerías son lectura de su código fuente en `node_modules`, no observación de su comportamiento en ejecución. Todo lo que depende de una respuesta real del servidor figura en *Comprobaciones pendientes*.

### Trazabilidad de los requisitos

| Requisito | Evidencia |
|---|---|
| El alta de una cuenta abre sesión en la misma respuesta | `backend/app/controllers/new_account_controller.ts:8` (validación), `:10` (alta), `:11` (emisión de token), `:13-16` (respuesta) · `backend/start/routes.ts:22` (ruta) |
| …la respuesta no expone la contraseña | `backend/app/transformers/user_transformer.ts:6-13` (campos proyectados) · `backend/database/migrations/1761885935168_create_users_table.ts:11` (columna `password`) · `backend/app/models/user.ts:7` (mixin de cifrado) |
| El formulario de alta envía siempre el nombre completo | `frontend/src/pages/register-page.tsx:42` (`trim() \|\| null`) · `frontend/src/lib/types.ts:22-23` (el tipo declara la clave obligatoria) · `frontend/src/lib/api.ts:123` (el cuerpo se serializa entero) |
| La API exige la presencia del nombre completo y admite su valor nulo | `backend/app/validators/user.ts:13` (`.nullable()`) · `@vinejs/vine/build/index.js:690` (`isOptional: false` por defecto), `:808` (`.nullable()` → modificador de null), `:302-304` (el modificador de null hereda `isOptional` del padre) · `@vinejs/compiler/build/index.js:115-118` (existencia: `ensureIsDefined`), `:690-695` (`ensureIsDefined` solo falla con `undefined`) |
| La confirmación de contraseña es obligatoria y debe coincidir | `backend/app/validators/user.ts:7` (longitud compartida), `:16` (`.sameAs('password')`) · `@vinejs/compiler/build/index.js:115-118` (`ensureExists`), `:683-688` (falla con `undefined` o `null`) · `frontend/src/pages/register-page.tsx:34-35` (comprobación previa en cliente) |
| Los datos de alta inválidos se señalan junto a su campo | `backend/app/validators/user.ts:6-7`, `:12-17` (reglas) · `frontend/src/lib/api.ts:87-95` (extracción de errores por campo), `:46-67` (traducción de reglas) · `frontend/src/auth/use-auth-form.ts:35-50` (reparto entre campo y aviso general) |
| El email es único | `backend/app/validators/user.ts:14` (regla `unique`) · `backend/database/migrations/1761885935168_create_users_table.ts:10` (`unique` en la columna) · `frontend/src/lib/api.ts:50-53` (mensaje específico para email duplicado) |
| El inicio de sesión con credenciales correctas abre la sesión | `backend/app/controllers/access_tokens_controller.ts:8` (validación), `:10` (verificación de credenciales), `:11` (token), `:13-16` (respuesta) · `backend/start/routes.ts:23` (ruta) · `frontend/src/lib/api.ts:149-154` (llamada) |
| Las credenciales incorrectas no dan acceso | `backend/app/models/user.ts:7` (verificación de credenciales) · `frontend/src/lib/api.ts:83-85` (400 → mensaje de credenciales) · `frontend/src/pages/login-page.tsx:36-40` (aviso mostrado) |
| El email se valida al iniciar sesión | `backend/app/validators/user.ts:6` (regla de email), `:24` (aplicada en el inicio de sesión) · `frontend/src/lib/api.ts:56-57` (mensaje de formato) |
| La sesión se restaura al recargar la página | `frontend/src/auth/auth-provider.tsx:7`, `:9`, `:16-18` (token en `localStorage`, estado inicial `loading`), `:43-56` (rehidratación) · `frontend/src/routes/protected-route.tsx:12` (espera durante la rehidratación) |
| Un token no reconocido cierra la sesión | `frontend/src/auth/auth-provider.tsx:60-62` (rama 401 → `clearSession()`), `:23-28` (borrado de la clave del navegador), `:72-76` (motivo) · `frontend/src/lib/api.ts:75-80` (401 → mensaje de sesión caducada) · `frontend/src/pages/login-page.tsx:23` (el motivo se pinta en el login) |
| Un servidor no disponible no borra la sesión guardada | `frontend/src/auth/auth-provider.tsx:63-70` (rama distinta de 401: conserva el token), `:67` (el estado pasa a visitante sin tocar el almacenamiento del navegador) · `frontend/src/lib/api.ts:125-130` (error de red) |
| Cerrar sesión revoca el token en el servidor cuando la petición llega y se procesa | `backend/app/controllers/access_tokens_controller.ts:19-23` (borrado del token) · `backend/app/models/user.ts:8` (proveedor de tokens) · `backend/database/migrations/1768620764696_create_access_tokens_table.ts:9-15` (relación con la cuenta), `:19` (hash almacenado), `:24` (caducidad) · `frontend/src/lib/api.ts:162-166` (llamada) · `frontend/src/pages/profile-page.tsx:27` (acción) |
| El cierre de sesión local no depende del servidor | `frontend/src/auth/auth-provider.tsx:98-107` (cierre local antes de la llamada, error ignorado en `:105`) |
| La vista de perfil exige sesión | `backend/start/routes.ts:30`, `:35` (grupo protegido por el guard de autenticación) · `backend/app/middleware/auth_middleware.ts:17` (rechazo sin token) · `frontend/src/routes/protected-route.tsx:12-13` (redirección) |
| El inicio de sesión y el alta no son accesibles con sesión activa | `frontend/src/routes/app-routes.tsx:11-14` · `frontend/src/routes/public-only-route.tsx:12-13` |
| Las rutas desconocidas llevan al perfil | `frontend/src/routes/app-routes.tsx:20` |
| El perfil se consulta con GET | `backend/start/routes.ts:30` (`router.get`) · `frontend/src/lib/api.ts:156-160` (llamada sin método) y `:112` (GET por defecto), `:116` (cabecera `Authorization: Bearer`) · `backend/app/controllers/profile_controller.ts:6` |
| La vista de perfil muestra los datos de la cuenta | `frontend/src/pages/profile-page.tsx:36` (iniciales), `:18`, `:22` · `backend/app/models/user.ts:11-17` (cálculo de iniciales) |
| Los errores de conexión se explican en el alta, el inicio de sesión y la restauración | `frontend/src/lib/api.ts:125-130` (mensaje) · `frontend/src/auth/use-auth-form.ts:44-51` (el mensaje llega al aviso general del formulario) · `frontend/src/auth/auth-provider.tsx:72-76` (el motivo se guarda para pintarlo en el inicio de sesión) · `frontend/src/auth/auth-provider.tsx:105` (el cierre de sesión descarta el error y no avisa) |
| Los errores de campo no se duplican | `frontend/src/auth/use-auth-form.ts:35-50` (cálculo de `isShownInline`) · `frontend/src/pages/login-page.tsx:36-40` y `frontend/src/pages/register-page.tsx` (pintado del aviso general) |

### Piezas del sistema que sostienen los requisitos

| Pieza | Dónde | Qué sostiene |
|---|---|---|
| Tabla de rutas | `backend/start/routes.ts:14`, `:22`, `:23`, `:30`, `:31`, `:35` | Alta, inicio de sesión, perfil, cierre de sesión y el grupo protegido |
| Stack de middleware | `backend/start/kernel.ts:25-29`, `:35-41`, `:47-49` | Forzado de respuesta JSON, CORS, comprobación silenciosa de token y guard de autenticación |
| Guard por defecto | `backend/config/auth.ts:10`, `:16-21` | Autenticación por token opaco en todas las rutas protegidas |
| Comprobación silenciosa | `backend/app/middleware/silent_auth_middleware.ts:12` | Adjunta el usuario si hay token, sin rechazar la petición |
| Envolvtorio de respuestas | `backend/providers/api_provider.ts:18`, `:59` | La forma `{ data: ... }` de las respuestas de la API |
| Esquema de `users` | `backend/database/migrations/1761885935168_create_users_table.ts:8-14` | `full_name` nullable, `email` único, `password` cifrada |
| Esquema de tokens | `backend/database/migrations/1768620764696_create_access_tokens_table.ts:9-15`, `:19`, `:24` | Token opaco con hash almacenado, ligado a la cuenta y con cascada al borrar la cuenta |
| Capa de API del cliente | `frontend/src/lib/api.ts:3`, `:110-140`, `:142-166` | URL de la API, cabecera de autorización, desenvoltura de `{ data }` y traducción de errores |
| Estado de sesión | `frontend/src/auth/auth-provider.tsx:12-21`, `:23-39`, `:84-107` | Token, usuario, estado de sesión y motivo de la pérdida de sesión |
| Formularios | `frontend/src/pages/login-page.tsx:13`, `:16-23`, `:25-27` · `frontend/src/pages/register-page.tsx:13-18`, `:22-23`, `:29-43` | Campos, campos de error, comprobación previa y envío |
| Guardas de ruta | `frontend/src/routes/protected-route.tsx:12-13` · `frontend/src/routes/public-only-route.tsx:12-13` | Redirecciones según el estado de sesión |
| Composición de la aplicación | `frontend/src/main.tsx:8-16` | Proveedor de sesión por encima de las rutas |

### Versión de las librerías consultadas

| Librería | Versión | Dónde |
|---|---|---|
| VineJS | 4.4.0 | `backend/node_modules/@vinejs/vine/package.json` |
| Compiler de VineJS | (paquete `@vinejs/compiler`, instalado como dependencia de VineJS) | `backend/node_modules/@vinejs/compiler/build/index.js` |

---

## Comprobaciones pendientes

Todo lo siguiente se deduce del código y **no se ha comprobado en ejecución**. No se dan resultados: se indican qué habría que observar. Los códigos de estado que aparecen en los requisitos (200, 400, 401, 422) son los que se deducen del código; lo que queda pendiente es confirmarlos contra un servidor en marcha y observar la forma exacta de los cuerpos de error.

1. **Alta sin la clave del nombre.** Que una petición de alta que omita la clave del nombre reciba 422 con un error de campo obligatorio, y con qué código y nombre exactos de regla y campo devuelve el servidor ese 422. La interfaz nunca hace esta petición: el formulario la envía siempre, con `null` cuando el nombre queda vacío.
2. **Alta con el nombre a `null`.** Que una petición con el nombre a `null` se acepte, que la cuenta se cree con el nombre a `null` en la base de datos y que el perfil devuelto lo muestre a `null`.
3. **Alta con el nombre con espacios sobrantes.** Que el recorte se aplique antes de enviar y que el valor almacenado sea el recortado.
4. **Confirmación de contraseña ausente.** Que una petición de alta sin la clave de confirmación reciba 422, y que no se cree ninguna cuenta.
5. **Formato del cuerpo de un 422.** Que las claves `rule`, `field` y `meta` aparezcan con esos nombres y que su contenido permita el reparto por campo que hace el cliente.
6. **Regla aplicada al email duplicado.** Que el 422 de un email ya registrado use la regla de unicidad sobre la base de datos y el campo del email, y por tanto que el cliente muestre el mensaje específico de email duplicado.
7. **Códigos de respuesta de las rutas protegidas.** Que GET /api/v1/account/profile sin token, o con un token inválido, responds 401 y con qué cuerpo exacto.
8. **Cuerpo de las respuestas de error del servidor.** Que el cuerpo del 400 por credenciales incorrectas y el del 401 incluyan la lista de errores con el formato que el cliente espera para traducirlos.
9. **Doble petición de restauración en desarrollo.** Que el arranque de la aplicación bajo el modo estricto de desarrollo dispare dos veces la consulta del perfil, aunque la segunda respuesta se descarte.
10. **Texto del mensaje de error obligatorio.** Qué texto exacto devuelve el servidor para la regla de campo obligatorio, dado que el cliente no lo muestra sino que lo sustituye por su propia traducción.
11. **Caducidad de los tokens.** Que los tokens emitidos no caduquen nunca, y qué ocurre con una fila de token borrada a mano en la base de datos.
12. **Revocación al cerrar sesión.** Que una petición de cierre de sesión que llega al servidor y se procesa correctamente elimine el token, y que una petición posterior con ese mismo token sea rechazada con 401.
13. **Restauración tras un corte de red.** Que un corte de red durante el arranque conserve el token en el navegador, y que una recarga posterior con el servidor disponible y el token conservado todavía válido restablezca la sesión.
14. **Aviso de error de conexión.** Que el mensaje «No se pudo conectar con el servidor…» aparezca en el formulario de inicio de sesión al enviarlo con el servidor caído, que aparezca en la pantalla de inicio de sesión tras una restauración fallida, y que no aparezca al cerrar sesión.

---

## Dudas sobre bug o contrato

Comportamientos observados cuya **intención no está clara**. No se convierten en requisitos porque no se sabe qué se decidió; se dejan documentados con lo que falta por aclarar.

### D.1 — La contraseña se valida con reglas distintas en el alta y en el inicio de sesión

**Observado.** En el alta, la contraseña tiene una longitud mínima de 8 y máxima de 32. En el inicio de sesión, la contraseña solo tiene que estar presente y no ser `null`: no hay ninguna restricción de longitud.

**Interpretaciones posibles.** (a) El inicio de sesión comprueba solo la coincidencia con lo almacenado, y la longitud es una regla de alta y no de autenticación: quien ya tiene cuenta no debería verse afectado por una política que solo gobierna las altas nuevas. (b) Es una omisión y el inicio de sesión debería aplicar la misma política.

**Qué falta aclarar.** Si el inicio de sesión debe imponer la misma longitud, y, en caso afirmativo, cómo se trataría a las cuentas ya existentes. Las contraseñas se guardan cifradas, de modo que la longitud original de las que ya existen no se puede leer de la base de datos: no hay forma de saber, desde el propio sistema, qué cuentas quedarían fuera del rango.

### D.2 — El cierre de sesión es la única respuesta de la API que no viene envuelta

**Observado.** El alta, el inicio de sesión y la consulta del perfil devuelven su contenido bajo una clave `data`. El cierre de sesión devuelve el objeto directamente, sin esa clave. La consecuencia observable es nula: el cliente descarta el cuerpo de esa respuesta.

**Interpretaciones posibles.** (a) El cierre de sesión se quedó fuera de la convención sin que se notara. (b) La respuesta del cierre de sesión no es un recurso serializable sino una confirmación, y por eso va suelta. (c) Es intencionado para no envolver un cuerpo que no se usa.

**Qué falta aclarar.** Si el resto de la API debe mantener el envoltorio de forma uniforme y si el cierre de sesión debe dejar de ser la excepción. No hay ninguna consecuencia de usuario en ninguna de las dos direcciones, así que la decisión no es urgente.

### D.3 — El token conservado y el estado de sesión pueden discrepar

**Observado.** Cuando la restauración de la sesión falla por un motivo distinto de un token rechazado, el token permanece en el almacenamiento del navegador, pero el estado en memoria pasa a «sin sesión». El token guardado y el estado en memoria pueden quedar en desacuerdo durante el tiempo que el usuario permanezca en esa pantalla.

**Interpretaciones posibles.** (a) Es una consecuencia directa de querer que un corte de red no borre la sesión, y el desacuerdo es el precio de esa decisión. (b) El estado debería reflejar el token conservado y la interfaz decidir de otro modo. (c) El desacuerdo debería resolverse reintentando la restauración antes de mostrar el inicio de sesión.

**Qué falta aclarar.** Qué debe ver el usuario cuando el servidor no está disponible al arrancar: si el inicio de sesión con un aviso es la respuesta correcta, o si debería esperar y reintentar solo. La expectativa del producto es que la sesión sobreviva a un corte de red pasajero, pero no está escrito si ese caso concreto debe dejar al usuario dentro o fuera.

---

## Parte B — Cierre del intento de 45 minutos

El intento se detuvo al cumplirse los 45 minutos. Estas listas se redactan después del cierre, con apoyo de Codex y a partir del borrador alcanzado y de la revisión asistida. No amplían los requisitos ni convierten las comprobaciones de los agentes en verificaciones personales. El número de comprobaciones personales fue confirmado por Alfonso.

### 1. Requisitos generados y comprobados

- Requisitos generados: **21**.
- Requisitos comprobados personalmente: **3**.

### 2. Incoherencias detectadas

Las diferencias de contrato o estado siguientes se identificaron en la revisión asistida; no se clasifican automáticamente como bugs.

- **Forma de las respuestas de cuentas y acceso:** registro, login y perfil envuelven su contenido en `data`, mientras logout devuelve un objeto plano; aparece en `backend/app/controllers/new_account_controller.ts:13`, `backend/app/controllers/access_tokens_controller.ts:13` y `:25-27`, y `backend/app/controllers/profile_controller.ts:6`; el cliente descarta el cuerpo de logout en `frontend/src/lib/api.ts:162-166`.
- **Reglas de contraseña distintas según la operación:** el alta exige entre 8 y 32 caracteres, mientras login valida una cadena sin esos límites explícitos; aparece en `backend/app/validators/user.ts:7`, `:15` y `:25`; queda pendiente determinar si la diferencia es una decisión deliberada.
- **Estado persistido frente a estado en memoria:** al fallar la restauración por un motivo distinto de 401, se conserva el token en el almacenamiento del navegador, pero el estado de sesión pasa a visitante; aparece en `frontend/src/auth/auth-provider.tsx:60-76`; la diferencia está implementada y su tratamiento en la interfaz requiere aclaración de producto.
- **Incoherencia en el propio borrador:** el requisito «Un servidor no disponible no borra la sesión guardada» prescribe conservar el token y dejar al usuario como visitante, mientras D.3 mantiene pendiente si esa respuesta de la interfaz es el contrato correcto; se deja registrada esta tensión entre comportamiento observado e intención sin resolverla después del límite de tiempo.

### 3. Comportamientos que no supe clasificar como bug o contrato

- **Restauración con el servidor no disponible.** El código conserva el token, pero muestra el inicio de sesión con un aviso (`frontend/src/auth/auth-provider.tsx:63-76`). Puede ser una decisión deliberada para evitar borrar un token que todavía podría servir, impidiendo a la vez dar por validada una sesión sin respuesta del servidor. También puede ser una gestión incompleta de la indisponibilidad: quizá el producto espere una pantalla de espera o un reintento. Los comentarios explican por qué se conserva el token, pero no bastan para establecer qué experiencia espera producto. Queda pendiente aclararlo; no se ha corregido el código ni dado por resuelta la duda.
- **Diferente política de longitud de contraseña en alta y login.** Puede ser deliberada para autenticar cuentas existentes con independencia de las reglas de nuevas altas, o una omisión de validación (`backend/app/validators/user.ts:7`, `:15`, `:25`). El código demuestra la diferencia, pero no documenta la decisión de producto sobre esa política. No se puede deducir la longitud original de las contraseñas a partir de los hashes almacenados.
