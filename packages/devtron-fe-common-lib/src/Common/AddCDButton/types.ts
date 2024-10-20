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

import { AddCDPositions, AddPipelineType, EdgeEndNodeType, EdgeNodeType, Point } from '../Types'

export interface AddCDButtonProps {
    position: AddCDPositions
    addCDButtons: AddCDPositions[]
    endNode: Point & EdgeEndNodeType
    startNode: Point & EdgeNodeType
    handleAddCD: (position: AddCDPositions) => void
    tooltipContent?: string
}

export interface HandleAddCD {
    position: AddCDPositions
    handleCDSelect: (
        workflowId: number | string,
        ciPipelineId: number | string,
        parentPipelineType: string,
        parentPipelineId: number | string,
        isWebhookCD?: boolean,
        childPipelineId?: number | string,
        addType?: AddPipelineType,
    ) => void
    startNode: EdgeNodeType
    endNode: EdgeEndNodeType
    workflowId: number | string
    ciPipelineId: number | string
    isWebhookCD: boolean
    isParallelEdge: boolean
}

export interface GetPipelineType {
    startNode: EdgeNodeType
}

export interface TooltipContentProps {
    tooltipContent?: string
}
