# Hallazgos: imagen, entorno y pipeline

Medido el 2026-10-27 sobre `pipeline-bernardo-paroli`. Cada dato lleva al lado el comando que lo produjo.

## 1. Peso de la imagen y lo que el Dockerfile tuvo que declarar

### Tamaño

81.2 MB 

### Lo que en esta máquina ya estaba y el Dockerfile tuvo que declarar

node --version
    v24.22.1


El Dockerfile no declara ninguna dependencia del sistema: no hay ningún `apk add`

## 2. Lo que reclama el contenedor al arrancar sin variables

### Sin ninguna variable

```
$ docker run --rm flowsync-api:local

ℹ EnvValidationException: Validation failed for one or more environment variables

- Missing environment variable "NODE_ENV"
- Missing environment variable "PORT"
- Missing environment variable "HOST"
- Missing environment variable "LOG_LEVEL"
- Missing environment variable "APP_KEY"
- Missing environment variable "APP_URL"
- Missing environment variable "SESSION_DRIVER"
- Missing environment variable "DB_HOST"
- Missing environment variable "DB_PORT"
- Missing environment variable "DB_USER"
- Missing environment variable "DB_PASSWORD"
- Missing environment variable "DB_DATABASE"

 ⁃ at new EnvValidator (node_modules/@adonisjs/env/build/index.js:127:17)
 ⁃ at Env.rules (node_modules/@adonisjs/env/build/index.js:221:10)
 ⁃ at Env.create (node_modules/@adonisjs/env/build/index.js:205:23)
 ⁃ (async file://start/env.js:2:16)
```

### Clasificación

- Missing environment variable "NODE_ENV"
- Missing environment variable "PORT"
- Missing environment variable "HOST"
- Missing environment variable "LOG_LEVEL"
- Missing environment variable "APP_URL"
- Missing environment variable "SESSION_DRIVER"
- Missing environment variable "DB_HOST"
- Missing environment variable "DB_PORT"
- Missing environment variable "DB_USER"
- Missing environment variable "DB_DATABASE"


- Missing environment variable "APP_KEY"
- Missing environment variable "DB_PASSWORD"



## 3. Lo que no comprueba el pipeline

- Que la imagen arranque y responda. Nadie la ejecuta.
- **Que el entorno de producción tenga las 12 variables del apartado 2**, ni que cumplan las restricciones que el esquema no expresa (`LOG_LEVEL` válido para pino, `APP_KEY` de 16 caracteres o más, `HOST` que resuelva). Los tres fallos solo se ven al arrancar.
- Que las credenciales de la base sean buenas. Ni siquiera al arrancar: con `DB_*` falsas el contenedor arranca y falla en la primera petición.
- Las migraciones hacia atrás, ni sobre una base con datos.
- Los PR de forks que tocan `.railway/`. No tienen plan, y al fusionarlos tampoco se aplican. Los dos trabajos salen como omitidos, no como fallidos, y el cambio de infraestructura queda en `main` sin aplicar sin que nada lo avise.
- El PR ya está en `main` y la ejecución en rojo sobre un PR cerrado es la única señal. No hay reintento, ni marcha atrás, ni aviso.
- Vulnerabilidades. No hay escaneo de dependencias ni de la imagen: `grep -niE "audit|trivy|grype|snyk|codeql|scan" .github/workflows/*.yml` no da nada, y no hay `.github/dependabot.yml`.
- Que la imagen probada sea la que se despliega. `image` no publica nada, y en el repositorio no hay nada que diga cómo construye Railway lo que despliega.
- El frontend.** `ci.yml` no ejecuta ni su lint, ni su build, ni `make test-ui`.
- El lint y el typecheck del backend** (`npm run lint`, `npm run typecheck`). Solo hay typecheck como efecto lateral del build de `image`.
