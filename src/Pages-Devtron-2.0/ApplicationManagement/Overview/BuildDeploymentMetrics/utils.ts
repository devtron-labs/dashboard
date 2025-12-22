import { BadgeProps } from '@devtron-labs/devtron-fe-common-lib'

import { DoraMetricsChartCardProps } from '../types'

export const getDoraMetricBadgeVariant = ({
    comparisonValue,
    isDeclinePositive,
}: Pick<DoraMetricsChartCardProps, 'comparisonValue'> & { isDeclinePositive: boolean }): Extract<
    BadgeProps['variant'],
    'positive' | 'negative'
> => {
    if (isDeclinePositive) {
        return comparisonValue < 0 ? 'positive' : 'negative'
    }
    return comparisonValue < 0 ? 'negative' : 'positive'
}
