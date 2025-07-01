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

import { useMemo, useState } from 'react'

import {
    ActionMenu,
    ActionMenuItemType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DynamicTabType,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'

import { DynamicTabsSelectProps } from './types'

const DynamicTabsSelect = ({ tabs, getMarkTabActiveHandler, handleTabCloseAction }: DynamicTabsSelectProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const options = useMemo(
        () =>
            tabs.map((tab) => {
                const [kind, name] = tab.title.split('/')

                return {
                    label: kind,
                    id: tab.id,
                    value: tab,
                    description: name,
                    trailingItem: {
                        type: 'button',
                        config: {
                            dataTestId: 'close-dynamic-tab-option',
                            icon: <Icon name="ic-close-small" color={null} />,
                            variant: ButtonVariantType.borderLess,
                            style: ButtonStyleType.negativeGrey,
                            'data-id': tab.id,
                            onClick: handleTabCloseAction,
                            size: ComponentSizeType.xs,
                            ariaLabel: `Close dynamic tab ${kind}`,
                            showAriaLabelInTippy: false,
                        },
                    },
                } as ActionMenuItemType & Record<'value', DynamicTabType>
            }),
        [tabs],
    )

    const onClick = (item: (typeof options)[number]) => {
        getMarkTabActiveHandler(item.value)()
    }

    return (
        <ActionMenu
            id="dynamic-tabs-select"
            onClick={onClick}
            position="bottom"
            isSearchable
            onOpen={setIsMenuOpen}
            options={[{ items: options }]}
            buttonProps={{
                dataTestId: 'close-dynamic-tab-option',
                icon: <Icon name="ic-caret-down-small" color={null} rotateBy={isMenuOpen ? 180 : 0} />,
                variant: ButtonVariantType.secondary,
                style: ButtonStyleType.neutral,
                size: ComponentSizeType.xxs,
                ariaLabel: 'Open dynamic tabs select menu',
                showAriaLabelInTippy: false,
            }}
        />
    )
}

export default DynamicTabsSelect
