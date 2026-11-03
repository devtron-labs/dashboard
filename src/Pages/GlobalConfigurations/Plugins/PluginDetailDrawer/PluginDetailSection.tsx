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

import { useState } from 'react'

import { Collapse, Icon } from '@devtron-labs/devtron-fe-common-lib'

import { PluginDetailSectionProps } from '../types'

const PluginDetailSection = ({ title, isExpandedByDefault = false, children }: PluginDetailSectionProps) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(isExpandedByDefault)

    const toggleIsExpanded = () => {
        setIsExpanded((prev) => !prev)
    }

    return (
        <div className="dc__border-top-n1">
            <button
                type="button"
                className="dc__transparent flexbox dc__align-items-center dc__content-space w-100 py-16 px-0 dc__tab-focus"
                onClick={toggleIsExpanded}
                aria-expanded={isExpanded}
            >
                <span className="cn-9 fs-14 fw-6 lh-20">{title}</span>
                <Icon name="ic-caret-down-small" color="N700" rotateBy={isExpanded ? 180 : 0} />
            </button>

            <Collapse expand={isExpanded}>
                <div className="pb-16">{children}</div>
            </Collapse>
        </div>
    )
}

export default PluginDetailSection
