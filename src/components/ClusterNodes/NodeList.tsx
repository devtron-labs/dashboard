import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useRouteMatch } from 'react-router'
import './clusterNodes.scss'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { getClusterCapacity, getNodeList } from './clusterNodes.service'
import { handleUTCTime, Progressing, showError, sortObjectArrayAlphabetically } from '../common'
import { ClusterCapacityType, NodeDetail, NodeListResponse } from './types'
import { URLS } from '../../config'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'

export default function NodeList() {
    const match = useRouteMatch()
    const [loader, setLoader] = useState(false)
    const [searchApplied, setSearchApplied] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [nodeList, setNodeList] = useState<NodeDetail[]>([])
    const [clusterCapacityData, setClusterCapacityData] = useState<ClusterCapacityType>(null)
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState('')
    const [lastDataSync, setLastDataSync] = useState(false)
    const [collapsedErrorSection, setCollapsedErrorSection] = useState<boolean>(true)

    const getData = () => {
        setLoader(true)
        getNodeList()

        Promise.all([getNodeList(), getClusterCapacity()])
            .then((response) => {
                setLastDataSync(!lastDataSync)
                if (response[0].result) {
                    setNodeList(response[0].result)
                }
                if (response[1].result) {
                    setClusterCapacityData(response[1].result)
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

    const handleFilterChanges = (selected, key): void => {}

    const renderSearch = (): JSX.Element => {
        return (
            <form
                onSubmit={(e) => handleFilterChanges(e, 'search')}
                className="search position-rel margin-right-0 en-2 bw-1 br-4"
            >
                <Search className="search__icon icon-dim-18" />
                <input
                    type="text"
                    placeholder="Search charts"
                    value={searchText}
                    className="search__input bcn-0"
                    onChange={(event) => {
                        setSearchText(event.target.value)
                    }}
                />
                {searchApplied ? (
                    <button
                        className="search__clear-button"
                        type="button"
                        onClick={(e) => handleFilterChanges(e, 'clear')}
                    >
                        <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                    </button>
                ) : null}
            </form>
        )
    }

    if (loader) {
        return <Progressing />
    }

    return (
        <div className="node-list">
            <div className="flexbox content-space pl-20 pr-20 pt-16 pb-16">
                <div className="fw-6 fs-14 cn-9">Resource allocation and usage</div>
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
            <div className="flexbox content-space pl-20 pr-20 pb-20">
                <div className="flexbox content-space mr-16 width-50 p-16 bcn-0 br-8">
                    <div className="mr-16 width-25">
                        <div className="align-center fs-13 fw-4 cn-7">CPU Usage</div>
                        <div className="align-center fs-24 fw-4 cn-9">{clusterCapacityData?.cpu?.usagePercentage}%</div>
                    </div>
                    <div className="mr-16 width-25">
                        <div className="align-center fs-13 fw-4 cn-7">CPU Capacity</div>
                        <div className="align-center fs-24 fw-4 cn-9">{clusterCapacityData?.cpu?.capacity}</div>
                    </div>
                    <div className="mr-16 width-25">
                        <div className="align-center fs-13 fw-4 cn-7">CPU Requests</div>
                        <div className="align-center fs-24 fw-4 cn-9">
                            {clusterCapacityData?.cpu?.requestPercentage}%
                        </div>
                    </div>
                    <div className="width-25">
                        <div className="align-center fs-13 fw-4 cn-7">CPU Limits</div>
                        <div className="align-center fs-24 fw-4 cn-9">{clusterCapacityData?.cpu?.limitPercentage}%</div>
                    </div>
                </div>

                <div className="flexbox content-space width-50 p-16 bcn-0 br-8">
                    <div className="mr-16 width-25">
                        <div className="align-center fs-13 fw-4 cn-7">Memory Usage</div>
                        <div className="align-center fs-24 fw-4 cn-9">
                            {clusterCapacityData?.memory?.usagePercentage}%
                        </div>
                    </div>
                    <div className="mr-16 width-25">
                        <div className="align-center fs-13 fw-4 cn-7">Memory Capacity</div>
                        <div className="align-center fs-24 fw-4 cn-9">{clusterCapacityData?.memory?.capacity}</div>
                    </div>
                    <div className="mr-16 width-25">
                        <div className="align-center fs-13 fw-4 cn-7">Memory Requests</div>
                        <div className="align-center fs-24 fw-4 cn-9">
                            {clusterCapacityData?.memory?.requestPercentage}%
                        </div>
                    </div>
                    <div className="width-25">
                        <div className="align-center fs-13 fw-4 cn-7">Memory Limits</div>
                        <div className="align-center fs-24 fw-4 cn-9">
                            {clusterCapacityData?.memory?.limitPercentage}%
                        </div>
                    </div>
                </div>
            </div>
            <div className="pl-20 pr-20 pt-18 pb-18 bcr-1 border-top border-bottom">
                <div className={`flexbox content-space ${collapsedErrorSection ? '' : ' mb-16'}`}>
                    <span className="flexbox">
                        <Info className="error-icon mt-2 mb-2 mr-8 icon-dim-18" />
                        <span className="fw-6 fs-14 cn-9 mr-16">2 Errors</span>
                        <span className="fw-4 fs-14 cn-9">Version diff, Memory pressure</span>
                    </span>
                    <Dropdown
                        className="pointer"
                        style={{ transform: collapsedErrorSection ? 'rotate(0)' : 'rotate(180deg)' }}
                        onClick={(event) => {
                            setCollapsedErrorSection(!collapsedErrorSection)
                        }}
                    />
                </div>
                {!collapsedErrorSection && (
                    <>
                        <div className="fw-4 fs-13 cn-9 mb-16">
                            Major version diff identified among nodes. Current versions 1.12.6_1546, 1.10.6_1546,
                            1.14.6_1546
                        </div>
                        <div className="fw-4 fs-13 cn-9">Memory pressure on 2 nodes. View nodes</div>
                    </>
                )}
            </div>
            <div className="bcn-0 pt-16">
                <div className="pl-20 pr-20">{renderSearch()}</div>
                <div className="mt-16 en-2 bw-1" style={{ minHeight: 'calc(100vh - 125px)' }}>
                    <div className="node-list-row fw-6 cn-7 fs-12 border-bottom pt-8 pb-8 pr-20 pl-20 text-uppercase">
                        <div>Node</div>
                        <div>Status</div>
                        <div>Role</div>
                        <div>Errors</div>
                        <div>K8s version</div>
                        <div>Pods</div>
                        <div>Taints</div>
                        <div>CPU Usage</div>
                        <div>Mem Usage</div>
                        <div>Age</div>
                    </div>
                    {nodeList?.map((nodeData) => (
                        <div className="node-list-row fw-4 cn-9 fs-13 border-bottom-n1 pt-12 pb-12 pr-20 pl-20">
                            <div className="cb-5 ellipsis-right">
                                <NavLink to={`${match.url}/${nodeData.id}${URLS.NODE_DETAILS}`}>
                                    {nodeData.name}
                                </NavLink>
                            </div>
                            <div>{nodeData.status || '-'}</div>
                            <div>{nodeData.roles || '-'}</div>
                            <div>{nodeData.errors?.length > 0 ? nodeData.errors.length : ''}</div>
                            <div>{nodeData.k8sVersion || '-'}</div>
                            <div>{nodeData.podCount || '-'}</div>
                            <div>{nodeData.taintCount || '-'}</div>
                            <div>{nodeData.cpu?.usage ? nodeData.cpu.usage + '%' : '-'}</div>
                            <div>{nodeData.memory?.usage ? nodeData.memory.usage + '%' : '-'}</div>
                            <div>{nodeData.age || '-'}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
