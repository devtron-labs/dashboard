import { getCIConfig, getCDConfig, getWorkflowList } from '../../../../services/service'
import {
    WorkflowType,
    NodeAttr,
    CdPipeline,
    CdPipelineResult,
    CiPipeline,
    CiPipelineResult,
    Workflow,
    WorkflowResult,
    PipelineType,
    WorkflowNodeType,
} from './types'
import { WorkflowTrigger, WorkflowCreate, Offset, WorkflowDimensions, WorkflowDimensionType } from './config'
import { TriggerType, TriggerTypeMap, DEFAULT_STATUS, GIT_BRANCH_NOT_CONFIGURED } from '../../../../config'
import { isEmpty } from '../../../common'
import { getExternalCIList } from '../../../ciPipeline/Webhook/webhook.service'
import { WebhookDetailsType } from '../../../ciPipeline/Webhook/types'

export const getTriggerWorkflows = (
    appId,
): Promise<{ appName: string; workflows: WorkflowType[]; filteredCIPipelines }> => {
    return getInitialWorkflows(appId, WorkflowTrigger, WorkflowTrigger.workflow)
}

export const getCreateWorkflows = (appId): Promise<{ appName: string; workflows: WorkflowType[] }> => {
    return getInitialWorkflows(appId, WorkflowCreate, WorkflowCreate.workflow)
}

export const getInitialWorkflows = (
    id,
    dimensions: WorkflowDimensions,
    workflowOffset: Offset,
): Promise<{ appName: string; workflows: WorkflowType[]; filteredCIPipelines }> => {
    return Promise.all([getWorkflowList(id), getCIConfig(id), getCDConfig(id), getExternalCIList(id)]).then(
        ([workflow, ciConfig, cdConfig, externalCIConfig]) => {
            return processWorkflow(
                workflow.result as WorkflowResult,
                ciConfig.result as CiPipelineResult,
                cdConfig as CdPipelineResult,
                externalCIConfig.result as WebhookDetailsType[],
                dimensions,
                workflowOffset,
            )
        },
    )
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

    //TODO: check logic with Prakash
    for (const material of gitMaterials) {
        for (const ciPipeline of filteredCIPipelines) {
            //if linked pipeline then local git material should not be visible in pipeline.
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

export function processWorkflow(
    workflow: WorkflowResult,
    ciResponse: CiPipelineResult,
    cdResponse: CdPipelineResult,
    externalCIResponse: WebhookDetailsType[],
    dimensions: WorkflowDimensions,
    workflowOffset: Offset,
    filter?: (workflows:WorkflowType[]) => WorkflowType[]
): { appName: string; workflows: Array<WorkflowType>; filteredCIPipelines } {
    let ciPipelineToNodeWithDimension = (ciPipeline: CiPipeline) => ciPipelineToNode(ciPipeline, dimensions)
    const filteredCIPipelines =
        ciResponse?.ciPipelines?.filter((pipeline) => pipeline.active && !pipeline.deleted) ?? []
    handleSourceNotConfigured(filteredCIPipelines, ciResponse)

    const ciMap = new Map(
        filteredCIPipelines
            .map(ciPipelineToNodeWithDimension)
            .map((ciPipeline) => [ciPipeline.id, ciPipeline] as [string, NodeAttr]),
    )
    const cdMap = new Map(
        (cdResponse?.pipelines ?? []).map((cdPipeline) => [cdPipeline.id, cdPipeline] as [number, CdPipeline]),
    )
    const webhookMap = new Map(
        (externalCIResponse ?? []).map((externalCI) => [externalCI.id, externalCI] as [number, WebhookDetailsType]),
    )
    const appName = workflow.appName
    let workflows = new Array<WorkflowType>()

    //populate workflows with CI and CD nodes, sourceNodes are inside CI nodes and PreCD and PostCD nodes are inside CD nodes
    workflow.workflows
        ?.sort((a, b) => a.id - b.id)
        .forEach((workflow) => {
            const wf = toWorkflowType(workflow, ciResponse)
            workflows.push(wf)
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
                        let webhookNode = webhookToNode(webhook, dimensions)
                        wf.nodes.push(webhookNode)
                    } else {
                        const cdPipeline = cdMap.get(branch.componentId)
                        if (!cdPipeline || (dimensions.type == WorkflowDimensionType.TRIGGER && cdPipeline.deploymentAppDeleteRequest) ) {
                            return
                        }
                        const cdNode = cdPipelineToNode(cdPipeline, dimensions, branch.parentId)
                        wf.nodes.push(cdNode)
                    }
                })
        })

    addDownstreams(workflows)

    if (filter) {
        workflows = filter(workflows)
    }

    if (dimensions.type == WorkflowDimensionType.TRIGGER) {
        workflows = workflows.filter((wf) => wf.nodes.length > 0)
    }

    addDimensions(workflows, workflowOffset, dimensions)
    return { appName, workflows, filteredCIPipelines }
}

