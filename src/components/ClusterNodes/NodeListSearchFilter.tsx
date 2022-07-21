import React, { useState, useEffect } from 'react'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { Option, DropdownIndicator } from '../v2/common/ReactSelect.utils'
import { containerImageSelectStyles } from '../CIPipelineN/ciPipeline.utils'
import ReactSelect, { MultiValue } from 'react-select'
import { OptionType } from '../app/types'
import { ColumnMetadataType, NodeListSearchFliterType } from './types'
import ColumnSelector from './ColumnSelector'

const ColumnFilterContext = React.createContext(null)

export function useColumnFilterContext() {
    const context = React.useContext(ColumnFilterContext)
    if (!context) {
        throw new Error(`cannot be rendered outside the component`)
    }
    return context
}

export default function NodeListSearchFliter({
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

    const onVersionChange = (selectedValue: OptionType): void => {
        setSelectedVersion(selectedValue)
    }

    const clearTextFilter = (): void => {
        setSearchInputText('')
        setSearchText('')
        setSelectedSearchTextType('')
        setSearchedTextMap(new Map())
        setSearchApplied(false)
    }

    const handleFilterInput = (event): void => {
        setSearchInputText(event.target.value)
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
                if (selectedSearchTextType === 'label') {
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
            setSearchText(searchInputText)
            setSearchedTextMap(_searchedTextMap)
            setSearchApplied(true)
            setOpenFilterPopup(false)
        } else if (theKeyCode === 'Backspace') {
            if (searchInputText.length === 0 && selectedSearchTextType) {
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
    const renderTextFilter = (): JSX.Element => {
        return (
            <div className="position-rel" style={{ background: 'var(--N50)' }}>
                <div
                    className=" h-32 br-4 en-2 bw-1 w-100 fw-4 pt-6 pb-6 pr-10 flexbox"
                    onClick={() => setOpenFilterPopup(true)}
                >
                    <Search className="mr-5 ml-10 icon-dim-18" />
                    {selectedSearchTextType ? (
                        <>
                            <span className="position-rel bottom-2px">{selectedSearchTextType}:</span>
                            <input
                                autoComplete="off"
                                type="text"
                                className="transparent flex-1 outline-none"
                                autoFocus
                                placeholder={
                                    selectedSearchTextType === 'name'
                                        ? 'Search by node name Eg. ip-172-31-2-152.us-east-2.compute.internal'
                                        : 'Search by key=value Eg. environment=production, tier=frontend'
                                }
                                onKeyDown={handleFilterTag}
                                onChange={handleFilterInput}
                                value={searchInputText}
                            />
                        </>
                    ) : (
                        <span>Search nodes by name or labels</span>
                    )}
                </div>
                {openFilterPopup && (
                    <>
                        <div className="transparent-div" onClick={toggleSelectPopup}></div>
                        {!selectedSearchTextType && (
                            <div className="search-popup w-100 bcn-0 position-abs br-4 en-2 bw-1">
                                <div className="search-title pt-4 pb-4 pl-10 pr-10">Search by</div>
                                {[
                                    { value: 1, label: 'name', type: 'main' },
                                    { value: 2, label: 'label', type: 'main' },
                                ].map((o) => {
                                    return (
                                        <div
                                            className="pt-8 pb-8 pl-10 pr-10 hover-class pointer"
                                            key={o.label}
                                            onClick={() => {
                                                selectFilterType(o)
                                            }}
                                        >
                                            {o.label}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}
                {searchApplied && (
                    <button className="search__clear-button" type="button" onClick={clearTextFilter}>
                        <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                    </button>
                )}
            </div>
        )
    }
    return (
        <div className="search-wrapper">
            {renderTextFilter()}
            <ReactSelect
                options={[
                    defaultVersion,
                    ...(nodeK8sVersions?.map((version) => ({
                        label: 'K8s version: ' + version,
                        value: version,
                    })) || []),
                ]}
                onChange={onVersionChange}
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator,
                    Option,
                }}
                value={selectedVersion}
                styles={{
                    ...containerImageSelectStyles,
                    singleValue: (base, state) => ({
                        ...base,
                        padding: '5px 0',
                    }),
                }}
            />
            <div className="border-left h-20 mt-6"></div>
            <ColumnFilterContext.Provider
                value={{
                    appliedColumns,
                    setAppliedColumns,
                    isMenuOpen,
                    setMenuOpen,
                    selectedColumns,
                    setSelectedColumns,
                }}
            >
                <ColumnSelector />
            </ColumnFilterContext.Provider>
        </div>
    )
}
