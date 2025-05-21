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

import { action } from '@storybook/addon-actions'
import type { Meta, StoryObj } from '@storybook/react'

import { ActionMenu, ActionMenuProps, Icon } from '@devtron-labs/devtron-fe-common-lib'

const Component = (props: ActionMenuProps) => (
    <div className="flex w-100" style={{ height: '90vh' }}>
        <ActionMenu {...props} />
    </div>
)

const meta = {
    component: Component,
    argTypes: {
        position: {
            control: 'radio',
            options: ['bottom', 'top', 'left', 'right'],
        },
        alignment: {
            control: 'radio',
            options: ['start', 'middle', 'end'],
        },
        disableDescriptionEllipsis: {
            control: 'boolean',
            type: 'boolean',
        },
    },
} satisfies Meta<ActionMenuProps>

export default meta

type Story = StoryObj<typeof meta>

const options: ActionMenuProps['options'] = [
    {
        items: [
            {
                id: 'value-1',
                label: 'Label 1',
                startIcon: {
                    name: 'ic-cube',
                },
            },
        ],
    },
    {
        groupLabel: 'Group 1',
        items: [
            {
                id: 'group-value-1',
                label: 'Group Label 1',
                startIcon: {
                    name: 'ic-cube',
                },
                isDisabled: true,
            },
            {
                id: 'group-value-2',
                label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elitLorem ipsum dolor sit amet, consectetur adipiscing elit',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
                tooltipProps: {
                    content: 'There is an error',
                },
                type: 'negative',
            },
            {
                id: 'group-value-3',
                label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elitLorem ipsum dolor sit amet, consectetur adipiscing elit',
            },
            {
                id: 'group-value-4',
                label: 'Group Label 4',
            },
            {
                id: 'group-value-5',
                startIcon: {
                    name: 'ic-cube',
                },
                endIcon: {
                    name: 'ic-cube',
                },
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
        items: [
            {
                id: 'value-2',
                label: 'Label 2',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
                tooltipProps: {
                    content: 'There is an error',
                },
            },
            {
                id: 'value-3',
                label: 'Label 3',
            },
            {
                id: 'value-4',
                label: 'Label 4',
            },
            {
                id: 'value-5',
                startIcon: {
                    name: 'ic-cube',
                },
                endIcon: {
                    name: 'ic-cube',
                },
                tooltipProps: {
                    content: 'Tooltip content for value 5',
                },
                label: 'Label 5',
                description:
                    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga enim perspiciatis non praesentium itaque magni, animi doloremque ad beatae voluptas quasi repellat eveniet eaque culpa nemo dolorem, pariatur earum illo.',
            },
        ],
    },
]

export const WithButtonElement: Story = {
    args: {
        id: 'action-menu-with-button',
        options,
        position: 'bottom',
        alignment: 'start',
        disableDescriptionEllipsis: false,
        onClick: action('option clicked'),
        isSearchable: true,
        buttonProps: {
            text: 'Open Action Menu',
            dataTestId: 'action-menu',
        },
    },
}

export const WithIconButtonElement: Story = {
    args: {
        id: 'action-menu-with-icon-button',
        options,
        position: 'bottom',
        alignment: 'start',
        disableDescriptionEllipsis: false,
        onClick: action('option clicked'),
        buttonProps: {
            icon: <Icon name="ic-cube" color="N800" />,
            ariaLabel: 'action-menu',
            showAriaLabelInTippy: false,
            dataTestId: 'action-menu',
        },
    },
}

export const WithFooterConfig: Story = {
    args: {
        id: 'action-menu-with-button',
        options,
        position: 'bottom',
        alignment: 'start',
        disableDescriptionEllipsis: false,
        onClick: action('option clicked'),
        isSearchable: true,
        buttonProps: {
            text: 'Open Action Menu',
            dataTestId: 'action-menu',
        },
        footerConfig: {
            type: 'text',
            value: 'This is footer',
        },
    },
}
