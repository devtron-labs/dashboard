import React, { useState, useEffect, useRef } from 'react';
import { Progressing, Select, mapByKey, showError, BreadCrumb, useBreadcrumb, ConditionalWrap, Checkbox } from '../../common';
import { Switch, Route, NavLink } from 'react-router-dom';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg';
import ChartSelect from '../util/ChartSelect';
import ChartValues from '../chartValues/ChartValues';
import ChartGroupList from './ChartGroup';
import ChartGroupCard from '../util/ChartGroupCard';
import DiscoverChartDetails from '../discoverChartDetail/DiscoverChartDetails'
import MultiChartSummary from '../MultiChartSummary'
import AdvancedConfig from '../AdvancedConfig'
import { ChartDetailNavigator } from '../Charts'
import useChartGroup from '../useChartGroup'
import { DeployableCharts, deployChartGroup } from '../charts.service';
import { ChartGroupEntry, Chart } from '../charts.types'
import { toast } from 'react-toastify';
import ChartGroupBasicDeploy from '../modal/ChartGroupBasicDeploy';
import CreateChartGroup from '../modal/CreateChartGroup'
import { URLS } from '../../../config';
import { Prompt } from 'react-router';
import { ReactComponent as WarningIcon } from '../../../assets/icons/ic-alert-triangle.svg';
import Tippy from '@tippyjs/react'
import ReactSelect from 'react-select';
import { DropdownIndicator, ValueContainer, Option } from '../charts.util';
import emptyImage from '../../../assets/img/empty-noresult@2x.png';
import EmptyState from '../../EmptyState/EmptyState';
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg';
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg';

