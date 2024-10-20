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

import { Tooltip } from '@Common/Tooltip'
import { FieldRowProps } from './types'
import { DEFAULT_FIELD_TITLE } from '../constants'

export const FieldRowWithLabel = ({
    showLabel,
    label,
    required,
    children,
    id,
    rawDescription,
    shouldAlignCenter = true,
}: FieldRowProps) => (
    <div
        className={
            showLabel
                ? `display-grid dc__gap-12 rjsf-form-template__field ${shouldAlignCenter ? 'flex-align-center' : ''}`
                : ''
        }
    >
        {showLabel && (
            <label className="cn-7 fs-13 lh-20 fw-4 flexbox mb-0" htmlFor={id}>
                <Tooltip alwaysShowTippyOnHover={!!rawDescription} content={rawDescription}>
                    <span className={`dc__ellipsis-right ${rawDescription ? 'text-underline-dashed-300' : ''}`}>
                        {label || DEFAULT_FIELD_TITLE}
                    </span>
                </Tooltip>
                {required && <span className="cr-5">&nbsp;*</span>}
            </label>
        )}
        {children}
    </div>
)
