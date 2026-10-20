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

**Modelo:** Opus 5.5 Medio
**Herramienta:** Claude Code (app de escritorio, sesión nueva en la rama `interfaz-JC`)

```
Por favor colocar una barra donde se muestre el avance de las tareas completadas, colócala sobre el listado de tareas.
```

**Qué salió:** una sola pasada, sin intervención. Creó `frontend/src/components/task-progress.tsx` (fuera de `components/ui/`) y lo montó en `tasks-page.tsx`; commit `20d8e65`. Decidió por su cuenta medir sobre todas las tareas y no sobre las visibles.

## Prompt 2

**Modelo:** Opus 5.5 Medio
**Herramienta:** Claude Code (app de escritorio, misma sesión)

```
Monta un guardarraíl para los colores en la interfaz, en dos piezas:

1. Un hook en .claude/hooks/ que, después de cada Write o Edit sobre un archivo de frontend/src/, avise si el archivo contiene un color escrito a pelo: códigos hexadecimales, rgb/hsl/oklch, o clases de la paleta cruda de Tailwind como bg-blue-600 o text-white. frontend/src/index.css queda fuera, porque es donde los valores sí se declaran. Debe AVISAR y no bloquear, y el aviso tiene que llegarte a ti, no solo quedar en un log. Tómale la forma al hook de Prettier que ya está en .claude/settings.json: mismo momento y mismo filtro de archivos, sobre otra cosa. Regístralo junto a los que ya hay, sin tocar los existentes, y documenta arriba del script qué ve y qué no ve.
2. Una regla en el CLAUDE.md del repositorio que diga de dónde sale una pieza de interfaz nueva. Redáctala tú, a partir de lo que ya dice ese archivo sobre el frontend.

Antes de terminar, prueba el hook de verdad: escribe un archivo de prueba en frontend/src/ con un color a pelo, confirma que el aviso te llega, y borra el archivo de prueba. Enséñame la salida del aviso.
```

**Qué salió:** a la primera. Creó `.claude/hooks/colores-a-pelo.sh` y lo registró junto al de Prettier sin tocar los existentes; la regla nueva en `CLAUDE.md` pone primero los componentes propios y después shadcn. Probó el hook con un archivo de prueba y lo borró; commit `4fa524c`. La lección cita como modelo `.claude/hooks/migracion-con-vuelta.sh`, que no existe en ninguna rama del repositorio; por eso se señaló el hook de Prettier.

## Prompt 3

**Modelo:** Opus 5.5 Medio
**Herramienta:** Claude Code (app de escritorio, misma sesión)

```
Cambia el color de la barra de avance por un azul, #1D4ED8.
```

**Qué salió:** no escribió el hexadecimal en el componente; declaró un token nuevo `--progress: #1d4ed8` en `src/index.css` (el único en hexadecimal, sin valor para modo oscuro) y la barra pasó a `bg-progress`. El hook no avisó, porque `index.css` está fuera de su revisión. Commit `772ad25`.
