/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Meta, StoryObj } from '@storybook/react'
import {
    ComponentSizeType,
    InfoBlock,
    InfoBlockProps,
    noop,
    ButtonVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

const componentVariantMap: Record<InfoBlockProps['variant'], null> = {
    error: null,
    help: null,
    information: null,
    success: null,
    warning: null,
}

const layoutMap: Record<InfoBlockProps['layout'], null> = {
    column: null,
    row: null,
}

const sizeVariantMap: Record<InfoBlockProps['size'], null> = {
    [ComponentSizeType.large]: null,
    [ComponentSizeType.medium]: null,
}

const COMPONENT_VARIANTS = Object.keys(componentVariantMap) as Array<InfoBlockProps['variant']>
const SIZE_VARIANTS = Object.keys(sizeVariantMap) as Array<InfoBlockProps['size']>
const LAYOUT_VARIANTS = Object.keys(layoutMap) as Array<InfoBlockProps['layout']>

const DEFAULT_TITLE = 'Title'
const DEFAULT_DESCRIPTION = 'Description'
const INFO_BLOCK_TEMPLATE: Story = {
    args: {
        variant: 'information',
        heading: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
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
    } satisfies InfoBlockProps,
}

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
} satisfies Meta<InfoBlockProps>

type Story = StoryObj<typeof meta>

export const Default: Story = {
    ...INFO_BLOCK_TEMPLATE,
    args: {
        ...INFO_BLOCK_TEMPLATE.args,
    } satisfies InfoBlockProps,
}

export const InfoBlockWithTextButton: Story = {
    ...INFO_BLOCK_TEMPLATE,
    args: {
        ...INFO_BLOCK_TEMPLATE.args,
        heading: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        buttonProps: {
            dataTestId: 'info-block-button',
            text: 'Button',
            onClick: noop,
            variant: ButtonVariantType.text,
        },
    } satisfies InfoBlockProps,
}

export default meta
