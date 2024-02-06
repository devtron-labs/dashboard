import React, { Component } from 'react';
import { TriggerPrePostCDNodeProps ,TriggerPrePostCDNodeState} from '../../types';
import { TriggerStatus } from '../../../../config';
import { BUILD_STATUS, URLS } from './../../../../../../config';
import { Link } from 'react-router-dom';
import { DEFAULT_STATUS } from '../../../../../../config';
import { TriggerViewContext } from '../../config';
import { DeploymentAppTypes, stopPropagation } from '@devtron-labs/devtron-fe-common-lib'
import NoGitOpsRepoConfiguredWarning from '../../../../../workflowEditor/NoGitOpsRepoConfiguredWarning'
import { gitOpsRepoNotConfiguredWithEnforcedEnv } from '../../../../../gitOps/constants'

export class TriggerPrePostCDNode extends Component<TriggerPrePostCDNodeProps, TriggerPrePostCDNodeState> {
    gitOpsRepoWarningCondition =
        this.props.deploymentAppType === DeploymentAppTypes.GITOPS && this.props.isGitOpsRepoNotConfigured

    constructor(props) {
        super(props)
        this.redirectToCDDetails = this.redirectToCDDetails.bind(this)
        this.state = {
            showGitOpsRepoConfiguredWarning: false,
        }
    }

    getCDDetailsURL(): string {
        return `${this.props.match.url.replace(URLS.APP_TRIGGER, URLS.APP_CD_DETAILS)}/${this.props.environmentId}/${
            this.props.id
        }?type=${this.props.type}`
    }

    redirectToCDDetails(e) {
        if (this.props.fromAppGrouping) {
            return
        }
        this.props.history.push(this.getCDDetailsURL())
    }

    renderStatus(isClickable: boolean, status: string) {
        const url = this.getCDDetailsURL()
        if (isClickable) {
            return (
                <div className="dc__cd-trigger-status" style={{ color: TriggerStatus[status] }}>
                    <span data-testid={`${this.props.title}-trigger-status-${this.props.index}`}>
                        {this.props.status}
                    </span>
                    {!this.props.fromAppGrouping && (
                        <>
                            {this.props.status && <span className="mr-5 ml-5">/</span>}
                            <Link onClick={stopPropagation} to={url} className="workflow-node__details-link">
                                Details
                            </Link>
                        </>
                    )}
                </div>
            )
        } else
            return (
                <div className="dc__cd-trigger-status" style={{ color: TriggerStatus[status] }}>
                    <span>{this.props.status}</span>
                </div>
            )
    }

    handleShowGitOpsRepoConfiguredWarning = (): void => {
        this.gitOpsRepoWarningCondition &&
            this.setState((prevState) => ({
                showGitOpsRepoConfiguredWarning: !prevState.showGitOpsRepoConfiguredWarning,
            }))
    }
    
    handleImageSelection = (event, context): void => {
        event.stopPropagation()
        !this.gitOpsRepoWarningCondition && context.onClickCDMaterial(this.props.id, this.props.type)
        this.handleShowGitOpsRepoConfiguredWarning()
    }

    renderCardContent() {
        let status = this.props.status ? this.props.status.toLocaleLowerCase() : ''
        let stage = this.props.type === 'PRECD' ? 'Pre-deployment' : 'Post-deployment'
        let isClickable = !(
            status === DEFAULT_STATUS.toLowerCase() ||
            status === BUILD_STATUS.NOT_TRIGGERED ||
            status === BUILD_STATUS.NOT_DEPLOYED
        )
        return (
            <TriggerViewContext.Consumer>
                {(context) => {
                    return (
                        <>
                            <div
                                className={isClickable ? 'workflow-node cursor' : 'workflow-node'}
                                onClick={(e) => {
                                    if (isClickable) this.redirectToCDDetails(e)
                                }}
                            >
                                <div className="workflow-node__trigger-type workflow-node__trigger-type--cd">
                                    {this.props.triggerType}
                                </div>
                                <div className="workflow-node__title flex">
                                    <div className="workflow-node__full-width-minus-Icon">
                                        <span className="workflow-node__text-light">Stage</span>
                                        <span className="">{stage}</span>
                                    </div>
                                    <div className="workflow-node__icon-common ml-8 workflow-node__CD-pre-post-icon" />
                                </div>
                                {this.renderStatus(isClickable, status)}
                                <div className="workflow-node__btn-grp">
                                    <button
                                        className="workflow-node__deploy-btn"
                                        data-testid={`${this.props.type}-trigger-select-image-${this.props.index}`}
                                        onClick={(event) => {
                                            this.handleImageSelection(event, context)
                                        }}
                                    >
                                        Select Image
                                    </button>
                                </div>
                            </div>
                            {this.state.showGitOpsRepoConfiguredWarning && (
                                <NoGitOpsRepoConfiguredWarning
                                    closePopup={this.handleShowGitOpsRepoConfiguredWarning}
                                    appId={+this.props.match.params.appId}
                                    text={gitOpsRepoNotConfiguredWithEnforcedEnv(this.props.environmentName)}
                                    reload={context.reloadTriggerView}
                                />
                            )}
                        </>
                    )
                }}
            </TriggerViewContext.Consumer>
        )
    }

    render() {
        return (
            <foreignObject
                className="data-hj-whitelist"
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