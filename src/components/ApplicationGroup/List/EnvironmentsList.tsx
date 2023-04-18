import React, { useState, useEffect, useContext } from 'react'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { useRouteMatch } from 'react-router'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import './EnvironmentsList.scss'
import PageHeader from '../../common/header/PageHeader'
import { Filter, FilterOption, useAsync } from '../../common'
import EnvironmentsListView from './EnvironmentListView'
import { getClusterListMinWithoutAuth } from '../../../services/service'
import { Cluster } from '../../../services/service.types'
import { AppListConstants } from '../../../config'
import { useHistory, useLocation } from 'react-router-dom'
import { AppGroupAdminType } from '../AppGroup.types'
import { mainContext } from '../../common/navigation/NavigationRoutes'

export default function EnvironmentsList({ isSuperAdmin }: AppGroupAdminType) {
    const match = useRouteMatch()
    const { setPageOverflowEnabled } = useContext(mainContext)
    const location = useLocation()
    const history = useHistory()
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [clusterfilter, setClusterFilter] = useState<FilterOption[]>([])
    const [loading, clusterListRes] = useAsync(() => getClusterListMinWithoutAuth())

    useEffect(() => {
        if (clusterListRes) {
            const queryParams = new URLSearchParams(location.search)
            const clusters = queryParams.get('cluster') || ''
            const search = queryParams.get('search') || ''
            if (search) {
                setSearchApplied(true)
            }
            const clusterStatus = clusters
                .toString()
                .split(',')
                .filter((status) => status != '')
                .map((status) => status)
            const clusterList = new Set<string>(clusterStatus)
            const clustersfilter: FilterOption[] = []
            if (clusterListRes?.result && Array.isArray(clusterListRes.result)) {
                clusterListRes.result.forEach((cluster: Cluster) => {
                    clustersfilter.push({
                        key: cluster.id,
                        label: cluster.cluster_name.toLocaleLowerCase(),
                        isSaved: true,
                        isChecked: clusterList.has(cluster.id.toString()),
                    })
                })
                setClusterFilter(clustersfilter)
                setSearchText(search)
            }
        }
    }, [clusterListRes, location.search])

    const handleSearch = (text: string): void => {
        const queryParams = new URLSearchParams(location.search)
        queryParams.set('search', text)
        queryParams.set('offset', '0')
        history.push(`${match.path}?${queryParams.toString()}`)
    }

    const clearSearch = (): void => {
        setSearchApplied(false)
        const queryParams = new URLSearchParams(location.search)
        queryParams.delete('search')
        queryParams.set('offset', '0')
        history.push(`${match.path}?${queryParams.toString()}`)
    }

    const handleFilterKeyPress = (event): void => {
        const theKeyCode = event.key
        if (theKeyCode === 'Enter') {
            if (searchText.length) {
                handleSearch(event.target.value)
                setSearchApplied(true)
            }
        } else if (theKeyCode === 'Backspace' && searchText.length === 1) {
            clearSearch()
        }
    }
    const applyFilter = (type: string, list: FilterOption[], selectedAppTab?: string): void => {
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
        queryParams.set('offset', '0')
        history.push(`${match.path}?${queryParams.toString()}`)
    }

    const removeFilter = (filter): void => {
        const queryParams = new URLSearchParams(location.search)
        const cluster = queryParams.get('cluster')
        const clusterValues = cluster
            .toString()
            .split(',')
            .map((status) => status)

        const key = clusterValues.filter((value) => value != filter.key)
        if (key.length) {
            queryParams.set('cluster', key.toString())
        } else {
            queryParams.delete('cluster')
        }
        queryParams.set('offset', '0')
        history.push(`${match.path}?${queryParams.toString()}`)
    }

    const removeAllFilters = (): void => {
        const queryParams = new URLSearchParams(location.search)
        queryParams.delete('cluster')
        queryParams.delete('search')
        queryParams.set('offset', '0')
        setSearchApplied(false)
        setSearchText('')
        history.push(`${match.path}?${queryParams.toString()}`)
    }

    const handleSearchText = (event): void => {
        setSearchText(event.target.value)
    }

    const onShowHideFilterContent = (show: boolean): void => {
        setPageOverflowEnabled(!show)
    }

    const renderSearch = (): JSX.Element => {
        return (
            <div className="search dc__position-rel margin-right-0 en-2 bw-1 br-4 h-32">
                <Search className="search__icon icon-dim-18" />
                <input
                    type="text"
                    placeholder="Search environment"
                    value={searchText}
                    className="search__input"
                    onChange={handleSearchText}
                    onKeyDown={handleFilterKeyPress}
                    data-testid="environment-search-box"
                />
                {searchApplied && (
                    <button className="search__clear-button" type="button" onClick={clearSearch}>
                        <Clear className="icon-dim-18 icon-n4 dc__vertical-align-middle" />
                    </button>
                )}
            </div>
        )
    }

    function renderAppliedFilters(): JSX.Element {
        const isApplied = clusterfilter.some((filter) => filter.isChecked)
        return (
            isApplied && (
                <div className="saved-env-filters__wrap dc__position-rel mb-12">
                    {clusterfilter.map((filter) => {
                        if (filter.isChecked) {
                            return (
                                <div key={filter.key} className="saved-env-filter">
                                    <span className="fw-6 mr-5">{'Cluster'}</span>
                                    <span className="saved-env-filter-divider"></span>
                                    <span className="ml-5">{filter.label}</span>
                                    <button
                                        type="button"
                                        className="saved-env-filter__close-btn"
                                        onClick={() => removeFilter(filter)}
                                    >
                                        <i className="fa fa-times-circle" aria-hidden="true"></i>
                                    </button>
                                </div>
                            )
                        }
                    })}
                    <button
                        type="button"
                        className="saved-env-filters__clear-btn flex fs-13"
                        onClick={removeAllFilters}
                    >
                        Clear All Filters
                    </button>
                </div>
            )
        )
    }

    if (loading) {
        return <Progressing pageLoader />
    }

    return (
        <div>
            <PageHeader headerName="Application Groups" markAsBeta={true}/>
            <div className="env-list bcn-0">
                <div className="flex dc__content-space pl-20 pr-20 pt-16 pb-16">
                    {renderSearch()}
                    <Filter
                        list={clusterfilter}
                        labelKey="label"
                        buttonText="Cluster"
                        searchable
                        multi
                        placeholder="Search Cluster"
                        type={AppListConstants.FilterType.CLUTSER}
                        applyFilter={applyFilter}
                        onShowHideFilterContent={onShowHideFilterContent}
                    />
                </div>
                {renderAppliedFilters()}
                <EnvironmentsListView isSuperAdmin={isSuperAdmin} removeAllFilters={removeAllFilters} />
            </div>
        </div>
    )
}
