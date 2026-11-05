# SLO de la API: `/api/v1/tasks`

## Alcance

Este SLO cubre **solamente** las solicitudes HTTP a la ruta `/api/v1/tasks`.

Quedan **excluidas** todas las demás rutas, entre ellas:

- `POST /api/v1/auth/signup` (registro)
- `POST /api/v1/auth/login` (login)
- `GET /api/v1/account/profile`
- `POST /api/v1/account/logout`
- cualquier otra ruta que no sea `/api/v1/tasks`

## SLI

Fracción de solicitudes a `/api/v1/tasks` que cumplen **a la vez** las dos condiciones:

1. código de estado HTTP **menor que 500**;
2. duración **menor que 500 ms**.

Una solicitud que devuelve un 5xx, o que tarda 500 ms o más, cuenta como mala aunque cumpla la otra condición.

### Fórmula

```
SLI = solicitudes a /api/v1/tasks válidas (HTTP < 500) y rápidas (< 500 ms)
      ─────────────────────────────────────────────────────────────────────
                    todas las solicitudes a /api/v1/tasks
```

## SLO

**SLI ≥ 99 %** en una **ventana móvil de 28 días**.

## Presupuesto de error

El presupuesto de error es el 1 % de las solicitudes de la ventana (100 % − 99 %).

Referencia: con **20 000 solicitudes** en la ventana, el 1 % permite **200 solicitudes malas**, es decir, con código HTTP ≥ 500 o con una duración igual o superior a 500 ms.

> Las 20 000 solicitudes son un **volumen provisional**, solo de referencia. Se cambiarán por el tráfico real medido de `/api/v1/tasks` en cuanto haya datos de producción, y el presupuesto absoluto se recalculará a partir de ese volumen.

## Alerta

La alerta se basa en **síntomas que nota el usuario** (solicitudes a `/api/v1/tasks` que fallan con un 5xx o tardan 500 ms o más) y en el **consumo del presupuesto de error**, no en causas internas como CPU, memoria o conexiones a la base.

- **Tasa de consumo** = (fracción de solicitudes malas en el periodo observado) ÷ 1 %.
  Con una tasa de 1, el presupuesto se agota justo al final de los 28 días.
- **Condición de aviso:** la alerta salta cuando la tasa de consumo actual, mantenida en el tiempo, **haría que el presupuesto se agotara antes de que terminen los 28 días**. Es decir, cuando el presupuesto que queda ÷ la tasa de consumo da menos tiempo que el que falta para cerrar la ventana.
- Mientras la proyección deje presupuesto hasta el final de la ventana, no se avisa, aunque haya solicitudes malas sueltas.
