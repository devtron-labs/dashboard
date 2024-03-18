import React, { useEffect, useRef, useState } from 'react'
import { useHistory, useParams, useRouteMatch, useLocation } from 'react-router-dom'
import { ConditionalWrap, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import WebWorker from '../../app/WebWorker'
import searchWorker from '../../../config/searchWorker'
import { highlightSearchedText } from '../../common/helpers/Helpers'
import { Pagination } from '../../common'
import ResourceBrowserActionMenu from './ResourceBrowserActionMenu'
import {
    ALL_NAMESPACE_OPTION,
    K8S_EMPTY_GROUP,
    RESOURCE_EMPTY_PAGE_STATE,
    RESOURCE_LIST_EMPTY_STATE,
    RESOURCE_PAGE_SIZE_OPTIONS,
    SIDEBAR_KEYS,
    EVENT_LIST,
} from '../Constants'
import { K8SResourceListType, ResourceDetailType } from '../Types'
import ResourceListEmptyState from './ResourceListEmptyState'
import { EventList } from './EventList'
import ResourceFilterOptions from './ResourceFilterOptions'
import {
    getEventObjectTypeGVK,
    getScrollableResourceClass,
    sortEventListData,
    removeDefaultForStorageClass,
} from '../Utils'
import { URLS } from '../../../config'
import { Nodes } from '../../app/types'

export const K8SResourceList = ({
    selectedResource,
    resourceList,
    noResults,
    selectedCluster,
    namespaceOptions,
    selectedNamespace,
    resourceListLoader,
    searchText,
    setSearchText,
    isCreateModalOpen,
    addTab,
    renderCallBackSync,
    syncError,
    k8SObjectMapRaw,
    updateTabUrl,
}: K8SResourceListType) => {
    const { push, replace } = useHistory()
    const { url } = useRouteMatch()
    const location = useLocation()
    const { clusterId, namespace, nodeType, node } = useParams<{
        clusterId: string
        namespace: string
        nodeType: string
        node: string
    }>()
    const [fixedNodeNameColumn, setFixedNodeNameColumn] = useState(false)
    const [resourceListOffset, setResourceListOffset] = useState(0)
    const [pageSize, setPageSize] = useState(100)
    const [filteredResourceList, setFilteredResourceList] = useState([])
    const resourceListRef = useRef<HTMLDivElement>(null)
    const showPaginatedView = resourceList?.data?.length >= 100
    const searchWorkerRef = useRef(null)

    useEffect(() => {
        if (!resourceList) {
            return
        }
        let data = resourceList.data
        if (selectedResource?.gvk.Kind === SIDEBAR_KEYS.eventGVK.Kind && data.length) {
            data = sortEventListData(data)
        }
        if (selectedResource?.gvk.Kind === Nodes.StorageClass) {
            data = removeDefaultForStorageClass(data)
        }
        setFilteredResourceList(data)
    }, [resourceList])

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
        resetPaginator()
    }, [nodeType])

    useEffect(() => {
        return () => {
            if (!searchWorkerRef.current) {
                return
            }
            searchWorkerRef.current.postMessage({ type: 'stop' })
            searchWorkerRef.current = null
        }
    }, [])

    const resetPaginator = () => {
        setResourceListOffset(0)
        setPageSize(100)
    }

    const handleFilterChanges = (
        _searchText: string,
        _resourceList: ResourceDetailType,
        hideLoader?: boolean,
    ): void => {
        if (!searchWorkerRef.current) {
            searchWorkerRef.current = new WebWorker(searchWorker)
            searchWorkerRef.current.onmessage = (e) => {
                setFilteredResourceList(e.data)
            }
        }

        if (resourceList) {
            searchWorkerRef.current.postMessage({
                type: 'start',
                payload: {
                    searchText: _searchText,
                    list: _resourceList.data,
                    searchInKeys: [
                        'name',
                        'namespace',
                        'status',
                        'message',
                        EVENT_LIST.dataKeys.involvedObject,
                        'source',
                        'reason',
                        'type',
                        'age',
                        'node',
                        'ip',
                    ],
                    origin: new URL(window.__BASE_URL__, window.location.href).origin,
                },
            })
        }
    }

    const handleResourceClick = (e) => {
        const { name, tab, namespace, origin } = e.currentTarget.dataset
        let resourceParam
        let kind
        let resourceName
        let _group
        const _namespace = namespace ?? ALL_NAMESPACE_OPTION.value
        if (origin === 'event') {
            const [_kind, _resourceName] = name.split('/')
            const _selectedResource = getEventObjectTypeGVK(k8SObjectMapRaw, _kind)
            _group = _selectedResource?.Group.toLowerCase() || K8S_EMPTY_GROUP
            resourceParam = `${_kind}/${_group}/${_resourceName}`
            kind = _kind
            resourceName = _resourceName
        } else {
            resourceParam = `${nodeType}/${selectedResource?.gvk?.Group?.toLowerCase() || K8S_EMPTY_GROUP}/${name}`
            kind = nodeType
            resourceName = name
            _group = selectedResource?.gvk?.Group?.toLowerCase() || K8S_EMPTY_GROUP
        }

        const _url = `${URLS.RESOURCE_BROWSER}/${clusterId}/${_namespace}/${resourceParam}${
            tab ? `/${tab.toLowerCase()}` : ''
        }`
        const idPrefix = kind === 'node' ? `${_group}` : `${_group}_${_namespace}`
        const isAdded = addTab(idPrefix, kind, resourceName, _url)

        if (isAdded) {
            push(_url)
        }
    }

    const handleNodeClick = (e) => {
        const { name } = e.currentTarget.dataset
        const _url = `${url.split('/').slice(0, -2).join('/')}/node/${K8S_EMPTY_GROUP}/${name}`
        const isAdded = addTab(K8S_EMPTY_GROUP, 'node', name, _url)
        if (isAdded) {
            push(_url)
        }
    }

    const getStatusClass = (status: string) => {
        let statusPostfix = status?.toLowerCase()

        if (statusPostfix && (statusPostfix.includes(':') || statusPostfix.includes('/'))) {
            statusPostfix = statusPostfix.replace(':', '__').replace('/', '__')
        }

        return `f-${statusPostfix}`
    }

    const renderResourceRow = (resourceData: Record<string, any>, index: number): JSX.Element => {
        return (
            <div
                key={`row--${index}-${resourceData.name}`}
                className="dc_width-max-content dc_min-w-100 fw-4 cn-9 fs-13 dc__border-bottom-n1 pr-20 hover-class h-44 flexbox  dc__visible-hover dc__hover-n50"
            >
                {resourceList.headers.map((columnName, idx) =>
                    columnName === 'name' ? (
                        <div
                            key={`${resourceData.name}-${idx}`}
                            className={`w-350 dc__inline-flex mr-16 pl-20 pr-8 pt-12 pb-12 ${
                                fixedNodeNameColumn ? 'dc__position-sticky sticky-column dc__border-right' : ''
                            }`}
                        >
                            <div className="w-100 flex left" data-testid="created-resource-name">
                                <div className="w-303 pr-4">
                                    <div className="dc__w-fit-content dc__mxw-304 pr-4">
                                        <Tippy
                                            className="default-tt"
                                            arrow={false}
                                            placement="right"
                                            content={resourceData.name}
                                        >
                                            <a
                                                className="dc__highlight-text dc__link dc__ellipsis-right dc__block cursor"
                                                data-name={resourceData.name}
                                                data-namespace={resourceData.namespace}
                                                onClick={handleResourceClick}
                                            >
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: highlightSearchedText(searchText, resourceData.name),
                                                    }}
                                                />
                                            </a>
                                        </Tippy>
                                    </div>
                                </div>
                                <ResourceBrowserActionMenu
                                    clusterId={clusterId}
                                    resourceData={resourceData}
                                    selectedResource={selectedResource}
                                    handleResourceClick={handleResourceClick}
                                />
                            </div>
                        </div>
                    ) : (
                        <div
                            key={`${resourceData.name}-${idx}`}
                            className={`dc__highlight-text dc__inline-block dc__ellipsis-right mr-16 pt-12 pb-12 w-150 ${
                                columnName === 'status'
                                    ? ` app-summary__status-name ${getStatusClass(resourceData[columnName])}`
                                    : ''
                            }`}
                        >
                            <ConditionalWrap
                                condition={columnName === 'node'}
                                wrap={(children) => (
                                    <a
                                        className="dc__highlight-text dc__link dc__ellipsis-right dc__block cursor"
                                        data-name={resourceData[columnName]}
                                        onClick={handleNodeClick}
                                    >
                                        {children}
                                    </a>
                                )}
                            >
                                <span
                                    data-testid={`${columnName}-count`}
                                    dangerouslySetInnerHTML={{
                                        __html: highlightSearchedText(searchText, resourceData[columnName]?.toString()),
                                    }}
                                />
                            </ConditionalWrap>
                        </div>
                    ),
                )}
            </div>
        )
    }

    const emptyStateActionHandler = () => {
        setFilteredResourceList(resourceList.data)
        setSearchText('')
        replace({
            pathname: location.pathname.replace(`/${namespace}/`, `/${ALL_NAMESPACE_OPTION.value}/`),
        })
    }

    const renderEmptyPage = (): JSX.Element => {
        if (noResults) {
            return (
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
            <ResourceListEmptyState
                title={RESOURCE_LIST_EMPTY_STATE.title}
                subTitle={RESOURCE_LIST_EMPTY_STATE.subTitle(selectedResource?.gvk?.Kind)}
                actionHandler={emptyStateActionHandler}
            />
        )
    }

    const changePage = (pageNo: number) => {
        setResourceListOffset(pageSize * (pageNo - 1))

        // scroll to top on page change
        if (resourceListRef.current) {
            resourceListRef.current.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const changePageSize = (size: number) => {
        setPageSize(size)
        setResourceListOffset(0)
    }

    const renderResourceList = (): JSX.Element => {
        return (
            <div
                ref={resourceListRef}
                className={getScrollableResourceClass('scrollable-resource-list', showPaginatedView, syncError)}
            >
                <div className="h-36 fw-6 cn-7 fs-12 dc__border-bottom pr-20 dc__uppercase list-header bcn-0 dc__position-sticky">
                    {resourceList.headers.map((columnName) => (
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
                    .map((clusterData, index) => renderResourceRow(clusterData, index))}
            </div>
        )
    }

    const renderList = (): JSX.Element => {
        if (filteredResourceList.length === 0) {
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
                        syncError={syncError}
                        searchText={searchText}
                    />
                ) : (
                    renderResourceList()
                )}
                {showPaginatedView && (
                    <Pagination
                        rootClassName="resource-browser-paginator dc__border-top"
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
            className={`resource-list-container dc__border-left dc__position-rel ${
                filteredResourceList.length === 0 ? 'no-result-container' : ''
            }`}
        >
            <ResourceFilterOptions
                selectedResource={selectedResource}
                selectedCluster={selectedCluster}
                namespaceOptions={namespaceOptions}
                selectedNamespace={selectedNamespace}
                searchText={searchText}
                resourceList={resourceList}
                setSearchText={setSearchText}
                handleFilterChanges={handleFilterChanges}
                isSearchInputDisabled={resourceListLoader}
                isCreateModalOpen={isCreateModalOpen}
                renderCallBackSync={renderCallBackSync}
                updateTabUrl={updateTabUrl}
            />
            {resourceListLoader ? <Progressing pageLoader /> : renderList()}
        </div>
    )
}
