import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useHistory, useParams, useRouteMatch, useLocation } from 'react-router-dom'
import DOMPurify from 'dompurify'
import Tippy from '@tippyjs/react'
import {
    ConditionalWrap,
    Progressing,
    useAsync,
    abortPreviousRequests,
    highlightSearchText,
    Pagination,
    useSearchString,
    Nodes,
    showError,
    getIsRequestAborted,
    noop,
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
} from '../Constants'
import { getResourceList, getResourceListPayload } from '../ResourceBrowser.service'
import { K8SResourceListType, ResourceDetailDataType, ResourceDetailType, URLParams } from '../Types'
import ResourceListEmptyState from './ResourceListEmptyState'
import { EventList } from './EventList'
import ResourceFilterOptions from './ResourceFilterOptions'
import {
    getScrollableResourceClass,
    sortEventListData,
    removeDefaultForStorageClass,
    updateQueryString,
    getRenderNodeButton,
} from '../Utils'
import { URLS } from '../../../config'

const PodRestartIcon = importComponentFromFELibrary('PodRestartIcon')
const PodRestart = importComponentFromFELibrary('PodRestart')
const getFilterOptionsFromSearchParams = importComponentFromFELibrary(
    'getFilterOptionsFromSearchParams',
    null,
    'function',
)

