# FlowSync — atajos de desarrollo.
#
# Requisitos: Node.js + npm y GNU Make.
#   - macOS:        make viene con las Command Line Tools de Xcode.
#   - Linux / WSL:  sudo apt install make   (o el equivalente de tu distro)
#
# Windows sin WSL no está soportado: estas recetas usan sintaxis POSIX.
# Desde WSL, trabaja sobre el repo clonado dentro del sistema de ficheros
# de Linux (~/...), no en /mnt/c, o npm install irá muy lento.

SHELL := /bin/bash

BACKEND  := backend
FRONTEND := frontend

.DEFAULT_GOAL := help
.PHONY: test-unit test-e2e ui test-ui test-web hooks help setup start install env db-up db-down migrate seed db-readonly copia-produccion test clean image image-run image-stop ci-lint

# La ayuda se genera a partir de los comentarios `## ...` de cada target, para
# que no haya un segundo listado que mantener a mano y que pueda divergir.
help: ## Muestra esta ayuda
	@echo "FlowSync — targets disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z0-9_-]+:.*## ' $(MAKEFILE_LIST) \
		| awk 'BEGIN { FS = ":.*## " }; { printf "  make %-10s %s\n", $$1, $$2 }'
	@echo ""

# ---------------------------------------------------------------------------
# setup
# ---------------------------------------------------------------------------

setup: install env migrate ## Deja el proyecto listo para arrancar
	@echo ""
	@echo "✅ Setup completado. Arranca todo con: make start"

install:
	@command -v node >/dev/null 2>&1 || { echo "❌ Node.js no está instalado."; exit 1; }
	@command -v npm  >/dev/null 2>&1 || { echo "❌ npm no está instalado."; exit 1; }
	@echo "📦 Instalando dependencias del backend..."
	@cd $(BACKEND) && npm install
	@echo "📦 Instalando dependencias del frontend..."
	@cd $(FRONTEND) && npm install

env:
	@if [ ! -f $(BACKEND)/.env ]; then \
		echo "📝 Creando $(BACKEND)/.env desde .env.example..."; \
		cp $(BACKEND)/.env.example $(BACKEND)/.env; \
	else \
		echo "📝 $(BACKEND)/.env ya existe, no se toca."; \
	fi
	@if [ ! -f $(FRONTEND)/.env ]; then \
		echo "📝 Creando $(FRONTEND)/.env desde .env.example..."; \
		cp $(FRONTEND)/.env.example $(FRONTEND)/.env; \
	else \
		echo "📝 $(FRONTEND)/.env ya existe, no se toca."; \
	fi
	@if grep -Eq '^APP_KEY=.+' $(BACKEND)/.env; then \
		echo "🔑 APP_KEY ya definida, no se regenera."; \
	else \
		echo "🔑 Generando APP_KEY..."; \
		cd $(BACKEND) && node ace generate:key; \
	fi

# ---------------------------------------------------------------------------
# bases de datos (PostgreSQL en Docker, ver compose.yaml)
# ---------------------------------------------------------------------------

# `--wait` bloquea hasta que los dos healthchecks pasan: la imagen crea la base
# la primera vez y no acepta conexiones mientras tanto.
#
# En GitHub Actions (`GITHUB_ACTIONS` definida; no `CI`, que otros entornos también
# ponen) no se levanta nada: el workflow ya trae su PostgreSQL como contenedor de
# servicio publicado en el 54411, y `db-test` de compose intentaría ocupar ese mismo
# puerto. Así `make test` es el mismo comando en el portátil y en CI.
db-up: ## Levanta las bases de desarrollo (54410) y de pruebas (54411)
	@if [ -n "$$GITHUB_ACTIONS" ]; then \
		echo "🐘 CI: la base de pruebas la aporta el servicio del workflow; no se levanta compose."; \
	else \
		echo "🐘 Levantando PostgreSQL (db y db-test)..."; \
		docker compose up -d --wait db db-test; \
	fi

# Sin `-v`: el volumen de desarrollo se conserva. La de pruebas es tmpfs y se vacía sola.
db-down: ## Para las bases (la de desarrollo conserva sus datos)
	@docker compose down

# La de pruebas es efímera: tras un `db-down` está vacía y hay que migrarla otra
# vez, por eso `test` también pasa por aquí. NODE_ENV=test hace que Adonis cargue
# .env.test y apunte a db-test.
migrate: db-up ## Migra las dos bases: desarrollo y pruebas
	@echo "🗃️  Migrando la base de desarrollo..."
	@cd $(BACKEND) && node ace migration:run
	@echo "🗃️  Migrando la base de pruebas..."
	@cd $(BACKEND) && NODE_ENV=test node ace migration:run

