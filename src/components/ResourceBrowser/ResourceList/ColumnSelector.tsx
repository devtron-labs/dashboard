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

import { useEffect, useMemo, useRef, useState } from 'react'
import { MultiValue, SelectInstance } from 'react-select'

import {
    ButtonVariantType,
    deepEqual,
    Icon,
    SelectPicker,
    SelectPickerOptionType,
    TableColumnType,
    useTriggerAutoClickTimestamp,
} from '@devtron-labs/devtron-fe-common-lib'

import { OPTIONAL_NODE_LIST_HEADERS } from '../Constants'
import { ColumnSelectorType } from '../Types'

const ColumnSelector = ({ setVisibleColumns, visibleColumns, allColumns }: ColumnSelectorType) => {
    const { triggerAutoClickTimestamp, setTriggerAutoClickTimestampToNow, resetTriggerAutoClickTimestamp } =
        useTriggerAutoClickTimestamp()

    const columnOptions = useMemo(() => {
        const headerToColumnMap = allColumns.reduce((acc, column) => {
            acc[column.label] = column
            return acc
        }, {})

        return OPTIONAL_NODE_LIST_HEADERS.map((header) => ({
            value: headerToColumnMap[header],
            label: header,
        }))
    }, [])

    const getSelectedColumns = () =>
        columnOptions.filter((option) => visibleColumns.find(({ label }) => label === option.label))

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [selectedColumns, setSelectedColumns] =
        useState<MultiValue<SelectPickerOptionType<TableColumnType>>>(getSelectedColumns)

    const selectRef = useRef<SelectInstance<SelectPickerOptionType<TableColumnType>, true>>(null)

    const handleMenuOpen = () => {
        setIsMenuOpen(true)

        selectRef.current?.focus()
    }

    useEffect(() => {
        setSelectedColumns(getSelectedColumns())
    }, [allColumns])

    const onChange = (newValue: MultiValue<SelectPickerOptionType<TableColumnType>>) => {
        setTriggerAutoClickTimestampToNow()
        setSelectedColumns(newValue)
    }

    const handleApplySelectedColumns = (): void => {
        setIsMenuOpen(false)

        const columnFieldMap = selectedColumns.reduce((acc, { value: column }) => {
            acc[column.label] = column
            return acc
        }, {})
        const optionalNodeListHeadersSet = new Set(OPTIONAL_NODE_LIST_HEADERS as string[])
        const newVisibleColumns = allColumns.filter(
            (column) => !optionalNodeListHeadersSet.has(column.label) || columnFieldMap[column.label],
        )

        selectRef.current?.blur()

        if (!deepEqual(newVisibleColumns, visibleColumns.slice(1))) {
            setVisibleColumns(newVisibleColumns)
        }
    }

    const handleMenuClose = () => {
        handleApplySelectedColumns()
        resetTriggerAutoClickTimestamp()
    }

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
            onChange={onChange}
            placeholder="Column"
            options={columnOptions}
            value={selectedColumns}
            menuListFooterConfig={{
                type: 'button',
                buttonProps: {
                    text: 'Apply',
                    onClick: handleApplySelectedColumns,
                    variant: ButtonVariantType.primary,
                    dataTestId: 'apply-column-selector',
                    triggerAutoClickTimestamp,
                },
            }}
            isClearable={false}
            shouldMenuAlignRight
        />
    )
}

export default ColumnSelector
