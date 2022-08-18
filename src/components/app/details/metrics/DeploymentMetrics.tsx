import React, { Component } from 'react'
import { getDeploymentMetrics } from './deploymentMetrics.service';
import { DatePicker, ErrorScreenManager, Progressing, showError } from '../../../common';
import { ViewType } from '../../../../config';
import { RouteComponentProps, generatePath } from 'react-router';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Label, ReferenceLine } from 'recharts';
import { DeploymentTable } from './DeploymentTable';
import { getAppOtherEnvironment } from '../../../../services/service';
import { DeploymentTableModal } from './DeploymentTableModal';
import { BenchmarkModal } from './BenchmarkModal';
import moment, { Moment } from 'moment';
import { DropdownIndicator, styles, BenchmarkLine, frequencyXAxisLabel, leadTimeXAxisLabel, recoveryTimeLabel, ReferenceLineLegend, renderCategoryTag, FrequencyTooltip, RecoveryTimeTooltip, LeadTimeTooltip, EliteCategoryMessage, FailureLegendEmptyState } from './deploymentMetrics.util';
import ReactSelect from 'react-select';
import { Option } from '../../../v2/common/ReactSelect.utils';
import EmptyState from '../../../EmptyState/EmptyState'
import AppNotDeployed from '../../../../assets/img/app-not-deployed.png';
import SelectEnvImage from '../../../../assets/img/ic-empty-dep-metrics@2x.png';
import Tippy from '@tippyjs/react';
import { ReactComponent as Help } from '../../../../assets/icons/ic-help-outline.svg';
import { ReactComponent as Deploy } from '../../../../assets/icons/ic-deploy.svg';
import { ReactComponent as Success } from '../../../../assets/icons/appstatus/healthy.svg';
import { ReactComponent as Fail } from '../../../../assets/icons/ic-error-exclamation.svg';
import ReactGA from 'react-ga';
import './deploymentMetrics.css';

interface DeploymentMetricsProps extends RouteComponentProps<{ appId: string; envId: string; }> {

}

interface DeploymentMetricsState {
    code: number;
    view: string;
    //used by ReactSelect Menu
    selectedEnvironment: undefined | { label: string; value: number; };
    environments: Array<{ label: string; value: number; }>;
    frequencyAndLeadTimeGraph: {
        startTime: number;
        endTime: number;
        frequency: number;
        failures: number;
        success: number;
        maxLeadTime: number;
        xAxisLabel: string;
    }[];
    recoveryTimeGraph: { recoveryTime: number }[]
    rows: any[],
    avgFrequency: number;
    maxFrequency: number;
    totalDeployments: number;
    failedDeployments: number;
    frequencyBenchmark: any;

    failureRate: number;
    failureRateBenchmark: any;

    meanLeadTime: number;
    meanLeadTimeLabel: string;
    leadTimeBenchmark: any;

    meanRecoveryTime: number;
    meanRecoveryTimeLabel: string;
    recoveryTimeBenchmark: any;

    statusFilter: number;

    benchmarkModalData: {
        metric: "DEPLOYMENT_FREQUENCY" | "LEAD_TIME" | "RECOVERY_TIME" | "FAILURE_RATE";
        valueLabel: string;
        catgory: string;
        value: number;
    } | undefined;

    startDate: Moment;
    endDate: Moment;
    focusedInput: any;
    filterBy: {
        startDate: undefined | Moment;
        endDate: undefined | Moment;
    };
    deploymentTableView: string;
}
export default class DeploymentMetrics extends Component<DeploymentMetricsProps, DeploymentMetricsState> {

