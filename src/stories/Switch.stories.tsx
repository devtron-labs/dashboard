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

import { ComponentSizeType, iconMap, Switch, SWITCH_VARIANTS, SwitchProps } from '@devtron-labs/devtron-fe-common-lib'

type BaseComponentPropsType = Omit<SwitchProps, 'onChange' | 'isChecked'>

const BaseComponent = (props: BaseComponentPropsType) => {
    const [isChecked, setIsChecked] = useState<boolean>(false)

    const handleChange = () => {
        setIsChecked((prev) => !prev)
    }

    const switchProps = {
        ...props,
        isChecked,
        onChange: handleChange,
    } as SwitchProps

    return <Switch {...switchProps} />
}

const meta = {
    component: BaseComponent,
    argTypes: {
        variant: {
            options: Object.keys(SWITCH_VARIANTS) as Array<keyof typeof SWITCH_VARIANTS>,
            control: { type: 'radio' },
        },
        shape: {
            options: ['rounded', 'square'],
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

const SWITCH_TEMPLATE: Story = {
    args: {
        name: 'switch-story',
        dataTestId: 'switch-story',
        variant: 'positive',
        size: ComponentSizeType.medium,
        isDisabled: false,
        isLoading: false,
        tooltipContent: '',
        shape: 'rounded',
    },
}

export const Default: Story = {
    ...SWITCH_TEMPLATE,
    args: {
        ...SWITCH_TEMPLATE.args,
    } satisfies BaseComponentPropsType,
}

export default meta
