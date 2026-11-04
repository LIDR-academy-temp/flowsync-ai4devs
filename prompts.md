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

**Modelo:** Opus 5.5 with high effort
**Herramienta:** Claude Code

```
Instrumenta el backend (backend/) con OpenTelemetry, envía las trazas a un servicio que se ejecuta en la máquina local.
- Utiliza el paquete oficial de AdonisJS, @adonisjs/otel, que se instala desde backend/ con node ace add @adonisjs/otel, no con npm install. Instalalo desde backend/ con node ace add @adonisjs/otel, no con npm install. 
- Añade un servicio llamado observability a compose.yaml, utilizando la imagen otel/opentelemetry-collector-contrib:0.162.0. Debe publicar los puertos 4317 y 4318 y tener un archivo de configuración con un receptor otlp para ambos protocolos, y un exportador debug con verbosity: detailed en la tubería de trazas.
No modifiques el frontend.
No corrijas automaticamente los problemas. Si las trazas no llegan, investigue la causa y dímela.
```

**Qué salió:**
Me presentó el plan antes de tocar nada y pidió mi aprobación.
Hizo los cambios y comprobo que las trazas llegan. El backend envía por OTLP/HTTP a localhost:4318 y el collector las escribe enteras en su log. Identificó 5 roblemas que deja el instalador pero no corrigió nada come le pedi.

Cuántas trazas distintas llegaron (docker compose logs observability | grep "Trace ID" | sort -u | wc -l)? 
25 trazas.


## Prompt 2

**Modelo:** Opus 5.5 with high effort
**Herramienta:** Claude Code

```
Define un SLO en docs/slo/api.md con los valores indicados. El documento debe incluir cuatro elementos:

El indicador como fracción, con numerador y denominador, utilizando la ruta, el código de respuesta y la duración de cada petición.

El objetivo del 99 % y su ventana móvil de 28 días.

El presupuesto de error expresado en peticiones, calculado con el volumen supuesto de 20.000 peticiones. Debe quedar claro que ese volumen se sustituirá por el real.

Una única alerta basada en un problema que percibe el usuario, no en una causa interna. Debe avisar cuando el ritmo de consumo del presupuesto indique que se agotará antes de terminar la ventana.

También debe indicar expresamente qué rutas quedan fuera del objetivo: todas las que no pertenezcan a /api/v1/tasks, como el registro y el inicio de sesión.
```

**Qué salió:**
He creado docs/slo/api.md con los cuatro elementos y la lista de rutas que quedan fuera. No he hecho commit, como pediste antes.


## Prompt 3

**Modelo:** Opus 5.5 with high effort
**Herramienta:** Claude Code

```
Cuánto presupuesto de error obtuviste, expresado en peticiones, y si te parece mucho o poco para un mes de uso real de FlowSync.
```

**Qué salió:**
El presupuesto es de 200 peticiones malas cada 28 días: el 1 % de las 20.000 peticiones supuestas. Como número es poco. Como tolerancia de cara a las personas usuarias no es exigente. Estos son los motivos: