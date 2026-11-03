# Registro de prompts — Módulo 3

## Procedencia y alcance

Los siete mensajes de la sección A se recuperaron literalmente del historial local de Claude Code de este proyecto. Se conservan errores de escritura, saltos de línea y delimitadores tal como se enviaron, incluidos los intentos que produjeron un resultado que hubo que corregir. Las horas se muestran en America/Mexico_City.

El identificador de modelo registrado en las respuestas es `MiniMax-M3.1-Flash`. El registro preliminar decía `MiniMax-M1.5-Flash`; esa identificación era incorrecta y se corrige a partir del historial, no por recuerdo. La herramienta utilizada fue Claude Code; Read, Bash, Write y Edit son herramientas internas de esa aplicación, no el nombre de la aplicación.

Codex se utilizó además para tutoría, revisión y preparación de la entrega. Su revisión asistida no se cuenta como comprobación personal del alumno. La sección B conserva los mensajes que autorizaron la redacción de las listas y esta preparación. El modelo exacto de Codex no está confirmado en el registro disponible.

## A. Prompts enviados a Claude Code

### Prompt 1

**Fecha:** 2026-11-02 23:06:56 CST
**Herramienta:** Claude Code
**Modelo registrado:** `MiniMax-M3.1-Flash`

````text
A partir de este momento, guarda todos mis prompts en un archivo prompts.md
````

### Prompt 2

**Fecha:** 2026-11-02 23:19:04 CST
**Herramienta:** Claude Code
**Modelo registrado:** `MiniMax-M3.1-Flash`

````text
Olvidé decirte que hay que guardar heramienta y modelo usado en el reistro de prompts.md, inicializalo y comencemos el registro de uevo
````

### Prompt 3

**Fecha:** 2026-11-02 23:22:27 CST
**Herramienta:** Claude Code
**Modelo registrado:** `MiniMax-M3.1-Flash`

````text
Explora la base del código y escribe una spec del comportamiento existente en docs/spec-viva-af.md
````

### Prompt 4

**Fecha:** 2026-11-02 23:32:19 CST
**Herramienta:** Claude Code
**Modelo registrado:** `MiniMax-M3.1-Flash`

````text
Regresemos un paso atrás.
````

### Prompt 5

**Fecha:** 2026-11-02 23:44:22 CST
**Herramienta:** Claude Code
**Modelo registrado:** `MiniMax-M3.1-Flash`

````text
Antes de generar la spec, corrige tu exploración de cuentas y acceso.

1. Revisa la diferencia entre nullable y optional en la versión instalada de VineJS:
   - Omitir la clave fullName falla por campo requerido.
   - Enviar fullName: null es válido.
   - El frontend convierte el nombre vacío en fullName: null.
   Contrasta estas conclusiones con el validador, la librería instalada y el formulario de registro.

2. Corrige la consulta del perfil: la ruta es GET /api/v1/account/profile, no POST.

3. Separa claramente:
   - Comportamientos confirmados y su evidencia.
   - Comprobaciones pendientes.
   - Dudas sobre la intención del producto.

No clasifiques automáticamente como bugs la diferencia de validación entre registro y login ni la respuesta de logout sin envoltorio data. Describe lo observado y qué decisión falta aclarar.

Devuelve únicamente las correcciones al mapa anterior, con archivos y líneas de referencia. No afirmes haber ejecutado comprobaciones que solo dedujiste leyendo código.

Mantén el modo lectura: no modifiques archivos, no cambies el borrador existente, no inicialices OpenSpec ni generes todavía la spec. Detente al terminar.
````

### Prompt 6

**Fecha:** 2026-11-02 23:54:21 CST
**Herramienta:** Claude Code
**Modelo registrado:** `MiniMax-M3.1-Flash`

````text
```yaml
Usa la exploración corregida de cuentas y acceso para reescribir el spec viva en docs/spec-viva-af.md.

Alcance: registro, inicio de sesión, restauración y cierre de sesión, y consulta del perfil. Incluye el comportamiento de la API y lo que el usuario observa en la interfaz.

Describe el sistema actual, sin añadir funcionalidades ni resolver decisiones de producto por tu cuenta.

Estructura del documento:

## Purpose
Una o dos frases sobre el propósito de cuentas y acceso.

## Requirements
- Cada requisito empieza con ### Requirement: seguido de un nombre claro.
- Redacta cada regla con SHALL.
- Incluye al menos un escenario por requisito.
- Cada escenario empieza con #### Scenario: usando cuatro almohadillas.
- Usa dos viñetas: **WHEN** y **THEN**.
- Incluye las precondiciones dentro de WHEN, sin una línea GIVEN.
- Escribe en español, conservando las palabras clave.

Los requisitos deben describir comportamientos observables: peticiones y respuestas de la API, acciones, mensajes y navegación de la interfaz. Evita nombres de clases, funciones y archivos internos dentro de los requisitos.

Después de Requirements, añade secciones separadas:

## Evidencia de la exploración
Relaciona cada requisito con los archivos y líneas que lo respaldan. Distingue lectura de código de ejecución real. No atribuyas al usuario ninguna comprobación que no haya confirmado personalmente.

## Comprobaciones pendientes
Enumera los casos que todavía requieren comprobación. No presentes resultados esperados como resultados obtenidos ni inventes respuestas HTTP o mensajes exactos.

## Dudas sobre bug o contrato
Describe los comportamientos cuya intención no está clara, las interpretaciones posibles y qué falta aclarar. No conviertas esas dudas en requisitos definitivos.

Aplica las correcciones ya revisadas:
- fullName debe viajar en la petición, aunque su valor puede ser null.
- El formulario envía null cuando el nombre queda vacío.
- El perfil se consulta mediante GET /api/v1/account/profile.
- passwordConfirmation obligatoria es un comportamiento confirmado.
- Las diferencias entre registro y login, y el formato de logout, no demuestran por sí solas que exista un bug.

No uses ADDED, MODIFIED ni REMOVED: estamos documentando comportamiento existente.

No modifiques código, no inicialices OpenSpec ni hagas commits.

Al terminar, indica cuántos requisitos generaste y qué incertidumbres siguen abiertas. Detente para que podamos revisar el borrador.


```
````

