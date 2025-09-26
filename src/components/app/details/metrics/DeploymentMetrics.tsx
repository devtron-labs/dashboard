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

import { useEffect, useMemo, useState } from 'react'
import ReactGA from 'react-ga4'
import { generatePath, useHistory, useParams, useRouteMatch } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import moment from 'moment'

import {
    Chart,
    ChartColorKey,
    ChartProps,
    EMPTY_STATE_STATUS,
    ErrorScreenManager,
    GenericEmptyState,
    Progressing,
    SelectPicker,
    showError,
    URLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Success } from '@Icons/appstatus/healthy.svg'
import { ReactComponent as Fail } from '@Icons/ic-error-exclamation.svg'
import { ReactComponent as ICHelpOutline } from '@Icons/ic-help-outline.svg'
import { ReactComponent as Deploy } from '@Icons/ic-nav-rocket.svg'
import AppNotDeployed from '@Images/app-not-deployed.svg'
import SelectEnvImage from '@Images/ic-empty-dep-metrics@2x.png'

import { ViewType } from '../../../../config'
import { getAppOtherEnvironmentMin } from '../../../../services/service'
import { DatePicker, useAppContext } from '../../../common'
import { BenchmarkModal } from './BenchmarkModal'
import { getDeploymentMetrics } from './deploymentMetrics.service'
import {
    DeploymentMetricsProps,
    DeploymentMetricsState,
    FrequencyGraphLegendProps,
    RecoveryAndLeadTimeGraphLegendProps,
} from './deploymentMetrics.types'
import {
    BenchmarkLine,
    EliteCategoryMessage,
    FailureLegendEmptyState,
    getGALabel,
    ReferenceLineLegend,
    renderCategoryTag,
} from './deploymentMetrics.util'
import { DeploymentTable } from './DeploymentTable'
import { DeploymentTableModal } from './DeploymentTableModal'

import './deploymentMetrics.scss'

const FrequencyGraphLegend = ({
    noFailures,
    frequency,
    failureRate,
    frequencyBenchmark,
    failureRateBenchmark,
    setFrequencyMetric,
    setFailureMetric,
}: FrequencyGraphLegendProps) => (
    <div className="graph-legend">
        <div className="w-50 dc__inline-block">
            <p className="graph-legend__primary-label">
                Deployment Frequency
                <Tippy className="default-tt" arrow={false} content="How often this app is deployed to production?">
                    <span>
                        <ICHelpOutline className="icon-dim-20 ml-8 dc__vertical-align-middle mr-5" />
                    </span>
                </Tippy>
                <span className="cursor" onClick={setFrequencyMetric}>
                    {renderCategoryTag(frequencyBenchmark.name)}{' '}
                </span>
            </p>
            <p className="graph-legend__primary-value">
                <span className="mr-10">{frequency}</span>
                <ReferenceLineLegend />
            </p>
            {failureRateBenchmark?.targetName === 'ELITE' ? (
                <EliteCategoryMessage onClick={setFrequencyMetric} />
            ) : (
                <div className="cursor" onClick={setFrequencyMetric}>
                    <p className="graph-legend__secondary-label">
                        {frequencyBenchmark?.targetName} (Target Benchmark)
                        <span className="mr-5" />
                        <BenchmarkLine category={frequencyBenchmark.targetName} />
                    </p>
                    <p className="graph-legend__secondary-value">{frequencyBenchmark?.targetValue} / day</p>
                </div>
            )}
        </div>
        <div className="w-50 dc__inline-block" style={{ verticalAlign: 'top' }}>
            {!noFailures ? (
                <>
                    <p className="graph-legend__primary-label">
                        Change Failure Rate
                        <Tippy className="default-tt" arrow={false} content="How often does the pipeline fail?">
                            <span>
                                <ICHelpOutline className="icon-dim-20 ml-8 dc__vertical-align-middle mr-5" />
                            </span>
                        </Tippy>
                        <span className="cursor" onClick={setFailureMetric}>
                            {renderCategoryTag(failureRateBenchmark?.name)}{' '}
                        </span>
                    </p>
                    <p className="graph-legend__primary-value">{failureRate}</p>
                    {failureRateBenchmark?.name !== 'ELITE' ? (
                        <div className="cursor" onClick={setFailureMetric}>
                            <p className="graph-legend__secondary-label">
                                {failureRateBenchmark?.targetName} (Target Benchmark)
                            </p>
                            <p className="graph-legend__secondary-value">{failureRateBenchmark?.targetValue}%</p>
                        </div>
                    ) : (
                        <EliteCategoryMessage onClick={setFailureMetric} />
                    )}
                </>
            ) : (
                <FailureLegendEmptyState />
            )}
        </div>
    </div>
)

