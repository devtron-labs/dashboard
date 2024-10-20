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

import { TitleFieldProps } from '@rjsf/utils'
import { Tooltip } from '@Common/Tooltip'

export const TitleField = ({
    id,
    title,
    required,
    description,
}: TitleFieldProps & Partial<Record<'description', string>>) => (
    <legend className="fs-13 fw-6 cn-9 lh-20 dc__no-border py-9 mb-0" id={id}>
        <Tooltip alwaysShowTippyOnHover={!!description} content={description}>
            <span className={`${description ? 'text-underline-dashed-300' : ''}`}>{title}</span>
        </Tooltip>
        {required && <span className="cr-5">&nbsp;*</span>}
    </legend>
)
