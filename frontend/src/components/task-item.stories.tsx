import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'

import { TaskItem } from './task-item'

const meta = {
  component: TaskItem,
  tags: ['ai-generated'],
  // La fila es un `<li>`: va dentro de una lista, como en la pantalla.
  decorators: [
    (Story) => (
      <ul className="bg-background rounded-lg border">
        <Story />
      </ul>
    ),
  ],
  args: {
    task: {
      id: 1,
      title: 'Revisar los textos de error del formulario de registro',
      status: 'pending',
      assignee: { id: 1, fullName: 'Lucía Fernández', initials: 'LF' },
      createdAt: '2026-10-01T09:00:00.000Z',
      updatedAt: '2026-10-01T09:00:00.000Z',
    },
    isBusy: false,
    onChangeStatus: fn(),
  },
} satisfies Meta<typeof TaskItem>

export default meta
type Story = StoryObj<typeof meta>

export const Pendiente: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByRole('button', { name: 'Pendiente' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(canvas.getByRole('button', { name: 'Hecho' }))
    await expect(args.onChangeStatus).toHaveBeenCalledWith(args.task, 'done')
  },
}

export const EnCurso: Story = {
  args: {
    task: {
      id: 2,
      title: 'Preparar la demo del jueves',
      status: 'in_progress',
      assignee: { id: 2, fullName: 'Mateo Ortega', initials: 'MO' },
      createdAt: '2026-10-02T09:00:00.000Z',
      updatedAt: '2026-10-02T09:00:00.000Z',
    },
  },
}

export const Ocupada: Story = {
  args: { isBusy: true },
}

export const ResponsableSinNombre: Story = {
  args: {
    task: {
      id: 3,
      title: 'Documentar el proceso de despliegue',
      status: 'done',
      assignee: { id: 3, fullName: null, initials: 'CI' },
      createdAt: '2026-10-03T09:00:00.000Z',
      updatedAt: '2026-10-03T09:00:00.000Z',
    },
  },
}
