export interface NavItem {
    title: string
    href: string
    stage: number
    isLocked: boolean
}

export const URLS = {
    CHARTS: '/chart-store',
    CHARTS_DISCOVER: '/chart-store/discover',
    APP: '/app',
    EXTERNAL_APPS: 'ea',
    DEVTRON_CHARTS: 'dc',
    APP_LIST: 'list',
    APP_LIST_DEVTRON: 'd',
    APP_LIST_HELM: 'h',
    APPS: '/devtron-apps', // for V2 router
    HELM_CHARTS: 'helm-apps', // for V2 router
    APP_VALUES: 'values', // for V2 router
    APP_DETAILS: 'details',
    APP_DEPLOYMNENT_HISTORY: 'deployments',
    APP_DETAILS_K8: 'k8s-resources', // for V2
    APP_DETAILS_LOG: 'log-analyzer', // for V2
    APP_DETAILS_DEFAULT: 'default-view',
    APP_TRIGGER: 'trigger',
    APP_CI_DETAILS: 'ci-details',
    APP_CD_DETAILS: 'cd-details',
    APP_DEPLOYMENT_METRICS: 'deployment-metrics',
    APP_CONFIG: 'edit',
    APP_GIT_CONFIG: 'materials',
    APP_DOCKER_CONFIG: 'docker-build-config',
    APP_DEPLOYMENT_CONFIG: 'deployment-template',
    APP_WORKFLOW_CONFIG: 'workflow',
    APP_CM_CONFIG: 'configmap',
    APP_CS_CONFIG: 'secrets',
    APP_ENV_OVERRIDE_CONFIG: 'env-override',
    APP_CI_CONFIG: 'ci-pipeline',
    APP_CD_CONFIG: 'cd-pipeline',
    APP_EXTERNAL_CI_CONFIG: 'external-ci',
    APP_LINKED_CI_CONFIG: 'linked-ci',
    AUTHENTICATE: '/auth/login',
    BULK_EDITS: '/bulk-edits',
    DEPLOYMENT_GROUPS: '/deployment-groups',
    LOGIN_ADMIN: '/login/admin', //
    LOGIN_SSO: '/login/sso',
    GLOBAL_CONFIG: '/global-config',
    GLOBAL_CONFIG_HOST_URL: '/global-config/host-url',
    GLOBAL_CONFIG_GIT: '/global-config/git',
    GLOBAL_CONFIG_GITOPS: '/global-config/gitops',
    GLOBAL_CONFIG_DOCKER: '/global-config/docker',
    GLOBAL_CONFIG_CLUSTER: '/global-config/cluster-env',
    GLOBAL_CONFIG_CHART: '/global-config/chart-repo',
    GLOBAL_CONFIG_CUSTOM_CHARTS: '/global-config/custom-charts',
    GLOBAL_CONFIG_AUTH: '/global-config/auth',
    GLOBAL_CONFIG_API: '/api',
    GLOBAL_CONFIG_NOTIFIER: '/global-config/notifier',
    GLOBAL_CONFIG_NOTIFIER_ADD_NEW: '/global-config/notifier/edit',
    GLOBAL_CONFIG_PROJECT: '/global-config/projects',
    GLOBAL_CONFIG_LOGIN: '/global-config/login-service',
    GLOBAL_CONFIG_EXTERNAL_LINKS: '/global-config/external-links',
    GUIDE: 'guide',
    SECURITY: '/security',
    STACK_MANAGER: '/stack-manager',
    STACK_MANAGER_DISCOVER_MODULES: '/stack-manager/discover',
    STACK_MANAGER_DISCOVER_MODULES_DETAILS: '/stack-manager/discover/details',
    STACK_MANAGER_INSTALLED_MODULES: '/stack-manager/installed',
    STACK_MANAGER_INSTALLED_MODULES_DETAILS: '/stack-manager/installed/details',
    STACK_MANAGER_ABOUT: '/stack-manager/about',
    STACK_MANAGER_ABOUT_RELEASES: '/stack-manager/about/releases',
    DEPLOYMENT_HISTORY_CONFIGURATIONS: '/configuration',
    CLUSTER_LIST: '/clusters',
    NODES_LIST: '/nodes',
    NODE_DETAILS: '/node-details',
    CHART: '/chart',
    PRESET_VALUES: '/preset-values',
}

