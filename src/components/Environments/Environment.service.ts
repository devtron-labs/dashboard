import {
    WorkflowType,
    CdPipelineResult,
    CiPipelineResult,
    WorkflowResult,
    NodeAttr,
    PipelineType,
    WorkflowNodeType,
} from '../app/details/triggerView/types'
import { WebhookListResponse } from '../ciPipeline/Webhook/types'
import { processWorkflow } from '../app/details/triggerView/workflow.service'
import { WorkflowTrigger } from '../app/details/triggerView/config'
import { Routes, URLS } from '../../config'
import { get } from '../../services/api'
import { ResponseType } from '../../services/service.types'
import { ConfigAppList, EnvApp, EnvDeploymentStatus, WorkflowsResponseType } from './Environments.types'

export function getEnvWorkflowList(envId: string) {
    return get(`${Routes.ENV_WORKFLOW}/${envId}/${Routes.APP_WF}`)
}

export function getCIConfig(envID: string): Promise<ResponseType> {
    return get(`${Routes.ENV_WORKFLOW}/${envID}/${URLS.APP_CI_CONFIG}`)
}

export function getCDConfig(envID: string): Promise<ResponseType> {
    return get(`${Routes.ENV_WORKFLOW}/${envID}/${URLS.APP_CD_CONFIG}`)
}

export function getExternalCIList(envID: string): Promise<WebhookListResponse> {
    return get(`${Routes.ENV_WORKFLOW}/${envID}/${URLS.APP_EXTERNAL_CI_CONFIG}`)
}

export const getWorkflowStatus = (envID: string) => {
    return get(`${Routes.ENV_WORKFLOW}/${envID}/${Routes.WORKFLOW_STATUS}`)
}

export const getWorkflows = (envID: string): Promise<WorkflowsResponseType> => {
    const _workflows: WorkflowType[] = []
    const _filteredCIPipelines: Map<string, any> = new Map()
    return Promise.all([
        getEnvWorkflowList(envID),
        getCIConfig(envID),
        getCDConfig(envID),
        getExternalCIList(envID),
    ]).then(([workflow, ciConfig, cdConfig, externalCIConfig]) => {
        const _ciConfigMap = new Map<number, CiPipelineResult>()
        for (const _ciConfig of ciConfig.result) {
            _ciConfigMap.set(_ciConfig.appId, _ciConfig)
        }
        for (const workflowResult of workflow.result.workflows) {
            const processWorkflowData = processWorkflow(
                {
                    ...workflowResult,
                    workflows: [workflowResult],
                } as WorkflowResult,
                _ciConfigMap.get(workflowResult.appId),
                cdConfig.result as CdPipelineResult,
                externalCIConfig.result,
                WorkflowTrigger,
                WorkflowTrigger.workflow,
                filterChildAndSiblingCD(envID),
            )
            _workflows.push(...processWorkflowData.workflows)
            _filteredCIPipelines.set(workflowResult.appId, processWorkflowData.filteredCIPipelines)
        }
        return { workflows: _workflows, filteredCIPipelines: _filteredCIPipelines }
    })
}

const filterChildAndSiblingCD = function (envID: string): (workflows: WorkflowType[]) => WorkflowType[] {
    return (workflows: WorkflowType[]): WorkflowType[] => {
        workflows.forEach((wf) => {
            const nodes = new Map(wf.nodes.map((node) => [node.type + '-' + node.id, node] as [string, NodeAttr]))
            let node = wf.nodes.find((node) => node.environmentId === +envID)
            if (!node) {
                wf.nodes = []
                return wf
            }
            node.downstreamNodes = []
            node.downstreams = []
            if (!!node.postNode) {
                node.downstreams = [`${WorkflowNodeType.POST_CD}-${node.id}`]
                node.postNode.downstreams = []
            }
            const finalNodes = [node]
            while (node) {
                node = getParentNode(nodes, node)
                if (node) {
                    finalNodes.push(node)
                }
            }
            wf.nodes = finalNodes
            return wf
        })
        return workflows
    }
}

function getParentNode(nodes: Map<string, NodeAttr>, node: NodeAttr): NodeAttr | undefined {
    let parentType = WorkflowNodeType.CD
    if (node.parentPipelineType == PipelineType.CI_PIPELINE) {
        parentType = WorkflowNodeType.CI
    } else if (node.parentPipelineType == PipelineType.WEBHOOK) {
        parentType = WorkflowNodeType.WEBHOOK
    }

    let parentNode = nodes.get(parentType + '-' + node.parentPipelineId)

    const type = node.preNode ? WorkflowNodeType.PRE_CD : node.type

    if (!!parentNode) {
        (parentNode.postNode ? parentNode.postNode : parentNode).downstreams = [type + '-' + node.id]
        parentNode.downstreamNodes = [node]
    }
    return parentNode
}

export interface ConfigAppListType extends ResponseType {
    result?: ConfigAppList[]
}
export interface EnvAppType extends ResponseType {
    result?: EnvApp
}

export interface EnvDeploymentStatusType extends ResponseType {
    result?: EnvDeploymentStatus[]
}

export const getConfigAppList = (envId: number): Promise<ConfigAppListType> => {
    return get(`${Routes.ENVIRONMENT}/${envId}/${Routes.ENV_APPLICATIONS}`)
}

export const getEnvAppList = (params?: {
    envName?: string
    clusterIds?: string
    offset?: string
    size?: string
}): Promise<EnvAppType> => {
    if(params){
        const urlParams = Object.entries(params).map(([key, value]) => {
            if (!value) return
            return `${key}=${value}`
        })
        return get(`${Routes.ENVIRONMENT_APPS}?${urlParams.filter((s) => s).join('&')}`)
    }
    return  get(Routes.ENVIRONMENT_APPS)
}

export const getDeploymentStatus = (envId: number): Promise<EnvDeploymentStatusType> => {
    return get(`${Routes.ENVIRONMENT}/${envId}/${Routes.ENV_DEPLOYMENT_STATUS}`)
}