const QueryParams = {
    ChartRepoId: 'chartRepoId',
    IncludeDeprecated: 'includeDeprecated',
    AppStoreName: 'appStoreName',

}
//TODO: move to service
export function getDeployableChartsFromConfiguredCharts(charts: ChartGroupEntry[]): DeployableCharts[] {
    return charts.filter(chart => chart.isEnabled).map(chart => {
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
    const location = useLocation();
    const history = useHistory();
    const { url } = useRouteMatch();
    const { breadcrumbs, setCrumb } = useBreadcrumb({});
    const {
        state,
        configureChart, selectChart, validateData, addChart, subtractChart, fetchChartValues,
        getChartVersionsAndValues, handleChartValueChange, handleChartVersionChange, handleValuesYaml,
        removeChart, handleEnvironmentChange, handleNameChange,
        handleEnvironmentChangeOfAllCharts, discardValuesYamlChanges,
        chartListing,
        applyFilterOnCharts,
    } = useChartGroup();
    const [project, setProject] = useState({ id: null, error: "" });
    const [installing, setInstalling] = useState(false);
    const [showDeployModal, toggleDeployModal] = useState(false);
    const [chartListLoading, setChartListloading] = useState(true);
    const [selectedChartRepo, setSelectedChartRepo] = useState([]);
    const [appStoreName, setAppStoreName] = useState("");
    const [searchApplied, setSearchApplied] = useState(false);
    const [includeDeprecated, setIncludeDeprecated] = useState(1);
    const projectsMap = mapByKey(state.projects, 'id');
    const chartList: Chart[] = Array.from(state.availableCharts.values());
    const isLeavingPageNotAllowed = useRef(false);
    isLeavingPageNotAllowed.current = !state.charts.reduce((acc: boolean, chart: ChartGroupEntry) => {
        return acc = acc && chart.originalValuesYaml === chart.valuesYaml;
    }, true);

    useEffect(() => {
        window.addEventListener('beforeunload', reloadCallback);
        return () => {
            window.removeEventListener('beforeunload', reloadCallback);
        }
    }, []);

    useEffect(() => {
        if (!location.search) {
            history.push(`${url}?${QueryParams.IncludeDeprecated}=1`);
        }
        else {
            if (!state.loading) {
                initialiseFromQueryParams(state.chartRepos);
                callApplyFilterOnCharts();
            }
        }
    }, [location.search, state.loading])

    function reloadCallback(event) {
        event.preventDefault();
        if (isLeavingPageNotAllowed.current) {
            event.returnValue = "Your changes will be lost. Do you want to reload without deploying?"
        }
    }

    async function handleInstall() {
        if (!project.id) {
            setProject(project => ({ ...project, error: "Project is mandatory for deployment." }))
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
            let url = `${URLS.CHARTS}/deployed`;
            history.push(url);
            toast.success('Deployment initiated')
        }
        catch (err) {
            showError(err)
        }
        finally {
            setInstalling(false)
        }
    }

    function redirectToConfigure() {
        configureChart(0);
        toggleDeployModal(false);
    }

    function initialiseFromQueryParams(chartRepoList) {
        let searchParams = new URLSearchParams(location.search);
        let allChartRepoIds: string = searchParams.get(QueryParams.ChartRepoId);
        let deprecated: string = searchParams.get(QueryParams.IncludeDeprecated);
        let appStoreName: string = searchParams.get(QueryParams.AppStoreName);
        let chartRepoIdArray = [];
        if (allChartRepoIds) chartRepoIdArray = allChartRepoIds.split(",");
        chartRepoIdArray = chartRepoIdArray.map((chartRepoId => parseInt(chartRepoId)))
        let selectedRepos = [];
        for (let i = 0; i < chartRepoIdArray.length; i++) {
            let chartRepo = chartRepoList.find(item => item.value === chartRepoIdArray[i]);
            if (chartRepo) selectedRepos.push(chartRepo);
        }
        if (selectedRepos) setSelectedChartRepo(selectedRepos);
        if (deprecated) setIncludeDeprecated(parseInt(deprecated));
        if (appStoreName) {
            setSearchApplied(true);
            setAppStoreName(appStoreName);
        } else {
            setSearchApplied(false);
            setAppStoreName("");
        }
    }

    async function callApplyFilterOnCharts() {
        setChartListloading(true);
        await applyFilterOnCharts(location.search);
        setChartListloading(false);
    }

    function handleChartRepoChange(selected): void {
        let chartRepoId = selected?.map((e) => { return e.value }).join(",");
        let searchParams = new URLSearchParams(location.search);
        let app = searchParams.get(QueryParams.AppStoreName);
        let deprecate = searchParams.get(QueryParams.IncludeDeprecated);
        let qs = `${QueryParams.ChartRepoId}=${chartRepoId}`;
        if (app) qs = `${qs}&${QueryParams.AppStoreName}=${app}`;
        if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
        history.push(`${url}?${qs}`);
    }

    function handleDeprecateChange(deprecated): void {
        let searchParams = new URLSearchParams(location.search);
        let app = searchParams.get(QueryParams.AppStoreName);
        let chartRepoId = searchParams.get(QueryParams.ChartRepoId);
        let qs = `${QueryParams.IncludeDeprecated}=${deprecated}`;
        if (app) qs = `${qs}&${QueryParams.AppStoreName}=${app}`;
        if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`
        history.push(`${url}?${qs}`);
    }

    function handleAppStoreChange(event): void {
        event.preventDefault();
        let searchParams = new URLSearchParams(location.search);
        let deprecate = searchParams.get(QueryParams.IncludeDeprecated);
        let chartRepoId = searchParams.get(QueryParams.ChartRepoId);
        let qs = `${QueryParams.AppStoreName}=${appStoreName}`;
        if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
        if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`;
        history.push(`${url}?${qs}`);
    }

    function clearSearch(event): void {
        let searchParams = new URLSearchParams(location.search);
        let deprecate = searchParams.get(QueryParams.IncludeDeprecated);
        let chartRepoId = searchParams.get(QueryParams.ChartRepoId);
        let qs: string = "";
        if (deprecate) qs = `${qs}&${QueryParams.IncludeDeprecated}=${deprecate}`;
        if (chartRepoId) qs = `${qs}&${QueryParams.ChartRepoId}=${chartRepoId}`;
        history.push(`${url}?${qs}`);
    }

    function handleViewAllCharts() {
        history.push(`${url}?${QueryParams.IncludeDeprecated}=1`);
    }

    return <>
        <div className={`discover-charts ${state.charts.length > 0 ? 'summary-show' : ''}`}>
            <div className={`page-header ${state.charts.length === 0 ? 'page-header--tabs' : ''}`}>
                <ConditionalWrap condition={state.charts.length > 0}
                    wrap={children => <div className="flex left column">{children}</div>}>
                    <>
                        {state.charts.length > 0 && (
                            <div className="flex left">
                                <BreadCrumb breadcrumbs={breadcrumbs.slice(1)} />
                            </div>
                        )}
                        <div className="page-header__title flex left">
                            {state.charts.length === 0 ? 'Chart Store' : 'Deploy multiple charts'}
                        </div>
                        {state.charts.length === 0 && <ChartDetailNavigator />}
                    </>
                </ConditionalWrap>
                <div className="page-header__cta-container flex">
                    {state.charts.length === 0 && (
                        <NavLink className="cta no-decor flex" to={`${url}/create`}>
                            <Add className="icon-dim-18 mr-5" />Create Group
                        </NavLink>
                    )}
                </div>
            </div>
            <Prompt when={isLeavingPageNotAllowed.current} message={'Your changes will be lost. Do you want to leave without deploying?'} />
            {state.loading || chartListLoading ? <Progressing pageLoader /> : null}

            {!state.loading && !chartListLoading ? <div className="discover-charts__body">
                {!chartList.length ? <div className="w-100">
                    {typeof state.configureChartIndex === 'number' ? <AdvancedConfig chart={state.charts[state.configureChartIndex]}
                        index={state.configureChartIndex}
                        handleValuesYaml={handleValuesYaml}
                        getChartVersionsAndValues={getChartVersionsAndValues}
                        fetchChartValues={fetchChartValues}
                        handleChartValueChange={handleChartValueChange}
                        handleChartVersionChange={handleChartVersionChange}
                        handleEnvironmentChange={handleEnvironmentChange}
                        handleNameChange={handleNameChange}
                        discardValuesYamlChanges={discardValuesYamlChanges}
                    /> : <> <ChartListHeader chartRepoList={state.chartRepos}
                        charts={state.charts}
                        searchApplied={searchApplied}
                        appStoreName={appStoreName}
                        includeDeprecated={includeDeprecated}
                        selectedChartRepo={selectedChartRepo}
                        setAppStoreName={setAppStoreName}
                        clearSearch={clearSearch}
                        handleAppStoreChange={handleAppStoreChange}
                        handleChartRepoChange={handleChartRepoChange}
                        handleDeprecateChange={handleDeprecateChange} />
                            <EmptyState>
                                <EmptyState.Image><img src={emptyImage} alt="" /></EmptyState.Image>
                                <EmptyState.Title><h4>No  matching Charts</h4></EmptyState.Title>
                                <EmptyState.Subtitle>We couldn't find any matching results</EmptyState.Subtitle>
                                <button type="button" onClick={handleViewAllCharts} className="cta ghosted mb-24">View all charts</button>
                            </EmptyState>
                        </>}
                </div>
                    : <div className="discover-charts__body-details">
                        {typeof state.configureChartIndex === 'number'
                            ? <AdvancedConfig chart={state.charts[state.configureChartIndex]}
                                index={state.configureChartIndex}
                                handleValuesYaml={handleValuesYaml}
                                getChartVersionsAndValues={getChartVersionsAndValues}
                                fetchChartValues={fetchChartValues}
                                handleChartValueChange={handleChartValueChange}
                                handleChartVersionChange={handleChartVersionChange}
                                handleEnvironmentChange={handleEnvironmentChange}
                                handleNameChange={handleNameChange}
                                discardValuesYamlChanges={discardValuesYamlChanges}
                            /> : <>
                                <ChartGroupListMin chartGroups={state.chartGroups.slice(0, 4)} />
                                <ChartListHeader chartRepoList={state.chartRepos}
                                    charts={state.charts}
                                    searchApplied={searchApplied}
                                    appStoreName={appStoreName}
                                    includeDeprecated={includeDeprecated}
                                    selectedChartRepo={selectedChartRepo}
                                    setAppStoreName={setAppStoreName}
                                    clearSearch={clearSearch}
                                    handleAppStoreChange={handleAppStoreChange}
                                    handleChartRepoChange={handleChartRepoChange}
                                    handleDeprecateChange={handleDeprecateChange} />
                                <div className="chart-grid">
                                    {chartList.slice(0, showDeployModal ? 12 : chartList.length).map(chart => <ChartSelect
                                        key={chart.id}
                                        chart={chart}
                                        selectedCount={state.selectedInstances[chart.id]?.length}
                                        showCheckBoxOnHoverOnly={state.charts.length === 0}
                                        addChart={addChart}
                                        subtractChart={subtractChart}
                                        onClick={(chartId) => state.charts.length === 0 ? history.push(`${url}/chart/${chart.id}`) : selectChart(chartId)}
                                    />)}
                                </div>
                            </>}
                    </div>}
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
                        removeChart={removeChart} />
                    <div className={`flex left deployment-buttons ${state.advanceVisited ? 'deployment-buttons--advanced' : ''}`}>
                        {state.advanceVisited && (
                            <div>
                                <label>Project*</label>
                                <Select rootClassName={`${project.error ? 'popup-button--error' : ''}`}
                                    value={project.id}
                                    onChange={(e) => setProject({ id: e.target.value, error: '' })}>
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
                                    <span className="form__error flex left ">
                                        <WarningIcon className="mr-5" />
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
                                )}>
                                <button type="button"
                                    disabled={state.charts.length === 0}
                                    onClick={(e) => configureChart(0)}
                                    className="cta cancel ellipsis-right">
                                    Advanced Options
                                    </button>
                            </ConditionalWrap>
                        )}
                        <ConditionalWrap
                            condition={state.charts.length === 0}
                            wrap={(children) => (
                                <Tippy className="default-tt"
                                    arrow={false}
                                    placement="top"
                                    content="Add charts to deploy">
                                    <div>{children}</div>
                                </Tippy>
                            )}>
                            <button type="button"
                                disabled={state.charts.length === 0}
                                onClick={state.advanceVisited ? handleInstall : () => toggleDeployModal(true)}
                                className="cta ellipsis-right">
                                {installing ? <Progressing /> : state.advanceVisited ? ('Deploy charts') : ('Deploy to...')}
                            </button>
                        </ConditionalWrap>
                    </div>
                </aside>
            </div> : null}
        </div>
        {showDeployModal ? <ChartGroupBasicDeploy
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
        /> : null}
    </>
}


