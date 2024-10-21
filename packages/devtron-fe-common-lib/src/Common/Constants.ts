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

import { RegistryTypeDetailType } from './Types'
import { getContainerRegistryIcon } from './utils'

export const FALLBACK_REQUEST_TIMEOUT = 60000
export const Host = window?.__ORCHESTRATOR_ROOT__ ?? '/orchestrator'

export const DOCUMENTATION_HOME_PAGE = 'https://docs.devtron.ai'
export const DOCUMENTATION_VERSION = '/v/v0.7'
export const DISCORD_LINK = 'https://discord.devtron.ai/'
export const DOCUMENTATION = {
    APP_TAGS: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/create-application#tags`,
    APP_OVERVIEW_TAGS: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/usage/applications/overview#manage-tags`,
    BLOB_STORAGE: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/getting-started/install/installation-configuration#configuration-of-blob-storage`,
    GLOBAL_CONFIG_BUILD_INFRA: `${DOCUMENTATION_HOME_PAGE}${DOCUMENTATION_VERSION}/global-configurations/build-infra`,
}

export const PATTERNS = {
    KUBERNETES_KEY_PREFIX: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/,
    KUBERNETES_KEY_NAME: /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])$/,
    START_END_ALPHANUMERIC: /^([Az09].*[A-Za-z0-9])$|[A-Za-z0-9]$/,
    ALPHANUMERIC_WITH_SPECIAL_CHAR: /^[A-Za-z0-9._-]+$/, // allow alphanumeric,(.) ,(-),(_)
    ESCAPED_CHARACTERS: /[.*+?^${}()|[\]\\]/g,
}

export const URLS = {
    LOGIN_SSO: '/login/sso',
    PERMISSION_GROUPS: '/global-config/auth/groups',
    APP: '/app',
    APP_LIST: 'list',
    CHARTS_DISCOVER: '/chart-store/discover',
    JOB: '/job',
    CREATE_JOB: 'create-job',
    GETTING_STARTED: 'getting-started',
    STACK_MANAGER_ABOUT: '/stack-manager/about',
    APP_LIST_HELM: 'h',
    APP_CI_DETAILS: 'ci-details',
    LOGS: 'Logs',
    CREATE: '/create',
    RELEASES: '/releases',
    DEVTRON_CHARTS: 'dc',
    APP_DEPLOYMNENT_HISTORY: 'deployments',
    APP_DETAILS: 'details',
    APP_DETAILS_K8: 'k8s-resources', // for V2
    DETAILS: '/details',
    CD_DETAILS: 'cd-details',
    APP_TRIGGER: 'trigger',
    GLOBAL_CONFIG_DOCKER: '/global-config/docker',
    DEPLOYMENT_HISTORY_CONFIGURATIONS: '/configuration',
    GLOBAL_CONFIG_SCOPED_VARIABLES: '/global-config/scoped-variables',
    GLOBAL_CONFIG_DEPLOYMENT_CHARTS_LIST: '/global-config/deployment-charts',
    NETWORK_STATUS_INTERFACE: '/network-status-interface',
}

