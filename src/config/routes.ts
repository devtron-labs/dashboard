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

import { AppConfigProps, URLS as COMMON_URLS, EnvResourceType, ROUTER_URLS } from '@devtron-labs/devtron-fe-common-lib'
import { generatePath } from 'react-router-dom'

export const CREATE_CLUSTER_PATH = 'create/cluster/:type'

/** @deprecated */
export const URLS = {
    APP_VALUES: 'values',
    APP_DETAILS: 'details',
    APP_DEPLOYMNENT_HISTORY: 'deployments',
    APP_DETAILS_K8: 'k8s-resources', // for V2
    APP_DETAILS_LOG: 'log-analyzer', // for V2
    APP_DIFF_VIEW: 'diff-view',
    APP_OVERVIEW: 'overview',
    MANAGE_TRAFFIC: 'manage-traffic',
    APP_CI_DETAILS: 'ci-details',
    APP_CD_DETAILS: 'cd-details',
    APP_GIT_CONFIG: 'materials',
    APP_DOCKER_CONFIG: 'docker-build-config',
    APP_GITOPS_CONFIG: 'gitops-config',
    APP_DEPLOYMENT_CONFIG: EnvResourceType.DeploymentTemplate,
    APP_WORKFLOW_CONFIG: 'workflow',
    APP_CM_CONFIG: EnvResourceType.ConfigMap,
    APP_CS_CONFIG: EnvResourceType.Secret,
    APP_ENV_OVERRIDE_CONFIG: 'env-override',
    APP_ENV_CONFIG_COMPARE: 'config-compare',
    APP_EXTERNAL_LINKS: 'external-links',
    APP_CI_CONFIG: 'ci-pipeline',
    APP_CD_CONFIG: 'cd-pipeline',
    APP_CI_CD_CONFIG: 'ci-cd-pipeline',
    APP_EXTERNAL_CI_CONFIG: 'external-ci',
    APP_LINKED_CI_CONFIG: 'linked-ci',
    APP_JOB_CI_CONFIG: 'ci-job',
    AUTHENTICATE: '/auth/login',
    BASE_CONFIG: 'base-config',
    LINKED_CD: 'linked-cd',
    GLOBAL_CONFIG_CREATE_CLUSTER: `${ROUTER_URLS.GLOBAL_CONFIG_CLUSTER_ENV}/${CREATE_CLUSTER_PATH}`,
    LINKED_CI_DETAILS: 'linked-ci-details',
    NODES_LIST: '/nodes',
    NODE_DETAILS: '/node-details',
    CHART: '/chart',
    PRESET_VALUES: '/preset-values',
    DEPLOY_CHART: '/deploy-chart',
    DETAILS: '/details',
    BUILD: '/build',
    CREATE_ENVIRONMENT: '/create/environment',
    POD_SPREAD: 'pod-spread',
    HIBERNATION_RULES: 'hibernation-rules',
    DELETE_CLUSTER: 'delete-cluster',
} as const

export enum APP_COMPOSE_STAGE {
    SOURCE_CONFIG = 'MATERIAL',
    CI_CONFIG = 'CI_CONFIG',
    DEPLOYMENT_TEMPLATE = 'DEPLOYMENT_TEMPLATE',
    WORKFLOW_EDITOR = 'WORKFLOW_EDITOR',
    CONFIG_MAPS = 'CONFIG_MAPS',
    SECRETS = 'SECRETS',
    ENV_OVERRIDE = 'ENV_OVERRIDE',
}

const ORDERED_APP_COMPOSE_ROUTES: { stage: string; path: string }[] = [
    { stage: APP_COMPOSE_STAGE.SOURCE_CONFIG, path: URLS.APP_GIT_CONFIG },
    { stage: APP_COMPOSE_STAGE.CI_CONFIG, path: URLS.APP_DOCKER_CONFIG },
    { stage: APP_COMPOSE_STAGE.DEPLOYMENT_TEMPLATE, path: `${URLS.BASE_CONFIG}/${URLS.APP_DEPLOYMENT_CONFIG}` },
    { stage: APP_COMPOSE_STAGE.WORKFLOW_EDITOR, path: URLS.APP_WORKFLOW_CONFIG },
    { stage: APP_COMPOSE_STAGE.CONFIG_MAPS, path: `${URLS.BASE_CONFIG}/${URLS.APP_CM_CONFIG}` },
    { stage: APP_COMPOSE_STAGE.SECRETS, path: `${URLS.BASE_CONFIG}/${URLS.APP_CS_CONFIG}` },
    { stage: APP_COMPOSE_STAGE.ENV_OVERRIDE, path: URLS.APP_ENV_OVERRIDE_CONFIG },
]

export const getAppComposeURL = (
    appId: string,
    appStage: APP_COMPOSE_STAGE | null,
    isJobView: boolean | null,
    isTemplateView: AppConfigProps['isTemplateView'],
): string => {
    const _url = isTemplateView
        ? `${generatePath(ROUTER_URLS.APP_TEMPLATE_DETAIL, {
              appId,
          })}/${COMMON_URLS.APP_CONFIG}`
        : `${isJobView ? ROUTER_URLS.JOBS : ROUTER_URLS.DEVTRON_APP}/${appId}/${COMMON_URLS.APP_CONFIG}`
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
