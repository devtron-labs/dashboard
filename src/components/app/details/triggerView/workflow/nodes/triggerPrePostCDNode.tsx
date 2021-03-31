import React, { Component } from 'react';
import { TriggerPrePostCDNodeProps } from '../../types';
import { TriggerStatus } from '../../../../config';
import { URLS } from './../../../../../../config';
import { TriggerViewContext } from '../../TriggerView';
import { Link } from 'react-router-dom';
import { DEFAULT_STATUS } from '../../../../../../config';

export class TriggerPrePostCDNode extends Component<TriggerPrePostCDNodeProps>{

    constructor(props) {
        super(props);
        this.redirectToCDDetails = this.redirectToCDDetails.bind(this);
    }

    getCDDetailsURL(): string {
        return `${this.props.match.url.replace(URLS.APP_TRIGGER, URLS.APP_CD_DETAILS)}/${this.props.environmentId}/${this.props.id}`
    }

    redirectToCDDetails(e) {
        const LINK = this.getCDDetailsURL();
        this.props.history.push(LINK);
    }

    renderStatus(isClickable: boolean, status: string,) {
        const url = this.getCDDetailsURL();
        if (isClickable) {
            return <div className="cd-trigger-status" style={{ color: TriggerStatus[status] }}>
                <span>{this.props.status}</span>
                <span className="mr-5 ml-5">/</span>
                <Link to={url} className="workflow-node__details-link">Details</Link>
            </div>
        }
        else return <div className="cd-trigger-status" style={{ color: TriggerStatus[status] }}>
            <span>{this.props.status}</span>
        </div>
    }

    renderCardContent() {
        let status = this.props.status ? this.props.status.toLocaleLowerCase() : "";
        let stage = this.props.type === "PRECD" ? "Pre-deployment" : "Post-deployment";
        let isClickable = !(status === DEFAULT_STATUS.toLowerCase() || status === "not triggered" || status === "not deployed");
        return <TriggerViewContext.Consumer>
            {(context) => {
                return <div className={isClickable ? "workflow-node cursor" : "workflow-node"} onClick={(e) => { if (isClickable) this.redirectToCDDetails(e) }}>
                    <div className="workflow-node__trigger-type workflow-node__trigger-type--cd">{this.props.triggerType}</div>
                    <div className="workflow-node__title flex">
                        <div className="workflow-node__full-width-minus-Icon">
                            <span className="workflow-node__text-light">Stage</span>
                            <span className="">{stage}</span>
                        </div>
                        <div className="workflow-node__icon-common ml-8 workflow-node__CD-pre-post-icon" />
                    </div>
                    {this.renderStatus(isClickable, status)}
                    <div className="workflow-node__btn-grp">
                        <button className="workflow-node__deploy-btn" onClick={(event) => { event.stopPropagation(); context.onClickCDMaterial(this.props.id, this.props.type) }}>Select Image</button>
                    </div>
                </div>
            }}
        </TriggerViewContext.Consumer>
    }

    render() {
        return <foreignObject className="data-hj-whitelist" x={this.props.x} y={this.props.y} width={this.props.width} height={this.props.height} style={{ overflow: 'visible' }}>
            {this.renderCardContent()}
        </foreignObject>
    }
}