export const ROUTES = {
    APP: 'app',
    APP_ARTIFACT_PROMOTE_MATERIAL: 'app/artifact/promotion-request/material',
    PROJECT_LIST_MIN: 'team/autocomplete',
    USER_CHECK_ROLE: 'user/check/roles',
    IMAGE_TAGGING: 'app/image-tagging',
    CI_CONFIG_GET: 'app/ci-pipeline',
    CD_MATERIAL_GET: 'app/cd-pipeline',
    DEPLOYMENT_TEMPLATE_LIST: 'app/template/list',
    INFRA_CONFIG_PROFILE: 'infra-config/profile',
    SECURITY_SCAN_EXECUTION_DETAILS: 'security/scan/executionDetail',
    NOTIFIER: 'notification',
    APP_LIST: 'app/list',
    TELEMETRY_EVENT: 'telemetry/event',
    SERVER_INFO_API: 'server',
    ATTRIBUTES_USER: 'attributes/user',
    UPDATE: 'update',
    ENVIRONMENT_LIST_MIN: 'env/autocomplete',
    CLUSTER: 'cluster',
    API_RESOURCE: 'k8s/api-resources',
    GVK: 'gvk',
    NAMESPACE: 'env/namespace',
    CLUSTER_NOTE: 'cluster/note',
    APPLICATION_NOTE: 'app/note',
    GIT_HOST_EVENT: 'git/host/event',
    HELM_DEPLOYMENT_STATUS_TIMELINE_INSTALLED_APP: 'app-store/deployment-status/timeline',
    DEPLOYMENT_STATUS: 'app/deployment-status/timeline',
    MANUAL_SYNC: 'app/deployment-status/manual-sync',
    CD_CONFIG: 'app/cd-pipeline',
    CONFIG_CD_PIPELINE: 'config/cd-pipeline',
    MODULE_CONFIGURED: 'module/config',
    RESOURCE_HISTORY_DEPLOYMENT: 'resource/history/deployment',
    ATTRIBUTES: 'attributes',
    ATTRIBUTES_CREATE: 'attributes/create',
    ATTRIBUTES_UPDATE: 'attributes/update',
    APP_LIST_MIN: 'app/min',
    CLUSTER_LIST_MIN: 'cluster/autocomplete',
    PLUGIN_GLOBAL_LIST_DETAIL_V2: 'plugin/global/list/detail/v2',
    PLUGIN_GLOBAL_LIST_V2: 'plugin/global/list/v2',
    PLUGIN_GLOBAL_LIST_TAGS: 'plugin/global/list/tags',
    PLUGIN_LIST_MIN: 'plugin/global/list/v2/min',
    DEPLOYMENT_CHARTS_LIST: 'deployment/template/fetch',
    USER_LIST_MIN: 'user/list/min',
    CONFIG_DATA: 'config/data',
}

export enum KEY_VALUE {
    KEY = 'key',
    VALUE = 'value',
}

export const DEFAULT_TAG_DATA = {
    key: '',
    value: '',
    propagate: false,
    isInvalidKey: false,
    isInvalidValue: false,
    isSuggested: true,
}

export enum ERROR_STATUS_CODE {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PERMISSION_DENIED = 403,
    NOT_FOUND = 404,
    EXPECTATION_FAILED = 417,
    INTERNAL_SERVER_ERROR = 500,
    BAD_GATEWAY = 502,
    SERVICE_TEMPORARY_UNAVAILABLE = 503,
}

export const TOAST_ACCESS_DENIED = {
    TITLE: 'Access denied',
    SUBTITLE: 'You do not have required access to perform this action',
}

// Empty state messgaes
export const ERROR_EMPTY_SCREEN = {
    PAGE_NOT_FOUND: 'Not found',
    PAGE_NOT_EXIST: 'Error 404: The requested resource could not be found. Please check the URL and try again.',
    TAKE_BACK_HOME: 'Go back home',
    REPORT_ISSUE: 'Report issue',
    ONLY_FOR_SUPERADMIN: 'Information on this page is available only to superadmin users.',
    NOT_AUTHORIZED: 'Not authorized',
    REQUIRED_MANAGER_ACCESS:
        'Looks like you don’t have access to information on this page. Please contact your manager to request access.',
    BAD_REQUEST: 'Bad request',
    BAD_REQUEST_MESSAGE:
        'Error 400: The request could not be understood by the server due to malformed syntax. Please check your request and try again.',
    TRY_AGAIN: 'Try again',
    UNAUTHORIZED: 'Unauthorized',
    UNAUTHORIZED_MESSAGE:
        'Error 401: You are not authorized to access this resource. Please contact your administrator for assistance.',
    FORBIDDEN: 'Forbidden',
    FORBIDDEN_MESSAGE:
        'Error 403: You are not authorized to access this resource. Please contact your administrator for assistance.',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    INTERNAL_SERVER_ERROR_MESSAGE:
        'Error 500: The server encountered an unexpected condition that prevented it from fulfilling the request. Please try again later.',
    BAD_GATEWAY: 'Bad gateway',
    BAD_GATEWAY_MESSAGE:
        'Error 500: The server received an invalid response from an upstream server. Please try again later.',
    SERVICE_TEMPORARY_UNAVAILABLE: 'Service temporary unavailable',
    SERVICE_TEMPORARY_UNAVAILABLE_MESSAGE:
        'Error 503: The server is currently unable to handle the request due to a temporary overload or maintenance. Please try again later.',
}
export const TOKEN_COOKIE_NAME = 'argocd.token'
export const TriggerTypeMap = {
    automatic: 'Auto',
    manual: 'Manual',
}

