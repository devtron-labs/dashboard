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
import Complete from '../../assets/img/ic-empty-done@2x.png'
import { AllChartsCheck } from './AllChartsCheck'
import CustomAppDeploy from './CustomAppDeploy'
import SampleAppDeploy from './SampleAppDeploy'

export class AllCheckModal extends Component {
    render() {
        return (
            <div className="">
                <img src={Complete} className="applist__checklist-img" />
                <div className="cn-9 fw-6 fs-16 mt-16 mb-4">Get started!</div>
                <div className="cn-9 mb-16 fs-13"> You’re all set to get started with Devtron.</div>
                <SampleAppDeploy parentClassName="bcg-1 flexbox" imageClassName="pb-12" />
                <CustomAppDeploy parentClassName="bcg-1 flexbox" imageClassName="pb-12" />
                <AllChartsCheck />
            </div>
        )
    }
}
