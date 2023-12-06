import React, { Component } from 'react'
import { TriggerCDNodeProps, TriggerCDNodeState } from '../../types'
import { statusColor, statusIcon } from '../../../../config'
import { ReactComponent as Rollback } from '../../../../../../assets/icons/ic-rollback.svg'
import { URLS, DEFAULT_STATUS } from '../../../../../../config'
import Tippy from '@tippyjs/react'
import { Link } from 'react-router-dom'
import { TriggerViewContext } from '../../config'
import { triggerStatus } from '../../../cicdHistory/History.components'
import { envDescriptionTippy } from './workflow.utils'
import { DeploymentAppTypes, DeploymentNodeType } from '@devtron-labs/devtron-fe-common-lib'
import NoGitOpsRepoConfiguredWarning from '../../../../../workflowEditor/NoGitOpsRepoConfiguredWarning'
import { gitOpsRepoNotConfiguredWithEnforcedEnv } from '../../../../../gitOps/constants'

export class TriggerCDNode extends Component<TriggerCDNodeProps, TriggerCDNodeState> {
    gitOpsRepoWarningCondition =
        this.props.deploymentAppType === DeploymentAppTypes.GITOPS && this.props.isGitOpsRepoNotConfigured
    constructor(props) {
        super(props)
        this.redirectToCDDetails = this.redirectToCDDetails.bind(this)
        this.state = {
            showGitOpsRepoConfiguredWarning: false,
        }
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

    renderStatus(title?: string) {
        const url = this.getCDNodeDetailsURL()
        let statusText = this.props.status ? triggerStatus(this.props.status) : ''
        let status = statusText ? statusText.toLowerCase() : ''
        let hideDetails =
            status === DEFAULT_STATUS.toLowerCase() || status === 'not triggered' || status === 'not deployed'
        if (hideDetails)
            return (
                <div
                    data-testid={`cd-trigger-status-${this.props.index}`}
                    className="dc__cd-trigger-status"
                    style={{ color: statusColor[status] }}
                >
                    <span>{statusText}</span>
                </div>
            )
        else
            return (
                <div
                    data-testid={`cd-trigger-status-${this.props.index}`}
                    className="dc__cd-trigger-status"
                    style={{ color: statusColor[status] }}
                >
                    <span className={`dc__cd-trigger-status__icon ${statusIcon[status]}`} />
                    <span>{statusText}</span>
                    {!this.props.fromAppGrouping && (
                        <>
                            {statusText && <span className="mr-5 ml-5">/</span>}
                            <Link
                                data-testid={`cd-trigger-details-${this.props.environmentName}-link`}
                                to={url}
                                className="workflow-node__details-link"
                            >
                                Details
                            </Link>
                        </>
                    )}
                </div>
            )
    }

    handleShowGitOpsRepoConfiguredWarning = (): void => {
        this.gitOpsRepoWarningCondition &&
            this.setState((prevState) => ({
                showGitOpsRepoConfiguredWarning: !prevState.showGitOpsRepoConfiguredWarning,
            }))
    }

    renderCardContent() {
        return (
            <TriggerViewContext.Consumer>
                {(context) => {
                    return (
                        <>
                            <div className="workflow-node">
                                <div className="workflow-node__trigger-type workflow-node__trigger-type--cd">
                                    {this.props.triggerType}
                                </div>
                                <div className="workflow-node__title flex">
                                    <div className="workflow-node__full-width-minus-Icon">
                                        <span
                                            data-testid={`${this.props.deploymentStrategy}`}
                                            className="workflow-node__text-light"
                                        >
                                            Deploy: {this.props.deploymentStrategy}
                                        </span>
                                        {envDescriptionTippy(this.props.environmentName, this.props.description)}
                                    </div>
                                    <div
                                        className={`workflow-node__icon-common ml-8 ${
                                            this.props.isVirtualEnvironment
                                                ? 'workflow-node__CD-rocket-icon'
                                                : 'workflow-node__CD-icon dc__flip'
                                        }`}
                                    />
                                </div>
                                {this.renderStatus(this.props.title)}
                                <div className="workflow-node__btn-grp">
                                    {!this.props.isVirtualEnvironment && (
                                        <Tippy
                                            className="default-tt"
                                            arrow={true}
                                            placement="bottom"
                                            content={'Rollback'}
                                        >
                                            <button
                                                data-testid={`cd-trigger-deploy-roll-back-${this.props.index}`}
                                                className="workflow-node__rollback-btn"
                                                onClick={(event) => {
                                                    !this.gitOpsRepoWarningCondition &&
                                                        context.onClickRollbackMaterial(+this.props.id)
                                                    this.handleShowGitOpsRepoConfiguredWarning()
                                                }}
                                            >
                                                <Rollback className="icon-dim-20 dc__vertical-align-middle" />
                                            </button>
                                        </Tippy>
                                    )}
                                    <button
                                        data-testid={`${this.props.type}-trigger-select-image-${this.props.index}`}
                                        className="workflow-node__deploy-btn"
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            !this.gitOpsRepoWarningCondition &&
                                                context.onClickCDMaterial(
                                                    this.props.id,
                                                    DeploymentNodeType[this.props.type],
                                                )
                                            this.handleShowGitOpsRepoConfiguredWarning()
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
