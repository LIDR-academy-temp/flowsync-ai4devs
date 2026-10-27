import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { TasksPage } from './tasks-page'

// Los datos salen de los handlers de MSW de `.storybook/msw-handlers.ts`.
const meta = {
  component: TasksPage,
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen', route: '/tasks' },
} satisfies Meta<typeof TasksPage>

export default meta
type Story = StoryObj<typeof meta>

export const VistaPorDefecto: Story = {
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(
        'Revisar los textos de error del formulario de registro',
      ),
    ).toBeVisible()
    await expect(
      canvas.getByRole('progressbar', { name: 'Hechas en esta vista' }),
    ).toHaveAttribute('aria-valuetext', '0 de 2 hechas')
  },
}

export const AcotadaPorHecho: Story = {
  parameters: { route: '/tasks?status=done' },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText('Documentar el proceso de despliegue'),
    ).toBeVisible()
  },
}

// Marcar una tarea como hecha la saca de la vista por defecto, y se avisa.
export const MarcarComoHecha: Story = {
  play: async ({ canvas, userEvent }) => {
    const group = await canvas.findByRole('group', {
      name: 'Estado de «Preparar la demo del jueves»',
    })
    await userEvent.click(
      group.querySelector('button:last-child') as HTMLButtonElement,
    )
    await expect(
      await canvas.findByText(/ya no aparece en esta vista/),
    ).toBeVisible()
  },
}