# El seeder solo corre con NODE_ENV=development (static environment) y se puede
# lanzar varias veces sin duplicar nada. Pasa por `migrate` para no sembrar sobre
# tablas que no existen.
seed: migrate ## Siembra la base de desarrollo: 5 personas y 40 tareas
	@cd $(BACKEND) && node ace db:seed

# Rol de solo lectura para que un agente mire la base de desarrollo (no la de pruebas).
# La contraseña sale de DB_RO_PASSWORD en backend/.env y viaja como variable de entorno
# del contenedor (`-e RO_PW` sin valor la hereda de este proceso), no como argumento:
# así no se ve en `ps` ni queda en el SQL. Idempotente: relanzarlo reaplica y rota.
db-readonly: db-up ## Crea o actualiza flowsync_ro, rol de solo lectura (solo desarrollo)
	@pw=$$(grep -E '^DB_RO_PASSWORD=' $(BACKEND)/.env | head -n1 | cut -d= -f2-); \
	if [ -z "$$pw" ]; then \
		echo "❌ Falta DB_RO_PASSWORD en $(BACKEND)/.env (ejemplo en $(BACKEND)/.env.example)."; exit 1; \
	fi; \
	echo "🔒 Aplicando el rol flowsync_ro a la base de desarrollo..."; \
	RO_PW="$$pw" docker compose exec -T -e RO_PW db \
		psql -q -U flowsync -d flowsync -f - < $(BACKEND)/database/readonly-role.sql

# Carga una copia de producción en desarrollo, seudonimizada (INC-0412). SUSTITUYE los
# datos de users, tasks y auth_access_tokens de la base de desarrollo, y vacía comments
# (cuelgan de esas personas y tareas, y la copia no trae ninguno). Lo lanza una
# persona: la copia lleva datos personales reales y ningún agente la abre. El camino
# entero (base intermedia cerrada a flowsync_ro, database/seudonimizar.sql, carga y
# borrado de la intermedia) está en backend/database/copia-produccion.sh.
# Otra copia: make copia-produccion COPIA=<ruta>
COPIA ?= backups/produccion-2026-10-02.dump

copia-produccion: migrate ## Carga la copia de producción SEUDONIMIZADA en desarrollo (sustituye sus datos)
	@bash $(BACKEND)/database/copia-produccion.sh "$(COPIA)"

test: migrate ## Corre los tests del backend contra la base de pruebas
	@cd $(BACKEND) && npm test

test-unit: migrate ## Solo la suite unitaria (sin servidor ni base de datos)
	@cd $(BACKEND) && node ace test unit

test-e2e: migrate ## Solo la suite funcional: peticiones HTTP reales contra la base de pruebas
	@cd $(BACKEND) && node ace test functional

# ---------------------------------------------------------------------------
# frontend: catálogo de componentes y comprobaciones de interfaz
# ---------------------------------------------------------------------------

ui: ## Arranca el catálogo de componentes (Storybook, http://localhost:6006)
	@cd $(FRONTEND) && npm run storybook

# Cada historia es una comprobación: se monta en un Chromium sin ventana y se
# pasa el chequeo de accesibilidad. No necesita servidor ni base de datos.
test-ui: ## Corre las comprobaciones de las historias, sin ventana
	@cd $(FRONTEND) && npx vitest run --project=storybook

# Aún no hay recorrido escrito ni @playwright/test instalado: en vez de fallar
# con un error de npx que no explica nada, la receta lo dice. En cuanto exista
# frontend/playwright.config.ts, esto lo corre sin tocar el Makefile.
test-web: ## Corre el recorrido de navegador (Playwright; necesita la aplicación levantada)
	@if [ ! -f $(FRONTEND)/playwright.config.ts ]; then \
		echo "❌ No hay recorrido de navegador todavía: falta $(FRONTEND)/playwright.config.ts."; \
		echo "   Hay que instalar @playwright/test en $(FRONTEND) y escribir el recorrido."; \
		exit 1; \
	fi
	@cd $(FRONTEND) && npx playwright test

# Un hook de git no viaja en el clon: hay que activarlo en cada copia del repo.
# Idempotente. Para quitarlo: git config --unset core.hooksPath
hooks: ## Activa los hooks de git del repo (pre-push: make test-ui); una vez por clon
	@git config core.hooksPath .githooks
	@echo "✅ Hooks activados (core.hooksPath = .githooks). Antes de cada push correrá: make test-ui"

# ---------------------------------------------------------------------------
# imagen de la API (backend/Dockerfile) y validación del pipeline
# ---------------------------------------------------------------------------

IMAGE      := flowsync-api:local
IMAGE_NAME := flowsync-api-local
IMAGE_PORT ?= 3334

image: ## Construye la imagen de la API (flowsync-api:local)
	@docker build -t $(IMAGE) $(BACKEND)

