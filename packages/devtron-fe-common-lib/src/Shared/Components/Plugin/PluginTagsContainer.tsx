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

import { PluginTagsContainerProps } from './types'

const PluginTagsContainer = ({ tags, rootClassName }: PluginTagsContainerProps) => {
    if (!tags?.length) {
        return null
    }

    return (
        <div className={`flexbox dc__gap-6 flex-wrap ${rootClassName}`}>
            {tags.map((tag) => (
                <div className="flexbox px-6 br-4 bcn-1 dc__align-items-center dc__mxw-160" key={tag}>
                    <span className="dc__mxw-160 dc__truncate cn-8 fs-11 fw-4 lh-20">{tag}</span>
                </div>
            ))}
        </div>
    )
}

export default PluginTagsContainer
