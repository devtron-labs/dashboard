import { ChartListType } from '../charts.types'

export interface ChartSkeletonRowType {
    isGridView: boolean
}

export interface ChartsListProps {
    isLoading: boolean
    chartsList: ChartListType[]
}
