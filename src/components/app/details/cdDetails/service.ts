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

export function getDeploymentTemplateDiff(appId: string, pipelineId: string) {
    return get(`app/history/template/${appId}/${pipelineId}?offset=0&size=20`)
}
export interface DeploymentHistoryDetailRes extends ResponseType {
    result?: DeploymentHistoryDetail
}

const prepareDeploymentTemplateData = (rawData): DeploymentHistorySingleValue => {
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
    return deploymentTemplateData as DeploymentHistorySingleValue
}

const preparePipelineConfigData = (rawData): DeploymentHistorySingleValue => {
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
    if (rawData['templateVersion']) {
        pipelineConfigData['templateVersion'] = {
            displayName: 'Deployment strategy',
            value: rawData['templateVersion'],
        }
    }
    return pipelineConfigData as DeploymentHistorySingleValue
}

// const prepareConfigMapsData = (rawData): DeploymentHistorySingleValue => {
//     let configValues = {}
//     if (rawData['external']) {
//         configValues['external'] = { displayName: 'Data type', value: 'Kubernetes External ConfigMap' }
//     } else {
//         configValues['external'] = { displayName: 'Data type', value: 'Kubernetes ConfigMap' }
//     }
//     if (rawData['type']) {
//         let typeValue = 'Environment Variable'
//         if (rawData['templateVersion'] === 'volume') {
//             typeValue = 'Data Volume'
//             if (rawData['mountPath']) {
//                 configValues['mountPath'] = { displayName: 'Volume mount path', value: rawData['mountPath'] }
//             }
//             if (rawData['subPath']) {
//                 configValues['subPath'] = { displayName: 'Set SubPath', value: 'Yes' }
//             }
//             if (rawData['filePermission']) {
//                 configValues['filePermission'] = {
//                     displayName: 'Set file permission',
//                     value: rawData['filePermission'],
//                 }
//             }
//         }
//         configValues['type'] = {
//             displayName: 'How do you want to use this ConfigMap?',
//             value: typeValue,
//         }
//     }
//     return configValues as DeploymentHistorySingleValue
// }

const prepareConfigMapAndSecretData = (rawData, type: string): DeploymentHistorySingleValue => {
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
    return secretValues as DeploymentHistorySingleValue
}

const prepareHistoryData = (rawData, historyComponent: string): DeploymentHistoryDetail => {
    let values
    if ((historyComponent = 'deployment_template')) {
        values = prepareDeploymentTemplateData(rawData)
    } else if ((historyComponent = 'pipeline_configuration')) {
        values = preparePipelineConfigData(rawData)
    } else {
        values = prepareConfigMapAndSecretData(rawData, historyComponent === 'config-maps' ? 'ConfigMap' : 'Secret')
    }
    let historyData = { codeEditorValue: rawData.codeEditorValue, values: {} }
    return historyData
}

const deploymentHistoryMockMap = (historyComponent: string, historyComponentName: string): DeploymentHistoryDetail => {
    if (Math.floor(Math.random() * 2) + 1 === 1) {
        return {
            values: {
                stage_to_trigger: {
                    displayName: `When do you want this stage to trigger?-${historyComponent}-${historyComponentName}`,
                    value: `Automatic-${new Date().getTime()}`,
                },
                secret_execute: {
                    displayName: `Secrets used to execute script-${historyComponent}-${historyComponentName}`,
                    value: `configmap-1`,
                },
                execute_script: {
                    displayName: `Secrets used to execute script-${historyComponent}-${historyComponentName}`,
                    value: '',
                },
                execute_env: {
                    displayName: `Execute in application environment-${historyComponent}-${historyComponentName}`,
                    value: `No-${new Date().getTime()}`,
                },
                test_string: {
                    displayName: 'this is a test string',
                    value: 'test1',
                },
            },
            codeEditorValue: {
                displayName: `Script-${historyComponent}-${historyComponentName}`,
                value: `{"ContainerPort":[{"envoyPort":8799,"idleTimeout":"1800s","name":"app","port":8080,"servicePort":80,"supportStreaming":false,"useHTTP2":false}]}`,
            },
        }
    } else {
        return {
            values: {
                stage_to_trigger: {
                    displayName: `When do you want this stage to trigger?-${historyComponent}-${historyComponentName}`,
                    value: `Automatic`,
                },
                secret_execute: {
                    displayName: `Secrets used to execute script-${historyComponent}-${historyComponentName}`,
                    value: `configmap-1`,
                },
                execute_script: {
                    displayName: `Secrets used to execute script-${historyComponent}-${historyComponentName}`,
                    value: `secret-is-the-key-${new Date().getTime()}`,
                },
                execute_env: {
                    displayName: `Execute in application environment-${historyComponent}-${historyComponentName}`,
                    value: '',
                },
                test_number: {
                    displayName: 'this is a test Number',
                    value: '123',
                },
            },
            codeEditorValue: {
                displayName: `Script-${historyComponent}-${historyComponentName}`,
                value: `{"ContainerPort":[{"envoyPort":87399,"idleTimeout":"1800s","name":"app","port":808023,"servicePort":80,"supportStreaming":true,"useHTTP2":false}]}`,
            },
        }
    }
}

export const getDeploymentHistoryDetail = (
    appId: string,
    pipelineId: string,
    id: string,
    historyComponent: string,
    historyComponentName: string,
): Promise<DeploymentHistoryDetailRes> => {
    // return get(
    //     `app/history/template/${appId}/${pipelineId}/${id}?historyComponent=${historyComponent}&historyComponentName=${historyComponentName}`,
    // )
    return Promise.resolve({
        result: { ...deploymentHistoryMockMap('test', 'test1') },
    } as DeploymentHistoryDetailRes)
}
export interface DeploymentConfigurationsRes extends ResponseType {
    result?: DeploymentTemplateList[]
}

export const getDeploymentHistoryList = (
    appId: string,
    pipelineId: string,
    wfrId: string,
): Promise<DeploymentConfigurationsRes> => {
    //  return get(`/history/deployed-configuration/${appId}/${pipelineId}/${wfrId}`)

    return Promise.resolve({
        result: [
            {
                id: 5,
                name: 'deployment_template',
            },
            {
                id: 1,
                name: 'pipeline_configuration',
            },
            {
                id: 22,
                name: 'config-maps',
                childList: ['config-cm', 'config-dashboard'],
            },
            {
                id: 33,
                name: 'secret',
                childList: ['secret1', 'secret-dashboard'],
            },
        ],
    } as DeploymentConfigurationsRes)
}

export interface HistoryDiffSelectorRes {
    result?: HistoryDiffSelectorList[]
}

export const getDeploymentDiffSelector = (appId: string, pipelineId: string): Promise<HistoryDiffSelectorRes> => {
    // return get(`app/history/deployed-component/list/${appId}/${pipelineId}`);
    return Promise.resolve({
        result: [
            {
                id: 12,
                deployedOn: '2022-04-28T09:23:33.855684Z',
                deployedBy: 'admin',
                deploymentStatus: 'healthy',
            },
            {
                id: 11,
                deployedOn: '2022-04-28T09:23:33.855684Z',
                deployedBy: 'shivani@devtron.ai',
                deploymentStatus: 'failed',
            },
            {
                id: 10,
                deployedOn: '2022-04-28T09:43:02.621323Z',
                deployedBy: 'admin',
                deploymentStatus: 'progressing',
            },
            {
                id: 8,
                deployedOn: 'Tue, 8 Apr 2022, 03:13 PM',
                deployedBy: 'shivani@devtron.ai',
                deploymentStatus: 'healthy',
            },
        ],
    })
}
