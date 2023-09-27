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
import { get, post, put, ResponseType, trash } from '@devtron-labs/devtron-fe-common-lib'
import {
    AppGroupList,
    CIConfigListType,
    CheckPermissionResponse,
    CheckPermissionType,
    ConfigAppListType,
    EnvAppType,
    EnvDeploymentStatusType,
    EnvGroupListResponse,
    EnvGroupListType,
    EnvGroupResponse,
    WorkflowsResponseType,
} from './AppGroup.types'
import { getModuleConfigured } from '../app/details/appDetails/appDetails.service'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'

const getFilteredAppQueryString = (appIds: string): string => {
    let _appIdsQueryParam = ''
    if (appIds) {
        _appIdsQueryParam = `?appIds=${appIds}`
    }
    return _appIdsQueryParam
}

export function getEnvWorkflowList(envId: string, appIds: string) {
    return get(`${Routes.ENV_WORKFLOW}/${envId}/${Routes.APP_WF}${getFilteredAppQueryString(appIds)}`)
}

export function getCIConfig(envID: string, appIds: string): Promise<ResponseType> {
    return get(`${Routes.ENV_WORKFLOW}/${envID}/${URLS.APP_CI_CONFIG}${getFilteredAppQueryString(appIds)}`)
}

export function getCIConfigMin(envID: string, appIds: string): Promise<ResponseType> {
    return get(`${Routes.ENV_WORKFLOW}/${envID}/${URLS.APP_CI_CONFIG}/min${getFilteredAppQueryString(appIds)}`)
}

export function getCDConfig(envID: string, appIds: string): Promise<ResponseType> {
    return get(`${Routes.ENV_WORKFLOW}/${envID}/${URLS.APP_CD_CONFIG}${getFilteredAppQueryString(appIds)}`)
}

export function getAppsCDConfigMin(envID: string, appIds: string): Promise<ResponseType> {
    return get(`${Routes.ENV_WORKFLOW}/${envID}/${URLS.APP_CD_CONFIG}/min${getFilteredAppQueryString(appIds)}`)
}

export function getExternalCIList(envID: string, appIds: string): Promise<WebhookListResponse> {
    return get(`${Routes.ENV_WORKFLOW}/${envID}/${URLS.APP_EXTERNAL_CI_CONFIG}${getFilteredAppQueryString(appIds)}`)
}

export const getWorkflowStatus = (envID: string, appIds: string) => {
    return get(`${Routes.ENV_WORKFLOW}/${envID}/${Routes.WORKFLOW_STATUS}${getFilteredAppQueryString(appIds)}`)
}

export const getWorkflows = (envID: string, appIds: string): Promise<WorkflowsResponseType> => {
    const _workflows: WorkflowType[] = []
    const _filteredCIPipelines: Map<string, any> = new Map()
    return Promise.all([
        getEnvWorkflowList(envID, appIds),
        getCIConfig(envID, appIds),
        getCDConfig(envID, appIds),
        getExternalCIList(envID, appIds),
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

export const getCIConfigList = (envID: string, appIds: string): Promise<CIConfigListType> => {
    const _appCIPipelineMap: Map<string, CiPipeline> = new Map()
    return Promise.all([
        getCIConfigMin(envID, appIds),
        getModuleInfo(ModuleNameMap.SECURITY),
        getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
    ]).then(([ciConfig, securityInfo, moduleConfig]) => {
        return {
            pipelineList: ciConfig.result,
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

export const getConfigAppList = (envId: number, appIds: string): Promise<ConfigAppListType> => {
    return get(`${Routes.ENVIRONMENT}/${envId}/${Routes.ENV_APPLICATIONS}${getFilteredAppQueryString(appIds)}`)
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

export const getDeploymentStatus = (envId: number, appIds: string): Promise<EnvDeploymentStatusType> => {
    return get(`${Routes.ENVIRONMENT}/${envId}/${Routes.ENV_DEPLOYMENT_STATUS}${getFilteredAppQueryString(appIds)}`)
}

export const getAppGroupList = (envId: number): Promise<AppGroupList> => {
    return get(`${Routes.APP_LIST_GROUP}/${envId}`)
}

export const getEnvGroupList = (envId: number, filterParentType?:string): Promise<EnvGroupListResponse> => {
    return get(`${Routes.ENVIRONMENT}/${envId}/${Routes.GROUPS}?groupType=${filterParentType}`)
}

export const getEnvGroup = (envId: number, groupId: number): Promise<EnvGroupResponse> => {
    return get(`${Routes.ENVIRONMENT}/${envId}/${Routes.GROUP}/${groupId}`)
}

export const createEnvGroup = (envId: string, data, isEdit: boolean): Promise<EnvGroupResponse> => {
    if (isEdit) {
        console.log('edit')
        return put(`${Routes.ENVIRONMENT}/${envId}/${Routes.GROUP}`, data)
    }
    return post(`${Routes.ENVIRONMENT}/${envId}/${Routes.GROUP}`, data)
}

export const appGroupPermission = (envId: string, data: CheckPermissionType): Promise<CheckPermissionResponse> => {
    return post(`${Routes.ENVIRONMENT}/${envId}/${Routes.GROUP}/${Routes.PERMISSION}`, data)
}

export const deleteEnvGroup = (envId: string, groupId: string, filterParentType?:string): Promise<EnvGroupResponse> => {
    return trash(`${Routes.ENVIRONMENT}/${envId}/${Routes.GROUP}/${groupId}?groupType=${filterParentType}`)
}
