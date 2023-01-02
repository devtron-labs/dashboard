import React, { useState } from 'react'
import { ReactComponent as ClusterIcon } from '../../../assets/icons/ic-cluster.svg'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import emptyCustomChart from '../../../assets/img/terminal@2x.png'
import '../ResourceBrowser.scss'
import { OptionType } from '../../app/types'
import { ClusterSelectionType } from '../Types'

export function ClusterSelection({ clusterOptions, onChangeCluster }: ClusterSelectionType) {
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [filteredClusterList, setFilteredClusterList] = useState<OptionType[]>(clusterOptions)

    const handleFilterChanges = (_searchText: string): void => {
        const _filteredData = clusterOptions.filter((resource) => resource.label.indexOf(_searchText) >= 0)
        setFilteredClusterList(_filteredData)
    }

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

    const handleOnChangeSearchText = (event): void => {
        setSearchText(event.target.value)
    }
    const selectCluster = (e): void => {
        const data = e.currentTarget.dataset
        onChangeCluster({ label: data.label, value: data.value }, true)
    }

    const renderSearch = (): JSX.Element => {
        return (
            <div className="pt-12 pr-16 pb-12 pl-16">
                <div className="search dc__position-rel margin-right-0 en-2 bw-1 br-4 h-32 w-100-imp">
                    <Search className="search__icon icon-dim-18" />
                    <input
                        type="text"
                        placeholder="Search clusters"
                        value={searchText}
                        className="search__input"
                        onChange={handleOnChangeSearchText}
                        onKeyDown={handleFilterKeyPress}
                    />
                    {searchApplied && (
                        <button className="search__clear-button" type="button" onClick={clearSearch}>
                            <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                        </button>
                    )}
                </div>
            </div>
        )
    }
    return (
        <div className="cluster-selection-container flex p-20">
            <div className="w-600">
                <div className="pb-16 dc__align-center">
                    <img className="w-250" src={emptyCustomChart} alt="No cluster selected" />
                    <div className="fw-6 fs-16 cn-9 mt-16">Select a cluster to view Kubernetes resources</div>
                </div>
                <div className="en-2 bw-1 bcn-0">
                    {renderSearch()}
                    {filteredClusterList?.map((cluster) => (
                        <div
                            className="flex left dc__border-bottom pt-12 pr-16 pb-12 pl-16 pointer"
                            data-label={cluster.label}
                            data-value={cluster.value}
                            onClick={selectCluster}
                        >
                          <ClusterIcon className="icon-dim-16 scb-5 mr-8"/>
                            <div className="fw-4 fs-13 cn-5">{cluster.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
