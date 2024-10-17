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

import {
    CommonNodeAttr,
    TriggerTypeMap,
    WorkflowNodeType,
    PipelineType,
    DownstreamNodesEnvironmentsType,
    WorkflowType,
    getIsManualApprovalConfigured,
} from '@devtron-labs/devtron-fe-common-lib'
import { getCDConfig, getCIConfig, getWorkflowList, getWorkflowViewList } from '../../../../services/service'
import {
    CdPipeline,
    CdPipelineResult,
    CiPipeline,
    CiPipelineResult,
    Workflow,
    WorkflowResult,
    AddDimensionsToDownstreamDeploymentsParams,
} from './types'
import { WorkflowTrigger, WorkflowCreate, Offset, WorkflowDimensions, WorkflowDimensionType } from './config'
import { TriggerType, DEFAULT_STATUS, GIT_BRANCH_NOT_CONFIGURED } from '../../../../config'
import { importComponentFromFELibrary, isEmpty } from '../../../common'
import { WebhookDetailsType } from '../../../ciPipeline/Webhook/types'
import { getExternalCIList } from '../../../ciPipeline/Webhook/webhook.service'
import { CIPipelineBuildType } from '../../../ciPipeline/types'
import { BlackListedCI } from '../../../workflowEditor/types'

const getDeploymentWindowState = importComponentFromFELibrary('getDeploymentWindowState', null, 'function')
const getDeploymentNotAllowedState = importComponentFromFELibrary('getDeploymentNotAllowedState', null, 'function')

export const getTriggerWorkflows = (
    appId,
    useAppWfViewAPI: boolean,
    isJobView: boolean,
    filteredEnvIds?: string,
): Promise<{ appName: string; workflows: WorkflowType[]; filteredCIPipelines }> => {
    return getInitialWorkflows(
        appId,
        WorkflowTrigger,
        WorkflowTrigger.workflow,
        useAppWfViewAPI,
        isJobView,
        filteredEnvIds,
    )
}

export const getCreateWorkflows = (
    appId,
    isJobView: boolean,
    filteredEnvIds?: string,
): Promise<{
    isGitOpsRepoNotConfigured: boolean
    appName: string
    workflows: WorkflowType[]
    filteredCIPipelines
    cachedCDConfigResponse: CdPipelineResult
    blackListedCI: BlackListedCI
}> => {
    return getInitialWorkflows(appId, WorkflowCreate, WorkflowCreate.workflow, false, isJobView, filteredEnvIds)
}

export const getInitialWorkflows = (
    id,
    dimensions: WorkflowDimensions,
    workflowOffset: Offset,
    useAppWfViewAPI?: boolean,
    isJobView?: boolean,
    filteredEnvIds?: string,
    shouldCheckDeploymentWindow: boolean = true
): Promise<{
    isGitOpsRepoNotConfigured: boolean
    appName: string
    workflows: WorkflowType[]
    filteredCIPipelines
    cachedCDConfigResponse: CdPipelineResult
    blackListedCI: BlackListedCI
}> => {
    if (useAppWfViewAPI) {
        return Promise.all([
            getWorkflowViewList(id, filteredEnvIds),
            shouldCheckDeploymentWindow && getDeploymentWindowState ? getDeploymentWindowState(id, filteredEnvIds) : null,
        ]).then((response) => {
            const workflows = {
                appId: id,
                workflows: response[0].result?.workflows as Workflow[],
            } as WorkflowResult

            const ciConfig: CiPipelineResult = {
                appId: id,
                ...response[0].result?.ciConfig,
            }
            const cdPipelineData = response[0].result?.cdConfig as CdPipelineResult

            if (Object.keys(response[1]?.result || {}).length > 0 && cdPipelineData) {
                cdPipelineData.pipelines?.forEach((pipeline) => {
                    pipeline.isDeploymentBlocked = getDeploymentNotAllowedState(response[1], pipeline.environmentId)
                })
            }
            return processWorkflow(
                workflows,
                ciConfig,
                cdPipelineData,
                response[0].result?.externalCiConfig as WebhookDetailsType[],
                dimensions,
                workflowOffset,
                null,
                true,
            )
        })
    }
    if (isJobView) {
        return Promise.all([getWorkflowList(id), getCIConfig(id)]).then(([workflow, ciConfig]) => {
            return processWorkflow(
                workflow.result as WorkflowResult,
                ciConfig.result as CiPipelineResult,
                null,
                null,
                dimensions,
                workflowOffset,
            )
        })
    }
    return Promise.all([
        getWorkflowList(id, filteredEnvIds),
        getCIConfig(id),
        getCDConfig(id),
        getExternalCIList(id),
        getDeploymentWindowState ? getDeploymentWindowState(id, filteredEnvIds) : null,
    ]).then(([workflow, ciConfig, cdConfig, externalCIConfig, deploymentWindowState]) => {
        if (Object.keys(deploymentWindowState?.result || {}).length > 0 && cdConfig) {
            cdConfig.pipelines?.forEach((pipeline) => {
                pipeline.isDeploymentBlocked = getDeploymentNotAllowedState(
                    deploymentWindowState,
                    pipeline.environmentId,
                )
            })
        }
        return processWorkflow(
            workflow.result as WorkflowResult,
            ciConfig.result as CiPipelineResult,
            cdConfig as CdPipelineResult,
            externalCIConfig.result as WebhookDetailsType[],
            dimensions,
            workflowOffset,
        )
    })
}

