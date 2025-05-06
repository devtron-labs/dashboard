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

import { createContext } from 'react'
import { DeploymentNodeType } from '@devtron-labs/devtron-fe-common-lib'
import { TriggerViewContextType } from './types'
import { importComponentFromFELibrary } from '@Components/common'

const WebhookAddImageButton = importComponentFromFELibrary('WebhookAddImageButton', null, 'function')

export const TriggerViewContext = createContext<TriggerViewContextType>({
    invalidateCache: false,
    refreshMaterial: (ciNodeId: number, materialId: number) => {},
    onClickTriggerCINode: () => {},
    onClickCIMaterial: (ciNodeId: string, ciPipelineName: string, preserveMaterialSelection?: boolean) => {},
    onClickCDMaterial: (cdNodeId, nodeType: DeploymentNodeType, isApprovalNode?: boolean, imageTag?: string) => {},
    onClickRollbackMaterial: (cdNodeId: number, offset?: number, size?: number) => {},
    closeCIModal: () => {},
    selectCommit: (materialId: string, hash: string, ciPipelineId?: string) => {},
    selectMaterial: (materialId, pipelineId?: number) => {},
    toggleChanges: (materialId: string, hash: string) => {},
    toggleInvalidateCache: () => {},
    getMaterialByCommit: (ciNodeId: number, materialId: number, gitMaterialId: number, commitHash: string) => {},
    getFilteredMaterial: (ciNodeId: number, gitMaterialId: number, showExcluded: boolean) => {},
    reloadTriggerView: () => {},
})

export enum WorkflowDimensionType {
    TRIGGER = 'trigger',
    CREATE = 'create',
}

export const WorkflowCreate = {
    type: WorkflowDimensionType.CREATE,
    staticNodeSizes: {
        nodeHeight: 64,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 20,
    } as NodeDimension,
    cINodeSizes: {
        nodeHeight: 64,
        nodeWidth: 240,
        distanceX: 100,
        distanceY: 25,
    } as NodeDimension,
    cDNodeSizes: {
        nodeHeight: 64,
        nodeWidth: 240,
        distanceX: 100,
        distanceY: 25,
    } as NodeDimension,
    workflow: {
        distanceY: 0,
        distanceX: 0,
        offsetX: 20,
        offsetY: 24,
    } as Offset,
} as WorkflowDimensions

export const WorkflowTrigger = {
    type: WorkflowDimensionType.TRIGGER,
    staticNodeSizes: {
        nodeHeight: 64,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 20,
    } as NodeDimension,
    cINodeSizes: {
        nodeHeight: 126,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 25,
    } as NodeDimension,
    externalCINodeSizes: {
        nodeHeight: 64,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 25,
    } as NodeDimension,
    linkedCINodeSizes: {
        nodeHeight: 84,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 25,
    } as NodeDimension,
    cDNodeSizes: {
        nodeHeight: 126,
        nodeWidth: 200,
        distanceX: 60,
        distanceY: 25,
    } as NodeDimension,
    ...(WebhookAddImageButton
        ? {
              webhookNodeSize: {
                  nodeHeight: 94,
                  nodeWidth: 200,
                  distanceX: 60,
                  distanceY: 20,
              } as NodeDimension,
          }
        : {}),
    workflow: {
        distanceY: 16,
        distanceX: 0,
        offsetX: 20,
        offsetY: 24,
    } as Offset,
} as WorkflowDimensions

export interface Offset {
    distanceY: number
    distanceX: number
    offsetX: number
    offsetY: number
}

export interface NodeDimension {
    nodeHeight: number
    nodeWidth: number
    distanceX: number
    distanceY: number
}

export interface WorkflowDimensions {
    type: WorkflowDimensionType
    staticNodeSizes: NodeDimension
    cINodeSizes: NodeDimension
    externalCINodeSizes?: NodeDimension
    linkedCINodeSizes?: NodeDimension
    cDNodeSizes: NodeDimension
    webhookNodeSize?: NodeDimension
    workflow: Offset
}

export const CDButtonLabelMap = {
    PRECD: 'Trigger Stage',
    CD: 'Deploy',
    POSTCD: 'Trigger Stage',
}
