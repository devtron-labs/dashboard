/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component } from 'react'
import Tippy from '@tippyjs/react'
import { Link } from 'react-router-dom'
import {
    DeploymentAppTypes,
    DeploymentNodeType,
    triggerStatus,
    statusColor,
    statusIcon,
} from '@devtron-labs/devtron-fe-common-lib'
import { TriggerCDNodeProps, TriggerCDNodeState } from '../../types'
import { ReactComponent as Rollback } from '../../../../../../assets/icons/ic-rollback.svg'
import { URLS, DEFAULT_STATUS } from '../../../../../../config'
import { TriggerViewContext } from '../../config'
import { envDescriptionTippy, getNodeSideHeadingAndClass } from './workflow.utils'
import NoGitOpsRepoConfiguredWarning, {
    ReloadNoGitOpsRepoConfiguredModal,
} from '../../../../../workflowEditor/NoGitOpsRepoConfiguredWarning'
import { gitOpsRepoNotConfiguredWithEnforcedEnv } from '../../../../../gitOps/constants'

export class TriggerCDNode extends Component<TriggerCDNodeProps, TriggerCDNodeState> {
    constructor(props) {
        super(props)
        this.redirectToCDDetails = this.redirectToCDDetails.bind(this)
        this.state = {
            showGitOpsRepoConfiguredWarning: false,
            gitopsConflictLoading: false,
            reloadNoGitOpsRepoConfiguredModal: false,
            gitOpsRepoWarningCondition:
                this.props.deploymentAppType === DeploymentAppTypes.GITOPS && this.props.isGitOpsRepoNotConfigured,
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

    componentDidUpdate(prevProps: Readonly<TriggerCDNodeProps>, prevState: Readonly<TriggerCDNodeState>): void {
        if (prevProps.isGitOpsRepoNotConfigured !== this.props.isGitOpsRepoNotConfigured) {
            this.setState({
                gitOpsRepoWarningCondition:
                    this.props.deploymentAppType === DeploymentAppTypes.GITOPS && this.props.isGitOpsRepoNotConfigured,
            })
        }
    }

    renderStatus() {
        const url = this.getCDNodeDetailsURL()
        const statusText = this.props.status ? triggerStatus(this.props.status) : ''
        const status = statusText ? statusText.toLowerCase() : ''
        const hideDetails =
            status === DEFAULT_STATUS.toLowerCase() || status === 'not triggered' || status === 'not deployed'
        if (hideDetails) {
            return (
                <div
                    data-testid={`cd-trigger-status-${this.props.index}`}
                    className="dc__cd-trigger-status"
                    style={{ color: statusColor[status] }}
                >
                    <span>{statusText}</span>
                </div>
            )
        }
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
        this.state.gitOpsRepoWarningCondition &&
            this.setState({
                showGitOpsRepoConfiguredWarning: true,
            })
    }

    closeNoGitOpsRepoConfiguredWarning = (): void => {
        this.setState({
            showGitOpsRepoConfiguredWarning: false,
        })
    }

    closeReloadNoGitOpsRepoConfiguredModal = (): void => {
        this.setState({
            reloadNoGitOpsRepoConfiguredModal: false,
        })
    }

    handleRollbackClick = (context): void => {
        !this.state.gitOpsRepoWarningCondition && context.onClickRollbackMaterial(+this.props.id)
        this.handleShowGitOpsRepoConfiguredWarning()
    }

    handleImageSelection = (event, context): void => {
        event.stopPropagation()
        !this.state.gitOpsRepoWarningCondition &&
            context.onClickCDMaterial(this.props.id, DeploymentNodeType[this.props.type])
        this.handleShowGitOpsRepoConfiguredWarning()
    }

    renderCardContent() {
        const { heading, className: nodeSideClass } = getNodeSideHeadingAndClass(
            this.props.isTriggerBlocked,
            this.props.isDeploymentBlocked,
            this.props.triggerType,
        )
        return (
            <TriggerViewContext.Consumer>
                {(context) => {
                    return (
                        <>
                            <div className="workflow-node">
                                <div
                                    className={`workflow-node__trigger-type workflow-node__trigger-type--cd fw-6 flex ${nodeSideClass}`}
                                >
                                    <span>{heading}</span>
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
                                {this.renderStatus()}
                                <div className="workflow-node__btn-grp">
                                    {!this.props.isVirtualEnvironment && (
                                        <Tippy className="default-tt" arrow placement="bottom" content="Rollback">
                                            <button
                                                data-testid={`cd-trigger-deploy-roll-back-${this.props.index}`}
                                                className="workflow-node__rollback-btn"
                                                onClick={(event) => {
                                                    this.handleRollbackClick(context)
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
                                            this.handleImageSelection(event, context)
                                        }}
                                    >
                                        Select Image
                                    </button>
                                </div>
                            </div>
                            {this.state.showGitOpsRepoConfiguredWarning && (
                                <NoGitOpsRepoConfiguredWarning
                                    closePopup={this.closeNoGitOpsRepoConfiguredWarning}
                                    appId={this.props.appId}
                                    text={gitOpsRepoNotConfiguredWithEnforcedEnv(this.props.environmentName)}
                                    reload={context.reloadTriggerView}
                                />
                            )}
                            {this.state.reloadNoGitOpsRepoConfiguredModal && (
                                <ReloadNoGitOpsRepoConfiguredModal
                                    closePopup={this.closeReloadNoGitOpsRepoConfiguredModal}
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
