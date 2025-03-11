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

import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
    showError,
    Progressing,
    ConditionalWrap,
    DevtronProgressing,
    PageHeader,
    useMainContext,
    DetectBottom,
    FeatureTitleWithInfo,
    ToastVariantType,
    ToastManager,
} from '@devtron-labs/devtron-fe-common-lib'
import { Switch, Route, NavLink, useHistory, useLocation, useRouteMatch, Prompt } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { Select, mapByKey, sortOptionsByLabel } from '../../common'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import ChartSelect from '../util/ChartSelect'
import ChartGroupList from './ChartGroup'
import ChartGroupCard from '../util/ChartGroupCard'
import DiscoverChartDetails from '../discoverChartDetail/DiscoverChartDetails'
import MultiChartSummary from '../MultiChartSummary'
import AdvancedConfig from '../AdvancedConfig'
import useChartGroup from '../useChartGroup'
import { DeployableCharts, deployChartGroup, getChartProviderList } from '../charts.service'
import { ChartGroupEntry, Chart, EmptyCharts, ChartListType } from '../charts.types'
import ChartGroupBasicDeploy from '../modal/ChartGroupBasicDeploy'
import CreateChartGroup from '../modal/CreateChartGroup'
import { DOCUMENTATION, URLS, SERVER_MODE } from '../../../config'
import { ReactComponent as WarningIcon } from '../../../assets/icons/ic-alert-triangle.svg'
import empty from '../../../assets/img/ic-empty-chartgroup@2x.png'
import ChartHeaderFilter from '../ChartHeaderFilters'
import { QueryParams } from '../charts.util'
import ChartEmptyState from '../../common/emptyState/ChartEmptyState'
import SavedValuesList from '../SavedValues/SavedValuesList'
import ChartValues from '../chartValues/ChartValues'
import { ReactComponent as Next } from '../../../assets/icons/ic-arrow-forward.svg'
import NoGitOpsConfiguredWarning from '../../workflowEditor/NoGitOpsConfiguredWarning'
import { ReactComponent as BackIcon } from '../../../assets/icons/ic-back.svg'
import { isGitOpsModuleInstalledAndConfigured } from '../../../services/service'
import { ReactComponent as SourceIcon } from '../../../assets/icons/ic-source.svg'
import ChartListPopUp from './ChartListPopUp'

