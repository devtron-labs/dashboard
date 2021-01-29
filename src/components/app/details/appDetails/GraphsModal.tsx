import React, { Component } from 'react';
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg';
import { VisibleModal, DatePickerType2 as DateRangePicker, DayPickerRangeControllerPresets } from '../../../common';
import { AppMetricsTabType, ChartTypes } from './appDetails.type';
import { getIframeSrc, ThroughputSelect, getCalendarValue } from './utils';
import { Moment } from 'moment';
import { ReactComponent as GraphIcon } from '../../../../assets/icons/ic-graph.svg';

export const ChartNames = {
    'cpu': 'CPU Usage',
    'ram': 'Memory Usage',
    'throughput': 'Throughput',
    'latency': 'Latency',
    'status': 'Status',
}

export interface GraphModalProps {
    appId: string | number,
    envId: string | number,
    appName: string;
    chartName: ChartTypes;
    infraMetrics: boolean;
    appMetrics: boolean;
    environmentName: string;
    newPodHash: string;
    calendar: { startDate: Moment, endDate: Moment };
    calendarInputs: { startDate: string, endDate: string };
    tab: AppMetricsTabType;
    close: () => void;
}

interface GraphModalState {
    tab: AppMetricsTabType;
    cpu: string;
    ram: string;
    throughput: string;
    latency: string;
    status2xx: string;
    status4xx: string;
    status5xx: string;
    statusCode: string;
    mainChartUrl: string;
    focusedInput: 'startDate' | 'endDate';
    calendarValue: string;
    calendar: {
        startDate;
        endDate;
    }
    calendarInputs: {
        startDate: string;
        endDate: string;
    },
    mainChartName: ChartTypes;
}

export class GraphModal extends Component<GraphModalProps, GraphModalState>{
    constructor(props) {
        super(props);
        this.state = {
            tab: JSON.parse(JSON.stringify(this.props.tab)),
            cpu: "",
            ram: "",
            throughput: "",
            latency: "",
            status2xx: "",
            status4xx: "",
            status5xx: "",
            statusCode: 'Throughput',
            focusedInput: 'startDate',
            calendarValue: '',
            mainChartUrl: '',
            calendar: { ...this.props.calendar },
            calendarInputs: { ...this.props.calendarInputs },
            mainChartName: this.props.chartName,
        }
        this.handleTabChange = this.handleTabChange.bind(this);
        this.handleStatusChange = this.handleStatusChange.bind(this);
        this.handleChartChange = this.handleChartChange.bind(this);
        this.handlePredefinedRange = this.handlePredefinedRange.bind(this);
    }

    componentDidMount() {
        let { cpu, ram, throughput, latency, status2xx, status4xx, status5xx, mainChartUrl } = this.getNewGraphs(this.state.tab);
        let str: string = getCalendarValue(this.state.calendarInputs.startDate, this.state.calendarInputs.endDate);
        this.setState({ cpu, ram, throughput, latency, status2xx, status4xx, status5xx, mainChartUrl, calendarValue: str });
    }

    getNewGraphs(tab: AppMetricsTabType) {
        let cpu = getIframeSrc(this.props.appId, this.props.envId, this.props.environmentName, 'cpu', this.props.newPodHash, this.state.calendarInputs, tab, false);
        let ram = getIframeSrc(this.props.appId, this.props.envId, this.props.environmentName, 'ram', this.props.newPodHash, this.state.calendarInputs, tab, false);
        let latency = getIframeSrc(this.props.appId, this.props.envId, this.props.environmentName, 'latency', this.props.newPodHash, this.state.calendarInputs, tab, false);
        let status2xx = getIframeSrc(this.props.appId, this.props.envId, this.props.environmentName, 'status', this.props.newPodHash, this.state.calendarInputs, tab, false, '2xx');
        let status4xx = getIframeSrc(this.props.appId, this.props.envId, this.props.environmentName, 'status', this.props.newPodHash, this.state.calendarInputs, tab, false, '4xx');
        let status5xx = getIframeSrc(this.props.appId, this.props.envId, this.props.environmentName, 'status', this.props.newPodHash, this.state.calendarInputs, tab, false, '5xx');
        let status = getIframeSrc(this.props.appId, this.props.envId, this.props.environmentName, 'status', this.props.newPodHash, this.state.calendarInputs, tab, false, 'Throughput');
        let throughput = getIframeSrc(this.props.appId, this.props.envId, this.props.environmentName, 'status', this.props.newPodHash, this.state.calendarInputs, tab, false, 'Throughput');
        let mainChartUrl = getIframeSrc(this.props.appId, this.props.envId, this.props.environmentName, this.state.mainChartName, this.props.newPodHash, this.state.calendarInputs, tab, true, this.state.statusCode);
        return { cpu, ram, throughput, status2xx, status4xx, status5xx, status, latency, mainChartUrl };
    }

