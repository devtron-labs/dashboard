import { ComponentProps, useEffect, useRef, useState } from 'react'

import { SearchBar, useRegisterShortcut } from '@devtron-labs/devtron-fe-common-lib'

import { ShortcutKeyBadge } from '@Components/common/formFields/Widgets/Widgets'

import { ClusterUpgradeCompatibilityInfoTableWrapperProps } from './types'

const ClusterUpgradeCompatibilityInfoTableWrapper = ({
    searchKey,
    handleSearch,
    children,
}: ClusterUpgradeCompatibilityInfoTableWrapperProps) => {
    const [isInputFocused, setIsInputFocused] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const { registerShortcut, unregisterShortcut } = useRegisterShortcut()

    const handleInputBlur = () => setIsInputFocused(false)

    const handleInputFocus = () => setIsInputFocused(true)

    const handleFilterKeyUp = (e: React.KeyboardEvent): void => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            searchInputRef.current?.blur()
        }
    }

    const handleOnChangeSearchText: ComponentProps<typeof SearchBar>['handleSearchChange'] = (text) => {
        handleSearch(text)
        if (!text) {
            searchInputRef.current?.focus()
        }
    }

    const showShortcutKey = !isInputFocused && !searchKey

    const handleInputShortcut = () => {
        searchInputRef.current?.focus()
    }

    useEffect(() => {
        if (registerShortcut) {
            registerShortcut({ keys: ['R'], callback: handleInputShortcut })
        }
        return (): void => {
            unregisterShortcut(['R'])
        }
    }, [])

    return (
        <div className="resource-list-container flexbox-col flex-grow-1 border__primary--left dc__overflow-hidden">
            <div className="resource-filter-options-container flexbox w-100 px-20 py-16 dc__content-start">
                <div className="resource-filter-options-container__search-box dc__position-rel">
                    <SearchBar
                        inputProps={{
                            placeholder: 'Search',
                            onBlur: handleInputBlur,
                            onFocus: handleInputFocus,
                            ref: searchInputRef,
                            onKeyUp: handleFilterKeyUp,
                        }}
                        handleSearchChange={handleOnChangeSearchText}
                        initialSearchText={searchKey}
                    />

                    {showShortcutKey && (
                        <ShortcutKeyBadge
                            shortcutKey="r"
                            rootClassName="resource-search-shortcut-key"
                            onClick={handleInputShortcut}
                        />
                    )}
                </div>
            </div>

            {children}
        </div>
    )
}

export default ClusterUpgradeCompatibilityInfoTableWrapper
