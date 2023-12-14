import React, { Component } from 'react'
import { AddCDPositions, WorkflowNodeType, PipelineType, } from '@devtron-labs/devtron-fe-common-lib'
import { nodeColors } from './colors'
import { AddPipelineType } from '../../workflowEditor/types'

interface Point {
    x: number
    y: number
}

interface Line {
    startNode: Point
    endNode: Point
}

interface EdgeProps {
    // type should not be any but WorkflowNodeType, but node type is something else have to look into it
    startNode: Point & { height: number; width: number; type?: any; id?: number | string }
    endNode: Point & { height: number; width: number; type?: any; id?: number | string }
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
}

interface LineDots {
    lineStartX: number
    lineStartY: number
    lineEndX: number
    lineEndY: number
    midPointX: number
    midPointY: number
}

interface AddCDButtonProps {
    position: AddCDPositions
    addCDButtons: AddCDPositions[]
    endNode: Point & { height: number; width: number; type?: any; id?: number | string }
    startNode: Point & { height: number; width: number; type?: any; id?: number | string }
    handleAddCD: (position: AddCDPositions) => void
}

function AddCDButton({ position, addCDButtons, endNode, startNode, handleAddCD }: Readonly<AddCDButtonProps>) {
    const referenceNode = position === AddCDPositions.RIGHT ? endNode : startNode
    const handleAddCDClick = () => {
        handleAddCD(position)
    }

    if (addCDButtons?.includes(position)) {
        return (
            <svg
                x={referenceNode.x + (position === AddCDPositions.RIGHT ? -20 - 5 : referenceNode.width + 5)}
                // Here 10 is the height of the button / 2
                y={referenceNode.y + referenceNode.height / 2 - 10}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                data-testid={`add-cd-to-${position}`}
                onClick={handleAddCDClick}
            >
                <rect width="20" height="20" rx="10" fill="#664BEE" className="add-cd-edge-btn" />
                <path
                    d="M6.5 10H13.5M10 6.5V13.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        )
    }

    return null
}

export default class Edge extends Component<EdgeProps> {
    getLineDots(): LineDots {
        let lineStartX = this.props.startNode.x + this.props.startNode.width
        let lineStartY = this.props.startNode.y + this.props.startNode.height / 2
        let lineEndX = this.props.endNode.x
        let lineEndY = this.props.endNode.y + this.props.startNode.height / 2
        let midPointX = (lineStartX + lineEndX) / 2
        let midPointY = (lineStartY + lineEndY) / 2
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
        let { lineStartX, lineStartY, lineEndX, lineEndY, midPointX, midPointY } = this.getLineDots()
        if (lineStartX > lineEndX) {
            return `M${lineStartX} ${lineStartY} H ${lineStartX + 15} V ${midPointY} H${
                lineEndX - 15
            } V ${lineEndY} H ${lineEndX}`
            // this.props.deleteEdge();
            // return ``;
        } else if (lineStartY != lineEndY) {
            return `M${lineStartX} ${lineStartY} H ${midPointX} V ${lineEndY} H ${lineEndX}`
        } else {
            return `M${lineStartX} ${lineStartY} L ${lineEndX} ${lineEndY}`
        }
    }

    getSegmentArrowEquationVertical(start: Point, end: Point, isDownward: boolean): string {
        // x will remain constant and y will vary
        let offset = isDownward ? 10 : -10
        let midPoint = { x: start.x, y: offset + (start.y + end.y) / 2 }
        let pointA = { x: start.x, y: isDownward ? midPoint.y - 10 : midPoint.y + 10 }
        let pointB = { x: start.x, y: isDownward ? pointA.y - 10 : pointA.y + 10 }
        let pointC = { x: start.x - 10, y: pointB.y }
        let pointD = { x: start.x + 10, y: pointB.y }

        return `M${midPoint.x} ${midPoint.y} L ${pointC.x} ${pointC.y} L ${pointA.x} ${pointA.y} L ${pointD.x} ${pointD.y} Z`
    }

    getSegmentArrowEquationHorizontal(start: Point, end: Point, isToRight: boolean): string {
        // y will remain same and x will vary
        let offset = isToRight ? 10 : -10
        let midPoint = { x: offset + (start.x + end.x) / 2, y: start.y }
        let pointA = { x: isToRight ? midPoint.x - 10 : midPoint.x + 10, y: start.y }
        let pointB = { x: isToRight ? pointA.x - 10 : pointA.x + 10, y: start.y }
        let pointC = { x: pointB.x, y: start.y - 10 }
        let pointD = { x: pointB.x, y: start.y + 10 }

        return `M${midPoint.x} ${midPoint.y} L ${pointC.x} ${pointC.y} L ${pointA.x} ${pointA.y} L ${pointD.x} ${pointD.y} Z`
    }

    getArrowEquation(): string {
        let { lineStartX, lineStartY, lineEndX, lineEndY, midPointX, midPointY } = this.getLineDots()
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
        } else {
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
    }

    getPipelineType = () => {
        if (this.props.isWebhookCD) {
            return PipelineType.WEBHOOK
        }

        if (this.props.startNode.type === WorkflowNodeType.CI) {
            return PipelineType.CI_PIPELINE
        }

        return PipelineType.CD_PIPELINE
    }

    handleAddCD = (position: AddCDPositions) => {
        if (!this.props.handleCDSelect) {
            return
        }
        const { handleCDSelect, startNode, endNode, workflowId, ciPipelineId, isWebhookCD } = this.props
        const pipelineType = this.getPipelineType()

        if (this.props.isParallelEdge && position === AddCDPositions.RIGHT) {
            handleCDSelect(
                workflowId,
                ciPipelineId,
                pipelineType,
                startNode.id,
                isWebhookCD,
                null,
                AddPipelineType.PARALLEL,
            )
            return
        }

        if (position === AddCDPositions.LEFT) {
            handleCDSelect(
                workflowId,
                ciPipelineId,
                pipelineType,
                startNode.id,
                isWebhookCD,
                null,
                AddPipelineType.SEQUENTIAL,
            )
            return
        }

        if (position === AddCDPositions.RIGHT) {
            handleCDSelect(
                workflowId,
                ciPipelineId,
                pipelineType,
                startNode.id,
                isWebhookCD,
                endNode.id,
                AddPipelineType.SEQUENTIAL,
            )
        }
    }

    render() {
        const lineEquation = this.getPathEquation()
        const arrowEquation = this.getArrowEquation()

        return (
            <g
                style={{ cursor: 'pointer' }}
                onClick={this.props.onClickEdge}
                className="edge-group"
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
                    handleAddCD={this.handleAddCD}
                />
                <AddCDButton
                    position={AddCDPositions.RIGHT}
                    addCDButtons={this.props.addCDButtons}
                    endNode={this.props.endNode}
                    startNode={this.props.startNode}
                    handleAddCD={this.handleAddCD}
                />
            </g>
        )
    }
}
