import React, { Component } from 'react'
import { nodeColors } from './colors'

interface Point {
    x: number
    y: number
}

interface Line {
    startNode: Point
    endNode: Point
}

interface EdgeProps {
    startNode: Point & { height: number; width: number }
    endNode: Point & { height: number; width: number }
    onClickEdge: (event: any) => void
    deleteEdge: () => void
    onMouseOverEdge: (startID: any, endID: any) => void
    containsApprovalNode: boolean
    showApprovalNode?: boolean
    onClickApprovalNode?: () => void
}

interface LineDots {
    lineStartX: number
    lineStartY: number
    lineEndX: number
    lineEndY: number
    midPointX: number
    midPointY: number
}

interface ArrowEquationType {
    pathD: string
    pointX: number
    pointY: number
}

export default class Edge extends Component<EdgeProps>{

    getLineDots(): LineDots {
        let lineStartX = this.props.startNode.x + this.props.startNode.width;
        let lineStartY = this.props.startNode.y + this.props.startNode.height / 2;
        let lineEndX = this.props.endNode.x;
        let lineEndY = this.props.endNode.y + this.props.startNode.height / 2;
        let midPointX = (lineStartX + lineEndX) / 2;
        let midPointY = (lineStartY + lineEndY) / 2;
        return {
            lineStartX,
            lineStartY,
            lineEndX,
            lineEndY,
            midPointX,
            midPointY
        }
    }

    getPathEquation(): string {
        let { lineStartX, lineStartY, lineEndX, lineEndY, midPointX, midPointY } = this.getLineDots();
        if (lineStartX > lineEndX) {
            return `M${lineStartX} ${lineStartY} H ${lineStartX + 15} V ${midPointY} H${lineEndX - 15} V ${lineEndY} H ${lineEndX}`;
            // this.props.deleteEdge();
            // return ``;
        }
        else if (lineStartY != lineEndY) {
            return `M${lineStartX} ${lineStartY} H ${this.props.containsApprovalNode ? midPointX - 14 : midPointX} V ${lineEndY} H ${lineEndX}`;
        }
        else {
            return `M${lineStartX} ${lineStartY} L ${lineEndX} ${lineEndY}`;
        }
    }

    getSegmentArrowEquationVertical(start: Point, end: Point, isDownward: boolean): string {
        // x will remain constant and y will vary
        let offset = isDownward ? 10 : -10;
        let midPoint = { x: start.x, y: offset + (start.y + end.y) / 2 };
        let pointA = { x: start.x, y: isDownward ? midPoint.y - 10 : midPoint.y + 10 };
        let pointB = { x: start.x, y: isDownward ? pointA.y - 10 : pointA.y + 10 };
        let pointC = { x: start.x - 10, y: pointB.y };
        let pointD = { x: start.x + 10, y: pointB.y };

        return `M${midPoint.x} ${midPoint.y} L ${pointC.x} ${pointC.y} L ${pointA.x} ${pointA.y} L ${pointD.x} ${pointD.y} Z`;
    }

    getSegmentArrowEquationHorizontal(
        start: Point,
        end: Point,
        isToRight: boolean,
    ): ArrowEquationType {
        // y will remain same and x will vary
        let offset = isToRight ? 10 : -10;
        let midPoint = { x: offset + (start.x + end.x) / 2, y: start.y };
        let pointA = { x: isToRight ? midPoint.x - 10 : midPoint.x + 10, y: start.y };
        let pointB = { x: isToRight ? pointA.x - 10 : pointA.x + 10, y: start.y };
        let pointC = { x: pointB.x, y: start.y - 10 };
        let pointD = { x: pointB.x, y: start.y + 10 };

        return {
            pathD: `M${midPoint.x} ${midPoint.y} L ${pointC.x} ${pointC.y} L ${pointA.x} ${pointA.y} L ${pointD.x} ${pointD.y} Z`,
            pointX: pointC.x,
            pointY: pointC.y,
        }
    }

    getArrowEquation(): ArrowEquationType {
        let { lineStartX, lineStartY, lineEndX, lineEndY, midPointX, midPointY } = this.getLineDots();
        if (lineStartX > lineEndX) {
            // this.props.deleteEdge();
            return this.getSegmentArrowEquationHorizontal({
                x: midPointX,
                y: midPointY
            }, {
                    x: lineStartX,
                    y: lineEndY
                }, lineStartX < lineEndX);
        }
        else {
            return this.getSegmentArrowEquationHorizontal({
                x: midPointX,
                y: lineEndY
            }, {
                    x: lineEndX,
                    y: lineStartY
                }, lineStartX < lineEndX);
        }
    }

    handleOnMouseOver = () => {
        this.props.onMouseOverEdge(this.props.startNode, this.props.endNode)
    }