const RecoveryAndLeadTimeGraphLegend = ({
    noFailures,
    valueLabel,
    label,
    tooltipText,
    benchmark,
    setMetric,
}: RecoveryAndLeadTimeGraphLegendProps) => {
    if (noFailures) {
        return (
            <div className="graph-legend">
                <p className="graph-legend__primary-label">
                    {label}
                    <Tippy className="default-tt" arrow={false} content={tooltipText}>
                        <span>
                            <ICHelpOutline className="icon-dim-20 ml-8 dc__vertical-align-middle mr-5" />
                        </span>
                    </Tippy>
                </p>
                <p className="graph-legend__primary-value">
                    <ReferenceLineLegend />
                </p>
                <p className="graph-legend__secondary-label">No recoveries were required during this period.</p>
            </div>
        )
    }

    return (
        <div className="graph-legend">
            <p className="graph-legend__primary-label">
                {label}
                <Tippy className="default-tt" arrow={false} content={tooltipText}>
                    <span>
                        <ICHelpOutline className="icon-dim-20 ml-8 dc__vertical-align-middle mr-5" />
                    </span>
                </Tippy>
                <span className="cursor" onClick={setMetric}>
                    {renderCategoryTag(benchmark?.name)}{' '}
                </span>
            </p>
            <p className="graph-legend__primary-value">
                <span className="mr-10">{valueLabel}</span>
                <ReferenceLineLegend />
            </p>
            {benchmark?.name !== 'ELITE' ? (
                <div className="cursor" onClick={setMetric}>
                    <p className="graph-legend__secondary-label">
                        {benchmark?.targetName} (Target Benchmark)
                        <span className="mr-5" />
                        <BenchmarkLine category={benchmark.targetName} />
                    </p>
                    <p className="graph-legend__secondary-value">{benchmark?.targetLabel}</p>
                </div>
            ) : (
                <EliteCategoryMessage className="cursor" onClick={setMetric} />
            )}
        </div>
    )
}

