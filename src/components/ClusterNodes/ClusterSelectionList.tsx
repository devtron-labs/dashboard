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

import React, { useState, useMemo } from 'react'
import { useHistory, useLocation, Link } from 'react-router-dom'
import {
    GenericEmptyState,
    SearchBar,
    useUrlFilters,
    Tooltip,
    ClusterFiltersType,
    ClusterStatusType,
} from '@devtron-labs/devtron-fe-common-lib'
import dayjs, { Dayjs } from 'dayjs'
import { importComponentFromFELibrary } from '@Components/common'
import Timer from '@Components/common/DynamicTabs/DynamicTabs.timer'
import NoClusterEmptyState from '@Images/no-cluster-empty-state.png'
import { AddClusterButton } from '@Components/ResourceBrowser/PageHeader.buttons'
import { ReactComponent as Error } from '@Icons/ic-error-exclamation.svg'
import { ReactComponent as Success } from '@Icons/appstatus/healthy.svg'
import { ReactComponent as TerminalIcon } from '@Icons/ic-terminal-fill.svg'
import { ClusterMap, ClusterTreeMapData } from '@Pages/ResourceBrowser'
import { ClusterDetail } from './types'
import ClusterNodeEmptyState from './ClusterNodeEmptyStates'
import { ClusterSelectionType } from '../ResourceBrowser/Types'
import { AppDetailsTabs } from '../v2/appDetails/appDetails.store'
import { ALL_NAMESPACE_OPTION, K8S_EMPTY_GROUP, SIDEBAR_KEYS } from '../ResourceBrowser/Constants'
import { URLS } from '../../config'
import { ClusterStatusByFilter } from './constants'
import './clusterNodes.scss'

const KubeConfigButton = importComponentFromFELibrary('KubeConfigButton', null, 'function')
const ClusterStatusCell = importComponentFromFELibrary('ClusterStatus', null, 'function')
const ClusterFilters = importComponentFromFELibrary('ClusterFilters', null, 'function')
const CompareClusterButton = importComponentFromFELibrary('CompareClusterButton', null, 'function')

const getClusterMapData = (data: ClusterDetail[]): ClusterTreeMapData['data'] =>
    data.map(({ name, id, nodeCount, status }) => ({
        name,
        status: status as ClusterTreeMapData['data'][0]['status'],
        href: `${URLS.RESOURCE_BROWSER}/${id}/${ALL_NAMESPACE_OPTION.value}/${SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}`,
        value: nodeCount ?? 0,
    }))

const parseSearchParams = (searchParams: URLSearchParams) => ({
    clusterFilter: (searchParams.get('clusterFilter') as ClusterFiltersType) || ClusterFiltersType.ALL_CLUSTERS,
})

