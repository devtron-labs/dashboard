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

import { getRandomColor } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICDevtron } from '../../../assets/icons/ic-devtron-blue-outline.svg'
import './organizationFrame.scss'

const isModernLayoutEnabled = window._env_.FEATURE_EXPERIMENTAL_MODERN_LAYOUT_ENABLE

const OrganizationFrame = () => (
    <div className="w-36 h-42 dc__no-shrink flexbox dc__position-rel dc__content-center">
        <div
            className={`icon-dim-28 dc__no-shrink ${isModernLayoutEnabled ? 'dc__border--n9' : 'border__white'} flex py-3 px-1 br-4`}
            style={{
                backgroundColor: getRandomColor(window._env_.ORGANIZATION_NAME || ''),
            }}
        >
            <span className={`${isModernLayoutEnabled ? 'cn-9' : 'text__white'} fs-13 fw-6 lh-16 h-16`}>
                {window._env_.ORGANIZATION_NAME?.slice(0, 2)?.toLocaleUpperCase()}
            </span>
        </div>

        <ICDevtron
            className={`icon-dim-20 dc__no-shrink dc__position-abs dc__bottom-0 organization-frame__logo ${isModernLayoutEnabled ? 'organization-frame__logo--modern-layout' : ''}`}
        />
    </div>
)

export default OrganizationFrame
