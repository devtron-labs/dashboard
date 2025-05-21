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
import { NavLink } from 'react-router-dom'
import { AppListConstants } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../config'
import Deploy from '../../assets/img/ic-checklist-app@2x.png'

interface CustomAppDeployType {
    parentClassName?: string
    imageClassName?: string
}

export default function CustomAppDeploy({ parentClassName, imageClassName }: CustomAppDeployType) {
    return (
        <div className={`bg__primary mb-8 br-4 ${parentClassName}`}>
            <img className={`img-width pt-12 pl-16 ${imageClassName}`} src={Deploy} />
            <div className="pl-16 pr-16 pt-12 pb-12 fs-13">
                <div className="cn-9"> Create, build and deploy a custom application.</div>
                <NavLink
                    to={`${URLS.DEVTRON_APP_LIST}/${AppListConstants.CREATE_DEVTRON_APP_URL}`}
                    className="dc__no-decor cb-5 fw-6"
                >
                    Create Custom App
                </NavLink>
            </div>
        </div>
    )
}
