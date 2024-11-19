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

import React, { useState, useMemo, useRef } from 'react'
import ReactSelect, { components, ValueContainerProps, MenuListProps } from 'react-select'
import { Option } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Setting } from '@Icons/ic-nav-gear.svg'
import { containerImageSelectStyles } from '../../CIPipelineN/ciPipeline.utils'
import { OPTIONAL_NODE_LIST_HEADERS } from '../Constants'
import { ColumnFilterContextType, ColumnSelectorType } from '../Types'
import { saveAppliedColumnsInLocalStorage } from './utils'

const ColumnFilterContext = React.createContext<ColumnFilterContextType>(null)

export function useColumnFilterContext() {
    const context = React.useContext(ColumnFilterContext)

    if (!context) {
        throw new Error(`cannot be rendered outside the component`)
    }

    return context
}

const ValueContainer = (props: ValueContainerProps) => {
    const { getValue, selectProps, children } = props
    const { length } = getValue()

    return (
        <components.ValueContainer {...props}>
            {length > 0 ? (
                <>
                    {!selectProps.menuIsOpen && (
                        <>
                            <Setting className="icon-dim-16 scn-6 mr-5" />
                            Columns
                        </>
                    )}
                    {React.cloneElement(children[1])}
                </>
            ) : (
                children
            )}
        </components.ValueContainer>
    )
}

const MenuList = (props: MenuListProps) => {
    const { selectedColumns, setVisibleColumns, setIsMenuOpen, selectRef } = useColumnFilterContext()

    const { children } = props

    const handleApplySelectedColumns = (): void => {
        setIsMenuOpen(false)

        const newVisibleColumns = selectedColumns.map((option) => option.value)

        if (typeof Storage !== 'undefined') {
            saveAppliedColumnsInLocalStorage(newVisibleColumns)
        }

        selectRef.current?.blur()

        setVisibleColumns(newVisibleColumns)
    }

    return (
        <components.MenuList {...props}>
            {children}

            <div className="flex dc__react-select__bottom bcn-0 p-8">
                <button type="button" className="flex cta apply-filter h-32 w-100" onClick={handleApplySelectedColumns}>
                    Apply
                </button>
            </div>
        </components.MenuList>
    )
}

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
    const [selectedColumns, setSelectedColumns] = useState<ColumnFilterContextType['selectedColumns']>(
        visibleColumns.map((column) => ({ value: column, label: column })),
    )

    const selectRef: ColumnFilterContextType['selectRef'] = useRef()

    const handleMenuOpen = () => {
        setIsMenuOpen(true)
    }

    const handleMenuClose = () => {
        setIsMenuOpen(false)

        selectRef.current?.blur()
    }

    const columnFilterProviderValue: ColumnFilterContextType = useMemo(
        () => ({
            isMenuOpen,
            setIsMenuOpen,
            selectedColumns,
            setSelectedColumns,
            selectRef,
            setVisibleColumns,
        }),
        [isMenuOpen, selectedColumns],
    )

    return (
        <ColumnFilterContext.Provider value={columnFilterProviderValue}>
            <ReactSelect
                classNamePrefix="node-column-list-filter"
                ref={selectRef}
                menuIsOpen={isMenuOpen}
                name="columns"
                value={selectedColumns}
                options={columnOptions}
                onChange={setSelectedColumns}
                isMulti
                autoFocus={false}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                blurInputOnSelect={false}
                onMenuOpen={handleMenuOpen}
                onMenuClose={handleMenuClose}
                components={{
                    Option,
                    ValueContainer,
                    IndicatorSeparator: null,
                    ClearIndicator: null,
                    MenuList,
                }}
                styles={{
                    ...containerImageSelectStyles,
                    menu: (base) => ({
                        ...base,
                        zIndex: 6,
                    }),
                    menuList: (base) => ({
                        ...base,
                        borderRadius: '4px',
                        paddingTop: 0,
                        paddingBottom: 0,
                    }),
                    option: (base, state) => ({
                        ...base,
                        padding: '10px 0',
                        backgroundColor: state.isFocused ? 'var(--N100) !important' : 'var(--N0) !important',
                        color: 'var(--N900)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                    }),
                    dropdownIndicator: (base, state) => ({
                        ...base,
                        color: 'var(--N400)',
                        transition: 'all .2s ease',
                        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        padding: '0 8px',
                    }),
                }}
            />
        </ColumnFilterContext.Provider>
    )
}

export default ColumnSelector
