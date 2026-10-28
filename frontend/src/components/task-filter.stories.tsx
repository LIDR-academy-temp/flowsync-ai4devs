import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'

import { TaskFilter } from './task-filter'

const meta = {
  component: TaskFilter,
  tags: ['ai-generated'],
  args: { value: null, onChange: fn() },
} satisfies Meta<typeof TaskFilter>

export default meta
type Story = StoryObj<typeof meta>

export const VistaPorDefecto: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByRole('button', { name: 'Pendientes y en curso' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(canvas.getByRole('button', { name: 'Hecho' }))
    await expect(args.onChange).toHaveBeenCalledWith('done')
  },
}

export const AcotadaPorHecho: Story = {
  args: { value: 'done' },
}

// Un estado que llega de la URL y no es ninguno de los tres: no se marca nada.
export const EstadoQueNoExiste: Story = {
  args: { value: 'bogus' },
}
