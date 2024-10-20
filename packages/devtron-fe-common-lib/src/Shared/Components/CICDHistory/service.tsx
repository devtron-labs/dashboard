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

/* eslint-disable dot-notation */
import { ROUTES, ResponseType, get, getUrlWithSearchParams, trash } from '../../../Common'
import { ResourceKindType, ResourceVersionType } from '../../types'
import { DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP, EXTERNAL_TYPES } from '../../constants'
import {
    DeploymentConfigurationsRes,
    DeploymentHistoryDetail,
    DeploymentHistoryDetailRes,
    DeploymentHistoryResult,
    DeploymentHistorySingleValue,
    DeploymentStatusDetailsResponse,
    FetchIdDataStatus,
    HistoryDiffSelectorRes,
    ModuleConfigResponse,
    TriggerDetailsResponseType,
    TriggerHistoryParamsType,
} from './types'
import { getParsedTriggerHistory, getTriggerHistoryFilterCriteria } from './utils'
import { decode } from '../../Helpers'

const getTriggerDetailsQuery = (fetchIdData) => {
    if (fetchIdData && fetchIdData === FetchIdDataStatus.FETCHING) {
        return '?SHOW_APPLIED_FILTERS=true'
    }

    return ''
}

export function getTriggerDetails({
    appId,
    envId,
    pipelineId,
    triggerId,
    fetchIdData,
}): Promise<TriggerDetailsResponseType> {
    if (triggerId) {
        return get(
            `${ROUTES.APP}/cd-pipeline/workflow/trigger-info/${appId}/${envId}/${pipelineId}/${triggerId}${getTriggerDetailsQuery(fetchIdData)}`,
        )
    }
    return get(
        `${ROUTES.APP}/cd-pipeline/workflow/trigger-info/${appId}/${envId}/${pipelineId}/last${getTriggerDetailsQuery(fetchIdData)}`,
    )
}

export const getTagDetails = (params) => {
    const URL = `${ROUTES.IMAGE_TAGGING}/${params.pipelineId}/${params.artifactId}`
    return get(URL)
}

export const cancelCiTrigger = (params, isForceAbort) => {
    const URL = `${ROUTES.CI_CONFIG_GET}/${params.pipelineId}/workflow/${params.workflowId}?forceAbort=${isForceAbort}`
    return trash(URL)
}

export const cancelPrePostCdTrigger = (pipelineId, workflowRunner) => {
    const URL = `${ROUTES.CD_MATERIAL_GET}/${pipelineId}/workflowRunner/${workflowRunner}`
    return trash(URL)
}

export function getDeploymentStatusDetail(
    appId: string,
    envId: string,
    showTimeline: boolean,
    triggerId?: string,
    isHelmApps?: boolean,
    installedAppVersionHistoryId?: number,
): Promise<DeploymentStatusDetailsResponse> {
    let appendUrl
    if (isHelmApps) {
        appendUrl = ROUTES.HELM_DEPLOYMENT_STATUS_TIMELINE_INSTALLED_APP
    } else {
        appendUrl = ROUTES.DEPLOYMENT_STATUS
    }
    return get(
        `${appendUrl}/${appId}/${envId}${`?showTimeline=${showTimeline}`}${triggerId ? `&wfrId=${triggerId}` : ``}${installedAppVersionHistoryId ? `&installedAppVersionHistoryId=${installedAppVersionHistoryId}` : ''}`,
    )
}

export function getManualSync(params: { appId: string; envId: string }): Promise<ResponseType> {
    return get(`${ROUTES.MANUAL_SYNC}/${params.appId}/${params.envId}`)
}

export const getDeploymentHistoryList = (
    appId: string,
    pipelineId: string,
    triggerId: string,
): Promise<DeploymentConfigurationsRes> => get(`app/history/deployed-configuration/${appId}/${pipelineId}/${triggerId}`)

export const getDeploymentHistoryDetail = (
    appId: string,
    pipelineId: string,
    id: string,
    historyComponent: string,
    historyComponentName: string,
): Promise<DeploymentHistoryDetailRes> =>
    get(
        `app/history/deployed-component/detail/${appId}/${pipelineId}/${id}?historyComponent=${historyComponent
            .replace('-', '_')
            .toUpperCase()}${historyComponentName ? `&historyComponentName=${historyComponentName}` : ''}`,
    )

export const prepareDeploymentTemplateData = (rawData): Record<string, DeploymentHistorySingleValue> => {
    const deploymentTemplateData = {}
    if (rawData.templateVersion) {
        deploymentTemplateData['templateVersion'] = { displayName: 'Chart Version', value: rawData.templateVersion }
    }
    if (rawData.isAppMetricsEnabled || rawData.isAppMetricsEnabled === false) {
        deploymentTemplateData['isAppMetricsEnabled'] = {
            displayName: 'Application metrics',
            value: rawData.isAppMetricsEnabled ? 'Enabled' : 'Disabled',
        }
    }
    return deploymentTemplateData
}

export const preparePipelineConfigData = (rawData): Record<string, DeploymentHistorySingleValue> => {
    const pipelineConfigData = {}
    if (rawData.pipelineTriggerType) {
        pipelineConfigData['pipelineTriggerType'] = {
            displayName: 'When do you want the pipeline to execute?',
            value: rawData.pipelineTriggerType,
        }
    }
    if (rawData.strategy) {
        pipelineConfigData['strategy'] = {
            displayName: 'Deployment strategy',
            value: rawData.strategy,
        }
    }
    return pipelineConfigData
}

