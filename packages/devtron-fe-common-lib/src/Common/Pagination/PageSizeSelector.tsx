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

import { useRef, useState } from 'react'
import { PageSizeItemsProps, PageSizeOption, PageSizeSelectorProps } from './types'
import { useClickOutside } from '../Hooks'
import { getDefaultPageValueOptions } from './utils'

const PageSizeItems = ({
    optionValue,
    options,
    setOptions,
    handleCloseDropdown,
    changePageSize,
}: PageSizeItemsProps) => {
    const handlePageSizeSelect = () => {
        const newOptions = options.map((_option) => ({
            value: _option.value,
            selected: _option.value === optionValue,
        }))
        setOptions([...newOptions])
        handleCloseDropdown()
        changePageSize(optionValue)
    }

    return (
        <div key={optionValue} className="select__item" onClick={handlePageSizeSelect}>
            {optionValue}
        </div>
    )
}

const PageSizeSelector = ({ pageSizeOptions, pageSize, changePageSize }: PageSizeSelectorProps) => {
    const defaultOptions = getDefaultPageValueOptions(pageSizeOptions).map((option) => ({
        value: option.value,
        selected: option.value === pageSize,
    }))

    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
    const [options, setOptions] = useState<PageSizeOption[]>(defaultOptions)

    const handleCloseDropdown = () => {
        setIsDropdownOpen(false)
    }

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    const dropdownRef = useRef<HTMLDivElement>(null)
    useClickOutside(dropdownRef, handleCloseDropdown)

    const selectedOption = options.find((option) => option.selected)
    const font = isDropdownOpen ? 'fa fa-caret-up' : 'fa fa-caret-down'
    return (
        <div ref={dropdownRef}>
            {isDropdownOpen && (
                <div className="pagination__select-menu">
                    {options.map((_option) => (
                        <PageSizeItems
                            optionValue={_option.value}
                            options={options}
                            setOptions={setOptions}
                            handleCloseDropdown={handleCloseDropdown}
                            changePageSize={changePageSize}
                        />
                    ))}
                </div>
            )}

            <button type="button" className="select__button" onClick={handleDropdownToggle}>
                <span>{selectedOption ? selectedOption.value : ''}</span>
                <span className="select__icon">
                    <i className={font} />
                </span>
            </button>
        </div>
    )
}

export default PageSizeSelector
