/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DOCUMENTATION } from '../../config'

export const getCommonSelectStyles = (styleOverrides = {}) => {
    return {
        control: (base, state) => ({
            ...base,
            minHeight: '32px',
            boxShadow: 'none',
            border: 'none',
            cursor: 'pointer',
        }),
        valueContainer: (base, state) => ({
            ...base,
            padding: '0',
            fontSize: '13px',
            fontWeight: '600',
        }),
        option: (base, state) => ({
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        }),
        container: (base, state) => ({
            ...base,
            width: '100%',
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: 'var(--N400)',
            padding: '0 8px',
            transition: 'all .2s ease',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }),
        loadingMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
        ...styleOverrides,
    }
}

export const EDITOR_VIEW = {
    UNDEFINED: 'UNDEFINED',
    BASIC: 'BASIC',
    ADVANCED: 'ADVANCED',
}

export const CHART_TYPE_TAB_KEYS = { DEVTRON_CHART: 'devtronChart', CUSTOM_CHARTS: 'customCharts' }
export const CHART_TYPE_TAB = { devtronChart: 'Charts by Devtron', customCharts: 'Custom charts' }
export const CHART_DOCUMENTATION_LINK = {
    'Job & CronJob': DOCUMENTATION.JOB_CRONJOB,
    'Rollout Deployment': DOCUMENTATION.ROLLOUT,
    Deployment: DOCUMENTATION.DEPLOYMENT,
}

export const COMPARE_VALUES_TIPPY_CONTENT = {
    compareEnvValueWithOtherValues: 'Compare with values saved for base template or other environments',
    compareBaseValueWithOtherValues: 'Compare base template values with values saved for specific environments',
    comparing: 'Comparing deployment template',
    nothingToCompare: 'Nothing to compare with',
    noCDPipelineCreated: 'No deployment pipelines are created',
}

export const README_TIPPY_CONTENT = {
    fetching: 'Fetching...',
    showing: 'Showing README.md',
    notAvailable: 'Readme is not available for this chart version',
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

export const getDeploymentConfigDropdownStyles = (overridden: boolean) => {
    return {
        control: (base) => ({
            ...base,
            backgroundColor: `${overridden ? 'var(--Y100)' : 'var(--N100)'}`,
            border: 'none',
            boxShadow: 'none',
            minHeight: '32px',
            cursor: 'pointer',
        }),
        option: (base, state) => ({
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        }),
        menu: (base) => ({
            ...base,
            marginTop: '2px',
            minWidth: '240px',
        }),
        menuList: (base) => ({
            ...base,
            position: 'relative',
            paddingBottom: 0,
            paddingTop: 0,
            maxHeight: '250px',
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            padding: 0,
            color: 'var(--N400)',
            transition: 'all .2s ease',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
    }
}

export const getApprovalPendingOption = (selectedChartVersion: string) => {
    return {
        id: 0,
        label: `Approval Pending (v${selectedChartVersion})`,
    }
}

export const getDraftOption = (selectedChartVersion: string, isValues: boolean) => {
    return {
        id: 1,
        label: `${isValues ? 'Values' : 'Manifest'} from draft (v${selectedChartVersion})`,
    }
}

export const NO_SCOPED_VARIABLES_MESSAGE = 'No valid variable found on this page'

export const GUI_VIEW_TEXTS = {
    SWITCH_TO_ADVANCE_BUTTON_TEXT: 'Switch to advance',
}

