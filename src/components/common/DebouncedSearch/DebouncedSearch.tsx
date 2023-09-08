import React, { useEffect, useState } from 'react'
import { useDebouncedEffect } from '../helpers/Helpers'
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
}: DebouncedSearchProps) {
    const [searchText, setSearchText] = useState<string>('')

    useEffect(() => {
        setSearchText('')
    }, [clearSearch])

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
                placeholder={placeholder ?? 'Search'}
                value={searchText}
                onChange={handleSearchTextChange}
                autoFocus
            />
            {/* In case we want to add another button or something  */}
            {children}
        </div>
    )
}
