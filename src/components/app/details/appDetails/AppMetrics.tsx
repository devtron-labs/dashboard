import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { getIframeSrc, ThroughputSelect, getCalendarValue, isK8sVersionValid, LatencySelect } from './utils';
import { ChartTypes, AppMetricsTab, AppMetricsTabType, ChartType, StatusTypes, StatusType, CalendarFocusInput, CalendarFocusInputType } from './appDetails.type';
import { AppDetailsPathParams } from './appDetails.type';
import { GraphModal } from './GraphsModal';
import { DatePickerType2 as DateRangePicker, Progressing, not } from '../../../common';
import { ReactComponent as GraphIcon } from '../../../../assets/icons/ic-graph.svg';
import { ReactComponent as Fullscreen } from '../../../../assets/icons/ic-fullscreen-2.svg';
import { getAppComposeURL, APP_COMPOSE_STAGE, DOCUMENTATION, DEFAULTK8SVERSION } from '../../../../config';
import { Link } from 'react-router-dom';
import { isDatasourceConfigured, isDatasourceHealthy } from './appDetails.service';
import { URLS } from '../../../../config';
import { getHostURLConfiguration } from '../../../../services/service';
import { toast } from 'react-toastify'
import PrometheusErrorImage from '../../../../assets/img/ic-error-prometheus.png';
import HostErrorImage from '../../../../assets/img/ic-error-hosturl.png';
import moment, { Moment } from 'moment';
import Tippy from '@tippyjs/react';
import { ReactComponent as DropDownIcon } from '../../../../assets/icons/appstatus/ic-chevron-down.svg';

