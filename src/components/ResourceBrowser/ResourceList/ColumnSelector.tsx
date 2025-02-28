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

import { useState, useMemo, useRef } from 'react'
import { MultiValue, SelectInstance } from 'react-select'
import {
    Button,
    ButtonVariantType,
    Icon,
    SelectPicker,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import { OPTIONAL_NODE_LIST_HEADERS } from '../Constants'
import { ColumnSelectorType } from '../Types'
import { saveAppliedColumnsInLocalStorage } from './utils'

const ColumnSelector = ({ setVisibleColumns, visibleColumns }: ColumnSelectorType) => {
    const columnOptions = useMemo(
        () =>
            OPTIONAL_NODE_LIST_HEADERS.map((header) => ({
                value: header,
                label: header,
            })),
        [],
    )

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [selectedColumns, setSelectedColumns] = useState<MultiValue<SelectPickerOptionType<string>>>(
        visibleColumns.map((column) => ({ value: column, label: column })),
    )

    const selectRef = useRef<SelectInstance<SelectPickerOptionType<string>, true>>(null)

    const handleMenuOpen = () => {
        setIsMenuOpen(true)

        selectRef.current?.focus()
    }

    const handleMenuClose = () => {
        setIsMenuOpen(false)

        selectRef.current?.blur()
    }

    const handleApplySelectedColumns = (): void => {
        setIsMenuOpen(false)

        const newVisibleColumns = selectedColumns.map((option) => option.value)

        saveAppliedColumnsInLocalStorage(newVisibleColumns)

        selectRef.current?.blur()

        setVisibleColumns(newVisibleColumns)
    }

    const renderMenuListFooter = () => (
        <div className="bg__primary p-8 dc__border-top-n1 w-100">
            <Button
                text="Apply"
                onClick={handleApplySelectedColumns}
                variant={ButtonVariantType.primary}
                fullWidth
                dataTestId="apply-column-selector"
            />
        </div>
    )

    return (
        <SelectPicker
            selectRef={selectRef}
            inputId="node-column-list-filter"
            closeMenuOnSelect={false}
            controlShouldRenderValue={false}
            fullWidth
            hideSelectedOptions={false}
            icon={<Icon name="ic-gear" color="N600" size={16} />}
            isSearchable
            menuIsOpen={isMenuOpen}
            onMenuOpen={handleMenuOpen}
            onMenuClose={handleMenuClose}
            isMulti
            onChange={setSelectedColumns}
            placeholder="Column"
            options={columnOptions}
            value={selectedColumns}
            renderMenuListFooter={renderMenuListFooter}
            isClearable={false}
            shouldMenuAlignRight
        />
    )
}

export default ColumnSelector
