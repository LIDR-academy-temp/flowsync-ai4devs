# Cuentas y acceso

## Purpose

Permitir que una persona cree su cuenta en FlowSync, entre con su email y contraseña, siga conectada mientras lo necesite, consulte los datos de su perfil y salga cuando quiera. Solo quien ha entrado con su cuenta puede ver su perfil.

## Requirements

### Requirement: Crear una cuenta

El sistema SHALL permitir que cualquier persona sin sesión cree una cuenta desde la pantalla de registro indicando un nombre completo (opcional), un email, una contraseña y la repetición de esa contraseña. Al crear la cuenta, el sistema SHALL dejar a la persona conectada automáticamente y llevarla a su perfil, sin pedirle que entre de nuevo.

#### Scenario: Registro con nombre

- **WHEN** una persona sin sesión rellena la pantalla de registro con el nombre "Ada Lovelace", un email que no tiene cuenta, una contraseña de entre 8 y 32 caracteres repetida correctamente, y pulsa "Crear cuenta"
- **THEN** el botón muestra "Creando cuenta…" y no se puede volver a pulsar mientras se procesa, y al terminar la persona ve su perfil con el nombre "Ada Lovelace"

#### Scenario: Registro sin nombre

- **WHEN** una persona sin sesión completa el registro dejando el nombre vacío o solo con espacios
- **THEN** la cuenta se crea igualmente y su perfil muestra "Sin nombre"

#### Scenario: Ir a la pantalla de entrada desde el registro

- **WHEN** una persona sin sesión, estando en la pantalla de registro, pulsa el enlace "Inicia sesión" que aparece bajo "¿Ya tienes cuenta?"
- **THEN** ve la pantalla de inicio de sesión

### Requirement: Reglas de los datos de registro

El sistema SHALL aceptar un registro solo si el email tiene un formato válido, no supera los 254 caracteres y no pertenece ya a otra cuenta; la contraseña tiene entre 8 y 32 caracteres; y la repetición coincide con la contraseña. Si alguna regla no se cumple, el sistema SHALL NOT crear la cuenta y SHALL explicar el problema en castellano junto al dato afectado. La pantalla de registro SHALL mostrar bajo la contraseña la indicación "Entre 8 y 32 caracteres." mientras no haya un error en ese dato.

#### Scenario: Email ya registrado

- **WHEN** una persona intenta registrarse con un email que ya tiene cuenta
- **THEN** ve "Ese email ya está registrado. Inicia sesión en su lugar." bajo el email y la cuenta no se crea

#### Scenario: Email con formato incorrecto

- **WHEN** una persona intenta registrarse con un email como "no-es-un-email"
- **THEN** ve "Introduce una dirección de email válida." bajo el email

#### Scenario: Contraseña demasiado corta

- **WHEN** una persona intenta registrarse con una contraseña de 7 caracteres, repetida correctamente
- **THEN** ve "la contraseña debe tener al menos 8 caracteres." bajo la contraseña, en lugar de la indicación "Entre 8 y 32 caracteres."

#### Scenario: Contraseña demasiado larga

- **WHEN** una persona intenta registrarse con una contraseña de 33 caracteres, repetida correctamente
- **THEN** ve "la contraseña no puede superar los 32 caracteres." bajo la contraseña

#### Scenario: Contraseñas que no coinciden

- **WHEN** una persona escribe una contraseña y una repetición distintas y pulsa "Crear cuenta"
- **THEN** ve "Las contraseñas no coinciden." bajo la repetición de la contraseña, sin que el sistema llegue a intentar crear la cuenta

#### Scenario: Datos obligatorios vacíos

- **WHEN** una persona pulsa "Crear cuenta" dejando vacío el email
- **THEN** ve "Falta rellenar el email." bajo el email

### Requirement: Entrar en la cuenta

El sistema SHALL permitir que una persona sin sesión entre en su cuenta desde la pantalla de inicio de sesión con su email y su contraseña, y SHALL llevarla a su perfil al conseguirlo.

#### Scenario: Entrada correcta

- **WHEN** una persona sin sesión escribe el email y la contraseña de su cuenta y pulsa "Entrar"
- **THEN** el botón muestra "Entrando…" y no se puede volver a pulsar mientras se procesa, y al terminar la persona ve su perfil

#### Scenario: Datos vacíos

- **WHEN** una persona pulsa "Entrar" sin escribir email ni contraseña
- **THEN** ve "Falta rellenar el email." bajo el email y "Falta rellenar la contraseña." bajo la contraseña

#### Scenario: Ir al registro desde la pantalla de entrada

