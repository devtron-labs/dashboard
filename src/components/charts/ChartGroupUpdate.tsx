import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouteMatch, useHistory, useLocation } from 'react-router'
import ChartSelect from './util/ChartSelect'
import { ChartGroupEntry, Chart } from './charts.types'
import MultiChartSummary from './MultiChartSummary'
import AdvancedConfig from './AdvancedConfig'
import { updateChartGroupEntries, getChartGroups } from './charts.service'
import useChartGroup from './useChartGroup'
import { showError, Pencil, Progressing, BreadCrumb, useBreadcrumb, Checkbox, Option, multiSelectStyles, } from '../common'
import CreateChartGroup from './modal/CreateChartGroup'
import { URLS } from '../../config';
import { toast } from 'react-toastify'
import { Prompt } from 'react-router';
import { ReactComponent as SaveIcon } from '../../assets/icons/ic-save.svg'
import AppSelector from '../AppSelector'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg';
import ReactSelect, { components } from 'react-select';
import { DropdownIndicator, ValueContainer } from './charts.util';
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg';


export default function ChartGroupUpdate({ }) {
    const { groupId } = useParams<{ groupId }>()
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

    return (
        <>
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
                            : <>
                                <ChartGroupFiltersHeader />
                                <ChartList
                                    availableCharts={state.availableCharts}
                                    addChart={addChart}
                                    subtractChart={subtractChart}
                                    selectedInstances={state.selectedInstances}
                                /></>

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

function ChartGroupFiltersHeader() {
    const MenuList = (props) => {
        return (
            <components.MenuList {...props}>
                {props.children}
                <div className="chart-list-apply-filter flex bcn-0 pt-10 pb-10">
                    <button type="button" className="cta flex cta--chart-store"
                        disabled={false}
                        // onClick={(selected: any) => { handleChartRepoChange(selectedChartRepo) }}
                        >
                            Apply Filter
                            </button>
                </div>
            </components.MenuList>
        );
    };

    return (<><div className="flexbox flex-justify mt-16 ml-20 mr-20">
        <form
            //onSubmit={handleAppStoreChange}
            className="search position-rel" >
            <Search className="search__icon icon-dim-18" />
            <input type="text" placeholder="Search charts"
                //  value={appStoreName} 
                className="search__input bcn-0"
                onChange={(event) => { return event.target.value; }} />
            {/* {searchApplied ? <button className="search__clear-button" type="button" onClick={clearSearch}>
                    <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                </button> : null} */}
        </form>
        <div className="flex">
            <ReactSelect
                className="date-align-left fs-13"
                placeholder="Repository : All"
                name="repository "
                // value={selectedChartRepo}
                // options={chartRepoList}
                closeOnSelect={false}
                // onChange={setSelectedChartRepo}
                isClearable={false}
                isMulti={true}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                // onMenuClose={handleCloseFilter}
                components={{
                    DropdownIndicator,
                    Option,
                    ValueContainer,
                    IndicatorSeparator: null,
                    ClearIndicator: null,
                    MenuList,
                }}
                styles={{ ...multiSelectStyles }} />
            <Checkbox rootClassName="ml-16 mb-0 fs-14 cursor bcn-0 pt-8 pb-8 pr-12 date-align-left--deprecate"
                isChecked={//includeDeprecated === 1
                true}
                value={"CHECKED"}
                onChange={(event) => event.target.value
                    // { let value = (includeDeprecated + 1) % 2; handleDeprecateChange(value) }
                } 
                >
                <div className="ml-5"> Show deprecated</div>
            </Checkbox>
        </div>
    </div>
    </>)
}