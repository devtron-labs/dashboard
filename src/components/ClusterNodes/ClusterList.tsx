import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useHistory, useLocation } from 'react-router-dom'
import { useRouteMatch } from 'react-router'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { getClusterList, getClusterListMin } from './clusterNodes.service'
import { handleUTCTime, filterImageList, createGroupSelectList } from '../common'
import { showError, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { ClusterDetail, ClusterListType } from './types'
import PageHeader from '../common/header/PageHeader'
import { toast } from 'react-toastify'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Success } from '../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as TerminalIcon } from '../../assets/icons/ic-terminal-fill.svg'
import ClusterNodeEmptyState from './ClusterNodeEmptyStates'
import Tippy from '@tippyjs/react'
import './clusterNodes.scss'
import ClusterTerminal from './ClusterTerminal'

export default function ClusterList({ imageList, isSuperAdmin, namespaceList }: ClusterListType) {
    const match = useRouteMatch()
    const location = useLocation()
    const history = useHistory()
    const [loader, setLoader] = useState(false)
    const [minLoader, setMinLoader] = useState(false)
    const [noResults, setNoResults] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [filteredClusterList, setFilteredClusterList] = useState<ClusterDetail[]>([])
    const [clusterList, setClusterList] = useState<ClusterDetail[]>([])
    const [nodeImageList, setNodeImageList] = useState([])
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState('')
    const [lastDataSync, setLastDataSync] = useState(false)
    const [searchApplied, setSearchApplied] = useState(false)
    const [showTerminalModal, setShowTerminal] = useState(false)
    const [terminalclusterData, setTerminalCluster] = useState<ClusterDetail>()
    const completeDataLoadedRef = useRef(null)

    const getMinData = async () => {
        try {
            setMinLoader(true)
            const { result } = await getClusterListMin()
            setLastDataSync(!lastDataSync)
            if (result) {
                const sortedResult = result
                    .sort((a, b) => a['name'].localeCompare(b['name']))
                if (!completeDataLoadedRef.current) {
                    setClusterList(sortedResult)
                    setFilteredClusterList(sortedResult)
                }
            }
            setMinLoader(false)
        } catch (error) {
            showError(error)
            setMinLoader(false)
        }
    }

    const getFullData = async () => {
        try {
            setLoader(true)
            const { result } = await getClusterList()
            completeDataLoadedRef.current = true
            setLastDataSync(!lastDataSync)
            if (result) {
                const sortedResult = result.sort((a, b) => a['name'].localeCompare(b['name']))
                setClusterList(sortedResult)
                setFilteredClusterList(sortedResult)
            }
            setLoader(false)
        } catch (error) {
            showError(error)
            setLoader(false)
        }
    }

    const getData = () => {
        completeDataLoadedRef.current = false
        setClusterList([])
        setFilteredClusterList([])
        getMinData()
        getFullData()
    }

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        if (filteredClusterList && imageList && namespaceList) {
            handleUrlChange(filteredClusterList)
        }
    }, [filteredClusterList, imageList, namespaceList])

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

    const handleUrlChange = (sortedResult) => {
        const queryParams = new URLSearchParams(location.search)
        const selectedCluster = sortedResult.find(
            (item) => item.id == queryParams.get('clusterId') && item.nodeCount > 0,
        )
        if (selectedCluster) {
            openTerminal(selectedCluster)
        }
    }

    const handleFilterChanges = (_searchText: string): void => {
        const _filteredData = clusterList.filter((cluster) => cluster.name.indexOf(_searchText.toLowerCase()) >= 0)
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
                    disabled={loader}
                />
                {searchApplied && (
                    <button className="search__clear-button" type="button" onClick={clearSearch}>
                        <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                    </button>
                )}
            </div>
        )
    }

    const openTerminal = (clusterData): void => {
        setTerminalCluster(clusterData)
        setNodeImageList(filterImageList(imageList, clusterData.serverVersion))
        setShowTerminal(true)
    }

    const openTerminalComponent = (clusterData): void => {
        const queryParams = new URLSearchParams(location.search)
        queryParams.set('clusterId', clusterData.id)
        history.push({
            search: queryParams.toString(),
        })
        openTerminal(clusterData)
    }

    const closeTerminal = (skipRedirection: boolean): void => {
        setShowTerminal(false)
        if (!skipRedirection) {
            history.push(match.url)
        }
    }

    const renderClusterRow = (clusterData: ClusterDetail): JSX.Element => {
        const errorCount = clusterData.nodeErrors ? Object.keys(clusterData.nodeErrors).length : 0
        return (
            <div
                key={`cluster-${clusterData.id}`}
                className={`cluster-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20 hover-class dc__visible-hover ${
                    clusterData.nodeCount && isSuperAdmin ? 'dc__visible-hover--parent' : ''
                } ${loader ? 'show-shimmer-loading' : ''}`}
            >
                <div data-testid={`cluster-row-${clusterData.name}`} className="cb-5 dc__ellipsis-right flex left">
                    <NavLink
                        data-testid={`cluster-${clusterData.name}-link`}
                        to={`${match.url}/${clusterData.id}`}
                        onClick={(e) => {
                            handleClusterClick(e, clusterData.errorInNodeListing)
                        }}
                    >
                        {clusterData.name}
                    </NavLink>
                    <TerminalIcon
                        data-testid={`cluster-terminal-${clusterData.name}`}
                        className="cursor icon-dim-16 dc__visible-hover--child ml-8"
                        onClick={() => openTerminalComponent(clusterData)}
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
                <div className="child-shimmer-loading">{clusterData.nodeCount}</div>
                <div className="child-shimmer-loading">
                    {errorCount > 0 && (
                        <>
                            <Error className="mr-3 icon-dim-16 dc__position-rel top-3" />
                            <span className="cr-5">{errorCount}</span>
                        </>
                    )}
                </div>
                <div className="dc__ellipsis-right child-shimmer-loading">
                    <Tippy className="default-tt" arrow={false} content={clusterData.serverVersion}>
                        <span>{clusterData.serverVersion}</span>
                    </Tippy>
                </div>
                <div className="child-shimmer-loading">{clusterData.cpu?.capacity}</div>
                <div className="child-shimmer-loading">{clusterData.memory?.capacity}</div>
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
                    style={{ height: `calc(${showTerminalModal ? '50vh - 112px)' : '100vh - 112px)'}` }}
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
            <PageHeader headerName="Clusters" />
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
                                          onClick={getData}
                                      >
                                          Refresh
                                      </button>
                                  </span>
                              )}
                    </div>
                </div>
                {renderClusterList()}
            </div>
            {showTerminalModal && terminalclusterData && (
                <ClusterTerminal
                    clusterId={terminalclusterData.id}
                    clusterName={terminalclusterData.name}
                    nodeGroups={createGroupSelectList(terminalclusterData?.nodeDetails, 'nodeName')}
                    closeTerminal={closeTerminal}
                    clusterImageList={nodeImageList}
                    namespaceList={namespaceList[terminalclusterData.name]}
                />
            )}
        </div>
    )
}