function handleSourceNotConfigured(filteredCIPipelines: CiPipeline[], ciResponse: CiPipelineResult) {
    const configuredMaterialList = new Map<string, Set<string>>()
    for (const ciPipeline of filteredCIPipelines) {
        configuredMaterialList[ciPipeline.name] = new Set<string>()
        if (ciPipeline.ciMaterial?.length > 0) {
            ciPipeline.ciMaterial.forEach((property, _) =>
                configuredMaterialList[ciPipeline.name].add(property.gitMaterialId),
            )
        } else {
            ciPipeline.ciMaterial = []
        }
    }
    const gitMaterials = ciResponse?.materials ?? []

    // TODO: check logic with Prakash
    for (const material of gitMaterials) {
        for (const ciPipeline of filteredCIPipelines) {
            // if linked pipeline then local git material should not be visible in pipeline.
            if (configuredMaterialList[ciPipeline.name].has(material.gitMaterialId) || ciPipeline.parentCiPipeline) {
                continue
            }
            ciPipeline.ciMaterial.push({
                source: {
                    regex: '',
                    type: '',
                    value: GIT_BRANCH_NOT_CONFIGURED,
                },
                gitMaterialId: material.gitMaterialId,
                id: 0,
                gitMaterialName: material.materialName,
            })
        }
    }
}

