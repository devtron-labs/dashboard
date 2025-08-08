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

import { CommonNodeAttr, DeploymentNodeType, WorkflowNodeType, WorkflowType } from '@devtron-labs/devtron-fe-common-lib'

import { DeployImageContentProps } from '@Components/app/details/triggerView/DeployImageModal/types'
import { getNodeIdAndTypeFromSearch } from '@Components/app/details/triggerView/TriggerView.utils'

import { BulkCDDetailType } from '../../AppGroup.types'

export const getSelectedCDNode = (bulkTriggerType: DeploymentNodeType, _cdNode: CommonNodeAttr) => {
    if (bulkTriggerType === DeploymentNodeType.PRECD) {
        return _cdNode.preNode
    }
    if (bulkTriggerType === DeploymentNodeType.CD) {
        return _cdNode
    }
    if (bulkTriggerType === DeploymentNodeType.POSTCD) {
        return _cdNode.postNode
    }
    return null
}

export const getSelectedAppListForBulkStrategy = (
    appInfoRes: DeployImageContentProps['appInfoMap'],
): Pick<BulkCDDetailType, 'pipelineId' | 'appName'>[] => {
    const feasiblePipelineIds: Set<number> = Object.values(appInfoRes).reduce((acc, appDetails) => {
        const materials = appDetails.materialResponse?.materials || []
        const isMaterialSelected = materials.some((material) => material.isSelected)

        if (isMaterialSelected) {
            acc.add(+appDetails.pipelineId)
        }

        return acc
    }, new Set<number>())

    const appList: Pick<BulkCDDetailType, 'pipelineId' | 'appName'>[] = Object.values(appInfoRes).map((appDetails) => ({
        pipelineId: +appDetails.pipelineId,
        appName: appDetails.appName,
    }))

    return appList.filter(({ pipelineId }) => feasiblePipelineIds.has(pipelineId))
}

export const getSelectedNodeAndMeta = (
    workflows: WorkflowType[],
    search: string,
): { node: CommonNodeAttr; workflowId: string; appId: number; appName: string; selectedCINode: CommonNodeAttr } => {
    const { cdNodeId, nodeType } = getNodeIdAndTypeFromSearch(search)

    const result = workflows.reduce(
        (acc, workflow) => {
            if (acc.node) return acc
            const foundNode = workflow.nodes.find((node) => cdNodeId === node.id && node.type === nodeType)

            if (foundNode) {
                const selectedCINode = workflow.nodes.find(
                    (node) => node.type === WorkflowNodeType.CI || node.type === WorkflowNodeType.WEBHOOK,
                )
                return {
                    node: foundNode,
                    workflowId: workflow.id,
                    appId: workflow.appId,
                    appName: workflow.name,
                    selectedCINode,
                }
            }
            return acc
        },
        { node: undefined, workflowId: undefined, appId: undefined, appName: undefined, selectedCINode: undefined },
    )

    return (
        result || {
            node: undefined,
            workflowId: undefined,
            appId: undefined,
            appName: undefined,
            selectedCINode: undefined,
        }
    )
}

export const getSelectedNodeAndAppId = (
    workflows: WorkflowType[],
    search: string,
): { node: CommonNodeAttr; appId: number } => {
    const { cdNodeId, nodeType } = getNodeIdAndTypeFromSearch(search)

    const result = workflows.reduce(
        (acc, workflow) => {
            if (acc.node) return acc
            const node = workflow.nodes.find((n) => n.id === cdNodeId && n.type === nodeType)
            return node ? { node, appId: workflow.appId } : acc
        },
        { node: undefined, appId: undefined },
    )
    return result
}
