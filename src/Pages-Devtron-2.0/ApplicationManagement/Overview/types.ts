import { Never, UseStateFiltersReturnType } from '@devtron-labs/devtron-fe-common-lib'

import { TIME_WINDOW } from '@PagesDevtron2.0/Shared/types'

export interface ChartHeaderTabProps {
    title: string
    subtitle: string
    onClick: () => void
    isLoading: boolean
    isActive?: boolean
}

export type MetricValueDTO =
    | {
          total: number
          percentage?: never
      }
    | { total?: never; percentage: number }

export enum GlanceMetricKeys {
    PROJECTS = 'projects',
    YOUR_APPLICATIONS = 'yourApplications',
    ENVIRONMENTS = 'environments',
}

export type AppsGlanceMetricsSummaryDTO = Record<GlanceMetricKeys, MetricValueDTO>

export enum WorkflowOverviewMetricKeys {
    BUILD_PIPELINES = 'buildPipelines',
    EXTERNAL_IMAGE_SOURCE = 'externalImageSource',
    ALL_DEPLOYMENT_PIPELINES = 'allDeploymentPipelines',
    SCANNING_ENABLED_IN_WORKFLOWS = 'scanningEnabledInWorkflows',
    GITOPS_COMPLIANCE = 'gitOpsComplianceProdPipelines',
    PRODUCTION_PIPELINES = 'productionPipelines',
}

export type WorkflowOverviewMetricsSummaryDTO = Record<WorkflowOverviewMetricKeys, MetricValueDTO>

export interface BuildDeploymentActivityDTO {
    totalBuildTriggers: number
    averageBuildTime: number // In mins
    totalDeploymentTriggers: number
}

export enum AppOverviewDoraMetricsKeys {
    DEPLOYMENT_FREQUENCY = 'deploymentFrequency',
    MEAN_LEAD_TIME = 'meanLeadTime',
    CHANGE_FAILURE_RATE = 'changeFailureRate',
    MEAN_TIME_TO_RECOVERY = 'meanTimeToRecovery',
}

export enum PerformanceLevel {
    ELITE = 'elite',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
}

type DoraMetricsPerformanceLevels = Record<PerformanceLevel, number>

type ComparisonUnit = 'PERCENTAGE' | 'MINUTES' | 'NUMBER'

export interface DoraMetricAverage {
    value: number
    unit: ComparisonUnit
}

interface AppOverviewDoraMetric {
    /**
     * Overall average for all production environments
     */
    overallAverage: DoraMetricAverage
    /**
     * Comparison value with previous period (negative values indicate a decline)
     */
    comparisonValue: number
    /**
     * Unit for comparison value (percentage or minutes)
     */
    comparisonUnit: Exclude<ComparisonUnit, 'NUMBER'>
    /**
     * Performance levels for the deployment pipelines
     */
    performanceLevelCount: DoraMetricsPerformanceLevels
}

export type AppOverviewDoraMetricsDTO = Record<AppOverviewDoraMetricsKeys, AppOverviewDoraMetric> & {
    prodDeploymentPipelineCount: number
}

export interface DoraMetricsChartCardProps extends Pick<
    AppOverviewDoraMetric,
    'comparisonValue' | 'comparisonUnit' | 'performanceLevelCount'
> {
    metricKey: AppOverviewDoraMetricsKeys
    value: string
    /**
     * Indicates if a negative trend value is considered a positive factor
     * @default false
     */
    prodDeploymentPipelineCount: number
}

export interface UseGetAppOverviewDoraMetrics extends Pick<AppOverviewDoraMetricsDTO, 'prodDeploymentPipelineCount'> {
    cardsConfig: Omit<DoraMetricsChartCardProps, 'prodDeploymentPipelineCount'>[]
}

export enum BuildDeployOverviewActivityKind {
    BUILD_TRIGGER = 'buildTrigger',
    AVG_BUILD_TIME = 'avgBuildTime',
    DEPLOYMENT_TRIGGER = 'deploymentTrigger',
}

export enum PipelineType {
    BUILD = 'buildPipelines',
    DEPLOYMENT = 'deploymentPipelines',
}

export interface UseGetPipelineInsightsParams extends Pick<
    UseStateFiltersReturnType<never>,
    'offset' | 'pageSize' | 'sortOrder'
> {
    timeWindow: TIME_WINDOW
    pipelineType: PipelineType
}

interface TriggerCountDetailed {
    total: number
    successful: number
    failed: number
}

interface AverageBuildTime {
    averageBuildTime: number
}

export type BuildDeploymentTriggerTrend = {
    timestamp: string
} & ((TriggerCountDetailed & Never<AverageBuildTime>) | (AverageBuildTime & Never<TriggerCountDetailed>))

export type BuildDeploymentActivityDetailedDTO =
    | {
          avgBuildTimeTrend?: never
          buildTriggersTrend: BuildDeploymentTriggerTrend[]
          deploymentTriggersTrend?: never
      }
    | { avgBuildTimeTrend: BuildDeploymentTriggerTrend[]; buildTriggersTrend?: never; deploymentTriggersTrend?: never }
    | {
          avgBuildTimeTrend?: never
          buildTriggersTrend?: never
          deploymentTriggersTrend: BuildDeploymentTriggerTrend[]
      }

export type BuildDeploymentActivityDetailed = BuildDeploymentTriggerTrend & {
    timestampLabel: string
}

export interface TriggerPipelineType {
    appId: number
    appName: string
    envId: number
    envName: string
    pipelineId: number
    pipelineName: string
    triggerCount: number
}

export interface PipelineInsightsDTO {
    totalCount: number
    pipelines: TriggerPipelineType[]
}
