import React, { useEffect, useState } from 'react'
import { NavLink, useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { URLS } from '../../../config'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import { convertToOptionsList, getElapsedTime, Progressing, showError } from '../../common'
import ResourceBrowserActionMenu from './ResourceBrowserActionMenu'
import { getClusterListMinWithoutAuth } from '../../../services/service'
import { namespaceListByClusterId } from '../ResourceBrowser.service'
import { ALL_NAMESPACE_OPTION, CLUSTER_SELECT_STYLE } from '../Constants'
import { Nodes, OptionType } from '../../app/types'
import { ResourceDetail } from '../Types'
import ResourceListEmptyState from './ResourceListEmptyState'
import ReactSelect from 'react-select'
import { Option } from '../../v2/common/ReactSelectCustomization'
import '../ResourceBrowser.scss'

export function K8SResourceList({
    resourceList,
    filteredResourceList,
    setFilteredResourceList,
    noResults,
    selectedCluster,
    setSelectedCluster,
    selectedNamespace,
    setSelectedNamespace,
    resourceListLoader,
}) {
    const { push } = useHistory()

    const match = useRouteMatch()
    const { clusterId, namespace, kind } = useParams<{
        clusterId: string
        namespace: string
        kind: string
        node: string
    }>()
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [clusterOptions, setClusterOptions] = useState<OptionType[]>()
    const [namespaceOptions, setNamespaceOptions] = useState<OptionType[]>()

    useEffect(() => {
        getClusterList()
    }, [])
    const getClusterList = async () => {
        try {
            const { result } = await getClusterListMinWithoutAuth()
            const _clusterOptions = convertToOptionsList(result, null, 'cluster_name', 'id')
            setClusterOptions(_clusterOptions)
            const _selectedCluster = _clusterOptions.find((cluster) => cluster.value == clusterId)
            if (_selectedCluster) {
                setSelectedCluster(_selectedCluster || _clusterOptions[0])
                getNamespaceList(_selectedCluster.value)
            }
        } catch (err) {
            showError(err)
        }
    }

    const getNamespaceList = async (clusterId: string) => {
        try {
            const { result } = await namespaceListByClusterId(clusterId)
            const _namespaceOptions = [ALL_NAMESPACE_OPTION, ...convertToOptionsList(result)]
            setNamespaceOptions(convertToOptionsList(result))
            if (namespace) {
                const _selectedNamespace = _namespaceOptions.find((_namespace) => _namespace.value === namespace)
                setSelectedNamespace(_selectedNamespace || _namespaceOptions[0])
            }
        } catch (err) {
            showError(err)
        }
    }

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

    const onChangeCluster = (selected): void => {
        setSelectedCluster(selected)
        getNamespaceList(selected.value)
        push({
            pathname: `${URLS.RESOURCE_BROWSER}/${selected.value}`,
        })
    }

    const onChangeNamespace = (selected): void => {
        setSelectedNamespace(selected)
        push({
            pathname: `${URLS.RESOURCE_BROWSER}/${selectedCluster.value}/${selected.value}`,
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
                        className="ml-8"
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
                <ResourceBrowserActionMenu resourceData={resourceData} kind={kind as Nodes} />
            </div>
        )
    }

    const renderEmptyPage = (): JSX.Element => {
        if (noResults) {
            return (
                <ResourceListEmptyState subTitle="We could not find any DaemonSets. Try selecting a different cluster or namespace." />
            )
        } else {
            return (
                <ResourceListEmptyState
                    title="No matching results"
                    subTitle="We could not find any matching Deployments."
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
            {resourceListLoader? <Progressing pageLoader /> : renderList()}
        </div>
    )
}
