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

import { DATE_TIME_FORMATS, TableCellComponentProps, ZERO_TIME_STRING } from '@devtron-labs/devtron-fe-common-lib'

import { SecurityScanType } from '../security.types'
import { getSeverityWithCount } from './utils'

export const AppNameCellComponent = ({ row }: TableCellComponentProps<SecurityScanType>) => (
    <span className="cb-5 dc__truncate lh-20" data-testid={`scanned-app-list-${row.data.name}`}>
        {row.data.name}
    </span>
)

export const EnvironmentCellComponent = ({ row }: TableCellComponentProps<SecurityScanType>) => (
    <span className="dc__truncate lh-20">{row.data.environment}</span>
)

export const SeverityCellComponent = ({ row }: TableCellComponentProps<SecurityScanType>) => (
    <div>{getSeverityWithCount(row.data.severityCount)}</div>
)

export const FixableVulnerabilitiesCellComponent = ({ row }: TableCellComponentProps<SecurityScanType>) => (
    <span className="dc__truncate">
        {row.data.fixableVulnerabilities} out of {row.data.totalSeverities}
    </span>
)

export const ScannedOnCellComponent = ({ row }: TableCellComponentProps<SecurityScanType>) => (
    <span data-testid="image-scan-security-check lh-20">
        {row.data.lastExecution && row.data.lastExecution !== ZERO_TIME_STRING
            ? dayjs(row.data.lastExecution).format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT)
            : ''}
    </span>
)