const ClusterSelectionList: React.FC<ClusterSelectionType> = ({
    clusterOptions,
    isSuperAdmin,
    clusterListLoader,
    initialLoading,
    refreshData,
}) => {
    const location = useLocation()
    const history = useHistory()
    const [lastSyncTime, setLastSyncTime] = useState<Dayjs>(dayjs())

    const { searchKey, clusterFilter, updateSearchParams, handleSearch, clearFilters } = useUrlFilters<
        void,
        { clusterFilter: ClusterFiltersType }
    >({ parseSearchParams })

    const filteredList = useMemo(() => {
        const loweredSearchKey = searchKey.toLowerCase()
        return clusterOptions.filter((option) => {
            const filterCondition =
                clusterFilter === ClusterFiltersType.ALL_CLUSTERS ||
                !option.status ||
                option.status === ClusterStatusByFilter[clusterFilter]

            return (!searchKey || option.name.toLowerCase().includes(loweredSearchKey)) && filterCondition
        })
    }, [searchKey, clusterOptions, `${clusterFilter}`])

    const treeMapData = useMemo<ClusterTreeMapData[]>(() => {
        const { prodClusters, nonProdClusters } = filteredList.reduce(
            (acc, curr) => {
                if (curr.status && curr.status !== ClusterStatusType.CONNECTION_FAILED) {
                    if (curr.isProd) {
                        acc.prodClusters.push(curr)
                    } else {
                        acc.nonProdClusters.push(curr)
                    }
                }

                return acc
            },
            { prodClusters: [], nonProdClusters: [] },
        )

        const productionClustersData = getClusterMapData(prodClusters)
        const nonProductionClustersData = getClusterMapData(nonProdClusters)

        return [
            ...(productionClustersData.length
                ? [
                      {
                          id: 0,
                          label: 'Production Clusters',
                          data: productionClustersData,
                      },
                  ]
                : []),
            ...(nonProductionClustersData.length
                ? [
                      {
                          id: 1,
                          label: 'Non-Production Clusters',
                          data: nonProductionClustersData,
                      },
                  ]
                : []),
        ]
    }, [filteredList])

    const handleFilterKeyPress = (value: string) => {
        handleSearch(value)
    }

    const handleRefresh = () => {
        refreshData()
        setLastSyncTime(dayjs())
    }

    const setClusterFilter = (_clusterFilter: ClusterFiltersType) => {
        updateSearchParams({ clusterFilter: _clusterFilter })
    }

    const getOpenTerminalHandler = (clusterData) => () =>
        history.push(`${location.pathname}/${clusterData.id}/all/${AppDetailsTabs.terminal}/${K8S_EMPTY_GROUP}`)

    const hideDataOnLoad = (value) => {
        if (clusterListLoader) {
            return null
        }
        return value
    }

    const renderClusterStatus = ({ errorInNodeListing, status }: ClusterDetail) => {
        if (ClusterStatusCell && status) {
            return <ClusterStatusCell status={status} />
        }

        return (
            <div className="flexbox dc__align-items-center dc__gap-8">
                {errorInNodeListing ? (
                    <>
                        <Error className="icon-dim-16 dc__no-shrink" />
                        <span>Failed</span>
                    </>
                ) : (
                    <>
                        <Success className="icon-dim-16 dc__no-shrink" />
                        <span>Connected</span>
                    </>
                )}
            </div>
        )
    }

    const renderClusterRow = (clusterData: ClusterDetail): JSX.Element => {
        const errorCount = clusterData.nodeErrors ? Object.keys(clusterData.nodeErrors).length : 0
        return (
            <div
                key={`cluster-${clusterData.id}`}
                className={`cluster-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20 hover-class dc__visible-hover dc__visible-hover--parent
                 ${clusterListLoader ? 'show-shimmer-loading' : ''}`}
            >
                <div data-testid={`cluster-row-${clusterData.name}`} className="flex left dc__overflow-hidden">
                    <Link
                        className="dc__ellipsis-right dc__no-decor lh-24"
                        to={`${URLS.RESOURCE_BROWSER}/${clusterData.id}/${ALL_NAMESPACE_OPTION.value}/${SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}`}
                    >
                        {clusterData.name}
                    </Link>
                    {/* NOTE: visible-hover plays with display prop; therefore need to set display: flex on a new div */}
                    <div className="cursor dc__visible-hover--child ml-8">
                        <div className="flexbox dc__align-items-center dc__gap-4">
                            {!!clusterData.nodeCount && !clusterListLoader && isSuperAdmin && (
                                <Tooltip alwaysShowTippyOnHover content="View terminal">
                                    <div className="flex">
                                        <TerminalIcon
                                            data-testid={`cluster-terminal-${clusterData.name}`}
                                            className="icon-dim-24 p-4 dc__no-shrink dc__hover-n100 br-4 dc__hover-color-n800 fill"
                                            onClick={getOpenTerminalHandler(clusterData)}
                                        />
                                    </div>
                                </Tooltip>
                            )}

                            {CompareClusterButton && (
                                <CompareClusterButton sourceClusterId={clusterData.id} isIconButton />
                            )}

                            {KubeConfigButton && <KubeConfigButton clusterName={clusterData.name} />}
                        </div>
                    </div>
                </div>
                <Tooltip
                    alwaysShowTippyOnHover={!!clusterData.errorInNodeListing}
                    content={clusterData.errorInNodeListing}
                >
                    {renderClusterStatus(clusterData)}
                </Tooltip>
                <div className="child-shimmer-loading">
                    {hideDataOnLoad(clusterData.isProd ? 'Production' : 'Non Production')}
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
                <div className="flexbox child-shimmer-loading">
                    {hideDataOnLoad(
                        <Tooltip content={clusterData.serverVersion}>
                            <span className="dc__truncate">{clusterData.serverVersion}</span>
                        </Tooltip>,
                    )}
                </div>
                <div className="child-shimmer-loading">{hideDataOnLoad(clusterData.cpu?.capacity)}</div>
                <div className="child-shimmer-loading">{hideDataOnLoad(clusterData.memory?.capacity)}</div>
            </div>
        )
    }

    if (!clusterOptions.length) {
        return (
            <GenericEmptyState
                image={NoClusterEmptyState}
                title="No clusters found"
                subTitle="Add a cluster to view and debug Kubernetes resources in the cluster"
                renderButton={AddClusterButton}
            />
        )
    }

    return (
        <div className="cluster-list-main-container flex-grow-1 flexbox-col bcn-0 dc__overflow-auto">
            <div className="flexbox dc__content-space pl-20 pr-20 pt-16 pb-16">
                <div className="flex dc__gap-12">
                    <SearchBar
                        initialSearchText={searchKey}
                        handleEnter={handleFilterKeyPress}
                        containerClassName="w-250-imp"
                        inputProps={{
                            placeholder: 'Search clusters',
                            autoFocus: true,
                            disabled: initialLoading,
                        }}
                    />
                    {ClusterFilters && (
                        <ClusterFilters clusterFilter={clusterFilter} setClusterFilter={setClusterFilter} />
                    )}
                </div>
                <div className="fs-13 flex">
                    {clusterListLoader ? (
                        <span className="dc__loading-dots mr-20">Syncing</span>
                    ) : (
                        <>
                            <span>
                                Last refreshed&nbsp;
                                <Timer start={lastSyncTime} />
                                &nbsp;ago
                            </span>
                            <button
                                type="button"
                                data-testid="cluster-list-refresh-button"
                                className="btn btn-link p-0 fw-6 cb-5 ml-5 fs-13"
                                onClick={handleRefresh}
                            >
                                Refresh
                            </button>
                        </>
                    )}
                </div>
            </div>
            <ClusterMap isLoading={clusterListLoader} treeMapData={treeMapData} />
            {!filteredList.length ? (
                <div className="flex-grow-1">
                    <ClusterNodeEmptyState actionHandler={clearFilters} />
                </div>
            ) : (
                <div data-testid="cluster-list-container" className="dc__overflow-scroll flexbox-col flex-grow-1">
                    <div className="cluster-list-row fw-6 cn-7 fs-12 dc__border-bottom pt-8 pb-8 pr-20 pl-20 dc__uppercase bcn-0 dc__position-sticky dc__top-0">
                        <div>Cluster</div>
                        <div data-testid="cluster-list-connection-status">Status</div>
                        <div>Type</div>
                        <div>Nodes</div>
                        <div>NODE Errors</div>
                        <div>K8S version</div>
                        <div>CPU Capacity</div>
                        <div>Memory Capacity</div>
                    </div>
                    {filteredList.map((clusterData) => renderClusterRow(clusterData))}
                </div>
            )}
        </div>
    )
}

export default ClusterSelectionList
