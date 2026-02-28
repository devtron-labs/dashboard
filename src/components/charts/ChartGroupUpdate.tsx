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

import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
    showError,
    Progressing,
    BreadCrumb,
    useBreadcrumb,
    PageHeader,
    DetectBottom,
    ToastManager,
    ToastVariantType,
    getInfrastructureManagementBreadcrumb,
    BreadcrumbText,
    DOCUMENTATION,
    ROUTER_URLS,
    usePrompt,
} from '@devtron-labs/devtron-fe-common-lib'
import ChartCard from './ChartCard'
import { ChartGroupEntry, Chart, ChartListType } from './charts.types'
import MultiChartSummary from './MultiChartSummary'
import AdvancedConfig from './AdvancedConfig'
import { updateChartGroupEntries, getChartProviderList } from './charts.service'
import useChartGroup from './useChartGroup'
import CreateChartGroup from './modal/CreateChartGroup'
import { ReactComponent as SaveIcon } from '../../assets/icons/ic-save.svg'
import ChartHeaderFilters from './ChartHeaderFilters'
import { QueryParams } from './constants'
import ChartEmptyState from '../common/emptyState/ChartEmptyState'
import { sortOptionsByLabel } from '../common'

const pagePathPattern = `${ROUTER_URLS.CHART_STORE}/group/:groupId/edit`