function addDimensions(workflows: WorkflowType[], workflowOffset: Offset, dimensions: WorkflowDimensions) {
    let maxWorkflowWidth = 0
    //Calculate X and Y of nodes and Workflows
    //delete sourceNodes from CI, downstreamNodes for all nodes and dag from workflows
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
            let sourceNodeY = startY +
                workflowOffset.offsetY +
                si * (dimensions.staticNodeSizes.nodeHeight + dimensions.staticNodeSizes.distanceY)
            s.x = startX + workflowOffset.offsetX
            s.y = sourceNodeY
            s.height = dimensions.staticNodeSizes.nodeHeight
            s.width = dimensions.staticNodeSizes.nodeWidth
        })

        if (ciNode.type === PipelineType.WEBHOOK) {
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
            addDimensionsToDownstreamDeployments(ciNode.downstreamNodes, dimensions, ciNode.x, ciNode.y)
        }

        const finalWorkflow = new Array<NodeAttr>()
        workflow.nodes.forEach((node) => {
            if (node.type == WorkflowNodeType.CI) {
                node.sourceNodes && finalWorkflow.push(...node.sourceNodes)
                finalWorkflow.push(node)
                delete node['sourceNodes']
            }
            if (node.type == PipelineType.WEBHOOK) {
                finalWorkflow.push(node)
                delete node['sourceNodes']
            }
            if (node.type == WorkflowNodeType.CD) {
                node.downstreamNodes?.forEach((dn) => {
                    dn.parentEnvironmentName = node.environmentName
                })
                if (dimensions.type === WorkflowDimensionType.CREATE &&
                    node.parentPipelineType === PipelineType.WEBHOOK) {
                    node.x = node.x - 40
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
            0
        )
        const maxX = finalWorkflow.reduce((maxX, node) => Math.max(node.x + node.width + workflowOffset.offsetX, maxX), 0)

        const workflowWidth = dimensions.type === WorkflowDimensionType.CREATE ? 840 : 1280
        workflow.height = maxY
        workflow.startY = !index ? 0 : startY

        workflow.width = Math.max(maxX, workflowWidth)

        maxWorkflowWidth = Math.max(maxWorkflowWidth, workflow.width)

        workflow.nodes = finalWorkflow
    })

    workflows.forEach((workflow) => (workflow.width = maxWorkflowWidth))
}

function addDownstreams(workflows: WorkflowType[]) {
    workflows.forEach(wf => {
        let nodes = new Map(wf.nodes.map(node => [node.type + "-" + node.id, node] as [string, NodeAttr]))

        wf.nodes.forEach(node => {
            if (!node.parentPipelineId) {
                return node
            }

            let parentType = WorkflowNodeType.CD
            if (node.parentPipelineType == PipelineType.CI_PIPELINE) {
                parentType = WorkflowNodeType.CI
            } else if (node.parentPipelineType == PipelineType.WEBHOOK) {
                parentType = WorkflowNodeType.WEBHOOK
            }

            let parentNode = nodes.get(parentType + "-" + node.parentPipelineId)

            const type = node.preNode ? WorkflowNodeType.PRE_CD : node.type

            if (!!parentNode) {
                (parentNode.postNode ? parentNode.postNode : parentNode).downstreams.push(
                    type + '-' + node.id
                )
                parentNode.downstreamNodes.push(node)
            }
        })
        return wf
    })
}

