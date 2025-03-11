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

import React from 'react'
import { CHECKBOX_VALUE, Checkbox, SearchBar } from '@devtron-labs/devtron-fe-common-lib'
import { useRouteMatch, useHistory, useLocation } from 'react-router-dom'
import { ReactComponent as Grid } from '../../assets/icons/ic-grid-view.svg'
import { ReactComponent as List } from '../../assets/icons/ic-list-view.svg'
import { QueryParams } from './charts.util'
import { Accordian } from '../common/Accordian/Accordian'
import { URLS } from '../../config'
import { CHART_KEYS } from './constants'
import { ChartHeaderFilterProps } from './charts.types'

const ChartHeaderFilter = ({
    selectedChartRepo,
    includeDeprecated,
    chartRepoList,
    setSelectedChartRepo,
    appStoreName,
    isGrid,
    setIsGrid,
}: ChartHeaderFilterProps) => {
    const match = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const { url } = match

    const handleSelection = (event): void => {
        const chartRepoList = selectedChartRepo.filter((e) => e.value != event.value)
        setSelectedChartRepo(chartRepoList)
        if (selectedChartRepo.length === chartRepoList.length) {
            handleFilterChanges([event, ...selectedChartRepo], CHART_KEYS.CHART_REPO)
        } else {
            handleFilterChanges(chartRepoList, CHART_KEYS.CHART_REPO)
        }
    }

    const handleViewAllCharts = (): void => {
        history.push(`${match.url.split('/chart-store')[0]}${URLS.GLOBAL_CONFIG_CHART}`)
    }

    function handleFilterChanges(selected, key): void {
        const searchParams = new URLSearchParams(location.search)
        const app = searchParams.get(QueryParams.AppStoreName)
        const deprecate = searchParams.get(QueryParams.IncludeDeprecated)
        const chartRepoId = searchParams.get(QueryParams.ChartRepoId)
        const registryId = searchParams.get(QueryParams.RegistryId)
        let isOCIRegistry
        if (key === CHART_KEYS.CHART_REPO) {
            const paramsChartRepoIds = selected
                .filter((selectedRepo) => !selectedRepo.isOCIRegistry)
                ?.map((selectedRepo) => {
                    return selectedRepo.value
                })
                .join(',')

            const paramsRegistryIds = selected
                .filter((selectedRepo) => selectedRepo.isOCIRegistry)
                ?.map((selectedRepo) => {
                    isOCIRegistry = true
                    return selectedRepo.value
                })
                .join(',')
            if (isOCIRegistry) {
                let qsr = `${QueryParams.RegistryId}=${paramsRegistryIds}`
                if (paramsChartRepoIds) {
                    qsr = `${qsr}&${QueryParams.ChartRepoId}=${paramsChartRepoIds}`
                }
                if (app) {
                    qsr = `${qsr}&${QueryParams.AppStoreName}=${app}`
                }
                if (deprecate) {
                    qsr = `${qsr}&${QueryParams.IncludeDeprecated}=${deprecate}`
                }
                history.push(`${url}?${qsr}`)
            } else {
                let qs = `${QueryParams.ChartRepoId}=${paramsChartRepoIds}`
                if (paramsRegistryIds) {
                    qs = `${qs}&${QueryParams.RegistryId}=${paramsRegistryIds}`
                }
                if (app) {
                    qs = `${qs}&${QueryParams.AppStoreName}=${app}`
                }
                if (deprecate) {
                    qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`
                }
                history.push(`${url}?${qs}`)
            }
        }

        if (key === CHART_KEYS.DEPRECATED) {
            let qs = `${QueryParams.IncludeDeprecated}=${selected}`
            if (app) {
                qs = `${qs}&${QueryParams.AppStoreName}=${app}`
            }
            if (chartRepoId) {
                qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`
            }
            if (registryId) {
                qs = `${qs}&${QueryParams.RegistryId}=${registryId}`
            }
            history.push(`${url}?${qs}`)
        }

        if (key === CHART_KEYS.SEARCH) {
            let qs = `${QueryParams.AppStoreName}=${selected}`
            if (deprecate) {
                qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`
            }
            if (chartRepoId) {
                qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`
            }
            if (registryId) {
                qs = `${qs}&${QueryParams.RegistryId}=${registryId}`
            }
            history.push(`${url}?${qs}`)
        }

        if (key === CHART_KEYS.CLEAR) {
            let qs: string = ''
            if (deprecate) {
                qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`
            }
            if (chartRepoId) {
                qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`
            }
            if (registryId) {
                qs = `${qs}&${QueryParams.RegistryId}=${registryId}`
            }
            history.push(`${url}?${qs}`)
        }
    }

    const setGrid = (): void => {
        setIsGrid(true)
    }

    const setList = (): void => {
        setIsGrid(false)
    }

    const toggleDeprecated = (): void => {
        const value = (includeDeprecated + 1) % 2
        handleFilterChanges(value, CHART_KEYS.DEPRECATED)
    }

    const handleSearchEnter = (searchKey: string): void => {
        handleFilterChanges(searchKey, CHART_KEYS.SEARCH)
    }

    return (
        <div className="filter-column-container flexbox-col h-100 dc__overflow-hidden">
            <div className="pb-12 pl-12 pr-12 pt-16">
                <SearchBar
                    initialSearchText={appStoreName}
                    containerClassName="dc__mxw-250 flex-grow-1"
                    handleEnter={handleSearchEnter}
                    inputProps={{
                        placeholder: 'Search charts',
                        autoFocus: true
                    }}
                    dataTestId="chart-store-search-box"
                />
            </div>
            <div className="pl-12 pr-12 flexbox-col flex-grow-1 dc__overflow-auto">
                <div className="fs-12 fw-6 ml-8 cn-6 pb-8 pt-8" data-testid="chart-store-view-type-heading">
                    VIEW AS
                </div>
                <div className="cursor flex">
                    <div
                        onClick={setGrid}
                        className={`flex pt-8 pb-8 pl-10 pr-10 fs-13 br-4 w-100 ${
                            isGrid ? 'cb-5 bcb-1 scb-5' : 'dc__hover-n50'
                        }`}
                        data-testid="chart-store-grid-view"
                    >
                        <Grid className="icon-dim-20 mr-8" />
                        Grid
                    </div>
                    <div
                        onClick={setList}
                        className={`flex pt-8 pb-8 fs-13 pr-10 pl-10 br-4 w-100 ${
                            !isGrid ? 'cb-5 bcb-1 scb-5' : 'dc__hover-n50'
                        }`}
                        data-testid="chart-store-list-view"
                    >
                        <List className="icon-dim-20 mr-8" />
                        List
                    </div>
                </div>
                <hr className="mt-8 mb-8" />
                <div className="fs-12 h-36 pt-8 pb-8 cn-6 fw-6 ml-8" data-testid="chart-store-filter-heading">
                    FILTERS
                </div>
                <Checkbox
                    rootClassName="fs-13 dc__hover-n50 pt-8 pb-8 pl-8 ml-8"
                    isChecked={includeDeprecated === 1}
                    value={CHECKBOX_VALUE.CHECKED}
                    onChange={toggleDeprecated}
                    dataTestId="chart-store-filter-checkbox"
                >
                    <div> Show deprecated charts</div>
                </Checkbox>
                <hr className="mt-8 mb-8" />
                <Accordian
                    header="CHART SOURCE"
                    options={chartRepoList}
                    value={selectedChartRepo}
                    onChange={handleSelection}
                    onClickViewChartButton={handleViewAllCharts}
                    dataTestId="chart-store-repository"
                />
            </div>
        </div>
    )
}

export default ChartHeaderFilter
