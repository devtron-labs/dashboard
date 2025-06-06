import { Chart, ChartGroup } from '../charts.types'

export interface ChartGroupCardProps {
    chartGroup: ChartGroup
}

export interface AllChartSelectProps {
    chart: Chart
    isListView: boolean
    dataTestId: string
    selectedCount: number
    showCheckBoxOnHoverOnly: boolean
    onClick?: (chartId: number) => void
    addChart?: (chartId: number) => void
    subtractChart?: (chartId: number) => void
    selectChart?: (chartId: number) => void
}

export interface Stepper extends AllChartSelectProps {
    addChart: (chartId: number) => void
    subtractChart: (chartId: number) => void
    selectChart?: never
}

export interface Checkbox extends AllChartSelectProps {
    addChart?: never
    subtractChart?: never
    selectChart: (chartId: number) => void
}

export type ChartSelectProps = Stepper | Checkbox
