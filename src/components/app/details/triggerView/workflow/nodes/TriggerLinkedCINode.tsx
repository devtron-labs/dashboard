import React, { Component } from 'react';
import link from '../../../../../../assets/icons/ic-link.svg';
import { TriggerStatus } from '../../../../config';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { DEFAULT_STATUS, URLS } from '../../../../../../config';
import Tippy from '@tippyjs/react';

export interface CINodeProps extends RouteComponentProps<{}> {
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
    fromAppGrouping: boolean
    isCITriggerBlocked?: boolean
}

export class TriggerLinkedCINode extends Component<CINodeProps> {

    getCIDetailsURL(): string {
        return `${this.props.match.url.replace(URLS.APP_TRIGGER, URLS.APP_CI_DETAILS)}/${this.props.id}`;
    }

    redirectToCIDetails() {
      if (this.props.fromAppGrouping) {
          return
      }
      this.props.history.push(this.getCIDetailsURL())
    }

    renderStatus() {
        let url = this.getCIDetailsURL();
        let status = this.props.status ? this.props.status.toLowerCase() : "";
        let hideDetails = status === DEFAULT_STATUS.toLowerCase() || status === "not triggered" || status === "not deployed";
        if (hideDetails)
            return <div data-testid="cd-trigger-status" className="dc__cd-trigger-status" style={{ color: TriggerStatus[status] }}>
                {this.props.status}
            </div>
        else return (
            <div data-testid="cd-trigger-status" className="dc__cd-trigger-status" style={{ color: TriggerStatus[status] }}>
                {this.props.status}
                {!this.props.fromAppGrouping && (
                    <>
                        {this.props.status && <span className="mr-5 ml-5">/</span>}
                        <Link to={url} className="workflow-node__details-link">
                            Details
                        </Link>
                    </>
                )}
            </div>
        )
    }

    renderCardContent() {
        let status = this.props.status ? this.props.status.toLowerCase() : "";
        let hideDetails = status === DEFAULT_STATUS.toLowerCase() || status === "not triggered" || status === "not deployed";
        return <div className={`${hideDetails ? 'workflow-node' : 'workflow-node cursor'}`} onClick={(e) => { if (!hideDetails) this.redirectToCIDetails() }}>
            {this.props.linkedCount ? <span className="link-count">
                <img src={link} className="icon-dim-12 mr-5" alt="" />
                {this.props.linkedCount}
            </span> : null}
            <div
                className={`workflow-node__trigger-type workflow-node-trigger-type--external-ci ${
                    this.props.isCITriggerBlocked ? 'flex bcr-1 er-2 bw-1 cr-5' : ''
                }`}
                style={{
                    opacity: this.props.isCITriggerBlocked ? 1 : 0.4,
                }}
            >
                {this.props.isCITriggerBlocked ? 'BLOCKED' : this.props.triggerType}
            </div>
            <div className="workflow-node__title flex">
                <div className="workflow-node__full-width-minus-Icon">
                    <span className="workflow-node__text-light" data-testid="linked-indication-name">Build: Linked</span>
                    <Tippy className="default-tt" arrow={true} placement="bottom" content={this.props.title}>
                        <div className="dc__ellipsis-left">{this.props.title}</div>
                    </Tippy>
                </div>
                <div data-testid="ci-trigger-build-linked" className="workflow-node__icon-common ml-8 workflow-node__CI-linked-icon"/>
            </div>
            {this.renderStatus()}
        </div>
    }

    render() {
        return <foreignObject className="data-hj-whitelist" x={this.props.x} y={this.props.y} width={this.props.width} height={this.props.height} style={{ overflow: 'visible' }}>
            {this.renderCardContent()}
        </foreignObject>
    }
}