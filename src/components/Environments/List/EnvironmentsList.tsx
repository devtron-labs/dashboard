import React, { useState, useEffect } from 'react'
import { useRouteMatch } from 'react-router'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import './EnvironmentsList.scss'
import PageHeader from '../../common/header/PageHeader'
import { Filter, FilterOption, Progressing, useAsync } from '../../common'
import EnvironmentsListView from './EnvironmentListView'
import { getClusterListMinWithoutAuth } from '../../../services/service'
import { Cluster } from '../../../services/service.types'
import { AppListConstants } from '../../../config'
import { useHistory, useLocation } from 'react-router-dom'
import ExportToCsv from '../../common/ExportToCsv/ExportToCsv'
import { StatusConstants } from '../../app/list-new/Constants'

export default function EnvironmentsList() {
    const match = useRouteMatch()
    const location = useLocation()
    const history = useHistory()
    const [noResults, setNoResults] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [envList, setEnvList] = useState([])
    const [clusterfilter, setClusterFilter] = useState<FilterOption[]>([])
    const [loading, clusterListRes] = useAsync(() => getClusterListMinWithoutAuth())

    useEffect(() => {
        if (clusterListRes) {
            const queryParams = new URLSearchParams(location.search)
            let clusters = queryParams.get('cluster') || ''
            let search = queryParams.get('search') || ''
            if(search){
                setSearchApplied(true)
            }
            let clsuterStatus = clusters
            .toString()
            .split(',')
            .filter((status) => status != '')
            .map((status) => status)
            let clusterList = new Set<string>(clsuterStatus)
            if (clusterListRes?.result && Array.isArray(clusterListRes.result)) {
                let clustersfilter: FilterOption[] = []
                clusterListRes.result.forEach((cluster: Cluster) => {
                    clustersfilter.push({
                        key: cluster.id,
                        label: cluster.cluster_name.toLocaleLowerCase(),
                        isSaved: true,
                        isChecked: clusterList.has(cluster.id.toString()),
                    })
                })
                setSearchText(search)
                setClusterFilter(clustersfilter)
            }
        }
    }, [clusterListRes,location.search])

    const getData = () => {
        setEnvList([])
    }

    useEffect(() => {
        getData()
    }, [])

    const handleFilterChanges = (_searchText: string): void => {
        const _filteredData = envList.filter((env) => env.name.indexOf(_searchText) >= 0)
        setNoResults(_filteredData.length === 0)
    }

    const handleSearch = (text) => {
        const queryParams = new URLSearchParams(location.search)
        queryParams.set('search',text)
        let url = `${match.path}?${queryParams.toString()}`
        history.push(url)
    }

    const clearSearch = (): void => {
        setSearchApplied(false)
        const queryParams = new URLSearchParams(location.search)
        queryParams.delete('search')
        let url = `${match.path}?${queryParams.toString()}`
        history.push(url)
    }

    const handleFilterKeyPress = (event): void => {
        const theKeyCode = event.key
        if (theKeyCode === 'Enter') {
            if(searchText.length){
                handleSearch(event.target.value)
                setSearchApplied(true)
            }
        } else if (theKeyCode === 'Backspace' && searchText.length === 1) {
            clearSearch()
        }
    }
    const applyFilter = (type: string, list: FilterOption[], selectedAppTab: string = undefined): void => {
        const queryParams = new URLSearchParams(location.search)
        const ids = []
        list.forEach((option) => {
            if (option.isChecked) {
                ids.push(option.key)
            }
        })
        if (!ids.length) {
            queryParams.delete(type)
        } else {
            queryParams.set(type, ids.toString())
        }
        let url = `${match.path}?${queryParams.toString()}`
        history.push(url)
    }

    const removeFilter = (filter): void => {
        const queryParams = new URLSearchParams(location.search)
        let x = queryParams.get('cluster')
        let clusterValues = x
            .toString()
            .split(',')
            .map((status) => status)

        let key = clusterValues.filter((value) => value != filter.key)
        if(key.length){
            queryParams.set('cluster',key.toString())
        }else{
            queryParams.delete('cluster')
        }
        let url = `${match.path}?${queryParams.toString()}`
        history.push(url)
    }

    const removeAllFilters = (): void => {
        const queryParams = new URLSearchParams(location.search)
        queryParams.delete('cluster')
        queryParams.delete('search')

        //delete search string
        setSearchApplied(false)
        setSearchText('')
        let url = `${match.path}?${queryParams.toString()}`
        history.push(url)
    }

    const renderSearch = (): JSX.Element => {
        return (
            <div className="search dc__position-rel margin-right-0 en-2 bw-1 br-4 h-32">
                <Search className="search__icon icon-dim-18" />
                <input
                    type="text"
                    placeholder="Search env"
                    value={searchText}
                    className="search__input"
                    onChange={(event) => {
                        setSearchText(event.target.value)
                    }}
                    onKeyDown={handleFilterKeyPress}
                />
                {searchApplied && (
                    <button className="search__clear-button" type="button" onClick={clearSearch}>
                        <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                    </button>
                )}
            </div>
        )
    }

    function renderAppliedFilters() {
        let count = 0
        let appliedFilters = (
            <div className="saved-filters__wrap dc__position-rel">
                {clusterfilter.map((filter) => {
                        if (filter.isChecked) {
                            count++
                            
                            return (
                                <div key={filter.key} className="saved-filter">
                                    <span className="fw-6 mr-5">{'Cluster'}</span>
                                    <span className="saved-filter-divider"></span>
                                    <span className="ml-5">{filter.label}</span>
                                    <button
                                        type="button"
                                        className="saved-filter__close-btn"
                                        onClick={(event) => removeFilter(filter)}
                                    >
                                        <i className="fa fa-times-circle" aria-hidden="true"></i>
                                    </button>
                                </div>
                            )
                        }
                    })
                }
                <button
                    type="button"
                    className="saved-filters__clear-btn fs-13"
                    onClick={() => {
                        removeAllFilters()
                    }}
                >
                    Clear All Filters
                </button>
            </div>
        )

        return <React.Fragment>{count > 0 ? appliedFilters : null}</React.Fragment>
    }

    if (loading) {
        return <Progressing pageLoader />
    }

    // const showExportCsvButton =
    // userRoleResponse?.result?.roles?.indexOf('role:super-admin___') !== -1 &&
    // currentTab === AppListConstants.AppTabs.DEVTRON_APPS &&
    // serverMode !== SERVER_MODE.EA_ONLY

    return (
        <div>
            <PageHeader headerName="Environments" />
            <div className={`env-list bcn-0 ${noResults ? 'no-result-container' : ''}`}>
                <div className='flex dc__content-space pl-20 pr-20 pt-16 pb-16'>
                    <div>{renderSearch()}</div>
                    <div>
                    <Filter
                        list={clusterfilter}
                        labelKey="label"
                        buttonText="Cluster"
                        searchable
                        multi
                        placeholder="Search Cluster"
                        type={AppListConstants.FilterType.CLUTSER}
                        applyFilter={applyFilter}
                        // onShowHideFilterContent={onShowHideFilterContent}
                    />
                    {/* {showExportCsvButton && (
                        <>
                            <span className="filter-divider"></span>
                            <ExportToCsv
                                className="ml-10"
                                apiPromise={getAppListDataToExport}
                                fileName={FILE_NAMES.Apps}
                                disabled={!appCount}
                            />
                        </>
                    )} */}
                    </div>
                </div>
                {renderAppliedFilters()}
                <EnvironmentsListView clearSearch={clearSearch} />
            </div>
        </div>
    )
}
