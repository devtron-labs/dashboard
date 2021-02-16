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
import {ReactComponent as SaveIcon} from '../../assets/icons/ic-save.svg'
import AppSelector from '../AppSelector'

export default function ChartGroupUpdate({ }) {
    const { groupId } = useParams<{groupId}>()
    const [chartDetailsUpdate, setChartDetailsUpdate] = useState(false)
    const { state, getChartVersionsAndValues, configureChart, fetchChartValues, addChart, subtractChart, handleChartValueChange, handleChartVersionChange, chartListing, createChartValues, removeChart, discardValuesYamlChanges, updateChartGroupEntriesFromResponse, updateChartGroupNameAndDescription, reloadState } = useChartGroup(Number(groupId))
    const [loading, setLoading] = useState(false)
    const history = useHistory()
    const location = useLocation()
    const match = useRouteMatch()
    const isLeavingPageNotAllowed = useRef(false)
    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                group: 'Chart Groups',
                ':groupId': {
                    component: <AppSelector
                        api={()=>getChartGroups().then(res=>({result: res.result.groups}))}
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

    function closeChartGroupModal(props){
        if(props?.name){
            updateChartGroupNameAndDescription(props.name, props?.description||"" )
        }
        setChartDetailsUpdate(false)
    }

    return (
        <>
            <div className="chart-group--details-page">
                <div className="page-header">
                    <div className="flex column left">
                        <div className="flex left">
                            <BreadCrumb breadcrumbs={breadcrumbs.slice(1,)}/>
                        </div>
                        <div className="flex left page-header__title">
                            {state.name} 
                            <Pencil className="pointer" onClick={e => setChartDetailsUpdate(true)} />
                        </div>
                    </div>
                    <div className="page-header__cta-container flex right">
                        <button className="cta cancel mr-16" onClick={handleSave}>{loading ? <Progressing /> : <div className="flex left" style={{width:'100%'}}><SaveIcon className="mr-5"/>Save</div>}</button>
                        <button className="cta cancel" onClick={redirectToGroupDetail}>Group Detail</button>
                    </div>
                </div>
                <Prompt when={isLeavingPageNotAllowed.current} message={"Your changes will be lost. Do you want to leave without saving?"} />
                {state.loading && <Progressing pageLoader />}
                {!state.loading && <div className={`chart-group--details-body summary-show`}>
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
                            />
                            :
                            <ChartList
                                availableCharts={state.availableCharts}
                                addChart={addChart}
                                subtractChart={subtractChart}
                                selectedInstances={state.selectedInstances}
                            />

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
                </div>}
            </div>
            {chartDetailsUpdate &&
                <CreateChartGroup
                    closeChartGroupModal={closeChartGroupModal}
                    history={history}
                    location={location}
                    match={match}
                    chartGroupId={Number(groupId)}
                    name={state.name}
                    description={state.description}
                />}
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
