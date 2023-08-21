import React from 'react'
import { ScopedVariablesInputI } from './types'
import { UPLOAD_DESCRIPTION_L1, UPLOAD_DESCRIPTION_L2 } from './constants'

const ICUpload = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
                d="M10.2083 12.0835V3.3358M6.927 6.61389L10.2083 3.3335L13.4895 6.61389M17.0833 12.0835V16.4585C17.0833 16.6243 17.0174 16.7832 16.9002 16.9004C16.783 17.0176 16.624 17.0835 16.4583 17.0835H3.95825C3.79249 17.0835 3.63352 17.0176 3.51631 16.9004C3.3991 16.7832 3.33325 16.6243 3.33325 16.4585V12.0835"
                stroke="#0066CC"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

const ScopedVariablesInput = ({ handleFileUpload }: ScopedVariablesInputI) => {
    return (
        <>
            <input
                type="file"
                id="scoped-variables-input"
                accept=".yaml, .yml, .json"
                style={{
                    display: 'none',
                }}
                onChange={handleFileUpload}
            />

            <label
                htmlFor="scoped-variables-input"
                className="flex column center"
                style={{ cursor: 'pointer', width: '100%', height: '100%' }}
            >
                <div className="flex center upload-scoped-variables-button__icon">
                    <ICUpload />
                </div>
                <div className="flex column center">
                    <p className="upload-description-l1-typography">{UPLOAD_DESCRIPTION_L1}</p>
                    <p className="upload-description-l2-typography">{UPLOAD_DESCRIPTION_L2}</p>
                </div>
            </label>
        </>
    )
}

export default ScopedVariablesInput
