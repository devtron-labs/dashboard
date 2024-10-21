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

import React, { useEffect, useState } from 'react'
import { useDebouncedEffect } from './Utils'
import { ReactComponent as ICClear } from '../../Assets/Icon/ic-error-cross.svg'
import { DebouncedSearchProps } from './Types'

/**
 * @deprecated Use `SearchBar` component instead.
 *
 * @param onSearch - Callback function to be called on search
 * @param Icon - (Optional) Icon to be shown before the input
 * @param iconClass - (Optional) Class for the icon
 * @param children - (Optional) In case we want to add another button or any other element
 * @param placeholder - (Optional) Placeholder for the input
 * @param containerClass - (Optional) Class for the container
 * @param inputClass - (Optional) Class for the input field
 * @param debounceTimeout - (Optional) Timeout for the debounce with default value of 500ms
 * @param clearSearch - (Optional) To clear the search text
 * @param showClearIcon - (Optional) To show the clear icon default value is true
 */
export default function DebouncedSearch({
    onSearch,
    Icon,
    children,
    placeholder,
    containerClass = '',
    iconClass = '',
    inputClass = '',
    debounceTimeout = 500,
    clearSearch,
    showClearIcon = true,
    autoFocus = true,
}: DebouncedSearchProps) {
    const [searchText, setSearchText] = useState<string>('')

    useEffect(() => {
        setSearchText('')
    }, [clearSearch])

    const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
    }

    const handleClearSearch = () => {
        setSearchText('')
    }

    useDebouncedEffect(() => onSearch(searchText), debounceTimeout, [searchText])

    return (
        <div className={containerClass}>
            {Icon && <Icon className={iconClass} />}

            <input
                type="text"
                className={inputClass}
                placeholder={placeholder ?? 'Search'}
                value={searchText}
                onChange={handleSearchTextChange}
                autoFocus={autoFocus}
                data-testid="debounced-search"
            />

            {showClearIcon && !!searchText && (
                <button
                    type="button"
                    className="dc__outline-none-imp dc__no-border p-0 bc-n50 flex"
                    onClick={handleClearSearch}
                    data-testid="clear-search"
                >
                    <ICClear className="icon-dim-20 icon-n6" />
                </button>
            )}

            {/* In case we want to add another button or something  */}
            {children}
        </div>
    )
}
