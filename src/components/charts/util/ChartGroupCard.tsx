import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { ChartGroup, ChartGroupEntry } from '../charts.types'
import { getChartGroupURL } from '../charts.helper'
import placeHolder from '../../../assets/icons/ic-plc-chart.svg'

export interface ChartGroupCardProps {
    chartGroup: ChartGroup
}

export default class ChartGroupCard extends Component<ChartGroupCardProps> {
    handleImageError = (e) => {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = placeHolder
    }

    getChartGroupSubgroup(): ChartGroupEntry[] {
        let len = this.props.chartGroup.chartGroupEntries.length
        len = len < 8 ? len : 8
        return this.props.chartGroup.chartGroupEntries.slice(0, len)
    }

    render() {
        const { chartGroup } = this.props
        const chartGroupEntries = this.getChartGroupSubgroup()
        const GROUP_EDIT_LINK = getChartGroupURL(chartGroup.id)
        const classes = 'chart-grid-item chart-grid-item--chart-group white-card dc__no-decor'
        return (
            <Link key={chartGroup.id} className={classes} to={GROUP_EDIT_LINK}>
                <div className="chart-grid-item__chart-icons">
                    {chartGroupEntries?.map((chart, index) => {
                        return (
                            <img
                                key={index}
                                alt="chart"
                                src={chart.chartMetaData.icon || ''}
                                className="chart-group__chart-icon dc__chart-grid-item__icon"
                                onError={this.handleImageError}
                            />
                        )
                    })}
                </div>
                <p className="chart-group-item__title dc__ellipsis-right">{chartGroup.name}</p>
                <span className="chart-group-item__desc">{chartGroup.chartGroupEntries?.length || 0} charts</span>
            </Link>
        )
    }
}
