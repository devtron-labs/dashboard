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
import { ReactComponent as InfoIcon } from '../../../assets/icons/info-filled.svg'

const ReleaseStatusEmptyState = ({ message, description }) => {
    return (
        <div className="bg__primary flex h-100">
            <div className="flex column h-100 w-50">
                <InfoIcon className="icon-dim-24 info-icon-n6" />
                <span className="mt-8 cn-9 fs-13 fw-6 lh-20 dc__text-center">{message}</span>
                {description && <p className="mt-4 cn-7 fs-13 fw-4 lh-20 dc__text-justify">{description}</p>}
            </div>
        </div>
    )
}

export default ReleaseStatusEmptyState
