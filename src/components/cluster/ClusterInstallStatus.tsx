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
import { ClusterInstallStatusProps } from './cluster.type'
import { ReactComponent as NotDeployed } from '../../assets/icons/ic-info-filled.svg'

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
