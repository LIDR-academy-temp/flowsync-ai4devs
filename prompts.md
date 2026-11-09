1. Usa el subagente adversarial-reviewer para revisar el requirement Lo que cada tarea muestra de su responsable junto a cada uno de sus escenarios encontrados en este archivo @openspec/specs/tasks/spec.md. Contruye una matriz en el archivo @docs/verificacion/daca.md teniendo en cuenta la revision del subagente y validando escenario a escenario, si el requisito esta cubierto por los tests. La matriz debera tener una fila por scenario y cuatro columnas:

El scenario, en una línea. Qué se espera y en qué situación. Si no cabe en una línea, es que estás juntando dos.

Qué test lo cubre, con el nombre exacto que aparece en la suite. Sin el nombre concreto, la columna va vacía: "seguro que algo lo cubre" no es una fila.

Cubierto · No cubierto · No lo sé. Los tres estados son válidos, y el tercero no es un fallo: es el resultado más informativo de los tres.

Si pusiste "no lo sé", qué te faltó para decidirlo. Media línea. Suele ser una de dos: no encontraste dónde se comprueba, o encontraste algo que se le parece y no dice exactamente lo mismo.

2. Por cada fila en estado No cubierto en la matriz del archivo @../docs/verificacion/daca.md, escribe el test que falta. Los tests que escribas van en backend/tests/functional/tasks/, siguiendo el estilo de los que ya hay en backend/tests/functional/auth/. No toques nada fuera de backend/tests/