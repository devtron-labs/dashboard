import React, { useState } from 'react'
import { SearchBarProps } from './types'

// NOTE: This is intended to be enter based search bar
export default function SearchBar({
    onSearch,
    Icon,
    children,
    placeholder,
    containerClass = '',
    inputClass = '',
    iconClass = '',
}: SearchBarProps) {
    const [searchText, setSearchText] = useState<string>('')

    const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch(searchText)
        }
    }

    const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === '') {
            onSearch('')
        }
        setSearchText(e.target.value)
    }

    return (
        <div
            className={`dc__border-radius-4-imp flexbox pt-5 pr-10 pb-5 pl-8 dc__gap-8 w-250 dc__bg-n50 dc__align-items-center dc__border ${containerClass}`}
        >
            {Icon && <Icon className={`icon-dim-16 ${iconClass}`} />}

            <input
                type="text"
                className={`flex-grow-1 dc__no-shrink dc__no-border dc__outline-none-imp fs-13 lh-20 fw-400 p-0 m-0 ${inputClass}`}
                placeholder={placeholder || 'Search'}
                value={searchText}
                onChange={handleSearchTextChange}
                onKeyDown={onEnter}
            />
            {/* In case we want to add another button or something  */}
            {children}
        </div>
    )
}
