import { get, ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP, EXTERNAL_TYPES, Routes } from '../../../../config'
import { History } from '../cicdHistory/types'
import {
    DeploymentTemplateList,
    HistoryDiffSelectorList,
    DeploymentHistoryDetail,
    DeploymentHistorySingleValue,
    DeploymentHistory,
} from './cd.type'
import { decode } from '../../../../util/Util'

export interface DeploymentHistoryResult extends ResponseType {
    result?: DeploymentHistoryResultObject
}

export interface DeploymentHistoryResultObject {
    cdWorkflows: History[]
    appReleaseTagNames: string[]
    tagsEditable: boolean
    hideImageTaggingHardDelete: boolean
}

export async function getTriggerHistory(
    appId: number | string,
    envId: number | string,
    pipelineId: number | string,
    pagination,
): Promise<DeploymentHistoryResult> {
    return get(
        `app/cd-pipeline/workflow/history/${appId}/${envId}/${pipelineId}?offset=${pagination.offset}&size=${pagination.size}`,
    ).then(({ result, code, status }) => {
        return {
            result: {
                cdWorkflows: (result.cdWorkflows || []).map((deploymentHistory: DeploymentHistory) => ({
                    ...deploymentHistory,
                    triggerId: deploymentHistory?.cd_workflow_id,
                    podStatus: deploymentHistory?.pod_status,
                    startedOn: deploymentHistory?.started_on,
                    finishedOn: deploymentHistory?.finished_on,
                    pipelineId: deploymentHistory?.pipeline_id,
                    logLocation: deploymentHistory?.log_file_path,
                    triggeredBy: deploymentHistory?.triggered_by,
                    artifact: deploymentHistory?.image,
                    triggeredByEmail: deploymentHistory?.email_id,
                    stage: deploymentHistory?.workflow_type,
                    image: deploymentHistory?.image,
                    imageComment: deploymentHistory?.imageComment,
                    imageReleaseTags: deploymentHistory?.imageReleaseTags,
                    artifactId: deploymentHistory?.ci_artifact_id,
                })),
                appReleaseTagNames: result.appReleaseTagNames,
                tagsEditable: result.tagsEditable,
                hideImageTaggingHardDelete: result.hideImageTaggingHardDelete,
            },
            code,
            status,
        }
    })
}

interface TriggerDetails extends ResponseType {
    result?: History
}

export function getTriggerDetails({ appId, envId, pipelineId, triggerId }): Promise<TriggerDetails> {
    if (triggerId) {
        return get(`${Routes.APP}/cd-pipeline/workflow/trigger-info/${appId}/${envId}/${pipelineId}/${triggerId}`)
    } else {
        return get(`${Routes.APP}/cd-pipeline/workflow/trigger-info/${appId}/${envId}/${pipelineId}/last`)
    }
}

export function getCDBuildReport(appId, envId, pipelineId, workflowId) {
    return get(`app/cd-pipeline/workflow/download/${appId}/${envId}/${pipelineId}/${workflowId}`)
}

export interface DeploymentHistoryDetailRes extends ResponseType {
    result?: DeploymentHistoryDetail
}

export const prepareDeploymentTemplateData = (rawData): Record<string, DeploymentHistorySingleValue> => {
    const deploymentTemplateData = {}
    if (rawData['templateVersion']) {
        deploymentTemplateData['templateVersion'] = { displayName: 'Chart Version', value: rawData['templateVersion'] }
    }
    if (rawData['isAppMetricsEnabled'] || rawData['isAppMetricsEnabled'] === false) {
        deploymentTemplateData['isAppMetricsEnabled'] = {
            displayName: 'Application metrics',
            value: rawData['isAppMetricsEnabled'] ? 'Enabled' : 'Disabled',
        }
    }
    return deploymentTemplateData
}

