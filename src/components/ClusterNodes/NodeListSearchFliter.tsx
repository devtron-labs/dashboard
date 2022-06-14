import React, { useState } from 'react'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { Option, DropdownIndicator } from '../v2/common/ReactSelect.utils'
import { containerImageSelectStyles } from '../CIPipelineN/ciPipeline.utils'
import ReactSelect, { MultiValue } from 'react-select'
import { OptionType } from '../app/types'
import { columnMetadataType } from './types'
import ColumnSelector from './ColumnSelector'

interface NodeListSearchFliterType {
    defaultVersion: OptionType
    nodeK8sVersions: string[]
    selectedVersion: OptionType
    setSelectedVersion: React.Dispatch<React.SetStateAction<OptionType>>
    appliedColumns: MultiValue<columnMetadataType>
    setAppliedColumns: React.Dispatch<React.SetStateAction<MultiValue<columnMetadataType>>>
    selectedSearchTextType: string
    setSelectedSearchTextType: React.Dispatch<React.SetStateAction<string>>
    setSearchText: React.Dispatch<React.SetStateAction<string>>
    searchedLabelMap: Map<string, string>
    setSearchedLabelMap: React.Dispatch<React.SetStateAction<Map<string, string>>>
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
    setSearchText,
    setSearchedLabelMap,
}: NodeListSearchFliterType) {
    const [searchApplied, setSearchApplied] = useState(false)
    const [isMenuOpen, setMenuOpen] = useState(false)
    const [openFilterPopup, setOpenFilterPopup] = useState(false)
    const [searchInputText, setSearchInputText] = useState('')

    const onVersionChange = (selectedValue: OptionType): void => {
        setSelectedVersion(selectedValue)
    }

    const clearTextFilter = (): void => {
        setSearchInputText('')
        setSearchText('')
        setSelectedSearchTextType('')
        setSearchedLabelMap(new Map())
        setSearchApplied(false)
    }

    const handleFilterInput = (event): void => {
        setSearchInputText(event.target.value)
    }

    const handleFilterTag = (event): void => {
        let theKeyCode = event.key
        if (theKeyCode === 'Enter') {
            if (selectedSearchTextType === 'label') {
                const _searchedLabelMap = new Map()
                const searchedLabelArr = searchInputText.split(',')
                for (let index = 0; index < searchedLabelArr.length; index++) {
                    const element = searchedLabelArr[index].trim().split('=')
                    const key = element[0] ? element[0].trim() : null
                    if (!key) {
                        continue
                    }
                    const value = element[1] ? element[1].trim() : null
                    _searchedLabelMap.set(key, value)
                }
                setSearchedLabelMap(_searchedLabelMap)
            } else {
                setSearchText(event.target.value)
            }
            setSearchApplied(true)
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
                {searchApplied ? (
                    <button className="search__clear-button" type="button" onClick={clearTextFilter}>
                        <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                    </button>
                ) : null}
            </div>
        )
    }
    return (
        <div className="search-wrapper ">
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
            <ColumnSelector appliedColumns={appliedColumns} setAppliedColumns={setAppliedColumns} />
        </div>
    )
}
