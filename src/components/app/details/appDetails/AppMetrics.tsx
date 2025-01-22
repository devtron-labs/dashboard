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

import React, { useState, useEffect } from 'react'
import { not, Progressing, ToastManager, ToastVariantType, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import { useParams, Link, NavLink } from 'react-router-dom'
import moment, { Moment } from 'moment'
import Tippy from '@tippyjs/react'
import { getIframeSrc, ThroughputSelect, getCalendarValue, isK8sVersionValid, LatencySelect } from './utils'
import {
    ChartTypes,
    AppMetricsTab,
    AppMetricsTabType,
    ChartType,
    StatusTypes,
    StatusType,
    CalendarFocusInput,
    CalendarFocusInputType,
    AppDetailsPathParams,
} from './appDetails.type'
import { GraphModal } from './GraphsModal'
import { DatePickerType2 as DateRangePicker } from '../../../common'
import { ReactComponent as GraphIcon } from '../../../../assets/icons/ic-graph.svg'
import { ReactComponent as Fullscreen } from '../../../../assets/icons/ic-fullscreen-2.svg'
import { ReactComponent as OpenInNew } from '../../../../assets/icons/ic-open-in-new.svg'
import {
    getAppComposeURL,
    APP_COMPOSE_STAGE,
    DOCUMENTATION,
    DEFAULTK8SVERSION,
    ModuleNameMap,
    URLS,
} from '../../../../config'
import { isDatasourceConfigured, isDatasourceHealthy } from './appDetails.service'
import { getHostURLConfiguration } from '../../../../services/service'
import PrometheusErrorImage from '../../../../assets/img/ic-error-prometheus.png'
import HostErrorImage from '../../../../assets/img/ic-error-hosturl.png'
import { ReactComponent as DropDownIcon } from '../../../../assets/icons/appstatus/ic-chevron-down.svg'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleStatus } from '../../../v2/devtronStackManager/DevtronStackManager.type'
import { APP_METRICS_CALENDAR_INPUT_DATE_FORMAT } from './constants'

