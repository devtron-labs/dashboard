import { SeveritiesDTO } from '@devtron-labs/devtron-fe-common-lib'

export enum VulnerabilityViewTypes {
    DEPLOYMENTS = 'DEPLOYMENTS',
    VULNERABILITIES = 'VULNERABILITIES',
}

export interface VulnerabilitySummaryDTO {
    totalVulnerabilities: number
    severityCount: Record<SeveritiesDTO, number>
    fixableVulnerabilities: number
    notFixableVulnerabilities: number
}