export const AppMetrics: React.FC<{ appName: string, environment, podMap: Map<string, any>, k8sVersion, addExtraSpace: boolean}> = ({ appName, environment, podMap, k8sVersion, addExtraSpace }) => {
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
    const [focusedInput, setFocusedInput] = useState(CalendarFocusInput.StartDate)
    const [tab, setTab] = useState<AppMetricsTabType>(AppMetricsTab.Aggregate);
    const [chartName, setChartName] = useState<ChartTypes>(null);
    const { appId, envId } = useParams<AppDetailsPathParams>();
    const [calendarValue, setCalendarValue] = useState('');
    const [statusCode, setStatusCode] = useState<StatusTypes>(StatusType.Throughput);
    const [selectedLatency, setLatency] = useState<number>(99.9);
    const [hostURLConfig, setHostURLConfig] = useState(undefined);
    const [graphs, setGraphs] = useState({
        cpu: "",
        ram: "",
        throughput: "",
        latency: "",
    })
    const addSpace: string = addExtraSpace ? 'mb-16':''; 
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

    function handleDateInput(key: CalendarFocusInputType, value: string): void {
        setCalendarInput({
            ...calendarInputs,
            [key]: value
        });
    }

    function handleFocusChange(focusedInput): void {
        setFocusedInput(focusedInput || CalendarFocusInput.StartDate);
    }

    function handleApply(): void {
        let str = getCalendarValue(calendarInputs.startDate, calendarInputs.endDate);
        setCalendarValue(str);
    }

    async function checkDatasource() {
        try {
            let datasourceConfiguredRes, datasourceHealthyRes, hostUrlRes;
            hostUrlRes = await getHostURLConfiguration();
            setHostURLConfig(hostUrlRes.result);
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
        if (!isK8sVersionValid(k8sVersion)) {
            k8sVersion = DEFAULTK8SVERSION;
        }
        let appInfo = {
            appId: appId,
            envId: envId,
            environmentName: environmentName,
            newPodHash: newPodHash,
            k8sVersion: k8sVersion,
        }
        let throughput = getIframeSrc(appInfo, ChartType.Status, calendarInputs, tab, true, selected.value);
        setStatusCode(selected.value);
        setGraphs({
            ...graphs,
            throughput: throughput,
        });
    }

    function handleLatencyChange(selected): void {
        if (!isK8sVersionValid(k8sVersion)) {
            k8sVersion = DEFAULTK8SVERSION;
        }
        let appInfo = {
            appId: appId,
            envId: envId,
            environmentName: environmentName,
            newPodHash: newPodHash,
            k8sVersion: k8sVersion,
        }
        let latency = getIframeSrc(appInfo, ChartType.Latency, calendarInputs, tab, true, undefined, selected.value);
        setLatency(selected.value);
        setGraphs({
            ...graphs,
            latency: latency,
        });
    }

    function getNewGraphs(newTab): void {
        if (!datasource.isHealthy) return;

        if (!isK8sVersionValid(k8sVersion)) {
            k8sVersion = DEFAULTK8SVERSION;

            toast.warn(<div className="toast">
                <div className="toast__title">Error Parsing K8sVersion</div>
                <div className="toast__subtitle">Showing Graphs for {DEFAULTK8SVERSION} and above</div>
            </div>)
        }

        let appInfo = {
            appId: appId,
            envId: envId,
            environmentName: environmentName,
            newPodHash: newPodHash,
            k8sVersion: k8sVersion,
        }
        let cpu = getIframeSrc(appInfo, ChartType.Cpu, calendarInputs, newTab, true);
        let ram = getIframeSrc(appInfo, ChartType.Ram, calendarInputs, newTab, true);
        let latency = getIframeSrc(appInfo, ChartType.Latency, calendarInputs, newTab, true, undefined, selectedLatency);
        let throughput = getIframeSrc(appInfo, ChartType.Status, calendarInputs, newTab, true, StatusType.Throughput);
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
        checkDatasource();
    }, [appName])

    useEffect(() => {
        getNewGraphs(tab);
    }, [datasource])

    useEffect(() => {
        getNewGraphs(tab);
    }, [calendarValue])

    //@ts-ignore
    if (!datasource.isConfigured || !datasource.isHealthy || !hostURLConfig || hostURLConfig.value !== window.location.origin ) {
        return <>
            <AppMetricsEmptyState isLoading={datasource.isLoading}
                addSpace={addSpace}
                isConfigured={datasource.isConfigured}
                isHealthy={datasource.isHealthy}
                hostURLConfig={hostURLConfig} />
        </>
    }
    else {
        return <section className={`app-summary bcn-0 pl-24 pr-24 pb-20 w-100 ${addSpace}`}
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
                                k8sVersion={k8sVersion}
                                selectedLatency={selectedLatency}
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
                                <Fullscreen className="icon-dim-16 cursor fcn-5" onClick={(e) => { setChartName(ChartType.Cpu) }} />
                            </Tippy>
                        </div>
                        <iframe title={ChartType.Cpu} src={graphs.cpu} className="app-metrics-graph__iframe" />
                    </div>
                    <div className={`app-metrics-graph chart`}>
                        <div className="app-metrics-graph__title flexbox flex-justify">Memory Usage
                        <Tippy className="default-tt"
                                arrow={false}
                                placement="bottom"
                                content="Fullscreen">
                                <Fullscreen className="icon-dim-16 cursor fcn-5" onClick={(e) => { setChartName(ChartType.Ram) }} />
                            </Tippy>
                        </div>
                        <iframe title={ChartType.Ram} src={graphs.ram} className="app-metrics-graph__iframe" />
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
                                <Fullscreen className="icon-dim-16 cursor fcn-5" onClick={(e) => { setChartName(ChartType.Status) }} />
                            </Tippy>
                        </div>
                        <iframe title={StatusType.Throughput} src={graphs.throughput} className="app-metrics-graph__iframe" />
                    </div>
                    <div className={`app-metrics-graph chart`}>
                        <div className="app-metrics-graph__title flexbox flex-justify">
                            <div className='flexbox'>
                                <h3 className="app-details-graph__title flexbox m-0 mr-5">Latency</h3>
                                <h3 className="app-details-graph__title flexbox m-0">
                                    <LatencySelect latency={selectedLatency} handleLatencyChange={handleLatencyChange} />
                                </h3>
                            </div>
                            <Tippy className="default-tt"
                                arrow={false}
                                placement="bottom"
                                content="Fullscreen">
                                <Fullscreen className="icon-dim-16 cursor fcn-5" onClick={(e) => { setChartName(ChartType.Latency) }} />
                            </Tippy>
                        </div>
                        <iframe title={ChartType.Latency} src={graphs.latency} className="app-metrics-graph__iframe" />
                    </div>
                </> : <EnableAppMetrics />}
            </div>
        </section>
    }
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

