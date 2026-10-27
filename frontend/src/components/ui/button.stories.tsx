import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlusIcon } from 'lucide-react'

import { Button } from './button'

// Una historia por cada combinación de variante y tamaño que declara
// `buttonVariants` en `button.tsx`: 6 variantes × 8 tamaños. Los tamaños `icon*`
// llevan un icono y su `aria-label`, porque es como se usan; el resto, texto.
const meta = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Crear tarea', disabled: false },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: [
        'default',
        'xs',
        'sm',
        'lg',
        'icon',
        'icon-xs',
        'icon-sm',
        'icon-lg',
      ],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'default · default',
  args: { variant: 'default', size: 'default' },
}

export const DefaultXs: Story = {
  name: 'default · xs',
  args: { variant: 'default', size: 'xs' },
}

export const DefaultSm: Story = {
  name: 'default · sm',
  args: { variant: 'default', size: 'sm' },
}

export const DefaultLg: Story = {
  name: 'default · lg',
  args: { variant: 'default', size: 'lg' },
}

export const DefaultIcon: Story = {
  name: 'default · icon',
  args: {
    variant: 'default',
    size: 'icon',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const DefaultIconXs: Story = {
  name: 'default · icon-xs',
  args: {
    variant: 'default',
    size: 'icon-xs',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const DefaultIconSm: Story = {
  name: 'default · icon-sm',
  args: {
    variant: 'default',
    size: 'icon-sm',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const DefaultIconLg: Story = {
  name: 'default · icon-lg',
  args: {
    variant: 'default',
    size: 'icon-lg',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const Destructive: Story = {
  name: 'destructive · default',
  args: { variant: 'destructive', size: 'default' },
}

export const DestructiveXs: Story = {
  name: 'destructive · xs',
  args: { variant: 'destructive', size: 'xs' },
}

export const DestructiveSm: Story = {
  name: 'destructive · sm',
  args: { variant: 'destructive', size: 'sm' },
}

export const DestructiveLg: Story = {
  name: 'destructive · lg',
  args: { variant: 'destructive', size: 'lg' },
}

export const DestructiveIcon: Story = {
  name: 'destructive · icon',
  args: {
    variant: 'destructive',
    size: 'icon',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const DestructiveIconXs: Story = {
  name: 'destructive · icon-xs',
  args: {
    variant: 'destructive',
    size: 'icon-xs',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const DestructiveIconSm: Story = {
  name: 'destructive · icon-sm',
  args: {
    variant: 'destructive',
    size: 'icon-sm',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const DestructiveIconLg: Story = {
  name: 'destructive · icon-lg',
  args: {
    variant: 'destructive',
    size: 'icon-lg',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const Outline: Story = {
  name: 'outline · default',
  args: { variant: 'outline', size: 'default' },
}

export const OutlineXs: Story = {
  name: 'outline · xs',
  args: { variant: 'outline', size: 'xs' },
}

export const OutlineSm: Story = {
  name: 'outline · sm',
  args: { variant: 'outline', size: 'sm' },
}

export const OutlineLg: Story = {
  name: 'outline · lg',
  args: { variant: 'outline', size: 'lg' },
}

export const OutlineIcon: Story = {
  name: 'outline · icon',
  args: {
    variant: 'outline',
    size: 'icon',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const OutlineIconXs: Story = {
  name: 'outline · icon-xs',
  args: {
    variant: 'outline',
    size: 'icon-xs',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const OutlineIconSm: Story = {
  name: 'outline · icon-sm',
  args: {
    variant: 'outline',
    size: 'icon-sm',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const OutlineIconLg: Story = {
  name: 'outline · icon-lg',
  args: {
    variant: 'outline',
    size: 'icon-lg',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const Secondary: Story = {
  name: 'secondary · default',
  args: { variant: 'secondary', size: 'default' },
}

export const SecondaryXs: Story = {
  name: 'secondary · xs',
  args: { variant: 'secondary', size: 'xs' },
}

export const SecondarySm: Story = {
  name: 'secondary · sm',
  args: { variant: 'secondary', size: 'sm' },
}

export const SecondaryLg: Story = {
  name: 'secondary · lg',
  args: { variant: 'secondary', size: 'lg' },
}

export const SecondaryIcon: Story = {
  name: 'secondary · icon',
  args: {
    variant: 'secondary',
    size: 'icon',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const SecondaryIconXs: Story = {
  name: 'secondary · icon-xs',
  args: {
    variant: 'secondary',
    size: 'icon-xs',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const SecondaryIconSm: Story = {
  name: 'secondary · icon-sm',
  args: {
    variant: 'secondary',
    size: 'icon-sm',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const SecondaryIconLg: Story = {
  name: 'secondary · icon-lg',
  args: {
    variant: 'secondary',
    size: 'icon-lg',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const Ghost: Story = {
  name: 'ghost · default',
  args: { variant: 'ghost', size: 'default' },
}

export const GhostXs: Story = {
  name: 'ghost · xs',
  args: { variant: 'ghost', size: 'xs' },
}

export const GhostSm: Story = {
  name: 'ghost · sm',
  args: { variant: 'ghost', size: 'sm' },
}

export const GhostLg: Story = {
  name: 'ghost · lg',
  args: { variant: 'ghost', size: 'lg' },
}

export const GhostIcon: Story = {
  name: 'ghost · icon',
  args: {
    variant: 'ghost',
    size: 'icon',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const GhostIconXs: Story = {
  name: 'ghost · icon-xs',
  args: {
    variant: 'ghost',
    size: 'icon-xs',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const GhostIconSm: Story = {
  name: 'ghost · icon-sm',
  args: {
    variant: 'ghost',
    size: 'icon-sm',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const GhostIconLg: Story = {
  name: 'ghost · icon-lg',
  args: {
    variant: 'ghost',
    size: 'icon-lg',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const Link: Story = {
  name: 'link · default',
  args: { variant: 'link', size: 'default' },
}

export const LinkXs: Story = {
  name: 'link · xs',
  args: { variant: 'link', size: 'xs' },
}

export const LinkSm: Story = {
  name: 'link · sm',
  args: { variant: 'link', size: 'sm' },
}

export const LinkLg: Story = {
  name: 'link · lg',
  args: { variant: 'link', size: 'lg' },
}

export const LinkIcon: Story = {
  name: 'link · icon',
  args: {
    variant: 'link',
    size: 'icon',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const LinkIconXs: Story = {
  name: 'link · icon-xs',
  args: {
    variant: 'link',
    size: 'icon-xs',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const LinkIconSm: Story = {
  name: 'link · icon-sm',
  args: {
    variant: 'link',
    size: 'icon-sm',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}

export const LinkIconLg: Story = {
  name: 'link · icon-lg',
  args: {
    variant: 'link',
    size: 'icon-lg',
    children: <PlusIcon />,
    'aria-label': 'Crear tarea',
  },
}
