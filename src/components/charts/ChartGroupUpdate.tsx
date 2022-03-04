import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouteMatch, useHistory, useLocation } from 'react-router'
import ChartSelect from './util/ChartSelect'
import { ChartGroupEntry, Chart } from './charts.types'
import MultiChartSummary from './MultiChartSummary'
import AdvancedConfig from './AdvancedConfig'
import { updateChartGroupEntries, getChartGroups } from './charts.service'
import useChartGroup from './useChartGroup'
import { showError, Pencil, Progressing, BreadCrumb, useBreadcrumb } from '../common'
import CreateChartGroup from './modal/CreateChartGroup'
import { URLS } from '../../config';
import { toast } from 'react-toastify'
import { Prompt } from 'react-router';
import { ReactComponent as SaveIcon } from '../../assets/icons/ic-save.svg'
import AppSelector from '../AppSelector'
import ChartHeaderFilters from './ChartHeaderFilters'
import EmptyState from '../EmptyState/EmptyState';
import emptyImage from '../../assets/img/empty-noresult@2x.png';
import { QueryParams } from './charts.util';


export default function ChartGroupUpdate({ }) {
    const history = useHistory()
    const location = useLocation()
    const match = useRouteMatch()
    const { groupId } = useParams<{ groupId }>()
    const [chartDetailsUpdate, setChartDetailsUpdate] = useState(false)
    const [loading, setLoading] = useState(false)
    const { state, getChartVersionsAndValues, configureChart, fetchChartValues, addChart, subtractChart, handleChartValueChange, handleChartVersionChange, chartListing, createChartValues, removeChart, discardValuesYamlChanges, updateChartGroupEntriesFromResponse, updateChartGroupNameAndDescription, reloadState, applyFilterOnCharts } = useChartGroup(Number(groupId))
    const isLeavingPageNotAllowed = useRef(false)
    const [selectedChartRepo, setSelectedChartRepo] = useState([]);
    const [appliedChartRepoFilter, setAppliedChartRepoFilter] = useState([]);
    const [appStoreName, setAppStoreName] = useState("");
    const [searchApplied, setSearchApplied] = useState(false);
    const [includeDeprecated, setIncludeDeprecated] = useState(0);
    const { url } = match
    const [chartListLoading, setChartListLoading] = useState(true);
    const chartList: Chart[] = Array.from(state.availableCharts.values());


    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                group: 'Chart Groups',
                ':groupId': {
                    component: <AppSelector
                        api={() => getChartGroups().then(res => ({ result: res.result.groups }))}
                        primaryKey="groupId"
                        primaryValue='name'
                        matchedKeys={[]}
                        apiPrimaryKey="id"
                    />,
                    linked: false,
                }
            },
        },
        [state.name],
    );

    isLeavingPageNotAllowed.current = state.charts.reduce((acc: boolean, chart: ChartGroupEntry) => {
        return acc = acc || chart.isUnsaved;
    }, false);

    async function handleSave(e) {
        setLoading(true)
        try {
            const requestBody = {
                id: Number(groupId),
                chartGroupEntries: state.charts.map((chart: ChartGroupEntry) => {
                    const result = {
                        ...(chart.installedId ? { id: chart.installedId } : {}),
                        ...(chart.kind !== "DEFAULT" ? {
                            appStoreValuesVersionId: chart.appStoreValuesVersionId,
                            appStoreValuesVersionName: chart.appStoreValuesVersionName,
                        } : {}),
                        appStoreApplicationVersionId: chart.appStoreApplicationVersionId,
                    }
                    return result;
                })
            }
            await updateChartGroupEntries(requestBody)
            await reloadState()
            updateChartGroupEntriesFromResponse();
            toast.success('Successfully saved.')
        }
        catch (err) {
            showError(err)
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        window.addEventListener('beforeunload', reloadCallback);
        return () => {
            window.removeEventListener('beforeunload', reloadCallback);
        }
    }, []);

    useEffect(() => {
        if (!state.loading) {
            initialiseFromQueryParams(state.chartRepos);
            callApplyFilterOnCharts();
        }
    }, [location.search, state.loading])

    function reloadCallback(event) {
        event.preventDefault();
        if (isLeavingPageNotAllowed.current) {
            event.returnValue = "Your changes will be lost. Do you want to leave without deploying?"
        }
    }

    function redirectToGroupDetail() {
        let url = `${URLS.CHARTS}/discover/group/${groupId}`;
        history.push(url);
    }

    function closeChartGroupModal(props) {
        if (props?.name) {
            updateChartGroupNameAndDescription(props.name, props?.description || "")
        }
        setChartDetailsUpdate(false)
    }


    function handleCloseFilter() {
        setSelectedChartRepo(appliedChartRepoFilter)
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
        if (selectedRepos) setAppliedChartRepoFilter(selectedRepos)
    }

    async function callApplyFilterOnCharts() {
        setChartListLoading(true);
        await applyFilterOnCharts(location.search);
        setChartListLoading(false);
    }

    function handleViewAllCharts() {
        history.push(`${url}?${QueryParams.IncludeDeprecated}=1`);
    }

    return (<>
        <div className="chart-group--details-page">
            <div className="page-header">
                <div className="flex column left">
                    <div className="flex left">
                        <BreadCrumb breadcrumbs={breadcrumbs.slice(1,)} />
                    </div>
                    <div className="flex left page-header__title">
                        {state.name}
                        <Pencil className="pointer" onClick={e => setChartDetailsUpdate(true)} />
                    </div>
                </div>
                <div className="page-header__cta-container flex right">
                    <button className="cta cancel mr-16" onClick={handleSave}>{loading ? <Progressing /> : <div className="flex left" style={{ width: '100%' }}><SaveIcon className="mr-5" />Save</div>}</button>
                    <button className="cta cancel" onClick={redirectToGroupDetail}>Group Detail</button>
                </div>
            </div>
            <Prompt when={isLeavingPageNotAllowed.current} message={"Your changes will be lost. Do you want to leave without saving?"} />
            {state.loading || chartListLoading ? <Progressing pageLoader /> : null}

            {!state.loading && !chartListLoading && <div className={`chart-group--details-body summary-show`} >
                <div className="details">
                    {typeof state.configureChartIndex === 'number' ?
                        <AdvancedConfig
                            chart={state.charts[state.configureChartIndex]}
                            index={state.configureChartIndex}
                            getChartVersionsAndValues={getChartVersionsAndValues}
                            fetchChartValues={fetchChartValues}
                            handleChartValueChange={handleChartValueChange}
                            handleChartVersionChange={handleChartVersionChange}
                            createChartValues={createChartValues}
                            discardValuesYamlChanges={discardValuesYamlChanges}
                        /> : !chartList.length ? <>
                            <ChartHeaderFilters
                                chartRepoList={state.chartRepos}
                                setSelectedChartRepo={setSelectedChartRepo}
                                searchApplied={searchApplied}
                                appStoreName={appStoreName}
                                includeDeprecated={includeDeprecated}
                                selectedChartRepo={selectedChartRepo}
                                setAppStoreName={setAppStoreName}
                                handleCloseFilter={handleCloseFilter}
                            />
                            <div style={{ height: "calc(100vh - 150px" }}>
                                <EmptyState>
                                    <EmptyState.Image><img src={emptyImage} alt="" /></EmptyState.Image>
                                    <EmptyState.Title><h4>No matching charts</h4></EmptyState.Title>
                                    <EmptyState.Subtitle>We couldn't find any matching results</EmptyState.Subtitle>
                                    <button type="button" onClick={handleViewAllCharts} className="cta ghosted mb-24">View all charts</button>
                                </EmptyState>
                            </div></>
                            : <>
                                <ChartHeaderFilters
                                    chartRepoList={state.chartRepos}
                                    setSelectedChartRepo={setSelectedChartRepo}
                                    searchApplied={searchApplied}
                                    appStoreName={appStoreName}
                                    includeDeprecated={includeDeprecated}
                                    selectedChartRepo={selectedChartRepo}
                                    setAppStoreName={setAppStoreName}
                                    handleCloseFilter={handleCloseFilter}
                                />
                                <ChartList
                                    availableCharts={state.availableCharts}
                                    addChart={addChart}
                                    subtractChart={subtractChart}
                                    selectedInstances={state.selectedInstances}
                                />
                            </>
                    }
                </div>
                <div className="summary">
                    <MultiChartSummary
                        charts={state.charts}
                        getChartVersionsAndValues={getChartVersionsAndValues}
                        configureChart={configureChart}
                        handleChartValueChange={typeof state.configureChartIndex === 'number' ? null : handleChartValueChange}
                        handleChartVersionChange={typeof state.configureChartIndex === 'number' ? null : handleChartVersionChange}
                        chartListing={chartListing}
                        configureChartIndex={state.configureChartIndex}
                        removeChart={removeChart}
                        hideDeployedValues
                    />
                </div>
            </div>
            }
        </div>
        {
            chartDetailsUpdate &&
            <CreateChartGroup
                closeChartGroupModal={closeChartGroupModal}
                history={history}
                location={location}
                match={match}
                chartGroupId={Number(groupId)}
                name={state.name}
                description={state.description}
            />
        }

    </>
    )
}

function ChartList({ availableCharts, selectedInstances, addChart, subtractChart }) {
    return (
        <div className="chart-grid">
            {[...availableCharts.values()].map((chart: Chart, idx) =>
                <ChartSelect
                    key={chart.id}
                    chart={chart}
                    selectedCount={selectedInstances[chart.id]?.length}
                    addChart={addChart}
                    subtractChart={subtractChart}
                    showCheckBoxOnHoverOnly={false}
                />
            )}
        </div>
    )
}