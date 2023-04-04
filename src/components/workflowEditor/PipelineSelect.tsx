import React, { Component } from 'react'
import { PipelineSelectProps } from './types'
import ci from '../../assets/img/ic-pipeline-ci@2x.png'
import linkedPipeline from '../../assets/icons/ic-pipeline-linked.svg'
import webhook from '../../assets/img/webhook.svg'
import { CIPipelineNodeType, PipelineType } from '../app/details/triggerView/types'
import { Modal } from '@devtron-labs/devtron-fe-common-lib'

export class PipelineSelect extends Component<PipelineSelectProps> {
    handleMenuClick = (e): void => {
        this.props.toggleCIMenu(e)
        const pipelineType = e.currentTarget.dataset.pipelineType
        if (pipelineType === PipelineType.WEBHOOK) {
            this.props.addWebhookCD(this.props.workflowId)
        } else {
            this.props.addCIPipeline(pipelineType, this.props.workflowId)
        }
    }
    renderCIMenu() {
        return (
            <div className="white-card pipeline-select-container br-4 p-0">
                <div className="dc__window-bg dc__top-radius-4 pt-4 pr-10 pb-4 pl-10 fs-12 fw-6 cn-9">
                    Build container image
                </div>
                <div
                    className="pipeline-select-item flexbox p-12 pointer"
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
                <div className="dc__window-bg pt-4 pr-10 pb-4 pl-10 fs-12 fw-6 cn-9">
                    Receive container image
                </div>
                <div
                    className="pipeline-select-item flexbox p-12 pointer"
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
            </div>
        )
    }

    render() {
        if (!this.props.showMenu) return null
        else
            return (
                <Modal onClick={this.props.toggleCIMenu} style={{ ...this.props.styles }}>
                    {this.renderCIMenu()}
                </Modal>
            )
    }
}