// NOTE: For linked cd, In node.type we have type as CI but in ciResponse its going to be LINKED_CD
export function processWorkflow(
    workflow: WorkflowResult,
    ciResponse: CiPipelineResult,
    cdResponse: CdPipelineResult,
    externalCIResponse: WebhookDetailsType[],
    dimensions: WorkflowDimensions,
    workflowOffset: Offset,
    filter?: (workflows: WorkflowType[]) => WorkflowType[],
    useParentRefFromWorkflow?: boolean,
): {
    appName: string
    workflows: Array<WorkflowType>
    filteredCIPipelines
    isGitOpsRepoNotConfigured: boolean
    cachedCDConfigResponse: CdPipelineResult
    blackListedCI: BlackListedCI
} {
    const cdMap = new Map(
        (cdResponse?.pipelines ?? []).map((cdPipeline) => [cdPipeline.id, cdPipeline] as [number, CdPipeline]),
    )
    const ciPipelineToNodeWithDimension = (ciPipeline: CiPipeline) => ciPipelineToNode(ciPipeline, dimensions, cdMap)
    const filteredCIPipelines =
        ciResponse?.ciPipelines?.filter((pipeline) => pipeline.active && !pipeline.deleted) ?? []
    handleSourceNotConfigured(filteredCIPipelines, ciResponse)

    const ciMap = new Map(
        filteredCIPipelines
            .map(ciPipelineToNodeWithDimension)
            .map((ciPipeline) => [ciPipeline.id, ciPipeline] as [string, CommonNodeAttr]),
    )
    const webhookMap = new Map(
        (externalCIResponse ?? []).map((externalCI) => [externalCI.id, externalCI] as [number, WebhookDetailsType]),
    )
    const { appName } = workflow
    let workflows = new Array<WorkflowType>()

    // populate workflows with CI and CD nodes, sourceNodes are inside CI nodes and PreCD and PostCD nodes are inside CD nodes
    workflow.workflows
        ?.sort((a, b) => a.id - b.id)
        .forEach((workflow) => {
            const wf = toWorkflowType(workflow, ciResponse)
            const _wfTree = workflow.tree ?? []
            _wfTree
                .sort((a, b) => a.id - b.id)
                .forEach((branch) => {
                    if (branch.type == PipelineType.CI_PIPELINE) {
                        const ciNode = ciMap.get(String(branch.componentId))
                        if (!ciNode) {
                            return
                        }
                        wf.nodes.push(ciNode)
                    } else if (branch.type == PipelineType.WEBHOOK) {
                        const webhook = webhookMap.get(branch.componentId)
                        if (!webhook) {
                            return
                        }
                        const webhookNode = webhookToNode(webhook, dimensions)
                        wf.nodes.push(webhookNode)
                    } else {
                        const cdPipeline = cdMap.get(branch.componentId)
                        if (
                            !cdPipeline ||
                            (dimensions.type == WorkflowDimensionType.TRIGGER && cdPipeline.deploymentAppDeleteRequest)
                        ) {
                            return
                        }

                        if (useParentRefFromWorkflow) {
                            // Using parentId & parentType from workflow tree
                            cdPipeline.parentPipelineId = branch.parentId
                            cdPipeline.parentPipelineType = branch.parentType
                        }

                        const cdNode = cdPipelineToNode(cdPipeline, dimensions, branch.parentId, branch.isLast)
                        wf.nodes.push(cdNode)

                        if (getIsManualApprovalConfigured(cdPipeline.userApprovalConfig)) {
                            wf.approvalConfiguredIdsMap = {
                                ...wf.approvalConfiguredIdsMap,
                                [cdPipeline.id]: cdPipeline.userApprovalConfig,
                            }
                        }
                    }
                })

            // set updated wf to workflows
            workflows.push(wf)
        })

    addDownstreams(workflows)

    if (filter) {
        workflows = filter(workflows)
    }

    if (dimensions.type == WorkflowDimensionType.TRIGGER) {
        workflows = workflows.filter((wf) => wf.nodes.length > 0)
    }

    addDimensions(workflows, workflowOffset, dimensions)

    const blackListedCI: BlackListedCI = ciResponse?.ciPipelines
        ?.filter((ciPipeline) => ciPipeline.pipelineType === PipelineType.LINKED_CD)
        .reduce((acc, ciPipeline) => {
            acc[ciPipeline.id] = ciPipeline
            return acc
        }, {})
    return {
        appName,
        isGitOpsRepoNotConfigured: workflow.isGitOpsRepoNotConfigured,
        workflows,
        filteredCIPipelines,
        cachedCDConfigResponse: cdResponse,
        blackListedCI,
    }
}

