import { Severity } from '@devtron-labs/devtron-fe-common-lib'
import { SearchType, SecurityScansTabMultiFilterKeys, SecurityScansTabSingleFilterKeys, SeverityMapping } from './types'

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

export const getSeverityFilterLabelFromValue = (severity: string) => {
    switch (severity) {
        case Severity.CRITICAL:
            return SeverityMapping.critical
        case Severity.HIGH:
            return SeverityMapping.high
        case Severity.MEDIUM:
            return SeverityMapping.medium
        case Severity.LOW:
            return SeverityMapping.low
        default:
            return SeverityMapping.unknown
    }
}