export enum APP_COMPOSE_STAGE {
    SOURCE_CONFIG = 'MATERIAL',
    CI_CONFIG = 'CI_CONFIG',
    DEPLOYMENT_TEMPLATE = 'DEPLOYMENT_TEMPLATE',
    WORKFLOW_EDITOR = 'WORKFLOW_EDITOR',
    CONFIG_MAPS = 'CONFIG_MAPS',
    SECRETS = 'SECRETS',
    ENV_OVERRIDE = 'ENV_OVERRIDE',
}

export const ORDERED_APP_COMPOSE_ROUTES: { stage: string; path: string }[] = [
    { stage: APP_COMPOSE_STAGE.SOURCE_CONFIG, path: URLS.APP_GIT_CONFIG },
    { stage: APP_COMPOSE_STAGE.CI_CONFIG, path: URLS.APP_DOCKER_CONFIG },
    { stage: APP_COMPOSE_STAGE.DEPLOYMENT_TEMPLATE, path: URLS.APP_DEPLOYMENT_CONFIG },
    { stage: APP_COMPOSE_STAGE.WORKFLOW_EDITOR, path: URLS.APP_WORKFLOW_CONFIG },
    { stage: APP_COMPOSE_STAGE.CONFIG_MAPS, path: URLS.APP_CM_CONFIG },
    { stage: APP_COMPOSE_STAGE.SECRETS, path: URLS.APP_CS_CONFIG },
    { stage: APP_COMPOSE_STAGE.ENV_OVERRIDE, path: URLS.APP_ENV_OVERRIDE_CONFIG },
]

export const getAppComposeURL = (appId: string, appStage?: APP_COMPOSE_STAGE): string => {
    if (!appStage) return `${URLS.APP}/${appId}/${URLS.APP_CONFIG}`
    for (let stageDetail of ORDERED_APP_COMPOSE_ROUTES) {
        const { stage, path } = stageDetail
        if (stage === appStage) return `${URLS.APP}/${appId}/${URLS.APP_CONFIG}/${path}`
    }
    return `${URLS.APP}/${appId}/${URLS.APP_CONFIG}/${URLS.APP_GIT_CONFIG}`
}

export function getAppDetailsURL(appId: number | string, envId?: number | string): string {
    let url = `${URLS.APP}/${appId}/${URLS.APP_DETAILS}`
    if (envId) {
        url = `${url}/${envId}`
    }
    return url
}

export function getAppTriggerURL(appId: number | string): string {
    return `${URLS.APP}/${appId}/${URLS.APP_TRIGGER}`
}
export function getAppCIURL(appId: number | string, ciPipelineId: number | string, buildId: number | string): string {
    let url = `${URLS.APP}/${appId}/${URLS.APP_CI_DETAILS}`
    if (ciPipelineId) {
        url = `${url}/${ciPipelineId}`
        if (buildId) {
            url = `${url}/${buildId}`
        }
    }
    return url
}
export function getAppCDURL(
    appId: number | string,
    envId?: number | string,
    cdPipelineId?: number | string,
    triggerId?: number | string,
): string {
    let url = `${URLS.APP}/${appId}/${URLS.APP_CD_DETAILS}`
    if (envId) {
        url = `${url}/${envId}`
        if (cdPipelineId) {
            url = `${url}/${cdPipelineId}`
            if (triggerId) {
                url = `${url}/${triggerId}`
            }
        }
    }
    return url
}
export function getAppDeploymentMetricsURL(appId: number | string): string {
    return `${URLS.APP}/${appId}/${URLS.APP_DEPLOYMENT_METRICS}`
}

enum APP_CONFIG_STAGES {
    APP = 'APP',
    MATERIAL = 'MATERIAL',
    TEMPLATE = 'TEMPLATE',
    CI_PIPELINE = 'CI_PIPELINE',
    CHART = 'CHART',
    CD_PIPELINE = 'CD_PIPELINE',
    CHART_ENV_CONFIG = 'CHART_ENV_CONFIG',
}

interface StageStatusResponseItem {
    stage: number
    stageName: APP_CONFIG_STAGES
    status: boolean
    required: boolean
}

export function isCIPipelineCreated(responseArr: StageStatusResponseItem[]): boolean {
    let ciPipeline = responseArr.find((item) => item.stageName === 'CI_PIPELINE')
    return ciPipeline.status
}

export function isCDPipelineCreated(responseArr: StageStatusResponseItem[]): boolean {
    let cdPipeline = responseArr.find((item) => item.stageName === 'CD_PIPELINE')
    return cdPipeline.status
}
