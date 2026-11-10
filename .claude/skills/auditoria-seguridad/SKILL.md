---
name: auditoria-seguridad
description: Audita la seguridad de UNA capability de FlowSync (auth, tasks, comments...) contra el OWASP Top 10 y las reglas de negocio del proyecto, lanzando el subagente security-auditor, y guarda su informe tal cual en docs/seguridad/<capability>.md. No arregla nada. Usar cuando se pida auditar la seguridad de una capability o /auditoria-seguridad.
---
# Auditoría de seguridad de una capability

Es un procedimiento fijo: lanzar, guardar, avisar. Sale siempre igual.

No es el análisis de amenazas de la skill `analisis-de-amenazas`: aquel recorre el OWASP Top 10 **para aplicaciones con modelos de lenguaje** sobre todo el sistema y el harness. Este recorre el OWASP Top 10 **de aplicaciones web** sobre el código de **una** capability. Los dos escriben en `docs/seguridad/`, con nombres distintos.

## Prohibiciones

- **No arreglas nada.** Ni código, ni configuración, ni tests, ni specs, aunque el arreglo sea obvio. El informe es una lista para decidir, no código para aceptar.
- **No editas el informe.** Se guarda tal cual lo devuelve el subagente: no se resume, no se reordena, no se suavizan niveles y no se añaden hallazgos tuyos.
- No relanzas el subagente para conseguir un informe «mejor». Si el informe sale vacío, ese es el resultado.

## 1. La capability

- Sale de la petición (`auth`, `tasks`, `comments`...). Tiene que existir como `openspec/specs/<capability>/`. Si no existe o no está claro cuál es, pregunta y no lances nada.
- Fecha: `date -u +%F`. Commit: `git rev-parse --short HEAD`.

## 2. Lanza el subagente `security-auditor`

Una sola vez, con este encargo y nada más:

> Audita la capability `<capability>` de FlowSync. Su contrato está en `openspec/specs/<capability>/` y `docs/capabilities/<capability>/README.md` (si existe); sus rutas, en `backend/start/routes.ts`.

Él ya trae el método, las tres reglas de negocio y el formato del informe. No se los repitas ni los cambies.

## 3. Guarda el informe

En `docs/seguridad/<capability>.md`. Si ya existe, se sobrescribe: la versión anterior queda en git. Arriba, antes del informe, solo estas líneas:

```markdown
- **Fecha:** AAAA-MM-DD (UTC)
- **Commit:** <hash corto>
- **Generado por:** skill `auditoria-seguridad`, subagente `security-auditor`. Sin revisar ni arreglar.

<informe del subagente, tal cual>
```

## 4. Cierra

Responde con la ruta del archivo y el número de hallazgos por nivel (crítico / alto / medio), sin copiar el informe. Qué se arregla, y en qué orden, lo decide una persona después.