    render() {
        const arrowEquation = this.getArrowEquation()

        return (
            <g
                style={{ cursor: 'pointer' }}
                onClick={this.props.onClickEdge}
                className="edge-group"
                onMouseOver={this.handleOnMouseOver}
            >
                <path
                    className="color-path"
                    d={this.getPathEquation()}
                    fill="transparent"
                    stroke={nodeColors.strokeSolid}
                    strokeWidth={2}
                />
                {this.props.showApprovalNode ? (
                    <g
                        style={{
                            transform: `translate(${arrowEquation.pointX - 13}px, ${arrowEquation.pointY - 7}px)`,
                        }}
                        onClick={this.props.onClickApprovalNode}
                    >
                        <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="white" stroke="#D0D4D9" />
                        <path
                            d="M17.5099 10.8999C17.1112 11.0122 16.8791 11.4265 16.9914 11.8252C17.1037 12.2239 17.518 12.456 17.9167 12.3437L17.5099 10.8999ZM18.5951 18.0007L18.5946 17.2507C18.1805 17.251 17.845 17.5869 17.8451 18.0011C17.8453 18.4152 18.1811 18.7508 18.5952 18.7507L18.5951 18.0007ZM8.3862 19.9067C8.14798 20.2456 8.22956 20.7134 8.56841 20.9516C8.90727 21.1898 9.37508 21.1082 9.61331 20.7694L8.3862 19.9067ZM17.3865 20.7691C17.6248 21.1079 18.0926 21.1895 18.4314 20.9512C18.7703 20.713 18.8518 20.2451 18.6136 19.9063L17.3865 20.7691ZM22.4813 20.7686C22.7193 21.1076 23.1871 21.1895 23.5261 20.9515C23.8651 20.7135 23.947 20.2458 23.709 19.9067L22.4813 20.7686ZM16 14.7507C16 16.1315 14.8807 17.2507 13.5 17.2507V18.7507C15.7092 18.7507 17.5 16.9599 17.5 14.7507H16ZM13.5 17.2507C12.1193 17.2507 11 16.1315 11 14.7507H9.50002C9.50002 16.9599 11.2909 18.7507 13.5 18.7507V17.2507ZM11 14.7507C11 13.37 12.1193 12.2507 13.5 12.2507V10.7507C11.2909 10.7507 9.50002 12.5416 9.50002 14.7507H11ZM13.5 12.2507C14.8807 12.2507 16 13.37 16 14.7507H17.5C17.5 12.5416 15.7092 10.7507 13.5 10.7507V12.2507ZM17.9167 12.3437C18.2605 12.2468 18.6212 12.2247 18.9743 12.279L19.202 10.7964C18.637 10.7096 18.06 10.7449 17.5099 10.8999L17.9167 12.3437ZM18.9743 12.279C19.3274 12.3332 19.6648 12.4625 19.9638 12.6581L20.785 11.4029C20.3067 11.0899 19.7669 10.8831 19.202 10.7964L18.9743 12.279ZM19.9638 12.6581C20.2627 12.8537 20.5163 13.1111 20.7074 13.4129L21.9747 12.6106C21.669 12.1276 21.2633 11.7158 20.785 11.4029L19.9638 12.6581ZM20.7074 13.4129C20.8985 13.7148 21.0226 14.0541 21.0716 14.408L22.5574 14.2026C22.4792 13.6364 22.2805 13.0935 21.9747 12.6106L20.7074 13.4129ZM21.0716 14.408C21.1205 14.7619 21.093 15.1221 20.991 15.4645L22.4285 15.8929C22.5917 15.3451 22.6357 14.7687 22.5574 14.2026L21.0716 14.408ZM20.991 15.4645C20.8889 15.8069 20.7147 16.1234 20.4801 16.3928L21.6111 17.3781C21.9865 16.9471 22.2652 16.4407 22.4285 15.8929L20.991 15.4645ZM20.4801 16.3928C20.2454 16.6622 19.9557 16.8781 19.6306 17.0261L20.2519 18.3913C20.7722 18.1546 21.2356 17.8091 21.6111 17.3781L20.4801 16.3928ZM19.6306 17.0261C19.3054 17.1741 18.9523 17.2507 18.595 17.2507L18.5952 18.7507C19.1668 18.7507 19.7317 18.6281 20.2519 18.3913L19.6306 17.0261ZM9.61331 20.7694C10.0517 20.1458 10.6337 19.6369 11.3101 19.2855L10.6187 17.9544C9.72871 18.4166 8.96299 19.0863 8.3862 19.9067L9.61331 20.7694ZM11.3101 19.2855C11.9865 18.9342 12.7378 18.7508 13.5 18.7507L13.5 17.2507C12.4971 17.2508 11.5087 17.4921 10.6187 17.9544L11.3101 19.2855ZM13.5 18.7507C14.2623 18.7507 15.0131 18.9341 15.6896 19.2854L16.3809 17.9542C15.4909 17.492 14.5029 17.2507 13.5 17.2507L13.5 18.7507ZM15.6896 19.2854C16.3661 19.6367 16.9481 20.1456 17.3865 20.7691L18.6136 19.9063C18.0367 19.0859 17.2709 18.4164 16.3809 17.9542L15.6896 19.2854ZM18.5957 18.7507C19.3578 18.7502 20.1089 18.9333 20.7852 19.2846L21.4766 17.9534C20.5863 17.491 19.5977 17.25 18.5946 17.2507L18.5957 18.7507ZM20.7852 19.2846C21.4616 19.6358 22.0434 20.1449 22.4813 20.7686L23.709 19.9067C23.1326 19.0857 22.3668 18.4157 21.4766 17.9534L20.7852 19.2846Z"
                            fill="#596168"
                        />
                    </g>
                ) : (
                    <path d={arrowEquation.pathD} fill={nodeColors.arrowColor} />
                )}
            </g>
        )
    }
}
