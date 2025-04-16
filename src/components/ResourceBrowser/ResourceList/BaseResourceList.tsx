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
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import DOMPurify from 'dompurify'

import {
    ALL_NAMESPACE_OPTION,
    BulkSelection,
    BulkSelectionEvents,
    BulkSelectionProvider,
    Button,
    ButtonComponentType,
    ButtonVariantType,
    Checkbox,
    CHECKBOX_VALUE,
    ClipboardButton,
    ConditionalWrap,
    GenericFilterEmptyState,
    GVKType,
    highlightSearchText,
    K8sResourceDetailDataType,
    K8sResourceDetailType,
    Nodes,
    noop,
    Pagination,
    Progressing,
    SelectAllDialogStatus,
    SortableTableHeaderCell,
    Tooltip,
    useBulkSelection,
    useResizableTableConfig,
    useSearchString,
    useStateFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICErrorExclamation } from '@Icons/ic-error-exclamation.svg'
import WebWorker from '@Components/app/WebWorker'
import { AddEnvironmentFormPrefilledInfoType } from '@Components/cluster/cluster.type'
import { ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY } from '@Components/cluster/constants'
import NodeActionsMenu from '@Components/ResourceBrowser/ResourceList/NodeActionsMenu'
import {
    getManifestResource,
    updateManifestResourceHelmApps,
} from '@Components/v2/appDetails/k8Resource/nodeDetail/nodeDetail.api'
import { URLS } from '@Config/routes'
import searchWorker from '@Config/searchWorker'

import { importComponentFromFELibrary } from '../../common/helpers/Helpers'
import {
    DEFAULT_K8SLIST_PAGE_SIZE,
    K8S_EMPTY_GROUP,
    MANDATORY_NODE_LIST_HEADERS,
    NODE_K8S_VERSION_FILTER_KEY,
    NODE_LIST_HEADERS,
    NODE_LIST_HEADERS_TO_KEY_MAP,
    NODE_SEARCH_KEYS_TO_OBJECT_KEYS,
    RESOURCE_EMPTY_PAGE_STATE,
    RESOURCE_LIST_EMPTY_STATE,
    RESOURCE_PAGE_SIZE_OPTIONS,
    SEARCH_QUERY_PARAM_KEY,
    SIDEBAR_KEYS,
} from '../Constants'
import { getRenderNodeButton, renderResourceValue, updateQueryString } from '../Utils'
import { EventList } from './EventList'
import NodeListSearchFilter from './NodeListSearchFilter'
import ResourceBrowserActionMenu from './ResourceBrowserActionMenu'
import ResourceFilterOptions from './ResourceFilterOptions'
import ResourceListEmptyState from './ResourceListEmptyState'
import { BaseResourceListProps, BulkOperationsModalState } from './types'
import { getAppliedColumnsFromLocalStorage, getFirstResourceFromKindResourceMap } from './utils'

const PodRestartIcon = importComponentFromFELibrary('PodRestartIcon')
const RBBulkSelectionActionWidget = importComponentFromFELibrary('RBBulkSelectionActionWidget', null, 'function')
const RBBulkOperations = importComponentFromFELibrary('RBBulkOperations', null, 'function')