export const prepareConfigMapAndSecretData = (
    rawData,
    type: string,
    historyData: DeploymentHistoryDetail,
    skipDecode?: boolean,
): Record<string, DeploymentHistorySingleValue> => {
    const secretValues = {}

    if (rawData.external !== undefined) {
        if (rawData.external) {
            if (rawData.externalType) {
                secretValues['external'] = {
                    displayName: 'Data type',
                    value: EXTERNAL_TYPES[type][rawData.externalType],
                }
            } else {
                secretValues['external'] = {
                    displayName: 'Data type',
                    value:
                        type === 'Secret'
                            ? EXTERNAL_TYPES[type].KubernetesSecret
                            : EXTERNAL_TYPES[type].KubernetesConfigMap,
                }
            }
        } else {
            secretValues['external'] = { displayName: 'Data type', value: EXTERNAL_TYPES[type][''] }
            if (type === 'Secret' && historyData.codeEditorValue.value) {
                const secretData = JSON.parse(historyData.codeEditorValue.value)
                let resolvedSecretData = {}
                if (historyData.codeEditorValue?.resolvedValue) {
                    resolvedSecretData = JSON.parse(historyData.codeEditorValue.resolvedValue)
                }
                const decodeNotRequired =
                    skipDecode || Object.keys(secretData).some((data) => secretData[data] === '*****') // Don't decode in case of non admin user

                // eslint-disable-next-line no-param-reassign
                historyData.codeEditorValue.value = decodeNotRequired
                    ? historyData.codeEditorValue.value
                    : JSON.stringify(decode(secretData))
                // eslint-disable-next-line no-param-reassign
                historyData.codeEditorValue.resolvedValue = decodeNotRequired
                    ? historyData.codeEditorValue.resolvedValue
                    : JSON.stringify(decode(resolvedSecretData))
            }
        }
    }
    if (rawData.type) {
        let typeValue = 'Environment Variable'
        if (rawData.type === 'volume') {
            typeValue = 'Data Volume'
            if (rawData.mountPath || rawData.defaultMountPath) {
                secretValues['mountPath'] = {
                    displayName: 'Volume mount path',
                    value: rawData.mountPath || rawData.defaultMountPath,
                }
            }
            if (rawData.subPath) {
                secretValues['subPath'] = { displayName: 'Set SubPath', value: 'Yes' }

                if (rawData.esoSubPath) {
                    secretValues['subPathValues'] = { displayName: 'SubPath', value: rawData.esoSubPath.join(', ') }
                } else if (
                    rawData.external &&
                    rawData.externalType === 'KubernetesSecret' &&
                    historyData.codeEditorValue?.resolvedValue
                ) {
                    const resolvedSecretData = JSON.parse(historyData.codeEditorValue.resolvedValue)
                    secretValues['subPathValues'] = {
                        displayName: 'SubPath',
                        value: Object.keys(resolvedSecretData).join(', '),
                    }
                }
            }
            if (rawData.filePermission) {
                secretValues['filePermission'] = {
                    displayName: 'Set file permission',
                    value: rawData.filePermission,
                }
            }
        }
        secretValues['type'] = {
            displayName: `How do you want to use this ${type}?`,
            value: typeValue,
        }
    }
    if (type === 'Secret') {
        if (rawData.roleARN) {
            secretValues['roleARN'] = { displayName: 'Role ARN', value: rawData.roleARN }
        }
    }
    return secretValues
}

export const prepareHistoryData = (
    rawData,
    historyComponent: string,
    skipDecode?: boolean,
): DeploymentHistoryDetail => {
    let values
    const historyData = { codeEditorValue: rawData.codeEditorValue, values: {} }
    // eslint-disable-next-line no-param-reassign
    delete rawData.codeEditorValue
    if (historyComponent === DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.DEPLOYMENT_TEMPLATE.VALUE) {
        values = prepareDeploymentTemplateData(rawData)
    } else if (historyComponent === DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.PIPELINE_STRATEGY.VALUE) {
        values = preparePipelineConfigData(rawData)
    } else {
        values = prepareConfigMapAndSecretData(
            rawData,
            historyComponent === DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.CONFIGMAP.VALUE
                ? DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.CONFIGMAP.DISPLAY_NAME
                : DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.SECRET.DISPLAY_NAME,
            historyData,
            skipDecode,
        )
    }
    historyData.values = values
    return historyData
}

export const getDeploymentDiffSelector = (
    pipelineId: string,
    historyComponent,
    baseConfigurationId,
    historyComponentName,
): Promise<HistoryDiffSelectorRes> => {
    const url = getUrlWithSearchParams(
        `${ROUTES.RESOURCE_HISTORY_DEPLOYMENT}/${ROUTES.CONFIG_CD_PIPELINE}/${ResourceVersionType.v1}`,
        {
            baseConfigurationId,
            historyComponent: historyComponent.replace('-', '_').toUpperCase(),
            filterCriteria: `cd-pipeline|id|${pipelineId}`,
            historyComponentName,
        },
    )
    return get(url)
}

export const getTriggerHistory = async ({
    appId,
    envId,
    pagination,
    releaseId,
    showCurrentReleaseDeployments = false,
}: TriggerHistoryParamsType): Promise<Pick<DeploymentHistoryResult, 'result'>> => {
    const url = getUrlWithSearchParams(
        `${ROUTES.RESOURCE_HISTORY_DEPLOYMENT}/${ResourceKindType.cdPipeline}/${ResourceVersionType.v1}`,
        {
            filterCriteria: getTriggerHistoryFilterCriteria({ appId, envId, releaseId, showCurrentReleaseDeployments }),
            offset: pagination.offset,
            limit: pagination.size,
        },
    )
    const { result } = await get(url)
    const parsedResult = getParsedTriggerHistory(result)
    return { result: parsedResult }
}

export const getModuleConfigured = (moduleName: string): Promise<ModuleConfigResponse> =>
    get(`${ROUTES.MODULE_CONFIGURED}?name=${moduleName}`)
