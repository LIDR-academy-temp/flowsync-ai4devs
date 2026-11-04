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

**Modelo:** Opus 5.5 High
**Herramienta:** Claude Code

```
Instrumenta el backend con el paquete oficial de OpenTelemetry y añade al compose.yaml un servicio llamado observability, usando la imagen otel/opentelemetry-collector-contrib:0.162.0. Publica a los puertos 4317 y 4318l, crea un archoivo de configuracion conun receptor de otlp para ambos protocolos y un exportador debug con el setting de verbosity:detailed.
```

**Qué salió:** Me pidio confirmacion del plan y despues implemento:
```
¿Qué paquete es el «oficial»? Recomiendo @adonisjs/otel (1.2.4), el del equipo de AdonisJS, que admite Adonis 7 e instrumenta HTTP y Lucid. Arrastra @opentelemetry/sdk-node 0.213. La alternativa es usar directamente @opentelemetry/sdk-node (0.300), más reciente, pero la carga en ESM y la integración con Adonis quedarían a mano.
¿Se envían datos de usuario en los spans? Con @adonisjs/auth instalado, el paquete añade user.id, user.email y user.roles, y verbosity: detailed los escribiría en los logs de Docker. Recomiendo userContext: false, en línea con la regla del proyecto sobre datos personales.
¿Se activa en producción? No hay collector allí, así que las exportaciones fallarían. Recomiendo activarlo solo en development por ahora.
¿Dónde se publican los puertos? Recomiendo 127.0.0.1:4317 y 127.0.0.1:4318, como hace db, porque OTLP no lleva autenticación. Si necesitas que se vean desde la red, sería 4317:4317 y 4318:4318.
```

## Prompt 2

**Modelo:** Opus 5.5 High
**Herramienta:** Claude Code

```
"De las trazas observadsa, cual tomo mas tiempo?
```

**Qué salió:**
La traza más lenta fue POST /api/v1/auth/signup, con 321,3 ms.

| Traza | Duración | Spans | Tiempo en base de datos |
| :--- | :--- | :--- | :--- |
| `POST /api/v1/auth/signup` | 321,3 ms | 4 | 7,6 ms |
| `POST /api/v1/auth/login` | 118,6 ms | 3 | 2,8 ms |
| `GET /api/v1/account/profile` | 75,4 ms | 4 | 2,8 ms |


## Prompt 3

**Modelo:** Opus 5.5 High
**Herramienta:** Claude Code

```
Define un SLO en docs/slo/api.md con los valores indicados. El documento debe incluir cuatro elementos:

- El indicador como fracción, con numerador y denominador, utilizando la ruta, el código de respuesta y la duración de cada petición.

- El objetivo del 99 % y su ventana móvil de 28 días.

- El presupuesto de error expresado en peticiones, calculado con el volumen supuesto de 20.000 peticiones. Debe quedar claro que ese volumen se sustituirá por el real.

- Una única alerta basada en un problema que percibe el usuario, no en una causa interna. Debe avisar cuando el ritmo de consumo del presupuesto indique que se agotará antes de terminar la ventana.

-Estas rutas quedan fuera del objetivo: todas las que no pertenezcan a /api/v1/tasks, como el registro y el inicio de sesión.
```

**Qué salió:**
Creo el SLI con los datos solicitados, un SLO de 99% y asumio tiempos de espera de 500ms o menos para que san validas. Advirtio que no hay datos en produccion, y que el exportador dbug solo escribe en los logs y no hay series para calcular 28 dias ni evaluar la alerta.
Alerta para tareas que fallan o van lentas, con un ritmo de consumo mayor a 1 medido en 24hrs. Las peticiones que no llegan al backend no cuentan porque sale de lo que registra el propio sevidor del backend. Documento el estado de medicion.


## Prompt 3

**Modelo:** Opus 5.5 High
**Herramienta:** Claude Code

```
Cual es el presupuesto de error con estos datos dado en peticiones, evalua si es poco o mucho para un mes de uso real de FlowSync, comparando con aplicaciones similares.
```

**Qué salió:** Comparacion con aplicaciones similares, estimaciones de las peticiones por dia (1000), peticiones malas por dia 1.7 lo que da una caida de 1hr 36mins en 28 dias  lo que es asumible en un MVP. Recomienda no subir el presuesto a 99.9% porque significan 10mins de caida.
Tambien ajustar estos SLI/SLO con 28 dias de datos reales, en caso de superar el 99% con holgura, entonces podria subirse a 99.5%.




