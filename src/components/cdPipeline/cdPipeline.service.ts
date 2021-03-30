import { Routes } from '../../config';
import { post, get } from '../../services/api';
import { sortCallback } from '../common';
import { getEnvironmentSecrets, getEnvironmentListMinPublic, getEnvironmentConfigs } from '../../services/service';

export function getCDPipelineNameSuggestion(appId: string | number): Promise<any> {
    const URL = `app/pipeline/suggest/cd/${appId}`;
    return get(URL);
}

export function getDeploymentStrategyList(appId) {
    const URL = `${Routes.DEPLOYMENT_STRATEGY}/${appId}`;
    return get(URL);
}

export function saveCDPipeline(request) {
    const URL = `${Routes.CD_CONFIG}`;
    return post(URL, request);
}

export function updateCDPipeline(request) {
    const URL = `${Routes.CD_CONFIG_PATCH}`;
    return post(URL, request);
}

export function deleteCDPipeline(request) {
    const URL = `${Routes.CD_CONFIG_PATCH}`;
    return post(URL, request);
}

export function getCDPipeline(appId: string, pipelineId: string) {
    const URL = `${Routes.CD_CONFIG}/${appId}/${pipelineId}`;
    return get(URL);
}

export async function getCDPipelineConfig(appId: string, pipelineId: string): Promise<any> {
    return Promise.all([getCDPipeline(appId, pipelineId), getEnvironmentListMinPublic()]).then(([cdPipelineRes, envListResponse]) => {
        let envId = cdPipelineRes.result.environmentId;
        let environments = envListResponse.result || [];
        environments = environments.map((env) => {
            return {
                id: env.id,
                name: env.environment_name,
                namespace: env.namespace || "",
                active: envId == env.id,
                isClusterCdActive: env.isClusterCdActive,
            }
        });
        return {
            pipelineConfig: cdPipelineRes.result,
            environments
        }
    })
}

export function getConfigMapAndSecrets(appId: string, envId) {
    return Promise.all([getEnvironmentConfigs(appId, envId), getEnvironmentSecrets(appId, envId)]).then(([configMapResponse, secretResponse]) => {
        let configmaps = configMapResponse.result && configMapResponse.result.configData ? configMapResponse.result.configData : [];
        let secrets = secretResponse.result && secretResponse.result.configData ? secretResponse.result.configData : [];

        configmaps.sort((a, b) => { sortCallback('name', a, b) });
        secrets.sort((a, b) => { sortCallback('name', a, b) });
        configmaps = configmaps.map((configmap) => {
            return {
                name: configmap.name,
                type: 'configmaps'
            }
        })
        secrets = secrets.map((secret) => {
            return {
                name: secret.name,
                type: 'secrets'
            }
        })
        return {
            code: configMapResponse.code,
            result: configmaps.concat(secrets)
        }
    })
}