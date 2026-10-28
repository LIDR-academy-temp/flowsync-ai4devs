import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { Input } from './input'

const meta = {
  title: 'UI/Input',
  component: Input,
  args: {
    'aria-label': 'Título de la tarea',
    placeholder: '¿Qué hay que hacer?',
    disabled: false,
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Normal: Story = {}

export const Deshabilitada: Story = {
  args: { disabled: true },
}

// No solo cómo se ve: que el campo acepta lo que se teclea y que se puede vaciar.
export const EscribirYBorrar: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const field = canvas.getByRole('textbox', { name: args['aria-label'] })

    await userEvent.type(field, 'Preparar la demo del jueves')
    await expect(field).toHaveValue('Preparar la demo del jueves')

    await userEvent.clear(field)
    await expect(field).toHaveValue('')
  },
}

export const Invalida: Story = {
  name: 'Inválida',
  args: { 'aria-invalid': true },
}
