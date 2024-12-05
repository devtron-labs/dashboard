import { DOCUMENTATION } from '@Config/constants'

export const BASE_DEPLOYMENT_TEMPLATE_ENV_ID = -1
export const PROTECT_BASE_DEPLOYMENT_TEMPLATE_IDENTIFIER_DTO = 'BaseDeploymentTemplate' as const

export const CHART_TYPE_TAB_KEYS = { DEVTRON_CHART: 'devtronChart', CUSTOM_CHARTS: 'customCharts' }
export const CHART_TYPE_TAB = { devtronChart: 'Charts by Devtron', customCharts: 'Custom charts' }

export const CHART_DOCUMENTATION_LINK = {
    'Job & CronJob': DOCUMENTATION.JOB_CRONJOB,
    'Rollout Deployment': DOCUMENTATION.ROLLOUT,
    Deployment: DOCUMENTATION.DEPLOYMENT,
}

export const GUI_VIEW_TEXTS = {
    SWITCH_TO_ADVANCE_BUTTON_TEXT: 'Switch to advance',
}

export const DEPLOYMENT_TEMPLATE_LABELS_KEYS = {
    applicationMetrics: {
        label: 'Show application metrics',
        learnMore: 'Learn more',
        supported:
            'Capture and show key application metrics over time. (E.g. Status codes 2xx, 3xx, 5xx; throughput and latency).',
        notSupported: (selectedChartName: string): string =>
            `Application metrics is not supported for ${selectedChartName} version.`,
    },
    baseTemplate: {
        key: 'base',
        label: 'Base deployment template',
        allowOverrideText:
            'Base configurations are being inherited for this environment. Allow override to fork and edit.',
    },
    codeEditor: {
        warning: 'Chart type cannot be changed once saved.',
    },
    otherEnv: {
        key: 'env',
        label: 'Values on other environments',
        publishedLabel: 'Published on environments',
        noOptions: { label: 'No options', value: 0, kind: 'env' },
    },
    otherVersion: {
        key: 'chartVersion',
        label: 'Default values',
        version: 'version',
        noOptions: { label: 'No options', value: 0, kind: 'chartVersion' },
    },
}

export const NO_SCOPED_VARIABLES_MESSAGE = 'No valid variable found on this page'

export const CHART_NAME_TO_DOC_SEGMENT: Readonly<Record<string, string>> = {
    Deployment: 'deployment',
    'Job & CronJob': 'cronjob',
    'Rollout Deployment': 'reference',
    StatefulSet: 'statefulset',
}