function AppMetricsEmptyState({ isLoading, isConfigured, isHealthy, hostURLConfig, addSpace }) {
    const [collapsed, toggleCollapsed] = useState<boolean>(true);

    let subtitle = '';
    if (!isConfigured) {
        subtitle = 'We could not connect to prometheus endpoint. Please configure data source and try reloading this page.';
    }
    else if (!isHealthy) {
        subtitle = 'Datasource configuration is incorrect or prometheus is not healthy. Please review configuration and try reloading this page.';
    }
    return (
        <div className={`app-metrics-graph__empty-state-wrapper bcn-0 w-100 pt-18 pb-18 pl-20 pr-20 ${addSpace}`}>
            <div className="flex left w-100 lh-20">
                <span className="fs-14 fw-6 cn-7 flex left mr-16">
                    <GraphIcon className="mr-8 fcn-7 icon-dim-20" />
                    APPLICATION METRICS
                </span>
                {collapsed && !isLoading && (
                    <span className="fw-4 fs-13 cn-7">
                        Unable to show metrics due to insufficient/incorrect configurations
                    </span>
                )}
                <DropDownIcon
                    style={{ marginLeft: 'auto', ['--rotateBy' as any]: `${180 * Number(!collapsed)}deg` }}
                    className="icon-dim-20 rotate pointer"
                    onClick={(e) => toggleCollapsed(not)}
                />
            </div>
            {!collapsed &&
                (isLoading ? (
                    <div style={{ height: '240px' }}>
                        <Progressing pageLoader />
                    </div>
                ) : (
                    <article className="app-metrics-graph__empty-state">
                        <img src={HostErrorImage} alt="error" className="w-100" />
                        <div>
                            <p className="fw-6 fs-14 cn-9">
                                Unable to show metrics due to insufficient/incorrect configurations
                            </p>
                            {(!hostURLConfig || hostURLConfig.value !== window.location.origin) && (
                                <>
                                    <p className="fw-4 fs-12 cn-7 mt-16 mb-0">
                                        Host url is not configured or is incorrect. Reach out to your DevOps team
                                        (super-admin) to configure host url.
                                    </p>
                                    <Link
                                        to={URLS.GLOBAL_CONFIG_HOST_URL}
                                        className="cta small text"
                                        style={{ paddingLeft: '0' }}
                                    >
                                        Review and update
                                    </Link>
                                </>
                            )}
                            {(!isConfigured || !isHealthy) && (
                                <>
                                    <p className="fw-4 fs-12 cn-7 mt-16 mb-0">{subtitle}</p>
                                    <a
                                        className="learn-more__href cta small text pl-0"
                                        href={DOCUMENTATION.GLOBAL_CONFIG_CLUSTER}
                                        target="_blank"
                                        style={{ paddingLeft: '0' }}
                                    >
                                        See how to fix
                                    </a>
                                    <Link
                                        to={URLS.GLOBAL_CONFIG_CLUSTER}
                                        className="cta small text"
                                        style={{ paddingLeft: '0' }}
                                    >
                                        Review Configuration
                                    </Link>
                                </>
                            )}
                        </div>
                    </article>
                ))}
        </div>
    )
}