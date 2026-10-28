# El pipeline de CI

Qué es: el workflow [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) responde a cinco
preguntas, una por trabajo, en cada pull request y en cada push a `main`. Los tres primeros llaman a
los mismos atajos del [`Makefile`](../Makefile) que se usan en local, para que el pipeline no tenga
una segunda versión de cada receta.

Este documento cuenta lo que afirma cada trabajo, lo que **no** está en el repositorio (los pasos
manuales) y las decisiones que no se ven leyendo el YAML.

## Los cinco trabajos

| Trabajo | Pregunta | Cuándo corre | Lo que no afirma |
|---|---|---|---|
| `test` | ¿la suite del backend pasa en una máquina limpia? (`make test`) | PR y push a `main` | nada sobre la base de desarrollo ni sobre la imagen |
| `image` | ¿la imagen de la API se puede fabricar desde cero? (`make image`) | PR y push a `main` | que el contenedor arranque: no se ejecuta |
| `lint-workflows` | ¿los archivos del pipeline son válidos? (`make ci-lint`) | PR y push a `main` | que hagan lo que deben en GitHub |
| `infra-plan` | ¿qué cambiaría en Railway si se fusiona? | PR del propio repo que toca `.railway/` | que el plan se pueda aplicar después |
| `infra-apply` | aplica en Railway el plan revisado | al fusionar ese PR | que el servicio funcione tras el cambio |

`test`, `image` y `lint-workflows` corren en paralelo. Si llega otro push a la misma rama, la
ejecución anterior se cancela; `infra-apply` va aparte, en cola, y nunca se cancela a medias.

El recuento de tests de `test` aparece en el **resumen de la ejecución** (la pestaña *Summary* de la
run), también cuando la suite falla.

## Pasos manuales pendientes

Nada de esto se puede commitear.

1. **Dar de alta el secreto `RAILWAY_TOKEN`** en *Settings → Secrets and variables → Actions*. Es un
   token de proyecto de Railway con acceso al entorno de destino. Sin él, `infra-plan` falla en el
   primer PR que toque `.railway/`; mientras esa carpeta no exista, no hace falta.
2. **Comprobarlo en un PR de verdad.** En local solo se puede verificar que el YAML es válido
   (`make ci-lint`), no que los trabajos pasen en el runner.
3. **(Opcional) Marcar `test`, `image` y `lint-workflows` como checks obligatorios** en la protección
   de `main`.
4. **(Opcional) Comentario del plan con el bot de Railway.** Hoy lo firma `github-actions`. Para que
   lo firme Railway hay que dar `id-token: write` a `infra-plan` e instalar la app de Railway en el
   repositorio.

## Decisiones que no se ven en el YAML

- **`DB_EXTERNA`.** `make test` pasa por `make db-up`, que levanta `db-test` con compose en el puerto
  54411. En el pipeline ese puerto ya lo ocupa el contenedor de servicio, así que el trabajo define
  `DB_EXTERNA=1` y `db-up` no levanta nada. En local no se define y todo sigue igual.
- **`NODE_ENV=test` en el trabajo.** No hay `.env` en el runner, así que el primer paso de
  `make migrate` («base de desarrollo») también migra la de pruebas, y el segundo no tiene nada que
  hacer. El aviso que imprime no describe lo que pasa en CI.
- **Infra sin filtro de rutas.** Un filtro `paths` a nivel de workflow dejaría sin correr a los demás
  trabajos, así que `infra-plan` e `infra-apply` consultan la lista de ficheros del PR. Si no toca
  `.railway/`, salen en verde sin hacer nada y lo dicen en el resumen.
- **PR desde un fork.** No ven `RAILWAY_TOKEN`; los dos trabajos de infra se saltan, con el mismo
  criterio que `revisor.yml` y `chromatic.yml`.
- **Acciones fijadas por SHA**, con la etiqueta en un comentario. Dentro de `railwayapp/config` la
  acción usa otras (`setup-node`, `upload-artifact`, `github-script`) por etiqueta, y eso no se
  controla desde aquí.
