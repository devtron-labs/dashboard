import type { Meta, StoryObj } from '@storybook/react'

import { Icon, iconMap, IconsProps } from '@devtron-labs/devtron-fe-common-lib'

const options = Object.keys(iconMap)

const meta = {
    component: Icon,
    argTypes: {
        name: {
            options,
            control: {
                type: 'select',
            },
        },
    },
} satisfies Meta<IconsProps>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        name: options[0] as IconsProps['name'],
        size: 80,
        color: null,
    },
}
