# Alcance del MVP de FlowSync

## 1. El terreno que ya existe

### Resumen

Hoy FlowSync es como un edificio con la recepción terminada pero sin oficinas todavía.
Cualquier persona puede crear su cuenta, entrar a la aplicación y salir cuando quiera.
Al entrar ve una ficha sencilla con sus datos, y la aplicación la recuerda si vuelve más tarde.
Lo principal aún no existe: no se pueden crear equipos, proyectos ni tareas, ni repartir trabajo entre personas.
La aplicación solo sabe quién está registrado; todo lo demás es lo que vamos a construir.

### Lo que ya se puede hacer

| Qué puede hacer la persona | Cómo funciona hoy |
|---|---|
| Crear una cuenta | Escribe su nombre, su correo y una contraseña (dos veces, para evitar errores). Si el correo ya está en uso, la aplicación se lo avisa. |
| Entrar a la aplicación | Escribe su correo y su contraseña. Si alguno no es correcto, ve un mensaje claro en castellano. |
| Ver su ficha personal | Ve un círculo con sus iniciales, su nombre, su correo y la fecha en que se unió. |
| Salir de la aplicación | Pulsa "Cerrar sesión" y vuelve a la pantalla de entrada. |
| Seguir dentro al volver | Si cierra la ventana y vuelve más tarde, no tiene que escribir de nuevo su contraseña. |
| Proteger lo privado | Quien no ha entrado no puede ver ninguna ficha: la aplicación lo lleva a la pantalla de entrada. |

### Qué información guarda hoy la aplicación

La aplicación guarda solo dos tipos de información:

- **Las personas registradas**: nombre, correo, contraseña (guardada de forma segura, nadie puede leerla) y la fecha en que se unieron.
- **Los pases de entrada**: cada vez que alguien entra, la aplicación le da un pase que le permite seguir dentro sin volver a escribir su contraseña. Al cerrar sesión, ese pase deja de servir.

Todavía **no** guarda nada sobre el trabajo en equipo: ni equipos, ni proyectos, ni tareas, ni quién se encarga de qué, ni en qué punto está cada cosa. Todo eso es lo que hay que construir.

## 3. Alcance del producto

### En una frase

FlowSync es la lista de tareas compartida donde un equipo pequeño que trabaja a distancia hace su trabajo y, de paso, ve cómo va todo el mundo sin tener que preguntar.

### Para quién es

- Equipos pequeños que trabajan a distancia, de 3 a 10 personas, repartidos a veces en varios husos horarios.
- Todos están al mismo nivel: todos ven y cambian lo mismo.
- Lo usan los compañeros para coordinarse entre ellos, no un jefe para controlar.
- Hay un único espacio compartido, en el que está todo el equipo.

### Qué resuelve

Quita la ronda de "¿en qué estás?" de la reunión diaria y las preguntas constantes por mensaje. También evita que dos personas empiecen la misma cosa sin saberlo.

### Qué incluye esta primera versión

Partimos de lo que ya existe (crear una cuenta, entrar, ver la ficha personal y salir) y añadimos un único recorrido completo alrededor de las tareas:

| Qué puede hacer el equipo | Para qué le sirve |
|---|---|
| Crear una tarea en segundos, con título, persona responsable, estado y fecha límite | Tener en un solo sitio todo el trabajo del equipo, sin pasos de configuración |
| Cambiar el estado de una tarea con dos clics, desde la misma lista | Que actualizar cueste tan poco que no haga falta obligar a nadie |
| Ver una lista compartida con las tareas de todo el equipo | Saber quién está con qué y qué queda libre antes de empezar algo nuevo |
| Ver los cambios de los demás sin recargar la página | Llegar por la mañana, o salir de una reunión, y ver qué se ha movido sin preguntar |
| Filtrar la lista por estado | Centrarse en lo pendiente |
| Ver de un vistazo qué tareas se han pasado de su fecha límite | Detectar lo que va con retraso sin tener que revisarlo una por una |

### Cómo es la experiencia

- **Es donde se hace el trabajo, no donde se cuenta.** FlowSync sustituye a la herramienta de tareas actual. Las tareas se crean aquí.
- **El estado lo pone quien hace la tarea**, a mano y en segundos. No se saca de otras herramientas.
- **La información espera a que la mires, no te interrumpe.** No hay avisos.
- **Se ve cómo están las tareas, no las personas.** No se muestra quién está conectado ni qué hace cada uno en cada momento.
- **Sin campos que frenen.** No hay que decidir ciclos de trabajo ni estimar esfuerzo para crear o mover una tarea.

### Cómo sabremos que ha funcionado

Después de una semana de uso real, el equipo deja de hacer la ronda de "¿en qué estás?" en la reunión diaria y nadie pide que vuelva. Si la siguen haciendo igual, no ha funcionado.

Lo que no esperamos: que la reunión diaria desaparezca entera. La parte de "estoy atascado con…" sigue, y esta versión no la resuelve.

### Riesgo principal

Que la gente no mantenga al día el estado de sus tareas y la información se quede vieja. Si pasa, el producto pierde el sentido. No obligamos a nadie: la apuesta es que actualizar cueste solo dos clics y que quien lo hace gane en el momento, porque esa lista es también su propia lista de trabajo y deja de recibir preguntas de "¿cómo va eso?". Es lo primero que hay que comprobar con el uso real.

### Fuera de esta primera versión

Decidido, y no se construye:

- Avisos que saltan en el móvil o en el ordenador (notificaciones).
- Conexión con Slack o con otras herramientas de mensajería.
- Distintos niveles de permisos o funciones (administrador, invitado, etc.).
- Estadísticas, gráficos e informes.
- Comentarios en las tareas.
- Varios equipos separados, o personas que estén en más de un equipo.
- Ver quién está conectado o qué está haciendo cada persona en cada momento.
- Rellenar el estado de las tareas automáticamente a partir de otras herramientas (de programación, de calendario, etc.).
- Chat, videollamada o edición simultánea de un mismo documento.
- Planificación por ciclos de trabajo, estimaciones de esfuerzo, agrupación de tareas en bloques grandes y listas de prioridades.
- Convivir con otra herramienta de tareas o traer tareas desde ella.
- Resolver los bloqueos que hoy se tratan en la reunión diaria.


### Parte B

#### Los dos números
La IA propuso agregar 12 items al alcance del producto, pero no se construyen en esta primera versión. Se anotan como supuestos y se quitan del alcance. Finalmente, el alcance del producto queda con 6 items, que son los que se construyen en esta primera versión.

#### Tres cosas que dejaste fuera, y por qué cada una

1. Quien se registra entra directamente en el espacio compartido, sin invitación.
    - Por qué: Este item quedo fuera debido a que los usuarios deben ser invitados por un administrador.

2. Hay tres estados fijos: Por hacer, En curso y Hecho.
    - Por qué: Este item quedo fuera debido a que los estados deben ser definidos por el equipo de producto.

3. Para "ver qué se ha movido", cada tarea muestra cuándo cambió y quién la cambió, sin historial.
    - Por qué: Este item quedo fuera debido a que se requiere un historial completo para poder rastrear los cambios, lo cual queda como supuesto, no se construye.

### La exclusión de la que menos seguro estás

No supe decidir esta.