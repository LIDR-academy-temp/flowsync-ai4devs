# PRD — FlowSync MVP

Estado: borrador. Origen: supuestos del prompt 3 de [`alcance-mvp-egv.md`](./alcance-mvp-egv.md). Fuera de este documento, a propósito: modelo de datos y endpoints.

## 1. Problema

Los equipos remotos pequeños dedican la daily y el chat a responder "¿en qué estás?". Nadie ve el estado del equipo sin interrumpir a alguien, y eso provoca trabajo duplicado.

- **Episodio concreto:** dos personas tocaron el mismo módulo la misma semana porque una empezó sin que la otra lo supiera. Se perdieron dos días.
- **Quién lo sufre:** los pares. Los devs que descubren tarde que iban a lo mismo y quien interrumpe a otro para preguntar. No hay reporte hacia arriba y a un manager le daría igual.

## 2. Propuesta

FlowSync es la lista de tareas compartida donde el equipo hace el trabajo, no donde lo cuenta. El estado de cada tarea lo teclea quien la hace y el resto lo ve sin refrescar ni preguntar.

Sustituye al gestor de tareas, no convive con él. FlowSync crea las tareas y no lee las de otro sitio, porque convivir exigiría doble actualización.

## 3. Usuarios y alcance

- **Usuario:** equipos remotos pequeños, de 3 a 10 personas.
- **Roles:** planos. Todos ven y editan lo mismo, sin jerarquía de permisos.
- **Caso de estudio** (no es un cliente real): equipo de 6 personas de producto SaaS en 3 husos horarios. Hoy usa un gestor de tareas pesado y una daily de 15 minutos por videollamada.
- **Espacio único compartido,** sin entidad "equipo". Varios equipos separados, o gente en más de uno, queda fuera del MVP y se anota solo como supuesto.

## 4. Qué reunión desaparece

La ronda de "¿en qué estás?", que hoy ocupa la mitad de los 15 minutos de la daily.

La daily no desaparece entera. La parte de bloqueos sigue y este MVP no la resuelve.

## 5. Principios de producto

1. **Tiempo real = frescura del estado de las tareas.** Los cambios se ven sin refrescar ni preguntar. No es chat, ni videollamada, ni edición simultánea de un documento.
2. **El estado es de la tarea, no de la persona.** No hay indicadores de "quién está conectado" ni de actividad. Se rechaza a propósito, por ser vigilancia.
3. **Resumen que espera, no aviso que interrumpe.** Caso de uso: llegar por la mañana o volver de una reunión y ver qué se ha movido. Sin notificaciones push.
4. **Menos rollo que Jira.** Crear una tarea y cambiarle el estado cuesta segundos, sin flujos de configuración ni campos obligatorios.
5. **El que escribe cobra en el momento.** La lista es su cola de trabajo: la mira para decidir qué coge y, de paso, deja de recibir interrupciones. Si el beneficio fuera solo para los demás, nadie la actualizaría.

## 6. Requisitos funcionales

La tarea del MVP tiene cuatro campos: título, responsable, estado y fecha de vencimiento. La fecha sirve para ver de un vistazo qué se ha pasado de plazo.

| ID | Requisito |
|---|---|
| RF-1 | Crear una tarea con título, responsable, estado y fecha de vencimiento. Solo el título es imprescindible; el resto no debe bloquear la creación. |
| RF-2 | Cambiar el estado de una tarea en dos clics sobre la lista ya abierta. |
| RF-3 | Editar y reasignar una tarea. Todos los miembros pueden hacerlo (roles planos). |
| RF-4 | Ver la lista compartida del espacio con responsable, estado y fecha de cada tarea. |
| RF-5 | Filtrar la lista por estado para centrarse en lo pendiente. |
| RF-6 | Marcar de un vistazo las tareas vencidas (fecha pasada y no terminadas). |
| RF-7 | Ver los cambios de estado de otros sin refrescar la página ni preguntar. |
| RF-8 | Ver un resumen de qué se ha movido desde la última vez que el usuario miró (ver pregunta abierta 2). |

## 7. Fuera del MVP

