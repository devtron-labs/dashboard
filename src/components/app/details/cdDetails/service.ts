import { get } from '../../../../services/api'
import { Routes } from '../../../../config'
import { History } from '../cIDetails/types'
import { ResponseType } from '../../../../services/service.types'
import { DeploymentTemplateList, HistoryDiffSelectorList } from './cd.type'

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

export function getDeploymentHistoryDetail(
    appId: string,
    pipelineId: string,
    id: string,
    historyComponent: string,
    historyComponentName: string,
) {
    return get(
        `app/history/template/${appId}/${pipelineId}/${id}?historyComponent=${historyComponent}&historyComponentName=${historyComponentName}`,
    )
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
                id: 0,
                name: 'deployment_template',
            },
            {
                id: 1,
                name: 'pipeline_configuration',
            },
            {
                id: 2,
                name: 'config-maps',
                childList: ['config-cm', 'secret-dashboard'],
            },
            {
                id: 3,
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
