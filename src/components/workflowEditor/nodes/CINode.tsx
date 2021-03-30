import React, { Component } from 'react';
import { NodeAttr } from '../../app/details/triggerView/types';
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg';
import link from '../../../assets/icons/ic-link.svg';
import Tippy from '@tippyjs/react';
import { Link } from 'react-router-dom'

export interface CINodeProps {
    x: number;
    y: number;
    width: number;
    height: number;
    id: number;
    title: string;
    type: string;
    description: string;
    workflowId: number;
    triggerType: string;
    isLinkedCI: boolean;
    isExternalCI: boolean;
    isTrigger: boolean;
    linkedCount: number;
    downstreams: NodeAttr[];
    to: string;
    toggleCDMenu: () => void;
}

export class CINode extends Component<CINodeProps> {

    renderCardContent() {
        let classes = 'workflow-node cursor';
        let pipeline = this.props.isLinkedCI ? "Build: Linked" : this.props.isExternalCI ? "Build: External" : "Build";
        return <div className={classes}>
            <Link to={this.props.to} className="no-decor">
                {this.props.linkedCount ? <Tippy className="default-tt" arrow={true} placement="bottom" content={this.props.linkedCount}>
                    <span className="link-count"> <img src={link} className="icon-dim-12 mr-5" alt="" />
                        {this.props.linkedCount}
                    </span>
                </Tippy> : null}
                <div className="workflow-node__trigger-type workflow-node__trigger-type--create">{this.props.triggerType}</div>
                <div className="workflow-node__title flex">
                    <div className="workflow-node__full-width-minus-Icon">
                        <span className="workflow-node__text-light">{pipeline}</span>
                        <Tippy className="default-tt" arrow={true} placement="bottom" content={this.props.title}>
                            <div className="ellipsis-left">{this.props.title}</div>
                        </Tippy>
                    </div>
                    <div className="workflow-node__icon-common workflow-node__CI-icon"></div>
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
        </div>
    }

    render() {
        return <foreignObject className="data-hj-whitelist" x={this.props.x} y={this.props.y} width={this.props.width} height={this.props.height} style={{ overflow: 'visible' }}>
            {this.renderCardContent()}
        </foreignObject>
    }
}