    constructor(props) {
        super(props);

        this.state = {
            code: 0,
            view: ViewType.LOADING,
            //used by ReactSelect Menu
            selectedEnvironment: undefined,
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
            startDate: moment().set({ "hour": 0, "minute": 0, "seconds": 0 }).subtract(6, 'months'),
            endDate: moment().set({ "hour": 23, "minute": 59, "seconds": 59, "milliseconds": 999 }),
            focusedInput: null,
            meanLeadTimeLabel: "",
            leadTimeBenchmark: undefined,
            meanRecoveryTimeLabel: "",
            recoveryTimeBenchmark: undefined,
            maxFrequency: 0,
            statusFilter: -1,
            filterBy: {
                startDate: undefined,
                endDate: undefined,
            },
            deploymentTableView: ViewType.FORM,
        }
        this.handleDatesChange = this.handleDatesChange.bind(this);
        this.handleFocusChange = this.handleFocusChange.bind(this);
        this.handleTableFilter = this.handleTableFilter.bind(this);
        this.closeDeploymentTableModal = this.closeDeploymentTableModal.bind(this);
    }

    componentDidMount() {
        this.callGetAppOtherEnv(undefined);
        ReactGA.event({
            category: 'Deployment Metrics',
            action: 'First Land',
            label: '',
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.match.params.appId !== this.props.match.params.appId) {
            this.setState({ view: ViewType.LOADING, selectedEnvironment: undefined });
            this.callGetAppOtherEnv(prevProps.match.params.envId);
        }
        if (this.props.match.params.envId && prevProps.match.params.envId !== this.props.match.params.envId) {
            this.setState({ view: ViewType.LOADING });
            this.callGetDeploymentMetricsAPI(this.props.match.params.appId, this.props.match.params.envId)
        }
        if ((!prevState.startDate && this.state.startDate) || (!prevState.endDate && this.state.endDate) || (prevState.startDate?.valueOf() !== this.state.startDate?.valueOf()) || (prevState.endDate?.valueOf() !== this.state.endDate?.valueOf())) {
            this.callGetDeploymentMetricsAPI(this.props.match.params.appId, this.props.match.params.envId)
        }
    }

    callGetDeploymentMetricsAPI(appId, envId) {
        if (!this.state.startDate?.isValid() || !this.state.endDate?.isValid()) return;
        let startTime = this.state.startDate.format("YYYY-MM-DDTHH:mm:ss.SSS");
        let endTime = this.state.endDate.format("YYYY-MM-DDTHH:mm:ss.SSS");
        getDeploymentMetrics(startTime, endTime, appId, envId).then((metricsResponse) => {
            let selectedEnvironment = this.state.environments.find(env => String(env.value) === this.props.match.params.envId);
            this.setState({
                view: ViewType.FORM,
                selectedEnvironment,
                ...metricsResponse.result,
            });
        }).catch((error) => {
            showError(error);
            this.setState({ code: error.code, view: ViewType.ERROR })
        })
    }

    callGetAppOtherEnv(prevEnvId: string | undefined) {
        getAppOtherEnvironment(this.props.match.params.appId).then((envResponse) => {
            let allEnv = envResponse.result?.filter(env => env.prod).map((env) => {
                return {
                    label: env.environmentName,
                    value: env.environmentId,
                }
            })
            allEnv = allEnv || [];
            let callAPIOnEnvOfPrevApp = prevEnvId && allEnv.find(e => Number(e.value) === Number(prevEnvId));
            this.setState({
                environments: allEnv,
                view: this.props.match.params.envId || callAPIOnEnvOfPrevApp ? ViewType.LOADING : ViewType.FORM
            });
        }).then(() => {
            if (prevEnvId && this.state.environments.find(e => Number(e.value) === Number(prevEnvId))) {
                let url = generatePath(this.props.match.path, { appId: this.props.match.params.appId, envId: prevEnvId });
                this.props.history.push(url);
            }
            else if (this.props.match.params.envId) {
                this.callGetDeploymentMetricsAPI(this.props.match.params.appId, this.props.match.params.envId)
            }
        }).catch((error) => {
            showError(error);
            this.setState({ code: error.code, view: ViewType.ERROR });
        })
    }

    closeDeploymentTableModal(): void {
        this.setState({
            filterBy: {
                startDate: undefined,
                endDate: undefined,
            }
        })
    }

    handleEnvironmentChange(selected): void {
        const URL = `/app/${this.props.match.params.appId}/deployment-metrics/${selected.value}`;
        this.props.history.push(URL);
        ReactGA.event({
            category: 'Deployment Metrics',
            action: 'Environment Selection Changed',
            label: '',
        });
    }

    handleDatesChange({ startDate, endDate }): void {
        this.setState({
            startDate: startDate?.set({ hour: 0, minute: 0, seconds: 0 }),
            endDate: endDate?.set({ hour: 23, minute: 59, seconds: 59, milliseconds: 999 }),
        })
    }

    handleFocusChange(focusedInput): void {
        this.setState({ focusedInput });
    }

    handleTableFilter(event): void {
        ReactGA.event({
            category: 'Deployment Metrics',
            action: 'Deployment Status Filter Clicked',
            label: this.getGALabel(event.target.value),
        });
        this.setState({ statusFilter: Number(event.target.value), deploymentTableView: ViewType.LOADING }, () => {
            setTimeout(() => {
                this.setState({ deploymentTableView: ViewType.FORM });
            }, 500);
        });
    }

    getGALabel(statusFilter) {
        switch (Number(statusFilter)) {
            case -1: return "All";
            case 0: return "Success";
            case 1: return "Failed";
            default: return "";
        }
    }

    renderInputs() {
        return <div className="deployment-metrics__inputs">
            <div style={{ width: "180px" }}>
                <ReactSelect defaultValue={this.state.selectedEnvironment}
                    value={this.state.selectedEnvironment}
                    placeholder="Select Environment"
                    components={{
                        DropdownIndicator,
                        Option
                    }}
                    styles={{ ...styles }}
                    onChange={(selected) => { this.handleEnvironmentChange(selected) }}
                    options={this.state.environments} />
            </div>
            <div className="align-right">
                {this.props.match.params.envId ?
                    <DatePicker startDate={this.state.startDate}
                        endDate={this.state.endDate}
                        focusedInput={this.state.focusedInput}
                        handleDatesChange={this.handleDatesChange}
                        handleFocusChange={this.handleFocusChange} />
                    : null}
            </div>
        </div>
    }

    renderGraphs() {
        return <>
            {this.renderInputs()}
            <div className="deployment-metrics__graphs">
                <div className="deployment-metrics__frequency-graph">
                    <ResponsiveContainer>
                        <BarChart data={this.state.frequencyAndLeadTimeGraph}>
                            <Tooltip cursor={{ fill: 'var(--G100)' }} content={<FrequencyTooltip />} />
                            <Legend verticalAlign="top" align="left" height={134}
                                content={<FrequencyGraphLegend noFailures={this.state.recoveryTimeGraph.length === 0}
                                    label={`Deployment Frequency`}
                                    frequencyBenchmark={this.state.frequencyBenchmark}
                                    failureRateBenchmark={this.state.failureRateBenchmark}
                                    frequency={`${this.state.avgFrequency} / day`}
                                    failureRate={`${this.state.failureRate} %`}
                                    setFrequencyMetric={() => {
                                        ReactGA.event({
                                            category: 'Deployment Metrics',
                                            action: 'Graph Bar Clicked',
                                            label: 'Deployment Frequency',
                                        });
                                        this.setState({
                                            benchmarkModalData: {
                                                metric: "DEPLOYMENT_FREQUENCY",
                                                valueLabel: `${this.state.avgFrequency} /day`,
                                                catgory: this.state.frequencyBenchmark.name,
                                                value: this.state.avgFrequency,
                                            }
                                        })
                                    }}
                                    setFailureMetric={() => {
                                        this.setState({
                                            benchmarkModalData: {
                                                metric: "FAILURE_RATE",
                                                valueLabel: `${this.state.failureRate} %`,
                                                catgory: this.state.failureRateBenchmark.name,
                                                value: this.state.failureRate,
                                            }
                                        })
                                    }}
                                />} />
                            <YAxis type="number" dataKey="frequency" domain={[0, this.state.maxFrequency]} hide={true} />
                            <XAxis dataKey="xAxisLabel" tickLine={false} tick={false} axisLine={{ stroke: "var(--G300)" }}>
                                <Label position="insideBottomLeft" content={frequencyXAxisLabel} />
                            </XAxis>
                            <Bar dataKey="failures" stackId="deployment" fill="var(--R300)" style={{ cursor: "pointer" }} onClick={(data) => {
                                this.setState({
                                    filterBy: {
                                        startDate: data.startTime,
                                        endDate: data.endTime
                                    }
                                })
                            }} />
                            <Bar dataKey="success" stackId="deployment" fill="var(--G300)" style={{ cursor: "pointer" }} onClick={(data) => {
                                this.setState({
                                    filterBy: {
                                        startDate: data.startTime,
                                        endDate: data.endTime
                                    }
                                })
                            }} />
                            {this.state.frequencyBenchmark ? <ReferenceLine y={this.state.frequencyBenchmark.targetValue} stroke={this.state.frequencyBenchmark.color} strokeWidth="0.5" label="" /> : null}
                            <ReferenceLine y={this.state.avgFrequency} stroke="var(--N900)" strokeWidth="0.5" strokeDasharray={"3 3"} label="" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="deployment-metrics__lead-graph">
                    <ResponsiveContainer>
                        <BarChart data={this.state.frequencyAndLeadTimeGraph}>
                            <Tooltip cursor={{ fill: 'var(--B100)' }} content={<LeadTimeTooltip />} />
                            <Legend verticalAlign="top" align="left" height={134}
                                content={<RecoveryAndLeadTimeGraphLegend noFailures={false}
                                    label={`Mean Lead Time`}
                                    benchmark={this.state.leadTimeBenchmark}
                                    tooltipText={"How long it takes to deliver a change to production?"}
                                    valueLabel={`${this.state.meanLeadTimeLabel}`}
                                    setMetric={() => {
                                        ReactGA.event({
                                            category: 'Deployment Metrics',
                                            action: 'Graph Bar Clicked',
                                            label: 'Mean Lead Time',
                                        });
                                        this.setState({
                                            benchmarkModalData: {
                                                metric: "LEAD_TIME",
                                                valueLabel: `${this.state.meanLeadTimeLabel}`,
                                                catgory: this.state.leadTimeBenchmark.name,
                                                value: this.state.meanLeadTime,
                                            }
                                        })
                                    }} />} />
                            <XAxis dataKey="xAxisLabel" tickLine={false} tick={false} axisLine={{ stroke: "var(--B300)" }}>
                                <Label position="insideBottomLeft" offset={15} content={leadTimeXAxisLabel} />
                            </XAxis>
                            <YAxis type="number" dataKey="maxLeadTime" hide={true} />
                            <Bar dataKey="maxLeadTime" fill="var(--B300)" style={{ cursor: "pointer" }} onClick={(data) => {
                                this.setState({
                                    filterBy: {
                                        startDate: data.startTime,
                                        endDate: data.endTime
                                    }
                                })
                            }} />
                            {this.state.leadTimeBenchmark ? <ReferenceLine y={this.state.leadTimeBenchmark.targetValue} stroke={this.state.leadTimeBenchmark.color} strokeWidth="0.5" label="" /> : null}
                            <ReferenceLine y={this.state.meanLeadTime} stroke="var(--N900)" strokeWidth="0.5" strokeDasharray={"3 3"} label="" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="deployment-metrics__recovery-graph">
                    <ResponsiveContainer>
                        <BarChart data={this.state.recoveryTimeGraph} >
                            <Tooltip cursor={{ fill: 'var(--Y100)' }} content={<RecoveryTimeTooltip />} />
                            <Legend verticalAlign="top" align="left" height={134}
                                content={<RecoveryAndLeadTimeGraphLegend noFailures={this.state.recoveryTimeGraph.length === 0}
                                    label={`Mean Time to Recovery`}
                                    setMetric={() => {
                                        ReactGA.event({
                                            category: 'Deployment Metrics',
                                            action: 'Graph Bar Clicked',
                                            label: 'Mean Time To Recovery',
                                        });
                                        this.setState({
                                            benchmarkModalData: {
                                                metric: "RECOVERY_TIME",
                                                valueLabel: `${this.state.meanRecoveryTimeLabel}`,
                                                catgory: this.state.recoveryTimeBenchmark.name,
                                                value: this.state.meanRecoveryTime,
                                            }
                                        })
                                    }}
                                    benchmark={this.state.recoveryTimeBenchmark}
                                    tooltipText={"How long does it take to fix a failed pipeline?"}
                                    valueLabel={`${this.state.meanRecoveryTimeLabel}`} />} />
                            <XAxis dataKey="xAxisLabel" tickLine={false} tick={false} axisLine={{ stroke: "var(--Y300)" }}>
                                <Label position="insideBottomLeft" offset={15} content={recoveryTimeLabel} />
                            </XAxis>
                            <YAxis type="number" dataKey="recoveryTime" hide={true} />
                            <Bar dataKey="recoveryTime" fill="var(--Y300)" style={{ cursor: "pointer" }} onClick={(data) => {
                                //NOTE: startDate, and endDate [releasetTime-2, releaseTime+2]
                                this.setState({
                                    filterBy: {
                                        startDate: moment(data.releaseTime),
                                        endDate: moment(data.releaseTime).add(2, "seconds"),
                                    }
                                })
                            }} />
                            {this.state.recoveryTimeBenchmark ? <ReferenceLine y={this.state.recoveryTimeBenchmark.targetValue} stroke={this.state.recoveryTimeBenchmark.color} strokeWidth="0.5" label="" /> : null}
                            <ReferenceLine y={this.state.meanRecoveryTime} stroke="var(--N900)" strokeWidth="0.5" strokeDasharray={"3 3"} label="" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    }

    renderEmptyState() {
        let env = this.state.environments.find(e => e.value === Number(this.props.match.params.envId));
        let envName = env ? env.label : "";
        return <div>
            {this.renderInputs()}
            <div style={{ backgroundColor: "var(--N000)", height: "calc(100vh - 150px" }}>
                <EmptyState >
                    <EmptyState.Image><img src={AppNotDeployed} alt="" /></EmptyState.Image>
                    <EmptyState.Title><h4>No deployments found</h4></EmptyState.Title>
                    <EmptyState.Subtitle>{`There are no deployments in this period on '${envName}'.`}</EmptyState.Subtitle>
                </EmptyState>
            </div>
        </div>
    }

    renderNoEnvironmentView() {
        return <div style={{ backgroundColor: "var(--N000)", height: "calc(100vh - 80px" }}>
            <EmptyState >
                <EmptyState.Image><img src={SelectEnvImage} alt="" /></EmptyState.Image>
                <EmptyState.Title><h4>Deployment Metrics</h4></EmptyState.Title>
                <EmptyState.Subtitle>This app is not deployed on any production environment. Deploy on prod to get an overview of your deployment practices.</EmptyState.Subtitle>
            </EmptyState>
        </div >
    }

    renderSelectEnvironmentView() {
        return <div>
            {this.renderInputs()}
            <div style={{ backgroundColor: "var(--N000)", height: "calc(100vh - 150px" }}>
                <EmptyState >
                    <EmptyState.Image><img src={SelectEnvImage} alt="" /></EmptyState.Image>
                    <EmptyState.Title><h4>Select an Environment</h4></EmptyState.Title>
                    <EmptyState.Subtitle>Please select an Enviroment to view deployment metrics.</EmptyState.Subtitle>
                </EmptyState>
            </div>
        </div>
    }

    renderModal() {
        if (this.state.filterBy.startDate && this.state.filterBy.endDate) {
            let rows = this.state.rows.filter((deployment) => {
                if (deployment.releaseTime.value >= this.state.filterBy.startDate.valueOf() && deployment.releaseTime.value < this.state.filterBy.endDate.valueOf())
                    return deployment;
            })
            return <DeploymentTableModal rows={rows} close={this.closeDeploymentTableModal} />
        }
    }

    renderBenchmarkModal() {
        if (this.state.benchmarkModalData) {
            return <BenchmarkModal valueLabel={this.state.benchmarkModalData.valueLabel}
                value={this.state.benchmarkModalData.value}
                metric={this.state.benchmarkModalData.metric}
                category={this.state.benchmarkModalData.catgory}
                close={(event) => { this.setState({ benchmarkModalData: undefined }) }} />
        }
    }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return <div>
                <Progressing pageLoader />
            </div>
        }
        else if (this.state.view === ViewType.ERROR) {
            return (
                <div className="loading-wrapper">
                    <ErrorScreenManager code={this.state.code} />
                </div>
            )
        }
        else if (this.state.view === ViewType.FORM && this.state.environments.length === 0) {
            return this.renderNoEnvironmentView();
        }
        else if (this.state.view === ViewType.FORM && !this.props.match.params.envId) {
            return this.renderSelectEnvironmentView();
        }
        else if (this.state.view === ViewType.FORM && this.state.frequencyAndLeadTimeGraph.length === 0) {
            return this.renderEmptyState();
        }
        else {
            let deploymentTableRows = this.state.rows;
            if (this.state.statusFilter > -1) {
                deploymentTableRows = deploymentTableRows.filter((row) => {
                    if (row.releaseStatus === this.state.statusFilter) return row;
                })
            }
            return <div>
                {this.renderGraphs()}
                <div className="deployment-metrics__body">
                    <div className="deployment-table__header mb-16">
                        <p className="deployment-table__title m-0"><Deploy className="icon-dim-20 vertical-align-middle mr-5 scn-7 fcn-7" />
                            Deployments</p>
                        <div className="flex right">
                            <label className="tertiary-tab__radio">
                                <input type="radio" name="status" checked={this.state.statusFilter === -1}
                                    value={-1} onClick={this.handleTableFilter} />
                                <span className="tertiary-tab">All ({this.state.totalDeployments})</span>
                            </label>
                            <label className="tertiary-tab__radio">
                                <input type="radio" name="status" checked={this.state.statusFilter === 0}
                                    value={0} onClick={this.handleTableFilter} />
                                <span className="tertiary-tab">
                                    <Success className="icon-dim-16 vertical-align-middle mr-4" />
                                    Success ({this.state.totalDeployments - this.state.failedDeployments})
                                </span>
                            </label>
                            <label className="tertiary-tab__radio">
                                <input type="radio" name="status" checked={this.state.statusFilter === 1}
                                    value={1} onClick={this.handleTableFilter} />
                                <span className="tertiary-tab">
                                    <Fail className="icon-dim-16 vertical-align-middle mr-4" />
                                    Failed ({this.state.failedDeployments})
                                </span>
                            </label>
                        </div>
                    </div>
                    <DeploymentTable rows={deploymentTableRows} deploymentTableView={this.state.deploymentTableView} />
                </div>
                {this.renderModal()}
                {this.renderBenchmarkModal()}
            </div>
        }
    }
}

