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

import React from 'react'
import HiddenInputProps from './types'

export default function HiddenInput({ handleFileUpload, children, id }: HiddenInputProps) {
    return (
        <>
            <input
                type="file"
                id={id}
                accept=".yaml, .yml, .json"
                style={{
                    display: 'none',
                }}
                onChange={handleFileUpload}
            />

            <label htmlFor={id} className="flex column center cursor m-0 h-100 w-100">
                {children}
            </label>
        </>
    )
}
