import React, { useEffect, useRef, useState } from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { highlightSearchedText } from '../../common/helpers/Helpers'
import { Pagination } from '../../common'
import ResourceBrowserActionMenu from './ResourceBrowserActionMenu'
import {
    K8S_EMPTY_GROUP,
    K8S_RESOURCE_LIST,
    RESOURCE_EMPTY_PAGE_STATE,
    RESOURCE_LIST_EMPTY_STATE,
    RESOURCE_PAGE_SIZE_OPTIONS,
    SIDEBAR_KEYS,
} from '../Constants'
import { K8SResourceListType } from '../Types'
import ResourceListEmptyState from './ResourceListEmptyState'
import { toast } from 'react-toastify'
import { EventList } from './EventList'
import Tippy from '@tippyjs/react'
import ResourceFilterOptions from './ResourceFilterOptions'

export function K8SResourceList({
    selectedResource,
    resourceList,
    filteredResourceList,
    noResults,
    clusterOptions,
    selectedCluster,
    onChangeCluster,
    namespaceOptions,
    selectedNamespace,
    setSelectedNamespace,
    resourceListLoader,
    getResourceListData,
    updateNodeSelectionData,
    searchText,
    setSearchText,
    searchApplied,
    setSearchApplied,
    handleFilterChanges,
    clearSearch,
    isCreateModalOpen,
    addTab,
}: K8SResourceListType) {
    const { push } = useHistory()
    const { url } = useRouteMatch()
    const { clusterId, namespace, nodeType, node, group } = useParams<{
        clusterId: string
        namespace: string
        nodeType: string
        node: string
        group: string
    }>()
    const [fixedNodeNameColumn, setFixedNodeNameColumn] = useState(false)
    const [resourceListOffset, setResourceListOffset] = useState(0)
    const [pageSize, setPageSize] = useState(100)
    const resourceListRef = useRef<HTMLDivElement>(null)
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
            let clientWidth = 0
            setFixedNodeNameColumn(windowWidth < clientWidth || windowWidth < appliedColumnDerivedWidth)
        }
    }, [resourceList?.headers])

    useEffect(() => {
        resetPaginator()
    }, [nodeType])

    const resetPaginator = () => {
        setResourceListOffset(0)
        setPageSize(100)
    }

    const handleResourceClick = (e) => {
        const { name, tab, namespace, origin } = e.currentTarget.dataset
        let resourceParam, kind, resourceName, _nodeSelectionData

        if (origin === 'event') {
            const [_kind, _resourceName] = name.split('/')
            resourceParam = `${_kind}/${
                selectedResource?.gvk?.Group?.toLowerCase() || K8S_EMPTY_GROUP
            }/${_resourceName}`
            kind = _kind
            resourceName = _resourceName
            _nodeSelectionData = { name: kind + '_' + resourceName, namespace, isFromEvent: true }
        } else {
            resourceParam = `${nodeType}/${selectedResource?.gvk?.Group?.toLowerCase() || K8S_EMPTY_GROUP}/${name}`
            kind = nodeType
            resourceName = name
            _nodeSelectionData = resourceList.data.find((resource) => resource.name === name || resource.name === node)
        }

        const _url = `${url
            .split('/')
            .slice(0, group ? -2 : -1)
            .join('/')}/${resourceParam}${tab ? `/${tab.toLowerCase()}` : ''}`

        const isAdded = addTab(selectedResource?.gvk?.Group?.toLowerCase() || K8S_EMPTY_GROUP, kind, resourceName, _url)

        if (isAdded) {
            updateNodeSelectionData(_nodeSelectionData)
            push(_url)
        } else {
            toast.error(
                <div>
                    <div>{K8S_RESOURCE_LIST.tabError.maxTabTitle}</div>
                    <p>{K8S_RESOURCE_LIST.tabError.maxTabSubTitle}</p>
                </div>,
            )
        }
    }

    const handleNodeClick = (e) => {
        const {name} = e.currentTarget.dataset
        const beginpart = window.location.href.split('/resource-browser')[0]
        const _url = `${beginpart}/clusters/${clusterId}/${name}`
        window.open(_url, 'blank')
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
                className="dc_width-max-content dc_min-w-100 fw-4 cn-9 fs-13 dc__border-bottom-n1 pr-20 hover-class h-44 flexbox  dc__visible-hover"
            >
                {resourceList.headers.map((columnName, idx) =>
                    columnName === 'name' ? (
                        <div
                            key={`${resourceData.name}-${idx}`}
                            className={`w-350 dc__inline-flex mr-16 pl-20 pr-8 pt-12 pb-12 ${
                                fixedNodeNameColumn ? ' bcn-0 dc__position-sticky  sticky-column dc__border-right' : ''
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
                                                onClick={handleResourceClick}
                                            >
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: highlightSearchedText(searchText, resourceData.name),
                                                    }}
                                                ></span>
                                            </a>
                                        </Tippy>
                                    </div>
                                </div>
                                <ResourceBrowserActionMenu
                                    clusterId={clusterId}
                                    resourceData={resourceData}
                                    selectedResource={selectedResource}
                                    getResourceListData={getResourceListData}
                                    handleResourceClick={handleResourceClick}
                                />
                            </div>
                        </div>
                    ) : (
                        (selectedResource?.gvk?.Kind === 'Pod' &&  columnName === 'node' ?
                         (
                            <div className="dc__highlight-text dc__inline-block dc__ellipsis-right mr-16 pt-12 pb-12 w-150">
                                <a
                                    className="dc__highlight-text dc__link dc__ellipsis-right dc__block cursor"
                                    data-name={resourceData[columnName]}
                                    onClick={handleNodeClick}
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: highlightSearchedText(
                                                searchText,
                                                resourceData[columnName].toString(),
                                            ),
                                        }}
                                    ></span>
                                </a>
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
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: highlightSearchedText(searchText, resourceData[columnName].toString()),
                                    }}
                                ></span>
                            </div>
                        ))
                    ),
                )}
            </div>
        )
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
        } else {
            return (
                <ResourceListEmptyState
                    title={RESOURCE_LIST_EMPTY_STATE.title}
                    subTitle={RESOURCE_LIST_EMPTY_STATE.subTitle(selectedResource?.gvk?.Kind)}
                    actionHandler={clearSearch}
                />
            )
        }
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
                className={`scrollable-resource-list ${showPaginatedView ? 'paginated-list-view' : ''}`}
            >
                <div className="fw-6 cn-7 fs-12 dc__border-bottom pr-20 dc__uppercase list-header bcn-0 dc__position-sticky">
                    {resourceList.headers.map((columnName) => (
                        (selectedResource?.gvk?.Kind == 'Pod'  &&
                        <div
                            key={columnName}
                            className={`h-36 list-title dc__inline-block mr-16 pt-8 pb-8 dc__ellipsis-right ${
                                columnName === 'name'
                                    ? `${
                                          fixedNodeNameColumn
                                              ? 'bcn-0 dc__position-sticky  sticky-column dc__border-right'
                                              : ''
                                      } w-350 pl-20`
                                    : 'w-150'
                            }`}
                        >
                            {columnName}
                        </div>
                    )))}
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
        } else {
            return (
                <>
                    {selectedResource?.gvk.Kind === SIDEBAR_KEYS.eventGVK.Kind ? (
                        <EventList
                            listRef={resourceListRef}
                            filteredData={filteredResourceList.slice(resourceListOffset, resourceListOffset + pageSize)}
                            handleResourceClick={handleResourceClick}
                            paginatedView={showPaginatedView}
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
    }

    return (
        <div
            className={`resource-list-container dc__border-left dc__postion-rel ${
                filteredResourceList.length === 0 ? 'no-result-container' : ''
            }`}
        >
            <ResourceFilterOptions
                selectedResource={selectedResource}
                clusterOptions={clusterOptions}
                selectedCluster={selectedCluster}
                onChangeCluster={onChangeCluster}
                namespaceOptions={namespaceOptions}
                selectedNamespace={selectedNamespace}
                setSelectedNamespace={setSelectedNamespace}
                searchText={searchText}
                searchApplied={searchApplied}
                resourceList={resourceList}
                setSearchText={setSearchText}
                setSearchApplied={setSearchApplied}
                handleFilterChanges={handleFilterChanges}
                clearSearch={clearSearch}
                isSearchInputDisabled={resourceListLoader}
                isCreateModalOpen={isCreateModalOpen}
            />
            {resourceListLoader ? <Progressing pageLoader /> : renderList()}
        </div>
    )
}
