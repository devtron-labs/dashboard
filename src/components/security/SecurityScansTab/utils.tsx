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

import {
    Badge,
    ComponentSizeType,
    GroupedFilterSelectPickerProps,
    SeveritiesDTO,
    SeverityChip,
    SeverityCount,
    stringComparatorBySortOrder,
    TableProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { SecurityScanType } from '../security.types'
import {
    AppNameCellComponent,
    EnvironmentCellComponent,
    FixableVulnerabilitiesCellComponent,
    ScannedOnCellComponent,
    SeverityCellComponent,
} from './SecurityScansTabCellComponents'
import { ScanTypeOptions, SecurityScansTabMultiFilterKeys, SecurityScansTabSingleFilterKeys } from './types'

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    [SecurityScansTabMultiFilterKeys.severity]: searchParams.getAll(SecurityScansTabMultiFilterKeys.severity) || [],
    [SecurityScansTabMultiFilterKeys.environment]:
        searchParams.getAll(SecurityScansTabMultiFilterKeys.environment) || [],
    [SecurityScansTabMultiFilterKeys.cluster]: searchParams.getAll(SecurityScansTabMultiFilterKeys.cluster) || [],
    [SecurityScansTabSingleFilterKeys.scanStatus]:
        (searchParams.get(SecurityScansTabSingleFilterKeys.scanStatus) as ScanTypeOptions) || ScanTypeOptions.SCANNED,
})

const SEVERITY_ORDER = [
    SeveritiesDTO.CRITICAL,
    SeveritiesDTO.HIGH,
    SeveritiesDTO.MEDIUM,
    SeveritiesDTO.LOW,
    SeveritiesDTO.UNKNOWN,
]

export const getSeverityWithCount = (severityCount: SeverityCount) => {
    const badges = []

    // eslint-disable-next-line no-restricted-syntax
    for (const item of SEVERITY_ORDER) {
        const count = severityCount[item]
        if (count) {
            badges.push(<SeverityChip severity={item} count={count} />)
        }
    }
    if (badges.length === 0) {
        return <Badge label="Passed" variant="positive" size={ComponentSizeType.xxs} />
    }

    return <div className="flex left dc__gap-4">{badges}</div>
}

export const getGroupFilterItems: (
    scanStatus: ScanTypeOptions,
) => GroupedFilterSelectPickerProps<SecurityScansTabMultiFilterKeys>['options'] = (scanStatus) => [
    {
        items: [
            {
                id: SecurityScansTabMultiFilterKeys.cluster,
                label: 'Cluster',
            },
            {
                id: SecurityScansTabMultiFilterKeys.environment,
                label: 'Environment',
            },
            ...(scanStatus === ScanTypeOptions.SCANNED
                ? [
                      {
                          id: SecurityScansTabMultiFilterKeys.severity,
                          label: 'Severity',
                      },
                  ]
                : []),
        ],
    },
]

export const getSecurityScansTableColumns = (
    isNotScannedList: boolean,
): TableProps<SecurityScanType>['columns'] => {
    const baseColumns: TableProps<SecurityScanType>['columns'] = [
        {
            label: 'APP NAME',
            field: 'name',
            isSortable: true,
            comparator: (a, b, sortOrder) => stringComparatorBySortOrder(a.data.name, b.data.name, sortOrder),
            CellComponent: AppNameCellComponent,
        },
        {
            label: 'ENVIRONMENT',
            field: 'environment',
            isSortable: true,
            comparator: (a, b, sortOrder) => stringComparatorBySortOrder(a.data.environment, b.data.environment, sortOrder),
            CellComponent: EnvironmentCellComponent,
        },
        {
            label: 'IMAGE VULNERABILITY SCAN',
            field: 'severityCount',
            CellComponent: isNotScannedList
                ? () => <div>Not Scanned</div>
                : SeverityCellComponent,
        },
    ]

    if (!isNotScannedList) {
        baseColumns.push(
            {
                label: 'FIXABLE VULNERABILITIES',
                field: 'fixableVulnerabilities',
                CellComponent: FixableVulnerabilitiesCellComponent,
            },
            {
                label: 'SCANNED ON',
                field: 'lastExecution',
                isSortable: true,
                comparator: (a, b, sortOrder) => stringComparatorBySortOrder(a.data.lastExecution, b.data.lastExecution, sortOrder),
                CellComponent: ScannedOnCellComponent,
            },
        )
    }

    return baseColumns
}