export const K8SResourceList = ({
    selectedResource,
    selectedCluster,
    addTab,
    renderRefreshBar,
    isOpen,
    showStaleDataWarning,
    updateK8sResourceTab,
}: K8SResourceListType) => {
    const { searchParams } = useSearchString()
    const { push } = useHistory()
    const { url } = useRouteMatch()
    const location = useLocation()
    const { clusterId, nodeType, group } = useParams<URLParams>()
    const [selectedNamespace, setSelectedNamespace] = useState(ALL_NAMESPACE_OPTION)
    const [fixedNodeNameColumn, setFixedNodeNameColumn] = useState(false)
    const [resourceListOffset, setResourceListOffset] = useState(0)
    const [pageSize, setPageSize] = useState(100)
    const [filteredResourceList, setFilteredResourceList] = useState<ResourceDetailType['data']>(null)
    const resourceListRef = useRef<HTMLDivElement>(null)
    const searchWorkerRef = useRef(null)
    const abortControllerRef = useRef(new AbortController())

    const searchText = searchParams[SEARCH_QUERY_PARAM_KEY] || ''

    /* NOTE: _filters is an object */
    const _filters = getFilterOptionsFromSearchParams?.(location.search)
    const filters = useMemo(() => _filters, [JSON.stringify(_filters)])

    const [resourceListLoader, _resourceList, _resourceListDataError, reloadResourceListData] = useAsync(
        () => {
            return abortPreviousRequests(
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
            )
        },
        [selectedResource, clusterId, selectedNamespace, filters],
        selectedResource && selectedResource.gvk.Kind !== SIDEBAR_KEYS.nodeGVK.Kind,
    )

    const resourceListDataError = getIsRequestAborted(_resourceListDataError) ? null : _resourceListDataError

    const resourceList = _resourceList?.result || null

    const showPaginatedView = resourceList?.data?.length >= 100

    useEffect(() => {
        if (resourceList?.headers.length) {
            /**
             * 166 is standard with of every column for calculations
             * 295 is width of left nav + sidebar
             * 200 is the diff of name column
             */
            const appliedColumnDerivedWidth = resourceList.headers.length * 166 + 295 + 200
            const windowWidth = window.innerWidth
            const clientWidth = 0
            setFixedNodeNameColumn(windowWidth < clientWidth || windowWidth < appliedColumnDerivedWidth)
        }
    }, [resourceList?.headers])

    useEffect(() => {
        return () => {
            if (!searchWorkerRef.current) {
                return
            }
            searchWorkerRef.current.postMessage({ type: 'stop' })
            searchWorkerRef.current = null
        }
    }, [])

    useEffect(() => {
        setResourceListOffset(0)
        setPageSize(100)
    }, [nodeType])

    const handleFilterChanges = (_searchText: string, data: ResourceDetailType): void => {
        if (!searchWorkerRef.current) {
            searchWorkerRef.current = new WebWorker(searchWorker)
            searchWorkerRef.current.onmessage = (e) => setFilteredResourceList(e.data)
        }

        if (resourceList) {
            searchWorkerRef.current.postMessage({
                type: 'start',
                payload: {
                    searchText: _searchText,
                    list: data?.data || [],
                    origin: new URL(window.__BASE_URL__, window.location.href).origin,
                },
            })
        }
    }

    useEffect(() => {
        if (!resourceList) {
            setFilteredResourceList(null)
            return
        }
        switch (selectedResource?.gvk.Kind) {
            case SIDEBAR_KEYS.nodeGVK.Kind:
                resourceList.data = sortEventListData(resourceList.data)
                break
            case Nodes.StorageClass:
                resourceList.data = removeDefaultForStorageClass(resourceList.data)
                break
            default:
                break
        }
        resourceList.data = resourceList.data.map((data, index) => ({ id: index, ...data }))
        handleFilterChanges(searchText, resourceList)
    }, [resourceList])

    const setSearchText = (text: string) => {
        const searchParamString = updateQueryString(location, [[SEARCH_QUERY_PARAM_KEY, text]])
        const _url = `${location.pathname}?${searchParamString}`
        updateK8sResourceTab(_url)
        push(_url)
        handleFilterChanges(text, resourceList)
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

    const renderResourceRow = (resourceData: ResourceDetailDataType): JSX.Element => {
        return (
            <div
                key={`${resourceData.id}-${resourceData.name}`}
                className="dc__min-width-fit-content fw-4 cn-9 fs-13 dc__border-bottom-n1 pr-20 hover-class h-44 flexbox dc__gap-16 dc__visible-hover dc__hover-n50"
            >
                {resourceList?.headers.map((columnName) =>
                    columnName === 'name' ? (
                        <div
                            key={`${resourceData.id}-${columnName}`}
                            className={`w-350 dc__inline-flex dc__no-shrink pl-20 pr-8 pt-12 pb-12 ${
                                fixedNodeNameColumn ? 'dc__position-sticky sticky-column dc__border-right' : ''
                            }`}
                        >
                            <div className="w-100 flexbox dc__content-space" data-testid="created-resource-name">
                                <Tippy
                                    className="default-tt"
                                    arrow={false}
                                    placement="right"
                                    content={resourceData.name}
                                >
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
                                </Tippy>
                                <ResourceBrowserActionMenu
                                    clusterId={clusterId}
                                    resourceData={resourceData}
                                    getResourceListData={reloadResourceListData as () => Promise<void>}
                                    selectedResource={selectedResource}
                                    handleResourceClick={handleResourceClick}
                                />
                            </div>
                        </div>
                    ) : (
                        <div
                            key={`${resourceData.id}-${columnName}`}
                            className={`flexbox dc__align-items-center pt-12 pb-12 w-150 ${
                                columnName === 'status'
                                    ? ` app-summary__status-name ${getStatusClass(String(resourceData[columnName]))}`
                                    : ''
                            }`}
                        >
                            <ConditionalWrap
                                condition={columnName === 'node'}
                                wrap={getRenderNodeButton(resourceData, columnName, handleNodeClick)}
                            >
                                <span
                                    className="dc__ellipsis-right"
                                    data-testid={`${columnName}-count`}
                                    // eslint-disable-next-line react/no-danger
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(
                                            highlightSearchText({
                                                searchText,
                                                text: resourceData[columnName]?.toString(),
                                                highlightClasses: 'p-0 fw-6 bcy-2',
                                            }),
                                        ),
                                    }}
                                />
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

    const emptyStateActionHandler = () => {
        setFilteredResourceList(resourceList?.data)
        setSearchText('')
        const pathname = `${URLS.RESOURCE_BROWSER}/${clusterId}/${ALL_NAMESPACE_OPTION.value}/${selectedResource.gvk.Kind.toLowerCase()}/${group}`
        updateK8sResourceTab(pathname)
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

    if (resourceListDataError) {
        showError(resourceListDataError)
    }

    const renderResourceList = (): JSX.Element => {
        return (
            <div
                ref={resourceListRef}
                className={getScrollableResourceClass(
                    'scrollable-resource-list',
                    showPaginatedView,
                    showStaleDataWarning,
                )}
            >
                <div className="h-36 fw-6 cn-7 fs-12 dc__border-bottom pr-20 dc__uppercase list-header bcn-0 dc__position-sticky">
                    {resourceList?.headers.map((columnName) => (
                        <div
                            key={columnName}
                            className={`list-title dc__inline-block mr-16 pt-8 pb-8 dc__ellipsis-right ${
                                columnName === 'name'
                                    ? `${
                                          fixedNodeNameColumn
                                              ? 'bcn-0 dc__position-sticky  sticky-column dc__border-right dc__border-bottom h-35'
                                              : ''
                                      } w-350 pl-20`
                                    : 'w-150'
                            }`}
                        >
                            {columnName}
                        </div>
                    ))}
                </div>
                {filteredResourceList
                    .slice(resourceListOffset, resourceListOffset + pageSize)
                    .map((clusterData) => renderResourceRow(clusterData))}
            </div>
        )
    }

    const renderList = (): JSX.Element => {
        if (filteredResourceList?.length === 0 || resourceListDataError) {
            return renderEmptyPage()
        }
        return (
            <>
                {selectedResource?.gvk.Kind === SIDEBAR_KEYS.eventGVK.Kind ? (
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
                        rootClassName="pagination-wrapper resource-browser-paginator dc__border-top"
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
            className={`resource-list-container dc__border-left flexbox-col ${
                filteredResourceList?.length === 0 ? 'no-result-container' : ''
            }`}
        >
            <ResourceFilterOptions
                selectedResource={selectedResource}
                selectedNamespace={selectedNamespace}
                setSelectedNamespace={setSelectedNamespace}
                selectedCluster={selectedCluster}
                searchText={searchText}
                isOpen={isOpen}
                resourceList={resourceList}
                setSearchText={setSearchText}
                handleFilterChanges={handleFilterChanges}
                isSearchInputDisabled={resourceListLoader}
                renderRefreshBar={renderRefreshBar}
                updateK8sResourceTab={updateK8sResourceTab}
            />
            {!resourceListDataError && (resourceListLoader || !resourceList || !filteredResourceList) ? (
                <Progressing size={32} pageLoader />
            ) : (
                renderList()
            )}
            {PodRestart && <PodRestart />}
        </div>
    )
}
