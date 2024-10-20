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
import { ChartCheckListProps } from './checklist.type'
import { URLS } from '../../config'

export class ChartCheckList extends Component<ChartCheckListProps, {}> {
    render() {
        const { environment, project } = this.props.chartChecklist

        return (
            <>
                <div className="cn-9 pt-12 pb-12 fw-6">
                    <div className="fs-14">To deploy chart</div>
                </div>
                <div className="fs-13">
                    {!this.props.chartChecklist.project && (
                        <NavLink
                            to={`${URLS.GLOBAL_CONFIG_PROJECT}`}
                            className="dc__no-decor  mt-8 flex left"
                            style={{ color: project ? `var(--N500)` : `var(--B500)` }}
                        >
                            Add project
                        </NavLink>
                    )}
                    {!this.props.chartChecklist.environment && (
                        <NavLink
                            to={`${URLS.GLOBAL_CONFIG_CLUSTER}`}
                            className="dc__no-decor mt-8 pb-8 flex left"
                            style={{ color: environment ? `var(--N500)` : `var(--B500)` }}
                        >
                            Add cluster & environment
                        </NavLink>
                    )}
                </div>
            </>
        )
    }
}
