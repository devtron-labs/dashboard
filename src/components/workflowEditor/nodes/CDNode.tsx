import React, { Component } from 'react';
import {Link} from 'react-router-dom'
export interface CDNodeProps {
    id: string;
    deploymentStrategy: string;
    triggerType: string;
    workflowId: number;
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    environmentName: string;
    environmentId: number;
    to: string;
}

export class CDNode extends Component<CDNodeProps> {

    renderCardContent() {
    return (
    <Link to={this.props.to} className="no-decor">
        <div className="workflow-node cursor">
            <div className="workflow-node__trigger-type workflow-node__trigger-type--create">{this.props.triggerType}</div>
            <div className="workflow-node__title flex">
                <div className="workflow-node__full-width-minus-Icon">
                    <span className="workflow-node__text-light">{this.props.title}</span>
                    <span className="ellipsis-right">{this.props.environmentName}</span>
                </div>
                <div className="workflow-node__icon-common workflow-node__CD-icon"></div>
            </div>
        </div>
    </Link>
    )
    }

    render() {
        return <foreignObject className="data-hj-whitelist" key={`cd-${this.props.id}`} x={this.props.x} y={this.props.y} width={this.props.width} height={this.props.height} style={{ overflow: 'visible' }}>
            {this.renderCardContent()}
        </foreignObject>
    }
}