export const BuildStageVariable = {
    PreBuild: 'preBuildStage',
    Build: 'buildStage',
    PostBuild: 'postBuildStage',
}

export const REGISTRY_TYPE_MAP: Record<string, RegistryTypeDetailType> = {
    ecr: {
        value: 'ecr',
        label: 'ECR',
        desiredFormat: '(desired format: repo-name)',
        placeholderText: 'Eg. repo_name',
        gettingStartedLink: 'https://docs.aws.amazon.com/AmazonECR/latest/userguide/get-set-up-for-amazon-ecr.html',
        defaultRegistryURL: '',
        registryURL: {
            label: 'Registry URL',
            defaultValue: '',
            placeholder: 'Eg. xxxxxxxxxxxx.dkr.ecr.region.amazonaws.com',
        },
        id: {
            label: 'Access key ID',
            defaultValue: '',
            placeholder: '',
        },
        password: {
            label: 'Secret access key',
            defaultValue: '',
            placeholder: '',
        },
        startIcon: getContainerRegistryIcon('ecr'),
    },
    'docker-hub': {
        value: 'docker-hub',
        label: 'Docker',
        desiredFormat: '(desired format: username/repo-name)',
        placeholderText: 'Eg. username/repo_name',
        gettingStartedLink: 'https://docs.docker.com/docker-hub/',
        defaultRegistryURL: 'docker.io',
        registryURL: {
            label: 'Registry URL',
            defaultValue: '',
            placeholder: '',
        },
        id: {
            label: 'Username',
            defaultValue: '',
            placeholder: '',
        },
        password: {
            label: 'Password/Token (Recommended: Token)',
            defaultValue: '',
            placeholder: '',
        },
        startIcon: getContainerRegistryIcon('docker-hub'),
    },
    acr: {
        value: 'acr',
        label: 'Azure',
        desiredFormat: '(desired format: repo-name)',
        placeholderText: 'Eg. repo_name',
        gettingStartedLink:
            'https://docs.microsoft.com/en-us/azure/container-registry/container-registry-get-started-portal',
        defaultRegistryURL: '',
        registryURL: {
            label: 'Registry URL/Login Server',
            defaultValue: '',
            placeholder: 'Eg. xxx.azurecr.io',
        },
        id: {
            label: 'Username/Registry Name',
            defaultValue: '',
            placeholder: '',
        },
        password: {
            label: 'Password',
            defaultValue: '',
            placeholder: '',
        },
        startIcon: getContainerRegistryIcon('acr'),
    },
    'artifact-registry': {
        value: 'artifact-registry',
        label: 'Artifact Registry (GCP)',
        desiredFormat: '(desired format: project-id/artifacts-repo/repo-name)',
        placeholderText: 'Eg. project-id/artifacts-repo/repo-name',
        gettingStartedLink: 'https://cloud.google.com/artifact-registry/docs/manage-repos?hl=en_US',
        defaultRegistryURL: '',
        registryURL: {
            label: 'Registry URL',
            defaultValue: '',
            placeholder: 'Eg. region-docker.pkg.dev',
        },
        id: {
            label: 'Username',
            defaultValue: '_json_key',
            placeholder: '',
        },
        password: {
            label: 'Service Account JSON File',
            defaultValue: '',
            placeholder: 'Paste json file content here',
        },
        startIcon: getContainerRegistryIcon('artifact-registry'),
    },
    gcr: {
        value: 'gcr',
        label: 'GCR',
        desiredFormat: '(desired format: project-id/repo-name)',
        placeholderText: 'Eg. project-id/repo_name',
        gettingStartedLink: 'https://cloud.google.com/container-registry/docs/quickstart',
        defaultRegistryURL: 'gcr.io',
        registryURL: {
            label: 'Registry URL',
            defaultValue: 'gcr.io',
            placeholder: '',
        },
        id: {
            label: 'Username',
            defaultValue: '_json_key',
            placeholder: '',
        },
        password: {
            label: 'Service Account JSON File',
            defaultValue: '',
            placeholder: 'Paste json file content here',
        },
        startIcon: getContainerRegistryIcon('gcr'),
    },
    quay: {
        value: 'quay',
        label: 'Quay',
        desiredFormat: '(desired format: username/repo-name)',
        placeholderText: 'Eg. username/repo_name',
        gettingStartedLink: '',
        defaultRegistryURL: 'quay.io',
        registryURL: {
            label: 'Registry URL',
            defaultValue: '',
            placeholder: '',
        },
        id: {
            label: 'Username',
            defaultValue: '',
            placeholder: '',
        },
        password: {
            label: 'Token',
            defaultValue: '',
            placeholder: '',
        },
        startIcon: getContainerRegistryIcon('quay'),
    },
    other: {
        value: 'other',
        label: 'Other',
        desiredFormat: '',
        placeholderText: '',
        gettingStartedLink: '',
        defaultRegistryURL: '',
        registryURL: {
            label: 'Registry URL',
            defaultValue: '',
            placeholder: '',
        },
        id: {
            label: 'Username',
            defaultValue: '',
            placeholder: '',
        },
        password: {
            label: 'Password/Token',
            defaultValue: '',
            placeholder: '',
        },
        startIcon: getContainerRegistryIcon('other'),
    },
}