function addDimensions(workflows: WorkflowType[], workflowOffset: Offset, dimensions: WorkflowDimensions) {
    let maxWorkflowWidth = 0
    // Calculate X and Y of nodes and Workflows
    // delete sourceNodes from CI, downstreamNodes for all nodes and dag from workflows
    workflows.forEach((workflow, index) => {
        const startY = 0
        const startX = 0
        if (workflow.nodes.length == 0) {
            return
        }

        const ciNode = workflow.nodes.find(
            (node) => node.type == WorkflowNodeType.CI || node.type == WorkflowNodeType.WEBHOOK,
        )
        ciNode.sourceNodes?.forEach((s, si) => {
            const sourceNodeY =
                startY +
                workflowOffset.offsetY +
                si * (dimensions.staticNodeSizes.nodeHeight + dimensions.staticNodeSizes.distanceY)
            s.x = startX + workflowOffset.offsetX
            s.y = sourceNodeY
            s.height = dimensions.staticNodeSizes.nodeHeight
            s.width = dimensions.staticNodeSizes.nodeWidth
        })

        if (ciNode.type === PipelineType.WEBHOOK || ciNode.isLinkedCD) {
            ciNode.x = startX + workflowOffset.offsetX
        } else {
            ciNode.x =
                startX +
                workflowOffset.offsetX +
                dimensions.staticNodeSizes.nodeWidth +
                dimensions.staticNodeSizes.distanceX
        }

        ciNode.y = startY + workflowOffset.offsetY

        if ((ciNode.downstreamNodes?.length ?? 0) > 0) {
            addDimensionsToDownstreamDeployments({
                downstreams: ciNode.downstreamNodes,
                dimensions,
                startX: ciNode.x,
                startY: ciNode.y,
            })
        }

        const finalWorkflow = new Array<CommonNodeAttr>()
        workflow.nodes.forEach((node) => {
            if (node.type == WorkflowNodeType.CI && !node.isLinkedCD) {
                node.sourceNodes && finalWorkflow.push(...node.sourceNodes)
                finalWorkflow.push(node)
                delete node['sourceNodes']
            }
            if (node.type == PipelineType.WEBHOOK || node.isLinkedCD) {
                finalWorkflow.push(node)
                delete node['sourceNodes']
            }
            if (node.type == WorkflowNodeType.CD) {
                node.downstreamNodes?.forEach((dn) => {
                    dn.parentEnvironmentName = node.environmentName
                })
                if (
                    dimensions.type === WorkflowDimensionType.CREATE &&
                    node.parentPipelineType === PipelineType.WEBHOOK
                ) {
                    // Maybe need to manipulate it
                    node.x -= 40
                }
                node.preNode && finalWorkflow.push(node.preNode)
                finalWorkflow.push(node)
                node.postNode && finalWorkflow.push(node.postNode)
            }
            delete node['downstreamNodes']
        })
        delete workflow['dag']

        const maxY = finalWorkflow.reduce(
            (maxY, node) => Math.max(node.y + node.height + workflowOffset.offsetY, maxY),
            0,
        )
        const maxX = finalWorkflow.reduce(
            (maxX, node) => Math.max(node.x + node.width + workflowOffset.offsetX, maxX),
            0,
        )

        const workflowWidth = dimensions.type === WorkflowDimensionType.CREATE ? 840 : 1280
        workflow.height = maxY
        workflow.startY = !index ? 0 : startY

        workflow.width = Math.max(maxX, workflowWidth)

        maxWorkflowWidth = Math.max(maxWorkflowWidth, workflow.width)

        workflow.nodes = finalWorkflow
    })

    // FIXME: This might be the key to solve scrolling workflows in case one scrolls, all other scrolls
    workflows.forEach((workflow) => (workflow.width = maxWorkflowWidth))
}

function addDownstreams(workflows: WorkflowType[]) {
    workflows.forEach((wf) => {
        const nodes = new Map(wf.nodes.map((node) => [`${node.type}-${node.id}`, node] as [string, CommonNodeAttr]))
        wf.nodes.forEach((node) => {
            if (!node.parentPipelineId) {
                return node
            }

            let parentType = WorkflowNodeType.CD
            if (node.parentPipelineType == PipelineType.CI_PIPELINE) {
                parentType = WorkflowNodeType.CI
            } else if (node.parentPipelineType == PipelineType.WEBHOOK) {
                parentType = WorkflowNodeType.WEBHOOK
            }

            const parentNode = nodes.get(`${parentType}-${node.parentPipelineId}`)

            const type = node.preNode ? WorkflowNodeType.PRE_CD : node.type

            if (parentNode) {
                const _downstream = `${type}-${node.id}`
                const environmentDetails: DownstreamNodesEnvironmentsType = {
                    environmentId: node.environmentId,
                    environmentName: node.environmentName,
                }

                if (parentNode.postNode) {
                    parentNode.postNode.downstreams.push(_downstream)
                    parentNode.postNode.downstreamEnvironments?.push(environmentDetails)
                } else {
                    parentNode.downstreams.push(_downstream)
                    parentNode.downstreamEnvironments?.push(environmentDetails)
                }
                parentNode.downstreamNodes.push(node)
            }
        })
        return wf
    })
}