# Arranca la imagen contra la base de desarrollo del host. Encima de backend/.env
# se fuerzan tres valores: HOST=0.0.0.0 y DB_HOST=host.docker.internal porque dentro
# del contenedor `localhost` es el propio contenedor, y APP_URL porque Docker no
# expande el ${HOST}:${PORT} que usa ese fichero. `--add-host` hace que
# host.docker.internal también exista en Linux (en Docker Desktop ya existe).
image-run: ## Arranca la imagen en segundo plano (IMAGE_PORT, por defecto 3334) y le pide la raíz
	@docker run -d --name $(IMAGE_NAME) \
		-p $(IMAGE_PORT):3333 \
		--add-host=host.docker.internal:host-gateway \
		--env-file $(BACKEND)/.env \
		-e HOST=0.0.0.0 \
		-e DB_HOST=host.docker.internal \
		-e APP_URL=http://localhost:$(IMAGE_PORT) \
		$(IMAGE)
	@sleep 3
	@curl -s http://localhost:$(IMAGE_PORT)/
	@echo ""

image-stop: ## Para y borra el contenedor de la imagen
	@docker rm -f $(IMAGE_NAME)

# actionlint dentro de su imagen oficial: no se instala nada. Sin argumentos
# valida todos los workflows de .github/workflows/. MSYS_NO_PATHCONV=1: en Git Bash
# de Windows, sin él, `-w /repo` se reescribe a `C:/Program Files/Git/repo` y Docker
# lo rechaza; en Linux, macOS y WSL no hace nada.
ci-lint: ## Valida los workflows con actionlint (imagen de Docker, sin instalar nada)
	@MSYS_NO_PATHCONV=1 docker run --rm -v "$(CURDIR):/repo" -w /repo rhysd/actionlint:1.7.12 -color

# ---------------------------------------------------------------------------
# start
# ---------------------------------------------------------------------------

# Lanza los dos servidores en paralelo dentro de la misma receta.
#
# `kill -INT 0` manda un SIGINT a todo el grupo de procesos — exactamente lo
# mismo que hace un Ctrl-C real — y así se lleva por delante ambos servidores y
# sus hijos, sin dejar nodos huérfanos ocupando los puertos. Tiene que ser
# SIGINT y no el SIGTERM por defecto de `kill 0`: con SIGTERM, el wrapper de
# `npm run dev` y el `node ace serve --hmr` sobreviven a la señal y quedan
# colgados. Se dispara desde dos sitios:
#
#   - el trap, cuando llega un Ctrl-C (SIGINT al grupo) o un SIGTERM;
#   - el final de cada subshell, cuando *ese* servidor termina por su cuenta.
#
# Lo segundo es necesario porque `wait` a secas espera a que acaben TODOS los
# jobs: si el backend crashea al arrancar, el frontend seguiría vivo para
# siempre y el usuario no se enteraría. No se usa `wait -n` (que sería lo
# natural) porque llegó en bash 4.3 y macOS trae bash 3.2.
# Ojo: `start` está pensado para uso interactivo, desde una terminal. No lo
# llames desde un script ni desde CI: sin control de trabajos, el grupo de
# procesos incluye al proceso que invocó a make, y el SIGINT se lo llevaría por
# delante a él también. Aislar los servidores en su propio grupo con `set -m`
# no vale: los dejaría en segundo plano y el primer `read` de stdin les
# provocaría un SIGTTIN, colgando el "Press h" de Adonis y los atajos de Vite.
start: db-up ## Levanta las bases, el backend y el frontend
	@if [ ! -d $(BACKEND)/node_modules ] || [ ! -d $(FRONTEND)/node_modules ]; then \
		echo "❌ Faltan dependencias. Ejecuta primero: make setup"; exit 1; \
	fi
	@if [ ! -f $(BACKEND)/.env ]; then \
		echo "❌ Falta $(BACKEND)/.env. Ejecuta primero: make setup"; exit 1; \
	fi
	@echo "🚀 Arrancando backend (http://localhost:3333) y frontend (http://localhost:5173)..."
	@echo "   Ctrl-C para parar los dos. Si uno se cae, el otro se cierra también."
	@echo ""
	@trap 'trap - INT TERM EXIT; kill -INT 0' INT TERM EXIT; \
	( cd $(BACKEND)  && npm run dev; \
	  echo ""; echo "⚠️  El backend se ha parado. Cerrando el frontend."; kill -INT 0 ) & \
	( cd $(FRONTEND) && npm run dev; \
	  echo ""; echo "⚠️  El frontend se ha parado. Cerrando el backend."; kill -INT 0 ) & \
	wait

# ---------------------------------------------------------------------------
# clean
# ---------------------------------------------------------------------------

clean: ## Borra node_modules y las bases de datos (volumen incluido)
	@echo "🧹 Limpiando..."
	@rm -rf $(BACKEND)/node_modules $(FRONTEND)/node_modules
	@docker compose down -v
	@echo "✅ Listo. Vuelve a ejecutar: make setup"
