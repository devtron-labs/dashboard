import { get } from '../../../../services/api'
import { Routes } from '../../../../config'
import { History } from '../cIDetails/types'
import { ResponseType } from '../../../../services/service.types'
import {
    DeploymentTemplateList,
    HistoryDiffSelectorList,
    DeploymentHistoryDetail,
    DeploymentHistorySingleValue,
} from './cd.type'
import { string } from 'prop-types'

export interface DeploymentHistory {
    id: number
    cd_workflow_id: number
    name: string
    status: string
    pod_status: string
    message: string
    started_on: string
    finished_on: string
    pipeline_id: number
    namespace: string
    log_file_path: string
    triggered_by: number
    email_id?: string
    image: string
    workflow_type?: string
}

interface DeploymentHistoryResult extends ResponseType {
    result?: History[]
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
            result: (result || []).map((deploymentHistory: DeploymentHistory) => ({
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
            })),
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

const prepareDeploymentTemplateData = (rawData): Record<string, DeploymentHistorySingleValue> => {
    let deploymentTemplateData = {}
    if (rawData['templateVersion']) {
        deploymentTemplateData['templateVersion'] = { displayName: 'Chart Version', value: rawData['templateVersion'] }
    }
    if (rawData['isAppMetricsEnabled'] || rawData['isAppMetricsEnabled'] === false) {
        deploymentTemplateData['isAppMetricsEnabled'] = {
            displayName: 'Application metrics',
            value: rawData['isAppMetricsEnabled'] ? 'Disabled' : 'Enabled',
        }
    }
    return deploymentTemplateData
}

const preparePipelineConfigData = (rawData): Record<string, DeploymentHistorySingleValue> => {
    let pipelineConfigData = {}
    if (rawData['templateVersion']) {
        pipelineConfigData['templateVersion'] = {
            displayName: 'When do you want the pipeline to execute?',
            value: rawData['templateVersion'],
        }
    }
    if (rawData['templateVersion']) {
        pipelineConfigData['templateVersion'] = {
            displayName: 'Deploy to environment',
            value: rawData['templateVersion'],
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

const prepareConfigMapAndSecretData = (rawData, type: string): Record<string, DeploymentHistorySingleValue> => {
    let secretValues = {}

    if (rawData['external']) {
        if (rawData['externalType']) {
            secretValues['external'] = { displayName: 'Data type', value: rawData['externalType'] }
        } else {
            secretValues['external'] = { displayName: 'Data type', value: `Kubernetes External ${type}` }
        }
    } else {
        secretValues['external'] = { displayName: 'Data type', value: `Kubernetes ${type}` }
    }
    if (rawData['type']) {
        let typeValue = 'Environment Variable'
        if (rawData['templateVersion'] === 'volume') {
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
    if ((type = 'Secret')) {
        if (rawData['roleARN']) {
            secretValues['roleARN'] = { displayName: 'Role ARN', value: rawData['roleARN'] }
        }
    }
    return secretValues
}

export const prepareHistoryData = (rawData, historyComponent: string): DeploymentHistoryDetail => {
    let values
    let historyData = { codeEditorValue: rawData.codeEditorValue, values: {} }
    delete rawData.codeEditorValue
    if (historyComponent === 'DEPLOYMENT_TEMPLATE') {
        values = prepareDeploymentTemplateData(rawData)
    } else if (historyComponent === 'PIPELINE_STRATEGY') {
        values = preparePipelineConfigData(rawData)
    } else {
        values = prepareConfigMapAndSecretData(rawData, historyComponent === 'CONFIGMAP' ? 'ConfigMap' : 'Secret')
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
        `app/history/deployed-component/detail/${appId}/${pipelineId}/${id}?historyComponent=${historyComponent}${
            historyComponentName ? '&historyComponentName=' + historyComponentName : ''
        }`,
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
        `app/history/deployed-component/list/${appId}/${pipelineId}?baseConfigurationId=${baseConfigurationId}&historyComponent=${historyComponent}${
            historyComponentName ? '&historyComponentName=' + historyComponentName : ''
        }`,
    )
}
