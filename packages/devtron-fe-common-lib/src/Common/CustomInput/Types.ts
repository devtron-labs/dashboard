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

import React, { HTMLInputTypeAttribute, InputHTMLAttributes, ReactNode } from 'react'

export interface CustomInputProps {
    name: string
    value: string | number
    onChange: (e: any) => void
    onFocus?: (e: any) => void
    autoComplete?: string
    label?: string | React.ReactNode
    labelClassName?: string
    type?: HTMLInputTypeAttribute
    disabled?: boolean
    placeholder?: string
    tabIndex?: number
    dataTestid?: string
    isRequiredField?: boolean
    autoFocus?: boolean
    rootClassName?: string
    error?: string[] | string
    helperText?: ReactNode
    onBlur?: (e) => void
    readOnly?: boolean
    noTrim?: boolean
    onKeyPress?: (e) => void
    defaultValue?: string | number | ReadonlyArray<string> | undefined
    onKeyDown?: (e) => void
    required?: boolean
    additionalErrorInfo?: React.ReactNode
    inputWrapClassName?: string
    inputProps?: InputHTMLAttributes<HTMLInputElement>
}