/**
 *
 * @description This function is used to add dimensions to downstream deployments, we are recursively traversing the downstream deployments and adding dimensions to them, on each iteration we are updating the lastY coordinate which is used to calculate the Y coordinate of the next deployment, this value is going to be maximum Y coordinate we have encountered so far.
 * @returns maximum Y coordinate we have encountered so far
 */
const addDimensionsToDownstreamDeployments = ({
    downstreams,
    dimensions,
    startX,
    startY,
}: AddDimensionsToDownstreamDeploymentsParams): number => {
    const cdNodesGap = dimensions.cDNodeSizes.nodeHeight + dimensions.cDNodeSizes.distanceY
    // Shifting the Y coordinates here since, we are anyways adding cdNodesGap to maxY on start of each iteration and dont want to add that in the end of iteration
    let maxY = startY - cdNodesGap
    for (let index = 0; index < downstreams.length; index++) {
        const element = downstreams[index]
        maxY += cdNodesGap
        const cdNodeY = maxY
        // From here onwards For Y value we will only change maxY for next iteration and wont need to change current cdNodeY
        let cdNodeX = startX + dimensions.cDNodeSizes.nodeWidth + dimensions.cDNodeSizes.distanceX

        if (element.preNode) {
            element.preNode.y = cdNodeY
            element.preNode.x = startX + dimensions.cDNodeSizes.nodeWidth + dimensions.cDNodeSizes.distanceX
            cdNodeX = element.preNode.x + dimensions.cDNodeSizes.nodeWidth + dimensions.cDNodeSizes.distanceX
        }

        element.y = cdNodeY
        element.x = cdNodeX

        let lastX = element.x

        if (element.postNode) {
            element.postNode.y = element.y
            element.postNode.x = element.x + dimensions.cDNodeSizes.nodeWidth + dimensions.cDNodeSizes.distanceX
            lastX = element.postNode.x
        }

        if ((element.downstreamNodes?.length ?? 0) > 0) {
            maxY = addDimensionsToDownstreamDeployments({
                downstreams: element.downstreamNodes,
                dimensions,
                startX: lastX,
                startY: cdNodeY,
            })
        }
    }
    return maxY
}

function toWorkflowType(workflow: Workflow, ciResponse: CiPipelineResult): WorkflowType {
    return {
        id: `${workflow.id}`,
        appId: workflow.appId,
        name: workflow.name,
        nodes: new Array<CommonNodeAttr>(),
        gitMaterials: ciResponse?.materials ?? [],
        ciConfiguredGitMaterialId: ciResponse?.ciGitConfiguredId,
        startX: 0,
        startY: 0,
        height: 0,
        width: 0,
        dag: [],
        approvalConfiguredIdsMap: {},
        artifactPromotionMetadata: workflow.artifactPromotionMetadata,
    } as WorkflowType
}

const getStaticCurrentBranchName = (ciMaterial) => {
    if (window.location.href.includes('trigger')) {
        return ciMaterial?.source?.value || ciMaterial?.source?.regex || ''
    }
    return ciMaterial?.source?.regex || ciMaterial?.source?.value || ''
}