function addDimensionsToDownstreamDeployments(
    downstreams: Array<NodeAttr>,
    dimensions: WorkflowDimensions,
    startX: number,
    startY: number,
) {
    let lastY = startY
    for (let index = 0; index < downstreams.length; index++) {
        const element = downstreams[index]
        let cdNodeY = lastY
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

        lastY = cdNodeY + dimensions.cDNodeSizes.nodeHeight + dimensions.cDNodeSizes.distanceY

        if ((element.downstreamNodes?.length ?? 0) > 0) {
            addDimensionsToDownstreamDeployments(element.downstreamNodes, dimensions, lastX, cdNodeY)
            lastY =
                element.downstreamNodes[element.downstreamNodes.length - 1].y +
                dimensions.cDNodeSizes.nodeHeight +
                dimensions.cDNodeSizes.distanceY
        }

        //for next iteration use Y coordinate of the last element in downstreamNodes as it will have maximum Y coordinate
        startY = lastY
    }
}

function toWorkflowType(workflow: Workflow, ciResponse: CiPipelineResult): WorkflowType {
    return {
        id: '' + workflow.id,
        appId: workflow.appId,
        name: workflow.name,
        nodes: new Array<NodeAttr>(),
        gitMaterials: ciResponse.materials ?? [],
        ciConfiguredGitMaterialId: ciResponse.ciBuildConfig.gitMaterialId,
        startX: 0,
        startY: 0,
        height: 0,
        width: 0,
        dag: [],
    } as WorkflowType
}

const getStaticCurrentBranchName = (ciMaterial) => {
    if (window.location.href.includes('trigger')) {
        return ciMaterial?.source?.value || ciMaterial?.source?.regex || ''
    }
    return ciMaterial?.source?.regex || ciMaterial?.source?.value || ''
}

function ciPipelineToNode(ciPipeline: CiPipeline, dimensions: WorkflowDimensions): NodeAttr {
    let sourceNodes = (ciPipeline?.ciMaterial ?? []).map((ciMaterial, index) => {
        let materialName = ciMaterial.gitMaterialName || ''
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
            type: WorkflowNodeType.GIT,
            icon: 'git',
            branch: getStaticCurrentBranchName(ciMaterial),
            sourceType: ciMaterial?.source?.type ?? '',
            x: 0,
            y: 0,
            regex: ciMaterial?.source?.regex,
            isRegex: ciMaterial?.isRegex,
            primaryBranchAfterRegex: ciMaterial?.source?.value,
        } as NodeAttr
    })
    let trigger = ciPipeline.isManual ? TriggerType.Manual.toLocaleLowerCase() : TriggerType.Auto.toLocaleLowerCase()
    let isExternalCI = ciPipeline.isExternal
    let isLinkedCI = !!ciPipeline.parentCiPipeline
    let l = (ciPipeline.name?.length ?? 1) - 1
    if (isLinkedCI) {
        l = (ciPipeline.name ?? '').lastIndexOf('-')
    }
    let ciNodeHeight = getCINodeHeight(dimensions.type, ciPipeline)
    let ciNode = {
        isSource: true,
        isGitSource: false,
        isRoot: false,
        parents: sourceNodes.map((sn) => sn.id),
        id: String(ciPipeline.id),
        x: 0,
        y: 0,
        parentAppId: ciPipeline.parentAppId,
        parentCiPipeline: ciPipeline.parentCiPipeline,
        height: ciNodeHeight,
        width: dimensions.cINodeSizes.nodeWidth,
        title: isLinkedCI ? (ciPipeline.name ?? '').substring(0, l) || ciPipeline.name : ciPipeline.name, //show parent CI name if Linked CI
        triggerType: TriggerTypeMap[trigger],
        status: DEFAULT_STATUS,
        type: WorkflowNodeType.CI,
        inputMaterialList: [],
        downstreams: [],
        isExternalCI: isExternalCI,
        isLinkedCI: isLinkedCI,
        linkedCount: ciPipeline.linkedCount || 0,
        sourceNodes: sourceNodes,
        downstreamNodes: new Array<NodeAttr>(),
    } as NodeAttr

    return ciNode
}

function webhookToNode(webhookDetails: WebhookDetailsType, dimensions: WorkflowDimensions): NodeAttr {
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
        isExternalCI: true,
        isLinkedCI: false,
        linkedCount: 0,
        sourceNodes: [],
        downstreamNodes: new Array<NodeAttr>(),
    } as NodeAttr
}

