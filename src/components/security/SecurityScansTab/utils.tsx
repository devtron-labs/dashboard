import { SearchType, SecurityScansTabMultiFilterKeys, SecurityScansTabSingleFilterKeys } from './types'

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    [SecurityScansTabMultiFilterKeys.severity]: searchParams.getAll(SecurityScansTabMultiFilterKeys.severity) || [],
    [SecurityScansTabMultiFilterKeys.environment]:
        searchParams.getAll(SecurityScansTabMultiFilterKeys.environment) || [],
    [SecurityScansTabMultiFilterKeys.cluster]: searchParams.getAll(SecurityScansTabMultiFilterKeys.cluster) || [],
    [SecurityScansTabSingleFilterKeys.searchType]:
        searchParams.get(SecurityScansTabSingleFilterKeys.searchType) || 'appName',
})

export const getSearchLabelFromValue = (searchType: string) => {
    if (searchType === SearchType.VULNERABILITY) return 'Vulnerability'
    return 'Application'
}

export const getSeverityLabelFromValue = (severityId: string): string => {
    if (severityId === '5') return 'Unknown'
    if (severityId === '3') return 'High'
    if (severityId === '2') return 'Critical'
    if (severityId === '1') return 'Moderate'
    return 'Low'
}
