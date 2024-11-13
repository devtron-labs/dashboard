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

import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation, useRouteMatch, useHistory, useParams } from 'react-router-dom'
import * as queryString from 'query-string'
import { MultiValue } from 'react-select'
import {
    useAsync,
    abortPreviousRequests,
    showError,
    Progressing,
    ConditionalWrap,
    ErrorScreenManager,
    Pagination,
    SortableTableHeaderCell,
    SortingOrder,
    Tooltip,
    ClipboardButton,
    useResizableTableConfig,
    useBulkSelection,
    BulkOperationModalState,
    BulkSelectionEvents,
    BulkSelection,
    Checkbox,
    CHECKBOX_VALUE,
    noop,
} from '@devtron-labs/devtron-fe-common-lib'
import { getNodeList, getClusterCapacity, deleteNodeCapacity } from './clusterNodes.service'
import 'react-mde/lib/styles/css/react-mde-all.css'
import { ColumnMetadataType, TEXT_COLOR_CLASS, NodeDetail, SearchTextType } from './types'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { OptionType } from '../app/types'
import NodeListSearchFilter from './NodeListSearchFilter'
import { OrderBy } from '../app/list/types'
import ClusterNodeEmptyState from './ClusterNodeEmptyStates'
import { COLUMN_METADATA, NODE_SEARCH_TEXT } from './constants'
import NodeActionsMenu from './NodeActions/NodeActionsMenu'
import { AppDetailsTabs } from '../v2/appDetails/appDetails.store'
import { unauthorizedInfoText } from '../ResourceBrowser/ResourceList/ClusterSelector'
import { K8S_EMPTY_GROUP, SIDEBAR_KEYS, NODE_DETAILS_PAGE_SIZE_OPTIONS } from '../ResourceBrowser/Constants'
import { importComponentFromFELibrary } from '@Components/common'
import { URLParams } from '../ResourceBrowser/Types'
import './clusterNodes.scss'

const RBBulkSelectionActionWidget = importComponentFromFELibrary('RBBulkSelectionActionWidget', null, 'function')
const RBBulkOperations = importComponentFromFELibrary('RBBulkOperations', null, 'function')