export const AppMetrics: React.FC<{
    appName: string
    environment
    podMap: Map<string, any>
    k8sVersion
    addExtraSpace: boolean
}> = ({ appName, environment, podMap, k8sVersion, addExtraSpace }) => {
    const { appMetrics, environmentName, infraMetrics } = environment
    const [calendar, setDateRange] = useState<{ startDate: Moment; endDate: Moment }>({
        startDate: moment().subtract(5, 'minute'),
        endDate: moment(),
    })
    const [calendarInputs, setCalendarInput] = useState<{ startDate: string; endDate: string }>({
        startDate: 'now-5m',
        endDate: 'now',
    })
    const [datasource, setDatasource] = useState({
        isLoading: true,
        isConfigured: false,
        isHealthy: false,
    })
    const [focusedInput, setFocusedInput] = useState(CalendarFocusInput.StartDate)
    const [tab, setTab] = useState<AppMetricsTabType>(AppMetricsTab.Aggregate)
    const [chartName, setChartName] = useState<ChartTypes>(null)
    const { appId, envId } = useParams<AppDetailsPathParams>()
    const [calendarValue, setCalendarValue] = useState('')
    const [statusCode, setStatusCode] = useState<StatusTypes>(StatusType.Throughput)
    const [selectedLatency, setLatency] = useState<number>(99.9)
    const [hostURLConfig, setHostURLConfig] = useState(undefined)
    const [, grafanaModuleStatus] = useAsync(() => getModuleInfo(ModuleNameMap.GRAFANA), [appId])
    const [graphs, setGraphs] = useState({
        cpu: '',
        ram: '',
        throughput: '',
        latency: '',
    })
    const addSpace: string = addExtraSpace ? 'mb-16' : ''
    const pod = podMap?.values().next().value
    const newPodHash = pod?.networkingInfo?.labels?.['rollouts-pod-template-hash']

    function handleTabChange(event): void {
        const tab = event.target.value
        setTab(tab)
        getNewGraphs(tab)
    }

    function handleDatesChange({ startDate, endDate }): void {
        setDateRange({
            startDate,
            endDate,
        })
        setCalendarInput({
            startDate: startDate?.format(APP_METRICS_CALENDAR_INPUT_DATE_FORMAT),
            endDate: endDate?.format(APP_METRICS_CALENDAR_INPUT_DATE_FORMAT) || '',
        })
    }

    function handleDateInput(key: CalendarFocusInputType, value: string): void {
        setCalendarInput({
            ...calendarInputs,
            [key]: value,
        })
    }

    function handleFocusChange(focusedInput): void {
        setFocusedInput(focusedInput || CalendarFocusInput.StartDate)
    }

    function handleApply(): void {
        const str = getCalendarValue(calendarInputs.startDate, calendarInputs.endDate)
        setCalendarValue(str)
    }

    async function checkDatasource() {
        try {
            let datasourceConfiguredRes
            let datasourceHealthyRes
            let hostUrlRes
            hostUrlRes = await getHostURLConfiguration()
            setHostURLConfig(hostUrlRes.result)
            datasourceConfiguredRes = await isDatasourceConfigured(environmentName)
            if (datasourceConfiguredRes.id) {
                datasourceHealthyRes = await isDatasourceHealthy(datasourceConfiguredRes.id)
            }
            setDatasource({
                isLoading: false,
                isConfigured: !!datasourceConfiguredRes.id,
                isHealthy: datasourceHealthyRes.status.toLowerCase() === 'success',
            })
        } catch (error) {
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
        })
        setCalendarInput({
            startDate: startStr,
            endDate: 'now',
        })
        const str = getCalendarValue(startStr, 'now')
        setCalendarValue(str)
    }

    function handleStatusChange(selected): void {
        if (!isK8sVersionValid(k8sVersion)) {
            k8sVersion = DEFAULTK8SVERSION
        }
        const appInfo = {
            appId,
            envId,
            environmentName,
            newPodHash,
            k8sVersion,
        }
        const throughput = getIframeSrc(appInfo, ChartType.Status, calendarInputs, tab, true, selected.value)
        setStatusCode(selected.value)
        setGraphs({
            ...graphs,
            throughput,
        })
    }

    function handleLatencyChange(selected): void {
        if (!isK8sVersionValid(k8sVersion)) {
            k8sVersion = DEFAULTK8SVERSION
        }
        const appInfo = {
            appId,
            envId,
            environmentName,
            newPodHash,
            k8sVersion,
        }
        const latency = getIframeSrc(appInfo, ChartType.Latency, calendarInputs, tab, true, undefined, selected.value)
        setLatency(selected.value)
        setGraphs({
            ...graphs,
            latency,
        })
    }

    function getNewGraphs(newTab): void {
        if (!datasource.isHealthy) {
            return
        }

        if (!isK8sVersionValid(k8sVersion)) {
            k8sVersion = DEFAULTK8SVERSION

            ToastManager.showToast({
                variant: ToastVariantType.warn,
                title: 'Error Parsing K8sVersion',
                description: `Showing Graphs for ${DEFAULTK8SVERSION} and above`,
            })
        }

        const appInfo = {
            appId,
            envId,
            environmentName,
            newPodHash,
            k8sVersion,
        }
        const cpu = getIframeSrc(appInfo, ChartType.Cpu, calendarInputs, newTab, true)
        const ram = getIframeSrc(appInfo, ChartType.Ram, calendarInputs, newTab, true)
        const latency = getIframeSrc(
            appInfo,
            ChartType.Latency,
            calendarInputs,
            newTab,
            true,
            undefined,
            selectedLatency,
        )
        const throughput = getIframeSrc(appInfo, ChartType.Status, calendarInputs, newTab, true, StatusType.Throughput)
        setGraphs({
            cpu,
            ram,
            throughput,
            latency,
        })
    }

    useEffect(() => {
        const inputCalendarValue: string = getCalendarValue(calendarInputs.startDate, calendarInputs.endDate)
        if (inputCalendarValue !== calendarValue) {
            setCalendarValue(inputCalendarValue)
        }
        if (grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED) {
            checkDatasource()
        }
    }, [appName, grafanaModuleStatus])

    useEffect(() => {
        getNewGraphs(tab)
    }, [datasource, calendarValue])

    // @ts-ignore
    if (grafanaModuleStatus?.result?.status !== ModuleStatus.INSTALLED) {
        return <MonitoringModuleNotInstalled addSpace={addSpace} />
    }
    if (
        !datasource.isConfigured ||
        !datasource.isHealthy ||
        !hostURLConfig ||
        hostURLConfig.value !== window.location.origin
    ) {
        return (
            <AppMetricsEmptyState
                isLoading={datasource.isLoading}
                isConfigured={datasource.isConfigured}
                isHealthy={datasource.isHealthy}
                hostURLConfig={hostURLConfig}
            />
        )
    }

    return (
        <section
            data-testid="app-metrices-wrapper"
            className="app-summary bcn-0 pl-24 pr-24 pb-20 w-100 dc__border-bottom-n1"
        >
            {(appMetrics || infraMetrics) && (
                <div className="flex" style={{ justifyContent: 'space-between', height: '68px' }}>
                    <span className="fs-14 fw-6 cn-7 flex left mr-9">
                        <GraphIcon className="mr-8 fcn-7 icon-dim-20" />
                        APPLICATION METRICS
                    </span>
                    <div className="flex">
                        <div className="mr-16">
                            <label data-testid="app-metrics-aggregate-status" className="dc__tertiary-tab__radio">
                                <input
                                    type="radio"
                                    name="status"
                                    checked={tab === AppMetricsTab.Aggregate}
                                    value={AppMetricsTab.Aggregate}
                                    onChange={handleTabChange}
                                />
                                <span className="dc__tertiary-tab">Aggregate</span>
                            </label>
                            <label data-testid="app-metrics-per-pod-status" className="dc__tertiary-tab__radio">
                                <input
                                    type="radio"
                                    name="status"
                                    checked={tab === AppMetricsTab.Pod}
                                    value={AppMetricsTab.Pod}
                                    onChange={handleTabChange}
                                />
                                <span className="dc__tertiary-tab">Per Pod</span>
                            </label>
                            {chartName ? (
                                <GraphModal
                                    appId={appId}
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
                                    close={() => setChartName(null)}
                                />
                            ) : null}
                        </div>
                        <DateRangePicker
                            calendar={calendar}
                            calendarInputs={calendarInputs}
                            focusedInput={focusedInput}
                            calendarValue={calendarValue}
                            handlePredefinedRange={handlePredefinedRange}
                            handleDatesChange={handleDatesChange}
                            handleFocusChange={handleFocusChange}
                            handleDateInput={handleDateInput}
                            handleApply={handleApply}
                        />
                    </div>
                </div>
            )}
            <div className="chart-containers">
                {infraMetrics ? (
                    <>
                        <div data-testid="app-metrics-cpu-usage" className="app-metrics-graph chart">
                            <div className="app-metrics-graph__title flexbox flex-justify">
                                CPU Usage
                                <Tippy className="default-tt" arrow={false} placement="bottom" content="Fullscreen">
                                    <div className="flex">
                                        <Fullscreen
                                            className="icon-dim-16 cursor fcn-5"
                                            onClick={(e) => {
                                                setChartName(ChartType.Cpu)
                                            }}
                                        />
                                    </div>
                                </Tippy>
                            </div>
                            <iframe title={ChartType.Cpu} src={graphs.cpu} className="app-metrics-graph__iframe" />
                        </div>
                        <div data-testid="app-metrics-memory-usage" className="app-metrics-graph chart">
                            <div className="app-metrics-graph__title flexbox flex-justify">
                                Memory Usage
                                <Tippy className="default-tt" arrow={false} placement="bottom" content="Fullscreen">
                                    <div className="flex">
                                        <Fullscreen
                                            className="icon-dim-16 cursor fcn-5"
                                            onClick={(e) => {
                                                setChartName(ChartType.Ram)
                                            }}
                                        />
                                    </div>
                                </Tippy>
                            </div>
                            <iframe title={ChartType.Ram} src={graphs.ram} className="app-metrics-graph__iframe" />
                        </div>
                    </>
                ) : (
                    <PrometheusError />
                )}
                {appMetrics ? (
                    <>
                        <div data-testid="app-metrics-throughput" className="app-metrics-graph chart">
                            <div className="flexbox flex-justify">
                                <h3 className="app-details-graph__title flexbox m-0">
                                    <ThroughputSelect status={statusCode} handleStatusChange={handleStatusChange} />
                                </h3>
                                <Tippy className="default-tt" arrow={false} placement="bottom" content="Fullscreen">
                                    <div className="flex">
                                        <Fullscreen
                                            className="icon-dim-16 cursor fcn-5"
                                            onClick={(e) => {
                                                setChartName(ChartType.Status)
                                            }}
                                        />
                                    </div>
                                </Tippy>
                            </div>
                            <iframe
                                title={StatusType.Throughput}
                                src={graphs.throughput}
                                className="app-metrics-graph__iframe"
                            />
                        </div>
                        <div data-testid="app-metrics-latency" className="app-metrics-graph chart">
                            <div className="app-metrics-graph__title flexbox flex-justify">
                                <div className="flexbox">
                                    <h3 className="app-details-graph__title flexbox m-0 pr-4">Latency</h3>
                                    <h3 className="app-details-graph__title flexbox m-0">
                                        <LatencySelect
                                            latency={selectedLatency}
                                            handleLatencyChange={handleLatencyChange}
                                        />
                                    </h3>
                                </div>
                                <Tippy className="default-tt" arrow={false} placement="bottom" content="Fullscreen">
                                    <div className="flex">
                                        <Fullscreen
                                            className="icon-dim-16 cursor fcn-5"
                                            onClick={(e) => {
                                                setChartName(ChartType.Latency)
                                            }}
                                        />
                                    </div>
                                </Tippy>
                            </div>
                            <iframe
                                title={ChartType.Latency}
                                src={graphs.latency}
                                className="app-metrics-graph__iframe"
                            />
                        </div>
                    </>
                ) : (
                    <EnableAppMetrics />
                )}
            </div>
        </section>
    )
}

