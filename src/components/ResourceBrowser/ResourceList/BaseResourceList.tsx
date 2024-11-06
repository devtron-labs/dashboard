import {
    Pagination,
    Progressing,
    ServerErrors,
    showError,
    SortableTableHeaderCell,
    ConditionalWrap,
    highlightSearchText,
    ClipboardButton,
    Tooltip,
    useStateFilters,
    useSearchString,
    GenericFilterEmptyState,
} from '@devtron-labs/devtron-fe-common-lib'
import DOMPurify from 'dompurify'
import { useHistory, useLocation } from 'react-router-dom'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import WebWorker from '@Components/app/WebWorker'
import searchWorker from '@Config/searchWorker'
import { URLS } from '@Config/routes'
import ResourceListEmptyState from './ResourceListEmptyState'
import {
    ALL_NAMESPACE_OPTION,
    DEFAULT_K8SLIST_PAGE_SIZE,
    RESOURCE_EMPTY_PAGE_STATE,
    RESOURCE_LIST_EMPTY_STATE,
    RESOURCE_PAGE_SIZE_OPTIONS,
    SEARCH_QUERY_PARAM_KEY,
    SIDEBAR_KEYS,
} from '../Constants'
import { getScrollableResourceClass, getRenderNodeButton, renderResourceValue, updateQueryString } from '../Utils'
import { importComponentFromFELibrary } from '../../common/helpers/Helpers'
import ResourceBrowserActionMenu from './ResourceBrowserActionMenu'
import { ResourceDetailDataType, ResourceDetailType, ResourceFilterOptionsProps } from '../Types'
import { EventList } from './EventList'
import ResourceFilterOptions from './ResourceFilterOptions'

const PodRestartIcon = importComponentFromFELibrary('PodRestartIcon')

const BaseResourceList = ({
    isLoading,
    resourceListError,
    resourceList,
    clusterId,
    showStaleDataWarning,
    selectedResource,
    handleResourceClick,
    reloadResourceListData,
    handleNodeClick,
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
    searchPlaceholder,
    showGenericNullState,
}: {
    isLoading: boolean
    resourceListError: ServerErrors
    resourceList: ResourceDetailType
    clusterId: string
    showStaleDataWarning
    selectedResource
    handleResourceClick
    reloadResourceListData
    handleNodeClick
    selectedNamespace
    setSelectedNamespace
    selectedCluster
    isOpen: boolean
    renderRefreshBar
    updateK8sResourceTab
    children?: ReactNode
    nodeType
    group
    showGenericNullState?: boolean
} & Partial<Pick<ResourceFilterOptionsProps, 'areFiltersHidden' | 'searchPlaceholder'>>) => {
    const [filteredResourceList, setFilteredResourceList] = useState<ResourceDetailType['data']>(null)
    const [pageSize, setPageSize] = useState(DEFAULT_K8SLIST_PAGE_SIZE)
    const [resourceListOffset, setResourceListOffset] = useState(0)

    const searchWorkerRef = useRef(null)
    const resourceListRef = useRef<HTMLDivElement>(null)

    const location = useLocation()
    const { replace, push } = useHistory()

    const { searchParams } = useSearchString()

    const gridTemplateColumns = `350px repeat(${(resourceList?.headers.length ?? 1) - 1}, 180px)`
    const showPaginatedView = resourceList?.data?.length >= pageSize
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
            const isNameSpaceColumnPresent = resourceList.headers.some((header) => header === 'namespace')
            return isNameSpaceColumnPresent ? 'namespace' : 'name'
        }
        return ''
    }, [resourceList, isEventList])

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

    const emptyStateActionHandler = () => {
        setSearchText('')
        const pathname = `${URLS.RESOURCE_BROWSER}/${clusterId}/${ALL_NAMESPACE_OPTION.value}/${selectedResource.gvk.Kind.toLowerCase()}/${group}`
        updateK8sResourceTab(pathname)
        push(pathname)
        setSelectedNamespace(ALL_NAMESPACE_OPTION)
    }

    if (resourceListError) {
        showError(resourceListError)
    }

    const getStatusClass = (status: string) => {
        let statusPostfix = status?.toLowerCase()

        if (statusPostfix && (statusPostfix.includes(':') || statusPostfix.includes('/'))) {
            statusPostfix = statusPostfix.replace(':', '__').replace('/', '__')
        }

        return `f-${statusPostfix}`
    }

    const renderResourceRow = (resourceData: ResourceDetailDataType, index: number): JSX.Element => (
        <div
            // Added id as the name is not always unique
            key={`${resourceData.id}-${resourceData.name}-${index}`}
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

    const renderContent = () => {
        if (!resourceListError && (isLoading || !resourceList || !filteredResourceList)) {
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
                        paginatedView={showPaginatedView}
                        syncError={showStaleDataWarning}
                        searchText={searchText}
                    />
                ) : (
                    <div
                        ref={resourceListRef}
                        className={`${getScrollableResourceClass(
                            'scrollable-resource-list',
                            showPaginatedView,
                            showStaleDataWarning,
                        )} dc__overflow-scroll`}
                    >
                        <div
                            className="scrollable-resource-list__row h-36 fw-6 cn-7 fs-12 dc__gap-16 dc__zi-2 dc__position-sticky dc__border-bottom dc__uppercase bcn-0 dc__top-0"
                            style={{ gridTemplateColumns }}
                        >
                            {resourceList?.headers.map((columnName) => (
                                <SortableTableHeaderCell
                                    key={columnName}
                                    showTippyOnTruncate
                                    title={columnName}
                                    triggerSorting={triggerSortingHandler(columnName)}
                                    isSorted={sortBy === columnName}
                                    sortOrder={sortOrder}
                                    disabled={false}
                                />
                            ))}
                        </div>
                        {filteredResourceList
                            .slice(resourceListOffset, resourceListOffset + pageSize)
                            .map((clusterData, index) => renderResourceRow(clusterData, index))}
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
            className={`resource-list-container dc__border-left flexbox-col dc__overflow-hidden ${
                filteredResourceList?.length === 0 ? 'no-result-container' : ''
            }`}
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
                isSearchInputDisabled={isLoading}
                renderRefreshBar={renderRefreshBar}
                updateK8sResourceTab={updateK8sResourceTab}
                areFiltersHidden={areFiltersHidden}
                searchPlaceholder={searchPlaceholder}
            />
            {renderContent()}
            {children}
        </div>
    )
}

export default BaseResourceList
