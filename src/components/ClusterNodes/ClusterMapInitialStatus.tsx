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

import { Tooltip } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Success } from '@Icons/appstatus/healthy.svg'
import { ReactComponent as Error } from '@Icons/ic-error-cross.svg'

import { ClusterMapInitialStatusType } from './types'

export const ClusterMapInitialStatus = ({ errorInNodeListing }: ClusterMapInitialStatusType) => (
    <Tooltip alwaysShowTippyOnHover={!!errorInNodeListing} content={errorInNodeListing} interactive>
        <div className="flexbox dc__align-items-center dc__gap-8">
            {errorInNodeListing ? (
                <>
                    <Error className="icon-dim-16 dc__no-shrink" />
                    <span>Connection failed</span>
                </>
            ) : (
                <>
                    <Success className="icon-dim-16 dc__no-shrink" />
                    <span>Connected</span>
                </>
            )}
        </div>
    </Tooltip>
)
