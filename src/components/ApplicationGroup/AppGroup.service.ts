import {
    WorkflowType,
    CdPipelineResult,
    CiPipelineResult,
    WorkflowResult,
    NodeAttr,
    PipelineType,
    WorkflowNodeType,
    CiPipeline,
} from '../app/details/triggerView/types'
import { WebhookListResponse } from '../ciPipeline/Webhook/types'
import { processWorkflow } from '../app/details/triggerView/workflow.service'
import { WorkflowTrigger } from '../app/details/triggerView/config'
import { ModuleNameMap, Routes, URLS } from '../../config'
import { get, ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import {
    AppGroupList,
    CIConfigListType,
    ConfigAppListType,
    EnvAppType,
    EnvDeploymentStatusType,
    WorkflowsResponseType,
} from './AppGroup.types'
import { getModuleConfigured } from '../app/details/appDetails/appDetails.service'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'

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

export const getCIConfigList = (envID: string): Promise<CIConfigListType> => {
    const pipelineList = []
    const _appCIPipelineMap: Map<string, CiPipeline> = new Map()
    return Promise.all([
        getEnvWorkflowList(envID),
        getCIConfig(envID),
        getModuleInfo(ModuleNameMap.SECURITY),
        getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
    ]).then(([workflow, ciConfig, securityInfo, moduleConfig]) => {
        workflow.result.workflows.forEach((_wf) => {
            const selectedTree = _wf.tree?.find((list) => list.type === PipelineType.CI_PIPELINE)
            _appCIPipelineMap.set(_wf.appId, selectedTree)
        })

        ciConfig.result.forEach((item) => {
            let ciPipeline = _appCIPipelineMap.get(item.appId)
            let pipelineData = item.ciPipelines?.find((pipeline) => pipeline.id === ciPipeline?.componentId)
            if (pipelineData) {
                pipelineList.push({ ...pipelineData, appName: item.appName, appId: item.appId })
            }
        })
        return {
            pipelineList,
            securityModuleInstalled: securityInfo?.result?.status === ModuleStatus.INSTALLED,
            blobStorageConfigured: moduleConfig?.result?.enabled,
        }
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
        if (parentNode.postNode) {
            parentNode.postNode.downstreams = [type + '-' + node.id]
        } else {
            parentNode.downstreams = [type + '-' + node.id]
        }
        parentNode.downstreamNodes = [node]
    }
    return parentNode
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
    if (params) {
        const urlParams = Object.entries(params).map(([key, value]) => {
            if (!value) return
            return `${key}=${value}`
        })
        return get(`${Routes.ENVIRONMENT_APPS}?${urlParams.filter((s) => s).join('&')}`)
    }
    return get(Routes.ENVIRONMENT_APPS)
}

export const getDeploymentStatus = (envId: number): Promise<EnvDeploymentStatusType> => {
    return get(`${Routes.ENVIRONMENT}/${envId}/${Routes.ENV_DEPLOYMENT_STATUS}`)
}

export const getAppGroupList = (envId: number): Promise<AppGroupList> => {
    return get(`${Routes.APP_LIST_GROUP}/${envId}`)
}
