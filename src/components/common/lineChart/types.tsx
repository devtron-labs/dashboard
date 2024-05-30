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

export interface LineChartProps {
    svgRef: SVGSVGElement
    tooltipRef: HTMLElement
    lineData: Line
    mouseRefLine: SVGElement
}

export interface Line {
    interval: {
        start: Date
        end: Date
    }
    cutOverTime: Date
    points: Point[]
}

export interface Point {
    display: number
    time: Date
    min: number
    max: number
    median: number
}
