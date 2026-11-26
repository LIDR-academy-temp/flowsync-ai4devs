<!-- Generado desde la lección de ejercicio del módulo: no se edita a mano. -->

# Ejercicio FlowSync: la línea de partida y las decisiones de gobierno

Es la última lección del módulo y la única que harás con el portátil delante. Aquí tienes cómo preparar el entorno, qué debes hacer y cómo entregarlo. Consta de tres partes: **medir una línea de partida que pueda empeorar (Parte A)**, **escribir las decisiones de gobierno y hacer que una se cumpla sola (Parte B)** y **escribir tres líneas sobre lo que has visto (Parte C)**.

No vas a programar ninguna funcionalidad. Vas a hacer con un proyecto real lo que haría quien tiene que defender que su equipo trabaje con agentes: enseñar un número honesto y decidir por escrito qué puede hacer el agente sin preguntar.

> 📌 **Guarda cada prompt tal como lo envías, desde el primero.** Forman parte de la entrega, así que no sirve reconstruirlos de memoria al terminar. Lo que se revisa es **cómo se lo pediste al agente**, no una versión corregida después. El repositorio ya incluye un archivo para guardarlos.

---

## 🔁 Cómo funciona este módulo

El ejercicio tiene tres etapas. Conviene saber qué harás en cada una:

**1. Lo intentas tú.** Trabajas sobre el proyecto de más abajo, con tu agente. Entrega lo que consigas, **aunque esté incompleto**. No se puntúa por terminarlo: en el directo se revisan los problemas que encontraste.

**2. Lo ves resuelto en el directo.** El mentor mide la misma línea de partida sobre este mismo proyecto, escribe la misma página de decisiones y convierte la misma frontera en reglas que bloquean. Conviene **mirar sin teclear**: después tendrás tiempo para repetirlo.

**3. Lo replicas.** Recibirás por escrito los prompts del mentor para volver a tu entorno y repetir el recorrido con calma.

> ⚠️ **En el paso 3 no esperes resultados idénticos.** La inteligencia artificial (IA) no es determinista: con el mismo prompt cambian la redacción de la página, cómo clasifica el agente cada pieza del proyecto y hasta qué instrucción desactualizada detecta primero. Las cifras del historial de git sí deberían coincidir si usas las mismas fechas y carpetas; si no coinciden, mira qué comando lanzó el agente. Lo que se repite es **la forma del recorrido**, no el texto.

---

## 🛠️ Deja el entorno listo

### 1. Comprueba lo que necesita tu máquina

Cuatro cosas. Compruébalas **antes de clonar el proyecto**:

- **Git:** `git --version`. Si no responde, instálalo desde `https://git-scm.com/downloads`.
- **`jq`**, una utilidad para leer datos en formato JSON (*JavaScript Object Notation*): `jq --version`. Las comprobaciones automáticas del proyecto la usan; sin ella, el agente verá errores al ejecutar comandos. En macOS: `brew install jq`; en Linux: el paquete `jq` de tu distribución.
- **Claude Code** o el agente que uses: `claude --version`. Este ejercicio se ensayó con la versión 2.1.332.
- **Una cuenta de GitHub:** entregarás con un pull request desde tu fork hacia el repositorio del curso.

> 🖥️ **Compatibilidad.** En **macOS y Linux** puedes seguir los comandos directamente. En **Windows utiliza WSL** (*Windows Subsystem for Linux*, el subsistema de Linux para Windows): las comprobaciones automáticas del proyecto son scripts de shell y no funcionan igual en PowerShell. El clon, `jq` y el agente tienen que estar dentro de WSL.

No hace falta instalar dependencias ni levantar la aplicación: el ejercicio trabaja sobre el historial y sobre la configuración del agente.

### 2. Forkea y clona el proyecto

Trabajarás sobre **tu propio fork**, porque no tienes permisos de escritura en el repositorio del curso.

1. Entra en **https://github.com/LIDR-academy-temp/flowsync-ai4devs** y pulsa **Fork**.
2. Clona **tu fork** y entra en la carpeta del proyecto.
3. Añade el repositorio del curso como `upstream` y descarga la rama de partida:

```bash
git remote add upstream https://github.com/LIDR-academy-temp/flowsync-ai4devs.git
git fetch upstream
git checkout -b s18/start upstream/s18/start
```

> 🚨 **La rama de partida se obtiene de `upstream`, no de tu fork.** El formulario de Fork de GitHub trae marcada la casilla de copiar **solo la rama por defecto**, así que tu fork se lleva `main` y nada más. Un `git checkout s18/start` a secas fallaría con un `did not match any file(s) known to git`, que no menciona el fork.

Clona el repositorio **completo**, sin `--depth`: la medición lee todo el historial.

### 3. Crea tu rama

Créala **antes del primer prompt**:

```bash
git checkout -b adopcion-<tus-iniciales>
```

