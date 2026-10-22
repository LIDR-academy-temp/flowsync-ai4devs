# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

Borra el ejemplo de abajo cuando escribas el primero.

---

## Prompt 1

**Modelo:** Sonnet 5 1M High
**Herramienta:** Claude Code

```
Agrega una barra de progreso arriba de la lista en la pantalla de tareas que muestre qué porcentaje de los elementos visibles está completado.
```

**Qué salió:** El componente nuevo `frontend/src/components/task-progress.tsx` quedó fuera de `src/components/ui/`.

---

## Prompt 2

**Modelo:** Sonnet 5 1M High
**Herramienta:** Claude Code

```
Crea el sistema de supervisión para el proyecto con dos elementos:
1. Un hook en .claude/hooks/ (registrado en .claude/settings.json) que alerte —sin bloquear— cuando se escriban colores literales (hardcoded) dentro de frontend/src/, excluyendo a frontend/src/index.css (puedes tomar como modelo el script existente en .claude/hooks/migracion-con-vuelta.sh).
2. Una regla en el archivo CLAUDE.md del repositorio que establezca claramente de dónde deben provenir los nuevos componentes de interfaz.
```

**Qué salió:** Se crearon y probaron el hook `sin-colores-literales.sh` y la regla de `CLAUDE.md`.


---

## Prompt 3

**Modelo:** Sonnet 5 1M High
**Herramienta:** Claude Code

```
Modifica el color de la barra de progreso que acabamos de crear para que use un color azul escrito directamente en el código (*hardcoded*), sin utilizar las variables del archivo de estilos.
```

**Qué salió:** El hook se activó y se hizo el cambio; sin embargo, Claude avisó que ese cambio se había hecho porque se pidió directamente y es el usuario quien decide si el cambio entra o no en el próximo commit.
