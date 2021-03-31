import React, { Component } from 'react';
import link from '../../../../../../assets/icons/ic-link.svg';
import Tippy from '@tippyjs/react';

export interface CINodeProps {
    x: number;
    y: number;
    width: number;
    height: number;
    id: string;
    title: string;
    type: string;
    description: string;
    workflowId: number;
    triggerType: string;
    isExternalCI: boolean;
    isLinkedCI: boolean;
    linkedCount: number;
    downstreams: string[];
    status: string;
    inputMaterialsNew?: any[];
    colorCode?: string;
}

export class TriggerExternalCINode extends Component<CINodeProps> {

    renderCardContent() {
        return <div className="workflow-node">
            {this.props.linkedCount ? <span className="link-count">
                <img src={link} className="icon-dim-12 mr-5" alt="" />
                {this.props.linkedCount}
            </span> : null}
            <div className="workflow-node__trigger-type workflow-node__trigger-type--create">{this.props.triggerType}</div>
            <div className="workflow-node__title flex">
                <div className="workflow-node__full-width-minus-Icon">
                    <span className="workflow-node__text-light">Build: External</span>
                    <Tippy className="default-tt" arrow={true} placement="bottom" content={this.props.title}>
                        <div className="ellipsis-left">{this.props.title}</div>
                    </Tippy>
                </div>
                <div className="workflow-node__icon-common ml-8 workflow-node__CI-webhook-icon"/>
            </div>
        </div>
    }

    render() {
        return <foreignObject className="data-hj-whitelist" x={this.props.x} y={this.props.y} width={this.props.width} height={this.props.height} style={{ overflow: 'visible' }}>
            {this.renderCardContent()}
        </foreignObject>
    }
}