export default function DiscoverCharts() {
    const history = useHistory();
    const location = useLocation();
    const match = useRouteMatch();
    const { url, path } = match

    return <Switch>
        <Route path={`${path}/group`}>
            <ChartGroupList />
        </Route>
        <Route path={`${path}/chart/:chartId/chart-value/:chartValueId?`} render={(props) => {
            return <ChartValues location={props.location} match={props.match} history={props.history} />
        }} />
        <Route path={`${path}/chart/:chartId`} component={DiscoverChartDetails} />
        <Route>
            <DiscoverChartList />
            <Route exact path={`${path}/create`}>
                <CreateChartGroup
                    history={history}
                    location={location}
                    match={match}
                    closeChartGroupModal={() => history.push(url)}
                />
            </Route>
        </Route>
    </Switch>
}

function ChartListHeader({ handleAppStoreChange, handleChartRepoChange, handleDeprecateChange, clearSearch, setAppStoreName, chartRepoList, appStoreName, charts, selectedChartRepo, includeDeprecated, searchApplied }) {
    return <div className="chart-group__header">
        <h3 className="chart-grid__title">{charts.length === 0 ? 'All Charts' : 'Select Charts'}</h3>
        <h5 className="form__subtitle">Select chart to deploy. &nbsp;
            <a href="https://docs.devtron.ai/user-guide/deploy-chart/overview-of-charts" rel="noreferrer noopener" target="_blank">Learn more about deploying charts</a>
        </h5>
        <div className="flexbox flex-justify">
            <form onSubmit={handleAppStoreChange} className="search position-rel" >
                <Search className="search__icon icon-dim-18" />
                <input type="text" placeholder="Search charts" value={appStoreName} className="search__input bcn-0" onChange={(event) => { setAppStoreName(event.target.value); }} />
                {searchApplied ? <button className="search__clear-button" type="button" onClick={clearSearch}>
                    <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                </button> : null}
            </form>
            <div className="flex">
                <ReactSelect className="date-align-left fs-14"
                    placeholder="All repositories"
                    name="All repositories"
                    value={selectedChartRepo}
                    options={chartRepoList}
                    isClearable={false}
                    onChange={(selected: any) => { handleChartRepoChange(selected); }}
                    isMulti={true}
                    hideSelectedOptions={false}
                    components={{
                        DropdownIndicator,
                        ValueContainer,
                        Option: Option,
                        IndicatorSeparator: null,
                    }}
                    styles={{
                        container: (base, state) => ({
                            ...base,
                            width: '230px',
                        }),
                        control: (base, state) => ({
                            ...base,
                            height: '36px',
                            minHeight: 'unset',
                            width: '230px',
                            border: state.isFocused ? '1px solid #0066CC' : '1px solid #d6dbdf',
                            boxShadow: 'none',
                        }),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                            color: 'var(--N900)',
                            fontSize: '14px',
                            padding: '8px 24px',
                        }),
                    }} />
                <Checkbox rootClassName="ml-16 mb-0 fs-14 cursor bcn-0 pt-8 pb-8 pr-12 date-align-left--deprecate"
                    isChecked={includeDeprecated === 1}
                    value={"CHECKED"}
                    onChange={(event) => { let value = (includeDeprecated + 1) % 2; handleDeprecateChange(value) }} >
                    <div className="ml-5"> Show deprecated</div>
                </Checkbox>
            </div>
        </div>
    </div>
}

export function ChartGroupListMin({ chartGroups }) {
    const history = useHistory();
    const match = useRouteMatch();

    return <div className="chart-group" style={{ minHeight: "280px" }}>
        <div className="chart-group__header">
            <div className="flexbox">
                <h2 className="chart-grid__title">Chart Groups</h2>
                <button type="button" className="chart-group__view-all"
                    onClick={(e) => history.push(match.url + '/group')}>View All
                </button>
            </div>
        </div>
        <div className="chart-grid chart-grid--chart-group-snapshot">
            {chartGroups?.map((chartGroup, idx) => <ChartGroupCard key={idx} chartGroup={chartGroup} />)}
        </div>
    </div>
}