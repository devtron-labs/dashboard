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
    FiltersTypeEnum,
    GroupedFilterSelectPickerProps,
    SeveritiesDTO,
    SeverityChip,
    SeverityCount,
    TableProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { SecurityScanType } from '../security.types'
import { SeverityCellComponent } from './SecurityScansTabCellComponents'
import {
    ScanTypeOptions,
    SecurityListSortableKeys,
    SecurityScansTabMultiFilterKeys,
    SecurityScansTabSingleFilterKeys,
} from './types'

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

    return <div className="flex left dc__gap-4 flex-wrap">{badges}</div>
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
): TableProps<SecurityScanType, FiltersTypeEnum.URL>['columns'] => {
    const baseColumns: TableProps<SecurityScanType>['columns'] = [
        {
            label: 'APP NAME',
            field: SecurityListSortableKeys.APP_NAME,
            isSortable: true,
            size: {
                fixed: 200,
            },
        },
        {
            label: 'ENVIRONMENT',
            field: SecurityListSortableKeys.ENV_NAME,
            isSortable: true,
            size: {
                fixed: 200,
            },
        },
        {
            label: 'IMAGE VULNERABILITY SCAN',
            field: 'severityCount',
            CellComponent: isNotScannedList ? () => <span>Not Scanned</span> : SeverityCellComponent,
            size: null,
        },
    ]

    if (!isNotScannedList) {
        baseColumns.push(
            {
                label: 'FIXABLE VULNERABILITIES',
                field: 'fixableItems',
                size: {
                    fixed: 200,
                },
            },
            {
                label: 'SCANNED ON',
                field: SecurityListSortableKeys.LAST_CHECKED,
                isSortable: true,
                size: {
                    fixed: 200,
                },
            },
        )
    }

    return baseColumns
}
