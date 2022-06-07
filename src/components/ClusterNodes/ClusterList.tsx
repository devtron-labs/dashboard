import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useRouteMatch } from 'react-router'
import './clusterNodes.scss'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { getClusterList } from './clusterNodes.service'
import { handleUTCTime, Progressing, showError } from '../common'
import { ClusterDetail, ClusterListResponse } from './types'
import PageHeader from '../common/header/PageHeader'
import { toast } from 'react-toastify'

export default function ClusterList() {
    const match = useRouteMatch()
    const [loader, setLoader] = useState(false)
    const [noResults, setNoResults] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [filteredClusterList, setFilteredClusterList] = useState<ClusterDetail[]>([])
    const [clusterList, setClusterList] = useState<ClusterDetail[]>([])
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState('')
    const [lastDataSync, setLastDataSync] = useState(false)

    const getData = () => {
        setLoader(true)
        getClusterList()
            .then((response: ClusterListResponse) => {
                setLastDataSync(!lastDataSync)
                if (response.result) {
                    setClusterList(response.result)
                    setFilteredClusterList(response.result)
                    setNoResults(response.result.length === 0)
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
        setSearchText(_searchText)
    }

    const handleClusterClick = (ev, error: string): void => {
        if (error) {
            ev.preventDefault()
            toast.error(error)
        }
    }

    const renderSearch = (): JSX.Element => {
        return (
            <form className="search position-rel margin-right-0 en-2 bw-1 br-4">
                <Search className="search__icon icon-dim-18" />
                <input
                    type="text"
                    placeholder="Search charts"
                    value={searchText}
                    className="search__input"
                    onChange={(event) => {
                        handleFilterChanges(event.target.value)
                    }}
                />
                {searchText.length > 0 && (
                    <button className="search__clear-button" type="button" onClick={(e) => handleFilterChanges('')}>
                        <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                    </button>
                )}
            </form>
        )
    }

    if (loader) {
        return <Progressing />
    }

    return (
        <>
            <PageHeader headerName="Clusters" />
            <div className="cluster-list bcn-0">
                <div className="flexbox content-space pl-20 pr-20 pt-16 pb-20">
                    {renderSearch()}
                    <div className="app-tabs-sync">
                        {lastDataSyncTimeString && (
                            <span>
                                {lastDataSyncTimeString}{' '}
                                <button className="btn btn-link p-0 fw-6 cb-5" onClick={getData}>
                                    Refresh
                                </button>
                            </span>
                        )}
                    </div>
                </div>

                <div className="" style={{ minHeight: 'calc(100vh - 125px)' }}>
                    <div className="cluster-list-row fw-6 cn-7 fs-12 border-bottom pt-8 pb-8 pr-20 pl-20 text-uppercase">
                        <div>Cluster</div>
                        <div>Status</div>
                        <div>Errors</div>
                        <div>Nodes</div>
                        <div>K8s version</div>
                        <div>CPU Capacity</div>
                        <div>Memory Capacity</div>
                    </div>
                    {noResults ? (
                        <div>No results found</div>
                    ) : (
                        filteredClusterList?.map((clusterData) => (
                            <div className="cluster-list-row fw-4 cn-9 fs-13 border-bottom-n1 pt-12 pb-12 pr-20 pl-20">
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
                                <div className="">
                                    <div
                                        className={`cluster-status br-2 mb-4 mt-4 ${
                                            clusterData.errorInNodeListing ? 'error' : 'success'
                                        }`}
                                    ></div>
                                </div>
                                <div>{clusterData.nodeErrors?.length > 0 ? clusterData.nodeErrors.length : ''}</div>
                                <div>{clusterData.nodeCount}</div>
                                <div>{clusterData.nodeK8sVersions[0]}</div>
                                <div>{clusterData.cpu?.capacity}</div>
                                <div>{clusterData.memory?.capacity}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    )
}
