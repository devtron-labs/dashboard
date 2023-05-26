import React, { Component } from 'react'
import { Select } from '../../common'
import { ChartValuesType } from './../charts.types'
import { getChartValuesFiltered } from './../charts.helper'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'

export interface ChartValuesSelectProps {
    redirectToChartValues: (...args) => void
    onChange: (...args) => void
    tabIndex?: number
    chartValues: ChartValuesType
    chartValuesList: ChartValuesType[]
    hideVersionFromLabel?: boolean
    className?: string
    hideCreateNewOption?: boolean
}

export class ChartValuesSelect extends Component<ChartValuesSelectProps> {
    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.selectionComparator = this.selectionComparator.bind(this)
    }

    onChange(event) {
        this.props.onChange(event.target.value)
    }

    selectionComparator(value: ChartValuesType): boolean {
        return this.props.chartValues.id === value.id && this.props.chartValues.kind === value.kind
    }

    renderNoResultsOption() {
        return (
            <div className="select__option-with-subtitle select__option-with-subtitle--empty-state">
                <div className="select__check-icon"></div>
                No Results
            </div>
        )
    }

    getChartValueLabel(chartName: string, version: string): string {
        return `${chartName}${this.props.hideVersionFromLabel || !version ? '' : ` (${version})`}`
    }

    render() {
        let chartValuesList = this.props.chartValuesList
        let chartValues = getChartValuesFiltered(this.props.chartValuesList)
        let selectedChartValue = chartValuesList.find(
            (chartValue) =>
                this.props.chartValues.id === chartValue.id && chartValue.kind === this.props.chartValues.kind,
        )

        return (
            <Select
                tabIndex={this.props.tabIndex || 0}
                rootClassName={`select-button--default ${this.props.className || ''}`}
                valueComparator={this.selectionComparator}
                value={this.props.chartValues}
                onChange={this.onChange}
            >
                <Select.Button>
                    <div className="w-90 flexbox">
                        {selectedChartValue ? (
                            <>
                                <div className="dc__ellipsis-right" data-testid="name-of-preset-chart">{selectedChartValue.name}</div>&nbsp;
                                {!this.props.hideVersionFromLabel && selectedChartValue.chartVersion && (
                                    <span data-testid="version-of-preset-chart">({selectedChartValue.chartVersion})</span>
                                )}
                            </>
                        ) : (
                            'Select Chart Value'
                        )}
                    </div>
                </Select.Button>
                <Select.OptGroup label="DEPLOYED" key={'DEPLOYED'}>
                    {chartValues.deployedChartValues.length
                        ? chartValues.deployedChartValues.map((chartValue) => {
                              let env = chartValue.environmentName || ''
                              return (
                                  <Select.Option key={chartValue.id} value={chartValue}>
                                      <div>
                                          <div className="w-100 flexbox">
                                              <div className="dc__ellipsis-right">{chartValue.name}</div>&nbsp;(
                                              {chartValue.chartVersion})
                                          </div>
                                          <div className="option-with-subtitle__subtitle">Deployed on:{`${env}`}</div>
                                      </div>
                                  </Select.Option>
                              )
                          })
                        : this.renderNoResultsOption()}
                </Select.OptGroup>
                <Select.OptGroup label="PRESET VALUES" key={'SAVED'}>
                    {chartValues.savedChartValues.length
                        ? chartValues.savedChartValues.map((chartValue) => {
                              return (
                                  <Select.Option key={chartValue.id} value={chartValue}>
                                      <div className="w-100 flexbox">
                                          <div className="dc__ellipsis-right">{chartValue.name}</div>&nbsp;(
                                          {chartValue.chartVersion})
                                      </div>
                                  </Select.Option>
                              )
                          })
                        : this.renderNoResultsOption()}
                </Select.OptGroup>
                <Select.OptGroup label="EXISTING" key={'EXISTING'}>
                    {chartValues.existingChartValues.length
                        ? chartValues.existingChartValues.map((chartValue) => {
                              return (
                                  <Select.Option key={chartValue.id} value={chartValue}>
                                      {this.getChartValueLabel(chartValue.name, chartValue.chartVersion)}
                                  </Select.Option>
                              )
                          })
                        : this.renderNoResultsOption()}
                </Select.OptGroup>
                <Select.OptGroup label="DEFAULT" key={'DEFAULT'}>
                    {chartValues.defaultChartValues.length
                        ? chartValues.defaultChartValues.map((chartValue) => {
                              return (
                                  <Select.Option key={chartValue.id} value={chartValue}>
                                      <div className="w-100 flexbox">
                                          <div className="dc__ellipsis-right">{chartValue.name}</div>&nbsp;(
                                          {chartValue.chartVersion})
                                      </div>
                                  </Select.Option>
                              )
                          })
                        : this.renderNoResultsOption()}
                </Select.OptGroup>
                {!this.props.hideCreateNewOption && (
                    <div className="select__sticky-bottom" onClick={this.props.redirectToChartValues}>
                        <Add className="icon-dim-20 mr-5" />
                        Create preset value
                    </div>
                )}
            </Select>
        )
    }
}
