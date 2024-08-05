import { SeverityCount } from '@devtron-labs/devtron-fe-common-lib'
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

export const getSeverityWithCount = (severityCount: SeverityCount) => {
    if (severityCount.critical) {
        return (
            <span className="severity-chip severity-chip--critical dc__w-fit-content">
                {severityCount.critical} Critical
            </span>
        )
    }
    if (severityCount.high) {
        return <span className="severity-chip severity-chip--high dc__w-fit-content">{severityCount.high} High</span>
    }
    if (severityCount.medium) {
        return (
            <span className="severity-chip severity-chip--medium dc__w-fit-content">{severityCount.medium} Medium</span>
        )
    }
    if (severityCount.low) {
        return <span className="severity-chip severity-chip--low dc__w-fit-content">{severityCount.low} Low</span>
    }
    if (severityCount.unknown) {
        return (
            <span className="severity-chip severity-chip--unknown dc__w-fit-content">
                {severityCount.unknown} Unknown
            </span>
        )
    }
    return <span className="severity-chip severity-chip--passed dc__w-fit-content">Passed</span>
}
