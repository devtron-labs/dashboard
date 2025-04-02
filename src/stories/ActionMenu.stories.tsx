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

import { ActionMenu, ActionMenuProps, Button, Icon } from '@devtron-labs/devtron-fe-common-lib'
import { action } from '@storybook/addon-actions'

const meta = {
    component: ActionMenu,
} satisfies Meta<ActionMenuProps>

export default meta

type Story = StoryObj<typeof meta>

const options: ActionMenuProps['options'] = [
    {
        label: 'Label 1',
        value: 'value-1',
        startIcon: <Icon name="ic-cube" color="N800" />,
    },
    {
        label: 'Group label 1',
        options: [
            {
                label: 'Group Label 1',
                value: 'group-value-1',
                startIcon: <Icon name="ic-cube" color="N800" />,
            },
            {
                label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elitLorem ipsum dolor sit amet, consectetur adipiscing elit',
                value: 'group-value-2',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
                tooltipProps: {
                    content: 'There is an error',
                },
            },
            {
                label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elitLorem ipsum dolor sit amet, consectetur adipiscing elit',
                value: 'group-value-3',
            },
            {
                label: 'Group Label 4',
                value: 'group-value-4',
            },
            {
                startIcon: <Icon name="ic-cube" color="N800" />,
                endIcon: <Icon name="ic-cube" color="N800" />,
                value: 'group-value-5',
                tooltipProps: {
                    content: 'Tooltip content for value 5',
                },
                label: 'Group Label 5',
                description:
                    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga enim perspiciatis non praesentium itaque magni, animi doloremque ad beatae voluptas quasi repellat eveniet eaque culpa nemo dolorem, pariatur earum illo.',
            },
        ],
    },
    {
        label: 'Label 2',
        value: 'value-2',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
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
        startIcon: <Icon name="ic-cube" color="N800" />,
        endIcon: <Icon name="ic-cube" color="N800" />,
        value: 'value-5',
        tooltipProps: {
            content: 'Tooltip content for value 5',
        },
        label: 'Label 5',
        description:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga enim perspiciatis non praesentium itaque magni, animi doloremque ad beatae voluptas quasi repellat eveniet eaque culpa nemo dolorem, pariatur earum illo.',
    },
]

export const Default: Story = {
    args: {
        options,
        disableDescriptionEllipsis: false,
        children: <Button text="Open Action Menu" dataTestId="action-menu" />,
        // children: <div>Open Action menu</div>,
        onClick: action('option clicked'),
    },
}
