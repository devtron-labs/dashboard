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

import {
    post,
    get,
    sortCallback,
    getEnvironmentListMinPublic,
    TriggerType,
    GetTemplateAPIRouteType,
    AppConfigProps,
    getTemplateAPIRoute,
    patch,
    getUrlWithSearchParams,
} from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'
import { getEnvironmentSecrets, getEnvironmentConfigs } from '../../services/service'

export function getCDPipelineNameSuggestion(appId: string | number, isTemplateView: AppConfigProps['isTemplateView']): Promise<any> {
    const URL = isTemplateView ? getTemplateAPIRoute({
        type: GetTemplateAPIRouteType.PIPELINE_SUGGEST_CD,
        queryParams: {
            id: appId,
        }
    }) : `app/pipeline/suggest/cd/${appId}`
    return get(URL)
}

export function getDeploymentStrategyList(appId, isTemplateView) {
    const URL = isTemplateView ? getTemplateAPIRoute({
        type: GetTemplateAPIRouteType.CONFIG_STRATEGY,
        queryParams: {
            id: appId,
        }
    }) : `${Routes.DEPLOYMENT_STRATEGY}/${appId}`
    return get(URL)
}

export function updateCDPipeline(request, isTemplateView: AppConfigProps['isTemplateView']) {
    if (isTemplateView) {
        return patch(
            getTemplateAPIRoute({
                type: GetTemplateAPIRouteType.CD_PIPELINE,
                queryParams: {
                    id: request.appId,
                },
            }),
            request
        )
    }

    return post(Routes.CD_CONFIG_PATCH, request)
}

export function deleteCDPipeline(
    request,
    {
        force,
        cascadeDelete,
        isTemplateView,
    }: {
        force?: boolean
        cascadeDelete?: boolean
        isTemplateView: AppConfigProps['isTemplateView']
    },
) {
    const baseQueryParams = {
        ...(force
            ? { force }
            : {
                  ...(!cascadeDelete ? { cascade: cascadeDelete } : {}),
              }),
    }

    if (isTemplateView) {
        return patch(
            getTemplateAPIRoute({
                type: GetTemplateAPIRouteType.CD_PIPELINE,
                queryParams: {
                    id: request.appId,
                    ...baseQueryParams,
                },
            }),
            request,
        )

    }

    return post(getUrlWithSearchParams(Routes.CD_CONFIG_PATCH, baseQueryParams), request)
}

export function getCDPipelineV2(appId: string, pipelineId: string, isTemplateView: AppConfigProps['isTemplateView']) {
    const URL = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.CD_PIPELINE,
              queryParams: {
                  id: appId,
                  cdPipelineId: pipelineId,
              },
          })
        : `${Routes.V2_CD_CONFIG}/${appId}/${pipelineId}`
    return get(URL)
}

export async function getCDPipelineConfig(appId: string, pipelineId: string, isTemplateView: AppConfigProps['isTemplateView']): Promise<any> {
    return Promise.all([getCDPipelineV2(appId, pipelineId, isTemplateView), getEnvironmentListMinPublic(true)]).then(
        ([cdPipelineRes, envListResponse]) => {
            const envId = cdPipelineRes.result.environmentId
            const cdPipeline = cdPipelineRes.result
            let environments = envListResponse.result || []

            environments = environments.map((env) => {
                return {
                    id: env.id,
                    name: env.environment_name,
                    namespace: env.namespace || '',
                    active: envId == env.id,
                    isClusterCdActive: env.isClusterCdActive,
                    allowedDeploymentTypes: env.allowedDeploymentTypes || [],
                    clusterId: env.cluster_id,
                }
            })

            const env = environments.find((e) => e.id === cdPipeline.environmentId)

            const form = {
                name: cdPipeline.name,
                environmentId: cdPipeline.environmentId,
                clusterId: env.clusterId,
                namespace: env.namespace,
                triggerType: cdPipeline.isManual ? TriggerType.Manual : TriggerType.Auto,
                preBuildStage: cdPipeline.preDeployStage || { id: 0, triggerType: TriggerType.Auto, steps: [] },
                postBuildStage: cdPipeline.postDeployStage || { id: 0, triggerType: TriggerType.Auto, steps: [] },
            }

            return {
                pipelineConfig: cdPipelineRes.result,
                environments,
                form,
            }
        },
    )
}

export function getConfigMapAndSecrets(appId: string, envId, isTemplateView: AppConfigProps['isTemplateView']) {
    return Promise.all([
        getEnvironmentConfigs(appId, envId, isTemplateView),
        getEnvironmentSecrets(appId, envId, isTemplateView),
    ]).then(([configMapResponse, secretResponse]) => {
        const configmaps =
            configMapResponse.result && configMapResponse.result.configData ? configMapResponse.result.configData : []
        const secrets =
            secretResponse.result && secretResponse.result.configData ? secretResponse.result.configData : []

        configmaps.sort((a, b) => {
            sortCallback('name', a, b)
        })
        secrets.sort((a, b) => {
            sortCallback('name', a, b)
        })
        const _configmaps = configmaps.map((configmap) => {
            return {
                name: configmap.name,
                type: 'configmaps',
            }
        })
        const _secrets = secrets.map((secret) => {
            return {
                name: secret.name,
                type: 'secrets',
            }
        })

        const configSecretsList = [
            {
                label: 'ConfigMaps',
                options: configmaps.map((configmap) => {
                    return {
                        label: configmap.name,
                        value: `${configmap.name}-cm`,
                        type: 'configmaps',
                    }
                }),
            },
            {
                label: 'Secrets',
                options: secrets.map((secret) => {
                    return {
                        label: secret.name,
                        value: `${secret.name}-cs`,
                        type: 'secrets',
                    }
                }),
            },
        ]

        return {
            code: configMapResponse.code,
            result: _configmaps.concat(_secrets),
            list: configSecretsList,
        }
    })
}
