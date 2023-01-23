import React, { useEffect, useState } from 'react'
import { useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import { Progressing } from '../../common'
import ResourceBrowserActionMenu from './ResourceBrowserActionMenu'
import { CLUSTER_SELECT_STYLE, EVENT_LIST, K8S_RESOURCE_LIST, SIDEBAR_KEYS } from '../Constants'
import { K8SResourceListType } from '../Types'
import ResourceListEmptyState from './ResourceListEmptyState'
import ReactSelect from 'react-select'
import { Option } from '../../../components/v2/common/ReactSelect.utils'
import AppDetailsStore from '../../v2/appDetails/appDetails.store'
import { toast } from 'react-toastify'
import { EventList } from './EventList'
import Tippy from '@tippyjs/react'

export function K8SResourceList({
    selectedResource,
    resourceList,
    filteredResourceList,
    setFilteredResourceList,
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
}: K8SResourceListType) {
    const { push } = useHistory()
    const { url } = useRouteMatch()
    const location = useLocation()
    const { clusterId, namespace, nodeType, node } = useParams<{
        clusterId: string
        namespace: string
        nodeType: string
        node: string
    }>()
    const [fixedNodeNameColumn, setFixedNodeNameColumn] = useState(false)

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

    const handleFilterChanges = (_searchText: string): void => {
        const lowerCaseSearchText = _searchText.toLowerCase()
        const _filteredData = resourceList.data.filter(
            (resource) =>
                resource.name?.toLowerCase().indexOf(lowerCaseSearchText) >= 0 ||
                resource.namespace?.toLowerCase().indexOf(lowerCaseSearchText) >= 0 ||
                resource.status?.toLowerCase().indexOf(lowerCaseSearchText) >= 0 ||
                resource.message?.toLowerCase().indexOf(lowerCaseSearchText) >= 0 ||
                resource[EVENT_LIST.dataKeys.involvedObject]?.toLowerCase().indexOf(lowerCaseSearchText) >= 0 ||
                resource.source?.toLowerCase().indexOf(lowerCaseSearchText) >= 0 ||
                resource.reason?.toLowerCase().indexOf(lowerCaseSearchText) >= 0 ||
                resource.type?.toLowerCase().indexOf(lowerCaseSearchText) >= 0,
        )
        setFilteredResourceList(_filteredData)
    }

    const clearSearch = (): void => {
        if (searchApplied) {
            handleFilterChanges('')
            setSearchApplied(false)
        }
        setSearchText('')
    }

    const handleFilterKeyPress = (event): void => {
        const theKeyCode = event.key
        if (theKeyCode === 'Backspace' && searchText.length === 1) {
            clearSearch()
        } else {
            handleFilterChanges(event.target.value)
            setSearchApplied(true)
        }
    }

    const handleOnChangeSearchText = (event): void => {
        setSearchText(event.target.value)
    }

    const handleClusterChange = (selected): void => {
        onChangeCluster(selected)
    }

    const handleNamespaceChange = (selected): void => {
        if (selected.value === selectedNamespace?.value) {
            return
        }
        setSelectedNamespace(selected)
        push({
            pathname: location.pathname.replace(`/${namespace}/`, `/${selected.value}/`),
        })
    }

    const handleResourceClick = (e) => {
        const { name, tab, namespace, origin } = e.currentTarget.dataset
        let resourceParam, kind, resourceName, _nodeSelectionData

        if (origin === 'event') {
            resourceParam = name
            const [_kind, _resourceName] = name.split('/')
            kind = _kind
            resourceName = _resourceName
            _nodeSelectionData = { name: kind + '_' + resourceName, namespace, isFromEvent: true }
        } else {
            resourceParam = `${nodeType}/${name}`
            kind = nodeType
            resourceName = name
            _nodeSelectionData = resourceList.data.find((resource) => resource.name === name || resource.name === node)
        }

        const _url = `${url.split('/').slice(0, -1).join('/')}/${resourceParam}${tab ? `/${tab.toLowerCase()}` : ''}`

        const isAdded = AppDetailsStore.addAppDetailsTab(kind, resourceName, _url)

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

    const renderSearch = (): JSX.Element => {
        return (
            <div className="flexbox dc__content-space pt-16 pr-20 pb-12 pl-20">
                <div className="search dc__position-rel margin-right-0 en-2 bw-1 br-4 h-32">
                    <Search className="search__icon icon-dim-18" />
                    <input
                        type="text"
                        placeholder={`Search ${selectedResource?.gvk?.Kind || ''}`}
                        value={searchText}
                        className="search__input"
                        onChange={handleOnChangeSearchText}
                        onKeyUp={handleFilterKeyPress}
                    />
                    {searchApplied && (
                        <button className="search__clear-button" type="button" onClick={clearSearch}>
                            <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                        </button>
                    )}
                </div>
                <div className="flex">
                    <ReactSelect
                        className="w-220"
                        placeholder="Select Cluster"
                        options={clusterOptions}
                        value={selectedCluster}
                        onChange={handleClusterChange}
                        styles={CLUSTER_SELECT_STYLE}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                        }}
                    />
                    {selectedResource?.namespaced && (
                        <ReactSelect
                            placeholder="Select Namespace"
                            className="w-220 ml-8"
                            options={namespaceOptions}
                            value={selectedNamespace}
                            onChange={handleNamespaceChange}
                            styles={CLUSTER_SELECT_STYLE}
                            components={{
                                IndicatorSeparator: null,
                                Option,
                            }}
                        />
                    )}
                </div>
            </div>
        )
    }

    const renderResourceRow = (resourceData: Record<string, any>, index: number): JSX.Element => {
        return (
            <div
                key={`${resourceData.name}-${index}`}
                className="dc_width-max-content dc_min-w-100 fw-4 cn-9 fs-13 dc__border-bottom-n1 pr-20 hover-class h-44 flexbox  dc__visible-hover"
            >
                {resourceList.headers.map((columnName) =>
                    columnName === 'name' ? (
                        <div
                            className={`w-350 dc__inline-flex mr-16 pl-20 pr-8 pt-12 pb-12 ${
                                fixedNodeNameColumn ? ' bcn-0 dc__position-sticky  sticky-column dc__border-right' : ''
                            }`}
                        >
                            <div className="w-100 flex left">
                                <div className="w-303 pr-4">
                                    <div className="dc__w-fit-content dc__mxw-304 pr-4">
                                        <Tippy
                                            className="default-tt"
                                            arrow={false}
                                            placement="right"
                                            content={resourceData.name}
                                        >
                                            <a
                                                className="dc__link dc__ellipsis-right dc__block cursor"
                                                data-name={resourceData.name}
                                                onClick={handleResourceClick}
                                            >
                                                {resourceData.name}
                                            </a>
                                        </Tippy>
                                    </div>
                                </div>
                                <ResourceBrowserActionMenu
                                    clusterId={clusterId}
                                    namespace={namespace}
                                    resourceData={resourceData}
                                    selectedResource={selectedResource}
                                    getResourceListData={getResourceListData}
                                    handleResourceClick={handleResourceClick}
                                />
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`dc__inline-block dc__ellipsis-right mr-16 pt-12 pb-12 w-150 ${
                                columnName === 'status'
                                    ? ` app-summary__status-name f-${resourceData[columnName]?.toLowerCase()}`
                                    : ''
                            }`}
                        >
                            {resourceData[columnName]}
                        </div>
                    ),
                )}
            </div>
        )
    }

    const renderEmptyPage = (): JSX.Element => {
        if (noResults) {
            return (
                <ResourceListEmptyState
                    subTitle={`We could not find any ${selectedResource?.gvk?.Kind}. Try selecting a different cluster${
                        selectedResource.namespaced ? ' or namespace.' : '.'
                    }`}
                />
            )
        } else {
            return (
                <ResourceListEmptyState
                    title="No matching results"
                    subTitle={`We could not find any matching ${selectedResource?.gvk?.Kind}.`}
                    actionHandler={clearSearch}
                />
            )
        }
    }

    const renderList = (): JSX.Element => {
        if (filteredResourceList.length === 0) {
            return renderEmptyPage()
        } else {
            if (selectedResource?.gvk.Kind === SIDEBAR_KEYS.eventGVK.Kind) {
                return <EventList filteredData={filteredResourceList} handleResourceClick={handleResourceClick} />
            }
            return (
                <div className="scrollable-resource-list">
                    <div className=" fw-6 cn-7 fs-12 dc__border-bottom pr-20 dc__uppercase list-header  bcn-0 dc__position-sticky ">
                        {resourceList.headers.map((columnName) => (
                            <div
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
                        ))}
                    </div>
                    {filteredResourceList?.map((clusterData, index) => renderResourceRow(clusterData, index))}
                </div>
            )
        }
    }

    return (
        <div
            className={`resource-list-container dc__border-left ${
                filteredResourceList.length === 0 ? 'no-result-container' : ''
            }`}
        >
            {renderSearch()}
            {resourceListLoader ? <Progressing pageLoader /> : renderList()}
        </div>
    )
}