    handleDatesChange = ({ startDate, endDate }) => {
        let start = startDate;
        let end = endDate;
        this.setState({
            calendar: {
                startDate: start,
                endDate: end,
            },
            calendarInputs: {
                startDate: start?.format('DD MM YYYY hh:mm:ss'),
                endDate: end?.format('DD MM YYYY hh:mm:ss') || '',
            }
        });
    }

    handleFocusChange = (focusedInput: "startDate" | "endDate") => {
        this.setState({ focusedInput: focusedInput || 'startDate' });
    }

    handleDateInput = (key, value: string) => {
        let calendarInputs = { ...this.state.calendarInputs };
        calendarInputs[key] = value;
        this.setState({ calendarInputs });
    }

    handleCalendarInputs = ({ startDate, endDate }): void => {
        this.setState({
            calendarInputs: {
                startDate: startDate,
                endDate: endDate,
            }
        });
    }

    handleApply = (): void => {
        let str: string = getCalendarValue(this.state.calendarInputs.startDate, this.state.calendarInputs.endDate);
        this.setState({ calendarValue: str }, () => {
            let { cpu, ram, throughput, status2xx, status4xx, status5xx, mainChartUrl } = this.getNewGraphs(this.state.tab);
            this.setState({ cpu, ram, throughput, status2xx, status4xx, status5xx, mainChartUrl });
        });
    }

    handlePredefinedRange(start: Moment, end: Moment, startStr: string): void {
        let str: string = getCalendarValue(startStr, 'now');
        this.setState({
            calendar: {
                startDate: start,
                endDate: end,
            },
            calendarInputs: {
                startDate: startStr,
                endDate: 'now',
            },
            calendarValue: str,
        }, () => {
            let { cpu, ram, throughput, status2xx, status4xx, status5xx, mainChartUrl } = this.getNewGraphs(this.state.tab);
            this.setState({ cpu, ram, throughput, status2xx, status4xx, status5xx, mainChartUrl });
        });
    }

    handleChartChange(chartName: ChartTypes, status?: string): void {
        let mainChartUrl = getIframeSrc(this.props.appId, this.props.envId, this.props.environmentName, chartName, this.props.newPodHash, this.state.calendarInputs, this.state.tab, true, this.state.statusCode);
        this.setState({
            mainChartName: chartName,
            statusCode: status,
            mainChartUrl,
        });
    }

    handleTabChange(event) {
        let { cpu, ram, throughput, status2xx, status4xx, status5xx, mainChartUrl } = this.getNewGraphs(event.target.value);
        this.setState({ tab: event.target.value, cpu, ram, throughput, status2xx, status4xx, status5xx, mainChartUrl });
    }

    handleStatusChange(selected): void {
        this.setState({ statusCode: selected.value });
    }