export interface FrequencyGraphLegendProps {
    noFailures: boolean;
    label: string;
    frequency: string;
    failureRate: string;
    frequencyBenchmark: undefined | any;
    failureRateBenchmark: undefined | any;
    setFrequencyMetric: (...args) => void;
    setFailureMetric: (...args) => void;

}
export class FrequencyGraphLegend extends React.Component<FrequencyGraphLegendProps, {}> {

    render() {
        return <div className="graph-legend">
            <div className="w-50 inline-block">
                <p className="graph-legend__primary-label">Deployment Frequency
                    <Tippy className="default-tt" arrow={false} content="How often this app is deployed to production?">
                        <Help className="icon-dim-20 ml-8 vertical-align-middle mr-5" />
                    </Tippy>
                    <span className="cursor" onClick={this.props.setFrequencyMetric}>{renderCategoryTag(this.props.frequencyBenchmark.name)} </span>
                </p>
                <p className="graph-legend__primary-value">
                    <span className="mr-10">{this.props.frequency}</span>
                    <ReferenceLineLegend />
                </p>
                {this.props.failureRateBenchmark?.targetName === "ELITE" ? <EliteCategoryMessage onClick={this.props.setFrequencyMetric} />
                    : <div className="cursor" onClick={this.props.setFrequencyMetric}>
                        <p className="graph-legend__secondary-label">{this.props.frequencyBenchmark?.targetName} (Target Benchmark)
                            <span className="mr-5"></span>
                            <BenchmarkLine category={this.props.frequencyBenchmark.targetName} />
                        </p>
                        <p className="graph-legend__secondary-value">{this.props.frequencyBenchmark?.targetValue} / day</p>
                    </div>}
            </div>
            <div className="w-50 inline-block" style={{ verticalAlign: "top" }}>
                {!this.props.noFailures ?
                    <>
                        <p className="graph-legend__primary-label">Change Failure Rate
                            <Tippy className="default-tt" arrow={false} content="How often does the pipeline fail?">
                                <Help className="icon-dim-20 ml-8 vertical-align-middle mr-5" />
                            </Tippy>
                            <span className="cursor" onClick={this.props.setFailureMetric}>{renderCategoryTag(this.props.failureRateBenchmark?.name)} </span>
                        </p>
                        <p className="graph-legend__primary-value">{this.props.failureRate}</p>
                        {this.props.failureRateBenchmark?.name !== "ELITE" ?
                            <div className="cursor" onClick={this.props.setFailureMetric}>
                                <p className="graph-legend__secondary-label">{this.props.failureRateBenchmark?.targetName} (Target Benchmark)</p>
                                <p className="graph-legend__secondary-value">{this.props.failureRateBenchmark?.targetValue}%</p>
                            </div> : <EliteCategoryMessage onClick={this.props.setFailureMetric} />}
                    </>
                    : <FailureLegendEmptyState />}
            </div>
        </div>
    }
}

