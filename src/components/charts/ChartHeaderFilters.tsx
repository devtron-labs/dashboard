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

import { CHECKBOX_VALUE, Checkbox, SearchBar } from '@devtron-labs/devtron-fe-common-lib'
import { useRouteMatch, useHistory, useLocation } from 'react-router-dom'
import { ReactComponent as Grid } from '../../assets/icons/ic-grid-view.svg'
import { ReactComponent as List } from '../../assets/icons/ic-list-view.svg'
import { QueryParams } from './charts.util'
import { Accordian } from '../common/Accordian/Accordian'
import { URLS } from '../../config'
import { CHART_KEYS } from './constants'
import { ChartHeaderFilterProps } from './charts.types'
import { importComponentFromFELibrary } from '@Components/common'

const ChartCategoryFilters = importComponentFromFELibrary('ChartCategoryFilters', null, 'function')

const ChartHeaderFilter = ({
    selectedChartRepo,
    includeDeprecated,
    chartRepoList,
    setSelectedChartRepo,
    appStoreName,
    isGrid,
    setIsGrid,
    chartCategoryIds,
    setChartCategoryIds,
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

    // Should be replaced with useURLFilters
    function handleFilterChanges(selected, key): void {
        const searchParams = new URLSearchParams(location.search)
        const app = searchParams.get(QueryParams.AppStoreName)
        const deprecate = searchParams.get(QueryParams.IncludeDeprecated)
        const chartRepoId = searchParams.get(QueryParams.ChartRepoId)
        const registryId = searchParams.get(QueryParams.RegistryId)
        const chartCategoryIdsCsv = searchParams.get(QueryParams.ChartCategoryId)

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
                if (chartCategoryIdsCsv) {
                    qsr = `${qsr}&${QueryParams.ChartCategoryId}=${chartCategoryIdsCsv}`
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
                if (chartCategoryIdsCsv) {
                    qs = `${qs}&${QueryParams.ChartCategoryId}=${chartCategoryIdsCsv}`
                }
                history.push(`${url}?${qs}`)
            }
        }

        if (key === CHART_KEYS.CHART_CATEGORY) {
            const chartCategoryCsv = selected.join(',')
            let qs = `${QueryParams.ChartCategoryId}=${chartCategoryCsv}`
            if (app) {
                qs = `${qs}&${QueryParams.AppStoreName}=${app}`
            }
            if (chartRepoId) {
                qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`
            }
            if (registryId) {
                qs = `${qs}&${QueryParams.RegistryId}=${registryId}`
            }
            if (deprecate) {
                qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`
            }
            history.push(`${url}?${qs}`)
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
            if (chartCategoryIdsCsv) {
                qs = `${qs}&${QueryParams.ChartCategoryId}=${chartCategoryIdsCsv}`
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
            if (chartCategoryIdsCsv) {
                qs = `${qs}&${QueryParams.ChartCategoryId}=${chartCategoryIdsCsv}`
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

    const handleUpdateCategoryFilter = (selectedCategories: string[]) => {
        setChartCategoryIds(selectedCategories)
        handleFilterChanges(selectedCategories, CHART_KEYS.CHART_CATEGORY)
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
                        autoFocus: true,
                    }}
                    dataTestId="chart-store-search-box"
                />
            </div>
            <div className="pl-12 pr-12 flexbox-col flex-grow-1 dc__overflow-auto">
                <div className="flex dc__content-space px-8 py-6 dc__gap-8">
                    <span className="fs-12 cn-6 fw-6 lh-20">VIEW AS</span>
                    <div className="cursor flex dc__gap-8">
                        <button
                            onClick={setGrid}
                            className={`flex dc__unset-button-styles ${isGrid ? 'scb-5' : ''}`}
                            data-testid="chart-store-grid-view"
                        >
                            <Grid className="icon-dim-20" />
                        </button>
                        <button
                            onClick={setList}
                            className={`flex dc__unset-button-styles ${!isGrid ? 'scb-5' : ''}`}
                            data-testid="chart-store-list-view"
                        >
                            <List className="icon-dim-20" />
                        </button>
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
                {ChartCategoryFilters && (
                    <>
                        <hr className="mt-8 mb-8" />
                        <ChartCategoryFilters
                            selectedCategories={chartCategoryIds}
                            handleUpdateCategoryFilter={handleUpdateCategoryFilter}
                        />
                    </>
                )}
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
