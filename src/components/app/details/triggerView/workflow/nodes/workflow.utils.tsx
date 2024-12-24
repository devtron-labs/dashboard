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

import Tippy from '@tippyjs/react'
import { DO_NOT_DEPLOY } from '../../Constants'

export const envDescriptionTippy = (environmentName: string, description: string) => {
    return (
        <Tippy
            className="default-tt w-200"
            arrow
            placement="bottom"
            content={
                <div className="w-100">
                    <div className="fw-6">{environmentName}</div>
                    {description && <div className="dc__word-break-all lh-16 mt-4">{description}</div>}
                </div>
            }
        >
            <span className="dc__ellipsis-right">{environmentName}</span>
        </Tippy>
    )
}

export const getNodeSideHeadingAndClass = (
    isTriggerBlocked: boolean,
    isDeploymentBlocked: boolean,
    triggerType: string,
): {
    heading: string
    className: string
} => {
    if (isTriggerBlocked) {
        return { heading: 'BLOCKED', className: 'bcr-1 er-2 bw-1 cr-5 dc__opacity-1' }
    }

    if (isDeploymentBlocked) {
        return { heading: DO_NOT_DEPLOY, className: 'bcy-5 cn-9 dc__opacity-1' }
    }

    return { heading: triggerType, className: '' }
}
