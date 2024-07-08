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

import React from 'react'
import { AppListConstants } from '@devtron-labs/devtron-fe-common-lib'
import Sample from '../../assets/img/ic-checklist-sample-app@2x.png'

interface SampleAppDeployType {
    parentClassName?: string
    imageClassName?: string
}

export default function SampleAppDeploy({ parentClassName, imageClassName }: SampleAppDeployType) {
    return (
        <div className={`bcn-0 mb-8 br-4 ${parentClassName}`}>
            <img className={`img-width pt-12 pl-16 ${imageClassName}`} src={Sample} />
            <div className="pl-16 pr-16 pt-12 pb-12 fs-13">
                <div className="cn-9">Deploy a sample Node.js application.</div>
                <a
                    href={AppListConstants.SAMPLE_NODE_REPO_URL}
                    target="_blank"
                    rel="noopener noreferer noreferrer"
                    className="dc__no-decor cb-5 fw-6"
                >
                    Visit git repo
                </a>
            </div>
        </div>
    )
}