// TODO: move to service
export function getDeployableChartsFromConfiguredCharts(charts: ChartGroupEntry[]): DeployableCharts[] {
    return charts
        .filter((chart) => chart.isEnabled)
        .map((chart) => {
            return {
                appName: chart.name.value,
                environmentId: chart.environment.id,
                appStoreVersion: chart.appStoreApplicationVersionId,
                valuesOverrideYaml: chart.valuesYaml,
                referenceValueId: chart.appStoreValuesVersionId || chart.appStoreApplicationVersionId,
                referenceValueKind: chart.kind,
                chartGroupEntryId: chart.installedId,
            }
        })
}

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
    const projectsMap = mapByKey(state.projects, 'id')
    const chartList: Chart[] = Array.from(state.availableCharts.values())
    const isLeavingPageNotAllowed = useRef(false)
    const [showChartGroupModal, toggleChartGroupModal] = useState(false)
    const [isGrid, setIsGrid] = useState<boolean>(true)
    const [showGitOpsWarningModal, toggleGitOpsWarningModal] = useState(false)
    const [clickedOnAdvance, setClickedOnAdvance] = useState(null)
    const [chartActiveMap, setChartActiveMap] = useState({})

    const [showSourcePopoUp, setShowSourcePopoUp] = useState<boolean>(false)
    const [chartLists, setChartLists] = useState<ChartListType[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [filteredChartList, setFilteredChartList] = useState<ChartListType[]>([])

    const noChartAvailable: boolean = chartList.length > 0 || searchApplied || selectedChartRepo.length > 0
    isLeavingPageNotAllowed.current = !state.charts.reduce((acc: boolean, chart: ChartGroupEntry) => {
        return (acc = acc && chart.originalValuesYaml === chart.valuesYaml)
    }, true)

    useEffect(() => {
        getChartFilter()
    }, [])

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
            chartRepos.sort((a, b) => a['name'].localeCompare(b['name']))
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
    }

    const handleAdvancedButtonClick = (): void => {
        handleActionButtonClick(true)
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

    function reloadCallback(event): void {
        event.preventDefault()
        if (isLeavingPageNotAllowed.current) {
            event.returnValue = 'Your changes will be lost. Do you want to reload without deploying?'
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
            const url = `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_HELM}`
            history.push(url)
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

    function initialiseFromQueryParams(chartRepoList): void {
        const searchParams = new URLSearchParams(location.search)
        const allChartRepoIds: string = searchParams.get(QueryParams.ChartRepoId)
        const allRegistryIds: string = searchParams.get(QueryParams.RegistryId)
        const deprecated: string = searchParams.get(QueryParams.IncludeDeprecated)
        const appStoreName: string = searchParams.get(QueryParams.AppStoreName)
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
        }
        if (appStoreName) {
            setSearchApplied(true)
            setAppStoreName(appStoreName)
        } else {
            setSearchApplied(false)
            setAppStoreName('')
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

    const onChangeShowSourcePopup = () => {
        setShowSourcePopoUp(true)
    }

    const toggleChartListPopUp = (e: React.MouseEvent): void => {
        e.stopPropagation()
        setShowSourcePopoUp(!setShowSourcePopoUp)
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
                    <span className="fs-16 cn-9">
                        {state.charts.length === 0 ? (
                            <>
                                Chart Store
                                {isSuperAdmin && (
                                    <button
                                        className="en-2 bw-1 br-4 cb-5 fw-6 bg__primary ml-16 scb-5"
                                        onClick={onChangeShowSourcePopup}
                                    >
                                        <SourceIcon className="mr-4" />
                                        <span className="fs-12">Source</span>
                                    </button>
                                )}
                            </>
                        ) : (
                            'Deploy multiple charts'
                        )}
                    </span>
                </div>
                <div>
                    {showSourcePopoUp && (
                        <ChartListPopUp
                            onClose={toggleChartListPopUp}
                            chartList={chartLists}
                            filteredChartList={filteredChartList}
                            setFilteredChartList={setFilteredChartList}
                            isLoading={isLoading}
                            setShowSourcePopoUp={setShowSourcePopoUp}
                            chartActiveMap={chartActiveMap}
                            setChartActiveMap={setChartActiveMap}
                        />
                    )}
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

    const randerChartStoreEmptyState = (): JSX.Element => {
        return chartRepos?.length > 0 && noChartAvailable ? (
            <ChartEmptyState onClickViewChartButton={clearSearch} />
        ) : (
            <ChartEmptyState
                title="No charts available right now"
                subTitle="The connected chart repositories are syncing or no charts are available."
                onClickViewChartButton={handleViewAllCharts}
                buttonText="View connected chart repositories"
            />
        )
    }

    return (
        <>
            <div
                className={`discover-charts bg__primary ${state.charts.length > 0 ? 'summary-show' : ''} chart-store-header`}
            >
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
                                            randerChartStoreEmptyState()
                                        )}
                                    </div>
                                ) : (
                                    <div className="discover-charts__body-details bg__secondary">
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
                                                    selectedChartRepo.length === 0 && (
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
                                                                    <ChartSelect
                                                                        key={chart.id}
                                                                        chart={chart}
                                                                        selectedCount={
                                                                            state.selectedInstances[chart.id]?.length
                                                                        }
                                                                        showCheckBoxOnHoverOnly={
                                                                            state.charts.length === 0
                                                                        }
                                                                        addChart={addChart}
                                                                        showDescription={!isGrid}
                                                                        subtractChart={subtractChart}
                                                                        onClick={(chartId) =>
                                                                            state.charts.length === 0
                                                                                ? history.push(
                                                                                      `${url}/chart/${chart.id}`,
                                                                                  )
                                                                                : selectChart(chartId)
                                                                        }
                                                                        datatestid={`single-${index}`}
                                                                    />
                                                                ))}
                                                            {state.hasMoreCharts && (
                                                                <DetectBottom callback={reloadNextAfterBottom} />
                                                            )}
                                                        </div>

                                                        {state.hasMoreCharts && (
                                                            <Progressing
                                                                size={25}
                                                                styles={{ height: '0%', paddingBottom: '5px' }}
                                                            />
                                                        )}
                                                    </>
                                                ) : (
                                                    randerChartStoreEmptyState()
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
                <ChartGroupList />
            </Route>
            <Route path={`${path}${URLS.CHART}/:chartId${URLS.PRESET_VALUES}`} component={SavedValuesList} exact />
            <Route path={`${path}${URLS.CHART}/:chartId${URLS.PRESET_VALUES}/:chartValueId`} exact>
                <ChartValues />
            </Route>
            <Route path={`${path}${URLS.CHART}/:chartId`} component={DiscoverChartDetails} />
            <Route>
                <DiscoverChartList isSuperAdmin={isSuperAdmin} />
            </Route>
        </Switch>
    )
}

const ChartListHeader = ({ charts }) => {
    return (
        <div>
            <h3 className="chart-grid__title pl-20 pr-20 pt-16" data-testid="chart-store-chart-heading">
                {charts.length === 0 ? 'All Charts' : 'Select Charts'}
            </h3>
            <p className="mb-0 mt-4 pl-20" data-testid="chart-store-list-subheading">
                Select chart to deploy. &nbsp;
                <a
                    className="dc__link"
                    href={DOCUMENTATION.CHART_LIST}
                    rel="noreferrer noopener"
                    target="_blank"
                    data-testid="chart-store-link"
                >
                    Learn more about deploying charts
                </a>
            </p>
        </div>
    )
}

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
    const { url } = useRouteMatch()
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
                    <a
                        href={DOCUMENTATION.CHART_GROUP}
                        rel="noreferrer noopener"
                        target="_blank"
                        className="dc__link"
                        data-testid="chart-group-link"
                    >
                        Learn more about chart groups
                    </a>
                )}
                {typeof onClickViewChartButton === 'function' ? (
                    <button type="button" onClick={onClickViewChartButton} className="cta ghosted flex mb-24 mt-24">
                        {buttonText || 'View all charts'}
                    </button>
                ) : (
                    <button
                        type="button"
                        className="en-2 br-4 bw-1 mt-16 cursor flex fw-6 cn-7 pt-6 pr-10 pb-6 pl-10 bg__primary h-32"
                        onClick={(e) => toggleChartGroupModal(!showChartGroupModal)}
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
    }

    return (
        <div className="chart-group">
            <div className="chart-group__header">
                <div className="flex dc__content-space dc__gap-8">
                    <FeatureTitleWithInfo
                        title="Chart Groups"
                        renderDescriptionContent={() =>
                            'Use chart groups to pre-configure and deploy frequently used charts together.'
                        }
                        docLink={DOCUMENTATION.CHART_GROUP}
                        docLinkText="Learn more"
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
