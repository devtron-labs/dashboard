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

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Prompt, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import Tippy from '@tippyjs/react'

import {
    Button,
    ButtonVariantType,
    ComponentSizeType,
    ConditionalWrap,
    DetectBottom,
    DevtronProgressing,
    DocLink,
    FeatureTitleWithInfo,
    handleAnalyticsEvent,
    PageHeader,
    Popover,
    Progressing,
    showError,
    ToastManager,
    ToastVariantType,
    useMainContext,
    usePopover,
} from '@devtron-labs/devtron-fe-common-lib'

import { ChartDetails } from '@Pages/ChartStore'

import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as WarningIcon } from '../../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as Next } from '../../../assets/icons/ic-arrow-forward.svg'
import { ReactComponent as BackIcon } from '../../../assets/icons/ic-back.svg'
import { ReactComponent as SourceIcon } from '../../../assets/icons/ic-source.svg'
import empty from '../../../assets/img/ic-empty-chartgroup@2x.png'
import { SERVER_MODE, URLS } from '../../../config'
import { isGitOpsModuleInstalledAndConfigured } from '../../../services/service'
import { mapByKey, Select, sortOptionsByLabel } from '../../common'
import ChartEmptyState from '../../common/emptyState/ChartEmptyState'
import NoGitOpsConfiguredWarning from '../../workflowEditor/NoGitOpsConfiguredWarning'
import AdvancedConfig from '../AdvancedConfig'
import ChartCard from '../ChartCard'
import ChartHeaderFilter from '../ChartHeaderFilters'
import { deployChartGroup, getChartProviderList } from '../charts.service'
import { Chart, ChartGroupEntry, ChartListType, EmptyCharts } from '../charts.types'
import ChartValues from '../chartValues/ChartValues'
import { QueryParams } from '../constants'
import ChartGroupBasicDeploy from '../modal/ChartGroupBasicDeploy'
import CreateChartGroup from '../modal/CreateChartGroup'
import MultiChartSummary from '../MultiChartSummary'
import useChartGroup from '../useChartGroup'
import { ChartGroupCard } from '../ChartGroupCard'
import ChartCardSkeletonRow from './ChartCardSkeleton'
import ChartGroupRouter from './ChartGroup'
import ChartListPopUp from './ChartListPopUp'
import { getDeployableChartsFromConfiguredCharts, renderAdditionalChartHeaderInfo } from './utils'

