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
import { URLS } from '../../config'
import img from '../../assets/img/ic-checklist-chart@2x.png'
import './checklist.scss'

export class GlobalChartsCheck extends Component {
    render() {
        return (
            <div className="bcn-0 mb-20 br-4">
                <img className="img-width pt-12 pl-16" src={img} />
                <div className="pl-16 pr-16 pt-12 pb-12 fs-13">
                    <div className="cn-9"> Deploy charts using Devtron.</div>
                    <NavLink to={`${URLS.CHARTS}/discover`} className="dc__no-decor cb-5 fw-6 ">
                        Discover charts
                    </NavLink>
                </div>
            </div>
        )
    }
}
