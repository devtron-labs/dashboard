import { useEffect, useState } from 'react'
import {
    APIResponseHandler,
    GenericEmptyState,
    GraphVisualizer,
    GraphVisualizerEdge,
    GraphVisualizerNode,
    GraphVisualizerProps,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { getCreateWorkflows } from '@Components/app/details/triggerView/workflow.service'
import { getEnvironmentListMin } from '@Services/service'

import {
    getCDNodeIcon,
    getPipelineIdFromNodeId,
    getValidatedNodes,
    getWorkflowGraphVisualizerEdges,
    getWorkflowGraphVisualizerNodes,
    getWorkflowLinkedCDNodes,
} from './utils'
import { HandleNodeUpdateActionProps, NodeUpdateActionType, WorkflowProps } from './types'

export const Workflow = ({ templateId, onChange }: WorkflowProps) => {
    // STATES
    const [nodes, setNodes] = useState<Record<string, GraphVisualizerNode[]>>({})
    const [edges, setEdges] = useState<Record<string, GraphVisualizerEdge[]>>({})

    // ASYNC CALL - FETCH WORKFLOWS
    const [isWorkflowDataLoading, workflowData, workflowDataErr, reloadWorkflowData] = useAsync(
        () => Promise.all([getCreateWorkflows(templateId, false, '', true), getEnvironmentListMin()]),
        [templateId],
    )

    // METHODS
    const setNodesHandler =
        (wfId: string): GraphVisualizerProps['setNodes'] =>
        (newState) =>
            setNodes((prev) => ({
                ...prev,
                [wfId]: typeof newState === 'function' ? newState(prev[wfId] || []) : newState,
            }))

    const setEdgesHandler =
        (wfId: string): GraphVisualizerProps['setEdges'] =>
        (newState) =>
            setEdges((prev) => ({
                ...prev,
                [wfId]: typeof newState === 'function' ? newState(prev[wfId] || []) : newState,
            }))

    // CENTRAL NODE UPDATE HANDLER
    const handleNodeUpdateAction = (nodeAction: HandleNodeUpdateActionProps) => {
        const { actionType } = nodeAction

        switch (actionType) {
            case NodeUpdateActionType.UPDATE_CD_PIPELINE:
                {
                    const { id, value, wfId } = nodeAction

                    setNodes((prev) => {
                        const changedNodes: Parameters<WorkflowProps['onChange']>[0]['cd'] = []

                        const updatedNodes = {
                            ...prev,
                            [wfId]: prev[wfId].map((node) => {
                                const nodeId = getPipelineIdFromNodeId(node.id)
                                if (nodeId === id && node.type === 'dropdownNode') {
                                    changedNodes.push({
                                        environmentId: Number(value.value),
                                        pipelineId: Number(nodeId),
                                    })

                                    return {
                                        ...node,
                                        data: {
                                            ...node.data,
                                            value,
                                            icon: getCDNodeIcon({
                                                isVirtualEnvironment: value.isVirtualEnvironment,
                                                showPluginWarning: false,
                                            }),
                                        },
                                    }
                                }

                                return node
                            }),
                        }

                        const linkedCDNodesMap = getWorkflowLinkedCDNodes(workflowData[0].workflows, id)
                        if (linkedCDNodesMap.size) {
                            Array.from(linkedCDNodesMap.entries()).forEach(([parentWfId, linkedCDNode]) => {
                                updatedNodes[parentWfId] = updatedNodes[parentWfId].map((node) =>
                                    getPipelineIdFromNodeId(node.id) === linkedCDNode.id && node.type === 'textNode'
                                        ? {
                                              ...node,
                                              data: { ...node.data, text: value.label as string },
                                          }
                                        : node,
                                )
                            })
                        }

                        const { isValid, validatedNodes } = getValidatedNodes(updatedNodes)
                        onChange({ cd: changedNodes }, !isValid)

                        return validatedNodes
                    })
                }
                break

            default:
                break
        }
    }

    // UPDATE NODES & EDGES AFTER API RESPONSE
    useEffect(() => {
        if (!isWorkflowDataLoading && workflowData) {
            const updatedNodes = getWorkflowGraphVisualizerNodes({
                workflows: workflowData[0].workflows,
                environmentList: workflowData[1].result,
                handleNodeUpdateAction,
            })
            setNodes(updatedNodes)
            setEdges(getWorkflowGraphVisualizerEdges(workflowData[0].workflows))

            onChange(
                {
                    cd: workflowData[0].workflows
                        .flatMap(({ nodes: workflowNodes }) => workflowNodes)
                        .filter(({ type }) => type === 'CD')
                        .map(({ id, environmentId }) => ({
                            pipelineId: +id,
                            environmentId,
                        })),
                },
                false,
            )
        }
    }, [isWorkflowDataLoading, workflowData])

    return (
        <APIResponseHandler
            progressingProps={{ pageLoader: true }}
            isLoading={isWorkflowDataLoading}
            error={workflowDataErr}
            errorScreenManagerProps={{
                code: workflowDataErr?.code,
                reload: reloadWorkflowData,
            }}
        >
            {Array.isArray(workflowData?.[0]?.workflows) && workflowData[0].workflows.length ? (
                workflowData[0].workflows.map(
                    ({ id, name }) =>
                        Object.keys(nodes).length &&
                        Object.keys(edges).length && (
                            <div key={id} className="flexbox-col dc__gap-6">
                                <p className="m-0 fs-13 lh-20 fw-6">{name}</p>
                                <GraphVisualizer
                                    nodes={nodes[id]}
                                    setNodes={setNodesHandler(id)}
                                    edges={edges[id]}
                                    setEdges={setEdgesHandler(id)}
                                />
                            </div>
                        ),
                )
            ) : (
                <GenericEmptyState title="No Workflows" />
            )}
        </APIResponseHandler>
    )
}
