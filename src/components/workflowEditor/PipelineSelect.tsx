import React, { Component } from 'react';
import { PipelineSelectProps } from './types'
import { Modal } from '../common';
import ci from '../../assets/img/ic-pipeline-ci@2x.png';
import linkedPipeline from '../../assets/icons/ic-pipeline-linked.svg';
import webhook from '../../assets/img/webhook.svg';

export class PipelineSelect extends Component<PipelineSelectProps>  {

    renderCIMenu() {
        return <div className="white-card pipeline-webhook" >
            <div className="white-card__header white-card__header--pipeline-webhook">Select Pipeline</div>
            <div className="pipeline-webhook__item" onClick={(event) => {
                this.props.toggleCIMenu(event);
                this.props.addCIPipeline('CI')
            }}>
                <div className="pipeline-webhook__icon">
                    <img src={ci} className="pipeline-webhook__icon" alt="ci" />
                </div>
                <div>
                    <h4 className="pipeline-webhook__title">Continuous Integration</h4>
                    <p className="pipeline-webhook__text">Build docker image from a source code repository.</p>
                </div>
            </div>
            <div className="pipeline-webhook__item" onClick={(event) => {
                this.props.toggleCIMenu(event);
                this.props.addCIPipeline('LINKED-CI')
            }}>
                <div className="pipeline-webhook__icon">
                    <img src={linkedPipeline} className="pipeline-webhook__icon" alt="linked-ci" />
                </div>
                <div>
                    <h4 className="pipeline-webhook__title">Linked CI Pipeline</h4>
                    <p className="pipeline-webhook__text">Refer an existing Pipeline.</p>
                </div>
            </div>
            <div className="pipeline-webhook__item" onClick={(event) => {
                this.props.toggleCIMenu(event);
                this.props.addCIPipeline('EXTERNAL-CI')
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

    render() {
        if (!this.props.showMenu) return null;
        else return <Modal onClick={this.props.toggleCIMenu}
            style={{ top: `${this.props.top}px`, left: `${this.props.left}px`, borderRadius: `8px` }} >
            {this.renderCIMenu()}
        </Modal>
    }
}