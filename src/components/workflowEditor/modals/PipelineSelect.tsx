import React, { Component } from 'react';
import { PipelineSelectProps } from '../types'
import ci from '../../../assets/img/ic-pipeline-ci@2x.png';
import pipelineDeploy from '../../../assets/img/ic-pipeline-deploy@2x.png';
import linkedPipeline from '../../../assets/icons/ic-pipeline-linked.svg';
import webhook from '../../../assets/img/webhook.svg';
import { Modal } from '../../common';
import { WorkflowEditorContext } from '../workflowEditor';

const PipelineType = {
    CI: 'CI',
    CD: 'CD'
}

export class PipelineSelect extends Component<PipelineSelectProps>  {

    renderCIMenu(context) {
        return <div className="white-card pipeline-webhook" >
            <div className="white-card__header white-card__header--pipeline-webhook">Select Pipeline</div>
            <div className="pipeline-webhook__item" onClick={(event) => {
                this.props.toggleMenu();
                context.handleCISelect(this.props.workflowId, 'CI', this.props.ciPipelineId)
            }}>
                <div className="pipeline-webhook__icon">
                    <img src={ci} className="pipeline-webhook__icon" alt="ci" />
                </div>
                <div>
                    <h4 className="pipeline-webhook__title">Continuous Integration</h4>
                    <p className="pipeline-webhook__text">Build docker image from a source code repository.</p>
                </div>
            </div>
            <div className="pipeline-webhook__item"
                onClick={(event) => {
                    this.props.toggleMenu();
                    context.handleCISelect(this.props.workflowId, 'LINKED-CI', this.props.ciPipelineId)
                }}>
                <div className="pipeline-webhook__icon">
                    <img src={linkedPipeline} className="pipeline-webhook__icon" alt="linked-ci" />
                </div>
                <div>
                    <h4 className="pipeline-webhook__title">Linked CI Pipeline</h4>
                    <p className="pipeline-webhook__text">Refer an existing Pipeline.</p>
                </div>
            </div>
            <div className="pipeline-webhook__item"
                onClick={(event) => {
                    this.props.toggleMenu();
                    context.handleCISelect(this.props.workflowId, 'EXTERNAL-CI', this.props.ciPipelineId)
                }}>
                <div className="pipeline-webhook__icon">
                    <img src={webhook} className="pipeline-webhook__icon" alt="external-ci" />
                </div>
                <div>
                    <h4 className="pipeline-webhook__title">Incoming Webhook</h4>
                    <p className="pipeline-webhook__text">Receive docker image from external source via a service.</p>
                </div>
            </div>
        </div>
    }

    renderCDMenu(context) {
        return <div className="white-card pipeline-webhook pipeline-webhook--cd-select" >
            <div className="white-card__header white-card__header--pipeline-webhook">Select Pipeline</div>
            <div className="pipeline-webhook__item cursor" onClick={(event) => { this.props.toggleMenu(); context.handleCDSelect(this.props.workflowId, this.props.ciPipelineId) }}>
                <div className="pipeline-webhook__icon" >
                    <img src={pipelineDeploy} className="pipeline-webhook__icon" alt="ci" />
                </div>
                <div>
                    <h4 className="pipeline-webhook__title">Deploy to Environment</h4>
                    <p className="pipeline-webhook__text">Deploy, configure, update your containerized applications to Kubernetes cluster.</p>
                    {/* <span className="form__error">
                        <img src={error} className="form__icon" />
                        <span>Requires deployment template.</span>
                    </span> */}
                </div>
            </div>
        </div>
    }

    render() {
        if (!this.props.showMenu) return null;
        else return <Modal onClick={this.props.toggleMenu} style={{ top: `${this.props.top}px`, left: `${this.props.left}px`, borderRadius: `8px` }} >
            <WorkflowEditorContext.Consumer>
                {(context) => {
                    return this.props.type === PipelineType.CI ? this.renderCIMenu(context) : this.renderCDMenu(context)
                }}
            </WorkflowEditorContext.Consumer>
        </Modal>

    }
}