import React, { Component } from 'react'
import { TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import { ClusterInstallStatusProps } from './cluster.type'
import { ReactComponent as NotDeployed } from '../../assets/icons/ic-info-filled.svg'
import { ReactComponent as ICHelpOutline } from '../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'

const handleQuestion = () => {
    return (
        <TippyCustomized
            theme={TippyTheme.white}
            className="w-300"
            placement="bottom"
            Icon={Help}
            heading="Devtron Agents"
            infoText="Devtron agent enables components of Devtron to communicate to your Kubernetes cluster."
            showCloseButton
            trigger="click"
            interactive
        >
            <div className="icon-dim-16 fcn-9 mt-23 ml-5">
                <ICHelpOutline />
            </div>
        </TippyCustomized>
    )
}

export class ClusterInstallStatus extends Component<ClusterInstallStatusProps, {}> {
    render() {
        const classes = 'cluster-create-status'
        if (this.props.agentInstallationStage === 0) {
            return (
                <div className={`${classes} cluster-create-status--not-triggered`}>
                    <NotDeployed className="icon-dim-20" />

                    <p className="cluster-create-status__title mb-0">
                        Devtron agent is not installed{this.props.envName && ` on env: ${this.props.envName}`}.
                    </p>
                    <button type="button" className="cluster-create-status__button" onClick={this.props.onClick}>
                        Install
                    </button>
                </div>
            )
        }
        if (this.props.agentInstallationStage === 1) {
            return (
                <div className={`${classes} cluster-create-status--installing`}>
                    <span className="icon-dim-20 progressing" />
                    <p className="cluster-create-status__title mb-0">
                        Devtron agent installing{this.props.envName && ` on env: ${this.props.envName}`}.
                    </p>
                    <button type="button" className="cluster-create-status__button" onClick={this.props.onClick}>
                        Details
                    </button>
                </div>
            )
        }
        if (this.props.agentInstallationStage === 2) {
            return (
                <div className={`${classes} cluster-create-status--healthy`}>
                    <span className="icon-dim-20 healthy" />
                    <p className="cluster-create-status__title mb-0">
                        Devtron agent running{this.props.envName && ` on env: ${this.props.envName}`}.
                    </p>
                    <button type="button" className="cluster-create-status__button" onClick={this.props.onClick}>
                        Details
                    </button>
                </div>
            )
        }
        if (this.props.agentInstallationStage === 3) {
            return (
                <div className={`${classes} cluster-create-status--failed`}>
                    <span className="icon-dim-20 failed cluster-create-status__status-failed" />
                    <p className="cluster-create-status__title mb-0">
                        Devtron agent installation failed{this.props.envName && ` on env: ${this.props.envName}`}.
                    </p>
                    <button type="button" className="cluster-create-status__button" onClick={this.props.onClick}>
                        Retry
                    </button>
                </div>
            )
        }
        return null
    }
}
