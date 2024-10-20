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

import React, { Component } from 'react'
import {
    AddCDPositions,
    AddPipelineType,
    AddCDButton,
    Point,
    EdgeNodeType,
    EdgeEndNodeType,
    handleAddCD,
} from '@devtron-labs/devtron-fe-common-lib'
import { nodeColors } from './colors'

interface Line {
    startNode: Point
    endNode: Point
}

interface EdgeProps {
    // type should not be any but WorkflowNodeType, but node type is something else have to look into it
    startNode: Point & EdgeNodeType
    endNode: Point & EdgeEndNodeType
    onClickEdge: (event: any) => void
    deleteEdge: () => void
    onMouseOverEdge: (startID: any, endID: any) => void
    addCDButtons?: AddCDPositions[]
    handleCDSelect?: (
        workflowId: number | string,
        ciPipelineId: number | string,
        parentPipelineType: string,
        parentPipelineId: number | string,
        isWebhookCD?: boolean,
        childPipelineId?: number | string,
        addType?: AddPipelineType,
    ) => void
    workflowId?: number | string
    ciPipelineId?: number | string
    isWebhookCD?: boolean
    isParallelEdge?: boolean
    leftTooltipContent?: string
}

interface LineDots {
    lineStartX: number
    lineStartY: number
    lineEndX: number
    lineEndY: number
    midPointX: number
    midPointY: number
}

export default class Edge extends Component<EdgeProps> {
    getLineDots(): LineDots {
        const lineStartX = this.props.startNode.x + this.props.startNode.width
        const lineStartY = this.props.startNode.y + this.props.startNode.height / 2
        const lineEndX = this.props.endNode.x
        const lineEndY = this.props.endNode.y + this.props.startNode.height / 2
        const midPointX = (lineStartX + lineEndX) / 2
        const midPointY = (lineStartY + lineEndY) / 2
        return {
            lineStartX,
            lineStartY,
            lineEndX,
            lineEndY,
            midPointX,
            midPointY,
        }
    }

    getPathEquation(): string {
        const { lineStartX, lineStartY, lineEndX, lineEndY, midPointX, midPointY } = this.getLineDots()
        if (lineStartX > lineEndX) {
            return `M${lineStartX} ${lineStartY} H ${lineStartX + 15} V ${midPointY} H${
                lineEndX - 15
            } V ${lineEndY} H ${lineEndX}`
            // this.props.deleteEdge();
            // return ``;
        }
        if (lineStartY != lineEndY) {
            return `M${lineStartX} ${lineStartY} H ${midPointX} V ${lineEndY} H ${lineEndX}`
        }
        return `M${lineStartX} ${lineStartY} L ${lineEndX} ${lineEndY}`
    }

    getSegmentArrowEquationVertical(start: Point, end: Point, isDownward: boolean): string {
        // x will remain constant and y will vary
        const offset = isDownward ? 10 : -10
        const midPoint = { x: start.x, y: offset + (start.y + end.y) / 2 }
        const pointA = { x: start.x, y: isDownward ? midPoint.y - 10 : midPoint.y + 10 }
        const pointB = { x: start.x, y: isDownward ? pointA.y - 10 : pointA.y + 10 }
        const pointC = { x: start.x - 10, y: pointB.y }
        const pointD = { x: start.x + 10, y: pointB.y }

        return `M${midPoint.x} ${midPoint.y} L ${pointC.x} ${pointC.y} L ${pointA.x} ${pointA.y} L ${pointD.x} ${pointD.y} Z`
    }

    getSegmentArrowEquationHorizontal(start: Point, end: Point, isToRight: boolean): string {
        // y will remain same and x will vary
        const offset = isToRight ? 10 : -10
        const midPoint = { x: offset + (start.x + end.x) / 2, y: start.y }
        const pointA = { x: isToRight ? midPoint.x - 10 : midPoint.x + 10, y: start.y }
        const pointB = { x: isToRight ? pointA.x - 10 : pointA.x + 10, y: start.y }
        const pointC = { x: pointB.x, y: start.y - 10 }
        const pointD = { x: pointB.x, y: start.y + 10 }

        return `M${midPoint.x} ${midPoint.y} L ${pointC.x} ${pointC.y} L ${pointA.x} ${pointA.y} L ${pointD.x} ${pointD.y} Z`
    }

    getArrowEquation(): string {
        const { lineStartX, lineStartY, lineEndX, lineEndY, midPointX, midPointY } = this.getLineDots()
        if (lineStartX > lineEndX) {
            // this.props.deleteEdge();
            return this.getSegmentArrowEquationHorizontal(
                {
                    x: midPointX,
                    y: midPointY,
                },
                {
                    x: lineStartX,
                    y: lineEndY,
                },
                lineStartX < lineEndX,
            )
        }
        return this.getSegmentArrowEquationHorizontal(
            {
                x: midPointX,
                y: lineEndY,
            },
            {
                x: lineEndX,
                y: lineStartY,
            },
            lineStartX < lineEndX,
        )
    }

    handleAddCDClick = (position: AddCDPositions) => {
        handleAddCD({
            position,
            handleCDSelect: this.props.handleCDSelect,
            startNode: this.props.startNode,
            endNode: this.props.endNode,
            workflowId: this.props.workflowId,
            ciPipelineId: this.props.ciPipelineId,
            isWebhookCD: this.props.isWebhookCD,
            isParallelEdge: this.props.isParallelEdge,
        })
    }

    render() {
        const lineEquation = this.getPathEquation()
        const arrowEquation = this.getArrowEquation()

        return (
            <g
                onClick={this.props.onClickEdge}
                className="edge-group cursor"
                onMouseOver={() => this.props.onMouseOverEdge(this.props.startNode, this.props.endNode)}
            >
                <path
                    className="color-path"
                    d={lineEquation}
                    fill="transparent"
                    stroke={nodeColors.strokeSolid}
                    strokeWidth={2}
                />
                {!this.props.addCDButtons?.length && <path d={arrowEquation} fill={nodeColors.arrowColor} />}
                <AddCDButton
                    position={AddCDPositions.LEFT}
                    addCDButtons={this.props.addCDButtons}
                    endNode={this.props.endNode}
                    startNode={this.props.startNode}
                    handleAddCD={this.handleAddCDClick}
                    tooltipContent={this.props.leftTooltipContent}
                />
                <AddCDButton
                    position={AddCDPositions.RIGHT}
                    addCDButtons={this.props.addCDButtons}
                    endNode={this.props.endNode}
                    startNode={this.props.startNode}
                    handleAddCD={this.handleAddCDClick}
                />
            </g>
        )
    }
}
