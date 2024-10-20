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

import React, { ChangeEvent } from 'react'
import { WidgetProps } from '@rjsf/utils'
import Toggle from '../../Toggle/Toggle'

export const Checkbox = ({
    id,
    onChange,
    value,
    required,
    disabled,
    readonly,
    autofocus,
    onBlur,
    onFocus,
}: WidgetProps) => {
    const handleEvent = (e: ChangeEvent<HTMLInputElement>, type: 'blur' | 'focus') => {
        const { id, checked } = e.target
        if (type === 'blur') {
            onBlur(id, checked)
        } else if (type === 'focus') {
            onFocus(id, checked)
        }
    }

    const isSelected: boolean = typeof value === 'undefined' ? false : value

    return (
        <div>
            <Toggle
                selected={isSelected}
                onSelect={onChange}
                id={id}
                name={id}
                required={required}
                disabled={disabled || readonly}
                autoFocus={autofocus}
                rootClassName="w-32 mb-0 dc__height-inherit"
                onBlur={(e) => handleEvent(e, 'blur')}
                onFocus={(e) => handleEvent(e, 'focus')}
            />
            <span className="dc__capitalize ml-8">{isSelected.toString()}</span>
        </div>
    )
}
