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
import { action } from '@storybook/addon-actions'
import type { Meta, StoryObj } from '@storybook/react'

import { ActionMenu, ActionMenuProps, ButtonStyleType, Icon } from '@devtron-labs/devtron-fe-common-lib'

type ActionMenuItems =
    | 'value-1'
    | 'value-2'
    | 'value-3'
    | 'value-4'
    | 'value-5'
    | 'value-6'
    | 'group-value-1'
    | 'group-value-2'
    | 'group-value-3'
    | 'group-value-4'
    | 'group-value-5'

type BaseComponentPropsType = Omit<ActionMenuProps<ActionMenuItems>, 'options'>

const BaseComponent = (props: BaseComponentPropsType) => {
    const [isChecked, setIsChecked] = useState(false)

    const handleChange = () => setIsChecked(!isChecked)

    const options: ActionMenuProps<ActionMenuItems>['options'] = [
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
                    trailingItem: {
                        type: 'icon',
                        config: {
                            name: 'ic-cube',
                        },
                    },
                    tooltipProps: {
                        content: 'Tooltip content for value 5',
                    },
                    label: "Trailing Item: 'icon'",
                    description:
                        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga enim perspiciatis non praesentium itaque magni, animi doloremque ad beatae voluptas quasi repellat eveniet eaque culpa nemo dolorem, pariatur earum illo.',
                },
            ],
        },
        {
            items: [
                {
                    id: 'value-2',
                    label: "Trailing Item: 'text'",
                    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
                    tooltipProps: {
                        content: 'There is an error',
                    },
                    trailingItem: {
                        type: 'text',
                        config: {
                            value: 'Label',
                            icon: {
                                name: 'ic-cube',
                            },
                        },
                    },
                },
                {
                    id: 'value-3',
                    label: "Trailing Item: 'text'",
                    trailingItem: {
                        type: 'text',
                        config: {
                            value: 'Label',
                        },
                    },
                },
                {
                    id: 'value-4',
                    label: "Trailing Item: 'switch'",
                    trailingItem: {
                        type: 'switch',
                        config: {
                            name: 'action-menu-switch',
                            ariaLabel: 'action-menu-switch',
                            dataTestId: 'action-menu-switch',
                            isChecked,
                            onChange: handleChange,
                        },
                    },
                },
                {
                    id: 'value-5',
                    startIcon: {
                        name: 'ic-cube',
                    },
                    trailingItem: {
                        type: 'counter',
                        config: {
                            value: 1,
                        },
                    },
                    tooltipProps: {
                        content: 'Tooltip content for value 5',
                    },
                    label: "Trailing Item: 'counter'",
                    description:
                        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga enim perspiciatis non praesentium itaque magni, animi doloremque ad beatae voluptas quasi repellat eveniet eaque culpa nemo dolorem, pariatur earum illo.',
                },
                {
                    id: 'value-6',
                    trailingItem: {
                        type: 'button',
                        config: {
                            icon: <Icon name="ic-cube" color={null} />,
                            ariaLabel: 'action-menu-item-trailing-item-button',
                            dataTestId: 'action-menu-item-trailing-item-button',
                            showAriaLabelInTippy: false,
                            style: ButtonStyleType.negativeGrey,
                        },
                    },
                    label: "Trailing Item: 'button'",
                    description:
                        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga enim perspiciatis non praesentium itaque magni, animi doloremque ad beatae voluptas quasi repellat eveniet eaque culpa nemo dolorem, pariatur earum illo.',
                },
            ],
        },
    ]

    const baseProps = { ...props, options } as ActionMenuProps

    return (
        <div className="flex w-100" style={{ height: '90vh' }}>
            <ActionMenu {...baseProps} />
        </div>
    )
}

const meta = {
    component: BaseComponent,
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
} satisfies Meta<BaseComponentPropsType>

export default meta

type Story = StoryObj<typeof meta>

export const WithButtonElement: Story = {
    args: {
        id: 'action-menu-with-button',
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
