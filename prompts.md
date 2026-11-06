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

---

## Prompt 1

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
Instrumenta el backend con el paquete oficial, añade el servicio observability en compose.yaml con los puertos 4317/4318 y exportador debug (verbosity: detailed), y actualiza las variables de entorno necesarias sin tocar el frontend.
```

**Qué salió:** la skill `backend-feature` paró con un plan por capas y esperó aprobación antes de tocar nada.

## Prompt 2

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
Sí y también crea el target `make obs-up`
```

**Qué salió:** instrumentación con `@adonisjs/otel`, servicio `observability` y `make obs-up`. Hubo que corregir las variables `APP_*` obligatorias que dejó el instalador, un `.env` sin salto de línea final y la imagen del colector 0.116.1, que daba `SIGSEGV`.

## Prompt 3

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
Sí
```

**Qué salió:** el hook `datos-que-no-salen.sh` bloqueó el primer commit por un correo en `package-lock.json`. Se sustituyó por uno de `example.com` y el commit `360040d` salió al segundo intento.

## Prompt 4

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
Levanta el backend, frontend y recolector y base de datos si es necesario
```

**Qué salió:** todo arriba, pero no pude reiniciar el backend que ya ocupaba el puerto 3333: el sistema denegó el `kill`.

## Prompt 5

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
Escribe el SLO en docs/slo/api.md incluyendo: SLI como fracción (ruta, código, duración), objetivo del 99% a 28 días, presupuesto de error para 20.000 peticiones (avisando que es estimado), una única alerta por consumo anticipado de presupuesto, y la exclusión de rutas ajenas a /api/v1/tasks como login y registro.
```

**Qué salió:** funcionó a la primera. El umbral de 500 ms es una elección mía, no un dato del proyecto, y el documento lo marca como propuesta.

## Prompt 6

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
Sí
```

**Qué salió:** commit `71aa850` a la primera.
