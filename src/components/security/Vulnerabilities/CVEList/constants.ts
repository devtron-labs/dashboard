import { FiltersTypeEnum, GroupedFilterSelectPickerProps, TableProps } from '@devtron-labs/devtron-fe-common-lib'

import { CVENameCellComponent, SeverityCellComponent } from './CVEListTableCellComponents'
import { CVEDetails, CVEListFilters } from './types'

export const CVE_LIST_GROUP_FILTER_OPTIONS: GroupedFilterSelectPickerProps<CVEListFilters>['options'] = [
    {
        items: [
            { id: 'application', label: 'Application' },
            { id: 'environment', label: 'Environment' },
            { id: 'severity', label: 'Severity' },
            { id: 'cluster', label: 'Cluster' },
            { id: 'fixAvailability', label: 'Fix Availability' },
            { id: 'ageOfDiscovery', label: 'Age of Discovery' },
        ],
    },
]

export const CVE_LIST_TABLE_COLUMNS: TableProps<CVEDetails, FiltersTypeEnum.URL, {}>['columns'] = [
    {
        label: 'CVE ID',
        field: 'cveName',
        isSortable: true,
        size: { fixed: 180 },
        CellComponent: CVENameCellComponent,
    },
    {
        label: 'Severity',
        field: 'severity',
        size: { fixed: 100 },
        CellComponent: SeverityCellComponent,
        isSortable: true,
    },
    {
        label: 'Application',
        field: 'appName',
        size: { fixed: 150 },
    },
    {
        label: 'Environment',
        field: 'envName',
        size: { fixed: 150 },
    },
    {
        label: 'Discovered 1st Time',
        field: 'discoveredAt',
        size: { fixed: 150 },
        isSortable: true,
    },
    {
        label: 'Package',
        field: 'package',
        size: { fixed: 180 },
    },
    {
        label: 'Current Version',
        field: 'currentVersion',
        size: { fixed: 150 },
        isSortable: true,
    },
    {
        label: 'Fix In Version',
        field: 'fixedVersion',
        size: { fixed: 150 },
        isSortable: true,
    },
]
