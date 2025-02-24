import { DeploymentChartType, SortingOrder, stringComparatorBySortOrder } from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentChartsListSortableKeys } from '../types'

export const sortChartList = (
    a: DeploymentChartType,
    b: DeploymentChartType,
    sortBy: DeploymentChartsListSortableKeys,
    sortOrder: SortingOrder,
) => {
    switch (sortBy) {
        case DeploymentChartsListSortableKeys.CHART_VERSION:
            return stringComparatorBySortOrder(a.versions[0].version, b.versions[0].version, sortOrder)
        case DeploymentChartsListSortableKeys.UPLOADED_BY:
            return stringComparatorBySortOrder(a.versions[0].uploadedBy, b.versions[0].uploadedBy, sortOrder)
        default:
            return stringComparatorBySortOrder(a.name, b.name, sortOrder)
    }
}
