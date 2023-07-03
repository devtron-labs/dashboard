import React, { useState, useEffect } from 'react'
import { NavLink, useLocation, useRouteMatch, useHistory } from 'react-router-dom'
import { getClusterCapacity, getNodeList } from './clusterNodes.service'
import 'react-mde/lib/styles/css/react-mde-all.css'
import { handleUTCTime, Pagination, filterImageList, createGroupSelectList } from '../common'
import { showError, Progressing, ConditionalWrap, ErrorScreenManager } from '@devtron-labs/devtron-fe-common-lib'
import {
    ClusterCapacityType,
    ColumnMetadataType,
    TEXT_COLOR_CLASS,
    ERROR_TYPE,
    ClusterDetailsPropType,
    NodeDetail,
    ImageList,
} from './types'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { MultiValue } from 'react-select'
import { OptionType } from '../app/types'
import NodeListSearchFilter from './NodeListSearchFilter'
import { OrderBy } from '../app/list/types'
import ClusterNodeEmptyState from './ClusterNodeEmptyStates'
import Tippy from '@tippyjs/react'
import ClusterTerminal from './ClusterTerminal'
import {
    COLUMN_METADATA,
    NODE_SEARCH_TEXT,
} from './constants'
import NodeActionsMenu from './NodeActions/NodeActionsMenu'
import './clusterNodes.scss'
import { ReactComponent as TerminalIcon } from '../../assets/icons/ic-terminal-fill.svg'
import { ReactComponent as CloudIcon } from '../../assets/icons/ic-cloud.svg'
import { ReactComponent as SyncIcon } from '../../assets/icons/ic-arrows_clockwise.svg'
import * as queryString from 'query-string'
import { URLS } from '../../config'

