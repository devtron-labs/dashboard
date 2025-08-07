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
import {
    DeploymentAppTypes,
    stopPropagation,
    getWorkflowNodeStatusTitle,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'
import { TriggerPrePostCDNodeProps, TriggerPrePostCDNodeState } from '../../types'
import { TriggerStatus } from '../../../../config'
import { BUILD_STATUS, URLS, DEFAULT_STATUS } from '../../../../../../config'
import NoGitOpsRepoConfiguredWarning from '../../../../../workflowEditor/NoGitOpsRepoConfiguredWarning'
import { getNodeSideHeadingAndClass } from './workflow.utils'
import { getAppGroupDeploymentHistoryLink } from '../../../../../ApplicationGroup/AppGroup.utils'
import { gitOpsRepoNotConfiguredWithEnforcedEnv } from '@Pages/App/Configurations'

export class TriggerPrePostCDNode extends Component<TriggerPrePostCDNodeProps, TriggerPrePostCDNodeState> {
    gitOpsRepoWarningCondition =
        this.props.deploymentAppType === DeploymentAppTypes.ARGO && this.props.isGitOpsRepoNotConfigured

    constructor(props) {
        super(props)
        this.state = {
            showGitOpsRepoConfiguredWarning: false,
        }
    }

    getCDDetailsURL(): string {
        if (this.props.fromAppGrouping) {
            return getAppGroupDeploymentHistoryLink(
                this.props.appId,
                this.props.environmentId,
                this.props.id,
                this.props.match.params.envId === this.props.environmentId.toString(),
                '',
                this.props.type,
            )
        }
        return `${this.props.match.url.replace(URLS.APP_TRIGGER, URLS.APP_CD_DETAILS)}/${this.props.environmentId}/${
            this.props.id
        }?type=${this.props.type}`
    }

    redirectToCDDetails = () => {
        this.props.history.push(this.getCDDetailsURL())
    }

    renderStatus(isClickable: boolean, status: string) {
        const url = this.getCDDetailsURL()
        if (isClickable) {
            return (
                <div className="dc__cd-trigger-status" style={{ color: TriggerStatus[status] }}>
                    <span data-testid={`${this.props.title}-trigger-status-${this.props.index}`}>
                        {getWorkflowNodeStatusTitle(this.props.status)}
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

    handleImageSelection = (event): void => {
        event.stopPropagation()
        !this.gitOpsRepoWarningCondition && this.props.onClickCDMaterial(+this.props.id, this.props.type)
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
                            this.redirectToCDDetails()
                        }
                    }}
                >
                    <div
                        className={`workflow-node__trigger-type workflow-node__trigger-type--cd flex fw-6 ${nodeSideClass}`}
                    >
                        <span>{heading}</span>
                    </div>
                    <div className="workflow-node__title flex dc__gap-8">
                        <div className="workflow-node__full-width-minus-Icon">
                            <span className="workflow-node__text-light">Stage</span>
                            <span className="">{stage}</span>
                        </div>
                        <Icon name="ic-node-script" size={20} color={null} />
                    </div>
                    {this.renderStatus(isClickable, status)}
                    <div className="workflow-node__btn-grp">
                        <button
                            className="workflow-node__deploy-btn"
                            data-testid={`${this.props.type}-trigger-select-image-${this.props.index}`}
                            onClick={(event) => {
                                this.handleImageSelection(event)
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
                        reload={this.props.reloadTriggerView}
                    />
                )}
            </>
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
