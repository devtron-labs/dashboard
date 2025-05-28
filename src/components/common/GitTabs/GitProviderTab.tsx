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

import { noop } from '@devtron-labs/devtron-fe-common-lib'

import Check from '@Icons/ic-selected-corner.png'
import { importComponentFromFELibrary } from '@Components/common'

import { GitProvider } from './constants'
import GitProviderTabIcons from './GitProviderTabIcons'
import { GitProviderTabProps } from './types'
import { getProviderNameFromEnum } from './utils'

const OtherGitOpsForm = importComponentFromFELibrary('OtherGitOpsForm', null, 'function')
const BitBucketDCCredentials = importComponentFromFELibrary('BitBucketDCCredentials', null, 'function')

export const GitProviderTab: React.FC<GitProviderTabProps> = ({
    isTabChecked,
    handleGitopsTab,
    lastActiveTabName,
    provider,
    saveLoading,
    dataTestId,
}) => {
    const isBitbucketDC = lastActiveTabName === 'BITBUCKET_DC' && provider === GitProvider.BITBUCKET_CLOUD
    const showCheck = lastActiveTabName === provider || isBitbucketDC
    const displayName = getProviderNameFromEnum(provider, !!BitBucketDCCredentials)

    return (
        <label className="dc__tertiary-tab__radio" htmlFor={`${provider}-status`}>
            <input
                type="radio"
                name="status"
                id={`${provider}-status`}
                value={provider}
                checked={isTabChecked}
                onChange={!saveLoading ? handleGitopsTab : noop}
                className="dc__hide-section"
            />
            <span className={`dc__tertiary-tab sso-icons ${OtherGitOpsForm ? 'h-90' : ''}`} data-testid={dataTestId}>
                <aside className="login__icon-alignment">
                    <GitProviderTabIcons provider={provider} />
                </aside>
                <aside className="login__text-alignment" style={{ lineHeight: 1.2 }}>
                    {displayName}
                </aside>
                {showCheck && (
                    <div>
                        <aside className="dc__position-abs dc__right-0 dc__top-0">
                            <img src={Check} className="h-32" alt="saved-provider-check" />
                        </aside>
                    </div>
                )}
            </span>
        </label>
    )
}
