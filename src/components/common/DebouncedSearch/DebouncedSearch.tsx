import React, { useEffect, useState } from 'react'
import { useDebouncedEffect } from '../helpers/Helpers'
import { ReactComponent as ICClear } from '../../../assets/icons/ic-error.svg'
import { DebouncedSearchProps } from './types'

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
                autoFocus
            />

            {showClearIcon && (
                <button
                    type="button"
                    className="dc__outline-none-imp dc__no-border p-0 bc-n50 flex"
                    onClick={handleClearSearch}
                >
                    <ICClear className="icon-dim-20 icon-n6" />
                </button>
            )}

            {/* In case we want to add another button or something  */}
            {children}
        </div>
    )
}