    render() {
        let iframeClasses = "app-details-graph__iframe app-details-graph__iframe--graph-modal pl-12";

        return <VisibleModal className="" close={this.props.close}>
            <div className="modal__body modal__body--full-screen" onClick={e => e.stopPropagation()}>
                <div className="modal__header p-24 m-0">
                    <h1 className="modal__title mb-0">{this.props.appName}/application metrics</h1>
                    <Close className="icon-dim-20 cursor" onClick={this.props.close} />
                </div>
                <hr className="m-0" />
                <section className="graph-modal flexbox w-100">
                    <div className="graph-modal__left">
                        {this.props.infraMetrics && <div className={`app-details-graph pt-4 cursor ${this.state.mainChartName === 'cpu' ? 'app-details-graph__iframe--selected' : ''}`} onClick={(e) => this.handleChartChange('cpu')}>
                            <h3 className="app-details-graph__title pl-16">CPU Usage</h3>
                            <div className="app-details-graph__iframe-container" >
                                <div className="app-details-graph__transparent-div"></div>
                                <iframe src={this.state.cpu} title="cpu" className={iframeClasses} />
                            </div>
                        </div>}
                        {this.props.infraMetrics && <div className={`app-details-graph pt-4 cursor  ${this.state.mainChartName === 'ram' ? 'app-details-graph__iframe--selected' : ''}`} onClick={(e) => this.handleChartChange('ram')}>
                            <h3 className="app-details-graph__title pl-16">Memory Usage</h3>
                            <div className="app-details-graph__iframe-container" >
                                <div className="app-details-graph__transparent-div"></div>
                                <iframe src={this.state.ram} title="ram" className={iframeClasses} />
                            </div>
                        </div>}
                        {this.props.appMetrics && <div className={`app-details-graph pt-4 cursor  ${this.state.mainChartName?.toLowerCase() === 'status' && (this.state.statusCode === "Throughput") ? 'app-details-graph__iframe--selected' : ''}`} onClick={(e) => this.handleChartChange('status', 'Throughput')}>
                            <h3 className="app-details-graph__title pl-16">Throughput</h3>
                            <div className="app-details-graph__iframe-container" >
                                <div className="app-details-graph__transparent-div"></div>
                                <iframe src={this.state.throughput} title="throughput" className={iframeClasses} />
                            </div>
                        </div>}
                        {this.props.appMetrics && <div className={`app-details-graph pt-4 cursor ${this.state.mainChartName === 'status' && (this.state.statusCode)?.toLowerCase().startsWith('2') ? 'app-details-graph__iframe--selected' : ''}`} onClick={(e) => this.handleChartChange('status', '2xx')}>
                            <h3 className="app-details-graph__title pl-16">Status 2xx</h3>
                            <div className="app-details-graph__iframe-container" >
                                <div className="app-details-graph__transparent-div"></div>
                                <iframe src={this.state.status2xx} title="2xx" className={iframeClasses} />
                            </div>
                        </div>}
                        {this.props.appMetrics && <div className={`app-details-graph pt-4 cursor ${this.state.mainChartName === 'status' && (this.state.statusCode)?.toLowerCase().startsWith('4') ? 'app-details-graph__iframe--selected' : ''}`} onClick={(e) => this.handleChartChange('status', '4xx')}>
                            <h3 className="app-details-graph__title pl-16">Status 4xx</h3>
                            <div className="app-details-graph__iframe-container" >
                                <div className="app-details-graph__transparent-div"></div>
                                <iframe src={this.state.status4xx} title="4xx" className={`${iframeClasses} `} />
                            </div>
                        </div>}
                        {this.props.appMetrics && <div className={`app-details-graph pt-4 cursor ${this.state.mainChartName === 'status' && (this.state.statusCode)?.toLowerCase().startsWith('5') ? 'app-details-graph__iframe--selected' : ''}`} onClick={(e) => this.handleChartChange('status', '5xx')}>
                            <h3 className="app-details-graph__title pl-16">Status 5xx</h3>
                            <div className="app-details-graph__iframe-container" >
                                <div className="app-details-graph__transparent-div"></div>
                                <iframe src={this.state.status5xx} title="5xx" className={iframeClasses} />
                            </div>
                        </div>}
                        {this.props.appMetrics && <div className={`app-details-graph pt-4 cursor ${this.state.mainChartName === 'latency' ? 'app-details-graph__iframe--selected' : ''}`} onClick={(e) => this.handleChartChange('latency')}>
                            <h3 className="app-details-graph__title pl-16">Latency</h3>
                            <div className="app-details-graph__iframe-container" >
                                <div className="app-details-graph__transparent-div"></div>
                                <iframe src={this.state.status5xx} title="5xx" className={iframeClasses} />
                            </div>
                        </div>
                        }
                    </div>
                    <div className="graph-modal__right w-100 mr-5 pl-24 pr-24 pt-16 pb-12">
                        <div className="flexbox flex-justify mb-16 w-100">
                            <div className="flex">
                                <h3 className="graph-modal__title mt-0  mb-0 mr-16">
                                    <GraphIcon className="mr-8 fcn-7 vertical-align-middle icon-dim-20" />
                                    {ChartNames[this.state.mainChartName]}
                                </h3>
                                {this.state.mainChartName === "status" &&
                                    <ThroughputSelect status={this.state.statusCode} handleStatusChange={this.handleStatusChange} />}
                            </div>
                            <div className="flex">
                                <div className="mr-16">
                                    <label className="tertiary-tab__radio">
                                        <input type="radio" value={'aggregate'} checked={this.state.tab === 'aggregate'} onChange={this.handleTabChange} />
                                        <span className="tertiary-tab">Aggregate</span>
                                    </label>
                                    <label className="tertiary-tab__radio">
                                        <input type="radio" value={'pod'} checked={this.state.tab === 'pod'} onChange={this.handleTabChange} />
                                        <span className="tertiary-tab">Per Pod</span>
                                    </label>
                                </div>
                                <DateRangePicker calendar={this.state.calendar}
                                    calendarInputs={this.state.calendarInputs}
                                    focusedInput={this.state.focusedInput}
                                    calendarValue={this.state.calendarValue}
                                    handlePredefinedRange={this.handlePredefinedRange}
                                    handleDatesChange={this.handleDatesChange}
                                    handleFocusChange={this.handleFocusChange}
                                    handleDateInput={this.handleDateInput}
                                    handleApply={this.handleApply} />
                            </div>
                        </div>
                        <div className="w-100 flex-1">
                            <iframe src={this.state.mainChartUrl} title={this.state.mainChartName} className="graph-modal__main-chart" />
                        </div>
                    </div>
                </section>
                <div className="modal__body-bottom pt-12 pb-12 pl-12 pr-12">
                    <button className="cta cancel align-right cursor" onClick={this.props.close}>Done</button>
                </div>
            </div>
        </VisibleModal>
    }
}