const DeploymentMetricsComponent = ({ filteredEnvIds }: DeploymentMetricsProps) => {
    const { appId, envId } = useParams<{ appId: string; envId: string }>()

    const history = useHistory()

    const [state, setState] = useState<DeploymentMetricsState>({
        code: 0,
        view: ViewType.LOADING,
        environments: [],
        frequencyAndLeadTimeGraph: [],
        recoveryTimeGraph: [],
        rows: [],
        avgFrequency: 0,
        totalDeployments: 0,
        failedDeployments: 0,
        failureRateBenchmark: undefined,
        frequencyBenchmark: undefined,
        failureRate: 0,
        meanLeadTime: 0,
        meanRecoveryTime: 0,
        benchmarkModalData: undefined,
        startDate: moment().set({ hour: 0, minute: 0, seconds: 0 }).subtract(6, 'months'),
        endDate: moment().set({ hour: 23, minute: 59, seconds: 59, milliseconds: 999 }),
        focusedInput: null,
        meanLeadTimeLabel: '',
        leadTimeBenchmark: undefined,
        meanRecoveryTimeLabel: '',
        recoveryTimeBenchmark: undefined,
        maxFrequency: 0,
        statusFilter: -1,
        filterBy: {
            startDate: undefined,
            endDate: undefined,
        },
        deploymentTableView: ViewType.FORM,
    })

    const callGetDeploymentMetricsAPI = () => {
        if (!state.startDate?.isValid() || !state.endDate?.isValid()) {
            return
        }
        const startTime = state.startDate.format('YYYY-MM-DDTHH:mm:ss.SSS')
        const endTime = state.endDate.format('YYYY-MM-DDTHH:mm:ss.SSS')
        setState((prev) => ({ ...prev, view: ViewType.LOADING }))
        getDeploymentMetrics(startTime, endTime, appId, envId)
            .then((metricsResponse) => {
                setState((prev) => ({
                    ...prev,
                    view: ViewType.FORM,
                    ...metricsResponse.result,
                }))
            })
            .catch((error) => {
                showError(error)
                setState((prev) => ({ ...prev, code: error.code, view: ViewType.ERROR }))
            })
    }

    const callGetAppOtherEnv = () => {
        setState((prev) => ({ ...prev, view: ViewType.LOADING, selectedEnvironment: undefined }))
        getAppOtherEnvironmentMin(appId, false)
            .then((envResponse) => {
                const filteredEnvMap = filteredEnvIds?.split(',').reduce((agg, curr) => agg.set(+curr, true), new Map())
                const allEnv =
                    envResponse.result
                        ?.filter(
                            (env) =>
                                env.prod &&
                                !env.deploymentAppDeleteRequest &&
                                (!filteredEnvMap || filteredEnvMap.get(env.environmentId)),
                        )
                        .map((env) => ({
                            label: env.environmentName,
                            value: env.environmentId,
                            deploymentAppDeleteRequest: env.deploymentAppDeleteRequest,
                        })) || []
                setState((prev) => ({
                    ...prev,
                    view: ViewType.FORM,
                    selectedEnvironment: allEnv.find((env) => String(env.value) === envId),
                    environments: allEnv,
                }))
            })
            .catch((error) => {
                showError(error)
                setState((prev) => ({ ...prev, code: error.code, view: ViewType.ERROR }))
            })
    }

    useEffect(() => {
        ReactGA.event({
            category: 'Deployment Metrics',
            action: 'First Land',
            label: '',
        })
    }, [])

    useEffect(() => {
        callGetAppOtherEnv()
    }, [appId, filteredEnvIds])

    useEffect(() => {
        if (envId) {
            callGetDeploymentMetricsAPI()
        }
    }, [envId, appId, state.startDate, state.endDate])

    const selectedEnvironment = useMemo(
        () => state.environments?.find((env) => String(env.value) === envId) ?? null,
        [envId, state.environments],
    )

    const closeDeploymentTableModal = (): void => {
        setState((prev) => ({
            ...prev,
            filterBy: {
                startDate: undefined,
                endDate: undefined,
            },
        }))
    }

    const handleEnvironmentChange = (selected): void => {
        const URL = `${URLS.APPLICATION_MANAGEMENT_APP}/${appId}/deployment-metrics/${selected.value}`
        history.push(URL)
        ReactGA.event({
            category: 'Deployment Metrics',
            action: 'Environment Selection Changed',
            label: '',
        })
    }

    const handleDatesChange = ({ startDate: newStartDate, endDate: newEndDate }): void => {
        setState((prev) => ({
            ...prev,
            startDate: newStartDate?.set({ hour: 0, minute: 0, seconds: 0 }),
            endDate: newEndDate?.set({ hour: 23, minute: 59, seconds: 59, milliseconds: 999 }),
        }))
    }

    const handleFocusChange = (focusedInput): void => {
        setState((prev) => ({ ...prev, focusedInput }))
    }

    const handleTableFilter = (event): void => {
        ReactGA.event({
            category: 'Deployment Metrics',
            action: 'Deployment Status Filter Clicked',
            label: getGALabel(event.target.value),
        })
        setState((prev) => ({
            ...prev,
            statusFilter: Number(event.target.value),
            deploymentTableView: ViewType.LOADING,
        }))
        setTimeout(() => {
            setState((prev) => ({ ...prev, deploymentTableView: ViewType.FORM }))
        }, 500)
    }

    const freqData = state.frequencyAndLeadTimeGraph
    const freqGraphXAxisLabels = useMemo(() => freqData.map((d) => d.xAxisLabel), [freqData])

    const freqGraphDatasets: (ChartProps & { type: 'stackedBar' })['datasets'] = useMemo(
        () => [
            {
                datasetName: 'Failures',
                yAxisValues: freqData.map((d) => d.failures ?? 0),
                color: 'CoralRed300' as ChartColorKey,
                isClickable: true,
            },
            {
                datasetName: 'Success',
                yAxisValues: freqData.map((d) => d.success ?? 0),
                color: 'LimeGreen300' as ChartColorKey,
                isClickable: true,
            },
        ],
        [JSON.stringify(freqData)],
    )

    const freqGraphReferenceLines = useMemo(
        () => [
            ...(state.frequencyBenchmark
                ? [
                      {
                          value: state.frequencyBenchmark.targetValue,
                          color: state.frequencyBenchmark.color as ChartColorKey,
                      },
                  ]
                : []),
            { value: state.avgFrequency },
        ],
        [state.frequencyBenchmark, state.avgFrequency],
    )

    // Lead Time Graph memoized values
    const leadTimeData = state.frequencyAndLeadTimeGraph
    const leadTimeGraphXAxisLabels = useMemo(() => leadTimeData.map((d) => d.xAxisLabel), [leadTimeData])

    const leadTimeGraphDatasets: (ChartProps & { type: 'stackedBar' })['datasets'] = useMemo(
        () => [
            {
                datasetName: 'Max Lead Time',
                yAxisValues: leadTimeData.map((d) => d.maxLeadTime ?? 0),
                color: 'SkyBlue300' as ChartColorKey,
                isClickable: true,
            },
        ],
        [leadTimeData],
    )

    const leadTimeGraphReferenceLines = useMemo(
        () => [
            ...(state.leadTimeBenchmark
                ? [
                      {
                          value: state.leadTimeBenchmark.targetValue,
                          color: state.leadTimeBenchmark.color as ChartColorKey,
                      },
                  ]
                : []),
            { value: state.meanLeadTime },
        ],
        [state.leadTimeBenchmark, state.meanLeadTime],
    )

    // Recovery Time Graph memoized values
    const recoveryTimeData = state.recoveryTimeGraph
    const recoveryTimeGraphXAxisLabels = useMemo(
        () => recoveryTimeData.map((d) => d.xAxisLabel ?? ''),
        [recoveryTimeData],
    )

    const recoveryTimeGraphDatasets: (ChartProps & { type: 'stackedBar' })['datasets'] = useMemo(
        () => [
            {
                datasetName: 'Recovery Time for Failed Deployments',
                yAxisValues: recoveryTimeData.map((d) => d.recoveryTime ?? 0),
                color: 'GoldenYellow300' as ChartColorKey,
                isClickable: true,
            },
        ],
        [recoveryTimeData],
    )

    const recoveryTimeGraphReferenceLines = useMemo(
        () => [
            ...(state.recoveryTimeBenchmark
                ? [
                      {
                          value: state.recoveryTimeBenchmark.targetValue,
                          color: state.recoveryTimeBenchmark.color as ChartColorKey,
                      },
                  ]
                : []),
            { value: state.meanRecoveryTime },
        ],
        [state.recoveryTimeBenchmark, state.meanRecoveryTime],
    )

    const onEnvironmentChange = (selected) => {
        handleEnvironmentChange(selected)
    }

    const renderInputs = () => (
        <div className="deployment-metrics__inputs bg__primary">
            <div className="w-180" data-testid="select-environment">
                <SelectPicker
                    inputId="deployment-metrics-select-environment"
                    name="deployment-metrics-select-environment"
                    classNamePrefix="deployment-metrics-select-environment"
                    value={selectedEnvironment}
                    placeholder="Select Environment"
                    onChange={onEnvironmentChange}
                    options={state.environments}
                />
            </div>
            <div className="dc__align-right ">
                {selectedEnvironment ? (
                    <DatePicker
                        startDate={state.startDate}
                        endDate={state.endDate}
                        focusedInput={state.focusedInput}
                        handleDatesChange={handleDatesChange}
                        handleFocusChange={handleFocusChange}
                    />
                ) : null}
            </div>
        </div>
    )

    const onDeploymentFrequencyChartClick = (_: string, index: number): void => {
        const d = freqData[index]
        if (!d) return
        setState((prev) => ({
            ...prev,
            filterBy: {
                startDate: moment(d.startTime),
                endDate: moment(d.endTime),
            },
        }))
    }

    const renderDeploymentFrequencyChart = () => (
        <div className="flex dc__no-shrink">
            <Chart
                id="deployment-frequency"
                type="stackedBar"
                xAxisLabels={freqGraphXAxisLabels}
                hideXAxisLabels
                datasets={freqGraphDatasets}
                referenceLines={freqGraphReferenceLines}
                onChartClick={onDeploymentFrequencyChartClick}
            />
        </div>
    )

    const onRecoveryAndLeadTimeChartClick = (_: string, index: number): void => {
        const d = leadTimeData[index]
        if (!d) return
        setState((prev) => ({
            ...prev,
            filterBy: {
                startDate: moment(d.startTime),
                endDate: moment(d.endTime),
            },
        }))
    }

    const renderRecoveryAndLeadTimeGraph = () => (
        <div className="flex dc__no-shrink">
            <Chart
                id="mean-lead-time"
                type="stackedBar"
                xAxisLabels={leadTimeGraphXAxisLabels}
                hideXAxisLabels
                datasets={leadTimeGraphDatasets}
                referenceLines={leadTimeGraphReferenceLines}
                onChartClick={onRecoveryAndLeadTimeChartClick}
            />
        </div>
    )

    const onMeanTimeToRecoveryChartClick = (_: string, index: number): void => {
        const d = recoveryTimeData[index]
        if (!d) return
        // NOTE: startDate, and endDate [releaseTime-2, releaseTime+2]
        setState((prev) => ({
            ...prev,
            filterBy: {
                startDate: d.releaseTime ? moment(d.releaseTime) : undefined,
                endDate: d.releaseTime ? moment(d.releaseTime).add(2, 'seconds') : undefined,
            },
        }))
    }

    const renderMeanTimeToRecoveryChart = () => (
        <div className="flex dc__no-shrink">
            <Chart
                id="mean-time-to-recovery"
                type="stackedBar"
                xAxisLabels={recoveryTimeGraphXAxisLabels}
                hideXAxisLabels
                datasets={recoveryTimeGraphDatasets}
                referenceLines={recoveryTimeGraphReferenceLines}
                onChartClick={onMeanTimeToRecoveryChartClick}
            />
        </div>
    )

    const setFrequencyMetric = () => {
        ReactGA.event({
            category: 'Deployment Metrics',
            action: 'Graph Bar Clicked',
            label: 'Deployment Frequency',
        })
        setState((prev) => ({
            ...prev,
            benchmarkModalData: {
                metric: 'DEPLOYMENT_FREQUENCY',
                valueLabel: `${state.avgFrequency} /day`,
                catgory: state.frequencyBenchmark.name,
                value: state.avgFrequency,
            },
        }))
    }

    const setFailureMetric = () => {
        setState((prev) => ({
            ...prev,
            benchmarkModalData: {
                metric: 'FAILURE_RATE',
                valueLabel: `${state.failureRate} %`,
                catgory: state.failureRateBenchmark.name,
                value: state.failureRate,
            },
        }))
    }

    const setMeanLeadTimeMetric = () => {
        ReactGA.event({
            category: 'Deployment Metrics',
            action: 'Graph Bar Clicked',
            label: 'Mean Lead Time',
        })
        setState((prev) => ({
            ...prev,
            benchmarkModalData: {
                metric: 'LEAD_TIME',
                valueLabel: `${state.meanLeadTimeLabel}`,
                catgory: state.leadTimeBenchmark.name,
                value: state.meanLeadTime,
            },
        }))
    }

    const setRecoveryAndLeadTimeGraphMetric = () => {
        ReactGA.event({
            category: 'Deployment Metrics',
            action: 'Graph Bar Clicked',
            label: 'Mean Time To Recovery',
        })
        setState((prev) => ({
            ...prev,
            benchmarkModalData: {
                metric: 'RECOVERY_TIME',
                valueLabel: `${state.meanRecoveryTimeLabel}`,
                catgory: state.recoveryTimeBenchmark.name,
                value: state.meanRecoveryTime,
            },
        }))
    }
    const renderGraphs = () => (
        <>
            {renderInputs()}
            <div className="deployment-metrics__graphs dc__gap-12">
                <div className="deployment-metrics__frequency-graph dc__grid">
                    <div className="mb-12">
                        <FrequencyGraphLegend
                            noFailures={state.recoveryTimeGraph.length === 0}
                            label="Deployment Frequency"
                            frequencyBenchmark={state.frequencyBenchmark}
                            failureRateBenchmark={state.failureRateBenchmark}
                            frequency={`${state.avgFrequency} / day`}
                            failureRate={`${state.failureRate} %`}
                            setFrequencyMetric={setFrequencyMetric}
                            setFailureMetric={setFailureMetric}
                        />
                    </div>
                    {renderDeploymentFrequencyChart()}
                </div>
                <div className="deployment-metrics__lead-graph dc__grid">
                    <div className="mb-12">
                        <RecoveryAndLeadTimeGraphLegend
                            noFailures={false}
                            label="Mean Lead Time"
                            benchmark={state.leadTimeBenchmark}
                            tooltipText="How long it takes to deliver a change to production?"
                            valueLabel={`${state.meanLeadTimeLabel}`}
                            setMetric={setMeanLeadTimeMetric}
                        />
                    </div>
                    {renderRecoveryAndLeadTimeGraph()}
                </div>
                <div className="deployment-metrics__recovery-graph dc__grid">
                    <div className="mb-12">
                        <RecoveryAndLeadTimeGraphLegend
                            noFailures={state.recoveryTimeGraph.length === 0}
                            label="Mean Time to Recovery"
                            setMetric={setRecoveryAndLeadTimeGraphMetric}
                            benchmark={state.recoveryTimeBenchmark}
                            tooltipText="How long does it take to fix a failed pipeline?"
                            valueLabel={`${state.meanRecoveryTimeLabel}`}
                        />
                    </div>
                    {renderMeanTimeToRecoveryChart()}
                </div>
            </div>
        </>
    )

    const renderEmptyState = () => {
        const env = state.environments.find((e) => e.value === Number(envId))
        const envName = env ? env.label : ''
        return (
            <div className="flexbox-col flex-grow-1">
                {renderInputs()}
                <div className="dc__position-rel bg__primary flex-grow-1">
                    <GenericEmptyState
                        image={AppNotDeployed}
                        title={EMPTY_STATE_STATUS.RENDER_EMPTY_STATE.TITILE}
                        subTitle={`There are no deployments in this period on '${envName}'.`}
                    />
                </div>
            </div>
        )
    }

    const renderNoEnvironmentView = () => (
        <div className="flex-grow-1">
            <GenericEmptyState
                image={SelectEnvImage}
                title={EMPTY_STATE_STATUS.RENDER_NO_ENVIORNMENT_STATE.TITLE}
                subTitle={EMPTY_STATE_STATUS.RENDER_NO_ENVIORNMENT_STATE.SUBTITLE}
            />
        </div>
    )

    const renderSelectEnvironmentView = () => (
        <div className="flexbox-col flex-grow-1">
            {renderInputs()}
            <div className="dc__position-rel flex-grow-1 bg__primary">
                <GenericEmptyState
                    image={SelectEnvImage}
                    title={EMPTY_STATE_STATUS.RENDER_SELECT_ENVIRONMENT_VIEW.TITLE}
                    subTitle={EMPTY_STATE_STATUS.RENDER_SELECT_ENVIRONMENT_VIEW.SUBTITLE}
                />
            </div>
        </div>
    )

    const renderModal = () => {
        if (state.filterBy.startDate && state.filterBy.endDate) {
            const filteredRows = state.rows.filter(
                (deployment) =>
                    deployment.releaseTime.value >= state.filterBy.startDate.valueOf() &&
                    deployment.releaseTime.value < state.filterBy.endDate.valueOf(),
            )
            return <DeploymentTableModal rows={filteredRows} close={closeDeploymentTableModal} />
        }
        return null
    }

    const renderBenchmarkModal = () => {
        if (state.benchmarkModalData) {
            return (
                <BenchmarkModal
                    valueLabel={state.benchmarkModalData.valueLabel}
                    value={state.benchmarkModalData.value}
                    metric={state.benchmarkModalData.metric}
                    category={state.benchmarkModalData.catgory}
                    close={() => {
                        setState((prev) => ({ ...prev, benchmarkModalData: undefined }))
                    }}
                />
            )
        }
        return null
    }

    if (state.view === ViewType.LOADING) {
        return (
            <div className="flex-grow-1">
                <Progressing pageLoader />
            </div>
        )
    }
    if (state.view === ViewType.ERROR) {
        return <ErrorScreenManager code={state.code} />
    }
    if (state.view === ViewType.FORM && state.environments.length === 0) {
        return renderNoEnvironmentView()
    }
    if (state.view === ViewType.FORM && (!envId || !(state.environments ?? []).find((env) => env.value === +envId))) {
        return renderSelectEnvironmentView()
    }
    if (state.view === ViewType.FORM && state.frequencyAndLeadTimeGraph.length === 0) {
        return renderEmptyState()
    }

    const deploymentTableRows =
        state.statusFilter > -1 ? state.rows.filter((row) => row.releaseStatus === state.statusFilter) : state.rows

    return (
        <div>
            {renderGraphs()}
            <div className="deployment-metrics__body">
                <div className="deployment-table__header mb-16">
                    <p className="deployment-table__title m-0">
                        <Deploy className="icon-dim-20 dc__vertical-align-middle mr-5 scn-7 fcn-7" />
                        Deployments
                    </p>
                    <div className="flex right">
                        <label className="dc__tertiary-tab__radio" htmlFor="status-all">
                            <input
                                id="status-all"
                                type="radio"
                                name="status"
                                checked={state.statusFilter === -1}
                                value={-1}
                                onClick={handleTableFilter}
                            />
                            <span className="dc__tertiary-tab">All ({state.totalDeployments})</span>
                        </label>
                        <label
                            className="dc__tertiary-tab__radio"
                            data-testid="success-deployment-status"
                            htmlFor="status-success"
                        >
                            <input
                                id="status-success"
                                type="radio"
                                name="status"
                                checked={state.statusFilter === 0}
                                value={0}
                                onClick={handleTableFilter}
                            />
                            <span className="dc__tertiary-tab">
                                <Success className="icon-dim-16 dc__vertical-align-middle mr-4" />
                                Success ({state.totalDeployments - state.failedDeployments})
                            </span>
                        </label>
                        <label
                            className="dc__tertiary-tab__radio"
                            data-testid="failed-deployment-status"
                            htmlFor="status-failed"
                        >
                            <input
                                id="status-failed"
                                type="radio"
                                name="status"
                                checked={state.statusFilter === 1}
                                value={1}
                                onClick={handleTableFilter}
                            />
                            <span className="dc__tertiary-tab">
                                <Fail className="icon-dim-16 dc__vertical-align-middle mr-4" />
                                Failed ({state.failedDeployments})
                            </span>
                        </label>
                    </div>
                </div>
                <DeploymentTable rows={deploymentTableRows} deploymentTableView={state.deploymentTableView} />
            </div>
            {renderModal()}
            {renderBenchmarkModal()}
        </div>
    )
}

const DeploymentMetrics = (props: DeploymentMetricsProps) => {
    const { appId, envId } = useParams<{ appId: string; envId: string }>()
    const { environmentId, setEnvironmentId } = useAppContext()
    const { path } = useRouteMatch()
    const { replace } = useHistory()

    useEffect(() => {
        if (envId && +envId !== environmentId) {
            setEnvironmentId(+envId)
        }
        if (!envId && environmentId) {
            replace(generatePath(path, { appId, envId: environmentId }))
        }
    }, [envId])

    return <DeploymentMetricsComponent {...props} />
}

export default DeploymentMetrics