export default function ChartGroupUpdate({}) {
    const navigate = useNavigate()
    const location = useLocation()
    const { groupId } = useParams<{ groupId }>()
    const [chartDetailsUpdate, setChartDetailsUpdate] = useState(false)
    const [loading, setLoading] = useState(false)
    const {
        state,
        getChartVersionsAndValues,
        configureChart,
        fetchChartValues,
        addChart,
        subtractChart,
        handleChartValueChange,
        handleChartVersionChange,
        chartListing,
        createChartValues,
        removeChart,
        discardValuesYamlChanges,
        updateChartGroupEntriesFromResponse,
        updateChartGroupNameAndDescription,
        reloadState,
        applyFilterOnCharts,
        resetPaginationOffset,
    } = useChartGroup(Number(groupId))
    const isLeavingPageNotAllowed = useRef(false)
    const [selectedChartRepo, setSelectedChartRepo] = useState([])
    const [appStoreName, setAppStoreName] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [includeDeprecated, setIncludeDeprecated] = useState(0)
    const [chartListLoading, setChartListLoading] = useState(true)
    const chartList: Chart[] = Array.from(state.availableCharts.values())
    const [chartLists, setChartLists] = useState<ChartListType[]>([])
    const [chartCategoryIds, setChartCategoryIds] = useState<string[]>([])
    const [isGrid, setIsGrid] = useState<boolean>(true)

    const { breadcrumbs } = useBreadcrumb(
        pagePathPattern,
        {
            alias: {
                ...getInfrastructureManagementBreadcrumb(),
                'chart-store': null,
                discover: {
                    component: <BreadcrumbText heading="Chart Store" />,
                    linked: true,
                },
                group: 'Chart Groups',
                ':groupId': {
                    component: state.name,
                    linked: true,
                },
                edit: { component: 'Edit group', linked: false },
            },
        },
        [state.name],
    )

    isLeavingPageNotAllowed.current = state.charts.reduce((acc: boolean, chart: ChartGroupEntry) => {
        return (acc = acc || chart.isUnsaved)
    }, false)

    async function handleSave(e) {
        setLoading(true)
        try {
            const requestBody = {
                id: Number(groupId),
                name: state.name,
                chartGroupEntries: state.charts.map((chart: ChartGroupEntry) => {
                    const result = {
                        ...(chart.installedId ? { id: chart.installedId } : {}),
                        ...(chart.kind !== 'DEFAULT'
                            ? {
                                  appStoreValuesVersionId: chart.appStoreValuesVersionId,
                                  appStoreValuesVersionName: chart.appStoreValuesVersionName,
                              }
                            : {}),
                        appStoreApplicationVersionId: chart.appStoreApplicationVersionId,
                    }
                    return result
                }),
            }
            await updateChartGroupEntries(requestBody)
            await reloadState()
            updateChartGroupEntriesFromResponse()
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Successfully saved',
            })
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    const chartRepos = useMemo(
        () =>
            chartLists
                .filter((chartRepo) => chartRepo.active)
                .map((chartRepo) => {
                    return {
                        value: chartRepo.id,
                        label: chartRepo.name,
                        isOCIRegistry: chartRepo.isOCIRegistry,
                    }
                })
                .sort(sortOptionsByLabel),
        [chartLists],
    )

    const getChartFilter = async () => {
        try {
            const chartRepos = (await getChartProviderList()).result || []
            chartRepos.sort((a, b) => a['name'].localeCompare(b['name']))
            setChartLists(chartRepos)
        } catch (err) {
            showError(err)
        }
    }

    useEffect(() => {
        getChartFilter()
    }, [])

    usePrompt({
        shouldPrompt: isLeavingPageNotAllowed.current,
        message: 'Your changes will be lost. Do you want to leave without saving?',
    })

    useEffect(() => {
        if (!state.loading) {
            resetPaginationOffset()
            chartRepos && initialiseFromQueryParams(chartRepos)
            callApplyFilterOnCharts(true)
        }
    }, [chartRepos, location.search, state.loading])

    function redirectToGroupDetail(): void {
        navigate(`${ROUTER_URLS.CHART_STORE}/group/${groupId}`)
    }

    function closeChartGroupModal(props): void {
        if (props?.name) {
            updateChartGroupNameAndDescription(props.name, props?.description || '')
        }
        setChartDetailsUpdate(false)
    }

    function initialiseFromQueryParams(chartRepoList): void {
        const searchParams = new URLSearchParams(location.search)
        const allChartRepoIds: string = searchParams.get(QueryParams.ChartRepoId)
        const allRegistryIds: string = searchParams.get(QueryParams.RegistryId)
        const deprecated: string = searchParams.get(QueryParams.IncludeDeprecated)
        const appStoreName: string = searchParams.get(QueryParams.AppStoreName)
        const chartCategoryCsv: string = searchParams.get(QueryParams.ChartCategoryId)
        let chartRepoIdArray = []
        let ociRegistryArray = []
        if (allChartRepoIds) {
            chartRepoIdArray = allChartRepoIds.split(',')
        }
        if (allRegistryIds) {
            ociRegistryArray = allRegistryIds.split(',')
        }
        chartRepoIdArray = chartRepoIdArray.map((chartRepoId) => parseInt(chartRepoId))
        ociRegistryArray = ociRegistryArray.map((ociRegistryId) => ociRegistryId)

        const selectedRepos = []
        for (let i = 0; i < chartRepoIdArray.length; i++) {
            const chartRepo = chartRepoList?.find((item) => +item.value === chartRepoIdArray[i])
            if (chartRepo) {
                selectedRepos.push(chartRepo)
            }
        }
        for (let i = 0; i < ociRegistryArray.length; i++) {
            const registry = chartRepoList?.find((item) => item.value === ociRegistryArray[i])
            if (registry) {
                selectedRepos.push(registry)
            }
        }
        if (selectedRepos) {
            setSelectedChartRepo(selectedRepos)
        }
        if (deprecated) {
            setIncludeDeprecated(parseInt(deprecated))
        } else {
            setIncludeDeprecated(0)
        }
        if (appStoreName) {
            setSearchApplied(true)
            setAppStoreName(appStoreName)
        } else {
            setSearchApplied(false)
            setAppStoreName('')
        }
        if (chartCategoryCsv) {
            const idsArray = chartCategoryCsv.split(',')
            if (idsArray) {
                setChartCategoryIds(idsArray)
            }
        } else {
            setChartCategoryIds([])
        }
    }

    async function callApplyFilterOnCharts(resetPage?: boolean) {
        setChartListLoading(true)
        await applyFilterOnCharts(location.search, resetPage)
        setChartListLoading(false)
    }

    async function reloadNextAfterBottom() {
        await applyFilterOnCharts(location.search, false)
    }

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} path={pagePathPattern} />

    const renderChartGroupEditActionButton = () => {
        return (
            <div className="dc__page-header__cta-container flex right">
                <button className="cta h-32 flex cancel cta__no-svg-override mr-16" onClick={handleSave}>
                    {loading ? (
                        <Progressing />
                    ) : (
                        <div className="flex left " data-testid="save-group-button-navbar" style={{ width: '100%' }}>
                            <SaveIcon className="mr-5 scn-6" />
                            Save
                        </div>
                    )}
                </button>
                <button className="cta flex cancel h-32" onClick={redirectToGroupDetail} data-testid="group-detail">
                    Group Detail
                </button>
            </div>
        )
    }

    function handleViewAllCharts(): void {
        const newSearch = new URLSearchParams(location.search)
        newSearch.append(QueryParams.IncludeDeprecated, '1')
        navigate({
            search: newSearch.toString()
        })
    }

    return (
        <>
            <div className="chart-group--details-page">
                <PageHeader
                    isBreadcrumbs
                    breadCrumbs={renderBreadcrumbs}
                    renderActionButtons={renderChartGroupEditActionButton}
                    docPath={DOCUMENTATION.INFRA_MANAGEMENT}
                />

                {!state.loading ? (
                    <div className="chart-group--details-body summary-show">
                        {typeof state.configureChartIndex !== 'number' ? (
                            <ChartHeaderFilters
                                chartRepoList={chartRepos}
                                setSelectedChartRepo={setSelectedChartRepo}
                                appStoreName={appStoreName}
                                includeDeprecated={includeDeprecated}
                                selectedChartRepo={selectedChartRepo}
                                isGrid={isGrid}
                                setIsGrid={setIsGrid}
                                chartCategoryIds={chartCategoryIds}
                                setChartCategoryIds={setChartCategoryIds}
                            />
                        ) : null}
                        {chartListLoading ? (
                            <Progressing pageLoader />
                        ) : (
                            <div className="details">
                                {typeof state.configureChartIndex === 'number' ? (
                                    <AdvancedConfig
                                        chart={state.charts[state.configureChartIndex]}
                                        index={state.configureChartIndex}
                                        getChartVersionsAndValues={getChartVersionsAndValues}
                                        fetchChartValues={fetchChartValues}
                                        handleChartValueChange={handleChartValueChange}
                                        handleChartVersionChange={handleChartVersionChange}
                                        createChartValues={createChartValues}
                                        discardValuesYamlChanges={discardValuesYamlChanges}
                                    />
                                ) : !chartList.length ? (
                                    <ChartEmptyState onClickViewChartButton={handleViewAllCharts} />
                                ) : (
                                    <div className={`${!isGrid ? 'chart-list-view' : ''}`}>
                                        <ChartList
                                            availableCharts={state.availableCharts}
                                            addChart={addChart}
                                            subtractChart={subtractChart}
                                            selectedInstances={state.selectedInstances}
                                            isGrid={isGrid}
                                        />
                                        {state.hasMoreCharts && <Progressing />}
                                        {state.hasMoreCharts && <DetectBottom callback={reloadNextAfterBottom} />}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="summary">
                            <MultiChartSummary
                                charts={state.charts}
                                getChartVersionsAndValues={getChartVersionsAndValues}
                                configureChart={configureChart}
                                handleChartValueChange={
                                    typeof state.configureChartIndex === 'number' ? null : handleChartValueChange
                                }
                                handleChartVersionChange={
                                    typeof state.configureChartIndex === 'number' ? null : handleChartVersionChange
                                }
                                chartListing={chartListing}
                                configureChartIndex={state.configureChartIndex}
                                removeChart={removeChart}
                                hideDeployedValues
                                name={state.name}
                                setChartDetailsUpdate={setChartDetailsUpdate}
                            />
                        </div>
                    </div>
                ) : (
                    <Progressing pageLoader />
                )}
            </div>
            {chartDetailsUpdate && (
                <CreateChartGroup
                    closeChartGroupModal={closeChartGroupModal}
                    location={location}
                    params={{}}
                    navigate={navigate}
                    chartGroupId={Number(groupId)}
                    name={state.name}
                    description={state.description}
                />
            )}
        </>
    )
}

const ChartList = ({ availableCharts, selectedInstances, addChart, subtractChart, isGrid }) => {
    return (
        <div className={`chart-grid bg__primary ${!isGrid ? 'list-view' : ''}`}>
            {[...availableCharts.values()].map((chart: Chart, idx) => (
                <ChartCard
                    key={chart.id}
                    chart={chart}
                    selectedCount={selectedInstances[chart.id]?.length}
                    addChart={addChart}
                    subtractChart={subtractChart}
                    isListView={!isGrid}
                    dataTestId={String(idx)}
                />
            ))}
        </div>
    )
}