export default function ClusterDetails({ imageList, isSuperAdmin, namespaceList, clusterId}: ClusterDetailsPropType) {
    const match = useRouteMatch()
    const location = useLocation()
    const history = useHistory()
    const [clusterDetailsLoader, setClusterDetailsLoader] = useState(false)
    const [errorResponseCode, setErrorResponseCode] = useState<number>()
    const [searchText, setSearchText] = useState('')
    const [clusterCapacityData, setClusterCapacityData] = useState<ClusterCapacityType>(null)
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState('')
    const [lastDataSync, setLastDataSync] = useState(false)
    const [collapsedErrorSection, setCollapsedErrorSection] = useState<boolean>(true)
    const defaultVersion = { label: 'K8s version: Any', value: 'K8s version: Any' }
    const [clusterErrorTitle, setClusterErrorTitle] = useState('')
    const [clusterErrorList, setClusterErrorList] = useState<
        { errorText: string; errorType: ERROR_TYPE; filterText: string[] }[]
    >([])
    const [flattenNodeList, setFlattenNodeList] = useState<object[]>([])
    const [filteredFlattenNodeList, setFilteredFlattenNodeList] = useState<object[]>([])
    const [searchedTextMap, setSearchedTextMap] = useState<Map<string, string>>(new Map())
    const [selectedVersion, setSelectedVersion] = useState<OptionType>(defaultVersion)
    const [selectedSearchTextType, setSelectedSearchTextType] = useState<string>('')
    const [sortByColumn, setSortByColumn] = useState<ColumnMetadataType>(COLUMN_METADATA[0])
    const [sortOrder, setSortOrder] = useState<string>(OrderBy.ASC)
    const [noResults, setNoResults] = useState(false)
    const [appliedColumns, setAppliedColumns] = useState<MultiValue<ColumnMetadataType>>([])
    const [fixedNodeNameColumn, setFixedNodeNameColumn] = useState(false)
   
    const [nodeListOffset, setNodeListOffset] = useState(0)
    const [showTerminal, setTerminal] = useState<boolean>(false)
    const clusterName: string = filteredFlattenNodeList[0]?.['clusterName'] || ''
    const [nodeImageList, setNodeImageList] = useState<ImageList[]>([])
    const [selectedNode, setSelectedNode] = useState<string>()
    
    const pageSize = 15

    useEffect(() => {
        if (appliedColumns.length > 0) {
            /*
          116 is standard with of every column for calculations
          65 is width of left nav
          180 is the diff of node column
          80 is the diff of status column
          */

            const appliedColumnDerivedWidth = appliedColumns.length * 116 + 65 + 180 + 80
            const windowWidth = window.innerWidth
            let clientWidth = 0
            setFixedNodeNameColumn(windowWidth < clientWidth || windowWidth < appliedColumnDerivedWidth)
        }
    }, [appliedColumns])
  
    useEffect(() => {
        const qs=queryString.parse(location.search)
        const offset=Number(qs["offset"])
        setNodeListOffset(offset||0)
    }, [location.search])

    useEffect(() => {
        if (filteredFlattenNodeList && imageList && namespaceList) {
            handleUrlChange(filteredFlattenNodeList)
        }
    }, [filteredFlattenNodeList, imageList, namespaceList])

    const getUpdatedAppliedColumn = () => {
        let isMissingColumn = false // intialized this to check if sortingFieldName is missing
        let appliedColumnsFromLocalStorage
        const sortableColumnMap = new Map<string, ColumnMetadataType>([])
        const _defaultColumns = []

        for (const metaData of COLUMN_METADATA) {
            if (metaData.isDefault) {
                _defaultColumns.push(metaData)
            }

            if (metaData.isSortingAllowed) {
                sortableColumnMap.set(metaData.value, metaData)
            }
        }

        if (typeof Storage !== 'undefined') {
            if (!localStorage.appliedColumns) {
                localStorage.appliedColumns = JSON.stringify(_defaultColumns) // in case of no appliedColumns add COLUMN_METADATA as it is in the storage
            } else {
                try {
                    appliedColumnsFromLocalStorage = JSON.parse(localStorage.appliedColumns)
                    for (const _updatedLocalMetaData of appliedColumnsFromLocalStorage as ColumnMetadataType[]) {
                        if (_updatedLocalMetaData.isSortingAllowed && !_updatedLocalMetaData.sortingFieldName) {
                            _updatedLocalMetaData.sortingFieldName = sortableColumnMap.get(
                                _updatedLocalMetaData.value,
                            ).sortingFieldName //updating column meta data when sortingFieldName is missing
                            isMissingColumn = true
                        }
                    }
                    if (isMissingColumn) {
                        localStorage.appliedColumns = JSON.stringify(appliedColumnsFromLocalStorage)
                    }
                } catch (error) {}
            }
        }
        setAppliedColumns(appliedColumnsFromLocalStorage || _defaultColumns)
    }

    useEffect(() => {
        getUpdatedAppliedColumn()
    }, [])

    const flattenObject = (ob: Object): Object => {
        let toReturn = {}
        for (let i in ob) {
            if (!ob.hasOwnProperty(i)) continue
            const currentElement = ob[i]
            if (typeof currentElement == 'object' && currentElement !== null && !Array.isArray(currentElement)) {
                let flatObject = flattenObject(currentElement)
                for (let x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) continue

                    toReturn[i + '.' + x] = flatObject[x]
                }
            } else {
                toReturn[i] = currentElement
            }
        }
        return toReturn
    }

    const getNodeListData = (): void => {
        setClusterDetailsLoader(true)
        setErrorResponseCode(null)
        Promise.all([getNodeList(clusterId), getClusterCapacity(clusterId)])
            .then((response) => {
                setLastDataSync(!lastDataSync)
                if (response[0].result) {
                    const _flattenNodeList = response[0].result.map((data) => {
                        const _flattenNodeData = flattenObject(data)
                        if (data['errors']) {
                            _flattenNodeData['errorCount'] = Object.keys(data['errors']).length
                        }
                        if (data['taints']) {
                            _flattenNodeData['taintCount'] = Object.keys(data['taints']).length
                        }
                        return _flattenNodeData
                    })
                    setFlattenNodeList(_flattenNodeList)
                }
                if (response[1].result) {
                    setClusterCapacityData(response[1].result)
                    let _errorTitle = '',
                        _errorList = [],
                        _nodeErrors = Object.keys(response[1].result.nodeErrors || {})
                    const _nodeK8sVersions = response[1].result.nodeK8sVersions || []
                    if (_nodeK8sVersions.length > 1) {
                        let diffType = '',
                            majorVersion,
                            minorVersion
                        for (const _nodeK8sVersion of _nodeK8sVersions) {
                            const elementArr = _nodeK8sVersion.split('.')
                            if (!majorVersion) {
                                majorVersion = elementArr[0]
                            }
                            if (!minorVersion) {
                                minorVersion = elementArr[1]
                            }
                            if (majorVersion !== elementArr[0]) {
                                diffType = 'Major'
                                break
                            } else if (diffType !== 'Minor' && minorVersion !== elementArr[1]) {
                                diffType = 'Minor'
                            }
                        }
                        if (diffType !== '') {
                            _errorTitle = 'Version diff'
                            _errorList.push({
                                errorText: `${diffType} version diff identified among nodes. Current versions `,
                                errorType: ERROR_TYPE.VERSION_ERROR,
                                filterText: _nodeK8sVersions,
                            })
                        }
                    }

                    if (_nodeErrors.length > 0) {
                        _errorTitle += (_errorTitle ? ', ' : '') + _nodeErrors.join(', ')
                        for ( const _nodeError of _nodeErrors) {
                            const _errorLength = response[1].result.nodeErrors[_nodeError].length
                            _errorList.push({
                                errorText: `${_nodeError} on ${
                                    _errorLength === 1 ? `${_errorLength} node` : `${_errorLength} nodes`
                                }`,
                                errorType: ERROR_TYPE.OTHER,
                                filterText: response[1].result.nodeErrors[_nodeError],
                            })
                        }
                    }
                    setClusterErrorTitle(_errorTitle)
                    setClusterErrorList(_errorList)
                }
                setClusterDetailsLoader(false)
            })
            .catch((error) => {
                showError(error)
                setErrorResponseCode(error.code)
                setClusterDetailsLoader(false)
            })
    }

    useEffect(() => {
        getNodeListData()
    }, [clusterId])

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
        const selectedNode = sortedResult.find((item) => item.name === queryParams.get('node'))
        if (selectedNode) {
            openTerminal(selectedNode)
        }
    }

    const handleFilterChanges = (): void => {
        let _flattenNodeList = []
        for (const element of flattenNodeList) {
            if (selectedVersion.value !== defaultVersion.value && element['k8sVersion'] !== selectedVersion.value) {
                continue
            }
            if (selectedSearchTextType === NODE_SEARCH_TEXT.NAME && searchedTextMap.size > 0) {
                let matchFound = false
                for (const [key] of searchedTextMap.entries()) {
                    if (element[NODE_SEARCH_TEXT.NAME].indexOf(key) >= 0) {
                        matchFound = true
                        break
                    }
                }
                if (!matchFound) {
                    continue
                }
            } else if (selectedSearchTextType === NODE_SEARCH_TEXT.LABEL) {
                let matchedLabelCount = 0
                for (let i = 0; i < element[NODE_SEARCH_TEXT.LABELS]?.length; i++) {
                    const currentLabel = element[NODE_SEARCH_TEXT.LABELS][i]
                    const matchedLabel = searchedTextMap.get(currentLabel.key)
                    if (matchedLabel === undefined || (matchedLabel !== null && currentLabel.value !== matchedLabel)) {
                        continue
                    }
                    matchedLabelCount++
                }
                if (searchedTextMap.size !== matchedLabelCount) {
                    continue
                }
            } else if (selectedSearchTextType === NODE_SEARCH_TEXT.NODE_GROUP) {
                let matchFound = false
                for (const [key] of searchedTextMap.entries()) {
                    if (element[NODE_SEARCH_TEXT.NODE_GROUP].indexOf(key) >= 0) {
                        matchFound = true
                        break
                    }
                }
                if (!matchFound) {
                    continue
                }
            }

            _flattenNodeList.push(element)
        }
        if (sortByColumn) {
            const comparatorMethod =
                sortByColumn.sortType === 'number' ? numericComparatorMethod : alphabeticalComparatorMethod
            _flattenNodeList.sort(comparatorMethod)
        }
        setFilteredFlattenNodeList(_flattenNodeList)
        setNoResults(_flattenNodeList.length === 0)
    }

    const numericComparatorMethod = (a, b) => {
        let firstValue = a[sortByColumn.sortingFieldName] || 0
        let secondValue = b[sortByColumn.sortingFieldName] || 0
        if (typeof firstValue === 'string' && firstValue.endsWith('%')) {
            firstValue = firstValue.slice(0, -1)
            secondValue = secondValue.slice(0, -1)
        }
        return sortOrder === OrderBy.ASC ? firstValue - secondValue : secondValue - firstValue
    }

    const alphabeticalComparatorMethod = (a, b) => {
        const firstValue = a[sortByColumn.sortingFieldName] || ''
        const secondValue = b[sortByColumn.sortingFieldName] || ''
        if (
            (sortOrder === OrderBy.ASC && sortByColumn.sortingFieldName !== 'createdAt') ||
            (sortOrder === OrderBy.DESC && sortByColumn.sortingFieldName === 'createdAt')
        ) {
            return firstValue.localeCompare(secondValue)
        } else {
            return secondValue.localeCompare(firstValue)
        }
    }

    const clearFilter = (): void => {
        setSearchText('')
        setSelectedSearchTextType('')
        setSearchedTextMap(new Map())
    }

    useEffect(() => {
        handleFilterChanges()
    }, [searchedTextMap, searchText, flattenNodeList, sortByColumn, sortOrder])

    const handleSortClick = (column: ColumnMetadataType): void => {
        if (sortByColumn.label === column.label) {
            setSortOrder(sortOrder === OrderBy.ASC ? OrderBy.DESC : OrderBy.ASC)
        } else {
            setSortByColumn(column)
            setSortOrder(OrderBy.ASC)
        }
    }

    const setCustomFilter = (errorType: ERROR_TYPE, filterText: string): void => {
        if (errorType === ERROR_TYPE.VERSION_ERROR) {
            const selectedVersion = `K8s version: ${filterText}`
            setSelectedVersion({ label: selectedVersion, value: selectedVersion })
        } else {
            const _searchedTextMap = new Map()
            const searchedLabelArr = filterText.split(',')
            for (const selectedVersion of searchedLabelArr) {
                const currentItem = selectedVersion.trim()
                _searchedTextMap.set(currentItem, true)
            }
            setSelectedSearchTextType('name')
            setSearchedTextMap(_searchedTextMap)
            setSearchText(filterText)
        }
    }

    const headerTerminalIcon = (): void => {
        openTerminalComponent({ name: 'autoSelectNode', k8sVersion: 'latest' })
    }

    const renderClusterError = (): JSX.Element => {
        if (clusterErrorList.length === 0) return
        return (
            <div
                className={`pl-20 pr-20 pt-12 bcr-1 dc__border-top dc__border-bottom ${
                    collapsedErrorSection ? ' pb-12 ' : ' pb-8'
                }`}
            >
                <div className={`flexbox dc__content-space ${collapsedErrorSection ? '' : ' mb-16'}`}>
                    <span
                        className="flexbox pointer"
                        onClick={(event) => {
                            setCollapsedErrorSection(!collapsedErrorSection)
                        }}
                    >
                        <Error className="mt-2 mb-2 mr-8 icon-dim-18" />
                        <span className="fw-6 fs-13 cn-9 mr-16">
                            {clusterErrorList.length === 1 ? '1 Error' : clusterErrorList.length + ' Errors in cluster'}
                        </span>
                        {collapsedErrorSection && <span className="fw-4 fs-13 cn-9">{clusterErrorTitle}</span>}
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
                        {clusterErrorList.map((error, index) => (
                            <div key={`error-${index}`} className="fw-4 fs-13 cn-9 mb-8">
                                {error.errorText}
                                {error.errorType === ERROR_TYPE.OTHER ? (
                                    <span
                                        className="cb-5 pointer"
                                        onClick={(event) => {
                                            setCustomFilter(error.errorType, error.filterText.join(','))
                                        }}
                                    >
                                        &nbsp; View nodes
                                    </span>
                                ) : (
                                    error.filterText.map((filter, index) => (
                                        <>
                                            &nbsp;
                                            {index > 0 && ', '}
                                            <span
                                                className="cb-5 pointer"
                                                onClick={(event) => {
                                                    setCustomFilter(error.errorType, filter)
                                                }}
                                            >
                                                {filter}
                                            </span>
                                        </>
                                    ))
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>
        )
    }

    const renderClusterSummary = (): JSX.Element => {
        return (
            <>
                <div className="flex dc__content-space pt-16 pb-16 pl-20 pr-20 mt-16 mb-16 ml-20 mr-20 bcn-0 br-4 en-2 bw-1">
                    <div className="flex fw-6 fs-13">
                        <div className="fw-6 fs-14 cn-9 h-20 flex cg-5">
                            <CloudIcon className="icon-dim-16 mr-4" />
                            <span data-testid="cluster_connected" className="h-20 flex">Connected</span>
                        </div>
                        {isSuperAdmin && (
                            <>
                                <span className="dc__divider ml-12 h-16"></span>
                                <div className="flex left cursor pl-12 pr-12 cb-5" onClick={headerTerminalIcon}>
                                    <TerminalIcon className="icon-dim-16 mr-4 fcb-5" />
                                    <span className="h-20">Terminal</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="fs-13 h-20">
                        {lastDataSyncTimeString && (
                            <div className="flex h-20">
                                {lastDataSyncTimeString}
                                <button
                                    className="btn flex btn-link p-0 fw-6 cb-5 ml-5 fs-13"
                                    onClick={getNodeListData}
                                >
                                    <SyncIcon className="icon-dim-16" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flexbox dc__content-space pl-20 pr-20 pb-20">
                    <div className="flexbox dc__content-space mr-16 w-50 p-16 bcn-0 br-4 en-2 bw-1">
                        <div className="mr-16 w-25">
                            <div className="dc__align-center fs-13 fw-4 cn-7">CPU Usage</div>
                            <div className="dc__align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.usagePercentage}
                            </div>
                        </div>
                        <div className="mr-16 w-25">
                            <div className="dc__align-center fs-13 fw-4 cn-7">CPU Capacity</div>
                            <div className="dc__align-center fs-24 fw-4 cn-9">{clusterCapacityData?.cpu?.capacity}</div>
                        </div>
                        <div className="mr-16 w-25">
                            <div className="dc__align-center fs-13 fw-4 cn-7">CPU Requests</div>
                            <div className="dc__align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.requestPercentage}
                            </div>
                        </div>
                        <div className="w-25">
                            <div className="dc__align-center fs-13 fw-4 cn-7">CPU Limits</div>
                            <div className="dc__align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.cpu?.limitPercentage}
                            </div>
                        </div>
                    </div>

                    <div className="flexbox dc__content-space w-50 p-16 bcn-0 br-4 en-2 bw-1">
                        <div className="mr-16 w-25">
                            <div className="dc__align-center fs-13 fw-4 cn-7">Memory Usage</div>
                            <div className="dc__align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.usagePercentage}
                            </div>
                        </div>
                        <div className="mr-16 w-25">
                            <div className="dc__align-center fs-13 fw-4 cn-7">Memory Capacity</div>
                            <div className="dc__align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.capacity}
                            </div>
                        </div>
                        <div className="mr-16 w-25">
                            <div className="dc__align-center fs-13 fw-4 cn-7">Memory Requests</div>
                            <div className="dc__align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.requestPercentage}
                            </div>
                        </div>
                        <div className="w-25">
                            <div className="dc__align-center fs-13 fw-4 cn-7">Memory Limits</div>
                            <div className="dc__align-center fs-24 fw-4 cn-9">
                                {clusterCapacityData?.memory?.limitPercentage}
                            </div>
                        </div>
                    </div>
                </div>
                {renderClusterError()}
            </>
        )
    }

    const renderSortDirection = (column: ColumnMetadataType) : JSX.Element => {
        if(column.isSortingAllowed) {
            if(sortByColumn.value === column.value) {
                return (
                    <span className={`sort-icon ${sortOrder == OrderBy.DESC ? 'desc' : '' } ml-4`}></span>
                )
            } else {
                return (
                    <span className="sort-column dc__opacity-0_5 ml-4"></span>
                )
            }
        }
    }

    const renderNodeListHeader = (column: ColumnMetadataType): JSX.Element => {
        const nodeColumnClassName = fixedNodeNameColumn ? 'bcn-0 dc__position-sticky  sticky-column dc__border-right' : ''
        return (
            <div
                className={`h-36 list-title dc__inline-block mr-16 pt-8 pb-8 ${
                    column.label === 'Node' ? `${nodeColumnClassName} w-280 pl-20` : 'w-120'
                } ${sortByColumn.value === column.value ? 'sort-by' : ''} ${sortOrder === OrderBy.DESC ? 'desc' : ''} ${
                    column.isSortingAllowed ? ' pointer' : ''
                } ${column.value === 'status' && 'w-180'}`}
                onClick={() => {
                    column.isSortingAllowed && handleSortClick(column)
                }}
            >
                <Tippy className="default-tt" arrow={false} placement="top" content={column.label}>
                    <span className="dc__inline-block dc__ellipsis-right mw-85px ">{column.label}</span>
                </Tippy>
                {renderSortDirection(column)}
            </div>
        )
    }

    const renderPercentageTippy = (nodeData: Object, column: ColumnMetadataType, children: any): JSX.Element => {
        return (
            <Tippy
                className="default-tt"
                arrow={false}
                placement="top"
                content={
                    <>
                        <span style={{ display: 'block' }}>
                            {column.value === 'cpu.usagePercentage'
                                ? `CPU Usage: ${nodeData['cpu.usage']}`
                                : `Memory Usage: ${nodeData['memory.usage']}`}
                        </span>
                        <span style={{ display: 'block' }}>
                            {column.value === 'cpu.usagePercentage'
                                ? `Allocatable CPU: ${nodeData['cpu.allocatable']}`
                                : `Allocatable Memory: ${nodeData['memory.allocatable']}`}
                        </span>
                    </>
                }
            >
                <div>{children}</div>
            </Tippy>
        )
    }

    const renderConditionalWrap = (column, nodeData) => {
        if (column.value === 'status' && nodeData['unschedulable']) {
            return (
                <span className="flex left">
                    <span>{nodeData[column.value]}</span>
                    <span className="dc__bullet mr-4 ml-4 mw-4 bcn-4"></span>
                    <span className="cr-5"> SchedulingDisabled</span>
                </span>
            )
        } else {
            if (column.value === 'k8sVersion') {
                return (
                    <Tippy className="default-tt" arrow={false} placement="top" content={nodeData[column.value]}>
                        <span className="dc__inline-block dc__ellipsis-right mw-85px ">{nodeData[column.value]}</span>
                    </Tippy>
                )
            } else {
                return nodeData[column.value]
            }
        }
    }

    const renderNodeRow = (column, nodeData) => {
        if (column.value === 'errorCount') {
            return (
                nodeData['errorCount'] > 0 && (
                    <>
                        <Error className="mr-3 icon-dim-16 dc__position-rel top-3" />
                        <span className="cr-5">{nodeData['errorCount'] || '-'}</span>
                    </>
                )
            )
        } else if (column.sortType === 'boolean') {
            return nodeData[column.value] + ''
        } else if (nodeData[column.value] !== undefined) {
            return (
                <ConditionalWrap
                    condition={column.value.indexOf('.usagePercentage') > 0}
                    wrap={(children) => renderPercentageTippy(nodeData, column, children)}
                >
                    {renderConditionalWrap(column, nodeData)}
                </ConditionalWrap>
            )
        } else {
            return '-'
        }
    }
    const renderNodeList = (nodeData: Object): JSX.Element => {
        return (
            <div
                key={nodeData['name']}
                className={`dc_width-max-content dc_min-w-100 fw-4 cn-9 fs-13 dc__border-bottom-n1 pr-20 hover-class h-44 flexbox  dc__visible-hover ${
                    isSuperAdmin ? 'dc__visible-hover--parent' : ''
                }`}
            >
                {appliedColumns.map((column) => {
                    return column.label === 'Node' ? (
                        <div
                            className={`w-280 dc__inline-flex mr-16 pl-20 pr-8 pt-12 pb-12 ${
                                fixedNodeNameColumn ? ' bcn-0 dc__position-sticky  sticky-column dc__border-right' : ''
                            }`}
                        >
                            <div className="w-100 flex left">
                                <div className="w-250 pr-4 dc__ellipsis-right">
                                    <NavLink to={`${match.url}/${nodeData[column.value]}`} >
                                        {nodeData[column.value]}
                                    </NavLink>
                                </div>
                                <NodeActionsMenu
                                    nodeData={nodeData as NodeDetail}
                                    openTerminal={openTerminalComponent}
                                    getNodeListData={getNodeListData}
                                    isSuperAdmin={isSuperAdmin}
                                />
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`dc__inline-block dc__ellipsis-right list-title mr-16 pt-12 pb-12 ${
                                column.value === 'status'
                                    ? `w-180 ${TEXT_COLOR_CLASS[nodeData['status']] || 'cn-7'}`
                                    : 'w-120'
                            }`}
                        >
                            {renderNodeRow(column, nodeData)}
                        </div>
                    )
                })}
            </div>
        )
    }
      const changePage = (pageNo: number): void => {
          let offset = pageSize * (pageNo - 1)
          setNodeListOffset(offset)
          let qs = queryString.parse(location.search)
          let keys = Object.keys(qs)
          let query = {}
          keys.forEach((key) => {
              query[key] = qs[key]
          })
          query['offset'] = offset
          let queryStr = queryString.stringify(query)
          let url = `${URLS.CLUSTER_LIST}/${clusterId}?${queryStr}`
          history.push(url)
      }
    const renderPagination = (): JSX.Element => {
        return (
            filteredFlattenNodeList.length > pageSize && (
                <Pagination
                    size={filteredFlattenNodeList.length}
                    pageSize={pageSize}
                    offset={nodeListOffset}
                    changePage={changePage}
                    isPageSizeFix={true}
                />
            )
        )
    }

    const openTerminalComponent = (nodeData) => {
        const queryParams = new URLSearchParams(location.search)
        queryParams.set('node', nodeData.name)
        history.push({
            search: queryParams.toString(),
        })
        openTerminal(nodeData)
    }

    function openTerminal(clusterData): void {
        setSelectedNode(clusterData.name)
        setNodeImageList(filterImageList(imageList, clusterData.k8sVersion))
        setTerminal(true)
    }

    const closeTerminal = (skipRedirection: boolean): void => {
        setTerminal(false)
        if (!skipRedirection) {
            history.push(match.url)
        }
    }

    if (errorResponseCode) {
        return (
            <div className="dc__loading-wrapper">
                <ErrorScreenManager code={errorResponseCode} />
            </div>
        )
    }

    if (clusterDetailsLoader) {
        return <Progressing pageLoader />
    }

    return (
        <>
            <div data-testid="cluster_name_info_page" className={`node-list dc__overflow-scroll ${showTerminal ? 'show-terminal' : ''}`}>
                {renderClusterSummary()}
                <div 
                    className={`bcn-0 pt-16 list-min-height ${noResults ? 'no-result-container' : ''} ${
                        clusterErrorList?.length ? 'with-error-bar' : ''
                    }`}
                >
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
                            searchText={searchText}
                            setSearchText={setSearchText}
                            searchedTextMap={searchedTextMap}
                            setSearchedTextMap={setSearchedTextMap}
                        />
                    </div>
                    {noResults ? (
                        <ClusterNodeEmptyState title="No matching nodes" actionHandler={clearFilter} />
                    ) : (
                        <>
                            <div className="mt-16" style={{ width: '100%', overflow: 'auto hidden' }}>
                                <div
                                    className=" fw-6 cn-7 fs-12 dc__border-bottom pr-20 dc__uppercase"
                                    style={{ width: 'max-content', minWidth: '100%' }}
                                >
                                    {appliedColumns.map((column) => renderNodeListHeader(column))}
                                </div>
                                {filteredFlattenNodeList
                                    .slice(nodeListOffset, nodeListOffset + pageSize)
                                    ?.map((nodeData) => renderNodeList(nodeData))}
                            </div>
                            {!showTerminal && renderPagination()}
                        </>
                    )}
                </div>
            </div>
            {showTerminal && selectedNode && (
                <ClusterTerminal
                    clusterId={Number(clusterId)}
                    nodeGroups={createGroupSelectList(filteredFlattenNodeList, 'name')}
                    isClusterDetailsPage={true}
                    closeTerminal={closeTerminal}
                    clusterImageList={nodeImageList}
                    namespaceList={namespaceList[clusterName]}
                    node={selectedNode}
                    setSelectedNode={setSelectedNode}
                />
            )}
        </>
    )
}
