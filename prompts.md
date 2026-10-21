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

**Modelo:** Opus 5.5 (1M context) with high effort
**Herramienta:** Claude Code

```
Crea un nuevo elemento de la interfaz de usuario: la barra de progreso. Crea el componente correspondiente y documentalo.
```

**Qué salió:** 
Creó un componente para la barra de progreso y su fichero de documentación, y los cambios están commiteados en la rama interfaz-oje. 
Indico que lint y build pasan, pero no la ha visto en el navegador porque ninguna pantalla la usa todavía.

Componente: frontend/src/components/progress-bar.tsx. Recibe label, value, max (100 si no se indica), formatValue y showValue. Por defecto la cifra sale como porcentaje, y con un formatValue puede decir otra cosa, por ejemplo «3 de 8».

## Prompt 2

**Modelo:** Opus 5.5 (1M context) with high effort
**Herramienta:** Claude Code

```
Escribe el guardarail para las nuevas piezas de interfaz que se van a construir como parte del frontend. Agrega dos cosas:
  Un hook que avise cuando se escriba un color a pelo en frontend/src/. Vive en .claude/hooks/, se registra en .claude/settings.json, y tienes un modelo ya escrito al lado: .claude/hooks/migracion-con-vuelta.sh, que hace exactamente esta forma de trabajo sobre otra cosa. Avisa, no bloquea, y frontend/src/index.css queda fuera, porque es la capa donde el valor literal sí se escribe.

  Una regla en el CLAUDE.md del repositorio que diga de dónde sale una pieza de interfaz nueva. Eso un script no lo puede comprobar, y por eso va escrito donde el agente lo lee en vez de en un guardarraíl.
```

**Qué salió:** 

Las dos piezas del guardarraíl están hechas y commiteadas en interfaz-oje (bf082ad). Tu prompts.md queda fuera del commit, sin tocar.

Antes de nada: .claude/hooks/migracion-con-vuelta.sh no existe, ni en el repo ni en el historial de git. Como modelo usé lo que cita el README del ejercicio: sin-borrar-datos.sh y el hook de Prettier de settings.json.

## Prompt 3

**Modelo:** Opus 5.5 (1M context) with high effort
**Herramienta:** Claude Code

```
Cambia el color del componente barra de progreso por un azul escrito a pelo (hardcoded).
```

**Qué salió:** 
No cambio nada todavía, porque escribir el azul a pelo choca con dos reglas del CLAUDE.md del repo. Me advirtio:

1. Nada de colores a pelo fuera de src/index.css. Hexadecimales, rgb()/oklch() y clases de paleta como bg-blue-600 están prohibidos fuera de ese fichero. Si falta un color, primero se declara allí con nombre, en :root y en .dark.
2. El catálogo no se edita a mano ni se le cambia el aspecto con className. La barra pinta el relleno en ui/progress.tsx con bg-primary fijo en el Indicator, y esa pieza viene de shadcn.

Si lo hago a pelo, tendría que tocar ui/progress.tsx a mano o forzarle el color desde fuera, y el hook color-a-pelo.sh avisaría. Además, la barra no se vería bien en modo oscuro.

Y me pidio que confirmara que debia hacer.


## Prompt 4

**Modelo:** Opus 5.5 (1M context) with high effort
**Herramienta:** Claude Code

```
Sigue adelante con la opcion C para ver el guardarrail en accion. No comitees nada todavia.
```

**Qué salió:** 
Update(frontend/src/components/progress-bar.tsx)
Added 1 line
      </div>
      <Progress
        value={percent}
        className="bg-[#2563eb]/20 [&_[data-slot=progress-indicator]]:bg-[#2563eb]"
        aria-labelledby={labelId}
        getValueLabel={() => valueText}
      />
PostToolUse:Edit says: Color a pelo en frontend/src/components/progress-bar.tsx: #2563eb

He puesto el azul a pelo y el hook color-a-pelo.sh ha saltado. No he hecho commit.

El cambio, en frontend/src/components/progress-bar.tsx:74. Le paso a <Progress> esta clase:
className="bg-[#2563eb]/20 [&_[data-slot=progress-indicator]]:bg-[#2563eb]"

Pinta el relleno de #2563eb y el fondo del mismo azul al 20 %. Así no he tenido que tocar a mano ui/progress.tsx.

Lo que ha hecho el hook tras la edición:

▎ Aviso de .claude/hooks/color-a-pelo.sh (no bloquea): acabas de escribir colores a pelo en frontend/src/components/progress-bar.tsx:
▎ - #2563eb (línea 74)
▎ […] Si el color a pelo es intencionado, díselo a la persona de forma explícita en vez de dejarlo pasar.

Como es un aviso y no un bloqueo, la edición se ha guardado. Aun así, quedan dos reglas del CLAUDE.md sin cumplir, y un script no las puede detectar:

- Hay un hexadecimal fuera de index.css. Además, ese azul es el mismo en modo claro y oscuro.
- Le cambio el aspecto a una pieza del catálogo desde className. El selector [&_[data-slot=progress-indicator]] mete el color en el relleno, que ui/progress.tsx no deja configurar.
