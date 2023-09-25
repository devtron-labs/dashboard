import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useRouteMatch, useHistory, useLocation } from 'react-router'
import ChartSelect from './util/ChartSelect'
import { ChartGroupEntry, Chart, ChartListType } from './charts.types'
import MultiChartSummary from './MultiChartSummary'
import AdvancedConfig from './AdvancedConfig'
import { updateChartGroupEntries, getChartGroups, getChartProviderList } from './charts.service'
import useChartGroup from './useChartGroup'
import { showError, Progressing, BreadCrumb, useBreadcrumb } from '@devtron-labs/devtron-fe-common-lib'
import CreateChartGroup from './modal/CreateChartGroup'
import { URLS } from '../../config'
import { toast } from 'react-toastify'
import { Prompt } from 'react-router'
import { ReactComponent as SaveIcon } from '../../assets/icons/ic-save.svg'
import { ChartSelector } from '../AppSelector'
import ChartHeaderFilters from './ChartHeaderFilters'
import { QueryParams } from './charts.util'
import ChartEmptyState from '../common/emptyState/ChartEmptyState'
import PageHeader from '../common/header/PageHeader'
import DetectBottom from '../common/DetectBottom'
import { sortOptionsByLabel } from '../common'

export default function ChartGroupUpdate({}) {
    const history = useHistory()
    const location = useLocation()
    const match = useRouteMatch()
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
    const { url } = match
    const [chartListLoading, setChartListLoading] = useState(true)
    const chartList: Chart[] = Array.from(state.availableCharts.values())
    const [chartLists, setChartLists] = useState<ChartListType[]>([])
    const [isGrid, setIsGrid] = useState<boolean>(true)

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
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
            toast.success('Successfully saved.')
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
        [chartLists]
    )

    const getChartFilter = async () => {
        try {
            let chartRepos = (await getChartProviderList()).result || []
            chartRepos.sort((a, b) => a['name'].localeCompare(b['name']))
            setChartLists(chartRepos)
        } catch (err) {
            showError(err)
        }
    }

    useEffect(() => {
        getChartFilter()
        window.addEventListener('beforeunload', reloadCallback)
        return () => {
            window.removeEventListener('beforeunload', reloadCallback)
        }
    }, [])

    useEffect(() => {
        if (!state.loading) {
            resetPaginationOffset()
            chartRepos && initialiseFromQueryParams(chartRepos)
            callApplyFilterOnCharts(true)
        }
    }, [chartRepos, location.search, state.loading])

    function reloadCallback(event): void {
        event.preventDefault()
        if (isLeavingPageNotAllowed.current) {
            event.returnValue = 'Your changes will be lost. Do you want to leave without deploying?'
        }
    }

    function redirectToGroupDetail(): void {
        let url = `${URLS.CHARTS}/discover/group/${groupId}`
        history.push(url)
    }

    function closeChartGroupModal(props): void {
        if (props?.name) {
            updateChartGroupNameAndDescription(props.name, props?.description || '')
        }
        setChartDetailsUpdate(false)
    }

    function initialiseFromQueryParams(chartRepoList): void {
        let searchParams = new URLSearchParams(location.search)
        let allChartRepoIds: string = searchParams.get(QueryParams.ChartRepoId)
        let allRegistryIds: string = searchParams.get(QueryParams.RegistryId)
        let deprecated: string = searchParams.get(QueryParams.IncludeDeprecated)
        let appStoreName: string = searchParams.get(QueryParams.AppStoreName)
        let chartRepoIdArray = []
        let ociRegistryArray = []
        if (allChartRepoIds) chartRepoIdArray = allChartRepoIds.split(',')
        if (allRegistryIds) ociRegistryArray = allRegistryIds.split(',')
        chartRepoIdArray = chartRepoIdArray.map((chartRepoId) => parseInt(chartRepoId))
        ociRegistryArray = ociRegistryArray.map((ociRegistryId) => ociRegistryId)

        let selectedRepos = []
        for (let i = 0; i < chartRepoIdArray.length; i++) {
            let chartRepo = chartRepoList?.find((item) => +item.value === chartRepoIdArray[i])
            if (chartRepo) selectedRepos.push(chartRepo)
        }
        for (let i = 0; i < ociRegistryArray.length; i++) {
            let registry = chartRepoList?.find((item) => item.value === ociRegistryArray[i])
            if (registry) selectedRepos.push(registry)
        }
        if (selectedRepos) setSelectedChartRepo(selectedRepos)
        if (deprecated) setIncludeDeprecated(parseInt(deprecated))
        if (appStoreName) {
            setSearchApplied(true)
            setAppStoreName(appStoreName)
        } else {
            setSearchApplied(false)
            setAppStoreName('')
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

    const renderBreadcrumbs = () => {
        return (
            <div className="flex left">
                <BreadCrumb breadcrumbs={breadcrumbs.slice(1)} />
            </div>
        )
    }

    const renderChartGroupEditActionButton = () => {
        return (
            <div className="dc__page-header__cta-container flex right">
                <button className="cta h-32 flex cancel mr-16" onClick={handleSave}>
                    {loading ? (
                        <Progressing />
                    ) : (
                        <div className="flex left " data-testid="save-group-button-navbar" style={{ width: '100%' }}>
                            <SaveIcon className="mr-5" />
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
        history.push(`${url}?${QueryParams.IncludeDeprecated}=1`)
    }

    return (
        <>
            <div className="chart-group--details-page">
                <PageHeader
                    isBreadcrumbs={true}
                    breadCrumbs={renderBreadcrumbs}
                    renderActionButtons={renderChartGroupEditActionButton}
                />
                <Prompt
                    when={isLeavingPageNotAllowed.current}
                    message={'Your changes will be lost. Do you want to leave without saving?'}
                />

                {!state.loading ? (
                    <div className={`chart-group--details-body summary-show`}>
                        {typeof state.configureChartIndex != 'number' ? (
                            <ChartHeaderFilters
                                chartRepoList={chartRepos}
                                setSelectedChartRepo={setSelectedChartRepo}
                                searchApplied={searchApplied}
                                appStoreName={appStoreName}
                                includeDeprecated={includeDeprecated}
                                selectedChartRepo={selectedChartRepo}
                                setAppStoreName={setAppStoreName}
                                isGrid={isGrid}
                                setIsGrid={setIsGrid}
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
                                    <>
                                        <ChartEmptyState
                                            onClickViewChartButton={handleViewAllCharts}
                                            heightToDeduct={150}
                                        />
                                    </>
                                ) : (
                                    <div className={`${!isGrid ? 'chart-list-view ' : ''}`}>
                                        <ChartList
                                            availableCharts={state.availableCharts}
                                            addChart={addChart}
                                            subtractChart={subtractChart}
                                            selectedInstances={state.selectedInstances}
                                            isGrid={isGrid}
                                        />
                                        {state.hasMoreCharts && <Progressing/>}
                                        {state.hasMoreCharts &&  <DetectBottom callback={reloadNextAfterBottom} />}
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
                    history={history}
                    location={location}
                    match={match}
                    chartGroupId={Number(groupId)}
                    name={state.name}
                    description={state.description}
                />
            )}
        </>
    )
}

function ChartList({ availableCharts, selectedInstances, addChart, subtractChart, isGrid }) {
    return (
        <div className={`chart-grid ${!isGrid ? 'list-view' : ''}`}>
            {[...availableCharts.values()].map((chart: Chart, idx) => (
                <ChartSelect
                    key={chart.id}
                    chart={chart}
                    selectedCount={selectedInstances[chart.id]?.length}
                    addChart={addChart}
                    subtractChart={subtractChart}
                    showCheckBoxOnHoverOnly={false}
                    showDescription={!isGrid}
                    datatestid={`${idx}`}
                />
            ))}
        </div>
    )
}
