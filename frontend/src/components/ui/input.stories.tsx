import type { Meta, StoryObj } from '@storybook/react-vite'

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

export const Invalida: Story = {
  name: 'Inválida',
  args: { 'aria-invalid': true },
}
