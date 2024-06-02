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
import { CustomInput } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete.svg'

interface KeyValueFileInputProps {
    index: number
    name: string
    fileName: string
    property: string
    isBinary: boolean
    disabled?: boolean
    handleChange: (...args) => void
    handleDelete: (index: number) => void
}

export const KeyValueFileInput: React.FC<KeyValueFileInputProps> = (props) => {
    return (
        <div className="form__key-value-file">
            <Trash
                className="icon-n4 dc__block dc__align-right icon-delete cursor"
                onClick={(event) => {
                    props.handleDelete(props.index)
                }}
            />
            <div className="mb-16">
                <CustomInput
                    label="Key (Filename)"
                    labelClassName="dc__bold"
                    value={props.fileName}
                    placeholder="Enter the filename"
                    disabled={props.disabled}
                    onChange={(event) => {
                        props.handleChange(props.index, 'fileName', event.target.value)
                    }}
                    name="fileName"
                    isRequiredField
                />
            </div>
            <div className="mb-16">
                <CustomInput
                    label="Name (Secret key)"
                    labelClassName="dc__bold"
                    value={props.name}
                    placeholder="Enter the secret key"
                    disabled={props.disabled}
                    onChange={(event) => {
                        props.handleChange(props.index, 'name', event.target.value)
                    }}
                    name="secret-key"
                    isRequiredField
                />
            </div>
            <div className="mb-16">
                <CustomInput
                    label="Property"
                    labelClassName="dc__bold"
                    placeholder="Enter the property"
                    value={props.property}
                    disabled={props.disabled}
                    helperText="Property to extract if secret in backend is a JSON object"
                    onChange={(event) => {
                        props.handleChange(props.index, 'property', event.target.value)
                    }}
                    name="property"
                />
            </div>
            <div className="form__label dc__bold">isBinary (Base64 Encoding)</div>
            <div className="flex left bottom">
                <label className="flexbox mr-16">
                    <input
                        type="radio"
                        name={`${props.index}isBinary`}
                        checked={props.isBinary}
                        disabled={props.disabled}
                        onClick={(event) => props.handleChange(props.index, 'isBinary', !props.isBinary)}
                    />
                    <span className="ml-16 fw-4">Already Encoded</span>
                </label>
                <label className="flexbox mr-16">
                    <input
                        type="radio"
                        name={`${props.index}isBinary`}
                        checked={!props.isBinary}
                        disabled={props.disabled}
                        onClick={(event) => props.handleChange(props.index, 'isBinary', !props.isBinary)}
                    />
                    <span className="ml-16 fw-4">Encode</span>
                </label>
            </div>
        </div>
    )
}
