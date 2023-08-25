import React, { useState, useEffect } from 'react'
import { NavLink, useLocation, useRouteMatch, useHistory } from 'react-router-dom'
import { getNodeList } from './clusterNodes.service'
import 'react-mde/lib/styles/css/react-mde-all.css'
import { Pagination } from '../common'
import { showError, Progressing, ConditionalWrap, ErrorScreenManager } from '@devtron-labs/devtron-fe-common-lib'
import {
    ColumnMetadataType,
    TEXT_COLOR_CLASS,
    ERROR_TYPE,
    NodeDetail,
} from './types'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { MultiValue } from 'react-select'
import { OptionType } from '../app/types'
import NodeListSearchFilter from './NodeListSearchFilter'
import { OrderBy } from '../app/list/types'
import ClusterNodeEmptyState from './ClusterNodeEmptyStates'
import Tippy from '@tippyjs/react'
import { COLUMN_METADATA, NODE_SEARCH_TEXT } from './constants'
import NodeActionsMenu from './NodeActions/NodeActionsMenu'
import './clusterNodes.scss'
import * as queryString from 'query-string'
import { URLS } from '../../config'
import { AppDetailsTabs } from '../v2/appDetails/appDetails.store'
import { unauthorizedInfoText } from '../ResourceBrowser/ResourceList/ClusterSelector'
import { SIDEBAR_KEYS } from '../ResourceBrowser/Constants'

export default function NodeDetailsList({ isSuperAdmin, clusterId, nodeK8sVersions, renderCallBackSync, addTab, syncError}) {
    const match = useRouteMatch()
    const location = useLocation()
    const history = useHistory()
    const urlParams = new URLSearchParams(location.search)
    const k8sVersion = urlParams.get('k8sversion')
    const [clusterDetailsLoader, setClusterDetailsLoader] = useState(false)
    const [errorResponseCode, setErrorResponseCode] = useState<number>()
    const [searchText, setSearchText] = useState('')
    const [lastDataSync, setLastDataSync] = useState(false)
    const defaultVersion = { label: 'K8s version: Any', value: 'K8s version: Any' }
    const [flattenNodeList, setFlattenNodeList] = useState<object[]>([])
    const [filteredFlattenNodeList, setFilteredFlattenNodeList] = useState<object[]>([])
    const [searchedTextMap, setSearchedTextMap] = useState<Map<string, string>>(new Map())
    const [selectedVersion, setSelectedVersion] = useState<OptionType>(k8sVersion ? { label: `K8s version: ${k8sVersion}`, value: k8sVersion } : defaultVersion)
    const [selectedSearchTextType, setSelectedSearchTextType] = useState<string>('')
    const [sortByColumn, setSortByColumn] = useState<ColumnMetadataType>(COLUMN_METADATA[0])
    const [sortOrder, setSortOrder] = useState<string>(OrderBy.ASC)
    const [noResults, setNoResults] = useState(false)
    const [appliedColumns, setAppliedColumns] = useState<MultiValue<ColumnMetadataType>>([])
    const [fixedNodeNameColumn, setFixedNodeNameColumn] = useState(false)
   
    const [nodeListOffset, setNodeListOffset] = useState(0)
    
    const pageSize = 15

    useEffect(() => {
        if (appliedColumns.length > 0) {
            /*
          136 is standard with of every column for calculations
          65 is width of left nav
          160 is the diff of node column
          60 is the diff of status column
          */

            const appliedColumnDerivedWidth = appliedColumns.length * 136 + 65 + 160 + 60
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
        if (filteredFlattenNodeList) {
            handleUrlChange(filteredFlattenNodeList)
        }
    }, [filteredFlattenNodeList])

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
        getNodeList(clusterId)
            .then((response) => {
                setLastDataSync(!lastDataSync)
                if (response.result) {
                    const _flattenNodeList = response.result.map((data) => {
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
                setClusterDetailsLoader(false)
            })
            .catch((error) => {
                if(error['code'] !== 403){
                    showError(error)
                }
                setErrorResponseCode(error.code)
                setClusterDetailsLoader(false)
            })
    }

    useEffect(() => {
        getNodeListData()
    }, [clusterId])

    const handleUrlChange = (sortedResult) => {
        const queryParams = new URLSearchParams(location.search)
        const selectedNode = sortedResult.find((item) => item.name === queryParams.get('node'))
        if (selectedNode) {
            openTerminalComponent(selectedNode)
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
    }, [searchedTextMap, searchText, flattenNodeList, sortByColumn, sortOrder, selectedVersion])

    const handleSortClick = (column: ColumnMetadataType): void => {
        if (sortByColumn.label === column.label) {
            setSortOrder(sortOrder === OrderBy.ASC ? OrderBy.DESC : OrderBy.ASC)
        } else {
            setSortByColumn(column)
            setSortOrder(OrderBy.ASC)
        }
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
        const nodeColumnClassName = fixedNodeNameColumn
            ? 'bcn-0 dc__position-sticky  sticky-column dc__border-right'
            : ''
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
                                    <Tippy
                                        className="default-tt"
                                        arrow={false}
                                        placement="right"
                                        content={nodeData[column.value]}
                                    >
                                        <NavLink data-testid="cluster-node-link" to={`${match.url}/${nodeData[column.value]}`} >
                                            {nodeData[column.value]}
                                        </NavLink>
                                    </Tippy>
                                </div>
                                <NodeActionsMenu
                                    nodeData={nodeData as NodeDetail}
                                    openTerminal={openTerminalComponent}
                                    getNodeListData={getNodeListData}
                                    isSuperAdmin={isSuperAdmin}
                                    addTab={addTab}
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
        const url = location.pathname
        history.push(`${url.split('/').slice(0, -2).join('/')}/${AppDetailsTabs.terminal}?${queryParams.toString()}`)
    }


    if (errorResponseCode) {
        return (
            <div className="dc__border-left flex">
                <ErrorScreenManager code={errorResponseCode} subtitle={unauthorizedInfoText(SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase())} />
            </div>
        )
    }

    if (clusterDetailsLoader) {
        return <div className="dc__border-left"><Progressing pageLoader /></div>
    }

    return (
        <>
            <div data-testid="cluster_name_info_page" className="node-list dc__overflow-scroll dc__border-left">
            {typeof renderCallBackSync === 'function' && renderCallBackSync()}
                <div 
                    className={`bcn-0 pt-16 list-min-height ${ syncError ? 'sync-error' : ''} ${noResults ? 'no-result-container' : ''}`}
                >
                    <div className="pl-20 pr-20">
                        <NodeListSearchFilter
                            defaultVersion={defaultVersion}
                            nodeK8sVersions={nodeK8sVersions}
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
                            {renderPagination()}
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
