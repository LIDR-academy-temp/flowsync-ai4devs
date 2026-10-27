import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { FieldError } from './field-error'

const meta = {
  component: FieldError,
  tags: ['ai-generated'],
  args: { id: 'email-error', message: 'El email no tiene un formato válido.' },
} satisfies Meta<typeof FieldError>

export default meta
type Story = StoryObj<typeof meta>

export const ConMensaje: Story = {
  play: async ({ args, canvas }) => {
    await expect(canvas.getByText(args.message!)).toHaveAttribute('id', args.id)
  },
}

export const SinMensaje: Story = {
  args: { message: undefined },
}
