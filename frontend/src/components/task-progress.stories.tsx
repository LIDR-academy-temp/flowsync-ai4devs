import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { TaskProgress } from './task-progress'
import type { Task } from '@/lib/types'

const task = (id: number, status: Task['status']): Task => ({
  id,
  title: `Tarea ${id}`,
  status,
  assignee: { id: 1, fullName: 'Lucía Fernández', initials: 'LF' },
  createdAt: '2026-10-01T09:00:00.000Z',
  updatedAt: '2026-10-01T09:00:00.000Z',
})

const meta = {
  component: TaskProgress,
  tags: ['ai-generated'],
  args: { tasks: [task(1, 'pending'), task(2, 'in_progress')] },
} satisfies Meta<typeof TaskProgress>

export default meta
type Story = StoryObj<typeof meta>

// La vista por defecto: deja fuera las hechas, así que marca 0 %.
export const VistaPorDefecto: Story = {
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('progressbar', {
      name: 'Hechas en esta vista',
    })
    await expect(bar).toHaveAttribute('aria-valuetext', '0 de 2 hechas')
  },
}

export const TodoHecho: Story = {
  args: { tasks: [task(1, 'done'), task(2, 'done'), task(3, 'done')] },
}

export const SinTareas: Story = {
  args: { tasks: [] },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('progressbar')).toBeNull()
  },
}

// La única comprobación de CSS del catálogo. task-progress.tsx pinta el relleno
// con `bg-green-600`: si Tailwind no se ha cargado, el color no se resuelve.
export const CssCheck: Story = {
  args: { tasks: [task(1, 'done'), task(2, 'done')] },
  play: async ({ canvasElement }) => {
    const fill = canvasElement.querySelector(
      '[data-slot="progress-indicator"]',
    ) as HTMLElement
    await expect(getComputedStyle(fill).backgroundColor).toBe(
      'oklch(0.627 0.194 149.214)',
    )
  },
}