- **WHEN** una persona sin sesión, estando en la pantalla de inicio de sesión, pulsa el enlace "Crea una" que aparece bajo "¿Aún no tienes cuenta?"
- **THEN** ve la pantalla de registro

### Requirement: Datos de acceso incorrectos

Cuando el email no tiene cuenta o la contraseña no es la correcta, el sistema SHALL NOT dejar entrar a la persona y SHALL mostrar el mismo aviso en ambos casos, sin revelar cuál de los dos datos falla.

#### Scenario: Contraseña equivocada

- **WHEN** una persona escribe el email de su cuenta con una contraseña equivocada y pulsa "Entrar"
- **THEN** ve el aviso "El email o la contraseña no son correctos." y sigue en la pantalla de inicio de sesión

#### Scenario: Email sin cuenta

- **WHEN** una persona escribe un email que no tiene cuenta y pulsa "Entrar"
- **THEN** ve el mismo aviso "El email o la contraseña no son correctos."

### Requirement: Sesiones abiertas

Cada vez que una persona crea su cuenta o entra en ella, el sistema SHALL abrir una sesión nueva que no caduca por el paso del tiempo y que dura hasta que la persona sale. Una misma cuenta SHALL poder tener varias sesiones abiertas a la vez (por ejemplo, en distintos navegadores o dispositivos), y salir de una SHALL NOT cerrar las demás.

#### Scenario: Dos dispositivos a la vez

- **WHEN** una persona entra en su cuenta desde dos navegadores distintos
- **THEN** puede ver su perfil en los dos al mismo tiempo

#### Scenario: Salir en un solo dispositivo

- **WHEN** una persona con sesión abierta en dos navegadores sale en uno de ellos
- **THEN** sigue conectada en el otro

### Requirement: Recordar la sesión en el navegador

El navegador SHALL recordar la sesión de la persona, de modo que al recargar la página o volver más tarde siga conectada sin tener que entrar de nuevo. Al abrir la aplicación con una sesión recordada, el sistema SHALL comprobar que sigue siendo válida mostrando un indicador de carga ("Cargando…") hasta saberlo.

#### Scenario: Volver con la sesión vigente

- **WHEN** una persona conectada recarga la página o vuelve a abrir la aplicación más tarde
- **THEN** ve brevemente el indicador de carga y después su perfil, sin tener que entrar de nuevo

#### Scenario: Sesión que ya no es válida

- **WHEN** una persona abre la aplicación y la sesión que recordaba el navegador ya no es válida
- **THEN** el navegador la olvida y la persona ve la pantalla de inicio de sesión con el aviso "Tu sesión ha caducado. Vuelve a iniciar sesión."

#### Scenario: Servicio no disponible al volver

- **WHEN** una persona abre la aplicación con una sesión recordada mientras el servicio no está disponible
- **THEN** ve la pantalla de inicio de sesión con el aviso "No se pudo conectar con el servidor. Comprueba que el backend está arrancado.", y el navegador conserva la sesión, de modo que al recargar con el servicio de nuevo disponible vuelve a ver su perfil

#### Scenario: Primera visita

- **WHEN** una persona abre la aplicación sin ninguna sesión recordada
- **THEN** no ve indicador de carga ni avisos y se la trata como persona sin sesión

#### Scenario: El aviso desaparece al entrar

- **WHEN** una persona ve en la pantalla de inicio de sesión un aviso sobre su sesión anterior y entra correctamente en su cuenta
- **THEN** el aviso desaparece y ve su perfil

#### Scenario: El aviso no aparece en el registro

- **WHEN** una persona ha perdido su sesión anterior y pasa a la pantalla de registro
- **THEN** la pantalla de registro no muestra el aviso sobre la sesión anterior

### Requirement: Acceso a cada pantalla

El sistema SHALL mostrar la pantalla de perfil solo a personas conectadas, y las pantallas de inicio de sesión y de registro solo a personas sin sesión, redirigiendo a la pantalla que corresponda en otro caso. Cualquier dirección de la aplicación que no corresponda a una pantalla existente SHALL llevar al perfil. Mientras se comprueba una sesión recordada, el sistema SHALL mostrar el indicador de carga en lugar de redirigir.

#### Scenario: Perfil sin sesión

- **WHEN** una persona sin sesión intenta abrir el perfil
- **THEN** ve la pantalla de inicio de sesión

#### Scenario: Entrada o registro con sesión

- **WHEN** una persona conectada intenta abrir la pantalla de inicio de sesión o la de registro
- **THEN** ve su perfil

