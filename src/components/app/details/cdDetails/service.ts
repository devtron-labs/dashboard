import {get} from '../../../../services/api'
import {Routes} from '../../../../config'
import {GitTriggers, CiMaterial, History} from '../cIDetails/types'
import { ResponseType} from '../../../../services/service.types';


export interface DeploymentHistory{
    id: number;
    cd_workflow_id: number;
    name: string;
    status: string;
    pod_status: string;
    message: string;
    started_on: string;
    finished_on: string;
    pipeline_id: number;
    namespace: string;
    log_file_path: string;
    triggered_by: number;
    email_id?: string;
    image: string;
    workflow_type?: string;
}


interface DeploymentHistoryResult extends ResponseType{
    result?: History[];
}
export async function getTriggerHistory(appId: number|string, envId: number|string, pipelineId:number| string, pagination):Promise<DeploymentHistoryResult>{
    return get(`app/cd-pipeline/workflow/history/${appId}/${envId}/${pipelineId}?offset=${pagination.offset}&size=${pagination.size}`)
    .then(({result, code, status})=>{
        return {result: (result || []).map((deploymentHistory: DeploymentHistory)=>({
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
            stage: deploymentHistory?.workflow_type
        })), code, status }
    })
}

interface TriggerDetails extends ResponseType{
    result?: History;
}

export function getTriggerDetails({appId, envId, pipelineId, triggerId}):Promise<TriggerDetails>{
    if(triggerId){
        return get(`${Routes.APP}/cd-pipeline/workflow/trigger-info/${appId}/${envId}/${pipelineId}/${triggerId}`)
    }
    else{
        return get(`${Routes.APP}/cd-pipeline/workflow/trigger-info/${appId}/${envId}/${pipelineId}/last`)
    }
}

export function getCDBuildReport(appId, envId, pipelineId, workflowId) {
    return get(`app/cd-pipeline/workflow/download/${appId}/${envId}/${pipelineId}/${workflowId}`)
}

export function getDeploymentTemplateDiff(appId,  pipelineId) {
    return get(`app/history/template/${appId}/${pipelineId}`)
}

export function getDeploymentTemplate(appId, envId, chartId){
    return get(`app/env/${appId}/${envId}/${chartId}`)
}
