import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { getIframeSrc, ThroughputSelect, getCalendarValue } from './utils';
import { ChartTypes, AppMetricsTab, AppMetricsTabType } from './appDetails.type';
import { AppDetailsPathParams } from './appDetails.type';
import { GraphModal } from './GraphsModal';
import { DatePickerType2 as DateRangePicker, Progressing } from '../../../common';
import { ReactComponent as GraphIcon } from '../../../../assets/icons/ic-graph.svg';
import { ReactComponent as Fullscreen } from '../../../../assets/icons/ic-fullscreen-2.svg';
import { getAppComposeURL, APP_COMPOSE_STAGE } from '../../../../config';
import { Link } from 'react-router-dom';
import { isDatasourceConfigured, isDatasourceHealthy } from './appDetails.service';
import PrometheusErrorImage from '../../../../assets/img/ic-error-prometheus.png';
import moment, { Moment } from 'moment';
import Tippy from '@tippyjs/react';

export const AppMetrics: React.FC<{ appName: string, environment, podMap: Map<string, any> }> = ({ appName, environment, podMap }) => {
    const { appMetrics, environmentName, infraMetrics } = environment;
    const [calendar, setDateRange] = useState<{ startDate: Moment, endDate: Moment }>({
        startDate: moment().subtract(5, 'minute'),
        endDate: moment(),
    });
    const [calendarInputs, setCalendarInput] = useState<{ startDate: string, endDate: string }>({
        startDate: 'now-5m',
        endDate: 'now',
    });
    const [datasource, setDatasource] = useState({
        isLoading: true,
        isConfigured: false,
        isHealthy: false,
    });
    const [focusedInput, setFocusedInput] = useState('startDate')
    const [tab, setTab] = useState<AppMetricsTabType>(AppMetricsTab.Aggregate);
    const [chartName, setChartName] = useState<ChartTypes>(null);
    const { appId, envId } = useParams<AppDetailsPathParams>();
    const [calendarValue, setCalendarValue] = useState('');
    const [statusCode, setStatusCode] = useState('Throughput')
    const [graphs, setGraphs] = useState({
        cpu: "",
        ram: "",
        throughput: "",
        latency: "",
    })
    let pod = podMap?.values().next().value;
    let newPodHash = pod?.networkingInfo?.labels['rollouts-pod-template-hash'];

    function handleTabChange(event): void {
        let tab = event.target.value;
        setTab(tab);
        getNewGraphs(tab);
    }

    function handleDatesChange({ startDate, endDate }): void {
        setDateRange({
            startDate: startDate,
            endDate: endDate,
        });
        setCalendarInput({
            startDate: startDate?.format('DD-MM-YYYY hh:mm:ss'),
            endDate: endDate?.format('DD-MM-YYYY hh:mm:ss') || ''
        });
    }

    function handleDateInput(key: 'startDate' | 'endDate', value: string): void {
        setCalendarInput({
            ...calendarInputs,
            [key]: value
        });
    }

    function handleFocusChange(focusedInput): void {
        setFocusedInput(focusedInput || 'startDate');
    }

    function handleApply(): void {
        let str = getCalendarValue(calendarInputs.startDate, calendarInputs.endDate);
        setCalendarValue(str);
    }

    async function checkDatasource() {
        try {
            let datasourceConfiguredRes, datasourceHealthyRes;
            datasourceConfiguredRes = await isDatasourceConfigured(environmentName);
            if (datasourceConfiguredRes.id) datasourceHealthyRes = await isDatasourceHealthy(datasourceConfiguredRes.id);
            setDatasource({
                isLoading: false,
                isConfigured: !!datasourceConfiguredRes.id,
                isHealthy: datasourceHealthyRes.status.toLowerCase() === "success",
            })
        }
        catch (error) {
            setDatasource({
                ...datasource,
                isLoading: false,
            })
        }
    }

    function handlePredefinedRange(start: Moment, end: Moment, startStr: string): void {
        setDateRange({
            startDate: start,
            endDate: end,
        });
        setCalendarInput({
            startDate: startStr,
            endDate: 'now',
        });
        let str = getCalendarValue(startStr, 'now');
        setCalendarValue(str);

    }

    function handleStatusChange(selected): void {
        let throughput = getIframeSrc(appId, envId, environmentName, 'status', newPodHash, calendarInputs, tab, true, selected.value);
        setStatusCode(selected.value);
        setGraphs({
            ...graphs,
            throughput: throughput,
        });
    }

    function getNewGraphs(newTab): void {
        let cpu = getIframeSrc(appId, envId, environmentName, 'cpu', newPodHash, calendarInputs, newTab, true);
        let ram = getIframeSrc(appId, envId, environmentName, 'ram', newPodHash, calendarInputs, newTab, true);
        let throughput = getIframeSrc(appId, envId, environmentName, 'status', newPodHash, calendarInputs, newTab, true, 'Throughput');
        let latency = getIframeSrc(appId, envId, environmentName, 'latency', newPodHash, calendarInputs, newTab, true);
        setGraphs({
            cpu,
            ram,
            throughput,
            latency,
        });
    }


    useEffect(() => {
        let str: string = getCalendarValue(calendarInputs.startDate, calendarInputs.endDate)
        setCalendarValue(str);
        getNewGraphs(tab);
        checkDatasource();
    }, [])

    useEffect(() => {
        getNewGraphs(tab);
    }, [calendarValue])

    if (datasource.isLoading) return <div className="app-metrics-graph__empty-state-wrapper">
        <h4 className="fs-14 fw-6 cn-7 flex left mr-9">
            <GraphIcon className="mr-8 fcn-7 icon-dim-20" />APPLICATION METRICS
        </h4>
        <div style={{ height: '240px' }}>
            <Progressing pageLoader />
        </div>
    </div>
    if (!datasource.isConfigured) {
        return <AppMetricsEmptyState subtitle="We could not connect to prometheus endpoint. Please configure data source and try reloading this page." />
    }
    else if (!datasource.isHealthy) {
        return <AppMetricsEmptyState subtitle="Datasource configuration is incorrect or prometheus is not healthy. Please review configuration and try reloading this page." />
    }
    else return <section className={`app-summary bcn-0 pl-24 pr-24 pb-20 w-100`}
        style={{ boxShadow: 'inset 0 -1px 0 0 var(--N200)' }}>
        {(appMetrics || infraMetrics) && (
            <div className="flex" style={{ justifyContent: 'space-between', height: '68px' }}>
                <span className="fs-14 fw-6 cn-7 flex left mr-9">
                    <GraphIcon className="mr-8 fcn-7 icon-dim-20" />APPLICATION METRICS
                </span>
                <div className="flex">
                    <div className="mr-16">
                        <label className="tertiary-tab__radio">
                            <input type="radio" name="status" checked={tab === AppMetricsTab.Aggregate} value={AppMetricsTab.Aggregate} onChange={handleTabChange} />
                            <span className="tertiary-tab">Aggregate</span>
                        </label>
                        <label className="tertiary-tab__radio">
                            <input type="radio" name="status" checked={tab === AppMetricsTab.Pod} value={AppMetricsTab.Pod} onChange={handleTabChange} />
                            <span className="tertiary-tab">Per Pod</span>
                        </label>
                        {chartName ? <GraphModal appId={appId}
                            envId={envId}
                            appName={appName}
                            infraMetrics={environment.infraMetrics}
                            appMetrics={environment.appMetrics}
                            environmentName={environmentName}
                            chartName={chartName}
                            newPodHash={newPodHash}
                            calendar={calendar}
                            calendarInputs={calendarInputs}
                            tab={tab}
                            close={() => setChartName(null)} /> : null}
                    </div>
                    <DateRangePicker calendar={calendar}
                        calendarInputs={calendarInputs}
                        focusedInput={focusedInput}
                        calendarValue={calendarValue}
                        handlePredefinedRange={handlePredefinedRange}
                        handleDatesChange={handleDatesChange}
                        handleFocusChange={handleFocusChange}
                        handleDateInput={handleDateInput}
                        handleApply={handleApply} />
                </div>
            </div>
        )}
        <div className={`chart-containers`}>
            {infraMetrics ? <>
                <div className={`app-metrics-graph chart`}>
                    <div className="app-metrics-graph__title flexbox flex-justify">CPU Usage
                    <Tippy className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content="Fullscreen">
                            <Fullscreen className="icon-dim-16 cursor fcn-5" onClick={(e) => { setChartName('cpu') }} />
                        </Tippy>
                    </div>
                    <iframe title={'cpu'} src={graphs.cpu} className="app-metrics-graph__iframe" />
                </div>
                <div className={`app-metrics-graph chart`}>
                    <div className="app-metrics-graph__title flexbox flex-justify">Memory Usage
                        <Tippy className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content="Fullscreen">
                            <Fullscreen className="icon-dim-16 cursor fcn-5" onClick={(e) => { setChartName('ram') }} />
                        </Tippy>
                    </div>
                    <iframe title={'ram'} src={graphs.ram} className="app-metrics-graph__iframe" />
                </div>
            </> : <PrometheusError />}
            {appMetrics ? <>
                <div className={`app-metrics-graph chart`}>
                    <div className="flexbox flex-justify">
                        <h3 className="app-details-graph__title flexbox m-0">
                            <ThroughputSelect status={statusCode} handleStatusChange={handleStatusChange} />
                        </h3>
                        <Tippy className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content="Fullscreen">
                            <Fullscreen className="icon-dim-16 cursor fcn-5" onClick={(e) => { setChartName('status') }} />
                        </Tippy>
                    </div>
                    <iframe title={'throughput'} src={graphs.throughput} className="app-metrics-graph__iframe" />
                </div>
                <div className={`app-metrics-graph chart`}>
                    <div className="app-metrics-graph__title flexbox flex-justify">Latency
                    <Tippy className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content="Fullscreen">
                            <Fullscreen className="icon-dim-16 cursor fcn-5" onClick={(e) => { setChartName('latency') }} />
                        </Tippy>
                    </div>
                    <iframe title={'latency'} src={graphs.latency} className="app-metrics-graph__iframe" />
                </div>
            </> : <EnableAppMetrics />}
        </div>
    </section>
}

