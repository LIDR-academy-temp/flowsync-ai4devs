import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { TaskPage } from './task-page'

// La tarea 2 de `.storybook/msw-handlers.ts` viene vencida; cualquier otra, 404.
const meta = {
  component: TaskPage,
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen', path: '/tasks/:id', route: '/tasks/2' },
} satisfies Meta<typeof TaskPage>

export default meta
type Story = StoryObj<typeof meta>

export const Vencida: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Vencida.')).toBeVisible()
  },
}

export const NoExiste: Story = {
  parameters: { route: '/tasks/99' },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/Esta tarea no existe/)).toBeVisible()
  },
}