function ciPipelineToNode(
    ciPipeline: CiPipeline,
    dimensions: WorkflowDimensions,
    cdPipelineMap: Map<number, CdPipeline>,
): CommonNodeAttr {
    const sourceNodes = (ciPipeline?.ciMaterial ?? []).map((ciMaterial, index) => {
        const materialName = ciMaterial.gitMaterialName || ''
        return {
            parents: [],
            height: dimensions.staticNodeSizes.nodeHeight,
            width: dimensions.staticNodeSizes.nodeWidth,
            title: materialName.toLowerCase(),
            isSource: true,
            isRoot: true,
            isGitSource: true,
            url: '',
            id: `${WorkflowNodeType.GIT}-${materialName}-${index}`,
            downstreams: [`${WorkflowNodeType.CI}-${ciPipeline.id}`],
            downstreamEnvironments: [],
            type: WorkflowNodeType.GIT,
            icon: 'git',
            branch: getStaticCurrentBranchName(ciMaterial),
            sourceType: ciMaterial?.source?.type ?? '',
            x: 0,
            y: 0,
            regex: ciMaterial?.source?.regex,
            isRegex: ciMaterial?.isRegex,
            primaryBranchAfterRegex: ciMaterial?.source?.value,
            cipipelineId: ciMaterial?.id,
            isJobCI: ciPipeline?.pipelineType === CIPipelineBuildType.CI_JOB,
        } as CommonNodeAttr
    })
    const trigger = ciPipeline.isManual ? TriggerType.Manual.toLocaleLowerCase() : TriggerType.Auto.toLocaleLowerCase()

    const ciNodeTitle =
        ciPipeline.pipelineType === PipelineType.LINKED_CD &&
        cdPipelineMap.get(ciPipeline.parentCiPipeline)?.environmentName
            ? cdPipelineMap.get(ciPipeline.parentCiPipeline).environmentName
            : ciPipeline.name

    const ciNode = {
        isSource: true,
        isGitSource: false,
        isRoot: false,
        parents: sourceNodes.map((sn) => sn.id),
        id: String(ciPipeline.id),
        x: 0,
        y: 0,
        parentAppId: ciPipeline.parentAppId,
        parentCiPipeline: ciPipeline.parentCiPipeline,
        height: getCINodeHeight(dimensions.type, ciPipeline),
        width: dimensions.cINodeSizes.nodeWidth,
        title: ciNodeTitle,
        triggerType: TriggerTypeMap[trigger],
        status: DEFAULT_STATUS,
        type: WorkflowNodeType.CI,
        inputMaterialList: [],
        downstreams: [],
        downstreamEnvironments: [],
        isExternalCI: ciPipeline.isExternal,
        // Can't rely on pipelineType for legacy pipelines, so using parentCiPipeline as well
        isLinkedCI: ciPipeline.pipelineType !== PipelineType.LINKED_CD && !!ciPipeline.parentCiPipeline,
        isLinkedCD: ciPipeline.pipelineType === PipelineType.LINKED_CD,
        isJobCI: ciPipeline?.pipelineType === CIPipelineBuildType.CI_JOB,
        linkedCount: ciPipeline.linkedCount || 0,
        sourceNodes,
        downstreamNodes: new Array<CommonNodeAttr>(),
        showPluginWarning: ciPipeline.isOffendingMandatoryPlugin,
        isCITriggerBlocked: ciPipeline.isCITriggerBlocked,
        ciBlockState: ciPipeline.ciBlockState,
    } as CommonNodeAttr

    return ciNode
}

function webhookToNode(webhookDetails: WebhookDetailsType, dimensions: WorkflowDimensions): CommonNodeAttr {
    return {
        isSource: true,
        isGitSource: false,
        isRoot: false,
        id: String(webhookDetails.id),
        x: 0,
        y: 0,
        height: dimensions.staticNodeSizes.nodeHeight,
        width: dimensions.staticNodeSizes.nodeWidth,
        title: 'Webhook',
        status: DEFAULT_STATUS,
        type: WorkflowNodeType.WEBHOOK,
        inputMaterialList: [],
        downstreams: [],
        downstreamEnvironments: [],
        isExternalCI: true,
        isLinkedCI: false,
        linkedCount: 0,
        sourceNodes: [],
        downstreamNodes: new Array<CommonNodeAttr>(),
    } as CommonNodeAttr
}

