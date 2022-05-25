import React, { useState, useEffect, useRef, useContext } from 'react'
import {
    Progressing,
    Select,
    mapByKey,
    showError,
    BreadCrumb,
    useBreadcrumb,
    ConditionalWrap,
    ConfirmationDialog,
} from '../../common'
import { Switch, Route, NavLink } from 'react-router-dom'
import { useHistory, useLocation, useRouteMatch } from 'react-router'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import ChartSelect from '../util/ChartSelect'
import ChartValues from '../chartValues/ChartValues'
import ChartGroupList from './ChartGroup'
import ChartGroupCard from '../util/ChartGroupCard'
import DiscoverChartDetails from '../discoverChartDetail/DiscoverChartDetails'
import MultiChartSummary from '../MultiChartSummary'
import AdvancedConfig from '../AdvancedConfig'
import { ChartDetailNavigator } from '../Charts'
import useChartGroup from '../useChartGroup'
import { DeployableCharts, deployChartGroup } from '../charts.service'
import { ChartGroupEntry, Chart } from '../charts.types'
import { toast } from 'react-toastify'
import ChartGroupBasicDeploy from '../modal/ChartGroupBasicDeploy'
import CreateChartGroup from '../modal/CreateChartGroup'
import { DOCUMENTATION, URLS, SERVER_MODE } from '../../../config'
import { Prompt } from 'react-router'
import { ReactComponent as WarningIcon } from '../../../assets/icons/ic-alert-triangle.svg'
import Tippy from '@tippyjs/react'
import { isGitopsConfigured } from '../../../services/service'
import warn from '../../../assets/icons/ic-warning.svg'
import empty from '../../../assets/img/ic-empty-chartgroup@2x.jpg'
import ChartHeaderFilter from '../ChartHeaderFilters'
import { QueryParams } from '../charts.util'
import { mainContext } from '../../common/navigation/NavigationRoutes'
import ChartEmptyState from '../../common/emptyState/ChartEmptyState'
import PageHeader from '../../common/header/PageHeader'

//TODO: move to service
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

