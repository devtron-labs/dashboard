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

import React, { useState, useEffect } from 'react'
import { useHistory, useLocation, Link } from 'react-router-dom'
import { Progressing, SearchBar } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { handleUTCTime } from '../common'
import { ClusterDetail } from './types'
import ClusterNodeEmptyState from './ClusterNodeEmptyStates'
import { ClusterSelectionType } from '../ResourceBrowser/Types'
import { AppDetailsTabs } from '../v2/appDetails/appDetails.store'
import { ALL_NAMESPACE_OPTION, K8S_EMPTY_GROUP, SIDEBAR_KEYS } from '../ResourceBrowser/Constants'
import './clusterNodes.scss'
import { DEFAULT_CLUSTER_ID } from '../cluster/cluster.type'
import { URLS } from '../../config'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Success } from '../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as TerminalIcon } from '../../assets/icons/ic-terminal-fill.svg'

const ClusterSelectionList: React.FC<ClusterSelectionType> = ({
    clusterOptions,
    isSuperAdmin,
    clusterListLoader,
    refreshData,
}) => {
    const location = useLocation()
    const history = useHistory()
    const [minLoader, setMinLoader] = useState(true)
    const [searchText, setSearchText] = useState('')
    const [filteredClusterList, setFilteredClusterList] = useState<ClusterDetail[]>([])
    const [clusterList, setClusterList] = useState<ClusterDetail[]>([])
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState('')
    const [lastDataSync, setLastDataSync] = useState(false)
    const [searchApplied, setSearchApplied] = useState(false)

    const noResults = searchApplied && filteredClusterList.length === 0

    useEffect(() => {
        let filteredClusterOptions = clusterOptions
        if (window._env_.HIDE_DEFAULT_CLUSTER) {
            filteredClusterOptions = clusterOptions.filter((item) => item.id !== DEFAULT_CLUSTER_ID)
        }
        setClusterList([])
        setFilteredClusterList([])
        setLastDataSync(!lastDataSync)
        setClusterList(filteredClusterOptions)
        setFilteredClusterList(filteredClusterOptions)
        setMinLoader(false)
    }, [clusterOptions])

    useEffect(() => {
        const _lastDataSyncTime = Date()
        setLastDataSyncTimeString(`Last refreshed ${handleUTCTime(_lastDataSyncTime, true)}`)
        const interval = setInterval(() => {
            setLastDataSyncTimeString(`Last refreshed ${handleUTCTime(_lastDataSyncTime, true)}`)
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    }, [lastDataSync])

    const handleFilterChanges = (_searchText: string): void => {
        const _filteredData = clusterList.filter((cluster) => cluster.name.indexOf(_searchText.toLowerCase()) >= 0)
        setFilteredClusterList(_filteredData)
    }

    const clearSearch = (): void => {
        if (searchApplied) {
            handleFilterChanges('')
            setSearchApplied(false)
        }
        setSearchText('')
    }

    const handleFilterKeyPress = (value): void => {
        handleFilterChanges(value)
        setSearchApplied(true)
    }

    const handleSearchChange = (value): void => {
        setSearchText(value.trim())
    }

    const renderSearch = (): JSX.Element => {
        return (
            <SearchBar
                initialSearchText={searchText}
                handleSearchChange={handleSearchChange}
                handleEnter={handleFilterKeyPress}
                containerClassName="w-250-imp"
                inputProps={{
                    placeholder: 'Search clusters',
                    autoFocus: true,
                    disabled: minLoader,
                }}
            />
        )
    }

    const getOpenTerminalHandler = (clusterData) => () =>
        history.push(`${location.pathname}/${clusterData.id}/all/${AppDetailsTabs.terminal}/${K8S_EMPTY_GROUP}`)

    const hideDataOnLoad = (value) => {
        if (clusterListLoader) {
            return null
        }
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
                <div data-testid={`cluster-row-${clusterData.name}`} className="flex left dc__overflow-hidden">
                    <Link
                        className="dc__ellipsis-right dc__no-decor"
                        to={`${URLS.RESOURCE_BROWSER}/${clusterData.id}/${ALL_NAMESPACE_OPTION.value}/${SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}`}
                    >
                        {clusterData.name}
                    </Link>
                    <TerminalIcon
                        data-testid={`cluster-terminal-${clusterData.name}`}
                        className="cursor icon-dim-16 dc__visible-hover--child ml-8"
                        onClick={getOpenTerminalHandler(clusterData)}
                    />
                </div>
                <div>
                    {clusterData.errorInNodeListing ? (
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
        }
        return (
            <div
                data-testid="cluster-list-container"
                className="dc__overflow-scroll flexbox-col"
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
                {noResults ? (
                    <div className="flex-grow-1">
                        <ClusterNodeEmptyState actionHandler={clearSearch} />
                    </div>
                ) : (
                    filteredClusterList?.map((clusterData) => renderClusterRow(clusterData))
                )}
            </div>
        )
    }

    return (
        <div>
            <div className={`cluster-list-main-container flexbox-col bcn-0 ${noResults ? 'no-result-container' : ''}`}>
                <div className="flexbox dc__content-space pl-20 pr-20 pt-16 pb-16">
                    {renderSearch()}
                    <div className="fs-13">
                        {minLoader
                            ? 'Syncing...'
                            : lastDataSyncTimeString && (
                                  <span>
                                      {lastDataSyncTimeString}
                                      <button
                                          type="button"
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

export default ClusterSelectionList