> 🔀 **Si el agente crea otra rama, no es un error.** El proyecto le prohíbe hacer commits en `main` y en las ramas de partida. Mira con `git branch` y `git log --oneline` dónde quedaron los cambios y llévalos a tu rama con `git merge <esa-rama>`.

---

## 📋 La tarea

**Mide sobre FlowSync un número que pueda empeorar, escribe en una página las cuatro decisiones de gobierno de un equipo que trabaja con agentes y convierte una de ellas en reglas que bloquean.**

Es el mismo encargo que resolverá el mentor en el directo, sobre el mismo proyecto y con los mismos datos. **Los prompts los escribes tú** y forman parte de la entrega. Trabaja desde la raíz del repositorio.

### 🅰️ Parte A: la línea de partida

Pide al agente que escriba `docs/adopcion/linea-de-partida.md`, usando **solo el historial de git local**, con tres apartados:

1. **Supervivencia del código.** Para dos fechas de corte, **2026-07-31** y **2026-08-31**: cuántas líneas añadieron los commits cuya **fecha de autor** (cuándo se escribió el cambio) sea esa o anterior, en `backend/app`, `backend/database`, `backend/start` y `frontend/src`, y cuántas de ellas siguen hoy según `git blame` (el comando que dice qué commit escribió cada línea). Con las dos cifras absolutas y la proporción. Comprueba después si con la fecha del commit, en lugar de la de autor, saldría otra cosa.
2. **Retrabajo aproximado:** commits de tipo `fix` sobre la suma de `feat` y `fix`, mes a mes, según el prefijo del mensaje y la fecha de autor.
3. **Las cinco métricas DORA** (*DevOps Research and Assessment*, el programa de investigación que las define): para cada una, si se puede calcular con lo que hay en este repositorio y, si no, qué dato falta y quién tendría que empezar a guardarlo.

Cada cifra lleva **el valor, el tamaño de la muestra, el comando con el que se obtuvo y qué la invalidaría como medida**. No concluyas si el proyecto va bien o mal, y no rellenes con estimaciones lo que no se pueda calcular.

Antes de pedir la página, haz una prueba corta: pide **commits y líneas añadidas por mes** y pregunta al agente qué tendría que pasar para que esas dos cifras bajaran. Lo usarás en la Parte C.

### 🅱️ Parte B: las decisiones de gobierno

Primero pide al agente que lea la configuración del agente en el proyecto (`CLAUDE.md`, `AGENTS.md`, la carpeta `.claude/`, `.mcp.json`) **sin cambiar nada**, y que clasifique cada pieza bajo una de estas cuatro decisiones, o bajo «ninguna»:

- **A.** Qué herramientas y agentes se aprueban.
- **B.** Qué puede hacer un agente sin preguntar (la frontera entre lo reversible y lo irreversible).
- **C.** Quién revisa una herramienta externa antes de conectarla, y qué datos ve.
- **D.** Cuánto consumo tiene cada equipo.

Para cada decisión, distingue las piezas que **obligan** (bloquean aunque el modelo no quiera) de las que solo **recomiendan** (texto que el agente puede no seguir), y señala qué instrucciones del proyecto contradice su estado actual, con la línea y la prueba.

Después, pide la página `docs/adopcion/decisiones-de-gobierno.md`, con una sección por decisión y **cuatro campos fijos**: «Qué decidimos», «Dónde se ejecuta» (un archivo del repositorio o «fuera del repositorio: configuración de administración»), «Quién la revisa» (escribe `PENDIENTE`: no inventes nombres) y «Fecha de revisión» (30 días a partir de hoy).

Los datos que tiene que contener son estos:

- **En B:** sin preguntar se puede leer, editar en una rama de trabajo y ejecutar los tests. No se puede publicar, desplegar, empujar a un remoto ni instalar dependencias nuevas.
- **En D:** una tabla con las cuatro partidas del presupuesto (asientos, consumo medido, formación y tiempo de las personas), sin importes: `PENDIENTE` y de dónde saldría cada cifra.
- **Al final:** una línea «Número que vigilamos» que apunte a la supervivencia del código y diga cada cuánto se vuelve a medir.

Corrige en `CLAUDE.md` **una sola** de las contradicciones que encontraste, la que más confundiría a un agente, cambiando lo mínimo, y anota por qué elegiste esa.

Por último, traduce la frontera de B a reglas **`deny`** (acciones que el agente no puede ejecutar) en `.claude/settings.json`, **sin quitar las que ya hay**: `git push`, `npm publish`, `npm install` y `node ace add`. Comprueba que funcionan pidiendo al agente que ejecute **exactamente** `git push --dry-run origin HEAD` y mira qué responde. `--dry-run` hace que, si la regla fallara, no se suba nada.

> ⚠️ **No le pidas al agente que rodee el bloqueo.** Ver cómo lo rechaza es parte del ejercicio.
>
> Al editar `.claude/settings.json`, el agente **te pedirá permiso**: está cambiando sus propias reglas. Lee el cambio antes de aprobarlo.

### Parte C: las tres líneas

