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

import BulkSelectionDropdownItems from './BulkSelectionDropdownItems'
import { CHECKBOX_VALUE, Checkbox, PopupMenu, noop } from '../../../Common'
import { useBulkSelection } from './BulkSelectionProvider'
import { BulkSelectionDropdownItemsType, BulkSelectionEvents, BulkSelectionProps } from './types'
import { BULK_DROPDOWN_TEST_ID, BulkSelectionOptionsLabels } from './constants'
import { ReactComponent as ICChevronDown } from '../../../Assets/Icon/ic-chevron-down.svg'
import { ReactComponent as ICCheckSquare } from '../../../Assets/Icon/ic-check-square.svg'
import { ReactComponent as ICCheckAll } from '../../../Assets/Icon/ic-check-all.svg'
import { ReactComponent as ICClose } from '../../../Assets/Icon/ic-close.svg'

const BulkSelection = <T,>({ showPagination, disabled = false }: BulkSelectionProps) => {
    const { handleBulkSelection, isChecked, checkboxValue, getSelectedIdentifiersCount } = useBulkSelection<T>()
    const areOptionsSelected = getSelectedIdentifiersCount() > 0
    const BulkSelectionItems: BulkSelectionDropdownItemsType[] = [
        {
            locator: BulkSelectionEvents.SELECT_ALL_ON_PAGE,
            label: BulkSelectionOptionsLabels[BulkSelectionEvents.SELECT_ALL_ON_PAGE],
            isSelected: isChecked && checkboxValue === CHECKBOX_VALUE.CHECKED,
            icon: ICCheckSquare,
        },
        ...(showPagination
            ? [
                  {
                      locator: BulkSelectionEvents.SELECT_ALL_ACROSS_PAGES,
                      label: BulkSelectionOptionsLabels[BulkSelectionEvents.SELECT_ALL_ACROSS_PAGES],
                      isSelected: isChecked && checkboxValue === CHECKBOX_VALUE.BULK_CHECKED,
                      icon: ICCheckAll,
                  },
              ]
            : []),
        ...(areOptionsSelected
            ? [
                  {
                      locator: BulkSelectionEvents.CLEAR_ALL_SELECTIONS,
                      label: BulkSelectionOptionsLabels[BulkSelectionEvents.CLEAR_ALL_SELECTIONS],
                      isSelected: false,
                      icon: ICClose,
                      iconClass: 'icon-use-fill-n6',
                  },
              ]
            : []),
    ]

    return (
        <PopupMenu autoClose>
            <PopupMenu.Button
                isKebab
                rootClassName="h-20 flexbox p-0 dc__no-background dc__no-border dc__outline-none-imp"
                dataTestId={BULK_DROPDOWN_TEST_ID}
                disabled={disabled}
            >
                <Checkbox
                    isChecked={isChecked}
                    onChange={noop}
                    rootClassName="icon-dim-20 m-0"
                    value={checkboxValue}
                    disabled={disabled}
                    // Ideally should be disabled but was giving issue with cursor
                />

                <ICChevronDown className="icon-dim-20 fcn-6 dc__no-shrink" />
            </PopupMenu.Button>

            <PopupMenu.Body rootClassName="dc__top-22 w-150 dc__right-0 pt-4 pb-4 pl-0 pr-0 bcn-0 flex column dc__content-start dc__align-start dc__position-abs bcn-0 dc__border dc__border-radius-4-imp">
                {BulkSelectionItems.map((item) => (
                    <BulkSelectionDropdownItems<T>
                        key={item.locator}
                        locator={item.locator}
                        label={item.label}
                        isSelected={item.isSelected}
                        icon={item.icon}
                        handleBulkSelection={handleBulkSelection}
                        iconClass={item.iconClass}
                    />
                ))}
            </PopupMenu.Body>
        </PopupMenu>
    )
}

export default BulkSelection
