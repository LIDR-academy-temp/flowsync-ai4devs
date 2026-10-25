# Registro de prompts

Prompts enviados a Claude Code en esta sesión, en orden cronológico y de forma literal.

## 1. 2026-10-25

```
from now on, I need to register all the prompts I will provide you in docs/spec-viva/egv, keep this in mind
```

## 2. 2026-10-25

````
Analiza el codebase y crea una spec del repo de las capabilities que actualmente tiene el proyecto.No inventes, no modifiques codigo. Solo lo que hay actualmente. Por separado, Frontend y Backend. Sigue extrictamente el formato: 

Arriba, un ## Purpose de una o dos frases: para qué existe esta capability.

Debajo, ## Requirements, y colgando de él ### Requirement: en los que el sistema SHALL hacer algo.

Bajo cada requisito, al menos un #### Scenario: de cuatro almohadillas, con dos viñetas: **WHEN** y **THEN**. No hay casilla para el GIVEN: la precondición se mete dentro del WHEN.

En castellano, salvo las mayúsculas de la RFC.

. Tres reglas duras que debes cumplir: 1. Nada de ADDED, MODIFIED ni REMOVED. 2. Solo comportamiento observable desde fuera (no nombres de clases, archivos, rutas...). 3. No toques el codigo
````
