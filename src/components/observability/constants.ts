import { IconName } from '@devtron-labs/devtron-fe-common-lib'

export enum GlanceMetricKeys {
    PROJECTS = 'projects',
    TOTAL_VMS = 'totalVms',
    RUNNING_VMS = 'runningVms',
    HEALTH_STATUS = 'healthStatus',
}
export const GLANCE_METRICS_CARDS_CONFIG: Record<
    GlanceMetricKeys,
    {
        iconName: IconName
        metricTitle: string
    }
> = {
    [GlanceMetricKeys.PROJECTS]: {
        iconName: 'ic-bg-project',
        metricTitle: 'Projects',
    },
    [GlanceMetricKeys.TOTAL_VMS]: {
        iconName: 'ic-devtron-app',
        metricTitle: 'Devtron Applications',
    },
    [GlanceMetricKeys.RUNNING_VMS]: {
        iconName: 'ic-helm-app',
        metricTitle: 'Helm Applications',
    },
    [GlanceMetricKeys.HEALTH_STATUS]: {
        iconName: 'ic-bg-environment',
        metricTitle: 'Environments',
    },
}
