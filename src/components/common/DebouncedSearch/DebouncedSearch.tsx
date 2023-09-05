import React, { useState } from 'react'
import { useDebouncedEffect } from '../helpers/Helpers'
import { DebouncedSearchProps } from './types'

// TODO: AutoFocus, remove bg image
export default function DebouncedSearch({
    onSearch,
    Icon,
    children,
    placeholder,
    containerClass = '',
    iconClass = '',
    inputClass = '',
    debounceTimeout = 500,
}: DebouncedSearchProps) {
    const [searchText, setSearchText] = useState<string>('')

    const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
    }

    useDebouncedEffect(() => onSearch(searchText), debounceTimeout, [searchText])

    return (
        <div className={containerClass}>
            {Icon && <Icon className={iconClass} />}

            <input
                type="text"
                className={inputClass}
                placeholder={placeholder || 'Search'}
                value={searchText}
                onChange={handleSearchTextChange}
            />
            {/* In case we want to add another button or something  */}
            {children}
        </div>
    )
}