export const preparePipelineConfigData = (rawData): Record<string, DeploymentHistorySingleValue> => {
    const pipelineConfigData = {}
    if (rawData['pipelineTriggerType']) {
        pipelineConfigData['pipelineTriggerType'] = {
            displayName: 'When do you want the pipeline to execute?',
            value: rawData['pipelineTriggerType'],
        }
    }
    if (rawData['strategy']) {
        pipelineConfigData['strategy'] = {
            displayName: 'Deployment strategy',
            value: rawData['strategy'],
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

    if (rawData['external'] !== undefined) {
        if (rawData['external']) {
            if (rawData['externalType']) {
                secretValues['external'] = {
                    displayName: 'Data type',
                    value: EXTERNAL_TYPES[type][rawData['externalType']],
                }
            } else {
                secretValues['external'] = {
                    displayName: 'Data type',
                    value:
                        type === 'Secret'
                            ? EXTERNAL_TYPES[type]['KubernetesSecret']
                            : EXTERNAL_TYPES[type]['KubernetesConfigMap'],
                }
            }
        } else {
            secretValues['external'] = { displayName: 'Data type', value: EXTERNAL_TYPES[type][''] }
            if (type === 'Secret' && historyData.codeEditorValue.value) {
                const secretData = JSON.parse(historyData.codeEditorValue.value)
                const resolvedSecretData = JSON.parse(historyData.codeEditorValue.resolvedValue)
                let decodeNotRequired =
                    skipDecode || Object.keys(secretData).some((data) => secretData[data] === '*****') // Don't decode in case of non admin user
                historyData.codeEditorValue.value = decodeNotRequired
                    ? historyData.codeEditorValue.value
                    : JSON.stringify(decode(secretData))

                decodeNotRequired =
                    skipDecode || Object.keys(resolvedSecretData).some((data) => resolvedSecretData[data] === '*****') // Don't decode in case of non admin user
                historyData.codeEditorValue.resolvedValue = decodeNotRequired
                    ? historyData.codeEditorValue.resolvedValue
                    : JSON.stringify(decode(resolvedSecretData))    
            }
        }
    }
    if (rawData['type']) {
        let typeValue = 'Environment Variable'
        if (rawData['type'] === 'volume') {
            typeValue = 'Data Volume'
            if (rawData['mountPath']) {
                secretValues['mountPath'] = { displayName: 'Volume mount path', value: rawData['mountPath'] }
            }
            if (rawData['subPath']) {
                secretValues['subPath'] = { displayName: 'Set SubPath', value: 'Yes' }
            }
            if (rawData['filePermission']) {
                secretValues['filePermission'] = {
                    displayName: 'Set file permission',
                    value: rawData['filePermission'],
                }
            }
        }
        secretValues['type'] = {
            displayName: `How do you want to use this ${type}?`,
            value: typeValue,
        }
    }
    if (type === 'Secret') {
        if (rawData['roleARN']) {
            secretValues['roleARN'] = { displayName: 'Role ARN', value: rawData['roleARN'] }
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

export const getDeploymentHistoryDetail = (
    appId: string,
    pipelineId: string,
    id: string,
    historyComponent: string,
    historyComponentName: string,
): Promise<DeploymentHistoryDetailRes> => {
    return get(
        `app/history/deployed-component/detail/${appId}/${pipelineId}/${id}?historyComponent=${historyComponent
            .replace('-', '_')
            .toUpperCase()}${historyComponentName ? '&historyComponentName=' + historyComponentName : ''}`,
    )
}
export interface DeploymentConfigurationsRes extends ResponseType {
    result?: DeploymentTemplateList[]
}

export const getDeploymentHistoryList = (
    appId: string,
    pipelineId: string,
    triggerId: string,
): Promise<DeploymentConfigurationsRes> => {
    return get(`app/history/deployed-configuration/${appId}/${pipelineId}/${triggerId}`)
}

export interface HistoryDiffSelectorRes {
    result?: HistoryDiffSelectorList[]
}

export const getDeploymentDiffSelector = (
    appId: string,
    pipelineId: string,
    historyComponent,
    baseConfigurationId,
    historyComponentName,
): Promise<HistoryDiffSelectorRes> => {
    return get(
        `app/history/deployed-component/list/${appId}/${pipelineId}?baseConfigurationId=${baseConfigurationId}&historyComponent=${historyComponent
            .replace('-', '_')
            .toUpperCase()}${historyComponentName ? '&historyComponentName=' + historyComponentName : ''}`,
    )
}