export default function NodeDetailsList({ isSuperAdmin, renderRefreshBar, addTab, showStaleDataWarning, clusterName }) {
    const { clusterId, nodeType } = useParams<URLParams>()
    const match = useRouteMatch()
    const location = useLocation()
    const history = useHistory()
    const urlParams = new URLSearchParams(location.search)
    const k8sVersion = urlParams.get('k8sversion') ? decodeURIComponent(urlParams.get('k8sversion')) : ''
    const name = decodeURIComponent(urlParams.get(NODE_SEARCH_TEXT.NAME) || '')
    const label = decodeURIComponent(urlParams.get(NODE_SEARCH_TEXT.LABEL) || '')
    const group = decodeURIComponent(urlParams.get(NODE_SEARCH_TEXT.NODE_GROUP) || '')
    const [clusterDetailsLoader, setClusterDetailsLoader] = useState(false)
    const [errorResponseCode, setErrorResponseCode] = useState<number>()
    const [searchText, setSearchText] = useState(name || label || group || '')
    const defaultVersion = { label: 'K8s version: Any', value: 'K8s version: Any' }
    const [flattenNodeList, setFlattenNodeList] = useState<(NodeDetail & Record<'id', number>)[]>([])
    const [filteredFlattenNodeList, setFilteredFlattenNodeList] = useState<typeof flattenNodeList>([])
    const [selectedVersion, setSelectedVersion] = useState<OptionType>(
        k8sVersion ? { label: `K8s version: ${k8sVersion}`, value: k8sVersion } : defaultVersion,
    )

    const initialSeachType = getInitialSearchType(name, label, group)
    const [selectedSearchTextType, setSelectedSearchTextType] = useState<SearchTextType | ''>(initialSeachType)

    const [bulkOperationModalState, setBulkOperationModalState] = useState<BulkOperationModalState>('closed')

    const [sortByColumn, setSortByColumn] = useState<ColumnMetadataType>(COLUMN_METADATA[0])
    const [sortOrder, setSortOrder] = useState<string>(OrderBy.ASC)
    const [noResults, setNoResults] = useState(false)
    const [appliedColumns, setAppliedColumns] = useState<MultiValue<ColumnMetadataType>>([])
    const abortControllerRef = useRef(new AbortController())
    const nodeListRef = useRef(null)
    const { gridTemplateColumns, handleResize } = useResizableTableConfig({
        headersConfig: appliedColumns.map((column, index) => ({
            id: column.label,
            minWidth: index === 0 ? 120 : null,
            width: index === 0 ? 260 : index === 1 ? 180 : 120,
        })),
    })

    const parentRef = useRef<HTMLDivElement>()

    const [, nodeK8sVersions] = useAsync(
        () =>
            abortPreviousRequests(async () => {
                const { result } = await getClusterCapacity(clusterId, abortControllerRef.current?.signal)
                return result?.nodeK8sVersions || null
            }, abortControllerRef),
        [clusterId],
    )

    const {
        selectedIdentifiers: bulkSelectionState,
        handleBulkSelection,
        setIdentifiers,
        isBulkSelectionApplied,
        getSelectedIdentifiersCount,
    } = useBulkSelection<Record<number, (typeof filteredFlattenNodeList)[number]>>()

    function getInitialSearchType(name: string, label: string, group: string): SearchTextType | '' {
        if (name) {
            return NODE_SEARCH_TEXT.NAME
        }
        if (label) {
            return NODE_SEARCH_TEXT.LABEL
        }
        if (group) {
            return NODE_SEARCH_TEXT.NODE_GROUP
        }
        return ''
    }

    const getSearchTextMap = (searchText: string): Map<string, string> => {
        const _searchedTextMap = new Map()
        if (!searchText) {
            return _searchedTextMap
        }
        const searchedLabelArr = searchText.split(',').map((item) => item.trim())

        for (const currentItem of searchedLabelArr) {
            if (!currentItem) {
                continue
            }
            if (selectedSearchTextType === NODE_SEARCH_TEXT.LABEL) {
                const element = currentItem.split('=')
                const key = element[0] ? element[0].trim() : null
                if (!key) {
                    continue
                }
                const value = element[1] ? element[1].trim() : null
                _searchedTextMap.set(key, value)
            } else {
                _searchedTextMap.set(currentItem, true)
            }
        }
        return _searchedTextMap
    }

    const [searchedTextMap, setSearchedTextMap] = useState<Map<string, string>>(getSearchTextMap(searchText))
    const [nodeListOffset, setNodeListOffset] = useState(0)
    const [pageSize, setPageSize] = useState(NODE_DETAILS_PAGE_SIZE_OPTIONS[0].value)

    const showPaginatedView = filteredFlattenNodeList.length > pageSize

    useEffect(() => {
        const qs = queryString.parse(location.search)
        const offset = Number(qs['offset'])
        setNodeListOffset(offset || 0)
        const version = qs['k8sversion']
        if (version && typeof version === 'string' && selectedVersion.value !== version) {
            setSelectedVersion({ label: `K8s version: ${version}`, value: version })
        }
    }, [location.search])

    useEffect(() => {
        if (filteredFlattenNodeList) {
            handleUrlChange(filteredFlattenNodeList)
        }
    }, [filteredFlattenNodeList])

    useEffect(() => {
        setIdentifiers(
            (filteredFlattenNodeList?.slice(nodeListOffset, nodeListOffset + pageSize).reduce((acc, curr) => {
                acc[curr.id] = curr
                return acc
            }, {}) as Record<number, (typeof flattenNodeList)[number]>) ?? {},
        )
    }, [nodeListOffset, filteredFlattenNodeList, pageSize])


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
                            ).sortingFieldName // updating column meta data when sortingFieldName is missing
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
        const toReturn = {}
        for (const i in ob) {
            if (!ob.hasOwnProperty(i)) {
                continue
            }
            const currentElement = ob[i]
            if (typeof currentElement === 'object' && currentElement !== null && !Array.isArray(currentElement)) {
                const flatObject = flattenObject(currentElement)
                for (const x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) {
                        continue
                    }

                    toReturn[`${i}.${x}`] = flatObject[x]
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
                if (response.result) {
                    const _flattenNodeList = response.result.map((data, index) => {
                        const _flattenNodeData = flattenObject(data)
                        if (data['errors']) {
                            _flattenNodeData['errorCount'] = Object.keys(data['errors']).length
                        }
                        if (data['taints']) {
                            _flattenNodeData['taintCount'] = Object.keys(data['taints']).length
                        }
                        _flattenNodeData['id'] = index
                        return _flattenNodeData
                    })
                    setFlattenNodeList(_flattenNodeList as typeof flattenNodeList)
                }
                setClusterDetailsLoader(false)
            })
            .catch((error) => {
                if (error['code'] !== 403) {
                    showError(error)
                }
                setErrorResponseCode(error.code)
                setClusterDetailsLoader(false)
            })
    }

    useEffect(() => {
        getNodeListData()
    }, [clusterId])

    const handleClearBulkSelection = () => {
        handleBulkSelection({
            action: BulkSelectionEvents.CLEAR_ALL_SELECTIONS,
        })
    }

    const handleUrlChange = (sortedResult) => {
        const queryParams = new URLSearchParams(location.search)
        const selectedNode = sortedResult.find((item) => item.name === queryParams.get('node'))
        if (selectedNode) {
            openTerminalComponent(selectedNode)
        }
    }

    const handleFilterChanges = (): void => {
        const _flattenNodeList = []
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
        setNodeListOffset(0)
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
        }
        return secondValue.localeCompare(firstValue)
    }

    const clearFilter = (): void => {
        const qs = queryString.parse(location.search)
        const keys = Object.keys(qs)
        const query = {}
        keys.forEach((key) => {
            query[key] = qs[key]
        })
        setSearchText('')
        setSelectedSearchTextType('')
        setSearchedTextMap(new Map())
        delete query[selectedSearchTextType]
        const queryStr = queryString.stringify(query)
        history.push(`?${queryStr}`)
    }

    useEffect(() => {
        handleFilterChanges()
    }, [searchedTextMap, searchText, flattenNodeList, sortByColumn, sortOrder, selectedVersion])

    const handleSortClick = (column: ColumnMetadataType) => () => {
        if (sortByColumn.label === column.label) {
            setSortOrder(sortOrder === OrderBy.ASC ? OrderBy.DESC : OrderBy.ASC)
        } else {
            setSortByColumn(column)
            setSortOrder(OrderBy.ASC)
        }
    }

    const changePageSize = (size: number) => {
        setPageSize(size)
        setNodeListOffset(0)
    }

    const getBulkOperationModalStateSetter = (state: BulkOperationModalState) => () => {
        setBulkOperationModalState(state)
    }

    const getHandleCheckedForId = (nodeData: (typeof filteredFlattenNodeList)[number]) => () => {
        const id = nodeData.id

        if (isBulkSelectionApplied) {
            handleBulkSelection({
                action: BulkSelectionEvents.CLEAR_IDENTIFIERS_AFTER_ACROSS_SELECTION,
                data: {
                    identifierIds: [id],
                },
            })
        } else if (bulkSelectionState[id]) {
            handleBulkSelection({
                action: BulkSelectionEvents.CLEAR_IDENTIFIERS,
                data: {
                    identifierIds: [id],
                },
            })
        } else {
            handleBulkSelection({
                action: BulkSelectionEvents.SELECT_IDENTIFIER,
                data: {
                    identifierObject: {
                        ...bulkSelectionState,
                        [id]: nodeData,
                    },
                },
            })
        }
    }

    const renderNodeListHeader = (column: ColumnMetadataType): JSX.Element => (
        <div className="flexbox dc__gap-8 dc__align-items-center">
            {column.label.toUpperCase() === 'NODE' && <BulkSelection showPagination={showPaginatedView} />}
            <SortableTableHeaderCell
                key={column.label}
                id={column.label}
                isResizable
                handleResize={handleResize}
                showTippyOnTruncate
                disabled={false}
                triggerSorting={handleSortClick(column)}
                title={column.label}
                isSorted={sortByColumn.value === column.value}
                sortOrder={sortOrder === OrderBy.DESC ? SortingOrder.DESC : SortingOrder.ASC}
                isSortable={!!column.isSortingAllowed}
            />
        </div>
    )

    const getBulkOperations = () => {
        if (bulkOperationModalState === 'closed') {
            return []
        }

        const selections = (isBulkSelectionApplied ? filteredFlattenNodeList : Object.values(bulkSelectionState)) ?? []

        return selections.map((selection) => ({
            id: selection.id,
            name: selection.name,
            operation: async (signal: AbortSignal) => {
                const payload = {
                    clusterId: Number(clusterId),
                    name: selection.name,
                    version: selection.version,
                    kind: selection.kind,
                }

                await deleteNodeCapacity(payload, signal)
            }
        }))
    }

    const handleReloadDataAfterBulkDelete = () => {
        handleClearBulkSelection()
        getNodeListData()
    }

    const renderPercentageTippy = (nodeData: Object, column: ColumnMetadataType, children: any): JSX.Element => {
        return (
            <Tooltip
                alwaysShowTippyOnHover
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
            </Tooltip>
        )
    }

    const renderConditionalWrap = (column, nodeData) => {
        if (column.value === 'status' && nodeData['unschedulable']) {
            return (
                <span className="flex left">
                    <span>{nodeData[column.value]}</span>
                    <span className="dc__bullet mr-4 ml-4 mw-4 bcn-4" />
                    <span className="cr-5"> SchedulingDisabled</span>
                </span>
            )
        }
        if (column.value === 'k8sVersion') {
            return (
                <Tooltip content={nodeData[column.value]}>
                    <span className="dc__truncate">{nodeData[column.value]}</span>
                </Tooltip>
            )
        }
        return nodeData[column.value]
    }

    const renderNodeRow = (column, nodeData) => {
        if (column.value === 'errorCount') {
            return (
                nodeData['errorCount'] > 0 && (
                    <span className="flex left dc__gap-4">
                        <Error className="icon-dim-16 dc__no-shrink" />
                        <span className="cr-5 dc__truncate">{nodeData['errorCount'] || '-'}</span>
                    </span>
                )
            )
        }
        if (column.sortType === 'boolean') {
            return `${nodeData[column.value]}`
        }
        if (nodeData[column.value] !== undefined) {
            return (
                <ConditionalWrap
                    condition={column.value.indexOf('.usagePercentage') > 0}
                    wrap={(children) => renderPercentageTippy(nodeData, column, children)}
                >
                    {renderConditionalWrap(column, nodeData)}
                </ConditionalWrap>
            )
        }
        return '-'
    }

    const clusterNodeClickEvent = (nodeData, column) => {
        const url = `${match.url}/${nodeData[column.value]}`
        return () => {
            addTab(K8S_EMPTY_GROUP, nodeType, nodeData[column.value], url)
            history.push(url)
        }
    }

    const renderNodeList = (nodeData: (typeof filteredFlattenNodeList)[number]): JSX.Element => {
        return (
            <div
                key={`${nodeData.id}-${bulkSelectionState[nodeData.id]}-${isBulkSelectionApplied}`}
                ref={nodeListRef}
                className={`fw-4 cn-9 fs-13 dc__border-bottom-n1 hover-class lh-20 node-list-row dc__align-items-center dc__visible-hover ${
                    isSuperAdmin ? 'dc__visible-hover--parent' : ''
                }`}
                style={{ gridTemplateColumns }}
            >
                {appliedColumns.map((column) => {
                    return column.label === 'Node' ? (
                        <div className="flex dc__content-space dc__gap-4 left pr-8 dc__visible-hover dc__visible-hover--parent py-9">
                            <Checkbox
                                isChecked={!!bulkSelectionState[nodeData.id] || isBulkSelectionApplied}
                                onChange={getHandleCheckedForId(nodeData)}
                                rootClassName="mb-0"
                                value={CHECKBOX_VALUE.CHECKED}
                            />
                            <Tooltip content={nodeData[column.value]}>
                                <NavLink
                                    data-testid="cluster-node-link"
                                    to={`${match.url}/${nodeData[column.value]}`}
                                    onClick={clusterNodeClickEvent(nodeData, column)}
                                    className="dc__link dc__no-decor dc__truncate"
                                >
                                    {nodeData[column.value]}
                                </NavLink>
                            </Tooltip>
                            <ClipboardButton
                                content={nodeData[column.value]}
                                rootClassName="p-4 dc__visible-hover--child"
                            />
                            <NodeActionsMenu
                                nodeData={nodeData as NodeDetail}
                                openTerminal={openTerminalComponent}
                                getNodeListData={getNodeListData}
                                isSuperAdmin={isSuperAdmin}
                                addTab={addTab}
                            />
                        </div>
                    ) : (
                        <div
                            className={`py-12 ${
                                column.value === 'status' ? `${TEXT_COLOR_CLASS[nodeData['status']] || 'cn-7'}` : ''
                            }`}
                        >
                            <span className="dc__truncate">{renderNodeRow(column, nodeData)}</span>
                        </div>
                    )
                })}
            </div>
        )
    }
    const changePage = (pageNo: number): void => {
        const offset = pageSize * (pageNo - 1)
        setNodeListOffset(offset)
        const qs = queryString.parse(location.search)
        const keys = Object.keys(qs)
        const query = {}
        keys.forEach((key) => {
            query[key] = qs[key]
        })
        query['offset'] = offset
        const queryStr = queryString.stringify(query)
        const url = `${match.url}?${queryStr}`
        nodeListRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        history.push(url)
    }
    const renderPagination = (): JSX.Element => {
        return (
            showPaginatedView && (
                <Pagination
                    rootClassName="pagination-wrapper resource-browser-paginator dc__border-top flex dc__content-space px-20"
                    size={filteredFlattenNodeList.length}
                    pageSize={pageSize}
                    offset={nodeListOffset}
                    changePage={changePage}
                    changePageSize={changePageSize}
                    pageSizeOptions={NODE_DETAILS_PAGE_SIZE_OPTIONS}
                />
            )
        )
    }

    const openTerminalComponent = (nodeData) => {
        const queryParams = new URLSearchParams(location.search)
        queryParams.set('node', nodeData.name)
        const url = location.pathname
        history.push(
            `${url.split('/').slice(0, -2).join('/')}/${AppDetailsTabs.terminal}/${K8S_EMPTY_GROUP}?${queryParams.toString()}`,
        )
    }

    if (errorResponseCode) {
        return (
            <div className="dc__border-left flex">
                <ErrorScreenManager
                    code={errorResponseCode}
                    subtitle={
                        errorResponseCode == 403 ? unauthorizedInfoText(SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()) : ''
                    }
                />
            </div>
        )
    }

    return (
        <div ref={parentRef} data-testid="cluster_name_info_page" className="node-list dc__overflow-hidden dc__border-left flexbox-col">
            {typeof renderRefreshBar === 'function' && renderRefreshBar()}
            {clusterDetailsLoader ? (
                <div className="h-100">
                    <Progressing pageLoader size={32} />
                </div>
            ) : (
                <div
                    className={`bcn-0 pt-16 flex-grow-1 flexbox-col ${showStaleDataWarning ? 'sync-error' : ''} ${
                        noResults ? 'no-result-container' : ''
                    }`}
                >
                    <div className="pl-20 pr-20 dc__zi-4">
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
                            <div className="mt-16 dc__overflow-scroll h-100 w-100">
                                <div
                                    data-testid="node-status"
                                    className="fw-6 cn-7 fs-12 lh-32 dc__border-bottom dc__uppercase bcn-0 dc__position-sticky dc__top-0 node-list-row no-hover-bg dc__zi-2"
                                    style={{ gridTemplateColumns }}
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
            )}
            {RBBulkSelectionActionWidget && (getSelectedIdentifiersCount() > 0 || isBulkSelectionApplied) && (
                <RBBulkSelectionActionWidget
                    count={
                        isBulkSelectionApplied ? filteredFlattenNodeList?.length ?? 0 : getSelectedIdentifiersCount()
                    }
                    handleClearBulkSelection={handleClearBulkSelection}
                    handleOpenBulkDeleteModal={getBulkOperationModalStateSetter('delete')}
                    parentRef={parentRef}
                    showBulkRestartOption={false}
                    handleOpenRestartWorkloadModal={noop}
                />
            )}
            {RBBulkOperations && bulkOperationModalState !== 'closed' && (
                <RBBulkOperations
                    clusterName={clusterName}
                    operationType={bulkOperationModalState}
                    handleModalClose={getBulkOperationModalStateSetter('closed')}
                    handleReloadDataAfterBulkOperation={handleReloadDataAfterBulkDelete}
                    operations={getBulkOperations()}
                    resourceKind={'node'}
                />
            )}
        </div>
    )
}
