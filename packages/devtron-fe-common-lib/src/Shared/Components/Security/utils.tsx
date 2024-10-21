import { SeverityCount } from '@Shared/types'
import { SeveritiesDTO } from './SecurityModal/types'

export const getTotalSeverityCount = (severityCount: SeverityCount): number => {
    const totalCount =
        (severityCount.critical || 0) +
        (severityCount.high || 0) +
        (severityCount.medium || 0) +
        (severityCount.low || 0) +
        (severityCount.unknown || 0)
    return totalCount
}

export const getSeverityCountFromSummary = (
    scanResultSeverities: Partial<Record<SeveritiesDTO, number>>,
): SeverityCount => ({
    critical: scanResultSeverities?.CRITICAL || 0,
    high: scanResultSeverities?.HIGH || 0,
    medium: scanResultSeverities?.MEDIUM || 0,
    low: scanResultSeverities?.LOW || 0,
    unknown: scanResultSeverities?.UNKNOWN || 0,
})

export const getCVEUrlFromCVEName = (cveName: string): string =>
    `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cveName}`
