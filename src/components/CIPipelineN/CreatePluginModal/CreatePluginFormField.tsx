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

import { SyntheticEvent } from 'react'
import { CustomInput, Textarea } from '@devtron-labs/devtron-fe-common-lib'
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
    ...props
}: CreatePluginFormFieldProps) => {
    const handleInputChange = (e: SyntheticEvent) => {
        handleChange({ action, payload: (e.target as HTMLInputElement).value })
    }

    if (useTextArea) {
        return (
            <Textarea
                {...props}
                label={label}
                required={required}
                name={action}
                placeholder={placeholder}
                value={value as string}
                onChange={handleInputChange}
                onBlur={handleInputChange}
                disabled={disabled}
                error={error}
            />
        )
    }

    return (
        <CustomInput
            {...props}
            name={action}
            label={label}
            value={value}
            error={error}
            onChange={handleInputChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            autoFocus={autoFocus}
            helperText={helperText}
        />
    )
}

export default CreatePluginFormField
