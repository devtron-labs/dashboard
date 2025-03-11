import { GroupBase } from 'react-select'

import {
    CommonNodeAttr,
    getSelectPickerOptionByValue,
    GitProviderIcon,
    GraphVisualizerEdge,
    GraphVisualizerNode,
    SelectPickerOptionType,
    WorkflowType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICCi } from '@Icons/ic-CI.svg'
import { ReactComponent as ICCD } from '@Icons/ic-CD.svg'
import { ReactComponent as ICCIWebhook } from '@Icons/ic-CIWebhook.svg'
import { ReactComponent as ICNodeBuildLinked } from '@Icons/ic-node-build-linked.svg'
import { ReactComponent as ICWarning } from '@Icons/ic-warning.svg'
import { ReactComponent as ICJobNode } from '@Icons/ic-job-node.svg'
import { ReactComponent as ICLinkedCD } from '@Icons/ic-linked-cd.svg'
import { ReactComponent as ICPaperRocket } from '@Icons/ic-paper-rocket.svg'
import { ReactComponent as ICError } from '@Icons/ic-error.svg'
import { createClusterEnvGroup } from '@Components/common'

import {
    CDNodeEnvironmentSelectPickerOptionType,
    ConvertWorkflowNodesToGraphVisualizerNodesProps,
    GetWorkflowGraphVisualizerNodesProps,
    NodeUpdateActionType,
} from './types'

const getWorkflowCDNodeEnvironments = (
    environmentListOptions: ConvertWorkflowNodesToGraphVisualizerNodesProps['environmentListOptions'],
): GroupBase<SelectPickerOptionType>[] =>
    environmentListOptions.map((elm) => ({
        label: `Cluster: ${elm.label}`,
        options: elm.options.map((option) => ({
            ...option,
            label: option.environment_name,
            value: option.id.toString(),
        })),
    }))

export const getNodeId = (node: CommonNodeAttr) => `${node.id}-${node.type}`

export const getPipelineIdFromNodeId = (nodeId: string) => nodeId.split('-')[0]

const getSourceNodeConfig = (node: CommonNodeAttr): GraphVisualizerNode => ({
    id: node.id,
    type: 'iconNode',
    data: { icon: <GitProviderIcon gitRepoUrl={node.url} /> },
})

const getCINodeIcon = ({
    showPluginWarning,
    isJobCI,
    isLinkedCI,
}: {
    showPluginWarning: boolean
    isLinkedCI: boolean
    isJobCI: boolean
}) => {
    if (showPluginWarning) {
        return <ICWarning className="warning-icon-y7" />
    }
    if (isLinkedCI) {
        return <ICNodeBuildLinked />
    }
    if (isJobCI) {
        return <ICJobNode />
    }
    return <ICCi />
}

const getCINodeConfig = (node: CommonNodeAttr): GraphVisualizerNode => {
    if (node.isLinkedCD) {
        return {
            id: getNodeId(node),
            type: 'textNode',
            data: { icon: <ICLinkedCD />, text: node.title },
        }
    }

    const ciNodeProps: GraphVisualizerNode = {
        id: getNodeId(node),
        type: 'iconNode',
        data: {
            icon: getCINodeIcon({
                isJobCI: node.isJobCI,
                isLinkedCI: node.isLinkedCI,
                showPluginWarning: node.showPluginWarning,
            }),
        },
    }

    return ciNodeProps
}

export const getCDNodeIcon = ({
    isVirtualEnvironment,
    showPluginWarning,
}: {
    isVirtualEnvironment: boolean
    showPluginWarning: boolean
}) => {
    if (showPluginWarning) {
        return <ICWarning className="warning-icon-y7" />
    }
    if (isVirtualEnvironment) {
        return <ICPaperRocket />
    }
    return <ICCD className="flip-rocket" />
}

const getCDNodeConfig = (
    node: CommonNodeAttr,
    {
        environmentListOptions,
        handleNodeUpdateAction,
        workflowId,
    }: Pick<
        ConvertWorkflowNodesToGraphVisualizerNodesProps,
        'environmentListOptions' | 'handleNodeUpdateAction' | 'workflowId'
    >,
): GraphVisualizerNode => {
    const options = getWorkflowCDNodeEnvironments(environmentListOptions)
    const value = getSelectPickerOptionByValue(options, node.environmentId.toString(), null)

    const onChange = (newValue: CDNodeEnvironmentSelectPickerOptionType) => {
        handleNodeUpdateAction({
            actionType: NodeUpdateActionType.UPDATE_CD_PIPELINE,
            id: node.id,
            value: newValue,
            wfId: workflowId,
        })
    }

    const cdNodeProps: GraphVisualizerNode = {
        id: getNodeId(node),
        type: 'dropdownNode',
        data: {
            inputId: `cd-node-${workflowId}-${node.id}`,
            value,
            options,
            onChange,
            icon: getCDNodeIcon({
                isVirtualEnvironment: node.isVirtualEnvironment,
                showPluginWarning: node.showPluginWarning,
            }),
        },
    }

    return cdNodeProps
}

const getWebhookNodeConfig = (node: CommonNodeAttr): GraphVisualizerNode => ({
    id: getNodeId(node),
    type: 'iconNode',
    data: { icon: <ICCIWebhook /> },
})