function cdPipelineToNode(cdPipeline: CdPipeline, dimensions: WorkflowDimensions, parentId: number): NodeAttr {
    let trigger = cdPipeline.triggerType?.toLowerCase() ?? ''
    let preCD: NodeAttr | undefined = undefined,
        postCD: NodeAttr | undefined = undefined
    let stageIndex = 1
    if (!isEmpty(cdPipeline?.preStage?.config)) {
        let trigger = cdPipeline.preStage?.triggerType?.toLowerCase() ?? ''
        preCD = {
            parents: [String(parentId)],
            height: dimensions.cDNodeSizes.nodeHeight,
            width: dimensions.cDNodeSizes.nodeWidth,
            title: cdPipeline.preStage?.name ?? '',
            isSource: false,
            isGitSource: false,
            id: String(cdPipeline.id),
            activeIn: false,
            activeOut: false,
            downstreams: [`${WorkflowNodeType.CD}-${cdPipeline.id}`],
            type: WorkflowNodeType.PRE_CD,
            status: cdPipeline.preStage?.status || DEFAULT_STATUS,
            triggerType: TriggerTypeMap[trigger],
            environmentName: cdPipeline.environmentName || '',
            environmentId: cdPipeline.environmentId,
            deploymentStrategy: cdPipeline.deploymentTemplate?.toLowerCase() ?? '',
            inputMaterialList: [],
            rollbackMaterialList: [],
            stageIndex: stageIndex,
            x: 0,
            y: 0,
            isRoot: false,
        } as NodeAttr
        stageIndex++
    }
    let cdDownstreams = []
    if (dimensions.type === WorkflowDimensionType.TRIGGER && !isEmpty(cdPipeline.postStage?.config)) {
        cdDownstreams = [`${WorkflowNodeType.POST_CD}-${cdPipeline.id}`]
    }

    let CD = {
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
        type: WorkflowNodeType.CD,
        status: DEFAULT_STATUS,
        triggerType: TriggerTypeMap[trigger],
        environmentName: cdPipeline.environmentName || '',
        environmentId: cdPipeline.environmentId,
        deploymentStrategy: cdPipeline.deploymentTemplate?.toLowerCase() ?? '',
        inputMaterialList: [],
        rollbackMaterialList: [],
        stageIndex: stageIndex,
        x: 0,
        y: 0,
        isRoot: false,
        preNode: undefined,
        postNode: undefined,
        downstreamNodes: new Array<NodeAttr>(),
        parentPipelineId: String(cdPipeline.parentPipelineId),
        parentPipelineType: cdPipeline.parentPipelineType,
        deploymentAppDeleteRequest: cdPipeline.deploymentAppDeleteRequest,
    } as NodeAttr
    stageIndex++

    if (!isEmpty(cdPipeline?.postStage?.config)) {
        let trigger = cdPipeline.postStage?.triggerType?.toLowerCase() ?? ''
        postCD = {
            parents: [String(cdPipeline.id)],
            height: dimensions.cDNodeSizes.nodeHeight,
            width: dimensions.cDNodeSizes.nodeWidth,
            title: cdPipeline.postStage?.name ?? '',
            isSource: false,
            isGitSource: false,
            id: String(cdPipeline.id),
            activeIn: false,
            activeOut: false,
            downstreams: [],
            type: WorkflowNodeType.POST_CD,
            status: cdPipeline.postStage?.status || DEFAULT_STATUS,
            triggerType: TriggerTypeMap[trigger],
            environmentName: cdPipeline.environmentName || '',
            environmentId: cdPipeline.environmentId,
            deploymentStrategy: cdPipeline.deploymentTemplate?.toLowerCase() ?? '',
            inputMaterialList: [],
            rollbackMaterialList: [],
            stageIndex: stageIndex,
            x: 0,
            y: 0,
            isRoot: false,
        } as NodeAttr
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
    if (dimensionType === WorkflowDimensionType.CREATE) return WorkflowCreate.cINodeSizes.nodeHeight
    else {
        if (pipeline.parentCiPipeline)
            //linked CI pipeline
            return WorkflowTrigger.linkedCINodeSizes?.nodeHeight ?? 0
        else if (pipeline.isExternal) return WorkflowTrigger.externalCINodeSizes?.nodeHeight ?? 0 //external CI
        else return WorkflowTrigger.cINodeSizes.nodeHeight
    }
}
