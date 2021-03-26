import React, { Component } from 'react';
import branch from '../../../assets/icons/misc/branch.svg';
import Tippy from '@tippyjs/react';

export interface StaticNodeProps {
    x: number;
    y: number;
    branch: string;
    icon: string;
    id: string;
    url: string;
    title: string;
    height: number;
    width: number;
    downstreams: any[];
}

export class StaticNode extends Component<StaticNodeProps>{

    renderCardContent() {
        return <div className="workflow-node workflow-node--static">
            <div className={`workflow-node__git-icon`} />
            <div className="workflow-node__title workflow-node__title--static">
                <span>/{this.props.title}</span>
                <div className="branch-name">
                    <img src={branch} alt="branch" className="icon-dim-12 mr-5" />
                    <Tippy className="default-tt" arrow={true} placement="bottom" content={this.props.branch}>
                        <span className="ellipsis-right" >{this.props.branch}</span>
                    </Tippy>
                </div>
            </div>
        </div>
    }

    render() {
        return <foreignObject className="data-hj-whitelist" key={`static-${this.props.id}`} x={this.props.x} y={this.props.y} width={this.props.width} height={this.props.height} style={{ overflow: 'visible' }}>
            {this.renderCardContent()}
        { console.log(this.props) }

        </foreignObject>
    }
}