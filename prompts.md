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

**Modelo utilizado:** Claude 3.5 Sonnet (Thinking High)
**Herramienta:** Claude Code

```
Título: Flujo de inicio de sesión y visualización de perfil de usuario

Descripción:
Como usuario de FlowSync, quiero una interfaz en el frontend que me permita iniciar sesión con mis credenciales y, una vez autenticado, ver los datos de mi cuenta en una pantalla de perfil con la opción de cerrar sesión.

Criterios de aceptación:
- Implementar la vista/formulario de autenticación conectada al endpoint correspondiente del backend.
- Al autenticarse exitosamente, almacenar de forma segura la sesión y redirigir al usuario a una vista de perfil.
- La pantalla de perfil debe consultar y mostrar los datos del usuario autenticado (nombre completo, correo e iniciales) mediante el endpoint de cuenta existente.
- Incluir la opción de cerrar sesión, invalidando la sesión en el servidor y devolviendo al usuario a la pantalla de acceso.
- Manejar estados de carga durante las peticiones y mensajes claros ante credenciales inválidas o errores de red.
- Reutilizar los componentes de UI ya existentes en el proyecto sin añadir dependencias externas.

```
**Qué salió:** Demoro un poco más con el harness.

---

## Prompt 2

**Modelo utilizado:** Claude 3.5 Sonnet (Thinking High)
**Herramienta:** Claude Code

```
Como nuevo usuario de FlowSync, quiero una pantalla de registro en el frontend que me permita crear una cuenta ingresando mis datos, para luego acceder directamente a la plataforma.

Criterios de aceptación:
- Crear el formulario de registro integrado con el endpoint de registro existente en el backend.
- Solicitar nombre completo, correo electrónico, contraseña y confirmación de contraseña.
- Validar en el cliente que los campos requeridos estén presentes y que las contraseñas coincidan antes de enviar la petición.
- Al registrarse exitosamente, guardar la sesión obtenida y redirigir directamente a la vista de perfil sin requerir un login manual adicional.
- Mostrar estados de carga en el botón durante el envío y manejar mensajes de error claros (como correo duplicado o validaciones de longitud de contraseña).
- Reutilizar los componentes de UI ya existentes en el proyecto y mantener la coherencia de estilos con la vista de login.

```
**Qué salió:** Demoro un poco más con el harness.
---

## Prompt 3: Frontend - Renderizado del Mapeo de Capacidades y Manejo de Errores

**Modelo utilizado:** Claude 3.5 Sonnet (Thinking High)
**Herramienta:** Claude Code
```
Muestra la respuesta del backend en la interfaz tras enviar el formulario:

- Si la petición es exitosa (200), oculta el formulario y muestra una tarjeta con el nombre del usuario, su documento y la lista de capacidades sugeridas, junto a un botón para volver al formulario.
- Si la petición falla, muestra un mensaje de error claro en pantalla sin borrar los datos que el usuario ya escribió.
- La transición debe ser puramente reactiva, sin recargar la página.
```

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.
