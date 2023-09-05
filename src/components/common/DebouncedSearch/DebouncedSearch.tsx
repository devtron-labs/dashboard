import React, { useState } from 'react'
import { useDebouncedEffect } from '../helpers/Helpers'
import { DebouncedSearchInterface } from './types'

// TODO: AutoFocus, remove bg image
export default function DebouncedSearch({
    onSearch,
    icon,
    children,
    placeholder,
    containerClass = '',
    iconClass = '',
    inputClass = '',
    debounceTimeout = 500,
}: DebouncedSearchInterface) {
    const [searchText, setSearchText] = useState<string>('')

    const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value)
    }

    useDebouncedEffect(() => onSearch(searchText), debounceTimeout, [searchText])

    return (
        <div className={containerClass}>
            {icon && (
                <div
                    className={iconClass}
                    style={{
                        backgroundImage: `url(${icon})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundSize: 'contain',
                    }}
                />
            )}

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
