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

import { NSegmentedControl, NSegmentedControlProps } from '@devtron-labs/devtron-fe-common-lib'
import { action } from '@storybook/addon-actions'
import { useState } from 'react'

const SEGMENTED_CONTROL_SIZE_MAP: Record<NSegmentedControlProps['size'], null> = {
    xs: null,
    small: null,
    medium: null,
} as const

const meta = {
    component: NSegmentedControl,
    argTypes: {
        size: {
            options: Object.keys(SEGMENTED_CONTROL_SIZE_MAP),
            control: { type: 'radio' },
        },
    },
} satisfies Meta<NSegmentedControlProps>

export default meta

type Story = StoryObj<typeof meta>

const segments: NSegmentedControlProps['segments'] = [
    {
        label: 'Label 1',
        value: 'value-1',
        icon: 'ic-cube',
    },
    {
        label: 'Label 2',
        value: 'value-2',
        isError: true,
        icon: 'ic-cube',
        tooltipProps: {
            content: 'There is an error',
        },
    },
    {
        label: 'Label 3',
        value: 'value-3',
    },
    {
        label: 'Label 4',
        value: 'value-4',
    },
    {
        icon: 'ic-cube',
        value: 'value-5',
        tooltipProps: {
            content: 'Tooltip content for value 5',
        },
        ariaLabel: 'Aria label for value 5',
    },
]

export const Default: Story = {
    args: {
        name: 'segmented-control',
        segments,
        onChange: action('changed'),
    },
}

export const Controlled: Story = {
    render: (props) => {
        const [value, setValue] = useState(props.value)

        const handleChange: NSegmentedControlProps['onChange'] = (selectedSegment) => {
            action('changed')(selectedSegment)
            setValue(selectedSegment.value)
        }

        return <NSegmentedControl {...props} value={value} onChange={handleChange} />
    },
    args: {
        ...Default.args,
        value: segments[2].value,
    },
}
