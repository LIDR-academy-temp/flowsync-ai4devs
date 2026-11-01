# Registro de prompts - Spec Viva FlowSync

## Prompt personal 1 - A1: Exploración

**Herramienta:** Claude Code 2.1.316
**Modelo:** Opus 5.5

### Texto exacto enviado

Para conocer el funcionamiento actual del sistema, vamos a analizar las dos capas de FlowSync: frontend y backend, limitándonos exclusivamente al módulo de cuentas y acceso, que comprende el registro de usuarios, el inicio de sesión, la gestión de la sesión y el perfil.

Investiga y explica los comportamientos existentes, identificando aquellos que sean observables desde el exterior y aportando evidencias concretas del código que permitan comprobarlos.

No amplíes el alcance más allá de los módulos indicados. No modifiques el código ni inicialices OpenSpec. Limítate exclusivamente al análisis y la exploración solicitados.

---

## Prompt personal 2 - A2: Primera versión de la spec viva

**Herramienta:** Claude Code 2.1.316
**Modelo:** Opus 5.5

### Texto exacto del prompt

Transforma la exploración anterior en una primera versión de la especificación del sistema.

Para ello, utiliza los hallazgos obtenidos durante el análisis y redacta los requisitos siguiendo el formato obligatorio, incluyendo tanto el backend como el frontend.

**Formato obligatorio de la especificación:**

- `## Purpose`: una o dos frases que expliquen la finalidad del módulo.
- `## Requirements`: sección que agrupa los requisitos del sistema.
- `### Requirement:`: cada requisito debe tener su propio encabezado y utilizar la palabra clave **SHALL** para expresar el comportamiento del sistema.
- `#### Scenario:`: cada requisito debe incluir al menos un escenario, redactado mediante dos viñetas:
  - **WHEN**: situación o condición que desencadena el comportamiento, incluyendo las precondiciones necesarias.
  - **THEN**: resultado observable que produce el sistema.

**Reglas de redacción:**

- Escribe la especificación en español, excepto las palabras clave obligatorias.
- No utilices `GIVEN`, `ADDED`, `MODIFIED` ni `REMOVED`.
- Describe únicamente comportamientos observables desde el exterior, sin incluir nombres de clases, archivos ni detalles internos de implementación.
- Mantén claramente identificadas las dudas y evita presentar suposiciones como comportamientos confirmados.

Genera el archivo de especificación dentro del proyecto.

---

## Prompt personal 3 - A2.1: Corrección de ubicación de la spec

**Herramienta:** Claude Code 2.1.316
**Modelo:** Opus 5.5

### Texto exacto del prompt

Has creado la especificación en `docs/specs/cuentas-y-acceso/spec.md`, pero la academia exige que esté ubicada en `docs/spec-viva/pamf.md`.

Por tanto, te pido que traslades el archivo a la ubicación correcta, modificando exclusivamente su ruta y nombre.

**Condiciones:**
- Conserva íntegramente el contenido original, incluidos los 18 requisitos, sus escenarios y las dudas identificadas.
- No modifiques, añadas ni elimines contenido de la especificación.
- No modifiques ningún otro archivo del proyecto.
- No realices commits, no abras ningún pull request (PR) ni generes archivos PDF.

Limítate exclusivamente a corregir la ubicación y el nombre del archivo.

---

## Prompt personal 4 - A3: Verificación del registro de usuarios

**Herramienta:** Claude Code
**Modelo:** Opus 5.5

### Texto exacto del prompt

Comienza revisando los requisitos relacionados con el registro de usuarios que aparecen en la especificación viva que has generado, ubicada en `docs/spec-viva/pamf.md`.

Contrasta estos requisitos con el código existente y muestra las evidencias correspondientes, tanto del backend como del frontend.

Identifica posibles contradicciones, inconsistencias o afirmaciones que no estén suficientemente demostradas por el código.

Durante esta revisión, no modifiques el código ni el contenido de la especificación. Limítate exclusivamente al análisis solicitado.
