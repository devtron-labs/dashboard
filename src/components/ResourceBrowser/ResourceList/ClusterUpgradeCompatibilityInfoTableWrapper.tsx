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

import { ComponentProps, useRef } from 'react'

import { SearchBar } from '@devtron-labs/devtron-fe-common-lib'

import { ClusterUpgradeCompatibilityInfoTableWrapperProps } from './types'

const ClusterUpgradeCompatibilityInfoTableWrapper = ({
    searchKey,
    handleSearch,
    children,
}: ClusterUpgradeCompatibilityInfoTableWrapperProps) => {
    const searchInputRef = useRef<HTMLInputElement>(null)

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

    return (
        <div className="resource-list-container flexbox-col flex-grow-1 border__primary--left dc__overflow-hidden">
            <div className="resource-filter-options-container flexbox w-100 px-20 py-16 dc__content-start">
                <SearchBar
                    inputProps={{
                        placeholder: 'Search',
                        ref: searchInputRef,
                        onKeyUp: handleFilterKeyUp,
                    }}
                    handleSearchChange={handleOnChangeSearchText}
                    initialSearchText={searchKey}
                    keyboardShortcut="/"
                />
            </div>

            {children}
        </div>
    )
}

export default ClusterUpgradeCompatibilityInfoTableWrapper
