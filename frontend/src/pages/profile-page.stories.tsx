import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { ProfilePage } from './profile-page'

const meta = {
  component: ProfilePage,
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen', route: '/profile' },
} satisfies Meta<typeof ProfilePage>

export default meta
type Story = StoryObj<typeof meta>

// La sesión se rehidrata contra el `GET /account/profile` simulado.
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('Lucía Fernández')).toBeVisible()
  },
}