En la raíz, crea `HALLAZGOS.md` o vacíalo si ya existe. Escribe tres líneas:

1. **Qué tendría que pasar para que bajaran los commits y las líneas por mes**, y si alguna de esas causas sería una buena noticia.
2. **La proporción de supervivencia que obtuviste en las dos fechas** y qué la invalidaría como medida.
3. **Cuál de las cuatro decisiones no tenía ninguna pieza que la respondiera** y cuántas de las piezas que encontraste solo recomiendan.

**No necesitas una página perfecta para entregar.** Con la Parte A y las tres líneas ya hay material para revisar.

### Cómo saber que la has hecho bien

- Cada cifra de `linea-de-partida.md` dice **con qué comando se obtuvo** y **qué la invalidaría**.
- Las métricas DORA que no se pueden calcular **dicen qué dato falta**, sin estimaciones.
- La página de decisiones tiene las cuatro secciones con sus cuatro campos, y **ningún nombre ni importe inventado**.
- `.claude/settings.json` conserva las reglas anteriores y **el `git push --dry-run` quedó bloqueado**.
- `git diff --stat` no toca nada en `backend/` ni en `frontend/`.

---

## 📤 Cómo se entrega

1. Trabaja en la rama **`adopcion-<tus-iniciales>`**.
2. **Guarda todos tus prompts en `prompts.md`, en la raíz del repositorio.** El archivo ya trae una plantilla: conserva su nombre y su ubicación porque la herramienta de revisión los usa. Cada prompt en su bloque de código, con el modelo y la herramienta.
3. El agente tiene prohibido empujar por la regla que acabas de escribir, así que **el `push` lo haces tú en tu terminal**: `git push -u origin adopcion-<tus-iniciales>`.
4. Abre un **pull request desde tu fork contra el repositorio del curso** (`github.com/LIDR-academy-temp/flowsync-ai4devs`) y comprueba que GitHub haya seleccionado el repositorio del curso como destino, no tu fork. Tiene que incluir `docs/adopcion/linea-de-partida.md`, `docs/adopcion/decisiones-de-gobierno.md`, `.claude/settings.json`, `HALLAZGOS.md` y `prompts.md`.

> 🔒 **No pegues datos de tu empresa en ningún archivo de la entrega.** El pull request es público.

### El plazo

**Debes entregar el ejercicio antes del directo.**

---

## 📚 Si vas justo de tiempo

Prioriza la lección sobre **qué se mide y qué solo parece medible**, que es la que sostiene la Parte A, y la que habla del **harness compartido y quién decide qué se conecta**, que sostiene la Parte B. Si tienes muy poco tiempo, haz la Parte A y las dos primeras líneas de la Parte C.

---

## ✅ Antes de conectarte, comprueba

- [ ] Estás en **tu fork**, en la rama `adopcion-<tus-iniciales>`, creada desde `s18/start`.
- [ ] `git --version`, `jq --version` y `claude --version` responden.
- [ ] `docs/adopcion/linea-de-partida.md` tiene sus tres apartados.
- [ ] `docs/adopcion/decisiones-de-gobierno.md` tiene las cuatro decisiones.
- [ ] El bloqueo del `git push --dry-run` está comprobado.
- [ ] `HALLAZGOS.md` tiene las tres líneas y `prompts.md` todos tus prompts, con modelo y herramienta.
- [ ] Has abierto el pull request hacia el repositorio del curso.

> Trae los archivos tal como quedaron, sin corregirlos después: los problemas que encontraste también son parte de lo que revisaremos.

---

## 🚀 Y después, si quieres llevártelo al trabajo

Repite la Parte A sobre el repositorio de tu equipo, cambiando las carpetas y las fechas. **No la entregues**: puede contener datos de tu empresa. Guárdala con la fecha de hoy, porque es lo que convertirá la conversación de dentro de seis meses en una comparación.

---

## 🎯 Qué te llevas del Módulo 18

**El modelo mental**: adoptar agentes no es repartir licencias. Es poder enseñar **un número que pueda empeorar** y haber decidido por escrito qué puede hacer un agente sin preguntar. Las cifras que se obtienen sin esfuerzo, como commits o líneas añadidas, suben aunque las cosas vayan mal.

**Lo que queda en el proyecto**: una línea de partida en `docs/adopcion/linea-de-partida.md`, una página de decisiones de gobierno en `docs/adopcion/decisiones-de-gobierno.md`, y reglas en `.claude/settings.json` que bloquean lo que el equipo decidió no delegar.

> 👥 **Qué te llevas según tu perfil**
>
> - **Si eres dev:** sabrás medir tu propio historial y distinguir una regla que bloquea de una instrucción que solo recomienda.
> - **Si vienes de producto o gestión:** tendrás una página corta que alguien puede aprobar sin fiarse de quien la propone, con lo que está decidido y lo que falta por decidir.
> - **Si no tienes experiencia técnica:** entenderás por qué un número que solo puede mejorar no sirve para decidir nada, y qué preguntas hacer antes de dar permisos a un agente.
