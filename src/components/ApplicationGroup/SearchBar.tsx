import React from 'react'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'

export default function SearchBar({
    placeholder,
    handleFilterChanges,
    searchText,
    setSearchText,
    searchApplied,
    setSearchApplied,
}: {
    placeholder: string
    handleFilterChanges: (searchText: string) => void
    searchText: string
    setSearchText: React.Dispatch<React.SetStateAction<string>>
    searchApplied: boolean
    setSearchApplied: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const clearSearch = (): void => {
        if (searchApplied) {
            handleFilterChanges('')
            setSearchApplied(false)
        }
        setSearchText('')
    }

    const handleFilterKeyPress = (event): void => {
        const theKeyCode = event.key
        if (theKeyCode === 'Enter') {
            handleFilterChanges(event.target.value)
            setSearchApplied(true)
        } else if (theKeyCode === 'Backspace' && searchText.length === 1) {
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
