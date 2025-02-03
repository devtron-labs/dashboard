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
import { AppStatus, statusColor } from '@devtron-labs/devtron-fe-common-lib'
import { Link } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { handleUTCTime } from '../../../common'
import { ExpandedRowProps } from './types'
import { ReactComponent as Expand } from '../../../../assets/icons/ic-dropdown-filled.svg'
import { ReactComponent as Settings } from '../../../../assets/icons/ic-settings.svg'
import './expandedRow.css'

export class ExpandedRow extends Component<ExpandedRowProps> {
    handleEditApp = () => {
        this.props.handleEdit(this.props.app.id)
    }

    renderRows() {
        return this.props.app.environments.map((env) => {
            const color = statusColor[env.appStatus.toLowerCase()] || 'var(--N500)'
            return (
                <Link
                    key={env.id}
                    to={`${this.props.redirect(this.props.app, env.id)}`}
                    className="app-list__row app-list__row--expanded"
                >
                    <div className="app-list__cell--icon" />
                    <div className="app-list__cell app-list__cell--name">
                        <svg className="app-status app-status--pseudo" preserveAspectRatio="none" viewBox="0 0 200 40">
                            <line x1="0" y1="20" x2="300" y2="20" stroke={color} strokeWidth="1" />
                            <line x1="0" y1="15" x2="0" y2="25" stroke={color} strokeWidth="1" />
                        </svg>
                    </div>
                    {this.props.isArgoInstalled && (
                        <div className="app-list__cell app-list__cell--app_status">
                            <AppStatus status={env.appStatus} isVirtualEnv={env.isVirtualEnvironment} />
                        </div>
                    )}
                    <div className="app-list__cell app-list__cell--env">{env.name}</div>
                    <div className="app-list__cell app-list__cell--cluster">
                        <p className="dc__truncate-text">{env.clusterName}</p>
                    </div>
                    <div className="app-list__cell app-list__cell--namespace">
                        <p className="dc__truncate-text">{env.namespace}</p>
                    </div>
                    <div className="app-list__cell app-list__cell--time">
                        {env.lastDeployedTime && (
                            <Tippy className="default-tt" arrow placement="top" content={env.lastDeployedTime}>
                                <p className="dc__truncate-text  m-0">{handleUTCTime(env.lastDeployedTime, true)}</p>
                            </Tippy>
                        )}
                    </div>
                    <div className="app-list__cell app-list__cell--action" />
                </Link>
            )
        })
    }

    render() {
        return (
            <div className="expanded-row">
                <div className="expanded-row__title">
                    <div
                        className="cn-9 expanded-row__close flex left pr-20 pl-20 cursor"
                        data-key={this.props.app.id}
                        onClick={this.props.close}
                    >
                        <Expand className="icon-dim-24 p-2 mr-16 fcn-7" />
                        <span className="fw-6">{this.props.app.name}</span>
                    </div>
                    <button type="button" className="button-edit" onClick={this.handleEditApp}>
                        <Settings className="button-edit__icon" />
                    </button>
                </div>
                {this.renderRows()}
            </div>
        )
    }
}
