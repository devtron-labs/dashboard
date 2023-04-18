import React, { useState } from 'react'
import { ReactComponent as ClusterIcon } from '../../../assets/icons/ic-cluster.svg'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import { ReactComponent as Error } from '../../../assets/icons/ic-error-exclamation.svg'
import emptyCustomChart from '../../../assets/img/terminal@2x.png'
import { ClusterOptionType, ClusterSelectionType } from '../Types'
import { CLUSTER_SELECTION_MESSAGING } from '../Constants'
import ReactGA from 'react-ga4'
import Tippy from '@tippyjs/react'
import { clusterUnreachableTippyContent } from './ResourceList.component'

export function ClusterSelection({ clusterOptions, onChangeCluster }: ClusterSelectionType) {
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [filteredClusterList, setFilteredClusterList] = useState<ClusterOptionType[]>(clusterOptions)

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
        if (theKeyCode === 'Backspace' && searchText.length === 1) {
            clearSearch()
        } else {
            handleFilterChanges(event.target.value)
            setSearchApplied(true)
        }
    }

    const handleOnChangeSearchText = (event): void => {
        setSearchText(event.target.value)
    }
    const selectCluster = (e): void => {
        const data = e.currentTarget.dataset
        onChangeCluster({ label: data.label, value: data.value }, true)
        ReactGA.event({
            category: 'Resource Browser',
            action: 'Resource Browser - Cluster Selected',
        })
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

    const renderNoResults = (): JSX.Element => {
        return (
            <div className="flex" style={{ height: '200px' }}>
                <div className="dc__align-center">
                    <Error className="icon-dim-16 mt-3 mr-8" />
                    <div>{CLUSTER_SELECTION_MESSAGING.noResultText}</div>
                </div>
            </div>
        )
    }

    const renderClusterList = (): JSX.Element => {
        return (
            <>
                {filteredClusterList?.map((cluster, index) => (
                    <div
                        key={cluster.label}
                        className={`flex left pt-12 pr-16 pb-12 pl-16 pointer dc__hover-n50 ${
                            index === filteredClusterList.length - 1 ? 'dc__bottom-radius-4' : ' dc__border-bottom-n1'
                        }`}
                        data-label={cluster.label}
                        data-value={cluster.value}
                        onClick={selectCluster}
                    >
                        <ClusterIcon className="icon-dim-16 scb-5 mr-8" />
                        <div className="fw-4 fs-13 cb-5" data-testid={`cluster_link${index}`}>
                            {cluster.label}
                        </div>
                        {cluster.errorInConnecting && (
                            <Tippy
                                className="default-tt w-200"
                                placement="top"
                                arrow={false}
                                content={clusterUnreachableTippyContent(cluster.errorInConnecting)}
                            >
                                <div className="flex left ml-auto">
                                    <Error className="icon-dim-16 mr-4" />
                                    <span className="fs-13 fw-4 lh-20 cr-5">Unreachable</span>
                                </div>
                            </Tippy>
                        )}
                    </div>
                ))}
            </>
        )
    }
    return (
        <div className="cluster-selection-container flex p-20">
            <div className="w-600">
                <div className="pb-16 dc__align-center">
                    <img className="w-250" src={emptyCustomChart} alt="No cluster selected" />
                    <div className="fw-6 fs-16 cn-9 mt-16" data-testid="kubernetes-resource-browser">
                        {CLUSTER_SELECTION_MESSAGING.title}
                    </div>
                </div>
                <div className="en-2 bw-1 bcn-0 br-4">
                    {renderSearch()}
                    {filteredClusterList?.length === 0 ? renderNoResults() : renderClusterList()}
                </div>
            </div>
        </div>
    )
}
