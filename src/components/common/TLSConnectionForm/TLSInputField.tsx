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

import { SyntheticEvent, useState } from 'react'
import { DEFAULT_SECRET_PLACEHOLDER } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICWarning } from '@Icons/ic-warning.svg'
import { ReactComponent as ICError } from '@Icons/ic-error.svg'
import { TLSInputFieldProps } from './types'

const TLSInputField = ({
    label,
    id,
    placeholder,
    error,
    isSensitive,
    value,
    handleChange,
    updateAction,
    showClearButton,
    clearAction,
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

    const handleClearInput = () => {
        handleChange({ action: clearAction })
    }

    const sanitizedValue = !isSensitive || isFocussed || value?.length > 0 ? value : DEFAULT_SECRET_PLACEHOLDER
    return (
        <div className="flexbox-col dc__gap-6">
            <label className="m-0 cn-7 fs-13 fw-4 lh-20 dc_width-max-content" htmlFor={id}>
                {label}
            </label>

            <div className="dc__position-rel">
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

                {showClearButton && !!sanitizedValue && (
                    <button
                        className="dc__outline-none-imp dc__no-border p-0 bc-n50 flex dc__position-abs dc__right-10 dc__top-8"
                        type="button"
                        onClick={handleClearInput}
                        aria-label="Clear input"
                    >
                        <ICError className="icon-dim-18 dc__no-shrink icon-n4 dc__vertical-align-middle" />
                    </button>
                )}
            </div>

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