function PrometheusError() {
    return (
        <div className="flex upgrade-chart-container">
            <div className="upgrade-chart-main">
                <img src={PrometheusErrorImage} style={{ width: '200px', height: '160px' }} />
                <div className="flex left column upgrade-chart-text">
                    <b>Unable to show infra metrics</b>
                    <span>
                        Infra metrics (CPU usage, memory usage) could not be shown as we could not connect to
                        prometheus. Please check your configuration and try reloading this page.
                    </span>
                </div>
            </div>
        </div>
    );
}

function EnableAppMetrics() {
    const { appId } = useParams<AppDetailsPathParams>();
    const LINK = getAppComposeURL(appId, APP_COMPOSE_STAGE.DEPLOYMENT_TEMPLATE);
    return (
        <div className="flex column br-4" style={{ gridColumn: '3 / span 2', background: 'var(--window-bg)' }}>
            <b className="mb-12 fs-12 fw-6 cn-9">Throughput & Latency</b>
            <span className="mb-12 fs-12 cn-7" style={{ width: '200px' }}>
                Enable application metrics to view trends for status codes and latency.
            </span>
            <Link to={`${LINK}/${appId}#opt-metrics`} className="anchor">
                Go to configurations
            </Link>
        </div>
    );
}

function AppMetricsEmptyState(props) {
    return <div className="app-metrics-graph__empty-state-wrapper">
        <h4 className="fs-14 fw-6 cn-7 flex left mr-9">
            <GraphIcon className="mr-8 fcn-7 icon-dim-20" />APPLICATION METRICS
        </h4>
        <article className="app-metrics-graph__empty-state">
            <img src={PrometheusErrorImage} alt="" className="w-100" />
            <div>
                <p className="app-metrics-graph__empty-state-title">Unable to show app metrics</p>
                <p className="app-metrics-graph__empty-state-subtitle">{props.subtitle}</p>
                <a href={`https://docs.devtron.ai/global-configurations/cluster-and-environments`} target="_blank" className="cta small text" style={{ paddingLeft: '0px' }} >See how to fix</a>
                <Link to={`/global-config/cluster-env`} className="cta small text">Review Configuration</Link>
            </div>
        </article>
    </div>
}