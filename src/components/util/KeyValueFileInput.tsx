import React from 'react'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete.svg'
import { CustomInput } from '@devtron-labs/devtron-fe-common-lib'

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

export const KeyValueFileInput: React.FC<KeyValueFileInputProps> = function (props) {
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
                    isRequiredField={true}
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
                    isRequiredField={true}
                />
            </div>
            <div className="mb-16">
                <CustomInput
                    label="Property"
                    labelClassName="dc__bold"
                    placeholder="Enter the property"
                    value={props.property}
                    disabled={props.disabled}
                    helperText={'Property to extract if secret in backend is a JSON object'}
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
                        name={props.index + 'isBinary'}
                        checked={props.isBinary}
                        disabled={props.disabled}
                        onClick={(event) => props.handleChange(props.index, 'isBinary', !props.isBinary)}
                    />
                    <span className="ml-16 fw-4">Already Encoded</span>
                </label>
                <label className="flexbox mr-16">
                    <input
                        type="radio"
                        name={props.index + 'isBinary'}
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
