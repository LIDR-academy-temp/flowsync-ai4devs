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

**Modelo:** Opus 5.5 xMed
**Herramienta:** Claude Code

```
Este es el ejemplo. Bórralo.

El prompt va aquí dentro, entero y con sus saltos de línea,
para que se sepa dónde empieza y dónde acaba.
```

**Qué salió:** funcionó a la primera y pidio commitear.


## Prompt 2

**Modelo:** Opus 5.5 xMed
**Herramienta:** Claude Code

```
espera, comprueba si ves las trazas ejecutando `!docker compose logs observability`
Despues `!make start`
y espera a que generare trafico desde mi navegador sin utilizar Playwright, me voy a registrar con una cuenta nueva, crear dos tareas y cambiar el estado de una. Despues te aviso para el commit.
```

**Qué salió:**  Manualmente registro al usuario Ada Cervantes y creo Tarea 3 y 4 cambiando el estado de la 3 a `En curso`; tras ejecutar ```docker compose logs observability | grep "Trace ID" | sort -u| wc -l``` la salida dice `0` inicialmente.


## Prompt 3

**Modelo:** Opus 5.5 xMed
**Herramienta:** Claude Code

```
!docker compose logs observability
Cada bloque service.name: Str(flowsync-api) identifica el servicio de origen. Los tramos comienzan por `Span #`.
```

**Qué salió:**  Tras reiniciar el servicio, anoto cuantas trazas distintas llegaron con `!docker compose logs observability | grep "Trace ID" | sort -u | wc -l` tras reiniciar el servicio y dice `48` ahora.


## Prompt 4

**Modelo:** Opus 5.5 xMed
**Herramienta:** Claude Code

```
Parte B: 34 Escribe el SLO en @docs/slo/api.md con los valores indicados:
 1. Indicador como fraccion, con numerador y denominador, utilizando la ruta, el código de respuesta y la duración de cada petición.
 2. El objetivo del 99 % y su ventana móvil de 28 días.
 3. El presupuesto de error expresado en peticiones, calculado con el volumen supuesto de 20.000 peticiones. Debe quedar claro que ese volumen se sustituirá por el real.
 4. Una única alerta basada en un problema que percibe el usuario, no en una causa interna. Debe avisar cuando el ritmo de consumo del presupuesto indique que se agotará antes de terminar la ventana.

 Las siguiente rutas quedan fuera del objetivo:
  todas las que no pertenezcan a @/apiv1/task
  el registro y el inicio de sesion. Si necesitas medirlas, deberan tener su propio objetivo y presupuesto.
```

**Qué salió:** Funciono a la primera.