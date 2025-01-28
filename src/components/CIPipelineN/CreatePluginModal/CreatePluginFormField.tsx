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

import { SyntheticEvent, useCallback } from 'react'
import { CustomInput } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICWarning } from '@Icons/ic-warning.svg'
import { CreatePluginFormFieldProps } from './types'

const CreatePluginFormField = ({
    label,
    value,
    error,
    action,
    handleChange,
    placeholder,
    required,
    disabled,
    useTextArea,
    helperText,
    autoFocus,
    labelClassName,
}: CreatePluginFormFieldProps) => {
    const callbackRef = useCallback((inputElement) => {
        if (inputElement && autoFocus) {
            setTimeout(() => {
                inputElement.focus()
            }, 100)
        }
    }, [])

    const handleInputChange = (e: SyntheticEvent) => {
        handleChange({ action, payload: (e.target as HTMLInputElement).value })
    }

    if (useTextArea) {
        return (
            <div className="flexbox-col dc__gap-6 w-100 dc__align-start">
                <label
                    htmlFor={action}
                    className={`m-0 fs-13 fw-4 lh-20 cn-7 ${required ? 'dc__required-field' : ''} ${labelClassName || ''}`}
                >
                    {label}
                </label>

                <textarea
                    name="profile-description"
                    className="form__textarea mxh-140 dc__hover-border-n300"
                    placeholder={placeholder}
                    value={value}
                    onChange={handleInputChange}
                    onBlur={handleInputChange}
                    id={action}
                    data-testid={action}
                    disabled={disabled}
                />

                {error && (
                    <div className="form__error">
                        <ICWarning className="form__icon form__icon--error" />
                        {error}
                    </div>
                )}
            </div>
        )
    }

    return (
        <CustomInput
            name={action}
            label={label}
            value={value}
            error={error}
            onChange={handleInputChange}
            placeholder={placeholder}
            isRequiredField={required}
            disabled={disabled}
            dataTestid={action}
            autoFocus={autoFocus}
            helperText={helperText}
            rootClassName="h-36"
            labelClassName={labelClassName}
            inputProps={{ ref: callbackRef } as React.InputHTMLAttributes<HTMLInputElement>}
        />
    )
}

export default CreatePluginFormField
