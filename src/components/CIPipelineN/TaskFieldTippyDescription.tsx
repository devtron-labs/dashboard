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
import { TaskFieldLabel } from '../ciPipeline/types'

interface TippyDescriptionType {
    taskField: string
    contentDescription?: string
}

const TaskFieldTippyDescription = ({ taskField, contentDescription }: TippyDescriptionType) => (
    <div className="fw-6 fs-13 lh-32 cn-7" style={{ maxWidth: '220px' }}>
        <Tippy
            className="default-tt"
            arrow={false}
            content={<span style={{ display: 'block', width: '220px' }}>{contentDescription}</span>}
        >
            <span className="text-underline-dashed">
                {taskField}
                {(taskField === TaskFieldLabel.SCRIPT ||
                    taskField === TaskFieldLabel.MOUNTCODEAT ||
                    taskField === TaskFieldLabel.CONTAINERIMAGEPATH) && <span className="cr-5"> *</span>}
            </span>
        </Tippy>
    </div>
)

export default TaskFieldTippyDescription
