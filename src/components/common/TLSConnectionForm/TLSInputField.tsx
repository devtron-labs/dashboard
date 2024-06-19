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

import React, { SyntheticEvent, useState } from 'react'
import { TLSInputFieldProps } from './types'
import { DEFAULT_SECRET_PLACEHOLDER } from '../../../config'
import { ReactComponent as ICWarning } from '../../../assets/icons/ic-warning.svg'

const TLSInputField = ({
    label,
    id,
    placeholder,
    error,
    isSensitive,
    value,
    handleChange,
    updateAction,
}: TLSInputFieldProps) => {
    const [isFocussed, setIsFocussed] = useState<boolean>(false)

    const handleOnFocus = () => {
        setIsFocussed(true)
    }

    const handleOnBlur = () => {
        setIsFocussed(false)
    }

    const handleInputChange = (e: SyntheticEvent) => {
        const target = e.target as HTMLInputElement
        handleChange({ action: updateAction, payload: target.value })
    }

    const sanitizedValue = !isSensitive || isFocussed || value?.length > 0 ? value : DEFAULT_SECRET_PLACEHOLDER
    return (
        <div className="flexbox-col dc__gap-6">
            <label className="m-0 cn-7 fs-13 fw-4 lh-20" htmlFor={id}>
                {label}
            </label>

            <textarea
                id={id}
                name={id}
                data-testid={id}
                className="form__textarea mxh-140 dc__hover-border-n300"
                placeholder={placeholder}
                onFocus={handleOnFocus}
                onBlur={handleOnBlur}
                onChange={handleInputChange}
                value={sanitizedValue}
            />

            {error && (
                <div className="form__error">
                    <ICWarning className="form__icon form__icon--error dc__no-shrink" />
                    {error}
                </div>
            )}
        </div>
    )
}

export default TLSInputField
