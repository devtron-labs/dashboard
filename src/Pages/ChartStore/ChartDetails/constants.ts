import { SegmentedControlProps, stringComparatorBySortOrder } from '@devtron-labs/devtron-fe-common-lib'

import {
    PresetValuesTableIconCellComponent,
    PresetValuesTableLastUpdatedByCellComponent,
    PresetValuesTableLinkCellComponent,
    PresetValuesTableUpdatedAtCellComponent,
} from './ChartDetailsTableComponents'
import { ChartDetailsSegment, PresetValuesTable } from './types'

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

export const PRESET_VALUES_TABLE_COLUMNS: PresetValuesTable['columns'] = [
    {
        field: 'icon',
        size: {
            fixed: 24,
        },
        CellComponent: PresetValuesTableIconCellComponent,
    },
    {
        field: 'name',
        label: 'name',
        size: {
            fixed: 200,
        },
        CellComponent: PresetValuesTableLinkCellComponent,
        isSortable: true,
        comparator: stringComparatorBySortOrder,
    } as PresetValuesTable['columns'][0],
    {
        field: 'chartVersion',
        label: 'Version',
        size: {
            fixed: 100,
        },
    },
    {
        field: 'updatedBy',
        label: 'Last updated by',
        size: {
            fixed: 200,
        },
        CellComponent: PresetValuesTableLastUpdatedByCellComponent,
    },
    {
        field: 'updatedOn',
        label: 'Updated at',
        size: null,
        CellComponent: PresetValuesTableUpdatedAtCellComponent,
    },
]
