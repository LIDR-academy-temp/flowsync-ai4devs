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

**Modelo:** Opus 5.5 Medium
**Herramienta:** Claude Code

```
Añade a compose.yaml un servicio llamado observability, utilizando la imagen otel/opentelemetry-collector-contrib:0.162.0. Debe publicar los puertos 4317 y 4318 y tener un archivo de configuración con un receptor otlp para ambos protocolos y un exportador debug con verbosity: detailed en la tubería de trazas.
```

## Prompt 2

**Modelo:** Opus 5.5 Medium
**Herramienta:** Claude Code

```
Haz que el backend mande sus trazas al collector
```


## Prompt 3 

**Modelo:** Opus 5.5 Medium
**Herramienta:** Claude Code

```
Definir el SLO en docs/slo/api.md exclusivamente para las rutas de /api/v1/tasks con los valores: Indicador (Service Level Indicator, SLI): fracción de peticiones a esas rutas que responden con un código inferior a 500 y tardan menos de 500 milisegundos. Objetivo: al menos el 99 % de esas peticiones deben cumplir el indicador durante una ventana móvil de 28 días. Presupuesto de error: calcula cuántas peticiones pueden incumplir el objetivo, suponiendo 20.000 peticiones durante la ventana.


Ademas agregar Una única alerta basada en un problema que percibe el usuario, no en una causa interna. Debe avisar cuando el ritmo de consumo del presupuesto indique que se agotará antes de terminar la ventana.

```
