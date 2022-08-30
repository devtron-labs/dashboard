import React, { Component } from 'react';
import {Link} from 'react-router-dom'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg';
import Tippy from '@tippyjs/react';

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
    toggleCDMenu: () => void;
}

export class CDNode extends Component<CDNodeProps> {

    renderCardContent() {
    return (
        <>
            <Link to={this.props.to} className="no-decor">
                <div className="workflow-node cursor">
                    <div className="workflow-node__trigger-type workflow-node__trigger-type--create">{this.props.triggerType}</div>
                    <div className="workflow-node__title flex">
                        <div className="workflow-node__full-width-minus-Icon">
                            <span className="workflow-node__text-light">{this.props.title}</span>
                            <span className="dc__ellipsis-right">{this.props.environmentName}</span>
                        </div>
                        <div className="workflow-node__icon-common workflow-node__CD-icon"></div>
                    </div>
                </div>
            </Link>

            <button className="workflow-node__add-cd-btn">
                <Tippy className="default-tt" arrow={false} placement="top" content={
                    <span style={{ display: "block", width: "145px" }}> Add deployment pipeline </span>}>
                    <Add className="icon-dim-18 fcb-5" onClick={(event: any) => {
                        event.stopPropagation();
                        let { top, left } = event.target.getBoundingClientRect();
                        top = top + 25;
                        this.props.toggleCDMenu();
                    }} />
                </Tippy>
            </button>
        </>
    )
    }

    render() {
        return <foreignObject className="data-hj-whitelist" key={`cd-${this.props.id}`} x={this.props.x} y={this.props.y} width={this.props.width} height={this.props.height} style={{ overflow: 'visible' }}>
            {this.renderCardContent()}
        </foreignObject>
    }
}