export const RepositoryAction = {
    CONTAINER: 'CONTAINER',
    CHART_PULL: 'CHART_PULL',
    CHART_PUSH: 'CHART_PUSH',
}

export enum MODES {
    YAML = 'yaml',
    JSON = 'json',
    SHELL = 'shell',
    DOCKERFILE = 'dockerfile',
    PLAINTEXT = 'plaintext',
}

// The values are going to be part of route that's why they may contain -
export enum APPROVAL_MODAL_TYPE {
    CONFIG = 'CONFIG',
    DEPLOYMENT = 'DEPLOYMENT',
    IMAGE_PROMOTION = 'IMAGE-PROMOTION',
}
export const MAX_Z_INDEX = 2147483647

export const SELECTED_APPROVAL_TAB_STATE = {
    APPROVAL: 'approval',
    PENDING: 'pending',
}

export enum SortingOrder {
    /**
     * Ascending order
     */
    ASC = 'ASC',
    /**
     * Descending order
     */
    DESC = 'DESC',
}

/**
 * Base page size for pagination
 */
export const DEFAULT_BASE_PAGE_SIZE = 20

/**
 * Deployment Window
 */
export enum MODAL_TYPE {
    HIBERNATE = 'HIBERNATE',
    UNHIBERNATE = 'UNHIBERNATE',
    RESTORE = 'RESTORE',
    DEPLOY = 'DEPLOY',
    RESOURCE = 'RESOURCE',
    RESTART = 'RESTART',
    PIPELINE = 'PIPELINE',
    OVERVIEW = 'OVERVIEW',
    APP_DETAILS_STATUS = 'APP_DETAILS_STATUS',
}

export enum ACTION_STATE {
    ALLOWED = 'ALLOWED',
    PARTIAL = 'PARTIAL',
    BLOCKED = 'BLOCKED',
}

export enum DEPLOYMENT_WINDOW_TYPE {
    MAINTENANCE = 'MAINTENANCE',
    BLACKOUT = 'BLACKOUT',
}
export const arrowUnicode = '\u279d'

export enum WEEK_DAYS_ENUM {
    SUNDAY = 'SUNDAY',
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
}

