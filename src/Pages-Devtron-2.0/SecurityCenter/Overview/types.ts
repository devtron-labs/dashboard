import { Severity, SimpleDataset, SimpleDatasetForPie } from '@devtron-labs/devtron-fe-common-lib'

export enum SecurityGlanceMetricKeys {
    TOTAL_VULNERABILITIES = 'totalVulnerabilities',
    FIXABLE_VULNERABILITIES = 'fixableVulnerabilities',
    ZERO_DAY_VULNERABILITIES = 'zeroDayVulnerabilities',
}

interface SecurityGlanceMetricInfo {
    count: number
    uniqueCount: number
}

export type SecurityGlanceMetricsDTO = Record<SecurityGlanceMetricKeys, SecurityGlanceMetricInfo>

export type SeverityDistribution = Record<Severity, number>

export interface SeverityAgeDistribution {
    lessThan30Days: SeverityDistribution
    between30To60Days: SeverityDistribution
    between60To90Days: SeverityDistribution
    moreThan90Days: SeverityDistribution
}

export interface SeverityInsightsDTO {
    severityDistribution: SeverityDistribution
    ageDistribution: SeverityAgeDistribution
}

export interface SeverityInsights {
    severityDistributionLabels: string[]
    severityDistributionDataset: SimpleDatasetForPie
    ageDistributionDataset: SimpleDataset[]
}

interface VulnerabilityTrendPointDTO extends Record<Severity, number> {
    timestamp: string
    total: number
}

interface VulnerabilityTrendPoint extends VulnerabilityTrendPointDTO {
    timestampLabel: string
}

export interface VulnerabilityTrendDTO {
    trend: VulnerabilityTrendPointDTO[]
}

export interface VulnerabilityTrend {
    trend: VulnerabilityTrendPoint[]
}

interface SecurityStatusType {
    count: number
    percentage: number
}

export enum DeploymentSecurityStatusKeys {
    ACTIVE_DEPLOYMENTS_WITH_VULNERABILITIES = 'activeDeploymentsWithVulnerabilities',
    ACTIVE_DEPLOYMENTS_WITH_UNSCANNED_IMAGES = 'activeDeploymentsWithUnscannedImages',
    WORKFLOWS_WITH_SCANNING_NOT_ENABLED = 'workflowsWithScanningNotEnabled',
}

export interface DeploymentSecurityStatusDTO {
    activeDeploymentsWithVulnerabilities: SecurityStatusType
    activeDeploymentsWithUnscannedImages: SecurityStatusType
    workflowsWithScanningEnabled: SecurityStatusType
}

export interface DeploymentSecurityStatus {
    [DeploymentSecurityStatusKeys.ACTIVE_DEPLOYMENTS_WITH_VULNERABILITIES]: number
    [DeploymentSecurityStatusKeys.ACTIVE_DEPLOYMENTS_WITH_UNSCANNED_IMAGES]: number
    [DeploymentSecurityStatusKeys.WORKFLOWS_WITH_SCANNING_NOT_ENABLED]: number
}

interface BlockedDeploymentTrendPointDTO {
    timestamp: string
    count: number
}

export interface BlockedDeploymentTrendDTO {
    trend: BlockedDeploymentTrendPointDTO[]
}

export interface BlockedDeploymentTrend {
    timestamps: string[]
    timestampLabels: string[]
    blockedCount: number[]
}
