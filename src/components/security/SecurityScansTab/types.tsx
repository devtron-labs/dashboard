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
    name: string
    uniqueId: {
        appId: number
        envId: number
        imageScanDeployInfoId: number
    }
}

export enum SecurityListSortableKeys {
    APP_NAME = 'appName',
    ENV_NAME = 'envName',
    LAST_CHECKED = 'lastChecked',
}
