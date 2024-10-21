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

import { CustomInputProps } from './Types'
import { ReactComponent as Info } from '../../Assets/Icon/ic-info-filled-override.svg'
import { ReactComponent as ErrorIcon } from '../../Assets/Icon/ic-warning.svg'
import { useEffect, useRef } from 'react'

export const CustomInput = ({
    name,
    value,
    error,
    onChange,
    onFocus = (e) => {},
    label,
    type = 'text',
    disabled = false,
    labelClassName = '',
    placeholder = '',
    tabIndex = 0,
    dataTestid = '',
    isRequiredField = false,
    autoFocus = false,
    rootClassName = '',
    autoComplete = 'off',
    helperText = '',
    onBlur,
    readOnly = false,
    noTrim = false,
    onKeyPress,
    defaultValue,
    onKeyDown,
    required,
    additionalErrorInfo,
    inputWrapClassName = '',
    inputProps = {},
}: CustomInputProps) => {
    const inputRef = useRef<HTMLInputElement>()

    useEffect(() => {
        setTimeout(() => {
            // Added timeout to ensure the autofocus code is executed post the re-renders
            if (inputRef.current && autoFocus) {
                inputRef.current.focus()
            }
        }, 100)
    }, [autoFocus])

    function handleError(error: any): any[] {
        if (!Array.isArray(error)) {
            return [error]
        }
        return error
    }

    const handleOnBlur = (event) => {
        // NOTE: This is to prevent the input from being trimmed when the user do not want to trim the input
        if (!noTrim) {
            event.stopPropagation()
            event.target.value = event.target.value?.trim()
            onChange(event)
        }
        if (typeof onBlur === 'function') {
            onBlur(event)
        }
    }

    const renderFormErrorWithIcon = (error: string) => (
        <div className="flex left mt-4 mb-4 dc__gap-4 cr-5 fs-11 lh-16 fw-4" key={error}>
            <ErrorIcon className="icon-dim-16 p-1 form__icon--error dc__align-self-start dc__no-shrink" />
            <span>{error}</span>
            {error && typeof additionalErrorInfo === 'function' && additionalErrorInfo()}
        </div>
    )

    const getInputError = () => {
        if (!error?.length) {
            return null
        }
        if (typeof error === 'object') {
            return handleError(error).map((err: string) => renderFormErrorWithIcon(err))
        }
        return renderFormErrorWithIcon(error)
    }

    const renderInputLabelConditionally = () => {
        if (typeof label === 'string') {
            return <span className={`${isRequiredField ? 'dc__required-field' : ''}`}>{label}</span>
        }
        return label
    }

    const renderInputLabel = () => {
        if (!label) {
            return null
        }
        return (
            <label className={`form__label ${labelClassName}`} data-testid={`label-${dataTestid}`}>
                {renderInputLabelConditionally()}
            </label>
        )
    }

    return (
        <div className={`flex column left top ${inputWrapClassName}`}>
            {renderInputLabel()}
            <input
                data-testid={dataTestid}
                type={type}
                name={name}
                autoComplete={autoComplete}
                className={`form__input fs-13 lh-20 fw-4 ${rootClassName}`}
                onChange={(e) => {
                    e.persist()
                    onChange(e)
                }}
                onBlur={handleOnBlur}
                onFocus={onFocus}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                tabIndex={tabIndex}
                autoFocus={autoFocus}
                readOnly={readOnly}
                onKeyPress={onKeyPress}
                defaultValue={defaultValue}
                onKeyDown={onKeyDown}
                required={required}
                // Will be passing other props like other data attributes etc from inputProps
                {...inputProps}
                ref={inputRef}
            />

            {getInputError()}
            {helperText && (
                <div className="flex left top dc__gap-4 fs-11 lh-16 cn-7 pt-4">
                    <Info className="icon-dim-16" />
                    <div>{helperText}</div>
                </div>
            )}
        </div>
    )
}
