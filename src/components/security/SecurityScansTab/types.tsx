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
    FiltersTypeEnum,
    SelectPickerOptionType,
    ServerErrors,
    SortingOrder,
    TableViewWrapperProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { SecurityScanType } from '../security.types'

export enum ScanTypeOptions {
    SCANNED = 'scanned',
    NOT_SCANNED = 'not-scanned',
    ALL = 'all',
}

export enum SecurityScansTabMultiFilterKeys {
    severity = 'severity',
    environment = 'environment',
    cluster = 'cluster',
}

export enum SecurityScansTabSingleFilterKeys {
    scanStatus = 'scanStatus',
}

export interface ScanListUrlFiltersType extends Record<SecurityScansTabMultiFilterKeys, string[]> {
    [SecurityScansTabSingleFilterKeys.scanStatus]: ScanTypeOptions
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
    severity: number[]
    clusterIds: number[]
    envIds: number[]
    sortBy: SecurityListSortableKeys
    sortOrder: SortingOrder
    scanStatus: ScanTypeOptions
}

export enum SeverityFilterValues {
    'critical' = 2,
    'high' = 3,
    'medium' = 1,
    'low' = 0,
    'unknown' = 5,
}

export type SecurityScansTableAdditionalProps = {
    clusterEnvListLoading: boolean
    clusterEnvListResult: Record<SecurityScansTabMultiFilterKeys, SelectPickerOptionType[]>
    clusterEnvListError: ServerErrors
    reloadClusterEnvOptions: () => void
    scanDetails: ScanDetailsType
    setScanDetails: (details: ScanDetailsType) => void
}

export type SecurityScansTableWrapperProps = TableViewWrapperProps<SecurityScanType, FiltersTypeEnum.URL> & {
    severity: string[]
    cluster: string[]
    environment: string[]
    scanStatus: ScanTypeOptions
    updateSearchParams: (params: Partial<ScanListUrlFiltersType>) => void
    clearFilters: () => void
} & SecurityScansTableAdditionalProps