function DiscoverChartList() {
    const { serverMode } = useContext(mainContext)
    const location = useLocation()
    const history = useHistory()
    const match = useRouteMatch()
    const { url } = match
    const { breadcrumbs, setCrumb } = useBreadcrumb({})
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
    } = useChartGroup()
    const [project, setProject] = useState({ id: null, error: '' })
    const [installing, setInstalling] = useState(false)
    const [showDeployModal, toggleDeployModal] = useState(false)
    const [chartListLoading, setChartListloading] = useState(true)
    const [selectedChartRepo, setSelectedChartRepo] = useState([])
    const [appliedChartRepoFilter, setAppliedChartRepoFilter] = useState([])
    const [appStoreName, setAppStoreName] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [includeDeprecated, setIncludeDeprecated] = useState(0)
    const projectsMap = mapByKey(state.projects, 'id')
    const chartList: Chart[] = Array.from(state.availableCharts.values())
    const isLeavingPageNotAllowed = useRef(false)
    const [showGitOpsWarningModal, toggleGitOpsWarningModal] = useState(false)
    const [isGitOpsConfigAvailable, setIsGitOpsConfigAvailable] = useState(false)
    const [showChartGroupModal, toggleChartGroupModal] = useState(false)
    isLeavingPageNotAllowed.current = !state.charts.reduce((acc: boolean, chart: ChartGroupEntry) => {
        return (acc = acc && chart.originalValuesYaml === chart.valuesYaml)
    }, true)

    useEffect(() => {
        window.addEventListener('beforeunload', reloadCallback)
        if (serverMode == SERVER_MODE.FULL) {
            isGitopsConfigured()
                .then((response) => {
                    let isGitOpsConfigAvailable = response.result && response.result.exists
                    setIsGitOpsConfigAvailable(isGitOpsConfigAvailable)
                })
                .catch((error) => {
                    showError(error)
                })
        }
        return () => {
            window.removeEventListener('beforeunload', reloadCallback)
        }
    }, [])

    useEffect(() => {
        if (!state.loading) {
            initialiseFromQueryParams(state.chartRepos)
            callApplyFilterOnCharts()
        }
    }, [location.search, state.loading])

    function reloadCallback(event) {
        event.preventDefault()
        if (isLeavingPageNotAllowed.current) {
            event.returnValue = 'Your changes will be lost. Do you want to reload without deploying?'
        }
    }

    function handleOnDeployTo() {
        if (isGitOpsConfigAvailable) {
            toggleDeployModal(true)
        } else {
            toggleGitOpsWarningModal(true)
        }
    }

    function handleAdvancedChart() {
        if (isGitOpsConfigAvailable) {
            configureChart(0)
        } else {
            toggleGitOpsWarningModal(true)
        }
    }

    async function handleInstall() {
        if (!project.id) {
            setProject((project) => ({ ...project, error: 'Project is mandatory for deployment.' }))
            return
        }
        try {
            setInstalling(true)
            const validated = await validateData()
            if (!validated) {
                toast.warn('Click on highlighted charts and resolve errors.', { autoClose: 5000 })
                return
            }
            const deployableCharts = getDeployableChartsFromConfiguredCharts(state.charts)
            await deployChartGroup(project.id, deployableCharts)
            let url = `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_HELM}`
            history.push(url)
            toast.success('Deployment initiated')
        } catch (err) {
            showError(err)
        } finally {
            setInstalling(false)
        }
    }

    function redirectToConfigure() {
        configureChart(0)
        toggleDeployModal(false)
    }

    function initialiseFromQueryParams(chartRepoList) {
        let searchParams = new URLSearchParams(location.search)
        let allChartRepoIds: string = searchParams.get(QueryParams.ChartRepoId)
        let deprecated: string = searchParams.get(QueryParams.IncludeDeprecated)
        let appStoreName: string = searchParams.get(QueryParams.AppStoreName)
        let chartRepoIdArray = []
        if (allChartRepoIds) chartRepoIdArray = allChartRepoIds.split(',')
        chartRepoIdArray = chartRepoIdArray.map((chartRepoId) => parseInt(chartRepoId))
        let selectedRepos = []
        for (let i = 0; i < chartRepoIdArray.length; i++) {
            let chartRepo = chartRepoList.find((item) => item.value === chartRepoIdArray[i])
            if (chartRepo) selectedRepos.push(chartRepo)
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
        if (selectedRepos) setAppliedChartRepoFilter(selectedRepos)
    }

    async function callApplyFilterOnCharts() {
        setChartListloading(true)
        await applyFilterOnCharts(location.search)
        setChartListloading(false)
    }

    function handleViewAllCharts() {
        history.push(`${match.url.split('/chart-store')[0]}${URLS.GLOBAL_CONFIG_CHART}`)
    }

    function handleCloseFilter() {
        setSelectedChartRepo(appliedChartRepoFilter)
    }

    const handleToggleChartGroupModal = () => {
        toggleChartGroupModal(!showChartGroupModal)
    }
    return (
        <>
            <div className={`discover-charts ${state.charts.length > 0 ? 'summary-show' : ''}`}>
                <ConditionalWrap condition={state.charts.length > 0} wrap={(children) => <div>{children}</div>}>
                    <PageHeader
                        headerName={state.charts.length === 0 ? 'Chart Store' : 'Deploy multiple charts'}
                        buttonText="group"
                        onClickCreateButton={handleToggleChartGroupModal}
                        showCreateButton={serverMode === SERVER_MODE.FULL && state.charts.length === 0 ? true : false}
                        CreateButtonIcon={Add}
                        showIconBeforeText={false}
                    />
                </ConditionalWrap>
                {/* <div className={`page-header `}>
                    <ConditionalWrap
                        condition={state.charts.length > 0}
                        wrap={(children) => <div className="flex left column">{children}</div>}
                    >
                        <>
                            {state.charts.length > 0 && (
                                <div className="flex left">
                                    <BreadCrumb breadcrumbs={breadcrumbs.slice(1)} />
                                </div>
                            )}
                            <div className="page-header__title flex left">
                                {state.charts.length === 0 ? 'Chart Store' : 'Deploy multiple charts'}
                            </div>
                           {state.charts.length === 0 && <ChartDetailNavigator />
                        </>
                    </ConditionalWrap>

                    <div className="page-header__cta-container flex">
                        {chartList.length > 0 && serverMode == SERVER_MODE.FULL && state.charts.length === 0 && (
                            <button
                                type="button"
                                className="cta flex"
                                onClick={(e) => toggleChartGroupModal(!showChartGroupModal)}
                            >
                                <Add className="icon-dim-18 mr-5" />
                                Create Group
                            </button>
                        )}
                    </div>
                    </div>*/}
                <Prompt
                    when={isLeavingPageNotAllowed.current}
                    message={'Your changes will be lost. Do you want to leave without deploying?'}
                />
                {state.loading || chartListLoading ? <Progressing pageLoader /> : null}

                {!state.loading && !chartListLoading ? (
                    <div className="discover-charts__body">
                        {!chartList.length ? (
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
                                    <ChartEmptyState
                                        title={'No charts available right now'}
                                        subTitle={
                                            'The connected chart repositories are syncing or no charts are available.'
                                        }
                                        onClickViewChartButton={handleViewAllCharts}
                                        buttonText={'View connected chart repositories'}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="discover-charts__body-details">
                                {typeof state.configureChartIndex === 'number' ? (
                                    <>
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
                                        />{' '}
                                    </>
                                ) : (
                                    <>
                                        {serverMode == SERVER_MODE.FULL && (
                                            <ChartGroupListMin chartGroups={state.chartGroups.slice(0, 4)} />
                                        )}
                                        <ChartListHeader
                                            chartRepoList={state.chartRepos}
                                            setSelectedChartRepo={setSelectedChartRepo}
                                            charts={state.charts}
                                            searchApplied={searchApplied}
                                            appStoreName={appStoreName}
                                            includeDeprecated={includeDeprecated}
                                            selectedChartRepo={selectedChartRepo}
                                            setAppStoreName={setAppStoreName}
                                            handleCloseFilter={handleCloseFilter}
                                        />
                                        <div className="chart-grid">
                                            {chartList
                                                .slice(0, showDeployModal ? 12 : chartList.length)
                                                .map((chart) => (
                                                    <ChartSelect
                                                        key={chart.id}
                                                        chart={chart}
                                                        selectedCount={state.selectedInstances[chart.id]?.length}
                                                        showCheckBoxOnHoverOnly={state.charts.length === 0}
                                                        addChart={addChart}
                                                        subtractChart={subtractChart}
                                                        onClick={(chartId) =>
                                                            state.charts.length === 0
                                                                ? history.push(`${url}/chart/${chart.id}`)
                                                                : selectChart(chartId)
                                                        }
                                                    />
                                                ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        <aside className={`summary`}>
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
                                        <label>Project*</label>
                                        <Select
                                            rootClassName={`${project.error ? 'popup-button--error' : ''}`}
                                            value={project.id}
                                            onChange={(e) => setProject({ id: e.target.value, error: '' })}
                                        >
                                            <Select.Button>
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
                                            onClick={handleAdvancedChart}
                                            className="cta cancel ellipsis-right"
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
                                        onClick={state.advanceVisited ? handleInstall : () => handleOnDeployTo()}
                                        className="cta ellipsis-right"
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
                ) : null}
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
                />
            ) : null}

            {showGitOpsWarningModal ? (
                <ConfirmationDialog>
                    <ConfirmationDialog.Icon src={warn} />
                    <ConfirmationDialog.Body title="GitOps configuration required">
                        <p className="">
                            GitOps configuration is required to perform this action. Please configure GitOps and try
                            again.
                        </p>
                    </ConfirmationDialog.Body>
                    <ConfirmationDialog.ButtonGroup>
                        <button
                            type="button"
                            tabIndex={3}
                            className="cta cancel sso__warn-button"
                            onClick={() => toggleGitOpsWarningModal(false)}
                        >
                            Cancel
                        </button>
                        <NavLink className="cta sso__warn-button btn-confirm" to={`/global-config/gitops`}>
                            Configure GitOps
                        </NavLink>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>
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
        </>
    )
}

export default function DiscoverCharts() {
    const match = useRouteMatch()
    const { path } = match

    return (
        <Switch>
            <Route path={`${path}/group`}>
                <ChartGroupList />
            </Route>
            <Route
                path={`${path}/chart/:chartId/chart-value/:chartValueId?`}
                render={({ location, history, match }: { location: any; history: any; match: any }) => {
                    return <ChartValues location={location} match={match} history={history} />
                }}
            />
            <Route path={`${path}/chart/:chartId`} component={DiscoverChartDetails} />
            <Route>
                <DiscoverChartList />
            </Route>
        </Switch>
    )
}

function ChartListHeader({
    setSelectedChartRepo,
    setAppStoreName,
    chartRepoList,
    appStoreName,
    charts,
    selectedChartRepo,
    includeDeprecated,
    searchApplied,
    handleCloseFilter,
}) {
    return (
        <div>
            <h3 className="chart-grid__title pl-20 pr-20 pt-16">
                {charts.length === 0 ? 'All Charts' : 'Select Charts'}
            </h3>
            <h5 className="form__subtitle pl-20">
                Select chart to deploy. &nbsp;
                <a
                    className="learn-more__href"
                    href={DOCUMENTATION.CHART_LIST}
                    rel="noreferrer noopener"
                    target="_blank"
                >
                    Learn more about deploying charts
                </a>
            </h5>
            <ChartHeaderFilter
                chartRepoList={chartRepoList}
                setSelectedChartRepo={setSelectedChartRepo}
                searchApplied={searchApplied}
                appStoreName={appStoreName}
                includeDeprecated={includeDeprecated}
                selectedChartRepo={selectedChartRepo}
                setAppStoreName={setAppStoreName}
                handleCloseFilter={handleCloseFilter}
            />
        </div>
    )
}

export function EmptyChartGroup() {
    const { url } = useRouteMatch()
    return (
        <div className="bcn-0 flex left br-8 mt-20 ml-20 mr-20" style={{ gridColumn: '1 / span 4' }}>
            <img src={empty} className="" style={{ width: '200px', margin: '20px 42px' }} />
            <div>
                <div className="fs-16 fw-6">Chart group</div>
                <div className="cn-7">Use chart groups to preconfigure and deploy frequently used charts together.</div>
                <a
                    href={DOCUMENTATION.CHART_DEPLOY}
                    rel="noreferrer noopener"
                    target="_blank"
                    className="learn-more__href"
                >
                    {' '}
                    Learn more about chart groups
                </a>
                <NavLink
                    to={`${url}/group/create`}
                    className="en-2 br-4 bw-1 mt-16 cursor flex no-decor"
                    style={{ width: '100px' }}
                >
                    <div className="fw-6 cn-7 p-6">Create group</div>
                </NavLink>
            </div>
        </div>
    )
}

export function ChartGroupListMin({ chartGroups }) {
    const history = useHistory()
    const match = useRouteMatch()
    if (chartGroups.length == 0) {
        return <EmptyChartGroup />
    }
    return (
        <div className="chart-group" style={{ minHeight: '280px' }}>
            <div className="chart-group__header">
                <div className="flexbox">
                    <h2 className="chart-grid__title">Chart Groups</h2>
                    <button
                        type="button"
                        className="chart-group__view-all"
                        onClick={(e) => history.push(match.url + '/group')}
                    >
                        View All
                    </button>
                </div>
            </div>
            <div className="chart-grid chart-grid--chart-group-snapshot">
                {chartGroups?.map((chartGroup, idx) => (
                    <ChartGroupCard key={idx} chartGroup={chartGroup} />
                ))}
            </div>
        </div>
    )
}
