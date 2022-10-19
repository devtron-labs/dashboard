import React, { Component } from 'react'
import { PipelineSelectProps } from './types'
import { Modal } from '../common'
import ci from '../../assets/img/ic-pipeline-ci@2x.png'
import linkedPipeline from '../../assets/icons/ic-pipeline-linked.svg'
import webhook from '../../assets/img/webhook.svg'

export class PipelineSelect extends Component<PipelineSelectProps> {
    renderCIMenu() {
        return (
            <div className="white-card pipeline-webhook dc__top-radius-4">
                <div className="dc__window-bg dc__top-radius-4 pt-4 pr-10 pb-4 pl-10 fs-12 fw-6 cn-9">
                    Build container image
                </div>
                <div
                    className="flexbox pt-8 pr-12 pb-8 pl-12 pointer"
                    onClick={(event) => {
                        this.props.toggleCIMenu(event)
                        this.props.addCIPipeline('CI', this.props.workflowId)
                    }}
                >
                    <img src={ci} className="br-8 mr-12 h-40" alt="ci" />
                    <div>
                        <h4 className="fs-13 fw-6 cn-9 mt-0 mb-2">Build and deploy from source code</h4>
                        <p className="lh-16 fs-12 fw-4 cn-7 m-0">
                            Build container image from a Git repo and deploy to an environment.
                        </p>
                    </div>
                </div>
                <div
                    className="flexbox pt-8 pr-12 pb-8 pl-12 pointer"
                    onClick={(event) => {
                        this.props.toggleCIMenu(event)
                        this.props.addCIPipeline('LINKED-CI', this.props.workflowId)
                    }}
                >
                    <img src={linkedPipeline} className="br-8 mr-12 h-40" alt="linked-ci" />
                    <div>
                        <h4 className="fs-13 fw-6 cn-9 mt-0 mb-2">Linked build Pipeline</h4>
                        <p className="lh-16 fs-12 fw-4 cn-7 m-0">
                            Use image built by another build pipeline within Devtron.
                        </p>
                    </div>
                </div>
                <div className="dc__window-bg dc__top-radius-4 pt-4 pr-10 pb-4 pl-10 fs-12 fw-6 cn-9">
                    Receive container image
                </div>
                <div
                    className="flexbox pt-8 pr-12 pb-8 pl-12 pointer"
                    onClick={(event) => {
                        this.props.toggleCIMenu(event)
                        this.props.addCIPipeline('EXTERNAL-CI', this.props.workflowId)
                    }}
                >
                    <img src={webhook} className="br-8 mr-12 h-40" alt="external-ci" />
                    <div>
                        <h4 className="fs-13 fw-6 cn-9 mt-0 mb-2">Deploy image from external service</h4>
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
