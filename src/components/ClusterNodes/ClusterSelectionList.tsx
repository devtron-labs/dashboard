import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { handleUTCTime } from '../common'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { ClusterDetail } from './types'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Success } from '../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as TerminalIcon } from '../../assets/icons/ic-terminal-fill.svg'
import ClusterNodeEmptyState from './ClusterNodeEmptyStates'
import Tippy from '@tippyjs/react'
import './clusterNodes.scss'
import { ClusterSelectionType } from '../ResourceBrowser/Types'
import { AppDetailsTabs } from '../v2/appDetails/appDetails.store'
import { K8S_EMPTY_GROUP } from '../ResourceBrowser/Constants'

export default function ClusterSelectionList({
    clusterOptions,
    onChangeCluster,
    isSuperAdmin,
    clusterListLoader,
    refreshData,
}: ClusterSelectionType) {
    const location = useLocation()
    const history = useHistory()
    const [minLoader, setMinLoader] = useState(true)
    const [noResults, setNoResults] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [filteredClusterList, setFilteredClusterList] = useState<ClusterDetail[]>([])
    const [clusterList, setClusterList] = useState<ClusterDetail[]>([])
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState('')
    const [lastDataSync, setLastDataSync] = useState(false)
    const [searchApplied, setSearchApplied] = useState(false)

    useEffect(() => {
        setClusterList([])
        setFilteredClusterList([])
        setLastDataSync(!lastDataSync)
        setClusterList(clusterOptions)
        setFilteredClusterList(clusterOptions)
        setMinLoader(false)
    }, [clusterOptions])

    useEffect(() => {
        const _lastDataSyncTime = Date()
        setLastDataSyncTimeString('Last refreshed ' + handleUTCTime(_lastDataSyncTime, true))
        const interval = setInterval(() => {
            setLastDataSyncTimeString('Last refreshed ' + handleUTCTime(_lastDataSyncTime, true))
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    }, [lastDataSync])

    const handleFilterChanges = (_searchText: string): void => {
        const _filteredData = clusterList.filter((cluster) => cluster.name.indexOf(_searchText.toLowerCase()) >= 0)
        setFilteredClusterList(_filteredData)
        setNoResults(_filteredData.length === 0)
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

    const renderSearch = (): JSX.Element => {
        return (
            <div className="search dc__position-rel margin-right-0 en-2 bw-1 br-4 h-32">
                <Search className="search__icon icon-dim-18" />
                <input
                    type="text"
                    placeholder="Search clusters"
                    value={searchText}
                    className="search__input"
                    onChange={(event) => {
                        setSearchText(event.target.value)
                    }}
                    onKeyDown={handleFilterKeyPress}
                    disabled={clusterListLoader}
                />
                {searchApplied && (
                    <button className="search__clear-button" type="button" onClick={clearSearch}>
                        <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                    </button>
                )}
            </div>
        )
    }

    const openTerminalComponent = (clusterData): void => {
        const queryParams = new URLSearchParams(location.search)
        queryParams.set('clusterId', clusterData.id)
        history.push(`${location.pathname}/${clusterData.id}/all/${AppDetailsTabs.terminal}/${K8S_EMPTY_GROUP}`)
    }

    const selectCluster = (e): void => {
        const data = e.currentTarget.dataset
        onChangeCluster({ label: data.label, value: +data.value }, true)
    }

    const hideDataOnLoad = (value) => {
        if (clusterListLoader) return
        return value
    }

    const renderClusterRow = (clusterData: ClusterDetail): JSX.Element => {
        const errorCount = clusterData.nodeErrors ? Object.keys(clusterData.nodeErrors).length : 0
        return (
            <div
                key={`cluster-${clusterData.id}`}
                className={`cluster-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20 hover-class dc__visible-hover ${
                    clusterData.nodeCount && !clusterListLoader && isSuperAdmin ? 'dc__visible-hover--parent' : ''
                } ${clusterListLoader ? 'show-shimmer-loading' : ''}`}
            >
                <div
                    data-testid={`cluster-row-${clusterData.name}`}
                    className="cb-5 dc__ellipsis-right cursor  flex left"
                >
                    <div
                        key={clusterData.name}
                        data-label={clusterData.name}
                        data-value={clusterData.id}
                        onClick={selectCluster}
                    >
                        {clusterData.name}
                    </div>
                    <TerminalIcon
                        data-testid={`cluster-terminal-${clusterData.name}`}
                        className="cursor icon-dim-16 dc__visible-hover--child ml-8"
                        onClick={() => openTerminalComponent(clusterData)}
                    />
                </div>
                <div>
                    {errorCount > 0 ? (
                        <Tippy className="default-tt w-200" arrow={false} content={clusterData.errorInNodeListing}>
                            <div className="flexbox">
                                <Error className="mt-2 mb-2 mr-8 icon-dim-18" />
                                Failed
                            </div>
                        </Tippy>
                    ) : (
                        <div className="flexbox">
                            <Success className="mt-2 mb-2 mr-8 icon-dim-18" />
                            Successful
                        </div>
                    )}
                </div>
                <div className="child-shimmer-loading">{hideDataOnLoad(clusterData.nodeCount)}</div>
                <div className="child-shimmer-loading">
                    {errorCount > 0 &&
                        hideDataOnLoad(
                            <>
                                <Error className="mr-3 icon-dim-16 dc__position-rel top-3" />
                                <span className="cr-5">{errorCount}</span>
                            </>,
                        )}
                </div>
                <div className="dc__ellipsis-right child-shimmer-loading">
                    {hideDataOnLoad(
                        <Tippy className="default-tt" arrow={false} content={clusterData.serverVersion}>
                            <span>{clusterData.serverVersion}</span>
                        </Tippy>,
                    )}
                </div>
                <div className="child-shimmer-loading">{hideDataOnLoad(clusterData.cpu?.capacity)}</div>
                <div className="child-shimmer-loading">{hideDataOnLoad(clusterData.memory?.capacity)}</div>
            </div>
        )
    }

    const renderClusterList = (): JSX.Element => {
        if (minLoader) {
            return (
                <div className="dc__overflow-scroll" style={{ height: 'calc(100vh - 112px)' }}>
                    <Progressing pageLoader />
                </div>
            )
        } else if (noResults) {
            return <ClusterNodeEmptyState actionHandler={clearSearch} />
        } else {
            return (
                <div
                    data-testid="cluster-list-container"
                    className="dc__overflow-scroll"
                    style={{ height: '100vh - 112px)' }}
                >
                    <div className="cluster-list-row fw-6 cn-7 fs-12 dc__border-bottom pt-8 pb-8 pr-20 pl-20 dc__uppercase">
                        <div>Cluster</div>
                        <div data-testid="cluster-list-connection-status">Connection status</div>
                        <div>Nodes</div>
                        <div>NODE Errors</div>
                        <div>K8S version</div>
                        <div>CPU Capacity</div>
                        <div>Memory Capacity</div>
                    </div>
                    {filteredClusterList?.map((clusterData) => renderClusterRow(clusterData))}
                </div>
            )
        }
    }

    return (
        <div>
            <div className={`cluster-list-main-container bcn-0 ${noResults ? 'no-result-container' : ''}`}>
                <div className="flexbox dc__content-space pl-20 pr-20 pt-16 pb-16">
                    {renderSearch()}
                    <div className="fs-13">
                        {minLoader
                            ? 'Syncing...'
                            : lastDataSyncTimeString && (
                                  <span>
                                      {lastDataSyncTimeString}
                                      <button
                                          data-testid="cluster-list-refresh-button"
                                          className="btn btn-link p-0 fw-6 cb-5 ml-5 fs-13"
                                          onClick={refreshData}
                                      >
                                          Refresh
                                      </button>
                                  </span>
                              )}
                    </div>
                </div>
                {renderClusterList()}
            </div>
        </div>
    )
}
