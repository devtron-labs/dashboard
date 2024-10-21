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
import { ConditionalWrap } from '../../../../../Common'
import { DeploymentEnvStateProps } from './types'
import { getDeploymentEnvConfig } from './utils'

const DeploymentEnvState = ({ envStateText, title, tooltipContent }: DeploymentEnvStateProps) => {
    const { Icon, stateClassName } = getDeploymentEnvConfig(envStateText)
    const renderTooltip = (children) => (
        <Tippy content={tooltipContent} className="default-tt" placement="top" arrow={false} interactive>
            {children}
        </Tippy>
    )

    return (
        <ConditionalWrap condition={!!tooltipContent} wrap={renderTooltip}>
            <div className={`${stateClassName} br-4 cn-9 pt-3 pb-3 pl-6 pr-6 bw-1 mr-6`}>
                <span className="fw-4 fs-11 lh-16 flex">
                    {Icon}
                    {envStateText}
                    <span className="fw-6 ml-4">{title}</span>
                </span>
            </div>
        </ConditionalWrap>
    )
}

export default DeploymentEnvState
