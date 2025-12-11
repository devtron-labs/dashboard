import {
    get,
    getUrlWithSearchParams,
    ProdNonProdSelectValueTypes,
    RelativeTimeWindow,
    useQuery,
} from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '@Config/constants'
import { MetricsInfoCardProps } from '@PagesDevtron2.0/ApplicationManagement/Overview/types'

import { SECURITY_AT_A_GLANCE_CARDS_CONFIG, SECURITY_OVERVIEW_QUERY_KEYS } from './constants'
import {
    BlockedDeploymentTrend,
    BlockedDeploymentTrendDTO,
    DeploymentSecurityStatus,
    DeploymentSecurityStatusDTO,
    SecurityGlanceMetricKeys,
    SecurityGlanceMetricsDTO,
    SeverityInsights,
    SeverityInsightsDTO,
    VulnerabilityTrend,
    VulnerabilityTrendDTO,
} from './types'
import {
    getMetricCardSubtitle,
    getTimestampLabel,
    parseAgeDistributionDatasets,
    parseSeverityDistribution,
    parseSeverityDistributionDatasets,
} from './utils'

export const useGetSecurityGlanceMetrics = () =>
    useQuery<SecurityGlanceMetricsDTO, MetricsInfoCardProps[]>({
        queryKey: [SECURITY_OVERVIEW_QUERY_KEYS.SECURITY_GLANCE],
        queryFn: ({ signal }) => get(Routes.SECURITY_OVERVIEW, { signal }),
        select: (response) =>
            Object.entries(SECURITY_AT_A_GLANCE_CARDS_CONFIG).map(
                ([key, card]: [SecurityGlanceMetricKeys, MetricsInfoCardProps]) => ({
                    ...card,
                    metricValue: (response.result?.[key]?.count ?? 0).toLocaleString(),
                    subtitle: getMetricCardSubtitle(key, response.result?.[key]?.uniqueCount ?? 0),
                }),
            ),
    })

export const useGetSeverityInsights = (envType: ProdNonProdSelectValueTypes) =>
    useQuery<SeverityInsightsDTO, SeverityInsights>({
        queryKey: [SECURITY_OVERVIEW_QUERY_KEYS.SEVERITY_INSIGHTS, envType],
        queryFn: ({ signal }) =>
            get(getUrlWithSearchParams(Routes.SECURITY_SEVERITY_INSIGHTS, { envType: envType.toLowerCase() }), {
                signal,
            }),
        select: (response) => {
            const severityDistribution = parseSeverityDistribution(response.result?.severityDistribution)

            const { accumulatedSeverities, severityDistributionLabels, severityDistributionDataset } =
                parseSeverityDistributionDatasets(severityDistribution)

            const ageDistributionDataset = parseAgeDistributionDatasets(
                response.result?.ageDistribution,
                accumulatedSeverities,
            )

            return {
                severityDistributionLabels,
                severityDistributionDataset,
                ageDistributionDataset,
            }
        },
    })

export const useGetVulnerabilityTrend = (timeRange: RelativeTimeWindow, envType: ProdNonProdSelectValueTypes) =>
    useQuery<VulnerabilityTrendDTO, VulnerabilityTrend>({
        queryKey: [SECURITY_OVERVIEW_QUERY_KEYS.VULNERABILITY_TREND, timeRange, envType],
        queryFn: ({ signal }) =>
            get(
                getUrlWithSearchParams(Routes.SECURITY_VULNERABILITY_TREND, {
                    timeWindow: timeRange,
                    envType: envType.toLowerCase(),
                }),
                { signal },
            ),
        select: (response) => ({
            trend: (response.result?.trend ?? []).map((point) => ({
                ...point,
                timestampLabel: getTimestampLabel(point.timestamp, timeRange),
            })),
        }),
    })

export const useGetDeploymentSecurityStatus = () =>
    useQuery<DeploymentSecurityStatusDTO, DeploymentSecurityStatus>({
        queryKey: [SECURITY_OVERVIEW_QUERY_KEYS.DEPLOYMENT_SECURITY_STATUS],
        queryFn: ({ signal }) => get(Routes.SECURITY_DEPLOYMENT_STATUS, { signal }),
        select: (response) => {
            const {
                activeDeploymentsWithUnscannedImages,
                activeDeploymentsWithVulnerabilities,
                workflowsWithScanningEnabled,
            } = response.result || {}

            return {
                activeDeploymentsWithVulnerabilities: activeDeploymentsWithVulnerabilities?.percentage || 0,
                activeDeploymentsWithUnscannedImages: activeDeploymentsWithUnscannedImages?.percentage || 0,
                workflowsWithScanningNotEnabled: 100 - (workflowsWithScanningEnabled?.percentage || 0),
            }
        },
    })

export const useGetAutoBlockedDeploymentTrend = (timeRange: RelativeTimeWindow) =>
    useQuery<BlockedDeploymentTrendDTO, BlockedDeploymentTrend>({
        queryKey: [SECURITY_OVERVIEW_QUERY_KEYS.AUTO_BLOCKED_DEPLOYMENT_TREND, timeRange],
        queryFn: ({ signal }) =>
            get(getUrlWithSearchParams(Routes.SECURITY_BLOCKED_DEPLOYMENTS_TREND, { timeWindow: timeRange }), {
                signal,
            }),
        select: (response) =>
            (response.result?.trend ?? []).reduce<BlockedDeploymentTrend>(
                (agg, curr) => {
                    agg.timestamps.push(curr.timestamp)
                    agg.blockedCount.push(curr.count || 0)
                    agg.timestampLabels.push(getTimestampLabel(curr.timestamp, timeRange))
                    return agg
                },
                { timestamps: [], blockedCount: [], timestampLabels: [] },
            ),
    })
