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

import { SortingOrder } from '@devtron-labs/devtron-fe-common-lib'

export enum SecurityScansTabMultiFilterKeys {
    severity = 'severity',
    environment = 'environment',
    cluster = 'cluster',
}

export enum SecurityScansTabSingleFilterKeys {
    searchType = 'searchType',
}

export interface ScanListUrlFiltersType
    extends Record<SecurityScansTabMultiFilterKeys, string[]>,
        Record<SecurityScansTabSingleFilterKeys, string> {}

export enum SearchType {
    APPLICATION = 'appName',
    VULNERABILITY = 'cveName',
}

export interface ScanDetailsType {
    appId: number
    envId: number
}

export enum SecurityListSortableKeys {
    APP_NAME = 'appName',
    ENV_NAME = 'envName',
    LAST_CHECKED = 'lastChecked',
}

export interface ScanListPayloadType {
    offset: number
    size: number
    appName: string
    cveName: string
    severity: number[]
    clusterIds: number[]
    envIds: number[]
    sortBy: SecurityListSortableKeys
    sortOrder: SortingOrder
}

export enum SeverityFilterValues {
    'critical' = 2,
    'high' = 3,
    'medium' = 1,
    'low' = 0,
    'unknown' = 5,
}

export enum SeverityMapping {
    'critical' = 'Critical',
    'high' = 'High',
    'medium' = 'Medium',
    'low' = 'Low',
    'unknown' = 'Unknown',
}

export interface SearchTypeOptionType {
    label: string
    value: SearchType
}
