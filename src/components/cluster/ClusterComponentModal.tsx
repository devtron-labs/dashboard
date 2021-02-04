import React, { Component } from 'react'
import { VisibleModal } from '../common';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { ClusterComponentModalProps } from './cluster.type';

export class ClusterComponentModal extends Component<ClusterComponentModalProps, {}>{

    renderStatus() {
        if (this.props.agentInstallationStage === 0) {
            return <p className="m-0 fw-6 fs-14 app-status-icon not-triggered">
                Not Triggered
                <button type="button" className="cluster-create-status__button ml-16" onClick={this.props.callRetryClusterInstall}>Install</button>
            </p>
        }
        else if (this.props.agentInstallationStage === 1) {
            return <p className="m-0 fw-6 fs-14 app-summary__status-name f-progressing">
                In progress...
            </p>
        }
        else if (this.props.agentInstallationStage === 2) {
            return <p className="m-0 fw-6 fs-14 app-summary__status-name f-healthy">
                Installed
            </p>
        }
        else if (this.props.agentInstallationStage === 3) {
            return <p className="m-0 fw-6 fs-14 app-summary__status-name f-failed">
                Failed
                <button type="button" className="cluster-create-status__button ml-16" onClick={this.props.callRetryClusterInstall}>Retry</button>
            </p>
        }
    }

    renderWithBackdrop(list) {
        return <VisibleModal className="" close={this.props.close}>
            <div className="modal__body modal__body--w-600 pt-16 pl-0 pr-0 pb-0" onClick={(e) => e.stopPropagation()}>
                <div className="flexbox flex-justify ml-24 mr-24">
                    <div className="mb-16">
                        <h1 className="modal__title mb-8">Installing Devtron Agent on {this.props.environmentName}</h1>
                        {this.renderStatus()}
                    </div>
                    <button type="button" className="transparent align-self-top" onClick={this.props.close}>
                        <Close className="icon-dim-20" />
                    </button>
                </div>
                <hr className="m-0" />
                {list}
            </div>
        </VisibleModal>
    }

    render() {
        let list = <ul className="cluster-component__list mt-16 p-0">
            {this.props.components?.map((c) => {
                let status = c.status.toLowerCase().replace('_', '-');
                return <li className="cluster-component__list-item flexbox" onClick={(e) => this.props.redirectToChartDeployment(c.installedAppId, c.envId)}>
                    <div className="mr-16 flex">
                        <span className={`icon-dim-20 inline-block mr-16 ${status}`}></span>
                    </div>
                    <div className="flex-1">
                        <p className="cluster-component__name m-0">{c.name}</p>
                        <p className="cluster-component__status m-0">{c.status}</p>
                    </div>
                </li>
            })}
        </ul>
        return this.renderWithBackdrop(list)
    }
}