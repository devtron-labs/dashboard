import type { Meta, StoryObj } from '@storybook/react'
import {
    ComponentSizeType,
    InfoBlock,
    InfoBlockProps,
    noop,
    ButtonVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

const COMPONENT_VARIANTS: InfoBlockProps['variant'][] = ['error', 'help', 'information', 'success', 'warning']
const SIZE_VARIANTS: InfoBlockProps['size'][] = [ComponentSizeType.large, ComponentSizeType.medium]
const LAYOUT_VARIANTS: InfoBlockProps['layout'][] = ['column', 'row']
const DEFAULT_TITLE = 'Title'
const DEFAULT_DESCRIPTION = 'Description'

const meta = {
    component: InfoBlock,
    argTypes: {
        variant: {
            options: COMPONENT_VARIANTS,
            control: { type: 'radio' },
        },
        size: {
            options: SIZE_VARIANTS,
            control: { type: 'radio' },
        },
        layout: {
            options: LAYOUT_VARIANTS,
            control: { type: 'radio' },
        },
        borderConfig: {
            control: {
                type: 'object',
            },
        },
        borderRadiusConfig: {
            control: {
                type: 'object',
            },
        },
    },
    args: {
        heading: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        variant: 'information',
        size: ComponentSizeType.large,
        layout: 'row',
        borderConfig: {
            top: true,
            bottom: true,
            left: true,
            right: true,
        },
        borderRadiusConfig: {
            top: true,
            bottom: true,
            left: true,
            right: true,
        },
    },
} satisfies Meta<InfoBlockProps>

type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        heading: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
    } as InfoBlockProps,
}

export const InfoBlockWithTextButton: Story = {
    args: {
        heading: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        buttonProps: {
            dataTestId: 'info-block-button',
            text: 'Button',
            onClick: noop,
            variant: ButtonVariantType.text,
        },
    } as InfoBlockProps,
}

export default meta
