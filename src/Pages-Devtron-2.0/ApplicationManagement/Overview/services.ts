import {
    get,
    getUrlWithSearchParams,
    RelativeTimeWindow,
    ROUTES,
    TIME_WINDOW,
    useQuery,
} from '@devtron-labs/devtron-fe-common-lib'

import { GLANCE_METRICS_CARDS_CONFIG, WORKFLOW_OVERVIEW_METRICS_CARDS_CONFIG } from './constants'
import {
    AppOverviewDoraMetricsDTO,
    AppOverviewDoraMetricsKeys,
    AppsGlanceMetricsSummaryDTO,
    BuildDeploymentActivityDetailed,
    BuildDeploymentActivityDetailedDTO,
    BuildDeploymentActivityDTO,
    BuildDeployOverviewActivityKind,
    GlanceMetricKeys,
    MetricsInfoCardProps,
    PipelineInsightsDTO,
    UseGetAppOverviewDoraMetrics,
    UseGetPipelineInsightsParams,
    WorkflowOverviewMetricKeys,
    WorkflowOverviewMetricsSummaryDTO,
} from './types'
import {
    getActivityKindTrendFromResult,
    getValueStringForDoraMetric,
    getValueStringFromMetricItem,
    parseTimestampAccToWindow,
} from './utils'

export const useGetGlanceConfig = () =>
    useQuery<AppsGlanceMetricsSummaryDTO, MetricsInfoCardProps[]>({
        queryKey: ['glanceConfig'],
        queryFn: ({ signal }) => get<AppsGlanceMetricsSummaryDTO>(ROUTES.APPS_OVERVIEW, { signal }),
        select: ({ result }) =>
            Object.entries(GLANCE_METRICS_CARDS_CONFIG).map(
                ([key, config]: [GlanceMetricKeys, MetricsInfoCardProps]) => ({
                    ...config,
                    dataTestId: key,
                    metricValue: getValueStringFromMetricItem(result?.[key]),
                }),
            ),
    })

export const useGetWorkflowOverviewConfig = () =>
    useQuery<WorkflowOverviewMetricsSummaryDTO, MetricsInfoCardProps[]>({
        queryKey: ['workflowOverviewConfig'],
        queryFn: ({ signal }) => get<WorkflowOverviewMetricsSummaryDTO>(ROUTES.WORKFLOW_OVERVIEW, { signal }),
        select: ({ result }) => {
            const totalDeploymentPipelines = result?.allDeploymentPipelines.total
            return Object.entries(WORKFLOW_OVERVIEW_METRICS_CARDS_CONFIG).map(
                ([key, config]: [WorkflowOverviewMetricKeys, MetricsInfoCardProps]) => ({
                    ...config,
                    dataTestId: key,
                    metricValue: getValueStringFromMetricItem(result?.[key]),
                    valueOutOf:
                        key === WorkflowOverviewMetricKeys.PRODUCTION_PIPELINES && totalDeploymentPipelines
                            ? totalDeploymentPipelines.toLocaleString()
                            : undefined,
                }),
            )
        },
    })

export const useGetAppOverviewDoraMetrics = (timeWindow: RelativeTimeWindow) =>
    useQuery<AppOverviewDoraMetricsDTO, UseGetAppOverviewDoraMetrics>({
        queryKey: ['appOverviewDoraMetrics', timeWindow],
        queryFn: ({ signal }) =>
            get<AppOverviewDoraMetricsDTO>(getUrlWithSearchParams(ROUTES.DORA_METRICS, { timeWindow }), { signal }),
        select: ({ result }) => {
            const prodDeploymentPipelineCount = result?.prodDeploymentPipelineCount ?? 0
            return {
                cardsConfig: prodDeploymentPipelineCount
                    ? Object.values(AppOverviewDoraMetricsKeys).map((key: AppOverviewDoraMetricsKeys) => {
                          const isDeclinePositive = key !== AppOverviewDoraMetricsKeys.DEPLOYMENT_FREQUENCY
                          const { overallAverage, comparisonValue, comparisonUnit, performanceLevelCount } = result[key]

                          const value = getValueStringForDoraMetric(overallAverage)

                          return {
                              metricKey: key,
                              value: key === AppOverviewDoraMetricsKeys.DEPLOYMENT_FREQUENCY ? `${value} /day` : value,
                              comparisonUnit,
                              comparisonValue,
                              performanceLevelCount,
                              isDeclinePositive,
                          }
                      })
                    : [],
                prodDeploymentPipelineCount,
            }
        },
    })

export const useGetBuildDeploymentActivity = (timeWindow: TIME_WINDOW) =>
    useQuery<BuildDeploymentActivityDTO>({
        queryKey: ['buildDeploymentActivity', timeWindow],
        queryFn: ({ signal }) =>
            get<BuildDeploymentActivityDTO>(getUrlWithSearchParams(ROUTES.BUILD_DEPLOYMENT_ACTIVITY, { timeWindow }), {
                signal,
            }),
        select: ({ result }) => {
            const parsedResponse = {
                totalDeploymentTriggers: result?.totalDeploymentTriggers ?? 0,
                totalBuildTriggers: result?.totalBuildTriggers ?? 0,
                averageBuildTime: result?.averageBuildTime ?? 0,
            }
            return parsedResponse
        },
    })

export const useGetBuildDeploymentActivityDetailed = (
    timeWindow: TIME_WINDOW,
    activityKind: BuildDeployOverviewActivityKind,
) =>
    useQuery<BuildDeploymentActivityDetailedDTO, BuildDeploymentActivityDetailed[]>({
        queryKey: ['buildDeploymentActivityDetailed', timeWindow, activityKind],
        queryFn: ({ signal }) =>
            get<BuildDeploymentActivityDetailedDTO>(
                getUrlWithSearchParams(ROUTES.BUILD_DEPLOYMENT_ACTIVITY_DETAILED, { timeWindow, activityKind }),
                { signal },
            ),
        select: ({ result }) => {
            const triggerTrend = getActivityKindTrendFromResult(activityKind, result)
            const parsedResult = triggerTrend.map((item) => ({
                ...item,
                timestampLabel: parseTimestampAccToWindow(item?.timestamp ?? '', timeWindow),
            }))
            return parsedResult
        },
    })

export const useGetPipelineInsights = ({
    timeWindow,
    pipelineType,
    offset,
    pageSize,
    sortOrder,
}: UseGetPipelineInsightsParams) =>
    useQuery<PipelineInsightsDTO, PipelineInsightsDTO>({
        queryKey: ['pipelineInsights', timeWindow, pipelineType, offset, pageSize, sortOrder],
        queryFn: ({ signal }) =>
            get<PipelineInsightsDTO>(
                getUrlWithSearchParams(ROUTES.PIPELINE_INSIGHTS, {
                    timeWindow,
                    pipelineType,
                    offset,
                    limit: pageSize,
                    sortOrder,
                }),
                { signal },
            ),
        select: ({ result }) => {
            const pipelines = result?.pipelines ?? []

            return {
                totalCount: result?.totalCount ?? 0,
                pipelines,
            }
        },
    })