function cdPipelineToNode(
    cdPipeline: CdPipeline,
    dimensions: WorkflowDimensions,
    parentId: number,
    isLast: boolean,
): CommonNodeAttr {
    const trigger = cdPipeline.triggerType?.toLowerCase() ?? ''
    let preCD: CommonNodeAttr | undefined
    let postCD: CommonNodeAttr | undefined
    let stageIndex = 1
    if (!isEmpty(cdPipeline?.preDeployStage?.steps || cdPipeline?.preStage?.config)) {
        const trigger =
            cdPipeline.preDeployStage?.triggerType?.toLowerCase() ||
            cdPipeline.preStage?.triggerType?.toLowerCase() ||
            ''
        preCD = {
            // Need this for Release Tags in CDMaterials
            connectingCiPipelineId: cdPipeline.ciPipelineId,
            parents: [String(parentId)],
            height: dimensions.cDNodeSizes.nodeHeight,
            width: dimensions.cDNodeSizes.nodeWidth,
            title: cdPipeline.preDeployStage?.name || cdPipeline.preStage.name || '',
            isSource: false,
            isGitSource: false,
            id: String(cdPipeline.id),
            activeIn: false,
            activeOut: false,
            downstreams: [`${WorkflowNodeType.CD}-${cdPipeline.id}`],
            downstreamEnvironments: [],
            type: WorkflowNodeType.PRE_CD,
            status: cdPipeline.preDeployStage?.status || cdPipeline.preStage?.status || DEFAULT_STATUS,
            triggerType: TriggerTypeMap[trigger],
            environmentName: cdPipeline.environmentName || '',
            isVirtualEnvironment: cdPipeline.isVirtualEnvironment,
            deploymentAppType: cdPipeline.deploymentAppType,
            description: cdPipeline.description || '',
            environmentId: cdPipeline.environmentId,
            deploymentStrategy: cdPipeline.deploymentTemplate?.toLowerCase() ?? '',
            inputMaterialList: [],
            rollbackMaterialList: [],
            stageIndex,
            x: 0,
            y: 0,
            isRoot: false,
            helmPackageName: cdPipeline?.helmPackageName || '',
            isGitOpsRepoNotConfigured: cdPipeline.isGitOpsRepoNotConfigured,
            isDeploymentBlocked: cdPipeline.isDeploymentBlocked,
        } as CommonNodeAttr
        stageIndex++
    }
    let cdDownstreams = []
    if (
        dimensions.type === WorkflowDimensionType.TRIGGER &&
        !isEmpty(cdPipeline.postDeployStage?.steps || cdPipeline.postStage?.config)
    ) {
        cdDownstreams = [`${WorkflowNodeType.POST_CD}-${cdPipeline.id}`]
    }

    const CD = {
        connectingCiPipelineId: cdPipeline.ciPipelineId,
        parents: [String(parentId)],
        height: dimensions.cDNodeSizes.nodeHeight,
        width: dimensions.cDNodeSizes.nodeWidth,
        title: cdPipeline.name,
        isSource: false,
        isGitSource: false,
        id: String(cdPipeline.id),
        activeIn: false,
        activeOut: false,
        downstreams: cdDownstreams,
        downstreamEnvironments: [],
        type: WorkflowNodeType.CD,
        status: DEFAULT_STATUS,
        triggerType: TriggerTypeMap[trigger],
        environmentName: cdPipeline.environmentName || '',
        description: cdPipeline.description || '',
        environmentId: cdPipeline.environmentId,
        deploymentStrategy: cdPipeline.deploymentTemplate?.toLowerCase() ?? '',
        inputMaterialList: [],
        rollbackMaterialList: [],
        stageIndex,
        x: 0,
        y: 0,
        isRoot: false,
        preNode: undefined,
        postNode: undefined,
        downstreamNodes: new Array<CommonNodeAttr>(),
        parentPipelineId: String(cdPipeline.parentPipelineId),
        parentPipelineType: cdPipeline.parentPipelineType,
        deploymentAppDeleteRequest: cdPipeline.deploymentAppDeleteRequest,
        userApprovalConfig: cdPipeline.userApprovalConfig,
        isVirtualEnvironment: cdPipeline.isVirtualEnvironment,
        deploymentAppType: cdPipeline.deploymentAppType,
        helmPackageName: cdPipeline?.helmPackageName || '',
        isLast,
        isGitOpsRepoNotConfigured: cdPipeline.isGitOpsRepoNotConfigured,
        deploymentAppCreated: cdPipeline?.deploymentAppCreated,
        isDeploymentBlocked: cdPipeline.isDeploymentBlocked,
    } as CommonNodeAttr
    stageIndex++

    if (!isEmpty(cdPipeline?.postDeployStage?.steps || cdPipeline?.postStage?.config)) {
        const trigger =
            cdPipeline.postDeployStage?.triggerType?.toLowerCase() ||
            cdPipeline.postStage?.triggerType?.toLowerCase() ||
            ''
        postCD = {
            // Need this for Release Tags in CDMaterialss
            connectingCiPipelineId: cdPipeline.ciPipelineId,
            parents: [String(cdPipeline.id)],
            height: dimensions.cDNodeSizes.nodeHeight,
            width: dimensions.cDNodeSizes.nodeWidth,
            title: cdPipeline.postDeployStage?.name || cdPipeline.postStage?.name || '',
            isSource: false,
            isGitSource: false,
            id: String(cdPipeline.id),
            activeIn: false,
            activeOut: false,
            downstreams: [],
            downstreamEnvironments: [],
            type: WorkflowNodeType.POST_CD,
            status: cdPipeline.postDeployStage?.status || cdPipeline.postStage?.status || DEFAULT_STATUS,
            triggerType: TriggerTypeMap[trigger],
            environmentName: cdPipeline.environmentName || '',
            isVirtualEnvironment: cdPipeline.isVirtualEnvironment,
            deploymentAppType: cdPipeline.deploymentAppType,
            description: cdPipeline.description || '',
            environmentId: cdPipeline.environmentId,
            deploymentStrategy: cdPipeline.deploymentTemplate?.toLowerCase() ?? '',
            inputMaterialList: [],
            rollbackMaterialList: [],
            stageIndex,
            x: 0,
            y: 0,
            isRoot: false,
            helmPackageName: cdPipeline?.helmPackageName || '',
            isGitOpsRepoNotConfigured: cdPipeline.isGitOpsRepoNotConfigured,
            isDeploymentBlocked: cdPipeline.isDeploymentBlocked,
        } as CommonNodeAttr
    }
    if (dimensions.type === WorkflowDimensionType.TRIGGER) {
        CD.preNode = preCD
        CD.postNode = postCD
    }
    if (dimensions.type === WorkflowDimensionType.CREATE) {
        let title = ''
        title += preCD ? 'Pre-deploy, ' : ''
        title += 'Deploy'
        title += postCD ? ', Post-deploy' : ''
        CD.title = title
    }
    return CD
}

