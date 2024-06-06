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
import { NavLink } from 'react-router-dom'
import { ReactComponent as Dropdown } from '../../assets/icons/appstatus/ic-chevron-down.svg'
import { AppCheckListProps, AppCheckListState } from './checklist.type'
import { URLS } from '../../config'
import { ReactComponent as Check } from '../../assets/icons/ic-outline-check.svg'
import Uncheck from '../../assets/img/ic-success@2x.png'
import './checklist.scss'

export class AppCheckList extends Component<AppCheckListProps, AppCheckListState> {
    render() {
        const { project, git, environment, docker, hostUrl } = this.props.appChecklist

        return (
            <>
                <div className="cn-9 pt-12 pb-12 fw-6">
                    <p className="m-0 fs-14">To deploy custom application</p>
                </div>
                <div className="fs-13 mb-12">
                    {!hostUrl && (
                        <NavLink
                            to={`${URLS.GLOBAL_CONFIG_HOST_URL}`}
                            className="dc__no-decor mt-8 flex left"
                            style={{ color: hostUrl ? `var(--N500)` : `var(--B500)` }}
                        >
                            Add host URL
                        </NavLink>
                    )}
                    {!project && (
                        <NavLink
                            to={`${URLS.GLOBAL_CONFIG_PROJECT}`}
                            className="dc__no-decor  mt-8 flex left"
                            style={{ color: project ? `var(--N500)` : `var(--B500)` }}
                        >
                            Add project
                        </NavLink>
                    )}
                    {!environment && (
                        <NavLink
                            to={`${URLS.GLOBAL_CONFIG_CLUSTER}`}
                            className="dc__no-decor mt-8 flex left"
                            style={{ color: environment ? `var(--N500)` : `var(--B500)` }}
                        >
                            Add cluster & environment
                        </NavLink>
                    )}
                    {!git && (
                        <NavLink
                            to={`${URLS.GLOBAL_CONFIG_GIT}`}
                            className="dc__no-decor mt-8 flex left"
                            style={{ color: git ? `var(--N500)` : `var(--B500)` }}
                        >
                            Add git account
                        </NavLink>
                    )}
                    {!docker && (
                        <NavLink
                            to={`${URLS.GLOBAL_CONFIG_DOCKER}`}
                            className="dc__no-decor mt-8 pb-8 flex left"
                            style={{ color: docker ? `var(--N500)` : `var(--B500)` }}
                        >
                            Add container registry
                        </NavLink>
                    )}
                </div>
            </>
        )
    }
}
