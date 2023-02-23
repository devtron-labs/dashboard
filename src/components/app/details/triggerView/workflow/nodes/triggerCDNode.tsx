import React, { Component } from 'react';
import { DeploymentNodeType, TriggerCDNodeProps } from '../../types';
import { statusColor, statusIcon } from '../../../../config';
import { ReactComponent as Rollback } from '../../../../../../assets/icons/ic-rollback.svg';
import { URLS, DEFAULT_STATUS } from '../../../../../../config';
import Tippy from '@tippyjs/react';
import { Link } from 'react-router-dom';
import { TriggerViewContext } from '../../config';
import { triggerStatus } from '../../../cicdHistory/History.components';

export class TriggerCDNode extends Component<TriggerCDNodeProps> {
    constructor(props) {
        super(props)
        this.redirectToCDDetails = this.redirectToCDDetails.bind(this)
    }

    getCDNodeDetailsURL(): string {
        return `${this.props.match.url.split('/').slice(0, -1).join('/')}/${URLS.APP_DETAILS}/${
            this.props.environmentId
        }`
    }

    redirectToCDDetails() {
      if (this.props.fromAppGrouping) {
          return
      }
      this.props.history.push(this.getCDNodeDetailsURL())
    }

    renderStatus() {
        const url = this.getCDNodeDetailsURL()
        let statusText = this.props.status ? triggerStatus(this.props.status) : ''
        let status = statusText ? statusText.toLowerCase() : ''
        let hideDetails =
            status === DEFAULT_STATUS.toLowerCase() || status === 'not triggered' || status === 'not deployed'
        if (hideDetails)
            return (
                <div className="dc__cd-trigger-status" style={{ color: statusColor[status] }}>
                    <span>{statusText}</span>
                </div>
            )
        else
            return (
                <div className="dc__cd-trigger-status" style={{ color: statusColor[status] }}>
                    <span>
                        <span className={`dc__cd-trigger-status__icon ${statusIcon[status]}`} />
                    </span>
                    <span>{statusText}</span>
                    {!this.props.fromAppGrouping && (
                        <>
                            <span className="mr-5 ml-5">/</span>
                            <Link to={url} className="workflow-node__details-link">
                                Details
                            </Link>
                        </>
                    )}
                </div>
            )
    }

    renderCardContent() {
        return (
            <TriggerViewContext.Consumer>
                {(context) => {
                    return (
                        <div className="workflow-node">
                            <div className="workflow-node__trigger-type workflow-node__trigger-type--cd">
                                {this.props.triggerType}
                            </div>
                            <div className="workflow-node__title flex">
                                {/* <img src={pipelineDeploy} className="icon-dim-24 mr-16" /> */}
                                <div className="workflow-node__full-width-minus-Icon">
                                    <span className="workflow-node__text-light">
                                        Deploy: {this.props.deploymentStrategy}
                                    </span>
                                    <Tippy
                                        className="default-tt"
                                        arrow={true}
                                        placement="bottom"
                                        content={this.props.environmentName}
                                    >
                                        <span className="dc__ellipsis-right">{this.props.environmentName}</span>
                                    </Tippy>
                                </div>
                                <div className="workflow-node__icon-common ml-8 workflow-node__CD-icon" />
                            </div>
                            {this.renderStatus()}
                            <div className="workflow-node__btn-grp">
                                <Tippy className="default-tt" arrow={true} placement="bottom" content={'Rollback'}>
                                    <button
                                        className="workflow-node__rollback-btn"
                                        onClick={(event) => context.onClickRollbackMaterial(+this.props.id)}
                                    >
                                        <Rollback className="icon-dim-20 dc__vertical-align-middle" />
                                    </button>
                                </Tippy>
                                <button
                                    className="workflow-node__deploy-btn"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        context.onClickCDMaterial(this.props.id, DeploymentNodeType[this.props.type])
                                    }}
                                >
                                    Select Image
                                </button>
                            </div>
                        </div>
                    )
                }}
            </TriggerViewContext.Consumer>
        )
    }

    render() {
        return (
            <foreignObject
                className="data-hj-whitelist"
                key={`cd-${this.props.id}`}
                x={this.props.x}
                y={this.props.y}
                width={this.props.width}
                height={this.props.height}
                style={{ overflow: 'visible' }}
            >
                {this.renderCardContent()}
            </foreignObject>
        )
    }
}