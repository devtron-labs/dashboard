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

import { useEffect, useMemo, useRef, useState } from 'react'
import { useHistory, useParams, useRouteMatch, useLocation } from 'react-router-dom'
import DOMPurify from 'dompurify'
import {
    ConditionalWrap,
    Progressing,
    useAsync,
    abortPreviousRequests,
    highlightSearchText,
    Pagination,
    useSearchString,
    Nodes,
    getIsRequestAborted,
    noop,
    SortableTableHeaderCell,
    useStateFilters,
    ClipboardButton,
    Tooltip,
    useResizableTableConfig,
    BulkSelection,
    useBulkSelection,
    BulkOperationModalState,
    BulkSelectionEvents,
    Checkbox,
    CHECKBOX_VALUE,
    BulkOperationModalProps,
    GVKType,
} from '@devtron-labs/devtron-fe-common-lib'
import WebWorker from '../../app/WebWorker'
import searchWorker from '../../../config/searchWorker'
import { importComponentFromFELibrary } from '../../common/helpers/Helpers'
import ResourceBrowserActionMenu from './ResourceBrowserActionMenu'
import {
    ALL_NAMESPACE_OPTION,
    K8S_EMPTY_GROUP,
    RESOURCE_EMPTY_PAGE_STATE,
    RESOURCE_LIST_EMPTY_STATE,
    RESOURCE_PAGE_SIZE_OPTIONS,
    SIDEBAR_KEYS,
    SEARCH_QUERY_PARAM_KEY,
    DEFAULT_K8SLIST_PAGE_SIZE,
} from '../Constants'
import { deleteResource, getResourceList, getResourceListPayload, restartWorkload } from '../ResourceBrowser.service'
import {
    K8SResourceListType,
    ResourceDetailDataType,
    ResourceDetailType,
    ResourceListPayloadType,
    URLParams,
} from '../Types'
import ResourceListEmptyState from './ResourceListEmptyState'
import { EventList } from './EventList'
import ResourceFilterOptions from './ResourceFilterOptions'
import {
    getScrollableResourceClass,
    sortEventListData,
    removeDefaultForStorageClass,
    updateQueryString,
    getRenderNodeButton,
    renderResourceValue,
} from '../Utils'
import { URLS } from '../../../config'
import { getPodRestartRBACPayload } from '../../v2/appDetails/k8Resource/nodeDetail/nodeDetail.api'

const PodRestartIcon = importComponentFromFELibrary('PodRestartIcon')
const PodRestart = importComponentFromFELibrary('PodRestart')
const getFilterOptionsFromSearchParams = importComponentFromFELibrary(
    'getFilterOptionsFromSearchParams',
    null,
    'function',
)

const RBBulkSelectionActionWidget = importComponentFromFELibrary('RBBulkSelectionActionWidget', null, 'function')
const RBBulkOperations = importComponentFromFELibrary('RBBulkOperations', null, 'function')

