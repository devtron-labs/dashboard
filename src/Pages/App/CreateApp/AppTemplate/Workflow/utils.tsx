import {
    CommonNodeAttr,
    getSelectPickerOptionByValue,
    GraphVisualizerEdge,
    GraphVisualizerNode,
    WorkflowType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICGit } from '@Icons/git/git.svg'
import { ReactComponent as ICCi } from '@Icons/ic-CI.svg'
import { ReactComponent as ICCD } from '@Icons/ic-CD.svg'
import { ReactComponent as ICCIWebhook } from '@Icons/ic-CIWebhook.svg'
import { ReactComponent as ICNodeBuildLinked } from '@Icons/ic-node-build-linked.svg'
import { ReactComponent as ICWarning } from '@Icons/ic-warning.svg'
import { ReactComponent as ICJobNode } from '@Icons/ic-job-node.svg'
import { ReactComponent as ICLinkedCD } from '@Icons/ic-linked-cd.svg'
import { ReactComponent as ICPaperRocket } from '@Icons/ic-paper-rocket.svg'
import { EnvironmentListMinType } from '@Components/app/types'

import {
    CDNodeEnvironmentSelectPickerOptionType,
    ConvertWorkflowNodesToGraphVisualizerNodesProps,
    GetWorkflowGraphVisualizerNodesProps,
    NodeUpdateActionType,
} from './types'

const getWorkflowCDNodeEnvironments = (environmentList: EnvironmentListMinType[]) =>
    environmentList.map<CDNodeEnvironmentSelectPickerOptionType>(
        ({ environment_name: environmentName, id, isVirtualEnvironment }) => ({
            label: environmentName,
            value: id.toString(),
            isVirtualEnvironment,
        }),
    )

const renderSourceNode = (node: CommonNodeAttr): GraphVisualizerNode => ({
    id: node.id,
    type: 'iconNode',
    data: { icon: <ICGit /> },
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

const renderCINode = (node: CommonNodeAttr): GraphVisualizerNode => {
    if (node.isLinkedCD) {
        return {
            id: node.id,
            type: 'textNode',
            data: { icon: <ICLinkedCD />, text: node.title },
        }
    }

    const ciNodeProps: GraphVisualizerNode = {
        id: node.id,
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

const renderCDNode = (
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
    const value = getSelectPickerOptionByValue(environmentListOptions, node.environmentId.toString(), null)

    const onChange = (newValue: CDNodeEnvironmentSelectPickerOptionType) => {
        handleNodeUpdateAction({
            actionType: NodeUpdateActionType.UPDATE_CD_PIPELINE,
            id: node.id,
            value: newValue,
            wfId: workflowId,
        })
    }

    const cdNodeProps: GraphVisualizerNode = {
        id: node.id,
        type: 'dropdownNode',
        data: {
            inputId: `cd-node-${workflowId}-${node.id}`,
            value,
            options: environmentListOptions,
            onChange,
            icon: getCDNodeIcon({
                isVirtualEnvironment: node.isVirtualEnvironment,
                showPluginWarning: node.showPluginWarning,
            }),
        },
    }

    return cdNodeProps
}

const renderWebhookNode = (node: CommonNodeAttr): GraphVisualizerNode => ({
    id: node.id,
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
            return renderSourceNode(node)
        case 'CI':
            return renderCINode(node)
        case 'CD':
            return renderCDNode(node, cdNodeProps)
        case 'WEBHOOK':
            return renderWebhookNode(node)
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
    workflows.reduce<Record<string, GraphVisualizerNode[]>>((acc, curr) => {
        acc[curr.id] = convertWorkflowNodesToGraphVisualizerNodes({
            workflowNodes: curr.nodes,
            workflowId: curr.id,
            environmentListOptions: getWorkflowCDNodeEnvironments(environmentList),
            handleNodeUpdateAction,
        })
        return acc
    }, {})

const convertWorkflowNodesToGraphVisualizerEdges = (workflowNodes: CommonNodeAttr[]) =>
    workflowNodes.reduce<GraphVisualizerEdge[]>((acc, node) => {
        if (Array.isArray(node.parents)) {
            node.parents.forEach((parentId) => {
                acc.push({
                    id: `${parentId}->${node.id}`,
                    source: parentId,
                    target: node.id,
                })
            })
        }
        return acc
    }, [])

export const getWorkflowGraphVisualizerEdges = (workflows: WorkflowType[]) =>
    workflows.reduce<Record<string, GraphVisualizerEdge[]>>((acc, curr) => {
        acc[curr.id] = convertWorkflowNodesToGraphVisualizerEdges(curr.nodes)
        return acc
    }, {})

export const getWorkflowLinkedCDNodes = (workflows: WorkflowType[], linkedNodeId: string) => {
    const linkedCDNodes = new Map<string, CommonNodeAttr[]>()
    workflows.forEach((workflow) => {
        const filteredLinkedCDNodes = workflow.nodes.filter(
            (node) => node.isLinkedCD && node.parentCiPipeline.toString() === linkedNodeId,
        )
        if (filteredLinkedCDNodes.length) {
            linkedCDNodes.set(workflow.id, filteredLinkedCDNodes)
        }
    })

    return linkedCDNodes
}
