import {
    ChartColorKey,
    FixAvailabilityOptions,
    getUrlWithSearchParams,
    ProdNonProdSelectValueTypes,
    SelectPickerOptionType,
    Severity,
    URLS,
    VulnerabilityDiscoveryAgeOptions,
} from '@devtron-labs/devtron-fe-common-lib'

import { MetricsInfoCardProps } from '@PagesDevtron2.0/ApplicationManagement/Overview/types'

import { DeploymentSecurityStatusKeys, SecurityGlanceMetricKeys } from './types'

export const SECURITY_AT_A_GLANCE_CARDS_CONFIG: Record<
    SecurityGlanceMetricKeys,
    Omit<MetricsInfoCardProps, 'metricValue'>
> = {
    [SecurityGlanceMetricKeys.TOTAL_VULNERABILITIES]: {
        metricTitle: 'Total Vulnerabilities',
        dataTestId: SecurityGlanceMetricKeys.TOTAL_VULNERABILITIES,
        iconName: 'ic-security-vulnerability',
        tooltipContent: 'Total number of vulnerabilities found across currently active deployments',
        redirectionLink: URLS.SECURITY_CENTER_VULNERABILITY_CVES,
    },
    [SecurityGlanceMetricKeys.FIXABLE_VULNERABILITIES]: {
        metricTitle: 'Fixable Vulnerabilities',
        dataTestId: SecurityGlanceMetricKeys.FIXABLE_VULNERABILITIES,
        iconName: 'ic-security-fixable',
        tooltipContent: 'Discovered vulnerabilities on currently active deployments whose fix is available',
        redirectionLink: getUrlWithSearchParams(URLS.SECURITY_CENTER_VULNERABILITY_CVES, {
            fixAvailability: FixAvailabilityOptions.FIX_AVAILABLE,
        }),
    },
    [SecurityGlanceMetricKeys.ZERO_DAY_VULNERABILITIES]: {
        metricTitle: 'Zero-day Vulnerabilities',
        dataTestId: SecurityGlanceMetricKeys.ZERO_DAY_VULNERABILITIES,
        iconName: 'ic-security-not-fixable',
        tooltipContent: 'Discovered vulnerabilities on currently active deployments whose fix is not available',
        redirectionLink: getUrlWithSearchParams(URLS.SECURITY_CENTER_VULNERABILITY_CVES, {
            fixAvailability: FixAvailabilityOptions.FIX_NOT_AVAILABLE,
        }),
    },
}

export const SEVERITY_ORDER = [Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM, Severity.LOW, Severity.UNKNOWN]
export const AGE_DISTRIBUTION_CHART_LABELS = ['< 30 days old', '30-60 days old', '60-90 days old', '> 90 days old']
export const AGE_DISTRIBUTION_FILTERS = Object.values(VulnerabilityDiscoveryAgeOptions)

export const SEVERITY_CHART_COLOR_MAP: Record<Severity, ChartColorKey> = {
    [Severity.CRITICAL]: 'CoralRed600',
    [Severity.HIGH]: 'CoralRed500',
    [Severity.MEDIUM]: 'SunsetOrange500',
    [Severity.LOW]: 'GoldenYellow500',
    [Severity.UNKNOWN]: 'CharcoalGray300',
}

export const DEPLOYMENT_SECURITY_STATUS_METRIC_TITLE: Record<DeploymentSecurityStatusKeys, string> = {
    [DeploymentSecurityStatusKeys.ACTIVE_DEPLOYMENTS_WITH_VULNERABILITIES]: 'Active Deployments with Vulnerabilities',
    [DeploymentSecurityStatusKeys.ACTIVE_DEPLOYMENTS_WITH_UNSCANNED_IMAGES]: 'Active Deployments with Unscanned Images',
    [DeploymentSecurityStatusKeys.WORKFLOWS_WITH_SCANNING_NOT_ENABLED]: 'Workflows with Scanning not Enabled',
}

export const DEPLOYMENT_SECURITY_STATUS_TOOLTIP_CONTENT: Record<DeploymentSecurityStatusKeys, string[]> = {
    [DeploymentSecurityStatusKeys.ACTIVE_DEPLOYMENTS_WITH_VULNERABILITIES]: [
        'Active deployments with vulnerabilities',
        'Active deployments without vulnerabilities',
    ],
    [DeploymentSecurityStatusKeys.ACTIVE_DEPLOYMENTS_WITH_UNSCANNED_IMAGES]: [
        'Active deployments with unscanned images',
        'Active deployments with scanned images',
    ],
    [DeploymentSecurityStatusKeys.WORKFLOWS_WITH_SCANNING_NOT_ENABLED]: [
        'Workflows with scanning not enabled',
        'Workflows with scanning enabled',
    ],
}

export const SECURITY_OVERVIEW_QUERY_KEYS = {
    SECURITY_GLANCE: 'securityOverviewGlanceMetrics',
    SEVERITY_INSIGHTS: 'securityOverviewSeverityInsights',
    VULNERABILITY_TREND: 'securityOverviewVulnerabilityTrend',
    DEPLOYMENT_SECURITY_STATUS: 'securityOverviewDeploymentSecurityStatus',
    AUTO_BLOCKED_DEPLOYMENT_TREND: 'securityOverviewAutoBlockedDeploymentTrend',
}

export const PROD_NON_PROD_OPTIONS: SelectPickerOptionType<ProdNonProdSelectValueTypes>[] = Object.values(
    ProdNonProdSelectValueTypes,
).map((type) => ({
    label: `${type} Deployments`,
    value: type,
}))
