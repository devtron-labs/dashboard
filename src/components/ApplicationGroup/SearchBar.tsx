import React from 'react'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { SearchBarType } from './AppGroup.types'

export default function SearchBar({
    placeholder,
    searchText,
    setSearchText,
    searchApplied,
    setSearchApplied,
}: SearchBarType) {
    const clearSearch = (): void => {
        if (searchApplied) {
            setSearchApplied(false)
        }
        setSearchText('')
    }

    const handleFilterKeyPress = (event): void => {
        const theKeyCode = event.key
        if (theKeyCode === 'Backspace' && searchText.length === 1) {
            clearSearch()
        }
    }

    const handleSearchChange = (event) => {
        setSearchText(event.target.value)
    }

    return (
        <div className="dc__block w-100 dc__position-rel en-2 bw-1 br-4 h-32">
            <Search className="search__icon icon-dim-18" />
            <input
                type="text"
                placeholder={placeholder ?? 'Search'}
                value={searchText}
                className="search__input"
                onChange={handleSearchChange}
                onKeyDown={handleFilterKeyPress}
            />
            {searchApplied && (
                <button className="search__clear-button" type="button" onClick={clearSearch}>
                    <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                </button>
            )}
        </div>
    )
}
