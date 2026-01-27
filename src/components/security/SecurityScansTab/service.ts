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

import dayjs from 'dayjs'

import { TableProps, DATE_TIME_FORMATS, ZERO_TIME_STRING } from '@devtron-labs/devtron-fe-common-lib'

import { getSecurityScanList } from '../security.service'
import { SecurityScanType } from '../security.types'
import { ScanListPayloadType, ScanTypeOptions, SecurityListSortableKeys, SeverityFilterValues } from './types'

export const getSecurityScans: TableProps<SecurityScanType>['getRows'] = async (
    {
        offset,
        pageSize,
        searchKey,
        sortBy,
        sortOrder,
        severity = [],
        cluster = [],
        environment = [],
        scanStatus = ScanTypeOptions.SCANNED,
        isNotScannedList,
    }: Parameters<TableProps['getRows']>[0] & {
        severity: string[]
        cluster: string[]
        environment: string[]
        scanStatus: ScanTypeOptions
        isNotScannedList: boolean
    },
    signal: AbortSignal,
) => {
    const payload: ScanListPayloadType = {
        offset,
        size: pageSize,
        appName: searchKey,
        severity: severity.map((severityFilterValue) => SeverityFilterValues[severityFilterValue]),
        clusterIds: cluster.map((clusterId) => +clusterId),
        envIds: environment.map((envId) => +envId),
        sortBy: sortBy as SecurityListSortableKeys,
        sortOrder,
        scanStatus,
    }

    const response = await getSecurityScanList(payload, signal)

    return {
        rows: response.result.securityScans.map((scan) => ({
            data: {
                ...scan,
                fixableVulnerabilities: `${scan.fixableVulnerabilities} out of ${scan.totalSeverities}`,
                lastExecution: scan.lastExecution && scan.lastExecution !== ZERO_TIME_STRING
                    ? dayjs(scan.lastExecution).format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT)
                    : '',
                [SecurityListSortableKeys.APP_NAME]: scan.name,
            },
            id: `${scan.appId}-${scan.envId}`,
        })),
        totalRows: response.result.totalCount,
    }
}
