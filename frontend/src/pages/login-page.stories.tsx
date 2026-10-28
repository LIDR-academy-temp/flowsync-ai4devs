import type { Meta, StoryObj } from '@storybook/react-vite'

import { LoginPage } from './login-page'

const meta = {
  component: LoginPage,
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen', route: '/login' },
} satisfies Meta<typeof LoginPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
