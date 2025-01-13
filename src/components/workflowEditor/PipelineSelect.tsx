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

import React, { Component } from 'react'
import { Modal, PipelineType } from '@devtron-labs/devtron-fe-common-lib'
import { PipelineSelectProps } from './types'
// Not using this image anywhere when completely deprecated remove this image
import ci from '../../assets/img/ic-pipeline-ci@2x.png'
import linkedPipeline from '../../assets/icons/ic-pipeline-linked.svg'
// Not using this image anywhere when completely deprecated remove this image
import webhook from '../../assets/img/webhook.svg'
import ciJobIcon from '../../assets/icons/ic-job-node.svg'
import { CIPipelineNodeType } from '../app/details/triggerView/types'

/**
 * @deprecated
 * @description Trying to deprecate this component instead, use WorkflowOptionsModal
 */
export class PipelineSelect extends Component<PipelineSelectProps> {
    handleMenuClick = (e): void => {
        this.props.toggleCIMenu(e)
        const { pipelineType } = e.currentTarget.dataset
        if (pipelineType === PipelineType.WEBHOOK) {
            this.props.addWebhookCD(this.props.workflowId)
        } else {
            this.props.addCIPipeline(pipelineType, this.props.workflowId)
        }
    }

    renderCIMenu() {
        return (
            <div className="white-card pipeline-select-container br-4 p-0">
                <div className="bg__tertiary dc__top-radius-4 pt-4 pr-10 pb-4 pl-10 fs-12 fw-6 cn-9">
                    Build container image
                </div>
                <div
                    className="pipeline-select-item flexbox p-12 pointer"
                    data-testid="build-deploy-from-source-code-button"
                    data-pipeline-type={CIPipelineNodeType.CI}
                    onClick={this.handleMenuClick}
                >
                    <img src={ci} className="br-8 mr-12 h-40" alt="ci" />
                    <div>
                        <h4 className="fs-13 fw-6 cn-9 mt-0 mb-4">Build and deploy from source code</h4>
                        <p className="lh-16 fs-12 fw-4 cn-7 m-0">
                            Build container image from a Git repo and deploy to an environment.
                        </p>
                    </div>
                </div>
                <div
                    className="pipeline-select-item flexbox p-12 pointer"
                    data-pipeline-type={CIPipelineNodeType.LINKED_CI}
                    data-testid="linked-build-pipeline-button"
                    onClick={this.handleMenuClick}
                >
                    <img src={linkedPipeline} className="br-8 mr-12 h-40" alt="linked-ci" />
                    <div>
                        <h4 className="fs-13 fw-6 cn-9 mt-0 mb-4">Linked build Pipeline</h4>
                        <p className="lh-16 fs-12 fw-4 cn-7 m-0">
                            Use image built by another build pipeline within Devtron.
                        </p>
                    </div>
                </div>
                <div className="bg__tertiary pt-4 pr-10 pb-4 pl-10 fs-12 fw-6 cn-9">Receive container image</div>
                <div
                    className="pipeline-select-item flexbox p-12 pointer"
                    data-testid="deploy-image-external-service-link"
                    data-pipeline-type={PipelineType.WEBHOOK}
                    onClick={this.handleMenuClick}
                >
                    <img src={webhook} className="br-8 mr-12 h-40" alt="external-ci" />
                    <div>
                        <h4 className="fs-13 fw-6 cn-9 mt-0 mb-4">Deploy image from external service</h4>
                        <p className="lh-16 fs-12 fw-4 cn-7 m-0">
                            Receive container images from an external service (eg. jenkins, CircleCI, etc.) and deploy
                            to an environment.
                        </p>
                    </div>
                </div>
                {window._env_.ENABLE_CI_JOB && (
                    <>
                        <div className="bg__tertiary pt-4 pr-10 pb-4 pl-10 fs-12 fw-6 cn-9">Create job pipeline</div>
                        <div
                            className="pipeline-select-item flexbox p-12 pointer"
                            data-testid="job-ci-pipeline-button"
                            data-pipeline-type={CIPipelineNodeType.JOB_CI}
                            onClick={this.handleMenuClick}
                        >
                            <div className="h-40 bcb-1 flex br-8 mr-12">
                                <img src={ciJobIcon} className="icon-dim-20 ml-10 mr-10" alt="job-ci" />
                            </div>
                            <div>
                                <h4 className="fs-13 fw-6 cn-9 mt-0 mb-4">Create a Job</h4>
                                <p className="lh-16 fs-12 fw-4 cn-7 m-0">
                                    Create and trigger a job. Such as trigger Jenkins build trigger
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        )
    }

    render() {
        if (!this.props.showMenu) {
            return null
        }
        return (
            <Modal onClick={this.props.toggleCIMenu} style={{ ...this.props.styles }}>
                {this.renderCIMenu()}
            </Modal>
        )
    }
}
