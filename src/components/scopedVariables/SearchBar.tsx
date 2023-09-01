import React, { useState } from 'react'
import { SearchBarInterface } from './types'
import searchSvg from '../../assets/icons/ic-search.svg'

// NOTE: This is intended to be enter based search bar
export default function SearchBar({ onSearch }: SearchBarInterface) {
    const [searchText, setSearchText] = useState<string>('')

    const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch(searchText)
        }
    }

    return (
        <div className="dc__border-radius-4-imp flexbox pt-5 pr-10 pb-5 pl-8 dc__gap-8 w-250 dc__bg-n50 dc__align-items-center dc__border">
            <div
                className="h-16 mw-16 p-0 m-0"
                style={{
                    backgroundImage: `url(${searchSvg})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'contain',
                }}
            />

            <input
                type="text"
                className="flex-grow-1 dc__no-shrink dc__no-border dc__outline-none-imp fs-13 lh-20 fw-400 p-0 m-0"
                placeholder="Search Variables"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={onEnter}
            />
        </div>
    )
}