export enum FREQUENCY_ENUM {
    FIXED = 'FIXED',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
    WEEKLY_RANGE = 'WEEKLY_RANGE',
}

export function getOrdinal(number) {
    if (number % 100 >= 11 && number % 100 <= 13) {
        return `${number}th`
    }
    switch (number % 10) {
        case 1:
            return `${number}st`
        case 2:
            return `${number}nd`
        case 3:
            return `${number}rd`
        default:
            return `${number}th`
    }
}

export const TIME_HOUR_SUFFIX_FOR_12_HOUR_FORMAT = {
    AM: 'AM',
    PM: 'PM',
    MIDNIGHT: 'midnight',
    NOON: 'noon',
}

export const getTimeStampAMPMSuffix = (time: string): string => {
    // time is in format HH:mm 24hr format
    const [hoursStr, minutesStr] = time.split(':')
    const hours = parseInt(hoursStr, 10)
    const minutes = parseInt(minutesStr, 10)

    if (hours === 12 && minutes === 0) {
        return TIME_HOUR_SUFFIX_FOR_12_HOUR_FORMAT.NOON
    }
    if (hours === 0 && minutes === 0) {
        return TIME_HOUR_SUFFIX_FOR_12_HOUR_FORMAT.MIDNIGHT
    }
    if (hours >= 12) {
        return TIME_HOUR_SUFFIX_FOR_12_HOUR_FORMAT.PM
    }
    return TIME_HOUR_SUFFIX_FOR_12_HOUR_FORMAT.AM
}

export enum ReactSelectInputAction {
    inputChange = 'input-change',
    selectOption = 'select-option',
    deselectOption = 'deselect-option',
    removeValue = 'remove-value',
}

export const ZERO_TIME_STRING = '0001-01-01T00:00:00Z'

// Excluding 0 from this list as 0 is a valid value
export const EXCLUDED_FALSY_VALUES = [undefined, null, '', NaN] as const

export const API_STATUS_CODES = {
    OK: 200,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PERMISSION_DENIED: 403,
    NOT_FOUND: 404,
    EXPECTATION_FAILED: 417,
}

export enum SERVER_MODE {
    EA_ONLY = 'EA_ONLY',
    FULL = 'FULL',
}

export const POSTHOG_EVENT_ONBOARDING = {
    PREVIEW: 'Preview',
    DEPLOY_CUSTOM_APP_CI_CD: 'Deploy custom app using CI/CD pipelines',
    INSTALL_CUSTOM_CI_CD: 'Install CI/CD',
    VIEW_APPLICATION: 'View helm application',
    BROWSE_HELM_CHART: 'Browse helm chart',
    CONNECT_CLUSTER: 'Connect cluster',
    CONNECT_CHART_REPOSITORY: 'Connect chart repository',
    TOOLTIP_OKAY: 'Tooltip okay',
    TOOLTIP_DONT_SHOW_AGAIN: 'Tooltip Dont show again',
    HELP: 'Clicked Help',
    SKIP_AND_EXPLORE_DEVTRON: 'SkippedOnboarding',
}
export const MAX_LOGIN_COUNT = 5
export const LOGIN_COUNT = 'login-count'
export const DEFAULT_ENV = 'devtron-ci'

export const DATE_TIME_FORMATS = {
    TWELVE_HOURS_FORMAT: 'ddd, DD MMM YYYY, hh:mm A',
    TWELVE_HOURS_FORMAT_WITHOUT_WEEKDAY: 'DD MMM YYYY, hh:mm A',
    TWELVE_HOURS_EXPORT_FORMAT: 'DD-MMM-YYYY hh.mm A',
    DD_MMM_YYYY_HH_MM: 'DD MMM YYYY, hh:mm',
    DD_MMM_YYYY: 'DD MMM YYYY',
}

export const SEMANTIC_VERSION_DOCUMENTATION_LINK = 'https://semver.org/'

export const VULNERABILITIES_SORT_PRIORITY = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
    unknown: 5,
}

// TODO: might not work need to verify
export const IS_PLATFORM_MAC_OS = window.navigator.userAgent.toUpperCase().includes('MAC')
