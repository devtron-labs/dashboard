import { getUrlWithSearchParams, MetricsInfoCardProps, URLS as COMMON_URLS } from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'
import { TIME_WINDOW } from '@PagesDevtron2.0/Shared/types'

import { GlanceMetricKeys, WorkflowOverviewMetricKeys } from './types'

export const GLANCE_METRICS_CARDS_CONFIG: Record<
    GlanceMetricKeys,
    Omit<MetricsInfoCardProps, 'dataTestId' | 'metricValue'>
> = {
    [GlanceMetricKeys.PROJECTS]: {
        iconName: 'ic-bg-project',
        metricTitle: 'Projects',
        redirectionLink: COMMON_URLS.APPLICATION_MANAGEMENT_PROJECTS,
        tooltipContent: 'Number of projects',
    },
    [GlanceMetricKeys.YOUR_APPLICATIONS]: {
        iconName: 'ic-devtron-app',
        metricTitle: 'Devtron Applications',
        redirectionLink: COMMON_URLS.APPLICATION_MANAGEMENT_APP,
        tooltipContent: 'Micro-services deployed using Kubernetes-native CI/CD with Devtron.',
    },
    [GlanceMetricKeys.ENVIRONMENTS]: {
        iconName: 'ic-bg-environment',
        metricTitle: 'Environments',
        redirectionLink: getUrlWithSearchParams(URLS.GLOBAL_CONFIG_CLUSTER, {
            selectedTab: 'environments',
        }),
        tooltipContent: 'Environments created on Devtron',
    },
}

export const WORKFLOW_OVERVIEW_METRICS_CARDS_CONFIG: Record<
    WorkflowOverviewMetricKeys,
    Omit<MetricsInfoCardProps, 'dataTestId' | 'metricValue' | 'redirectionLink'>
> = {
    [WorkflowOverviewMetricKeys.BUILD_PIPELINES]: {
        iconName: 'ic-bg-build',
        metricTitle: 'Build Pipelines',
        tooltipContent: 'All build pipelines',
    },
    [WorkflowOverviewMetricKeys.EXTERNAL_IMAGE_SOURCE]: {
        iconName: 'ic-bg-webhook',
        metricTitle: 'External Image Source',
        tooltipContent: 'External ci pipeline count',
    },
    [WorkflowOverviewMetricKeys.ALL_DEPLOYMENT_PIPELINES]: {
        iconName: 'ic-bg-deploy',
        metricTitle: 'Deployment Pipelines',
        tooltipContent: 'All deployment pipelines',
    },
    [WorkflowOverviewMetricKeys.SCANNING_ENABLED_IN_WORKFLOWS]: {
        iconName: 'ic-bg-scan',
        metricTitle: 'Scanning Enabled in Workflows',
        tooltipContent: 'Number of workflows with security scanning enabled',
    },
    [WorkflowOverviewMetricKeys.GITOPS_COMPLIANCE]: {
        iconName: 'ic-argocd-app',
        metricTitle: 'GitOps Compliance (Prod Pipelines)',
        tooltipContent: 'Production pipelines deploying with GitOps',
    },
    [WorkflowOverviewMetricKeys.PRODUCTION_PIPELINES]: {
        iconName: 'ic-bg-production-pipelines',
        metricTitle: 'Production Pipelines',
        tooltipContent: 'All production pipelines',
    },
}

export const DEFAULT_TIME_WINDOW = TIME_WINDOW.THIS_MONTH
