import type { Meta, StoryObj } from '@storybook/react-vite'

import { AuthLayout } from './auth-layout'

const meta = {
  component: AuthLayout,
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Inicia sesión',
    description: 'Entra con tu cuenta para volver a tus tareas.',
    children: 'Aquí va el formulario.',
  },
} satisfies Meta<typeof AuthLayout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TextoLargo: Story = {
  args: {
    title: 'Crea tu cuenta para empezar a trabajar con el equipo',
    description:
      'Con una cuenta ves la lista compartida del equipo, quién lleva cada tarea y en qué estado está, y puedes crear las tuyas.',
  },
}
