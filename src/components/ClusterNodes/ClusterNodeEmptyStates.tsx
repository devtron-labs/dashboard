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

import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import emptyCustomChart from '../../assets/img/empty-noresult@2x.png'
import { EMPTY_STATE_STATUS } from '../../config/constantMessaging'

export default function ClusterNodeEmptyState({
    title,
    actionHandler,
}: {
    title?: string
    actionHandler?: () => void
}) {
    const renderClearSearchButton = () => {
        return (
            <button onClick={actionHandler} className="add-link cta flex">
                Clear search
            </button>
        )
    }
    return (
        <GenericEmptyState
            image={emptyCustomChart}
            title={title || EMPTY_STATE_STATUS.CLUSTER_NODE_EMPTY_STATE.TITLE}
            subTitle={EMPTY_STATE_STATUS.CLUSTER_NODE_EMPTY_STATE.SUBTITLE}
            isButtonAvailable
            renderButton={renderClearSearchButton}
            classname="dc__position-rel-imp"
        />
    )
}
