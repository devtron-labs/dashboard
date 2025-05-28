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

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import { ComponentSizeType, DTSwitch, DTSwitchProps, iconMap } from '@devtron-labs/devtron-fe-common-lib'

const SWITCH_VARIANTS: Readonly<Record<DTSwitchProps['variant'], null>> = {
    theme: null,
    positive: null,
}

type BaseComponentPropsType = Omit<DTSwitchProps, 'onChange' | 'isChecked'>

const BaseComponent = (props: BaseComponentPropsType) => {
    const [isChecked, setIsChecked] = useState<boolean>(false)

    const handleChange: DTSwitchProps['onChange'] = () => {
        setIsChecked((prev) => !prev)
    }

    const switchProps = {
        ...props,
        isChecked,
        onChange: handleChange,
    } as DTSwitchProps

    return <DTSwitch {...switchProps} />
}

const meta = {
    component: BaseComponent,
    argTypes: {
        variant: {
            options: Object.keys(SWITCH_VARIANTS) as Array<keyof typeof SWITCH_VARIANTS>,
            control: { type: 'radio' },
        },
        iconName: {
            options: [null, ...Object.keys(iconMap)],
            control: { type: 'select' },
        },
        iconColor: {
            control: { type: 'text' },
        },
        indeterminate: {
            options: [true, false],
            control: { type: 'radio' },
        },
        size: {
            options: [ComponentSizeType.medium, ComponentSizeType.small],
            control: { type: 'radio' },
        },
        isDisabled: {
            options: [true, false],
            control: { type: 'radio' },
        },
        isLoading: {
            options: [true, false],
            control: { type: 'radio' },
        },
        tooltipContent: {
            control: { type: 'text' },
        },
    },
} satisfies Meta<BaseComponentPropsType>

type Story = StoryObj<typeof meta>

const COMMON_SWITCH_TEMPLATE: Story = {
    args: {
        name: 'switch-story',
        dataTestId: 'switch-story',
        variant: 'positive',
        size: ComponentSizeType.medium,
        isDisabled: false,
        isLoading: false,
        tooltipContent: '',
        ariaLabel: 'Toggle',
    },
}

export const RoundedSwitch: Story = {
    ...COMMON_SWITCH_TEMPLATE,
    argTypes: {
        ...meta.argTypes,
        iconName: {
            options: [null],
            control: { type: 'select' },
        },
    },
    args: {
        ...COMMON_SWITCH_TEMPLATE.args,
        shape: 'rounded',
    } satisfies BaseComponentPropsType,
}

export const SquareSwitch: Story = {
    ...COMMON_SWITCH_TEMPLATE,
    argTypes: {
        ...meta.argTypes,
        indeterminate: {
            options: [false],
            control: { type: 'radio' },
        },
    },
    args: {
        ...COMMON_SWITCH_TEMPLATE.args,
        shape: 'square',
        iconName: 'ic-check',
    } satisfies BaseComponentPropsType,
}

export default meta
