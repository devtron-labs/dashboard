import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useRouteMatch, useParams, useHistory } from 'react-router'
import './clusterNodes.scss'
import { getClusterCapacity, getNodeList, getClusterList } from './clusterNodes.service'
import { BreadCrumb, handleUTCTime, Progressing, showError, useBreadcrumb } from '../common'
import { ClusterCapacityType, ClusterListResponse } from './types'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import PageHeader from '../common/header/PageHeader'
import ReactSelect, { MultiValue } from 'react-select'
import { appSelectorStyle, DropdownIndicator } from '../AppSelector/AppSelectorUtil'
import { OptionType } from '../app/types'
import NodeListSearchFilter from './NodeListSearchFliter'

export default function NodeList() {
    const match = useRouteMatch()
    const history = useHistory()
    const [loader, setLoader] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [clusterCapacityData, setClusterCapacityData] = useState<ClusterCapacityType>(null)
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState('')
    const [lastDataSync, setLastDataSync] = useState(false)
    const [collapsedErrorSection, setCollapsedErrorSection] = useState<boolean>(true)
    const { clusterId } = useParams<{ clusterId: string }>()
    const [clusterList, setClusterList] = useState<OptionType[]>([])
    const [selectedCluster, setSelectedCluster] = useState<OptionType>({
        label: '',
        value: '',
    })
    const defaultVersion = { label: 'K8s version: Any', value: 'K8s version: Any' }
    const [appliedColumns, setAppliedColumns] = useState<MultiValue<OptionType>>([])
    const [clusterErrorTitle, setClusterErrorTitle] = useState('')
    const [clusterErrorList, setClusterErrorList] = useState<string[]>([])
    const [flattenNodeList, setFlattenNodeList] = useState<object[]>([])
    const [filteredFlattenNodeList, setFilteredFlattenNodeList] = useState<object[]>([])
    const [searchedLabelMap, setSearchedLabelMap] = useState<Map<string, string>>(new Map())
    const [selectedVersion, setSelectedVersion] = useState<OptionType>(defaultVersion)
    const [selectedSearchTextType, setSelectedSearchTextType] = useState<string>('')

    const flattenObject = (ob: Object): Object => {
        var toReturn = {}

        for (var i in ob) {
            if (!ob.hasOwnProperty(i)) continue

            if (typeof ob[i] == 'object' && ob[i] !== null && !Array.isArray(ob[i])) {
                var flatObject = flattenObject(ob[i])
                for (var x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) continue

                    toReturn[i + '.' + x] = flatObject[x]
                }
            } else {
                toReturn[i] = ob[i]
            }
        }
        return toReturn
    }

    const getNodeListData = () => {
        setLoader(true)
        Promise.all([getNodeList(clusterId), getClusterCapacity(clusterId)])
            .then((response) => {
                setLastDataSync(!lastDataSync)
                if (response[0].result) {
                    const _flattenNodeList = response[0].result.map((data) => flattenObject(data))
                    setFlattenNodeList(_flattenNodeList)
                }
                if (response[1].result) {
                    setClusterCapacityData(response[1].result)
                    let _errorTitle,
                        _errorList = [],
                        _nodeErrors = Object.keys(response[1].result.nodeErrors || {})

                    if (response[1].result.nodeK8sVersions.length > 1) {
                        _errorTitle = 'Version diff'
                        _errorList.push(
                            'Major version diff identified among nodes. Current versions ' +
                                response[1].result.nodeK8sVersions,
                        )
                    }

                    if (_nodeErrors.length > 0) {
                        _errorTitle = _errorTitle ? ', ' : '' + _nodeErrors
                        for (let i = 0; i < _nodeErrors.length; i++) {
                            const _errorLength = response[1].result.nodeErrors[_nodeErrors[i]].length
                            _errorList.push(
                                `${_nodeErrors[i]} on ${
                                    _errorLength === 1 ? `${_errorLength} node` : `${_errorLength} nodes`
                                }`,
                            )
                        }
                    }
                    setClusterErrorTitle(_errorTitle)
                    setClusterErrorList(_errorList)
                }
                setLoader(false)
            })
            .catch((error) => {
                showError(error)
                setLoader(false)
            })
    }

    useEffect(() => {
        getNodeListData()
    }, [clusterId])

    useEffect(() => {
        getClusterList()
            .then((response: ClusterListResponse) => {
                setLastDataSync(!lastDataSync)
                if (response.result) {
                    const optionList = response.result
                        .filter((cluster) => !cluster.errorInNodeListing)
                        .map((cluster) => {
                            const _clusterId = cluster.id.toString()
                            if (_clusterId === clusterId) {
                                setSelectedCluster({
                                    label: cluster.name,
                                    value: _clusterId,
                                })
                            }
                            return {
                                label: cluster.name,
                                value: _clusterId,
                            }
                        })
                    setClusterList(optionList)
                }
            })
            .catch((error) => {
                showError(error)
            })
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

    const handleFilterChanges = (): void => {
        const _flattenNodeList = []
        for (let index = 0; index < flattenNodeList.length; index++) {
            const element = flattenNodeList[index]
            if (selectedVersion.value !== defaultVersion.value && element['k8sVersion'] !== selectedVersion.value) {
                continue
            }
            if (selectedSearchTextType === 'name' && element['name'].indexOf(searchText) === -1) {
                continue
            } else if (selectedSearchTextType === 'label') {
                let matchedLabelCount = 0
                for (let i = 0; i < element['labels']?.length; i++) {
                    const currentLabel = element['labels'][i]
                    const matchedLabel = searchedLabelMap.get(currentLabel.key)
                    if (matchedLabel === undefined || (matchedLabel !== null && currentLabel.value !== matchedLabel)) {
                        continue
                    }
                    matchedLabelCount++
                }
                if (searchedLabelMap.size !== matchedLabelCount) {
                    continue
                }
            }
            _flattenNodeList.push(element)
        }
        setFilteredFlattenNodeList(_flattenNodeList)
    }

    useEffect(() => {
        handleFilterChanges()
    }, [searchedLabelMap, searchText, flattenNodeList])

    const onClusterChange = (selectedValue: OptionType): void => {
        setSelectedCluster(selectedValue)
        const currentUrl = match.url.replace(clusterId, selectedValue.value)
        history.push(currentUrl)
    }

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                clusters: {
                    component: 'Clusters',
                    linked: true,
                },
                ':clusterId': {
                    component: (
                        <ReactSelect
                            options={clusterList}
                            onChange={onClusterChange}
                            components={{
                                IndicatorSeparator: null,
                                DropdownIndicator,
                            }}
                            value={selectedCluster}
                            styles={appSelectorStyle}
                        />
                    ),
                    linked: false,
                },
            },
        },
        [clusterId, clusterList],
    )

    const renderBreadcrumbs = (): JSX.Element => {
        return <BreadCrumb breadcrumbs={breadcrumbs} />
    }

    if (loader) {
        return <Progressing />
    }

    return (
        <>
            <PageHeader breadCrumbs={renderBreadcrumbs} isBreadcrumbs={true} />
            <div className="node-list">
                <div className="flexbox content-space pl-20 pr-20 pt-16 pb-16">
                    <div className="fw-6 fs-14 cn-9">Resource allocation and usage</div>
                    <div className="app-tabs-sync">
                        {lastDataSyncTimeString && (
                            <span>
                                {lastDataSyncTimeString}{' '}
                                <button className="btn btn-link p-0 fw-6 cb-5" onClick={getNodeListData}>
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
                            <div className="align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.usagePercentage}
                            </div>
                        </div>
                        <div className="mr-16 width-25">
                            <div className="align-center fs-13 fw-4 cn-7">CPU Capacity</div>
                            <div className="align-center fs-24 fw-4 cn-9">{clusterCapacityData?.cpu?.capacity}</div>
                        </div>
                        <div className="mr-16 width-25">
                            <div className="align-center fs-13 fw-4 cn-7">CPU Requests</div>
                            <div className="align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.requestPercentage}
                            </div>
                        </div>
                        <div className="width-25">
                            <div className="align-center fs-13 fw-4 cn-7">CPU Limits</div>
                            <div className="align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.limitPercentage}
                            </div>
                        </div>
                    </div>

                    <div className="flexbox content-space width-50 p-16 bcn-0 br-8">
                        <div className="mr-16 width-25">
                            <div className="align-center fs-13 fw-4 cn-7">Memory Usage</div>
                            <div className="align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.usagePercentage}
                            </div>
                        </div>
                        <div className="mr-16 width-25">
                            <div className="align-center fs-13 fw-4 cn-7">Memory Capacity</div>
                            <div className="align-center fs-24 fw-4 cn-9">{clusterCapacityData?.memory?.capacity}</div>
                        </div>
                        <div className="mr-16 width-25">
                            <div className="align-center fs-13 fw-4 cn-7">Memory Requests</div>
                            <div className="align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.requestPercentage}
                            </div>
                        </div>
                        <div className="width-25">
                            <div className="align-center fs-13 fw-4 cn-7">Memory Limits</div>
                            <div className="align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.limitPercentage}
                            </div>
                        </div>
                    </div>
                </div>
                {clusterErrorList.length > 0 && (
                    <div className="pl-20 pr-20 pt-18 pb-18 bcr-1 border-top border-bottom">
                        <div className={`flexbox content-space ${collapsedErrorSection ? '' : ' mb-16'}`}>
                            <span
                                className="flexbox pointer"
                                onClick={(event) => {
                                    setCollapsedErrorSection(!collapsedErrorSection)
                                }}
                            >
                                <Info className="error-icon mt-2 mb-2 mr-8 icon-dim-18" />
                                <span className="fw-6 fs-14 cn-9 mr-16">
                                    {clusterErrorList.length === 1 ? '1 Error' : clusterErrorList.length + ' Errors'}
                                </span>
                                {collapsedErrorSection && <span className="fw-4 fs-14 cn-9">{clusterErrorTitle}</span>}
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
                                {clusterErrorList.map((error) => (
                                    <div className="fw-4 fs-13 cn-9 mb-16">{error}</div>
                                ))}
                                {/* <div className="fw-4 fs-13 cn-9 mb-16">
                                    Major version diff identified among nodes. Current versions{' '}
                                    {clusterCapacityData?.nodeK8sVersions}
                                </div>
                                <div className="fw-4 fs-13 cn-9">Memory pressure on 2 nodes.</div> */}
                            </>
                        )}
                    </div>
                )}
                <div className="bcn-0 pt-16">
                    <div className="pl-20 pr-20">
                        <NodeListSearchFilter
                            defaultVersion={defaultVersion}
                            nodeK8sVersions={clusterCapacityData?.nodeK8sVersions}
                            selectedVersion={selectedVersion}
                            setSelectedVersion={setSelectedVersion}
                            appliedColumns={appliedColumns}
                            setAppliedColumns={setAppliedColumns}
                            selectedSearchTextType={selectedSearchTextType}
                            setSelectedSearchTextType={setSelectedSearchTextType}
                            setSearchText={setSearchText}
                            searchedLabelMap={searchedLabelMap}
                            setSearchedLabelMap={setSearchedLabelMap}
                        />
                    </div>
                    <div
                        className="mt-16 en-2 bw-1"
                        style={{ minHeight: 'calc(100vh - 125px)', width: '100%', overflow: 'auto' }}
                    >
                        <div
                            className=" fw-6 cn-7 fs-12 border-bottom pt-8 pb-8 pr-20 text-uppercase"
                            style={{ width: 'max-content', minWidth: '100%' }}
                        >
                            {appliedColumns.map((columnName) => (
                                <div
                                    className={` inline-block ellipsis-right mr-16 ${
                                        columnName.label === 'Node'
                                            ? 'w-280 pl-20 bcn-0 position-sticky left-0'
                                            : 'w-100-px'
                                    }`}
                                >
                                    {columnName.label}
                                </div>
                            ))}
                        </div>
                        {filteredFlattenNodeList?.map((nodeData) => (
                            <div
                                className="fw-4 cn-9 fs-13 border-bottom-n1 pt-12 pb-12 pr-20"
                                style={{ width: 'max-content', minWidth: '100%' }}
                            >
                                {appliedColumns.map((columnName) => {
                                    return columnName.label === 'Node' ? (
                                        <div className="w-280 inline-block ellipsis-right mr-16 pl-20 bcn-0 position-sticky left-0">
                                            <NavLink to={`${match.url}/${nodeData[columnName.value]}`}>
                                                {nodeData[columnName.value]}
                                            </NavLink>
                                        </div>
                                    ) : (
                                        <div className="w-100-px inline-block ellipsis-right mr-16">
                                            {nodeData[columnName.value] || '-'}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
