import { ScanDetailsType } from './types'

export const INITIAL_SCAN_DETAILS: ScanDetailsType = {
    name: '',
    uniqueId: {
        imageScanDeployInfoId: 0,
        appId: 0,
        envId: 0,
    },
}

export const SEARCH_TYPE_OPTIONS = [
    { label: 'Application', value: 'appName' },
    { label: 'Vulnerability', value: 'cveName' },
]