function getCINodeHeight(dimensionType: WorkflowDimensionType, pipeline: CiPipeline): number {
    if (dimensionType === WorkflowDimensionType.CREATE) {
        return WorkflowCreate.cINodeSizes.nodeHeight
    }

    // Keeping the check above the next condition since LinkedCD can also have parentCiPipeline
    if (pipeline.pipelineType === PipelineType.LINKED_CD) {
        // Giving it same height as webhook
        return WorkflowTrigger.externalCINodeSizes.nodeHeight
    }

    if (pipeline.parentCiPipeline) {
        // linked CI pipeline
        return WorkflowTrigger.linkedCINodeSizes?.nodeHeight ?? 0
    }
    if (pipeline.isExternal) {
        return WorkflowTrigger.externalCINodeSizes?.nodeHeight ?? 0 // external CI
    }
    return WorkflowTrigger.cINodeSizes.nodeHeight
}

export function getAllChildDownstreams(node: CommonNodeAttr, workflow: any): { downstreamNodes: CommonNodeAttr[] } {
    let downstreamNodes = []
    // Not using downstreamNodes since they get deleted in service itself
    if (node?.downstreams?.length) {
        node.downstreams.forEach((downstreamData) => {
            // separating id and type from downstreamData by splitting on -
            const [type, id] = downstreamData.split('-')
            const _node = workflow.nodes?.find((wfNode) => String(wfNode.id) === id && wfNode.type === type)
            if (_node) {
                const { downstreamNodes: _downstreamNodes } = getAllChildDownstreams(_node, workflow)
                downstreamNodes = [...downstreamNodes, ..._downstreamNodes]
            }
        })
    }
    return { downstreamNodes: [...downstreamNodes, node] }
}

export function getMaxYFromFirstLevelDownstream(node: CommonNodeAttr, workflow: any): number {
    let maxY = 0
    if (node?.downstreams?.length) {
        node.downstreams.forEach((downstreamData) => {
            const [type, id] = downstreamData.split('-')
            const _node = workflow.nodes?.find((wfNode) => String(wfNode.id) === id && wfNode.type === type)
            if (_node) {
                maxY = Math.max(maxY, _node.y)
            }
        })
    }
    return maxY
}
