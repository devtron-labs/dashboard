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

// @ts-nocheck
import { Component } from 'react'
import * as d3 from 'd3'
import { LineChartProps, Point } from './types'
import './lineChart.css'

export default class LineChart extends Component<LineChartProps> {
    componentDidUpdate() {
        this.drawLineChart()
    }

    drawLineChart() {
        if (!this.props.lineData.points.length) {
            return
        }

        d3.select(this.props.svgRef).select('g').remove()

        const offset = 40
        // height, width excludes offset
        const height = 320
        const width = 420

        const tooltip = this.props.tooltipRef

        const svg = d3.select(this.props.svgRef).insert('g', 'line').attr('transform', `translate(${offset},${offset})`)

        const data = this.props.lineData.points

        data.sort(function (x, y) {
            return d3.ascending(x.time, y.time)
        })

        const display: number[] = data.map(function (element) {
            return element.display
        })

        // Scales
        const xScale = d3
            .scaleTime()
            .domain([this.props.lineData.interval.start, this.props.lineData.interval.end])
            .range([0, width])

        const yScale = d3
            .scaleLinear()
            .domain([d3.min(display), d3.max(display)])
            .range([height, 0])

        const xAxis = d3.axisBottom(xScale)
        const yAxis = d3.axisLeft(yScale)

        // Draw grid lines and boundary
        const yTicks = yScale.ticks()
        const gridGroup = svg.append('g')

        const xValues = data.map((data) => {
            return xScale(data.time)
        })

        // Compute rectangle width for hover
        let rectWidth
        const dataset = []
        if (xValues[0] > xValues[1] - xValues[0]) {
            rectWidth = (2 * (xValues[1] - xValues[0])) / 3
        } else {
            rectWidth = (2 * xValues[0]) / 3
        }
        let e = { ...data[0], ...{ start: xValues[0] - rectWidth / 2, width: rectWidth } }
        dataset.push(e)
        for (let i = 1; i < xValues.length; i++) {
            if (xValues[i] - xValues[i - 1] > xValues[i + 1] - xValues[i]) {
                rectWidth = (2 * (xValues[i + 1] - xValues[i])) / 3
            } else {
                rectWidth = (2 * (xValues[i] - xValues[i - 1])) / 3
            }
            e = { ...data[i], ...{ start: xValues[i] - rectWidth / 2, width: rectWidth } }
            dataset.push(e)
        }
        const mouseLine = d3
            .select(this.props.mouseRefLine)
            .attr('transform', `translate(${offset},${offset})`)
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', height)
            .attr('stroke', '#d1d1d1')
            .attr('stroke-width', 1)
            .attr('opacity', 0)

        // boundary
        gridGroup
            .append('rect')
            .attr('x', '0')
            .attr('y', '0')
            .attr('width', width)
            .attr('height', height)
            .attr('stroke', '#d1d1d1')
            .attr('fill', 'var(--N50)')
        // grid lines
        gridGroup
            .selectAll('line')
            .data(yTicks)
            .enter()
            .append('line')
            .attr('x1', '0')
            .attr('y1', function (d) {
                return yScale(d)
            })
            .attr('x2', width)
            .attr('y2', function (d) {
                return yScale(d)
            })
            .attr('stroke', '#d1d1d1')

        // Draw X axis
        svg.append('g')
            .attr('transform', `translate(${0},${height})`)
            .call(xAxis)
            .attr('class', 'x-axis')
            .append('text')
            .text('Time')
            .attr('x', width / 2)
            .attr('y', offset * 0.7)
            .attr('fill', 'var(--N900)')

        // Draw Y Axis
        svg.append('g')
            .call(yAxis)
            .attr('class', 'y-axis')
            .append('text')
            .text('Usage')
            .attr('transform', `rotate(${-90},${0} ${0})`)
            .attr('x', -height / 2)
            .attr('y', -offset * 0.7)
            .attr('fill', 'var(--N900)')

        // Line function
        const line = d3
            .line<Point>()
            .x(function (d, i) {
                return xScale(d.time)
            })
            .y(function (d, i) {
                return yScale(d.display)
            })

        // graph
        svg.append('path')
            .datum(dataset)
            .attr('class', 'line')
            .attr('d', line)
            .attr('stroke', 'var(--N700)')
            .attr('stroke', 'var(--O600)')
            .attr('stroke-width', '2')
            .attr('fill', 'none')

        const hoverGroup = svg.append('g')

        const hoverElement = hoverGroup.selectAll('rect').data(dataset).enter().append('g')

        hoverElement
            .append('rect')
            .attr('x', function (data) {
                return data.start
            })
            .attr('y', 0)
            .attr('width', function (data) {
                return data.width
            })
            .attr('height', height)
            .attr('stroke', 'transparent')
            .attr('stroke-opacity', '1')
            .attr('fill', 'transparent')

        hoverElement
            .append('circle')
            .attr('cx', function (d, i) {
                return xScale(d.time)
            })
            .attr('cy', function (d) {
                return yScale(d.display)
            })
            .attr('r', '3')
            .attr('stroke-width', '1')
            .attr('stroke', 'var(--O600)')
            .attr('fill', 'var(--O600)')

        hoverElement
            .on('mouseover', function (d) {
                d3.select(this)
                    .select('circle')
                    .attr('r', '5')
                    .attr('stroke-width', '2')
                    .attr('stroke', 'var(--N0)')
                    .attr('fill', 'var(--O600)')

                mouseLine
                    .attr('x1', `${xScale(d.time)}`)
                    .attr('x2', `${xScale(d.time)}`)
                    .style('opacity', '1')

                d3.select(tooltip).html(
                    `<p><strong>Min</strong>${d.min}</p>
                 <p><strong>Max</strong>${d.max}</p>
                 <p><strong>Median</strong>${d.median}</p>`,
                )
                d3.select(tooltip)
                    .style('left', `${xScale(d.time) + 2 * offset}px`)
                    .style('top', `${yScale(d.display) + offset}px`)
                    .style('display', 'block')
            })

            .on('mouseout', function (d) {
                mouseLine.style('opacity', '0')

                d3.select(tooltip).style('display', 'none')

                d3.select(this)
                    .select('circle')
                    .attr('r', '3')
                    .attr('stroke-width', '1')
                    .attr('stroke', 'var(--O600)')
                    .attr('fill', 'var(--O600)')
            })
    }

    render() {
        return null
    }
}
