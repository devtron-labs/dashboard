import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useRouteMatch, useHistory, useLocation } from 'react-router'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import { ReactComponent as Error } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Success } from '../../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as TerminalIcon } from '../../../assets/icons/ic-terminal-fill.svg'
import { ReactComponent as MenuDots } from '../../../assets/icons/appstatus/ic-menu-dots.svg'
import { convertToOptionsList, handleUTCTime, Progressing, showError } from '../../common'
import PageHeader from '../../common/header/PageHeader'
import { toast } from 'react-toastify'
import Tippy from '@tippyjs/react'
import ResourceListEmptyState from './ResourceListEmptyState'
import '../ResourceBrowser.scss'
import { ResourceDetail } from '../Types'
import { getResourceList, NamespaceListByClusterId } from '../ResourceBrowser.service'
import ResourceBrowserActionMenu from './ResourceBrowserActionMenu'
import ReactSelect from 'react-select'
import { Option } from '../../v2/common/ReactSelectCustomization'
import { getClusterListMinWithoutAuth } from '../../../services/service'
import { OptionType } from '../../app/types'
import { clusterSelectStyle } from '../Constants'
import { URLS } from '../../../config'

export default function ResourceList() {
    const match = useRouteMatch()
    const [loader, setLoader] = useState(false)
    const [noResults, setNoResults] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState('')
    const [lastDataSync, setLastDataSync] = useState(false)
    const [searchApplied, setSearchApplied] = useState(false)
    const [resourceList, setResourceList] = useState<ResourceDetail[]>([])
    const [filteredResourceList, setFilteredResourceList] = useState<ResourceDetail[]>([])
    const [namespaceList, setNameSpaceList] = useState<Record<string, string[]>>()
    const [clusterList, setClusterList] = useState<OptionType[]>()
    const [namespaceOptions, setNamespaceOptions] = useState<OptionType[]>()
    const [selectedCluster, setSelectedCluster] = useState<OptionType>(null)
    const [selectedNamespace, setSelectedNamespace] = useState<OptionType>(null)
    const { push } = useHistory()
    const location = useLocation()

    const getData = async (): Promise<void> => {
        try {
            setLoader(true)
            const { result } = await getResourceList('1')
            setResourceList(result)
            setFilteredResourceList(result)
            setNoResults(result.length === 0)
            setLastDataSync(!lastDataSync)
        } catch (err) {
            showError(err)
        } finally {
            setLoader(false)
        }
    }

    const getClusterList = async () => {
        try {
            const { result } = await getClusterListMinWithoutAuth()
            setClusterList(convertToOptionsList(result, null, 'cluster_name', 'id'))
        } catch (err) {
            showError(err)
        }
    }

    const getNamespaceList = async (clusterId: string) => {
        try {
            const { result } = await NamespaceListByClusterId(clusterId)
            setNamespaceOptions(convertToOptionsList(result))
        } catch (err) {
            showError(err)
        }
    }

    useEffect(() => {
        getData()
        getClusterList()
    }, [])

    useEffect(() => {
        const _lastDataSyncTime = Date()
        setLastDataSyncTimeString('Last refreshed ' + handleUTCTime(_lastDataSyncTime, true))
        const interval = setInterval(() => {
            setLastDataSyncTimeString('Last refreshed ' + handleUTCTime(_lastDataSyncTime, true))
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    }, [lastDataSync])

    useEffect(() => {
      console.log(location)
  }, [location.search])

    const handleFilterChanges = (_searchText: string): void => {
        const _filteredData = resourceList.filter(
            (resource) =>
                resource.name.indexOf(_searchText) >= 0 ||
                resource.namespace.indexOf(_searchText) >= 0 ||
                resource.status.indexOf(_searchText) >= 0,
        )
        setFilteredResourceList(_filteredData)
    }

    const handleResourceClick = (ev, resourceData: ResourceDetail): void => {}

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
                        options={clusterList}
                        value={selectedCluster}
                        onChange={onChangeCluster}
                        styles={clusterSelectStyle}
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
                        styles={clusterSelectStyle}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                        }}
                    />
                </div>
            </div>
        )
    }

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
                <div>{resourceData.age}</div>
                <div>{resourceData.ready}</div>
                <div>{resourceData.restarts}</div>
                <ResourceBrowserActionMenu resourceData={resourceData} />
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

    if (loader) {
        return <Progressing pageLoader />
    }

    return (
        <div>
            <PageHeader headerName="Kubernetes object browser" />
            <div>
                <div>Sidebar</div>

                <div
                    className={`resource-list-container bcn-0 ${
                        filteredResourceList.length === 0 ? 'no-result-container' : ''
                    }`}
                >
                    <div className="fs-13">
                        {lastDataSyncTimeString && (
                            <span>
                                {lastDataSyncTimeString}{' '}
                                <button className="btn btn-link p-0 fw-6 cb-5 ml-5 fs-13" onClick={getData}>
                                    Refresh
                                </button>
                            </span>
                        )}
                    </div>
                    {renderSearch()}
                    {filteredResourceList.length === 0 ? (
                        renderEmptyPage()
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    )
}
