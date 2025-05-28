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
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DynamicTabType,
    PopupMenu,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICArrowLeft } from '@Icons/ic-arrow-left.svg'
import { ReactComponent as ICCross } from '@Icons/ic-cross.svg'

import { DynamicTabsSelectProps } from './types'

const DynamicTabsSelect = ({
    tabs,
    getMarkTabActiveHandler,
    selectedTab,
    handleTabCloseAction,
}: DynamicTabsSelectProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleToggleOpenMenuState = (isOpen: boolean) => {
        setIsMenuOpen(isOpen)
    }

    const options: SelectPickerOptionType<DynamicTabType>[] = useMemo(
        () =>
            tabs.map((tab) => {
                const [kind, name] = tab.title.split('/')

                return {
                    label: kind,
                    value: tab,
                    description: name,
                    endIcon: (
                        <div className="flex top">
                            <Button
                                dataTestId="close-dynamic-tab-option"
                                icon={<ICCross />}
                                variant={ButtonVariantType.borderLess}
                                style={ButtonStyleType.negativeGrey}
                                data-id={tab.id}
                                onClick={handleTabCloseAction}
                                size={ComponentSizeType.xs}
                                ariaLabel={`Close dynamic tab ${kind}`}
                                showAriaLabelInTippy={false}
                            />
                        </div>
                    ),
                }
            }),
        [tabs],
    )

    const onChangeTab = (option: SelectPickerOptionType<DynamicTabType>): void => {
        setIsMenuOpen(false)
        getMarkTabActiveHandler(option.value)()
    }

    const handleCloseMenu = () => {
        setIsMenuOpen(false)
    }

    // NOTE: by default react select compares option references
    // therefore if we don't wrap value and options in useMemo we need to provide isOptionSelected
    const isOptionSelected = (option: SelectPickerOptionType<DynamicTabType>) => option.value.id === selectedTab.id

    const handleOnEscPress = (e: React.KeyboardEvent) => {
        if (e.key !== 'Escape') {
            return
        }

        handleCloseMenu()
    }

    const selectFilter: SelectPickerProps<DynamicTabType>['filterOption'] = (option, searchText) =>
        option.data.value.id.toLowerCase().includes(searchText.toLowerCase())

    return (
        <PopupMenu autoClose autoPosition onToggleCallback={handleToggleOpenMenuState}>
            <PopupMenu.Button rootClassName="flex">
                <ICArrowLeft
                    className={`rotate icon-dim-18 ${isMenuOpen ? 'fcn-9' : 'fcn-7'}`}
                    style={{ ['--rotateBy' as string]: isMenuOpen ? '90deg' : '-90deg' }}
                />
            </PopupMenu.Button>
            {/* NOTE: Since we can't control open state of popup menu through prop we can control it by simply
            hooking a state using onToggleCallback and rendering the PopupMenu.Body conditionally through that state */}
            {isMenuOpen && (
                <PopupMenu.Body rootClassName="w-300 mt-8 dynamic-tabs-select-popup-body" style={{ right: '12px' }}>
                    <SelectPicker<DynamicTabType, false>
                        inputId="dynamic-tabs-select"
                        placeholder="Search tabs"
                        options={options}
                        onChange={onChangeTab}
                        isOptionSelected={isOptionSelected}
                        filterOption={selectFilter}
                        onKeyDown={handleOnEscPress}
                        shouldMenuAlignRight
                        menuPosition="absolute"
                        menuIsOpen
                        autoFocus
                    />
                </PopupMenu.Body>
            )}
        </PopupMenu>
    )
}

export default DynamicTabsSelect
