import React, { useState } from 'react'
import { NavLink, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import { getElapsedTime, Progressing } from '../../common'
import ResourceBrowserActionMenu from './ResourceBrowserActionMenu'
import { CLUSTER_SELECT_STYLE } from '../Constants'
import { K8SResourceListType } from '../Types'
import ResourceListEmptyState from './ResourceListEmptyState'
import ReactSelect from 'react-select'
import { Option } from '../../../components/v2/common/ReactSelect.utils'
import '../ResourceBrowser.scss'
import AppDetailsStore from '../../v2/appDetails/appDetails.store'
import { toast } from 'react-toastify'

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
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)

    const handleFilterChanges = (_searchText: string): void => {
        const _filteredData = resourceList.rows.filter(
            (resource) =>
                resource.name.indexOf(_searchText) >= 0 ||
                resource.namespace.indexOf(_searchText) >= 0 ||
                resource.status.indexOf(_searchText) >= 0,
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
        if (theKeyCode === 'Enter') {
            handleFilterChanges(event.target.value)
            setSearchApplied(true)
        } else if (theKeyCode === 'Backspace' && searchText.length === 1) {
            clearSearch()
        }
    }

    const handleOnChangeSearchText = (event): void => {
        setSearchText(event.target.value)
    }

    const handleClusterChange = (selected): void => {
        onChangeCluster(selected)
    }

    const handleNamespaceChange = (selected): void => {
        setSelectedNamespace(selected)
        push({
            pathname: location.pathname.replace(`/${namespace}/`, `/${selected.value}/`),
        })
    }

    const handleActionTabClick = (_tabName: string) => {
        const _url = `${url.split('/').slice(0, -1).join('/')}/${nodeType}/${_tabName.toLowerCase()}`

        const isAdded = AppDetailsStore.addAppDetailsTab(nodeType, _tabName.toLowerCase(), _url)

        if (isAdded) {
            push(_url)
        } else {
            toast.error(
                <div>
                    <div>Max 5 tabs allowed</div>
                    <p>Please close an open tab and try again.</p>
                </div>,
            )
        }
    }

    const renderSearch = (): JSX.Element => {
        return (
            <div className="flexbox dc__content-space pt-16 pr-20 pb-16 pl-20">
                <div className="search dc__position-rel margin-right-0 en-2 bw-1 br-4 h-32">
                    <Search className="search__icon icon-dim-18" />
                    <input
                        type="text"
                        placeholder={`Search ${selectedResource?.gvk?.Kind || ''}`}
                        value={searchText}
                        className="search__input"
                        onChange={handleOnChangeSearchText}
                        onKeyDown={handleFilterKeyPress}
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
    const handleResourceClick = (ev, resourceData: Record<string, any>): void => {
        handleActionTabClick(resourceData.Name)
    }

    const renderResourceRow = (resourceData: Record<string, any>): JSX.Element => {
        return (
            <div
                key={resourceData.Name}
                className="resource-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20"
            >
                {resourceList.column.map((columnName) =>
                    columnName === 'Name' ? (
                        <div className="cb-5 dc__ellipsis-right">
                            <NavLink
                                to={`${url}/${resourceData.Name}`}
                                onClick={(e) => {
                                    handleResourceClick(e, resourceData)
                                }}
                            >
                                {resourceData.Name}
                            </NavLink>
                        </div>
                    ) : (
                        <div
                            className={`${
                                columnName === 'Status'
                                    ? `app-summary__status-name f-${resourceData[columnName].toLowerCase()}`
                                    : ''
                            }`}
                        >
                            {resourceData[columnName]}
                        </div>
                    ),
                )}
                <div className="dc__align-right"><ResourceBrowserActionMenu
                    clusterId={clusterId}
                    namespace={namespace}
                    resourceData={resourceData}
                    selectedResource={selectedResource}
                    getResourceListData={getResourceListData}
                /></div>
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
            return (
                <div>
                    <div className="resource-list-row fw-6 cn-7 fs-12 dc__border-bottom pt-8 pb-8 pr-20 pl-20 dc__uppercase">
                        {resourceList.column.map((columnName) => (
                            <div>{columnName}</div>
                        ))}
                        <div></div>
                    </div>
                    <div className="scrollable-resource-list">
                        {filteredResourceList?.map((clusterData) => renderResourceRow(clusterData))}
                    </div>
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
