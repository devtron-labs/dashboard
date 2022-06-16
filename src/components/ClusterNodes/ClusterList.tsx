import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useRouteMatch } from 'react-router'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { getClusterList } from './clusterNodes.service'
import { handleUTCTime, Progressing, showError } from '../common'
import { ClusterDetail, ClusterListResponse } from './types'
import PageHeader from '../common/header/PageHeader'
import { toast } from 'react-toastify'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Success } from '../../assets/icons/appstatus/healthy.svg'
import ClusterNodeEmptyState from './ClusterNodeEmptyStates'
import Tippy from '@tippyjs/react'
import './clusterNodes.scss'

export default function ClusterList() {
    const match = useRouteMatch()
    const [loader, setLoader] = useState(false)
    const [noResults, setNoResults] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [filteredClusterList, setFilteredClusterList] = useState<ClusterDetail[]>([])
    const [clusterList, setClusterList] = useState<ClusterDetail[]>([])
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState('')
    const [lastDataSync, setLastDataSync] = useState(false)
    const [searchApplied, setSearchApplied] = useState(false)

    const getData = () => {
        setLoader(true)
        getClusterList()
            .then((response: ClusterListResponse) => {
                setLastDataSync(!lastDataSync)
                if (response.result) {
                    const sortedResult = response.result.sort((a, b) => a['name'].localeCompare(b['name']))
                    setClusterList(sortedResult)
                    setFilteredClusterList(sortedResult)
                }
                setLoader(false)
            })
            .catch((error) => {
                showError(error)
                setLoader(false)
            })
    }

    useEffect(() => {
        getData()
    }, [])

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
        const _filteredData = clusterList.filter((cluster) => cluster.name.indexOf(_searchText) >= 0)
        setFilteredClusterList(_filteredData)
        setNoResults(_filteredData.length === 0)
    }

    const handleClusterClick = (ev, error: string): void => {
        if (error) {
            ev.preventDefault()
            toast.error(error)
        }
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
            <div className="search position-rel margin-right-0 en-2 bw-1 br-4 h-32">
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
                />
                {searchApplied && (
                    <button className="search__clear-button" type="button" onClick={clearSearch}>
                        <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                    </button>
                )}
            </div>
        )
    }

    if (loader) {
        return <Progressing pageLoader />
    }

    return (
        <>
            <PageHeader headerName="Clusters" />
            <div className={`cluster-list bcn-0 ${noResults ? 'no-result-container' : ''}`}>
                <div className="flexbox content-space pl-20 pr-20 pt-16 pb-16">
                    {renderSearch()}
                    <div className="fs-13">
                        {lastDataSyncTimeString && (
                            <span>
                                {lastDataSyncTimeString}{' '}
                                <button className="btn btn-link p-0 fw-6 cb-5 ml-5 fs-13" onClick={getData}>
                                    Refresh
                                </button>
                            </span>
                        )}
                    </div>
                </div>
                {noResults ? (
                    <ClusterNodeEmptyState actionHandler={clearSearch} />
                ) : (
                    <div style={{ minHeight: 'calc(100vh - 125px)' }}>
                        <div className="cluster-list-row fw-6 cn-7 fs-12 border-bottom pt-8 pb-8 pr-20 pl-20 text-uppercase">
                            <div>Cluster</div>
                            <div>Connection status</div>
                            <div>Nodes</div>
                            <div>NODE Errors</div>
                            <div>K8S version</div>
                            <div>CPU Capacity</div>
                            <div>Memory Capacity</div>
                        </div>
                        {filteredClusterList?.map((clusterData) => {
                            const errorCount = clusterData.nodeErrors ? Object.keys(clusterData.nodeErrors).length : 0
                            return (
                                <div className="cluster-list-row fw-4 cn-9 fs-13 border-bottom-n1 pt-12 pb-12 pr-20 pl-20 hover-class">
                                    <div className="cb-5 ellipsis-right">
                                        <NavLink
                                            to={`${match.url}/${clusterData.id}`}
                                            onClick={(e) => {
                                                handleClusterClick(e, clusterData.errorInNodeListing)
                                            }}
                                        >
                                            {clusterData.name}
                                        </NavLink>
                                    </div>
                                    <div>
                                        {clusterData.errorInNodeListing ? (
                                            <Tippy
                                                className="default-tt w-200"
                                                arrow={false}
                                                content={clusterData.errorInNodeListing}
                                            >
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
                                    <div>{clusterData.nodeCount}</div>
                                    <div>
                                        {errorCount > 0 && (
                                            <>
                                                <Error className="mr-3 icon-dim-16 position-rel top-3" />
                                                <span className="cr-5">{errorCount}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="ellipsis-right">
                                        <Tippy
                                            className="default-tt w-200"
                                            arrow={false}
                                            content={clusterData.nodeK8sVersions?.[0]}
                                        >
                                            <span>{clusterData.nodeK8sVersions?.[0]}</span>
                                        </Tippy>
                                    </div>
                                    <div>{clusterData.cpu?.capacity}</div>
                                    <div>{clusterData.memory?.capacity}</div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </>
    )
}
