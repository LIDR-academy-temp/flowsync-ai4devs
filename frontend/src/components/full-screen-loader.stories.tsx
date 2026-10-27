import type { Meta, StoryObj } from '@storybook/react-vite'

import { FullScreenLoader } from './full-screen-loader'

const meta = {
  component: FullScreenLoader,
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FullScreenLoader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
