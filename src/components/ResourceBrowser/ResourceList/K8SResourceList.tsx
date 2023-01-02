import React, { useState } from 'react'
import { NavLink, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import { getElapsedTime, Progressing } from '../../common'
import ResourceBrowserActionMenu from './ResourceBrowserActionMenu'
import { CLUSTER_SELECT_STYLE } from '../Constants'
import { Nodes } from '../../app/types'
import { ResourceDetail } from '../Types'
import ResourceListEmptyState from './ResourceListEmptyState'
import ReactSelect from 'react-select'
import { Option } from '../../../components/v2/common/ReactSelect.utils'
import '../ResourceBrowser.scss'

export function K8SResourceList({
  selectedGVK,
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
}) {
    const { push } = useHistory()

    const location = useLocation()
    const match = useRouteMatch()
    const { clusterId, namespace } = useParams<{
        clusterId: string
        namespace: string
        nodeType: string
        node: string
    }>()
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)

    const handleFilterChanges = (_searchText: string): void => {
        const _filteredData = resourceList.filter(
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

    const onChangeNamespace = (selected): void => {
        setSelectedNamespace(selected)
        push({
            pathname: location.pathname.replace(`/${namespace}/`, `/${selected.value}/`),
        })
    }

    const renderSearch = (): JSX.Element => {
        return (
            <div className="flexbox dc__content-space pt-16 pr-20 pb-16 pl-20">
                <div className="search dc__position-rel margin-right-0 en-2 bw-1 br-4 h-32">
                    <Search className="search__icon icon-dim-18" />
                    <input
                        type="text"
                        placeholder="Search clusters"
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
                        className="w-200"
                        placeholder="Select Containers"
                        options={clusterOptions}
                        value={selectedCluster}
                        onChange={onChangeCluster}
                        styles={CLUSTER_SELECT_STYLE}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                        }}
                    />
                    <ReactSelect
                        placeholder="Select Containers"
                        className="w-200 ml-8"
                        options={namespaceOptions}
                        value={selectedNamespace}
                        onChange={onChangeNamespace}
                        styles={CLUSTER_SELECT_STYLE}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                        }}
                    />
                </div>
            </div>
        )
    }
    const handleResourceClick = (ev, resourceData: ResourceDetail): void => {}

    const renderResourceRow = (resourceData: ResourceDetail): JSX.Element => {
        return (
            <div className="resource-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20">
                <div className="cb-5 dc__ellipsis-right">
                    <NavLink
                        to={`${match.url}/${resourceData.name}`}
                        onClick={(e) => {
                            handleResourceClick(e, resourceData)
                        }}
                    >
                        {resourceData.name}
                    </NavLink>
                </div>
                <div>{resourceData.status}</div>
                <div>{resourceData.namespace}</div>
                <div>{resourceData.ready}</div>
                <div>{resourceData.restarts}</div>
                <div>{getElapsedTime(new Date(resourceData.age))}</div>
                <ResourceBrowserActionMenu resourceData={resourceData} nodeType={selectedGVK?.kind as Nodes} />
            </div>
        )
    }

    const renderEmptyPage = (): JSX.Element => {
        if (noResults) {
            return (
                <ResourceListEmptyState
                    subTitle={`We could not find any ${selectedGVK?.kind}. Try selecting a different cluster or namespace.`}
                />
            )
        } else {
            return (
                <ResourceListEmptyState
                    title="No matching results"
                    subTitle={`We could not find any matching ${selectedGVK?.kind}.`}
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
                <div className="dc__overflow-scroll" style={{ height: `calc('100vh'} - 125px)` }}>
                    <div className="resource-list-row fw-6 cn-7 fs-12 dc__border-bottom pt-8 pb-8 pr-20 pl-20 dc__uppercase">
                        <div>Name</div>
                        <div>STATUS</div>
                        <div>NAMESPACE</div>
                        <div>Ready</div>
                        <div>RESTARTS</div>
                        <div>AGE</div>
                        <div></div>
                    </div>
                    {filteredResourceList?.map((clusterData) => renderResourceRow(clusterData))}
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
