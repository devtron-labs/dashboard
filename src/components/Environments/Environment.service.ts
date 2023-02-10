import {
    WorkflowType,
    CdPipelineResult,
    CiPipelineResult,
    WorkflowResult,
    NodeAttr,
    PipelineType,
    WorkflowNodeType,
} from '../app/details/triggerView/types'
import { WebhookDetailsType, WebhookListResponse } from '../ciPipeline/Webhook/types'
import { processWorkflow } from '../app/details/triggerView/workflow.service'
import { WorkflowTrigger } from '../app/details/triggerView/config'
import { Routes, URLS } from '../../config'
import { get } from '../../services/api'
import { ResponseType } from '../../services/service.types'
import { NodeType } from '../v2/appDetails/appDetails.type'

export function getEnvWorkflowList(envId) {
    const URL = `${Routes.ENV_WORKFLOW}/${envId}/${Routes.APP_WF}`
    return get(URL)
}

export function getCIConfig(envID: number): Promise<ResponseType> {
    const URL = `${Routes.ENV_WORKFLOW}/${envID}/${URLS.APP_CI_CONFIG}`
    return get(URL)
}

export function getCDConfig(envID: number | string): Promise<ResponseType> {
    const URL = `${Routes.ENV_WORKFLOW}/${envID}/${URLS.APP_CD_CONFIG}`
    return get(URL)
}

export function getExternalCIList(envID: number | string): Promise<WebhookListResponse> {
    return get(`${Routes.ENV_WORKFLOW}/${envID}/${URLS.APP_EXTERNAL_CI_CONFIG}`)
}

export const getWorkflows = (envID): Promise<{ workflows: WorkflowType[]; filteredCIPipelines }> => {
    const _workflows: WorkflowType[] = []
    const _filteredCIPipelines = new Map()

    return Promise.all([getEnvWorkflowList(envID), getCIConfig(envID), getCDConfig(envID), getExternalCIList(envID)]).then(
        ([workflow, ciConfig, cdConfig, externalCIConfig]) => {
            let _ciConfigMap = new Map<number, CiPipelineResult>()
            for (let index = 0; index < ciConfig.result.length; index++) {
                const _ciConfig = ciConfig.result[index]
                _ciConfigMap.set(_ciConfig.appId, _ciConfig)
            }
            for (let index = 0; index < workflow.result.workflows.length; index++) {
                const workflowResult = workflow.result.workflows[index]
                //if (workflowResult.name !== 'viv-test-app') continue
                const processWorkflowData = processWorkflow(
                    {
                        ...workflowResult,
                        workflows: [workflowResult],
                    } as WorkflowResult,
                    _ciConfigMap.get(workflowResult.appId) as CiPipelineResult,
                    cdConfig.result as CdPipelineResult,
                    externalCIConfig.result as WebhookDetailsType[],
                    WorkflowTrigger,
                    WorkflowTrigger.workflow,
                )
                //TODO : add the logic to filter out all the child and sibling CD nodes

                _workflows.push(filterChildAndSiblingCD(processWorkflowData.workflows[0], envID))
                _filteredCIPipelines.set(workflowResult.appId, processWorkflowData.filteredCIPipelines)
            }
            return { workflows: _workflows, filteredCIPipelines: _filteredCIPipelines }
        },
    )
}

const filterChildAndSiblingCD = (wf: WorkflowType, envID: number): WorkflowType =>{

  return wf
}