const BaseResourceListContent = ({
    isLoading,
    resourceListError,
    resourceList,
    clusterId,
    clusterName,
    selectedResource,
    reloadResourceListData,
    selectedNamespace,
    setSelectedNamespace,
    selectedCluster,
    isOpen,
    renderRefreshBar,
    updateK8sResourceTab,
    children,
    nodeType,
    group,
    areFiltersHidden = false,
    hideDeleteResource = false,
    searchPlaceholder,
    showGenericNullState,
    addTab,
    hideBulkSelection = false,
    shouldOverrideSelectedResourceKind = false,
    setWidgetEventDetails,
    lowercaseKindToResourceGroupMap,
    handleResourceClick: onResourceClick,
}: BaseResourceListProps) => {
    const [filteredResourceList, setFilteredResourceList] = useState<K8sResourceDetailType['data']>(null)
    const [pageSize, setPageSize] = useState(DEFAULT_K8SLIST_PAGE_SIZE)
    const [resourceListOffset, setResourceListOffset] = useState(0)
    const [bulkOperationModalState, setBulkOperationModalState] = useState<BulkOperationsModalState>('closed')

    // NOTE: this is to re-mount node filters component & avoid useEffects inside it
    const [lastTimeStringSinceClearAllFilters, setLastTimeStringSinceClearAllFilters] = useState(null)

    // NOTE: this is only being used for node listing currently
    const [visibleColumns, setVisibleColumns] = useState(getAppliedColumnsFromLocalStorage())

    const searchWorkerRef = useRef(null)
    const resourceListRef = useRef<HTMLDivElement>(null)
    const parentRef = useRef<HTMLDivElement>(null)

    const location = useLocation()
    const { replace, push } = useHistory()
    const { url } = useRouteMatch()

    const { searchParams } = useSearchString()

    const isNodeListing = selectedResource?.gvk.Kind.toLowerCase() === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()

    const {
        selectedIdentifiers: bulkSelectionState,
        handleBulkSelection,
        setIdentifiers,
        isBulkSelectionApplied,
        getSelectedIdentifiersCount,
    } = useBulkSelection<Record<string, K8sResourceDetailDataType>>()

    const headers = useMemo(() => {
        const list = resourceList?.headers ?? []

        if (!isNodeListing) {
            return list
        }

        const visibleColumnsSet = new Set(visibleColumns)

        return list.filter(
            (header) =>
                MANDATORY_NODE_LIST_HEADERS.includes(header as (typeof NODE_LIST_HEADERS)[number]) ||
                visibleColumnsSet.has(header),
        )
    }, [resourceList, visibleColumns, isNodeListing])

    const { gridTemplateColumns, handleResize } = useResizableTableConfig({
        headersConfig: headers.map((columnName, index) => ({
            id: columnName,
            minWidth: index === 0 ? 120 : null,
            width: index === 0 ? 350 : 180,
        })),
    })

    const showPaginatedView = filteredResourceList?.length > pageSize
    const searchText = searchParams[SEARCH_QUERY_PARAM_KEY] || ''
    const isEventList = selectedResource?.gvk.Kind === SIDEBAR_KEYS.eventGVK.Kind

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
            const isNameSpaceColumnPresent = headers.some((header) => header === 'namespace')
            return isNameSpaceColumnPresent ? 'namespace' : 'name'
        }
        return ''
    }, [headers, isEventList])

    // SORTING HOOK
    const { sortBy, sortOrder, handleSorting, clearFilters } = useStateFilters({ initialSortKey })

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
                nodeListingFilters: {
                    isNodeListing,
                    searchParams,
                    // NOTE!: these constants need to be passed to searchWorker since we cannot import
                    // stuff inside web worker
                    NODE_LIST_HEADERS_TO_KEY_MAP: structuredClone(NODE_LIST_HEADERS_TO_KEY_MAP),
                    NODE_SEARCH_KEYS_TO_OBJECT_KEYS: structuredClone(NODE_SEARCH_KEYS_TO_OBJECT_KEYS),
                    NODE_K8S_VERSION_KEY: structuredClone(NODE_K8S_VERSION_FILTER_KEY),
                },
                origin: new URL(window.__BASE_URL__, window.location.href).origin,
            },
        })
    }

    useEffect(() => {
        setIdentifiers(
            (filteredResourceList?.slice(resourceListOffset, resourceListOffset + pageSize).reduce((acc, curr) => {
                acc[curr.id as string] = curr
                return acc
            }, {}) as Record<string, K8sResourceDetailDataType>) ?? {},
        )
    }, [resourceListOffset, filteredResourceList, pageSize])

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
        /** Reset the sort filters when initial sort key is updated after api response. */
        if (initialSortKey) {
            clearFilters()
        }
    }, [initialSortKey])

    useEffect(() => {
        setResourceListOffset(0)
        setPageSize(DEFAULT_K8SLIST_PAGE_SIZE)
    }, [nodeType])

    useEffect(() => {
        if (!isOpen) {
            return
        }

        if (!resourceList) {
            setFilteredResourceList(null)
            return
        }

        handleFilterChanges(searchText)
        setResourceListOffset(0)
    }, [resourceList, sortBy, sortOrder, location.search, isOpen])

    const getHandleCheckedForId = (resourceData: K8sResourceDetailDataType) => () => {
        const { id } = resourceData as Record<'id', string>

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

    const getBulkOperationsModalStateSetter = (option: BulkOperationsModalState) => () => {
        setBulkOperationModalState(option)
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

    const setSearchText = (text: string) => {
        const searchParamString = updateQueryString(location, [[SEARCH_QUERY_PARAM_KEY, text]])
        const _url = `${location.pathname}?${searchParamString}`
        updateK8sResourceTab({ url: _url })
        replace(_url)
        handleFilterChanges(text, true)
        if (text) {
            /* NOTE: if resourceListOffset is 0 setState is noop */
            setResourceListOffset(0)
        }
    }

    const emptyStateActionHandler = () => {
        const pathname = `${URLS.RESOURCE_BROWSER}/${clusterId}/${ALL_NAMESPACE_OPTION.value}/${selectedResource.gvk.Kind.toLowerCase()}/${group}`
        updateK8sResourceTab({ url: pathname, dynamicTitle: '', retainSearchParams: false })
        push(pathname)
        setFilteredResourceList(resourceList?.data ?? null)
        setResourceListOffset(0)
        setSelectedNamespace(ALL_NAMESPACE_OPTION)
        setLastTimeStringSinceClearAllFilters(new Date().toISOString())
    }

    const getStatusClass = (status: string) => {
        let statusPostfix = status?.toLowerCase()

        if (
            statusPostfix &&
            (statusPostfix.includes(':') || statusPostfix.includes('/') || statusPostfix.includes(' '))
        ) {
            statusPostfix = statusPostfix.replace(':', '__').replace('/', '__').replace(' ', '__')
        }

        return `f-${statusPostfix} ${isNodeListing ? 'dc__capitalize' : ''}`
    }

    const handleResourceClick = (e) => onResourceClick(e, shouldOverrideSelectedResourceKind)

    const handleNodeClick = (e) => {
        const { name } = e.currentTarget.dataset
        const _url = `${url.split('/').slice(0, -2).join('/')}/node/${K8S_EMPTY_GROUP}/${name}`
        addTab({ idPrefix: K8S_EMPTY_GROUP, kind: 'node', name, url: _url })
            .then(() => push(_url))
            .catch(noop)
    }

    // This should be used only if shouldOverrideSelectedResourceKind is true
    // Group and version are not available for Events / shouldOverrideSelectedResourceKind is true
    const getSelectedResourceKindOverride = (lowercaseKind: string) => {
        const gvkFromRawData: GVKType =
            getFirstResourceFromKindResourceMap(lowercaseKindToResourceGroupMap, lowercaseKind)?.gvk ?? ({} as GVKType)

        return {
            gvk: {
                Group: gvkFromRawData.Group ?? selectedResource.gvk.Group,
                Kind: gvkFromRawData.Kind ?? selectedResource.gvk.Kind,
                Version: gvkFromRawData.Version ?? selectedResource.gvk.Version,
            } as GVKType,
        }
    }

    const getAddEnvironmentClickHandler = (namespace: string) => () => {
        const environmentFormData: AddEnvironmentFormPrefilledInfoType = {
            namespace,
        }

        localStorage.setItem(ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY, JSON.stringify(environmentFormData))
    }

    const renderResourceRow = (resourceData: K8sResourceDetailDataType): JSX.Element => {
        const lowercaseKind = (resourceData.kind as string)?.toLowerCase()
        // Redirection and actions are not possible for Events since the required data for the same is not available
        const shouldShowRedirectionAndActions = lowercaseKind !== Nodes.Event.toLowerCase()
        const isNodeUnschedulable = isNodeListing && !!resourceData.unschedulable
        const isNodeListingAndNodeHasErrors = isNodeListing && !!resourceData[NODE_LIST_HEADERS_TO_KEY_MAP.errors]

        return (
            <div
                // Added id as the name is not always unique
                key={`${resourceData.id}-${bulkSelectionState[resourceData.id as string]}-${isBulkSelectionApplied}`}
                className="scrollable-resource-list__row fw-4 cn-9 fs-13 dc__border-bottom-n1 hover-class h-44 dc__gap-16 dc__visible-hover dc__hover-n50"
                style={{ gridTemplateColumns }}
            >
                {headers.map((columnName) =>
                    columnName === 'name' ? (
                        <div
                            key={`${resourceData.id}-${columnName}`}
                            className={`flexbox dc__align-items-center dc__gap-4 dc__content-space dc__visible-hover dc__visible-hover--parent ${shouldShowRedirectionAndActions ? '' : 'pr-8'}`}
                            data-testid="created-resource-name"
                        >
                            {!hideBulkSelection && (
                                <Checkbox
                                    isChecked={
                                        !!bulkSelectionState[resourceData.id as string] || isBulkSelectionApplied
                                    }
                                    onChange={getHandleCheckedForId(resourceData)}
                                    rootClassName="mb-0"
                                    value={CHECKBOX_VALUE.CHECKED}
                                />
                            )}
                            <div className="flex left dc__gap-4">
                                <Tooltip content={resourceData.name}>
                                    <button
                                        type="button"
                                        className={`dc__unset-button-styles dc__align-left dc__truncate ${!shouldShowRedirectionAndActions ? 'cursor-default' : ''}`}
                                        data-name={resourceData.name}
                                        data-namespace={resourceData.namespace}
                                        data-kind={resourceData.kind}
                                        onClick={shouldShowRedirectionAndActions ? handleResourceClick : null}
                                        aria-label={`Select ${resourceData.name}`}
                                    >
                                        <span
                                            className={shouldShowRedirectionAndActions ? 'dc__link cursor' : ''}
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
                            </div>
                            {shouldShowRedirectionAndActions &&
                                (!isNodeListing ? (
                                    <ResourceBrowserActionMenu
                                        clusterId={clusterId}
                                        resourceData={resourceData}
                                        getResourceListData={reloadResourceListData as () => Promise<void>}
                                        selectedResource={{
                                            ...selectedResource,
                                            ...(shouldOverrideSelectedResourceKind &&
                                                getSelectedResourceKindOverride(lowercaseKind)),
                                        }}
                                        handleResourceClick={handleResourceClick}
                                        hideDeleteResource={hideDeleteResource}
                                        handleClearBulkSelection={handleClearBulkSelection}
                                    />
                                ) : (
                                    <NodeActionsMenu
                                        getNodeListData={reloadResourceListData as () => Promise<void>}
                                        addTab={addTab}
                                        nodeData={resourceData}
                                        handleClearBulkSelection={handleClearBulkSelection}
                                    />
                                ))}
                        </div>
                    ) : (
                        <div
                            key={`${resourceData.id}-${columnName}`}
                            className={`flexbox dc__align-items-center ${
                                columnName === 'status'
                                    ? `app-summary__status-name dc__no-text-transform ${getStatusClass(String(resourceData[columnName]))}`
                                    : ''
                            } ${columnName === 'errors' ? 'app-summary__status-name f-error dc__no-text-transform' : ''}`}
                        >
                            <ConditionalWrap
                                condition={columnName === 'node'}
                                wrap={getRenderNodeButton(resourceData, columnName, handleNodeClick)}
                            >
                                {columnName === 'errors' && isNodeListingAndNodeHasErrors && (
                                    <ICErrorExclamation className="icon-dim-16 dc__no-shrink mr-4" />
                                )}
                                <Tooltip
                                    content={renderResourceValue(
                                        resourceData[
                                            isNodeListing ? NODE_LIST_HEADERS_TO_KEY_MAP[columnName] : columnName
                                        ]?.toString(),
                                    )}
                                >
                                    <span
                                        className={
                                            columnName === 'status' && isNodeUnschedulable
                                                ? 'dc__no-shrink'
                                                : 'dc__truncate'
                                        }
                                        data-testid={`${columnName}-count`}
                                        // eslint-disable-next-line react/no-danger
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(
                                                highlightSearchText({
                                                    searchText,
                                                    text: renderResourceValue(
                                                        resourceData[
                                                            isNodeListing
                                                                ? NODE_LIST_HEADERS_TO_KEY_MAP[columnName]
                                                                : columnName
                                                        ]?.toString(),
                                                    ),
                                                    highlightClasses: 'p-0 fw-6 bcy-2',
                                                }),
                                            ),
                                        }}
                                    />
                                </Tooltip>
                                {columnName === 'environment' && !resourceData.environment && (
                                    <Button
                                        text="Add environment"
                                        dataTestId="add-environment"
                                        variant={ButtonVariantType.text}
                                        component={ButtonComponentType.link}
                                        linkProps={{
                                            to: `${URLS.GLOBAL_CONFIG_CLUSTER}/${selectedCluster.label}${URLS.CREATE_ENVIRONMENT}`,
                                            target: '_blank',
                                        }}
                                        onClick={getAddEnvironmentClickHandler(resourceData.name as string)}
                                    />
                                )}
                                {columnName === 'status' && isNodeUnschedulable && (
                                    <>
                                        <span className="dc__bullet mr-4 ml-4 mw-4 bcn-4" />
                                        <Tooltip content="Scheduling disabled">
                                            <span className="cr-5 dc__truncate">SchedulingDisabled</span>
                                        </Tooltip>
                                    </>
                                )}
                                <span>
                                    {columnName === 'restarts' &&
                                        Number(resourceData.restarts) !== 0 &&
                                        PodRestartIcon && (
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
    }

    const renderContent = () => {
        if (!resourceListError && (isLoading || !resourceList || !filteredResourceList || !selectedResource)) {
            return <Progressing size={32} pageLoader />
        }

        if (filteredResourceList?.length === 0 || resourceListError) {
            if (showGenericNullState) {
                return <GenericFilterEmptyState />
            }

            const isFilterApplied =
                searchText || location.search || selectedNamespace.value !== ALL_NAMESPACE_OPTION.value

            return isFilterApplied ? (
                <ResourceListEmptyState
                    title={RESOURCE_LIST_EMPTY_STATE.title}
                    subTitle={RESOURCE_LIST_EMPTY_STATE.subTitle(selectedResource?.gvk?.Kind)}
                    actionHandler={emptyStateActionHandler}
                />
            ) : (
                <ResourceListEmptyState
                    title={RESOURCE_EMPTY_PAGE_STATE.title(selectedResource?.gvk?.Kind)}
                    subTitle={RESOURCE_EMPTY_PAGE_STATE.subTitle(
                        selectedResource?.gvk?.Kind,
                        selectedResource?.namespaced,
                    )}
                />
            )
        }

        return (
            <>
                {isEventList ? (
                    <EventList
                        listRef={resourceListRef}
                        filteredData={filteredResourceList.slice(resourceListOffset, resourceListOffset + pageSize)}
                        handleResourceClick={handleResourceClick}
                        searchText={searchText}
                        setWidgetEventDetails={setWidgetEventDetails}
                    />
                ) : (
                    <div ref={resourceListRef} className="scrollable-resource-list dc__overflow-auto">
                        <div
                            className="scrollable-resource-list__row no-hover-bg h-36 fw-6 cn-7 fs-12 dc__gap-16 dc__zi-2 dc__position-sticky dc__border-bottom dc__uppercase bg__primary dc__top-0"
                            style={{ gridTemplateColumns }}
                        >
                            {headers.map((columnName, index) => (
                                <div className="flexbox dc__gap-8 dc__align-items-center" key={columnName}>
                                    {!hideBulkSelection && index === 0 && (
                                        <BulkSelection showPagination={showPaginatedView} />
                                    )}
                                    <SortableTableHeaderCell
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
                            ))}
                        </div>
                        {filteredResourceList
                            .slice(resourceListOffset, resourceListOffset + pageSize)
                            .map((clusterData) => renderResourceRow(clusterData))}
                    </div>
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
            className={`resource-list-container flex-grow-1 dc__border-left flexbox-col dc__overflow-hidden ${
                filteredResourceList?.length === 0 ? 'no-result-container' : ''
            }`}
            ref={parentRef}
        >
            {isNodeListing ? (
                <NodeListSearchFilter
                    key={lastTimeStringSinceClearAllFilters}
                    visibleColumns={visibleColumns}
                    setVisibleColumns={setVisibleColumns}
                    searchParams={searchParams}
                    isOpen={isOpen}
                />
            ) : (
                <ResourceFilterOptions
                    key={`${selectedResource?.gvk.Kind}-${selectedResource?.gvk.Group}`}
                    selectedResource={selectedResource}
                    selectedNamespace={selectedNamespace}
                    setSelectedNamespace={setSelectedNamespace}
                    selectedCluster={selectedCluster}
                    searchText={searchText}
                    isOpen={isOpen}
                    resourceList={resourceList}
                    setSearchText={setSearchText}
                    isSearchInputDisabled={isLoading}
                    renderRefreshBar={renderRefreshBar}
                    updateK8sResourceTab={updateK8sResourceTab}
                    areFiltersHidden={areFiltersHidden}
                    searchPlaceholder={searchPlaceholder}
                />
            )}
            {renderContent()}
            {children}
            {!hideBulkSelection && (
                <>
                    {RBBulkSelectionActionWidget && (getSelectedIdentifiersCount() > 0 || isBulkSelectionApplied) && (
                        <RBBulkSelectionActionWidget
                            parentRef={parentRef}
                            count={
                                isBulkSelectionApplied
                                    ? filteredResourceList?.length ?? 0
                                    : getSelectedIdentifiersCount()
                            }
                            handleClearBulkSelection={handleClearBulkSelection}
                            handleOpenBulkDeleteModal={getBulkOperationsModalStateSetter('delete')}
                            handleOpenRestartWorkloadModal={getBulkOperationsModalStateSetter('restart')}
                            showBulkRestartOption={
                                window._env_.FEATURE_BULK_RESTART_WORKLOADS_FROM_RB.split(',')
                                    .map((feat: string) => feat.trim().toUpperCase())
                                    .indexOf(selectedResource.gvk.Kind.toUpperCase()) > -1
                            }
                            showNodeListingOptions={isNodeListing}
                            handleOpenCordonNodeModal={getBulkOperationsModalStateSetter('cordon')}
                            handleOpenUncordonNodeModal={getBulkOperationsModalStateSetter('uncordon')}
                            handleOpenDrainNodeModal={getBulkOperationsModalStateSetter('drain')}
                        />
                    )}

                    {RBBulkOperations && bulkOperationModalState !== 'closed' && (
                        <RBBulkOperations
                            handleModalClose={getBulkOperationsModalStateSetter('closed')}
                            handleReloadDataAfterBulkOperation={handleReloadDataAfterBulkDelete}
                            operationType={bulkOperationModalState}
                            allResources={filteredResourceList}
                            isBulkSelectionApplied={isBulkSelectionApplied}
                            selectedIdentifiers={bulkSelectionState}
                            selectedResource={selectedResource}
                            clusterName={clusterName}
                            clusterId={clusterId}
                            isNodeListing={isNodeListing}
                            getManifestResource={getManifestResource}
                            updateManifestResourceHelmApps={updateManifestResourceHelmApps}
                        />
                    )}
                </>
            )}
        </div>
    )
}

const BaseResourceList = (props: BaseResourceListProps) => {
    const { selectedResource } = props

    return (
        <BulkSelectionProvider
            key={JSON.stringify(selectedResource)}
            getSelectAllDialogStatus={() => SelectAllDialogStatus.CLOSED}
        >
            <BaseResourceListContent {...props} />
        </BulkSelectionProvider>
    )
}

export default BaseResourceList
