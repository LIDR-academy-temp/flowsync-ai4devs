import { ApiError, type ApiErrorDetail } from '@/lib/api'

export type FormErrors = {
  /** Message for the whole form, shown above the fields. */
  form?: string
  /** First message for each field, keyed by the backend field name. */
  fields: Record<string, string>
}

type Options = {
  /** Form-level message per HTTP status, e.g. `{ 400: 'Bad credentials' }`. */
  statusMessages?: Record<number, string>
  /** Per-field overrides keyed as `field.rule`, e.g. `email.database.unique`. */
  fieldMessages?: Record<string, string>
}

export const NETWORK_ERROR_MESSAGE =
  'No se pudo conectar con el servidor. Inténtalo de nuevo en unos segundos.'
export const UNEXPECTED_ERROR_MESSAGE =
  'Ha ocurrido un error inesperado. Inténtalo de nuevo.'

function ruleMessage({ rule, meta }: ApiErrorDetail): string | undefined {
  switch (rule) {
    case 'required':
      return 'Este campo es obligatorio.'
    case 'email':
      return 'Introduce un email válido.'
    case 'minLength':
      return `Debe tener al menos ${meta?.min ?? ''} caracteres.`
    case 'maxLength':
      return `No puede superar los ${meta?.max ?? ''} caracteres.`
    case 'sameAs':
      return 'Las contraseñas no coinciden.'
    case 'database.unique':
      return 'Este valor ya está en uso.'
    default:
      return undefined
  }
}

/**
 * Turns whatever a submit handler caught into Spanish messages the form can
 * render. Validation errors (422) map to fields; everything else becomes a
 * single form-level message, so users never see raw backend or console text.
 */
export function toFormErrors(
  error: unknown,
  options: Options = {},
): FormErrors {
  if (!(error instanceof ApiError)) {
    return { form: UNEXPECTED_ERROR_MESSAGE, fields: {} }
  }
  if (error.status === 0) {
    return { form: NETWORK_ERROR_MESSAGE, fields: {} }
  }

  const fields: Record<string, string> = {}
  for (const detail of error.details) {
    if (!detail.field || fields[detail.field]) continue
    fields[detail.field] =
      options.fieldMessages?.[`${detail.field}.${detail.rule}`] ??
      ruleMessage(detail) ??
      detail.message
  }
  if (Object.keys(fields).length > 0) return { fields }

  return {
    form: options.statusMessages?.[error.status] ?? UNEXPECTED_ERROR_MESSAGE,
    fields,
  }
}
