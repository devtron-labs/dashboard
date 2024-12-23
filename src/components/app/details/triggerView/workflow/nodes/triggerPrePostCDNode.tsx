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
import { Link } from 'react-router-dom'
import { DeploymentAppTypes, stopPropagation } from '@devtron-labs/devtron-fe-common-lib'
import { TriggerPrePostCDNodeProps, TriggerPrePostCDNodeState } from '../../types'
import { TriggerStatus } from '../../../../config'
import { BUILD_STATUS, URLS, DEFAULT_STATUS } from '../../../../../../config'
import { TriggerViewContext } from '../../config'
import NoGitOpsRepoConfiguredWarning from '../../../../../workflowEditor/NoGitOpsRepoConfiguredWarning'
import { gitOpsRepoNotConfiguredWithEnforcedEnv } from '../../../../../gitOps/constants'
import { getNodeSideHeadingAndClass } from './workflow.utils'

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
                    <>
                        {this.props.status && <span className="mr-5 ml-5">/</span>}
                        <Link onClick={stopPropagation} to={url} className="workflow-node__details-link">
                            Details
                        </Link>
                    </>
                </div>
            )
        }
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
        const status = this.props.status ? this.props.status.toLocaleLowerCase() : ''
        const stage = this.props.type === 'PRECD' ? 'Pre-deployment' : 'Post-deployment'
        const isClickable = !(
            status === DEFAULT_STATUS.toLowerCase() ||
            status === BUILD_STATUS.NOT_TRIGGERED ||
            status === BUILD_STATUS.NOT_DEPLOYED
        )
        return (
            <TriggerViewContext.Consumer>
                {(context) => {
                    const { heading, className: nodeSideClass } = getNodeSideHeadingAndClass(
                        this.props.isTriggerBlocked,
                        this.props.isDeploymentBlocked,
                        this.props.triggerType,
                    )
                    return (
                        <>
                            <div
                                className={isClickable ? 'workflow-node cursor' : 'workflow-node'}
                                onClick={(e) => {
                                    if (isClickable) {
                                        this.redirectToCDDetails(e)
                                    }
                                }}
                            >
                                <div
                                    className={`workflow-node__trigger-type workflow-node__trigger-type--cd flex fw-6 ${nodeSideClass}`}
                                >
                                    <span>{heading}</span>
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
