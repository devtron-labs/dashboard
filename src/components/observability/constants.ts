import {
    IconName,
    numberComparatorBySortOrder,
    SegmentedControlProps,
    stringComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'

import { ProjectListCellComponent } from './ProjectObservability/ProjectListCellComponent'
import { VMListCellComponent } from './VMObservability/VMListCellComponent'
import { CustomerListCellComponent } from './CustomerListCellComponent'
import { CustomerTableProps, ProjectTableProps, TabDetailsSegment, VMTableProps } from './types'

export enum GlanceMetricKeys {
    PROJECTS = 'projects',
    TOTAL_VMS = 'totalVms',
    RUNNING_VMS = 'runningVms',
    HEALTH_STATUS = 'healthStatus',
}
export const GLANCE_METRICS_CARDS_CONFIG: Record<
    GlanceMetricKeys,
    {
        iconName: IconName
        metricTitle: string
    }
> = {
    [GlanceMetricKeys.PROJECTS]: {
        iconName: 'ic-bg-project',
        metricTitle: 'Projects',
    },
    [GlanceMetricKeys.TOTAL_VMS]: {
        iconName: 'ic-devtron-app',
        metricTitle: 'Devtron Applications',
    },
    [GlanceMetricKeys.RUNNING_VMS]: {
        iconName: 'ic-helm-app',
        metricTitle: 'Helm Applications',
    },
    [GlanceMetricKeys.HEALTH_STATUS]: {
        iconName: 'ic-bg-environment',
        metricTitle: 'Environments',
    },
}

export const TAB_DETAILS_SEGMENTS: SegmentedControlProps['segments'] = [
    {
        label: 'Overview',
        value: TabDetailsSegment.OVERVIEW,
    },
    {
        label: 'Projects',
        value: TabDetailsSegment.PROJECTS,
    },
]

export const CUSTOMER_TABLE_COLUMN: CustomerTableProps['columns'] = [
    {
        field: 'icon',
        size: {
            fixed: 24,
        },
        CellComponent: CustomerListCellComponent,
    },
    {
        field: 'name',
        label: 'Customer',
        size: {
            fixed: 250,
        },
        CellComponent: CustomerListCellComponent,
        isSortable: true,
        comparator: stringComparatorBySortOrder,
    } as CustomerTableProps['columns'][0],
    {
        field: 'status',
        label: 'Status',
        size: {
            fixed: 250,
        },
        CellComponent: CustomerListCellComponent,
        isSortable: true,
        comparator: stringComparatorBySortOrder,
    },
    {
        field: 'project',
        label: 'Projects',
        size: {
            fixed: 250,
        },
        CellComponent: CustomerListCellComponent,
        isSortable: true,
        comparator: numberComparatorBySortOrder,
    },
    {
        field: 'totalVms',
        label: 'Total VMs',
        size: {
            fixed: 150,
        },
        CellComponent: CustomerListCellComponent,
        isSortable: true,
        comparator: numberComparatorBySortOrder,
    },

    {
        field: 'activeVms',
        label: 'Active VMs',
        size: {
            fixed: 150,
        },
        CellComponent: CustomerListCellComponent,
        isSortable: true,
        comparator: numberComparatorBySortOrder,
    },

    {
        field: 'healthStatus',
        label: 'Health',
        size: {
            fixed: 250,
        },
        CellComponent: CustomerListCellComponent,
        isSortable: true,
        comparator: stringComparatorBySortOrder,
    },
]

export const PROJECT_TABLE_COLUMNS: ProjectTableProps['columns'] = [
    {
        field: 'name',
        label: 'Project name',
        size: {
            fixed: 250,
        },
        isSortable: true,
        comparator: stringComparatorBySortOrder,
        CellComponent: ProjectListCellComponent,
    },
    {
        field: 'description',
        label: 'Description',
        size: {
            fixed: 250,
        },
        isSortable: true,
        comparator: stringComparatorBySortOrder,
        CellComponent: ProjectListCellComponent,
    },
    {
        field: 'status',
        label: 'Status',
        size: {
            fixed: 250,
        },
        isSortable: true,
        comparator: stringComparatorBySortOrder,
        CellComponent: ProjectListCellComponent,
    },
    {
        field: 'totalVms',
        label: 'Total VM',
        size: {
            fixed: 200,
        },
        isSortable: true,
        comparator: numberComparatorBySortOrder,
        CellComponent: ProjectListCellComponent,
    },
    {
        field: 'activeVms',
        label: 'Active VM',
        size: {
            fixed: 200,
        },
        isSortable: true,
        comparator: numberComparatorBySortOrder,
        CellComponent: ProjectListCellComponent,
    },
    {
        field: 'healthStatus',
        label: 'Health Status',
        size: {
            fixed: 200,
        },
        CellComponent: ProjectListCellComponent,
    },
]

export const VM_TABLE_COLUMNS: VMTableProps['columns'] = [
    {
        field: 'name',
        label: 'VM name',
        size: {
            fixed: 250,
        },
        isSortable: true,
        comparator: stringComparatorBySortOrder,
        CellComponent: VMListCellComponent,
    },
    {
        field: 'status',
        label: 'Status',
        size: {
            fixed: 250,
        },
        isSortable: true,
        comparator: stringComparatorBySortOrder,
        CellComponent: VMListCellComponent,
    },
    {
        field: 'ipAddress',
        label: 'IP Address',
        size: {
            fixed: 250,
        },
        isSortable: true,
        comparator: stringComparatorBySortOrder,
        CellComponent: VMListCellComponent,
    },
    {
        field: 'cpu',
        label: 'CPU',
        size: {
            fixed: 200,
        },
        isSortable: true,
        comparator: numberComparatorBySortOrder,
        CellComponent: VMListCellComponent,
    },
    {
        field: 'memory',
        label: 'Memory',
        size: {
            fixed: 200,
        },
        isSortable: true,
        comparator: numberComparatorBySortOrder,
        CellComponent: VMListCellComponent,
    },
    {
        field: 'disk',
        label: 'Disk',
        size: {
            fixed: 200,
        },
        isSortable: true,
        comparator: numberComparatorBySortOrder,
        CellComponent: VMListCellComponent,
    },
]