const DiscoverChartList = ({ isSuperAdmin }: { isSuperAdmin: boolean }) => {
    const { serverMode } = useMainContext()
    const location = useLocation()
    const history = useHistory()
    const match = useRouteMatch()
    const { url } = match
    const {
        state,
        configureChart,
        selectChart,
        validateData,
        addChart,
        subtractChart,
        fetchChartValues,
        getChartVersionsAndValues,
        handleChartValueChange,
        handleChartVersionChange,
        handleValuesYaml,
        removeChart,
        handleEnvironmentChange,
        handleNameChange,
        handleEnvironmentChangeOfAllCharts,
        discardValuesYamlChanges,
        chartListing,
        applyFilterOnCharts,
        resetPaginationOffset,
        setGitOpsConfigAvailable,
        setEnvironmentList,
    } = useChartGroup()
    const [project, setProject] = useState({ id: null, error: '' })
    const [installing, setInstalling] = useState(false)
    const [showDeployModal, toggleDeployModal] = useState(false)
    const [chartListLoading, setChartListloading] = useState(true)
    const [selectedChartRepo, setSelectedChartRepo] = useState([])
    const [appStoreName, setAppStoreName] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [includeDeprecated, setIncludeDeprecated] = useState(0)
    const [chartCategoryIds, setChartCategoryIds] = useState<string[]>([])
    const projectsMap = mapByKey(state.projects, 'id')
    const chartList: Chart[] = Array.from(state.availableCharts.values())
    const isLeavingPageNotAllowed = useRef(false)
    const [showChartGroupModal, toggleChartGroupModal] = useState(false)
    const [isGrid, setIsGrid] = useState<boolean>(true)
    const [showGitOpsWarningModal, toggleGitOpsWarningModal] = useState(false)
    const [clickedOnAdvance, setClickedOnAdvance] = useState(null)
    const [chartActiveMap, setChartActiveMap] = useState({})

    const [chartLists, setChartLists] = useState<ChartListType[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [filteredChartList, setFilteredChartList] = useState<ChartListType[]>([])

    const chartStoreRef = useRef<HTMLDivElement>(null)

    const { open, overlayProps, popoverProps, triggerProps, closePopover } = usePopover({
        id: 'profile-menu',
        alignment: 'end',
        width: 250,
    })

    const noChartAvailable: boolean =
        chartList.length > 0 || searchApplied || selectedChartRepo.length > 0 || !!chartCategoryIds
    isLeavingPageNotAllowed.current = !state.charts.every(
        (chart: ChartGroupEntry) => chart.originalValuesYaml === chart.valuesYaml,
    )

    useEffect(() => {
        getChartFilter()
    }, [])

    const chartRepos = useMemo(
        () =>
            chartLists
                .filter((chartRepo) => chartRepo.active)
                .map((chartRepo) => ({
                    value: chartRepo.id,
                    label: chartRepo.name,
                    isOCIRegistry: chartRepo.isOCIRegistry,
                }))
                .sort(sortOptionsByLabel),
        [chartLists],
    )

    useEffect(() => {
        if (!state.loading) {
            resetPaginationOffset()
            chartRepos && initialiseFromQueryParams(chartRepos)
            callApplyFilterOnCharts(true)
            getGitOpsModuleInstalledAndConfigured()
        }
    }, [chartRepos, location.search, state.loading])

    const getChartFilter = async () => {
        setIsLoading(true)
        try {
            const chartRepos = (await getChartProviderList()).result || []
            chartRepos.sort((a, b) => a.name.localeCompare(b.name))
            setChartLists(chartRepos)
            setFilteredChartList(chartRepos)
            setChartActiveMap(
                chartRepos.reduce((acc, curr) => {
                    acc[curr.name] = curr.active
                    return acc
                }, {}),
            )
        } catch (err) {
            showError(err)
        } finally {
            setIsLoading(false)
        }
    }

    async function getGitOpsModuleInstalledAndConfigured() {
        await isGitOpsModuleInstalledAndConfigured().then((response) => {
            setGitOpsConfigAvailable(response.result.isInstalled && !response.result.isConfigured)
        })
    }

    const handleDeployButtonClick = (): void => {
        handleActionButtonClick(false)
        handleAnalyticsEvent({
            category: 'Chart Store',
            action: state.advanceVisited ? 'CS_BULK_DEPLOY_ADV_DEPLOY' : 'CS_BULK_DEPLOY_TO',
        })
    }

    const handleAdvancedButtonClick = (): void => {
        handleActionButtonClick(true)
        handleAnalyticsEvent({ category: 'Chart Store', action: 'CS_BULK_DEPLOY_ADV_OPTIONS' })
    }

    const handleActionButtonClick = (_clickedOnAdvance: boolean): void => {
        if (state.noGitOpsConfigAvailable) {
            setClickedOnAdvance(_clickedOnAdvance)
            toggleGitOpsWarningModal(true)
        } else {
            handleContinueWithHelm(_clickedOnAdvance)
        }
    }

    const handleContinueWithHelm = (_clickedOnAdvance: boolean): void => {
        if (_clickedOnAdvance) {
            configureChart(0)
        } else if (state.advanceVisited) {
            handleInstall()
        } else {
            toggleDeployModal(true)
        }
    }

    const hideNoGitOpsWarning = (isContinueWithHelm: boolean): void => {
        toggleGitOpsWarningModal(false)
        if (isContinueWithHelm) {
            handleContinueWithHelm(clickedOnAdvance)
        }
    }

    async function handleInstall() {
        if (!project.id) {
            setProject((project) => ({ ...project, error: 'Project is mandatory for deployment.' }))
            return
        }
        try {
            setInstalling(true)
            // NOTE: This validation call also goes inside component as well discuss about it
            const validated = await validateData()
            if (!validated) {
                ToastManager.showToast({
                    variant: ToastVariantType.warn,
                    description: 'Click on highlighted charts and resolve errors.',
                })
                return
            }
            const deployableCharts = getDeployableChartsFromConfiguredCharts(state.charts)
            await deployChartGroup(project.id, deployableCharts)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Deployment initiated',
            })
            setInstalling(false)
            history.push(URLS.HELM_APP_LIST)
        } catch (err) {
            showError(err)
        } finally {
            setInstalling(false)
        }
    }

    function redirectToConfigure(): void {
        configureChart(0)
        toggleDeployModal(false)
    }

    // should be removed and use useUrlFilters instead
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
        setChartListloading(true)
        await applyFilterOnCharts(location.search, resetPage)
        setChartListloading(false)
    }

    async function callPaginationOnCharts() {
        await applyFilterOnCharts(location.search, false)
    }

    function handleViewAllCharts(): void {
        history.push(`${match.url.split('/chart-store')[0]}${URLS.GLOBAL_CONFIG_CHART}`)
    }

    function renderCreateGroupButton() {
        return (
            <div className="dc__page-header__cta-container flex">
                {chartList.length > 0 && serverMode == SERVER_MODE.FULL && state.charts.length === 0 && (
                    <button
                        type="button"
                        className="bg__primary en-2 bw-1 cursor cb-5 fw-6 fs-13 br-4 pr-12 pl-12 fcb-5 flex h-32 lh-n cta small dc__gap-6"
                        onClick={(e) => toggleChartGroupModal(!showChartGroupModal)}
                        data-testid="create-button-group-present"
                    >
                        <Add className="icon-dim-18" />
                        Create Group
                    </button>
                )}
            </div>
        )
    }

    const onClickSourceButton = (e) => {
        handleAnalyticsEvent({ category: 'Chart Store', action: 'CS_SOURCE' })
    }

    const renderBreadcrumbs = () => {
        if (typeof state.configureChartIndex === 'number') {
            return (
                <span onClick={chartListing} className="fs-16 flex m-0 lh-20 cursor cn-9">
                    <BackIcon className=" cn-6 mr-16" />
                    Advanced options
                </span>
            )
        }

        return (
            <div className="bg__primary">
                <div className="m-0 flex left">
                    {state.charts.length > 0 && (
                        <>
                            <NavLink to={match.url} className="dc__devtron-breadcrumb__item">
                                <span className="cb-5 fs-16 cursor">Discover </span>
                            </NavLink>
                            <span className="fs-16 cn-5 ml-4 mr-4"> / </span>
                        </>
                    )}
                    <div className="flex dc__gap-16">
                        {state.charts.length === 0 ? (
                            <>
                                {renderAdditionalChartHeaderInfo()}
                                {isSuperAdmin && (
                                    <Popover
                                        open={open}
                                        overlayProps={overlayProps}
                                        popoverProps={popoverProps}
                                        triggerProps={triggerProps}
                                        triggerElement={null}
                                        buttonProps={{
                                            onClick: onClickSourceButton,
                                            text: 'source',
                                            variant: ButtonVariantType.secondary,
                                            size: ComponentSizeType.xxs,
                                            dataTestId: 'chart-store-source-button',
                                            startIcon: <SourceIcon />
                                        }}
                                    >
                                        <ChartListPopUp
                                            onClose={closePopover}
                                            chartList={chartLists}
                                            filteredChartList={filteredChartList}
                                            setFilteredChartList={setFilteredChartList}
                                            isLoading={isLoading}
                                            setShowSourcePopUp={closePopover}
                                            chartActiveMap={chartActiveMap}
                                            setChartActiveMap={setChartActiveMap}
                                        />
                                    </Popover>
                                )}
                            </>
                        ) : (
                            'Deploy multiple charts'
                        )}
                    </div>
                </div>
            </div>
        )
    }

    async function reloadNextAfterBottom() {
        callPaginationOnCharts()
    }

    const clearSearch = (): void => {
        history.push(url)
    }

    const renderChartStoreEmptyState = (): JSX.Element =>
        chartRepos?.length > 0 && noChartAvailable && searchApplied ? (
            <ChartEmptyState onClickViewChartButton={clearSearch} />
        ) : (
            <ChartEmptyState
                title="No charts available right now"
                subTitle="The connected chart repositories are syncing or no charts are available."
                onClickViewChartButton={handleViewAllCharts}
                buttonText="View connected chart repositories"
            />
        )

    return (
        <>
            <div className={`discover-charts bg__primary ${state.charts.length > 0 ? 'summary-show' : ''}`}>
                <ConditionalWrap condition={state.charts.length > 0} wrap={(children) => <div>{children}</div>}>
                    <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} />
                </ConditionalWrap>

                <Prompt
                    when={isLeavingPageNotAllowed.current}
                    message="Your changes will be lost. Do you want to leave without deploying?"
                />
                {!state.loading ? (
                    <div className="discover-charts__body">
                        {typeof state.configureChartIndex !== 'number' && chartRepos?.length > 0 && (
                            <ChartHeaderFilter
                                chartRepoList={chartRepos}
                                setSelectedChartRepo={setSelectedChartRepo}
                                appStoreName={appStoreName}
                                includeDeprecated={includeDeprecated}
                                selectedChartRepo={selectedChartRepo}
                                isGrid={isGrid}
                                setIsGrid={setIsGrid}
                                chartCategoryIds={chartCategoryIds}
                                setChartCategoryIds={setChartCategoryIds}
                                chartStoreRef={chartStoreRef}
                            />
                        )}
                        {state.loading || chartListLoading ? (
                            <Progressing pageLoader />
                        ) : (
                            <>
                                {!noChartAvailable ? (
                                    <div className="w-100" style={{ overflow: 'auto' }}>
                                        {typeof state.configureChartIndex === 'number' ? (
                                            <AdvancedConfig
                                                chart={state.charts[state.configureChartIndex]}
                                                index={state.configureChartIndex}
                                                handleValuesYaml={handleValuesYaml}
                                                getChartVersionsAndValues={getChartVersionsAndValues}
                                                fetchChartValues={fetchChartValues}
                                                handleChartValueChange={handleChartValueChange}
                                                handleChartVersionChange={handleChartVersionChange}
                                                handleEnvironmentChange={handleEnvironmentChange}
                                                handleNameChange={handleNameChange}
                                                discardValuesYamlChanges={discardValuesYamlChanges}
                                            />
                                        ) : (
                                            renderChartStoreEmptyState()
                                        )}
                                    </div>
                                ) : (
                                    <div className="discover-charts__body-details bg__secondary" ref={chartStoreRef}>
                                        {typeof state.configureChartIndex === 'number' ? (
                                            <AdvancedConfig
                                                chart={state.charts[state.configureChartIndex]}
                                                index={state.configureChartIndex}
                                                handleValuesYaml={handleValuesYaml}
                                                getChartVersionsAndValues={getChartVersionsAndValues}
                                                fetchChartValues={fetchChartValues}
                                                handleChartValueChange={handleChartValueChange}
                                                handleChartVersionChange={handleChartVersionChange}
                                                handleEnvironmentChange={handleEnvironmentChange}
                                                handleNameChange={handleNameChange}
                                                discardValuesYamlChanges={discardValuesYamlChanges}
                                            />
                                        ) : (
                                            <div className={`h-100 ${!isGrid ? 'chart-list-view ' : ''}`}>
                                                {serverMode == SERVER_MODE.FULL &&
                                                    !searchApplied &&
                                                    !selectedChartRepo.length &&
                                                    !chartCategoryIds.length &&
                                                    !!chartList.length && (
                                                        <ChartGroupListMin
                                                            chartGroups={state.chartGroups.slice(0, isGrid ? 5 : 1)}
                                                            showChartGroupModal={showChartGroupModal}
                                                            toggleChartGroupModal={toggleChartGroupModal}
                                                            isGrid={isGrid}
                                                            renderCreateGroupButton={renderCreateGroupButton}
                                                        />
                                                    )}
                                                {chartList.length ? (
                                                    <>
                                                        <ChartListHeader charts={state.charts} />
                                                        <div
                                                            className={`chart-grid ${!isGrid ? 'list-view' : ''}`}
                                                            data-testid={`chart-${!isGrid ? 'list-view' : 'grid-view'}`}
                                                        >
                                                            {chartList
                                                                .slice(0, showDeployModal ? 12 : chartList.length)
                                                                .map((chart, index) => (
                                                                    <ChartCard
                                                                        key={chart.id}
                                                                        chart={chart}
                                                                        selectedCount={
                                                                            state.selectedInstances[chart.id]?.length
                                                                        }
                                                                        addChart={addChart}
                                                                        subtractChart={subtractChart}
                                                                        onClick={(chartId) =>
                                                                            state.charts.length === 0
                                                                                ? history.push(
                                                                                      `${url}/chart/${chart.id}`,
                                                                                  )
                                                                                : selectChart(chartId)
                                                                        }
                                                                        dataTestId={`single-${index}`}
                                                                        isListView={!isGrid}
                                                                    />
                                                                ))}
                                                            {state.hasMoreCharts && (
                                                                <ChartCardSkeletonRow isGridView={isGrid} />
                                                            )}
                                                            {state.hasMoreCharts && (
                                                                <DetectBottom callback={reloadNextAfterBottom} />
                                                            )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    renderChartStoreEmptyState()
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                        <aside className="summary">
                            <MultiChartSummary
                                charts={state.charts}
                                configureChartIndex={state.configureChartIndex}
                                configureChart={configureChart}
                                chartListing={chartListing}
                                getChartVersionsAndValues={getChartVersionsAndValues}
                                handleChartValueChange={
                                    typeof state.configureChartIndex === 'number' ? null : handleChartValueChange
                                }
                                handleChartVersionChange={
                                    typeof state.configureChartIndex === 'number' ? null : handleChartVersionChange
                                }
                                removeChart={removeChart}
                            />
                            <div
                                className={`flex left deployment-buttons ${
                                    state.advanceVisited ? 'deployment-buttons--advanced' : ''
                                }`}
                            >
                                {state.advanceVisited && (
                                    <div>
                                        <label
                                            className="dc__required-field"
                                            data-testid="advanced-option-project-heading"
                                        >
                                            Project
                                        </label>
                                        <Select
                                            rootClassName={`${project.error ? 'popup-button--error' : ''}`}
                                            value={project.id}
                                            onChange={(e) => setProject({ id: e.target.value, error: '' })}
                                        >
                                            <Select.Button dataTestIdDropdown="advanced-option-project-list">
                                                {project.id && projectsMap.has(project.id)
                                                    ? projectsMap.get(project.id).name
                                                    : 'Select project'}
                                            </Select.Button>
                                            {state.projects?.map((project) => (
                                                <Select.Option key={project.id} value={project.id}>
                                                    {project.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        {project.error && (
                                            <span className="form__error flex left">
                                                <WarningIcon className="mr-5 icon-dim-16" />
                                                {project.error}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {!state.advanceVisited && (
                                    <ConditionalWrap
                                        condition={state.charts.length === 0}
                                        wrap={(children) => (
                                            <Tippy
                                                className="default-tt"
                                                arrow={false}
                                                placement="top"
                                                content="Add charts to deploy"
                                            >
                                                <div>{children}</div>
                                            </Tippy>
                                        )}
                                    >
                                        <button
                                            type="button"
                                            disabled={state.charts.length === 0}
                                            onClick={handleAdvancedButtonClick}
                                            className="cta cancel dc__ellipsis-right"
                                            data-testid="advanced-option-button"
                                        >
                                            Advanced Options
                                        </button>
                                    </ConditionalWrap>
                                )}
                                <ConditionalWrap
                                    condition={state.charts.length === 0}
                                    wrap={(children) => (
                                        <Tippy
                                            className="default-tt"
                                            arrow={false}
                                            placement="top"
                                            content="Add charts to deploy"
                                        >
                                            <div>{children}</div>
                                        </Tippy>
                                    )}
                                >
                                    <button
                                        type="button"
                                        disabled={state.charts.length === 0}
                                        onClick={handleDeployButtonClick}
                                        className="cta dc__ellipsis-right"
                                        data-testid="chart-store-single-chart-deploy-to-button"
                                    >
                                        {installing ? (
                                            <Progressing />
                                        ) : state.advanceVisited ? (
                                            'Deploy charts'
                                        ) : (
                                            'Deploy to...'
                                        )}
                                    </button>
                                </ConditionalWrap>
                            </div>
                        </aside>
                    </div>
                ) : (
                    <DevtronProgressing parentClasses="h-100 flex bg__primary" classes="icon-dim-80" />
                )}
            </div>
            {showDeployModal ? (
                <ChartGroupBasicDeploy
                    projects={state.projects}
                    chartGroupEntries={state.charts}
                    environments={state.environments}
                    selectedProjectId={project.id}
                    loading={installing}
                    deployChartGroup={handleInstall}
                    handleProjectChange={(projectId) => setProject({ id: projectId, error: '' })}
                    handleNameChange={handleNameChange}
                    closeDeployModal={() => toggleDeployModal(false)}
                    handleEnvironmentChangeOfAllCharts={handleEnvironmentChangeOfAllCharts}
                    redirectToAdvancedOptions={redirectToConfigure}
                    validateData={validateData}
                    setEnvironments={setEnvironmentList}
                />
            ) : null}

            {showChartGroupModal ? (
                <CreateChartGroup
                    history={history}
                    location={location}
                    match={match}
                    closeChartGroupModal={() => {
                        toggleChartGroupModal(!showChartGroupModal)
                    }}
                />
            ) : null}

            {showGitOpsWarningModal && <NoGitOpsConfiguredWarning closePopup={hideNoGitOpsWarning} />}
        </>
    )
}

export default function DiscoverCharts({ isSuperAdmin }: { isSuperAdmin: boolean }) {
    const match = useRouteMatch()
    const { path } = match

    return (
        <Switch>
            <Route path={`${path}/group`}>
                <ChartGroupRouter />
            </Route>
            <Route path={`${path}${URLS.CHART}/:chartId${URLS.PRESET_VALUES}/:chartValueId`} exact>
                <ChartValues />
            </Route>
            <Route path={`${path}${URLS.CHART}/:chartId`}>
                {({ match: { params } }) => <ChartDetails key={params.chartId} />}
            </Route>
            <Route>
                <DiscoverChartList isSuperAdmin={isSuperAdmin} />
            </Route>
        </Switch>
    )
}

const ChartListHeader = ({ charts }) => (
    <div>
        <h3 className="chart-grid__title pl-20 pr-20 pt-16" data-testid="chart-store-chart-heading">
            {charts.length === 0 ? 'All Charts' : 'Select Charts'}
        </h3>
        <p className="mb-0 mt-4 pl-20" data-testid="chart-store-list-subheading">
            Select chart to deploy. &nbsp;
            <DocLink
                dataTestId="chart-group-link"
                docLinkKey="CHART_LIST"
                text="Learn how to deploy charts"
                fontWeight="normal"
                size={ComponentSizeType.small}
            />
        </p>
    </div>
)

export const EmptyChartGroup = ({
    title,
    removeLearnMore = false,
    image,
    onClickViewChartButton,
    buttonText,
    subTitle,
    styles,
    toggleChartGroupModal,
    showChartGroupModal,
}: EmptyCharts) => {
    const handleCreateGroup = () => {
        toggleChartGroupModal(!showChartGroupModal)
        handleAnalyticsEvent({ category: 'Chart Store', action: 'CS_CREATE_CHART_GROUP' })
    }

    return (
        <div className="bg__primary flex left br-8 mt-20 ml-20 mr-20" style={{ gridColumn: '1 / span 4', ...styles }}>
            <img src={image || empty} style={{ width: '200px', margin: '20px 42px' }} />
            <div>
                <div className="fs-16 fw-6" data-testid="chart-group-heading">
                    {title || 'Chart group'}
                </div>
                <div className="cn-7" data-testid="chart-group-subheading">
                    {subTitle || 'Use chart groups to preconfigure and deploy frequently used charts together.'}
                </div>
                {!removeLearnMore && (
                    <DocLink
                        dataTestId="chart-group-link"
                        docLinkKey="CHART_GROUP"
                        text="Learn more about chart groups"
                        fontWeight="normal"
                    />
                )}
                {typeof onClickViewChartButton === 'function' ? (
                    <button type="button" onClick={onClickViewChartButton} className="cta ghosted flex mb-24 mt-24">
                        {buttonText || 'View all charts'}
                    </button>
                ) : (
                    <button
                        type="button"
                        className="en-2 br-4 bw-1 mt-16 cursor flex fw-6 cn-7 pt-6 pr-10 pb-6 pl-10 bg__primary h-32"
                        onClick={handleCreateGroup}
                        data-testid="chart-group-create-button"
                    >
                        Create group
                    </button>
                )}
            </div>
        </div>
    )
}

export const ChartGroupListMin = ({
    chartGroups,
    toggleChartGroupModal,
    showChartGroupModal,
    isGrid,
    renderCreateGroupButton,
}: {
    chartGroups
    showChartGroupModal?: boolean
    toggleChartGroupModal?: React.Dispatch<React.SetStateAction<boolean>>
    isGrid?: boolean
    renderCreateGroupButton?: () => JSX.Element
}) => {
    const history = useHistory()
    const match = useRouteMatch()
    if (chartGroups.length == 0) {
        return (
            <EmptyChartGroup showChartGroupModal={showChartGroupModal} toggleChartGroupModal={toggleChartGroupModal} />
        )
    }

    const redirectToGroup = () => {
        history.push(`${match.url}/group`)
        handleAnalyticsEvent({ category: 'Chart Store', action: 'CS_ALL_CHART_GROUPS' })
    }

    return (
        <div className="chart-group">
            <div className="px-20 pt-20">
                <div className="flex dc__content-space dc__gap-8">
                    <FeatureTitleWithInfo
                        title="Chart Groups"
                        renderDescriptionContent={() =>
                            'Use chart groups to pre-configure and deploy frequently used charts together.'
                        }
                        docLink="CHART_GROUP"
                        dataTestId="chart-store"
                        showInfoIconTippy
                    />
                    <div className="flex dc__content-space dc__gap-8 h-32">
                        <button
                            className="cb-5 fw-6 fs-13 flex fcb-5 cursor dc__transparent dc__gap-6 en-2 bw-1 px-10 py-6 br-4 bg__primary"
                            onClick={redirectToGroup}
                        >
                            <span className="lh-20">View all chart groups</span>
                            <Next className="icon-dim-16" />
                        </button>
                        {renderCreateGroupButton()}
                    </div>
                </div>
            </div>
            <div className={`chart-grid ${!isGrid ? 'list-view' : ''} chart-grid--chart-group-snapshot`}>
                {chartGroups?.map((chartGroup, idx) => <ChartGroupCard key={idx} chartGroup={chartGroup} />)}
            </div>
        </div>
    )
}