export interface RecoveryAndLeadTimeGraphLegendProps {
    noFailures: boolean;
    valueLabel: string;
    label: string;
    tooltipText: string;
    benchmark: undefined | any;
    setMetric: (...args) => void;

}
export class RecoveryAndLeadTimeGraphLegend extends React.Component<RecoveryAndLeadTimeGraphLegendProps, {}> {

    render() {
        if (this.props.noFailures) {
            return <div className="graph-legend">
                <p className="graph-legend__primary-label">
                    {this.props.label}
                    <Tippy className="default-tt" arrow={false} content={this.props.tooltipText}>
                        <Help className="icon-dim-20 ml-8 vertical-align-middle mr-5" />
                    </Tippy>
                </p>
                <p className="graph-legend__primary-value">
                    <ReferenceLineLegend />
                </p>
                <p className="graph-legend__secondary-label">No recoveries were required during this period.</p>
            </div>
        }
        else {
            return <div className="graph-legend">
                <p className="graph-legend__primary-label">
                    {this.props.label}
                    <Tippy className="default-tt" arrow={false} content={this.props.tooltipText}>
                        <Help className="icon-dim-20 ml-8 vertical-align-middle mr-5" />
                    </Tippy>
                    <span className="cursor" onClick={this.props.setMetric}>{renderCategoryTag(this.props.benchmark?.name)} </span>
                </p>
                <p className="graph-legend__primary-value">
                    <span className="mr-10">{this.props.valueLabel}</span>
                    <ReferenceLineLegend />
                </p>
                {this.props.benchmark?.name !== "ELITE" ?
                    <div className="cursor" onClick={this.props.setMetric}>
                        <p className="graph-legend__secondary-label">{this.props.benchmark?.targetName} (Target Benchmark)
                        <span className="mr-5"></span>
                            <BenchmarkLine category={this.props.benchmark.targetName} />
                        </p>
                        <p className="graph-legend__secondary-value">{this.props.benchmark?.targetLabel}</p>
                    </div> : <EliteCategoryMessage className="cursor" onClick={this.props.setMetric} />}
            </div>
        }
    }
}
