import { ConfigKeysWithLockType, SelectPickerOptionType, TemplateListType } from '@devtron-labs/devtron-fe-common-lib'
import { DOCUMENTATION } from '@Config/constants'
import { CompareWithOptionGroupKindType } from './types'

export const BASE_DEPLOYMENT_TEMPLATE_ENV_ID = -1
export const PROTECT_BASE_DEPLOYMENT_TEMPLATE_IDENTIFIER_DTO = 'BaseDeploymentTemplate' as const

/**
 * Have'nt added base deployment template as it would be always there on top
 */
export const COMPARE_WITH_OPTIONS_ORDER: Record<string, CompareWithOptionGroupKindType[]> = {
    BASE_TEMPLATE: [TemplateListType.PublishedOnEnvironments, TemplateListType.DefaultVersions],
    OVERRIDDEN: [
        TemplateListType.DeployedOnSelfEnvironment,
        TemplateListType.PublishedOnEnvironments,
        TemplateListType.DefaultVersions,
    ],
}

export const COMPARE_WITH_BASE_TEMPLATE_OPTION: SelectPickerOptionType = {
    label: 'Base deployment template',
    value: BASE_DEPLOYMENT_TEMPLATE_ENV_ID,
}

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

export const DEFAULT_LOCKED_KEYS_CONFIG: Readonly<ConfigKeysWithLockType> = {
    config: [],
    allowed: false,
}