const PrometheusError = () => {
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
    )
}

const EnableAppMetrics = () => {
    const { appId } = useParams<AppDetailsPathParams>()
    const LINK = getAppComposeURL(appId, APP_COMPOSE_STAGE.DEPLOYMENT_TEMPLATE)
    return (
        <div
            data-testid="app-metrices-not-enabled"
            className="flex column br-4"
            style={{ gridColumn: '3 / span 2', background: 'var(--window-bg)' }}
        >
            <b className="mb-12 fs-12 fw-6 cn-9">Throughput & Latency</b>
            <span className="mb-12 fs-12 cn-7" style={{ width: '200px' }}>
                Enable application metrics to view trends for status codes and latency.
            </span>
            <Link to={`${LINK}/${appId}#opt-metrics`} className="anchor">
                Go to configurations
            </Link>
        </div>
    )
}

const MonitoringModuleNotInstalled = ({ addSpace }: { addSpace: string }) => {
    return (
        <div
            data-testid="app-metrices-wrapper"
            className={`app-metrics-graph__empty-state-wrapper bcv-1 w-100 pt-18 pb-18 pl-20 pr-20 ${addSpace}`}
        >
            <div className="flex left w-100 lh-20">
                <span className="fs-14 fw-6 cv-5 flex left mr-16">
                    <GraphIcon className="mr-8 fcv-5 icon-dim-20" />
                    MONITORING
                </span>
                <div className="fw-4 fs-13 cn-7 flexbox">
                    View metrics like CPU, memory, status codes 2xx, 3xx, 5xx; throughput and latency for this
                    app.&nbsp;
                    <NavLink
                        to={`${URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS}?id=${ModuleNameMap.GRAFANA}`}
                        className="cb-5 fs-13 fw-6 anchor w-auto dc__no-decor flex"
                        target="_blank"
                    >
                        Learn more &nbsp;
                        <OpenInNew />
                    </NavLink>
                </div>
            </div>
        </div>
    )
}

const AppMetricsEmptyState = ({ isLoading, isConfigured, isHealthy, hostURLConfig }) => {
    const [collapsed, toggleCollapsed] = useState<boolean>(true)

    const toggleHeader = () => {
        toggleCollapsed(not)
    }

    let subtitle = ''
    if (!isConfigured) {
        subtitle =
            'We could not connect to prometheus endpoint. Please configure data source and try reloading this page.'
    } else if (!isHealthy) {
        subtitle =
            'Datasource configuration is incorrect or prometheus is not healthy. Please review configuration and try reloading this page.'
    }
    return (
        <div className="app-metrics-graph__empty-state-wrapper bcn-0 w-100 pt-18 pb-18 pl-20 pr-20 cursor">
            <div onClick={toggleHeader} className="flex left w-100 lh-20">
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
                                        className="dc__link cta small text pl-0"
                                        href={DOCUMENTATION.GLOBAL_CONFIG_CLUSTER}
                                        target="_blank"
                                        style={{ paddingLeft: '0' }}
                                        rel="noreferrer"
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
