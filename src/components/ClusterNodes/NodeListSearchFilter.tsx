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

import React, { useState, useEffect, useRef } from 'react'
import { MultiValue } from 'react-select'
import { useLocation, useHistory } from 'react-router-dom'
import * as queryString from 'query-string'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { ColumnMetadataType, NodeListSearchFliterType } from './types'
import ColumnSelector from './ColumnSelector'
import { NodeSearchOption, SEARCH_OPTION_LABEL } from './constants'
import { ShortcutKeyBadge } from '../common/formFields/Widgets/Widgets'
import { SelectPicker } from '@devtron-labs/devtron-fe-common-lib'

const ColumnFilterContext = React.createContext(null)

export function useColumnFilterContext() {
    const context = React.useContext(ColumnFilterContext)
    if (!context) {
        throw new Error(`cannot be rendered outside the component`)
    }
    return context
}

export default function NodeListSearchFilter({
    defaultVersion,
    nodeK8sVersions,
    selectedVersion,
    setSelectedVersion,
    appliedColumns,
    setAppliedColumns,
    selectedSearchTextType,
    setSelectedSearchTextType,
    searchText,
    setSearchText,
    searchedTextMap,
    setSearchedTextMap,
}: NodeListSearchFliterType) {
    const [searchApplied, setSearchApplied] = useState(false)
    const [openFilterPopup, setOpenFilterPopup] = useState(false)
    const [searchInputText, setSearchInputText] = useState('')
    const [isMenuOpen, setMenuOpen] = useState(false)
    const [selectedColumns, setSelectedColumns] = useState<MultiValue<ColumnMetadataType>>([])
    const selectRef = useRef()
    const location = useLocation()
    const { push } = useHistory()
    useEffect(() => {
        if (searchInputText !== searchText) {
            setSearchInputText(searchText)
            if (!searchText) {
                setSearchApplied(false)
            } else {
                setSearchApplied(true)
            }
        }
    }, [searchText, searchedTextMap])

    const handleFocus = () => {
        document.removeEventListener('keydown', keyPressHandler)
    }

    const handleBlur = () => {
        document.addEventListener('keydown', keyPressHandler)
    }

    useEffect(() => {
        handleBlur()
        document.addEventListener('focusin', handleFocus)
        document.addEventListener('focusout', handleBlur)
        return () => {
            document.removeEventListener('keydown', keyPressHandler)
            document.removeEventListener('focusin', handleFocus)
            document.removeEventListener('focusout', handleBlur)
        }
    }, [])

    const keyPressHandler = (e) => {
        if (e.key === 'r') {
            setOpenFilterPopup(true)
        }
    }

    const clearTextFilter = (): void => {
        handleQueryParamsSeacrh('')
        setSearchInputText('')
        setSearchText('')
        setSelectedSearchTextType('')
        setSearchedTextMap(new Map())
        setSearchApplied(false)
    }

    const handleFilterInput = (event): void => {
        setSearchInputText(event.target.value)
    }
    const handleQueryParamsSeacrh = (searchString: string) => {
        const qs = queryString.parse(location.search)
        const keys = Object.keys(qs)
        const query = {}
        keys.forEach((key) => {
            query[key] = qs[key]
        })
        if (searchString) {
            query[selectedSearchTextType] = searchInputText
        } else {
            delete query[selectedSearchTextType]
        }
        const queryStr = queryString.stringify(query)
        push(`?${queryStr}`)
    }

    const handleFilterTag = (event): void => {
        const theKeyCode = event.key
        if (theKeyCode === 'Enter') {
            const _searchedTextMap = new Map()
            const searchedLabelArr = searchInputText.split(',')
            for (let index = 0; index < searchedLabelArr.length; index++) {
                const currentItem = searchedLabelArr[index].trim()
                if (!currentItem) {
                    continue
                }
                if (selectedSearchTextType === SEARCH_OPTION_LABEL.LABEL) {
                    const element = currentItem.split('=')
                    const key = element[0] ? element[0].trim() : null
                    if (!key) {
                        continue
                    }
                    const value = element[1] ? element[1].trim() : null
                    _searchedTextMap.set(key, value)
                } else {
                    _searchedTextMap.set(currentItem, true)
                }
            }

            handleQueryParamsSeacrh(searchInputText)
            setSearchText(searchInputText)
            setSearchedTextMap(_searchedTextMap)
            setSearchApplied(true)
            setOpenFilterPopup(false)
        } else if (theKeyCode === 'Backspace') {
            if (searchInputText.length === 0 && selectedSearchTextType) {
                handleQueryParamsSeacrh('')
                setSelectedSearchTextType('')
                setSearchText('')
                setOpenFilterPopup(false)
                setSearchApplied(false)
            }
        }
    }

    const toggleSelectPopup = (): void => {
        setOpenFilterPopup(!openFilterPopup)
    }

    const selectFilterType = (filter: { label: string; value: string | number; type: string }): void => {
        setSelectedSearchTextType(filter.label)
        setSearchInputText('')
        setOpenFilterPopup(false)
    }

    const applyFilter = (selected) => {
        setSelectedVersion(selected)
        const qs = queryString.parse(location.search)
        const keys = Object.keys(qs)
        const query = {}
        keys.forEach((key) => {
            query[key] = qs[key]
        })
        if (selected.value === defaultVersion.value) {
            delete query['k8sversion']
        } else {
            query['k8sversion'] = selected.value
        }
        const queryStr = queryString.stringify(query)
        push(`?${queryStr}`)
    }
    const renderTextFilter = (): JSX.Element => {
        let placeholderText = ''
        if (selectedSearchTextType === SEARCH_OPTION_LABEL.NAME) {
            placeholderText = 'Search by node name Eg. ip-172-31-2-152.us-east-2.compute.internal'
        } else if (selectedSearchTextType === SEARCH_OPTION_LABEL.LABEL) {
            placeholderText = 'Search by key=value Eg. environment=production, tier=frontend'
        } else {
            placeholderText = 'Search by node group name Eg. mainnode'
        }

        return (
            <div className="dc__position-rel bc-n50">
                <div
                    className=" h-32 br-4 en-2 bw-1 w-100 fw-4 pt-6 pb-6 pr-10 flexbox flex-align-center dc__content-start"
                    onClick={() => setOpenFilterPopup(true)}
                >
                    <Search className="mr-5 ml-10 icon-dim-18" />
                    {selectedSearchTextType ? (
                        <>
                            <span className="bottom-2px">
                                {selectedSearchTextType === SEARCH_OPTION_LABEL.NODE_GROUP
                                    ? SEARCH_OPTION_LABEL.NODE_GROUP_TEXT
                                    : selectedSearchTextType}
                                :
                            </span>
                            <input
                                autoComplete="off"
                                type="text"
                                className="dc__transparent flex-1 outline-none"
                                autoFocus
                                placeholder={placeholderText}
                                onKeyDown={handleFilterTag}
                                onChange={handleFilterInput}
                                value={searchInputText}
                            />
                        </>
                    ) : (
                        <span className="cn-5">Search nodes by name, labels or node group</span>
                    )}
                    {!selectedSearchTextType && (
                        <ShortcutKeyBadge shortcutKey="r" rootClassName="node-list-search-key" />
                    )}
                </div>
                {openFilterPopup && (
                    <>
                        <div className="dc__transparent-div" onClick={toggleSelectPopup} />
                        {!selectedSearchTextType && (
                            <div className="search-popup w-100 bcn-0 dc__position-abs  br-4 en-2 bw-1">
                                <div className="search-title pt-4 pb-4 pl-10 pr-10">Search by</div>
                                {NodeSearchOption.map((o) => {
                                    return (
                                        <div
                                            className="pt-8 pb-8 pl-10 pr-10 hover-class pointer"
                                            key={o.label}
                                            onClick={() => {
                                                selectFilterType(o)
                                            }}
                                        >
                                            {o.label === SEARCH_OPTION_LABEL.NODE_GROUP
                                                ? SEARCH_OPTION_LABEL.NODE_GROUP_TEXT
                                                : o.label}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}
                {searchApplied && (
                    <button className="search__clear-button" type="button" onClick={clearTextFilter}>
                        <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                    </button>
                )}
            </div>
        )
    }
    return (
        <div className="search-wrapper">
            {renderTextFilter()}
            <SelectPicker
                inputId="k8s-version-select"
                name="k8s-version-select"
                classNamePrefix="k8s-version-select"
                options={[
                    defaultVersion,
                    ...(nodeK8sVersions?.map((version) => ({
                        label: `K8s version: ${version}`,
                        value: version,
                    })) || []),
                ]}
                onChange={applyFilter}
                value={selectedVersion}
            />
            <div className="dc__border-left h-20 mt-6" />
            <ColumnFilterContext.Provider
                value={{
                    appliedColumns,
                    setAppliedColumns,
                    isMenuOpen,
                    setMenuOpen,
                    selectedColumns,
                    setSelectedColumns,
                    selectRef,
                }}
            >
                <ColumnSelector />
            </ColumnFilterContext.Provider>
        </div>
    )
}
