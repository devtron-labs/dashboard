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

import { AddCDPositions, AddPipelineType, PipelineType, WorkflowNodeType } from '../Types'
import { HandleAddCD, GetPipelineType } from './types'

const getPipelineType = ({ startNode }: GetPipelineType) => {
    if (startNode.type === WorkflowNodeType.WEBHOOK) {
        return PipelineType.WEBHOOK
    }

    if (startNode.type === WorkflowNodeType.CI) {
        return PipelineType.CI_PIPELINE
    }

    return PipelineType.CD_PIPELINE
}

export const handleAddCD = ({
    position,
    handleCDSelect,
    startNode,
    endNode,
    workflowId,
    ciPipelineId,
    isWebhookCD,
    isParallelEdge,
}: HandleAddCD) => {
    if (!handleCDSelect) {
        return
    }
    const pipelineType = getPipelineType({ startNode })
    const addPipelineType =
        isParallelEdge && position === AddCDPositions.RIGHT ? AddPipelineType.PARALLEL : AddPipelineType.SEQUENTIAL
    const endNodeId = !isParallelEdge && position === AddCDPositions.RIGHT ? endNode.id : null

    handleCDSelect(workflowId, ciPipelineId, pipelineType, startNode.id, isWebhookCD, endNodeId, addPipelineType)
}
