import type { Meta, StoryObj } from '@storybook/react'
import {
    ComponentSizeType,
    InfoBlock,
    InfoBlockProps,
    noop,
    ButtonVariantType,
    ButtonStyleType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'

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

export const InfoBlockWithIconButton: Story = {
    args: {
        heading: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        buttonProps: {
            dataTestId: 'info-block-icon-button',
            onClick: noop,
            variant: ButtonVariantType.borderLess,
            style: ButtonStyleType.neutral,
            icon: <ICClose />,
            ariaLabel: 'Close',
            showAriaLabelInTippy: false,
            size: ComponentSizeType.small,
        },
    } as InfoBlockProps,
}

export default meta