### Prompt 7

**Fecha:** 2026-11-03 00:01:00 CST
**Herramienta:** Claude Code
**Modelo registrado:** `MiniMax-M3.1-Flash`

````text
Revisa el borrador existente en docs/spec-viva-af.md y corrige únicamente los puntos siguientes. Mantén intactos los requisitos y escenarios que no necesiten ajustes.

1. Revocación al cerrar sesión
Acota la revocación del token en el servidor al caso en que la petición de logout llega y se procesa correctamente. Conserva la distinción con el cierre local, que ocurre aunque la petición falle.

2. Errores de conexión
El requisito actual promete un mensaje para cualquier petición fallida, pero logout ignora ese error. Describe solo los flujos donde el código realmente muestra el aviso.

3. Precondiciones de los escenarios
- En la recuperación tras un corte, indica que el token conservado sigue siendo válido.
- En la confirmación de contraseña distinta, separa la petición directa a la API del envío mediante el formulario, que bloquea la petición antes.
- En los escenarios de error de validación, aclara cuando corresponda que los demás datos son válidos.
- Evita que «error del servidor» incluya por accidente el caso 401, cuyo comportamiento es distinto.

4. Nombre completo
Distingue explícitamente:
- El frontend envía fullName, con null cuando el nombre queda vacío.
- La API exige la presencia de fullName y rechaza su omisión.
Añade el escenario de omisión respaldado por la lectura del código, manteniendo su comprobación HTTP como pendiente.

5. Dudas sobre bug o contrato
- D.1: elimina la afirmación de que mirar los hashes almacenados permite conocer la longitud original de las contraseñas. Revisa también la interpretación que dice «para no dejar entrar»: parece contradecir la ausencia de límites de longitud en login.
- D.4: corrige la contradicción entre el título «se conserva» y el comportamiento observado, que borra el motivo al cerrar sesión. Conserva la duda solo si queda una incertidumbre concreta y respaldada.
- D.5: retírala de las dudas, pues el propio texto reconoce que no hay ninguna decisión pendiente.
No inventes dudas para sustituir las retiradas.

Conserva Purpose, Requirements, SHALL y los escenarios con encabezado #### Scenario: y viñetas WHEN/THEN. Mantén separadas evidencia, comprobaciones pendientes y dudas.

Actualiza las referencias afectadas y cuenta de nuevo los requisitos y escenarios. No presentes una deducción como prueba ejecutada ni atribuyas verificaciones personales al usuario.

Modifica únicamente docs/spec-viva-af.md. No cambies código, dependencias, configuración ni otros archivos. No inicialices OpenSpec ni hagas commits.

Al terminar, resume qué cambió, indica los nuevos conteos y detente para revisión.
````

## B. Intervenciones de Codex para cerrar y preparar la entrega

**Herramienta:** Codex desktop. **Modelo:** no confirmado en el registro disponible. No se asignan horas exactas a estos mensajes porque no se recuperaron de un historial con marcas de tiempo.

El mensaje «3» responde a cuántos requisitos comprobó personalmente Alfonso abriendo y leyendo el código durante el intento. No identifica cuáles fueron y no se inventa esa identificación.

### Redacción de las listas tras cerrar el intento

````text
ya pasaron los 45 minutos, que debmos hacer, falta la parte delas listas. revisa lo que escribio y ayudame a hacer esas listas.
````

### Confirmación del número de requisitos comprobados personalmente

````text
3
````

### Preparación del envío y confirmación de la ruta

````text
Ayúdame a preparar el envío. Las instrucciones dicen que debe de subirse el archivo. docs/spec-viva-af.md
````

Codex añadió las tres listas después del cierre, con 21 requisitos generados y 3 comprobados personalmente según la confirmación del alumno; no amplió los requisitos ni cambió el código. También revisó el borrador y ayudó a redactar varios prompts de la sección A. La preparación del envío recupera el registro literal, conserva la ruta indicada por el alumno y versiona únicamente los dos documentos.
