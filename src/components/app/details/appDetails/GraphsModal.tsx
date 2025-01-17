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

import React, { Component } from 'react'
import { Moment } from 'moment'
import { VisibleModal } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { DatePickerType2 as DateRangePicker } from '../../../common'
import { AppMetricsTabType, ChartType, StatusType, ChartTypes, StatusTypes, AppMetricsTab } from './appDetails.type'
import {
    getIframeSrc,
    isK8sVersionValid,
    ThroughputSelect,
    getCalendarValue,
    LatencySelect,
} from './utils'
import { ReactComponent as GraphIcon } from '../../../../assets/icons/ic-graph.svg'
import { DEFAULTK8SVERSION } from '../../../../config'

export const ChartNames = {
    cpu: 'CPU Usage',
    ram: 'Memory Usage',
    throughput: 'Throughput',
    latency: 'Latency',
    status: 'Status',
}

export interface GraphModalProps {
    appId: string | number
    envId: string | number
    appName: string
    chartName: ChartTypes
    infraMetrics: boolean
    appMetrics: boolean
    environmentName: string
    newPodHash: string
    calendar: { startDate: Moment; endDate: Moment }
    calendarInputs: { startDate: string; endDate: string }
    tab: AppMetricsTabType
    k8sVersion: string
    selectedLatency: number
    close: () => void
    getIframeSrcWrapper: (
        params: Omit<Parameters<typeof getIframeSrc>[0], 'grafanaTheme'>,
    ) => ReturnType<typeof getIframeSrc>
}

interface GraphModalState {
    tab: AppMetricsTabType
    cpu: string
    ram: string
    throughput: string
    latency: string
    status2xx: string
    status4xx: string
    status5xx: string
    statusCode: StatusTypes
    mainChartUrl: string
    focusedInput: 'startDate' | 'endDate'
    calendarValue: string
    calendar: {
        startDate
        endDate
    }
    calendarInputs: {
        startDate: string
        endDate: string
    }
    mainChartName: ChartTypes
    selectedLatency: number
}

export class GraphModal extends Component<GraphModalProps, GraphModalState> {
    constructor(props) {
        super(props)
        this.state = {
            tab: JSON.parse(JSON.stringify(this.props.tab)),
            cpu: '',
            ram: '',
            throughput: '',
            latency: '',
            status2xx: '',
            status4xx: '',
            status5xx: '',
            statusCode: StatusType.status5xx,
            focusedInput: 'startDate',
            calendarValue: '',
            mainChartUrl: '',
            calendar: { ...this.props.calendar },
            calendarInputs: { ...this.props.calendarInputs },
            mainChartName: this.props.chartName,
            selectedLatency: this.props.selectedLatency,
        }
        this.handleTabChange = this.handleTabChange.bind(this)
        this.handleStatusChange = this.handleStatusChange.bind(this)
        this.handleChartChange = this.handleChartChange.bind(this)
        this.handlePredefinedRange = this.handlePredefinedRange.bind(this)
        this.handleLatencyChange = this.handleLatencyChange.bind(this)
    }

    componentDidMount() {
        const { cpu, ram, throughput, status2xx, status4xx, status5xx, latency, mainChartUrl } = this.getNewGraphs(
            this.state.tab,
        )
        const str: string = getCalendarValue(this.state.calendarInputs.startDate, this.state.calendarInputs.endDate)
        this.setState({
            cpu,
            ram,
            throughput,
            latency,
            status2xx,
            status4xx,
            status5xx,
            mainChartUrl,
            calendarValue: str,
        })
    }

