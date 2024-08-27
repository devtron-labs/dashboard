/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState, useEffect } from 'react'
import {
    DevtronProgressing,
    useAsync,
    useMainContext,
    PageHeader,
    AppListConstants,
    SearchBar,
} from '@devtron-labs/devtron-fe-common-lib'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import './EnvironmentsList.scss'
import { Filter, FilterOption } from '../../common'
import EnvironmentsListView from './EnvironmentListView'
import { getClusterListMinWithoutAuth } from '../../../services/service'
import { Cluster } from '../../../services/service.types'
import { AppGroupAdminType } from '../AppGroup.types'

export default function EnvironmentsList({ isSuperAdmin }: AppGroupAdminType) {
    const match = useRouteMatch()
    const { setPageOverflowEnabled } = useMainContext()
    const location = useLocation()
    const history = useHistory()
    const [searchText, setSearchText] = useState('')
    const [clusterfilter, setClusterFilter] = useState<FilterOption[]>([])
    const [loading, clusterListRes] = useAsync(() => getClusterListMinWithoutAuth())

    useEffect(() => {
        if (clusterListRes) {
            const queryParams = new URLSearchParams(location.search)
            const clusters = queryParams.get('cluster') || ''
            const search = queryParams.get('search') || ''
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

    const handleFilterKeyPress = (_searchText: string): void => {
        setSearchText(_searchText)
        if (searchText.length) {
            handleSearch(_searchText)
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
        setSearchText('')
        history.push(`${match.path}?${queryParams.toString()}`)
    }

    const onShowHideFilterContent = (show: boolean): void => {
        setPageOverflowEnabled(!show)
    }

    const renderSearch = (): JSX.Element => {
        return (
            <SearchBar
                initialSearchText={searchText}
                containerClassName="w-250"
                handleEnter={handleFilterKeyPress}
                inputProps={{
                    placeholder: 'Search environment',
                    autoFocus: true
                }}
                dataTestId="environment-search-box"
            />
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
                                    <span className="fw-6 mr-5">Cluster</span>
                                    <span className="saved-env-filter-divider" />
                                    <span className="ml-5">{filter.label}</span>
                                    <button
                                        type="button"
                                        className="saved-env-filter__close-btn"
                                        onClick={() => removeFilter(filter)}
                                    >
                                        <i className="fa fa-times-circle" aria-hidden="true" />
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
        return <DevtronProgressing parentClasses="h-100 flex bcn-0" classes="icon-dim-80" />
    }

    return (
        <div>
            <PageHeader headerName="Application Groups" showAnnouncementHeader />
            <div className="env-list bcn-0">
                <div className="flex dc__content-space pl-20 pr-20 pt-16 pb-16" data-testid="search-env-and-cluster">
                    {renderSearch()}
                    <Filter
                        dataTestId="app-group-cluster"
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
