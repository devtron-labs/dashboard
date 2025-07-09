import { SegmentedControlProps } from '@devtron-labs/devtron-fe-common-lib'

import { ChartDetailsSegment } from './types'

export const CHART_DETAILS_SEGMENTS: SegmentedControlProps['segments'] = [
    {
        label: 'Readme',
        value: ChartDetailsSegment.README,
    },
    {
        label: 'Preset Values',
        value: ChartDetailsSegment.PRESET_VALUES,
    },
    {
        label: 'Deployments',
        value: ChartDetailsSegment.DEPLOYMENTS,
    },
]

export const CHART_DETAILS_PORTAL_CONTAINER_ID = 'chart-details-portal-container'
