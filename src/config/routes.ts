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

import { URLS as COMMON_URLS } from '@devtron-labs/devtron-fe-common-lib'

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
    JOB: '/job',
    CREATE_JOB: 'create-job',
    APPLICATION_GROUP: '/application-group',
    RESOURCE_BROWSER: COMMON_URLS.RESOURCE_BROWSER,
    EXTERNAL_APPS: 'ea',
    DEVTRON_CHARTS: 'dc',
    EXTERNAL_ARGO_APP: 'eaa',
    EXTERNAL_FLUX_APP: 'external-flux',
    APP_LIST: 'list',
    APP_LIST_DEVTRON: 'd',
    APP_LIST_HELM: 'h',
    APP_LIST_ARGO: 'a',
    APP_LIST_FLUX: 'f',
    APPS: '/devtron-apps', // for V2 router
    HELM_CHARTS: 'helm-apps', // for V2 router
    APP_VALUES: 'values', // for V2 router
    APP_DETAILS: 'details',
    APP_DEPLOYMNENT_HISTORY: 'deployments',
    APP_DETAILS_K8: 'k8s-resources', // for V2
    APP_DETAILS_LOG: 'log-analyzer', // for V2
    APP_DETAILS_DEFAULT: 'default-view',
    APP_DIFF_VIEW: 'diff-view',
    APP_TRIGGER: 'trigger',
    APP_OVERVIEW: 'overview',
    APP_CI_DETAILS: 'ci-details',
    APP_CD_DETAILS: 'cd-details',
    APP_DEPLOYMENT_METRICS: 'deployment-metrics',
    APP_CONFIG: 'edit',
    APP_GIT_CONFIG: 'materials',
    APP_DOCKER_CONFIG: 'docker-build-config',
    APP_GITOPS_CONFIG: 'gitops-config',
    APP_DOCKER_OVERRIDE_DETAILS: 'override-details',
    APP_DEPLOYMENT_CONFIG: 'deployment-template',
    APP_WORKFLOW_CONFIG: 'workflow',
    APP_CM_CONFIG: 'configmap',
    APP_CS_CONFIG: 'secrets',
    APP_ENV_OVERRIDE_CONFIG: 'env-override',
    APP_ENV_CONFIG_COMPARE: 'config-compare',
    APP_EXTERNAL_LINKS: 'external-links',
    APP_CI_CONFIG: 'ci-pipeline',
    APP_CD_CONFIG: 'cd-pipeline',
    APP_EXTERNAL_CI_CONFIG: 'external-ci',
    APP_LINKED_CI_CONFIG: 'linked-ci',
    APP_JOB_CI_CONFIG: 'ci-job',
    AUTHENTICATE: '/auth/login',
    BULK_EDITS: '/bulk-edits',
    LINKED_CD: 'linked-cd',
    LOGIN_ADMIN: '/login/admin', //
    LOGIN_SSO: '/login/sso',
    GIT_OPS_CONFIG: '/gitops/config',
    GLOBAL_CONFIG: '/global-config',
    GLOBAL_CONFIG_HOST_URL: '/global-config/host-url',
    GLOBAL_CONFIG_GIT: '/global-config/git',
    GLOBAL_CONFIG_GITOPS: '/global-config/gitops',
    GLOBAL_CONFIG_DOCKER: '/global-config/docker',
    GLOBAL_CONFIG_CLUSTER: '/global-config/cluster-env',
    GLOBAL_CONFIG_CHART: '/global-config/chart-repo',
    GLOBAL_CONFIG_AUTH: '/global-config/auth',
    GLOBAL_CONFIG_AUTH_USER_PERMISSION: '/global-config/auth/users',
    GLOBAL_CONFIG_AUTH_PERMISSION_GROUPS: '/global-config/auth/groups',
    GLOBAL_CONFIG_API: '/api',
    GLOBAL_CONFIG_NOTIFIER: '/global-config/notifier',
    GLOBAL_CONFIG_NOTIFIER_ADD_NEW: '/global-config/notifier/edit',
    GLOBAL_CONFIG_PROJECT: '/global-config/projects',
    GLOBAL_CONFIG_EXTERNAL_LINKS: '/global-config/external-links',
    GLOBAL_CONFIG_CATALOG_FRAMEWORK: '/global-config/catalog-framework',
    GLOBAL_CONFIG_PULL_IMAGE_DIGEST: '/global-config/pull-image-digest',
    GLOBAL_CONFIG_TAGS: '/global-config/tags',
    GLOBAL_CONFIG_PLUGIN_POLICY: '/global-config/plugin-policy',
    GLOBAL_CONFIG_FILTER_CONDITION: '/global-config/filter-condition',
    GLOBAL_CONFIG_LOCK_DEPLOYMENT_CONFIGURATION: '/global-config/lock-deployment-configuration',
    GLOBAL_CONFIG_APPROVAL_POLICY: '/global-config/approval-policy',
    GLOBAL_CONFIG_BUILD_INFRA: '/global-config/build-infra',
    GLOBAL_CONFIG_DEPLOYMENT_WINDOW: '/global-config/deployment-window',
    GLOBAL_CONFIG_IMAGE_PROMOTION: '/global-config/image-promotion',
    GUIDE: 'guide',
    GETTING_STARTED: 'getting-started',
    LINKED_CI_DETAILS: 'linked-ci-details',
    SECURITY: '/security',
    STACK_MANAGER: '/stack-manager',
    STACK_MANAGER_DISCOVER_MODULES: '/stack-manager/discover',
    STACK_MANAGER_DISCOVER_MODULES_DETAILS: '/stack-manager/discover/details',
    STACK_MANAGER_INSTALLED_MODULES: '/stack-manager/installed',
    STACK_MANAGER_INSTALLED_MODULES_DETAILS: '/stack-manager/installed/details',
    STACK_MANAGER_ABOUT: '/stack-manager/about',
    STACK_MANAGER_ABOUT_RELEASES: '/stack-manager/about/releases',
    DEPLOYMENT_HISTORY_CONFIGURATIONS: '/configuration',
    NODES_LIST: '/nodes',
    NODE_DETAILS: '/node-details',
    CHART: '/chart',
    PRESET_VALUES: '/preset-values',
    DEPLOY_CHART: '/deploy-chart',
    DETAILS: '/details',
    RESOURCE_WATCHER: '/resource-watcher',
    RELEASES: '/releases',
    DEVTRON_APP_LIST: '/app/list/d',
    HELM_APP_LIST: '/app/list/h',
    ARGO_APP_LIST: '/app/list/a',
    FLUX_APP_LIST: '/app/list/f',
    BUILD: '/build',
    WEBHOOK_MODAL: 'webhook',
    WEBHOOK_RECEIVED_PAYLOAD_ID: 'payload-id',
    SOFTWARE_DISTRIBUTION_HUB: '/software-distribution-hub',
    MONITORING_DASHBOARD: 'monitoring-dashboard',
    CREATE_CLUSTER: '/create/cluster'
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

export const getAppComposeURL = (appId: string, appStage?: APP_COMPOSE_STAGE, isJobView?: boolean): string => {
    const _url = `${isJobView ? URLS.JOB : URLS.APP}/${appId}/${URLS.APP_CONFIG}`
    if (!appStage) {
        return _url
    }
    for (const stageDetail of ORDERED_APP_COMPOSE_ROUTES) {
        const { stage, path } = stageDetail
        if (stage === appStage) {
            return `${_url}/${path}`
        }
    }
    return `${_url}/${URLS.APP_GIT_CONFIG}`
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
