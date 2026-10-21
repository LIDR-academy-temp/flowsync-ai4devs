# Prompts

---

## Prompt 1

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Añade una barra de progreso encima del listado de tareas que muestre qué parte de las tareas que se están viendo está en done.
```

**Qué salió:** funcionó, pero antes de escribir código me paró: con los filtros actuales «las tareas que se están viendo» nunca mezclan hechas y no hechas, así que la barra marcaría siempre 0% o 100%. Elegí que midiera lo cargado en la vista (incluidas las que se marcan como hechas y salen de la lista). Hizo `components/task-progress.tsx`, lo puso fuera de la rama de la lista para que no desapareciera al llegar al 100% y lo commiteó (`aa8cdf4`). De paso avisó de un error que ya existía: al vaciar la vista por defecto marcando todo como hecho, se queda para siempre en «Comprobando si hay tareas hechas…».
