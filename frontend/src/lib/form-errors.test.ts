import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api'
import {
  NETWORK_ERROR_MESSAGE,
  UNEXPECTED_ERROR_MESSAGE,
  toFormErrors,
} from '@/lib/form-errors'

describe('ApiError.fromBody', () => {
  it('keeps the AdonisJS error entries', () => {
    const error = ApiError.fromBody(422, {
      errors: [{ message: 'taken', rule: 'database.unique', field: 'email' }],
    })

    expect(error.status).toBe(422)
    expect(error.details).toEqual([
      { message: 'taken', rule: 'database.unique', field: 'email' },
    ])
  })

  it('tolerates bodies that are not the expected shape', () => {
    expect(ApiError.fromBody(500, null).details).toEqual([])
    expect(ApiError.fromBody(500, '<html>').details).toEqual([])
    expect(ApiError.fromBody(500, { errors: [null, 1] }).details).toEqual([])
  })
})

describe('toFormErrors', () => {
  it('maps validation errors to Spanish field messages', () => {
    const error = new ApiError(422, [
      { message: 'x', rule: 'email', field: 'email' },
      { message: 'x', rule: 'minLength', field: 'password', meta: { min: 8 } },
      { message: 'x', rule: 'sameAs', field: 'passwordConfirmation' },
    ])

    expect(toFormErrors(error)).toEqual({
      fields: {
        email: 'Introduce un email válido.',
        password: 'Debe tener al menos 8 caracteres.',
        passwordConfirmation: 'Las contraseñas no coinciden.',
      },
    })
  })

  it('keeps only the first error per field', () => {
    const error = new ApiError(422, [
      { message: 'x', rule: 'required', field: 'email' },
      { message: 'x', rule: 'email', field: 'email' },
    ])

    expect(toFormErrors(error).fields).toEqual({
      email: 'Este campo es obligatorio.',
    })
  })

  it('prefers per-field overrides', () => {
    const error = new ApiError(422, [
      { message: 'x', rule: 'database.unique', field: 'email' },
    ])

    expect(
      toFormErrors(error, {
        fieldMessages: { 'email.database.unique': 'Ocupado' },
      }).fields.email,
    ).toBe('Ocupado')
  })

  it('falls back to the backend message for unknown rules', () => {
    const error = new ApiError(422, [
      { message: 'Raw backend text', rule: 'regex', field: 'email' },
    ])

    expect(toFormErrors(error).fields.email).toBe('Raw backend text')
  })

  it('uses status messages for non-field errors', () => {
    const error = new ApiError(400, [{ message: 'Invalid user credentials' }])

    expect(toFormErrors(error, { statusMessages: { 400: 'Mal' } })).toEqual({
      form: 'Mal',
      fields: {},
    })
    expect(toFormErrors(error).form).toBe(UNEXPECTED_ERROR_MESSAGE)
  })

  it('reports network failures and unknown errors', () => {
    expect(toFormErrors(new ApiError(0, [])).form).toBe(NETWORK_ERROR_MESSAGE)
    expect(toFormErrors(new ApiError(502, [])).form).toBe(NETWORK_ERROR_MESSAGE)
    expect(toFormErrors(new ApiError(504, [])).form).toBe(NETWORK_ERROR_MESSAGE)
    expect(toFormErrors(new TypeError('boom')).form).toBe(
      UNEXPECTED_ERROR_MESSAGE,
    )
  })
})
