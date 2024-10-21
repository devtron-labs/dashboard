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

interface ScanDetailsUniqueId {
    appId: number
    envId: number
    imageScanDeployInfoId: number
}
export interface ScanDetailsType {
    name: string
    uniqueId: ScanDetailsUniqueId
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