- Sprints, estimaciones, épicas, backlog priorizado, analítica y reporting. Un equipo que los necesite no es nuestro usuario.
- Presencia o actividad de personas ("quién está conectado ahora").
- Notificaciones push o cualquier aviso que interrumpa.
- Integración con Slack.
- Comentarios en tareas.
- Derivar el estado de señales externas (Git/PRs, CI, calendario). Es otro producto, con integraciones y OAuth de terceros.
- Importar o sincronizar tareas desde otros gestores.
- Varios equipos, o personas en más de un equipo.
- Jerarquía de permisos.
- Resolver los bloqueos (la parte de la daily que sigue).

## 8. Decisión que debe cambiar

No empezar algo que otra persona ya está tocando, y elegir lo siguiente sabiendo qué está libre. Si la única respuesta fuera "sentirse informado", el tiempo real no valdría lo que cuesta.

## 9. Éxito

- **Para el usuario:** dejar de hacer la ronda de "¿en qué estás?" porque el estado del equipo se ve de un vistazo.
- **Criterio a una semana de uso real:** el equipo cancela esa ronda y nadie pide que vuelva. Si la siguen haciendo igual, no funcionó.

## 10. Riesgos

1. **Información vieja (riesgo #1 a validar).** Si el estado no se actualiza, el producto pierde el sentido. La mitigación es que actualizar cueste dos clics, no obligar a nadie.
2. **Doble actualización.** Si el equipo mantiene otro gestor en paralelo, FlowSync muere. Por eso sustituye y no convive.

## 11. Forma de construir

Una vertical fina y usable de punta a punta, no el andamiaje amplio de un producto. Es mejor una capability terminada que tres a medias.

## 12. Preguntas abiertas

Huecos que los supuestos no cierran y que conviene decidir antes de pasar a diseño. La sección 13 (recorte del alcance) responde a las preguntas 1, 3, 4, 5 y 6, y reduce la 2 a ordenar por último cambio. El recorte 2 deja esa pregunta fuera del MVP:

1. **Estados posibles.** Los supuestos hablan de "estado" pero no lo enumeran. Hace falta un conjunto mínimo y fijo, por ejemplo pendiente, en curso y hecha. ¿Cuál?
2. **Forma del resumen (RF-8).** "Qué se ha movido desde la última vez que miré" necesita definirse: ¿una sección de la misma lista o una vista aparte? ¿Qué cuenta como "última vez"? ¿Incluye cambios de campos distintos del estado?
3. **Tarea sin responsable.** El principio "elegir lo siguiente sabiendo qué está libre" sugiere que una tarea sin responsable sea válida y signifique "libre". ¿Se confirma?
4. **Huso horario de la fecha de vencimiento.** Con 3 husos en el caso de estudio, "vencida" depende de cómo se interprete la fecha: ¿día calendario sin hora, o instante con huso?
5. **Borrado y cierre.** ¿Se pueden borrar tareas? ¿Las hechas se ocultan, se archivan o se quedan en la lista? Afecta a la lectura de "lo pendiente".
6. **Cómo entra la gente al espacio único.** No hay entidad "equipo": ¿cualquiera con cuenta entra al mismo espacio? ¿O hay alguna forma de invitación? Es relevante para el caso de estudio de 6 personas.

## 13. Evolución del alcance del MVP

El alcance se recortó en dos pasos. Cada paso se conserva aquí para que quede claro qué se decidió, quién lo propuso y por qué.

| Capa | Dónde | Quién |
|---|---|---|
| Alcance original | Secciones 6 y 7 | Supuestos del prompt 3 |
| Recorte 1 | Sección 13.1 | Propuesta de Claude, aceptada por el equipo (prompts 7-9) |
| Recorte 2 | Sección 13.2 | Decisión del equipo (prompt 10) |

Donde haya diferencia, manda la capa más reciente. El resultado final está en la sección 13.3.

### 13.1 Recorte 1: propuesta de Claude, aceptada

Recorte agresivo sobre el alcance original de las secciones 6 y 7.

**Alcance tras el recorte 1**

| # | Qué | Por qué entra |
|---|---|---|
| 1 | **Cuenta y acceso.** Se reutilizan registro, login y logout, que ya existen. | No cuesta construirlo. Sin identidad no hay "responsable". |
| 2 | **Espacio único compartido.** Todo usuario registrado ve la misma lista. | Es la frontera del PRD y evita construir equipos e invitaciones. |
| 3 | **Crear tarea.** Solo el título es obligatorio. | Es el "menos rollo que Jira" en su forma mínima. |
| 4 | **Responsable y "tarea libre".** Una tarea sin responsable significa libre. Cualquiera puede asignarse o reasignarla. | Es la decisión que justifica el producto: no empezar lo que otro ya toca. |
| 5 | **Estado en dos clics sobre la lista.** Tres estados fijos: pendiente, en curso y hecha. | Es el dato que sustituye la ronda. Si cuesta más de dos clics, se queda viejo (riesgo #1). |
| 6 | **Lista con filtro por estado,** ordenada por último cambio. | Cubre "lo pendiente" y la mañana de "qué se ha movido", sin construir nada más. |
| 7 | **Frescura por consulta periódica.** Los cambios de otros aparecen sin refrescar a mano. | Es lo que diferencia el producto de una lista normal. La consulta periódica basta y no hace falta nada más sofisticado. |
| 8 | **Fecha de vencimiento opcional y marca de vencidas.** | Forma parte de los supuestos. Es opcional para no añadir un campo obligatorio. |

**Criterio de la fecha:** se guarda solo el día, sin hora ni huso. Una tarea está vencida cuando ese día es anterior al día actual del usuario que mira. Con varios husos, una tarea puede aparecer vencida para unos y no para otros durante unas horas, y se asume.

**Recortes frente al alcance original**

| Recorte | Justificación | Coste asumido |
|---|---|---|
| **Resumen explícito "qué se ha movido" (RF-8)** | Exige guardar la última vez que cada persona miró y definir qué cuenta como cambio. Ordenar por último cambio cubre la mayor parte del caso. | No hay un "esto es nuevo para ti" explícito. |
| **Borrar tareas** | Las hechas se filtran fuera de la vista, así que no molestan. | Una tarea creada por error se queda hasta marcarla como hecha. |
| **Invitaciones y espacios** | Con 6 personas no hacen falta. | Cualquiera que se registre ve los datos: vale para un caso de estudio, no para producción. |
| **Historial y edición simultánea** | No aportan a la decisión central y encarecen mucho. | No se puede ver quién cambió qué. |

**No alcance:** sigue vigente todo lo de la sección 7: Slack, push, comentarios, analítica y reporting, presencia, permisos, integraciones, varios equipos, sprints y bloqueos.

### 13.2 Recorte 2: decisión del equipo

Se saca del MVP el punto 6 del recorte 1: **filtro por estado y orden por último cambio (RF-5)**. Motivo dado: no es necesario para una funcionalidad básica. La lista compartida se mantiene.

**Efectos sobre el recorte 1**

- Sin filtro, lo pendiente se mezcla con lo hecho.
- Sin orden por último cambio, no hay una señal barata de "qué se ha movido". Pierde sentido la frase del recorte 1 de que ordenar por último cambio cubre la mayor parte del caso.
- Deja de ser cierta la justificación de no borrar tareas ("las hechas se filtran fuera de la vista"). Las tareas hechas y las creadas por error se quedan en la lista.
- Riesgo: la lista mezclada debilita la decisión central de "elegir lo siguiente sabiendo qué está libre".

### 13.3 Alcance final del MVP

1. Cuenta y acceso, reutilizando lo que ya existe.
2. Espacio único compartido.
3. Crear tarea, con el título como único campo obligatorio.
4. Responsable y "tarea libre", con asignación y reasignación por cualquiera.
5. Estado en dos clics sobre la lista, con tres estados fijos.
6. Frescura por consulta periódica.
7. Fecha de vencimiento opcional (solo día) y marca de vencidas.

**Fuera del MVP, acumulado:**
- Del alcance original: lo de la sección 7.
- Del recorte 1: resumen explícito de "qué se ha movido", borrar tareas, invitaciones y espacios, historial y edición simultánea.
- Del recorte 2: filtro por estado y orden por último cambio.


## Balance del recorte

- **Números:** la IA propuso 8; quedaron 7.
- **Fuera, y por qué:**
  1. Invitaciones y espacios: no ayudan a validar que ver el estado elimina la ronda de "¿en qué estás?".
  2. Historial y edición simultánea: no ayudan a validar la decisión de no empezar lo que otro ya toca.
  3. Borrar tareas: no ayuda a validar que el estado se mantiene fresco.
- **La que menos seguro estoy:** filtro por estado y orden por último cambio. Entraría si, en la semana de uso real, la gente no encuentra qué está libre o sigue preguntando "¿en qué estás?" por no ver qué se movió. Tensión: lo barato (quitarlo) contra lo que valida (elegir sabiendo qué está libre).