export const K8SResourceList = ({
    selectedResource,
    selectedCluster,
    addTab,
    renderRefreshBar,
    isOpen,
    showStaleDataWarning,
    updateK8sResourceTab,
    clusterName,
}: K8SResourceListType) => {
    // HOOKS
    const { searchParams } = useSearchString()
    const { push, replace } = useHistory()
    const { url } = useRouteMatch()
    const location = useLocation()
    const { clusterId, nodeType, group } = useParams<URLParams>()

    // STATES
    const [selectedNamespace, setSelectedNamespace] = useState(ALL_NAMESPACE_OPTION)
    const [resourceListOffset, setResourceListOffset] = useState(0)
    const [pageSize, setPageSize] = useState(DEFAULT_K8SLIST_PAGE_SIZE)
    const [filteredResourceList, setFilteredResourceList] = useState<ResourceDetailType['data']>(null)
    const [bulkOperationModalState, setBulkOperationModalState] = useState<BulkOperationModalState>('closed')

    // REFS
    const resourceListRef = useRef<HTMLDivElement>(null)
    const searchWorkerRef = useRef(null)
    const abortControllerRef = useRef(new AbortController())
    const parentRef = useRef<HTMLDivElement>(null)

    const searchText = searchParams[SEARCH_QUERY_PARAM_KEY] || ''

    const isEventList = selectedResource?.gvk.Kind === SIDEBAR_KEYS.eventGVK.Kind

    /* NOTE: _filters is an object */
    const _filters = getFilterOptionsFromSearchParams?.(location.search)
    const filters = useMemo(() => _filters, [JSON.stringify(_filters)])

    const {
        selectedIdentifiers: bulkSelectionState,
        handleBulkSelection,
        setIdentifiers,
        isBulkSelectionApplied,
        getSelectedIdentifiersCount,
    } = useBulkSelection<Record<number, ResourceDetailDataType>>()

    const [resourceListLoader, _resourceList, _resourceListDataError, reloadResourceListData] = useAsync(
        () =>
            abortPreviousRequests(
                () =>
                    getResourceList(
                        getResourceListPayload(
                            clusterId,
                            selectedNamespace.value.toLowerCase(),
                            selectedResource,
                            filters,
                        ),
                        abortControllerRef.current.signal,
                    ),
                abortControllerRef,
            ),
        [selectedResource, clusterId, selectedNamespace, filters],
        selectedResource && selectedResource.gvk.Kind !== SIDEBAR_KEYS.nodeGVK.Kind,
    )

    const resourceListDataError = getIsRequestAborted(_resourceListDataError) ? null : _resourceListDataError

    const resourceList = useMemo(() => {
        if (!_resourceList) {
            return null
        }
        const result = structuredClone(_resourceList.result)
        switch (selectedResource?.gvk.Kind) {
            case SIDEBAR_KEYS.eventGVK.Kind:
                result.data = sortEventListData(result.data)
                break
            case Nodes.StorageClass:
                result.data = removeDefaultForStorageClass(result.data)
                break
            default:
                break
        }
        result.data = result.data.map((data, index) => ({ id: index, ...data }))
        return result
    }, [_resourceList])

    const { gridTemplateColumns, handleResize } = useResizableTableConfig({
        headersConfig: (resourceList?.headers ?? []).map((columnName, index) => ({
            id: columnName,
            minWidth: index === 0 ? 120 : null,
            width: index === 0 ? 350 : 180,
        })),
    })

    const showPaginatedView = filteredResourceList?.length > pageSize

    /**
     * Initial Sort Key
     *
     * This constant holds the value for the initial sort key. \
     * Since our headers are dynamic and the default key 'namespace' might or might not be present,
     * we switch to the key 'name', which will always be present.
     */
    const initialSortKey = useMemo(() => {
        // NOTE: if isEventList don't initiate sort since we already sort it; therefore return empty initialSortKey
        if (resourceList && !isEventList) {
            const isNameSpaceColumnPresent = resourceList.headers.some((header) => header === 'namespace')
            return isNameSpaceColumnPresent ? 'namespace' : 'name'
        }
        return ''
    }, [resourceList, isEventList])

    // SORTING HOOK
    const { sortBy, sortOrder, handleSorting, clearFilters } = useStateFilters({ initialSortKey })

    useEffect(() => {
        /** Reset the sort filters when initial sort key is updated after api response. */
        if (initialSortKey) {
            clearFilters()
        }
    }, [initialSortKey])

    useEffect(
        () => () => {
            if (!searchWorkerRef.current) {
                return
            }
            searchWorkerRef.current.postMessage({ type: 'stop' })
            searchWorkerRef.current = null
        },
        [],
    )

    useEffect(() => {
        setResourceListOffset(0)
        setPageSize(DEFAULT_K8SLIST_PAGE_SIZE)
    }, [nodeType])

    useEffect(() => {
        setIdentifiers(
            (filteredResourceList?.slice(resourceListOffset, resourceListOffset + pageSize).reduce((acc, curr) => {
                acc[curr.id as number] = curr
                return acc
            }, {}) as Record<number, ResourceDetailDataType>) ?? {},
        )
    }, [resourceListOffset, filteredResourceList, pageSize])

    const handleFilterChanges = (_searchText: string, debounceResult = false) => {
        if (!searchWorkerRef.current) {
            searchWorkerRef.current = new WebWorker(searchWorker)
            searchWorkerRef.current.onmessage = (e) => setFilteredResourceList(e.data)
        }

        searchWorkerRef.current.postMessage({
            type: 'start',
            payload: {
                searchText: _searchText,
                list: resourceList?.data || [],
                sortBy,
                sortOrder,
                debounceResult,
                origin: new URL(window.__BASE_URL__, window.location.href).origin,
            },
        })
    }

    useEffect(() => {
        if (!resourceList) {
            setFilteredResourceList(null)
            return
        }

        handleFilterChanges(searchText)
        setResourceListOffset(0)
    }, [resourceList, sortBy, sortOrder])

    const setSearchText = (text: string) => {
        const searchParamString = updateQueryString(location, [[SEARCH_QUERY_PARAM_KEY, text]])
        const _url = `${location.pathname}?${searchParamString}`
        updateK8sResourceTab(_url)
        replace(_url)
        handleFilterChanges(text, true)
        if (text) {
            /* NOTE: if resourceListOffset is 0 setState is noop */
            setResourceListOffset(0)
        }
    }

    const handleResourceClick = (e) => {
        const { name, tab, namespace, origin } = e.currentTarget.dataset
        let resourceParam: string
        let kind: string
        let resourceName: string
        let _group: string
        const _namespace = namespace ?? ALL_NAMESPACE_OPTION.value
        if (origin === 'event') {
            const [_kind, _resourceName] = name.split('/')
            _group = selectedResource?.gvk.Group.toLowerCase() || K8S_EMPTY_GROUP
            resourceParam = `${_kind}/${_group}/${_resourceName}`
            kind = _kind
            resourceName = _resourceName
        } else {
            kind = selectedResource.gvk.Kind.toLowerCase()
            resourceParam = `${kind}/${selectedResource?.gvk?.Group?.toLowerCase() || K8S_EMPTY_GROUP}/${name}`
            resourceName = name
            _group = selectedResource?.gvk?.Group?.toLowerCase() || K8S_EMPTY_GROUP
        }

        const _url = `${URLS.RESOURCE_BROWSER}/${clusterId}/${_namespace}/${resourceParam}${
            tab ? `/${tab.toLowerCase()}` : ''
        }`
        const idPrefix = kind === 'node' ? `${_group}` : `${_group}_${_namespace}`
        addTab(idPrefix, kind, resourceName, _url)
            .then(() => push(_url))
            .catch(noop)
    }

    const handleNodeClick = (e) => {
        const { name } = e.currentTarget.dataset
        const _url = `${url.split('/').slice(0, -2).join('/')}/node/${K8S_EMPTY_GROUP}/${name}`
        addTab(K8S_EMPTY_GROUP, 'node', name, _url)
            .then(() => push(_url))
            .catch(noop)
    }

    const getStatusClass = (status: string) => {
        let statusPostfix = status?.toLowerCase()

        if (statusPostfix && (statusPostfix.includes(':') || statusPostfix.includes('/'))) {
            statusPostfix = statusPostfix.replace(':', '__').replace('/', '__')
        }

        return `f-${statusPostfix}`
    }

    const getHandleCheckedForId = (resourceData: ResourceDetailDataType) => () => {
        const id = Number(resourceData.id)

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
                        [id]: resourceData,
                    },
                },
            })
        }
    }

    const getBulkOperationModalStateSetter = (state: BulkOperationModalState) => () => {
        setBulkOperationModalState(state)
    }

    const handleClearBulkSelection = () => {
        handleBulkSelection({
            action: BulkSelectionEvents.CLEAR_ALL_SELECTIONS,
        })
    }

    const handleReloadDataAfterBulkDelete = () => {
        handleClearBulkSelection()
        reloadResourceListData()
    }

    const getBulkOperations = (): BulkOperationModalProps['operations'] => {
        if (bulkOperationModalState === 'closed') {
            return []
        }

        const selections = (isBulkSelectionApplied ? filteredResourceList : Object.values(bulkSelectionState)) ?? []

        if (bulkOperationModalState === 'restart') {
            return selections?.map((selection) => ({
                id: selection.id,
                name: selection.name as string,
                namespace: (selection.namespace as string) ?? ALL_NAMESPACE_OPTION.value,
                operation: async (signal: AbortSignal = null) => {
                    const payload = {
                        clusterId: Number(clusterId),
                        group: selectedResource?.gvk?.Group,
                        kind: selectedResource?.gvk?.Kind,
                        version: selectedResource?.gvk?.Version,
                        namespace: selection.namespace as string,
                        containers: [],
                        name: selection.name as string,
                    }

                    await restartWorkload(payload, signal)
                },
            }))
        }

        return selections.map((selection) => ({
            id: selection.id,
            name: selection.name as string,
            namespace: (selection.namespace as string) ?? ALL_NAMESPACE_OPTION.value,
            operation: async (signal: AbortSignal, shouldForceDelete: boolean) => {
                const resourceDeletePayload: ResourceListPayloadType = {
                    clusterId: Number(clusterId),
                    k8sRequest: {
                        resourceIdentifier: {
                            groupVersionKind: selectedResource.gvk as GVKType,
                            namespace: String(selection.namespace),
                            name: String(selection.name),
                        },
                        forceDelete: shouldForceDelete,
                    },
                }

                await deleteResource(resourceDeletePayload, signal)
            },
        }))
    }

    const renderResourceRow = (resourceData: ResourceDetailDataType): JSX.Element => (
        <div
            key={`${resourceData.id}-${resourceData.name}-${bulkSelectionState[resourceData.id as number]}-${isBulkSelectionApplied}`}
            className="scrollable-resource-list__row fw-4 cn-9 fs-13 dc__border-bottom-n1 hover-class h-44 dc__gap-16 dc__visible-hover dc__hover-n50"
            style={{ gridTemplateColumns }}
        >
            {resourceList?.headers.map((columnName) =>
                columnName === 'name' ? (
                    <div
                        key={`${resourceData.id}-${columnName}`}
                        className="flexbox dc__align-items-center dc__gap-4 dc__content-space dc__visible-hover dc__visible-hover--parent"
                        data-testid="created-resource-name"
                    >
                        <Checkbox
                            isChecked={!!bulkSelectionState[resourceData.id as number] || isBulkSelectionApplied}
                            onChange={getHandleCheckedForId(resourceData)}
                            rootClassName="mb-0"
                            value={CHECKBOX_VALUE.CHECKED}
                        />
                        <Tooltip content={resourceData.name}>
                            <button
                                type="button"
                                className="dc__unset-button-styles dc__align-left dc__ellipsis-right"
                                data-name={resourceData.name}
                                data-namespace={resourceData.namespace}
                                onClick={handleResourceClick}
                                aria-label={`Select ${resourceData.name}`}
                            >
                                <span
                                    className="dc__link cursor"
                                    // eslint-disable-next-line react/no-danger
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(
                                            highlightSearchText({
                                                searchText,
                                                text: String(resourceData.name),
                                                highlightClasses: 'p-0 fw-6 bcy-2',
                                            }),
                                        ),
                                    }}
                                />
                            </button>
                        </Tooltip>
                        <ClipboardButton
                            content={String(resourceData.name)}
                            rootClassName="p-4 dc__visible-hover--child"
                        />
                        <ResourceBrowserActionMenu
                            clusterId={clusterId}
                            resourceData={resourceData}
                            getResourceListData={reloadResourceListData as () => Promise<void>}
                            selectedResource={selectedResource}
                            handleResourceClick={handleResourceClick}
                        />
                    </div>
                ) : (
                    <div
                        key={`${resourceData.id}-${columnName}`}
                        className={`flexbox dc__align-items-center ${
                            columnName === 'status'
                                ? ` app-summary__status-name ${getStatusClass(String(resourceData[columnName]))}`
                                : ''
                        }`}
                    >
                        <ConditionalWrap
                            condition={columnName === 'node'}
                            wrap={getRenderNodeButton(resourceData, columnName, handleNodeClick)}
                        >
                            <Tooltip content={resourceData[columnName]}>
                                <span
                                    className="dc__truncate"
                                    data-testid={`${columnName}-count`}
                                    // eslint-disable-next-line react/no-danger
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(
                                            highlightSearchText({
                                                searchText,
                                                text: renderResourceValue(resourceData[columnName]?.toString()),
                                                highlightClasses: 'p-0 fw-6 bcy-2',
                                            }),
                                        ),
                                    }}
                                />
                            </Tooltip>
                            <span>
                                {columnName === 'restarts' && Number(resourceData.restarts) !== 0 && PodRestartIcon && (
                                    <PodRestartIcon
                                        clusterId={clusterId}
                                        name={resourceData.name}
                                        namespace={resourceData.namespace}
                                    />
                                )}
                            </span>
                        </ConditionalWrap>
                    </div>
                ),
            )}
        </div>
    )

    const emptyStateActionHandler = () => {
        setSearchText('')
        const pathname = `${URLS.RESOURCE_BROWSER}/${clusterId}/${ALL_NAMESPACE_OPTION.value}/${selectedResource.gvk.Kind.toLowerCase()}/${group}`
        updateK8sResourceTab(pathname)
        push(pathname)
        setSelectedNamespace(ALL_NAMESPACE_OPTION)
    }

    const renderEmptyPage = (): JSX.Element => {
        const isFilterApplied = searchText || location.search || selectedNamespace.value !== ALL_NAMESPACE_OPTION.value
        return isFilterApplied ? (
            <ResourceListEmptyState
                title={RESOURCE_LIST_EMPTY_STATE.title}
                subTitle={RESOURCE_LIST_EMPTY_STATE.subTitle(selectedResource?.gvk?.Kind)}
                actionHandler={emptyStateActionHandler}
            />
        ) : (
            <ResourceListEmptyState
                title={RESOURCE_EMPTY_PAGE_STATE.title(selectedResource?.gvk?.Kind)}
                subTitle={RESOURCE_EMPTY_PAGE_STATE.subTitle(selectedResource?.gvk?.Kind, selectedResource?.namespaced)}
            />
        )
    }

    const changePage = (pageNo: number) => {
        setResourceListOffset(pageSize * (pageNo - 1))

        /* NOTE: scroll to top on page change */
        resourceListRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const changePageSize = (size: number) => {
        setPageSize(size)
        setResourceListOffset(0)
    }

    const triggerSortingHandler = (columnName: string) => () => {
        resourceListRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        handleSorting(columnName)
    }

    const renderResourceList = (): JSX.Element => (
        <div
            ref={resourceListRef}
            className={`${getScrollableResourceClass(
                'scrollable-resource-list',
                showPaginatedView,
                showStaleDataWarning,
            )} dc__overflow-scroll`}
        >
            <div
                className="scrollable-resource-list__row no-hover-bg h-36 fw-6 cn-7 fs-12 dc__gap-16 dc__zi-2 dc__position-sticky dc__border-bottom dc__uppercase bcn-0 dc__top-0"
                style={{ gridTemplateColumns }}
            >
                {resourceList?.headers.map((columnName, index) => {
                    if (index === 0) {
                        return (
                            <div className="flexbox dc__gap-8 dc__align-items-center">
                                <BulkSelection showPagination={showPaginatedView} />
                                <SortableTableHeaderCell
                                    key={columnName}
                                    showTippyOnTruncate
                                    title={columnName}
                                    triggerSorting={triggerSortingHandler(columnName)}
                                    isSorted={sortBy === columnName}
                                    sortOrder={sortOrder}
                                    disabled={false}
                                    id={columnName}
                                    handleResize={handleResize}
                                    isResizable
                                />
                            </div>
                        )
                    }

                    return (
                        <SortableTableHeaderCell
                            key={columnName}
                            showTippyOnTruncate
                            title={columnName}
                            triggerSorting={triggerSortingHandler(columnName)}
                            isSorted={sortBy === columnName}
                            sortOrder={sortOrder}
                            disabled={false}
                            id={columnName}
                            handleResize={handleResize}
                            isResizable
                        />
                    )
                })}
            </div>
            {filteredResourceList
                .slice(resourceListOffset, resourceListOffset + pageSize)
                .map((clusterData) => renderResourceRow(clusterData))}
        </div>
    )

    const renderList = (): JSX.Element => {
        if (filteredResourceList?.length === 0 || resourceListDataError) {
            return renderEmptyPage()
        }
        return (
            <>
                {isEventList ? (
                    <EventList
                        listRef={resourceListRef}
                        filteredData={filteredResourceList.slice(resourceListOffset, resourceListOffset + pageSize)}
                        handleResourceClick={handleResourceClick}
                        paginatedView={showPaginatedView}
                        syncError={showStaleDataWarning}
                        searchText={searchText}
                    />
                ) : (
                    renderResourceList()
                )}
                {showPaginatedView && (
                    <Pagination
                        rootClassName="pagination-wrapper resource-browser-paginator dc__border-top flex dc__content-space px-20"
                        size={filteredResourceList.length}
                        pageSize={pageSize}
                        offset={resourceListOffset}
                        changePage={changePage}
                        changePageSize={changePageSize}
                        pageSizeOptions={RESOURCE_PAGE_SIZE_OPTIONS}
                    />
                )}
            </>
        )
    }

    return (
        <div
            className={`resource-list-container dc__border-left flexbox-col dc__overflow-hidden ${
                filteredResourceList?.length === 0 ? 'no-result-container' : ''
            }`}
            ref={parentRef}
        >
            <ResourceFilterOptions
                key={`${selectedResource.gvk.Kind}-${selectedResource.gvk.Group}`}
                selectedResource={selectedResource}
                selectedNamespace={selectedNamespace}
                setSelectedNamespace={setSelectedNamespace}
                selectedCluster={selectedCluster}
                searchText={searchText}
                isOpen={isOpen}
                resourceList={resourceList}
                setSearchText={setSearchText}
                isSearchInputDisabled={resourceListLoader}
                renderRefreshBar={renderRefreshBar}
                updateK8sResourceTab={updateK8sResourceTab}
            />
            {!resourceListDataError && (resourceListLoader || !resourceList || !filteredResourceList) ? (
                <Progressing size={32} pageLoader />
            ) : (
                renderList()
            )}
            {PodRestart && <PodRestart rbacPayload={getPodRestartRBACPayload()} />}

            {RBBulkSelectionActionWidget && (getSelectedIdentifiersCount() > 0 || isBulkSelectionApplied) && (
                <RBBulkSelectionActionWidget
                    parentRef={parentRef}
                    count={isBulkSelectionApplied ? filteredResourceList?.length ?? 0 : getSelectedIdentifiersCount()}
                    handleClearBulkSelection={handleClearBulkSelection}
                    handleOpenBulkDeleteModal={getBulkOperationModalStateSetter('delete')}
                    handleOpenRestartWorkloadModal={getBulkOperationModalStateSetter('restart')}
                    showBulkRestartOption={
                        window._env_.FEATURE_BULK_RESTART_WORKLOADS_FROM_RB.split(',')
                            .map((feat: string) => feat.trim().toUpperCase())
                            .indexOf(selectedResource.gvk.Kind.toUpperCase()) > -1
                    }
                />
            )}

            {RBBulkOperations && bulkOperationModalState !== 'closed' && (
                <RBBulkOperations
                    clusterName={clusterName}
                    operationType={bulkOperationModalState}
                    handleModalClose={getBulkOperationModalStateSetter('closed')}
                    handleReloadDataAfterBulkOperation={handleReloadDataAfterBulkDelete}
                    operations={getBulkOperations()}
                    resourceKind={selectedResource.gvk.Kind.toLowerCase()}
                    {...(bulkOperationModalState === 'delete' ? { shouldAllowForceOperation: true } : {})}
                />
            )}
        </div>
    )
}
