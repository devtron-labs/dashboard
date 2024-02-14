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
