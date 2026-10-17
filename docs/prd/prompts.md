# Alcance MVP (EGV) — Prompts del módulo 2

Registro de los prompts lanzados durante el ejercicio del módulo 2, en orden cronológico.

## Prompt 1

```text
Lee el repo y haz un listado de capabilities que ya existen y un diagrama rápido del modelo de datos actual (ERD), en Mermaid. No propongas ni hagas nada, solo queremos la foto de lo que tenemos
```

## Prompt 2

```text
Quiero que FlowSync sea una herramienta para que los equipos remotos sepan en qué está trabajando cada uno sin tener que hacer reuniones de sincronización. Algo tipo tareas compartidas pero más en tiempo real y menos rollo que Jira. Necesitamos hacer un PRD con unos requisitos basicos. Haz un turno de 5 pregunta/respuesta en total, no me hagas una pregunta hasta que no te haya contestado la anterior.Por ahora no veremos ni modelo de datos, ni endpoints necesarios.
```

## Prompt 3

```text
Revisa que en PRD que has gestionado cubre estos supuestos:

- Qué duele hoy: la daily de sincronización y el "¿en qué estás?" constante por Slack/chat. Nadie ve el estado del equipo sin interrumpir a alguien.
- Quién cobra el valor: los pares, no un lead. No hay reporte hacia arriba y a un manager le daría igual. Duele a los dos devs que descubren tarde que iban a lo mismo, y al que interrumpe a otro para preguntar.
- Episodio concreto: dos personas del equipo tocaron el mismo módulo la misma semana porque una empezó sin que la otra lo supiera. Dos días perdidos.
- Qué reunión desaparece (respuesta honesta, no la vendas de más): la daily NO desaparece entera. Desaparece la ronda de "¿en qué estás?", que hoy se come la mitad de los 15 minutos. La parte de bloqueos sigue, y este MVP no la resuelve.
- Usuarios / equipo: equipos remotos pequeños, 3–10 personas. Roles planos: en el MVP todos ven y editan lo mismo, sin jerarquía de permisos.
- Primer usuario concreto: equipo de 6 personas de producto SaaS, en 3 husos horarios, que hoy usa un gestor de tareas pesado y una daily de 15 minutos por videollamada. Es un CASO DE ESTUDIO, no un cliente real.
- Fronteras: un espacio único compartido, sin entidad "equipo". Varios equipos separados, o gente en más de uno, queda FUERA del MVP: se anota como supuesto en el PRD, no se construye.
- "Tiempo real" = ver los cambios de estado de las tareas sin refrescar ni preguntar. NO es chat, NO es videollamada, NO es colaboración simultánea sobre el mismo documento.
- Es frescura, no presencia: el estado es de la TAREA, no de la persona. Nada de "quién está conectado ahora" ni indicadores de actividad; eso es vigilancia y lo rechazamos a propósito.
- Forma de la señal: resumen que espera, no aviso que interrumpe. El caso es "llego por la mañana o vuelvo de una reunión y veo qué se ha movido". Sin notificaciones push.
- Qué decisión cambia: no empezar algo que otra persona ya está tocando, y elegir lo siguiente sabiendo qué está libre. Si la única respuesta fuera "sentirse informado", el tiempo real no valdría lo que cuesta.
- De dónde sale el estado: lo teclea la persona que hace la tarea, en segundos. Derivarlo de señales externas (Git/PRs, CI, calendario) está FUERA del MVP: es otro producto, con integraciones y OAuth de terceros.
- Por qué se sostiene: no porque sea más agradable, sino porque son dos clics sobre una lista ya abierta, sin campos obligatorios, sin decidir sprint ni estimación. Y quien lo escribe cobra en el momento: esa misma lista es su cola de trabajo, la mira para decidir qué coge, y de paso deja de recibir interrupciones preguntándole cómo va. Si el beneficio fuera solo para los demás, no lo escribiría.
- Si la información se queda vieja: el producto pierde el sentido, y lo asumo. Es el riesgo #1 a validar, no un detalle. La mitigación es que actualizar cueste dos clics, no obligar a nadie.
- Es donde se hace el trabajo, no donde se cuenta: sustituye al gestor de tareas, no convive con él. FlowSync crea las tareas, no lee las de otro sitio. Convivir exigiría doble actualización, que es como muere esta categoría.
- Renuncia explícita a sprints, estimaciones, épicas, backlog priorizado e informes. Un equipo que necesite eso no es nuestro usuario.
- "Menos rollo que Jira" = crear una tarea y cambiarle el estado en segundos, sin flujos de configuración ni campos obligatorios. Lo mínimo para saber quién está en qué.
- Qué necesita una tarea en el MVP: título, responsable, estado y fecha de vencimiento. La fecha, para ver de un vistazo qué se ha pasado de plazo.
- Cómo se consume la lista: filtrando por estado, para centrarse en lo pendiente.
- Éxito para el usuario: dejar de hacer la ronda de "¿en qué estás?" de la daily porque el estado del equipo se ve de un vistazo.
- Criterio a una semana de uso real: que el equipo cancele esa ronda y nadie pida que vuelva. Si la siguen haciendo igual, no funcionó.
- Cuánto construir: una vertical fina y usable de punta a punta, no el andamiaje amplio de un producto. Prefiero una capability terminada a tres a medias.
```

## Prompt 4

```text
opción 1, en un fichero aparte pero guardalo como docs/prd/prd-mvp-egv.md
```

## Prompt 5

```text
siguiente prompt (guardalo y tambien ejecutalo): comprueba en el PRD que lo que se queda fuera del MPV es esto: - Fuera del MVP: notificaciones push, integración con Slack, roles/permisos avanzados, analítica/reporting, comentarios en tareas.
```

## Prompt 6

```text
aplica esos tres ajustes
```

## Prompt 7

```text
siguient prompt (guardalo y ejecutalo): con las respuestas que tenemos en PRD, propon el alcance de un MVP: problema, usuarios, alcance, no alcance. Recortalo agresivamente, justificando cada uno de ellos
```

## Prompt 8

```text
siguiente prompt (guarda y ejecuta1. La mantenemos al ser parte de los supuestos. 2. vale una consulta periodica
```

## Prompt 9

```text
ok a las dos cosas. Añadelo en el PRD (pero marcalo  como recorte del alcance o algo asi), y de momento usamos solo dia para las fecha
```

## Prompt 10

```text
siguiente prompt (guarda y ejecuta): ahora voy a recortar yo. El punto 6 puede quedar fuera para el MPV. no es necesario para una funcionalidad basica. Añade al PRD este nuevo recorte/No alcance
```

## Prompt 11

```text
pero de esta forma no queda claro en el PRD, cual fue el Alcance/No alcance original, del recorte que hiciste tu, y luego del recorte que he hecho yo
```