    getNewGraphs(tab: AppMetricsTabType) {
        let { k8sVersion } = this.props
        if (!isK8sVersionValid(k8sVersion)) {
            k8sVersion = DEFAULTK8SVERSION
        }
        const appInfo = {
            appId: this.props.appId,
            envId: this.props.envId,
            environmentName: this.props.environmentName,
            newPodHash: this.props.newPodHash,
            k8sVersion,
        }

        const cpu = this.props.getIframeSrcWrapper({
            appInfo, chartName: ChartType.Cpu, calendarInputs: this.state.calendarInputs, tab, isLegendRequired: false
        })
        const ram = this.props.getIframeSrcWrapper({
            appInfo, chartName: ChartType.Ram, calendarInputs: this.state.calendarInputs, tab, isLegendRequired: false
        })
        const latency = this.props.getIframeSrcWrapper({
            appInfo,
            chartName: ChartType.Latency,
            calendarInputs: this.state.calendarInputs,
            tab,
            isLegendRequired: false,
            statusCode: undefined,
            latency: this.state.selectedLatency,
        })
        const status2xx = this.props.getIframeSrcWrapper({
            appInfo,
            chartName: ChartType.Status,
            calendarInputs: this.state.calendarInputs,
            tab,
            isLegendRequired: false,
            statusCode: StatusType.status2xx,
        })
        const status4xx = this.props.getIframeSrcWrapper({
            appInfo,
            chartName: ChartType.Status,
            calendarInputs: this.state.calendarInputs,
            tab,
            isLegendRequired: false,
            statusCode: StatusType.status4xx,
        })
        const status5xx = this.props.getIframeSrcWrapper({
            appInfo,
            chartName: ChartType.Status,
            calendarInputs: this.state.calendarInputs,
            tab,
            isLegendRequired: false,
            statusCode: StatusType.status5xx,
        })
        const throughput = this.props.getIframeSrcWrapper({
            appInfo,
            chartName: ChartType.Status,
            calendarInputs: this.state.calendarInputs,
            tab,
            isLegendRequired: false,
            statusCode: StatusType.Throughput,
        })
        const mainChartUrl = this.props.getIframeSrcWrapper({
            appInfo,
            chartName: this.state.mainChartName,
            calendarInputs: this.state.calendarInputs,
            tab,
            isLegendRequired: true,
            statusCode: this.state.statusCode,
            latency: this.state.selectedLatency,
        })

        return { cpu, ram, throughput, status2xx, status4xx, status5xx, latency, mainChartUrl }
    }

    handleDatesChange = ({ startDate, endDate }) => {
        const start = startDate
        const end = endDate
        this.setState({
            calendar: {
                startDate: start,
                endDate: end,
            },
            calendarInputs: {
                startDate: start?.format('DD MM YYYY hh:mm:ss'),
                endDate: end?.format('DD MM YYYY hh:mm:ss') || '',
            },
        })
    }

    handleFocusChange = (focusedInput: 'startDate' | 'endDate') => {
        this.setState({ focusedInput: focusedInput || 'startDate' })
    }

    handleDateInput = (key, value: string) => {
        const calendarInputs = { ...this.state.calendarInputs }
        calendarInputs[key] = value
        this.setState({ calendarInputs })
    }

    handleCalendarInputs = ({ startDate, endDate }): void => {
        this.setState({
            calendarInputs: {
                startDate,
                endDate,
            },
        })
    }

    handleApply = (): void => {
        const str: string = getCalendarValue(this.state.calendarInputs.startDate, this.state.calendarInputs.endDate)
        this.setState({ calendarValue: str }, () => {
            const { cpu, ram, throughput, status2xx, status4xx, status5xx, latency, mainChartUrl } = this.getNewGraphs(
                this.state.tab,
            )
            this.setState({ cpu, ram, throughput, latency, status2xx, status4xx, status5xx, mainChartUrl })
        })
    }

    handlePredefinedRange(start: Moment, end: Moment, startStr: string): void {
        const str: string = getCalendarValue(startStr, 'now')
        this.setState(
            {
                calendar: {
                    startDate: start,
                    endDate: end,
                },
                calendarInputs: {
                    startDate: startStr,
                    endDate: 'now',
                },
                calendarValue: str,
            },
            () => {
                const { cpu, ram, throughput, status2xx, status4xx, status5xx, latency, mainChartUrl } =
                    this.getNewGraphs(this.state.tab)
                this.setState({ cpu, ram, throughput, latency, status2xx, status4xx, status5xx, mainChartUrl })
            },
        )
    }

    handleChartChange(chartName: ChartTypes, statusCode?: StatusTypes): void {
        const mainChartUrl = this.buildMainChart(chartName, statusCode, this.state.selectedLatency)
        this.setState({
            mainChartName: chartName,
            statusCode,
            mainChartUrl,
        })
    }

    handleTabChange(event) {
        const { cpu, ram, throughput, status2xx, status4xx, status5xx, latency, mainChartUrl } = this.getNewGraphs(
            event.target.value,
        )
        this.setState({
            tab: event.target.value,
            cpu,
            ram,
            throughput,
            latency,
            status2xx,
            status4xx,
            status5xx,
            mainChartUrl,
        })
    }

    handleStatusChange(selected): void {
        const mainChartUrl = this.buildMainChart(this.state.mainChartName, selected.value, this.state.selectedLatency)
        this.setState({
            statusCode: selected.value,
            mainChartUrl,
        })
    }

