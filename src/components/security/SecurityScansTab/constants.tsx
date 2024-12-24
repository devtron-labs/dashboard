import { ScanDetailsType, SearchType, SearchTypeOptionType } from './types'

export const INITIAL_SCAN_DETAILS: ScanDetailsType = {
    name: '',
    uniqueId: {
        appId: 0,
        envId: 0,
    },
}

export const SEARCH_TYPE_OPTIONS: SearchTypeOptionType[] = [
    { label: 'Application', value: SearchType.APPLICATION },
    { label: 'Vulnerability', value: SearchType.VULNERABILITY },
]