const getWorkflowGraphVisualizerNodeProps = (
    node: CommonNodeAttr,
    cdNodeProps: Pick<
        ConvertWorkflowNodesToGraphVisualizerNodesProps,
        'environmentListOptions' | 'handleNodeUpdateAction' | 'workflowId'
    >,
): GraphVisualizerNode => {
    switch (node.type) {
        case 'GIT':
            return getSourceNodeConfig(node)
        case 'CI':
            return getCINodeConfig(node)
        case 'CD':
            return getCDNodeConfig(node, cdNodeProps)
        case 'WEBHOOK':
            return getWebhookNodeConfig(node)
        default:
            return {
                id: node.id,
                type: 'textNode',
                data: { text: node.title },
            }
    }
}

const convertWorkflowNodesToGraphVisualizerNodes = ({
    workflowNodes,
    environmentListOptions,
    workflowId,
    handleNodeUpdateAction,
}: ConvertWorkflowNodesToGraphVisualizerNodesProps) =>
    workflowNodes.reduce<GraphVisualizerNode[]>((acc, curr) => {
        const node: GraphVisualizerNode = getWorkflowGraphVisualizerNodeProps(curr, {
            environmentListOptions,
            handleNodeUpdateAction,
            workflowId,
        })

        acc.push(node)
        return acc
    }, [])

export const getWorkflowGraphVisualizerNodes = ({
    workflows,
    environmentList,
    handleNodeUpdateAction,
}: GetWorkflowGraphVisualizerNodesProps) =>
    (workflows || []).reduce<Record<string, GraphVisualizerNode[]>>((acc, curr) => {
        acc[curr.id] = convertWorkflowNodesToGraphVisualizerNodes({
            workflowNodes: curr.nodes,
            workflowId: curr.id,
            environmentListOptions: createClusterEnvGroup(environmentList, 'cluster_name'),
            handleNodeUpdateAction,
        })
        return acc
    }, {})

const getParentPipelineType = (node: CommonNodeAttr) => {
    switch (node.type) {
        case 'CI':
        case 'CD':
            return `${node.type}_PIPELINE`
        default:
            return node.type
    }
}

const convertWorkflowNodesToGraphVisualizerEdges = (workflowNodes: CommonNodeAttr[]) =>
    workflowNodes.reduce<GraphVisualizerEdge[]>((acc, node) => {
        if (node.parentPipelineId && node.parentPipelineType) {
            const parentNode = workflowNodes.find(
                (parent) =>
                    node.parentPipelineId === parent.id && node.parentPipelineType === getParentPipelineType(parent),
            )
            if (parentNode) {
                acc.push({
                    id: `${parentNode.id}->${getNodeId(node)}`,
                    source: getNodeId(parentNode),
                    target: getNodeId(node),
                })
            }
        } else if (Array.isArray(node.parents)) {
            node.parents.forEach((parentId) => {
                acc.push({
                    id: `${parentId}->${getNodeId(node)}`,
                    source: parentId,
                    target: getNodeId(node),
                })
            })
        }

        return acc
    }, [])

export const getWorkflowGraphVisualizerEdges = (workflows: WorkflowType[]) =>
    (workflows || []).reduce<Record<string, GraphVisualizerEdge[]>>((acc, curr) => {
        acc[curr.id] = convertWorkflowNodesToGraphVisualizerEdges(curr.nodes)
        return acc
    }, {})

export const getWorkflowLinkedCDNodes = (workflows: WorkflowType[], linkedNodeId: string) => {
    const linkedCDNodesMap = new Map<string, CommonNodeAttr>()
    workflows.forEach((workflow) => {
        const linkedCDNode = workflow.nodes.find(
            (node) => node.isLinkedCD && node.parentCiPipeline.toString() === linkedNodeId,
        )
        if (linkedCDNode) {
            linkedCDNodesMap.set(workflow.id, linkedCDNode)
        }
    })

    return linkedCDNodesMap
}

const getEnvironmentCDNodesMap = (nodes: Record<string, GraphVisualizerNode[]>) => {
    const map = new Map<string, GraphVisualizerNode[]>()

    Object.keys(nodes).forEach((wfId) => {
        nodes[wfId].forEach((node) => {
            if (node.type === 'dropdownNode') {
                const envId = (node.data.value as SelectPickerOptionType).value.toString()
                if (!map.get(envId)) {
                    map.set(envId, [])
                }
                map.get(envId)!.push(node)
            }
        })
    })

    return map
}

export const getValidatedNodes = (nodes: Record<string, GraphVisualizerNode[]>) => {
    const validatedNodes = nodes
    const workflowIdToErrorMessageMap: Record<string, string> = {}

    const cdNodesWithDuplicateEnv = Array.from(getEnvironmentCDNodesMap(validatedNodes).values())
        .filter((cdNodes) => cdNodes.length > 1)
        .flatMap((node) => node)

    Object.keys(validatedNodes).forEach((workflowId) => {
        validatedNodes[workflowId] = validatedNodes[workflowId].map((node) => {
            const errorNode = cdNodesWithDuplicateEnv.find((duplicateEnvNode) => duplicateEnvNode.id === node.id)

            if (node.type === 'dropdownNode') {
                if (errorNode) {
                    workflowIdToErrorMessageMap[workflowId] =
                        'Multiple deployment pipelines cannot have same environment'
                }

                return errorNode
                    ? {
                          ...node,
                          data: { ...node.data, icon: <ICError />, isError: true },
                      }
                    : {
                          ...node,
                          data: {
                              ...node.data,
                              icon: getCDNodeIcon({
                                  isVirtualEnvironment: (node.data.value as CDNodeEnvironmentSelectPickerOptionType)
                                      .isVirtualEnvironment,
                                  showPluginWarning: false,
                              }),
                              isError: false,
                          },
                      }
            }

            return node
        })
    })

    return { validatedNodes, workflowIdToErrorMessageMap }
}
