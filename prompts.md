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

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
Añade una barra de progreso encima del listado en la pantalla de tareas que muestre que parte de las tareas que se están viendo ya estan hechas
```

**Qué salió:** (opcional, una línea) implemento el cambio



## Prompt 2

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
Monta un guardarraíl con dos piezas.

1. Un hook en .claude/hooks/ que avise cuando se escriba un color a pelo en
   frontend/src/. Usa como modelo .claude/hooks/migracion-con-vuelta.sh y
   regístralo en .claude/settings.json como lo está ese. Debe:
   - saltar después de Write y Edit sobre ficheros de frontend/src/,
     excluyendo frontend/src/index.css;
   - detectar hex, rgb(), hsl(), oklch(), valores arbitrarios como bg-[#...]
     y clases de la paleta de Tailwind como bg-blue-500;
   - avisar sin bloquear, igual que el modelo;
   - quedar ejecutable.

2. Una regla en el CLAUDE.md de la raíz que diga de dónde sale una pieza de
   interfaz nueva: primero se busca en frontend/src/components/ui/; si no
   existe, se añade ahí; y los colores salen de los valores con nombre de
   frontend/src/index.css, nunca escritos a pelo.

No toques la barra de progreso ni ningún otro fichero del frontend.
```

**Qué salió:** (opcional, una línea) monto las dos piesas, ejecuto e hook
