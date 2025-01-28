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
import { action } from '@storybook/addon-actions'
import {
    Button,
    ButtonComponentType,
    ButtonProps,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICDeleteInteractive } from '@Icons/ic-delete-interactive.svg'
import { ReactComponent as ICAbort } from '@Icons/ic-abort.svg'

const BUTTON_TEXT = 'Hello world'

const linkProps: ButtonProps['linkProps'] = {
    to: '#',
    target: '_blank',
}

const meta = {
    component: Button,
    argTypes: {
        variant: {
            options: Object.values(ButtonVariantType),
            control: { type: 'radio' },
        },
        component: {
            options: Object.values(ButtonComponentType),
            control: { type: 'radio' },
        },
        style: {
            options: Object.values(ButtonStyleType),
            control: { type: 'radio' },
        },
        size: {
            options: Object.values(ComponentSizeType),
            control: { type: 'radio' },
        },
    },
} satisfies Meta<ButtonProps>

export default meta

type Story = StoryObj<typeof meta>

const ButtonTemplate: Story = {
    args: {
        variant: ButtonVariantType.primary,
        component: ButtonComponentType.button,
        style: ButtonStyleType.default,
        size: ComponentSizeType.large,
        linkProps,
        onClick: action('Button clicked'),
        disabled: false,
        isLoading: false,
        fullWidth: false,
        startIcon: <ICDeleteInteractive />,
        endIcon: <ICAbort />,
        dataTestId: 'button-story',
    } as ButtonProps,
}

export const Default: Story = {
    ...ButtonTemplate,
    args: {
        ...ButtonTemplate.args,
        text: BUTTON_TEXT,
    } as ButtonProps,
}

export const StrokeIconButton: Story = {
    ...ButtonTemplate,
    args: {
        ...ButtonTemplate.args,
        icon: <ICDeleteInteractive />,
        ariaLabel: BUTTON_TEXT,
    } as ButtonProps,
}

export const FillIconButton: Story = {
    ...ButtonTemplate,
    args: {
        ...ButtonTemplate.args,
        icon: <ICAbort />,
        ariaLabel: BUTTON_TEXT,
    } as ButtonProps,
}
