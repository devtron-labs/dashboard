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

import { Link } from 'react-router-dom'

import { GenericEmptyState, InfoBlock } from '@devtron-labs/devtron-fe-common-lib'

import EmptyImage from '@Images/empty-list.png'

import { SSO_NOT_CONFIGURED_STATE_TEXTS } from '../../../../config/constantMessaging'

const renderSsoInfoDescription = () => (
    <>
        <span className="dc__bold">{SSO_NOT_CONFIGURED_STATE_TEXTS.notConfigured}</span>
        {SSO_NOT_CONFIGURED_STATE_TEXTS.infoText}
        <Link to={SSO_NOT_CONFIGURED_STATE_TEXTS.redirectLink}>{SSO_NOT_CONFIGURED_STATE_TEXTS.linkText}</Link>
    </>
)
const SSONotConfiguredState = () => (
    <GenericEmptyState
        image={EmptyImage}
        title={SSO_NOT_CONFIGURED_STATE_TEXTS.title}
        subTitle={
            <div className="flexbox-col dc__gap-8">
                {SSO_NOT_CONFIGURED_STATE_TEXTS.subTitle}
                <InfoBlock variant="error" description={renderSsoInfoDescription()} />
            </div>
        }
    />
)

export default SSONotConfiguredState