#### Scenario: Dirección inexistente

- **WHEN** una persona abre una dirección de la aplicación que no existe
- **THEN** ve su perfil si está conectada, o la pantalla de inicio de sesión si no lo está

#### Scenario: Comprobación en curso

- **WHEN** una persona abre cualquier pantalla mientras se está comprobando su sesión recordada
- **THEN** ve el indicador de carga y no se la lleva a otra pantalla hasta que termina la comprobación

### Requirement: Perfil del usuario

La pantalla de perfil SHALL mostrar un círculo con las iniciales de la persona, su nombre completo (o "Sin nombre" si no lo indicó), su email y la fecha de alta junto a "Miembro desde", escrita en formato largo en español. El sistema SHALL NOT mostrar nunca la contraseña.

#### Scenario: Perfil con nombre

- **WHEN** una persona llamada "Ada Lovelace", con email "ada@example.com" y cuenta creada el 2 de noviembre de 2026, abre su perfil
- **THEN** ve "AL" en el círculo, "Ada Lovelace", "ada@example.com" y "Miembro desde 2 de noviembre de 2026"

#### Scenario: Perfil sin nombre

- **WHEN** una persona que se registró sin nombre abre su perfil
- **THEN** ve "Sin nombre" en lugar del nombre

### Requirement: Iniciales del perfil

El sistema SHALL calcular las iniciales en mayúsculas así: si el nombre tiene al menos dos palabras, la primera letra de las dos primeras; si tiene una sola palabra, sus dos primeras letras; y si no hay nombre, la primera letra de lo que va antes de la arroba del email seguida de la primera letra de lo que va después.

#### Scenario: Nombre de dos palabras

- **WHEN** una persona llamada "Ada Lovelace" abre su perfil
- **THEN** ve "AL" en el círculo

#### Scenario: Nombre de una palabra

- **WHEN** una persona llamada "Ada" abre su perfil
- **THEN** ve "AD" en el círculo

#### Scenario: Sin nombre

- **WHEN** una persona sin nombre y con email "ada@example.com" abre su perfil
- **THEN** ve "AE" en el círculo

### Requirement: Salir de la cuenta

El sistema SHALL permitir que una persona conectada salga desde el botón "Cerrar sesión" de su perfil. Al pulsarlo, el navegador SHALL olvidar la sesión de inmediato, el sistema SHALL invalidar esa sesión para que no pueda volver a usarse, y la persona SHALL ver la pantalla de inicio de sesión sin ningún aviso, incluso si el servicio no responde en ese momento.

#### Scenario: Salida normal

- **WHEN** una persona conectada pulsa "Cerrar sesión" en su perfil
- **THEN** el botón muestra "Cerrando sesión…", después la persona ve la pantalla de inicio de sesión sin avisos, y para volver a ver su perfil tiene que entrar de nuevo

#### Scenario: Salida con el servicio caído

- **WHEN** una persona conectada pulsa "Cerrar sesión" mientras el servicio no está disponible
- **THEN** ve igualmente la pantalla de inicio de sesión sin avisos y el navegador ya no recuerda su sesión

### Requirement: Avisos de problemas de conexión

Cuando el servicio no está disponible o falla de forma inesperada al crear una cuenta o al entrar, el sistema SHALL mostrar un aviso en castellano en la parte superior del formulario y SHALL permitir volver a intentarlo.

#### Scenario: Servicio no disponible

- **WHEN** una persona pulsa "Crear cuenta" o "Entrar" mientras el servicio no está disponible
- **THEN** ve el aviso "No se pudo conectar con el servidor. Comprueba que el backend está arrancado." y el botón vuelve a estar disponible

#### Scenario: Fallo inesperado del servicio

- **WHEN** una persona pulsa "Crear cuenta" o "Entrar" y el servicio falla de forma inesperada
- **THEN** ve el aviso "Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento." y el botón vuelve a estar disponible

### Parte B: las tres listas

1. Requisitos generados y comprobados.

11 requisitos generados y comprobados, de los cuales 11 son obligatorios y 0 opcionales.

2. Incoherencias detectadas.

A la hora de generar los requisitos, no se han detectado incoherencias.

3. Comportamientos que no supiste clasificar como bug o contrato.

El Scenario: Dirección inexistente, que describe el comportamiento de la aplicación al abrir una dirección que no existe, no se ha podido clasificar como bug ni como contrato. Se ha decidido dejarlo sin clasificar, aunque se podría considerar un bug, ya que la aplicación debería mostrar un error 404 en lugar de redirigir a otra pantalla.