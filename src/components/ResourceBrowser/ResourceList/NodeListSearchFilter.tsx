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

import { ChangeEvent, KeyboardEvent, RefCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { parse as parseQueryString, ParsedQuery, stringify as stringifyQueryString } from 'query-string'

import { OptionType, SelectPicker, useAsync, useRegisterShortcut } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICClear } from '@Icons/ic-error.svg'
import { ReactComponent as ICSearch } from '@Icons/ic-search.svg'
import { getClusterCapacity } from '@Components/ClusterNodes/clusterNodes.service'

import { ShortcutKeyBadge } from '../../common/formFields/Widgets/Widgets'
import {
    DEFAULT_NODE_K8S_VERSION,
    NODE_K8S_VERSION_FILTER_KEY,
    NODE_SEARCH_KEY_OPTIONS,
    NODE_SEARCH_KEY_PLACEHOLDER,
} from '../Constants'
import { NODE_SEARCH_KEYS, NodeListSearchFilterType, URLParams } from '../Types'
import ColumnSelector from './ColumnSelector'

const NodeListSearchFilter = ({
    visibleColumns,
    setVisibleColumns,
    isOpen,
    searchParams,
}: NodeListSearchFilterType) => {
    const { clusterId } = useParams<URLParams>()

    const selectedSearchTextType: NODE_SEARCH_KEYS | '' = Object.values(NODE_SEARCH_KEYS).reduce((type, key) => {
        if (searchParams[key]) {
            return key
        }

        return type
    }, '')

    const selectedK8sNodeVersion = searchParams[NODE_K8S_VERSION_FILTER_KEY] ?? ''

    const [isSearchKeySelectorOpen, setIsSearchKeySelectorOpen] = useState(false)
    const [searchTextType, setSearchTextType] = useState<NODE_SEARCH_KEYS | ''>(selectedSearchTextType)
    const [searchInputText, setSearchInputText] = useState(
        selectedSearchTextType ? searchParams[selectedSearchTextType] : '',
    )

    const searchInputRef = useRef<HTMLInputElement>(null)

    const handleSearchInputMount: RefCallback<HTMLInputElement> = (node) => {
        if (node) {
            searchInputRef.current = node

            node.focus()
        }
    }

    const location = useLocation()
    const { push } = useHistory()

    const [nodeK8sVersionsLoading, nodeK8sVersionOptions, nodeK8sVersionsError, refetchNodeK8sVersions] =
        useAsync(async () => {
            const {
                result: { nodeK8sVersions: versions },
            } = await getClusterCapacity(clusterId)

            return [
                DEFAULT_NODE_K8S_VERSION,
                ...(versions?.map((version) => ({
                    label: `K8s version: ${version}`,
                    value: version,
                })) || []),
            ]
        }, [clusterId])

    const selectedK8sVersionOption = useMemo(
        () =>
            nodeK8sVersionOptions?.find((option) => option.value === selectedK8sNodeVersion) ??
            DEFAULT_NODE_K8S_VERSION,
        [nodeK8sVersionOptions, selectedK8sNodeVersion],
    )

    const handleFocusInput = () => {
        setIsSearchKeySelectorOpen(true)
        searchInputRef.current?.focus()
    }

    const handleBlurInput = () => {
        setIsSearchKeySelectorOpen(false)
        searchInputRef.current?.blur()
    }

    const { registerShortcut, unregisterShortcut } = useRegisterShortcut()

    useEffect(() => {
        if (registerShortcut && isOpen) {
            registerShortcut({ keys: ['R'], callback: handleFocusInput })
            registerShortcut({ keys: ['Escape'], callback: handleBlurInput })
        }

        return (): void => {
            unregisterShortcut(['R'])
            unregisterShortcut(['Escape'])
        }
    }, [isOpen])

    const handleQueryParamsUpdate = (callback: (queryObject: ParsedQuery) => ParsedQuery) => {
        if (!callback) {
            return
        }

        const queryObject = parseQueryString(location.search)

        const finalQueryString = stringifyQueryString(callback(queryObject))

        push(`?${finalQueryString}`)
    }

    const handleQueryParamsSearch = (searchString: string) => {
        handleQueryParamsUpdate((queryObject) => {
            const finalQueryObject = structuredClone(queryObject)

            Object.values(NODE_SEARCH_KEYS).forEach((key) => {
                if (key === searchTextType) {
                    finalQueryObject[key] = searchString
                } else {
                    delete finalQueryObject[key]
                }
            })

            return finalQueryObject
        })
    }

    const handleSearchTextChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setSearchInputText(event.target.value)
    }

    const handleClearTextFilters = (): void => {
        setSearchInputText('')

        setSearchTextType('')

        handleQueryParamsUpdate((queryObject) => {
            const finalQueryObject = structuredClone(queryObject)

            Object.values(NODE_SEARCH_KEYS).forEach((key) => {
                delete finalQueryObject[key]
            })

            return finalQueryObject
        })
    }

    const handleKeyDownOnSearchInput = (event: KeyboardEvent<HTMLInputElement>): void => {
        const { key } = event

        if (key === 'Enter') {
            handleQueryParamsSearch(searchInputText)

            setIsSearchKeySelectorOpen(false)
        }

        if (key === 'Backspace' && searchInputText.length === 0 && searchTextType) {
            setSearchTextType('')

            setIsSearchKeySelectorOpen(false)
        }

        if (key === 'Escape') {
            event.currentTarget.blur()
        }
    }

    const handleToggleIsSearchKeySelectorOpen = () => {
        setIsSearchKeySelectorOpen((prev) => !prev)
    }

    const getSelectSearchKeyTypeHandler = (key: NODE_SEARCH_KEYS) => () => {
        setSearchTextType(key)
        setSearchInputText('')
        setIsSearchKeySelectorOpen(false)
    }

    const handleApplyNodeK8sVersion = (option: OptionType) => {
        handleQueryParamsUpdate((queryObject) => {
            const finalQueryObject = structuredClone(queryObject)

            if (option.value === DEFAULT_NODE_K8S_VERSION.value) {
                delete finalQueryObject[NODE_K8S_VERSION_FILTER_KEY]
            } else {
                finalQueryObject[NODE_K8S_VERSION_FILTER_KEY] = option.value
            }

            return finalQueryObject
        })
    }

    const handleOpenSearchKeySelectorMenu = () => {
        setIsSearchKeySelectorOpen(true)
    }

    const renderTextFilter = (): JSX.Element => {
        const placeholderText = NODE_SEARCH_KEY_PLACEHOLDER[searchTextType]

        return (
            <div className="dc__position-rel bg__secondary">
                <button
                    type="button"
                    className=" h-32 br-4 en-2 bw-1 w-100 fw-4 pt-6 pb-6 pr-10 flexbox flex-align-center dc__content-start dc__transparent"
                    onClick={handleOpenSearchKeySelectorMenu}
                    aria-label="Open search key selector popup"
                >
                    <ICSearch className="mr-5 ml-10 icon-dim-18" />

                    {searchTextType ? (
                        <>
                            <span>
                                {NODE_SEARCH_KEY_OPTIONS.find((option) => option.value === searchTextType).label}
                                &nbsp;:
                            </span>

                            <input
                                autoComplete="off"
                                type="text"
                                className="dc__transparent flex-1 dc__outline-none-imp"
                                placeholder={placeholderText}
                                onKeyDown={handleKeyDownOnSearchInput}
                                onChange={handleSearchTextChange}
                                value={searchInputText}
                                ref={handleSearchInputMount}
                            />
                        </>
                    ) : (
                        <span className="cn-5">Search nodes by name, labels or node group</span>
                    )}

                    {!searchTextType && (
                        <ShortcutKeyBadge shortcutKey="r" rootClassName="node-listing-search-container__shortcut-key" />
                    )}
                </button>

                {isSearchKeySelectorOpen && (
                    <>
                        <button
                            type="button"
                            className="dc__transparent-div"
                            onClick={handleToggleIsSearchKeySelectorOpen}
                            aria-label="Close search popup"
                        />

                        {!searchTextType && (
                            <div className="dc__zi-6 w-100 bg__primary dc__position-abs  br-4 en-2 bw-1">
                                <div className="bg__tertiary pt-4 pb-4 pl-10 pr-10">Search by</div>

                                {NODE_SEARCH_KEY_OPTIONS.map((option) => (
                                    <button
                                        type="button"
                                        className="pt-8 pb-8 pl-10 pr-10 dc__hover-n50 pointer dc__transparent w-100 dc__align-left"
                                        key={option.label}
                                        onClick={getSelectSearchKeyTypeHandler(option.value)}
                                        aria-label={`Set search key type to ${option.label}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {(searchTextType || searchInputText) && (
                    <button
                        className="search__clear-button flex"
                        type="button"
                        onClick={handleClearTextFilters}
                        aria-label="Clear applied text filters"
                    >
                        <ICClear className="icon-dim-18 icon-n4" />
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="node-listing-search-container pt-16 pr-20 pb-12 pl-20 dc__zi-5">
            {renderTextFilter()}

            <SelectPicker
                inputId="k8s-version-select"
                optionListError={nodeK8sVersionsError}
                reloadOptionList={refetchNodeK8sVersions}
                isLoading={nodeK8sVersionsLoading}
                options={nodeK8sVersionOptions ?? []}
                onChange={handleApplyNodeK8sVersion}
                value={selectedK8sVersionOption}
            />

            <div className="dc__border-left h-20 mt-6" />

            <ColumnSelector
                {...{
                    setVisibleColumns,
                    visibleColumns,
                }}
            />
        </div>
    )
}

export default NodeListSearchFilter