    handleLatencyChange(selected): void {
        const mainChartUrl = this.buildMainChart(this.state.mainChartName, undefined, selected.value)
        this.setState({
            selectedLatency: selected.value,
            mainChartUrl,
        })
    }

    buildMainChart(chartType: ChartTypes, statusCode?: StatusTypes, selectedLatency?: number): string {
        let { k8sVersion } = this.props
        if (!isK8sVersionValid(k8sVersion)) {
            k8sVersion = DEFAULTK8SVERSION
        }
        const appInfo = {
            appId: this.props.appId,
            envId: this.props.envId,
            environmentName: this.props.environmentName,
            newPodHash: this.props.newPodHash,
            k8sVersion,
        }
        return this.props.getIframeSrcWrapper({
            appInfo,
            chartName: chartType,
            calendarInputs: this.state.calendarInputs,
            tab: this.state.tab,
            isLegendRequired: true,
            statusCode,
            latency: selectedLatency,
        })
    }

    render() {
        const iframeClasses = 'app-details-graph__iframe app-details-graph__iframe--graph-modal pl-12'

        return (
            <VisibleModal className="" close={this.props.close}>
                <div className="modal__body modal__body--full-screen" onClick={(e) => e.stopPropagation()}>
                    <div className="modal__header p-24 m-0">
                        <h1 className="modal__title mb-0">{this.props.appName}/application metrics</h1>
                        <Close className="icon-dim-20 cursor" onClick={this.props.close} />
                    </div>
                    <hr className="m-0" />
                    <section className="graph-modal flexbox w-100">
                        <div className="graph-modal__left">
                            {this.props.infraMetrics && (
                                <div
                                    className={`app-details-graph pt-4 cursor ${this.state.mainChartName === 'cpu' ? 'app-details-graph__iframe--selected' : ''}`}
                                    onClick={(e) => this.handleChartChange(ChartType.Cpu)}
                                >
                                    <h3 className="app-details-graph__title pl-16">CPU Usage</h3>
                                    <div className="app-details-graph__iframe-container">
                                        <div className="app-details-graph__transparent-div" />
                                        <iframe src={this.state.cpu} title="cpu" className={iframeClasses} />
                                    </div>
                                </div>
                            )}
                            {this.props.infraMetrics && (
                                <div
                                    className={`app-details-graph pt-4 cursor  ${this.state.mainChartName === 'ram' ? 'app-details-graph__iframe--selected' : ''}`}
                                    onClick={(e) => this.handleChartChange(ChartType.Ram)}
                                >
                                    <h3 className="app-details-graph__title pl-16">Memory Usage</h3>
                                    <div className="app-details-graph__iframe-container">
                                        <div className="app-details-graph__transparent-div" />
                                        <iframe src={this.state.ram} title="ram" className={iframeClasses} />
                                    </div>
                                </div>
                            )}
                            {this.props.appMetrics && (
                                <div
                                    className={`app-details-graph pt-4 cursor  ${this.state.mainChartName?.toLowerCase() === ChartType.Status && this.state.statusCode === 'Throughput' ? 'app-details-graph__iframe--selected' : ''}`}
                                    onClick={(e) => this.handleChartChange(ChartType.Status, StatusType.Throughput)}
                                >
                                    <h3 className="app-details-graph__title pl-16">Throughput</h3>
                                    <div className="app-details-graph__iframe-container">
                                        <div className="app-details-graph__transparent-div" />
                                        <iframe
                                            src={this.state.throughput}
                                            title="throughput"
                                            className={iframeClasses}
                                        />
                                    </div>
                                </div>
                            )}
                            {this.props.appMetrics && (
                                <div
                                    className={`app-details-graph pt-4 cursor ${this.state.mainChartName === ChartType.Status && this.state.statusCode?.toLowerCase().startsWith('2') ? 'app-details-graph__iframe--selected' : ''}`}
                                    onClick={(e) => this.handleChartChange(ChartType.Status, StatusType.status2xx)}
                                >
                                    <h3 className="app-details-graph__title pl-16">Status 2xx</h3>
                                    <div className="app-details-graph__iframe-container">
                                        <div className="app-details-graph__transparent-div" />
                                        <iframe src={this.state.status2xx} title="2xx" className={iframeClasses} />
                                    </div>
                                </div>
                            )}
                            {this.props.appMetrics && (
                                <div
                                    className={`app-details-graph pt-4 cursor ${this.state.mainChartName === ChartType.Status && this.state.statusCode?.toLowerCase().startsWith('4') ? 'app-details-graph__iframe--selected' : ''}`}
                                    onClick={(e) => this.handleChartChange(ChartType.Status, StatusType.status4xx)}
                                >
                                    <h3 className="app-details-graph__title pl-16">Status 4xx</h3>
                                    <div className="app-details-graph__iframe-container">
                                        <div className="app-details-graph__transparent-div" />
                                        <iframe
                                            src={this.state.status4xx}
                                            title="4xx"
                                            className={`${iframeClasses} `}
                                        />
                                    </div>
                                </div>
                            )}
                            {this.props.appMetrics && (
                                <div
                                    className={`app-details-graph pt-4 cursor ${this.state.mainChartName === ChartType.Status && this.state.statusCode?.toLowerCase().startsWith('5') ? 'app-details-graph__iframe--selected' : ''}`}
                                    onClick={(e) => this.handleChartChange(ChartType.Status, StatusType.status5xx)}
                                >
                                    <h3 className="app-details-graph__title pl-16">Status 5xx</h3>
                                    <div className="app-details-graph__iframe-container">
                                        <div className="app-details-graph__transparent-div" />
                                        <iframe src={this.state.status5xx} title="5xx" className={iframeClasses} />
                                    </div>
                                </div>
                            )}
                            {this.props.appMetrics && (
                                <div
                                    className={`app-details-graph pt-4 cursor ${this.state.mainChartName === ChartType.Latency ? 'app-details-graph__iframe--selected' : ''}`}
                                    onClick={(e) => this.handleChartChange(ChartType.Latency)}
                                >
                                    <h3 className="app-details-graph__title pl-16">
                                        Latency {this.state.selectedLatency}
                                    </h3>
                                    <div className="app-details-graph__iframe-container">
                                        <div className="app-details-graph__transparent-div" />
                                        <iframe src={this.state.latency} title="Latency" className={iframeClasses} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="graph-modal__right w-100 mr-5 pl-24 pr-24 pt-16 pb-12">
                            <div className="flexbox flex-justify mb-16 w-100">
                                <div className="flex">
                                    <h3 className="graph-modal__title mt-0  mb-0 mr-16">
                                        <GraphIcon className="mr-8 fcn-7 dc__vertical-align-middle icon-dim-20" />
                                        {ChartNames[this.state.mainChartName]}
                                    </h3>
                                    {this.state.mainChartName === 'status' && (
                                        <ThroughputSelect
                                            status={this.state.statusCode}
                                            handleStatusChange={this.handleStatusChange}
                                        />
                                    )}
                                    {this.state.mainChartName === 'latency' && (
                                        <LatencySelect
                                            latency={this.state.selectedLatency}
                                            handleLatencyChange={this.handleLatencyChange}
                                        />
                                    )}
                                </div>
                                <div className="flex">
                                    <div className="mr-16">
                                        <label className="dc__tertiary-tab__radio">
                                            <input
                                                type="radio"
                                                value="aggregate"
                                                checked={this.state.tab === AppMetricsTab.Aggregate}
                                                onChange={this.handleTabChange}
                                            />
                                            <span className="dc__tertiary-tab">Aggregate</span>
                                        </label>
                                        <label className="dc__tertiary-tab__radio">
                                            <input
                                                type="radio"
                                                value="pod"
                                                checked={this.state.tab === AppMetricsTab.Pod}
                                                onChange={this.handleTabChange}
                                            />
                                            <span className="dc__tertiary-tab">Per Pod</span>
                                        </label>
                                    </div>
                                    <DateRangePicker
                                        calendar={this.state.calendar}
                                        calendarInputs={this.state.calendarInputs}
                                        focusedInput={this.state.focusedInput}
                                        calendarValue={this.state.calendarValue}
                                        handlePredefinedRange={this.handlePredefinedRange}
                                        handleDatesChange={this.handleDatesChange}
                                        handleFocusChange={this.handleFocusChange}
                                        handleDateInput={this.handleDateInput}
                                        handleApply={this.handleApply}
                                    />
                                </div>
                            </div>
                            <div className="w-100 flex-1">
                                <iframe
                                    src={this.state.mainChartUrl}
                                    title={this.state.mainChartName}
                                    className="graph-modal__main-chart"
                                />
                            </div>
                        </div>
                    </section>
                    <div className="modal__body-bottom pt-12 pb-12 pl-12 pr-12">
                        <button className="cta cancel dc__align-right cursor" onClick={this.props.close}>
                            Done
                        </button>
                    </div>
                </div>
            </VisibleModal>
        )
    }
}
