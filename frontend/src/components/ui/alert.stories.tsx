import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertCircleIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { Alert, AlertDescription, AlertTitle } from './alert'

// El título y la descripción van como `args` propios y el `render` solo los
// coloca en su sitio, para que los controles puedan cambiar el texto.
type AlertStoryArgs = ComponentProps<typeof Alert> & {
  title: string
  description: string
}

const meta = {
  title: 'UI/Alert',
  component: Alert,
  args: {
    title: 'Tarea creada',
    description: 'La tarea se ha creado como pendiente.',
  },
  argTypes: {
    variant: { control: 'select', options: ['default', 'destructive'] },
  },
  render: ({ title, description, ...args }) => (
    <Alert {...args}>
      <AlertCircleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  ),
} satisfies Meta<AlertStoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { variant: 'default' },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    title: 'No se ha podido cambiar el estado',
    description: 'Comprueba la conexión e inténtalo de nuevo.',
  },
}

export const TextoLargo: Story = {
  name: 'Texto largo',
  args: {
    variant: 'default',
    title: 'Esta tarea ya no aparece en esta vista',
    description:
      '«Revisar los textos de error del formulario de registro y alinearlos con los del inicio de sesión» ha pasado a «Hecho» y ya no aparece en esta vista. Puedes verla acotando la lista por ese estado.',
  },
}
